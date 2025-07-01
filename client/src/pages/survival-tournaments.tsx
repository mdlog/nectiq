import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Trophy, Users, DollarSign, Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

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

  if (tournamentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-white">
            <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading tournaments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Nectiq Survival Mode</h1>
          </div>
          <p className="text-xl text-blue-200 mb-6">
            Battle royale prediction tournaments - Predict or get eliminated!
          </p>
        </div>

        {/* Admin Notice */}
        <div className="flex justify-center mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Admin-Only Tournament Creation</h3>
            </div>
            <p className="text-yellow-700 text-sm">
              Tournament creation is restricted to administrators. You can join existing tournaments and participate in
              the survival competition.
            </p>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid gap-6 md:grid-cols-2">
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
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src={cryptoData.image} alt={cryptoData.name} className="w-6 h-6" />
                          <span className="font-semibold text-white">{cryptoData.name}</span>
                        </div>
                        <span className="text-yellow-400 font-bold text-lg">
                          ${cryptoData.current_price.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cryptoData.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          cryptoData.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {cryptoData.price_change_percentage_24h > 0 ? '+' : ''}
                          {cryptoData.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tournament Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Entry: {tournament.entryFee} NTIQ</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm">Prize: {tournament.prizePool} NTIQ</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{formatTimeRemaining(tournament.endTime)}</span>
                    </div>
                  </div>

                  {/* Tournament Rounds */}
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="text-white font-semibold mb-2">Tournament Structure</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold">Round 1</div>
                        <div className="text-slate-400">15 min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-300">Round 2</div>
                        <div className="text-slate-400">30 min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-300">Round 3</div>
                        <div className="text-slate-400">1 hour</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      Round 1 starts when first player makes a prediction
                    </p>
                  </div>

                  {/* Debug Info */}
                  <div className="bg-blue-900/30 rounded-lg p-2 mb-2 text-xs">
                    <p className="text-blue-300">Debug: Status={tournament.status}, User={user ? 'logged in' : 'not logged in'}</p>
                    <button 
                      onClick={() => alert('Test button works!')} 
                      className="bg-orange-500 text-white px-2 py-1 rounded mt-1 text-xs"
                    >
                      Test Click
                    </button>
                  </div>

                  {/* Active Round Predictions */}
                  {tournament.status === 'active' && (
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <Badge className="bg-yellow-600 text-white">
                          Active Round {tournament.currentRound}
                        </Badge>
                        <p className="text-slate-300 text-sm mt-1">
                          Choose price direction for {cryptoData?.name}:
                        </p>
                        {!user && (
                          <div className="bg-red-900/30 rounded-lg p-3 mt-2">
                            <p className="text-red-400 text-sm font-semibold">
                              ⚠️ Connect your wallet first to make predictions!
                            </p>
                            <p className="text-red-300 text-xs mt-1">
                              Click the wallet icon in the header to connect
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {user ? (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              alert('PRICE UP NATIVE BUTTON clicked!');
                              console.log('PRICE UP native button clicked');
                              handleMakePrediction(tournament, 'up');
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded cursor-pointer"
                            type="button"
                          >
                            ⬆️ PRICE UP
                          </button>
                          <button
                            onClick={() => {
                              alert('PRICE DOWN NATIVE BUTTON clicked!');
                              console.log('PRICE DOWN native button clicked');
                              handleMakePrediction(tournament, 'down');
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded cursor-pointer"
                            type="button"
                          >
                            ⬇️ PRICE DOWN
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-600/30 rounded-lg p-4 text-center">
                          <p className="text-gray-400 mb-2">Connect wallet to see prediction buttons</p>
                          <button 
                            onClick={() => {
                              alert('Please connect your wallet first!');
                            }}
                            className="bg-gray-500 text-gray-300 px-4 py-2 rounded cursor-not-allowed"
                            disabled
                          >
                            Prediction Buttons (Disabled)
                          </button>
                        </div>
                      )}
                      
                      <p className="text-xs text-yellow-400 text-center mt-2">
                        ⚠️ Wrong predictions result in elimination!
                      </p>
                    </div>
                  )}

                  {/* Join Tournament Button */}
                  {tournament.status === 'open' && (
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
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {tournaments?.length === 0 && (
          <div className="text-center text-white mt-12">
            <Trophy className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Active Tournaments</h3>
            <p className="text-blue-200">
              Check back later for new survival tournaments!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurvivalTournaments;