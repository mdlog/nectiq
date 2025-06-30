import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetTime?: string;
  timeLeft?: number;
  className?: string;
  format?: 'default' | 'compact';
}

export function CountdownTimer({ targetTime, timeLeft: initialTimeLeft, className = "", format = 'default' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (targetTime) {
      // Use targetTime mode (original functionality)
      const calculateTimeLeft = () => {
        const target = new Date(targetTime).getTime();
        const now = Date.now();
        const difference = Math.max(0, Math.floor((target - now) / 1000));
        return difference;
      };

      // Calculate initial time
      setTimeLeft(calculateTimeLeft());

      // Update every second
      const interval = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
        
        // Stop timer when it reaches 0
        if (newTimeLeft <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else if (initialTimeLeft !== undefined) {
      // Use timeLeft mode (for Active Predictions)
      const initialSeconds = Math.max(0, Math.floor(initialTimeLeft / 1000));
      setTimeLeft(initialSeconds);

      // Update every second
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime <= 0) {
            clearInterval(interval);
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [targetTime, initialTimeLeft]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return format === 'compact' ? 'Expired' : 'Ended';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (format === 'compact') {
      if (hours > 0) {
        return `${hours}h ${minutes}m left`;
      }
      return `${minutes}m ${secs}s left`;
    }
    
    // Default format
    if (hours > 0) {
      return `${hours}h • ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m • ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <span className={className}>
      {formatTime(timeLeft)}
    </span>
  );
}