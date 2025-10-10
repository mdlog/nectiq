// Dynamic Labs handles wallet connections - this config is only for fallback/backup
import { defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, arbitrum, polygon, optimism, base, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Polygon Amoy Testnet
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

// WalletConnect Project ID - get from https://cloud.walletconnect.com/
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'ba0e679a5831cee26576868ecd70fdbf';

const metadata = {
  name: 'Nectiq',
  description: 'Cryptocurrency prediction platform - Tactics. Timing. Triumph.',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://nectiq.app',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/nectiq-logo.png` : 'https://nectiq.app/logo.png']
};

const chains = [polygonAmoy, mainnet, arbitrum, polygon, optimism, base, sepolia] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  auth: {
    email: false, // Disable email login for wallet-only mode
  }
});

export { projectId };