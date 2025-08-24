import { storage } from '../storage';
import { users, predictions, transactionLogs } from '../../shared/schema';
import { eq, and, isNull, sql, desc } from 'drizzle-orm';

/**
 * Audit Service untuk memastikan konsistensi data prediction rewards
 * Mencegah bug dimana reward dihitung tetapi tidak dicatat dalam transaction logs
 */
export class AuditService {
  /**
   * Audit dan perbaiki semua prediction rewards yang hilang
   */
  async auditAndRepairPredictionRewards(): Promise<{
    usersChecked: number;
    missingRewards: number;
    totalAmountRepaired: number;
    repairedUsers: Array<{
      userId: number;
      username: string;
      missingAmount: number;
      predictionsRepaired: number;
    }>;
  }> {
    console.log('🔍 [AUDIT] Starting prediction rewards audit...');
    
    const results = {
      usersChecked: 0,
      missingRewards: 0,
      totalAmountRepaired: 0,
      repairedUsers: [] as Array<{
        userId: number;
        username: string;
        missingAmount: number;
        predictionsRepaired: number;
      }>
    };

    try {
      // SECURITY: Get semua user yang memiliki prediksi completed - using safe storage methods
      const allUsers = await storage.getAllUsers();
      const usersWithPredictions = [];
      
      for (const user of allUsers) {
        const userPredictions = await storage.getUserPredictions(user.id);
        const hasCompletedRewards = userPredictions.some(p => p.status === 'completed' && (p.rewardAmount || 0) > 0);
        if (hasCompletedRewards) {
          usersWithPredictions.push({
            id: user.id,
            username: user.username,
            uid: user.uid,
            balance: user.balance
          });
        }
      }

      results.usersChecked = usersWithPredictions.length;

      for (const userRow of usersWithPredictions) {
        const userId = userRow.id as number;
        const username = userRow.username as string;

        // SECURITY: Find missing prediction rewards untuk user ini - using safe storage methods
        const userPredictions = await storage.getUserPredictions(userId);
        const userTransactionLogs = await storage.getUserTransactionLogs(userId);
        
        const missingRewards = userPredictions.filter(prediction => {
          if (prediction.status !== 'completed' || !prediction.rewardAmount || prediction.rewardAmount <= 0) {
            return false;
          }
          
          // Check if reward already logged
          const hasRewardLog = userTransactionLogs.some(log => 
            log.type === 'prediction_reward' && log.relatedId === prediction.id
          );
          
          return !hasRewardLog;
        }).map(prediction => ({
          prediction_id: prediction.id,
          reward_amount: prediction.rewardAmount,
          completed_at: prediction.completedAt,
          cryptocurrency: prediction.cryptocurrency
        }));

        if (missingRewards.length > 0) {
          let userTotalMissing = 0;
          
          // Add missing transaction logs
          for (const rewardRow of missingRewards) {
            const predictionId = rewardRow.prediction_id as number;
            const rewardAmount = rewardRow.reward_amount as number;
            const completedAt = rewardRow.completed_at as string;
            const cryptocurrency = rewardRow.cryptocurrency as string;

            // Create missing transaction log
            await storage.createTransactionLog({
              userId: userId,
              type: 'prediction_reward',
              amount: rewardAmount,
              token: 'NTIQ',
              status: 'completed',
              relatedId: predictionId,
              description: `[AUDIT REPAIR] ${cryptocurrency.toUpperCase()} Prediction Reward`
            });

            userTotalMissing += rewardAmount;
            results.missingRewards++;
          }

          // SECURITY: Update user balance jika perlu - using safe storage methods
          if (userTotalMissing > 0) {
            const currentUser = await storage.getUser(userId);
            if (currentUser) {
              await storage.updateUserBalance(userId, currentUser.balance + userTotalMissing);
            }

            results.repairedUsers.push({
              userId,
              username,
              missingAmount: userTotalMissing,
              predictionsRepaired: missingRewards.length
            });

            results.totalAmountRepaired += userTotalMissing;

            console.log(`✅ [AUDIT] Repaired ${username}: +${userTotalMissing} NTIQ from ${missingRewards.length} predictions`);
          }
        }
      }

      console.log('🎯 [AUDIT] Audit completed:', {
        usersChecked: results.usersChecked,
        missingRewards: results.missingRewards,
        totalAmountRepaired: results.totalAmountRepaired,
        usersRepaired: results.repairedUsers.length
      });

      return results;
    } catch (error) {
      console.error('❌ [AUDIT] Error during audit:', error);
      throw error;
    }
  }

  /**
   * Verify balance consistency untuk semua user
   */
  async verifyBalanceConsistency(): Promise<{
    totalUsers: number;
    consistentUsers: number;
    inconsistentUsers: Array<{
      userId: number;
      username: string;
      currentBalance: number;
      calculatedBalance: number;
      difference: number;
    }>;
  }> {
    console.log('🔍 [BALANCE CHECK] Starting balance consistency check...');

    const results = {
      totalUsers: 0,
      consistentUsers: 0,
      inconsistentUsers: [] as Array<{
        userId: number;
        username: string;
        currentBalance: number;
        calculatedBalance: number;
        difference: number;
      }>
    };

    try {
      // SECURITY: Get balance consistency data - using safe storage methods
      const allUsers = await storage.getAllUsers();
      const usersBalanceData = [];
      
      for (const user of allUsers) {
        const userTransactionLogs = await storage.getUserTransactionLogs(user.id);
        const calculatedBalance = userTransactionLogs.reduce((sum, log) => sum + log.amount, 0);
        
        usersBalanceData.push({
          id: user.id,
          username: user.username,
          current_balance: user.balance,
          calculated_balance: calculatedBalance
        });
      }

      results.totalUsers = usersBalanceData.length;

      for (const user of usersBalanceData) {
        const userId = user.id as number;
        const username = user.username as string;
        const currentBalance = user.current_balance as number;
        const calculatedBalance = user.calculated_balance as number;
        const difference = currentBalance - calculatedBalance;

        if (Math.abs(difference) > 0.01) { // Allow small floating point differences
          results.inconsistentUsers.push({
            userId,
            username,
            currentBalance,
            calculatedBalance,
            difference
          });
        } else {
          results.consistentUsers++;
        }
      }

      console.log('🎯 [BALANCE CHECK] Check completed:', {
        totalUsers: results.totalUsers,
        consistentUsers: results.consistentUsers,
        inconsistentUsers: results.inconsistentUsers.length
      });

      return results;
    } catch (error) {
      console.error('❌ [BALANCE CHECK] Error during balance check:', error);
      throw error;
    }
  }

  /**
   * Run comprehensive audit (prediction rewards + balance consistency)
   */
  async runComprehensiveAudit(): Promise<void> {
    console.log('🚀 [COMPREHENSIVE AUDIT] Starting comprehensive platform audit...');
    
    try {
      // Step 1: Audit and repair prediction rewards
      const rewardResults = await this.auditAndRepairPredictionRewards();
      
      // Step 2: Verify balance consistency
      const balanceResults = await this.verifyBalanceConsistency();
      
      // Summary report
      console.log('📊 [COMPREHENSIVE AUDIT] Final Report:');
      console.log('  Prediction Rewards:', {
        usersChecked: rewardResults.usersChecked,
        missingRewards: rewardResults.missingRewards,
        totalAmountRepaired: rewardResults.totalAmountRepaired,
        usersRepaired: rewardResults.repairedUsers.length
      });
      console.log('  Balance Consistency:', {
        totalUsers: balanceResults.totalUsers,
        consistentUsers: balanceResults.consistentUsers,
        inconsistentUsers: balanceResults.inconsistentUsers.length
      });

      if (rewardResults.missingRewards === 0 && balanceResults.inconsistentUsers.length === 0) {
        console.log('✅ [COMPREHENSIVE AUDIT] All systems consistent - no issues found!');
      } else {
        console.log('⚠️ [COMPREHENSIVE AUDIT] Issues detected and repaired');
      }
    } catch (error) {
      console.error('❌ [COMPREHENSIVE AUDIT] Failed:', error);
      throw error;
    }
  }
}

export const auditService = new AuditService();