import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trophy, Users, Clock, DollarSign, Target, Sword, Timer, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface SurvivalTournament {
  id: number;
  title: string;
  description: string;
  cryptocurrency: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  status: string;
  currentRound: number;
  roundDuration: number;
  startTime?: string;
  endTime?: string;
  nextRoundTime?: string;
  creatorUsername: string;
  winnerUsername?: string;
  participants?: any[];
  rounds?: any[];
}

interface RoundStatus {
  tournament: SurvivalTournament;
  currentRound?: {
    id: number;
    roundNumber: number;
    timeRemaining: number;
    totalPredictions: number;
    participantsRemaining: number;
    startPrice?: number;
    lastUpdated?: number;
  };
  userPrediction?: {
    prediction: 'up' | 'down';
    submittedAt: string;
  };
}

// Component for round prediction interface
const RoundPredictionCard = ({ tournament }: { tournament: SurvivalTournament }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Query for current round status
  const { data: roundStatus, isLoading: isLoadingRound } = useQuery<RoundStatus>({
    queryKey: [`/api/survival-tournaments/${tournament.id}/current-round`],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Mutation for submitting predictions
  const submitPredictionMutation = useMutation({
    mutationFn: (prediction: 'up' | 'down') =>
      apiRequest(`/api/survival-tournaments/${tournament.id}/predict`, {
        method: 'POST',
        body: JSON.stringify({ prediction }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      toast({
        title: "Prediction Submitted!",
        description: "Your prediction has been recorded for this round.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/survival-tournaments/${tournament.id}/current-round`] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: error.message || "Failed to submit prediction. Please try again.",
      });
    },
  });

  // Update countdown timer
  useEffect(() => {
    if (!roundStatus?.currentRound?.timeRemaining) return;

    const interval = setInterval(() => {
      if (!roundStatus?.currentRound) return;
      const remaining = Math.max(0, roundStatus.currentRound.timeRemaining - (Date.now() - (roundStatus.currentRound.lastUpdated || 0)));
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        queryClient.invalidateQueries({ queryKey: [`/api/survival-tournaments/${tournament.id}/current-round`] });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roundStatus, queryClient, tournament.id]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const { currentRound, userPrediction } = roundStatus || {};
  const hasSubmittedPrediction = !!userPrediction;

  if (isLoadingRound) {
    return (
      <Card className="bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">Loading Round...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentRound) {
    return (
      <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">⏳ Waiting for Next Round</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-300">
            The next round will begin shortly. Get ready to predict!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">
          🎯 {tournament.title} - Round {currentRound.roundNumber}
        </CardTitle>
        <CardDescription className="text-center text-white/90">
          Predict {tournament.cryptocurrency.toUpperCase()} price direction to survive!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Round Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">
              <Clock className="h-5 w-5 inline mr-1" />
              {formatTime(timeRemaining || currentRound.timeRemaining)}
            </div>
            <div className="text-sm text-gray-600">Time Left</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              <Users className="h-5 w-5 inline mr-1" />
              {currentRound.participantsRemaining}
            </div>
            <div className="text-sm text-gray-600">Survivors</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              <Target className="h-5 w-5 inline mr-1" />
              {currentRound.totalPredictions}
            </div>
            <div className="text-sm text-gray-600">Predictions</div>
          </div>
        </div>

        {/* Current Price Info */}
        <div className="bg-white/80 rounded-lg p-4 text-center">
          <div className="text-lg font-semibold text-gray-700">
            Current {tournament.cryptocurrency} Price
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${currentRound.startPrice?.toFixed(2) || 'Loading...'}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Round started at this price
          </div>
        </div>

        {/* Prediction Buttons or Status */}
        {hasSubmittedPrediction && userPrediction ? (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <div className="text-2xl">
                {userPrediction.prediction === 'up' ? '📈' : '📉'}
              </div>
              <div>
                <div className="font-semibold">Prediction Submitted!</div>
                <div className="text-sm">
                  You predicted: {userPrediction.prediction.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center text-gray-700 font-medium">
              ⚠️ Choose wisely - wrong predictions eliminate you!
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                className="h-16 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => submitPredictionMutation.mutate('up')}
                disabled={submitPredictionMutation.isPending}
              >
                <TrendingUp className="h-6 w-6 mr-2" />
                <div>
                  <div className="font-bold">PRICE UP</div>
                  <div className="text-sm opacity-90">Bullish 📈</div>
                </div>
              </Button>
              <Button
                size="lg"
                className="h-16 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => submitPredictionMutation.mutate('down')}
                disabled={submitPredictionMutation.isPending}
              >
                <TrendingDown className="h-6 w-6 mr-2" />
                <div>
                  <div className="font-bold">PRICE DOWN</div>
                  <div className="text-sm opacity-90">Bearish 📉</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center text-yellow-800 text-sm">
          <AlertCircle className="h-4 w-4 inline mr-1" />
          Wrong predictions result in immediate elimination from the tournament!
        </div>
      </CardContent>
    </Card>
  );
};

const SurvivalTournamentsSimple = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all survival tournaments
  const { data: tournaments = [], isLoading } = useQuery<SurvivalTournament[]>({
    queryKey: ['/api/survival-tournaments'],
  });

  // Fetch user data for authentication checks
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: (tournamentId: number) =>
      apiRequest(`/api/survival-tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      toast({
        title: "Successfully Joined!",
        description: "You've joined the survival tournament. Get ready to predict!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Join Failed",
        description: error.message || "Failed to join tournament. Please try again.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Loading tournaments...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Nectiq Survival Mode</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
            Battle royale prediction tournaments - Predict or get eliminated!
          </p>
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-yellow-800 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Admin-Only Tournament Creation</span>
            </div>
            <p className="text-sm text-yellow-700">
              Tournament creation is restricted to administrators. You can join existing tournaments and participate in the survival competition.
            </p>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="space-y-4">
              {/* Tournament Info Card */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-600/80 to-pink-600/80">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sword className="h-5 w-5" />
                    {tournament.title}
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    {tournament.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-400">Cryptocurrency</div>
                          <div className="font-semibold text-blue-400">{tournament.cryptocurrency.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-400">Entry Fee</div>
                          <div className="font-semibold text-green-400">{tournament.entryFee} NTIQ</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-400">Participants</div>
                          <div className="font-semibold text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-400">Prize Pool</div>
                          <div className="font-semibold text-yellow-400">{tournament.prizePool} NTIQ</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <Badge className={
                        tournament.status === 'open' ? 'bg-green-600/80 text-white hover:bg-green-600/80' :
                        tournament.status === 'active' ? 'bg-blue-600/80 text-white hover:bg-blue-600/80' :
                        tournament.status === 'completed' ? 'bg-gray-600/80 text-white hover:bg-gray-600/80' :
                        'bg-yellow-600/80 text-white hover:bg-yellow-600/80'
                      }>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </Badge>

                      {tournament.status === 'open' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                              <Sword className="h-4 w-4 mr-2" />
                              Join Tournament
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white dark:bg-gray-800">
                            <DialogHeader>
                              <DialogTitle className="text-gray-900 dark:text-white">Join {tournament.title}</DialogTitle>
                              <DialogDescription className="text-gray-600 dark:text-gray-300">
                                Are you ready to join this survival tournament? You need {tournament.entryFee} NTIQ to participate.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Tournament Rules</h4>
                                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                  <li>• Each round, predict if {tournament.cryptocurrency.toUpperCase()} price goes UP or DOWN</li>
                                  <li>• Wrong predictions eliminate you immediately</li>
                                  <li>• Last survivors split the prize pool</li>
                                  <li>• Entry fee: {tournament.entryFee} NTIQ (non-refundable)</li>
                                </ul>
                              </div>
                              
                              {user ? (
                                <div className="flex justify-between">
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogTrigger>
                                  <Button 
                                    onClick={() => joinTournamentMutation.mutate(tournament.id)}
                                    disabled={joinTournamentMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {joinTournamentMutation.isPending ? 'Joining...' : `Join for ${tournament.entryFee} NTIQ`}
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-gray-600 dark:text-gray-300 mb-3">You need to connect your wallet to join tournaments.</p>
                                  <Button variant="outline" className="w-full">
                                    Connect Wallet to Join
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Round Prediction Card for Active Tournaments */}
              {tournament.status === 'active' && (
                <RoundPredictionCard tournament={tournament} />
              )}
            </div>
          ))}
        </div>

        {tournaments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">
              No tournaments available
            </h3>
            <p className="text-gray-400 mb-6">
              Check back later for new tournaments!
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SurvivalTournamentsSimple;