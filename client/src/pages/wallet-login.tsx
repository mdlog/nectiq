import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, Copy, Check, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WalletLoginPage() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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

  const handleAuth = () => {
    if (isConnected) {
      // In a real app, this would authenticate with the backend
      toast({
        title: "Authentication",
        description: "Wallet authentication would happen here",
      });
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
              Use your crypto wallet to securely access CryptoPredikt
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
                    <Button onClick={handleAuth} className="flex-1">
                      <User className="mr-2" size={16} />
                      Authenticate & Continue
                    </Button>
                    <Button
                      onClick={() => disconnect()}
                      variant="destructive"
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
                    {connectors.map((connector) => (
                      <Button
                        key={connector.uid}
                        onClick={() => connect({ connector })}
                        disabled={isPending}
                        variant="outline"
                        className="justify-start h-12"
                      >
                        <Wallet className="mr-3" size={20} />
                        <div className="text-left">
                          <div className="font-medium">{connector.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {connector.name === 'MetaMask' && 'Most popular wallet'}
                            {connector.name === 'WalletConnect' && 'Connect any wallet'}
                            {connector.name === 'Coinbase Wallet' && 'Coinbase users'}
                          </div>
                        </div>
                      </Button>
                    ))}
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