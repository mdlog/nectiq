import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🌈 [RAINBOW] Initializing with Project ID:', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf');
}

export const rainbowConfig = getDefaultConfig({
  appName: 'Nectiq',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf',
  chains: [mainnet, base, sepolia, polygon, optimism, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: false,
});