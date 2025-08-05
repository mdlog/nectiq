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
              cryptocurrency: prediction.cryptocurrency,
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
   * Calculate accuracy multiplier based on accuracy percentage (NEW SYSTEM):
   * - ≥ 99.5%: 3.0x multiplier
   * - ≥ 98%: 2.0x multiplier  
   * - ≥ 95%: 1.5x multiplier
   * - ≥ 90%: 0.9x multiplier (User rugi 10% stake, platform untung 10%)
   * - < 90%: 0x multiplier (Stake hangus, platform untung 100%)
   */
  private calculateAccuracyMultiplier(accuracy: number): number {
    if (accuracy >= 99.5) {
      return 3.0; // Perfect prediction: 3x stake
    } else if (accuracy >= 98) {
      return 2.0; // Excellent prediction: 2x stake (was 2.5x)
    } else if (accuracy >= 95) {
      return 1.5; // Great prediction: 1.5x stake (was 2x)
    } else if (accuracy >= 90) {
      return 0.9; // Good prediction: 0.9x stake (user rugi 10%, platform untung 10%)
    }
    
    return 0; // Below minimal accuracy - stake hangus (platform untung 100%)
  }

  /**
   * Calculate reward based on accuracy percentage with NEW SYSTEM:
   * - ≥ 99.5%: 3.0x multiplier
   * - ≥ 98%: 2.0x multiplier  
   * - ≥ 95%: 1.5x multiplier
   * - ≥ 90%: 0.9x multiplier (User rugi 10% stake, platform untung 10%)
   * - < 90%: 0x multiplier (Stake hangus, platform untung 100%)
   * 
   * Fee dari Winnings: Untuk reward 1.5x, 2.0x, 3.0x - ambil 3-5% dari reward
   * Untuk 0.9x multiplier: fee sudah tercakup dalam loss 10%
   */
  private calculateReward(stakeAmount: number, accuracy: number): number {
    const multiplier = this.calculateAccuracyMultiplier(accuracy);
    const grossReward = stakeAmount * multiplier;
    
    // Platform fee system: 3-5% dari reward untuk winning predictions (1.5x, 2.0x, 3.0x)
    // Untuk 0.9x multiplier: fee sudah tercakup dalam loss 10%
    let netReward = grossReward;
    
    if (multiplier >= 1.5) {
      const platformFeeRate = 0.04; // 4% platform fee untuk winning predictions
      const platformFee = grossReward * platformFeeRate;
      netReward = grossReward - platformFee;
      
      console.log(`💰 PLATFORM FEE: ${platformFeeRate * 100}% fee applied to ${multiplier}x multiplier reward`);
      console.log(`💰 Gross Reward: ${grossReward} NTIQ, Platform Fee: ${platformFee} NTIQ, Net Reward: ${netReward} NTIQ`);
    }
    
    return Math.floor(netReward);
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
