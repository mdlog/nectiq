import axios from 'axios';
import { storage } from '../storage.js';

interface EtherscanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  blockNumber: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
}

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export class WithdrawalMonitorService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private readonly ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'J2DPX5HHQKYKX3E17WPMWKH9PYYFMY6IQF'; // Valid API key

  async start() {
    console.log('🚀 [WITHDRAWAL-MONITOR] Starting automated withdrawal hash detection...');
    
    // Initial check
    await this.checkPendingWithdrawals();
    
    // Set up interval for continuous monitoring
    this.intervalId = setInterval(() => {
      this.checkPendingWithdrawals();
    }, this.CHECK_INTERVAL);
    
    console.log(`✅ [WITHDRAWAL-MONITOR] Withdrawal monitoring started - checking every ${this.CHECK_INTERVAL/1000} seconds`);
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 [WITHDRAWAL-MONITOR] Withdrawal monitoring stopped');
    }
  }

  private async checkPendingWithdrawals() {
    try {
      console.log('🔍 [WITHDRAWAL-MONITOR] Checking pending withdrawals...');
      
      const allWithdrawals = await storage.getAllWithdrawals();
      
      // Filter withdrawals that need hash detection
      const pendingWithdrawals = allWithdrawals.filter(w => 
        (w.status === 'processing' || w.status === 'pending') && 
        (!w.transactionHash || w.transactionHash === '3' || w.transactionHash === 'pending' || !w.transactionHash.startsWith('0x'))
      );
      
      if (pendingWithdrawals.length === 0) {
        console.log('✅ [WITHDRAWAL-MONITOR] No pending withdrawals found');
        return;
      }

      console.log(`📊 [WITHDRAWAL-MONITOR] Found ${pendingWithdrawals.length} pending withdrawals`);

      for (const withdrawal of pendingWithdrawals) {
        await this.searchWithdrawalHash(withdrawal);
      }
    } catch (error) {
      console.error('❌ [WITHDRAWAL-MONITOR] Error checking withdrawals:', error);
    }
  }

  private async searchWithdrawalHash(withdrawal: any) {
    try {
      console.log(`🔍 [WITHDRAWAL-MONITOR] Searching hash for withdrawal ${withdrawal.uniqueTransactionId}`);
      
      if (!withdrawal.toWalletAddress) {
        console.log(`⚠️ [WITHDRAWAL-MONITOR] Withdrawal ${withdrawal.uniqueTransactionId} has no target address, skipping`);
        return;
      }

      // Calculate search timeframe (created time + 48 hours)
      const createdTime = new Date(withdrawal.createdAt);
      const searchStartTime = Math.floor(createdTime.getTime() / 1000);
      const searchEndTime = Math.floor((Date.now()) / 1000); // Current time
      
      console.log(`🔍 [WITHDRAWAL-MONITOR] Searching from ${new Date(searchStartTime * 1000).toISOString()} to ${new Date(searchEndTime * 1000).toISOString()}`);

      // Determine network and API URL
      const network = this.getNetworkFromToken(withdrawal.tokenType);
      const apiUrl = this.getApiUrl(network);
      
      if (!apiUrl) {
        console.log(`⚠️ [WITHDRAWAL-MONITOR] Unsupported network for token ${withdrawal.tokenType}`);
        return;
      }

      console.log(`🌐 [WITHDRAWAL-MONITOR] Using ${network} network for ${withdrawal.tokenType} token`);

      // Search for transactions
      let foundHash = null;
      
      if (withdrawal.tokenType.toUpperCase() === 'USDC' || withdrawal.tokenType.toUpperCase() === 'USDT') {
        // Token transfers
        foundHash = await this.searchTokenTransfer(apiUrl, withdrawal, searchStartTime, searchEndTime);
      } else {
        // Native token transfers (ETH, BNB, MATIC)
        foundHash = await this.searchNativeTransfer(apiUrl, withdrawal, searchStartTime, searchEndTime);
      }

      if (foundHash) {
        console.log(`✅ [WITHDRAWAL-MONITOR] Found hash for withdrawal ${withdrawal.uniqueTransactionId}: ${foundHash}`);
        await this.updateWithdrawalHash(withdrawal, foundHash);
      } else {
        console.log(`❌ [WITHDRAWAL-MONITOR] No matching transaction found for withdrawal ${withdrawal.uniqueTransactionId}`);
      }
      
    } catch (error) {
      console.error(`❌ [WITHDRAWAL-MONITOR] Error searching withdrawal ${withdrawal.uniqueTransactionId}:`, error);
    }
  }

  private async searchNativeTransfer(apiUrl: string, withdrawal: any, startTime: number, endTime: number): Promise<string | null> {
    try {
      const response = await axios.get<EtherscanResponse>(apiUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address: withdrawal.toWalletAddress,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 100,
          sort: 'desc',
          apikey: this.ETHERSCAN_API_KEY
        },
        timeout: 10000
      });

      if (response.data.status !== '1') {
        console.log(`❌ [WITHDRAWAL-MONITOR] API error:`, response.data.message);
        return null;
      }

      const transactions = response.data.result || [];
      console.log(`📊 [WITHDRAWAL-MONITOR] Found ${transactions.length} transactions for address ${withdrawal.toWalletAddress}`);

      // Filter transactions within timeframe and to correct address
      const relevantTxs = transactions.filter(tx => 
        parseInt(tx.timeStamp) >= startTime &&
        parseInt(tx.timeStamp) <= endTime &&
        tx.isError === '0' &&
        tx.to.toLowerCase() === withdrawal.toWalletAddress.toLowerCase()
      );

      console.log(`⏰ [WITHDRAWAL-MONITOR] ${relevantTxs.length} transactions in timeframe`);

      // Convert expected amount to Wei (assuming USD amount)
      const expectedUSD = parseFloat(withdrawal.usdAmount || withdrawal.netAmount || (withdrawal.amount * 0.01).toString());
      
      for (const tx of relevantTxs) {
        const txValueWei = tx.value;
        const txValueEth = parseFloat(txValueWei) / Math.pow(10, 18);
        
        console.log(`🔍 [WITHDRAWAL-MONITOR] Checking tx ${tx.hash}: ${txValueEth} ETH`);
        
        // For native tokens, we need to estimate if the ETH value matches USD expectation
        // This is rough estimation - in production, use price at transaction time
        const estimatedUSD = txValueEth * 3000; // Rough ETH price estimate
        
        if (this.isAmountMatch(estimatedUSD, expectedUSD, 0.2)) { // 20% tolerance for native tokens
          console.log(`✅ [WITHDRAWAL-MONITOR] Amount match found: ${estimatedUSD} USD ≈ ${expectedUSD} USD`);
          return tx.hash;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ [WITHDRAWAL-MONITOR] Error searching native transfers:', error);
      return null;
    }
  }

  private async searchTokenTransfer(apiUrl: string, withdrawal: any, startTime: number, endTime: number): Promise<string | null> {
    try {
      const response = await axios.get<EtherscanResponse>(apiUrl, {
        params: {
          module: 'account',
          action: 'tokentx',
          address: withdrawal.toWalletAddress,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 100,
          sort: 'desc',
          apikey: this.ETHERSCAN_API_KEY
        }
      });

      if (response.data.status !== '1') {
        return null;
      }

      const tokenTxs = response.data.result || [];
      console.log(`📊 [WITHDRAWAL-MONITOR] Found ${tokenTxs.length} token transactions for address ${withdrawal.toWalletAddress}`);

      const relevantTxs = tokenTxs.filter(tx => 
        parseInt(tx.timeStamp) >= startTime &&
        parseInt(tx.timeStamp) <= endTime &&
        tx.to.toLowerCase() === withdrawal.toWalletAddress.toLowerCase()
      );

      console.log(`⏰ [WITHDRAWAL-MONITOR] ${relevantTxs.length} token transactions in timeframe`);

      const expectedUSD = parseFloat(withdrawal.usdAmount || withdrawal.netAmount || (withdrawal.amount * 0.01).toString());

      for (const tx of relevantTxs) {
        const tokenSymbol = (tx as any).tokenSymbol?.toLowerCase();
        
        if (tokenSymbol === withdrawal.tokenType.toLowerCase()) {
          const tokenDecimals = parseInt((tx as any).tokenDecimal || '6');
          const txValueTokens = parseFloat(tx.value) / Math.pow(10, tokenDecimals);
          
          console.log(`🔍 [WITHDRAWAL-MONITOR] Checking ${tokenSymbol.toUpperCase()} tx ${tx.hash}: ${txValueTokens} tokens`);
          
          // For stablecoins, token amount should approximately equal USD amount
          if (this.isAmountMatch(txValueTokens, expectedUSD, 0.05)) { // 5% tolerance for stablecoins
            console.log(`✅ [WITHDRAWAL-MONITOR] Amount match found: ${txValueTokens} ${tokenSymbol.toUpperCase()} ≈ ${expectedUSD} USD`);
            return tx.hash;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ [WITHDRAWAL-MONITOR] Error searching token transfers:', error);
      return null;
    }
  }

  private async updateWithdrawalHash(withdrawal: any, hash: string) {
    try {
      console.log(`🔄 [WITHDRAWAL-MONITOR] Updating withdrawal ${withdrawal.uniqueTransactionId} with hash ${hash}`);
      
      await storage.updateWithdrawalHash(withdrawal.uniqueTransactionId, hash, 'completed');
      
      console.log(`✅ [WITHDRAWAL-MONITOR] Successfully updated withdrawal ${withdrawal.uniqueTransactionId} - Status: completed, Hash: ${hash}`);
      
      // Log success for admin monitoring
      console.log(`🎉 [WITHDRAWAL-MONITOR] Automatic hash detection successful for withdrawal ${withdrawal.uniqueTransactionId}`);
      
    } catch (error) {
      console.error(`❌ [WITHDRAWAL-MONITOR] Error updating withdrawal ${withdrawal.uniqueTransactionId}:`, error);
    }
  }

  private getNetworkFromToken(token: string): string {
    switch (token.toLowerCase()) {
      case 'bnb':
        return 'bsc-testnet';
      case 'matic':
      case 'polygon':
        return 'polygon-mumbai';
      case 'eth':
      case 'usdc':
      case 'usdt':
      default:
        return 'sepolia';
    }
  }

  private getApiUrl(network: string): string | null {
    switch (network) {
      case 'sepolia':
        return 'https://api-sepolia.etherscan.io/api';
      case 'bsc-testnet':
        return 'https://api-testnet.bscscan.com/api';
      case 'polygon-mumbai':
        return 'https://api-testnet.polygonscan.com/api';
      default:
        return null;
    }
  }

  private isAmountMatch(actual: number, expected: number, tolerance: number): boolean {
    if (expected === 0) return actual === 0;
    
    const diff = Math.abs(actual - expected) / expected;
    return diff <= tolerance;
  }

  getStatus() {
    return {
      isRunning: this.intervalId !== null,
      checkInterval: this.CHECK_INTERVAL,
      lastCheck: new Date().toISOString()
    };
  }
}

export const withdrawalMonitorService = new WithdrawalMonitorService();