import { defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, arbitrum, polygon, optimism, base, sepolia, holesky } from 'wagmi/chains';

// Get Reown (formerly WalletConnect) projectId from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

const metadata = {
  name: 'Nectiq',
  description: 'Gamified cryptocurrency price prediction platform with multi-chain wallet support',
  url: window.location.origin,
  icons: ['https://nectiq.app/logo.png']
};

// Define supported chains including testnets
const chains = [mainnet, arbitrum, polygon, optimism, base, sepolia, holesky] as const;

// Create wagmi config with Reown (WalletConnect v2) support
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true, // Using Reown (WalletConnect v2)
  enableInjected: true, // MetaMask, Coinbase, etc.
  enableEIP6963: true, // Standard wallet detection
  enableCoinbase: true, // Coinbase Wallet
  // Additional Reown configurations
  allowUnsupportedChain: false,
  retryDelay: 1000,
});

export { projectId };