import { storage } from '../storage';
import axios from 'axios';
import { BalanceService } from './balanceService';
import { db } from '../db';
import { survivalTournaments } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class SurvivalRoundService {
  private static instance: SurvivalRoundService;
  private roundCheckers: Map<number, NodeJS.Timeout> = new Map();
  private roundIntervals: Map<number, NodeJS.Timeout> = new Map();

  static getInstance(): SurvivalRoundService {
    if (!SurvivalRoundService.instance) {
      SurvivalRoundService.instance = new SurvivalRoundService();
      // Start the global round checker for automatic elimination processing
      SurvivalRoundService.instance.startGlobalRoundChecker();
    }
    return SurvivalRoundService.instance;
  }

  // Start global round checker that monitors all active tournaments
  private startGlobalRoundChecker() {
    console.log('🚀 Starting global survival round checker for automatic elimination...');

    // Check every 10 seconds for expired rounds (faster debugging)
    setInterval(async () => {
      try {
        await this.checkAllActiveTournaments();
      } catch (error) {
        console.error('Error in global round checker:', error);
      }
    }, 10000); // Check every 10 seconds

    // Also run initial check after 5 seconds
    setTimeout(async () => {
      console.log('🚀 [CHECKER] Running initial check after server startup...');
      await this.checkAllActiveTournaments();
    }, 5000);
  }

  // Check all active tournaments for expired rounds
  private async checkAllActiveTournaments() {
    try {
      console.log(`🔍 [CHECKER] Running global round checker at ${new Date().toISOString()}`);
      const activeTournaments = await storage.getActiveSurvivalTournaments();

      if (activeTournaments.length > 0) {
        console.log(`🔍 [CHECKER] Found ${activeTournaments.length} active tournaments for expired rounds...`);
        for (const tournament of activeTournaments) {
          console.log(`🔍 [CHECKER] Checking tournament ${tournament.id} (${tournament.title}) - Status: ${tournament.status}`);
          await this.checkAndProcessExpiredRounds(tournament.id);
        }
      } else {
        console.log(`🔍 [CHECKER] No active tournaments found`);
      }
    } catch (error) {
      console.error('[CHECKER] Error checking active tournaments:', error);
    }
  }

  // Check specific tournament for expired rounds and process them
  private async checkAndProcessExpiredRounds(tournamentId: number) {
    try {
      const currentRound = await storage.getCurrentRound(tournamentId);
      if (!currentRound) {
        console.log(`🔍 [CHECKER] Tournament ${tournamentId} has no current round`);
        return;
      }

      const now = new Date();
      const endTime = new Date(currentRound.endTime);
      const timeLeft = endTime.getTime() - now.getTime();

      console.log(`🔍 [CHECKER] Tournament ${tournamentId} Round ${currentRound.roundNumber}: Status=${currentRound.status}, TimeLeft=${Math.round(timeLeft / 1000)}s`);

      // Check if current round has expired
      if (now >= endTime && currentRound.status === 'active') {
        console.log(`⏰ [CHECKER] Round ${currentRound.roundNumber} EXPIRED for tournament ${tournamentId}, processing...`);
        await this.processExpiredRound(tournamentId, currentRound.id);
      } else if (currentRound.status === 'completed') {
        console.log(`✅ [CHECKER] Round ${currentRound.roundNumber} already completed for tournament ${tournamentId}`);
      }
    } catch (error) {
      console.error(`[CHECKER] Error checking expired rounds for tournament ${tournamentId}:`, error);
    }
  }

  // Process an expired round: complete it, evaluate eliminations, start next round
  private async processExpiredRound(tournamentId: number, roundId: number) {
    try {
      const round = await storage.getRound(roundId);
      if (!round) return;

      console.log(`🔄 Processing expired Round ${round.roundNumber} for tournament ${tournamentId}`);

      // Get tournament info to determine cryptocurrency
      const tournament = await storage.getSurvivalTournament(tournamentId);
      if (!tournament) {
        console.error(`Tournament ${tournamentId} not found`);
        return;
      }

      // Get current price for the tournament's cryptocurrency
      const currentPrice = await this.getCurrentCryptoPrice(tournament.cryptocurrency);

      // Complete the current round
      await this.completeRound(roundId, currentPrice);

      // Evaluate participant predictions and eliminate wrong ones
      await this.evaluateAndEliminateParticipants(tournamentId, round.roundNumber, round.startPrice, currentPrice);

      // Check if tournament should continue
      const activeParticipants = await storage.getActiveParticipants(tournamentId);

      if (activeParticipants.length <= 1) {
        // Tournament is finished - Single winner
        await this.finishTournament(tournamentId, activeParticipants[0]?.userId || null);
        console.log(`🏆 Tournament ${tournamentId} finished! Winner: ${activeParticipants[0]?.username || 'No winner'}`);
      } else if (round.roundNumber < 3) {
        // Start next round
        await this.startNextRound(tournamentId, round.roundNumber + 1, currentPrice);
        console.log(`▶️ Started Round ${round.roundNumber + 1} for tournament ${tournamentId}`);
      } else {
        // Tournament reached maximum rounds with multiple survivors - Prize Sharing
        await this.finishTournamentWithPrizeSharing(tournamentId, activeParticipants);
        console.log(`🏆 Tournament ${tournamentId} finished! Prize shared among ${activeParticipants.length} survivors`);
      }
    } catch (error) {
      console.error(`Error processing expired round:`, error);
    }
  }

  // Get current price for any cryptocurrency from CoinGecko API
  private async getCurrentCryptoPrice(cryptoId: string): Promise<number> {
    try {
      const response = await axios.get('http://localhost:5000/api/crypto/prices');
      const cryptoData = response.data.find((crypto: any) => crypto.id === cryptoId);
      return cryptoData?.current_price || 0;
    } catch (error) {
      console.error(`Error fetching ${cryptoId} price:`, error);
      throw new Error(`Failed to fetch current ${cryptoId} price`);
    }
  }

  // Get current Bitcoin price from CoinGecko API (backward compatibility)
  private async getCurrentBitcoinPrice(): Promise<number> {
    return this.getCurrentCryptoPrice('bitcoin');
  }

  // Complete a round with end price
  private async completeRound(roundId: number, endPrice: number) {
    await storage.completeRound(roundId, endPrice);
  }

  // Evaluate participants and eliminate those with wrong predictions
  private async evaluateAndEliminateParticipants(tournamentId: number, roundNumber: number, startPrice: number, endPrice: number) {
    try {
      const participants = await storage.getTournamentParticipantsWithPredictions(tournamentId);

      // Determine actual price direction
      const actualDirection = endPrice > startPrice ? 'up' : 'down';

      console.log(`💰 Round ${roundNumber} result: ${startPrice} → ${endPrice} (${actualDirection.toUpperCase()})`);

      for (const participant of participants) {
        if (participant.status !== 'active') continue;

        // Check if participant made a prediction for this round
        const prediction = await storage.getParticipantRoundPrediction(participant.userId, tournamentId, roundNumber);

        if (!prediction) {
          // No prediction = automatic elimination
          await this.eliminateParticipant(participant.userId, tournamentId, roundNumber, 'No prediction made');
          console.log(`❌ ${participant.username} eliminated (No prediction)`);
        } else if (prediction.prediction !== actualDirection) {
          // Wrong prediction = elimination
          await this.eliminateParticipant(participant.userId, tournamentId, roundNumber, 'Wrong prediction');
          console.log(`❌ ${participant.username} eliminated (Predicted ${prediction.prediction.toUpperCase()}, actual ${actualDirection.toUpperCase()})`);
        } else {
          // Correct prediction = survives
          console.log(`✅ ${participant.username} survives (Correct prediction: ${prediction.prediction.toUpperCase()})`);
        }
      }
    } catch (error) {
      console.error('Error evaluating participants:', error);
    }
  }

  // Eliminate a participant
  private async eliminateParticipant(userId: number, tournamentId: number, roundNumber: number, reason: string) {
    await storage.eliminateParticipant(userId, tournamentId, roundNumber);
  }

  // Start next round with individual round duration
  private async startNextRound(tournamentId: number, roundNumber: number, startPrice: number) {
    try {
      const tournament = await storage.getSurvivalTournament(tournamentId);
      if (!tournament) throw new Error('Tournament not found');

      // Get individual round duration from database fields first
      let roundDuration = tournament.roundDuration; // Default fallback

      if (roundNumber === 1 && tournament.round1Duration) {
        roundDuration = tournament.round1Duration;
      } else if (roundNumber === 2 && tournament.round2Duration) {
        roundDuration = tournament.round2Duration;
      } else if (roundNumber === 3 && tournament.round3Duration) {
        roundDuration = tournament.round3Duration;
      } else if (tournament.individualRoundDurations) {
        try {
          const individualDurations = JSON.parse(tournament.individualRoundDurations);
          if (Array.isArray(individualDurations) && individualDurations[roundNumber - 1]) {
            roundDuration = individualDurations[roundNumber - 1];
          }
        } catch (error) {
          console.log(`Round ${roundNumber}: Error parsing individual durations, using default duration`);
        }
      }

      console.log(`🎯 Starting Round ${roundNumber} with ${roundDuration} minute duration and start price $${startPrice}`);

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + roundDuration * 60 * 1000);

      // Create new round using createSurvivalRound method
      const newRound = await storage.createSurvivalRound({
        tournamentId,
        roundNumber,
        cryptocurrency: tournament.cryptocurrency,
        startPrice: startPrice.toString(),
        endPrice: null,
        startTime,
        endTime,
        status: 'active',
        priceDirection: null,
        eliminatedCount: 0,
        survivorCount: 0
      });

      // Update tournament current round
      await storage.updateSurvivalTournament(tournamentId, {
        currentRound: roundNumber
      });

      console.log(`✅ Round ${roundNumber} created successfully for tournament ${tournamentId}`);
      console.log(`Round will end at: ${endTime.toISOString()}`);

    } catch (error) {
      console.error('Error starting next round:', error);
      throw error;
    }
  }

  // Award retroactive rewards to existing winners who haven't received them yet
  async awardRetroactiveRewards() {
    try {
      console.log('🔍 Checking for completed tournaments without awarded rewards...');

      // Get all completed tournaments with winners
      const completedTournaments = await storage.getCompletedTournamentsWithWinners();

      for (const tournament of completedTournaments) {
        // Check if winner already received reward
        const existingReward = await storage.checkTournamentRewardAwarded(tournament.id);

        if (!existingReward && tournament.prizePool > 0) {
          console.log(`🏆 Awarding retroactive reward: ${tournament.prizePool} NTIQ to winner ${tournament.winnerId} for tournament ${tournament.id}`);

          // CRITICAL: Use BalanceService for guaranteed real-time balance updates
          try {
            const balanceResult = await BalanceService.processSurvivalReward(
              tournament.winnerId,
              tournament.id,
              tournament.prizePool,
              storage
            );

            console.log(`✅ SURVIVAL REWARD: Tournament ${tournament.id} winner ${tournament.winnerId} received ${tournament.prizePool} NTIQ`);
          } catch (error) {
            console.error(`❌ SURVIVAL REWARD ERROR: Failed to process tournament ${tournament.id} reward:`, error);
            // Use BalanceService fallback method 
            const fallbackResult = await BalanceService.processTransaction({
              userId: tournament.winnerId,
              type: 'survival_tournament_reward',
              amount: tournament.prizePool,
              description: `Survival tournament reward: ${tournament.title}`,
              relatedId: tournament.id
            }, storage);

            console.log(`✅ Successfully awarded retroactive ${tournament.prizePool} NTIQ to tournament winner (fallback)`);
          }
        }
      }

      console.log('✅ Retroactive reward check completed');
    } catch (error) {
      console.error('Error awarding retroactive rewards:', error);
    }
  }

  // Finish tournament and declare winner
  private async finishTournament(tournamentId: number, winnerId: number | null) {
    try {
      if (winnerId) {
        await storage.setTournamentWinner(tournamentId, winnerId);

        // Award prize pool to winner
        const tournament = await storage.getSurvivalTournament(tournamentId);
        if (tournament && tournament.prizePool > 0) {
          console.log(`🏆 Awarding ${tournament.prizePool} NTIQ to winner (User ID: ${winnerId})`);

          // CRITICAL FIX: Use BalanceService for survival tournament rewards
          const balanceResult = await BalanceService.processTransaction({
            userId: winnerId,
            type: 'survival_tournament_reward',
            amount: tournament.prizePool,
            description: `Survival tournament reward: ${tournament.title}`,
            relatedId: tournamentId
          }, storage);

          console.log(`✅ Successfully awarded ${tournament.prizePool} NTIQ to tournament winner`);

          // BLOCKCHAIN INTEGRATION: Distribute prize on smart contract
          try {
            const winner = await storage.getUser(winnerId);
            if (winner?.walletAddress) {
              const { blockchainService } = await import('./blockchainService');
              const { tournamentPoolService } = await import('./tournamentPoolService');

              const blockchainTournamentId = blockchainService.generateTournamentId(tournamentId);
              const txHash = await tournamentPoolService.distributePrizes({
                tournamentId: blockchainTournamentId,
                winners: [winner.walletAddress],
                amounts: [tournament.prizePool.toString()]
              });

              // Update tournament with distribute transaction hash
              await db.update(survivalTournaments)
                .set({ blockchainDistributeHash: txHash })
                .where(eq(survivalTournaments.id, tournamentId));

              const { logger } = await import('../../shared/logger');
              logger.info(`🔗 [BLOCKCHAIN] Tournament ${tournamentId} prize distributed on blockchain: ${txHash}`);
            }
          } catch (blockchainError) {
            const { logger } = await import('../../shared/logger');
            logger.error(`❌ [BLOCKCHAIN] Failed to distribute tournament prize on blockchain:`, blockchainError);
          }
        }
      }
      await storage.updateTournamentStatus(tournamentId, 'completed');

      // Clear any interval for this tournament
      if (this.roundCheckers.has(tournamentId)) {
        clearTimeout(this.roundCheckers.get(tournamentId)!);
        this.roundCheckers.delete(tournamentId);
      }
    } catch (error) {
      console.error('Error finishing tournament:', error);
    }
  }

  // NEW: Finish tournament with prize sharing for multiple survivors
  private async finishTournamentWithPrizeSharing(tournamentId: number, survivors: any[]) {
    try {
      const tournament = await storage.getSurvivalTournament(tournamentId);
      if (!tournament) {
        console.error(`Tournament ${tournamentId} not found for prize sharing`);
        return;
      }

      if (tournament.prizePool > 0 && survivors.length > 0) {
        // Calculate prize per survivor (rounded down to avoid decimal issues)
        const prizePerSurvivor = Math.floor(tournament.prizePool / survivors.length);
        const remainingPrize = tournament.prizePool - (prizePerSurvivor * survivors.length);

        console.log(`💰 Sharing ${tournament.prizePool} NTIQ among ${survivors.length} survivors (${prizePerSurvivor} NTIQ each)`);

        // Award prize to each survivor
        for (let i = 0; i < survivors.length; i++) {
          const survivor = survivors[i];
          // First survivor gets any remaining NTIQ from rounding
          const finalAmount = i === 0 ? prizePerSurvivor + remainingPrize : prizePerSurvivor;

          await BalanceService.processTransaction({
            userId: survivor.userId,
            type: 'survival_tournament_shared_reward',
            amount: finalAmount,
            description: `Survival tournament shared prize (${survivors.length} survivors): ${tournament.title}`,
            relatedId: tournamentId
          }, storage);

          console.log(`✅ Awarded ${finalAmount} NTIQ to survivor ${survivor.username} (ID: ${survivor.userId})`);
        }

        // Set first survivor as "winner" for display purposes, but mark as shared
        await storage.setTournamentWinner(tournamentId, survivors[0].userId);
      }

      await storage.updateTournamentStatus(tournamentId, 'completed');

      // Clear any interval for this tournament
      if (this.roundCheckers.has(tournamentId)) {
        clearTimeout(this.roundCheckers.get(tournamentId)!);
        this.roundCheckers.delete(tournamentId);
      }

      console.log(`🎉 Prize sharing completed for tournament ${tournamentId}`);
    } catch (error) {
      console.error('Error finishing tournament with prize sharing:', error);
    }
  }

  // Process complete round cycle: end current round, eliminate players, start new round
  private async processRoundCycle(tournamentId: number) {
    try {
      // Get current active round
      const currentRound = await storage.getCurrentRound(tournamentId);
      if (!currentRound) {
        console.log(`No active round found for tournament ${tournamentId}`);
        return;
      }

      // End current round and calculate eliminations
      await this.endRound(currentRound.id);

      // Check if tournament should continue
      const activeParticipants = await storage.getActiveParticipants(tournamentId);

      if (activeParticipants.length <= 1) {
        // Tournament finished - declare winner
        await this.endTournament(tournamentId, activeParticipants[0]?.userId || null);
        return;
      }

      // Start new round
      await this.startNewRound(tournamentId);
    } catch (error) {
      console.error('Error processing round cycle:', error);
      throw error;
    }
  }

  // Start a new round
  private async startNewRound(tournamentId: number) {
    try {
      const tournament = await storage.getSurvivalTournament(tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get latest round number
      const rounds = await storage.getSurvivalRounds(tournamentId);
      const nextRoundNumber = rounds.length + 1;

      // Get current price as start price
      const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + tournament.cryptocurrency + '&vs_currencies=usd');
      const cryptoData = await cryptoResponse.json();
      const currentPrice = cryptoData[tournament.cryptocurrency]?.usd || 0;

      const startTime = new Date();

      // Use individual round duration based on round number
      let roundDuration = tournament.roundDuration; // Default fallback

      // Check for individual round durations in database fields first
      if (nextRoundNumber === 1 && tournament.round1Duration) {
        roundDuration = tournament.round1Duration;
        console.log(`Round ${nextRoundNumber}: Using individual duration of ${roundDuration} minutes from round1Duration field`);
      } else if (nextRoundNumber === 2 && tournament.round2Duration) {
        roundDuration = tournament.round2Duration;
        console.log(`Round ${nextRoundNumber}: Using individual duration of ${roundDuration} minutes from round2Duration field`);
      } else if (nextRoundNumber === 3 && tournament.round3Duration) {
        roundDuration = tournament.round3Duration;
        console.log(`Round ${nextRoundNumber}: Using individual duration of ${roundDuration} minutes from round3Duration field`);
      } else if (tournament.individualRoundDurations) {
        // Fallback to JSON string format if available
        try {
          const individualDurations = JSON.parse(tournament.individualRoundDurations);
          if (Array.isArray(individualDurations) && individualDurations[nextRoundNumber - 1]) {
            roundDuration = individualDurations[nextRoundNumber - 1];
            console.log(`Round ${nextRoundNumber}: Using individual duration of ${roundDuration} minutes from JSON`);
          } else {
            console.log(`Round ${nextRoundNumber}: Using default duration of ${roundDuration} minutes (individual duration not found in JSON)`);
          }
        } catch (error) {
          console.log(`Round ${nextRoundNumber}: Error parsing individual durations, using default duration of ${roundDuration} minutes`);
        }
      } else {
        console.log(`Round ${nextRoundNumber}: Using default duration of ${roundDuration} minutes (no individual durations set)`);
      }

      const endTime = new Date(startTime.getTime() + roundDuration * 60 * 1000);

      // Create new round
      const newRound = await storage.createSurvivalRound({
        tournamentId,
        roundNumber: nextRoundNumber,
        cryptocurrency: tournament.cryptocurrency,
        startTime,
        endTime,
        startPrice: currentPrice.toString(),
        status: 'active'
      });

      // Get active participants
      const activeParticipants = await storage.getActiveParticipants(tournamentId);

      // Update survivor count
      await storage.updateRoundSurvivorCount(newRound.id, activeParticipants.length);

      console.log(`Started round ${nextRoundNumber} for tournament ${tournamentId} with ${activeParticipants.length} participants`);
      console.log(`Round will end at: ${endTime.toISOString()}`);
      console.log(`Starting price: $${currentPrice}`);

      // Notify participants (via WebSocket or other mechanism)
      // This could be extended to send real-time notifications

    } catch (error) {
      console.error('Error starting new round:', error);
      throw error;
    }
  }

  // End current round and eliminate wrong predictors
  private async endRound(roundId: number) {
    try {
      const round = await storage.getSurvivalRound(roundId);
      if (!round) {
        throw new Error('Round not found');
      }

      // Get current price as end price
      const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + round.cryptocurrency + '&vs_currencies=usd');
      const cryptoData = await cryptoResponse.json();
      const endPrice = cryptoData[round.cryptocurrency]?.usd || 0;

      // Update round with end price and status
      await storage.updateRound(roundId, {
        endPrice: endPrice.toString(),
        status: 'completed',
        completedAt: new Date()
      });

      // Get all predictions for this round
      const predictions = await storage.getRoundPredictions(roundId);

      let eliminatedCount = 0;
      let correctPredictions = 0;

      // Process each prediction individually using their starting price
      for (const prediction of predictions) {
        const userStartingPrice = parseFloat(prediction.startingPrice || '0');

        if (userStartingPrice === 0) {
          console.warn(`No starting price found for prediction ${prediction.id}, skipping`);
          continue;
        }

        // Determine if user's prediction was correct based on their starting price
        let isCorrect = false;
        if (prediction.prediction === 'up') {
          // User predicted price would go UP - they're correct if endPrice > startingPrice
          isCorrect = endPrice > userStartingPrice;
        } else if (prediction.prediction === 'down') {
          // User predicted price would go DOWN - they're correct if endPrice < startingPrice
          isCorrect = endPrice < userStartingPrice;
        }

        // Update prediction with ending price and result
        await storage.updateSurvivalPrediction(prediction.id, {
          endingPrice: endPrice.toString(),
          isCorrect,
          points: isCorrect ? 10 : 0
        });

        if (isCorrect) {
          correctPredictions++;
          console.log(`✅ User ${prediction.userId}: ${prediction.prediction} prediction CORRECT (${userStartingPrice} → ${endPrice})`);
        } else {
          // Eliminate participant
          await storage.eliminateParticipant(prediction.participantId, round.roundNumber);
          eliminatedCount++;
          console.log(`❌ User ${prediction.userId}: ${prediction.prediction} prediction WRONG (${userStartingPrice} → ${endPrice}) - ELIMINATED`);
        }
      }

      // Update round statistics
      await storage.updateRound(roundId, {
        eliminatedCount,
        survivorCount: correctPredictions
      });

      console.log(`Round ${round.roundNumber} completed:`);
      console.log(`- Final price: $${endPrice}`);
      console.log(`- Total predictions: ${predictions.length}`);
      console.log(`- Correct predictions: ${correctPredictions}`);
      console.log(`- Eliminated: ${eliminatedCount} participants`);
      console.log(`- Advancing to next round: ${correctPredictions} participants`);

    } catch (error) {
      console.error('Error ending round:', error);
      throw error;
    }
  }

  // End tournament and declare winner
  private async endTournament(tournamentId: number, winnerId: number | null) {
    try {
      // Stop round interval
      const interval = this.roundIntervals.get(tournamentId);
      if (interval) {
        clearInterval(interval);
        this.roundIntervals.delete(tournamentId);
      }

      // Calculate total prize pool
      const tournament = await storage.getSurvivalTournament(tournamentId);
      const totalParticipants = tournament?.currentParticipants || 0;
      const prizePool = totalParticipants * tournament?.entryFee;

      // Update tournament status
      await storage.updateTournamentStatus(tournamentId, 'completed', winnerId);

      if (winnerId && prizePool > 0) {
        // Award prize to winner
        const winner = await storage.getUser(winnerId);
        if (winner) {
          // CRITICAL FIX: Use BalanceService for survival tournament rewards
          const balanceResult = await BalanceService.processTransaction({
            userId: winnerId,
            type: 'survival_tournament_reward',
            amount: prizePool,
            description: `Survival tournament prize: ${tournament?.title || 'Tournament'}`,
            relatedId: tournamentId
          }, storage);

          console.log(`Tournament ${tournamentId} completed!`);
          console.log(`Winner: ${winner.username} (ID: ${winnerId})`);
          console.log(`Prize: ${prizePool} NTIQ`);
        }
      }

    } catch (error) {
      console.error('Error ending tournament:', error);
      throw error;
    }
  }

  // Start tournament rounds for specific tournament only (no global checking)
  async startTournamentRounds(tournamentId: number) {
    try {
      console.log(`🎯 Starting rounds for tournament ${tournamentId} only (isolated mode)`);

      // Only check this specific tournament, not all tournaments
      await this.checkAndProcessExpiredRounds(tournamentId);

      // Set up interval for just this tournament
      const interval = setInterval(async () => {
        try {
          await this.checkAndProcessExpiredRounds(tournamentId);
        } catch (error) {
          console.error(`Error checking tournament ${tournamentId}:`, error);
        }
      }, 30000); // Check every 30 seconds

      this.roundIntervals.set(tournamentId, interval);
      console.log(`✅ Successfully started isolated round monitoring for tournament ${tournamentId}`);

    } catch (error) {
      console.error(`Failed to start tournament rounds for ${tournamentId}:`, error);
    }
  }

  // Stop tournament rounds
  stopTournamentRounds(tournamentId: number) {
    const interval = this.roundIntervals.get(tournamentId);
    if (interval) {
      clearInterval(interval);
      this.roundIntervals.delete(tournamentId);
      console.log(`Stopped rounds for tournament ${tournamentId}`);
    }
  }

  // Get tournament status and current round info
  async getTournamentStatus(tournamentId: number) {
    try {
      const tournament = await storage.getSurvivalTournament(tournamentId);
      const currentRound = await storage.getCurrentRound(tournamentId);
      const activeParticipants = await storage.getActiveParticipants(tournamentId);
      const rounds = await storage.getSurvivalRounds(tournamentId);

      return {
        tournament,
        currentRound,
        activeParticipants: activeParticipants.length,
        totalRounds: rounds.length,
        isActive: this.roundIntervals.has(tournamentId)
      };
    } catch (error) {
      console.error('Error getting tournament status:', error);
      throw error;
    }
  }
}

export const survivalRoundService = SurvivalRoundService.getInstance();