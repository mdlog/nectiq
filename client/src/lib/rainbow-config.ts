import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

export const rainbowConfig = getDefaultConfig({
  appName: 'Nectiq - Cryptocurrency Prediction Platform',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf',
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
});