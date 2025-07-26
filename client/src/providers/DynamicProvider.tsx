import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import { CosmosWalletConnectors } from '@dynamic-labs/cosmos';
import { StarknetWalletConnectors } from '@dynamic-labs/starknet';
import { ReactNode, useState } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { useAuthenticationHandler } from '@/hooks/useAuthenticationHandler';
import { useForceSignature } from '@/hooks/useForceSignature';
import { WalletEmailVerification } from '@/components/WalletEmailVerification';

interface DynamicProviderProps {
  children: ReactNode;
}

function DynamicContent({ children }: { children: ReactNode }) {
  useAuthenticationHandler();
  useForceSignature();
  return <>{children}</>;
}

export default function DynamicProvider({ children }: DynamicProviderProps) {
  const [, navigate] = useLocation();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingWalletAddress, setPendingWalletAddress] = useState<string | null>(null);
  
  // Debug environment variables
  console.log('🔧 Dynamic Labs Configuration:');
  console.log('   ENVIRONMENT_ID:', import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID);
  console.log('   WALLETCONNECT_PROJECT_ID:', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID);
  
  const environmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;
  const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
  
  if (!environmentId) {
    console.error('❌ VITE_DYNAMIC_ENVIRONMENT_ID is not defined!');
    return <div>Dynamic Labs configuration error. Please check environment variables.</div>;
  }
  
  return (
    <>
      <DynamicContextProvider
        settings={{
          environmentId: environmentId,
          walletConnectors: [
            EthereumWalletConnectors,
            SolanaWalletConnectors,
          ] as any, // Temporary fix for version compatibility
        walletConnectPreferredChains: walletConnectProjectId ? ['eip155:1'] : undefined,
        // Simplified configuration to avoid CORS issues
        initialAuthenticationMode: 'connect-only',
        appName: 'Nectiq',
        appLogoUrl: '/logo.png',
        enableVisitTrackingOnConnectOnly: true,
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
            console.log('🔐 Dynamic: Auth flow opened - forcing signature verification');
            
            // Clear session data sebelum auth flow dimulai
            try {
              const keysToRemove = [
                'dynamic-auth-token',
                'dynamic-user-data',
                'dynamic-wallet-data', 
                'dynamic-session',
                'dynamic-cached-wallet',
                'dynamic-jwt-token'
              ];
              
              keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
              });
              
              console.log('🔐 [FORCE-CONFIRM] Session data cleared before auth flow');
            } catch (error) {
              console.error('🔐 [FORCE-CONFIRM] Error clearing session:', error);
            }
          },
          onAuthFlowClose: () => {
            console.log('🔐 Dynamic: Auth flow closed');
          },
          onAuthFlowCancel: () => {
            console.log('🔐 Dynamic: Auth flow cancelled');
          },

          // onEmailVerificationCompleted removed in newer versions
          onAuthSuccess: async (args) => {
            console.log('🔐 Dynamic: Authentication successful with signature confirmation', args);
            console.log('🔐 User object:', args.user);
            console.log('🔐 Auth args complete:', JSON.stringify(args, null, 2));
            
            // Add immediate debug log
            console.log('🔐 onAuthSuccess TRIGGERED - Processing authentication with signature...');
            
            // Try-catch to handle any errors in this callback
            try {
              // Support both wallet and email authentication
            const walletAddress = args.user?.verifiedCredentials?.[0]?.address;
            const email = args.user?.email;
            const userId = args.user?.userId;
            const hasSignature = args.user?.verifiedCredentials?.[0] ? true : false;
            
            console.log('🔐 Extracted data:', {
              walletAddress,
              email,
              userId,
              hasVerifiedCredentials: !!args.user?.verifiedCredentials?.length,
              hasSignature: !!hasSignature,
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
                    user: args.user,
                    signatureVerified: !!hasSignature
                  }),
                });

                console.log('🔐 Backend response status:', response.status);
                
                if (response.ok) {
                  const responseData = await response.json();
                  console.log('🔐 Backend authentication successful:', responseData);
                  
                  // Check if user needs email verification (no existing email)
                  console.log('🔐 [DEBUG] Checking email verification need:', {
                    hasEmail: !!responseData.user?.email,
                    email: responseData.user?.email,
                    walletAddress,
                    showDialog: !responseData.user?.email && !!walletAddress
                  });
                  
                  if (!responseData.user?.email && walletAddress) {
                    console.log('🔥 [FIREBASE] User needs email verification - showing dialog!');
                    setPendingWalletAddress(walletAddress);
                    setShowEmailVerification(true);
                    return; // Don't invalidate queries yet, wait for email verification
                  }
                  
                  // Invalidate all queries to refresh authentication state
                  console.log('🔐 Invalidating queries...');
                  await queryClient.invalidateQueries();
                  console.log('🔐 Queries invalidated');
                  
                  // Check current location and only redirect if not already on admin or important pages
                  const currentPath = window.location.pathname;
                  console.log('🔐 Current path after authentication:', currentPath);
                  
                  // Don't redirect if user is already on admin panel or other important pages
                  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
                    console.log('🔐 User is on admin panel, skipping redirect to /home');
                    return; // Skip redirect
                  }
                  
                  // Only redirect to /home if user is on landing page or unauthenticated pages
                  if (currentPath === '/' || currentPath === '/landing' || currentPath === '/wallet-login') {
                    setTimeout(() => {
                      console.log('🔐 Redirecting from landing page to /home...');
                      try {
                        navigate('/home');
                        console.log('🔐 Navigate function executed');
                      } catch (error) {
                        console.error('🔐 Navigate failed:', error);
                        window.location.href = '/home';
                      }
                    }, 1000);
                  } else {
                    console.log('🔐 User already on authenticated page, no redirect needed');
                  }
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
            console.log('🔐 Dynamic: User logged out - clearing all session data');
            
            // Clear backend session
            fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            
            // Clear all Dynamic Labs session data untuk memaksa konfirmasi pada login berikutnya
            try {
              const keysToRemove = [
                'dynamic-auth-token',
                'dynamic-user-data',
                'dynamic-wallet-data',
                'dynamic-session',
                'dynamic-cached-wallet', 
                'dynamic-jwt-token'
              ];
              
              keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
              });
              
              // Clear semua keys yang mengandung 'dynamic'
              Object.keys(localStorage).forEach(key => {
                if (key.toLowerCase().includes('dynamic')) {
                  localStorage.removeItem(key);
                }
              });
              
              console.log('🔐 [FORCE-CONFIRM] All session data cleared on logout - next login will require confirmation');
            } catch (error) {
              console.error('🔐 [FORCE-CONFIRM] Error clearing session on logout:', error);
            }
            
            // Invalidate queries and navigate
            queryClient.invalidateQueries();
            navigate('/');
          },
        },
      }}
    >
      <DynamicContent>{children}</DynamicContent>
    </DynamicContextProvider>

    {/* Firebase Email Verification Modal */}
    {showEmailVerification && pendingWalletAddress && (
      <WalletEmailVerification 
        walletAddress={pendingWalletAddress}
        onSuccess={async (email?: string, firebaseUid?: string, displayName?: string) => {
          console.log('🔥 [FIREBASE] Email verification successful:', { email, firebaseUid, displayName });
          
          // Link wallet to email via API
          if (pendingWalletAddress) {
            try {
              const response = await fetch('/api/auth/link-wallet-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  walletAddress: pendingWalletAddress,
                  email,
                  firebaseUid,
                  displayName
                })
              });
              
              if (response.ok) {
                console.log('✅ [FIREBASE] Email linked successfully');
              } else {
                console.error('❌ [FIREBASE] Failed to link email - server error');
              }
            } catch (error) {
              console.error('❌ [FIREBASE] Failed to link email:', error);
            }
          }
          
          setShowEmailVerification(false);
          setPendingWalletAddress(null);
          
          // Now invalidate queries to refresh authentication state
          await queryClient.invalidateQueries();
          
          // Navigate to home after successful verification
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/landing' || currentPath === '/wallet-login') {
            setTimeout(() => navigate('/home'), 1000);
          }
        }}
        onCancel={() => {
          console.log('🔐 Email verification cancelled');
          setShowEmailVerification(false);
          setPendingWalletAddress(null);
        }}
      />
    )}
    </>
  );
}