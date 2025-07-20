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
      console.log('🔐 [FORCE-SIGNATURE] Starting complete wallet disconnect...');
      
      // 1. Disconnect dari semua wallet providers terlebih dahulu
      if (window.ethereum) {
        try {
          // Revoke permissions dari MetaMask
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          });
          console.log('🔐 [FORCE-SIGNATURE] MetaMask permissions revoked');
        } catch (error) {
          console.log('🔐 [FORCE-SIGNATURE] MetaMask revoke method not available, trying alternative...');
          
          // Alternative: Request new permissions to reset connection
          try {
            await window.ethereum.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }],
            });
          } catch (altError) {
            console.log('🔐 [FORCE-SIGNATURE] MetaMask alternative disconnect:', altError);
          }
        }
      }

      // 2. Logout dari Dynamic Labs terlebih dahulu
      await handleLogOut();

      // 3. Logout dari backend
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });

      // 4. Clear semua storage data
      localStorage.clear();
      sessionStorage.clear();

      // 5. Clear browser cookies jika memungkinkan
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      console.log('🔐 [FORCE-SIGNATURE] Complete wallet disconnect completed');
      
      // 6. Reload page untuk memastikan clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error) {
      console.error('🔐 [FORCE-SIGNATURE] Error in force logout:', error);
      // Fallback: tetap reload page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
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