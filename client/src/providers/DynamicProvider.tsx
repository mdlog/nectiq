import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import { CosmosWalletConnectors } from '@dynamic-labs/cosmos';
import { StarknetWalletConnectors } from '@dynamic-labs/starknet';
import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { useAuthenticationHandler } from '@/hooks/useAuthenticationHandler';

interface DynamicProviderProps {
  children: ReactNode;
}

function DynamicContent({ children }: { children: ReactNode }) {
  useAuthenticationHandler();
  return <>{children}</>;
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
          onAuthInit: (args) => {
            console.log('🔐 Dynamic: Auth initialized', args);
          },
          onAuthFlowOpen: () => {
            console.log('🔐 Dynamic: Auth flow opened');
          },
          onAuthFlowClose: () => {
            console.log('🔐 Dynamic: Auth flow closed');
          },
          onAuthFlowCancel: () => {
            console.log('🔐 Dynamic: Auth flow cancelled');
          },
          onEmailVerificationSent: (args) => {
            console.log('🔐 Dynamic: Email verification sent', args);
          },
          onEmailVerificationCompleted: (args) => {
            console.log('🔐 Dynamic: Email verification completed', args);
          },
          onAuthSuccess: async (args) => {
            console.log('🔐 Dynamic: Authentication successful', args);
            console.log('🔐 User object:', args.user);
            console.log('🔐 Auth args complete:', JSON.stringify(args, null, 2));
            
            // Add immediate debug log
            console.log('🔐 onAuthSuccess TRIGGERED - Processing authentication...');
            
            // Try-catch to handle any errors in this callback
            try {
              // Support both wallet and email authentication
            const walletAddress = args.user?.verifiedCredentials?.[0]?.address;
            const email = args.user?.email;
            const userId = args.user?.userId;
            
            console.log('🔐 Extracted data:', {
              walletAddress,
              email,
              userId,
              hasVerifiedCredentials: !!args.user?.verifiedCredentials?.length,
              verifiedCredentials: args.user?.verifiedCredentials
            });
            
            // Check if user has wallet or email
            if (walletAddress || email || userId) {
              try {
                console.log('🔐 Sending authentication to backend...');
                const response = await fetch('/api/auth/dynamic', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    walletAddress: walletAddress || null,
                    address: walletAddress || null,
                    email: email || null,
                    userId: userId || null,
                    user: args.user
                  }),
                });

                console.log('🔐 Backend response status:', response.status);
                
                if (response.ok) {
                  const responseData = await response.json();
                  console.log('🔐 Backend authentication successful:', responseData);
                  
                  // Check if user is admin for different redirect
                  if (responseData.user?.isAdmin) {
                    console.log('🔐 Admin user detected, redirecting to home with admin context');
                  }
                  
                  // Invalidate all queries to refresh authentication state
                  console.log('🔐 Invalidating queries...');
                  await queryClient.invalidateQueries();
                  console.log('🔐 Queries invalidated');
                  
                  // Try multiple redirect approaches
                  setTimeout(() => {
                    console.log('🔐 Attempting redirect to /home...');
                    console.log('🔐 Current location before redirect:', window.location.href);
                    
                    // Try different redirect methods
                    try {
                      // Method 1: Use navigate function
                      navigate('/home');
                      console.log('🔐 Navigate function executed');
                      
                      // Method 2: Fallback to window.location
                      setTimeout(() => {
                        if (window.location.pathname !== '/home') {
                          console.log('🔐 Navigate failed, using window.location fallback');
                          window.location.href = '/home';
                        }
                      }, 500);
                    } catch (error) {
                      console.error('🔐 Navigate failed:', error);
                      window.location.href = '/home';
                    }
                    
                    console.log('🔐 Redirect command executed');
                  }, 1500);
                } else {
                  try {
                    const errorData = await response.json();
                    console.error('🔐 Backend authentication failed:', response.status, errorData);
                  } catch (jsonError) {
                    // If JSON parsing fails, get response as text
                    const errorText = await response.text();
                    console.error('🔐 Backend authentication failed (non-JSON response):', response.status, errorText);
                  }
                }
              } catch (error) {
                console.error('🔐 Authentication request failed:', error);
              }
            } else {
              console.warn('🔐 No wallet address, email, or userId found in authentication response');
              console.warn('🔐 Available user properties:', Object.keys(args.user || {}));
            }
            } catch (callbackError) {
              console.error('🔐 Error in onAuthSuccess callback:', callbackError);
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
      <DynamicContent>{children}</DynamicContent>
    </DynamicContextProvider>
  );
}