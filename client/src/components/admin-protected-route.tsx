import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying admin access...</p>
          <p className="text-blue-300 text-sm mt-2">Please wait while we authenticate your admin privileges</p>
        </div>
      </div>
    );
  }

  // Show login required if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-orange-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-400 text-6xl mb-4">🔐</div>
          <h1 className="text-white text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-yellow-300 mb-6">Please connect your wallet to access the admin panel.</p>
          <button 
            onClick={() => setLocation("/")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">🚫</div>
          <h1 className="text-white text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-red-300 mb-6">You don't have administrator privileges to access this page.</p>
          <button 
            onClick={() => setLocation("/home")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If authenticated and is admin, render the admin content
  return <>{children}</>;
}