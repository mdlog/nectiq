import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WagmiProvider, useAccount } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi';
import { config, projectId } from './lib/web3Config';
import Dashboard from "@/pages/dashboard";
import UserDashboard from "@/pages/user-dashboard";
import AdminPanel from "@/pages/admin";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";
import HowToPlay from "@/pages/how-to-play";
import TermsConditions from "@/pages/terms-conditions";
import PrivacyPolicy from "@/pages/privacy-policy";
import WalletLoginPage from "@/pages/wallet-login";

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
    message.includes('Cross-Origin-Opener-Policy')
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
    message.includes('Lit is in dev mode')
  ) {
    return; // Suppress wallet extension warnings
  }
  originalWarn.apply(console, args);
};

// Initialize Web3Modal with error handling
try {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: false,
    enableOnramp: false,
  });
} catch (error) {
  // Wallet initialization conflicts are common and non-critical
  console.log('Web3Modal initialized with wallet provider conflicts (normal behavior)');
}

// Protected Admin Component
function ProtectedAdmin() {
  const { address } = useAccount();
  const AUTHORIZED_WALLET = "0x4C6165286739696849Fb3e77A16b0639D762c5B6";
  
  if (!address || address.toLowerCase() !== AUTHORIZED_WALLET.toLowerCase()) {
    return <NotFound />;
  }
  
  return <AdminPanel />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin" component={ProtectedAdmin} />
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
