import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

interface ConnectionEvent {
  type: 'connected' | 'disconnected' | 'reconnected' | 'error';
  timestamp: number;
  address?: string;
  previousAddress?: string;
  reason?: string;
}

export function useWalletConnectionStatus() {
  const { isConnected, address, isConnecting, isReconnecting } = useAccount();
  const { toast } = useToast();
  
  // Refs to track previous state
  const previouslyConnected = useRef<boolean>(false);
  const previousAddress = useRef<string | undefined>(undefined);
  const connectionHistory = useRef<ConnectionEvent[]>([]);
  const toastTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // State for connection quality tracking
  const [connectionQuality, setConnectionQuality] = useState<{
    isStable: boolean;
    disconnectCount: number;
    lastDisconnect?: number;
  }>({
    isStable: true,
    disconnectCount: 0
  });

  // Add connection event to history
  const addConnectionEvent = (event: ConnectionEvent) => {
    connectionHistory.current.push(event);
    // Keep only last 10 events
    if (connectionHistory.current.length > 10) {
      connectionHistory.current.shift();
    }
  };

  // Clear existing toast timeout
  const clearToastTimeout = (key: string) => {
    const timeout = toastTimeouts.current.get(key);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeouts.current.delete(key);
    }
  };

  // Show connection notification with auto-dismiss
  const showConnectionNotification = (
    title: string, 
    description: string, 
    variant: 'default' | 'destructive' = 'default',
    autoHideDuration = 4000
  ) => {
    const toastKey = `${title}-${Date.now()}`;
    
    toast({
      title,
      description,
      variant,
      duration: autoHideDuration
    });

    // Auto-hide toast after duration
    const timeout = setTimeout(() => {
      toastTimeouts.current.delete(toastKey);
    }, autoHideDuration);
    
    toastTimeouts.current.set(toastKey, timeout);
  };

  // Check if this is a frequent disconnection pattern
  const isFrequentDisconnection = () => {
    const recentEvents = connectionHistory.current
      .filter(event => event.type === 'disconnected')
      .filter(event => Date.now() - event.timestamp < 60000); // Last minute
    
    return recentEvents.length >= 3;
  };

  // Handle wallet connection changes
  useEffect(() => {
    const now = Date.now();
    
    // First connection
    if (isConnected && !previouslyConnected.current && address) {
      console.log('🔗 [WALLET-STATUS] First connection detected:', address);
      
      addConnectionEvent({
        type: 'connected',
        timestamp: now,
        address
      });
      
      showConnectionNotification(
        "Wallet Connected",
        `Successfully connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        'default',
        3000
      );
      
      previouslyConnected.current = true;
      previousAddress.current = address;
      
      setConnectionQuality(prev => ({
        ...prev,
        isStable: true
      }));
      
      return;
    }

    // Disconnection detected
    if (!isConnected && previouslyConnected.current) {
      console.log('🔌 [WALLET-STATUS] Disconnection detected from:', previousAddress.current);
      
      addConnectionEvent({
        type: 'disconnected',
        timestamp: now,
        previousAddress: previousAddress.current,
        reason: 'user_initiated'
      });
      
      const isFrequent = isFrequentDisconnection();
      
      // Different messages based on disconnection frequency
      if (isFrequent) {
        showConnectionNotification(
          "Wallet Connection Unstable",
          "Multiple disconnections detected. Please check your wallet extension.",
          'destructive',
          6000
        );
        
        setConnectionQuality(prev => ({
          isStable: false,
          disconnectCount: prev.disconnectCount + 1,
          lastDisconnect: now
        }));
      } else {
        showConnectionNotification(
          "Wallet Disconnected",
          `Wallet ${previousAddress.current?.slice(0, 6)}...${previousAddress.current?.slice(-4)} has been disconnected`,
          'default',
          4000
        );
        
        setConnectionQuality(prev => ({
          ...prev,
          disconnectCount: prev.disconnectCount + 1,
          lastDisconnect: now
        }));
      }
      
      previouslyConnected.current = false;
      previousAddress.current = undefined;
      
      return;
    }

    // Reconnection detected
    if (isConnected && previouslyConnected.current && address && address !== previousAddress.current) {
      console.log('🔄 [WALLET-STATUS] Account change detected:', {
        from: previousAddress.current,
        to: address
      });
      
      addConnectionEvent({
        type: 'reconnected',
        timestamp: now,
        address,
        previousAddress: previousAddress.current
      });
      
      showConnectionNotification(
        "Wallet Account Changed",
        `Switched to ${address.slice(0, 6)}...${address.slice(-4)}`,
        'default',
        4000
      );
      
      previousAddress.current = address;
      
      return;
    }

    // Network reconnection after disconnection
    if (isConnected && !previouslyConnected.current && address && connectionHistory.current.length > 0) {
      const lastEvent = connectionHistory.current[connectionHistory.current.length - 1];
      if (lastEvent.type === 'disconnected' && now - lastEvent.timestamp < 30000) {
        console.log('🔄 [WALLET-STATUS] Quick reconnection detected:', address);
        
        addConnectionEvent({
          type: 'reconnected',
          timestamp: now,
          address
        });
        
        showConnectionNotification(
          "Wallet Reconnected",
          `Successfully reconnected to ${address.slice(0, 6)}...${address.slice(-4)}`,
          'default',
          3000
        );
        
        previouslyConnected.current = true;
        previousAddress.current = address;
        
        setConnectionQuality(prev => ({
          ...prev,
          isStable: true
        }));
        
        return;
      }
    }

  }, [isConnected, address, toast]);

  // Handle connection state changes (connecting/reconnecting)
  useEffect(() => {
    if (isConnecting) {
      console.log('🔄 [WALLET-STATUS] Connecting...');
      showConnectionNotification(
        "Connecting Wallet",
        "Please confirm connection in your wallet...",
        'default',
        2000
      );
    }
    
    if (isReconnecting) {
      console.log('🔄 [WALLET-STATUS] Reconnecting...');
      showConnectionNotification(
        "Reconnecting Wallet",
        "Attempting to restore connection...",
        'default',
        3000
      );
    }
  }, [isConnecting, isReconnecting, toast]);

  // Reset connection quality after stable period
  useEffect(() => {
    if (connectionQuality.lastDisconnect) {
      const resetTimer = setTimeout(() => {
        if (isConnected && Date.now() - connectionQuality.lastDisconnect! > 300000) { // 5 minutes
          setConnectionQuality(prev => ({
            isStable: true,
            disconnectCount: 0,
            lastDisconnect: undefined
          }));
        }
      }, 300000);
      
      return () => clearTimeout(resetTimer);
    }
  }, [connectionQuality.lastDisconnect, isConnected]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      toastTimeouts.current.forEach(timeout => clearTimeout(timeout));
      toastTimeouts.current.clear();
    };
  }, []);

  return {
    connectionQuality,
    connectionHistory: connectionHistory.current,
    showConnectionNotification,
    clearToastTimeout,
    
    // Helper methods
    getRecentDisconnects: () => {
      return connectionHistory.current
        .filter(event => event.type === 'disconnected')
        .filter(event => Date.now() - event.timestamp < 300000); // Last 5 minutes
    },
    
    hasRecentConnection: () => {
      const recentConnection = connectionHistory.current
        .filter(event => event.type === 'connected')
        .find(event => Date.now() - event.timestamp < 30000); // Last 30 seconds
      return !!recentConnection;
    }
  };
}