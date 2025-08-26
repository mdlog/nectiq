import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function WalletDebug() {
  const { address, isConnected, status, chain, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  console.log('🔍 [WALLET-DEBUG] Current state:', {
    address,
    isConnected,
    status,
    chain: chain?.name,
    isConnecting,
    availableConnectors: connectors?.map(c => c.name) || []
  });

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Wallet Debug</h3>
      <div>Status: {status}</div>
      <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
      <div>Address: {address?.slice(0, 6)}...{address?.slice(-4) || 'None'}</div>
      <div>Chain: {chain?.name || 'None'}</div>
      <div>Connecting: {isConnecting ? 'Yes' : 'No'}</div>
      
      <div className="mt-3">
        <div className="font-semibold mb-1">Available Connectors:</div>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            className="block w-full text-left p-1 hover:bg-gray-700 rounded text-xs"
            disabled={isConnecting}
          >
            {connector.name} {connector.ready ? '✅' : '❌'}
          </button>
        ))}
      </div>
      
      {isConnected && (
        <button
          onClick={() => disconnect()}
          className="mt-2 w-full bg-red-600 hover:bg-red-700 p-1 rounded text-xs"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}