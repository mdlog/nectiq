import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import type { User } from "@shared/schema";

export function useRainbowAuth() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

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
      
      const response = await fetch('/api/auth/wallet-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          walletAddress: walletAddress.toLowerCase(),
          chainId: chain?.id,
          chainName: chain?.name
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Authentication failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('✅ [RAINBOW] Wallet authenticated successfully:', data);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${address?.slice(0, 6)}...${address?.slice(-4)}`,
      });

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
      
      toast({
        title: "Logged Out",
        description: "Successfully disconnected from wallet",
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

  // Auto-authenticate when wallet connects
  React.useEffect(() => {
    if (isConnected && address && !user && !authenticateWalletMutation.isPending) {
      console.log('🌈 [RAINBOW] Auto-authenticating connected wallet:', address);
      authenticateWalletMutation.mutate(address);
    }
  }, [isConnected, address, user]);

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
  };
}