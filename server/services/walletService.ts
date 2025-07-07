import { db } from '../db';
import { userWallets, chainBalances, depositTransactions, withdrawalRequests, supportedChains, supportedTokens, inAppCredits } from '@shared/wallet-schema';
import { eq, and, desc, sum } from 'drizzle-orm';
import { ethers } from 'ethers';
import axios from 'axios';

export class MultiChainWalletService {
  // Registrasi wallet baru untuk user
  static async registerWallet(userId: number, walletData: {
    walletType: string;
    chainType: string;
    walletAddress: string;
    publicKey?: string;
  }) {
    try {
      // Validasi format address sesuai chain
      if (!this.validateAddress(walletData.walletAddress, walletData.chainType)) {
        throw new Error(`Invalid address format for ${walletData.chainType}`);
      }

      // Cek apakah wallet sudah terdaftar
      const existingWallet = await db.select()
        .from(userWallets)
        .where(
          and(
            eq(userWallets.walletAddress, walletData.walletAddress.toLowerCase()),
            eq(userWallets.chainType, walletData.chainType)
          )
        )
        .limit(1);

      if (existingWallet.length > 0) {
        throw new Error('Wallet already registered');
      }

      // Insert wallet baru
      const [newWallet] = await db.insert(userWallets).values({
        userId,
        walletType: walletData.walletType,
        chainType: walletData.chainType,
        walletAddress: walletData.walletAddress.toLowerCase(),
        publicKey: walletData.publicKey,
        isActive: true,
        isVerified: false
      }).returning();

      // Inisialisasi saldo 0 untuk semua token yang didukung di chain ini
      await this.initializeChainBalances(userId, newWallet.id, walletData.chainType);

      return newWallet;
    } catch (error) {
      console.error('Error registering wallet:', error);
      throw error;
    }
  }

  // Inisialisasi saldo chain untuk wallet baru
  static async initializeChainBalances(userId: number, walletId: number, chainType: string) {
    const supportedTokensForChain = await db.select()
      .from(supportedTokens)
      .where(
        and(
          eq(supportedTokens.chainId, chainType),
          eq(supportedTokens.isActive, true)
        )
      );

    const balanceEntries = supportedTokensForChain.map(token => ({
      userId,
      walletId,
      chainType,
      tokenSymbol: token.symbol,
      tokenAddress: token.contractAddress,
      balance: "0",
      usdValue: "0"
    }));

    if (balanceEntries.length > 0) {
      await db.insert(chainBalances).values(balanceEntries);
    }
  }

  // Validasi format address sesuai chain
  static validateAddress(address: string, chainType: string): boolean {
    try {
      switch (chainType) {
        case 'ethereum':
        case 'bsc':
        case 'polygon':
          return ethers.isAddress(address);
        case 'solana':
          // Solana address validation (basic check)
          return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  // Update saldo wallet dari blockchain
  static async updateWalletBalance(walletId: number, tokenSymbol: string, newBalance: string, usdValue: string) {
    await db.update(chainBalances)
      .set({
        balance: newBalance,
        usdValue: usdValue,
        lastUpdated: new Date()
      })
      .where(
        and(
          eq(chainBalances.walletId, walletId),
          eq(chainBalances.tokenSymbol, tokenSymbol)
        )
      );
  }

  // Proses deposit otomatis
  static async processDeposit(depositData: {
    userId: number;
    walletId: number;
    chainType: string;
    tokenSymbol: string;
    amount: string;
    transactionHash: string;
    fromAddress: string;
    toAddress: string;
    blockNumber?: number;
    gasUsed?: string;
    gasFee?: string;
  }) {
    try {
      // Insert deposit transaction
      const [deposit] = await db.insert(depositTransactions).values({
        userId: depositData.userId,
        walletId: depositData.walletId,
        chainType: depositData.chainType,
        tokenSymbol: depositData.tokenSymbol,
        amount: depositData.amount,
        transactionHash: depositData.transactionHash,
        fromAddress: depositData.fromAddress.toLowerCase(),
        toAddress: depositData.toAddress.toLowerCase(),
        status: 'pending',
        blockNumber: depositData.blockNumber,
        gasUsed: depositData.gasUsed,
        gasFee: depositData.gasFee,
        confirmations: 0
      }).returning();

      // Update status menjadi confirmed dan tambah ke saldo
      await this.confirmDeposit(deposit.id);

      return deposit;
    } catch (error) {
      console.error('Error processing deposit:', error);
      throw error;
    }
  }

  // Konfirmasi deposit dan update saldo
  static async confirmDeposit(depositId: number) {
    const [deposit] = await db.select()
      .from(depositTransactions)
      .where(eq(depositTransactions.id, depositId));

    if (!deposit) {
      throw new Error('Deposit not found');
    }

    // Update status deposit
    await db.update(depositTransactions)
      .set({
        status: 'confirmed',
        confirmedAt: new Date()
      })
      .where(eq(depositTransactions.id, depositId));

    // Update saldo chain
    const currentBalance = await db.select()
      .from(chainBalances)
      .where(
        and(
          eq(chainBalances.walletId, deposit.walletId),
          eq(chainBalances.tokenSymbol, deposit.tokenSymbol)
        )
      )
      .limit(1);

    if (currentBalance.length > 0) {
      const newBalance = (parseFloat(currentBalance[0].balance) + parseFloat(deposit.amount)).toString();
      await this.updateWalletBalance(deposit.walletId, deposit.tokenSymbol, newBalance, "0");
    }

    // Convert ke in-app credit jika diperlukan
    await this.convertToInAppCredit(deposit.userId, deposit.amount, deposit.tokenSymbol, 'deposit', deposit.id);
  }

  // Convert deposit ke in-app credit (NTIQ)
  static async convertToInAppCredit(userId: number, amount: string, fromToken: string, sourceType: string, sourceId: number) {
    // Conversion rate (contoh: 1 ETH = 1000 NTIQ)
    const conversionRates: { [key: string]: number } = {
      'ETH': 1000,
      'BNB': 300,
      'SOL': 50,
      'MATIC': 1,
      'USDT': 1,
      'USDC': 1
    };

    const rate = conversionRates[fromToken] || 1;
    const ntiqAmount = (parseFloat(amount) * rate).toString();

    await db.insert(inAppCredits).values({
      userId,
      creditType: 'NTIQ',
      amount: ntiqAmount,
      sourceType,
      sourceId,
      description: `Converted from ${amount} ${fromToken}`,
      metadata: {
        originalToken: fromToken,
        originalAmount: amount,
        conversionRate: rate
      }
    });
  }

  // Proses withdrawal request
  static async createWithdrawalRequest(userId: number, withdrawalData: {
    walletId: number;
    chainType: string;
    tokenSymbol: string;
    amount: string;
    toAddress: string;
  }) {
    try {
      // Validasi saldo
      const balance = await db.select()
        .from(chainBalances)
        .where(
          and(
            eq(chainBalances.walletId, withdrawalData.walletId),
            eq(chainBalances.tokenSymbol, withdrawalData.tokenSymbol)
          )
        )
        .limit(1);

      if (balance.length === 0 || parseFloat(balance[0].balance) < parseFloat(withdrawalData.amount)) {
        throw new Error('Insufficient balance');
      }

      // Estimate gas fee
      const gasEstimate = await this.estimateWithdrawalGas(withdrawalData.chainType, withdrawalData.tokenSymbol);

      // Insert withdrawal request
      const [withdrawal] = await db.insert(withdrawalRequests).values({
        userId,
        walletId: withdrawalData.walletId,
        chainType: withdrawalData.chainType,
        tokenSymbol: withdrawalData.tokenSymbol,
        amount: withdrawalData.amount,
        toAddress: withdrawalData.toAddress.toLowerCase(),
        status: 'pending',
        gasEstimate: gasEstimate.toString(),
        processingFee: "0",
        netAmount: withdrawalData.amount
      }).returning();

      return withdrawal;
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      throw error;
    }
  }

  // Estimate gas untuk withdrawal
  static async estimateWithdrawalGas(chainType: string, tokenSymbol: string): Promise<number> {
    // Simplified gas estimation
    const gasEstimates: { [key: string]: { [key: string]: number } } = {
      'ethereum': { 'ETH': 21000, 'USDT': 65000, 'USDC': 65000 },
      'bsc': { 'BNB': 21000, 'USDT': 65000, 'USDC': 65000 },
      'polygon': { 'MATIC': 21000, 'USDT': 65000, 'USDC': 65000 },
      'solana': { 'SOL': 5000 }
    };

    return gasEstimates[chainType]?.[tokenSymbol] || 21000;
  }

  // Get wallet summary untuk user
  static async getWalletSummary(userId: number) {
    // Get semua wallet user
    const wallets = await db.select()
      .from(userWallets)
      .where(eq(userWallets.userId, userId));

    // Get total balances per chain
    const balances = await db.select()
      .from(chainBalances)
      .where(eq(chainBalances.userId, userId));

    // Get recent transactions
    const recentDeposits = await db.select()
      .from(depositTransactions)
      .where(eq(depositTransactions.userId, userId))
      .orderBy(desc(depositTransactions.createdAt))
      .limit(10);

    const recentWithdrawals = await db.select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.createdAt))
      .limit(10);

    // Get in-app credits
    const credits = await db.select()
      .from(inAppCredits)
      .where(eq(inAppCredits.userId, userId));

    return {
      wallets,
      balances,
      recentDeposits,
      recentWithdrawals,
      credits,
      totalUsdValue: balances.reduce((sum, balance) => sum + parseFloat(balance.usdValue), 0)
    };
  }

  // Setup initial supported chains dan tokens
  static async setupInitialChains() {
    const chains = [
      {
        chainId: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        blockExplorerUrl: 'https://etherscan.io',
        isTestnet: false,
        minConfirmations: 12,
        avgBlockTime: 15
      },
      {
        chainId: 'bsc',
        name: 'Binance Smart Chain',
        symbol: 'BNB',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        blockExplorerUrl: 'https://bscscan.com',
        isTestnet: false,
        minConfirmations: 3,
        avgBlockTime: 3
      },
      {
        chainId: 'polygon',
        name: 'Polygon',
        symbol: 'MATIC',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorerUrl: 'https://polygonscan.com',
        isTestnet: false,
        minConfirmations: 20,
        avgBlockTime: 2
      },
      {
        chainId: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        rpcUrl: 'https://api.mainnet-beta.solana.com',
        blockExplorerUrl: 'https://solscan.io',
        isTestnet: false,
        minConfirmations: 1,
        avgBlockTime: 0.5
      }
    ];

    const tokens = [
      // Ethereum tokens
      { chainId: 'ethereum', contractAddress: null, symbol: 'ETH', name: 'Ethereum', decimals: 18, isNative: true },
      { chainId: 'ethereum', contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6, isNative: false },
      { chainId: 'ethereum', contractAddress: '0xA0b86a33E6824c5341AA8a30FC8D33Da6e4a13Dc', symbol: 'USDC', name: 'USD Coin', decimals: 6, isNative: false },
      
      // BSC tokens
      { chainId: 'bsc', contractAddress: null, symbol: 'BNB', name: 'BNB', decimals: 18, isNative: true },
      { chainId: 'bsc', contractAddress: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether USD', decimals: 18, isNative: false },
      
      // Polygon tokens
      { chainId: 'polygon', contractAddress: null, symbol: 'MATIC', name: 'Polygon', decimals: 18, isNative: true },
      
      // Solana tokens
      { chainId: 'solana', contractAddress: null, symbol: 'SOL', name: 'Solana', decimals: 9, isNative: true }
    ];

    try {
      await db.insert(supportedChains).values(chains).onConflictDoNothing();
      await db.insert(supportedTokens).values(tokens).onConflictDoNothing();
      console.log('✅ Initial chains and tokens setup completed');
    } catch (error) {
      console.error('Error setting up initial chains:', error);
    }
  }
}