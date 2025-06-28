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
      const endTime = new Date(startTime.getTime() + tournament.roundDuration * 60 * 1000);

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

      // Calculate actual price direction
      const startPrice = parseFloat(round.startPrice);
      const actualDirection = endPrice > startPrice ? 'up' : 'down';

      // Update round with end price and direction
      await storage.updateRound(roundId, {
        endPrice: endPrice.toString(),
        priceDirection: actualDirection,
        status: 'completed',
        completedAt: new Date()
      });

      // Get all predictions for this round
      const predictions = await storage.getRoundPredictions(roundId);
      
      let eliminatedCount = 0;
      let correctPredictions = 0;

      // Process each prediction
      for (const prediction of predictions) {
        const isCorrect = prediction.prediction === actualDirection;
        
        // Update prediction result
        await storage.updatePrediction(prediction.id, {
          isCorrect,
          points: isCorrect ? 10 : 0
        });

        if (isCorrect) {
          correctPredictions++;
        } else {
          // Eliminate participant
          await storage.eliminateParticipant(prediction.participantId, round.roundNumber);
          eliminatedCount++;
        }
      }

      // Update round statistics
      await storage.updateRound(roundId, {
        eliminatedCount,
        survivorCount: correctPredictions
      });

      console.log(`Round ${round.roundNumber} completed:`);
      console.log(`- Start price: $${startPrice}`);
      console.log(`- End price: $${endPrice}`);
      console.log(`- Direction: ${actualDirection}`);
      console.log(`- Eliminated: ${eliminatedCount} participants`);
      console.log(`- Survivors: ${correctPredictions} participants`);

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