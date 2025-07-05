import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, Clock, Trophy, Target, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { format } from 'date-fns';

// Types untuk data dari API
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
  currentRound?: {
    id: number;
    roundNumber: number;
    status: string;
    startTime: string;
    endTime: string;
  };
}

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface CountdownTimerProps {
  endTime: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setTimeLeft(`${hours}h • ${minutes}m • ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m • ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        setTimeLeft('Time up!');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return <span>{timeLeft}</span>;
};

const SurvivalGame = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function to get individual round duration
  const getRoundDuration = (tournament: SurvivalTournament, roundNumber: number): number => {
    // First try to use individual round duration fields from database
    if (roundNumber === 1 && tournament.round1Duration) {
      return tournament.round1Duration;
    }
    if (roundNumber === 2 && tournament.round2Duration) {
      return tournament.round2Duration;
    }
    if (roundNumber === 3 && tournament.round3Duration) {
      return tournament.round3Duration;
    }
    
    // Fallback to JSON string format if available
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
    
    // Final fallback to general round duration
    return tournament.roundDuration || 60;
  };

  // Fetch tournament aktif
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useQuery<SurvivalTournament>({
    queryKey: ['/api/survival-tournaments/active'],
    refetchInterval: 3000, // Refresh setiap 3 detik
    retry: 1
  });

  // Fetch participants with predictions
  const { data: participants = [] } = useQuery({
    queryKey: [`/api/survival-tournaments/${tournament?.id}/participants-with-predictions`],
    enabled: !!tournament?.id,
    refetchInterval: 3000,
  });

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  // Fetch crypto prices
  const { data: cryptoPrices } = useQuery<CryptoPrice[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: () => apiRequest(`/api/survival-tournaments/${tournament?.id}/join`, {
      method: 'POST'
    }),
    onSuccess: () => {
      toast({
        title: "Successfully Joined!",
        description: "You have joined the survival tournament. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments/active'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Join",
        description: error.message || "Unable to join tournament. Please try again.",
      });
    }
  });

  // Prediction mutation
  const predictMutation = useMutation({
    mutationFn: (prediction: 'up' | 'down') => apiRequest(`/api/survival-tournaments/${tournament?.id}/predict`, {
      method: 'POST',
      body: JSON.stringify({ prediction }),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      toast({
        title: "Prediction Submitted!",
        description: "Your prediction has been recorded. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments/active'] });
      queryClient.invalidateQueries({ queryKey: [`/api/survival-tournaments/${tournament?.id}/participants-with-predictions`] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: error.message || "Unable to submit prediction. Please try again.",
      });
    }
  });

  // Get current crypto price
  const getCurrentPrice = () => {
    if (!tournament || !cryptoPrices) return null;
    return cryptoPrices.find(crypto => crypto.id === tournament.cryptocurrency);
  };

  const currentCrypto = getCurrentPrice();
  const isUserParticipant = tournament?.participants?.some(p => p.userId === user?.id);

  // Handle loading states
  if (tournamentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center text-white">
            <Trophy className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Loading Tournament...</h2>
            <p className="text-blue-200">Mengambil data tournament survival...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle error or no tournament
  if (tournamentError || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center text-white">
            <Target className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Tidak Ada Tournament Aktif</h2>
            <p className="text-blue-200 mb-4">
              Saat ini tidak ada survival tournament yang sedang berlangsung.
            </p>
            <Button 
              onClick={() => window.location.href = '/survival-tournaments'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Lihat Semua Tournament
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Nectiq Survival Mode
            </h1>
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl"></div>
          </div>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-6">
            Battle royale-style prediction tournaments. Predict market direction each round or get eliminated.
            <span className="block mt-2 text-yellow-400 font-semibold">Last survivor wins the accumulated prize pool!</span>
          </p>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-green-400">
              <Trophy className="h-5 w-5" />
              <span className="font-medium">Winner Takes All</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Target className="h-5 w-5" />
              <span className="font-medium">Strategic Predictions</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Real-time Battles</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">{tournament.title}</h2>
            <p className="text-blue-200">Round {tournament.currentRound?.roundNumber || 1} • {tournament.status.toUpperCase()}</p>
          </div>
        </div>

        {/* Main Tournament Card */}
        <div className="bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8">
          {/* Live Price Display - Top Center */}
          {currentCrypto && (
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/40 rounded-xl p-6 text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <img src={currentCrypto.image} alt={currentCrypto.name} className="w-8 h-8" />
                <span className="font-bold text-2xl text-white">{currentCrypto.name}</span>
              </div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">${currentCrypto.current_price.toFixed(2)}</div>
              <div className={`text-lg font-semibold ${currentCrypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentCrypto.price_change_percentage_24h >= 0 ? '↗' : '↘'} {Math.abs(currentCrypto.price_change_percentage_24h).toFixed(2)}%
              </div>
            </div>
          )}

          {/* Tournament Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <DollarSign className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{tournament.entryFee}</div>
              <div className="text-sm text-blue-200">Entry Fee (NTIQ)</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4 text-center">
              <Trophy className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{tournament.prizePool}</div>
              <div className="text-sm text-green-200">Prize Pool (NTIQ)</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
              <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</div>
              <div className="text-sm text-purple-200">Participants</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl p-4 text-center">
              <Clock className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{tournament.rewardAmount}</div>
              <div className="text-sm text-orange-200">Winner Reward</div>
            </div>
          </div>

          {/* Round Structure */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Tournament Round Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((roundNum) => (
                <div 
                  key={roundNum}
                  className={`p-4 rounded-lg border-2 text-center transition-all duration-300 ${
                    tournament.currentRound?.roundNumber === roundNum
                      ? 'bg-yellow-500/20 border-yellow-500/50 shadow-yellow-500/20 shadow-lg'
                      : 'bg-gray-800/30 border-gray-600/30'
                  }`}
                >
                  <div className="text-lg font-bold text-white mb-2">Round {roundNum}</div>
                  <div className="text-sm text-gray-300">
                    Duration: {getRoundDuration(tournament, roundNum)} minutes
                  </div>
                  {tournament.currentRound?.roundNumber === roundNum && (
                    <div className="text-xs text-yellow-400 mt-2 font-semibold">ACTIVE NOW</div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-400 mt-4">
              💡 Round 1 starts when first player makes a prediction
            </div>
          </div>

          {/* Current Round Status */}
          {tournament.currentRound && tournament.currentRound.roundNumber > 0 && tournament.currentRound.endTime && (
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/40 rounded-xl p-6 text-center mb-8">
              <div className="text-green-400 font-bold text-2xl mb-3">
                🔥 Round {tournament.currentRound.roundNumber} Active
              </div>
              <div className="text-white text-xl mb-3">
                <CountdownTimer endTime={tournament.currentRound.endTime} />
              </div>
              <div className="text-green-200 font-medium">
                Make your UP/DOWN prediction below!
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-6">
            {!user ? (
              <div className="text-center bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/40 rounded-xl p-8">
                <div className="text-2xl mb-4">🔗</div>
                <p className="text-yellow-400 mb-6 text-lg">Please connect your wallet to participate</p>
                <Button 
                  onClick={() => window.location.href = '/wallet-login'}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  Connect Wallet
                </Button>
              </div>
            ) : !isUserParticipant ? (
              <div className="text-center bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/40 rounded-xl p-8">
                <div className="text-2xl mb-4">🎯</div>
                <p className="text-yellow-400 mb-6 text-lg">
                  Entry Fee: {tournament.entryFee} NTIQ | Prize Pool: {tournament.prizePool} NTIQ
                </p>
                <Button
                  onClick={() => joinTournamentMutation.mutate()}
                  disabled={joinTournamentMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {joinTournamentMutation.isPending ? 'Joining...' : `Join Tournament (${tournament.entryFee} NTIQ)`}
                </Button>
              </div>
            ) : tournament.status === 'active' && (tournament.currentRound || tournament.rounds?.some(r => r.status === 'active')) ? (
              <div className="bg-gradient-to-r from-slate-800/50 to-gray-800/50 border border-gray-600/50 rounded-xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Make Your Prediction</h3>
                  <p className="text-gray-300">Choose UP or DOWN for the price direction</p>
                  <div className="text-yellow-400 font-semibold mt-2">Fee: -{tournament.entryFee} NTIQ</div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast({
                          variant: "destructive",
                          title: "Authentication Required",
                          description: "Please connect your wallet first to make predictions.",
                        });
                        return;
                      }
                      predictMutation.mutate('up');
                    }}
                    disabled={predictMutation.isPending}
                    className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-8 text-xl font-bold rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:transform-none border-2 border-green-500/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse"></div>
                    <div className="relative flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 mr-3" />
                      <div className="text-center">
                        <div className="text-2xl font-bold">📈 PRICE UP</div>
                        <div className="text-sm text-green-200 font-medium">Predict price will rise</div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast({
                          variant: "destructive",
                          title: "Authentication Required",
                          description: "Please connect your wallet first to make predictions.",
                        });
                        return;
                      }
                      predictMutation.mutate('down');
                    }}
                    disabled={predictMutation.isPending}
                    className="relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-8 text-xl font-bold rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:transform-none border-2 border-red-500/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 animate-pulse"></div>
                    <div className="relative flex items-center justify-center">
                      <TrendingDown className="h-8 w-8 mr-3" />
                      <div className="text-center">
                        <div className="text-2xl font-bold">📉 PRICE DOWN</div>
                        <div className="text-sm text-red-200 font-medium">Predict price will fall</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/40 rounded-xl p-6">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-yellow-400 text-lg font-medium">
                  {tournament.status === 'open' ? 'Round 1 starts when first player makes a prediction' : 'Waiting for next round to start...'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center text-white">
              <Users className="h-6 w-6 mr-3 text-blue-400" />
              Tournament Participants ({participants.length})
            </h3>
            <div className="flex gap-3">
              <Badge className="bg-green-600/20 border-green-500/40 text-green-400 px-3 py-1">
                {participants.filter((p: any) => p.status === 'active').length} Surviving
              </Badge>
              <Badge className="bg-red-600/20 border-red-500/40 text-red-400 px-3 py-1">
                {participants.filter((p: any) => p.status === 'eliminated').length} Eliminated
              </Badge>
            </div>
          </div>
            
          {/* Participants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant: any) => (
              <div
                key={participant.id}
                className={`relative p-6 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  participant.status === 'active' 
                    ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/40 shadow-green-500/20' 
                    : 'bg-gradient-to-br from-red-600/20 to-pink-600/20 border-red-500/40 shadow-red-500/20'
                } shadow-xl`}
              >
                {/* Status Icon */}
                <div className={`absolute top-3 right-3 w-4 h-4 rounded-full ${
                  participant.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                } shadow-lg`}></div>
                
                {/* User Avatar and Info */}
                <div className="flex flex-col items-center text-center space-y-3">
                  {participant.profilePhoto ? (
                    <img 
                      src={participant.profilePhoto} 
                      alt={participant.username || `User ${participant.userId}`}
                      className="w-16 h-16 rounded-full border-3 border-white/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold border-3 border-white/30 shadow-lg text-white">
                      {(participant.username || `U${participant.userId}`).charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <p className="font-bold text-lg text-white">
                      {participant.username || `User ${participant.userId}`}
                    </p>
                    <p className={`text-sm font-medium ${
                      participant.status === 'active' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {participant.status === 'active' ? '✅ Surviving' : '❌ Eliminated'}
                    </p>
                  </div>
                </div>

                {/* Prediction Info */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  {participant.prediction ? (
                    <div className="text-center">
                      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold ${
                            participant.prediction === 'up' 
                              ? 'bg-green-600/20 text-green-400' 
                              : 'bg-red-600/20 text-red-400'
                        }`}>
                        {participant.prediction === 'up' ? (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            <span>📈 PRICE UP</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4" />
                            <span>📉 PRICE DOWN</span>
                          </>
                        )}
                      </div>
                      {participant.submittedAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          Submitted: {format(new Date(participant.submittedAt), 'HH:mm:ss')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-2xl mb-1">⏱️</div>
                      <div className="text-xs">No prediction yet</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {participants.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <div className="text-6xl mb-4">👥</div>
              <h4 className="text-xl font-semibold mb-2">No Participants Yet</h4>
              <p className="text-gray-500">Be the first to join this tournament!</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SurvivalGame;