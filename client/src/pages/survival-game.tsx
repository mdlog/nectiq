import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, Clock, Trophy, Target } from 'lucide-react';
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

// Component untuk countdown timer yang persistent
const CountdownTimer = ({ endTime }: { endTime: string }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="flex items-center space-x-1 text-lg font-bold">
      <Clock className="h-5 w-5" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
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

  // Fetch crypto prices untuk live price data
  const { data: cryptoPrices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 2000, // Refresh setiap 2 detik
  });

  // Fetch user data untuk authentifikasi
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  // Fetch participants with predictions
  const { data: participants = [] } = useQuery({
    queryKey: [`/api/survival-tournaments/${tournament?.id}/participants-with-predictions`],
    enabled: !!tournament?.id,
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Mutation untuk predict UP/DOWN
  const predictMutation = useMutation({
    mutationFn: async (prediction: 'up' | 'down') => {
      if (!user) {
        throw new Error('Please connect your wallet first');
      }
      if (!tournament?.id) {
        throw new Error('Tournament data not available');
      }
      
      const response = await apiRequest(`/api/survival-tournaments/${tournament.id}/predict`, {
        method: 'POST',
        body: JSON.stringify({ prediction }),
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Prediksi Berhasil!",
        description: data?.message || "Prediksi Anda telah disimpan. Tunggu hasil round ini!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      console.error('Prediction error:', error);
      let errorMessage = "Gagal menyimpan prediksi. Silakan coba lagi.";
      
      if (error.message === 'Please connect your wallet first') {
        errorMessage = "Silakan hubungkan wallet Anda terlebih dahulu";
      } else if (error.message === 'Authentication required') {
        errorMessage = "Anda perlu login terlebih dahulu. Silakan hubungkan wallet Anda.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Prediksi Gagal",
        description: errorMessage,
      });
    },
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/survival-tournaments/${tournament?.id}/join`, {
        method: 'POST',
      }),
    onSuccess: () => {
      toast({
        title: "Bergabung Berhasil!",
        description: "Anda telah bergabung dalam survival tournament!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal Bergabung",
        description: error.message || "Gagal bergabung tournament. Silakan coba lagi.",
      });
    },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            🏆 Nectiq Survival Mode - Battle royale prediction tournaments - Predict or get eliminated!
          </h1>
          <p className="text-xl text-blue-200">
            {tournament.title} - Round {tournament.currentRound?.roundNumber || 1}
          </p>
        </div>

        {/* Main Tournament Card */}
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            {/* Tournament Status & Live Price */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <Badge variant={tournament.status === 'active' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                  {tournament.status.toUpperCase()}
                </Badge>
                <div className="text-sm text-gray-300">
                  <span className="font-semibold">Round:</span> {tournament.currentRound?.roundNumber || 1}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="font-semibold">Participants:</span> {tournament.currentParticipants}/{tournament.maxParticipants}
                </div>
              </div>
              
              {/* Live Price Display */}
              {currentCrypto && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <img src={currentCrypto.image} alt={currentCrypto.name} className="w-6 h-6" />
                    <span className="font-bold text-lg">{currentCrypto.name}</span>
                  </div>
                  <div className="text-2xl font-bold">${currentCrypto.current_price.toFixed(2)}</div>
                  <div className={`text-sm ${currentCrypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {currentCrypto.price_change_percentage_24h >= 0 ? '+' : ''}{currentCrypto.price_change_percentage_24h.toFixed(2)}% (24h)
                  </div>
                </div>
              )}
            </div>

            {/* Round Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="text-yellow-400 font-bold text-lg">Round 1</div>
                <div className="text-sm text-gray-300">({getRoundDuration(tournament, 1)} minutes)</div>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="text-yellow-400 font-bold text-lg">Round 2</div>
                <div className="text-sm text-gray-300">({getRoundDuration(tournament, 2)} minutes)</div>
              </div>
              <div className="bg-pink-500/20 border border-pink-500/30 rounded-lg p-4 text-center">
                <div className="text-yellow-400 font-bold text-lg">Round 3</div>
                <div className="text-sm text-gray-300">({getRoundDuration(tournament, 3)} minutes)</div>
              </div>
            </div>

            {/* Current Round Status */}
            {tournament.currentRound && tournament.currentRound.roundNumber > 0 && tournament.currentRound.endTime && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center mb-6">
                <div className="text-green-400 font-bold text-lg mb-2">
                  Round {tournament.currentRound.roundNumber} Active
                </div>
                <div className="text-white">
                  <CountdownTimer endTime={tournament.currentRound.endTime} />
                </div>
                <div className="text-sm text-gray-300 mt-2">
                  Make your UP/DOWN prediction below!
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {!user ? (
                <div className="text-center">
                  <p className="text-yellow-400 mb-4">Please connect your wallet to participate</p>
                  <Button 
                    onClick={() => window.location.href = '/wallet-login'}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  >
                    Connect Wallet
                  </Button>
                </div>
              ) : !isUserParticipant ? (
                <div className="text-center">
                  <p className="text-yellow-400 mb-4">
                    Entry Fee: {tournament.entryFee} NTIQ | Prize Pool: {tournament.prizePool} NTIQ
                  </p>
                  <Button
                    onClick={() => joinTournamentMutation.mutate()}
                    disabled={joinTournamentMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    {joinTournamentMutation.isPending ? 'Joining...' : `Join Tournament (${tournament.entryFee} NTIQ)`}
                  </Button>
                </div>
              ) : tournament.status === 'active' && tournament.currentRound?.roundNumber && tournament.currentRound.roundNumber > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast({
                          variant: "destructive",
                          title: "Authentication Required",
                          description: "Silakan hubungkan wallet Anda terlebih dahulu untuk membuat prediksi.",
                        });
                        return;
                      }
                      predictMutation.mutate('up');
                    }}
                    disabled={predictMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold"
                  >
                    <TrendingUp className="h-6 w-6 mr-2" />
                    PRICE UP
                  </Button>
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast({
                          variant: "destructive",
                          title: "Authentication Required",
                          description: "Silakan hubungkan wallet Anda terlebih dahulu untuk membuat prediksi.",
                        });
                        return;
                      }
                      predictMutation.mutate('down');
                    }}
                    disabled={predictMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
                  >
                    <TrendingDown className="h-6 w-6 mr-2" />
                    PRICE DOWN
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-yellow-400">
                    {tournament.status === 'open' ? 'Round 1 starts when first player makes a prediction' : 'Waiting for next round to start...'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participants Section */}
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Participants ({participants.length})
              </h3>
              <Badge variant="outline" className="text-sm">
                {participants.filter(p => p.status === 'active').length} Active
              </Badge>
            </div>
            
            {/* Detailed Participants List */}
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`p-4 rounded-lg border ${
                    participant.status === 'active' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center space-x-3">
                      {participant.profilePhoto ? (
                        <img 
                          src={participant.profilePhoto} 
                          alt={participant.username || `User ${participant.userId}`}
                          className="w-10 h-10 rounded-full border-2 border-purple-500/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold border-2 border-purple-500/30">
                          {(participant.username || `U${participant.userId}`).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">
                          {participant.username || `User ${participant.userId}`}
                        </p>
                        <p className={`text-xs ${participant.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                          {participant.status === 'active' ? 'Surviving' : 'Eliminated'}
                        </p>
                      </div>
                    </div>

                    {/* Prediction Info */}
                    <div className="flex items-center space-x-4">
                      {participant.prediction ? (
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${
                            participant.prediction === 'up' 
                              ? 'bg-green-600/20 text-green-400' 
                              : 'bg-red-600/20 text-red-400'
                          }`}>
                            {participant.prediction === 'up' ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="text-sm font-bold">
                              {participant.prediction.toUpperCase()}
                            </span>
                          </div>
                          {participant.submittedAt && (
                            <div className="text-xs text-gray-400">
                              {format(new Date(participant.submittedAt), 'HH:mm:ss')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          No prediction yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {participants.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No participants yet. Be the first to join!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default SurvivalGame;