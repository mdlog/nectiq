import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivePrediction {
  id: number;
  userId: number;
  cryptocurrency: string;
  predictedPrice: string;
  stakeAmount: number;
  targetTime: string;
  createdAt: string;
  currentPrice: string;
  timeLeft: number;
  username?: string;
  cryptocurrencyName?: string;
}

export function SimpleActivityFeed() {
  // Get active predictions from all users
  const { data: activePredictions = [], isLoading } = useQuery<ActivePrediction[]>({
    queryKey: ["/api/predictions/live-feed"],
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const formatTimeLeft = (seconds: number): string => {
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0) {
      return "Expired";
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getCryptoName = (cryptoId: string): string => {
    const names: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'cardano': 'ADA',
      'solana': 'SOL',
      'chainlink': 'LINK',
      'polkadot': 'DOT',
      'litecoin': 'LTC',
      'matic-network': 'MATIC',
      'avalanche-2': 'AVAX',
      'tron': 'TRX',
      'stellar': 'XLM',
      'hyperliquid': 'HYPE',
      'sahara-ai': 'SAHARA',
      'aave': 'AAVE'
    };
    return names[cryptoId] || cryptoId.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-surface-light rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="text-primary animate-pulse" size={16} />
          <h3 className="text-sm font-semibold text-slate-200">Live Activity</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-slate-700 rounded w-2/3 mb-1"></div>
                <div className="h-2 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-surface-light rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="text-primary" size={16} />
          <h3 className="text-sm font-semibold text-slate-200">Live Activity</h3>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
          <Users size={12} className="mr-1" />
          {activePredictions.length}
        </Badge>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {activePredictions.length === 0 ? (
          <div className="text-center py-4 text-slate-400">
            <Activity className="h-6 w-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">No active predictions</p>
          </div>
        ) : (
          activePredictions.slice(0, 8).map((prediction) => (
            <div
              key={prediction.id}
              className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3 h-3 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {prediction.username}
                    </span>
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-slate-600">
                      {getCryptoName(prediction.cryptocurrency)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Clock size={10} />
                    <span>{formatTimeLeft(prediction.timeLeft)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-slate-400">
                    ${Number(prediction.predictedPrice).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">
                    {prediction.stakeAmount} NTIQ
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {activePredictions.length > 8 && (
        <div className="text-center mt-2">
          <span className="text-xs text-slate-500">
            +{activePredictions.length - 8} more predictions...
          </span>
        </div>
      )}
    </div>
  );
}