import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, User, Loader2, ArrowLeft, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import DynamicWalletWidget from '@/components/DynamicWalletWidget';
import { apiRequest } from "@/lib/queryClient";



export default function WalletLoginPage() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user } = useDynamicContext();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<any>(null);
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Extract referral code from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      console.log('🎁 [REFERRAL] Detected referral code:', refCode);
      
      // Validate referral code and get referrer info
      validateReferralCode(refCode);
    }
  }, [location]);

  // Mutation to validate referral code and get referrer info
  const validateReferralMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest(`/api/referrals/validate/${code}`, {
        method: 'GET'
      });
      return await response.json();
    },
    onSuccess: (data: { valid: boolean; referrer?: { id: number; username: string } }) => {
      if (data.valid && data.referrer) {
        setReferrerInfo(data.referrer);
        toast({
          title: "Valid Referral Code!",
          description: `You've been invited by ${data.referrer.username}. You'll both get 100 NTIQ when you register!`,
        });
      }
    },
    onError: (error: any) => {
      console.error('Invalid referral code:', error);
      setReferralCode(null);
      toast({
        title: "Invalid Referral Code",
        description: "The referral code is not valid or has expired.",
        variant: "destructive",
      });
    }
  });

  const validateReferralCode = (code: string) => {
    validateReferralMutation.mutate(code);
  };

  // Mutation to process referral after user registration
  const processReferralMutation = useMutation({
    mutationFn: async ({ referralCode, newUserId }: { referralCode: string, newUserId: number }) => {
      const response = await apiRequest('/api/auth/process-referral', {
        method: 'POST',
        body: JSON.stringify({ referralCode, newUserId }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Referral Bonus Applied!",
        description: "You and your referrer have both received 100 NTIQ bonus!",
      });
    },
    onError: (error: any) => {
      console.error('Failed to process referral:', error);
    }
  });

  // Check if user is already authenticated
  const { data: currentUser } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Auto-redirect if already authenticated via backend or Dynamic Labs
  useEffect(() => {
    if (currentUser && (currentUser as any).id) {
      // If user is already authenticated and we have a referral code, process it
      if (referralCode && !processReferralMutation.isSuccess) {
        console.log('🎁 [REFERRAL] Processing referral for existing user:', (currentUser as any).id);
        processReferralMutation.mutate({ 
          referralCode, 
          newUserId: (currentUser as any).id 
        });
      }
      
      setTimeout(() => {
        toast({
          title: "Already Authenticated",
          description: `Welcome back, ${(currentUser as any).username || 'User'}!`,
        });
        navigate('/home');
      }, 1000);
    } else if (isAuthenticated && user) {
      // If authenticated via Dynamic Labs but not in backend, redirect to allow authentication
      toast({
        title: "Wallet Connected",
        description: "Redirecting to complete authentication...",
      });
      
      // Store referral code in sessionStorage for processing after authentication
      if (referralCode) {
        sessionStorage.setItem('pendingReferralCode', referralCode);
        console.log('🎁 [REFERRAL] Stored referral code for new user:', referralCode);
      }
      
      navigate('/home');
    }
  }, [currentUser, isAuthenticated, user, navigate, toast, referralCode]);

  // Process referral code after new user authentication
  useEffect(() => {
    const pendingReferralCode = sessionStorage.getItem('pendingReferralCode');
    if (pendingReferralCode && currentUser && (currentUser as any).id && !processReferralMutation.isSuccess) {
      console.log('🎁 [REFERRAL] Processing pending referral for new user:', (currentUser as any).id);
      processReferralMutation.mutate({ 
        referralCode: pendingReferralCode, 
        newUserId: (currentUser as any).id 
      });
      sessionStorage.removeItem('pendingReferralCode');
    }
  }, [currentUser]);

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
              Connect Your Wallet
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure, passwordless access to Nectiq prediction platform with Dynamic Labs wallet integration.
            </p>
          </div>

          <div className="grid gap-6 max-w-2xl mx-auto">
            {/* Referral Banner */}
            {referrerInfo && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
                <Gift className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Referral Bonus!</strong> You've been invited by{' '}
                      <span className="font-semibold">{referrerInfo.username}</span>
                      <br />
                      <span className="text-sm">You'll both receive 100 NTIQ when you register!</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      100 NTIQ
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            )}

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
                  Wallet Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Secure wallet authentication with enterprise-grade security. Connect your MetaMask wallet to get started.
                </p>
                
                {/* Dynamic Labs Widget - Centered and Clean */}
                <div className="flex justify-center py-12">
                  <div className="w-full max-w-sm">
                    <DynamicWalletWidget />
                  </div>
                </div>

                {/* Supported Wallets Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs text-muted-foreground">
                  <div className="p-1">
                    <div className="font-medium">MetaMask</div>
                  </div>
                  <div className="p-1">
                    <div className="font-medium">WalletConnect</div>
                  </div>
                  <div className="p-1">
                    <div className="font-medium">Coinbase</div>
                  </div>
                  <div className="p-1">
                    <div className="font-medium">20+ More</div>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your wallet signature provides secure, passwordless authentication. 
                    No private keys are stored on our servers, ensuring maximum security.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-green-500" />
                    Secure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Wallet signature authentication without storing private keys.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <User className="mr-2 h-4 w-4 text-blue-500" />
                    Instant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Auto-registration for new wallets. Start earning immediately.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Wallet className="mr-2 h-4 w-4 text-purple-500" />
                    Universal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Works with all popular wallets across multiple chains.
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