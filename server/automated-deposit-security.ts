/**
 * 🔐 AUTOMATED DEPOSIT SECURITY SERVICE
 * Comprehensive security service for monitoring deposit integrity 
 * and preventing financial bugs similar to withdrawal system
 * 
 * Created: July 17, 2025
 * Purpose: Prevent deposit double-credit, stuck deposits, and API failures
 */

import { IStorage } from './storage.js';
import { BalanceService } from './services/balanceService.js';
import cron from 'node-cron';

export class AutomatedDepositSecurity {
  private storage: IStorage;
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Start automated deposit security monitoring
   * Runs every 10 minutes to check for stuck deposits and integrity issues
   */
  public startMonitoring(): void {
    if (this.isRunning) {
      console.log('🔐 [DEPOSIT-SECURITY] Monitoring already running');
      return;
    }

    console.log('🔐 [DEPOSIT-SECURITY] Starting automated deposit security monitoring...');
    this.isRunning = true;

    // Run security checks every 10 minutes
    this.checkInterval = setInterval(async () => {
      await this.runSecurityChecks();
    }, 10 * 60 * 1000); // 10 minutes

    // Also run immediately
    this.runSecurityChecks();
  }

  /**
   * Stop automated monitoring
   */
  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🔐 [DEPOSIT-SECURITY] Monitoring stopped');
  }

  /**
   * Main security check routine
   */
  private async runSecurityChecks(): Promise<void> {
    try {
      console.log('🔍 [DEPOSIT-SECURITY] Running automated security checks...');
      
      await Promise.all([
        this.checkStuckDeposits(),
        this.verifyDepositIntegrity(),
        this.detectAnomalousDeposits(),
        this.validateBalanceConsistency()
      ]);

      console.log('✅ [DEPOSIT-SECURITY] Security checks completed successfully');
    } catch (error) {
      console.error('🚨 [DEPOSIT-SECURITY] Error during security checks:', error);
    }
  }

  /**
   * Check for deposits stuck in "processing" status for too long
   */
  private async checkStuckDeposits(): Promise<void> {
    try {
      const allUsers = await this.storage.getAllUsers();
      const stuckDeposits = [];
      const now = new Date();
      const STUCK_THRESHOLD_HOURS = 2; // Consider stuck after 2 hours

      for (const user of allUsers) {
        const deposits = await this.storage.getUserDeposits(user.id, 50);
        
        for (const deposit of deposits) {
          if (deposit.status === 'processing') {
            const createdAt = new Date(deposit.createdAt);
            const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceCreated > STUCK_THRESHOLD_HOURS) {
              stuckDeposits.push({
                ...deposit,
                hoursSinceCreated: Math.round(hoursSinceCreated * 10) / 10
              });
            }
          }
        }
      }

      if (stuckDeposits.length > 0) {
        console.warn(`⚠️ [DEPOSIT-SECURITY] Found ${stuckDeposits.length} stuck deposits:`);
        stuckDeposits.forEach(deposit => {
          console.warn(`   - Deposit ID ${deposit.id}: ${deposit.hoursSinceCreated}h stuck (${deposit.chainName} ${deposit.tokenType})`);
        });
        
        // Alert admin about stuck deposits
        this.alertAdminStuckDeposits(stuckDeposits);
      }
    } catch (error) {
      console.error('🚨 [DEPOSIT-SECURITY] Error checking stuck deposits:', error);
    }
  }

  /**
   * Verify deposit-to-balance integrity
   * Check if completed deposits have corresponding balance credits
   */
  private async verifyDepositIntegrity(): Promise<void> {
    try {
      const allUsers = await this.storage.getAllUsers();
      const integrityIssues = [];

      for (const user of allUsers) {
        const deposits = await this.storage.getUserDeposits(user.id, 100);
        const completedDeposits = deposits.filter(d => d.status === 'completed');
        
        // Calculate expected balance from completed deposits
        const expectedDepositBalance = completedDeposits.reduce((sum, deposit) => {
          return sum + deposit.ntiqAmount;
        }, 0);

        // Get transaction logs for this user
        const transactionLogs = await this.storage.getTransactionLogs(user.id, 200);
        const depositCredits = transactionLogs.filter(log => 
          log.type === 'crypto_purchase' || log.type === 'deposit_credit'
        );

        // Calculate actual credited amount
        const actualCreditedAmount = depositCredits.reduce((sum, log) => {
          return sum + log.amount;
        }, 0);

        // Check for discrepancy
        if (expectedDepositBalance !== actualCreditedAmount) {
          integrityIssues.push({
            userId: user.id,
            username: user.username,
            expectedDepositBalance,
            actualCreditedAmount,
            discrepancy: expectedDepositBalance - actualCreditedAmount,
            completedDepositsCount: completedDeposits.length,
            creditLogsCount: depositCredits.length
          });
        }
      }

      if (integrityIssues.length > 0) {
        console.error(`🚨 [DEPOSIT-SECURITY] Found ${integrityIssues.length} deposit integrity issues:`);
        integrityIssues.forEach(issue => {
          console.error(`   - User ${issue.username} (${issue.userId}): Expected ${issue.expectedDepositBalance} NTIQ, got ${issue.actualCreditedAmount} NTIQ (diff: ${issue.discrepancy})`);
        });
        
        this.alertAdminIntegrityIssues(integrityIssues);
      }
    } catch (error) {
      console.error('🚨 [DEPOSIT-SECURITY] Error verifying deposit integrity:', error);
    }
  }

  /**
   * Detect anomalous deposit patterns
   */
  private async detectAnomalousDeposits(): Promise<void> {
    try {
      const allUsers = await this.storage.getAllUsers();
      const anomalies = [];
      const now = new Date();
      const HOUR_IN_MS = 60 * 60 * 1000;

      for (const user of allUsers) {
        const deposits = await this.storage.getUserDeposits(user.id, 50);
        const recentDeposits = deposits.filter(d => {
          const createdAt = new Date(d.createdAt);
          return (now.getTime() - createdAt.getTime()) < (24 * HOUR_IN_MS); // Last 24 hours
        });

        // Check for multiple large deposits in short time
        if (recentDeposits.length >= 5) {
          const totalAmount = recentDeposits.reduce((sum, d) => sum + d.ntiqAmount, 0);
          if (totalAmount >= 100000) { // 100,000 NTIQ = $1000
            anomalies.push({
              type: 'high_frequency_large_deposits',
              userId: user.id,
              username: user.username,
              count: recentDeposits.length,
              totalAmount,
              details: `${recentDeposits.length} deposits totaling ${totalAmount} NTIQ in 24h`
            });
          }
        }

        // Check for identical amounts (potential duplication)
        const amounts = recentDeposits.map(d => d.ntiqAmount);
        const duplicateAmounts = amounts.filter((amount, index) => amounts.indexOf(amount) !== index);
        if (duplicateAmounts.length > 0) {
          anomalies.push({
            type: 'duplicate_amounts',
            userId: user.id,
            username: user.username,
            duplicateAmounts: [...new Set(duplicateAmounts)],
            details: `Duplicate deposit amounts detected: ${[...new Set(duplicateAmounts)].join(', ')} NTIQ`
          });
        }
      }

      if (anomalies.length > 0) {
        console.warn(`⚠️ [DEPOSIT-SECURITY] Detected ${anomalies.length} deposit anomalies:`);
        anomalies.forEach(anomaly => {
          console.warn(`   - ${anomaly.type}: User ${anomaly.username} - ${anomaly.details}`);
        });
      }
    } catch (error) {
      console.error('🚨 [DEPOSIT-SECURITY] Error detecting anomalous deposits:', error);
    }
  }

  /**
   * Validate overall balance consistency
   */
  private async validateBalanceConsistency(): Promise<void> {
    try {
      const allUsers = await this.storage.getAllUsers();
      const inconsistencies = [];

      for (const user of allUsers) {
        // Get all transaction logs
        const transactions = await this.storage.getTransactionLogs(user.id, 500);
        
        // Calculate expected balance from transaction history
        let calculatedBalance = 1000; // Starting balance
        
        for (const transaction of transactions) {
          if (transaction.type === 'crypto_purchase' || 
              transaction.type === 'deposit_credit' ||
              transaction.type === 'prediction_reward' ||
              transaction.type === 'battle_reward' ||
              transaction.type === 'achievement_reward' ||
              transaction.type === 'daily_challenge_reward') {
            calculatedBalance += transaction.amount;
          } else if (transaction.type === 'prediction_stake' ||
                     transaction.type === 'battle_stake' ||
                     transaction.type === 'withdrawal_deduction' ||
                     transaction.type === 'survival_tournament_entry') {
            calculatedBalance -= transaction.amount;
          }
        }

        // Compare with actual balance
        if (Math.abs(calculatedBalance - user.balance) > 1) { // Allow 1 NTIQ tolerance
          inconsistencies.push({
            userId: user.id,
            username: user.username,
            actualBalance: user.balance,
            calculatedBalance,
            difference: user.balance - calculatedBalance,
            transactionCount: transactions.length
          });
        }
      }

      if (inconsistencies.length > 0) {
        console.error(`🚨 [DEPOSIT-SECURITY] Found ${inconsistencies.length} balance inconsistencies:`);
        inconsistencies.forEach(issue => {
          console.error(`   - User ${issue.username}: Actual ${issue.actualBalance} vs Calculated ${issue.calculatedBalance} (diff: ${issue.difference})`);
        });
      }
    } catch (error) {
      console.error('🚨 [DEPOSIT-SECURITY] Error validating balance consistency:', error);
    }
  }

  /**
   * Alert admin about stuck deposits
   */
  private alertAdminStuckDeposits(stuckDeposits: any[]): void {
    const alertMessage = `🚨 DEPOSIT SECURITY ALERT: ${stuckDeposits.length} Stuck Deposits Found

${stuckDeposits.map(deposit => `
- Deposit ID: ${deposit.id}
- User ID: ${deposit.userId}  
- Amount: ${deposit.ntiqAmount} NTIQ
- Chain: ${deposit.chainName}
- Token: ${deposit.tokenType}
- Stuck for: ${deposit.hoursSinceCreated} hours
- TX Hash: ${deposit.transactionHash || 'N/A'}
`).join('\n')}

Action Required: Manual verification and resolution needed.`;

    console.error(alertMessage);
    // TODO: Send to admin notification system / email / Slack
  }

  /**
   * Alert admin about integrity issues
   */
  private alertAdminIntegrityIssues(issues: any[]): void {
    const alertMessage = `🚨 CRITICAL DEPOSIT INTEGRITY ALERT: ${issues.length} Balance Discrepancies Found

${issues.map(issue => `
- User: ${issue.username} (ID: ${issue.userId})
- Expected from deposits: ${issue.expectedDepositBalance} NTIQ
- Actually credited: ${issue.actualCreditedAmount} NTIQ
- Discrepancy: ${issue.discrepancy} NTIQ
- Completed deposits: ${issue.completedDepositsCount}
- Credit logs: ${issue.creditLogsCount}
`).join('\n')}

IMMEDIATE ACTION REQUIRED: Financial integrity compromised!`;

    console.error(alertMessage);
    // TODO: Send to admin notification system / email / Slack
  }

  /**
   * Manual deposit verification and correction
   */
  public async manualDepositCorrection(depositId: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔧 [DEPOSIT-SECURITY] Starting manual correction for deposit ${depositId}`);
      
      // Get all users to find the deposit
      const allUsers = await this.storage.getAllUsers();
      let targetDeposit = null;
      let targetUserId = null;

      for (const user of allUsers) {
        const deposits = await this.storage.getUserDeposits(user.id, 100);
        const deposit = deposits.find(d => d.id === depositId);
        if (deposit) {
          targetDeposit = deposit;
          targetUserId = user.id;
          break;
        }
      }

      if (!targetDeposit) {
        return { success: false, message: `Deposit ${depositId} not found` };
      }

      if (targetDeposit.status !== 'completed') {
        return { success: false, message: `Deposit ${depositId} is not in completed status` };
      }

      // Check if balance was already credited
      const transactionLogs = await this.storage.getTransactionLogs(targetUserId!, 200);
      const existingCredit = transactionLogs.find(log => 
        (log.type === 'crypto_purchase' || log.type === 'deposit_credit') &&
        log.relatedId === depositId
      );

      if (existingCredit) {
        return { success: false, message: `Deposit ${depositId} already has corresponding transaction log` };
      }

      // Credit the balance
      await BalanceService.processTransaction({
        userId: targetUserId!,
        type: 'deposit_credit',
        amount: targetDeposit.ntiqAmount,
        description: `Manual deposit correction - ${targetDeposit.chainName.toUpperCase()} transaction ${targetDeposit.transactionHash}`,
        relatedId: depositId,
        metadata: {
          correctionType: 'manual_deposit_credit',
          originalDepositId: depositId,
          chainName: targetDeposit.chainName,
          tokenType: targetDeposit.tokenType,
          amountUSD: targetDeposit.amountUSD
        }
      }, this.storage);

      console.log(`✅ [DEPOSIT-SECURITY] Successfully corrected deposit ${depositId}: Added ${targetDeposit.ntiqAmount} NTIQ to user ${targetUserId}`);
      
      return { 
        success: true, 
        message: `Successfully credited ${targetDeposit.ntiqAmount} NTIQ for deposit ${depositId}` 
      };
    } catch (error) {
      console.error(`🚨 [DEPOSIT-SECURITY] Error in manual correction:`, error);
      return { success: false, message: `Error during correction: ${error.message}` };
    }
  }

  /**
   * Get comprehensive deposit security report
   */
  public async getSecurityReport(): Promise<any> {
    try {
      const allUsers = await this.storage.getAllUsers();
      let totalDeposits = 0;
      let completedDeposits = 0;
      let processingDeposits = 0;
      let failedDeposits = 0;
      let pendingDeposits = 0;
      let stuckDeposits = 0;
      let totalDepositAmount = 0;

      const now = new Date();
      const STUCK_THRESHOLD_HOURS = 2;

      for (const user of allUsers) {
        const deposits = await this.storage.getUserDeposits(user.id, 100);
        totalDeposits += deposits.length;
        
        for (const deposit of deposits) {
          totalDepositAmount += deposit.ntiqAmount;
          
          switch (deposit.status) {
            case 'completed':
              completedDeposits++;
              break;
            case 'processing':
              processingDeposits++;
              const createdAt = new Date(deposit.createdAt);
              const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
              if (hoursSinceCreated > STUCK_THRESHOLD_HOURS) {
                stuckDeposits++;
              }
              break;
            case 'failed':
              failedDeposits++;
              break;
            case 'pending':
              pendingDeposits++;
              break;
          }
        }
      }

      return {
        totalDeposits,
        completedDeposits,
        processingDeposits,
        failedDeposits,
        pendingDeposits,
        stuckDeposits,
        totalDepositAmount,
        completionRate: totalDeposits > 0 ? ((completedDeposits / totalDeposits) * 100).toFixed(2) : '0',
        stuckRate: totalDeposits > 0 ? ((stuckDeposits / totalDeposits) * 100).toFixed(2) : '0',
        lastCheckTime: new Date().toISOString(),
        isMonitoring: this.isRunning
      };
    } catch (error) {
      console.error('🚨 [DEPOSIT-SECURITY] Error generating security report:', error);
      throw error;
    }
  }
}

export default AutomatedDepositSecurity;