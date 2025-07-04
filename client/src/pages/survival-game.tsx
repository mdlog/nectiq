import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

interface SurvivalGameData {
  tournament: {
    id: number;
    title: string;
    cryptocurrency: string;
    currentPrice: number;
    priceChange24h: number;
    targetPrice: number;
    timeRemaining: number;
    roundDuration: number;
    currentRound: number;
    totalRounds: number;
    status: 'active' | 'waiting' | 'completed';
  };
  participants: Array<{
    id: number;
    username: string;
    profilePhoto: string | null;
    isEliminated: boolean;
    prediction: 'up' | 'down' | null;
    joinedAt: string;
  }>;
  userParticipation: {
    isParticipant: boolean;
    prediction: 'up' | 'down' | null;
    canPredict: boolean;
  };
}

// Mock data for development
const mockGameData: SurvivalGameData = {
  tournament: {
    id: 14,
    title: "ETH/USDT Survival",
    cryptocurrency: "ethereum",
    currentPrice: 3087.42,
    priceChange24h: 2.34,
    targetPrice: 3100,
    timeRemaining: 403, // seconds
    roundDuration: 600, // 10 minutes
    currentRound: 1,
    totalRounds: 3,
    status: 'active'
  },
  participants: [
    { id: 1, username: "CryptoNinja", profilePhoto: null, isEliminated: false, prediction: null, joinedAt: "2025-07-04T19:20:00Z" },
    { id: 2, username: "DeFiDegen", profilePhoto: null, isEliminated: false, prediction: "up", joinedAt: "2025-07-04T19:21:00Z" },
    { id: 3, username: "NFTMaster", profilePhoto: null, isEliminated: false, prediction: "down", joinedAt: "2025-07-04T19:22:00Z" },
    { id: 4, username: "BlochainBen", profilePhoto: null, isEliminated: false, prediction: null, joinedAt: "2025-07-04T19:23:00Z" },
    { id: 5, username: "CryptoTrader", profilePhoto: null, isEliminated: true, prediction: "down", joinedAt: "2025-07-04T19:24:00Z" },
    { id: 6, username: "CryptoDamai", profilePhoto: null, isEliminated: true, prediction: "up", joinedAt: "2025-07-04T19:25:00Z" },
    { id: 7, username: "VitalikFan22", profilePhoto: null, isEliminated: false, prediction: "up", joinedAt: "2025-07-04T19:26:00Z" },
    { id: 8, username: "EtherMan", profilePhoto: null, isEliminated: false, prediction: null, joinedAt: "2025-07-04T19:27:00Z" },
    { id: 9, username: "LunaLover", profilePhoto: null, isEliminated: false, prediction: "down", joinedAt: "2025-07-04T19:28:00Z" },
    { id: 10, username: "DiamondHands", profilePhoto: null, isEliminated: true, prediction: "up", joinedAt: "2025-07-04T19:29:00Z" },
    { id: 11, username: "CmstolSamurai", profilePhoto: null, isEliminated: true, prediction: "down", joinedAt: "2025-07-04T19:30:00Z" },
    { id: 12, username: "NFTMaster", profilePhoto: null, isEliminated: false, prediction: null, joinedAt: "2025-07-04T19:31:00Z" },
    { id: 13, username: "HODLer", profilePhoto: null, isEliminated: false, prediction: "up", joinedAt: "2025-07-04T19:32:00Z" },
    { id: 14, username: "SmartContract", profilePhoto: null, isEliminated: false, prediction: null, joinedAt: "2025-07-04T19:33:00Z" },
    { id: 15, username: "BullBuster", profilePhoto: null, isEliminated: true, prediction: "down", joinedAt: "2025-07-04T19:34:00Z" },
    { id: 16, username: "EtherQueen", profilePhoto: null, isEliminated: false, prediction: "up", joinedAt: "2025-07-04T19:35:00Z" },
    { id: 17, username: "TradingTim", profilePhoto: null, isEliminated: false, prediction: null, joinedAt: "2025-07-04T19:36:00Z" },
    { id: 18, username: "EtherWhale", profilePhoto: null, isEliminated: false, prediction: "down", joinedAt: "2025-07-04T19:37:00Z" },
    { id: 19, username: "BullBuster", profilePhoto: null, isEliminated: false, prediction: null, joinedAt: "2025-07-04T19:38:00Z" },
    { id: 20, username: "BitGuru", profilePhoto: null, isEliminated: false, prediction: "up", joinedAt: "2025-07-04T19:39:00Z" }
  ],
  userParticipation: {
    isParticipant: true,
    prediction: null,
    canPredict: true
  }
};

const CountdownTimer = ({ seconds }: { seconds: number }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const remainingSeconds = timeLeft % 60;

  return (
    <div className="text-yellow-400 text-2xl font-bold">
      {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
    </div>
  );
};

const ParticipantAvatar = ({ participant }: { participant: SurvivalGameData['participants'][0] }) => {
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = username.length % colors.length;
    return colors[index];
  };

  const getPredictionIcon = () => {
    if (participant.prediction === 'up') return <TrendingUp className="h-3 w-3 text-green-400" />;
    if (participant.prediction === 'down') return <TrendingDown className="h-3 w-3 text-red-400" />;
    return null;
  };

  return (
    <div className="relative">
      <div className={`w-16 h-16 rounded-full ${getAvatarColor(participant.username)} flex items-center justify-center relative`}>
        {participant.profilePhoto ? (
          <img 
            src={participant.profilePhoto} 
            alt={participant.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white font-bold text-lg">
            {participant.username.charAt(0).toUpperCase()}
          </span>
        )}
        
        {/* Eliminated indicator */}
        {participant.isEliminated && (
          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-2xl font-bold">✕</span>
          </div>
        )}
        
        {/* Prediction indicator */}
        {participant.prediction && !participant.isEliminated && (
          <div className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-1 border-2 border-gray-600">
            {getPredictionIcon()}
          </div>
        )}
      </div>
      <div className="text-center mt-2">
        <p className={`text-xs font-medium ${participant.isEliminated ? 'text-gray-500' : 'text-white'}`}>
          {participant.username}
        </p>
      </div>
    </div>
  );
};

const PriceChart = ({ currentPrice }: { currentPrice: number }) => {
  // Simple mock chart data
  const chartData = [
    3110, 3105, 3098, 3102, 3095, 3089, 3092, 3087, 3091, 3094, 3099, 3087
  ];

  return (
    <div className="h-32 relative">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={chartData.map((price, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - ((price - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 100;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          className="drop-shadow-lg"
        />
        <polygon
          points={`0,100 ${chartData.map((price, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - ((price - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData))) * 100;
            return `${x},${y}`;
          }).join(' ')} 100,100`}
          fill="url(#priceGradient)"
        />
      </svg>
      
      {/* Price labels */}
      <div className="absolute bottom-0 left-0 text-xs text-gray-400">3,110</div>
      <div className="absolute bottom-0 right-0 text-xs text-gray-400">100</div>
      <div className="absolute bottom-0 right-1/2 text-xs text-gray-400">110</div>
    </div>
  );
};

export default function SurvivalGame() {
  const { toast } = useToast();
  const [gameData, setGameData] = useState<SurvivalGameData>(mockGameData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user data for authentication
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 1000 * 60 * 5
  });

  const handlePrediction = async (direction: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to make predictions",
        variant: "destructive"
      });
      return;
    }

    if (!gameData.userParticipation.canPredict) {
      toast({
        title: "Cannot Predict",
        description: "You have already made a prediction for this round",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setGameData(prev => ({
        ...prev,
        userParticipation: {
          ...prev.userParticipation,
          prediction: direction,
          canPredict: false
        }
      }));

      toast({
        title: "Prediction Submitted",
        description: `You predicted the price will go ${direction.toUpperCase()}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit prediction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingPlayers = gameData.participants.filter(p => !p.isEliminated).length;
  const totalPlayers = gameData.participants.length;
  const roundProgress = ((gameData.tournament.roundDuration - gameData.tournament.timeRemaining) / gameData.tournament.roundDuration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Game Header */}
        <Card className="bg-gray-900/80 border-blue-500/30 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            {/* Nectiq Logo and Progress */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl">NECTIQ</span>
              </div>
              <div className="flex gap-2">
                <div className="w-20 h-2 bg-purple-600 rounded-full"></div>
                <div className="w-20 h-2 bg-gray-700 rounded-full"></div>
                <div className="w-20 h-2 bg-gray-700 rounded-full"></div>
              </div>
            </div>

            {/* Cryptocurrency and Timer */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-cyan-400 text-lg font-medium">
                {gameData.tournament.title}
              </div>
              <CountdownTimer seconds={gameData.tournament.timeRemaining} />
            </div>

            {/* Main Question */}
            <div className="mb-6">
              <h1 className="text-white text-2xl font-bold leading-tight mb-2">
                WILL THE PRICE OF ETH<br />
                BE ABOVE ${gameData.tournament.targetPrice.toLocaleString()}<br />
                IN 10 MINUTES?
              </h1>
            </div>

            {/* Price Chart */}
            <div className="mb-6">
              <PriceChart currentPrice={gameData.tournament.currentPrice} />
            </div>

            {/* Prediction Buttons */}
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => handlePrediction('up')}
                disabled={!gameData.userParticipation.canPredict || isSubmitting}
                className="flex-1 h-16 bg-green-600 hover:bg-green-700 text-white font-bold text-xl border-0 rounded-lg"
              >
                <TrendingUp className="mr-2 h-6 w-6" />
                UP
              </Button>
              <Button
                onClick={() => handlePrediction('down')}
                disabled={!gameData.userParticipation.canPredict || isSubmitting}
                className="flex-1 h-16 bg-red-600 hover:bg-red-700 text-white font-bold text-xl border-0 rounded-lg"
              >
                <TrendingDown className="mr-2 h-6 w-6" />
                DOWN
              </Button>
            </div>

            {/* Round Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Round {gameData.tournament.currentRound} of {gameData.tournament.totalRounds}</span>
                <span>{Math.round(roundProgress)}% Complete</span>
              </div>
              <Progress value={roundProgress} className="h-2" />
            </div>

            {/* Remaining Players */}
            <div className="text-center">
              <h3 className="text-cyan-400 text-lg font-bold mb-4">
                {remainingPlayers} REMAINING PLAYERS
              </h3>
              
              {/* Participants Grid */}
              <div className="grid grid-cols-5 gap-4 justify-items-center">
                {gameData.participants.map((participant) => (
                  <ParticipantAvatar key={participant.id} participant={participant} />
                ))}
              </div>
            </div>

            {/* User Status */}
            {gameData.userParticipation.isParticipant && (
              <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <div className="text-center text-white">
                  {gameData.userParticipation.prediction ? (
                    <div className="flex items-center justify-center gap-2">
                      <span>Your prediction: </span>
                      <Badge 
                        variant={gameData.userParticipation.prediction === 'up' ? 'default' : 'destructive'}
                        className={gameData.userParticipation.prediction === 'up' ? 'bg-green-600' : 'bg-red-600'}
                      >
                        {gameData.userParticipation.prediction.toUpperCase()}
                      </Badge>
                    </div>
                  ) : gameData.userParticipation.canPredict ? (
                    <span>Make your prediction above to stay in the game!</span>
                  ) : (
                    <span>Waiting for round to complete...</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}