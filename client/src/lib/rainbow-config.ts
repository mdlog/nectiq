import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

// Get WalletConnect Project ID with debugging
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// Debug logging for deployment troubleshooting
console.log('🔧 WalletConnect Configuration:', {
  projectId: projectId ? `${projectId.slice(0, 8)}...` : 'NOT_SET',
  hasProjectId: !!projectId,
  currentDomain: window.location.hostname,
  fullUrl: window.location.href
});

if (!projectId) {
  console.error('❌ [WALLETCONNECT] VITE_WALLETCONNECT_PROJECT_ID is not set!');
  console.error('   This will cause wallet connection issues in production.');
  console.error('   Please set VITE_WALLETCONNECT_PROJECT_ID in Replit Secrets.');
}

export const rainbowConfig = getDefaultConfig({
  appName: 'Nectiq - Cryptocurrency Prediction Platform',
  projectId: projectId || (() => {
    console.warn('⚠️ [WALLETCONNECT] Using fallback project ID - wallet connections may fail');
    return 'ba0e679a5831cee26576868ecd70fdbf';
  })(),
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  ssr: false, // If your dApp uses server side rendering (SSR)
});