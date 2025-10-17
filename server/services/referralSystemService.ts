import { ethers } from 'ethers';
import { logger } from '../../shared/logger';
import { blockchainService } from './blockchainService';

export interface ReferralData {
    referrer: string;
    totalEarnings: string;
    totalActivities: number;
    active: boolean;
}

export interface ReferralReward {
    referrer: string;
    referee: string;
    activityAmount: string;
    rewardAmount: string;
    activityType: string;
}

export class ReferralSystemService {
    private static instance: ReferralSystemService;
    private contract: ethers.Contract;

    private constructor() {
        this.contract = blockchainService.referralSystemContract;
    }

    public static getInstance(): ReferralSystemService {
        if (!ReferralSystemService.instance) {
            ReferralSystemService.instance = new ReferralSystemService();
        }
        return ReferralSystemService.instance;
    }

    /**
     * Register a referral relationship
     */
    public async registerReferral(params: {
        referrer: string;
        referee: string;
    }): Promise<string> {
        try {
            logger.info(`👥 [REFERRAL] Registering referral: ${params.referrer} -> ${params.referee}`);

            const tx = await this.contract.registerReferral(
                params.referrer,
                params.referee
            );

            logger.info(`✅ [REFERRAL] Referral registered: ${tx.hash}`);
            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [REFERRAL] Failed to register referral:`, error);
            throw error;
        }
    }

    /**
     * Distribute referral reward for an activity
     */
    public async distributeReferralReward(params: {
        referee: string;
        activityAmount: string;
        activityType: string;
    }): Promise<string> {
        try {
            logger.info(`👥 [REFERRAL] Distributing reward for ${params.activityType}`);
            logger.info(`   Referee: ${params.referee}`);
            logger.info(`   Activity Amount: ${params.activityAmount}`);

            const tx = await this.contract.batchDistributeReferralRewards(
                [params.referee],
                [params.activityAmount],
                [params.activityType]
            );

            logger.info(`✅ [REFERRAL] Reward distributed: ${tx.hash}`);
            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [REFERRAL] Failed to distribute reward:`, error);
            throw error;
        }
    }

    /**
     * Batch distribute referral rewards
     */
    public async batchDistributeReferralRewards(params: {
        referees: string[];
        activityAmounts: string[];
        activityTypes: string[];
    }): Promise<string> {
        try {
            logger.info(`👥 [REFERRAL] Batch distributing rewards for ${params.referees.length} activities`);

            const tx = await this.contract.batchDistributeReferralRewards(
                params.referees,
                params.activityAmounts,
                params.activityTypes
            );

            logger.info(`✅ [REFERRAL] Batch rewards distributed: ${tx.hash}`);
            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [REFERRAL] Failed to batch distribute rewards:`, error);
            throw error;
        }
    }

    /**
     * Get referral data for a user
     */
    public async getReferralData(referee: string): Promise<ReferralData | null> {
        try {
            const data = await this.contract.getReferralData(referee);

            if (!data || data.referrer === ethers.ZeroAddress) {
                return null;
            }

            return {
                referrer: data.referrer,
                totalEarnings: data.totalEarnings.toString(),
                totalActivities: Number(data.totalActivities),
                active: data.active
            };
        } catch (error: any) {
            logger.error(`❌ [REFERRAL] Failed to get referral data:`, error);
            return null;
        }
    }

    /**
     * Get total referral earnings for a referrer
     */
    public async getUserTotalReferralEarnings(referrer: string): Promise<string> {
        try {
            const earnings = await this.contract.getUserTotalReferralEarnings(referrer);
            return earnings.toString();
        } catch (error: any) {
            logger.error(`❌ [REFERRAL] Failed to get total earnings:`, error);
            return "0";
        }
    }

    /**
     * Check if user has a referrer
     */
    public async hasReferrer(userAddress: string): Promise<boolean> {
        try {
            const data = await this.getReferralData(userAddress);
            return data !== null && data.referrer !== ethers.ZeroAddress;
        } catch (error: any) {
            logger.error(`❌ [REFERRAL] Failed to check referrer:`, error);
            return false;
        }
    }

    /**
     * Get referrer address for a user
     */
    public async getReferrer(userAddress: string): Promise<string | null> {
        try {
            const data = await this.getReferralData(userAddress);
            return data?.referrer || null;
        } catch (error: any) {
            logger.error(`❌ [REFERRAL] Failed to get referrer:`, error);
            return null;
        }
    }

    /**
     * Calculate referral reward amount
     */
    public async calculateReferralReward(activityAmount: string): Promise<string> {
        try {
            // Referral bonus is 10% of activity amount (1000 basis points)
            const REFERRAL_BONUS_RATE = 1000; // 10%
            const BASIS_POINTS = 10000;

            const reward = (BigInt(activityAmount) * BigInt(REFERRAL_BONUS_RATE)) / BigInt(BASIS_POINTS);
            return reward.toString();
        } catch (error: any) {
            logger.error(`❌ [REFERRAL] Failed to calculate referral reward:`, error);
            throw error;
        }
    }

    /**
     * Update referral status
     */
    public async updateReferralStatus(params: {
        referee: string;
        newStatus: boolean;
    }): Promise<string> {
        try {
            logger.info(`👥 [REFERRAL] Updating status for ${params.referee}: ${params.newStatus}`);

            const tx = await this.contract.updateReferralStatus(
                params.referee,
                params.newStatus
            );

            logger.info(`✅ [REFERRAL] Status updated: ${tx.hash}`);
            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [REFERRAL] Failed to update status:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const referralSystemService = ReferralSystemService.getInstance();
