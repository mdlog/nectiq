import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useRainbowAuth } from '@/hooks/useRainbowAuth';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWallet?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireWallet = true, 
  redirectTo = '/home' 
}: ProtectedRouteProps) {
  const { isConnected, user, isLoading } = useRainbowAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Don't redirect while still loading user data
    if (isLoading) return;

    if (requireWallet) {
      // Check if wallet is connected and user is authenticated
      if (!isConnected || !user) {
        console.log('🚫 [PROTECTED-ROUTE] Access denied - wallet not connected or user not authenticated');
        
        toast({
          title: "Wallet Required",
          description: "Please connect your wallet to access this page.",
          variant: "destructive",
        });
        
        // Redirect to home page
        setLocation(redirectTo);
        return;
      }
    }
  }, [isConnected, user, isLoading, requireWallet, redirectTo, setLocation, toast]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If wallet is required but not connected, don't render children
  if (requireWallet && (!isConnected || !user)) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
}

// Untuk backward compatibility dengan import default
export default ProtectedRoute;