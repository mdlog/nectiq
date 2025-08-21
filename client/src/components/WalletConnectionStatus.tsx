import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, WifiOff, Wifi } from 'lucide-react';
import { useWalletConnectionStatus } from '@/hooks/useWalletConnectionStatus';
import { useAccount } from 'wagmi';

interface WalletConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function WalletConnectionStatus({ 
  className = "", 
  showDetails = false 
}: WalletConnectionStatusProps) {
  const { isConnected, address } = useAccount();
  const {
    connectionQuality,
    connectionHistory,
    getRecentDisconnects,
    hasRecentConnection
  } = useWalletConnectionStatus();

  // Don't show anything if wallet is not connected
  if (!isConnected || !address) {
    return null;
  }

  const recentDisconnects = getRecentDisconnects();
  const isRecentConnection = hasRecentConnection();

  const getStatusIcon = () => {
    if (!connectionQuality.isStable) {
      return <WifiOff className="h-4 w-4 text-orange-500" />;
    }
    if (isRecentConnection) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Wifi className="h-4 w-4 text-blue-500" />;
  };

  const getStatusText = () => {
    if (!connectionQuality.isStable) {
      return "Connection Unstable";
    }
    if (isRecentConnection) {
      return "Recently Connected";
    }
    return "Connected";
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!connectionQuality.isStable) {
      return "destructive";
    }
    if (isRecentConnection) {
      return "default";
    }
    return "secondary";
  };

  if (!showDetails) {
    // Simple badge view
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <Badge variant={getStatusVariant()}>
          {getStatusText()}
        </Badge>
      </div>
    );
  }

  // Detailed card view
  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>
            <Badge variant={getStatusVariant()}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </Badge>
          </div>

          {/* Connection Quality Info */}
          {!connectionQuality.isStable && (
            <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div className="text-sm text-orange-700 dark:text-orange-300">
                <div className="font-medium">Connection Issues Detected</div>
                <div className="text-xs">
                  {connectionQuality.disconnectCount} disconnections detected. 
                  Please check your wallet extension.
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {(recentDisconnects.length > 0 || isRecentConnection) && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Recent Activity
              </div>
              
              {isRecentConnection && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  ✓ Connected successfully
                </div>
              )}
              
              {recentDisconnects.slice(0, 3).map((event, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                  ⚠ Disconnected {Math.round((Date.now() - event.timestamp) / 60000)}m ago
                </div>
              ))}
            </div>
          )}

          {/* Stability Tips */}
          {!connectionQuality.isStable && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">Tips for stable connection:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Keep wallet extension updated</li>
                  <li>• Avoid switching browser tabs frequently</li>
                  <li>• Check internet connection stability</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default WalletConnectionStatus;