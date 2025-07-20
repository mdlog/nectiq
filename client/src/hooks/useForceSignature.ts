import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

/**
 * Hook untuk memaksa MetaMask menampilkan konfirmasi signature pada setiap login
 * Menghapus session storage dan memaksa wallet reconnection
 */
export function useForceSignature() {
  const { user, handleLogOut, setShowAuthFlow } = useDynamicContext();

  useEffect(() => {
    // Clear Dynamic Labs session storage untuk memaksa signature verification
    const clearDynamicSession = () => {
      try {
        // Clear semua data Dynamic Labs dari localStorage dan sessionStorage
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

        Object.keys(sessionStorage).forEach(key => {
          if (key.toLowerCase().includes('dynamic')) {
            sessionStorage.removeItem(key);
          }
        });

        console.log('🔐 [FORCE-SIGNATURE] Dynamic session data cleared');
      } catch (error) {
        console.error('🔐 [FORCE-SIGNATURE] Error clearing session data:', error);
      }
    };

    // Clear session data when component mounts
    clearDynamicSession();

    // Clear session data sebelum setiap auth flow
    const handleBeforeAuth = () => {
      clearDynamicSession();
      console.log('🔐 [FORCE-SIGNATURE] Session cleared before authentication');
    };

    // Add event listener untuk clear session sebelum auth
    document.addEventListener('dynamic-auth-flow-start', handleBeforeAuth);

    return () => {
      document.removeEventListener('dynamic-auth-flow-start', handleBeforeAuth);
    };
  }, []);

  // Function untuk force logout dan clear semua session data
  const forceLogoutAndClear = async () => {
    try {
      console.log('🔐 [FORCE-SIGNATURE] Starting force logout and clear...');
      
      // 1. Logout dari backend
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });

      // 2. Logout dari Dynamic Labs
      await handleLogOut();

      // 3. Clear semua storage
      localStorage.clear();
      sessionStorage.clear();

      // 4. Clear MetaMask connection state jika ada
      if (window.ethereum) {
        try {
          // Disconnect from MetaMask
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch (error) {
          console.log('🔐 [FORCE-SIGNATURE] MetaMask disconnect:', error);
        }
      }

      console.log('🔐 [FORCE-SIGNATURE] Force logout and clear completed');
      
      // Reload page untuk memastikan clean state
      window.location.reload();
    } catch (error) {
      console.error('🔐 [FORCE-SIGNATURE] Error in force logout:', error);
    }
  };

  // Function untuk memaksa signature verification pada login berikutnya
  const forceSignatureOnNextLogin = () => {
    try {
      // Clear Dynamic session data
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

      // Set flag untuk force signature
      localStorage.setItem('force-signature-verification', 'true');
      
      console.log('🔐 [FORCE-SIGNATURE] Next login will require signature verification');
    } catch (error) {
      console.error('🔐 [FORCE-SIGNATURE] Error setting force signature flag:', error);
    }
  };

  return {
    forceLogoutAndClear,
    forceSignatureOnNextLogin
  };
}