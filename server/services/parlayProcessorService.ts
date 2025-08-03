import { db } from '../db.js';
import { parlayPredictionCoins, parlayPredictions } from '@shared/schema';
import { eq, and, lte, isNull } from 'drizzle-orm';
import { cryptoService } from './cryptoService.js';

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

    } catch (error) {
      console.error('❌ [PARLAY-PROCESSOR] Error processing expired parlay predictions:', error);
    }
  }
}