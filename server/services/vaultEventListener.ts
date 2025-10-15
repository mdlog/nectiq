import { ethers } from 'ethers';
import type { IStorage } from '../storage';
import { BalanceService } from './balanceService';

const VAULT_ADDRESS = process.env.VAULT_CONTRACT_ADDRESS || '';
const AMOY_RPC = 'https://rpc-amoy.polygon.technology';

const VAULT_ABI = [
    'event Deposit(address indexed user, uint256 amount, uint256 timestamp, uint256 newBalance)',
    'event Withdrawal(address indexed user, uint256 amount, uint256 timestamp, uint256 newBalance, uint256 nonce)'
];

export class VaultEventListener {
    private storage: IStorage;
    private provider: ethers.JsonRpcProvider | null = null;
    private contract: ethers.Contract | null = null;
    private isListening: boolean = false;

    constructor(storage: IStorage) {
        this.storage = storage;
    }

    async start() {
        if (!VAULT_ADDRESS) {
            console.warn('⚠️  [VAULT-LISTENER] VAULT_CONTRACT_ADDRESS not set, vault listener disabled');
            return;
        }

        if (this.isListening) {
            console.log('⚠️  [VAULT-LISTENER] Already listening to events');
            return;
        }

        try {
            console.log('🎧 [VAULT-LISTENER] Starting to listen to vault events...');
            console.log(`📍 [VAULT-LISTENER] Contract address: ${VAULT_ADDRESS}`);
            console.log(`🌐 [VAULT-LISTENER] RPC endpoint: ${AMOY_RPC}`);

            // Configure provider with longer polling interval to reduce RPC errors
            this.provider = new ethers.JsonRpcProvider(AMOY_RPC, {
                name: 'polygon-amoy',
                chainId: 80002
            });

            // Set polling interval to 30 seconds to reduce RPC load
            this.provider.pollingInterval = 30000;

            this.contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, this.provider);

            // Add comprehensive error handler to suppress RPC errors
            this.provider.on('error', (error: any) => {
                const errorMsg = error?.message || error?.error?.message || error?.shortMessage || '';
                // Suppress common RPC filter errors that don't affect functionality
                if (errorMsg.includes('filter not found') ||
                    errorMsg.includes('could not coalesce error') ||
                    errorMsg.includes('eth_getFilterChanges')) {
                    // Silently ignore - this is normal when RPC node clears old filters
                    return;
                }
                // Log other errors
                console.error('⚠️  [VAULT-LISTENER] Provider error:', error.message || error);
            });

            this.isListening = true;

            // Listen to Deposit events
            this.contract.on('Deposit', async (user, amount, timestamp, newBalance, event) => {
                try {
                    console.log('💰 [VAULT-LISTENER] Deposit event detected:', {
                        user,
                        amount: ethers.formatEther(amount),
                        timestamp: new Date(Number(timestamp) * 1000).toISOString(),
                        txHash: event.log.transactionHash,
                        blockNumber: event.log.blockNumber
                    });

                    await this.processDeposit(user, amount, event.log.transactionHash);
                } catch (error) {
                    console.error('❌ [VAULT-LISTENER] Error processing deposit:', error);
                }
            });

            // Listen to Withdrawal events
            this.contract.on('Withdrawal', async (user, amount, timestamp, newBalance, nonce, event) => {
                try {
                    console.log('💸 [VAULT-LISTENER] Withdrawal event detected:', {
                        user,
                        amount: ethers.formatEther(amount),
                        nonce: nonce.toString(),
                        txHash: event.log.transactionHash,
                        blockNumber: event.log.blockNumber
                    });

                    await this.processWithdrawal(user, amount, event.log.transactionHash, nonce);
                } catch (error) {
                    console.error('❌ [VAULT-LISTENER] Error processing withdrawal:', error);
                }
            });

            console.log('✅ [VAULT-LISTENER] Now listening to vault events on Polygon Amoy');
            console.log('🔍 [VAULT-LISTENER] Monitoring for deposits and withdrawals...');
            console.log('🤫 [VAULT-LISTENER] RPC filter errors are suppressed (normal behavior)\n');

        } catch (error) {
            console.error('❌ [VAULT-LISTENER] Failed to start event listener:', error);
            this.isListening = false;
            throw error;
        }
    }

    async stop() {
        if (!this.isListening || !this.contract) return;

        console.log('🛑 [VAULT-LISTENER] Stopping event listener...');
        this.contract.removeAllListeners();
        this.isListening = false;
        console.log('✅ [VAULT-LISTENER] Event listener stopped');
    }

    private async processDeposit(
        userAddress: string,
        amountWei: bigint,
        txHash: string
    ) {
        try {
            console.log(`🔄 [VAULT-LISTENER] Processing deposit for ${userAddress}...`);

            // Find or create user
            let user = await this.storage.getUserByWalletAddress(userAddress);
            if (!user) {
                console.log('🆕 [VAULT-LISTENER] New user detected, creating account...');
                const username = `User${userAddress.slice(0, 6)}`;
                user = await this.storage.createUser({
                    walletAddress: userAddress,
                    username
                });
                console.log(`✅ [VAULT-LISTENER] Created new user: ${username} (ID: ${user.id})`);
            }

            // Convert Wei to POL (18 decimals, same as ETH)
            const amountPOL = parseFloat(ethers.formatEther(amountWei));

            // Calculate NTIQ amount (1 POL = 1000 NTIQ example rate)
            // TODO: Make this configurable via environment variable
            const CONVERSION_RATE = 1000;
            const ntiqAmount = Math.round(amountPOL * CONVERSION_RATE);

            // Fetch POL price for USD calculation
            let polPriceUSD = 0.50; // Default fallback price
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
                const data = await response.json();
                polPriceUSD = data['matic-network']?.usd || 0.50;
                console.log(`💵 [VAULT-LISTENER] Current POL price: $${polPriceUSD}`);
            } catch (error) {
                console.warn('⚠️  [VAULT-LISTENER] Failed to fetch POL price, using fallback:', polPriceUSD);
            }

            const amountUSD = (amountPOL * polPriceUSD).toFixed(6);

            console.log(`💱 [VAULT-LISTENER] Conversion: ${amountPOL} POL → ${ntiqAmount} NTIQ (rate: ${CONVERSION_RATE})`);

            // Credit user balance
            await BalanceService.processTransaction({
                userId: user.id,
                type: 'deposit_credit',
                amount: ntiqAmount,
                token: 'NTIQ',
                hash: txHash,
                description: `Smart contract deposit - ${amountPOL} POL`,
                metadata: {
                    source: 'vault_contract',
                    contractAddress: VAULT_ADDRESS,
                    amountPOL,
                    conversionRate: CONVERSION_RATE,
                    network: 'Polygon Amoy',
                    chainId: 80002
                }
            }, this.storage);

            // Create deposit record for admin panel visibility
            await this.storage.createDeposit({
                userId: user.id,
                fromWalletAddress: userAddress,
                toWalletAddress: VAULT_ADDRESS,
                chainName: 'Polygon Amoy',
                chainId: 80002,
                tokenType: 'POL',
                tokenAddress: '0x0000000000000000000000000000000000000000', // Native token
                amountUSD: amountUSD,
                ntiqAmount: ntiqAmount,
                ethPriceSnapshot: polPriceUSD.toString(),
                transactionHash: txHash,
                blockNumber: null, // Can be added if needed
                status: 'confirmed', // Already confirmed on-chain
                processedAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry (already processed)
            });

            console.log(`✅ [VAULT-LISTENER] Credited ${ntiqAmount} NTIQ to user ${user.id}`);
            console.log(`📊 [VAULT-LISTENER] Deposit record created in database`);
            console.log(`📊 [VAULT-LISTENER] Transaction hash: ${txHash}`);
            console.log(`🔗 [VAULT-LISTENER] View on Polygonscan: https://amoy.polygonscan.com/tx/${txHash}\n`);

            // TODO: Send real-time notification to user
            // await notificationService.send(user.id, {
            //   title: "Deposit Confirmed! 🎉",
            //   message: `${amountPOL} POL deposited. You received ${ntiqAmount} NTIQ.`,
            //   type: 'deposit',
            //   txHash
            // });

        } catch (error) {
            console.error('❌ [VAULT-LISTENER] Failed to process deposit:', error);
            throw error;
        }
    }

    private async processWithdrawal(
        userAddress: string,
        amountWei: bigint,
        txHash: string,
        nonce: bigint
    ) {
        try {
            console.log(`🔄 [VAULT-LISTENER] Processing withdrawal for ${userAddress}...`);

            const user = await this.storage.getUserByWalletAddress(userAddress);
            if (!user) {
                console.error('❌ [VAULT-LISTENER] User not found for withdrawal:', userAddress);
                return;
            }

            const amountPOL = parseFloat(ethers.formatEther(amountWei));
            const CONVERSION_RATE = 1000;
            const ntiqAmount = Math.round(amountPOL * CONVERSION_RATE);

            // Fetch POL price for USD calculation
            let polPriceUSD = 0.50; // Default fallback price
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
                const data = await response.json();
                polPriceUSD = data['matic-network']?.usd || 0.50;
                console.log(`💵 [VAULT-LISTENER] Current POL price: $${polPriceUSD}`);
            } catch (error) {
                console.warn('⚠️  [VAULT-LISTENER] Failed to fetch POL price, using fallback:', polPriceUSD);
            }

            const usdAmount = parseFloat((amountPOL * polPriceUSD).toFixed(6));
            const feeAmount = parseFloat((usdAmount * 0.025).toFixed(6)); // 2.5% fee
            const netAmount = parseFloat((usdAmount - feeAmount).toFixed(6));

            // Create withdrawal record for admin panel visibility
            await this.storage.createWithdrawal({
                userId: user.id,
                ntiqAmount: ntiqAmount,
                usdAmount: usdAmount.toString(),
                feeAmount: feeAmount.toString(),
                netAmount: netAmount.toString(),
                ethPriceSnapshot: polPriceUSD.toString(),
                chainName: 'Polygon Amoy',
                chainId: 80002,
                tokenType: 'POL',
                tokenAddress: '0x0000000000000000000000000000000000000000', // Native token
                toWalletAddress: userAddress,
                transactionHash: txHash,
                blockNumber: null,
                status: 'completed', // Already completed on-chain
                processedBy: null, // Automated via smart contract
                adminNote: `Smart contract withdrawal - Nonce: ${nonce.toString()}`,
                processedAt: new Date()
            });

            console.log(`✅ [VAULT-LISTENER] Withdrawal processed for user ${user.id}: ${amountPOL} POL`);
            console.log(`📊 [VAULT-LISTENER] Withdrawal record created in database`);
            console.log(`📊 [VAULT-LISTENER] Transaction hash: ${txHash}`);
            console.log(`🔗 [VAULT-LISTENER] View on Polygonscan: https://amoy.polygonscan.com/tx/${txHash}`);
            console.log(`🔢 [VAULT-LISTENER] Nonce: ${nonce.toString()}\n`);

            // TODO: Send real-time notification to user
            // await notificationService.send(user.id, {
            //   title: "Withdrawal Complete! 💸",
            //   message: `${amountPOL} POL sent to your wallet.`,
            //   type: 'withdrawal',
            //   txHash
            // });

        } catch (error) {
            console.error('❌ [VAULT-LISTENER] Failed to process withdrawal:', error);
            throw error;
        }
    }

    // For testing: get current contract stats
    async getContractStats() {
        if (!this.contract || !this.provider) {
            throw new Error('Event listener not initialized');
        }

        try {
            const [totalDeposited, contractBalance] = await this.contract.getStats();
            return {
                totalDeposited: ethers.formatEther(totalDeposited),
                contractBalance: ethers.formatEther(contractBalance),
                contractAddress: VAULT_ADDRESS
            };
        } catch (error) {
            console.error('Failed to get contract stats:', error);
            throw error;
        }
    }
}

// Singleton instance - will be initialized in server/index.ts
let vaultEventListenerInstance: VaultEventListener | null = null;

export function initVaultEventListener(storage: IStorage): VaultEventListener {
    if (!vaultEventListenerInstance) {
        vaultEventListenerInstance = new VaultEventListener(storage);
    }
    return vaultEventListenerInstance;
}

export function getVaultEventListener(): VaultEventListener | null {
    return vaultEventListenerInstance;
}

