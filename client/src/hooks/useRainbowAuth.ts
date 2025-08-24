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
  
  // Check for wallet connection manually with detailed debugging
  React.useEffect(() => {
    const checkWalletConnection = async () => {
      console.log('🔍 [MANUAL-DEBUG] Checking wallet connection...');
      console.log('🔍 [MANUAL-DEBUG] window exists:', typeof window !== 'undefined');
      console.log('🔍 [MANUAL-DEBUG] window.ethereum exists:', !!window.ethereum);
      
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          console.log('🔍 [MANUAL-DEBUG] Requesting eth_accounts...');
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          console.log('🔍 [MANUAL-DEBUG] Accounts response:', accounts);
          
          if (accounts && accounts.length > 0) {
            console.log('🔍 [MANUAL-WALLET] Detected connected wallet:', accounts[0]);
            setManualAddress(accounts[0]);
            setIsManuallyConnected(true);
          } else {
            console.log('🔍 [MANUAL-DEBUG] No accounts found');
            setManualAddress(null);
            setIsManuallyConnected(false);
          }
        } catch (error) {
          console.log('🔍 [MANUAL-WALLET] Error checking wallet:', error);
          setManualAddress(null);
          setIsManuallyConnected(false);
        }
      } else {
        console.log('🔍 [MANUAL-DEBUG] window.ethereum not available');
        setManualAddress(null);
        setIsManuallyConnected(false);
      }
    };
    
    checkWalletConnection();
    const interval = setInterval(checkWalletConnection, 3000); // Check every 3 seconds
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

  // Wallet authentication mutation
  const authenticateWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
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
    console.log('🔍 [RAINBOW] Wallet state:', {
      wagmiConnected: isConnected,
      wagmiAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'none',
      manualConnected: isManuallyConnected,
      manualAddress: manualAddress ? `${manualAddress.slice(0, 6)}...${manualAddress.slice(-4)}` : 'none',
      finalConnected: finalIsConnected,
      finalAddress: finalAddress ? `${finalAddress.slice(0, 6)}...${finalAddress.slice(-4)}` : 'none',
      hasUser: !!user,
      isAuthenticating: authenticateWalletMutation.isPending
    });

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