import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DynamicProvider from "@/providers/DynamicProvider";
import Dashboard from "@/pages/dashboard";
import UserDashboard from "@/pages/user-dashboard";
import AdminPanel from "@/pages/admin";
import Leaderboard from "@/pages/leaderboard";
import BattlesPage from "@/pages/battles";
import SurvivalTournamentsSimple from "@/pages/survival-tournaments-simple";
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
      <Route path="/" component={Dashboard} />
      <Route path="/user-dashboard" component={UserDashboard} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/battles" component={BattlesPage} />
      <Route path="/survival-tournaments" component={SurvivalTournamentsSimple} />
      <Route path="/survival" component={SurvivalTournamentsSimple} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/how-to-play" component={HowToPlay} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/wallet-login" component={WalletLoginPage} />
      <Route path="/dynamic-demo" component={DynamicDemo} />
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
