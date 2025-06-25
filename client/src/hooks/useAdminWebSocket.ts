import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface TransactionUpdate {
  type: 'purchase' | 'withdrawal';
  user: {
    id: number;
    username: string;
    uid: string;
    walletAddress: string;
  };
  amount: number;
  paymentAmount?: string;
  paymentToken?: string;
  token?: string;
  tokenAmount?: string;
  status: string;
  timestamp: string;
}

interface WebSocketMessage {
  type: string;
  data?: TransactionUpdate;
  message?: string;
}

export function useAdminWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<TransactionUpdate | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Admin WebSocket connected');
        setIsConnected(true);
        
        // Register as admin client
        wsRef.current?.send(JSON.stringify({
          type: 'admin_register'
        }));

        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'registered') {
            console.log('Admin client registered successfully');
          } else if (message.type === 'transaction_update' && message.data) {
            const transaction = message.data;
            setLastTransaction(transaction);
            
            // Show toast notification
            const transactionType = transaction.type === 'purchase' ? 'Buy NTIQ' : 'Withdrawal';
            const amount = transaction.type === 'purchase' 
              ? `${transaction.amount.toLocaleString()} NTIQ`
              : `${transaction.amount.toLocaleString()} NTIQ → ${transaction.tokenAmount} ${transaction.token}`;
            
            toast({
              title: `New ${transactionType}`,
              description: `${transaction.user.username}: ${amount}`,
              duration: 5000,
            });

            // Invalidate transaction queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/transaction-stats"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
          } else if (message.type === 'prediction_update' && message.data) {
            const prediction = message.data;
            
            // Show toast notification for new predictions
            toast({
              title: `New Prediction`,
              description: `${prediction.user.username}: ${prediction.prediction.cryptocurrency} - ${prediction.prediction.stakeAmount} NTIQ`,
              duration: 5000,
            });

            // Invalidate prediction queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["/api/admin/predictions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/activity"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
          } else if (message.type === 'user_deleted' && message.data) {
            const deletion = message.data;
            
            // Show toast notification for user deletion
            toast({
              title: `User Deleted`,
              description: `${deletion.adminUser.username} deleted user: ${deletion.deletedUser.username}`,
              duration: 5000,
              variant: 'destructive'
            });

            // Invalidate user queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('Admin WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Reconnect after 3 seconds if not a manual close
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Admin WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastTransaction,
    connect,
    disconnect
  };
}