import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, TrendingUp, Target, Coins, Calendar, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
  id: number;
  username: string;
  totalPredictions: number;
  correctPredictions: number;
  totalRewards: number;
  winRate: number;
  rank: number;
  uid: string;
  points: number;
  weeklyPoints?: number;
  monthlyPoints?: number;
}

type FilterType = 'weekly' | 'monthly' | 'alltime';

export default function Leaderboard() {
  const [filter, setFilter] = useState<FilterType>('alltime');
  
  const { data: leaderboardData, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ['/api/leaderboard', filter],
    refetchInterval: 30000,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={20} />;
      case 2:
        return <Medal className="text-gray-400" size={20} />;
      case 3:
        return <Award className="text-amber-600" size={20} />;
      default:
        return <span className="text-slate-400 font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  const getFilterData = () => {
    if (!leaderboardData) return [];
    
    return leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1,
      points: filter === 'weekly' ? (user.weeklyPoints || 0) : 
              filter === 'monthly' ? (user.monthlyPoints || 0) : 
              user.totalRewards
    })).sort((a, b) => b.points - a.points);
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toLocaleString();
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 80) return "text-green-400";
    if (winRate >= 60) return "text-yellow-400";
    if (winRate >= 40) return "text-orange-400";
    return "text-red-400";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface rounded"></div>
            <div className="h-32 bg-surface rounded"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-surface rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredData = getFilterData();
  const totalUsers = filteredData.length;
  const totalPredictions = filteredData.reduce((sum, user) => sum + user.totalPredictions, 0);
  const averageWinRate = filteredData.length > 0 
    ? filteredData.reduce((sum, user) => sum + user.winRate, 0) / filteredData.length 
    : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="text-primary h-8 w-8" />
              <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2 mb-6">
            <Button
              variant={filter === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('weekly')}
              className="flex items-center space-x-2"
            >
              <Calendar size={16} />
              <span>Weekly</span>
            </Button>
            <Button
              variant={filter === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('monthly')}
              className="flex items-center space-x-2"
            >
              <Calendar size={16} />
              <span>Monthly</span>
            </Button>
            <Button
              variant={filter === 'alltime' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('alltime')}
              className="flex items-center space-x-2"
            >
              <Trophy size={16} />
              <span>All Time</span>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-surface border-surface-light">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="text-primary h-8 w-8" />
                  <div>
                    <p className="text-sm text-slate-400">Total Predictors</p>
                    <p className="text-2xl font-bold text-white">{totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-surface border-surface-light">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Target className="text-secondary h-8 w-8" />
                  <div>
                    <p className="text-sm text-slate-400">Total Predictions</p>
                    <p className="text-2xl font-bold text-white">{totalPredictions.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-surface border-surface-light">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-success h-8 w-8" />
                  <div>
                    <p className="text-sm text-slate-400">Avg. Win Rate</p>
                    <p className="text-2xl font-bold text-white">{averageWinRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leaderboard List */}
        <Card className="bg-surface border-surface-light">
          <CardHeader>
            <CardTitle className="text-white capitalize">
              {filter === 'alltime' ? 'All Time' : filter} Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredData.map((user, index) => (
                <div
                  key={user.id}
                  className={`p-4 border-b border-surface-light last:border-b-0 hover:bg-surface-light/50 transition-colors ${
                    index < 3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(user.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-white">{user.username}</h3>
                          <Badge variant="outline" className="text-xs">
                            #{user.uid}
                          </Badge>
                          {index < 3 && (
                            <Badge className={getRankBadgeColor(user.rank)}>
                              #{user.rank}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Target size={12} />
                            <span>{user.totalPredictions} predictions</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp size={12} />
                            <span className={getWinRateColor(user.winRate)}>
                              {user.winRate.toFixed(1)}% win rate
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Coins className="text-primary" size={16} />
                        <span className="text-xl font-bold text-white">
                          {formatPoints(user.points)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {filter === 'weekly' ? 'Weekly' : 
                         filter === 'monthly' ? 'Monthly' : 'Total'} Points
                      </p>
                    </div>
                  </div>

                  {/* Additional Stats for Top 3 */}
                  {index < 3 && (
                    <div className="mt-3 pt-3 border-t border-surface-light/50">
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="text-center">
                          <p className="text-slate-400">Correct</p>
                          <p className="font-semibold text-success">{user.correctPredictions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Total Rewards</p>
                          <p className="font-semibold text-primary">{formatPoints(user.totalRewards)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Accuracy</p>
                          <p className={`font-semibold ${getWinRateColor(user.winRate)}`}>
                            {user.winRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">No Data Available</h3>
                <p className="text-sm text-slate-500">
                  {filter === 'weekly' ? 'No weekly data yet' :
                   filter === 'monthly' ? 'No monthly data yet' :
                   'No predictions made yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}