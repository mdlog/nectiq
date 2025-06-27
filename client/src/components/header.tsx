import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartLine, Coins, User, Wallet, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useState } from 'react';
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
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  


  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Remove specific queries
      queryClient.removeQueries({ queryKey: ['/api/user'] });
      queryClient.removeQueries({ queryKey: ['/api/predictions/active'] });
      queryClient.removeQueries({ queryKey: ['/api/rewards/recent'] });
    },
    onError: (error) => {
      console.error("Logout error:", error);
    },
  });

  const handleDisconnect = async () => {
    try {
      // First logout from server
      await logoutMutation.mutateAsync();
      
      // Then disconnect wallet
      disconnect();
      
      // Clear wagmi localStorage data
      localStorage.removeItem('wagmi.wallet');
      localStorage.removeItem('wagmi.connected');
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.cache');
      localStorage.removeItem('walletconnect');
      
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      });
      
      // Force page refresh to ensure wallet state is completely cleared
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
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
      
      // Clear React Query cache
      queryClient.clear();
      
      toast({
        title: "Disconnected", 
        description: "Wallet disconnected successfully",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <header className="bg-surface border-surface-light border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src={nectiqLogo} 
              alt="Nectiq - Tactics. Timing. Triumph." 
              className="h-12 rounded-lg p-1" 
              style={{ 
                backgroundColor: 'var(--surface)',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                mixBlendMode: 'screen'
              }}
            />
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => setLocation('/')} 
              className={`transition-colors ${
                location === '/' ? "text-white font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setLocation('/dashboard')} 
              className={`transition-colors ${
                location === '/dashboard' ? "text-white font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              My Dashboard
            </button>
            <button 
              onClick={() => setLocation('/battles')} 
              className={`transition-colors ${
                location === '/battles' ? "text-white font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              Battles
            </button>
            <button 
              onClick={() => setLocation('/leaderboard')} 
              className={`transition-colors ${
                location === '/leaderboard' ? "text-white font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              Leaderboard
            </button>
            <button 
              onClick={() => setLocation('/how-to-play')} 
              className={`transition-colors ${
                location === '/how-to-play' ? "text-white font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              How to Play
            </button>
            {address?.toLowerCase() === "0x4C6165286739696849Fb3e77A16b0639D762c5B6".toLowerCase() && (
              <button 
                onClick={() => setLocation('/admin')} 
                className={`transition-colors font-semibold ${
                  location === '/admin' ? "text-white font-bold" : "text-primary hover:text-primary/80"
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-surface-light px-3 py-1 rounded-lg">
              <Coins className="text-warning" size={16} />
              <span className="font-semibold text-sm md:text-base">{user?.balance?.toLocaleString() || "0"}</span>
              <span className="text-xs text-slate-400">NTIQ</span>
            </div>
            
            {isConnected && address ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800">
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
                  onClick={() => setLocation('/wallet-login')}
                  className="flex items-center space-x-2"
                >
                  <Wallet size={16} />
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </Button>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t transition-all duration-300 ${
            isLeaderboardPage 
              ? "bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-500 border-yellow-400" 
              : "bg-surface border-surface-light"
          }`}>
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Balance Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-surface-light px-3 py-1 rounded-lg">
                  <Coins className="text-warning" size={16} />
                  <span className="font-semibold">{user?.balance?.toLocaleString() || "0"}</span>
                  <span className="text-xs text-slate-400">NTIQ</span>
                </div>
                
                {isConnected && address && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-lg border border-green-200 dark:border-green-800">
                      <Wallet className="text-green-600 dark:text-green-400" size={14} />
                      <span className="text-xs font-mono text-green-700 dark:text-green-300">
                        {address.slice(0, 4)}...{address.slice(-3)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={logoutMutation.isPending}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1"
                      title="Disconnect wallet"
                    >
                      <LogOut size={14} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <button 
                  onClick={() => {
                    setLocation('/');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    location === '/' ? "text-white font-bold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light"
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    setLocation('/dashboard');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    isLeaderboardPage 
                      ? (location === '/dashboard' ? "text-white font-semibold bg-yellow-600/20" : "text-yellow-100 hover:text-white hover:bg-yellow-600/20") 
                      : (location === '/dashboard' ? "text-white font-semibold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light")
                  }`}
                >
                  My Dashboard
                </button>
                <button 
                  onClick={() => {
                    setLocation('/battles');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    isLeaderboardPage 
                      ? (location === '/battles' ? "text-white font-semibold bg-yellow-600/20" : "text-yellow-100 hover:text-white hover:bg-yellow-600/20") 
                      : (location === '/battles' ? "text-white font-semibold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light")
                  }`}
                >
                  Battles
                </button>
                <button 
                  onClick={() => {
                    setLocation('/leaderboard');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    isLeaderboardPage 
                      ? "text-white font-bold bg-yellow-600/30" 
                      : (location === '/leaderboard' ? "text-white font-semibold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light")
                  }`}
                >
                  🏆 Leaderboard
                </button>
                <button 
                  onClick={() => {
                    setLocation('/how-to-play');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    isLeaderboardPage 
                      ? (location === '/how-to-play' ? "text-white font-semibold bg-yellow-600/20" : "text-yellow-100 hover:text-white hover:bg-yellow-600/20") 
                      : (location === '/how-to-play' ? "text-white font-semibold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light")
                  }`}
                >
                  How to Play
                </button>
                {address?.toLowerCase() === "0x4C6165286739696849Fb3e77A16b0639D762c5B6".toLowerCase() && (
                  <button 
                    onClick={() => {
                      setLocation('/admin');
                      setIsMobileMenuOpen(false);
                    }} 
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors font-semibold ${
                      isLeaderboardPage 
                        ? "text-yellow-200 hover:text-white hover:bg-yellow-600/20" 
                        : "text-primary hover:text-primary/80 hover:bg-surface-light"
                    }`}
                  >
                    Admin
                  </button>
                )}
              </nav>

              {/* Mobile Connect Wallet Button (if not connected) */}
              {!isConnected && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setLocation('/wallet-login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Wallet size={16} />
                  <span>Connect Wallet</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
