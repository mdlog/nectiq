import { ChartLine, Coins, User, LogOut, Menu, X, ChevronDown, Copy, Check, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { RainbowConnectButton } from "@/components/RainbowConnectButton";
import { WalletConnectionStatus } from "@/components/WalletConnectionStatus";
import { useRainbowAuth } from "@/hooks/useRainbowAuth";
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useState } from 'react';
import type { User as UserType } from "@shared/schema";
import nectiqLogo from "@/assets/nectiq-logo.png";

export function Header() {
  // Use Rainbow Kit authentication hook
  const { 
    user, 
    isConnected, 
    address, 
    logout, 
    isLoggingOut 
  } = useRainbowAuth();
  
  const { toast } = useToast();
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


  // Rainbow Kit handles all wallet connection logic

  return (
    <header className="bg-surface border-surface-light border-b">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src={nectiqLogo} 
              alt="Nectiq - Tactics. Timing. Triumph." 
              className="h-8 sm:h-12 rounded-lg p-1" 
              style={{ 
                backgroundColor: 'var(--surface)',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                mixBlendMode: 'screen'
              }}
            />
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => setLocation('/home')} 
              className={`transition-colors ${
                location === '/home' ? "text-white font-bold" : "text-slate-300 hover:text-white"
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
              onClick={() => setLocation('/parlay')} 
              className={`transition-colors ${
                location === '/parlay' ? "text-white font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              Parlay
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
                {/* Wallet Connection Status */}
                <WalletConnectionStatus className="hidden sm:block" />
                
                <div className="hidden sm:flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800">
                  <Wallet className="text-green-600 dark:text-green-400" size={16} />
                  <span className="text-xs font-mono text-green-700 dark:text-green-300">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
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
                      onClick={() => setLocation('/user-dashboard')}
                      className="flex items-center space-x-2 p-3 cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      <span>Go to Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="flex items-center space-x-2 p-3 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <RainbowConnectButton 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                />
                
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
                    <div className="p-3">
                      <RainbowConnectButton 
                        variant="default" 
                        size="sm"
                        className="w-full"
                      />
                    </div>
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
                      onClick={() => logout()}
                      disabled={isLoggingOut}
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
                    setLocation('/home');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    location === '/home' ? "text-white font-bold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light"
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
                    setLocation('/parlay');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    location === '/parlay' ? "text-white font-bold bg-surface-light" : "text-slate-300 hover:text-white hover:bg-surface-light"
                  }`}
                >
                  Parlay
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
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white">
                      User Information
                    </p>
                    {/* Mobile Profile Badge */}
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="text-white" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Username:</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {user?.username || 'Not connected'}
                        </span>
                        {user?.username && (
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
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ChartLine className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">UID:</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400 font-mono">
                          {user?.uid || 'Not connected'}
                        </span>
                        {user?.uid && (
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
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Go to Dashboard Button for Mobile */}
                  {user && (
                    <div className="mt-3 pt-2 border-t border-surface-light">
                      <Button
                        onClick={() => {
                          setLocation('/user-dashboard');
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Go to Dashboard</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Connect Wallet Button (if not connected) */}
              {!isConnected && (
                <div className="border-t border-surface-light pt-3 mt-3">
                  <RainbowConnectButton 
                    variant="default" 
                    size="sm"
                    className="w-full flex items-center justify-center space-x-2"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
