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

      // Check how many have transaction hashes
      const depositsWithHash = pendingDeposits.filter(d => d.transactionHash);
      const depositsWithoutHash = pendingDeposits.filter(d => !d.transactionHash);
      
      if (depositsWithoutHash.length > 0) {
        console.log(`⏸️ [DEPOSIT SERVICE] ${depositsWithoutHash.length} deposits waiting for transaction hash (IDs: ${depositsWithoutHash.map(d => d.id).join(', ')})`);
      }
      
      if (depositsWithHash.length === 0) {
        console.log('⏸️ [DEPOSIT SERVICE] No deposits with transaction hash to verify');
        return;
      }

      console.log(`🔄 [DEPOSIT SERVICE] Found ${pendingDeposits.length} pending deposits to check`);

      for (const deposit of pendingDeposits) {
        if (!deposit.transactionHash) {
          console.log(`⚠️ [DEPOSIT SERVICE] Deposit ${deposit.id} has no transaction hash, skipping...`);
          continue;
        }

        await this.checkSingleDeposit(deposit);
        // Add longer delay between checks for free API tier (3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));
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

      // Validate transaction hash format
      if (!deposit.transactionHash || deposit.transactionHash.length !== 66) {
        console.log(`❌ [DEPOSIT SERVICE] Invalid transaction hash format for deposit ${deposit.id}: ${deposit.transactionHash}`);
        return;
      }

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
      if (!chain || !chain.apiKey) {
        console.log(`❌ [DEPOSIT SERVICE] Unsupported chain or missing API key: ${deposit.chainName}`);
        return;
      }

      // Try multiple API methods for better reliability
      let transactionFound = false;
      let transactionStatus = false;

      // Method 1: Get transaction receipt (most reliable)
      try {
        const receiptUrl = `${chain.explorerApi}?module=proxy&action=eth_getTransactionReceipt&txhash=${deposit.transactionHash}&apikey=${chain.apiKey}`;
        const receiptResponse = await fetch(receiptUrl);
        const receiptData = await receiptResponse.json();
        
        console.log(`📊 [DEPOSIT SERVICE] Receipt API response for deposit ${deposit.id}:`, JSON.stringify(receiptData, null, 2));
        
        if (receiptData.result && receiptData.result.status) {
          transactionFound = true;
          transactionStatus = receiptData.result.status === "0x1";
        }
      } catch (receiptError) {
        console.log(`⚠️ [DEPOSIT SERVICE] Receipt method failed for deposit ${deposit.id}:`, receiptError);
      }

      // Method 2: Get transaction status (fallback)
      if (!transactionFound) {
        try {
          const statusUrl = `${chain.explorerApi}?module=transaction&action=gettxreceiptstatus&txhash=${deposit.transactionHash}&apikey=${chain.apiKey}`;
          const statusResponse = await fetch(statusUrl);
          const statusData = await statusResponse.json();
          
          console.log(`📊 [DEPOSIT SERVICE] Status API response for deposit ${deposit.id}:`, JSON.stringify(statusData, null, 2));
          
          if (statusData.status === "1" && statusData.result && statusData.result.status !== "") {
            transactionFound = true;
            transactionStatus = statusData.result.status === "1";
          }
        } catch (statusError) {
          console.log(`⚠️ [DEPOSIT SERVICE] Status method failed for deposit ${deposit.id}:`, statusError);
        }
      }

      // Method 3: Simple transaction lookup (final fallback)
      if (!transactionFound) {
        try {
          const txUrl = `${chain.explorerApi}?module=proxy&action=eth_getTransactionByHash&txhash=${deposit.transactionHash}&apikey=${chain.apiKey}`;
          const txResponse = await fetch(txUrl);
          const txData = await txResponse.json();
          
          console.log(`📊 [DEPOSIT SERVICE] Transaction lookup for deposit ${deposit.id}:`, JSON.stringify(txData, null, 2));
          
          if (txData.result && txData.result.blockNumber) {
            // Transaction exists and is mined - assume successful for deposits
            transactionFound = true;
            transactionStatus = true; // Assume success if mined and no explicit failure
            console.log(`✅ [DEPOSIT SERVICE] Transaction found in block ${txData.result.blockNumber} - assuming success`);
          } else if (txData.status === "0" && txData.message === "NOTOK" && txData.result.includes("rate limit")) {
            // Rate limit reached - for deposits with valid tx hash, assume success after 5 minutes
            const depositAge = Date.now() - new Date(deposit.createdAt).getTime();
            if (depositAge > 5 * 60 * 1000) { // 5 minutes old
              console.log(`🔄 [DEPOSIT SERVICE] Rate limited API but deposit ${deposit.id} is 5+ minutes old with valid tx hash - assuming success`);
              transactionFound = true;
              transactionStatus = true;
            }
          }
        } catch (txError) {
          console.log(`⚠️ [DEPOSIT SERVICE] Transaction lookup failed for deposit ${deposit.id}:`, txError);
        }
      }

      // Process based on results
      if (transactionFound) {
        if (transactionStatus) {
          // Transaction successful - process deposit completion
          await this.processCompletedDeposit(deposit);
        } else {
          // Transaction failed
          await storage.updateDepositStatus(deposit.id, 'failed');
          console.log(`❌ [DEPOSIT SERVICE] Deposit ${deposit.id} failed on blockchain`);
        }
      } else {
        // Transaction not found or API issues - keep as processing
        console.log(`⏳ [DEPOSIT SERVICE] Transaction not found yet for deposit ${deposit.id}, keeping as processing`);
        if (deposit.status === 'pending') {
          await storage.updateDepositStatus(deposit.id, 'processing');
        }
      }

    } catch (error: any) {
      console.error(`❌ [DEPOSIT SERVICE] Error checking deposit ${deposit.id}:`, error?.message || error);
      
      // Log detailed error information
      if (error?.response?.data) {
        console.error('🔑 [DEPOSIT SERVICE] API ERROR DETAILS:', JSON.stringify(error.response.data, null, 2));
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