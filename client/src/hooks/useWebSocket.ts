import { useEffect, useRef, useCallback, useState } from 'react';
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

// Global WebSocket singleton to prevent multiple connections
class WebSocketManager {
  private ws: WebSocket | null = null;
  private currentUserId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private callbacks = new Set<UseWebSocketOptions>();
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionStatusCallbacks = new Set<(isConnected: boolean) => void>();

  connect(userId: number) {
    // If already connected for the same user, don't create new connection
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentUserId === userId) {
      if (import.meta.env.DEV) {
        console.log(`📱 [WEBSOCKET-MANAGER] Already connected for user ${userId}`);
      }
      return Promise.resolve(this.ws);
    }

    // If connecting for different user, close existing connection
    if (this.currentUserId && this.currentUserId !== userId) {
      if (import.meta.env.DEV) {
        console.log(`📱 [WEBSOCKET-MANAGER] Switching user from ${this.currentUserId} to ${userId}`);
      }
      this.disconnect();
    }

    // If already connecting, wait for it to complete
    if (this.isConnecting) {
      if (import.meta.env.DEV) {
        console.log(`📱 [WEBSOCKET-MANAGER] Already connecting, waiting...`);
      }
      return this.waitForConnection();
    }

    this.currentUserId = userId;
    this.isConnecting = true;

    return this.createConnection();
  }

  private waitForConnection(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          resolve(this.ws);
        } else if (!this.isConnecting) {
          reject(new Error('Connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
    });
  }

  private createConnection(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        if (import.meta.env.DEV) {
          console.log(`📱 [WEBSOCKET-MANAGER] Creating connection to: ${wsUrl} for user ${this.currentUserId}`);
        }
        
        const ws = new WebSocket(wsUrl);
        this.ws = ws;

        ws.onopen = () => {
          if (import.meta.env.DEV) {
            console.log('✅ [WEBSOCKET-MANAGER] Connected successfully');
          }
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Register user for notifications
          if (this.currentUserId) {
            const registrationMessage = {
              type: 'user_register',
              userId: this.currentUserId
            };
            
            ws.send(JSON.stringify(registrationMessage));
            if (import.meta.env.DEV) {
              console.log(`📱 [WEBSOCKET-MANAGER] Registered for notifications, user ID: ${this.currentUserId}`);
            }
          }
          
          // Setup ping interval
          this.setupPingInterval();
          
          // Notify all callbacks
          this.callbacks.forEach(callback => callback.onConnected?.());
          
          // Notify connection status callbacks
          this.connectionStatusCallbacks.forEach(callback => callback(true));
          
          resolve(ws);
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            if (import.meta.env.DEV) {
              console.log('📨 [WEBSOCKET-MANAGER] Received message:', message);
            }
            
            switch (message.type) {
              case 'user_registered':
                if (import.meta.env.DEV) {
                  console.log('📱 [WEBSOCKET-MANAGER] Successfully registered for notifications');
                }
                break;
                
              case 'notification':
                if (message.data) {
                  if (import.meta.env.DEV) {
                    console.log('🔔 [WEBSOCKET-MANAGER] Received notification:', message.data);
                  }
                  // Broadcast to all callbacks
                  this.callbacks.forEach(callback => callback.onNotification?.(message.data!));
                }
                break;
                
              case 'pong':
                if (import.meta.env.DEV) {
                  console.log('🏓 [WEBSOCKET-MANAGER] Ping response received');
                }
                break;
                
              default:
                if (import.meta.env.DEV) {
                  console.log('📨 [WEBSOCKET-MANAGER] Unknown message type:', message.type);
                }
            }
          } catch (error) {
            console.error('❌ [WEBSOCKET-MANAGER] Error parsing message:', error);
          }
        };

        ws.onclose = (event) => {
          if (import.meta.env.DEV) {
            console.log('🔌 [WEBSOCKET-MANAGER] Connection closed:', event.code, event.reason);
          }
          this.ws = null;
          this.isConnecting = false;
          this.clearPingInterval();
          
          // Notify all callbacks
          this.callbacks.forEach(callback => callback.onDisconnected?.());
          
          // Notify connection status callbacks
          this.connectionStatusCallbacks.forEach(callback => callback(false));
          
          // Attempt to reconnect if not manually closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts && this.currentUserId) {
            this.scheduleReconnect();
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (import.meta.env.DEV) {
              console.error('❌ [WEBSOCKET-MANAGER] Max reconnection attempts reached');
            }
          }
        };

        ws.onerror = (error) => {
          console.error('❌ [WEBSOCKET-MANAGER] Connection error:', error);
          this.isConnecting = false;
          this.callbacks.forEach(callback => callback.onError?.(error));
          reject(error);
        };

      } catch (error) {
        console.error('❌ [WEBSOCKET-MANAGER] Failed to create WebSocket connection:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect() {
    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`🔄 [WEBSOCKET-MANAGER] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      if (this.currentUserId) {
        this.connect(this.currentUserId);
      }
    }, delay);
  }

  private setupPingInterval() {
    this.clearPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        this.clearPingInterval();
      }
    }, 30000); // Ping every 30 seconds
  }

  private clearPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.clearPingInterval();
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client disconnect');
    }
    
    this.ws = null;
    this.currentUserId = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  addCallback(callback: UseWebSocketOptions) {
    this.callbacks.add(callback);
  }

  removeCallback(callback: UseWebSocketOptions) {
    this.callbacks.delete(callback);
  }

  onConnectionStatusChange(callback: (isConnected: boolean) => void) {
    this.connectionStatusCallbacks.add(callback);
    // Immediately call with current status
    callback(this.isConnected);
    
    // Return unsubscribe function
    return () => {
      this.connectionStatusCallbacks.delete(callback);
    };
  }

  sendMessage(message: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN || false;
  }
}

// Global singleton instance
const wsManager = new WebSocketManager();

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: user } = useQuery<{ id: number }>({
    queryKey: ["/api/user"],
    refetchInterval: 10000,
    staleTime: 5000,
  });
  const callbackRef = useRef<UseWebSocketOptions>(options);
  const isRegistered = useRef(false);

  // Update callback ref when options change
  useEffect(() => {
    callbackRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!user?.id || isRegistered.current) return;

    // Register this component's callbacks with the manager
    wsManager.addCallback(callbackRef.current);
    isRegistered.current = true;

    // Connect using the global manager
    wsManager.connect(user.id).catch(error => {
      console.error('❌ [WEBSOCKET] Connection failed:', error);
    });

    return () => {
      // Unregister callbacks when component unmounts
      if (isRegistered.current) {
        wsManager.removeCallback(callbackRef.current);
        isRegistered.current = false;
      }
    };
  }, [user?.id]);

  const sendMessage = useCallback((message: any) => {
    return wsManager.sendMessage(message);
  }, []);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    if (user?.id) {
      wsManager.connect(user.id);
    }
  }, [user?.id]);

  const [isConnected, setIsConnected] = useState(false);

  // Update connection status reactively
  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = wsManager.onConnectionStatusChange((connected) => {
      setIsConnected(connected);
      if (import.meta.env.DEV) {
        console.log('📊 [WEBSOCKET-HOOK] Connection status updated:', connected);
      }
    });
    
    return unsubscribe;
  }, []);

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect
  };
}