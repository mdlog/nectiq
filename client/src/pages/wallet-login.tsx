import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, Copy, Check, Shield, User, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

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
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

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
      navigate('/home');
    }
  }, [currentUser, navigate, toast]);

  // Check for existing wallet connection on load
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.log('No wallet connected');
      }
    }
  };

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

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Authenticate with backend
  const authenticateMutation = useMutation({
    mutationFn: async (address: string) => {
      const message = `Login to Nectiq with ${address}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      const response = await apiRequest('/api/auth/wallet-login', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: address,
          message,
          signature
        }),
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Authentication Successful",
        description: `Welcome ${data.user?.username || 'User'}!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      navigate('/home');
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleAuthenticate = () => {
    if (walletAddress) {
      authenticateMutation.mutate(walletAddress);
    }
  };

  const copyAddress = async () => {
    if (!walletAddress) return;
    
    try {
      await navigator.clipboard.writeText(walletAddress);
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

  const disconnectWallet = () => {
    setWalletAddress("");
    setIsConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    });
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
            {/* Back to Landing Button */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Landing
              </Button>
            </div>

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
                      onClick={connectWallet}
                      disabled={isConnecting}
                      variant="outline"
                      className="justify-start h-12"
                    >
                      <div className="mr-3 flex-shrink-0">
                        <WalletLogos.MetaMask />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">
                          {isConnecting ? "Connecting..." : "Connect MetaMask"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isConnecting ? "Check your wallet..." : "MetaMask browser extension"}
                        </div>
                      </div>
                      {isConnecting && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
                    </Button>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Make sure you have MetaMask installed and unlocked in your browser. 
                      Your wallet will be used for secure authentication.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

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
                    <span className="font-mono text-sm">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}</span>
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

                  <Alert>
                    <User className="h-4 w-4" />
                    <AlertDescription>
                      Wallet connected successfully! Click "Sign In" to authenticate with Nectiq.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAuthenticate}
                      disabled={authenticateMutation.isPending}
                      className="flex-1"
                    >
                      {authenticateMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {authenticateMutation.isPending ? "Signing..." : "Sign In with Wallet"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={disconnectWallet}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-green-500" />
                    Secure Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your wallet signature provides secure, passwordless authentication. 
                    No sensitive information is stored on our servers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-500" />
                    Auto Registration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    New wallets are automatically registered. Start making predictions 
                    and earning rewards immediately after authentication.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}