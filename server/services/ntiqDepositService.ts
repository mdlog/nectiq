import { ethers } from 'ethers';
import { logger } from '../../shared/logger';
import { ntiqTokenService } from './ntiqTokenService';

/**
 * NTIQ Deposit Service
 * Handles NTIQ token deposits for users to get tokens for staking
 */

const NTIQ_TOKEN_ADDRESS = process.env.NTIQ_TOKEN_SIMPLE_ADDRESS || '';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';
const POLYGON_AMOY_RPC = process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';

export class NTIQDepositService {
    private provider: ethers.JsonRpcProvider;
    private deployerWallet: ethers.Wallet;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC);

        if (!DEPLOYER_PRIVATE_KEY) {
            throw new Error('DEPLOYER_PRIVATE_KEY not set');
        }

        this.deployerWallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, this.provider);
        logger.info('💰 [NTIQ-DEPOSIT] Service initialized');
    }

    /**
     * Airdrop NTIQ tokens to user (for testing/onboarding)
     * This transfers NTIQ from deployer wallet to user wallet
     */
    async airdropToUser(userAddress: string, amount: number): Promise<string> {
        try {
            logger.info(`🎁 [NTIQ-DEPOSIT] Airdropping ${amount} NTIQ to ${userAddress}`);

            // Check deployer balance
            const deployerBalance = await ntiqTokenService.getBalance(this.deployerWallet.address);
            if (deployerBalance < amount) {
                throw new Error(`Insufficient deployer balance. Required: ${amount}, Available: ${deployerBalance}`);
            }

            // Transfer NTIQ from deployer to user
            const txHash = await ntiqTokenService.transferToUser(userAddress, amount);

            logger.info(`✅ [NTIQ-DEPOSIT] Airdrop successful: ${txHash}`);
            return txHash;
        } catch (error: any) {
            logger.error(`❌ [NTIQ-DEPOSIT] Airdrop failed:`, error);
            throw new Error(`Failed to airdrop NTIQ: ${error.message}`);
        }
    }

    /**
     * Batch airdrop to multiple users
     */
    async batchAirdrop(recipients: string[], amounts: number[]): Promise<string> {
        try {
            if (recipients.length !== amounts.length) {
                throw new Error('Recipients and amounts arrays must have same length');
            }

            logger.info(`🎁 [NTIQ-DEPOSIT] Batch airdrop to ${recipients.length} users`);

            // Check total amount needed
            const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0);
            const deployerBalance = await ntiqTokenService.getBalance(this.deployerWallet.address);

            if (deployerBalance < totalAmount) {
                throw new Error(`Insufficient deployer balance. Required: ${totalAmount}, Available: ${deployerBalance}`);
            }

            // Use distributeAirdrop function from NTIQ token
            const txHash = await ntiqTokenService.distributeAirdrop(recipients, amounts);

            logger.info(`✅ [NTIQ-DEPOSIT] Batch airdrop successful: ${txHash}`);
            return txHash;
        } catch (error: any) {
            logger.error(`❌ [NTIQ-DEPOSIT] Batch airdrop failed:`, error);
            throw new Error(`Failed to batch airdrop NTIQ: ${error.message}`);
        }
    }

    /**
     * Get deployer balance (for checking available NTIQ for airdrops)
     */
    async getDeployerBalance(): Promise<number> {
        try {
            return await ntiqTokenService.getBalance(this.deployerWallet.address);
        } catch (error) {
            logger.error(`❌ [NTIQ-DEPOSIT] Failed to get deployer balance:`, error);
            return 0;
        }
    }

    /**
     * Check if user has sufficient NTIQ balance
     */
    async checkUserBalance(userAddress: string, requiredAmount: number): Promise<{
        hasEnough: boolean;
        currentBalance: number;
        shortfall: number;
    }> {
        try {
            const balance = await ntiqTokenService.getBalance(userAddress);
            const hasEnough = balance >= requiredAmount;
            const shortfall = hasEnough ? 0 : requiredAmount - balance;

            return {
                hasEnough,
                currentBalance: balance,
                shortfall
            };
        } catch (error) {
            logger.error(`❌ [NTIQ-DEPOSIT] Failed to check user balance:`, error);
            return {
                hasEnough: false,
                currentBalance: 0,
                shortfall: requiredAmount
            };
        }
    }

    /**
     * Auto-airdrop if user has insufficient balance (for testing)
     * This is useful during development/testing phase
     */
    async autoAirdropIfNeeded(
        userAddress: string,
        requiredAmount: number,
        airdropAmount: number = 1000
    ): Promise<{
        needed: boolean;
        airdropped: boolean;
        txHash?: string;
    }> {
        try {
            const balanceCheck = await this.checkUserBalance(userAddress, requiredAmount);

            if (balanceCheck.hasEnough) {
                return {
                    needed: false,
                    airdropped: false
                };
            }

            logger.info(`🎁 [NTIQ-DEPOSIT] Auto-airdrop triggered for ${userAddress}`);
            logger.info(`   Required: ${requiredAmount}, Current: ${balanceCheck.currentBalance}, Shortfall: ${balanceCheck.shortfall}`);

            const txHash = await this.airdropToUser(userAddress, airdropAmount);

            return {
                needed: true,
                airdropped: true,
                txHash
            };
        } catch (error: any) {
            logger.error(`❌ [NTIQ-DEPOSIT] Auto-airdrop failed:`, error);
            return {
                needed: true,
                airdropped: false
            };
        }
    }
}

// Export singleton instance
export const ntiqDepositService = new NTIQDepositService();
