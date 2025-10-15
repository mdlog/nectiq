import { ethers } from 'ethers';
import { logger } from '../../shared/logger';
import { blockchainService } from './blockchainService';

export interface InsurancePolicy {
    predictionId: string;
    userAddress: string;
    stakeAmount: string;
    insuranceCost: string;
    refundAmount: string;
    claimed: boolean;
    timestamp: number;
}

export class PredictionInsuranceService {
    private static instance: PredictionInsuranceService;
    private contract: ethers.Contract;

    private constructor() {
        this.contract = blockchainService.predictionInsuranceContract;
    }

    public static getInstance(): PredictionInsuranceService {
        if (!PredictionInsuranceService.instance) {
            PredictionInsuranceService.instance = new PredictionInsuranceService();
        }
        return PredictionInsuranceService.instance;
    }

    /**
     * Buy insurance for a prediction
     */
    public async buyInsurance(params: {
        predictionId: string;
        userAddress: string;
        stakeAmount: string;
    }): Promise<string> {
        try {
            logger.info(`🛡️ [INSURANCE] Buying insurance for prediction ${params.predictionId}`);
            logger.info(`   User: ${params.userAddress}`);
            logger.info(`   Stake Amount: ${params.stakeAmount}`);

            const tx = await this.contract.buyInsurance(
                params.predictionId,
                params.stakeAmount,
                {
                    from: params.userAddress
                }
            );

            logger.info(`✅ [INSURANCE] Insurance purchased: ${tx.hash}`);
            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [INSURANCE] Failed to buy insurance:`, error);
            throw error;
        }
    }

    /**
     * Claim insurance for a prediction
     */
    public async claimInsurance(params: {
        predictionId: string;
        userAddress: string;
    }): Promise<string> {
        try {
            logger.info(`🛡️ [INSURANCE] Claiming insurance for prediction ${params.predictionId}`);
            logger.info(`   User: ${params.userAddress}`);

            const tx = await this.contract.claimInsurance(
                params.predictionId,
                {
                    from: params.userAddress
                }
            );

            logger.info(`✅ [INSURANCE] Insurance claimed: ${tx.hash}`);
            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [INSURANCE] Failed to claim insurance:`, error);
            throw error;
        }
    }

    /**
     * Get insurance claim details
     */
    public async getInsuranceClaim(predictionId: string): Promise<InsurancePolicy | null> {
        try {
            const claim = await this.contract.getInsuranceClaim(predictionId);

            if (!claim || claim.user === ethers.ZeroAddress) {
                return null;
            }

            return {
                predictionId,
                userAddress: claim.user,
                stakeAmount: claim.stakeAmount.toString(),
                insuranceCost: claim.insuranceCost.toString(),
                refundAmount: claim.refundAmount.toString(),
                claimed: claim.claimed,
                timestamp: Number(claim.timestamp)
            };
        } catch (error: any) {
            logger.error(`❌ [INSURANCE] Failed to get insurance claim:`, error);
            return null;
        }
    }

    /**
     * Check if user has insurance for a prediction
     */
    public async hasInsurance(predictionId: string, userAddress: string): Promise<boolean> {
        try {
            const claim = await this.getInsuranceClaim(predictionId);
            return claim !== null && claim.userAddress.toLowerCase() === userAddress.toLowerCase();
        } catch (error: any) {
            logger.error(`❌ [INSURANCE] Failed to check insurance:`, error);
            return false;
        }
    }

    /**
     * Calculate insurance cost for a stake amount
     */
    public async calculateInsuranceCost(stakeAmount: string): Promise<string> {
        try {
            // Insurance cost is 10% of stake amount (1000 basis points)
            const INSURANCE_COST_RATE = 1000; // 10%
            const BASIS_POINTS = 10000;

            const cost = (BigInt(stakeAmount) * BigInt(INSURANCE_COST_RATE)) / BigInt(BASIS_POINTS);
            return cost.toString();
        } catch (error: any) {
            logger.error(`❌ [INSURANCE] Failed to calculate insurance cost:`, error);
            throw error;
        }
    }

    /**
     * Calculate refund amount for insurance
     */
    public async calculateRefundAmount(insuranceCost: string): Promise<string> {
        try {
            // Refund is 50% of insurance cost (5000 basis points)
            const REFUND_RATE = 5000; // 50%
            const BASIS_POINTS = 10000;

            const refund = (BigInt(insuranceCost) * BigInt(REFUND_RATE)) / BigInt(BASIS_POINTS);
            return refund.toString();
        } catch (error: any) {
            logger.error(`❌ [INSURANCE] Failed to calculate refund amount:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const predictionInsuranceService = PredictionInsuranceService.getInstance();