import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest, setGlobalWalletAddress } from '@/lib/queryClient';
import type { User } from "@shared/schema";
import { useWalletConnectionStatus } from './useWalletConnectionStatus';
import { getStoredReferralCode, clearStoredReferralCode } from '@/lib/referralHandler';

export function useRainbowAuth() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Initialize connection status monitoring
  const connectionStatus = useWalletConnectionStatus();

  // Get user data from backend
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: isConnected && !!address,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // Wallet authentication mutation
  const authenticateWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      console.log('🌈 [RAINBOW] Authenticating wallet:', walletAddress);
      console.log('🌈 [RAINBOW] Chain info:', { chainId: chain?.id, chainName: chain?.name });
      console.log('🌈 [RAINBOW] Current URL:', window.location.href);
      
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

        if (!response.ok) {
          const errorData = await response.text();
          console.error('🌈 [RAINBOW] Error response:', errorData);
          throw new Error(errorData || `HTTP ${response.status}: Authentication failed`);
        }

        const result = await response.json();
        console.log('🌈 [RAINBOW] Success response:', result);
        return result;
      } catch (error) {
        console.error('🌈 [RAINBOW] Network error:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
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
      
      toast({
        title: "Connection Failed", 
        description: error.message || "Failed to authenticate wallet",
        variant: "destructive"
      });
      
      // Disconnect on auth failure
      disconnect();
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
      
      // Use improved notification system
      connectionStatus.showConnectionNotification(
        "Wallet Disconnected",
        address ? `Successfully logged out from ${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet disconnected successfully",
        'default',
        4000
      );
      
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
    console.log('🔍 [RAINBOW] useEffect state check:', {
      isConnected,
      hasAddress: !!address,
      hasUser: !!user,
      isUserLoading: isLoading,
      isPending: authenticateWalletMutation.isPending,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null
    });

    if (!isConnected) {
      // Wallet is disconnected - clear all user state
      console.log('🌈 [RAINBOW] Wallet disconnected - clearing user state');
      queryClient.removeQueries({ queryKey: ["/api/user"] });
      setGlobalWalletAddress(null);
    } else if (isConnected && address && !user && !isLoading && !authenticateWalletMutation.isPending) {
      console.log('🌈 [RAINBOW] Auto-authenticating connected wallet:', address);
      authenticateWalletMutation.mutate(address);
    } else if (isConnected && address && !user && !isLoading) {
      console.log('🔍 [RAINBOW] Authentication conditions not met:', {
        isConnected,
        hasAddress: !!address,
        hasUser: !!user,
        isUserLoading: isLoading,
        isPending: authenticateWalletMutation.isPending
      });
    }
  }, [isConnected, address, user, isLoading]);

  // Set global wallet address for API requests
  React.useEffect(() => {
    if (!isConnected) {
      // If wallet is disconnected, clear global address
      setGlobalWalletAddress(null);
      console.log('🔐 [RAINBOW] Wallet disconnected - cleared global wallet address');
    } else {
      const walletAddress = user?.walletAddress || address;
      setGlobalWalletAddress(walletAddress || null);
      console.log('🔐 [RAINBOW] Updated global wallet address for API requests:', walletAddress ? walletAddress.substring(0, 8) + '...' : 'null');
    }
  }, [isConnected, user?.walletAddress, address]);

  return {
    // Wallet state
    address,
    isConnected,
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
    
    // Connection status
    connectionStatus,
  };
}