import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, User, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';



export default function WalletLoginPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useDynamicContext();

  // Check if user is already authenticated
  const { data: currentUser } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Auto-redirect if already authenticated via backend or Dynamic Labs
  useEffect(() => {
    if (currentUser && (currentUser as any).id) {
      toast({
        title: "Already Authenticated",
        description: `Welcome back, ${(currentUser as any).username || 'User'}!`,
      });
      navigate('/home');
    } else if (isAuthenticated && user) {
      // If authenticated via Dynamic Labs but not in backend, redirect to allow authentication
      toast({
        title: "Wallet Connected",
        description: "Redirecting to complete authentication...",
      });
      navigate('/home');
    }
  }, [currentUser, isAuthenticated, user, navigate, toast]);

  // Show loading state if being redirected
  const isLoading = (currentUser && (currentUser as any).id) || (isAuthenticated && user);

  // If user is authenticated, show loading state while redirecting
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

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

            {/* Dynamic Labs Wallet Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2" />
                  Connect Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Connect your preferred crypto wallet to get started with secure authentication.
                </p>
                
                {/* Dynamic Labs Widget */}
                <div className="flex justify-center">
                  <DynamicWidget />
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Dynamic Labs provides secure multi-wallet support including MetaMask, WalletConnect, 
                    Coinbase Wallet, and many more. Your wallet will be used for secure authentication.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

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