import { useQuery } from "@tanstack/react-query";
import { BarChart3, Target, Trophy, Gift } from "lucide-react";
import type { UserStats } from "@/types";

export function HeroStats() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-surface-light animate-pulse">
            <div className="h-16 bg-surface-light rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Predictions</p>
            <p className="text-2xl font-bold">{stats?.totalPredictions || 0}</p>
          </div>
          <BarChart3 className="text-primary" size={24} />
        </div>
      </div>
      
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Accuracy Rate</p>
            <p className="text-2xl font-bold text-success">{stats?.accuracy || 0}%</p>
          </div>
          <Target className="text-success" size={24} />
        </div>
      </div>
      
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Current Rank</p>
            <p className="text-2xl font-bold text-warning">
              {stats?.rank ? `#${stats.rank}` : "N/A"}
            </p>
          </div>
          <Trophy className="text-warning" size={24} />
        </div>
      </div>
      
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Rewards</p>
            <p className="text-2xl font-bold text-primary">{stats?.totalRewards || 0}</p>
          </div>
          <Gift className="text-primary" size={24} />
        </div>
      </div>
    </div>
  );
}
