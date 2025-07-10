import { storage } from '../storage';
import { cryptoService } from './cryptoService';
import { BalanceService } from './balanceService';

export class PredictionService {
  async checkAndProcessExpiredPredictions(): Promise<void> {
    const activePredictions = await storage.getActivePredictions();
    const now = new Date();

    for (const prediction of activePredictions) {
      if (new Date(prediction.targetTime) <= now) {
        await this.processPrediction(prediction.id);
      }
    }
  }

  async processPrediction(predictionId: number): Promise<void> {
    const prediction = await storage.getPrediction(predictionId);
    if (!prediction || prediction.status !== 'pending') {
      return;
    }

    try {
      // Get current price
      const actualPrice = await cryptoService.getCryptoPrice(prediction.cryptocurrency);
      if (actualPrice === 0) {
        console.error(`Failed to get price for ${prediction.cryptocurrency}`);
        return;
      }

      // Calculate accuracy
      const predictedPrice = parseFloat(prediction.predictedPrice);
      const accuracy = this.calculateAccuracy(predictedPrice, actualPrice);
      const rewardAmount = this.calculateReward(prediction.stakeAmount, accuracy);

      // Update prediction
      await storage.updatePredictionResult(
        predictionId,
        actualPrice.toString(),
        accuracy.toString(),
        rewardAmount,
        'completed'
      );

      // Update user stats and balance using BalanceService for guaranteed real-time updates
      const user = await storage.getUser(prediction.userId);
      if (user) {
        const newTotalPredictions = user.totalPredictions + 1;
        // Mark as correct if accuracy is 90% or higher (minimum threshold for reward)
        const newCorrectPredictions = user.correctPredictions + (accuracy >= 90 ? 1 : 0);
        const newTotalRewards = user.totalRewards + rewardAmount;

        // Update user stats
        await storage.updateUserStats(prediction.userId, newTotalPredictions, newCorrectPredictions, newTotalRewards);

        // CRITICAL: Use BalanceService for guaranteed real-time balance and transaction updates
        if (rewardAmount > 0) {
          try {
            const accuracyMultiplier = this.calculateAccuracyMultiplier(accuracy);
            await BalanceService.processPredictionReward(
              prediction.userId,
              predictionId,
              prediction.stakeAmount,
              accuracyMultiplier,
              storage
            );

            // Also create reward record for backwards compatibility
            await storage.createReward({
              userId: prediction.userId,
              predictionId: predictionId,
              amount: rewardAmount,
              description: `${prediction.cryptocurrency.toUpperCase()} Prediction Reward (${accuracy.toFixed(2)}% accuracy)`
            });

            console.log(`✅ PREDICTION REWARD: User ${user.username} received ${rewardAmount} NTIQ for ${accuracy.toFixed(2)}% accuracy`);
          } catch (error) {
            console.error(`❌ PREDICTION REWARD ERROR: Failed to process reward for prediction ${predictionId}:`, error);
          }
        } else {
          console.log(`📊 PREDICTION COMPLETED: User ${user.username} - No reward (${accuracy.toFixed(2)}% accuracy)`);
        }
      }
    } catch (error) {
      console.error(`Error processing prediction ${predictionId}:`, error);
    }
  }

  /**
   * Calculate accuracy percentage using the formula:
   * accuracy = (1 - |Predicted Price - Actual Price| / Actual Price) × 100
   * 
   * Example from screenshot:
   * Predicted: $57,000, Actual: $58,600
   * accuracy = (1 - |57,000 - 58,600| / 58,600) × 100 = 97.27%
   */
  private calculateAccuracy(predictedPrice: number, actualPrice: number): number {
    const difference = Math.abs(predictedPrice - actualPrice);
    const accuracyDecimal = 1 - (difference / actualPrice);
    const accuracyPercentage = accuracyDecimal * 100;
    
    // Ensure accuracy is between 0 and 100
    return Math.max(0, Math.min(100, accuracyPercentage));
  }

  /**
   * Calculate accuracy multiplier based on accuracy percentage:
   * - ≥ 99.5%: 3.0x multiplier
   * - ≥ 98%: 2.5x multiplier  
   * - ≥ 95%: 2.0x multiplier
   * - ≥ 90%: 1.0x multiplier (minimal threshold for reward)
   * - < 90%: 0x multiplier (no reward - below minimal accuracy)
   */
  private calculateAccuracyMultiplier(accuracy: number): number {
    if (accuracy >= 99.5) {
      return 3.0; // Perfect prediction: 3x stake
    } else if (accuracy >= 98) {
      return 2.5; // Excellent prediction: 2.5x stake
    } else if (accuracy >= 95) {
      return 2.0; // Great prediction: 2x stake
    } else if (accuracy >= 90) {
      return 1.0; // Good prediction: 1x stake (break-even)
    }
    
    return 0; // Below minimal accuracy - no reward
  }

  /**
   * Calculate reward based on accuracy percentage with new multipliers:
   * - ≥ 99.5%: 3.0x multiplier
   * - ≥ 98%: 2.5x multiplier  
   * - ≥ 95%: 2.0x multiplier
   * - ≥ 90%: 1.0x multiplier (minimal threshold for reward)
   * - < 90%: 0x multiplier (no reward - below minimal accuracy)
   */
  private calculateReward(stakeAmount: number, accuracy: number): number {
    const multiplier = this.calculateAccuracyMultiplier(accuracy);
    return Math.floor(stakeAmount * multiplier);
  }

  getTargetTime(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '1h':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case '6h':
        return new Date(now.getTime() + 6 * 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 60 * 60 * 1000);
    }
  }
}

export const predictionService = new PredictionService();
