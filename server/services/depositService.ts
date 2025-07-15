import { storage } from '../storage';
import { BalanceService } from './balanceService';

class DepositService {
  private balanceService: BalanceService;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.balanceService = new BalanceService(storage);
  }

  /**
   * Start automatic deposit monitoring
   */
  startAutomaticMonitoring() {
    console.log('🔄 [DEPOSIT SERVICE] Starting automatic deposit monitoring...');
    
    // Check every 30 seconds for pending deposits
    this.checkInterval = setInterval(async () => {
      await this.checkPendingDeposits();
    }, 30000);

    // Run initial check
    setTimeout(() => this.checkPendingDeposits(), 5000);
  }

  /**
   * Stop automatic deposit monitoring
   */
  stopAutomaticMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏹️ [DEPOSIT SERVICE] Stopped automatic deposit monitoring');
    }
  }

  /**
   * Check all pending deposits and process completed ones
   */
  async checkPendingDeposits() {
    try {
      console.log('🔍 [DEPOSIT SERVICE] Checking pending deposits...');
      
      // Get all pending/processing deposits
      const deposits = await storage.getAllDeposits();
      const pendingDeposits = deposits.filter(d => d.status === 'pending' || d.status === 'processing');
      
      if (pendingDeposits.length === 0) {
        console.log('✅ [DEPOSIT SERVICE] No pending deposits found');
        return;
      }

      console.log(`🔄 [DEPOSIT SERVICE] Found ${pendingDeposits.length} pending deposits to check`);

      for (const deposit of pendingDeposits) {
        if (!deposit.transactionHash) {
          console.log(`⚠️ [DEPOSIT SERVICE] Deposit ${deposit.id} has no transaction hash, skipping...`);
          continue;
        }

        await this.checkSingleDeposit(deposit);
        // Add small delay between checks to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error('❌ [DEPOSIT SERVICE] Error checking pending deposits:', error);
    }
  }

  /**
   * Check a single deposit status
   */
  async checkSingleDeposit(deposit: any) {
    try {
      console.log(`🔍 [DEPOSIT SERVICE] Checking deposit ${deposit.id} (${deposit.chainName}) - Hash: ${deposit.transactionHash}`);

      // Chain configurations
      const chainConfig = {
        'eth': { explorerApi: 'https://api.etherscan.io/api', apiKey: process.env.ETHERSCAN_API_KEY },
        'bsc': { explorerApi: 'https://api.bscscan.com/api', apiKey: process.env.BSCSCAN_API_KEY },
        'base': { explorerApi: 'https://api.basescan.org/api', apiKey: process.env.BASESCAN_API_KEY },
        'optimism': { explorerApi: 'https://api-optimistic.etherscan.io/api', apiKey: process.env.OPTIMISM_API_KEY },
        'arbitrum': { explorerApi: 'https://api.arbiscan.io/api', apiKey: process.env.ARBISCAN_API_KEY },
        'sepolia': { explorerApi: 'https://api-sepolia.etherscan.io/api', apiKey: process.env.ETHERSCAN_API_KEY },
        'holesky': { explorerApi: 'https://api-holesky.etherscan.io/api', apiKey: process.env.ETHERSCAN_API_KEY }
      };

      const chain = chainConfig[deposit.chainName as keyof typeof chainConfig];
      if (!chain) {
        console.log(`❌ [DEPOSIT SERVICE] Unsupported chain: ${deposit.chainName}`);
        return;
      }

      // Check transaction status
      const apiUrl = `${chain.explorerApi}?module=transaction&action=gettxreceiptstatus&txhash=${deposit.transactionHash}&apikey=${chain.apiKey}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log(`📊 [DEPOSIT SERVICE] Blockchain API response for deposit ${deposit.id}:`, JSON.stringify(data, null, 2));
      
      if (data.status === "1" && data.result?.status === "1") {
        // Transaction successful - process deposit completion
        await this.processCompletedDeposit(deposit);
      } else if (data.status === "1" && data.result?.status === "0") {
        // Transaction failed
        await storage.updateDepositStatus(deposit.id, 'failed');
        console.log(`❌ [DEPOSIT SERVICE] Deposit ${deposit.id} failed on blockchain`);
      } else {
        // Still pending - update status to processing if not already
        if (deposit.status === 'pending') {
          await storage.updateDepositStatus(deposit.id, 'processing');
          console.log(`⏳ [DEPOSIT SERVICE] Deposit ${deposit.id} updated to processing`);
        }
      }

    } catch (error: any) {
      console.error(`❌ [DEPOSIT SERVICE] Error checking deposit ${deposit.id}:`, error?.response?.data || error.message);
      
      // Log API key issues for debugging
      if (error?.response?.data?.message) {
        console.error('🔑 [DEPOSIT SERVICE] API KEY ISSUE:', error.response.data.message);
      }
    }
  }

  /**
   * Process a completed deposit - update status and credit balance
   */
  async processCompletedDeposit(deposit: any) {
    try {
      console.log(`✅ [DEPOSIT SERVICE] Processing completed deposit ${deposit.id} for user ${deposit.userId}`);

      // Check if deposit was already processed
      const logs = await storage.getTransactionLogsByDepositId(deposit.id);
      if (logs.length > 0) {
        console.log(`⚠️ [DEPOSIT SERVICE] Deposit ${deposit.id} already processed, skipping...`);
        return;
      }

      // Update deposit status to completed
      await storage.updateDepositStatus(deposit.id, 'completed');
      
      // Credit user balance using BalanceService
      await this.balanceService.processTransaction(
        deposit.userId,
        'deposit_credit',
        deposit.ntiqAmount,
        `Deposit completed - ${deposit.chainName.toUpperCase()} transaction ${deposit.transactionHash}`,
        { 
          depositId: deposit.id,
          transactionHash: deposit.transactionHash,
          chainName: deposit.chainName,
          tokenType: deposit.tokenType,
          amountUSD: deposit.amountUSD
        }
      );

      console.log(`🎉 [DEPOSIT SERVICE] Successfully processed deposit ${deposit.id}: Added ${deposit.ntiqAmount} NTIQ to user ${deposit.userId}`);
      
    } catch (error) {
      console.error(`❌ [DEPOSIT SERVICE] Error processing completed deposit ${deposit.id}:`, error);
    }
  }

  /**
   * Manual check for all completed deposits without credit (auto-fix)
   */
  async autoFixUnpaidDeposits() {
    try {
      console.log('🔧 [DEPOSIT SERVICE] Running auto-fix for uncredited deposits...');
      
      const completedDeposits = await storage.getCompletedDepositsWithoutCredit();
      let fixedCount = 0;

      for (const deposit of completedDeposits) {
        try {
          // Check if this deposit already has transaction logs
          const logs = await storage.getTransactionLogsByDepositId(deposit.id);
          
          if (logs.length > 0) {
            console.log(`✅ [DEPOSIT SERVICE] Deposit ${deposit.id} already has transaction logs, skipping...`);
            continue;
          }

          // Credit the deposit
          await this.balanceService.processTransaction(
            deposit.userId,
            'deposit_credit',
            deposit.ntiqAmount,
            `Auto-fix deposit credit - ${deposit.chainName?.toUpperCase() || 'Unknown'} transaction ${deposit.transactionHash || 'manual'}`,
            { 
              depositId: deposit.id,
              transactionHash: deposit.transactionHash,
              chainName: deposit.chainName,
              tokenType: deposit.tokenType,
              amountUSD: deposit.amountUSD
            }
          );

          fixedCount++;
          console.log(`✅ [DEPOSIT SERVICE] Auto-fixed deposit ${deposit.id}: Credited ${deposit.ntiqAmount} NTIQ to user ${deposit.userId}`);
          
        } catch (depositError) {
          console.error(`❌ [DEPOSIT SERVICE] Error auto-fixing deposit ${deposit.id}:`, depositError);
        }
      }

      console.log(`🎉 [DEPOSIT SERVICE] Auto-fix completed: ${fixedCount} deposits fixed`);
      return { success: true, fixedCount, totalChecked: completedDeposits.length };
      
    } catch (error) {
      console.error('❌ [DEPOSIT SERVICE] Error during auto-fix:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const depositService = new DepositService();