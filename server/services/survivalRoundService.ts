import { storage } from '../storage';

export class SurvivalRoundService {
  private static instance: SurvivalRoundService;
  private roundIntervals: Map<number, NodeJS.Timeout> = new Map();

  static getInstance(): SurvivalRoundService {
    if (!SurvivalRoundService.instance) {
      SurvivalRoundService.instance = new SurvivalRoundService();
    }
    return SurvivalRoundService.instance;
  }

  // Start automatic round management for a tournament
  async startTournamentRounds(tournamentId: number) {
    try {
      const tournament = await storage.getSurvivalTournament(tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      console.log(`Starting automatic rounds for tournament ${tournamentId}`);
      
      // Start the first round immediately
      await this.startNewRound(tournamentId);
      
      // Schedule subsequent rounds
      const interval = setInterval(async () => {
        try {
          await this.processRoundCycle(tournamentId);
        } catch (error) {
          console.error(`Error in round cycle for tournament ${tournamentId}:`, error);
        }
      }, tournament.roundDuration * 60 * 1000); // Convert minutes to milliseconds

      this.roundIntervals.set(tournamentId, interval);
    } catch (error) {
      console.error('Error starting tournament rounds:', error);
      throw error;
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
      
      if (tournament.individualRoundDurations) {
        try {
          const individualDurations = JSON.parse(tournament.individualRoundDurations);
          if (Array.isArray(individualDurations) && individualDurations[nextRoundNumber - 1]) {
            roundDuration = individualDurations[nextRoundNumber - 1];
            console.log(`Round ${nextRoundNumber}: Using individual duration of ${roundDuration} minutes`);
          } else {
            console.log(`Round ${nextRoundNumber}: Using default duration of ${roundDuration} minutes (individual duration not found)`);
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
          await storage.updateUserBalance(winnerId, winner.balance + prizePool);
          
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