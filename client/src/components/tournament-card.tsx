import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, Clock, Trophy, Target, DollarSign, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { CountdownTimer } from '@/components/countdown-timer';

// Types
interface SurvivalTournament {
  id: number;
  title: string;
  description: string;
  cryptocurrency: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  rewardAmount: number;
  rewardType: string;
  status: 'open' | 'active' | 'completed' | 'cancelled';
  roundDuration: number;
  round1Duration?: number | null;
  round2Duration?: number | null;
  round3Duration?: number | null;
  individualRoundDurations?: string | null;
  startTime: string;
  endTime: string;
  nextRoundTime: string;
  participants: Array<{
    id: number;
    userId: number;
    status: string;
    username?: string;
    profilePhoto?: string;
  }>;
  rounds: Array<{
    id: number;
    roundNumber: number;
    status: string;
    startTime: string;
    endTime: string;
    startPrice?: number;
    endPrice?: number;
  }>;
  currentRound: number;
}

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface TournamentCardProps {
  tournament: SurvivalTournament;
  user: any;
  cryptoPrices: CryptoPrice[];
}



export const TournamentCard = ({ tournament, user, cryptoPrices }: TournamentCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Debug logging for tournament card
  console.log('TournamentCard rendering:', {
    tournamentId: tournament.id,
    title: tournament.title,
    status: tournament.status,
    user: user?.id,
    cryptoPricesLength: cryptoPrices.length
  });

  // Add error boundary to prevent card crashes
  if (!tournament || !tournament.id) {
    console.error('TournamentCard: Invalid tournament data');
    return <div className="text-red-500">Error: Invalid tournament data</div>;
  }

  // Helper function to get individual round duration
  const getRoundDuration = (tournament: SurvivalTournament, roundNumber: number): number => {
    if (roundNumber === 1 && tournament.round1Duration) {
      return tournament.round1Duration;
    }
    if (roundNumber === 2 && tournament.round2Duration) {
      return tournament.round2Duration;
    }
    if (roundNumber === 3 && tournament.round3Duration) {
      return tournament.round3Duration;
    }
    
    if (tournament.individualRoundDurations) {
      try {
        const durations = JSON.parse(tournament.individualRoundDurations);
        if (Array.isArray(durations) && durations[roundNumber - 1]) {
          return durations[roundNumber - 1];
        }
      } catch (error) {
        console.error('Error parsing individual round durations:', error);
      }
    }
    
    return tournament.roundDuration || 60;
  };

  // Fetch participants with predictions untuk tournament ini
  const { data: participants = [] } = useQuery({
    queryKey: [`/api/survival-tournaments/${tournament.id}/participants-with-predictions`],
    refetchInterval: 3000,
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: () => apiRequest(`/api/survival-tournaments/${tournament.id}/join`, {
      method: 'POST'
    }),
    onSuccess: () => {
      toast({
        title: "Successfully Joined!",
        description: "You have joined the survival tournament. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/survival-tournaments/${tournament.id}/participants-with-predictions`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Join",
        description: error.message || "Unable to join tournament",
        variant: "destructive",
      });
    }
  });

  // UP/DOWN prediction mutations
  const predictUpMutation = useMutation({
    mutationFn: () => apiRequest(`/api/survival-tournaments/${tournament.id}/predict`, {
      method: 'POST',
      body: JSON.stringify({ prediction: 'up' }),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      toast({
        title: "Prediction Submitted!",
        description: "Your UP prediction has been recorded. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/survival-tournaments/${tournament.id}/participants-with-predictions`] });
    },
    onError: (error: any) => {
      toast({
        title: "Prediction Failed",
        description: error.message || "Unable to submit prediction",
        variant: "destructive",
      });
    }
  });

  const predictDownMutation = useMutation({
    mutationFn: () => apiRequest(`/api/survival-tournaments/${tournament.id}/predict`, {
      method: 'POST',
      body: JSON.stringify({ prediction: 'down' }),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      toast({
        title: "Prediction Submitted!",
        description: "Your DOWN prediction has been recorded. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/survival-tournaments/${tournament.id}/participants-with-predictions`] });
    },
    onError: (error: any) => {
      toast({
        title: "Prediction Failed",
        description: error.message || "Unable to submit prediction",
        variant: "destructive",
      });
    }
  });

  // Get current crypto price
  const currentCrypto = cryptoPrices?.find(crypto => crypto.id === tournament.cryptocurrency);
  const currentPrice = currentCrypto?.current_price || 0;
  const priceChange24h = currentCrypto?.price_change_percentage_24h || 0;

  // Check if user has joined
  const userParticipant = (participants as any[])?.find((p: any) => p.userId === user?.id);
  const hasJoined = !!userParticipant;

  // Get current user status and prediction info
  const currentUser = (participants as any[])?.find((p: any) => p.userId === user?.id);
  const isEliminated = currentUser?.status === 'eliminated';
  const userCurrentPrediction = currentUser?.prediction;
  const eliminationRound = currentUser?.eliminationRound;

  // Check if user can make prediction
  const canPredict = hasJoined && tournament.status === 'active' && tournament.currentRound > 0 && !isEliminated && !userCurrentPrediction;

  // Get current round info
  const currentRound = tournament.rounds?.find(r => r.roundNumber === tournament.currentRound);
  const roundEndTime = currentRound?.endTime || tournament.nextRoundTime;
  const startingPrice = currentRound?.startPrice || 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{tournament.title}</h3>
            <p className="text-gray-400 text-sm">{tournament.description}</p>
          </div>
          <Badge
            variant={tournament.status === 'active' ? 'default' : 'secondary'}
            className={tournament.status === 'active' ? 'bg-green-600' : 'bg-blue-600'}
          >
            {tournament.status.toUpperCase()}
          </Badge>
        </div>

        {/* Live Price Section */}
        {currentCrypto && (
          <div className="bg-yellow-500 text-black p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img src={currentCrypto.image} alt={currentCrypto.name} className="w-6 h-6" />
                <span className="font-semibold">{currentCrypto.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">${currentPrice.toFixed(2)}</div>
                <div className={`text-sm ${priceChange24h >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            {/* Starting Price vs Current Price Comparison */}
            {tournament.status === 'active' && startingPrice > 0 && (
              <div className="border-t border-yellow-600 pt-2 mt-2">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">Starting Price:</span>
                    <span className="ml-1">${startingPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const priceDiff = currentPrice - startingPrice;
                      const priceDiffPercent = ((priceDiff / startingPrice) * 100);
                      return (
                        <div className={`font-medium ${priceDiff >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                          {priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(2)} 
                          <span className="text-xs ml-1">
                            ({priceDiff >= 0 ? '+' : ''}{priceDiffPercent.toFixed(2)}%)
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tournament Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-sm">Entry Fee: {tournament.entryFee} NTIQ</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="text-sm">Prize: {tournament.prizePool} NTIQ</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm">{tournament.currentParticipants}/{tournament.maxParticipants} Players</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-400" />
            <span className="text-sm">Round {tournament.currentRound}/3</span>
          </div>
        </div>

        {/* Round Structure */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Round Structure:</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[1, 2, 3].map(roundNum => (
              <div
                key={roundNum}
                className={`p-2 rounded text-center ${
                  roundNum === tournament.currentRound
                    ? 'bg-yellow-600 text-black'
                    : roundNum < tournament.currentRound
                    ? 'bg-green-600'
                    : 'bg-gray-600'
                }`}
              >
                <div className="font-semibold">Round {roundNum}</div>
                <div>{getRoundDuration(tournament, roundNum)} min</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Actions */}
        <div className="space-y-3">
          {!user ? (
            <p className="text-center text-gray-400">Please login to participate</p>
          ) : tournament.status === 'open' && !hasJoined ? (
            <Button
              onClick={() => joinTournamentMutation.mutate()}
              disabled={joinTournamentMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {joinTournamentMutation.isPending ? 'Joining...' : `Join Tournament (${tournament.entryFee} NTIQ)`}
            </Button>
          ) : tournament.status === 'open' && hasJoined ? (
            <div className="text-center">
              <Badge className="bg-blue-600">Joined! Waiting for tournament to start...</Badge>
              {tournament.currentRound === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Round 1 starts when first player makes a prediction
                </p>
              )}
            </div>
          ) : tournament.status === 'active' && hasJoined && canPredict ? (
            <div className="space-y-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Time remaining: <CountdownTimer targetTime={roundEndTime} /></span>
                </div>
                <p className="text-sm text-gray-400">Make your prediction for Round {tournament.currentRound}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => predictUpMutation.mutate()}
                  disabled={predictUpMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {predictUpMutation.isPending ? 'Submitting...' : 'Price UP'}
                  {tournament.entryFee > 0 && <span className="ml-2">(-{tournament.entryFee} NTIQ)</span>}
                </Button>
                <Button
                  onClick={() => predictDownMutation.mutate()}
                  disabled={predictDownMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  {predictDownMutation.isPending ? 'Submitting...' : 'Price DOWN'}
                  {tournament.entryFee > 0 && <span className="ml-2">(-{tournament.entryFee} NTIQ)</span>}
                </Button>
              </div>
            </div>
          ) : tournament.status === 'active' && hasJoined && isEliminated ? (
            <div className="text-center bg-red-900/20 p-4 rounded-lg border border-red-500">
              <div className="flex items-center justify-center gap-2 mb-2">
                <X className="h-5 w-5 text-red-500" />
                <Badge className="bg-red-600 text-white">ELIMINATED</Badge>
              </div>
              <p className="text-sm text-red-400">
                Eliminated in Round {eliminationRound || 'N/A'}
              </p>
              {userCurrentPrediction && (
                <div className="flex items-center justify-center gap-1 mt-2 text-sm">
                  <span className="text-gray-400">Your prediction was:</span>
                  <div className={`flex items-center gap-1 ${userCurrentPrediction.toLowerCase() === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {userCurrentPrediction.toLowerCase() === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-semibold">{userCurrentPrediction.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>
          ) : tournament.status === 'active' && hasJoined && userCurrentPrediction && !canPredict ? (
            <div className="text-center bg-blue-900/20 p-4 rounded-lg border border-blue-500">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <Badge className="bg-blue-600 text-white">PREDICTION SUBMITTED</Badge>
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-sm text-gray-400">Your prediction:</span>
                <div className={`flex items-center gap-1 ${userCurrentPrediction.toLowerCase() === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {userCurrentPrediction.toLowerCase() === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-semibold">{userCurrentPrediction.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Time remaining: </span>
                <CountdownTimer targetTime={roundEndTime} />
              </div>
            </div>
          ) : tournament.status === 'active' && hasJoined && !canPredict ? (
            <div className="text-center">
              <Badge className="bg-orange-600">Waiting for next round...</Badge>
              <p className="text-sm text-gray-400 mt-2">
                Round {tournament.currentRound} in progress
              </p>
            </div>
          ) : tournament.status === 'active' && !hasJoined ? (
            <div className="text-center">
              <Badge className="bg-red-600">Tournament in Progress</Badge>
              <p className="text-sm text-gray-400 mt-2">Cannot join active tournament</p>
            </div>
          ) : (
            <div className="text-center">
              <Badge variant="secondary">Tournament {tournament.status}</Badge>
            </div>
          )}
        </div>

        {/* Participants Preview */}
        <div className="mt-4 pt-4 border-t border-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Participants</span>
            <Progress 
              value={(tournament.currentParticipants / tournament.maxParticipants) * 100} 
              className="w-24 h-2"
            />
          </div>
          {(participants as any[])?.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {(participants as any[]).slice(0, 5).map((participant: any, index: number) => (
                <div
                  key={participant.id}
                  className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs"
                  title={participant.username}
                >
                  {participant.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              ))}
              {(participants as any[]).length > 5 && (
                <span className="text-xs text-gray-400">+{(participants as any[]).length - 5}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};