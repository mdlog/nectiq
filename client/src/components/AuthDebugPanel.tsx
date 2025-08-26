import React from 'react';
import { useAccount } from 'wagmi';
import { useRainbowAuth } from '@/hooks/useRainbowAuth';
import { useQuery } from '@tanstack/react-query';

export function AuthDebugPanel() {
  const { address, isConnected } = useAccount();
  const { user, isLoading } = useRainbowAuth();
  
  // Direct API test
  const { data: directApiTest, error: directApiError } = useQuery({
    queryKey: ["/api/user", "direct"],
    queryFn: async () => {
      const response = await fetch('/api/user', { credentials: 'include' });
      console.log('🧪 [DEBUG] Direct API test response:', response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: true,
    refetchInterval: 3000
  });

  const testAuth = async () => {
    if (!address) return;
    
    console.log('🧪 [DEBUG] Testing authentication manually...');
    
    try {
      const response = await fetch('/api/auth/wallet-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress: address }),
      });
      
      console.log('🧪 [DEBUG] Auth test response:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🧪 [DEBUG] Auth success:', result);
        
        // Test user API after auth
        const userResponse = await fetch('/api/user', { credentials: 'include' });
        console.log('🧪 [DEBUG] User API after auth:', userResponse.status);
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('🧪 [DEBUG] User data after auth:', userData);
        }
      } else {
        const error = await response.text();
        console.error('🧪 [DEBUG] Auth error:', error);
      }
    } catch (error) {
      console.error('🧪 [DEBUG] Auth test failed:', error);
    }
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug Panel</h3>
      <div className="space-y-1">
        <div>Wallet: {isConnected ? '✅' : '❌'}</div>
        <div>Address: {address ? `${address.slice(0, 8)}...` : '❌'}</div>
        <div>User: {user ? '✅' : '❌'}</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>Direct API: {directApiTest ? '✅' : directApiError ? '❌' : '⏳'}</div>
        {directApiError && (
          <div className="text-red-400">API Error: {directApiError.message}</div>
        )}
        <button
          onClick={testAuth}
          className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
          disabled={!address}
        >
          Test Auth
        </button>
      </div>
    </div>
  );
}