import { useState, useEffect } from "react";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, Copy, Check, Shield, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

// Wallet logo components as SVG
const WalletLogos = {
  MetaMask: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 5.443l-4.234-3.164c-.235-.176-.555-.176-.79 0L13.302 5.443c-.47.353-.47 1.029 0 1.382l4.234 3.164c.235.176.555.176.79 0l4.234-3.164c.47-.353.47-1.029 0-1.382z" fill="#E17726"/>
      <path d="M9.698 5.443L5.464 2.279c-.235-.176-.555-.176-.79 0L.44 5.443c-.47.353-.47 1.029 0 1.382l4.234 3.164c.235.176.555.176.79 0l4.234-3.164c.47-.353.47-1.029 0-1.382z" fill="#E27625"/>
      <path d="M22.56 18.557l-4.234 3.164c-.235.176-.555.176-.79 0l-4.234-3.164c-.47-.353-.47-1.029 0-1.382l4.234-3.164c.235-.176.555.176.79 0l4.234 3.164c.47.353.47 1.029 0 1.382z" fill="#D5BFB2"/>
    </svg>
  )
};

export default function WalletLoginPage() {
  const { user, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const address = user?.verifiedCredentials?.[0]?.address;
  const isConnected = !!user && !!address;
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check if user is already authenticated
  const { data: currentUser } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (currentUser && (currentUser as any).id) {
      toast({
        title: "Already Authenticated",
        description: `Welcome back, ${(currentUser as any).username || 'User'}!`,
      });
      navigate('/');
    }
  }, [currentUser, navigate, toast]);

  // If user is authenticated, show loading state while redirecting
  if (currentUser && (currentUser as any).id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Auth mutation
  const authMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `Welcome ${data.user?.username || 'User'}! Authentication successful.`,
      });
      
      // Navigate to dashboard after successful auth
      setTimeout(() => {
        navigate('/');
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAuth = () => {
    if (!address) return;
    authMutation.mutate();
  };

  const copyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Wallet Authentication
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect your crypto wallet for secure, passwordless access to Nectiq prediction platform.
            </p>
          </div>

          <div className="grid gap-6 max-w-2xl mx-auto">
            {/* Connected Wallet Display */}
            {isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="mr-2" />
                    Connected Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-mono text-sm">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      disabled={copied}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <Badge variant="secondary">Ethereum</Badge>
                  </div>

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
                      onClick={() => handleLogOut()}
                      variant="destructive"
                      disabled={authMutation.isPending}
                    >
                      <LogOut className="mr-2" size={16} />
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wallet Connection */}
            {!isConnected && (
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
                    <Button
                      onClick={() => setShowAuthFlow(true)}
                      variant="outline"
                      className="justify-start h-12"
                    >
                      <div className="mr-3 flex-shrink-0">
                        <WalletLogos.MetaMask />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Connect Wallet</div>
                        <div className="text-xs text-muted-foreground">
                          MetaMask, WalletConnect & more
                        </div>
                      </div>
                    </Button>
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