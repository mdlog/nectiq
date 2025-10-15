import { ethers } from 'ethers';
import { blockchainService } from './blockchainService';
import { logger } from '../../shared/logger';

export interface LockStakeParams {
    predictionId: string;
    userAddress: string;
    stakeAmount: string; // in NTIQ (will be converted to wei)
    duration?: number; // Duration in seconds for enhanced staking
    predictedPrice?: string; // Predicted price for enhanced staking
}

export interface ReleaseRewardParams {
    predictionId: string;
    userAddress: string;
    actualPrice: string; // Actual price for enhanced staking
}

export interface ForfeitStakeParams {
    predictionId: string;
    userAddress: string;
}

export class PredictionStakingService {
    private static instance: PredictionStakingService;
    private enhancedContract: ethers.Contract;
    private legacyContract: ethers.Contract;

    private constructor() {
        this.enhancedContract = blockchainService.enhancedPredictionStakingContract;
        this.legacyContract = blockchainService.predictionStakingContract;
    }

    public static getInstance(): PredictionStakingService {
        if (!PredictionStakingService.instance) {
            PredictionStakingService.instance = new PredictionStakingService();
        }
        return PredictionStakingService.instance;
    }

    /**
     * Use enhanced contract for new functionality
     */
    private get contract(): ethers.Contract {
        return this.enhancedContract;
    }

    /**
     * Lock stake for a prediction (Enhanced version with duration and price)
     */
    async lockStake(params: LockStakeParams): Promise<string> {
        try {
            const { predictionId, userAddress, stakeAmount, duration = 3600, predictedPrice = "0" } = params;

            // Convert NTIQ to wei (18 decimals)
            const stakeAmountWei = ethers.parseEther(stakeAmount);
            const predictedPriceWei = ethers.parseEther(predictedPrice);

            logger.info(`🔒 [PREDICTION] Locking enhanced stake for prediction ${predictionId}`);
            logger.info(`   User: ${userAddress}`);
            logger.info(`   Amount: ${stakeAmount} NTIQ`);
            logger.info(`   Duration: ${duration} seconds`);
            logger.info(`   Predicted Price: ${predictedPrice}`);

            // Call enhanced smart contract with duration and predicted price
            const tx = await this.contract.lockStake(
                predictionId,
                stakeAmountWei,
                duration,
                predictedPriceWei,
                {
                    from: userAddress
                }
            );

            logger.info(`📝 [PREDICTION] Transaction sent: ${tx.hash}`);

            // Wait for confirmation
            const receipt = await blockchainService.waitForTransaction(tx.hash);

            if (receipt && receipt.status === 1) {
                logger.info(`✅ [PREDICTION] Enhanced stake locked successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
                logger.info(`   Block: ${receipt.blockNumber}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [PREDICTION] Error locking enhanced stake:`, error);
            throw new Error(`Failed to lock enhanced stake: ${error.message}`);
        }
    }

    /**
     * Release reward for a successful prediction (Enhanced version with automatic accuracy calculation)
     */
    async releaseReward(params: ReleaseRewardParams): Promise<string> {
        try {
            const { predictionId, actualPrice } = params;

            logger.info(`💰 [PREDICTION] Releasing enhanced reward for prediction ${predictionId}`);
            logger.info(`   Actual Price: ${actualPrice}`);

            // Convert actual price to wei
            const actualPriceWei = ethers.parseEther(actualPrice);

            // Call enhanced smart contract - it will automatically calculate accuracy and multipliers
            const tx = await this.contract.releaseReward(
                predictionId,
                actualPriceWei,
                {
                    from: blockchainService.getSigner().address
                }
            );

            logger.info(`📝 [PREDICTION] Transaction sent: ${tx.hash}`);

            // Wait for confirmation
            const receipt = await blockchainService.waitForTransaction(tx.hash);

            if (receipt && receipt.status === 1) {
                logger.info(`✅ [PREDICTION] Enhanced reward released successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
                logger.info(`   Block: ${receipt.blockNumber}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [PREDICTION] Error releasing enhanced reward:`, error);
            throw new Error(`Failed to release enhanced reward: ${error.message}`);
        }
    }

    /**
     * Forfeit stake for a failed prediction
     */
    async forfeitStake(params: ForfeitStakeParams): Promise<string> {
        try {
            const { predictionId, userAddress } = params;

            logger.info(`❌ [PREDICTION] Forfeiting stake for prediction ${predictionId}`);
            logger.info(`   User: ${userAddress}`);

            // Call smart contract
            const tx = await this.contract.forfeitStake(
                predictionId,
                userAddress
            );

            logger.info(`📝 [PREDICTION] Transaction sent: ${tx.hash}`);

            // Wait for confirmation
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [PREDICTION] Stake forfeited successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
                logger.info(`   Block: ${receipt.blockNumber}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [PREDICTION] Error forfeiting stake:`, error);
            throw new Error(`Failed to forfeit stake: ${error.message}`);
        }
    }

    /**
     * Get stake info from smart contract
     */
    async getStakeInfo(predictionId: string): Promise<any> {
        try {
            const stakeInfo = await this.contract.stakes(predictionId);

            return {
                user: stakeInfo.user,
                amount: ethers.formatEther(stakeInfo.amount),
                timestamp: Number(stakeInfo.timestamp),
                released: stakeInfo.released
            };
        } catch (error: any) {
            logger.error(`❌ [PREDICTION] Error getting stake info:`, error);
            throw new Error(`Failed to get stake info: ${error.message}`);
        }
    }

    /**
     * Listen for StakeLocked events
     */
    onStakeLocked(callback: (predictionId: string, user: string, amount: bigint) => void) {
        this.contract.on('StakeLocked', (predictionId, user, amount) => {
            logger.info(`🔔 [PREDICTION] StakeLocked event received`);
            logger.info(`   Prediction ID: ${predictionId}`);
            logger.info(`   User: ${user}`);
            logger.info(`   Amount: ${ethers.formatEther(amount)} NTIQ`);

            callback(predictionId, user, amount);
        });
    }

    /**
     * Listen for RewardReleased events
     */
    onRewardReleased(callback: (predictionId: string, user: string, reward: bigint, fee: bigint) => void) {
        this.contract.on('RewardReleased', (predictionId, user, reward, fee) => {
            logger.info(`🔔 [PREDICTION] RewardReleased event received`);
            logger.info(`   Prediction ID: ${predictionId}`);
            logger.info(`   User: ${user}`);
            logger.info(`   Reward: ${ethers.formatEther(reward)} NTIQ`);
            logger.info(`   Fee: ${ethers.formatEther(fee)} NTIQ`);

            callback(predictionId, user, reward, fee);
        });
    }

    /**
     * Listen for StakeForfeited events
     */
    onStakeForfeited(callback: (predictionId: string, user: string, amount: bigint) => void) {
        this.contract.on('StakeForfeited', (predictionId, user, amount) => {
            logger.info(`🔔 [PREDICTION] StakeForfeited event received`);
            logger.info(`   Prediction ID: ${predictionId}`);
            logger.info(`   User: ${user}`);
            logger.info(`   Amount: ${ethers.formatEther(amount)} NTIQ`);

            callback(predictionId, user, amount);
        });
    }
}

// Export singleton instance
export const predictionStakingService = PredictionStakingService.getInstance();
