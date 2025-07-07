import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, MessageCircle, Heart, Users, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface LivePrediction {
  id: number;
  userId: number;
  username: string;
  cryptocurrency: string;
  predictedPrice: number;
  currentPrice: number;
  stake: number;
  timeframe: string;
  createdAt: string;
  reactions: PredictionReaction[];
  comments: PredictionComment[];
  _count: {
    reactions: number;
    comments: number;
  };
}

interface PredictionReaction {
  id: number;
  userId: number;
  username: string;
  type: 'like' | 'fire' | 'rocket' | 'thinking';
  createdAt: string;
}

interface PredictionComment {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

interface TrendingCrypto {
  cryptocurrency: string;
  predictionCount: number;
  totalStake: number;
  averagePrice: number;
}

// Dynamic function to get crypto image from live API data
function getCryptoImageUrl(cryptoId: string, cryptoPrices: any[]): string {
  const cryptoData = cryptoPrices?.find(crypto => crypto.id === cryptoId);
  if (cryptoData?.image) {
    return cryptoData.image;
  }
  
  const commonIds: Record<string, string> = {
    'bitcoin': '1',
    'ethereum': '279',
    'tron': '1094',
    'binancecoin': '825',
    'cardano': '975',
    'solana': '4128',
    'chainlink': '877',
    'polkadot': '12171',
    'litecoin': '2',
    'matic-network': '4713',
    'hyperliquid': '44077',
    'sahara-ai': '66681'
  };
  
  const imageId = commonIds[cryptoId] || '1';
  return `https://coin-images.coingecko.com/coins/images/${imageId}/large/${cryptoId}.png`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

const reactionEmojis = {
  like: '👍',
  fire: '🔥',
  rocket: '🚀',
  thinking: '🤔'
};

export function LivePredictionFeed() {
  const [selectedTab, setSelectedTab] = useState<'feed' | 'trending'>('feed');
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get real-time crypto prices for logo display
  const { data: cryptoPrices = [] } = useQuery<any[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 15000, // Reduced to 15 seconds to prevent rate limiting
    staleTime: 10000, // 10 seconds
    retry: 2, // Retry failed requests
  });

  // Get live predictions feed
  const { data: livePredictions = [], isLoading: feedLoading } = useQuery<LivePrediction[]>({
    queryKey: ["/api/predictions/live-feed"],
    refetchInterval: 10000, // Reduced to 10 seconds to prevent rate limiting
    staleTime: 5000, // 5 seconds
    retry: 2, // Retry failed requests
  });

  // Get trending cryptocurrencies
  const { data: trendingCryptos = [], isLoading: trendingLoading } = useQuery<TrendingCrypto[]>({
    queryKey: ["/api/predictions/trending"],
    refetchInterval: 20000, // Reduced to 20 seconds to prevent rate limiting
    staleTime: 10000, // 10 seconds
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ predictionId, type }: { predictionId: number; type: string }) => {
      const response = await fetch('/api/predictions/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionId, type }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add reaction');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/live-feed"] });
      toast({
        title: "Reaction added!",
        description: "Your reaction has been added to the prediction.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add reaction",
        variant: "destructive",
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ predictionId, content }: { predictionId: number; content: string }) => {
      const response = await fetch('/api/predictions/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionId, content }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add comment');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/live-feed"] });
      setCommentInputs(prev => ({ ...prev, [variables.predictionId]: '' }));
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    }
  });

  const handleReaction = (predictionId: number, type: string) => {
    addReactionMutation.mutate({ predictionId, type });
  };

  const handleComment = (predictionId: number) => {
    const content = commentInputs[predictionId]?.trim();
    if (content) {
      addCommentMutation.mutate({ predictionId, content });
    }
  };

  const calculatePriceChangePercent = (predicted: number, current: number): number => {
    return ((predicted - current) / current) * 100;
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <TrendingUp className="text-primary mr-2" size={20} />
          Live Prediction Feed
        </h3>
        
        <div className="flex space-x-2">
          <Button
            variant={selectedTab === 'feed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('feed')}
          >
            Live Feed
          </Button>
          <Button
            variant={selectedTab === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('trending')}
          >
            Trending
          </Button>
        </div>
      </div>

      {selectedTab === 'feed' && (
        <div className="space-y-4">
          {feedLoading ? (
            <div className="text-center py-8 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading live predictions...</p>
            </div>
          ) : livePredictions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Target className="mx-auto mb-2" size={32} />
              <p>No live predictions yet</p>
              <p className="text-sm">Be the first to make a prediction!</p>
            </div>
          ) : (
            livePredictions.map((prediction) => {
              const priceChange = calculatePriceChangePercent(prediction.predictedPrice, prediction.currentPrice);
              const isPositive = priceChange > 0;
              
              return (
                <Card key={prediction.id} className="bg-surface-light border-slate-600">
                  <CardContent className="p-4">
                    {/* Prediction Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <img 
                            src={getCryptoImageUrl(prediction.cryptocurrency, cryptoPrices || [])}
                            alt={prediction.cryptocurrency}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) {
                                target.style.display = 'none';
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="w-8 h-8 bg-primary rounded-full hidden items-center justify-center text-white font-bold text-xs">
                            {prediction.cryptocurrency.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">@{prediction.username}</p>
                          <p className="text-sm text-slate-400 flex items-center">
                            <Clock size={12} className="mr-1" />
                            {formatTimeAgo(prediction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={prediction.timeframe === '1h' ? 'default' : prediction.timeframe === '6h' ? 'secondary' : 'outline'}>
                        {prediction.timeframe}
                      </Badge>
                    </div>

                    {/* Prediction Details */}
                    <div className="bg-surface rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium uppercase">{prediction.cryptocurrency}</span>
                        <span className="text-sm text-slate-400">{prediction.stake} NTIQ stake</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">Predicted</p>
                          <p className="font-bold">${prediction.predictedPrice.toFixed(4)}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Current</p>
                          <p className="font-bold">${prediction.currentPrice.toFixed(4)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reactions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex space-x-1">
                        {Object.entries(reactionEmojis).map(([type, emoji]) => (
                          <Button
                            key={type}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 hover:bg-surface"
                            onClick={() => handleReaction(prediction.id, type)}
                            disabled={addReactionMutation.isPending}
                          >
                            <span className="mr-1">{emoji}</span>
                            <span className="text-xs">
                              {prediction.reactions.filter(r => r.type === type).length}
                            </span>
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-slate-400 space-x-3">
                        <span className="flex items-center">
                          <Heart size={14} className="mr-1" />
                          {prediction._count.reactions}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle size={14} className="mr-1" />
                          {prediction._count.comments}
                        </span>
                      </div>
                    </div>

                    {/* Comments */}
                    {prediction.comments.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {prediction.comments.slice(0, 2).map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <span className="font-semibold">@{comment.username}</span>
                            <span className="ml-2">{comment.content}</span>
                            <span className="ml-2 text-xs text-slate-400">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                        ))}
                        {prediction.comments.length > 2 && (
                          <p className="text-xs text-slate-400">
                            View all {prediction.comments.length} comments
                          </p>
                        )}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a comment..."
                        value={commentInputs[prediction.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({
                          ...prev,
                          [prediction.id]: e.target.value
                        }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleComment(prediction.id);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleComment(prediction.id)}
                        disabled={!commentInputs[prediction.id]?.trim() || addCommentMutation.isPending}
                      >
                        Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {selectedTab === 'trending' && (
        <div className="space-y-4">
          {trendingLoading ? (
            <div className="text-center py-8 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading trending cryptocurrencies...</p>
            </div>
          ) : trendingCryptos.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <TrendingUp className="mx-auto mb-2" size={32} />
              <p>No trending data yet</p>
              <p className="text-sm">Start making predictions to see trends!</p>
            </div>
          ) : (
            trendingCryptos.map((crypto, index) => (
              <Card key={crypto.cryptocurrency} className="bg-surface-light border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <img 
                          src={getCryptoImageUrl(crypto.cryptocurrency, cryptoPrices || [])}
                          alt={crypto.cryptocurrency}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              target.style.display = 'none';
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-8 h-8 bg-primary rounded-full hidden items-center justify-center text-white font-bold text-xs">
                          {crypto.cryptocurrency.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold uppercase">{crypto.cryptocurrency}</p>
                        <p className="text-sm text-slate-400">Avg: ${crypto.averagePrice.toFixed(4)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm font-medium mb-1">
                        <Users size={14} className="mr-1" />
                        {crypto.predictionCount} predictions
                      </div>
                      <p className="text-xs text-slate-400">{crypto.totalStake} NTIQ total stake</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}