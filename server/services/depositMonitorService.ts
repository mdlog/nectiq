import axios from 'axios';
import { storage } from '../storage.js';
import { BalanceService } from './balanceService.js';

class DepositMonitorService {
  private static instance: DepositMonitorService;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every 1 minute
  // 🔒 SECURITY FIX: Removed insecure fallback 'YOUR_API_KEY_HERE'
  // If ETHERSCAN_API_KEY not set, service will log warning but continue
  // (Etherscan allows limited requests without API key)
  private readonly ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

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

      // FIX: Use chainName field (from database) instead of network
      const network = deposit.chainName || deposit.network || 'sepolia';
      console.log(`🔍 [DEPOSIT-MONITOR] Checking deposit ${deposit.id} - ${deposit.transactionHash} on ${network}`);

      const isSuccess = await this.checkTransactionStatus(deposit.transactionHash, network);

      if (isSuccess) {
        console.log(`✅ [DEPOSIT-MONITOR] Transaction ${deposit.transactionHash} confirmed on blockchain`);
        await this.processSuccessfulDeposit(deposit);
      } else {
        console.log(`⏳ [DEPOSIT-MONITOR] Transaction ${deposit.transactionHash} still pending or not found on ${network}`);
      }
    } catch (error) {
      console.error(`❌ [DEPOSIT-MONITOR] Error checking deposit ${deposit.id}:`, error);
    }
  }

  private async checkTransactionStatus(txHash: string, network: string): Promise<boolean> {
    try {
      let apiUrl = '';

      // Use free Etherscan API (no key required for basic checks)
      // Or use environment variable if set
      const apiKey = this.ETHERSCAN_API_KEY && this.ETHERSCAN_API_KEY !== 'YOUR_API_KEY_HERE'
        ? this.ETHERSCAN_API_KEY
        : '';

      switch (network.toLowerCase()) {
        case 'sepolia':
          apiUrl = `https://api-sepolia.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
          break;
        case 'holesky':
          apiUrl = `https://api-holesky.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
          break;
        case 'ethereum':
        case 'mainnet':
        case 'eth':
          apiUrl = `https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
          break;
        case 'bsc':
          apiUrl = `https://api.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
          break;
        case 'optimism':
          apiUrl = `https://api-optimistic.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
          break;
        case 'arbitrum':
          apiUrl = `https://api.arbiscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
          break;
        case 'base':
          apiUrl = `https://api.basescan.org/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
          break;
        default:
          console.log(`⚠️ [DEPOSIT-MONITOR] Unsupported network: ${network}, defaulting to sepolia`);
          apiUrl = `https://api-sepolia.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}${apiKey ? `&apikey=${apiKey}` : ''}`;
      }

      console.log(`🔍 [DEPOSIT-MONITOR] Checking blockchain API: ${apiUrl.substring(0, 80)}...`);

      const response = await axios.get(apiUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Nectiq-DepositMonitor/1.0'
        }
      });

      console.log(`📊 [DEPOSIT-MONITOR] API Response for ${txHash}: status=${response.data?.status}, result=${JSON.stringify(response.data?.result)}`);

      if (response.data && response.data.status === '1') {
        // Status 1 means success, 0 means failure
        const isConfirmed = response.data.result?.status === '1';
        console.log(`${isConfirmed ? '✅' : '❌'} [DEPOSIT-MONITOR] Transaction ${txHash} blockchain status: ${isConfirmed ? 'CONFIRMED' : 'FAILED'}`);
        return isConfirmed;
      }

      // If API returns error or status not '1', log it
      if (response.data?.message) {
        console.log(`⚠️ [DEPOSIT-MONITOR] API message: ${response.data.message}`);
      }

      return false;
    } catch (error: any) {
      console.error(`❌ [DEPOSIT-MONITOR] Error checking transaction ${txHash}:`, error.message || error);
      if (error.response?.data) {
        console.error(`📡 [DEPOSIT-MONITOR] API Error Response:`, error.response.data);
      }
      return false;
    }
  }

  private async processSuccessfulDeposit(deposit: any) {
    try {
      console.log(`🎉 [DEPOSIT-MONITOR] Processing successful deposit ${deposit.id} for user ${deposit.userId}`);

      // ✅ CHECK: Prevent duplicate processing - check if already completed
      if (deposit.status === 'completed' || deposit.processedAt) {
        console.log(`⚠️ [DEPOSIT-MONITOR] Deposit ${deposit.id} already completed (status: ${deposit.status}, processedAt: ${deposit.processedAt}) - SKIPPING to prevent duplicate notification`);
        return;
      }

      // ✅ CHECK: Verify deposit hasn't been processed already by checking DB status
      const currentDeposit = await storage.getDepositById(deposit.id);
      if (currentDeposit?.status === 'completed' || currentDeposit?.processedAt) {
        console.log(`⚠️ [DEPOSIT-MONITOR] Deposit ${deposit.id} already completed in database - SKIPPING duplicate processing`);
        return;
      }

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

      // Send real-time notification to user (ONLY ONCE - after successful status update)
      try {
        // Import broadcastNotification function from routes
        const { broadcastNotificationCallback } = await import('../routes.js');

        if (broadcastNotificationCallback) {
          broadcastNotificationCallback(deposit.userId, {
            type: 'deposit_completed',
            title: 'Deposit Completed',
            message: `Your deposit of ${deposit.ntiqAmount} NTIQ has been successfully processed and credited to your account.`,
            data: {
              depositId: deposit.id,
              amount: deposit.ntiqAmount,
              currency: 'NTIQ',
              transactionHash: deposit.transactionHash,
              completedAt: new Date().toISOString()
            },
            timestamp: Date.now(),
            priority: 'high'
          });

          console.log(`📡 [DEPOSIT-MONITOR] ✅ Real-time notification sent to user ${deposit.userId} for completed deposit (FIRST TIME ONLY)`);
        } else {
          console.log(`⚠️ [DEPOSIT-MONITOR] Broadcast function not available, notification not sent`);
        }
      } catch (error) {
        console.error(`❌ [DEPOSIT-MONITOR] Error sending notification:`, error);
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