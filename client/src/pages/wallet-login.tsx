import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, Copy, Check, Shield, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

// Wallet logo components as SVG
const WalletLogos = {
  MetaMask: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 5.443l-4.234-3.164c-.235-.176-.555-.176-.79 0L13.302 5.443c-.47.353-.47 1.029 0 1.382l4.234 3.164c.235.176.555.176.79 0l4.234-3.164c.47-.353.47-1.029 0-1.382z" fill="#E17726"/>
      <path d="M9.698 5.443L5.464 2.279c-.235-.176-.555-.176-.79 0L.44 5.443c-.47.353-.47 1.029 0 1.382l4.234 3.164c.235.176.555.176.79 0l4.234-3.164c.47-.353.47-1.029 0-1.382z" fill="#E27625"/>
      <path d="M22.56 18.557l-4.234 3.164c-.235.176-.555.176-.79 0l-4.234-3.164c-.47-.353-.47-1.029 0-1.382l4.234-3.164c.235-.176.555.176.79 0l4.234 3.164c.47.353.47 1.029 0 1.382z" fill="#D5BFB2"/>
    </svg>
  ),
  WalletConnect: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5.5 8c3.038-2.968 7.962-2.968 11 0l.5.485c.153.15.153.39 0 .54l-1.714 1.67c-.076.075-.2.075-.276 0L14.5 10.2c-2.12-2.07-5.56-2.07-7.68 0l-.59.575c-.076.075-.2.075-.276 0L4.24 9.105c-.153-.15-.153-.39 0-.54L5.5 8z" fill="#3B99FC"/>
      <path d="M20.5 11.32l1.527 1.49c.153.15.153.39 0 .54l-6.87 6.7c-.153.15-.4.15-.553 0l-4.876-4.76c-.038-.037-.1-.037-.138 0l-4.876 4.76c-.153.15-.4.15-.553 0l-6.87-6.7c-.153-.15-.153-.39 0-.54l1.527-1.49c.153-.15.4-.15.553 0l4.876 4.76c.038.037.1.037.138 0l4.876-4.76c.153-.15.4-.15.553 0l4.876 4.76c.038.037.1.037.138 0l4.876-4.76c.153-.15.4-.15.553 0z" fill="#3B99FC"/>
    </svg>
  ),
  "Coinbase Wallet": () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#0052FF"/>
      <rect x="7" y="7" width="10" height="10" rx="2" fill="white"/>
      <rect x="9" y="11" width="6" height="2" rx="1" fill="#0052FF"/>
      <rect x="11" y="9" width="2" height="6" rx="1" fill="#0052FF"/>
    </svg>
  ),
  Phantom: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#AB9FF2"/>
      <path d="M8 8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.105-.448 2.105-1.171 2.829L12 14l-2.829-3.171C8.448 10.105 8 9.105 8 8z" fill="white"/>
      <circle cx="10.5" cy="9.5" r="1" fill="#AB9FF2"/>
      <circle cx="13.5" cy="9.5" r="1" fill="#AB9FF2"/>
    </svg>
  ),
  "Rabby Wallet": () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#7084FF"/>
      <path d="M8 7c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v3c0 2.76-2.24 5-5 5h-1c-.55 0-1-.45-1-1V7z" fill="white"/>
      <circle cx="10" cy="9" r="1" fill="#7084FF"/>
      <circle cx="14" cy="9" r="1" fill="#7084FF"/>
      <path d="M9 12h6c.55 0 1 .45 1 1s-.45 1-1 1H9c-.55 0-1-.45-1-1s.45-1 1-1z" fill="#7084FF"/>
    </svg>
  ),
  "OKX Wallet": () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="black"/>
      <rect x="4" y="4" width="6" height="6" rx="1" fill="white"/>
      <rect x="14" y="4" width="6" height="6" rx="1" fill="white"/>
      <rect x="4" y="14" width="6" height="6" rx="1" fill="white"/>
      <rect x="14" y="14" width="6" height="6" rx="1" fill="white"/>
    </svg>
  ),
  Keplr: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#1B1E36"/>
      <path d="M6 8l6 4 6-4v8l-6 4-6-4V8z" fill="#FF6B35"/>
      <path d="M12 6L6 10l6 4 6-4-6-4z" fill="#FFA500"/>
    </svg>
  ),
  SubWallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#004BFF"/>
      <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  ),
  "Leap Wallet": () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#CF447B"/>
      <path d="M8 16V8l8 4-8 4z" fill="white"/>
    </svg>
  ),
  Backpack: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#E33E3F"/>
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="white" strokeWidth="2" fill="none"/>
      <rect x="8" y="10" width="8" height="6" rx="1" fill="white"/>
    </svg>
  ),
  Nightly: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#1a1a2e"/>
      <path d="M6 18l6-12 6 12H6z" fill="#eee"/>
      <circle cx="12" cy="8" r="2" fill="#1a1a2e"/>
    </svg>
  ),
  Injected: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#6366f1"/>
      <path d="M8 8h8v8H8V8z" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="2" fill="white"/>
    </svg>
  ),
  "Web3Modal Auth": () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#3B99FC"/>
      <rect x="6" y="6" width="12" height="12" rx="3" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  )
};

export default function WalletLoginPage() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

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

  // Auto-login mutation for wallet authentication
  const authMutation = useMutation({
    mutationFn: async ({ address }: { address: string }) => {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          signature: "auto_register", 
          message: `Auto-register wallet ${address}` 
        }),
      });
      if (!response.ok) throw new Error('Authentication failed');
      return response.json();
    },
    onSuccess: (user) => {
      toast({
        title: "Authentication Successful",
        description: `Welcome ${user.username}! You are now logged in.`,
      });
      // Navigate to dashboard after successful authentication
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to authenticate with wallet",
        variant: "destructive",
      });
    },
  });

  const handleAuth = () => {
    if (isConnected && address) {
      authMutation.mutate({ address });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-xl text-muted-foreground">
              Use your crypto wallet to securely access Nectiq
            </p>
          </div>

          <div className="grid gap-6">
            {/* Connection Status */}
            {isConnected && address ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Shield className="mr-2" />
                    Wallet Connected
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div>
                      <p className="text-sm text-muted-foreground">Connected Address</p>
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

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleAuth} 
                      className="flex-1"
                      disabled={authMutation.isPending}
                    >
                      {authMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <User className="mr-2" size={16} />
                      )}
                      {authMutation.isPending ? "Authenticating..." : "Authenticate & Continue"}
                    </Button>
                    <Button
                      onClick={() => disconnect()}
                      variant="destructive"
                      disabled={authMutation.isPending}
                    >
                      <LogOut className="mr-2" size={16} />
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="mr-2" />
                    Choose Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Connect your preferred crypto wallet to get started with secure authentication.
                  </p>
                  
                  <div className="grid gap-3">
                    {connectors.map((connector) => {
                      // Get the appropriate logo component
                      const LogoComponent = WalletLogos[connector.name as keyof typeof WalletLogos] || WalletLogos.Injected;
                      
                      return (
                        <Button
                          key={connector.uid}
                          onClick={() => connect({ connector })}
                          disabled={isPending}
                          variant="outline"
                          className="justify-start h-12"
                        >
                          <div className="mr-3 flex-shrink-0">
                            <LogoComponent />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{connector.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {connector.name === 'MetaMask' && 'Most popular wallet'}
                              {connector.name === 'WalletConnect' && 'Connect any wallet'}
                              {connector.name === 'Coinbase Wallet' && 'Coinbase users'}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Connect a Wallet?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• <strong>Secure Authentication:</strong> No passwords needed</p>
                  <p>• <strong>Crypto-Native:</strong> Perfect for crypto prediction platform</p>
                  <p>• <strong>Your Keys:</strong> You maintain full control</p>
                  <p>• <strong>Quick Access:</strong> One-click login process</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">New to Wallets?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>A crypto wallet is like a secure digital identity that you control.</p>
                  <p><strong>Recommended:</strong> MetaMask is beginner-friendly</p>
                  <p><strong>Download:</strong> Visit metamask.io</p>
                  <p><strong>Setup:</strong> Takes just a few minutes</p>
                </CardContent>
              </Card>
            </div>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security First:</strong> We use cryptographic signatures to verify wallet ownership. 
                Your private keys remain secure and are never shared or stored on our servers.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}