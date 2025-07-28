import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [retryCount, setRetryCount] = useState(0);

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/user"],
    retry: false, // Handle retries manually
    staleTime: 0, // Force fresh data check
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    throwOnError: false // Prevent unhandled promise rejections
  });

  // Enhanced session recovery mechanism with progressive retry
  useEffect(() => {
    if (error && !isLoading && retryCount < 3) {
      console.log(`🔄 [ProtectedRoute] Authentication failed (attempt ${retryCount + 1}/3), retrying in ${1 + retryCount} seconds...`, error?.message);
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        refetch();
      }, (1 + retryCount) * 1000); // Progressive delay: 1s, 2s, 3s
      return () => clearTimeout(timer);
    }
  }, [error, isLoading, refetch, retryCount]);

  // Reset retry count on successful authentication
  useEffect(() => {
    if (user && !error && retryCount > 0) {
      console.log("🔄 [ProtectedRoute] Authentication successful, resetting retry count");
      setRetryCount(0);
    }
  }, [user, error, retryCount]);

  useEffect(() => {
    // Debug logging untuk troubleshooting
    console.log("🔐 [ProtectedRoute] Auth state:", { 
      isLoading, 
      hasUser: !!user, 
      hasError: !!error, 
      errorMessage: error?.message,
      location: window.location.pathname,
      userDetails: user && typeof user === 'object' && 'id' in user ? { id: (user as any).id, username: (user as any).username } : null
    });
  }, [user, isLoading, error]);

  // Show loading while checking authentication with retry info
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {retryCount > 0 ? `Authenticating... (Attempt ${retryCount + 1})` : 'Loading...'}
          </p>
          {retryCount > 0 && (
            <p className="text-white/60 text-sm mt-2">
              Connecting to user session...
            </p>
          )}
        </div>
      </div>
    );
  }

  // If not authenticated, show login message with manual retry option
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Authentication Required</h3>
          <p className="text-white/80 mb-4">Please connect your wallet to access the dashboard</p>
          
          {/* Show error details if available */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">
                Error: {error.message}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                  console.log('🔌 [MOBILE] Connect Wallet button clicked');
                  
                  // Enhanced mobile detection and wallet connection
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  console.log('📱 [MOBILE] Is mobile device:', isMobile);
                  
                  if (typeof window !== 'undefined' && (window as any).ethereum) {
                    console.log('💳 [MOBILE] MetaMask detected, requesting accounts...');
                    
                    // Enhanced mobile wallet connection with longer timeout
                    const accounts = await Promise.race([
                      (window as any).ethereum.request({ 
                        method: 'eth_requestAccounts' 
                      }),
                      new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Connection timeout')), 10000)
                      )
                    ]);
                    
                    console.log('🔐 [MOBILE] Accounts received:', accounts?.length);
                    
                    if (accounts && accounts.length > 0) {
                      const walletAddress = accounts[0];
                      console.log('💼 [MOBILE] Wallet address:', walletAddress);
                      
                      // Authenticate with backend
                      const response = await fetch('/api/auth/wallet-connect', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'User-Agent': navigator.userAgent
                        },
                        credentials: 'include',
                        body: JSON.stringify({ walletAddress, isMobile })
                      });
                      
                      console.log('🌐 [MOBILE] Backend response status:', response.status);
                      
                      if (response.ok) {
                        console.log('✅ [MOBILE] Authentication successful, reloading...');
                        // Force refresh to update authentication state
                        window.location.reload();
                      } else {
                        const error = await response.json();
                        console.error('❌ [MOBILE] Wallet authentication failed:', error);
                        alert(`Connection failed: ${error.message || 'Unknown error'}`);
                      }
                    }
                  } else if (isMobile) {
                    // Mobile specific wallet detection
                    console.log('📲 [MOBILE] No MetaMask detected on mobile, checking alternatives...');
                    
                    // Try to detect mobile wallet apps
                    const mobileWalletUrl = 'https://metamask.app.link/dapp/' + window.location.host;
                    console.log('🔗 [MOBILE] Opening MetaMask app:', mobileWalletUrl);
                    
                    // Open MetaMask mobile app
                    window.location.href = mobileWalletUrl;
                  } else {
                    // Desktop - redirect to MetaMask download
                    console.log('💻 [DESKTOP] No wallet detected, redirecting to MetaMask download');
                    window.open('https://metamask.io/download/', '_blank');
                  }
                } catch (error) {
                  console.error('❌ [MOBILE] Wallet connection error:', error);
                  alert(`Connection error: ${error.message || 'Please try again'}`);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors touch-manipulation"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Connect Wallet
              </span>
            </button>
            
            <button 
              onClick={() => {
                setRetryCount(0);
                refetch();
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Retrying...' : 'Retry Authentication'}
            </button>
          </div>
          
          {retryCount >= 3 && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 text-sm">
                Multiple retry attempts failed. Please try connecting your wallet again.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}