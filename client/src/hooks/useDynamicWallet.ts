import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WalletState {
  isConnected: boolean;
  address?: string;
  balance?: string;
  network?: string;
  isLoading: boolean;
}

export function useDynamicWallet() {
  const { user, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isLoading: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    setWalletState(prev => ({
      ...prev,
      isConnected: isAuthenticated,
      address: user?.verifiedCredentials?.[0]?.address,
      network: user?.verifiedCredentials?.[0]?.chain,
    }));
  }, [isAuthenticated, user]);

  // Enhanced wallet verification system
  useEffect(() => {
    if (!isAuthenticated || !user?.verifiedCredentials?.[0]?.address) return;

    const handleWalletChange = async () => {
      try {
        const response = await fetch('/api/user');
        
        if (response.ok) {
          const userData = await response.json();
          const loggedInAddress = userData.walletAddress?.toLowerCase();
          const currentAddress = user.verifiedCredentials[0].address?.toLowerCase();
          
          if (loggedInAddress && currentAddress && currentAddress !== loggedInAddress) {
            console.warn('🚨 WALLET MISMATCH DETECTED!', {
              currentDynamic: currentAddress,
              loggedInUser: loggedInAddress,
              mismatch: true
            });
            
            // Log security event
            fetch('/api/security/wallet-mismatch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                currentAddress: currentAddress,
                expectedAddress: loggedInAddress,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
              })
            }).catch(console.error);
            
            toast({
              title: "Security Alert",
              description: "Wallet address changed. Logging out for security.",
              variant: "destructive",
            });
            
            // Force logout
            await fetch('/api/auth/logout', { method: 'POST' });
            handleLogOut();
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Wallet verification error:', error);
      }
    };

    // Check immediately and every 3 seconds
    handleWalletChange();
    const interval = setInterval(handleWalletChange, 3000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user, toast, handleLogOut]);

  const connectWallet = () => {
    setShowAuthFlow(true);
  };

  const disconnectWallet = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      handleLogOut();
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const loginWithWallet = async () => {
    if (!user?.verifiedCredentials?.[0]?.address) {
      toast({
        title: "Error",
        description: "No wallet address found",
        variant: "destructive",
      });
      return;
    }

    try {
      setWalletState(prev => ({ ...prev, isLoading: true }));

      const address = user.verifiedCredentials[0].address;
      
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress: address,
          signature: 'dynamic-auth',
          message: `Login to Nectiq with ${address}`
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Welcome!",
          description: `Connected as ${data.user?.username || 'User'}`,
        });
        window.location.reload();
      } else {
        toast({
          title: "Authentication Failed",
          description: data.message || "Failed to authenticate wallet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Connection failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWalletState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    loginWithWallet,
    user,
  };
}