import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      toast({
        title: "Disconnected",
        description: "Wallet disconnected and logged out successfully",
      });
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    },
  });

  const handleDisconnect = async () => {
    try {
      // First disconnect wallet
      disconnect();
      
      // Clear wagmi localStorage data
      localStorage.removeItem('wagmi.wallet');
      localStorage.removeItem('wagmi.connected');
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.cache');
      localStorage.removeItem('walletconnect');
      
      // Then logout from server
      await logoutMutation.mutateAsync();
      
      // Force page refresh to ensure wallet state is completely cleared
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      // Ensure wallet is disconnected even if server logout fails
      disconnect();
      
      // Clear wagmi localStorage data even on error
      localStorage.removeItem('wagmi.wallet');
      localStorage.removeItem('wagmi.connected');
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.cache');
      localStorage.removeItem('walletconnect');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2" size={20} />
            Connected Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-mono text-sm">{formatAddress(address)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-8 w-8 p-0"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
          
          {chain && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Network</span>
              <Badge variant="secondary">{chain.name}</Badge>
            </div>
          )}
          
          <Button
            onClick={handleDisconnect}
            variant="destructive"
            className="w-full"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2" size={16} />
            {logoutMutation.isPending ? "Disconnecting..." : "Disconnect Wallet"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wallet className="mr-2" size={20} />
          Connect Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          Connect your crypto wallet to authenticate and start making predictions.
        </p>
        
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            variant="outline"
            className="w-full justify-start"
          >
            <Wallet className="mr-2" size={16} />
            {connector.name}
          </Button>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>New to wallets?</strong> MetaMask is a popular choice for beginners. 
            Download it from metamask.io to get started.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}