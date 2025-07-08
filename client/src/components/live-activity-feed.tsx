import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Swords, Crown, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

const iconMap = {
  TrendingUp,
  TrendingDown: TrendingUp,
  Swords,
  Crown,
  Zap,
  Activity,
};

export function LiveActivityFeed() {
  const { data: activities = [], isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activities/live"],
    refetchInterval: 3000, // Refresh every 3 seconds for live updates
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <div className="flex items-center justify-center mb-6">
          <Activity className="text-primary mr-2 animate-pulse" size={18} />
          <h3 className="text-lg font-bold">Live Activity Feed</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light">
      <div className="flex items-center justify-center mb-6">
        <Activity className="text-primary mr-2" size={18} />
        <h3 className="text-lg font-bold">Live Activity Feed</h3>
        <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Be the first to make a prediction!</p>
          </div>
        ) : (
          activities.map((activity) => {
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
                  <span className="font-medium text-slate-200 truncate">
                    {activity.username}
                  </span>
                  {activity.type === 'battle_win' && (
                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 text-xs">
                      Battle Winner
                    </Badge>
                  )}
                  {activity.type === 'survival_win' && (
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 text-xs">
                      Survivor
                    </Badge>
                  )}
                  {activity.type === 'achievement' && (
                    <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                      Achievement
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-slate-300 mt-1">
                  {activity.description}
                  {activity.amount && (
                    <span className="font-semibold text-green-400 ml-1">
                      +{activity.amount} NTIQ
                    </span>
                  )}
                  {activity.cryptocurrency && (
                    <span className="text-blue-400 ml-1">
                      ({activity.cryptocurrency})
                    </span>
                  )}
                </p>
                
                <p className="text-xs text-slate-500 mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
            );
          })
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Live updates • Last updated {formatDistanceToNow(new Date(), { addSuffix: true })}
          </p>
        </div>
      )}
    </div>
  );
}