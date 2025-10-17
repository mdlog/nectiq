import { ethers } from 'ethers';
import { blockchainService } from './blockchainService';
import { logger } from '../../shared/logger';

export interface LockParlayStakeParams {
    parlayId: string;
    userAddress: string;
    stakeAmount: string; // in NTIQ
    coinCount: number;
    duration?: number; // Duration in seconds for enhanced parlay staking
}

export interface ReleaseCompoundRewardParams {
    parlayId: string;
    userAddress: string;
    // Enhanced contract automatically calculates compound multiplier
}

export interface ForfeitParlayStakeParams {
    parlayId: string;
    userAddress: string;
}

export class ParlayStakingService {
    private static instance: ParlayStakingService;
    private enhancedContract: ethers.Contract;
    private legacyContract: ethers.Contract;

    private constructor() {
        this.enhancedContract = blockchainService.enhancedParlayStakingContract;
        this.legacyContract = blockchainService.parlayStakingContract;
    }

    public static getInstance(): ParlayStakingService {
        if (!ParlayStakingService.instance) {
            ParlayStakingService.instance = new ParlayStakingService();
        }
        return ParlayStakingService.instance;
    }

    /**
     * Use enhanced contract for new functionality
     */
    private get contract(): ethers.Contract {
        return this.enhancedContract;
    }

    /**
     * Lock stake for a parlay (Enhanced version with duration)
     */
    async lockParlayStake(params: LockParlayStakeParams): Promise<string> {
        try {
            const { parlayId, userAddress, stakeAmount, coinCount, duration = 3600 } = params;

            const stakeAmountWei = ethers.parseEther(stakeAmount);

            logger.info(`🎲 [PARLAY] Locking enhanced parlay stake ${parlayId}`);
            logger.info(`   User: ${userAddress}`);
            logger.info(`   Amount: ${stakeAmount} NTIQ`);
            logger.info(`   Coins: ${coinCount}`);
            logger.info(`   Duration: ${duration} seconds`);

            const tx = await this.contract.lockParlayStake(
                parlayId,
                stakeAmountWei,
                coinCount,
                duration
            );

            logger.info(`📝 [PARLAY] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [PARLAY] Parlay stake locked successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [PARLAY] Error locking parlay stake:`, error);
            throw new Error(`Failed to lock parlay stake: ${error.message}`);
        }
    }

    /**
     * Release compound reward for a successful parlay (Enhanced version with automatic calculation)
     */
    async releaseCompoundReward(params: ReleaseCompoundRewardParams): Promise<string> {
        try {
            const { parlayId } = params;

            logger.info(`💰 [PARLAY] Releasing enhanced compound reward for parlay ${parlayId}`);

            // Enhanced contract automatically calculates compound multiplier based on duration and coin count
            const tx = await this.contract.releaseCompoundReward(
                parlayId,
                {
                    from: blockchainService.getSigner().address
                }
            );

            logger.info(`📝 [PARLAY] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [PARLAY] Compound reward released successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [PARLAY] Error releasing compound reward:`, error);
            throw new Error(`Failed to release compound reward: ${error.message}`);
        }
    }

    /**
     * Forfeit stake for a failed parlay
     */
    async forfeitStake(params: ForfeitParlayStakeParams): Promise<string> {
        try {
            const { parlayId, userAddress } = params;

            logger.info(`❌ [PARLAY] Forfeiting parlay stake ${parlayId}`);
            logger.info(`   User: ${userAddress}`);

            const tx = await this.contract.forfeitStake(
                parlayId,
                userAddress
            );

            logger.info(`📝 [PARLAY] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [PARLAY] Parlay stake forfeited successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [PARLAY] Error forfeiting parlay stake:`, error);
            throw new Error(`Failed to forfeit parlay stake: ${error.message}`);
        }
    }

    /**
     * Get parlay stake info from smart contract
     */
    async getParlayStakeInfo(parlayId: string): Promise<any> {
        try {
            const stakeInfo = await this.contract.parlayStakes(parlayId);

            return {
                user: stakeInfo.user,
                amount: ethers.formatEther(stakeInfo.amount),
                coinCount: Number(stakeInfo.coinCount),
                timestamp: Number(stakeInfo.timestamp),
                released: stakeInfo.released
            };
        } catch (error: any) {
            logger.error(`❌ [PARLAY] Error getting parlay stake info:`, error);
            throw new Error(`Failed to get parlay stake info: ${error.message}`);
        }
    }

    /**
     * Listen for ParlayStakeLocked events
     */
    onParlayStakeLocked(callback: (parlayId: string, user: string, amount: bigint, coinCount: number) => void) {
        this.contract.on('ParlayStakeLocked', (parlayId, user, amount, coinCount) => {
            logger.info(`🔔 [PARLAY] ParlayStakeLocked event received`);
            logger.info(`   Parlay ID: ${parlayId}`);
            logger.info(`   User: ${user}`);
            logger.info(`   Amount: ${ethers.formatEther(amount)} NTIQ`);
            logger.info(`   Coins: ${coinCount}`);

            callback(parlayId, user, amount, Number(coinCount));
        });
    }

    /**
     * Listen for ParlayRewardReleased events
     */
    onParlayRewardReleased(callback: (parlayId: string, user: string, reward: bigint, fee: bigint) => void) {
        this.contract.on('ParlayRewardReleased', (parlayId, user, reward, fee) => {
            logger.info(`🔔 [PARLAY] ParlayRewardReleased event received`);
            logger.info(`   Parlay ID: ${parlayId}`);
            logger.info(`   User: ${user}`);
            logger.info(`   Reward: ${ethers.formatEther(reward)} NTIQ`);
            logger.info(`   Fee: ${ethers.formatEther(fee)} NTIQ`);

            callback(parlayId, user, reward, fee);
        });
    }

    /**
     * Listen for ParlayStakeForfeited events
     */
    onParlayStakeForfeited(callback: (parlayId: string, user: string, amount: bigint) => void) {
        this.contract.on('ParlayStakeForfeited', (parlayId, user, amount) => {
            logger.info(`🔔 [PARLAY] ParlayStakeForfeited event received`);
            logger.info(`   Parlay ID: ${parlayId}`);
            logger.info(`   User: ${user}`);
            logger.info(`   Amount: ${ethers.formatEther(amount)} NTIQ`);

            callback(parlayId, user, amount);
        });
    }
}

// Export singleton instance
export const parlayStakingService = ParlayStakingService.getInstance();
