import { useQuery } from "@tanstack/react-query";
import { Medal, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { LeaderboardEntry, UserStats } from "@/types";
import type { User } from "@shared/schema";

function getRankIcon(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `${rank}`;
  }
}

function getRankColor(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-warning text-dark";
    case 2:
      return "bg-slate-400 text-dark";
    case 3:
      return "bg-amber-600 text-white";
    default:
      return "bg-surface-light text-slate-300";
  }
}

export function TopPredictors() {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
    refetchInterval: false, // DISABLED to prevent rate limiting
    refetchIntervalInBackground: false,
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
  });

  // Get current user information
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 60000,
  });

  // Get current user stats to access their rank
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
    retry: false,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light h-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Medal className="text-warning mr-2" size={18} />
          Top Predictors
        </h3>
        <div className="space-y-3 flex-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-3 bg-surface-light rounded-lg animate-pulse">
              <div className="h-12 bg-slate-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light h-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Medal className="text-warning mr-2" size={18} />
          Top Predictors
        </h3>
        <div className="text-center py-8 text-slate-400 flex-1 flex flex-col justify-center">
          <Medal className="mx-auto mb-2" size={32} />
          <p>No predictors yet</p>
          <p className="text-sm">Be the first to make predictions!</p>
        </div>
      </div>
    );
  }

  // Limit to top 6 predictors only
  const topSixPredictors = leaderboard.slice(0, 6);
  
  // Check if current user is in top 6
  const currentUserInTopSix = user && topSixPredictors.some(predictor => predictor.id === user.id);
  
  // Debug logging
  console.log("🔍 [TOP-PREDICTORS] Debug:", {
    user: !!user,
    userStats: !!userStats,
    currentUserInTopSix,
    userRank: userStats?.rank,
    userAccuracy: userStats?.accuracy,
    userRewards: userStats?.totalRewards,
    topSixCount: topSixPredictors.length
  });

  // Create user rank entry if user is logged in and not in top 6
  const userRankEntry = user && userStats && !currentUserInTopSix ? {
    id: user.id,
    username: "You",
    rank: userStats.rank || 0, // Default to 0 if no rank assigned
    totalPredictions: 0,
    correctPredictions: 0,
    accuracy: userStats.accuracy || 0,
    totalRewards: userStats.totalRewards || 0,
  } : null;

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Medal className="text-warning mr-2" size={18} />
        Top Predictors
      </h3>
      
      <div className="space-y-3 flex-1">
        {topSixPredictors.map((user, index) => {
          // Use backend-provided rank for consistency
          const rank = user.rank;
          
          return (
            <div key={user.id} className="flex items-center space-x-3 p-3 bg-surface-light rounded-lg">
              <div className={`flex items-center justify-center w-8 h-8 ${getRankColor(rank)} font-bold rounded-full text-sm`}>
                {rank <= 3 ? getRankIcon(rank) : rank}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{user.username}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>Accuracy: {user.accuracy}%</span>
                  {(user.totalBattles || 0) > 0 && (
                    <span className="text-blue-400">⚔{user.wonBattles || 0}/{user.totalBattles || 0}</span>
                  )}
                  {(user.totalSurvivalTournaments || 0) > 0 && (
                    <span className="text-orange-400">🏆{user.wonSurvivalTournaments || 0}/{user.totalSurvivalTournaments || 0}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-success">
                  {user.totalRewards.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">NTIQ</p>
              </div>
            </div>
          );
        })}
        
        {/* Show current user's rank if they're not in top 6 */}
        {userRankEntry && (
          <div className="flex items-center space-x-3 p-3 bg-surface-light rounded-lg">
            <div className={`flex items-center justify-center w-8 h-8 ${getRankColor(userRankEntry.rank)} font-bold rounded-full text-sm`}>
              {userRankEntry.rank <= 3 ? getRankIcon(userRankEntry.rank) : userRankEntry.rank}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-primary">You</p>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>Accuracy: {userRankEntry.accuracy}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-success">
                {userRankEntry.totalRewards.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">NTIQ</p>
            </div>
          </div>
        )}
        
        {/* Fill remaining space if less than 6 predictors and no user rank entry */}
        {topSixPredictors.length < 6 && !userRankEntry && (
          <div className="flex-1 flex flex-col justify-center items-center text-slate-400 text-sm">
            <p>{6 - topSixPredictors.length} more slots available</p>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <Link href="/leaderboard">
          <Button
            variant="outline"
            className="w-full bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 group transition-all duration-200 hover:scale-[1.02]"
          >
            <Eye className="mr-2 group-hover:mr-3 transition-all duration-200" size={16} />
            View Full Leaderboard
            <ExternalLink className="ml-2 group-hover:ml-3 transition-all duration-200" size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
