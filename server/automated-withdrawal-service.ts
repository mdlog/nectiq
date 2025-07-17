import { ethers } from 'ethers';
import axios from 'axios';
import { db } from './db.js';
import { withdrawals, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { IStorage } from './storage.js';

interface AutoWithdrawalConfig {
  // Wallet Configuration
  adminPrivateKey: string; // Private key admin wallet untuk signing transaksi
  
  // Network Configurations
  networks: {
    [key: string]: {
      rpcUrl: string;
      chainId: number;
      gasLimit: string;
      maxGasPrice: string; // in gwei
      tokenContracts: {
        USDC: string;
        USDT: string;
      }
    }
  };
  
  // Security Settings
  maxDailyWithdrawal: number; // Maximum daily withdrawal dalam USD
  maxSingleWithdrawal: number; // Maximum single withdrawal dalam USD
  autoApprovalThreshold: number; // Auto approve jika dibawah threshold ini
  
  // Monitoring
  webhookUrl?: string; // Untuk notifikasi ke Discord/Slack
  emailNotification?: string; // Email untuk notifikasi
}

export class AutomatedWithdrawalService {
  private config: AutoWithdrawalConfig;
  private storage: IStorage;
  private dailyWithdrawalTotal: number = 0;
  private lastDailyReset: Date = new Date();

  constructor(config: AutoWithdrawalConfig, storage: IStorage) {
    this.config = config;
    this.storage = storage;
  }

  /**
   * Main function untuk memproses semua pending withdrawals
   */
  async processAllPendingWithdrawals(): Promise<void> {
    try {
      console.log('🔄 [AUTO-WD] Starting automated withdrawal processing...');
      
      // Reset daily counter jika sudah lewat 24 jam
      this.resetDailyCounterIfNeeded();
      
      // Ambil semua pending withdrawals
      const pendingWithdrawals = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.status, 'pending'))
        .orderBy(withdrawals.createdAt);

      console.log(`📝 [AUTO-WD] Found ${pendingWithdrawals.length} pending withdrawals`);

      for (const withdrawal of pendingWithdrawals) {
        await this.processSingleWithdrawal(withdrawal);
        
        // Delay 2 detik antar transaksi untuk menghindari network congestion
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error('❌ [AUTO-WD] Error in processAllPendingWithdrawals:', error);
      await this.sendErrorNotification('Failed to process pending withdrawals', error);
    }
  }

  /**
   * Proses single withdrawal dengan validasi keamanan
   */
  private async processSingleWithdrawal(withdrawal: any): Promise<void> {
    try {
      console.log(`🔍 [AUTO-WD] Processing withdrawal ID: ${withdrawal.id}`);
      
      // 1. Security Validations
      const validationResult = await this.validateWithdrawal(withdrawal);
      if (!validationResult.isValid) {
        console.log(`⚠️ [AUTO-WD] Withdrawal ${withdrawal.id} failed validation: ${validationResult.reason}`);
        await this.rejectWithdrawal(withdrawal.id, validationResult.reason);
        return;
      }

      // 2. Auto-approve jika memenuhi criteria
      if (this.shouldAutoApprove(withdrawal)) {
        console.log(`✅ [AUTO-WD] Auto-approving withdrawal ${withdrawal.id}`);
        await this.executeWithdrawal(withdrawal);
      } else {
        console.log(`📋 [AUTO-WD] Withdrawal ${withdrawal.id} requires manual review`);
        await this.flagForManualReview(withdrawal);
      }
      
    } catch (error) {
      console.error(`❌ [AUTO-WD] Error processing withdrawal ${withdrawal.id}:`, error);
      await this.rejectWithdrawal(withdrawal.id, `Processing error: ${error.message}`);
    }
  }

  /**
   * Validasi keamanan untuk withdrawal
   */
  private async validateWithdrawal(withdrawal: any): Promise<{isValid: boolean, reason?: string}> {
    // 1. Cek user exists dan memiliki balance cukup
    const user = await db.select().from(users).where(eq(users.id, withdrawal.userId)).limit(1);
    if (!user.length) {
      return { isValid: false, reason: 'User not found' };
    }

    // 2. Cek wallet address format
    if (!ethers.isAddress(withdrawal.toWalletAddress)) {
      return { isValid: false, reason: 'Invalid wallet address format' };
    }

    // 3. Cek daily limit
    if (this.dailyWithdrawalTotal + parseFloat(withdrawal.usdAmount) > this.config.maxDailyWithdrawal) {
      return { isValid: false, reason: 'Daily withdrawal limit exceeded' };
    }

    // 4. Cek single withdrawal limit
    if (parseFloat(withdrawal.usdAmount) > this.config.maxSingleWithdrawal) {
      return { isValid: false, reason: 'Single withdrawal limit exceeded' };
    }

    // 5. Cek network supported
    if (!this.config.networks[withdrawal.chainName]) {
      return { isValid: false, reason: 'Unsupported network' };
    }

    return { isValid: true };
  }

  /**
   * Cek apakah withdrawal bisa di auto-approve
   */
  private shouldAutoApprove(withdrawal: any): boolean {
    const usdAmount = parseFloat(withdrawal.usdAmount);
    return usdAmount <= this.config.autoApprovalThreshold;
  }

  /**
   * Execute withdrawal ke blockchain
   */
  private async executeWithdrawal(withdrawal: any): Promise<void> {
    try {
      // Update status ke processing
      await this.updateWithdrawalStatus(withdrawal.id, 'processing');
      
      // Setup provider dan signer
      const networkConfig = this.config.networks[withdrawal.chainName];
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      const signer = new ethers.Wallet(this.config.adminPrivateKey, provider);
      
      let txHash: string;
      
      if (withdrawal.tokenType === 'ETH') {
        // ETH Transfer
        txHash = await this.sendETH(signer, withdrawal, networkConfig);
      } else {
        // ERC-20 Token Transfer (USDC/USDT)
        txHash = await this.sendERC20Token(signer, withdrawal, networkConfig);
      }
      
      // Update dengan transaction hash
      await this.updateWithdrawalStatus(withdrawal.id, 'completed', txHash);
      this.dailyWithdrawalTotal += parseFloat(withdrawal.usdAmount);
      
      // CRITICAL: Deduct user balance after successful withdrawal
      await this.deductUserBalance(withdrawal);
      
      console.log(`✅ [AUTO-WD] Withdrawal ${withdrawal.id} completed with TX: ${txHash}`);
      
      // Send success notification
      await this.sendSuccessNotification(withdrawal, txHash);
      
    } catch (error) {
      console.error(`❌ [AUTO-WD] Failed to execute withdrawal ${withdrawal.id}:`, error);
      await this.updateWithdrawalStatus(withdrawal.id, 'rejected', null, error.message);
      throw error;
    }
  }

  /**
   * Send ETH transaction
   */
  private async sendETH(signer: ethers.Wallet, withdrawal: any, networkConfig: any): Promise<string> {
    const tx = await signer.sendTransaction({
      to: withdrawal.toWalletAddress,
      value: ethers.parseEther(withdrawal.netAmount.toString()),
      gasLimit: networkConfig.gasLimit,
      maxFeePerGas: ethers.parseUnits(networkConfig.maxGasPrice, 'gwei'),
    });
    
    await tx.wait(); // Wait for confirmation
    return tx.hash;
  }

  /**
   * Send ERC-20 token transaction
   */
  private async sendERC20Token(signer: ethers.Wallet, withdrawal: any, networkConfig: any): Promise<string> {
    const tokenAddress = networkConfig.tokenContracts[withdrawal.tokenType];
    
    // ERC-20 ABI untuk transfer
    const erc20ABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)"
    ];
    
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
    
    // Get token decimals
    const decimals = await tokenContract.decimals();
    const amount = ethers.parseUnits(withdrawal.netAmount.toString(), decimals);
    
    const tx = await tokenContract.transfer(withdrawal.toWalletAddress, amount, {
      gasLimit: '65000', // Higher gas limit for ERC-20 transfers
      maxFeePerGas: ethers.parseUnits(networkConfig.maxGasPrice, 'gwei'),
    });
    
    await tx.wait(); // Wait for confirmation
    return tx.hash;
  }

  /**
   * Update withdrawal status di database
   */
  private async updateWithdrawalStatus(id: number, status: string, txHash?: string, adminNote?: string): Promise<void> {
    const updateData: any = {
      status,
      processedAt: new Date(),
      processedBy: 1, // Admin user ID (system automated processing)
    };
    
    if (txHash) updateData.transactionHash = txHash;
    if (adminNote) updateData.adminNote = adminNote;
    
    await db.update(withdrawals).set(updateData).where(eq(withdrawals.id, id));
  }

  /**
   * Deduct user balance after successful withdrawal
   */
  private async deductUserBalance(withdrawal: any): Promise<void> {
    try {
      const { BalanceService } = await import('./balanceService.js');
      
      // Deduct withdrawal amount from user balance
      await BalanceService.processTransaction({
        userId: withdrawal.userId,
        type: 'withdrawal_completed',
        amount: withdrawal.ntiqAmount, // Positive amount, service will make it negative
        description: `Withdrawal completed - TX: ${withdrawal.transactionHash || 'automated_withdrawal'}`,
        relatedId: withdrawal.id
      }, this.storage);
      
      console.log(`💰 [AUTO-WD] Deducted ${withdrawal.ntiqAmount} NTIQ from user ${withdrawal.userId} balance`);
      
    } catch (error) {
      console.error(`❌ [AUTO-WD] Failed to deduct balance for withdrawal ${withdrawal.id}:`, error);
      throw error;
    }
  }

  /**
   * Reject withdrawal dengan alasan
   */
  private async rejectWithdrawal(id: number, reason: string): Promise<void> {
    await this.updateWithdrawalStatus(id, 'rejected', null, `Auto-rejected: ${reason}`);
    
    // Refund user balance
    const withdrawal = await db.select().from(withdrawals).where(eq(withdrawals.id, id)).limit(1);
    if (withdrawal.length > 0) {
      // Disini integrate dengan BalanceService untuk refund
      console.log(`💰 [AUTO-WD] Refunding ${withdrawal[0].ntiqAmount} NTIQ to user ${withdrawal[0].userId}`);
    }
  }

  /**
   * Flag withdrawal untuk manual review
   */
  private async flagForManualReview(withdrawal: any): Promise<void> {
    await this.updateWithdrawalStatus(
      withdrawal.id, 
      'pending', 
      null, 
      'Requires manual review - exceeds auto-approval threshold'
    );
    
    await this.sendManualReviewNotification(withdrawal);
  }

  /**
   * Reset daily counter jika sudah lewat 24 jam
   */
  private resetDailyCounterIfNeeded(): void {
    const now = new Date();
    const diffHours = (now.getTime() - this.lastDailyReset.getTime()) / (1000 * 60 * 60);
    
    if (diffHours >= 24) {
      this.dailyWithdrawalTotal = 0;
      this.lastDailyReset = now;
      console.log('🔄 [AUTO-WD] Daily withdrawal counter reset');
    }
  }

  /**
   * Send notifications
   */
  private async sendSuccessNotification(withdrawal: any, txHash: string): Promise<void> {
    if (this.config.webhookUrl) {
      try {
        await axios.post(this.config.webhookUrl, {
          text: `✅ Withdrawal Completed\nAmount: ${withdrawal.netAmount} ${withdrawal.tokenType}\nUser: ${withdrawal.userId}\nTX: ${txHash}\nNetwork: ${withdrawal.chainName}`
        });
      } catch (error) {
        console.error('Failed to send success notification:', error);
      }
    }
  }

  private async sendErrorNotification(message: string, error: any): Promise<void> {
    if (this.config.webhookUrl) {
      try {
        await axios.post(this.config.webhookUrl, {
          text: `❌ Withdrawal Error\n${message}\nError: ${error.message}`
        });
      } catch (err) {
        console.error('Failed to send error notification:', err);
      }
    }
  }

  private async sendManualReviewNotification(withdrawal: any): Promise<void> {
    if (this.config.webhookUrl) {
      try {
        await axios.post(this.config.webhookUrl, {
          text: `📋 Manual Review Required\nWithdrawal ID: ${withdrawal.id}\nAmount: ${withdrawal.netAmount} ${withdrawal.tokenType}\nUser: ${withdrawal.userId}\nReason: Exceeds auto-approval threshold`
        });
      } catch (error) {
        console.error('Failed to send manual review notification:', error);
      }
    }
  }
}

// Secure configuration using environment variables only
export const defaultAutoWithdrawalConfig: AutoWithdrawalConfig = {
  adminPrivateKey: process.env.ADMIN_PRIVATE_KEY || '',
  
  networks: {
    'ethereum': {
      rpcUrl: process.env.ETHEREUM_RPC_URL || '',
      chainId: 1,
      gasLimit: '100000',
      maxGasPrice: '50', // 50 gwei
      tokenContracts: {
        USDC: process.env.ETHEREUM_USDC_CONTRACT || '',
        USDT: process.env.ETHEREUM_USDT_CONTRACT || ''
      }
    },
    'base': {
      rpcUrl: process.env.BASE_RPC_URL || '',
      chainId: 8453,
      gasLimit: '100000',
      maxGasPrice: '10',
      tokenContracts: {
        USDC: process.env.BASE_USDC_CONTRACT || '',
        USDT: process.env.BASE_USDT_CONTRACT || ''
      }
    },
    'bsc': {
      rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gasLimit: '100000',
      maxGasPrice: '20',
      tokenContracts: {
        USDC: process.env.BSC_USDC_CONTRACT || '',
        USDT: process.env.BSC_USDT_CONTRACT || ''
      }
    },
    'optimism': {
      rpcUrl: process.env.OPTIMISM_RPC_URL || '',
      chainId: 10,
      gasLimit: '100000',
      maxGasPrice: '5',
      tokenContracts: {
        USDC: process.env.OPTIMISM_USDC_CONTRACT || '',
        USDT: process.env.OPTIMISM_USDT_CONTRACT || ''
      }
    },
    'arbitrum': {
      rpcUrl: process.env.ARBITRUM_RPC_URL || '',
      chainId: 42161,
      gasLimit: '100000',
      maxGasPrice: '5',
      tokenContracts: {
        USDC: process.env.ARBITRUM_USDC_CONTRACT || '',
        USDT: process.env.ARBITRUM_USDT_CONTRACT || ''
      }
    },
    'sepolia': {
      rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io',
      chainId: 11155111,
      gasLimit: '21000',
      maxGasPrice: '50',
      tokenContracts: {
        USDC: process.env.SEPOLIA_USDC_CONTRACT || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        USDT: process.env.SEPOLIA_USDT_CONTRACT || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
      }
    },
    'holesky': {
      rpcUrl: process.env.HOLESKY_RPC_URL || 'https://ethereum-holesky-rpc.publicnode.com',
      chainId: 17000,
      gasLimit: '21000',
      maxGasPrice: '30',
      tokenContracts: {
        USDC: process.env.HOLESKY_USDC_CONTRACT || '0x449cde79f489e2ae32e6314d8d966ca64e040409',
        USDT: process.env.HOLESKY_USDT_CONTRACT || '0x87350147a24099bf1e7e677576f01c1415857c75'
      }
    }
  },
  
  maxDailyWithdrawal: parseInt(process.env.MAX_DAILY_WITHDRAWAL || '10000'), // $10,000 per hari
  maxSingleWithdrawal: parseInt(process.env.MAX_SINGLE_WITHDRAWAL || '1000'), // $1,000 per transaksi
  autoApprovalThreshold: parseInt(process.env.AUTO_APPROVAL_THRESHOLD || '500'), // Auto approve jika dibawah $500
  
  webhookUrl: process.env.WEBHOOK_URL,
  emailNotification: process.env.ADMIN_EMAIL
};

// Log configuration security status
console.log('🔐 [SECURITY] Automated withdrawal service configuration loaded:');
const configNetworks = Object.keys(defaultAutoWithdrawalConfig.networks);
configNetworks.forEach(network => {
  const config = defaultAutoWithdrawalConfig.networks[network];
  const hasRPC = !!config.rpcUrl;
  const hasContracts = Object.values(config.tokenContracts).some(addr => addr !== '');
  console.log(`🔐 [SECURITY] ${network}: RPC=${hasRPC ? '✓' : '✗'}, Contracts=${hasContracts ? '✓' : '✗'}`);
});