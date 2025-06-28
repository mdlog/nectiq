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

  // Direct MetaMask account change listener with enhanced detection
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      console.log('No ethereum provider found');
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log('🔍 MetaMask accountsChanged event triggered:', accounts);
      
      // Check if user is logged in
      try {
        const response = await fetch('/api/user');
        console.log('User check response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          const loggedInAddress = userData.walletAddress?.toLowerCase();
          console.log('Logged in address:', loggedInAddress);
          
          if (loggedInAddress) {
            const currentAddress = accounts[0]?.toLowerCase();
            console.log('Current MetaMask address:', currentAddress);
            
            // If no current address or addresses don't match
            if (!currentAddress || currentAddress !== loggedInAddress) {
              console.warn('🚨 WALLET MISMATCH DETECTED!', {
                currentMetaMask: currentAddress || 'disconnected',
                loggedInUser: loggedInAddress,
                mismatch: true
              });
              
              // Log security event
              fetch('/api/security/wallet-mismatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  currentAddress: currentAddress || 'disconnected',
                  expectedAddress: loggedInAddress,
                  userAgent: navigator.userAgent,
                  timestamp: new Date().toISOString()
                })
              }).catch(console.error);
              
              toast({
                title: "Security Alert",
                description: "MetaMask account changed. Logging out for security.",
                variant: "destructive",
              });
              
              // Force logout
              await fetch('/api/auth/logout', { method: 'POST' });
              
              // Reload page immediately
              window.location.reload();
            } else {
              console.log('✅ Wallet addresses match - no action needed');
            }
          }
        } else if (response.status === 401) {
          console.log('User not logged in - no verification needed');
        }
      } catch (error) {
        console.error('Account change verification error:', error);
      }
    };

    // Listen for account changes
    console.log('Setting up MetaMask account change listener');
    ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Also listen for connect/disconnect events
    const handleConnect = (connectInfo: any) => {
      console.log('MetaMask connected:', connectInfo);
    };
    
    const handleDisconnect = (error: any) => {
      console.log('MetaMask disconnected:', error);
    };
    
    ethereum.on('connect', handleConnect);
    ethereum.on('disconnect', handleDisconnect);
    
    // Manual check on mount to catch existing mismatches
    const checkCurrentState = async () => {
      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        console.log('Initial wallet check - MetaMask accounts:', accounts);
        if (accounts && accounts.length > 0) {
          await handleAccountsChanged(accounts);
        }
      } catch (error) {
        console.error('Initial wallet check failed:', error);
      }
    };
    
    // Check immediately
    checkCurrentState();
    
    return () => {
      console.log('Cleaning up MetaMask event listeners');
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('connect', handleConnect);
      ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [toast]);

  // Wallet address verification with auto-disconnect
  useEffect(() => {
    const verifyWalletAddress = async () => {
      // Only check if wallet is connected and we have an address
      if (!isConnected || !address) return;

      try {
        const response = await fetch('/api/user');
        
        // If user is not authenticated, skip verification
        if (response.status === 401) return;
        
        if (response.ok) {
          const userData = await response.json();
          
          // Normalize addresses for comparison (both to lowercase)
          const currentWalletAddress = address.toLowerCase();
          const loggedInWalletAddress = userData.walletAddress?.toLowerCase();
          
          // If wallet addresses don't match, force disconnect
          if (loggedInWalletAddress && currentWalletAddress !== loggedInWalletAddress) {
            console.warn('🚨 WALLET ADDRESS MISMATCH DETECTED!', {
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
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Wallet verification error:', error);
      }
    };

    // Verify immediately when wallet connects or address changes
    if (isConnected && address) {
      verifyWalletAddress();
    }
    
    // Set up periodic verification every 3 seconds when connected
    let verificationInterval: NodeJS.Timeout | null = null;
    if (isConnected && address) {
      verificationInterval = setInterval(verifyWalletAddress, 3000);
    }
    
    return () => {
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
    };
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