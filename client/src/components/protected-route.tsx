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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true
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

    // Redirect to landing page after a reasonable timeout if not authenticated
    if (!isLoading && !user && error && error.message.includes("401")) {
      console.log("🔐 [ProtectedRoute] Redirecting to / due to 401 error");
      const timer = setTimeout(() => {
        setLocation("/");
      }, 1000); // Increased delay untuk admin panel
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, error, setLocation]);

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

  // If not authenticated (confirmed by 401 error), redirect immediately
  if (!user && error && error.message.includes("401")) {
    setLocation("/");
    return null;
  }
  
  // If there's no user data but also no error, assume not authenticated and redirect
  if (!user && !error) {
    setLocation("/");
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}