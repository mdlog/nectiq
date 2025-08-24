import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest, setGlobalWalletAddress } from '@/lib/queryClient';
import type { User } from "@shared/schema";
import { getStoredReferralCode, clearStoredReferralCode } from '@/lib/referralHandler';

export function useRainbowAuth() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Manual wallet detection fallback
  const [manualAddress, setManualAddress] = React.useState<string | null>(null);
  const [isManuallyConnected, setIsManuallyConnected] = React.useState(false);
  
  // Manual wallet detection as backup
  React.useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setManualAddress(accounts[0]);
            setIsManuallyConnected(true);
          } else {
            setManualAddress(null);
            setIsManuallyConnected(false);
          }
        } catch (error) {
          setManualAddress(null);
          setIsManuallyConnected(false);
        }
      } else {
        setManualAddress(null);
        setIsManuallyConnected(false);
      }
    };
    
    checkWalletConnection();
    const interval = setInterval(checkWalletConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Use manual detection as fallback
  const finalAddress = address || manualAddress;
  const finalIsConnected = isConnected || isManuallyConnected;

  // Get user data from backend with fallback detection
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: finalIsConnected && !!finalAddress,
    refetchInterval: 30000, // Reduced from 10s to 30s to avoid rate limiting
    staleTime: 25000,
  });

  // Rate limiting state
  const [lastAuthAttempt, setLastAuthAttempt] = React.useState<number>(0);
  const [authRetryCount, setAuthRetryCount] = React.useState<number>(0);
  
  // Rate limiting utility
  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAuthAttempt;
    const minInterval = Math.min(1000 * Math.pow(1.5, authRetryCount), 10000); // Gentler backoff, max 10s
    
    if (timeSinceLastAttempt < minInterval) {
      const waitTime = minInterval - timeSinceLastAttempt;
      throw new Error(`Rate limit: Please wait ${Math.ceil(waitTime / 1000)}s before trying again.`);
    }
    
    setLastAuthAttempt(now);
  };

  // Wallet authentication mutation
  const authenticateWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      // Check rate limiting first
      checkRateLimit();
      
      console.log('🌈 [RAINBOW] Authenticating wallet:', walletAddress);
      console.log('🌈 [RAINBOW] Chain info:', { chainId: chain?.id, chainName: chain?.name });
      
      // Check for stored referral code
      const referralCode = getStoredReferralCode();
      console.log('🎯 [REFERRAL] Found stored referral code:', referralCode);
      
      try {
        const requestBody = { 
          walletAddress: walletAddress.toLowerCase(),
          chainId: chain?.id,
          chainName: chain?.name,
          ...(referralCode && { referralCode })
        };
        
        console.log('🌈 [RAINBOW] Request payload:', requestBody);
        
        const response = await fetch('/api/auth/wallet-connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        });

        console.log('🌈 [RAINBOW] Response status:', response.status);
        console.log('🌈 [RAINBOW] Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.status === 429) {
          setAuthRetryCount(prev => prev + 1);
          throw new Error('Too many requests. Please try again later.');
        }

        if (!response.ok) {
          const errorData = await response.text();
          console.error('🌈 [RAINBOW] Error response:', errorData);
          setAuthRetryCount(prev => prev + 1);
          throw new Error(errorData || `HTTP ${response.status}: Authentication failed`);
        }

        const result = await response.json();
        console.log('🌈 [RAINBOW] Success response:', result);
        
        // Reset retry count on success
        setAuthRetryCount(0);
        return result;
      } catch (error) {
        console.error('🌈 [RAINBOW] Network error:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setAuthRetryCount(prev => prev + 1);
          throw new Error('Network connection failed. Please check your internet connection.');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ [RAINBOW] Wallet authenticated successfully:', data);
      
      // Clear referral code after successful authentication (it's been processed)
      if (getStoredReferralCode()) {
        clearStoredReferralCode();
        console.log('🧹 [REFERRAL] Cleared processed referral code');
      }
      
      // Note: Wallet connection notification is handled by useWalletConnectionStatus
      // to prevent duplicate notifications and ensure it only shows on first connection

      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Redirect to dashboard if on landing page
      setLocation('/');
    },
    onError: (error: any) => {
      console.error('❌ [RAINBOW] Authentication failed:', error);
      
      // Don't show toast for expected errors (rate limiting, network issues)
      if (!error.message.includes('Rate limit') && 
          !error.message.includes('Too many requests') &&
          !error.message.includes('Network connection failed')) {
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to authenticate wallet",
          variant: "destructive",
        });
        
        // Only disconnect on non-rate-limit errors
        disconnect();
      } else if (error.message.includes('Rate limit') || error.message.includes('Too many requests')) {
        // Show user-friendly message for rate limiting, but less frequently
        console.warn('🕒 [RAINBOW] Rate limited, waiting before retry...');
      }
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('🔐 [RAINBOW] Starting logout...');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Backend logout failed');
      }
      
      return { success: true };
    },
    onSuccess: () => {
      console.log('✅ [RAINBOW] Logout successful');
      
      // Disconnect wallet
      disconnect();
      
      // Clear all cached data
      queryClient.clear();
      
      // Clear global wallet address
      setGlobalWalletAddress(null);
      
      toast({
        title: "Wallet Disconnected",
        description: "Successfully logged out",
        variant: "default"
      });
      
      // Redirect to home
      setLocation('/');
    },
    onError: (error: any) => {
      console.error('❌ [RAINBOW] Logout failed:', error);
      
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to logout",
        variant: "destructive"
      });
    },
  });

  // Auto-authenticate when wallet connects and clear state when disconnected
  React.useEffect(() => {

    if (!finalIsConnected) {
      // Wallet disconnected - clear state
      console.log('🌈 [RAINBOW] Wallet disconnected - clearing user state');
      queryClient.removeQueries({ queryKey: ["/api/user"] });
      setGlobalWalletAddress(null);
    } else if (finalIsConnected && finalAddress && !user && !isLoading && !authenticateWalletMutation.isPending) {
      console.log('🌈 [RAINBOW] Auto-authenticating wallet:', finalAddress);
      authenticateWalletMutation.mutate(finalAddress);
    }
  }, [finalIsConnected, finalAddress, user, isLoading]);

  // Set global wallet address for API requests
  React.useEffect(() => {
    if (!finalIsConnected) {
      setGlobalWalletAddress(null);
      console.log('🔐 [RAINBOW] Cleared global wallet address');
    } else {
      const walletAddress = user?.walletAddress || finalAddress;
      setGlobalWalletAddress(walletAddress || null);
      
      // Store in localStorage and multiple global locations for WebSocket access
      if (walletAddress) {
        localStorage.setItem('connectedWallet', walletAddress);
        localStorage.setItem('wallet_address', walletAddress);
        (window as any).globalWalletAddress = walletAddress;
        (window as any).connectedWallet = walletAddress;
        // Also store in session storage as backup
        sessionStorage.setItem('connectedWallet', walletAddress);
      } else {
        localStorage.removeItem('connectedWallet');
        localStorage.removeItem('wallet_address');
        (window as any).globalWalletAddress = null;
        (window as any).connectedWallet = null;
        sessionStorage.removeItem('connectedWallet');
      }
      
      console.log('🔐 [RAINBOW] Updated global wallet address:', walletAddress ? walletAddress.substring(0, 8) + '...' : 'null');
    }
  }, [finalIsConnected, user?.walletAddress, finalAddress]);

  return {
    // Wallet state (with fallback)
    address: finalAddress,
    isConnected: finalIsConnected,
    chain,
    user,
    isLoading,
    
    // Actions
    authenticate: (walletAddress: string) => authenticateWalletMutation.mutate(walletAddress),
    logout: () => logoutMutation.mutate(),
    disconnect,
    
    // Mutation states
    isAuthenticating: authenticateWalletMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    authError: authenticateWalletMutation.error,
    logoutError: logoutMutation.error,
    
    // Actions
    connect: () => window.location.reload(), // Simple fallback
  };
}