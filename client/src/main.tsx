import { createRoot } from "react-dom/client";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { rainbowConfig } from './lib/rainbow-config';
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

// Add error handling for global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Don't prevent the default behavior for these errors
});

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

try {
  createRoot(root).render(
    <ErrorBoundary>
      <WagmiProvider config={rainbowConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider 
            theme={{
              lightMode: lightTheme({
                accentColor: '#06b6d4',
                accentColorForeground: 'white',
                borderRadius: 'medium',
              }),
              darkMode: darkTheme({
                accentColor: '#06b6d4',
                accentColorForeground: 'white',
                borderRadius: 'medium',
              }),
            }}
            modalSize="compact"
          >
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback to basic HTML
  root.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f4f6; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Loading Nectiq...</h1>
        <p style="color: #666; margin-bottom: 2rem;">The application is starting up. Please wait...</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
          Reload
        </button>
      </div>
    </div>
  `;
}
