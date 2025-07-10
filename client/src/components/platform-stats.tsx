import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Swords, Target, DollarSign, Award, Users, Activity } from 'lucide-react';

interface PlatformStats {
  totalPredictions: number;
  totalBattles: number;
  totalSurvivalTournaments: number;
  totalStakedNTIQ: number;
  totalRewardsDistributed: number;
  activePredictions: number;
  activeBattles: number;
  activeSurvivalTournaments: number;
  totalUsers: number;
  totalTransactions: number;
}

export function PlatformStats() {
  const { data: stats, isLoading, error } = useQuery<PlatformStats>({
    queryKey: ['/api/platform/stats'],
    refetchInterval: 3000, // Update every 3 seconds for real-time data
    refetchIntervalInBackground: true,
    staleTime: 1000, // Consider data stale after 1 second
  });

  console.log('🔍 [PLATFORM STATS] Component state:', { 
    isLoading, 
    hasStats: !!stats, 
    error: error?.message,
    stats 
  });

  if (isLoading || !stats) {
    return (
      <div className="w-full">
        <Card className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Platform Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-700 rounded-lg h-16 mb-2"></div>
                  <div className="bg-slate-700 rounded h-4 mb-1"></div>
                  <div className="bg-slate-700 rounded h-3"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const statsData = [
    {
      icon: TrendingUp,
      title: 'Total Predictions',
      value: formatNumber(stats.totalPredictions),
      subtitle: `${stats.activePredictions} Active`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: Swords,
      title: 'Total Battles',
      value: formatNumber(stats.totalBattles),
      subtitle: `${stats.activeBattles} Active`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      icon: Target,
      title: 'Survival Mode',
      value: formatNumber(stats.totalSurvivalTournaments),
      subtitle: `${stats.activeSurvivalTournaments} Active`,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      icon: DollarSign,
      title: 'Total Staked',
      value: formatNumber(stats.totalStakedNTIQ),
      subtitle: 'NTIQ',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      icon: Award,
      title: 'Rewards Paid',
      value: formatNumber(stats.totalRewardsDistributed),
      subtitle: 'NTIQ',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      icon: Users,
      title: 'Total Users',
      value: formatNumber(stats.totalUsers),
      subtitle: 'Registered',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },
    {
      icon: Activity,
      title: 'Transactions',
      value: formatNumber(stats.totalTransactions),
      subtitle: 'All Time',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20'
    }
  ];

  console.log('🎯 [PLATFORM STATS] Rendering with data:', { 
    totalPredictions: stats.totalPredictions,
    totalBattles: stats.totalBattles,
    statsData: statsData.map(s => ({ title: s.title, value: s.value }))
  });

  return (
    <div className="w-full">
      <Card className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border-slate-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform Statistics
            <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
              LIVE
            </Badge>
          </CardTitle>
          <p className="text-slate-300 text-sm">
            Real-time data dari seluruh aktivitas platform Nectiq
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className={`relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${stat.bgColor} ${stat.borderColor}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2 rounded-lg mb-3 ${stat.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-300 font-medium mb-1">
                      {stat.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      {stat.subtitle}
                    </div>
                  </div>
                  
                  {/* Animated pulse effect for live data */}
                  <div className={`absolute top-2 right-2 w-2 h-2 ${stat.bgColor} rounded-full animate-pulse`}></div>
                </div>
              );
            })}
          </div>
          
          {/* Additional real-time indicator */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Data update setiap 3 detik</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}