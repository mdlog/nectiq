import { db } from "../db";
import { predictionInsurance, predictions, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import type { InsertPredictionInsurance, PredictionInsurance } from "@shared/schema";

export class PredictionInsuranceService {
    /**
     * Purchase insurance for a prediction
     * Cost: 10% of stake, Coverage: 50% of stake
     */
    static async purchaseInsurance(
        userId: number,
        predictionId: number,
        stakeAmount: number
    ): Promise<{ success: boolean; insurance?: PredictionInsurance; error?: string }> {
        try {
            // Verify prediction exists and belongs to user
            const [prediction] = await db
                .select()
                .from(predictions)
                .where(and(
                    eq(predictions.id, predictionId),
                    eq(predictions.userId, userId),
                    eq(predictions.status, 'pending')
                ))
                .limit(1);

            if (!prediction) {
                return { success: false, error: "Prediction not found or already completed" };
            }

            // Check if insurance already purchased for this prediction
            const [existingInsurance] = await db
                .select()
                .from(predictionInsurance)
                .where(eq(predictionInsurance.predictionId, predictionId))
                .limit(1);

            if (existingInsurance) {
                return { success: false, error: "Insurance already purchased for this prediction" };
            }

            // Calculate insurance cost and coverage
            const insuranceCost = Math.floor(stakeAmount * 0.10); // 10% of stake
            const coveredAmount = Math.floor(stakeAmount * 0.50); // 50% coverage

            // Check if user has enough balance
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!user || user.balance < insuranceCost) {
                return { success: false, error: "Insufficient balance to purchase insurance" };
            }

            // Deduct insurance cost from user balance
            await db
                .update(users)
                .set({ balance: user.balance - insuranceCost })
                .where(eq(users.id, userId));

            // Create insurance record
            const [insurance] = await db
                .insert(predictionInsurance)
                .values({
                    predictionId,
                    userId,
                    insuranceCost,
                    coveredAmount,
                    stakeAmount,
                    status: 'active'
                })
                .returning();

            console.log(`✅ Insurance purchased: User ${userId}, Prediction ${predictionId}, Cost: ${insuranceCost} NTIQ`);

            return { success: true, insurance };
        } catch (error) {
            console.error('❌ Error purchasing insurance:', error);
            return { success: false, error: "Failed to purchase insurance" };
        }
    }

    /**
     * Auto-process insurance claim when prediction loses
     * Called automatically by prediction settlement service
     */
    static async processInsuranceClaim(predictionId: number): Promise<void> {
        try {
            // Get insurance record
            const [insurance] = await db
                .select()
                .from(predictionInsurance)
                .where(and(
                    eq(predictionInsurance.predictionId, predictionId),
                    eq(predictionInsurance.status, 'active')
                ))
                .limit(1);

            if (!insurance) {
                return; // No insurance for this prediction
            }

            // Get prediction result
            const [prediction] = await db
                .select()
                .from(predictions)
                .where(eq(predictions.id, predictionId))
                .limit(1);

            if (!prediction) {
                return;
            }

            // Check if prediction lost (rewardAmount = 0 means loss)
            if (prediction.status === 'completed' && prediction.rewardAmount === 0) {
                // Prediction lost - pay insurance claim
                const claimAmount = insurance.coveredAmount;

                // Update insurance status
                await db
                    .update(predictionInsurance)
                    .set({
                        status: 'claimed',
                        claimAmount,
                        claimedAt: new Date()
                    })
                    .where(eq(predictionInsurance.id, insurance.id));

                // Credit user with claim amount
                await db
                    .update(users)
                    .set({
                        balance: db.$increment(users.balance, claimAmount)
                    })
                    .where(eq(users.id, insurance.userId));

                console.log(`✅ Insurance claim processed: User ${insurance.userId}, Claim: ${claimAmount} NTIQ`);
            } else if (prediction.status === 'completed' && prediction.rewardAmount > 0) {
                // Prediction won - mark insurance as expired (not needed)
                await db
                    .update(predictionInsurance)
                    .set({
                        status: 'expired'
                    })
                    .where(eq(predictionInsurance.id, insurance.id));

                console.log(`ℹ️  Insurance expired (prediction won): User ${insurance.userId}`);
            }
        } catch (error) {
            console.error('❌ Error processing insurance claim:', error);
        }
    }

    /**
     * Get user's insurance history
     */
    static async getUserInsuranceHistory(userId: number, limit: number = 20): Promise<any[]> {
        try {
            const insuranceHistory = await db
                .select({
                    id: predictionInsurance.id,
                    predictionId: predictionInsurance.predictionId,
                    insuranceCost: predictionInsurance.insuranceCost,
                    coveredAmount: predictionInsurance.coveredAmount,
                    stakeAmount: predictionInsurance.stakeAmount,
                    status: predictionInsurance.status,
                    claimAmount: predictionInsurance.claimAmount,
                    claimedAt: predictionInsurance.claimedAt,
                    purchasedAt: predictionInsurance.purchasedAt,
                    // Prediction details
                    cryptocurrency: predictions.cryptocurrency,
                    predictionStatus: predictions.status,
                    rewardAmount: predictions.rewardAmount,
                    createdAt: predictions.createdAt,
                    completedAt: predictions.completedAt
                })
                .from(predictionInsurance)
                .innerJoin(predictions, eq(predictionInsurance.predictionId, predictions.id))
                .where(eq(predictionInsurance.userId, userId))
                .orderBy(desc(predictionInsurance.purchasedAt))
                .limit(limit);

            return insuranceHistory;
        } catch (error) {
            console.error('❌ Error fetching insurance history:', error);
            return [];
        }
    }

    /**
     * Get insurance statistics for a user
     */
    static async getUserInsuranceStats(userId: number): Promise<any> {
        try {
            const allInsurance = await db
                .select()
                .from(predictionInsurance)
                .where(eq(predictionInsurance.userId, userId));

            const totalPurchased = allInsurance.length;
            const totalCost = allInsurance.reduce((sum, ins) => sum + ins.insuranceCost, 0);
            const totalClaimed = allInsurance.filter(ins => ins.status === 'claimed').length;
            const totalClaimAmount = allInsurance
                .filter(ins => ins.status === 'claimed')
                .reduce((sum, ins) => sum + (ins.claimAmount || 0), 0);

            const netBenefit = totalClaimAmount - totalCost;

            return {
                totalPurchased,
                totalCost,
                totalClaimed,
                totalClaimAmount,
                netBenefit,
                claimRate: totalPurchased > 0 ? ((totalClaimed / totalPurchased) * 100).toFixed(1) : '0'
            };
        } catch (error) {
            console.error('❌ Error fetching insurance stats:', error);
            return {
                totalPurchased: 0,
                totalCost: 0,
                totalClaimed: 0,
                totalClaimAmount: 0,
                netBenefit: 0,
                claimRate: '0'
            };
        }
    }

    /**
     * Check if user has insurance for a prediction
     */
    static async hasInsurance(predictionId: number): Promise<boolean> {
        try {
            const [insurance] = await db
                .select()
                .from(predictionInsurance)
                .where(eq(predictionInsurance.predictionId, predictionId))
                .limit(1);

            return !!insurance;
        } catch (error) {
            console.error('❌ Error checking insurance:', error);
            return false;
        }
    }

    /**
     * Void insurance (cancel before prediction completes)
     * Refunds 50% of insurance cost
     */
    static async voidInsurance(predictionId: number, userId: number): Promise<{ success: boolean; error?: string }> {
        try {
            // Get insurance
            const [insurance] = await db
                .select()
                .from(predictionInsurance)
                .where(and(
                    eq(predictionInsurance.predictionId, predictionId),
                    eq(predictionInsurance.userId, userId),
                    eq(predictionInsurance.status, 'active')
                ))
                .limit(1);

            if (!insurance) {
                return { success: false, error: "Insurance not found or already processed" };
            }

            // Check prediction is still pending
            const [prediction] = await db
                .select()
                .from(predictions)
                .where(and(
                    eq(predictions.id, predictionId),
                    eq(predictions.status, 'pending')
                ))
                .limit(1);

            if (!prediction) {
                return { success: false, error: "Cannot void insurance for completed prediction" };
            }

            // Refund 50% of insurance cost
            const refundAmount = Math.floor(insurance.insuranceCost * 0.50);

            await db
                .update(predictionInsurance)
                .set({ status: 'void' })
                .where(eq(predictionInsurance.id, insurance.id));

            await db
                .update(users)
                .set({
                    balance: db.$increment(users.balance, refundAmount)
                })
                .where(eq(users.id, userId));

            console.log(`✅ Insurance voided: User ${userId}, Refund: ${refundAmount} NTIQ`);

            return { success: true };
        } catch (error) {
            console.error('❌ Error voiding insurance:', error);
            return { success: false, error: "Failed to void insurance" };
        }
    }
}

