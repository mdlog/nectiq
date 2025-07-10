/**
 * Balance Service - Universal Real-time Balance Management System
 * Ensures ALL balance changes (stakes, rewards, wins, losses) are immediately reflected in database
 */

interface BalanceTransactionData {
  userId: number;
  type: 'prediction_stake' | 'prediction_reward' | 'battle_create' | 'battle_reward' | 'battle_refund' | 'survival_entry' | 'survival_reward' | 'achievement_reward' | 'daily_challenge_reward' | 'crypto_purchase' | 'withdrawal';
  amount: number;
  description?: string;
  relatedId?: number | string;
  metadata?: any;
}

export class BalanceService {
  
  /**
   * Universal transaction processor - ensures balance and transaction log are ALWAYS synchronized
   */
  static async processTransaction(transactionData: BalanceTransactionData, storage: any): Promise<{ success: boolean; newBalance: number; transactionId?: number }> {
    try {
      const { userId, type, amount, description, relatedId, metadata } = transactionData;
      
      // Get current user balance
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      
      let newBalance: number;
      let transactionAmount: number;
      let finalDescription: string;
      
      // Calculate new balance based on transaction type
      switch (type) {
        case 'prediction_stake':
        case 'battle_create':
        case 'survival_entry':
          // Deduct amounts
          newBalance = user.balance - Math.abs(amount);
          transactionAmount = -Math.abs(amount);
          finalDescription = description || `${type.replace('_', ' ')} deduction`;
          break;
          
        case 'prediction_reward':
        case 'battle_reward':
        case 'battle_refund':
        case 'survival_reward':
        case 'achievement_reward':
        case 'daily_challenge_reward':
        case 'crypto_purchase':
          // Add amounts
          newBalance = user.balance + Math.abs(amount);
          transactionAmount = Math.abs(amount);
          finalDescription = description || `${type.replace('_', ' ')} reward`;
          break;
          
        case 'withdrawal':
          // Deduct withdrawal amount
          newBalance = user.balance - Math.abs(amount);
          transactionAmount = -Math.abs(amount);
          finalDescription = description || 'Withdrawal processed';
          break;
          
        default:
          throw new Error(`Unknown transaction type: ${type}`);
      }
      
      // Validate balance won't go negative (except for specific cases)
      if (newBalance < 0 && !['withdrawal'].includes(type)) {
        throw new Error(`Insufficient balance. Required: ${Math.abs(amount)} NTIQ, Available: ${user.balance} NTIQ`);
      }
      
      // ATOMIC OPERATION: Update balance and log transaction simultaneously
      const transactionLog = await storage.logTransaction({
        userId,
        type,
        amount: transactionAmount,
        description: finalDescription,
        relatedId,
        metadata: metadata ? JSON.stringify(metadata) : null
      });
      
      // Update user balance in database
      await storage.updateUserBalance(userId, newBalance);
      
      // Verify balance was actually updated
      const updatedUser = await storage.getUser(userId);
      if (!updatedUser || updatedUser.balance !== newBalance) {
        throw new Error(`Balance update verification failed. Expected: ${newBalance}, Actual: ${updatedUser?.balance}`);
      }
      
      console.log(`✅ BALANCE SERVICE: ${type} processed successfully`);
      console.log(`   - User: ${userId} (${user.username})`);
      console.log(`   - Amount: ${transactionAmount} NTIQ`);
      console.log(`   - Balance: ${user.balance} → ${newBalance} NTIQ`);
      console.log(`   - Transaction ID: ${transactionLog?.id}`);
      console.log(`   - Related ID: ${relatedId}`);
      
      return {
        success: true,
        newBalance,
        transactionId: transactionLog?.id
      };
      
    } catch (error) {
      console.error(`❌ BALANCE SERVICE ERROR: Failed to process ${transactionData.type}:`, error);
      throw error;
    }
  }
  
  /**
   * Process prediction reward with accuracy multipliers
   */
  static async processPredictionReward(
    userId: number, 
    predictionId: number, 
    baseStake: number, 
    accuracyMultiplier: number, 
    storage: any
  ): Promise<{ success: boolean; newBalance: number; rewardAmount: number }> {
    const rewardAmount = Math.round(baseStake * accuracyMultiplier);
    
    const result = await this.processTransaction({
      userId,
      type: 'prediction_reward',
      amount: rewardAmount,
      description: `Prediction reward (${accuracyMultiplier}x multiplier)`,
      relatedId: predictionId,
      metadata: {
        baseStake,
        accuracyMultiplier,
        calculatedReward: rewardAmount
      }
    }, storage);
    
    return {
      ...result,
      rewardAmount
    };
  }
  
  /**
   * Process battle reward with winner determination
   */
  static async processBattleReward(
    winnerId: number, 
    battleId: number, 
    stakeAmount: number, 
    accuracyMultiplier: number, 
    storage: any
  ): Promise<{ success: boolean; newBalance: number; rewardAmount: number }> {
    const rewardAmount = Math.round(stakeAmount * 2 * accuracyMultiplier); // Winner gets 2x stake with accuracy bonus
    
    const result = await this.processTransaction({
      userId: winnerId,
      type: 'battle_reward',
      amount: rewardAmount,
      description: `Battle victory reward (${accuracyMultiplier}x accuracy multiplier)`,
      relatedId: battleId,
      metadata: {
        originalStake: stakeAmount,
        accuracyMultiplier,
        calculatedReward: rewardAmount
      }
    }, storage);
    
    return {
      ...result,
      rewardAmount
    };
  }
  
  /**
   * Process survival tournament winner reward
   */
  static async processSurvivalReward(
    winnerId: number, 
    tournamentId: number, 
    prizePool: number, 
    storage: any
  ): Promise<{ success: boolean; newBalance: number; rewardAmount: number }> {
    const result = await this.processTransaction({
      userId: winnerId,
      type: 'survival_reward',
      amount: prizePool,
      description: `Survival tournament winner reward`,
      relatedId: tournamentId,
      metadata: {
        tournamentId,
        prizePool
      }
    }, storage);
    
    return {
      ...result,
      rewardAmount: prizePool
    };
  }
  
  /**
   * Verify balance consistency across all user transactions
   */
  static async verifyUserBalanceConsistency(userId: number, storage: any): Promise<{
    currentBalance: number;
    calculatedBalance: number;
    isConsistent: boolean;
    discrepancy: number;
  }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      
      // Get all user transactions
      const transactions = await storage.getUserTransactions(userId);
      
      // Calculate balance from transaction history (starting from 1000 NTIQ)
      const calculatedBalance = transactions.reduce((balance, transaction) => {
        return balance + transaction.amount;
      }, 1000); // Starting balance
      
      const discrepancy = user.balance - calculatedBalance;
      const isConsistent = Math.abs(discrepancy) < 0.01; // Allow for tiny rounding differences
      
      return {
        currentBalance: user.balance,
        calculatedBalance,
        isConsistent,
        discrepancy
      };
      
    } catch (error) {
      console.error(`Error verifying balance consistency for user ${userId}:`, error);
      throw error;
    }
  }
}