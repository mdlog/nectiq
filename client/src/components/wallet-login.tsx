import { useAccount, useSignMessage } from 'wagmi';
import { recoverMessageAddress } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface WalletLoginProps {
  onLoginSuccess: (user: any) => void;
}

export function WalletLogin({ onLoginSuccess }: WalletLoginProps) {
  const { address, isConnected } = useAccount();
  const { signMessage, isPending: isSigningPending } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if user already exists with this wallet
  const { data: existingUser, refetch: checkUser } = useQuery({
    queryKey: ['/api/auth/wallet-user', address],
    enabled: isConnected && !!address,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ address, signature, message }: { address: string; signature: string; message: string }) => {
      return apiRequest({
        url: '/api/auth/wallet-login',
        method: 'POST',
        body: { address, signature, message },
      });
    },
    onSuccess: (user) => {
      toast({
        title: "Login Successful",
        description: "Welcome back to CryptoPredikt!",
      });
      onLoginSuccess(user);
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to authenticate with wallet",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ address, signature, message, username }: { 
      address: string; 
      signature: string; 
      message: string; 
      username: string;
    }) => {
      return apiRequest({
        url: '/api/auth/wallet-register',
        method: 'POST',
        body: { address, signature, message, username },
      });
    },
    onSuccess: (user) => {
      toast({
        title: "Registration Successful",
        description: "Welcome to CryptoPredikt!",
      });
      onLoginSuccess(user);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleWalletAuth = async (isRegistering = false) => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Create message to sign
      const timestamp = Date.now();
      const message = `Sign in to CryptoPredikt\n\nAddress: ${address}\nTimestamp: ${timestamp}`;

      // Sign the message
      const signature = await new Promise<string>((resolve, reject) => {
        signMessage(
          { message },
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });

      if (isRegistering) {
        // Generate username from wallet address
        const username = `user_${address.slice(-8)}`;
        registerMutation.mutate({ address, signature, message, username });
      } else {
        loginMutation.mutate({ address, signature, message });
      }
    } catch (error: any) {
      toast({
        title: "Signature Failed",
        description: "Please sign the message to authenticate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      checkUser();
    }
  }, [isConnected, address, checkUser]);

  if (!isConnected || !address) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet first to authenticate.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2" size={20} />
          Wallet Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Wallet:</strong> {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>

        {existingUser ? (
          <div className="space-y-3">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Welcome back! Sign the message to access your account.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => handleWalletAuth(false)}
              disabled={isLoading || isSigningPending || loginMutation.isPending}
              className="w-full"
            >
              {(isLoading || isSigningPending || loginMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In with Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                New wallet detected. Sign the message to create your account.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => handleWalletAuth(true)}
              disabled={isLoading || isSigningPending || registerMutation.isPending}
              className="w-full"
            >
              {(isLoading || isSigningPending || registerMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Account with Wallet
            </Button>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            <strong>Security:</strong> We use cryptographic signatures to verify wallet ownership. 
            Your private keys remain secure and are never shared.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}