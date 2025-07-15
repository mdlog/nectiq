import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, ArrowRight, Link, AlertTriangle } from "lucide-react";
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useToast } from "@/hooks/use-toast";

interface WalletRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: () => void;
  actionType: 'prediction' | 'battle' | 'survival';
}

export function WalletRequiredModal({ 
  isOpen, 
  onClose, 
  onWalletConnected, 
  actionType 
}: WalletRequiredModalProps) {
  const { primaryWallet, isAuthenticated } = useDynamicContext();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const actionMessages = {
    prediction: {
      title: "Wallet Required for Predictions",
      description: "To make cryptocurrency price predictions, you need to connect your wallet for secure transaction tracking and rewards distribution.",
      icon: "📈"
    },
    battle: {
      title: "Wallet Required for Battles",
      description: "To participate in prediction battles, you need to connect your wallet for stake management and prize distribution.",
      icon: "⚔️"
    },
    survival: {
      title: "Wallet Required for Survival Tournament",
      description: "To join survival tournaments, you need to connect your wallet for entry fees and prize distribution.",
      icon: "🏆"
    }
  };

  const currentAction = actionMessages[actionType];

  const handleWalletConnection = async () => {
    if (primaryWallet?.address) {
      setIsConnecting(true);
      try {
        // Wallet is already connected, just verify with backend
        const response = await fetch('/api/user/link-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            walletAddress: primaryWallet.address
          }),
        });

        if (response.ok) {
          toast({
            title: "Wallet Connected!",
            description: `Your wallet has been linked to your account. You can now proceed with ${actionType}.`,
          });
          onWalletConnected();
          onClose();
        } else {
          const errorData = await response.json();
          toast({
            title: "Connection Failed",
            description: errorData.message || "Failed to link wallet to your account.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Connection Error",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
            {currentAction.icon}
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {currentAction.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {currentAction.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are currently logged in with email. To proceed, please connect your crypto wallet.
            </AlertDescription>
          </Alert>

          {/* Benefits */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Why Connect Wallet?
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500"></Badge>
                Secure transaction processing
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500"></Badge>
                Automatic rewards distribution
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500"></Badge>
                Enhanced account security
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="w-2 h-2 p-0 bg-green-500"></Badge>
                Full platform access
              </li>
            </ul>
          </div>

          {/* Wallet Connection */}
          <div className="space-y-3">
            {primaryWallet?.address ? (
              <div className="space-y-3">
                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    Wallet detected: {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleWalletConnection}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isConnecting ? (
                    "Connecting..."
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-2" />
                      Link Wallet to Account
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Connect your crypto wallet to continue:
                </p>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <DynamicWidget />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            {primaryWallet?.address && (
              <Button 
                onClick={handleWalletConnection}
                disabled={isConnecting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}