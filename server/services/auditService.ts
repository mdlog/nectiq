import { storage } from '../storage';

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
      // Get semua user yang memiliki prediksi completed
      const usersWithPredictions = await storage.db.execute(`
        SELECT DISTINCT
          u.id,
          u.username,
          u.uid,
          u.balance
        FROM users u
        INNER JOIN predictions p ON u.id = p.user_id
        WHERE p.status = 'completed' AND p.reward_amount > 0
        ORDER BY u.id
      `);

      results.usersChecked = usersWithPredictions.rows.length;

      for (const userRow of usersWithPredictions.rows) {
        const userId = userRow.id as number;
        const username = userRow.username as string;

        // Find missing prediction rewards untuk user ini
        const missingRewards = await storage.db.execute(`
          SELECT 
            p.id as prediction_id,
            p.reward_amount,
            p.completed_at,
            p.cryptocurrency
          FROM predictions p
          LEFT JOIN transaction_logs tl ON (
            tl.user_id = p.user_id 
            AND tl.type = 'prediction_reward' 
            AND tl.related_id = p.id
          )
          WHERE p.user_id = ? 
            AND p.status = 'completed' 
            AND p.reward_amount > 0 
            AND tl.id IS NULL
          ORDER BY p.completed_at
        `, [userId]);

        if (missingRewards.rows.length > 0) {
          let userTotalMissing = 0;
          
          // Add missing transaction logs
          for (const rewardRow of missingRewards.rows) {
            const predictionId = rewardRow.prediction_id as number;
            const rewardAmount = rewardRow.reward_amount as number;
            const completedAt = rewardRow.completed_at as string;
            const cryptocurrency = rewardRow.cryptocurrency as string;

            // Create missing transaction log
            await storage.createTransaction({
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

          // Update user balance jika perlu
          if (userTotalMissing > 0) {
            await storage.db.execute(
              'UPDATE users SET balance = balance + ? WHERE id = ?',
              [userTotalMissing, userId]
            );

            results.repairedUsers.push({
              userId,
              username,
              missingAmount: userTotalMissing,
              predictionsRepaired: missingRewards.rows.length
            });

            results.totalAmountRepaired += userTotalMissing;

            console.log(`✅ [AUDIT] Repaired ${username}: +${userTotalMissing} NTIQ from ${missingRewards.rows.length} predictions`);
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
      const users = await storage.db.execute(`
        SELECT 
          u.id,
          u.username,
          u.balance as current_balance,
          COALESCE((SELECT SUM(amount) FROM transaction_logs WHERE user_id = u.id), 0) as calculated_balance
        FROM users u
        ORDER BY u.id
      `);

      results.totalUsers = users.rows.length;

      for (const user of users.rows) {
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