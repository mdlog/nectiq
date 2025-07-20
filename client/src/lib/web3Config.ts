// Dynamic Labs handles wallet connections - this config is only for fallback/backup
import { defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, arbitrum, polygon, optimism, base } from 'wagmi/chains';

// Simple config for Dynamic Labs compatibility
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

const metadata = {
  name: 'Nectiq',
  description: 'Cryptocurrency prediction platform',
  url: window.location.origin,
  icons: ['https://nectiq.app/logo.png']
};

const chains = [mainnet, arbitrum, polygon, optimism, base] as const;

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