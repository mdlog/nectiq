import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trophy, Users, DollarSign, Target, Sword, TrendingUp, TrendingDown, AlertCircle, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useState, useEffect } from "react";

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
}

interface CryptoPriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

// Countdown Timer Component
const CountdownTimer = ({ endTime }: { endTime: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(endTime).getTime();
      const difference = target - now;

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
        setTimeLeft("Time's up!");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4" />
      <span className="font-mono">{timeLeft}</span>
    </div>
  );
};

const SurvivalTournamentsWorking = () => {
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

  // Fetch real-time cryptocurrency prices
  const { data: cryptoPrices = [] } = useQuery<CryptoPriceData[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 2000, // Update every 2 seconds for real-time data
  });

  // Helper function to get current price for a cryptocurrency
  const getCurrentPrice = (cryptoSymbol: string) => {
    const crypto = cryptoPrices.find(c => 
      c.symbol.toLowerCase() === cryptoSymbol.toLowerCase() || 
      c.id.toLowerCase() === cryptoSymbol.toLowerCase()
    );
    return crypto ? crypto.current_price : 0;
  };

  // Helper function to get price change percentage
  const getPriceChange = (cryptoSymbol: string) => {
    const crypto = cryptoPrices.find(c => 
      c.symbol.toLowerCase() === cryptoSymbol.toLowerCase() || 
      c.id.toLowerCase() === cryptoSymbol.toLowerCase()
    );
    return crypto ? crypto.price_change_percentage_24h : 0;
  };

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
        <div className="container max-w-6xl mx-auto px-4 py-8">
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
      
      <div className="container max-w-6xl mx-auto px-4 py-8">
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
            <div key={tournament.id}>
              {/* Combined Tournament Card with Prediction Interface */}
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
                  {/* Live Price and Timer Section */}
                  <div className="mb-6 p-4 bg-black/20 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-yellow-400">
                          💰 Live Price: ${getCurrentPrice(tournament.cryptocurrency).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6
                          })}
                        </div>
                        <div className={`text-sm font-semibold ${
                          getPriceChange(tournament.cryptocurrency) >= 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {getPriceChange(tournament.cryptocurrency) >= 0 ? '↗' : '↘'} 
                          {Math.abs(getPriceChange(tournament.cryptocurrency)).toFixed(2)}%
                        </div>
                      </div>
                      
                      {tournament.status === 'active' && tournament.nextRoundTime && (
                        <div className="text-orange-300">
                          <CountdownTimer endTime={tournament.nextRoundTime} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    {/* Left Side - Tournament Information */}
                    <div className="flex-1 space-y-4">
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

                    {/* Right Side - Prediction Interface for Active Tournaments */}
                    {tournament.status === 'active' && (
                      <div className="w-64 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-lg p-4 border border-orange-300/30">
                        <div className="text-center mb-4">
                          <h4 className="text-lg font-bold text-orange-200 mb-1">🎯 Active Round</h4>
                          <p className="text-sm text-orange-100">
                            Choose price direction for {tournament.cryptocurrency.toUpperCase()}:
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <Button
                            size="lg"
                            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <TrendingUp className="h-5 w-5 mr-2" />
                            <div className="text-left">
                              <div className="font-bold">PRICE UP</div>
                              <div className="text-xs opacity-90">Bullish</div>
                            </div>
                          </Button>
                          
                          <Button
                            size="lg"
                            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <TrendingDown className="h-5 w-5 mr-2" />
                            <div className="text-left">
                              <div className="font-bold">PRICE DOWN</div>
                              <div className="text-xs opacity-90">Bearish</div>
                            </div>
                          </Button>
                        </div>
                        
                        <div className="bg-yellow-100/20 border border-yellow-300/30 rounded-lg p-2 mt-4 text-center text-yellow-200 text-xs">
                          ⚠️ Wrong predictions result in elimination!
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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

export default SurvivalTournamentsWorking;