import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartLine, Coins, User, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { User as UserType } from "@shared/schema";

export function Header() {
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      });
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    },
  });

  const handleDisconnect = async () => {
    try {
      await logoutMutation.mutateAsync();
      disconnect();
    } catch (error) {
      disconnect();
    }
  };

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
            <a href="/" className="text-slate-300 hover:text-white transition-colors">Home</a>
            <a href="/dashboard" className="text-slate-300 hover:text-white transition-colors">My Dashboard</a>
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
            
            {isConnected && address ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800">
                  <Wallet className="text-green-600 dark:text-green-400" size={16} />
                  <span className="text-xs font-mono text-green-700 dark:text-green-300">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/wallet-login'}
                  className="flex items-center space-x-2"
                >
                  <Wallet size={16} />
                  <span>Connect Wallet</span>
                </Button>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
