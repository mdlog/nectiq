import { defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, arbitrum, polygon, optimism, base } from 'wagmi/chains';

// Get projectId from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

const metadata = {
  name: 'CryptoPredikt',
  description: 'Gamified cryptocurrency price prediction platform',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Define supported chains
const chains = [mainnet, arbitrum, polygon, optimism, base] as const;

// Create wagmi config
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});

export { projectId };