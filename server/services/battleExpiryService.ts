import { storage } from '../storage.js';

export class BattleExpiryService {
  private static instance: BattleExpiryService;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): BattleExpiryService {
    if (!BattleExpiryService.instance) {
      BattleExpiryService.instance = new BattleExpiryService();
    }
    return BattleExpiryService.instance;
  }

  /**
   * Start the battle expiry monitoring service
   */
  public start(): void {
    console.log('🚀 [BATTLE-EXPIRY] Starting battle expiry monitoring service...');
    
    // Run initial check
    this.processExpiredBattles();
    
    // Set up interval to check every 30 seconds
    this.intervalId = setInterval(async () => {
      try {
        await this.processExpiredBattles();
      } catch (error) {
        console.error('❌ [BATTLE-EXPIRY] Error in periodic processing:', error);
      }
    }, 30000); // 30 seconds
    
    console.log('✅ [BATTLE-EXPIRY] Battle expiry monitoring started - checking every 30 seconds');
  }

  /**
   * Stop the battle expiry monitoring service
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 [BATTLE-EXPIRY] Battle expiry monitoring stopped');
    }
  }

  /**
   * Process all expired battles and return stakes
   */
  private async processExpiredBattles(): Promise<void> {
    try {
      console.log('🔍 [BATTLE-EXPIRY] Checking for expired battles...');
      
      // Get all open battles (battles that haven't been joined yet)
      const openBattles = await storage.getLiveBattles();
      
      if (!openBattles || openBattles.length === 0) {
        console.log('✅ [BATTLE-EXPIRY] No open battles found');
        return;
      }

      const now = new Date();
      let expiredCount = 0;

      for (const battle of openBattles) {
        // Skip if battle is not in 'open' status (already joined or completed)
        if (battle.status !== 'open') {
          continue;
        }

        // Check if battle has expired (past target time)
        const targetTime = new Date(battle.targetTime);
        
        if (now >= targetTime) {
          console.log(`⏰ [BATTLE-EXPIRY] Battle ${battle.id} expired - returning stake to challenger`);
          
          try {
            await this.expireBattleAndReturnStake(battle);
            expiredCount++;
            
            console.log(`✅ [BATTLE-EXPIRY] Battle ${battle.id} processed successfully - ${battle.stakeAmount} NTIQ returned to ${battle.challengerUsername}`);
          } catch (error) {
            console.error(`❌ [BATTLE-EXPIRY] Failed to process expired battle ${battle.id}:`, error);
          }
        }
      }

      if (expiredCount > 0) {
        console.log(`✅ [BATTLE-EXPIRY] Processed ${expiredCount} expired battles`);
      } else {
        console.log('✅ [BATTLE-EXPIRY] No expired battles found');
      }

    } catch (error) {
      console.error('❌ [BATTLE-EXPIRY] Error checking expired battles:', error);
    }
  }

  /**
   * Expire a battle and return stake to challenger
   */
  private async expireBattleAndReturnStake(battle: any): Promise<void> {
    try {
      // Update battle status to expired
      await storage.updateBattleStatus(battle.id, 'expired');
      
      // Return stake to challenger
      const challenger = await storage.getUserById(battle.challengerId);
      if (!challenger) {
        throw new Error(`Challenger with ID ${battle.challengerId} not found`);
      }

      // Add stake back to challenger's balance
      const newBalance = challenger.balance + battle.stakeAmount;
      await storage.updateUserBalance(battle.challengerId, newBalance);

      // Log the refund transaction
      await storage.logTransaction({
        userId: battle.challengerId,
        type: 'battle_refund',
        amount: battle.stakeAmount,
        token: 'NTIQ',
        status: 'completed',
        relatedId: battle.id,
        description: `Battle expired - stake refunded`
      });

      console.log(`💰 [BATTLE-EXPIRY] Refunded ${battle.stakeAmount} NTIQ to user ${battle.challengerId} for expired battle ${battle.id}`);

    } catch (error) {
      console.error(`❌ [BATTLE-EXPIRY] Error processing battle ${battle.id} expiry:`, error);
      throw error;
    }
  }
}