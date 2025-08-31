import React from 'react';
import { createRoot } from "react-dom/client";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { rainbowConfig } from './lib/rainbow-config';
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import TestApp from "./test-app";
import "./index.css";

console.log('🚀 Starting Nectiq application...');

// Add error handling for global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const root = document.getElementById("root");
if (!root) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, attempting to render full application...');
  
  try {
    createRoot(root).render(
      <ErrorBoundary fallback={<TestApp />}>
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
    console.log('✅ Full Nectiq application rendered successfully!');
  } catch (error) {
    console.error('❌ Failed to render full app, falling back to TestApp:', error);
    createRoot(root).render(<TestApp />);
  }
}
