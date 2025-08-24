import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Wallet, AlertTriangle, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface RainbowConnectButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function RainbowConnectButton({ 
  className = "", 
  variant = "default", 
  size = "default" 
}: RainbowConnectButtonProps) {
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Monitor wallet connection failures
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('WalletConnect') || event.message?.includes('projectId')) {
        setConnectionError('WalletConnect configuration issue detected');
        console.error('🚨 [WALLET] Connection error:', event.message);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                const handleConnect = () => {
                  try {
                    openConnectModal();
                  } catch (error: any) {
                    console.error('🚨 [WALLET] Failed to open connect modal:', error);
                    setConnectionError(error.message || 'Failed to open wallet connection');
                    toast({
                      title: "Connection Issue",
                      description: "Unable to open wallet connection. Please check your network and try again.",
                      variant: "destructive",
                    });
                  }
                };
                
                return (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleConnect}
                      variant={connectionError ? "destructive" : variant}
                      size={size}
                      className={className}
                    >
                      {connectionError ? (
                        <AlertTriangle className="mr-2 h-4 w-4" />
                      ) : (
                        <Wallet className="mr-2 h-4 w-4" />
                      )}
                      {connectionError ? "Connection Issue" : "Connect Wallet"}
                    </Button>
                    
                    {connectionError && (
                      <div className="text-xs text-muted-foreground text-center max-w-xs">
                        {connectionError}. Check console for details.
                      </div>
                    )}
                  </div>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    size={size}
                    className={className}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex gap-2">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="sm"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    variant="default"
                    size={size}
                    className={className}
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}