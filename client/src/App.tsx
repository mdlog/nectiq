import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi';
import { config, projectId } from './lib/web3Config';
import Dashboard from "@/pages/dashboard";
import UserDashboard from "@/pages/user-dashboard";
import AdminPanel from "@/pages/admin";
import NotFound from "@/pages/not-found";
import HowToPlay from "@/pages/how-to-play";
import TermsConditions from "@/pages/terms-conditions";
import PrivacyPolicy from "@/pages/privacy-policy";
import WalletLoginPage from "@/pages/wallet-login";

// Initialize Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/how-to-play" component={HowToPlay} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/wallet-login" component={WalletLoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
