import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'deposit_completed' | 'withdrawal_completed' | 'user_notification';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  priority?: 'low' | 'medium' | 'high';
  read?: boolean;
}

export function NotificationsBadge() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const { toast } = useToast();

  // Initialize WebSocket connection and handle notifications
  const { isConnected, sendMessage } = useWebSocket({
    onNotification: (notification) => {
      console.log('🔔 [NOTIFICATIONS] Received notification:', notification);
      
      // Create notification with unique ID
      const newNotification: Notification = {
        id: `${notification.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...notification,
        read: false
      };
      
      // Add to notifications list
      setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      showToastNotification(newNotification);
    },
    onConnected: () => {
      console.log('🔗 [NOTIFICATIONS] WebSocket connected');
      setConnectionStatus('connected');
    },
    onDisconnected: () => {
      console.log('🔌 [NOTIFICATIONS] WebSocket disconnected');
      setConnectionStatus('disconnected');
    },
    onError: (error) => {
      console.error('❌ [NOTIFICATIONS] WebSocket error:', error);
      setConnectionStatus('disconnected');
    }
  });

  const showToastNotification = (notification: Notification) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'deposit_completed':
          return '💰';
        case 'withdrawal_completed':
          return '📤';
        default:
          return '🔔';
      }
    };

    const variant = notification.priority === 'high' ? 'default' : 'default';
    
    toast({
      title: `${getIcon()} ${notification.title}`,
      description: notification.message,
      variant,
      duration: notification.priority === 'high' ? 8000 : 5000,
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deposit_completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'withdrawal_completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  // Update connection status based on WebSocket state
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected]);

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          connectionStatus === 'connected' 
            ? "text-gray-700 dark:text-gray-300" 
            : "text-gray-400 dark:text-gray-600"
        )}
        title={
          connectionStatus === 'connected' 
            ? "Real-time notifications active" 
            : "Connecting to notifications..."
        }
      >
        <Bell className="w-6 h-6" />
        
        {/* Connection Status Indicator */}
        <div className={cn(
          "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900",
          connectionStatus === 'connected' ? "bg-green-500" : "bg-red-500"
        )} />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded",
                  connectionStatus === 'connected' 
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    connectionStatus === 'connected' ? "bg-green-500" : "bg-red-500"
                  )} />
                  {connectionStatus === 'connected' ? 'Live' : 'Offline'}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm mt-1">
                  You'll receive real-time updates here when deposits and withdrawals complete.
                </p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0",
                      !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            !notification.read 
                              ? "text-gray-900 dark:text-white" 
                              : "text-gray-600 dark:text-gray-300"
                          )}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Clear All Button */}
                {notifications.length > 0 && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={clearAllNotifications}
                      className="w-full text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}