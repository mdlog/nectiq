import axios from 'axios';

interface EtherscanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  blockNumber: string;
}

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export class BlockchainMonitor {
  private readonly SEPOLIA_API_URL = 'https://api-sepolia.etherscan.io/api';
  private readonly BSC_TESTNET_API_URL = 'https://api-testnet.bscscan.com/api';
  private readonly POLYGON_TESTNET_API_URL = 'https://api-testnet.polygonscan.com/api';
  
  // Free API keys - no authentication required for basic calls
  private readonly API_KEY = 'YourApiKeyToken'; // Default placeholder

  /**
   * Search for withdrawal transaction hash by recipient address and amount
   */
  async findWithdrawalHash(
    toAddress: string, 
    tokenType: string, 
    expectedAmount: string,
    timeWindow: number = 24 // hours
  ): Promise<string | null> {
    try {
      console.log(`🔍 [BLOCKCHAIN-MONITOR] Searching for withdrawal:`, {
        toAddress,
        tokenType,
        expectedAmount,
        timeWindow
      });

      let apiUrl = this.SEPOLIA_API_URL;
      let networkName = 'Sepolia';

      // Select appropriate network based on token type
      switch (tokenType.toLowerCase()) {
        case 'bnb':
          apiUrl = this.BSC_TESTNET_API_URL;
          networkName = 'BSC Testnet';
          break;
        case 'matic':
        case 'polygon':
          apiUrl = this.POLYGON_TESTNET_API_URL;
          networkName = 'Polygon Mumbai';
          break;
        default:
          // Default to Sepolia for ETH, USDC, USDT
          break;
      }

      console.log(`🌐 [BLOCKCHAIN-MONITOR] Using ${networkName} network`);

      // Get recent transactions for the address
      const response = await axios.get<EtherscanResponse>(apiUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address: toAddress,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 100,
          sort: 'desc',
          apikey: this.API_KEY
        },
        timeout: 10000
      });

      if (response.data.status !== '1') {
        console.log(`❌ [BLOCKCHAIN-MONITOR] API error:`, response.data.message);
        return null;
      }

      const transactions = response.data.result || [];
      console.log(`📊 [BLOCKCHAIN-MONITOR] Found ${transactions.length} transactions`);

      // Filter transactions within time window
      const timeWindowMs = timeWindow * 60 * 60 * 1000;
      const cutoffTime = (Date.now() - timeWindowMs) / 1000;

      const recentTxs = transactions.filter(tx => 
        parseInt(tx.timeStamp) > cutoffTime && 
        tx.isError === '0' &&
        tx.to.toLowerCase() === toAddress.toLowerCase()
      );

      console.log(`⏰ [BLOCKCHAIN-MONITOR] ${recentTxs.length} transactions in last ${timeWindow}h`);

      // For token transfers, we might need to check internal transactions or token transfers
      if (tokenType.toLowerCase() === 'usdc' || tokenType.toLowerCase() === 'usdt') {
        return await this.findTokenTransfer(apiUrl, toAddress, tokenType, expectedAmount, timeWindow);
      }

      // For native tokens (ETH, BNB, MATIC), check value
      const expectedWei = this.convertToWei(expectedAmount, tokenType);
      
      for (const tx of recentTxs) {
        const txValue = tx.value;
        console.log(`🔍 [BLOCKCHAIN-MONITOR] Checking tx ${tx.hash}: value=${txValue}, expected=${expectedWei}`);
        
        // Allow for small differences in amounts due to gas fees
        if (this.isAmountMatch(txValue, expectedWei, 0.05)) { // 5% tolerance
          console.log(`✅ [BLOCKCHAIN-MONITOR] Found matching withdrawal: ${tx.hash}`);
          return tx.hash;
        }
      }

      console.log(`❌ [BLOCKCHAIN-MONITOR] No matching withdrawal found`);
      return null;

    } catch (error) {
      console.error('❌ [BLOCKCHAIN-MONITOR] Error searching blockchain:', error);
      return null;
    }
  }

  /**
   * Search for token transfer transactions (USDC, USDT)
   */
  private async findTokenTransfer(
    apiUrl: string,
    toAddress: string,
    tokenType: string,
    expectedAmount: string,
    timeWindow: number
  ): Promise<string | null> {
    try {
      // Get token transfer events
      const response = await axios.get<EtherscanResponse>(apiUrl, {
        params: {
          module: 'account',
          action: 'tokentx',
          address: toAddress,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 100,
          sort: 'desc',
          apikey: this.API_KEY
        }
      });

      if (response.data.status !== '1') {
        return null;
      }

      const tokenTxs = response.data.result || [];
      const timeWindowMs = timeWindow * 60 * 60 * 1000;
      const cutoffTime = (Date.now() - timeWindowMs) / 1000;

      for (const tx of tokenTxs) {
        if (parseInt(tx.timeStamp) > cutoffTime && 
            tx.to.toLowerCase() === toAddress.toLowerCase()) {
          
          // Check if token symbol matches
          const tokenSymbol = (tx as any).tokenSymbol?.toLowerCase();
          if (tokenSymbol === tokenType.toLowerCase()) {
            
            // Convert expected amount to token decimals
            const tokenDecimals = parseInt((tx as any).tokenDecimal || '6');
            const expectedTokenAmount = this.convertToTokenUnits(expectedAmount, tokenDecimals);
            
            if (this.isAmountMatch(tx.value, expectedTokenAmount, 0.05)) {
              console.log(`✅ [BLOCKCHAIN-MONITOR] Found matching token transfer: ${tx.hash}`);
              return tx.hash;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ [BLOCKCHAIN-MONITOR] Error searching token transfers:', error);
      return null;
    }
  }

  /**
   * Convert amount to Wei (for ETH) or smallest unit
   */
  private convertToWei(amount: string, tokenType: string): string {
    const numAmount = parseFloat(amount);
    
    switch (tokenType.toLowerCase()) {
      case 'eth':
      case 'bnb':
      case 'matic':
        // 18 decimals
        return (numAmount * Math.pow(10, 18)).toString();
      case 'usdc':
      case 'usdt':
        // 6 decimals
        return (numAmount * Math.pow(10, 6)).toString();
      default:
        return (numAmount * Math.pow(10, 18)).toString();
    }
  }

  /**
   * Convert amount to token units based on decimals
   */
  private convertToTokenUnits(amount: string, decimals: number): string {
    const numAmount = parseFloat(amount);
    return (numAmount * Math.pow(10, decimals)).toString();
  }

  /**
   * Check if two amounts match within tolerance
   */
  private isAmountMatch(actual: string, expected: string, tolerance: number): boolean {
    const actualNum = parseFloat(actual);
    const expectedNum = parseFloat(expected);
    
    if (expectedNum === 0) return actualNum === 0;
    
    const diff = Math.abs(actualNum - expectedNum) / expectedNum;
    return diff <= tolerance;
  }

  /**
   * Monitor pending withdrawals and automatically find their hashes
   */
  async monitorPendingWithdrawals() {
    try {
      console.log('🔍 [BLOCKCHAIN-MONITOR] Starting withdrawal monitoring...');
      
      // This would be called from a scheduled job
      // For now, we'll implement the core functionality
      
    } catch (error) {
      console.error('❌ [BLOCKCHAIN-MONITOR] Error monitoring withdrawals:', error);
    }
  }
}

export const blockchainMonitor = new BlockchainMonitor();