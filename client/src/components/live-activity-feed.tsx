import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Swords, Crown, Zap, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EnhancedSkeleton } from "@/components/enhanced-skeleton";

interface ActivityItem {
  id: string;
  type: 'prediction' | 'battle_win' | 'battle_created' | 'survival_win' | 'achievement';
  username: string;
  description: string;
  amount?: number;
  cryptocurrency?: string;
  timestamp: string;
  icon: string;
  color: string;
}

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

const iconMap = {
  TrendingUp,
  TrendingDown: TrendingUp,
  Swords,
  Crown,
  Zap,
  Activity,
};

export function LiveActivityFeed() {
  // Get completed activities
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activities/live"],
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  // Get active predictions from all users
  const { data: activePredictions = [], isLoading: isLoadingActive } = useQuery<ActivePrediction[]>({
    queryKey: ["/api/predictions/live-feed"],
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const isLoading = isLoadingActivities || isLoadingActive;

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <div className="flex items-center justify-center mb-6">
          <Activity className="text-primary mr-2 animate-pulse" size={18} />
          <h3 className="text-lg font-bold">Live Activity Feed</h3>
          <div className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 mb-3 flex items-center">
              <CheckCircle2 className="text-green-500 mr-2 animate-pulse" size={16} />
              Completed Activities
            </h4>
            <EnhancedSkeleton type="activity" count={3} />
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 mb-3 flex items-center">
              <Clock className="text-orange-500 mr-2 animate-pulse" size={16} />
              Ongoing Activities
            </h4>
            <EnhancedSkeleton type="activity" count={3} />
          </div>
        </div>
      </div>
    );
  }

  const formatTimeLeft = (seconds: number): string => {
    // Handle invalid values (undefined, null, NaN)
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

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light">
      <div className="flex items-center justify-center mb-6">
        <Activity className="text-primary mr-2" size={18} />
        <h3 className="text-lg font-bold">Live Activity Feed</h3>
        <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Completed Activities */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle2 className="text-green-500" size={16} />
            <h4 className="font-semibold text-slate-200">Completed Activities</h4>
          </div>
          
          <div className="max-h-80 overflow-hidden relative">
            {activities.length === 0 ? (
              <div className="text-center py-4">
                <div className="relative mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="text-white" size={20} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-md"></div>
                </div>
                <p className="text-sm font-medium text-white mb-2">Ready for Action!</p>
                <p className="text-xs text-slate-400">Completed rewards appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => {
                  const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Activity;
                  return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color} flex-shrink-0 mt-0.5`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-200 truncate text-sm">
                          {activity.username}
                        </span>
                        {activity.type === 'battle_win' && (
                          <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 text-xs">
                            Battle
                          </Badge>
                        )}
                        {activity.type === 'survival_win' && (
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 text-xs">
                            Survival
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-300 mt-1">
                        {activity.description}
                        {activity.amount && (
                          <span className="font-semibold text-green-400 ml-1">
                            +{activity.amount} NTIQ
                          </span>
                        )}
                      </p>
                      
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Ongoing Activities */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="text-orange-500" size={16} />
            <h4 className="font-semibold text-slate-200">Ongoing Activities</h4>
          </div>
          
          <div className="max-h-80 overflow-hidden relative">
            {activePredictions.length === 0 ? (
              <div className="text-center py-4">
                <div className="relative mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                    <Clock className="text-white" size={20} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-md"></div>
                </div>
                <p className="text-sm font-medium text-white mb-2">Quiet Moment</p>
                <p className="text-xs text-slate-400">Active predictions will show here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePredictions.slice(0, 8).map((prediction, index) => (
                  <div
                    key={prediction.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-orange-800/20 border border-orange-700/50 hover:bg-orange-800/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-600 flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-200 truncate text-sm">
                          {prediction.username || `User #${prediction.userId}`}
                        </span>
                        <Badge variant="secondary" className="bg-orange-600/20 text-orange-400 text-xs">
                          Predicting
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-slate-300 mt-1">
                        {prediction.cryptocurrencyName || prediction.cryptocurrency} prediction
                        <span className="font-semibold text-blue-400 ml-1">
                          ${parseFloat(prediction.predictedPrice).toFixed(2)}
                        </span>
                      </p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500">
                          Stake: {prediction.stakeAmount} NTIQ
                        </p>
                        <p className="text-xs text-orange-400 font-medium">
                          {formatTimeLeft(prediction.timeLeft)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Live updates • Last updated {formatDistanceToNow(new Date(), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}