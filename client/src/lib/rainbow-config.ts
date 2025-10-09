import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { defineChain } from 'viem';

// Define Polygon Amoy Testnet (replacement for Mumbai)
export const polygonAmoy = defineChain({
  id: 80002,
  name: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
    public: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://amoy.polygonscan.com',
    },
  },
  testnet: true,
});

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🌈 [RAINBOW] Initializing with Project ID:', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf');
  console.log('🔷 [POLYGON] Amoy Testnet configured - Chain ID:', polygonAmoy.id);
}

export const rainbowConfig = getDefaultConfig({
  appName: 'Nectiq',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf',
  chains: [polygonAmoy, sepolia, mainnet, base, polygon, optimism, arbitrum],
  transports: {
    [polygonAmoy.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: false,
});