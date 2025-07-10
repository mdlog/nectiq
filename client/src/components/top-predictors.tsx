import { useQuery } from "@tanstack/react-query";
import { Medal, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { LeaderboardEntry } from "@/types";

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
    refetchInterval: 1000, // Real-time updates every 1 second
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Medal className="text-warning mr-2" size={18} />
          Top Predictors
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
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
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Medal className="text-warning mr-2" size={18} />
          Top Predictors
        </h3>
        <div className="text-center py-8 text-slate-400">
          <Medal className="mx-auto mb-2" size={32} />
          <p>No predictors yet</p>
          <p className="text-sm">Be the first to make predictions!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Medal className="text-warning mr-2" size={18} />
        Top Predictors
      </h3>
      
      <div className="space-y-3">
        {leaderboard.slice(0, 5).map((user, index) => {
          const rank = index + 1;
          
          return (
            <div key={user.id} className="flex items-center space-x-3 p-3 bg-surface-light rounded-lg">
              <div className={`flex items-center justify-center w-8 h-8 ${getRankColor(rank)} font-bold rounded-full text-sm`}>
                {rank <= 3 ? getRankIcon(rank) : rank}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{user.username}</p>
                <p className="text-xs text-slate-400">
                  Accuracy: {user.accuracy}%
                </p>
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
      </div>
      
      <Link href="/leaderboard">
        <Button
          variant="outline"
          className="w-full mt-4 bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 group transition-all duration-200 hover:scale-[1.02]"
        >
          <Eye className="mr-2 group-hover:mr-3 transition-all duration-200" size={16} />
          View Full Leaderboard
          <ExternalLink className="ml-2 group-hover:ml-3 transition-all duration-200" size={14} />
        </Button>
      </Link>
    </div>
  );
}
