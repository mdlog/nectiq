import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export default function DynamicWalletButton() {
  const { isConnected, address, isLoading, loginWithWallet, disconnectWallet } = useDynamicWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <Button 
          onClick={loginWithWallet}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Connecting...' : 'Login'}
        </Button>
        <Button 
          onClick={disconnectWallet}
          variant="outline"
          size="sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DynamicWidget 
        buttonClassName="dynamic-connect-button"
        innerButtonComponent={
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        }
      />
    </div>
  );
}