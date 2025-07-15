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
    retry: 1, // Consistent with queryClient default
    retryDelay: 1000,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false, // Consistent with queryClient default
    refetchOnMount: true,
    refetchOnReconnect: true
  });

  useEffect(() => {
    // Only redirect after loading is complete and we have confirmed 401 error
    if (!isLoading && !user && error && error.message.includes("401")) {
      const timer = setTimeout(() => {
        setLocation("/");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, error, setLocation]);

  // Show loading while checking authentication
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

  // If user data exists, render protected content
  if (user) {
    return <>{children}</>;
  }

  // If not authenticated (confirmed by 401 error), redirect only via useEffect
  if (!user && error && error.message.includes("401")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting...</p>
        </div>
      </div>
    );
  }
  
  // If there's no user and no error yet, wait a bit more
  if (!user && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}