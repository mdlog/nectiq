import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { ReactNode } from 'react';

interface DynamicProviderProps {
  children: ReactNode;
}

export default function DynamicProvider({ children }: DynamicProviderProps) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || 'live_2e91e29b-1c5b-4f29-8e5e-6c0f3d8b7e5a',
        walletConnectors: ['metamask', 'walletconnect', 'coinbase', 'injected'],
        initialAuthenticationMode: 'connect-only',
        cssOverrides: `
          .dynamic-modal {
            z-index: 9999;
          }
          .dynamic-modal-overlay {
            background-color: rgba(0, 0, 0, 0.5);
          }
          .dynamic-widget-container {
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .dynamic-connect-button {
            background: linear-gradient(to right, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s;
          }
          .dynamic-connect-button:hover {
            background: linear-gradient(to right, #2563eb, #1e40af);
            transform: translateY(-1px);
          }
        `,
        walletConnectorExtensions: [],
        events: {
          onAuthSuccess: () => {
            console.log('Dynamic: Authentication successful');
          },
          onAuthFailure: (error) => {
            console.error('Dynamic: Authentication failed', error);
          },
          onLogout: () => {
            console.log('Dynamic: User logged out');
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}