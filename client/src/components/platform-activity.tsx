import { useQuery } from "@tanstack/react-query";
import { Activity, Clock, Trophy, Zap, Users2, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlatformActivityData {
  recentPredictions: {
    username: string;
    cryptocurrency: string;
    prediction: string;
    stakeAmount: number;
    timeframe: string;
    createdAt: string;
  }[];
  recentRewards: {
    username: string;
    amount: number;
    type: string;
    sourceDetails: string;
    createdAt: string;
  }[];
  activeBattles: number;
  activeTournaments: number;
  onlineUsers: number;
}

export function PlatformActivity() {
  const { data: activityData, isLoading, error } = useQuery<PlatformActivityData>({
    queryKey: ["/api/platform/activity"],
    refetchInterval: 15000, // Update every 15 seconds
    staleTime: 10000,
  });

  if (isLoading) {
    return (
      <Card className="bg-surface-light border-slate-600" data-testid="platform-activity-loading">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-600 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !activityData) {
    return (
      <Card className="bg-surface-light border-slate-600" data-testid="platform-activity-error">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Unable to load activity data</p>
        </CardContent>
      </Card>
    );
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getCryptoSymbol = (cryptoId: string) => {
    const mapping: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'solana': 'SOL',
      'avalanche-2': 'AVAX',
      'chainlink': 'LINK',
      'litecoin': 'LTC',
      'uniswap': 'UNI',
      'bittensor': 'TAO',
      'hyperliquid': 'HYPE'
    };
    return mapping[cryptoId] || cryptoId.toUpperCase();
  };

  return (
    <Card className="bg-surface-light border-slate-600" data-testid="platform-activity">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Platform Activity
        </CardTitle>
        <p className="text-xs text-slate-400">
          Real-time predictions and platform updates
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded text-center">
            <Target className="w-3 h-3 text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Battles</p>
              <p className="text-sm font-semibold text-white">{activityData.activeBattles || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded text-center">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <div>
              <p className="text-xs text-slate-400">Tournaments</p>
              <p className="text-sm font-semibold text-white">{activityData.activeTournaments || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded text-center">
            <Users2 className="w-3 h-3 text-green-400" />
            <div>
              <p className="text-xs text-slate-400">Online</p>
              <p className="text-sm font-semibold text-white">{activityData.onlineUsers || 0}</p>
            </div>
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Recent Predictions
          </h4>
          
          {activityData.recentPredictions?.slice(0, 4).map((prediction, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 bg-slate-800/20 rounded-lg"
              data-testid={`recent-prediction-${index}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {prediction.username}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      prediction.prediction === 'UP' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {prediction.prediction}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {getCryptoSymbol(prediction.cryptocurrency)} • {prediction.stakeAmount} NTIQ • {prediction.timeframe}
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(prediction.createdAt)}
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-4">
              <p className="text-xs text-slate-500">No recent predictions</p>
            </div>
          )}
        </div>

        {/* Recent Rewards */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Recent Rewards
          </h4>
          
          {activityData.recentRewards?.slice(0, 3).map((reward, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 bg-slate-800/20 rounded-lg"
              data-testid={`recent-reward-${index}`}
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white truncate">
                  {reward.username}
                </span>
                <p className="text-xs text-slate-400 truncate">
                  {reward.type} • {reward.sourceDetails}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-semibold text-yellow-400">
                  +{reward.amount} NTIQ
                </p>
                <p className="text-xs text-slate-400">
                  {formatTimeAgo(reward.createdAt)}
                </p>
              </div>
            </div>
          )) || (
            <div className="text-center py-4">
              <p className="text-xs text-slate-500">No recent rewards</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}