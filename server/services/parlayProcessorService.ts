import { db } from '../db.js';
import { parlayPredictionCoins, parlayPredictions } from '@shared/schema';
import { eq, and, lte, isNull } from 'drizzle-orm';
import { cryptoService } from './cryptoService.js';
import { BalanceService } from './balanceService.js';
import { storage } from '../storage.js';

export class ParlayProcessorService {
  // Process expired parlay prediction coins by setting their end prices
  async processExpiredParlayPredictions() {
    try {
      console.log('🔍 [PARLAY-PROCESSOR] Checking for expired parlay prediction coins...');

      // Get all expired parlay prediction coins that haven't been processed yet
      const now = new Date();
      const expiredCoins = await db
        .select()
        .from(parlayPredictionCoins)
        .leftJoin(parlayPredictions, eq(parlayPredictionCoins.parlayId, parlayPredictions.id))
        .where(
          and(
            lte(parlayPredictionCoins.targetTime, now),
            isNull(parlayPredictionCoins.endPrice),
            eq(parlayPredictions.status, 'active')
          )
        );

      if (expiredCoins.length === 0) {
        console.log('✅ [PARLAY-PROCESSOR] No expired parlay prediction coins found');
        return;
      }

      console.log(`🔍 [PARLAY-PROCESSOR] Found ${expiredCoins.length} expired parlay prediction coins`);

      // Get current prices for processing
      const currentPrices = await cryptoService.getCurrentPrices();
      const priceMap = new Map(currentPrices.map(p => [p.id, p.current_price]));

      for (const expiredCoin of expiredCoins) {
        const coinData = expiredCoin.parlay_prediction_coins;
        const parlayData = expiredCoin.parlay_predictions;

        if (!coinData || !parlayData) continue;

        const currentPrice = priceMap.get(coinData.cryptocurrency) || 0;
        const startPrice = parseFloat(coinData.startPrice || '0');

        // Determine if prediction was correct
        const priceWentUp = currentPrice > startPrice;
        const wasCorrect = (coinData.prediction === 'up' && priceWentUp) ||
          (coinData.prediction === 'down' && !priceWentUp);

        // Update the coin with end price and correctness directly via database
        await db
          .update(parlayPredictionCoins)
          .set({
            endPrice: currentPrice.toString(),
            isCorrect: wasCorrect
          })
          .where(eq(parlayPredictionCoins.id, coinData.id));

        console.log(`📸 [PARLAY-PROCESSOR] Updated ${coinData.cryptocurrency}: ${coinData.prediction} prediction, Start: $${startPrice}, End: $${currentPrice}, Correct: ${wasCorrect}`);
      }

      console.log('✅ [PARLAY-PROCESSOR] Successfully processed all expired coins');

      // After processing all expired coins, check for completed parlays and award rewards
      await this.processCompletedParlays();

    } catch (error) {
      console.error('❌ [PARLAY-PROCESSOR] Error processing expired parlay predictions:', error);
    }
  }

  // Process completed parlays and award rewards
  async processCompletedParlays() {
    try {
      console.log('🎯 [PARLAY-REWARDS] Checking for completed parlays...');

      // Get all active parlays that might be completed
      const activeParlays = await db
        .select()
        .from(parlayPredictions)
        .where(eq(parlayPredictions.status, 'active'));

      if (activeParlays.length === 0) {
        console.log('✅ [PARLAY-REWARDS] No active parlays found');
        return;
      }

      console.log(`🔍 [PARLAY-REWARDS] Found ${activeParlays.length} active parlays to check`);

      for (const parlay of activeParlays) {
        await this.checkAndProcessParlayCompletion(parlay);
      }

      console.log('✅ [PARLAY-REWARDS] Finished processing completed parlays');

    } catch (error) {
      console.error('❌ [PARLAY-REWARDS] Error processing completed parlays:', error);
    }
  }

  // Check if a parlay is completed and process rewards
  async checkAndProcessParlayCompletion(parlay: any) {
    try {
      // Get all coins for this parlay
      const parlayCoins = await db
        .select()
        .from(parlayPredictionCoins)
        .where(eq(parlayPredictionCoins.parlayId, parlay.id));

      if (parlayCoins.length === 0) {
        console.log(`⚠️ [PARLAY-REWARDS] Parlay ${parlay.id} has no coins`);
        return;
      }

      // Check if all coins have been processed (have endPrice and isCorrect)
      const processedCoins = parlayCoins.filter(coin =>
        coin.endPrice !== null && coin.isCorrect !== null
      );

      if (processedCoins.length !== parlayCoins.length) {
        console.log(`🕐 [PARLAY-REWARDS] Parlay ${parlay.id} not yet complete: ${processedCoins.length}/${parlayCoins.length} coins processed`);
        return; // Not all coins processed yet
      }

      console.log(`🎯 [PARLAY-REWARDS] Parlay ${parlay.id} is complete, processing rewards...`);

      // Check if all predictions are correct (parlay wins only if ALL are correct)
      const allCorrect = processedCoins.every(coin => coin.isCorrect === true);

      if (allCorrect) {
        // Calculate parlay reward using compound multiplier system
        const totalReward = this.calculateParlayReward(parlay.stakeAmount, processedCoins);

        console.log(`🏆 [PARLAY-REWARDS] Parlay ${parlay.id} WON! Stake: ${parlay.stakeAmount}, Reward: ${totalReward}`);

        // Award reward using BalanceService
        const balanceResult = await BalanceService.processTransaction({
          userId: parlay.userId,
          type: 'parlay_reward',
          amount: totalReward,
          description: `Parlay victory reward - ${processedCoins.length} coins, ${totalReward} NTIQ`,
          relatedId: parlay.id,
          metadata: {
            stakeAmount: parlay.stakeAmount,
            totalCoins: processedCoins.length,
            multiplier: totalReward / parlay.stakeAmount,
            coinResults: processedCoins.map(coin => ({
              cryptocurrency: coin.cryptocurrency,
              prediction: coin.prediction,
              isCorrect: coin.isCorrect,
              duration: coin.duration
            }))
          }
        }, storage);

        console.log(`✅ [PARLAY-REWARDS] Successfully awarded ${totalReward} NTIQ to user ${parlay.userId}`);

        // Update parlay status to completed with win
        await db
          .update(parlayPredictions)
          .set({
            status: 'completed',
            result: 'win',
            rewardAmount: totalReward,
            completedAt: new Date()
          })
          .where(eq(parlayPredictions.id, parlay.id));

        // BLOCKCHAIN INTEGRATION: Release compound reward on smart contract
        try {
          const user = await storage.getUser(parlay.userId);
          if (user?.walletAddress && (parlay as any).blockchainStakeHash) {
            const { blockchainService } = await import('./blockchainService');
            const { parlayStakingService } = await import('./parlayStakingService');

            const parlayId = blockchainService.generateParlayId(parlay.id);
            const multiplier = totalReward / parlay.stakeAmount;
            const txHash = await parlayStakingService.releaseCompoundReward({
              parlayId,
              userAddress: user.walletAddress,
              multiplier
            });

            // Update parlay with reward transaction hash
            await db.update(parlayPredictions)
              .set({ blockchainRewardHash: txHash })
              .where(eq(parlayPredictions.id, parlay.id));

            const { logger } = await import('../../shared/logger');
            logger.info(`🔗 [BLOCKCHAIN] Parlay ${parlay.id} reward released on blockchain: ${txHash}`);
          }
        } catch (blockchainError) {
          const { logger } = await import('../../shared/logger');
          logger.error(`❌ [BLOCKCHAIN] Failed to release parlay reward on blockchain:`, blockchainError);
        }

      } else {
        console.log(`💔 [PARLAY-REWARDS] Parlay ${parlay.id} LOST - at least one prediction was wrong`);

        // Update parlay status to completed with loss (no reward)
        await db
          .update(parlayPredictions)
          .set({
            status: 'completed',
            result: 'lose',
            rewardAmount: 0,
            completedAt: new Date()
          })
          .where(eq(parlayPredictions.id, parlay.id));

        // BLOCKCHAIN INTEGRATION: Forfeit parlay stake on smart contract
        try {
          const user = await storage.getUser(parlay.userId);
          if (user?.walletAddress && (parlay as any).blockchainStakeHash) {
            const { blockchainService } = await import('./blockchainService');
            const { parlayStakingService } = await import('./parlayStakingService');

            const parlayId = blockchainService.generateParlayId(parlay.id);
            const txHash = await parlayStakingService.forfeitStake({
              parlayId,
              userAddress: user.walletAddress
            });

            // Update parlay with forfeit transaction hash
            await db.update(parlayPredictions)
              .set({ blockchainRewardHash: txHash })
              .where(eq(parlayPredictions.id, parlay.id));

            const { logger } = await import('../../shared/logger');
            logger.info(`🔗 [BLOCKCHAIN] Parlay ${parlay.id} stake forfeited on blockchain: ${txHash}`);
          }
        } catch (blockchainError) {
          const { logger } = await import('../../shared/logger');
          logger.error(`❌ [BLOCKCHAIN] Failed to forfeit parlay stake on blockchain:`, blockchainError);
        }
      }

    } catch (error) {
      console.error(`❌ [PARLAY-REWARDS] Error processing parlay ${parlay.id}:`, error);
    }
  }

  // Calculate parlay reward using frontend-synchronized multiplier system
  private calculateParlayReward(stakeAmount: number, coins: any[]): number {
    // Duration multipliers matching frontend exactly
    const getDurationMultiplier = (duration: string): number => {
      switch (duration) {
        case '1h': return 1.2;
        case '6h': return 1.5;
        case '24h': return 2.0;
        case '7d': return 3.0;
        default: return 1.2;
      }
    };

    // Calculate total multiplier using frontend formula: (1.5 × Duration Multiplier)^Number_of_Predictions
    // Since all coins must have same duration, we can use the first coin's duration
    const duration = coins[0]?.duration || '1h';
    const durationMultiplier = getDurationMultiplier(duration);
    const numberOfPredictions = coins.length;

    const totalMultiplier = Math.pow(1.5 * durationMultiplier, numberOfPredictions);

    // Calculate final reward
    const grossReward = Math.round(stakeAmount * totalMultiplier);

    // Apply 6% platform fee (matching frontend documentation)
    const platformFee = Math.round(grossReward * 0.06);
    const netReward = grossReward - platformFee;

    console.log(`💰 [PARLAY-REWARD-CALC] Stake: ${stakeAmount}, Predictions: ${numberOfPredictions}, Duration: ${duration} (${durationMultiplier}x), Base Formula: (1.5 × ${durationMultiplier})^${numberOfPredictions} = ${totalMultiplier.toFixed(2)}x, Gross: ${grossReward}, Fee (6%): ${platformFee}, Net: ${netReward}`);

    return netReward;
  }
}