import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartLine, Coins, User, Wallet, LogOut, Menu, X, ChevronDown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useState } from 'react';
import type { User as UserType } from "@shared/schema";
import nectiqLogo from "@/assets/nectiq-logo.png";

export function Header() {
  // OPTIMIZED BALANCE UPDATES: Reduced frequency to prevent rate limiting
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
    refetchInterval: 10000, // Update every 10 seconds to reduce server load
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Disable to reduce unnecessary calls
    refetchOnReconnect: true,
  });
  
  // Dynamic Labs context for proper wallet management
  const { handleLogOut } = useDynamicContext();
  
  // Native wallet detection - check if user is authenticated
  const isConnected = !!user;
  const address = user?.walletAddress;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, itemType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemType);
      toast({
        title: "Copied successfully",
        description: `${itemType} copied to clipboard`,
      });
      
      // Reset icon after 2 seconds
      setTimeout(() => {
        setCopiedItem(null);
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };


  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('🔐 [LOGOUT] Starting complete wallet disconnect...');
      
      // 1. Disconnect wallet from MetaMask/provider level first
      if (window.ethereum) {
        try {
          // Revoke permissions dari MetaMask
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          });
          console.log('🔐 [LOGOUT] MetaMask permissions revoked');
        } catch (error) {
          console.log('🔐 [LOGOUT] MetaMask revoke not available, trying alternative...');
          try {
            // Alternative method untuk disconnect
            await window.ethereum.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }],
            });
          } catch (altError) {
            console.log('🔐 [LOGOUT] MetaMask alternative disconnect:', altError);
          }
        }
      }

      // 2. Logout dari Dynamic Labs
      await handleLogOut();
      
      // 3. Logout dari backend
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Backend logout failed');
      }
      
      // 4. Clear all Dynamic Labs session data
      const keysToRemove = [
        'dynamic-auth-token',
        'dynamic-user-data',
        'dynamic-wallet-data',
        'dynamic-session',
        'dynamic-cached-wallet',
        'dynamic-jwt-token'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear semua keys yang mengandung 'dynamic'
      Object.keys(localStorage).forEach(key => {
        if (key.toLowerCase().includes('dynamic')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('🔐 [LOGOUT] All session data cleared');
      
      return { success: true };
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
      console.log("🔌 Starting complete wallet disconnect process...");
      
      // Show loading state
      toast({
        title: "Disconnecting...",
        description: "Completely disconnecting wallet and clearing session",
      });
      
      // Execute complete logout
      await logoutMutation.mutateAsync();
      
      // Show success message
      toast({
        title: "Wallet Disconnected",
        description: "Wallet completely disconnected. Next login will require confirmation.",
      });
      
      // Navigate to landing page
      setTimeout(() => {
        setLocation('/');
        // Force page reload untuk memastikan clean state
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error("❌ Complete disconnect error:", error);
      
      // Fallback: Still perform manual cleanup even if mutation fails
      try {
        // Manual MetaMask disconnect
        if (window.ethereum) {
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          });
        }
        
        // Manual Dynamic Labs logout
        await handleLogOut();
        
        // Manual backend logout
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include'
        });
        
        // Clear storage manually
        localStorage.clear();
        sessionStorage.clear();
        queryClient.clear();
        
        toast({
          title: "Wallet Disconnected",
          description: "Wallet disconnected with fallback method",
          variant: "destructive",
        });
      } catch (fallbackError) {
        console.error("❌ Fallback disconnect also failed:", fallbackError);
        toast({
          title: "Disconnect Error",
          description: "Error during disconnect, please refresh page",
          variant: "destructive",
        });
      }
      
      // Force navigation regardless
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
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
              onClick={() => setLocation('/battles')} 
              className={`transition-colors ${
                location === '/battles' ? "text-white font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              Battles
            </button>
            <button 
              onClick={() => setLocation('/survival')} 
              className={`transition-colors ${
                location === '/survival' ? "text-white font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              Survival
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

            {user?.isAdmin && (
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
                
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-8 h-8 bg-primary rounded-full flex items-center justify-center p-0 hover:bg-primary/80"
                    >
                      <User className="text-white" size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        User Information
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex flex-col items-start space-y-1 p-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Username:</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(user?.username || '', 'Username')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedItem === 'Username' ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                        {user?.username || 'Loading...'}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start space-y-1 p-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <ChartLine className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">UID:</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(user?.uid || '', 'UID')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedItem === 'UID' ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-6 font-mono">
                        {user?.uid || 'Loading...'}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setLocation('/dashboard')}
                      className="flex items-center space-x-2 p-3 cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      <span>Go to Dashboard</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                
                {/* User Profile Dropdown - Not Connected */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-8 h-8 bg-primary rounded-full flex items-center justify-center p-0 hover:bg-primary/80"
                    >
                      <User className="text-white" size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        User Information
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex flex-col items-start space-y-1 p-3">
                      <div className="flex items-center space-x-2 w-full">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Username:</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                        {user?.username || 'Not connected'}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start space-y-1 p-3">
                      <div className="flex items-center space-x-2 w-full">
                        <ChartLine className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">UID:</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-6 font-mono">
                        {user?.uid || 'Not connected'}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setLocation('/wallet-login')}
                      className="flex items-center space-x-2 p-3 cursor-pointer"
                    >
                      <Wallet className="h-4 w-4" />
                      <span>Connect Wallet</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t transition-all duration-300 bg-surface border-surface-light">
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
                    setLocation('/battles');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    location === '/battles' ? "text-white font-bold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light"
                  }`}
                >
                  Battles
                </button>
                <button 
                  onClick={() => {
                    setLocation('/survival');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    location === '/survival' ? "text-white font-bold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light"
                  }`}
                >
                  Survival
                </button>
                <button 
                  onClick={() => {
                    setLocation('/leaderboard');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    location === '/leaderboard' ? "text-white font-bold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light"
                  }`}
                >
                  Leaderboard
                </button>
                <button 
                  onClick={() => {
                    setLocation('/how-to-play');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    location === '/how-to-play' ? "text-white font-bold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light"
                  }`}
                >
                  How to Play
                </button>

                {user?.isAdmin && (
                  <button 
                    onClick={() => {
                      setLocation('/admin');
                      setIsMobileMenuOpen(false);
                    }} 
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors font-semibold ${
                      location === '/admin' ? "text-white font-bold bg-primary" : "text-primary hover:text-primary/80 hover:bg-surface-light"
                    }`}
                  >
                    Admin
                  </button>
                )}

              </nav>

              {/* User Information Section */}
              <div className="border-t border-surface-light pt-3 mt-3">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-white mb-3">
                    User Information
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Username:</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {user?.username || 'Not connected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ChartLine className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">UID:</span>
                      </div>
                      <span className="text-sm text-gray-400 font-mono">
                        {user?.uid || 'Not connected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
