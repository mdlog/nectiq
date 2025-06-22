import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Wallet, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SimpleAdminAuthProps {
  onAuthSuccess: () => void;
}

export function SimpleAdminAuth({ onAuthSuccess }: SimpleAdminAuthProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDirectAccess = async () => {
    if (!walletAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter your wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simple admin authentication with wallet address
      const response = await apiRequest("POST", "/api/admin/simple-auth", {
        walletAddress: walletAddress.trim(),
      });

      const result = await response.json() as { success: boolean; message: string };
      if (result.success) {
        toast({
          title: "Access Granted",
          description: "Welcome to admin panel",
        });
        onAuthSuccess();
      } else {
        toast({
          title: "Access Denied",
          description: "This wallet is not authorized for admin access",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Unable to verify admin access",
        variant: "destructive",
      });
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
          <p className="text-gray-400">Enter authorized wallet address</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-yellow-900/20 border-yellow-600">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-yellow-200">
              Only authorized wallet addresses can access the admin panel
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="wallet" className="text-gray-200">Wallet Address</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="wallet"
                type="text"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                onKeyDown={(e) => e.key === "Enter" && handleDirectAccess()}
              />
            </div>
          </div>

          <Button 
            onClick={handleDirectAccess}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Verifying..." : "Access Admin Panel"}
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