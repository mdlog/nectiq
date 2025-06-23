import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, Copy, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatEther } from 'viem';

interface WalletConnectProps {
  onConnectionChange?: (connected: boolean, address?: string) => void;
}

export function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  // Get ETH balance
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Notify parent component of connection changes
  useEffect(() => {
    onConnectionChange?.(isConnected, address);
  }, [isConnected, address, onConnectionChange]);

  // Auto-refresh balance when connected
  useEffect(() => {
    if (isConnected && address) {
      const interval = setInterval(() => {
        refetchBalance();
      }, 15000); // Refresh every 15 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected, address, refetchBalance]);

  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true);
      await connect({ connector });
      
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (chainId?: number) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 42161: return 'Arbitrum';
      case 10: return 'Optimism';
      case 8453: return 'Base';
      default: return 'Unknown';
    }
  };

  const getNetworkColor = (chainId?: number) => {
    switch (chainId) {
      case 1: return 'bg-blue-500';
      case 137: return 'bg-purple-500';
      case 42161: return 'bg-blue-600';
      case 10: return 'bg-red-500';
      case 8453: return 'bg-blue-400';
      default: return 'bg-gray-500';
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2" size={20} />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            Connect your wallet to start making predictions and earning rewards
          </p>
          
          <div className="space-y-2">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                disabled={isPending || isConnecting}
                className="w-full justify-start"
                variant="outline"
              >
                <Wallet className="mr-2" size={16} />
                {isPending || isConnecting ? 'Connecting...' : `Connect ${connector.name}`}
              </Button>
            ))}
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p className="flex items-center">
              <AlertCircle className="mr-1" size={12} />
              Make sure you have a Web3 wallet installed
            </p>
            <p>• Metamask, WalletConnect, and other wallets supported</p>
            <p>• Your wallet will open for connection approval</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="mr-2 text-green-500" size={20} />
            Wallet Connected
          </div>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
          >
            <LogOut className="mr-1" size={14} />
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Network:</span>
          <Badge 
            className={`${getNetworkColor(chain?.id)} text-white`}
          >
            {getNetworkName(chain?.id)}
          </Badge>
        </div>

        {/* Address */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Address:</span>
          <div className="flex items-center space-x-2">
            <code className="text-sm bg-surface-light px-2 py-1 rounded">
              {formatAddress(address!)}
            </code>
            <Button
              onClick={copyAddress}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <Copy size={12} />
            </Button>
            <Button
              onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <ExternalLink size={12} />
            </Button>
          </div>
        </div>

        {/* Balance */}
        {balance && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Balance:</span>
            <div className="text-right">
              <div className="font-semibold">
                {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
              </div>
              <div className="text-xs text-slate-500">
                Auto-refreshing every 15s
              </div>
            </div>
          </div>
        )}

        {/* Balance Refresh Button */}
        <Button
          onClick={() => refetchBalance()}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Refresh Balance
        </Button>

        {/* Connection Status */}
        <div className="text-xs text-slate-500 space-y-1">
          <p className="flex items-center">
            <CheckCircle className="mr-1 text-green-500" size={12} />
            Wallet securely connected
          </p>
          <p>• Balance updates automatically</p>
          <p>• You can now make predictions and earn rewards</p>
        </div>
      </CardContent>
    </Card>
  );
}