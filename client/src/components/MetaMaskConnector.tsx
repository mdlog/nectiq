import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function MetaMaskConnector() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkMetaMaskAvailability();
  }, []);

  const checkMetaMaskAvailability = () => {
    // Check for MetaMask specifically
    const ethereum = window.ethereum;
    
    if (ethereum) {
      // Check if it's specifically MetaMask
      const isMetaMask = ethereum.isMetaMask;
      setIsMetaMaskAvailable(isMetaMask);
      
      console.log('Ethereum provider found:', ethereum);
      console.log('Is MetaMask:', isMetaMask);
      console.log('Provider details:', {
        isMetaMask: ethereum.isMetaMask,
        chainId: ethereum.chainId,
        networkVersion: ethereum.networkVersion,
        selectedAddress: ethereum.selectedAddress
      });
    } else {
      console.log('No ethereum provider found');
      setIsMetaMaskAvailable(false);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum?.isMetaMask) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask browser extension",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      console.log('Requesting MetaMask connection...');
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        const connectedAccount = accounts[0];
        setAccount(connectedAccount);
        
        console.log('MetaMask connected:', connectedAccount);
        
        // Authenticate with backend
        const response = await fetch('/api/auth/dynamic', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          credentials: 'include',
          body: JSON.stringify({
            walletAddress: connectedAccount,
            address: connectedAccount
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Backend authentication successful:', data);
          
          toast({
            title: "Wallet Connected",
            description: `Successfully connected ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`,
          });

          // Reload to update UI
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          const errorData = await response.json();
          console.error('Backend authentication failed:', errorData);
          
          toast({
            title: "Authentication Failed",
            description: errorData.message || "Failed to authenticate with server",
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      
      let errorMessage = "Failed to connect wallet";
      
      if (error.code === 4001) {
        errorMessage = "Connection rejected by user";
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending";
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      setAccount(null);
      
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      });
      
      // Reload to update UI
      setTimeout(() => {
        window.location.href = '/wallet-login';
      }, 1000);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Direct MetaMask Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isMetaMaskAvailable ? (
          <div className="text-center">
            <p className="text-red-600 mb-4">MetaMask not detected</p>
            <p className="text-sm text-gray-600 mb-4">
              Please install MetaMask browser extension
            </p>
            <Button 
              onClick={checkMetaMaskAvailability}
              variant="outline"
              className="w-full"
            >
              Check Again
            </Button>
          </div>
        ) : account ? (
          <div className="text-center">
            <p className="text-green-600 mb-2">Connected</p>
            <p className="text-sm font-mono mb-4">
              {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <Button 
              onClick={disconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-green-600 mb-4">MetaMask Ready</p>
            <Button 
              onClick={connectMetaMask}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p>Debug Info:</p>
          <p>MetaMask Available: {isMetaMaskAvailable ? 'Yes' : 'No'}</p>
          <p>Account: {account || 'None'}</p>
        </div>
      </CardContent>
    </Card>
  );
}