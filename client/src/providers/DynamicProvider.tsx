import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { ReactNode } from 'react';

interface DynamicProviderProps {
  children: ReactNode;
}

export default function DynamicProvider({ children }: DynamicProviderProps) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || 'live_default',
        appName: 'Nectiq',
        appLogoUrl: '/logo.png',
        cssOverrides: `
          .dynamic-modal {
            z-index: 9999;
          }
          .dynamic-modal-overlay {
            background-color: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
          }
          .dynamic-widget-container {
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
          .dynamic-connect-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px 0 rgba(116, 75, 162, 0.4);
          }
          .dynamic-connect-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px 0 rgba(116, 75, 162, 0.6);
          }
          .dynamic-wallet-list {
            padding: 20px;
          }
          .dynamic-wallet-item {
            border-radius: 8px;
            margin-bottom: 8px;
            transition: all 0.2s ease;
          }
          .dynamic-wallet-item:hover {
            background-color: #f8fafc;
            transform: translateX(4px);
          }
        `,
        events: {
          onAuthSuccess: (args) => {
            console.log('Dynamic: Authentication successful', args);
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