import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useRainbowAuth } from '@/hooks/useRainbowAuth';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWallet?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireWallet = true, 
  requireAdmin = false,
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
        console.log('🚫 [PROTECTED-ROUTE] Access denied - debugging:', {
          isConnected,
          hasUser: !!user,
          isLoading,
          userInfo: user ? { id: user.id, username: user.username } : null,
          currentPath: window.location.pathname
        });
        
        toast({
          title: "Wallet Required",
          description: "Please connect your wallet to access this page.",
          variant: "destructive",
        });
        
        // Redirect to home page
        setLocation(redirectTo);
        return;
      }
      
      // Check admin access if required
      if (requireAdmin && !user.isAdmin) {
        console.log('🚫 [PROTECTED-ROUTE] Access denied - admin privileges required');
        
        toast({
          title: "Admin Access Required",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        
        // Redirect to home page
        setLocation(redirectTo);
        return;
      }
    }
  }, [isConnected, user, isLoading, requireWallet, requireAdmin, redirectTo, setLocation, toast]);

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
  
  // If admin is required but user is not admin, don't render children
  if (requireAdmin && (!user || !user.isAdmin)) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
}

// Untuk backward compatibility dengan import default
export default ProtectedRoute;