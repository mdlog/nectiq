import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartLine, Coins, User, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { User as UserType } from "@shared/schema";
import nectiqLogo from "@/assets/nectiq-logo.png";

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
      // Clear all cached data
      queryClient.clear();
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      console.error("Logout error:", error);
    },
  });

  const handleDisconnect = async () => {
    try {
      // First disconnect wallet
      disconnect();
      
      // Clear wagmi localStorage data
      localStorage.removeItem('wagmi.wallet');
      localStorage.removeItem('wagmi.connected');
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.cache');
      localStorage.removeItem('walletconnect');
      
      // Then logout from server
      await logoutMutation.mutateAsync();
      
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      });
      
      // Force page refresh to ensure wallet state is completely cleared
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Disconnect error:", error);
      // Still disconnect wallet even if server call fails
      disconnect();
      
      // Clear wagmi localStorage data even on error
      localStorage.removeItem('wagmi.wallet');
      localStorage.removeItem('wagmi.connected');
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.cache');
      localStorage.removeItem('walletconnect');
      
      toast({
        title: "Disconnected", 
        description: "Wallet disconnected successfully",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <header className="bg-surface border-b border-surface-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src={nectiqLogo} 
              alt="Nectiq - Tactics. Timing. Triumph." 
              className="h-10 rounded-lg p-1" 
              style={{ 
                backgroundColor: 'var(--surface)',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                mixBlendMode: 'screen'
              }}
            />
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-slate-300 hover:text-white transition-colors">Home</a>
            <a href="/dashboard" className="text-slate-300 hover:text-white transition-colors">My Dashboard</a>
            <a href="/leaderboard" className="text-slate-300 hover:text-white transition-colors">Leaderboard</a>
            <a href="/how-to-play" className="text-slate-300 hover:text-white transition-colors">How to Play</a>
            {address?.toLowerCase() === "0x4C6165286739696849Fb3e77A16b0639D762c5B6".toLowerCase() && (
              <a href="/admin" className="text-primary hover:text-primary/80 transition-colors font-semibold">Admin</a>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-surface-light px-3 py-1 rounded-lg">
              <Coins className="text-warning" size={16} />
              <span className="font-semibold">{user?.balance?.toLocaleString() || "0"}</span>
              <span className="text-xs text-slate-400">NTIQ</span>
            </div>
            
            {isConnected && address ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800">
                  <Wallet className="text-green-600 dark:text-green-400" size={16} />
                  <span className="text-xs font-mono text-green-700 dark:text-green-300">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={logoutMutation.isPending}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  title="Disconnect wallet"
                >
                  <LogOut size={16} />
                </Button>
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
