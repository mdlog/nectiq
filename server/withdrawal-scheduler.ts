import { AutomatedWithdrawalService, defaultAutoWithdrawalConfig } from './automated-withdrawal-service.js';
import { IStorage } from './storage.js';

/**
 * Withdrawal Scheduler untuk menjalankan automated withdrawal processing
 * Bisa dijalankan sebagai cron job atau interval scheduler
 */
export class WithdrawalScheduler {
  private autoWithdrawalService: AutomatedWithdrawalService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(storage: IStorage) {
    // Create dynamic config using environment variables
    const dynamicConfig = {
      ...defaultAutoWithdrawalConfig,
      adminPrivateKey: process.env.ADMIN_PRIVATE_KEY || '',
      networks: {
        ...defaultAutoWithdrawalConfig.networks,
        'sepolia': {
          rpcUrl: 'https://eth-sepolia.public.blastapi.io',
          chainId: 11155111,
          gasLimit: '21000',
          maxGasPrice: '50',
          tokenContracts: {
            USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
            USDT: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
          }
        },
        'holesky': {
          rpcUrl: 'https://ethereum-holesky-rpc.publicnode.com',
          chainId: 17000,
          gasLimit: '21000',
          maxGasPrice: '30',
          tokenContracts: {
            USDC: '0x449cde79f489e2ae32e6314d8d966ca64e040409', // Official Circle USDC on Holesky
            USDT: '0x87350147a24099bf1e7e677576f01c1415857c75'  // Verified USDT on Holesky
          }
        }
      }
    };
    
    console.log(`🌐 [SCHEDULER] Using Sepolia RPC: ${dynamicConfig.networks.sepolia.rpcUrl}`);
    
    // Initialize automated withdrawal service dengan konfigurasi
    this.autoWithdrawalService = new AutomatedWithdrawalService(
      dynamicConfig,
      storage
    );
  }

  /**
   * Start automated withdrawal processing dengan interval tertentu
   * @param intervalMinutes - Interval dalam menit (default: 5 menit)
   */
  public startScheduler(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.log('⚠️ [SCHEDULER] Withdrawal scheduler is already running');
      return;
    }

    console.log(`🚀 [SCHEDULER] Starting automated withdrawal processing every ${intervalMinutes} minutes`);
    
    // Jalankan sekali di awal
    this.processWithdrawals();
    
    // Setup interval
    this.intervalId = setInterval(() => {
      this.processWithdrawals();
    }, intervalMinutes * 60 * 1000);
    
    this.isRunning = true;
  }

  /**
   * Stop automated withdrawal scheduler
   */
  public stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 [SCHEDULER] Withdrawal scheduler stopped');
  }

  /**
   * Manual trigger untuk memproses withdrawals
   */
  public async processWithdrawalsManually(): Promise<void> {
    console.log('🔧 [SCHEDULER] Manual withdrawal processing triggered');
    await this.processWithdrawals();
  }

  /**
   * Internal method untuk memproses withdrawals
   */
  private async processWithdrawals(): Promise<void> {
    try {
      const startTime = new Date();
      console.log(`🔄 [SCHEDULER] Starting withdrawal processing at ${startTime.toISOString()}`);
      
      await this.autoWithdrawalService.processAllPendingWithdrawals();
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      console.log(`✅ [SCHEDULER] Withdrawal processing completed in ${duration}ms`);
      
    } catch (error) {
      console.error('❌ [SCHEDULER] Error in automated withdrawal processing:', error);
    }
  }

  /**
   * Get scheduler status
   */
  public getStatus(): { isRunning: boolean; nextRun?: Date } {
    return {
      isRunning: this.isRunning,
      nextRun: this.intervalId ? new Date(Date.now() + 5 * 60 * 1000) : undefined
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: any): void {
    this.autoWithdrawalService = new AutomatedWithdrawalService(newConfig, this.autoWithdrawalService['storage']);
    console.log('🔄 [SCHEDULER] Configuration updated');
  }
}

// Export singleton instance untuk digunakan di server
let withdrawalSchedulerInstance: WithdrawalScheduler | null = null;

export function getWithdrawalScheduler(storage: IStorage): WithdrawalScheduler {
  if (!withdrawalSchedulerInstance) {
    withdrawalSchedulerInstance = new WithdrawalScheduler(storage);
  }
  return withdrawalSchedulerInstance;
}

/**
 * Setup automated withdrawal processing di server startup
 */
export function setupAutomatedWithdrawals(storage: IStorage): void {
  // Check environment variables - enable by default if ADMIN_PRIVATE_KEY is available
  const enableAutomation = process.env.ENABLE_AUTO_WITHDRAWALS !== 'false'; // Enable by default
  const intervalMinutes = parseInt(process.env.WITHDRAWAL_CHECK_INTERVAL || '5');
  
  if (!enableAutomation) {
    console.log('ℹ️ [AUTO-WD] Automated withdrawals disabled via environment variable');
    return;
  }

  if (!process.env.ADMIN_PRIVATE_KEY) {
    console.log('⚠️ [AUTO-WD] ADMIN_PRIVATE_KEY not found, automated withdrawals disabled');
    return;
  }

  // Start automated withdrawal processing
  const scheduler = getWithdrawalScheduler(storage);
  scheduler.startScheduler(intervalMinutes);
  
  console.log(`✅ [AUTO-WD] Automated withdrawal system initialized`);
  console.log(`📋 [AUTO-WD] Processing interval: ${intervalMinutes} minutes`);
  // SECURITY: Never log sensitive configuration details
  console.log(`🔑 [AUTO-WD] Admin private key configured: ${process.env.ADMIN_PRIVATE_KEY ? 'Yes' : 'No'}`);
}