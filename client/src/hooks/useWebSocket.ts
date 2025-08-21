import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface NotificationData {
  type: 'deposit_completed' | 'withdrawal_completed' | 'user_notification';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  priority?: 'low' | 'medium' | 'high';
}

interface WebSocketMessage {
  type: string;
  data?: NotificationData;
  userId?: number;
  message?: string;
  timestamp?: number;
}

interface UseWebSocketOptions {
  onNotification?: (notification: NotificationData) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    refetchInterval: 10000,
    staleTime: 5000,
  });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (!user?.id) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('📱 [WEBSOCKET] Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ [WEBSOCKET] Connected successfully');
        
        // Reset reconnect attempts on successful connection
        reconnectAttempts.current = 0;
        
        // Register user for notifications
        if (user.id) {
          const registrationMessage = {
            type: 'user_register',
            userId: user.id
          };
          
          ws.send(JSON.stringify(registrationMessage));
          console.log('📱 [WEBSOCKET] Registered for notifications, user ID:', user.id);
        }
        
        options.onConnected?.();
        
        // Send periodic ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000); // Ping every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 [WEBSOCKET] Received message:', message);
          
          switch (message.type) {
            case 'user_registered':
              console.log('📱 [WEBSOCKET] Successfully registered for notifications');
              break;
              
            case 'notification':
              if (message.data) {
                console.log('🔔 [WEBSOCKET] Received notification:', message.data);
                options.onNotification?.(message.data);
              }
              break;
              
            case 'pong':
              console.log('🏓 [WEBSOCKET] Ping response received');
              break;
              
            default:
              console.log('📨 [WEBSOCKET] Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('❌ [WEBSOCKET] Error parsing message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 [WEBSOCKET] Connection closed:', event.code, event.reason);
        wsRef.current = null;
        options.onDisconnected?.();
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
          console.log(`🔄 [WEBSOCKET] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('❌ [WEBSOCKET] Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [WEBSOCKET] Connection error:', error);
        options.onError?.(error);
      };

    } catch (error) {
      console.error('❌ [WEBSOCKET] Failed to create WebSocket connection:', error);
    }
  }, [user?.id, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Client disconnect');
    }
    
    wsRef.current = null;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    disconnect,
    reconnect: connect
  };
}