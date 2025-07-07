import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useState, useEffect } from 'react';

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
  currentRound: number;
  roundDuration: number;
  round1Duration?: number | null;
  round2Duration?: number | null;
  round3Duration?: number | null;
  startTime: string;
  endTime: string;
  nextRoundTime: string;
  participants: Array<{
    id: number;
    userId: number;
    status: string;
    prediction?: string;
    eliminationRound?: number;
  }>;
  rounds?: Array<{
    id: number;
    roundNumber: number;
    startPrice: string;
    endPrice?: string;
    status: string;
    endTime: string;
  }>;
}

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

// Countdown Timer Component
const CountdownTimer = ({ targetTime }: { targetTime: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [targetTime]);

  return <span>{timeLeft}</span>;
};

const SurvivalFixed = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  // Fetch tournaments
  const { data: tournaments = [], isLoading: tournamentLoading, error: tournamentError } = useQuery<SurvivalTournament[]>({
    queryKey: ['/api/survival-tournaments'],
    refetchInterval: 3000,
    retry: 1
  });

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  // Fetch crypto prices
  const { data: cryptoPrices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 2000,
  });

  // Filter active tournaments
  const activeTournaments = tournaments.filter(t => t.status === 'open' || t.status === 'active');

  // UP prediction mutation
  const predictUpMutation = useMutation({
    mutationFn: (tournamentId: number) => apiRequest(`/api/survival-tournaments/${tournamentId}/predict`, {
      method: 'POST',
      body: JSON.stringify({ prediction: 'up' }),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      toast({
        title: "Prediction Submitted",
        description: "Your UP prediction has been recorded",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed",
        description: error.message || "Unable to submit prediction",
        variant: "destructive",
      });
    }
  });

  // DOWN prediction mutation
  const predictDownMutation = useMutation({
    mutationFn: (tournamentId: number) => apiRequest(`/api/survival-tournaments/${tournamentId}/predict`, {
      method: 'POST',
      body: JSON.stringify({ prediction: 'down' }),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      toast({
        title: "Prediction Submitted",
        description: "Your DOWN prediction has been recorded",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed",
        description: error.message || "Unable to submit prediction",
        variant: "destructive",
      });
    }
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: (tournamentId: number) => apiRequest(`/api/survival-tournaments/${tournamentId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      toast({
        title: "Successfully Joined!",
        description: "You have joined the tournament. You can now make predictions.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
      setJoinDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Join",
        description: error.message || "Unable to join tournament",
        variant: "destructive",
      });
    }
  });

  if (tournamentLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Nectiq Survival Mode</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Loading tournaments...</p>
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (tournamentError) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Nectiq Survival Mode</h1>
              <p className="text-red-600 dark:text-red-400 mb-8">
                Error loading tournaments: {(tournamentError as any)?.message}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Nectiq Survival Mode</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Predict or get eliminated. Last survivor wins the prize pool.
            </p>
          </div>

          {activeTournaments.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Active Tournaments ({activeTournaments.length})</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeTournaments.map((tournament) => {
                  const currentCrypto = cryptoPrices.find(crypto => crypto.id === tournament.cryptocurrency);
                  const currentPrice = currentCrypto?.current_price || 0;
                  const priceChange24h = currentCrypto?.price_change_percentage_24h || 0;
                  
                  // Check if user has joined and their status
                  const userParticipant = tournament.participants?.find(p => p.userId === user?.id);
                  const hasJoined = !!userParticipant;
                  const isEliminated = userParticipant?.status === 'eliminated';
                  const userPrediction = userParticipant?.prediction;
                  
                  // Can predict if joined, tournament active, not eliminated, and no prediction yet
                  const canPredict = hasJoined && tournament.status === 'active' && tournament.currentRound > 0 && !isEliminated && !userPrediction;

                  return (
                    <Card key={tournament.id} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white">
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
                          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded">
                            <p className="text-yellow-200 text-sm">Live Price</p>
                            <div className="flex items-center gap-2">
                              <p className="text-yellow-100 text-lg font-bold">
                                ${currentPrice.toLocaleString()}
                              </p>
                              <span className={`text-sm ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Tournament Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm">Status</p>
                            <p className="text-white font-medium">{tournament.status}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Cryptocurrency</p>
                            <p className="text-white font-medium">{tournament.cryptocurrency}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Entry Fee</p>
                            <p className="text-white font-medium">{tournament.entryFee} NTIQ</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Round</p>
                            <p className="text-white font-medium">{tournament.currentRound}</p>
                          </div>
                        </div>

                        {/* Time Remaining */}
                        {tournament.status === 'active' && tournament.rounds && tournament.rounds.length > 0 && (
                          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600 rounded">
                            <p className="text-blue-200 text-sm">Time Remaining</p>
                            <p className="text-blue-100 text-lg font-bold">
                              <CountdownTimer targetTime={tournament.rounds.find(r => r.roundNumber === tournament.currentRound)?.endTime || tournament.nextRoundTime} />
                            </p>
                          </div>
                        )}

                        {/* Round Structure */}
                        <div className="mb-4 p-3 bg-slate-800/50 rounded">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Tournament Structure</h4>
                          <div className="flex gap-4 text-xs">
                            <span className={`px-2 py-1 rounded ${tournament.currentRound === 1 ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                              Round 1 ({tournament.round1Duration || 15}min)
                            </span>
                            <span className={`px-2 py-1 rounded ${tournament.currentRound === 2 ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                              Round 2 ({tournament.round2Duration || 30}min)
                            </span>
                            <span className={`px-2 py-1 rounded ${tournament.currentRound === 3 ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                              Round 3 ({tournament.round3Duration || 60}min)
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {!hasJoined ? (
                          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                disabled={!user || tournament.status === 'completed'}
                              >
                                Join Tournament ({tournament.entryFee} NTIQ)
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Join Tournament</DialogTitle>
                                <DialogDescription>
                                  You are about to join "{tournament.title}" for {tournament.entryFee} NTIQ.
                                  This amount will be deducted from your balance.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">Your Balance:</p>
                                    <p className="font-bold">{user?.balance || 0} NTIQ</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Entry Fee:</p>
                                    <p className="font-bold">{tournament.entryFee} NTIQ</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setJoinDialogOpen(false)}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => joinTournamentMutation.mutate(tournament.id)}
                                    disabled={joinTournamentMutation.isPending || (user?.balance || 0) < tournament.entryFee}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  >
                                    {joinTournamentMutation.isPending ? 'Joining...' : 'Join Tournament'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : canPredict ? (
                          <div className="flex gap-4">
                            <Button
                              onClick={() => predictUpMutation.mutate(tournament.id)}
                              disabled={predictUpMutation.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                            >
                              {predictUpMutation.isPending ? 'Submitting...' : 'Price UP ↗'}
                            </Button>
                            <Button
                              onClick={() => predictDownMutation.mutate(tournament.id)}
                              disabled={predictDownMutation.isPending}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                            >
                              {predictDownMutation.isPending ? 'Submitting...' : 'Price DOWN ↘'}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-3">
                            {hasJoined && isEliminated && (
                              <p className="text-red-400">❌ Eliminated in Round {userParticipant?.eliminationRound}</p>
                            )}
                            {hasJoined && userPrediction && (
                              <p className="text-blue-400">
                                ✅ Prediction: {userPrediction.toUpperCase()}
                              </p>
                            )}
                            {hasJoined && tournament.status !== 'active' && (
                              <p className="text-gray-400">Tournament not active</p>
                            )}
                            {hasJoined && tournament.status === 'active' && tournament.currentRound === 0 && (
                              <p className="text-yellow-400">Waiting for tournament to start...</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-400 mb-4">No Active Tournaments</h2>
              <p className="text-gray-500">
                {tournaments.length === 0 
                  ? "No tournaments available. Check back later!"
                  : `Found ${tournaments.length} tournaments, but none are currently active.`
                }
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SurvivalFixed;