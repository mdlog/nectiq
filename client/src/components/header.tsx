import { useQuery } from "@tanstack/react-query";
import { ChartLine, Coins, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export function Header() {
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  return (
    <header className="bg-surface border-b border-surface-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <ChartLine className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold">CryptoPredikt</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-slate-300 hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Predictions</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Leaderboard</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Rewards</a>
            <a href="/admin" className="text-primary hover:text-primary/80 transition-colors font-semibold">Admin</a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-surface-light px-3 py-1 rounded-lg">
              <Coins className="text-warning" size={16} />
              <span className="font-semibold">{user?.balance?.toLocaleString() || "0"}</span>
              <span className="text-xs text-slate-400">PTS</span>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
