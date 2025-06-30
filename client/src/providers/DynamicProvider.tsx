import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import { CosmosWalletConnectors } from '@dynamic-labs/cosmos';
import { StarknetWalletConnectors } from '@dynamic-labs/starknet';
import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

interface DynamicProviderProps {
  children: ReactNode;
}

export default function DynamicProvider({ children }: DynamicProviderProps) {
  const [, navigate] = useLocation();
  
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || 'live_default',
        walletConnectors: [
          EthereumWalletConnectors,
          SolanaWalletConnectors,
          CosmosWalletConnectors,
          StarknetWalletConnectors,
        ],
        appName: 'Nectiq',
        appLogoUrl: 'https://nectiq.app/logo.png',
        initialAuthenticationMode: 'connect-and-sign',
        enableVisitTrackingOnConnectOnly: false,
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
          onAuthSuccess: async (args) => {
            console.log('Dynamic: Authentication successful', args);
            const walletAddress = args.user?.verifiedCredentials?.[0]?.address;
            
            if (walletAddress) {
              try {
                const response = await fetch('/api/auth/dynamic', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    walletAddress: walletAddress,
                    address: walletAddress,
                    user: args.user
                  }),
                });

                if (response.ok) {
                  try {
                    const data = await response.json();
                    console.log('Backend authentication successful:', data);
                    
                    // Invalidate all queries to refresh authentication state
                    await queryClient.invalidateQueries();
                    
                    // Force redirect using window.location for more reliable navigation
                    console.log('Forcing redirect to /home');
                    window.location.href = '/home';
                  } catch (jsonError) {
                    console.error('JSON parsing error on success response:', jsonError);
                    // Still redirect on success even if JSON parsing fails
                    await queryClient.invalidateQueries();
                    console.log('Forcing redirect to /home (fallback)');
                    window.location.href = '/home';
                  }
                } else {
                  try {
                    const errorData = await response.json();
                    console.error('Backend authentication failed:', response.status, errorData);
                  } catch (jsonError) {
                    // If JSON parsing fails, get response as text
                    const errorText = await response.text();
                    console.error('Backend authentication failed (non-JSON response):', response.status, errorText);
                  }
                }
              } catch (error) {
                console.error('Authentication request failed:', error);
              }
            }
          },
          onAuthFailure: (error) => {
            console.error('Dynamic: Authentication failed', error);
          },
          onLogout: () => {
            console.log('Dynamic: User logged out');
            // Clear backend session
            fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}