import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Wallet, Lock, Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

interface SimpleAdminAuthProps {
  onAuthSuccess: () => void;
}

export function SimpleAdminAuth({ onAuthSuccess }: SimpleAdminAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleWalletConnect = async () => {
    setIsLoading(true);
    try {
      // Check if wallet is available
      if (!window.ethereum) {
        toast({
          title: "Wallet Not Found",
          description: "Please install a Web3 wallet like MetaMask",
          variant: "destructive",
        });
        return;
      }

      // Request wallet connection
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      if (!walletAddress) {
        toast({
          title: "Connection Failed",
          description: "No wallet address found",
          variant: "destructive",
        });
        return;
      }

      console.log("Connected wallet:", walletAddress);

      // Send authentication to server (simplified - no signature verification)
      const response = await fetch("/api/auth/wallet-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          address: walletAddress,
        }),
        credentials: "include",
      });

      const result = await response.json();
      console.log("Backend response:", result);

      if (response.ok && result.success) {
        if (result.user?.isAdmin) {
          const adminName = result.user.username || `Admin_${walletAddress.slice(-6)}`;
          toast({
            title: "Authentication Successful",
            description: `Welcome ${adminName}! You are now logged in.`,
          });
          onAuthSuccess();
        } else {
          toast({
            title: "Access Denied", 
            description: "This wallet is not authorized for admin access",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Authentication Failed",
          description: result.message || "Failed to authenticate",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast({
          title: "Authentication Cancelled",
          description: "Wallet signature was cancelled",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Failed",
          description: "Unable to verify wallet signature",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
          <p className="text-gray-400">Connect your authorized wallet to access the admin panel</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-900/20 border-blue-600">
            <Key className="h-4 w-4" />
            <AlertDescription className="text-blue-200">
              Connect your authorized wallet to access the admin panel securely
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleWalletConnect}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            {isLoading ? "Authenticating..." : "Connect Wallet & Sign"}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/"}
              className="text-gray-400 hover:text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}