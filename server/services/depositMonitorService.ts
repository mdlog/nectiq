import axios from 'axios';
import { storage } from '../storage.js';
import { BalanceService } from './balanceService.js';

class DepositMonitorService {
  private static instance: DepositMonitorService;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every 1 minute
  private readonly ETHERSCAN_API_KEY = 'FAJBQ6GECUEU2ZMKAQRH61XRCPQEIWKA7Z';

  static getInstance(): DepositMonitorService {
    if (!DepositMonitorService.instance) {
      DepositMonitorService.instance = new DepositMonitorService();
    }
    return DepositMonitorService.instance;
  }

  async start() {
    if (this.isRunning) {
      console.log('🔄 [DEPOSIT-MONITOR] Already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 [DEPOSIT-MONITOR] Starting automated deposit status monitoring...');
    
    // Run initial check
    await this.checkProcessingDeposits();
    
    // Set up recurring checks
    this.intervalId = setInterval(async () => {
      await this.checkProcessingDeposits();
    }, this.CHECK_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ [DEPOSIT-MONITOR] Stopped');
  }

  private async checkProcessingDeposits() {
    try {
      console.log('🔍 [DEPOSIT-MONITOR] Checking processing deposits...');
      
      const processingDeposits = await storage.getDepositsByStatus('processing');
      
      if (processingDeposits.length === 0) {
        console.log('✅ [DEPOSIT-MONITOR] No processing deposits found');
        return;
      }

      console.log(`📊 [DEPOSIT-MONITOR] Found ${processingDeposits.length} processing deposits`);

      for (const deposit of processingDeposits) {
        await this.checkDepositStatus(deposit);
      }
    } catch (error) {
      console.error('❌ [DEPOSIT-MONITOR] Error checking deposits:', error);
    }
  }

  private async checkDepositStatus(deposit: any) {
    try {
      if (!deposit.transactionHash) {
        console.log(`⚠️ [DEPOSIT-MONITOR] Deposit ${deposit.id} has no transaction hash, skipping`);
        return;
      }

      console.log(`🔍 [DEPOSIT-MONITOR] Checking deposit ${deposit.id} - ${deposit.transactionHash}`);

      const isSuccess = await this.checkTransactionStatus(deposit.transactionHash, deposit.network || 'sepolia');
      
      if (isSuccess) {
        console.log(`✅ [DEPOSIT-MONITOR] Transaction ${deposit.transactionHash} confirmed on blockchain`);
        await this.processSuccessfulDeposit(deposit);
      } else {
        console.log(`⏳ [DEPOSIT-MONITOR] Transaction ${deposit.transactionHash} still pending or not found`);
      }
    } catch (error) {
      console.error(`❌ [DEPOSIT-MONITOR] Error checking deposit ${deposit.id}:`, error);
    }
  }

  private async checkTransactionStatus(txHash: string, network: string): Promise<boolean> {
    try {
      let apiUrl = '';
      
      switch (network.toLowerCase()) {
        case 'sepolia':
          apiUrl = `https://api-sepolia.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.ETHERSCAN_API_KEY}`;
          break;
        case 'holesky':
          apiUrl = `https://api-holesky.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.ETHERSCAN_API_KEY}`;
          break;
        case 'ethereum':
        case 'mainnet':
          apiUrl = `https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.ETHERSCAN_API_KEY}`;
          break;
        case 'bsc':
          apiUrl = `https://api.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.ETHERSCAN_API_KEY}`;
          break;
        case 'optimism':
          apiUrl = `https://api-optimistic.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.ETHERSCAN_API_KEY}`;
          break;
        case 'arbitrum':
          apiUrl = `https://api.arbiscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.ETHERSCAN_API_KEY}`;
          break;
        default:
          console.log(`⚠️ [DEPOSIT-MONITOR] Unsupported network: ${network}, defaulting to sepolia`);
          apiUrl = `https://api-sepolia.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${this.ETHERSCAN_API_KEY}`;
      }

      const response = await axios.get(apiUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Nectiq-DepositMonitor/1.0'
        }
      });

      if (response.data && response.data.status === '1') {
        // Status 1 means success, 0 means failure
        return response.data.result?.status === '1';
      }

      return false;
    } catch (error) {
      console.error(`❌ [DEPOSIT-MONITOR] Error checking transaction ${txHash}:`, error);
      return false;
    }
  }

  private async processSuccessfulDeposit(deposit: any) {
    try {
      console.log(`🎉 [DEPOSIT-MONITOR] Processing successful deposit ${deposit.id} for user ${deposit.userId}`);
      
      // Update deposit status to completed
      await storage.updateDepositStatus(deposit.id, 'completed');
      console.log(`✅ [DEPOSIT-MONITOR] Updated deposit ${deposit.id} status to completed`);
      
      // Credit user balance using BalanceService
      await BalanceService.processTransaction({
        userId: deposit.userId,
        type: 'deposit_credit',
        amount: deposit.ntiqAmount,
        token: 'NTIQ',
        hash: deposit.transactionHash,
        description: `Automated deposit credit - Deposit ID ${deposit.id}`,
        relatedId: deposit.id,
        metadata: {
          depositId: deposit.id,
          originalAmount: deposit.ntiqAmount,
          source: 'automated_monitor'
        }
      }, storage);
      
      console.log(`💰 [DEPOSIT-MONITOR] Credited ${deposit.ntiqAmount} NTIQ to user ${deposit.userId}`);
      
      // Get user info for logging
      const user = await storage.getUserById(deposit.userId);
      if (user) {
        console.log(`📈 [DEPOSIT-MONITOR] User ${user.username} balance updated automatically from blockchain confirmation`);
      }
      
    } catch (error) {
      console.error(`❌ [DEPOSIT-MONITOR] Error processing successful deposit ${deposit.id}:`, error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.CHECK_INTERVAL,
      uptime: this.isRunning ? Date.now() : 0
    };
  }
}

export { DepositMonitorService };