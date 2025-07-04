import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Trophy, Users, DollarSign, Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SurvivalParticipantsList } from '@/components/survival-participants-list';

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
  status: 'open' | 'active' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  currentRound: number;
  roundDuration: number;
  eliminationCount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  username: string;
  balance: number;
  isAdmin: boolean;
}

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const SurvivalTournaments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState<SurvivalTournament | null>(null);

  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
  });

  // Fetch tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery<SurvivalTournament[]>({
    queryKey: ['/api/survival-tournaments'],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Fetch crypto prices
  const { data: cryptoPrices } = useQuery<CryptoPrice[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Get crypto price by symbol
  const getCryptoPrice = (symbol: string) => {
    return cryptoPrices?.find(crypto => crypto.symbol.toLowerCase() === symbol.toLowerCase());
  };

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
        description: "Successfully joined tournament!",
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

  // Make prediction mutation
  const makePredictionMutation = useMutation({
    mutationFn: async ({ tournamentId, direction }: { tournamentId: number; direction: 'up' | 'down' }) => {
      console.log('makePredictionMutation called with:', { tournamentId, direction });
      console.log('API URL will be:', `/api/survival-tournaments/${tournamentId}/predict`);
      
      const response = await apiRequest(`/api/survival-tournaments/${tournamentId}/predict`, {
        method: 'POST',
        body: JSON.stringify({ prediction: direction }),
      });
      
      console.log('API response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Prediction success:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Success", 
        description: "Prediction submitted successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Prediction error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit prediction",
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

    const userBalance = user?.balance || 0;
    if (userBalance < tournament.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${tournament.entryFee} NTIQ to join this tournament`,
        variant: "destructive",
      });
      return;
    }

    joinTournamentMutation.mutate(tournament.id);
  };

  const handleMakePrediction = (tournament: SurvivalTournament, direction: 'up' | 'down') => {
    console.log('handleMakePrediction called:', { tournament, direction, user });
    
    if (!user) {
      console.log('No user authenticated');
      toast({
        title: "Authentication Required", 
        description: "Please connect your wallet to make predictions",
        variant: "destructive",
      });
      return;
    }

    console.log('Calling makePredictionMutation with:', { tournamentId: tournament.id, direction });
    makePredictionMutation.mutate({ tournamentId: tournament.id, direction });
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return "Tournament ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Real-time countdown component
  const JoinCountdown = ({ tournament }: { tournament: SurvivalTournament }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    
    useEffect(() => {
      const updateCountdown = () => {
        if (tournament.status !== 'open') {
          setTimeLeft('');
          return;
        }
        
        const now = new Date().getTime();
        // For demo purposes, let's assume join deadline is 1 hour from start time
        const joinDeadline = new Date(tournament.startTime).getTime() + (60 * 60 * 1000); // 1 hour from start
        const diff = joinDeadline - now;
        
        if (diff <= 0) {
          setTimeLeft('⏰ Join period ended');
          return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setTimeLeft(`⏳ ${hours}h ${minutes}m ${seconds}s left to join`);
        } else if (minutes > 0) {
          setTimeLeft(`⏳ ${minutes}m ${seconds}s left to join`);
        } else {
          setTimeLeft(`⏳ ${seconds}s left to join`);
        }
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(interval);
    }, [tournament]);
    
    if (!timeLeft || tournament.status !== 'open') return null;
    
    return (
      <div className="bg-orange-900/30 rounded-lg p-2 mb-3">
        <p className="text-orange-300 text-sm font-medium text-center">
          {timeLeft}
        </p>
      </div>
    );
  };

  if (tournamentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="p-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center text-white">
              <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading tournaments...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="p-2 sm:p-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-400" />
              <h1 className="text-2xl sm:text-4xl font-bold text-white">Nectiq Survival Mode</h1>
            </div>
            <p className="text-base sm:text-xl text-blue-200 mb-4 sm:mb-6 px-2">
              Battle royale prediction tournaments - Predict or get eliminated!
            </p>
          </div>

        {/* Admin Notice */}
        <div className="flex justify-center mb-6 sm:mb-8 px-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 max-w-md text-center w-full sm:w-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800 text-sm sm:text-base">Admin-Only Tournament Creation</h3>
            </div>
            <p className="text-yellow-700 text-xs sm:text-sm">
              Tournament creation is restricted to administrators. You can join existing tournaments and participate in
              the survival competition.
            </p>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {tournaments?.map((tournament) => {
            const cryptoData = getCryptoPrice(tournament.cryptocurrency);
            const isUserParticipant = false; // We'll implement this later
            
            return (
              <Card key={tournament.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-purple-400" />
                      {tournament.title}
                    </CardTitle>
                    <Badge variant={tournament.status === 'open' ? 'default' : 'secondary'}>
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Live Price Section */}
                  {cryptoData && (
                    <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src={cryptoData.image} alt={cryptoData.name} className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="font-semibold text-white text-sm sm:text-base">{cryptoData.name}</span>
                        </div>
                        <span className="text-yellow-400 font-bold text-base sm:text-lg">
                          ${cryptoData.current_price.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cryptoData.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                        )}
                        <span className={`text-xs sm:text-sm font-medium ${
                          cryptoData.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {cryptoData.price_change_percentage_24h > 0 ? '+' : ''}
                          {cryptoData.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tournament Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Entry: {tournament.entryFee} NTIQ</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Prize: {tournament.prizePool} NTIQ</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{formatTimeRemaining(tournament.endTime)}</span>
                    </div>
                  </div>

                  {/* Tournament Rounds */}
                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                    <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Tournament Structure</h4>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold text-xs">Round 1</div>
                        <div className="text-slate-400 text-xs">15 min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-300 text-xs">Round 2</div>
                        <div className="text-slate-400 text-xs">30 min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-300 text-xs">Round 3</div>
                        <div className="text-slate-400 text-xs">1 hour</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      Round 1 starts when first player makes a prediction
                    </p>
                  </div>

                  {/* Active Round Predictions */}
                  {tournament.status === 'active' && (
                    <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4">
                      <div className="text-center mb-3">
                        <Badge className="bg-yellow-600 text-white text-xs sm:text-sm">
                          Active Round {tournament.currentRound}
                        </Badge>
                        <p className="text-slate-300 text-xs sm:text-sm mt-1">
                          Choose price direction for {cryptoData?.name}:
                        </p>
                      </div>
                      
                      {/* Authentication Warning */}
                      {!user && (
                        <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 sm:p-4 mb-4">
                          <div className="text-center">
                            <p className="text-red-200 text-sm sm:text-base font-semibold mb-2">
                              🔐 Wallet Connection Required
                            </p>
                            <p className="text-red-300 text-xs sm:text-sm mb-3">
                              You must connect your wallet to make predictions in survival tournaments
                            </p>
                            <button 
                              onClick={() => {
                                window.location.href = '/wallet-login';
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                            >
                              Connect Wallet Now
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {user ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {/* Test Button First */}
                          <button
                            onClick={() => alert('TEST BUTTON WORKS!')}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded mb-2"
                          >
                            🧪 TEST BUTTON - CLICK ME!
                          </button>
                          
                          {/* Direct API Call Buttons */}
                          <button
                            onClick={async () => {
                              alert('PRICE UP clicked - making direct API call');
                              try {
                                const response = await fetch(`/api/survival-tournaments/${tournament.id}/predict`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  credentials: 'include',
                                  body: JSON.stringify({ prediction: 'up' })
                                });
                                const data = await response.json();
                                alert(`API Response: ${JSON.stringify(data)}`);
                                console.log('API Response:', data);
                              } catch (error) {
                                alert(`Error: ${error.message}`);
                                console.error('Error:', error);
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded"
                          >
                            ⬆️ PRICE UP (-{tournament.entryFee} NTIQ)
                          </button>
                          
                          <button
                            onClick={async () => {
                              alert('PRICE DOWN clicked - making direct API call');
                              try {
                                const response = await fetch(`/api/survival-tournaments/${tournament.id}/predict`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  credentials: 'include',
                                  body: JSON.stringify({ prediction: 'down' })
                                });
                                const data = await response.json();
                                alert(`API Response: ${JSON.stringify(data)}`);
                                console.log('API Response:', data);
                              } catch (error) {
                                alert(`Error: ${error}`);
                                console.error('Error:', error);
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded"
                          >
                            ⬇️ PRICE DOWN (-{tournament.entryFee} NTIQ)
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          <div className="bg-gray-600/50 border-2 border-dashed border-gray-500 text-gray-400 font-bold py-3 sm:py-4 px-3 sm:px-4 rounded text-center text-sm sm:text-base cursor-not-allowed">
                            🔒 PRICE UP (Login Required)
                          </div>
                          <div className="bg-gray-600/50 border-2 border-dashed border-gray-500 text-gray-400 font-bold py-3 sm:py-4 px-3 sm:px-4 rounded text-center text-sm sm:text-base cursor-not-allowed">
                            🔒 PRICE DOWN (Login Required)
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-yellow-400 text-center mt-2">
                        ⚠️ Wrong predictions result in elimination!
                      </p>
                    </div>
                  )}

                  {/* Join Tournament Section */}
                  {tournament.status === 'open' && (
                    <div>
                      {/* Countdown Timer */}
                      <JoinCountdown tournament={tournament} />
                      
                      {/* Join Button */}
                      <Button
                        onClick={() => handleJoinTournament(tournament)}
                        disabled={joinTournamentMutation.isPending}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
                      >
                        {joinTournamentMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Joining...
                          </div>
                        ) : (
                          `Join Tournament (${tournament.entryFee} NTIQ)`
                        )}
                      </Button>
                      
                      {/* Join Info */}
                      <div className="bg-blue-900/30 rounded-lg p-2 mt-2">
                        <p className="text-blue-300 text-xs text-center">
                          💡 Join now before the deadline to participate in the survival battle!
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participants List for this Tournament */}
              <div className="mt-4">
                <SurvivalParticipantsList tournamentId={tournament.id} />
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tournaments?.length === 0 && (
          <div className="text-center text-white mt-8 sm:mt-12 px-4">
            <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-purple-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold mb-2">No Active Tournaments</h3>
            <p className="text-blue-200 text-sm sm:text-base">
              Check back later for new survival tournaments!
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SurvivalTournaments;