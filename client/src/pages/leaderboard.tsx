import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, TrendingUp, Target, Coins, Calendar, Users, Crown, ArrowLeft, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Link } from "wouter";

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
  profilePhoto?: string | null;
}

type FilterType = 'weekly' | 'monthly' | 'alltime';

export default function Leaderboard() {
  const [filter, setFilter] = useState<FilterType>('alltime');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // Reset to page 1 when filter or search changes
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
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

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return "text-green-400";
    if (winRate >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    }
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toLocaleString();
  };

  const getFilterData = () => {
    if (!leaderboardData) return [];
    
    let filteredData = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1,
      points: filter === 'weekly' ? (user.weeklyPoints || 0) : 
              filter === 'monthly' ? (user.monthlyPoints || 0) : 
              user.totalRewards
    })).sort((a, b) => b.points - a.points);

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Recalculate ranks after filtering
    return filteredData.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
  };

  const getPaginatedData = () => {
    const allData = getFilterData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allData.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const allData = getFilterData();
    return Math.ceil(allData.length / itemsPerPage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-primary mb-4 animate-pulse" />
          <p className="text-slate-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const filteredData = getFilterData();
  const paginatedData = getPaginatedData();
  const totalPages = getTotalPages();
  const totalUsers = filteredData.length;
  const totalPredictions = filteredData.reduce((sum, user) => sum + user.totalPredictions, 0);
  const averageWinRate = filteredData.length > 0 
    ? filteredData.reduce((sum, user) => sum + user.winRate, 0) / filteredData.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="text-primary h-8 w-8" />
              <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {totalUsers} Users
              </Badge>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-surface-light hover:bg-surface border-surface-light text-slate-300 hover:text-white transition-all duration-200"
              >
                <ArrowLeft size={16} />
                <span>Back To App</span>
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <Input
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-surface border-surface-light text-white placeholder:text-slate-400"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2">
              <Button
                variant={filter === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('weekly')}
                className="flex items-center space-x-2"
              >
                <Calendar size={16} />
                <span>Weekly</span>
              </Button>
              <Button
                variant={filter === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('monthly')}
                className="flex items-center space-x-2"
              >
                <Calendar size={16} />
                <span>Monthly</span>
              </Button>
              <Button
                variant={filter === 'alltime' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('alltime')}
                className="flex items-center space-x-2"
              >
                <Trophy size={16} />
                <span>All Time</span>
              </Button>
            </div>
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
            <CardTitle className="text-white capitalize flex items-center justify-between">
              <span>{filter === 'alltime' ? 'All Time' : filter} Rankings</span>
              {searchTerm && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {totalUsers} results for "{searchTerm}"
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {paginatedData.map((user, index) => {
                const actualRank = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div
                    key={user.id}
                    className={`p-4 border-b border-surface-light last:border-b-0 hover:bg-surface-light/50 transition-colors ${
                      actualRank <= 3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(actualRank)}
                        </div>

                        {/* Profile Photo */}
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                          {user.profilePhoto ? (
                            <img
                              src={user.profilePhoto}
                              alt={`${user.username}'s profile`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-white">{user.username}</h3>
                            <Badge variant="outline" className="text-xs">
                              #{user.uid}
                            </Badge>
                            {actualRank <= 3 && (
                              <Badge className={getRankBadgeColor(actualRank)}>
                                #{actualRank}
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
                            {user.points.toLocaleString()} NTIQ
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {filter === 'weekly' ? 'Weekly Points' : 
                           filter === 'monthly' ? 'Monthly Points' : 
                           'Total Rewards'}
                        </p>
                      </div>
                    </div>

                    {/* Additional Stats for Top 3 */}
                    {actualRank <= 3 && (
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
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-surface-light">
                <div className="text-sm text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 bg-surface hover:bg-surface-light border-surface-light"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = pageNum === 1 || 
                                       pageNum === totalPages || 
                                       Math.abs(pageNum - currentPage) <= 1;
                      
                      if (!showPage && pageNum !== 2 && pageNum !== totalPages - 1) {
                        // Show ellipsis for gaps
                        if (pageNum === 2 && currentPage > 4) {
                          return <span key={pageNum} className="px-2 text-slate-400">...</span>;
                        }
                        if (pageNum === totalPages - 1 && currentPage < totalPages - 3) {
                          return <span key={pageNum} className="px-2 text-slate-400">...</span>;
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10 p-0 bg-surface hover:bg-surface-light border-surface-light"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 bg-surface hover:bg-surface-light border-surface-light"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {paginatedData.length === 0 && (
              <div className="text-center py-12">
                {searchTerm ? (
                  <>
                    <Search className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-400 mb-2">No Users Found</h3>
                    <p className="text-sm text-slate-500">
                      No users found matching "{searchTerm}". Try a different search term.
                    </p>
                  </>
                ) : (
                  <>
                    <Trophy className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-400 mb-2">No Data Available</h3>
                    <p className="text-sm text-slate-500">
                      {filter === 'weekly' ? 'No weekly data yet' :
                       filter === 'monthly' ? 'No monthly data yet' :
                       'No predictions made yet'}
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}