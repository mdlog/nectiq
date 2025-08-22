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
      
      <Route path="/battles">
        <ProtectedRoute requireWallet={true}>
          <BattlesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/survival">
        <ProtectedRoute requireWallet={true}>
          <SurvivalGame />
        </ProtectedRoute>
      </Route>
      
      <Route path="/survival-game">
        <ProtectedRoute requireWallet={true}>
          <SurvivalGame />
        </ProtectedRoute>
      </Route>
      
      <Route path="/leaderboard">
        <ProtectedRoute requireWallet={false}>
          <Leaderboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/parlay">
        <ProtectedRoute requireWallet={true}>
          <ParlayPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/how-to-play">
        <ProtectedRoute requireWallet={false}>
          <HowToPlay />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute requireWallet={true}>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      <Route path="/admin-working">
        <ProtectedRoute requireWallet={true}>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      
      {/* Public routes - no authentication required */}
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      
      {/* Redirect old wallet-login route to home page */}
      <Route path="/wallet-login" component={Dashboard} />
      
      {/* 404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { showWarning, dismissWarning } = useMobileDetection();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Toaster />
        <Router />
        <MobileWarning isOpen={showWarning} onClose={dismissWarning} />
      </div>
    </TooltipProvider>
  );
}

export default App;
