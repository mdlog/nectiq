import { ethers } from 'ethers';
import { logger } from '../../shared/logger';
import { blockchainService } from './blockchainService';

export interface Achievement {
    id: number;
    category: string;
    name: string;
    description: string;
    threshold: number;
    isMintable: boolean;
}

export interface UserProgress {
    category: string;
    progress: number;
}

export class AchievementSystemService {
    private static instance: AchievementSystemService;
    private contract: ethers.Contract;

    private constructor() {
        this.contract = blockchainService.nftAchievementSystemContract;
    }

    public static getInstance(): AchievementSystemService {
        if (!AchievementSystemService.instance) {
            AchievementSystemService.instance = new AchievementSystemService();
        }
        return AchievementSystemService.instance;
    }

    /**
     * Create a new achievement
     */
    public async createAchievement(params: {
        category: string;
        name: string;
        description: string;
        threshold: number;
        isMintable: boolean;
    }): Promise<number> {
        try {
            logger.info(`🏆 [ACHIEVEMENT] Creating achievement: ${params.name}`);
            logger.info(`   Category: ${params.category}`);
            logger.info(`   Threshold: ${params.threshold}`);

            const tx = await this.contract.createAchievement(
                params.category,
                params.name,
                params.description,
                params.threshold,
                params.isMintable
            );

            const receipt = await blockchainService.waitForTransaction(tx.hash);
            const achievementId = receipt?.logs[0]?.topics[1] ?
                Number(receipt.logs[0].topics[1]) : 0;

            logger.info(`✅ [ACHIEVEMENT] Achievement created with ID: ${achievementId}`);
            return achievementId;
        } catch (error: any) {
            logger.error(`❌ [ACHIEVEMENT] Failed to create achievement:`, error);
            throw error;
        }
    }

    /**
     * Update user progress for an achievement category
     */
    public async updateProgress(params: {
        userAddress: string;
        category: string;
        amount: number;
    }): Promise<string> {
        try {
            logger.info(`🏆 [ACHIEVEMENT] Updating progress for ${params.userAddress}`);
            logger.info(`   Category: ${params.category}`);
            logger.info(`   Amount: ${params.amount}`);

            const tx = await this.contract.updateProgress(
                params.userAddress,
                params.category,
                params.amount
            );

            logger.info(`✅ [ACHIEVEMENT] Progress updated: ${tx.hash}`);
            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [ACHIEVEMENT] Failed to update progress:`, error);
            throw error;
        }
    }

    /**
     * Mint achievement NFT for a user
     */
    public async mintAchievement(params: {
        achievementId: number;
        userAddress: string;
    }): Promise<string> {
        try {
            logger.info(`🏆 [ACHIEVEMENT] Minting achievement ${params.achievementId} for ${params.userAddress}`);

            const tx = await this.contract.mintAchievement(
                params.achievementId,
                params.userAddress
            );

            logger.info(`✅ [ACHIEVEMENT] Achievement minted: ${tx.hash}`);
            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [ACHIEVEMENT] Failed to mint achievement:`, error);
            throw error;
        }
    }

    /**
     * Get achievement details
     */
    public async getAchievement(achievementId: number): Promise<Achievement | null> {
        try {
            const achievement = await this.contract.getAchievement(achievementId);

            if (!achievement || achievement.id === 0) {
                return null;
            }

            return {
                id: Number(achievement.id),
                category: achievement.category,
                name: achievement.name,
                description: achievement.description,
                threshold: Number(achievement.threshold),
                isMintable: achievement.isMintable
            };
        } catch (error: any) {
            logger.error(`❌ [ACHIEVEMENT] Failed to get achievement:`, error);
            return null;
        }
    }

    /**
     * Get user progress for a category
     */
    public async getUserProgress(userAddress: string, category: string): Promise<number> {
        try {
            const progress = await this.contract.getUserProgress(userAddress, category);
            return Number(progress);
        } catch (error: any) {
            logger.error(`❌ [ACHIEVEMENT] Failed to get user progress:`, error);
            return 0;
        }
    }

    /**
     * Check if user has minted an achievement
     */
    public async hasUserMintedAchievement(userAddress: string, achievementId: number): Promise<boolean> {
        try {
            const hasMinted = await this.contract.checkUserHasMinted(userAddress, achievementId);
            return hasMinted;
        } catch (error: any) {
            logger.error(`❌ [ACHIEVEMENT] Failed to check minted status:`, error);
            return false;
        }
    }

    /**
     * Check if user is eligible for an achievement
     */
    public async isUserEligibleForAchievement(userAddress: string, achievementId: number): Promise<boolean> {
        try {
            const achievement = await this.getAchievement(achievementId);
            if (!achievement) {
                return false;
            }

            const progress = await this.getUserProgress(userAddress, achievement.category);
            const hasMinted = await this.hasUserMintedAchievement(userAddress, achievementId);

            return progress >= achievement.threshold && !hasMinted && achievement.isMintable;
        } catch (error: any) {
            logger.error(`❌ [ACHIEVEMENT] Failed to check eligibility:`, error);
            return false;
        }
    }

    /**
     * Get all user achievements (minted NFTs)
     */
    public async getUserAchievements(userAddress: string): Promise<number[]> {
        try {
            // This would require implementing a view function in the contract
            // For now, we'll return an empty array
            // In a full implementation, you'd track this in a mapping
            return [];
        } catch (error: any) {
            logger.error(`❌ [ACHIEVEMENT] Failed to get user achievements:`, error);
            return [];
        }
    }

    /**
     * Process achievement eligibility and mint if eligible
     */
    public async processAchievementEligibility(params: {
        userAddress: string;
        category: string;
        progressIncrease: number;
    }): Promise<{ mintedAchievements: number[]; updatedProgress: number }> {
        try {
            logger.info(`🏆 [ACHIEVEMENT] Processing eligibility for ${params.userAddress}`);
            logger.info(`   Category: ${params.category}`);
            logger.info(`   Progress Increase: ${params.progressIncrease}`);

            // Update progress
            await this.updateProgress({
                userAddress: params.userAddress,
                category: params.category,
                amount: params.progressIncrease
            });

            // Get current progress
            const currentProgress = await this.getUserProgress(params.userAddress, params.category);

            // Check for eligible achievements and mint them
            const mintedAchievements: number[] = [];

            // This is a simplified version - in reality you'd have a list of achievement IDs
            // and check each one for eligibility
            // For demonstration, we'll create some common achievements
            const commonAchievements = [
                { id: 1, category: 'prediction_accuracy', threshold: 10, name: 'First 10 Predictions' },
                { id: 2, category: 'win_streak', threshold: 5, name: '5 Win Streak' },
                { id: 3, category: 'volume', threshold: 1000, name: 'Volume Trader' },
                { id: 4, category: 'referral', threshold: 5, name: 'Referral Master' },
                { id: 5, category: 'tournament', threshold: 1, name: 'Tournament Winner' },
                { id: 6, category: 'special_event', threshold: 1, name: 'Special Event Participant' }
            ];

            for (const achievement of commonAchievements) {
                if (achievement.category === params.category &&
                    currentProgress >= achievement.threshold) {

                    const isEligible = await this.isUserEligibleForAchievement(params.userAddress, achievement.id);
                    if (isEligible) {
                        await this.mintAchievement({
                            achievementId: achievement.id,
                            userAddress: params.userAddress
                        });
                        mintedAchievements.push(achievement.id);
                        logger.info(`🏆 [ACHIEVEMENT] Minted achievement: ${achievement.name}`);
                    }
                }
            }

            return {
                mintedAchievements,
                updatedProgress: currentProgress
            };
        } catch (error: any) {
            logger.error(`❌ [ACHIEVEMENT] Failed to process eligibility:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const achievementSystemService = AchievementSystemService.getInstance();
