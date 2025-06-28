import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { Wallet, Copy, Check, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export default function DynamicWalletWidget() {
  const { user, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);

  const walletAddress = user?.verifiedCredentials?.[0]?.address;
  const isConnected = !!user && !!walletAddress;

  // Auto-authenticate when wallet connects (only once)
  useEffect(() => {
    if (isConnected && walletAddress && !hasAuthenticated) {
      setHasAuthenticated(true);
      loginWithWallet();
    }
  }, [isConnected, walletAddress, hasAuthenticated]);

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast({
          title: "Address Copied",
          description: "Wallet address copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Could not copy address to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleDisconnect = async () => {
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
    if (!walletAddress) return;

    try {
      const response = await fetch('/api/auth/dynamic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          walletAddress: walletAddress,
          address: walletAddress
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
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="ml-2 h-6 w-6 p-0"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </Button>
        </div>
        <Button 
          onClick={loginWithWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Login
        </Button>
        <Button 
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
        >
          <LogOut size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <DynamicWidget />
    </div>
  );
}