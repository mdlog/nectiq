import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest, setGlobalWalletAddress } from '@/lib/queryClient';
import type { User } from "@shared/schema";
import { useWalletConnectionStatus } from './useWalletConnectionStatus';
import { getStoredReferralCode, clearStoredReferralCode } from '@/lib/referralHandler';
import { autoSwitchToPolygonAmoy } from '@/lib/polygonAmoy';

export function useRainbowAuth() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [hasAttemptedChainSwitch, setHasAttemptedChainSwitch] = React.useState(false);

  // Initialize connection status monitoring
  const connectionStatus = useWalletConnectionStatus();

  // Get user data from backend
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: isConnected && !!address,
    refetchInterval: 10000,
    staleTime: 5000,
    // CRITICAL: Prevent using cached data after logout
    // This ensures admin status is always fresh from server
    placeholderData: undefined,
    gcTime: 0, // Don't keep data in garbage collection cache
  });

  // Wallet authentication mutation
  const authenticateWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      if (import.meta.env.DEV) {
        console.log('🌈 [RAINBOW] Authenticating wallet:', walletAddress);
        console.log('🌈 [RAINBOW] Chain info:', { chainId: chain?.id, chainName: chain?.name });
        console.log('🌈 [RAINBOW] Current URL:', window.location.href);
      }

      // Check for stored referral code
      const referralCode = getStoredReferralCode();
      if (import.meta.env.DEV) {
        console.log('🎯 [REFERRAL] Found stored referral code:', referralCode);
      }

      try {
        const requestBody = {
          walletAddress: walletAddress.toLowerCase(),
          chainId: chain?.id,
          chainName: chain?.name,
          ...(referralCode && { referralCode })
        };

        if (import.meta.env.DEV) {
          console.log('🌈 [RAINBOW] Request payload:', requestBody);
        }

        const response = await fetch('/api/auth/wallet-connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        });

        if (import.meta.env.DEV) {
          console.log('🌈 [RAINBOW] Response status:', response.status);
          console.log('🌈 [RAINBOW] Response headers:', Object.fromEntries(response.headers.entries()));
        }

        if (!response.ok) {
          const errorData = await response.text();
          console.error('🌈 [RAINBOW] Error response:', errorData);
          throw new Error(errorData || `HTTP ${response.status}: Authentication failed`);
        }

        const result = await response.json();
        if (import.meta.env.DEV) {
          console.log('🌈 [RAINBOW] Success response:', result);
        }
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
      if (import.meta.env.DEV) {
        console.log('✅ [RAINBOW] Wallet authenticated successfully:', data);
      }

      // Clear referral code after successful authentication (it's been processed)
      if (getStoredReferralCode()) {
        clearStoredReferralCode();
        if (import.meta.env.DEV) {
          console.log('🧹 [REFERRAL] Cleared processed referral code');
        }
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
      console.log('✅ [RAINBOW] Logout successful - starting cleanup...');

      // CRITICAL: Clear user data IMMEDIATELY before disconnect
      // This prevents stale admin status from showing to next user
      queryClient.removeQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      console.log('🧹 [RAINBOW] User cache cleared');

      // Clear ALL cached data to prevent any stale state
      queryClient.clear();

      console.log('🧹 [RAINBOW] All cache cleared');

      // Clear global wallet address
      setGlobalWalletAddress(null);

      console.log('🧹 [RAINBOW] Global wallet address cleared');

      // Reset chain switch flag
      setHasAttemptedChainSwitch(false);

      console.log('🧹 [RAINBOW] Chain switch flag reset');

      // Disconnect wallet AFTER clearing cache
      disconnect();

      console.log('🔌 [RAINBOW] Wallet disconnected');

      // Use improved notification system
      connectionStatus.showConnectionNotification(
        "Wallet Disconnected",
        address ? `Successfully logged out from ${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet disconnected successfully",
        'default',
        4000
      );

      // Redirect to home
      setLocation('/');

      console.log('✅ [RAINBOW] Logout complete - redirected to home');
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
    if (import.meta.env.DEV) {
      console.log('🔍 [RAINBOW] useEffect state check:', {
        isConnected,
        hasAddress: !!address,
        hasUser: !!user,
        isUserLoading: isLoading,
        isPending: authenticateWalletMutation.isPending,
        address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null
      });
    }

    if (!isConnected) {
      // Wallet is disconnected - clear all user state
      if (import.meta.env.DEV) {
        console.log('🌈 [RAINBOW] Wallet disconnected - clearing user state');
      }
      // CRITICAL: Remove and invalidate user queries to prevent stale admin status
      queryClient.removeQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setGlobalWalletAddress(null);
      // Reset chain switch flag on disconnect
      setHasAttemptedChainSwitch(false);
      if (import.meta.env.DEV) {
        console.log('🧹 [RAINBOW] User cache cleared, chain switch reset');
      }
    } else if (isConnected && address && !user && !isLoading && !authenticateWalletMutation.isPending) {
      if (import.meta.env.DEV) {
        console.log('🌈 [RAINBOW] Auto-authenticating connected wallet:', address);
      }
      authenticateWalletMutation.mutate(address);
    } else if (isConnected && address && !user && !isLoading) {
      if (import.meta.env.DEV) {
        console.log('🔍 [RAINBOW] Authentication conditions not met:', {
          isConnected,
          hasAddress: !!address,
          hasUser: !!user,
          isUserLoading: isLoading,
          isPending: authenticateWalletMutation.isPending
        });
      }
    }
  }, [isConnected, address, user, isLoading]);

  // Set global wallet address for API requests
  React.useEffect(() => {
    if (!isConnected) {
      // If wallet is disconnected, clear global address
      setGlobalWalletAddress(null);
      if (import.meta.env.DEV) {
        console.log('🔐 [RAINBOW] Wallet disconnected - cleared global wallet address');
      }
    } else {
      const walletAddress = user?.walletAddress || address;
      setGlobalWalletAddress(walletAddress || null);
      if (import.meta.env.DEV) {
        console.log('🔐 [RAINBOW] Updated global wallet address for API requests:', walletAddress ? walletAddress.substring(0, 8) + '...' : 'null');
      }
    }
  }, [isConnected, user?.walletAddress, address]);

  // Auto-switch to Polygon Amoy when wallet connects
  React.useEffect(() => {
    const attemptAutoSwitch = async () => {
      if (isConnected && address && !hasAttemptedChainSwitch) {
        console.log('🔷 [POLYGON-AMOY] Wallet connected, initiating auto-switch to Polygon Amoy...');
        console.log('🔷 [POLYGON-AMOY] Current state:', { isConnected, address: address?.slice(0, 10) + '...', chain: chain?.id, chainName: chain?.name });

        setHasAttemptedChainSwitch(true);

        // Small delay to ensure wallet is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('🔷 [POLYGON-AMOY] Starting auto-switch process...');
        const result = await autoSwitchToPolygonAmoy();

        if (result.success) {
          if (result.alreadyOnAmoy) {
            console.log('✅ [POLYGON-AMOY] Wallet already on Polygon Amoy');
          } else if (result.added) {
            console.log('✅ [POLYGON-AMOY] Chain added and switched successfully');
            toast({
              title: "Polygon Amoy Added",
              description: "Polygon Amoy testnet has been added to your wallet and activated!",
            });
          } else {
            console.log('✅ [POLYGON-AMOY] Successfully switched to Polygon Amoy');
            toast({
              title: "Switched to Polygon Amoy",
              description: "Successfully switched to Polygon Amoy testnet!",
            });
          }
        } else if (result.userRejected) {
          console.warn('⚠️ [POLYGON-AMOY] User rejected chain switch');
          toast({
            title: "Chain Switch Cancelled",
            description: "You can manually switch to Polygon Amoy from your wallet settings.",
            variant: "default",
          });
        } else {
          console.error('❌ [POLYGON-AMOY] Auto-switch failed:', result.error, result.details);
          toast({
            title: "Unable to Switch Chain",
            description: "Please manually switch to Polygon Amoy testnet in your wallet.",
            variant: "default",
          });
        }
      }
    };

    attemptAutoSwitch();

    // Reset chain switch flag when wallet disconnects
    if (!isConnected && hasAttemptedChainSwitch) {
      console.log('🔷 [POLYGON-AMOY] Wallet disconnected, resetting chain switch flag');
      setHasAttemptedChainSwitch(false);
    }
  }, [isConnected, address, hasAttemptedChainSwitch, chain, toast]);

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