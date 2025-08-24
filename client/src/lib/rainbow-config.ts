import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

// Determine if we're in production
const isProduction = window.location.hostname.includes('nectiq.replit.app');
const isDevelopment = window.location.hostname.includes('picard.replit.dev');

// Universal Project ID - should work for both production and development
const getProjectId = () => {
  if (isProduction) {
    // Production: Try production-specific ID first, then fallback
    return import.meta.env.VITE_WALLETCONNECT_PROD_PROJECT_ID || 
           import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 
           'ba0e679a5831cee26576868ecd70fdbf';
  }
  
  // Development: Use standard project ID
  return import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf';
};

export const rainbowConfig = getDefaultConfig({
  appName: 'Nectiq - Cryptocurrency Prediction Platform',
  projectId: getProjectId(),
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

// Debug configuration
console.log('🔧 [RAINBOW-CONFIG] Configuration loaded:', {
  environment: isProduction ? 'production' : (isDevelopment ? 'development' : 'local'),
  domain: window.location.hostname,
  fullUrl: window.location.href,
  projectId: getProjectId(),
  chains: rainbowConfig.chains.length,
  ssr: false
});

// Production-specific warnings
if (isProduction && !import.meta.env.VITE_WALLETCONNECT_PROD_PROJECT_ID) {
  console.warn('⚠️ [RAINBOW-CONFIG] Production environment detected but no VITE_WALLETCONNECT_PROD_PROJECT_ID found!');
  console.warn('⚠️ [RAINBOW-CONFIG] Using fallback project ID - wallet connection may fail');
  console.warn('⚠️ [RAINBOW-CONFIG] Please configure WalletConnect project at https://cloud.reown.com/');
}