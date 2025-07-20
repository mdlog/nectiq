import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { Wallet, Copy, Check, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export default function DynamicWalletWidget() {
  const { user, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);

  const walletAddress = user?.verifiedCredentials?.[0]?.address;
  const isConnected = !!user && !!walletAddress;

  // Remove auto-authentication as it's now handled by DynamicProvider events

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast({
          title: "Address Copied",
          description: "Wallet address copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Could not copy address to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('🔐 [WIDGET] Starting complete wallet disconnect...');
      
      // 1. Disconnect wallet from MetaMask/provider level first
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          });
          console.log('🔐 [WIDGET] MetaMask permissions revoked');
        } catch (error) {
          console.log('🔐 [WIDGET] MetaMask revoke not available, trying alternative...');
          try {
            await window.ethereum.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }],
            });
          } catch (altError) {
            console.log('🔐 [WIDGET] MetaMask alternative disconnect:', altError);
          }
        }
      }
      
      // 2. Logout dari Dynamic Labs
      await handleLogOut();
      
      // 3. Logout dari backend
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
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
      
      toast({
        title: "Wallet Disconnected",
        description: "Wallet completely disconnected. Next login will require confirmation.",
      });
      
      // Force redirect ke landing page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error('🔐 [WIDGET] Disconnect error:', error);
      toast({
        title: "Disconnect Error",
        description: "Error during disconnect, but wallet should be logged out",
        variant: "destructive",
      });
      // Fallback redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  };

  const loginWithWallet = async (address?: string) => {
    const addressToUse = address || walletAddress;
    if (!addressToUse) return;

    try {
      console.log('Attempting authentication with wallet:', addressToUse);
      
      const response = await fetch('/api/auth/dynamic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          walletAddress: addressToUse,
          address: addressToUse
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Authentication failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Authentication successful:', data);

      if (data.success && data.user) {
        toast({
          title: "Welcome!",
          description: `Connected as ${data.user.username || 'User'}`,
        });
        // Use setTimeout to allow toast to show before reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      setHasAuthenticated(false); // Reset to allow retry
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Connection failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="ml-2 h-6 w-6 p-0"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </Button>
        </div>
        <Button 
          onClick={loginWithWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Login
        </Button>
        <Button 
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
        >
          <LogOut size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Dynamic Labs Widget Only - Clean and Simple */}
      <DynamicWidget />
    </div>
  );
}