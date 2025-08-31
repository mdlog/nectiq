import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing";
import { ProtectedRoute } from "@/components/protected-route";
import Dashboard from "@/pages/dashboard";
import UserDashboard from "@/pages/user-dashboard";

import AdminPanel from "@/pages/admin-working";
import Leaderboard from "@/pages/leaderboard";
import BattlesPage from "@/pages/battles";
import ParlayPage from "@/pages/parlay-simple";

import SurvivalGame from "@/pages/survival-game";
import NotFound from "@/pages/not-found";
import HowToPlay from "@/pages/how-to-play";
import TermsConditions from "@/pages/terms-conditions";
import PrivacyPolicy from "@/pages/privacy-policy";

import { MobileWarning, useMobileDetection } from "@/components/mobile-warning";
import { MaintenancePage } from "@/components/MaintenancePage";
import { handleReferralFromURL } from "@/lib/referralHandler";
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

// Simple console test to verify React rendering
console.log('🚀 Starting Nectiq application...');

function TestApp() {
  console.log('✅ TestApp rendered successfully!');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1>Nectiq Test Mode</h1>
      <p>Application is loading correctly!</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => window.location.href = '/'}>
          Go to Main App
        </button>
      </div>
    </div>
  );
}

// Suppress wallet extension conflicts in console
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('Invalid property descriptor') ||
    message.includes('Failed to assign ethereum proxy') ||
    message.includes('Unable to redefine window.ethereum') ||
    message.includes('Cannot both specify accessors') ||
    message.includes('E8Wallet: Received invalid network parameters') ||
    message.includes('Cross-Origin-Opener-Policy') ||
    message.includes('Dynamic SDK')
  ) {
    return; // Suppress wallet extension conflicts
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('Unable to redefine window.ethereum') ||
    message.includes('Backpack couldn\'t override') ||
    message.includes('Lit is in dev mode') ||
    message.includes('Dynamic SDK')
  ) {
    return; // Suppress wallet extension warnings
  }
  originalWarn.apply(console, args);
};

function Router() {
  return (
    <Switch>
      {/* Home page - conditional content based on authentication */}
      <Route path="/" component={Dashboard} />
      <Route path="/home" component={Dashboard} />
      
      <Route path="/user-dashboard">
        <ProtectedRoute requireWallet={true}>
          <UserDashboard />
        </ProtectedRoute>
      </Route>


      
      <Route path="/dashboard">
        <ProtectedRoute requireWallet={true}>
          <UserDashboard />
        </ProtectedRoute>
      </Route>

      {/* Parlay/TrendRide page */}
      <Route path="/parlay">
        <ProtectedRoute requireWallet={true}>
          <ParlayPage />
        </ProtectedRoute>
      </Route>

      {/* Battles page */}
      <Route path="/battles">
        <ProtectedRoute requireWallet={true}>
          <BattlesPage />
        </ProtectedRoute>
      </Route>

      {/* Survival game page */}
      <Route path="/survival">
        <ProtectedRoute requireWallet={true}>
          <SurvivalGame />
        </ProtectedRoute>
      </Route>

      {/* Admin Panel - PROTECTED */}
      <Route path="/admin/:tab?">
        <ProtectedRoute requireWallet={true} requireAdmin={true}>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      
      {/* Legacy admin route for backward compatibility */}
      <Route path="/admin-main/:tab?">
        <ProtectedRoute requireWallet={true} requireAdmin={true}>
          <AdminPanel />
        </ProtectedRoute>
      </Route>

      {/* Public pages */}
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/how-to-play" component={HowToPlay} />
      <Route path="/terms" component={TermsConditions} />
      <Route path="/privacy" component={PrivacyPolicy} />

      {/* Catch-all for 404s */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isMobile } = useMobileDetection();
  const { address, isConnected } = useAccount();

  // Check maintenance mode status
  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ["/api/maintenance-status"],
    refetchInterval: 10000, // Check every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Check if current user is admin (only if wallet connected)
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/check-admin", address],
    enabled: !!address && isConnected, // Only run if wallet is connected
    refetchInterval: 30000, // Check admin status every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });

  // Handle referral code on mount
  useEffect(() => {
    handleReferralFromURL();
  }, []);

  // Simple debug mode toggle
  const urlParams = new URLSearchParams(window.location.search);
  const debugMode = urlParams.get('debug') === 'true';

  if (debugMode) {
    console.log('✅ Root element found, rendering TestApp...');
    return <TestApp />;
  }

  // Show maintenance page if maintenance mode is active AND user is not admin
  const isAdmin = adminData?.isAdmin || false;
  const isInMaintenanceMode = !maintenanceLoading && maintenanceData?.maintenanceMode;
  
  console.log('🔍 [MAINTENANCE-CHECK] Maintenance mode:', isInMaintenanceMode);
  console.log('🔍 [MAINTENANCE-CHECK] User is admin:', isAdmin);
  console.log('🔍 [MAINTENANCE-CHECK] Wallet address:', address);
  
  if (isInMaintenanceMode && !isAdmin) {
    console.log('🚫 [MAINTENANCE] Blocking user access - showing maintenance page');
    return <MaintenancePage />;
  }
  
  if (isInMaintenanceMode && isAdmin) {
    console.log('✅ [MAINTENANCE] Admin detected - allowing full access during maintenance');
  }

  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <TooltipProvider>
      <Router />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;