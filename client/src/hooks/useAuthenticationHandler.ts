import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

export function useAuthenticationHandler() {
  const { user, isAuthenticated } = useDynamicContext();
  const [, navigate] = useLocation();

  useEffect(() => {
    console.log('🔐 [HOOK] Auth state changed:', {
      isAuthenticated,
      hasUser: !!user,
      userId: user?.userId,
      walletAddress: user?.verifiedCredentials?.[0]?.address,
      email: user?.email
    });

    // Process authentication if user exists (don't rely on isAuthenticated flag)
    if (user && (user.verifiedCredentials?.length > 0 || user.email || user.userId)) {
      console.log('🔐 [HOOK] User authenticated, processing...');
      console.log('🔐 [HOOK] User object details:', JSON.stringify(user, null, 2));
      
      const walletAddress = user.verifiedCredentials?.[0]?.address;
      const email = user.email;
      const userId = user.userId;

      if (walletAddress || email || userId) {
        console.log('🔐 [HOOK] Sending authentication to backend...');
        
        fetch('/api/auth/dynamic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            walletAddress: walletAddress || null,
            address: walletAddress || null,
            email: email || null,
            userId: userId || null,
            user: user
          }),
        })
        .then(async (response) => {
          console.log('🔐 [HOOK] Backend response status:', response.status);
          
          if (response.ok) {
            const responseData = await response.json();
            console.log('🔐 [HOOK] Backend authentication successful:', responseData);
            
            // Invalidate queries to refresh authentication state
            console.log('🔐 [HOOK] Invalidating queries...');
            await queryClient.invalidateQueries();
            console.log('🔐 [HOOK] Queries invalidated');
            
            // No automatic redirect - let user stay on current page
            console.log('🔐 [HOOK] Authentication completed, staying on current page');
          } else {
            console.error('🔐 [HOOK] Backend authentication failed:', response.status);
          }
        })
        .catch((error) => {
          console.error('🔐 [HOOK] Authentication request failed:', error);
        });
      }
    }
  }, [isAuthenticated, user?.userId, user?.verifiedCredentials?.[0]?.address, navigate]);
}