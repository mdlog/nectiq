import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DepositCountdownTimerProps {
  expiresAt: string;
  status: string;
  onExpired?: () => void;
  className?: string;
}

export function DepositCountdownTimer({ 
  expiresAt, 
  status, 
  onExpired, 
  className = "" 
}: DepositCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (status !== 'pending') return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        if (onExpired) {
          onExpired();
        }
        return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, total: difference });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, status, onExpired]);

  // Don't show timer for non-pending deposits
  if (status !== 'pending') {
    return null;
  }

  // Show expired state
  if (isExpired || timeLeft.total <= 0) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <X className="h-4 w-4 text-red-500" />
        <div className="flex-1">
          <div className="text-red-700 dark:text-red-300 font-medium text-sm">
            Deposit Expired
          </div>
          <div className="text-red-600 dark:text-red-400 text-xs">
            This deposit request has been automatically cancelled
          </div>
        </div>
        <Badge variant="destructive" className="text-xs">
          CANCELLED
        </Badge>
      </div>
    );
  }

  // Show warning if less than 15 minutes left
  const isUrgent = timeLeft.total <= (15 * 60 * 1000); // 15 minutes in milliseconds
  const isCritical = timeLeft.total <= (5 * 60 * 1000); // 5 minutes in milliseconds

  const getUrgencyStyles = () => {
    if (isCritical) {
      return {
        container: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
        text: "text-red-700 dark:text-red-300",
        subtext: "text-red-600 dark:text-red-400",
        badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        icon: "text-red-500"
      };
    } else if (isUrgent) {
      return {
        container: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
        text: "text-orange-700 dark:text-orange-300",
        subtext: "text-orange-600 dark:text-orange-400",
        badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        icon: "text-orange-500"
      };
    } else {
      return {
        container: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
        subtext: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        icon: "text-blue-500"
      };
    }
  };

  const styles = getUrgencyStyles();

  const formatTime = (value: number) => String(value).padStart(2, '0');

  return (
    <div className={`flex items-center gap-3 p-3 border rounded-lg ${styles.container} ${className}`}>
      <div className="flex items-center gap-2">
        {isCritical ? (
          <AlertTriangle className={`h-4 w-4 ${styles.icon} animate-pulse`} />
        ) : (
          <Clock className={`h-4 w-4 ${styles.icon}`} />
        )}
      </div>
      
      <div className="flex-1">
        <div className={`font-medium text-sm ${styles.text}`}>
          {isCritical 
            ? 'Deposit expires in' 
            : isUrgent 
            ? 'Complete deposit soon' 
            : 'Complete deposit within'
          }
        </div>
        <div className={`text-xs ${styles.subtext}`}>
          {isCritical 
            ? 'Transfer tokens now to avoid cancellation' 
            : isUrgent
            ? 'Transfer tokens to avoid automatic cancellation'
            : 'Deposit will be cancelled if not completed in time'
          }
        </div>
      </div>

      <div className="flex items-center gap-1">
        {timeLeft.hours > 0 && (
          <>
            <div className={`px-2 py-1 rounded text-xs font-mono font-medium ${styles.badge}`}>
              {formatTime(timeLeft.hours)}h
            </div>
          </>
        )}
        <div className={`px-2 py-1 rounded text-xs font-mono font-medium ${styles.badge}`}>
          {formatTime(timeLeft.minutes)}m
        </div>
        <div className={`px-2 py-1 rounded text-xs font-mono font-medium ${styles.badge}`}>
          {formatTime(timeLeft.seconds)}s
        </div>
      </div>
    </div>
  );
}