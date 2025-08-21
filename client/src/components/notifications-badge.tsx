import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: number;
  type: string;
  status: string;
  amount: number;
  token: string | null;
  message: string;
  isRead: boolean;
  relatedId: number | null;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  walletAddress: string;
  balance: number;
}

const getStatusColor = (type: string, status: string) => {
  if (type === "deposit") {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "processing":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
    }
  } else if (type === "withdrawal") {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "processing":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
    }
  } else if (type === "purchase") {
    switch (status) {
      case "completed":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300";
      case "failed":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
    }
  }
  return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "deposit":
      return "💰";
    case "withdrawal":
      return "💸";
    case "purchase":
      return "🛍️";
    default:
      return "📢";
  }
};

export default function NotificationsBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Get user data first
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
    throwOnError: false,
  });

  const { data: notifications = [], isLoading, isError } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user, // Only fetch notifications if user is logged in
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401') || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true,
  });

  // Debug logging
  useEffect(() => {
    if (user && notifications && (notifications as Notification[]).length > 0) {
      console.log('🔔 [REAL-NOTIFICATIONS] Current user:', user.username, 'ID:', user.id);
      console.log('🔔 [REAL-NOTIFICATIONS] Live notifications count:', (notifications as Notification[]).length);
      console.log('🔔 [REAL-NOTIFICATIONS] Data source: Real API /api/notifications (NO MOCK DATA)');
      console.log('📋 [REAL-NOTIFICATIONS] Latest notification:', (notifications as Notification[])[0]);
      console.log('📊 [REAL-NOTIFICATIONS] Full notifications array:', notifications);
    }
  }, [user, notifications, isLoading, isError]);

  const markAsReadMutation = useMutation({
    mutationFn: () => apiRequest('/api/notifications/mark-read', {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const unreadCount = (notifications as Notification[]).filter((n: Notification) => !n.isRead).length;

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Mark as read after a brief delay to allow user to see notifications
      setTimeout(() => {
        markAsReadMutation.mutate();
      }, 1000);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, token: string | null) => {
    if (token) {
      return `${amount.toLocaleString()} ${token}`;
    }
    return `${amount.toLocaleString()} NTIQ`;
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        
        <div 
          className="max-h-96 overflow-y-auto" 
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
        >
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : (notifications as Notification[]).length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-0">
              {(notifications as Notification[]).map((notification: Notification, index: number) => (
                <div key={notification.id}>
                  <div className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer ${
                    !notification.isRead 
                      ? 'bg-blue-50/80 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                      : 'border-l-4 border-transparent'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="text-xl flex-shrink-0 mt-0.5 p-1 rounded-full bg-gray-100 dark:bg-gray-800">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            className={`text-xs px-2 py-1 ${getStatusColor(notification.type, notification.status)}`}
                            variant="secondary"
                          >
                            {notification.status.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md inline-block">
                          {formatAmount(notification.amount, notification.token)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  {index < (notifications as Notification[]).length - 1 && (
                    <Separator className="mx-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {(notifications as Notification[]).length > 0 && (
          <div className="border-t bg-gray-50 dark:bg-gray-900/50 p-3 sticky bottom-0">
            <div className="flex gap-2 justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {(notifications as Notification[]).length} notification{(notifications as Notification[]).length !== 1 ? 's' : ''}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs px-3 py-1.5"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}