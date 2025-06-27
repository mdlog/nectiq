import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetTime: string;
  className?: string;
}

export function CountdownTimer({ targetTime, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
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
  }, [targetTime]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
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