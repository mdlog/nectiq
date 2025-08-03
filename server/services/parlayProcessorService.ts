import type { IStorage } from '../storage.js';

export class ParlayProcessorService {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  // Process expired parlay prediction coins by setting their end prices
  async processExpiredParlayPredictions() {
    try {
      console.log('🔍 [PARLAY-PROCESSOR] Checking for expired parlay prediction coins...');
      
      const expiredCoins = await this.storage.getExpiredParlayPredictionCoins();
      
      if (expiredCoins.length === 0) {
        console.log('✅ [PARLAY-PROCESSOR] No expired parlay prediction coins found');
        return;
      }

      console.log(`🔍 [PARLAY-PROCESSOR] Found ${expiredCoins.length} expired parlay prediction coins`);

      // Get current prices for all cryptocurrencies
      const cryptos = await this.storage.getAllCryptocurrencies();
      const priceMap = new Map();
      for (const crypto of cryptos) {
        priceMap.set(crypto.id, parseFloat(crypto.currentPrice || '0'));
      }

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

        // Update the coin with end price and correctness
        await this.storage.updateParlayPredictionCoinEndPrice(
          coinData.id,
          currentPrice,
          wasCorrect
        );

        console.log(`📸 [PARLAY-PROCESSOR] Updated ${coinData.cryptocurrency}: ${coinData.prediction} prediction, Start: $${startPrice}, End: $${currentPrice}, Correct: ${wasCorrect}`);
      }

      // Now process any parlays that have all coins with end prices set
      await this.processParlaysWithAllCoinsCompleted();

    } catch (error) {
      console.error('❌ [PARLAY-PROCESSOR] Error processing expired parlay predictions:', error);
    }
  }

  // Process parlays where all individual coin predictions have been completed
  private async processParlaysWithAllCoinsCompleted() {
    try {
      const activeParlays = await this.storage.getActiveParlayPredictions();
      
      for (const parlay of activeParlays) {
        const coins = parlay.coins || [];
        
        // Check if all coins have endPrice set
        const allCoinsCompleted = coins.every((coin: any) => coin.endPrice !== null);
        
        if (allCoinsCompleted && coins.length > 0) {
          // Count correct predictions
          const correctCount = coins.filter((coin: any) => coin.isCorrect === true).length;
          
          // Parlay wins only if ALL predictions are correct
          const parlayWon = correctCount === coins.length;
          const status = parlayWon ? 'won' : 'lost';
          const rewardAmount = parlayWon ? parlay.stakeAmount * parlay.totalMultiplier : 0;
          
          // Update parlay result
          await this.storage.updateParlayPredictionResult(
            parlay.id,
            status,
            rewardAmount,
            correctCount
          );

          // If parlay won, credit the user's balance
          if (parlayWon && rewardAmount > 0) {
            const user = await this.storage.getUser(parlay.userId);
            if (user) {
              await this.storage.updateUserBalance(parlay.userId, user.balance + rewardAmount);
              console.log(`🏆 [PARLAY-PROCESSOR] Parlay ${parlay.id} WON! User ${parlay.userId} credited ${rewardAmount} NTIQ`);
            }
          } else {
            console.log(`❌ [PARLAY-PROCESSOR] Parlay ${parlay.id} LOST. ${correctCount}/${coins.length} predictions correct`);
          }
        }
      }
    } catch (error) {
      console.error('❌ [PARLAY-PROCESSOR] Error processing completed parlays:', error);
    }
  }
}