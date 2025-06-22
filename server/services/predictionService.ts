import { storage } from '../storage';
import { cryptoService } from './cryptoService';

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

      // Update user stats and balance
      const user = await storage.getUser(prediction.userId);
      if (user) {
        const newBalance = user.balance - prediction.stakeAmount + rewardAmount;
        const newTotalPredictions = user.totalPredictions + 1;
        const newCorrectPredictions = user.correctPredictions + (accuracy <= 5 ? 1 : 0);
        const newTotalRewards = user.totalRewards + rewardAmount;

        await storage.updateUserBalance(prediction.userId, newBalance);
        await storage.updateUserStats(prediction.userId, newTotalPredictions, newCorrectPredictions, newTotalRewards);

        // Create reward record
        if (rewardAmount > 0) {
          await storage.createReward({
            userId: prediction.userId,
            predictionId: predictionId,
            amount: rewardAmount,
            description: `${prediction.cryptocurrency.toUpperCase()} Prediction Reward`
          });
        }
      }
    } catch (error) {
      console.error(`Error processing prediction ${predictionId}:`, error);
    }
  }

  private calculateAccuracy(predictedPrice: number, actualPrice: number): number {
    return Math.abs((predictedPrice - actualPrice) / actualPrice) * 100;
  }

  private calculateReward(stakeAmount: number, accuracy: number): number {
    if (accuracy <= 0.1) {
      return stakeAmount * 5; // Perfect prediction: 5x stake
    } else if (accuracy <= 1) {
      return stakeAmount * 3; // Excellent prediction: 3x stake
    } else if (accuracy <= 5) {
      return Math.floor(stakeAmount * 1.5); // Good prediction: 1.5x stake
    } else {
      return 0; // Poor prediction: lose stake
    }
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
