import { storage } from '../storage';
import { cryptoService } from './cryptoService';
import { BalanceService } from './balanceService';
import { PredictionInsuranceService } from './predictionInsuranceService';
import { blockchainService } from './blockchainService';
import { predictionStakingService } from './predictionStakingService';
import { logger } from '../../shared/logger';

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

  async checkAndProcessCompletedPredictions(): Promise<void> {
    try {
      // Get all completed predictions that don't have blockchain reward hash
      const completedPredictions = await storage.getCompletedPredictionsWithoutBlockchainReward();

      if (completedPredictions.length === 0) {
        console.log('✅ [PREDICTION-PROCESSOR] No completed predictions without blockchain rewards found');
        return;
      }

      console.log(`🔍 [PREDICTION-PROCESSOR] Found ${completedPredictions.length} completed predictions without blockchain rewards`);

      for (const prediction of completedPredictions) {
        await this.processCompletedPredictionReward(prediction);
      }
    } catch (error) {
      console.error('❌ [PREDICTION-PROCESSOR] Error processing completed predictions:', error);
    }
  }

  async processPrediction(predictionId: number): Promise<void> {
    const prediction = await storage.getPrediction(predictionId);
    if (!prediction) {
      return;
    }

    // Process expired pending predictions (original logic)
    if (prediction.status === 'pending') {
      // Original logic for pending predictions
    } else if (prediction.status === 'completed') {
      // NEW: Process completed predictions that don't have blockchain reward hash
      await this.processCompletedPredictionReward(prediction);
      return;
    } else {
      // Other statuses - no processing needed
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

      // Process insurance claim if applicable (automatically refunds if prediction lost)
      await PredictionInsuranceService.processInsuranceClaim(predictionId);

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

            // BLOCKCHAIN INTEGRATION: Release reward on smart contract
            if (user.walletAddress && (prediction as any).blockchainStakeHash) {
              try {
                // Try with database ID first
                let blockchainPredictionId = blockchainService.generatePredictionId(predictionId);
                let txHash = null;

                try {
                  txHash = await predictionStakingService.releaseReward({
                    predictionId: blockchainPredictionId,
                    actualPrice: prediction.actualPrice.toString()
                  });
                  logger.info(`🔗 [BLOCKCHAIN] Prediction ${predictionId} reward released with database ID: ${txHash}`);
                } catch (dbIdError) {
                  logger.warn(`⚠️ [BLOCKCHAIN] Failed with database ID, trying alternative methods:`, dbIdError.message);

                  // Try to extract prediction ID from blockchain transaction
                  try {
                    const { blockchainService } = await import('./blockchainService');
                    const provider = blockchainService.getProvider();
                    const tx = await provider.getTransaction((prediction as any).blockchainStakeHash);

                    if (tx && tx.data) {
                      // Extract prediction ID from transaction data (first parameter after function selector)
                      const data = tx.data.substring(10); // Remove function selector
                      const predictionIdHex = '0x' + data.substring(0, 64);

                      logger.info(`🔍 [BLOCKCHAIN] Extracted prediction ID from transaction: ${predictionIdHex}`);

                      txHash = await predictionStakingService.releaseReward({
                        predictionId: predictionIdHex,
                        actualPrice: prediction.actualPrice.toString()
                      });

                      logger.info(`🔗 [BLOCKCHAIN] Prediction ${predictionId} reward released with extracted ID: ${txHash}`);
                    }
                  } catch (extractError) {
                    logger.error(`❌ [BLOCKCHAIN] Failed to extract prediction ID from transaction:`, extractError);
                    throw new Error(`Failed to release reward: ${extractError.message}`);
                  }
                }

                if (txHash) {
                  // Update prediction with reward transaction hash
                  await storage.updatePrediction(predictionId, {
                    blockchainRewardHash: txHash
                  });
                  logger.info(`✅ [BLOCKCHAIN] Prediction ${predictionId} reward released successfully: ${txHash}`);
                }
              } catch (blockchainError) {
                logger.error(`❌ [BLOCKCHAIN] Failed to release reward on blockchain:`, blockchainError);
                // Don't throw error - reward is still processed in database
              }
            }
          } catch (error) {
            console.error(`❌ PREDICTION REWARD ERROR: Failed to process reward for prediction ${predictionId}:`, error);
          }
        } else {
          console.log(`📊 PREDICTION COMPLETED: User ${user.username} - No reward (${accuracy.toFixed(2)}% accuracy)`);

          // BLOCKCHAIN INTEGRATION: Forfeit stake on smart contract
          if (user.walletAddress && (prediction as any).blockchainStakeHash) {
            try {
              const blockchainPredictionId = blockchainService.generatePredictionId(predictionId);
              const txHash = await predictionStakingService.forfeitStake({
                predictionId: blockchainPredictionId,
                userAddress: user.walletAddress
              });

              // Update prediction with forfeit transaction hash
              await storage.updatePrediction(predictionId, {
                blockchainRewardHash: txHash
              });

              logger.info(`🔗 [BLOCKCHAIN] Prediction ${predictionId} stake forfeited on blockchain: ${txHash}`);
            } catch (blockchainError) {
              logger.error(`❌ [BLOCKCHAIN] Failed to forfeit stake on blockchain:`, blockchainError);
            }
          }
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

  async processCompletedPredictionReward(prediction: any): Promise<void> {
    try {
      console.log(`🔍 [BLOCKCHAIN-REWARD] Processing completed prediction ${prediction.id} for blockchain reward...`);

      // Check if prediction has blockchain stake hash
      if (!prediction.blockchainStakeHash) {
        console.log(`⚠️ [BLOCKCHAIN-REWARD] Prediction ${prediction.id} has no blockchain stake hash - skipping`);
        return;
      }

      // Check if prediction already has blockchain reward hash
      if (prediction.blockchainRewardHash) {
        console.log(`✅ [BLOCKCHAIN-REWARD] Prediction ${prediction.id} already has blockchain reward hash - skipping`);
        return;
      }

      // Check if prediction has reward amount
      if (!prediction.rewardAmount || prediction.rewardAmount <= 0) {
        console.log(`⚠️ [BLOCKCHAIN-REWARD] Prediction ${prediction.id} has no reward amount - skipping`);
        return;
      }

      // Get user information
      const user = await storage.getUser(prediction.userId);
      if (!user || !user.walletAddress) {
        console.log(`⚠️ [BLOCKCHAIN-REWARD] Prediction ${prediction.id} has no user or wallet address - skipping`);
        return;
      }

      console.log(`💰 [BLOCKCHAIN-REWARD] Processing reward for prediction ${prediction.id}:`);
      console.log(`   User: ${user.username}`);
      console.log(`   Wallet: ${user.walletAddress}`);
      console.log(`   Reward Amount: ${prediction.rewardAmount} NTIQ`);
      console.log(`   Accuracy: ${prediction.accuracy}%`);
      console.log(`   Blockchain Stake Hash: ${prediction.blockchainStakeHash}`);

      // Try to release reward on blockchain
      try {
        let txHash = null;

        // Use stored blockchainPredictionId if available, otherwise generate from database ID
        let blockchainPredictionId = prediction.blockchainPredictionId || blockchainService.generatePredictionId(prediction.id);

        if (prediction.blockchainPredictionId) {
          console.log(`🔍 [BLOCKCHAIN-REWARD] Using stored blockchain prediction ID: ${prediction.blockchainPredictionId}`);
        } else {
          console.log(`🔍 [BLOCKCHAIN-REWARD] No stored blockchain prediction ID, generating from database ID: ${blockchainPredictionId}`);
        }

        try {
          txHash = await predictionStakingService.releaseReward({
            predictionId: blockchainPredictionId,
            actualPrice: prediction.actualPrice.toString()
          });
          logger.info(`🔗 [BLOCKCHAIN-REWARD] Prediction ${prediction.id} reward released with blockchain ID: ${txHash}`);
        } catch (blockchainIdError) {
          logger.warn(`⚠️ [BLOCKCHAIN-REWARD] Failed with stored blockchain ID, trying alternative methods:`, blockchainIdError.message);

          // Try to extract prediction ID from blockchain transaction
          try {
            const { blockchainService } = await import('./blockchainService');
            const provider = blockchainService.getProvider();
            const tx = await provider.getTransaction(prediction.blockchainStakeHash);

            if (tx && tx.data) {
              // Extract prediction ID from transaction data (first parameter after function selector)
              const data = tx.data.substring(10); // Remove function selector
              const predictionIdHex = '0x' + data.substring(0, 64);

              logger.info(`🔍 [BLOCKCHAIN-REWARD] Extracted prediction ID from transaction: ${predictionIdHex}`);

              txHash = await predictionStakingService.releaseReward({
                predictionId: predictionIdHex,
                actualPrice: prediction.actualPrice.toString()
              });

              logger.info(`🔗 [BLOCKCHAIN-REWARD] Prediction ${prediction.id} reward released with extracted ID: ${txHash}`);
            }
          } catch (extractError) {
            logger.error(`❌ [BLOCKCHAIN-REWARD] Failed to extract prediction ID from transaction:`, extractError);
            throw new Error(`Failed to release reward: ${extractError.message}`);
          }
        }

        if (txHash) {
          // Update prediction with reward transaction hash
          await storage.updatePrediction(prediction.id, {
            blockchainRewardHash: txHash
          });
          logger.info(`✅ [BLOCKCHAIN-REWARD] Prediction ${prediction.id} reward released successfully: ${txHash}`);
          console.log(`✅ [BLOCKCHAIN-REWARD] Successfully processed reward for prediction ${prediction.id}`);
        } else {
          logger.error(`❌ [BLOCKCHAIN-REWARD] Failed to get transaction hash for prediction ${prediction.id}`);
        }
      } catch (blockchainError) {
        logger.error(`❌ [BLOCKCHAIN-REWARD] Failed to release reward on blockchain for prediction ${prediction.id}:`, blockchainError);
        console.log(`❌ [BLOCKCHAIN-REWARD] Failed to process blockchain reward for prediction ${prediction.id}: ${blockchainError.message}`);
      }
    } catch (error) {
      console.error(`❌ [BLOCKCHAIN-REWARD] Error processing completed prediction ${prediction.id}:`, error);
    }
  }
}

export const predictionService = new PredictionService();
