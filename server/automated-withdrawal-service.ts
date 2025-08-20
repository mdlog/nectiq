import { ethers } from 'ethers';
import axios from 'axios';
import { db } from './db.js';
import { withdrawals, users } from '../shared/schema.js';
import { eq, and, isNotNull } from 'drizzle-orm';
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
   * Main function untuk memproses semua pending withdrawals dengan enhanced monitoring
   */
  async processAllPendingWithdrawals(): Promise<void> {
    try {
      console.log('🔄 [AUTO-WD] Starting automated withdrawal processing...');
      
      // PREVENTION: Check for suspicious withdrawals (rejected but with transaction hash)
      await this.checkForSuspiciousWithdrawals();
      
      // Check processing withdrawals for blockchain confirmation
      await this.checkProcessingWithdrawals();
      
      // Reset daily counter jika sudah lewat 24 jam
      this.resetDailyCounterIfNeeded();
      
      // Ambil semua pending withdrawals
      const pendingWithdrawals = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.status, 'pending'))
        .orderBy(withdrawals.createdAt);

      console.log(`📝 [AUTO-WD] Found ${pendingWithdrawals.length} pending withdrawals`);
      
      // Debug: Log withdrawal details if any found
      if (pendingWithdrawals.length > 0) {
        console.log('🔍 [AUTO-WD] Pending withdrawal details:');
        pendingWithdrawals.forEach(w => {
          console.log(`   - ID: ${w.id}, User: ${w.userId}, Amount: ${w.ntiqAmount} NTIQ, Network: ${w.chainName}, Status: ${w.status}`);
        });
      }

      for (const withdrawal of pendingWithdrawals) {
        // PREVENTION: Pre-flight validation before processing
        const isValid = await this.preFlightValidation(withdrawal);
        if (!isValid) {
          console.log(`⚠️ [AUTO-WD] Pre-flight validation failed for withdrawal ${withdrawal.id}`);
          continue;
        }
        
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
   * Public method untuk monitoring processing withdrawals (untuk dipanggil dari server index)
   */
  async monitorProcessingWithdrawals(): Promise<void> {
    try {
      console.log('🔍 [PROCESSING-MONITOR] Starting processing withdrawal monitoring...');
      await this.checkProcessingWithdrawals();
      console.log('✅ [PROCESSING-MONITOR] Processing withdrawal monitoring completed');
    } catch (error) {
      console.error('❌ [PROCESSING-MONITOR] Error monitoring processing withdrawals:', error);
    }
  }

  /**
   * Check processing withdrawals untuk konfirmasi blockchain otomatis
   */
  private async checkProcessingWithdrawals(): Promise<void> {
    try {
      console.log('🔍 [WITHDRAWAL-MONITOR] Checking processing withdrawals for blockchain confirmation...');
      
      // Ambil semua withdrawal dengan status 'processing' yang memiliki transaction hash
      const processingWithdrawals = await db
        .select()
        .from(withdrawals)
        .where(and(
          eq(withdrawals.status, 'processing'),
          isNotNull(withdrawals.transactionHash)
        ));

      if (processingWithdrawals.length === 0) {
        console.log('✅ [WITHDRAWAL-MONITOR] No processing withdrawals found');
        return;
      }

      console.log(`🔍 [WITHDRAWAL-MONITOR] Found ${processingWithdrawals.length} processing withdrawals to check`);

      for (const withdrawal of processingWithdrawals) {
        await this.verifyBlockchainTransaction(withdrawal);
        
        // Small delay between checks
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error('❌ [WITHDRAWAL-MONITOR] Error checking processing withdrawals:', error);
    }
  }

  /**
   * Verify transaction pada blockchain dan update status jika confirmed
   */
  private async verifyBlockchainTransaction(withdrawal: any): Promise<void> {
    try {
      const transactionHash = withdrawal.transactionHash;
      if (!transactionHash || !transactionHash.startsWith('0x')) {
        console.log(`⚠️ [WITHDRAWAL-MONITOR] Invalid transaction hash for withdrawal ${withdrawal.id}: ${transactionHash}`);
        return;
      }

      // Get network configuration
      const networkConfig = this.config.networks[withdrawal.chainName];
      if (!networkConfig) {
        console.log(`❌ [WITHDRAWAL-MONITOR] Unsupported network: ${withdrawal.chainName}`);
        return;
      }

      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      
      // Check transaction receipt
      const receipt = await provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        // Transaction not yet mined, keep waiting
        console.log(`⏳ [WITHDRAWAL-MONITOR] Transaction ${transactionHash} not yet mined`);
        return;
      }

      if (receipt.status === 1) {
        // Transaction successful - update to completed
        await db
          .update(withdrawals)
          .set({
            status: 'completed',
            adminNote: 'Automatically verified on blockchain - transaction confirmed',
            processedAt: new Date()
          })
          .where(eq(withdrawals.id, withdrawal.id));

        console.log(`✅ [WITHDRAWAL-MONITOR] Withdrawal ${withdrawal.id} automatically marked as completed - TX: ${transactionHash}`);
        
        // Send success notification
        await this.sendSuccessNotification(withdrawal, transactionHash);
        
      } else if (receipt.status === 0) {
        // Transaction failed - update to failed
        await db
          .update(withdrawals)
          .set({
            status: 'failed',
            adminNote: `Transaction failed on blockchain - TX: ${transactionHash}`,
            processedAt: new Date()
          })
          .where(eq(withdrawals.id, withdrawal.id));

        console.log(`❌ [WITHDRAWAL-MONITOR] Withdrawal ${withdrawal.id} marked as failed - TX failed: ${transactionHash}`);
        
        // Send failure notification
        await this.sendFailureNotification(withdrawal, transactionHash);
      }

    } catch (error) {
      if (error.message && error.message.includes('could not detect network')) {
        console.log(`⚠️ [WITHDRAWAL-MONITOR] Network detection failed for withdrawal ${withdrawal.id} - keeping processing status`);
      } else {
        console.error(`❌ [WITHDRAWAL-MONITOR] Error verifying transaction for withdrawal ${withdrawal.id}:`, error);
      }
    }
  }

  /**
   * Send success notification when withdrawal is automatically completed
   */
  private async sendSuccessNotification(withdrawal: any, transactionHash: string): Promise<void> {
    try {
      // Add to notification log or send webhook if configured
      console.log(`🎉 [AUTO-COMPLETE] Withdrawal ${withdrawal.id} for user ${withdrawal.userId} completed automatically`);
      console.log(`💰 Amount: ${withdrawal.ntiqAmount} NTIQ (${withdrawal.usdAmount} USD)`);
      console.log(`🔗 TX Hash: ${transactionHash}`);
      
      // Here you could add webhook notification to Discord/Slack if needed
    } catch (error) {
      console.error('Error sending success notification:', error);
    }
  }

  /**
   * Send failure notification when withdrawal fails on blockchain
   */
  private async sendFailureNotification(withdrawal: any, transactionHash: string): Promise<void> {
    try {
      console.log(`🚨 [AUTO-FAILED] Withdrawal ${withdrawal.id} for user ${withdrawal.userId} failed on blockchain`);
      console.log(`💰 Amount: ${withdrawal.ntiqAmount} NTIQ (${withdrawal.usdAmount} USD)`);
      console.log(`❌ Failed TX: ${transactionHash}`);
      
      // Here you could add webhook notification for failed transactions
    } catch (error) {
      console.error('Error sending failure notification:', error);
    }
  }

  /**
   * PREVENTION: Check for suspicious withdrawals (rejected but with transaction hash)
   */
  private async checkForSuspiciousWithdrawals(): Promise<void> {
    try {
      const suspiciousWithdrawals = await db
        .select()
        .from(withdrawals)
        .where(and(
          eq(withdrawals.status, 'rejected'),
          isNotNull(withdrawals.transactionHash)
        ));

      if (suspiciousWithdrawals.length > 0) {
        const criticalMessage = `🚨 FINANCIAL INTEGRITY BREACH DETECTED!
Found ${suspiciousWithdrawals.length} withdrawals marked as 'rejected' but with transaction hashes:
${suspiciousWithdrawals.map(w => `ID: ${w.id}, TX: ${w.transactionHash}`).join('\n')}
IMMEDIATE MANUAL REVIEW REQUIRED!`;

        console.error(criticalMessage);
        await this.sendCriticalErrorNotification({ id: 'SYSTEM_CHECK' }, 'MULTIPLE', { message: criticalMessage });
      }
    } catch (error) {
      console.error('❌ [AUTO-WD] Error checking for suspicious withdrawals:', error);
    }
  }

  /**
   * PREVENTION: Pre-flight validation before withdrawal execution
   */
  private async preFlightValidation(withdrawal: any): Promise<boolean> {
    try {
      // 1. Check user balance sufficiency
      const user = await db.select().from(users).where(eq(users.id, withdrawal.userId)).limit(1);
      if (!user.length || user[0].balance < withdrawal.ntiqAmount) {
        console.log(`❌ [AUTO-WD] Insufficient balance for withdrawal ${withdrawal.id}`);
        return false;
      }

      // 2. Check network connectivity
      const networkConfig = this.config.networks[withdrawal.chainName];
      if (!networkConfig) {
        console.log(`❌ [AUTO-WD] Unsupported network: ${withdrawal.chainName}`);
        return false;
      }

      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      try {
        await provider.getBlockNumber();
      } catch (error) {
        console.log(`❌ [AUTO-WD] Network connectivity failed for ${withdrawal.chainName}`);
        return false;
      }

      // 3. Check admin wallet balance
      const signer = new ethers.Wallet(this.config.adminPrivateKey, provider);
      const adminBalance = await provider.getBalance(signer.address);
      const requiredAmount = ethers.parseEther(withdrawal.netAmount.toString());
      
      if (adminBalance < requiredAmount) {
        console.log(`❌ [AUTO-WD] Insufficient admin wallet balance for withdrawal ${withdrawal.id}`);
        return false;
      }

      console.log(`✅ [AUTO-WD] Pre-flight validation passed for withdrawal ${withdrawal.id}`);
      return true;
      
    } catch (error) {
      console.error(`❌ [AUTO-WD] Pre-flight validation error for withdrawal ${withdrawal.id}:`, error);
      return false;
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
        await this.rejectWithdrawal(withdrawal.id, validationResult.reason || 'Validation failed');
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.rejectWithdrawal(withdrawal.id, `Processing error: ${errorMessage}`);
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
    let txHash: string | null = null;
    let transactionSent = false;
    
    try {
      // Update status ke processing
      await this.updateWithdrawalStatus(withdrawal.id, 'processing');
      
      // Setup provider dan signer
      const networkConfig = this.config.networks[withdrawal.chainName];
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      const signer = new ethers.Wallet(this.config.adminPrivateKey, provider);
      
      if (withdrawal.tokenType === 'ETH') {
        // ETH Transfer
        txHash = await this.sendETH(signer, withdrawal, networkConfig);
      } else {
        // ERC-20 Token Transfer (USDC/USDT)
        txHash = await this.sendERC20Token(signer, withdrawal, networkConfig);
      }
      
      // CRITICAL: Mark transaction as sent to prevent double rejection
      transactionSent = true;
      console.log(`🚀 [AUTO-WD] Blockchain transaction sent successfully: ${txHash}`);
      
      // Update dengan transaction hash IMMEDIATELY after sending
      await this.updateWithdrawalStatus(withdrawal.id, 'completed', txHash);
      this.dailyWithdrawalTotal += parseFloat(withdrawal.usdAmount);
      
      // CRITICAL: Deduct user balance after successful withdrawal
      await this.deductUserBalance(withdrawal);
      
      console.log(`✅ [AUTO-WD] Withdrawal ${withdrawal.id} completed with TX: ${txHash}`);
      
      // Send success notification
      await this.sendSuccessNotification(withdrawal, txHash);
      
    } catch (error) {
      console.error(`❌ [AUTO-WD] Failed to execute withdrawal ${withdrawal.id}:`, error);
      
      // CRITICAL FIX: Only reject if transaction was NOT sent to blockchain
      if (!transactionSent) {
        console.log(`🔄 [AUTO-WD] Transaction not sent to blockchain, safe to reject withdrawal ${withdrawal.id}`);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.updateWithdrawalStatus(withdrawal.id, 'rejected', undefined, errorMessage);
        // Refund balance since no blockchain transaction occurred
        await this.refundWithdrawalBalance(withdrawal);
      } else {
        console.error(`🚨 [AUTO-WD] CRITICAL: Transaction sent but post-processing failed for withdrawal ${withdrawal.id}!`);
        console.error(`🚨 [AUTO-WD] Transaction Hash: ${txHash} - Manual intervention required!`);
        // Transaction already sent to blockchain, mark as completed with error note
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.updateWithdrawalStatus(withdrawal.id, 'completed', txHash || undefined, `Post-processing error: ${errorMessage}`);
        
        // Still try to deduct balance to maintain financial integrity
        try {
          await this.deductUserBalance(withdrawal);
          console.log(`✅ [AUTO-WD] Balance deducted despite post-processing error`);
        } catch (balanceError) {
          console.error(`🚨 [AUTO-WD] FAILED TO DEDUCT BALANCE - MANUAL CORRECTION NEEDED!`, balanceError);
          await this.sendCriticalErrorNotification(withdrawal, txHash || '', balanceError);
        }
      }
      
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
      const { BalanceService } = await import('./services/balanceService.js');
      
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
   * Reject withdrawal dengan alasan (hanya untuk withdrawal yang belum dikirim ke blockchain)
   */
  private async rejectWithdrawal(id: number, reason: string): Promise<void> {
    await this.updateWithdrawalStatus(id, 'rejected', undefined, `Auto-rejected: ${reason}`);
    
    // Refund user balance menggunakan BalanceService
    await this.refundWithdrawalBalance({ id, userId: null, ntiqAmount: null });
  }

  /**
   * Refund withdrawal balance (helper method)
   */
  private async refundWithdrawalBalance(withdrawal: any): Promise<void> {
    const withdrawalData = withdrawal.userId ? 
      [withdrawal] : 
      await db.select().from(withdrawals).where(eq(withdrawals.id, withdrawal.id)).limit(1);
    
    if (withdrawalData.length > 0) {
      try {
        const { BalanceService } = await import('./services/balanceService.js');
        
        await BalanceService.processTransaction({
          userId: withdrawalData[0].userId,
          type: 'withdrawal_refund',
          amount: withdrawalData[0].ntiqAmount,
          description: `Withdrawal refund - Processing error prevented blockchain transaction`,
          relatedId: withdrawalData[0].id
        }, this.storage);
        
        console.log(`💰 [AUTO-WD] Refunded ${withdrawalData[0].ntiqAmount} NTIQ to user ${withdrawalData[0].userId}`);
      } catch (error) {
        console.error(`❌ [AUTO-WD] Failed to refund balance for withdrawal ${withdrawal.id}:`, error);
      }
    }
  }

  /**
   * Flag withdrawal untuk manual review
   */
  private async flagForManualReview(withdrawal: any): Promise<void> {
    await this.updateWithdrawalStatus(
      withdrawal.id, 
      'pending', 
      undefined, 
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

  /**
   * Send critical error notification for blockchain/balance mismatch
   */
  private async sendCriticalErrorNotification(withdrawal: any, txHash: string, error: any): Promise<void> {
    const criticalMessage = `🚨 CRITICAL FINANCIAL ERROR 🚨
Withdrawal ID: ${withdrawal.id}
User ID: ${withdrawal.userId}
Amount: ${withdrawal.ntiqAmount} NTIQ
Blockchain TX: ${txHash}
Problem: Transaction sent to blockchain but balance deduction failed!
Manual correction required IMMEDIATELY!`;
    
    console.error(criticalMessage, error);
    
    if (this.config.webhookUrl) {
      try {
        await axios.post(this.config.webhookUrl, {
          text: criticalMessage
        });
      } catch (notifError) {
        console.error('Failed to send critical error notification:', notifError);
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