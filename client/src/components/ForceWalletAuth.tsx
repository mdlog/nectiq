import { useAccount } from 'wagmi';
import { useRainbowAuth } from '@/hooks/useRainbowAuth';
import { Button } from './ui/button';

export function ForceWalletAuth() {
  const { address, isConnected } = useAccount();
  const { user, isLoading } = useRainbowAuth();
  
  const forceAuth = async () => {
    if (!address) return;
    
    console.log('🔧 [FORCE-AUTH] Triggering manual authentication...');
    
    try {
      const response = await fetch('/api/auth/wallet-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          walletAddress: address
        }),
      });

      console.log('🔧 [FORCE-AUTH] Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔧 [FORCE-AUTH] Success:', result);
        // Force page refresh to reload user data
        window.location.reload();
      } else {
        const error = await response.text();
        console.error('🔧 [FORCE-AUTH] Error:', error);
      }
    } catch (error) {
      console.error('🔧 [FORCE-AUTH] Network error:', error);
    }
  };

  if (!isConnected || user) return null;

  return (
    <div className="fixed top-16 right-4 bg-red-600 text-white p-3 rounded-lg text-sm">
      <div className="font-bold mb-2">Wallet Auth Issue</div>
      <div className="text-xs mb-2">Connected but not authenticated</div>
      <Button
        onClick={forceAuth}
        size="sm"
        variant="outline"
        className="text-black"
      >
        Force Auth
      </Button>
    </div>
  );
}