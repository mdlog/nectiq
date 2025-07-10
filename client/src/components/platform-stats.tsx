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
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache data
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
      label: 'Total Predictions',
      value: formatNumber(stats.totalPredictions),
      subtitle: `${stats.activePredictions} Active`,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: Swords,
      label: 'Total Battles',
      value: formatNumber(stats.totalBattles),
      subtitle: `${stats.activeBattles} Active`,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/20'
    },
    {
      icon: Target,
      label: 'Survival Mode',
      value: formatNumber(stats.totalSurvivalTournaments),
      subtitle: `${stats.activeSurvivalTournaments} Active`,
      color: 'text-orange-400',
      bgColor: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/20'
    },
    {
      icon: DollarSign,
      label: 'Total Staked',
      value: formatNumber(stats.totalStakedNTIQ),
      subtitle: 'NTIQ',
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/20'
    },
    {
      icon: Award,
      label: 'Rewards Paid',
      value: formatNumber(stats.totalRewardsDistributed),
      subtitle: 'NTIQ',
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/20'
    },
    {
      icon: Users,
      label: 'Total Users',
      value: formatNumber(stats.totalUsers),
      subtitle: 'Registered',
      color: 'text-cyan-400',
      bgColor: 'from-cyan-500/20 to-cyan-600/20',
      borderColor: 'border-cyan-500/20'
    },
    {
      icon: Activity,
      label: 'Transactions',
      value: formatNumber(stats.totalTransactions),
      subtitle: 'All Time',
      color: 'text-pink-400',
      bgColor: 'from-pink-500/20 to-pink-600/20',
      borderColor: 'border-pink-500/20'
    }
  ];

  return (
    <div className="w-full">
      {/* Modern Glass-morphism Design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-indigo-900/20 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Platform Statistics
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  Real-time insights from our prediction ecosystem
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-semibold text-sm">LIVE</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl mb-4 bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    
                    {/* Value */}
                    <div className={`text-2xl font-black mb-2 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      {stat.value}
                    </div>
                    
                    {/* Label */}
                    <div className="text-xs text-white/80 font-medium leading-tight mb-1">
                      {stat.label}
                    </div>
                    
                    {/* Subtitle */}
                    <div className="text-xs text-white/60">
                      {stat.subtitle}
                    </div>
                  </div>
                  
                  {/* Live indicator */}
                  <div className="absolute top-3 right-3">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-white/60">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Live data • Updates every 3 seconds
              </span>
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}