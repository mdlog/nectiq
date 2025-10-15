import { ethers } from 'ethers';
import { storage } from '../storage';
import { logger } from '../../shared/logger';
import { cryptoService } from './cryptoService';
import { BalanceService } from './balanceService';

const MULTI_TOKEN_VAULT_ABI = [
    // Events
    "event Deposit(address indexed user, address indexed token, uint256 amount, uint256 timestamp, uint256 newBalance)",
    "event Withdrawal(address indexed user, address indexed token, uint256 amount, uint256 timestamp, uint256 newBalance, uint256 nonce)",

    // View functions
    "function getUserBalance(address user, address token) external view returns (uint256)",
    "function getUserBalances(address user) external view returns (uint256 pol, uint256 weth, uint256 usdc, uint256 link)",
    "function isTokenSupported(address token) external view returns (bool)",
    "function WETH() external view returns (address)",
    "function USDC() external view returns (address)",
    "function LINK() external view returns (address)",
    "function NATIVE_TOKEN() external view returns (address)"
];

// Token address constants (Polygon Amoy)
const TOKEN_ADDRESSES = {
    'WETH': '0x52eF3d68BaB452a294342DC3e5f464d7f610f72E',
    'USDC': '0x8B0180f2101c8260d49339abfEe87927412494B4',
    'LINK': '0x0Fd9e8d3aF1aaee056EB9e902c3A762a667b1904',
    'POL': '0x0000000000000000000000000000000000000000'
};

// Token symbol mapping
const TOKEN_SYMBOLS: Record<string, string> = {
    '0x0000000000000000000000000000000000000000': 'POL', // Native token
    '0x52ef3d68bab452a294342dc3e5f464d7f610f72e': 'WETH',
    '0x8b0180f2101c8260d49339abfee87927412494b4': 'USDC',
    '0x0fd9e8d3af1aaee056eb9e902c3a762a667b1904': 'LINK'
};

// Token decimals
const TOKEN_DECIMALS: Record<string, number> = {
    'POL': 18,
    'WETH': 18,
    'USDC': 6,
    'LINK': 18
};

// NTIQ token price in USD
const NTIQ_PRICE_USD = 0.01; // 1 NTIQ = $0.01

// CoinGecko ID mapping
const COINGECKO_IDS: Record<string, string> = {
    'POL': 'matic-network',
    'WETH': 'weth',
    'USDC': 'usd-coin',
    'LINK': 'chainlink'
};

/**
 * Fetch current token price in USD
 */
async function getTokenPriceUSD(tokenSymbol: string): Promise<number> {
    try {
        // USDC is always $1
        if (tokenSymbol === 'USDC') {
            return 1.0;
        }

        const coinId = COINGECKO_IDS[tokenSymbol];
        if (!coinId) {
            logger.warn(`🔷 [PRICE] Unknown token: ${tokenSymbol}`);
            return 0;
        }

        // Try to get price from cryptoService
        const crypto = await cryptoService.getCryptocurrencyBySymbol(tokenSymbol);
        if (crypto && crypto.currentPrice) {
            return crypto.currentPrice;
        }

        // Fallback to database or use static prices
        const fallbackPrices: Record<string, number> = {
            'POL': 0.50,
            'WETH': 2000,
            'LINK': 15
        };

        return fallbackPrices[tokenSymbol] || 0;
    } catch (error) {
        logger.error(`🔷 [PRICE] Failed to get price for ${tokenSymbol}:`, error);

        // Return fallback prices
        const fallbackPrices: Record<string, number> = {
            'POL': 0.50,
            'WETH': 2000,
            'USDC': 1.0,
            'LINK': 15
        };

        return fallbackPrices[tokenSymbol] || 0;
    }
}

/**
 * Calculate NTIQ amount based on token amount and current USD price
 * Formula: (token_amount * token_price_usd) / NTIQ_PRICE_USD
 */
function calculateNTIQAmount(tokenAmount: number, tokenPriceUSD: number): number {
    const usdValue = tokenAmount * tokenPriceUSD;
    const ntiqAmount = usdValue / NTIQ_PRICE_USD;
    return Math.floor(ntiqAmount); // Round down to nearest integer
}

/**
 * MultiTokenVaultEventListener
 * Monitors deposit and withdrawal events from MultiTokenVault contract
 * Supports POL, WETH, USDC, and LINK tokens
 */
class MultiTokenVaultEventListener {
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract;
    private isListening: boolean = false;

    constructor() {
        // Multiple RPC endpoints for fallback
        const AMOY_RPCS = [
            process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
            'https://polygon-amoy.drpc.org',
            'https://polygon-amoy.g.alchemy.com/v2/demo'
        ];
        const AMOY_RPC = AMOY_RPCS[0];
        const VAULT_ADDRESS = process.env.MULTI_TOKEN_VAULT_ADDRESS;

        if (!VAULT_ADDRESS) {
            throw new Error('MULTI_TOKEN_VAULT_ADDRESS not found in environment variables');
        }

        logger.info('🔷 [MULTI-TOKEN-VAULT] Initializing MultiTokenVaultEventListener');
        logger.info(`   Contract: ${VAULT_ADDRESS}`);
        logger.info(`   Network: Polygon Amoy (Chain ID: 80002)`);
        logger.info(`   RPC: ${AMOY_RPC}`);

        // Configure provider with longer polling interval to reduce RPC errors
        this.provider = new ethers.JsonRpcProvider(AMOY_RPC, {
            name: 'polygon-amoy',
            chainId: 80002
        });

        // Set polling interval to 30 seconds to reduce RPC load
        this.provider.pollingInterval = 30000;

        this.contract = new ethers.Contract(VAULT_ADDRESS, MULTI_TOKEN_VAULT_ABI, this.provider);

        // Add comprehensive error handler for provider with auto-recovery
        this.provider.on('error', (error: any) => {
            const errorMsg = error?.message || error?.error?.message || error?.shortMessage || '';
            // Handle "filter not found" and coalesce errors with auto-recovery
            if (errorMsg.includes('filter not found') ||
                errorMsg.includes('could not coalesce error') ||
                errorMsg.includes('eth_getFilterChanges')) {
                // Silently ignore - this is normal RPC behavior
                return;
            }
            logger.error('🔷 [MULTI-TOKEN-VAULT] Provider error:', error);
        });
    }

    /**
     * Start listening to vault events
     */
    public async start(): Promise<void> {
        if (this.isListening) {
            logger.warn('🔷 [MULTI-TOKEN-VAULT] Already listening');
            return;
        }

        try {
            // Verify contract is deployed
            const code = await this.provider.getCode(this.contract.target as string);
            if (code === '0x') {
                throw new Error('Contract not deployed at specified address');
            }

            logger.info('🔷 [MULTI-TOKEN-VAULT] Contract verified ✅');
            logger.info('🔷 [MULTI-TOKEN-VAULT] Supported tokens: POL, WETH, USDC, LINK');

            // Listen for Deposit events
            this.contract.on('Deposit', async (user, token, amount, timestamp, newBalance, event) => {
                try {
                    await this.processDeposit(user, token, amount, timestamp, newBalance, event);
                } catch (error) {
                    logger.error('🔷 [MULTI-TOKEN-VAULT] Error processing deposit:', error);
                }
            });

            // Listen for Withdrawal events
            this.contract.on('Withdrawal', async (user, token, amount, timestamp, newBalance, nonce, event) => {
                try {
                    await this.processWithdrawal(user, token, amount, timestamp, newBalance, nonce, event);
                } catch (error) {
                    logger.error('🔷 [MULTI-TOKEN-VAULT] Error processing withdrawal:', error);
                }
            });

            this.isListening = true;
            logger.info('🔷 [MULTI-TOKEN-VAULT] Event listener started successfully ✅');
            logger.info('🔷 [MULTI-TOKEN-VAULT] Monitoring for deposits and withdrawals...');
        } catch (error) {
            logger.error('🔷 [MULTI-TOKEN-VAULT] Failed to start event listener:', error);
            throw error;
        }
    }

    /**
     * Stop listening to vault events
     */
    public stop(): void {
        if (!this.isListening) {
            return;
        }

        this.contract.removeAllListeners('Deposit');
        this.contract.removeAllListeners('Withdrawal');
        this.isListening = false;

        logger.info('🔷 [MULTI-TOKEN-VAULT] Event listener stopped');
    }

    /**
     * Handle filter expired error and restart listener
     */
    private async handleFilterExpired(): Promise<void> {
        if (!this.isListening) {
            return;
        }

        logger.info('🔷 [MULTI-TOKEN-VAULT] ⚠️ Handling filter expired error...');

        try {
            // Stop current listeners
            this.stop();

            // Wait a bit before restarting
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Restart listeners
            await this.start();

            logger.info('🔷 [MULTI-TOKEN-VAULT] ✅ Event listener restarted successfully after filter expiration');
        } catch (error) {
            logger.error('🔷 [MULTI-TOKEN-VAULT] ❌ Failed to restart event listener:', error);

            // Retry after 10 seconds
            setTimeout(() => {
                logger.info('🔷 [MULTI-TOKEN-VAULT] 🔄 Retrying event listener restart...');
                this.handleFilterExpired();
            }, 10000);
        }
    }

    /**
     * Process a deposit event
     */
    private async processDeposit(
        user: string,
        tokenAddress: string,
        amount: bigint,
        timestamp: bigint,
        newBalance: bigint,
        event: any
    ): Promise<void> {
        const txHash = event.log.transactionHash;
        const blockNumber = event.log.blockNumber;

        // Normalize token address for lookup
        const normalizedToken = tokenAddress.toLowerCase();
        const tokenSymbol = TOKEN_SYMBOLS[normalizedToken] || 'UNKNOWN';
        const decimals = TOKEN_DECIMALS[tokenSymbol] || 18;

        // Convert amount from wei/smallest unit to human-readable format
        const amountInToken = Number(ethers.formatUnits(amount, decimals));

        // Fetch current token price in USD
        const tokenPriceUSD = await getTokenPriceUSD(tokenSymbol);
        const usdValue = amountInToken * tokenPriceUSD;

        // Calculate NTIQ amount based on USD value
        const amountInNTIQ = calculateNTIQAmount(amountInToken, tokenPriceUSD);

        logger.info(`🔷 [MULTI-TOKEN-VAULT] 💰 Deposit Detected!`);
        logger.info(`   User: ${user}`);
        logger.info(`   Token: ${tokenSymbol}`);
        logger.info(`   Amount: ${amountInToken} ${tokenSymbol}`);
        logger.info(`   Token Price: $${tokenPriceUSD.toFixed(6)}`);
        logger.info(`   USD Value: $${usdValue.toFixed(2)}`);
        logger.info(`   NTIQ Equivalent: ${amountInNTIQ} NTIQ`);
        logger.info(`   Calculation: $${usdValue.toFixed(2)} / $${NTIQ_PRICE_USD} = ${amountInNTIQ} NTIQ`);
        logger.info(`   TX Hash: ${txHash}`);
        logger.info(`   Block: ${blockNumber}`);

        try {
            // Find user in database
            const dbUser = await storage.getUserByWalletAddress(user);

            if (!dbUser) {
                logger.warn(`🔷 [MULTI-TOKEN-VAULT] User not found in database: ${user}`);
                return;
            }

            // Get token contract address from constants
            const tokenContractAddress = TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES] || tokenAddress;

            // CRITICAL FIX: Credit user balance using BalanceService
            await BalanceService.processTransaction({
                userId: dbUser.id,
                type: 'deposit_credit',
                amount: amountInNTIQ,
                token: 'NTIQ',
                hash: txHash,
                description: `Multi-token vault deposit - ${amountInToken} ${tokenSymbol}`,
                metadata: {
                    source: 'multi_token_vault_contract',
                    contractAddress: (this.contract.target as string).toLowerCase(),
                    tokenSymbol,
                    tokenAddress: tokenContractAddress.toLowerCase(),
                    amountInToken,
                    tokenPriceUSD,
                    usdValue,
                    conversionRate: NTIQ_PRICE_USD,
                    network: 'Polygon Amoy',
                    chainId: 80002
                }
            }, storage);

            // Create deposit record with correct field names matching schema
            await storage.createDeposit({
                userId: dbUser.id,
                fromWalletAddress: user.toLowerCase(),
                toWalletAddress: (this.contract.target as string).toLowerCase(),
                chainName: 'polygon-amoy',
                chainId: 80002, // Polygon Amoy chain ID
                tokenType: tokenSymbol,
                tokenAddress: tokenContractAddress.toLowerCase(),
                amountUSD: usdValue.toFixed(6),
                ntiqAmount: amountInNTIQ,
                transactionHash: txHash,
                blockNumber: blockNumber,
                status: 'confirmed',
                processedAt: new Date(), // Mark as processed since balance was credited
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry (already processed)
            });

            logger.info(`🔷 [MULTI-TOKEN-VAULT] ✅ Balance credited and deposit record created`);
            logger.info(`   User ID: ${dbUser.id}`);
            logger.info(`   NTIQ Balance Update: +${amountInNTIQ} NTIQ`);
            logger.info(`   Transaction Hash: ${txHash}`);
            logger.info(`   View on Polygonscan: https://amoy.polygonscan.com/tx/${txHash}`);

        } catch (error: any) {
            logger.error('🔷 [MULTI-TOKEN-VAULT] ❌ Failed to process deposit:', error);

            // Log more details for debugging
            if (error.message.includes('duplicate')) {
                logger.info(`🔷 [MULTI-TOKEN-VAULT] ⚠️ Duplicate deposit detected - already processed`);
            }
        }
    }

    /**
     * Process a withdrawal event
     */
    private async processWithdrawal(
        user: string,
        tokenAddress: string,
        amount: bigint,
        timestamp: bigint,
        newBalance: bigint,
        nonce: bigint,
        event: any
    ): Promise<void> {
        const txHash = event.log.transactionHash;
        const blockNumber = event.log.blockNumber;

        // Normalize token address for lookup
        const normalizedToken = tokenAddress.toLowerCase();
        const tokenSymbol = TOKEN_SYMBOLS[normalizedToken] || 'UNKNOWN';
        const decimals = TOKEN_DECIMALS[tokenSymbol] || 18;

        // Convert amount from wei/smallest unit to human-readable format
        const amountInToken = Number(ethers.formatUnits(amount, decimals));

        // Fetch current token price in USD
        const tokenPriceUSD = await getTokenPriceUSD(tokenSymbol);
        const usdValue = amountInToken * tokenPriceUSD;

        // Calculate NTIQ amount based on USD value
        const amountInNTIQ = calculateNTIQAmount(amountInToken, tokenPriceUSD);

        logger.info(`🔷 [MULTI-TOKEN-VAULT] 💸 Withdrawal Detected!`);
        logger.info(`   User: ${user}`);
        logger.info(`   Token: ${tokenSymbol}`);
        logger.info(`   Amount: ${amountInToken} ${tokenSymbol}`);
        logger.info(`   Token Price: $${tokenPriceUSD.toFixed(6)}`);
        logger.info(`   USD Value: $${usdValue.toFixed(2)}`);
        logger.info(`   NTIQ Deducted: ${amountInNTIQ} NTIQ`);
        logger.info(`   Calculation: $${usdValue.toFixed(2)} / $${NTIQ_PRICE_USD} = ${amountInNTIQ} NTIQ`);
        logger.info(`   TX Hash: ${txHash}`);
        logger.info(`   Block: ${blockNumber}`);
        logger.info(`   Nonce: ${nonce}`);

        try {
            // Find user in database
            const dbUser = await storage.getUserByWalletAddress(user);

            if (!dbUser) {
                logger.warn(`🔷 [MULTI-TOKEN-VAULT] User not found in database: ${user}`);
                return;
            }

            // Create withdrawal record with correct field names matching schema
            await storage.createWithdrawal({
                userId: dbUser.id,
                uniqueTransactionId: txHash.slice(-8), // Use last 8 chars of tx hash (max 8 chars)
                ntiqAmount: amountInNTIQ,
                usdAmount: usdValue.toFixed(6),
                feeAmount: '0', // No fee for smart contract withdrawals
                netAmount: usdValue.toFixed(6), // Net amount same as gross (no fee)
                chainName: 'polygon-amoy',
                tokenType: tokenSymbol,
                toWalletAddress: user.toLowerCase(),
                status: 'completed',
                transactionHash: txHash
            });

            logger.info(`🔷 [MULTI-TOKEN-VAULT] ✅ Withdrawal record created`);
            logger.info(`   User ID: ${dbUser.id}`);
            logger.info(`   NTIQ Balance Update: -${amountInNTIQ} NTIQ`);

        } catch (error: any) {
            logger.error('🔷 [MULTI-TOKEN-VAULT] ❌ Failed to process withdrawal:', error);

            // Log more details for debugging
            if (error.message.includes('duplicate')) {
                logger.info(`🔷 [MULTI-TOKEN-VAULT] ⚠️ Duplicate withdrawal detected - already processed`);
            }
        }
    }

    /**
     * Get user's balance for all supported tokens from contract
     */
    public async getUserBalances(userAddress: string): Promise<{
        pol: string;
        weth: string;
        usdc: string;
        link: string;
    }> {
        try {
            const balances = await this.contract.getUserBalances(userAddress);

            return {
                pol: ethers.formatEther(balances.pol),
                weth: ethers.formatEther(balances.weth),
                usdc: ethers.formatUnits(balances.usdc, 6),
                link: ethers.formatEther(balances.link)
            };
        } catch (error) {
            logger.error('🔷 [MULTI-TOKEN-VAULT] Failed to get user balances:', error);
            throw error;
        }
    }

    /**
     * Check if contract is listening
     */
    public get listening(): boolean {
        return this.isListening;
    }
}

// Export singleton instance
export const multiTokenVaultEventListener = new MultiTokenVaultEventListener();
export default multiTokenVaultEventListener;

