/**
 * Deposit Expiry Monitoring Service
 * 
 * This service monitors pending deposits and automatically cancels them
 * if they are not completed within the 1-hour expiration period.
 * 
 * Features:
 * - Automatic monitoring every 5 minutes
 * - Cancels expired pending deposits
 * - Comprehensive logging for audit trail
 * - Email notifications (future enhancement)
 */

import { IStorage } from '../storage';

interface DepositExpiryStats {
  expiredDeposits: number;
  cancelledDeposits: number;
  totalValue: number;
}

export class DepositExpiryService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Start the deposit expiry monitoring service
   */
  public start(): void {
    if (this.isRunning) {
      console.log('⚠️ [DEPOSIT-EXPIRY] Service already running');
      return;
    }

    console.log('🚀 [DEPOSIT-EXPIRY] Starting deposit expiry monitoring service...');
    
    // Run immediately on startup
    this.checkExpiredDeposits();

    // Then run every 5 minutes (300,000 ms)
    this.intervalId = setInterval(() => {
      this.checkExpiredDeposits();
    }, 5 * 60 * 1000);

    this.isRunning = true;
    console.log('✅ [DEPOSIT-EXPIRY] Deposit expiry monitoring started - checking every 5 minutes');
  }

  /**
   * Stop the deposit expiry monitoring service
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 [DEPOSIT-EXPIRY] Deposit expiry monitoring stopped');
  }

  /**
   * Check for expired deposits and cancel them
   */
  private async checkExpiredDeposits(): Promise<void> {
    try {
      console.log('🔍 [DEPOSIT-EXPIRY] Running expired deposit check...');
      
      const expiredDeposits = await this.storage.getExpiredDeposits();
      
      if (expiredDeposits.length === 0) {
        console.log('✅ [DEPOSIT-EXPIRY] No expired deposits found');
        return;
      }

      console.log(`🚨 [DEPOSIT-EXPIRY] Found ${expiredDeposits.length} expired deposits to cancel`);

      let totalCancelled = 0;
      let totalValue = 0;

      for (const deposit of expiredDeposits) {
        try {
          // Cancel the expired deposit
          await this.storage.cancelExpiredDeposit(deposit.id);
          
          totalCancelled++;
          totalValue += parseFloat(deposit.amountUSD || '0');
          
          console.log(`❌ [DEPOSIT-EXPIRY] Cancelled expired deposit:`, {
            id: deposit.id,
            userId: deposit.userId,
            amount: `${deposit.amountUSD} USD`,
            ntiqAmount: `${deposit.ntiqAmount} NTIQ`,
            tokenType: deposit.tokenType,
            chainName: deposit.chainName,
            createdAt: deposit.createdAt,
            expiresAt: deposit.expiresAt,
            timeExpired: this.getTimeExpiredText(deposit.expiresAt)
          });

        } catch (error) {
          console.error(`❌ [DEPOSIT-EXPIRY] Failed to cancel deposit ${deposit.id}:`, error);
        }
      }

      if (totalCancelled > 0) {
        console.log(`✅ [DEPOSIT-EXPIRY] Successfully cancelled ${totalCancelled} expired deposits`);
        console.log(`💰 [DEPOSIT-EXPIRY] Total value cancelled: $${totalValue.toFixed(2)}`);
        
        // Log summary for admin monitoring
        this.logExpiryStats({
          expiredDeposits: expiredDeposits.length,
          cancelledDeposits: totalCancelled,
          totalValue
        });
      }

    } catch (error) {
      console.error('❌ [DEPOSIT-EXPIRY] Error during expired deposit check:', error);
    }
  }

  /**
   * Get human-readable time expired text
   */
  private getTimeExpiredText(expiresAt: string): string {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = now.getTime() - expiry.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m ago`;
    }
  }

  /**
   * Log expiry statistics for monitoring
   */
  private logExpiryStats(stats: DepositExpiryStats): void {
    console.log('📊 [DEPOSIT-EXPIRY] Expiry Statistics:', {
      timestamp: new Date().toISOString(),
      expiredDeposits: stats.expiredDeposits,
      cancelledDeposits: stats.cancelledDeposits,
      totalValueCancelled: `$${stats.totalValue.toFixed(2)}`,
      successRate: `${((stats.cancelledDeposits / stats.expiredDeposits) * 100).toFixed(1)}%`
    });
  }

  /**
   * Get service status
   */
  public getStatus(): { isRunning: boolean; nextCheck?: string } {
    const status: any = { isRunning: this.isRunning };
    
    if (this.isRunning) {
      // Calculate next check time (5 minutes from now)
      const nextCheck = new Date();
      nextCheck.setMinutes(nextCheck.getMinutes() + 5);
      status.nextCheck = nextCheck.toISOString();
    }
    
    return status;
  }

  /**
   * Manual check for expired deposits (for admin use)
   */
  public async manualCheck(): Promise<DepositExpiryStats> {
    console.log('🔧 [DEPOSIT-EXPIRY] Manual deposit expiry check initiated');
    
    const expiredDeposits = await this.storage.getExpiredDeposits();
    let cancelledDeposits = 0;
    let totalValue = 0;

    for (const deposit of expiredDeposits) {
      try {
        await this.storage.cancelExpiredDeposit(deposit.id);
        cancelledDeposits++;
        totalValue += parseFloat(deposit.amountUSD || '0');
      } catch (error) {
        console.error(`Failed to cancel deposit ${deposit.id}:`, error);
      }
    }

    const stats = {
      expiredDeposits: expiredDeposits.length,
      cancelledDeposits,
      totalValue
    };

    console.log('📊 [DEPOSIT-EXPIRY] Manual check completed:', stats);
    return stats;
  }
}

// Create singleton instance
let depositExpiryServiceInstance: DepositExpiryService | null = null;

export function initializeDepositExpiryService(storage: IStorage): DepositExpiryService {
  if (!depositExpiryServiceInstance) {
    depositExpiryServiceInstance = new DepositExpiryService(storage);
  }
  return depositExpiryServiceInstance;
}

export function getDepositExpiryService(): DepositExpiryService | null {
  return depositExpiryServiceInstance;
}