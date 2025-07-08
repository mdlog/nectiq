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
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="text-slate-400 animate-pulse" size={20} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-600 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Live Activity</h3>
              <p className="text-xs text-slate-400">Loading predictions...</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-7 w-20 bg-slate-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-slate-600 rounded-lg"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-slate-600 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-600 rounded w-16"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-slate-700 rounded w-20"></div>
                    <div className="h-3 bg-slate-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="text-white" size={20} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live Activity</h3>
            <p className="text-xs text-slate-400">Real-time predictions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 text-sm px-3 py-1">
            <Users size={14} className="mr-1" />
            {activePredictions.length} active
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {activePredictions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Activity className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">No active predictions</p>
            <p className="text-xs text-slate-500 mt-1">Check back soon for live activity</p>
          </div>
        ) : (
          activePredictions.slice(0, 8).map((prediction) => (
            <div
              key={prediction.id}
              className="group relative bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 border border-slate-600/30 rounded-xl p-4 hover:from-slate-700/60 hover:via-slate-600/40 hover:to-slate-700/60 hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20"
            >
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {prediction.username}
                      </span>
                      <Badge variant="outline" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/40 text-blue-300 text-xs px-2 py-0.5 h-5">
                        {getCryptoName(prediction.cryptocurrency)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-700/40 rounded-full px-2 py-1">
                      <Clock size={11} />
                      <span className="font-medium">{formatTimeLeft(prediction.timeLeft)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 mb-0.5">Target Price</span>
                      <span className="text-sm font-bold text-emerald-400">
                        ${Number(prediction.predictedPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-400 mb-0.5">Stake</span>
                      <span className="text-sm font-bold text-amber-400">
                        {prediction.stakeAmount} NTIQ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress bar for time remaining */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50 rounded-b-xl overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (prediction.timeLeft / (24 * 3600)) * 100))}%` 
                  }}
                ></div>
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