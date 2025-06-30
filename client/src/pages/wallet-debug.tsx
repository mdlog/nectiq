import { useState, useEffect } from 'react';
import { detectMetaMask, checkWalletReady, requestWalletConnection, checkLocalhostCompatibility } from '@/utils/walletDetection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WalletDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const compatibility = checkLocalhostCompatibility();
    setDebugInfo(prev => ({ ...prev, compatibility }));
  }, []);

  const handleDetectMetaMask = () => {
    const isDetected = detectMetaMask();
    setDebugInfo(prev => ({ ...prev, metaMaskDetected: isDetected }));
  };

  const handleCheckWalletReady = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const walletStatus = await checkWalletReady();
      setDebugInfo(prev => ({ ...prev, walletStatus }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const accounts = await requestWalletConnection();
      setDebugInfo(prev => ({ ...prev, connectedAccounts: accounts }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestDynamicModal = () => {
    // Test if Dynamic Labs modal can be triggered
    const dynamicButton = document.querySelector('[data-testid="dynamic-connect-button"]');
    if (dynamicButton) {
      (dynamicButton as HTMLButtonElement).click();
    } else {
      setError('Dynamic Labs button not found');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Wallet Connection Debug</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Environment Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleDetectMetaMask} className="w-full">
                  Detect MetaMask
                </Button>
                
                <Button 
                  onClick={handleCheckWalletReady} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Checking...' : 'Check Wallet Status'}
                </Button>
                
                <Button 
                  onClick={handleRequestConnection} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Connecting...' : 'Request Connection'}
                </Button>
                
                <Button onClick={handleTestDynamicModal} className="w-full">
                  Test Dynamic Modal
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Compatibility Check:</h3>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(debugInfo.compatibility, null, 2)}
                  </pre>
                </div>
                
                {debugInfo.metaMaskDetected !== undefined && (
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">MetaMask Detection:</h3>
                    <p className={debugInfo.metaMaskDetected ? 'text-green-600' : 'text-red-600'}>
                      {debugInfo.metaMaskDetected ? 'MetaMask Detected' : 'MetaMask Not Found'}
                    </p>
                  </div>
                )}
                
                {debugInfo.walletStatus && (
                  <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Wallet Status:</h3>
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(debugInfo.walletStatus, null, 2)}
                    </pre>
                  </div>
                )}
                
                {debugInfo.connectedAccounts && (
                  <div className="bg-purple-100 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Connected Accounts:</h3>
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(debugInfo.connectedAccounts, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Browser Console Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Buka Developer Console (F12) dan jalankan perintah berikut:</p>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">1. Check MetaMask:</h4>
                <code className="text-sm">
                  console.log('MetaMask:', window.ethereum?.isMetaMask)
                </code>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">2. Check Ethereum Provider:</h4>
                <code className="text-sm">
                  console.log('Ethereum:', window.ethereum)
                </code>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">3. Manual Connection:</h4>
                <code className="text-sm">
                  window.ethereum?.request({'{'}method: 'eth_requestAccounts'{'}'})
                </code>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">4. Check Dynamic Labs:</h4>
                <code className="text-sm">
                  console.log('Dynamic:', window.dynamic)
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}