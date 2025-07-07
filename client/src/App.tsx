import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DynamicProvider from "@/providers/DynamicProvider";
import LandingPage from "@/pages/landing";
import ProtectedRoute from "@/components/protected-route";
import Dashboard from "@/pages/dashboard";
import UserDashboard from "@/pages/user-dashboard";
import AdminPanel from "@/pages/admin";
import Leaderboard from "@/pages/leaderboard";
import BattlesPage from "@/pages/battles";

import SurvivalGame from "@/pages/survival-game";
import SurvivalTest from "@/pages/survival-test";
import SurvivalSimple from "@/pages/survival-simple";
import SurvivalFixed from "@/pages/survival-fixed";
import NotFound from "@/pages/not-found";
import HowToPlay from "@/pages/how-to-play";
import TermsConditions from "@/pages/terms-conditions";
import PrivacyPolicy from "@/pages/privacy-policy";
import WalletLoginPage from "@/pages/wallet-login";
import DynamicDemo from "@/pages/dynamic-demo";


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
      {/* Landing page - no authentication required */}
      <Route path="/" component={LandingPage} />
      
      {/* Protected routes - require authentication */}
      <Route path="/home">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/user-dashboard">
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/battles">
        <ProtectedRoute>
          <BattlesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/survival">
        <ProtectedRoute>
          <SurvivalFixed />
        </ProtectedRoute>
      </Route>
      
      <Route path="/survival-game">
        <ProtectedRoute>
          <SurvivalGame />
        </ProtectedRoute>
      </Route>
      
      <Route path="/leaderboard">
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/how-to-play">
        <ProtectedRoute>
          <HowToPlay />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      

      
      {/* Public routes - no authentication required */}
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/wallet-login" component={WalletLoginPage} />
      <Route path="/dynamic-demo" component={DynamicDemo} />
      
      {/* 404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <DynamicProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </DynamicProvider>
  );
}

export default App;
