import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

interface WalletState {
  isConnected: boolean;
  address?: string;
  balance?: string;
  network?: string;
  isLoading: boolean;
}

export function useWalletIntegration() {
  const { address, isConnected, chain } = useAccount();
  const { toast } = useToast();
  
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isLoading: false,
  });

  // Get balance with auto-refresh
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
      refetchInterval: 15000, // Refetch every 15 seconds
    },
  });

  // Update wallet state when account changes
  useEffect(() => {
    setWalletState(prev => ({
      ...prev,
      isConnected,
      address: address,
      network: chain?.name,
      balance: balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : undefined,
    }));
  }, [isConnected, address, chain, balance]);

  // Wallet address verification with auto-disconnect
  useEffect(() => {
    const verifyWalletAddress = async () => {
      if (!isConnected || !address) return;

      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          
          // Normalize addresses for comparison (both to lowercase)
          const currentWalletAddress = address.toLowerCase();
          const loggedInWalletAddress = userData.walletAddress?.toLowerCase();
          
          // If wallet addresses don't match, force disconnect
          if (loggedInWalletAddress && currentWalletAddress !== loggedInWalletAddress) {
            console.log('Wallet address mismatch detected:', {
              current: currentWalletAddress,
              expected: loggedInWalletAddress
            });
            
            // Log security event
            fetch('/api/security/wallet-mismatch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                currentAddress: currentWalletAddress,
                expectedAddress: loggedInWalletAddress,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
              })
            }).catch(console.error);
            
            toast({
              title: "Wallet Address Mismatch",
              description: "MetaMask wallet address differs from logged-in account. Disconnecting for security.",
              variant: "destructive",
            });
            
            // Force logout by clearing session
            await fetch('/api/auth/logout', { method: 'POST' });
            
            // Reload page to clear all state
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Wallet verification error:', error);
      }
    };

    // Verify immediately when wallet connects or address changes
    verifyWalletAddress();
    
    // Set up periodic verification every 5 seconds when connected
    const verificationInterval = setInterval(verifyWalletAddress, 5000);
    
    return () => clearInterval(verificationInterval);
  }, [isConnected, address, toast]);

  // Handle wallet authentication with backend
  const authenticateWallet = useCallback(async (walletAddress: string) => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true }));

      // Check if user exists or create new user
      const response = await fetch('/api/auth/wallet-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        toast({
          title: "Wallet Authenticated",
          description: `Welcome ${userData.username}! Your account is now synced.`,
        });
        return userData;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate wallet",
        variant: "destructive",
      });
      throw error;
    } finally {
      setWalletState(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  // Sync PTS balance with backend
  const syncBalance = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        return userData.balance; // PTS balance from backend
      }
    } catch (error) {
      console.error('Failed to sync balance:', error);
    }
  }, [address]);

  // Refresh both crypto and PTS balances
  const refreshBalances = useCallback(async () => {
    if (!address) return;
    
    try {
      // Refresh crypto balance
      await refetchBalance();
      
      // Refresh PTS balance
      const ptsBalance = await syncBalance();
      
      toast({
        title: "Balances Updated",
        description: "Both crypto and PTS balances have been refreshed",
      });
      
      return { cryptoBalance: balance, ptsBalance };
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh balances",
        variant: "destructive",
      });
    }
  }, [address, refetchBalance, syncBalance, balance, toast]);

  return {
    walletState,
    authenticateWallet,
    syncBalance,
    refreshBalances,
    refetchBalance,
  };
}