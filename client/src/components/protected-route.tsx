import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user"],
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes - longer stale time
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Only on mount
    refetchOnReconnect: false // Disable to reduce calls
  });

  useEffect(() => {
    // Debug logging untuk troubleshooting
    console.log("🔐 [ProtectedRoute] Auth state:", { 
      isLoading, 
      hasUser: !!user, 
      hasError: !!error, 
      errorMessage: error?.message,
      location: window.location.pathname 
    });
  }, [user, isLoading, error]);

  // Show loading while checking authentication (with timeout)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login message instead of redirecting
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
          <p className="text-white/80 mb-6">Please connect your wallet to access the dashboard</p>
          <button 
            onClick={() => setLocation("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}