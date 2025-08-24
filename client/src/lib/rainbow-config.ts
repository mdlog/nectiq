import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

// Determine if we're in production
const isProduction = window.location.hostname.includes('nectiq.replit.app');

export const rainbowConfig = getDefaultConfig({
  appName: 'Nectiq - Cryptocurrency Prediction Platform',
  // Use production-specific project ID if available, otherwise fallback to default
  projectId: isProduction 
    ? (import.meta.env.VITE_WALLETCONNECT_PROD_PROJECT_ID || import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf')
    : (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf'),
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

// Debug configuration
console.log('🔧 [RAINBOW-CONFIG] Configuration loaded:', {
  environment: isProduction ? 'production' : 'development',
  domain: window.location.hostname,
  projectId: isProduction 
    ? (import.meta.env.VITE_WALLETCONNECT_PROD_PROJECT_ID || import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf')
    : (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf'),
  chains: rainbowConfig.chains.length,
  ssr: false
});