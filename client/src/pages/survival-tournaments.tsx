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
    refetchInterval: 2000, // Auto-refresh every 2 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
    queryFn: async () => {
      console.log('Fetching round status for tournament:', tournament.id);
      const response = await fetch(`/api/survival-tournaments/${tournament.id}/current-round`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch round status");
      }
      const data = await response.json();
      console.log('Round status response:', data);
      return data;
    },
  });

  // Mutation for submitting predictions
  const submitPredictionMutation = useMutation({
    mutationFn: async (prediction: 'up' | 'down') => {
      console.log('Submitting prediction:', prediction, 'for tournament:', tournament.id);
      try {
        const result = await apiRequest(`/api/survival-tournaments/${tournament.id}/predict`, {
          method: 'POST',
          body: JSON.stringify({ prediction }),
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Prediction result:', result);
        return result;
      } catch (error) {
        console.error('Prediction error:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      console.log('Prediction success:', data);
      toast({
        title: "Prediction Submitted!",
        description: data.message || `Your ${data.prediction?.toUpperCase()} prediction recorded! ${data.entryFeeDeducted} NTIQ deducted. New balance: ${data.newBalance} NTIQ`,
      });
      // Refresh both round status and user data to update balance
      queryClient.invalidateQueries({ queryKey: [`/api/survival-tournaments/${tournament.id}/current-round`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
    },
    onError: (error: any) => {
      console.error('Prediction mutation error:', error);
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

  if (isLoadingRound) {
    return (
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-orange-600" />
            Loading Round Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!roundStatus?.currentRound) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            Round 1 starts when first player makes a prediction
          </CardTitle>
          <CardDescription>
            Connect your wallet and make the first prediction to activate Round 1!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { currentRound, userPrediction } = roundStatus;
  const hasSubmittedPrediction = !!userPrediction;

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sword className="h-5 w-5 text-orange-600" />
          Round {currentRound.roundNumber} - Predict or Get Eliminated!
        </CardTitle>
        <CardDescription>
          Make your prediction: Will {tournament.cryptocurrency} price go UP or DOWN?
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
                className="h-20 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                onClick={() => {
                  console.log('Price UP button clicked!');
                  submitPredictionMutation.mutate('up');
                }}
                disabled={submitPredictionMutation.isPending}
              >
                <TrendingUp className="h-6 w-6 mr-2" />
                <div>
                  <div className="font-bold">
                    {submitPredictionMutation.isPending ? 'SUBMITTING...' : 'PRICE UP'}
                  </div>
                  <div className="text-sm opacity-90">Bullish 📈</div>
                  <div className="text-xs opacity-75 mt-1">
                    -{tournament.entryFee} NTIQ
                  </div>
                </div>
              </Button>
              <Button
                size="lg"
                className="h-20 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                onClick={() => {
                  console.log('Price DOWN button clicked!');
                  submitPredictionMutation.mutate('down');
                }}
                disabled={submitPredictionMutation.isPending}
              >
                <TrendingDown className="h-6 w-6 mr-2" />
                <div>
                  <div className="font-bold">
                    {submitPredictionMutation.isPending ? 'SUBMITTING...' : 'PRICE DOWN'}
                  </div>
                  <div className="text-sm opacity-90">Bearish 📉</div>
                  <div className="text-xs opacity-75 mt-1">
                    -{tournament.entryFee} NTIQ
                  </div>
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

const SurvivalTournaments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState<SurvivalTournament | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);

  // Fetch all survival tournaments
  const { data: tournaments = [], isLoading } = useQuery<SurvivalTournament[]>({
    queryKey: ['/api/survival-tournaments'],
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  // Fetch user data
  const { data: user } = useQuery<any>({
    queryKey: ['/api/user'],
  });

  // Fetch tournament participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery<any[]>({
    queryKey: ['/api/survival-tournaments', selectedTournament?.id, 'participants'],
    enabled: !!selectedTournament?.id && showParticipants,
    queryFn: async () => {
      const response = await fetch(`/api/survival-tournaments/${selectedTournament?.id}/participants`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }
      return response.json();
    },
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      return apiRequest(`/api/survival-tournaments/${tournamentId}/join`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Success",
        description: "Joined tournament successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join tournament",
        variant: "destructive",
      });
    },
  });

  const handleJoinTournament = (tournament: SurvivalTournament) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to join tournaments",
        variant: "destructive",
      });
      return;
    }

    if (tournament.status !== 'open') {
      toast({
        title: "Cannot Join",
        description: "This tournament is no longer accepting participants",
        variant: "destructive",
      });
      return;
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      toast({
        title: "Tournament Full",
        description: "This tournament has reached its maximum number of participants",
        variant: "destructive",
      });
      return;
    }

    if (user.balance < tournament.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${tournament.entryFee} NTIQ to join this tournament`,
        variant: "destructive",
      });
      return;
    }

    joinTournamentMutation.mutate(tournament.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'accepting_participants':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Open</Badge>;
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Loading tournaments...</p>
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
          <div className="flex items-center justify-center mb-4">
            <Sword className="h-8 w-8 text-red-400 mr-2" />
            <h1 className="text-4xl font-bold text-white">Survival Tournaments</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Elimination-style tournaments where wrong predictions eliminate participants. Last survivor wins the entire prize pool!
          </p>
        </div>

        {/* Admin Notice */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md text-center">
            <p className="text-blue-800 text-sm">
              <strong>Admin Only:</strong> Tournament creation is restricted to administrators. Contact an admin to create new tournaments.
            </p>
          </div>
        </div>

        {/* Active Round Section - Show for active tournaments */}
        {tournaments?.some(t => t.status === 'active') && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">🎯 Active Rounds - Predict or Get Eliminated!</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tournaments
                ?.filter(t => t.status === 'active')
                .map((tournament) => (
                  <RoundPredictionCard key={tournament.id} tournament={tournament} />
                ))}
            </div>
          </div>
        )}

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament: SurvivalTournament) => (
            <Card key={tournament.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-white">
                    {tournament.title}
                  </CardTitle>
                  {getStatusBadge(tournament.status)}
                </div>
                <CardDescription className="text-gray-300">
                  {tournament.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Cryptocurrency */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Asset:</span>
                    <span className="font-medium text-white">{tournament.cryptocurrency.toUpperCase()}</span>
                  </div>
                  
                  {/* Participants */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Participants:
                    </span>
                    <span className="text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                  </div>
                  
                  {/* Entry Fee */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Entry Fee:
                    </span>
                    <span className="text-green-400 font-medium">{tournament.entryFee} NTIQ</span>
                  </div>
                  
                  {/* Prize Pool */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      Prize Pool:
                    </span>
                    <span className="text-yellow-400 font-bold">{tournament.prizePool} NTIQ</span>
                  </div>
                  
                  {/* Round Duration */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center">
                      <Timer className="w-4 h-4 mr-1" />
                      Round Duration:
                    </span>
                    <span className="text-white">{Math.floor(tournament.roundDuration / 60)} min</span>
                  </div>
                  
                  {/* Current Round (if active) */}
                  {tournament.status === 'active' && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Current Round:
                      </span>
                      <span className="text-blue-400 font-medium">Round {tournament.currentRound}</span>
                    </div>
                  )}
                  
                  {/* Time Remaining (if active) */}
                  {tournament.status === 'active' && tournament.nextRoundTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Next Round:
                      </span>
                      <span className="text-orange-400 font-medium">
                        {formatTimeRemaining(tournament.nextRoundTime)}
                      </span>
                    </div>
                  )}
                  
                  {/* Winner (if completed) */}
                  {tournament.status === 'completed' && tournament.winnerUsername && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Winner:</span>
                      <span className="text-yellow-400 font-bold">{tournament.winnerUsername}</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 space-y-2">
                  {(tournament.status === 'open' || tournament.status === 'pending' || tournament.status === 'accepting_participants') && 
                   tournament.currentParticipants < tournament.maxParticipants && (
                    <Button
                      onClick={() => handleJoinTournament(tournament)}
                      disabled={joinTournamentMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      {joinTournamentMutation.isPending ? 'Joining...' : `Join Tournament (${tournament.entryFee} NTIQ)`}
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full text-white border-white/30 hover:bg-white/10"
                        onClick={() => {
                          setSelectedTournament(tournament);
                          setShowParticipants(true);
                        }}
                      >
                        View Participants ({tournament.currentParticipants})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Tournament Participants</DialogTitle>
                        <DialogDescription>
                          {tournament.title} - {tournament.currentParticipants}/{tournament.maxParticipants} participants
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {participantsLoading ? (
                          <div className="text-center py-4">Loading participants...</div>
                        ) : participants.length > 0 ? (
                          <div className="space-y-2">
                            {participants.map((participant: any, index: number) => (
                              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {participant.username}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      UID: {participant.uid}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Joined: {new Date(participant.joinedAt).toLocaleDateString()}
                                  </div>
                                  <Badge 
                                    variant={participant.status === 'active' ? 'default' : 'secondary'}
                                    className="mt-1"
                                  >
                                    {participant.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No participants yet
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-gray-600">{tournament.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Tournament Info</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Asset:</span>
                              <span>{tournament.cryptocurrency.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Entry Fee:</span>
                              <span>{tournament.entryFee} NTIQ</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Participants:</span>
                              <span>{tournament.maxParticipants}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Prize Pool:</span>
                              <span>{tournament.prizePool} NTIQ</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Round Duration:</span>
                              <span>{Math.floor(tournament.roundDuration / 60)} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Creator:</span>
                              <span>{tournament.creatorUsername}</span>
                            </div>
                          </div>
                        </div>
                        
                        {tournament.status === 'active' && (
                          <div>
                            <h4 className="font-medium mb-2">Current Status</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Current Round:</span>
                                <span>Round {tournament.currentRound}</span>
                              </div>
                              {tournament.nextRoundTime && (
                                <div className="flex justify-between">
                                  <span>Next Round In:</span>
                                  <span>{formatTimeRemaining(tournament.nextRoundTime)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {tournament.status === 'completed' && tournament.winnerUsername && (
                          <div>
                            <h4 className="font-medium mb-2">Tournament Result</h4>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                              <p className="font-medium text-yellow-800">
                                Winner: {tournament.winnerUsername}
                              </p>
                              <p className="text-sm text-yellow-600">
                                Prize: {tournament.prizePool} NTIQ
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tournaments available
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Tournaments are created by administrators. Check back later for new tournaments!
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SurvivalTournaments;