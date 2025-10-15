import { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
  targetTime?: string;
  timeLeft?: number;
  predictionId?: number; // Add unique identifier for predictions
  className?: string;
  format?: 'default' | 'compact';
}

// Global storage for countdown states across navigation
const countdownStates = new Map<string, { startTime: number; duration: number }>();

export function CountdownTimer({ targetTime, timeLeft: initialTimeLeft, predictionId, className = "", format = 'default' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (targetTime) {
      // Use targetTime mode (original functionality for Battles)
      const calculateTimeLeft = () => {
        // Handle timezone consistently - add 'Z' if not present to ensure UTC parsing
        const targetTimeStr = targetTime.includes('Z') ? targetTime : targetTime + 'Z';
        const target = new Date(targetTimeStr).getTime();
        const now = Date.now();
        const difference = Math.max(0, Math.floor((target - now) / 1000));
        return difference;
      };

      // Calculate initial time
      setTimeLeft(calculateTimeLeft());

      // Update every second
      intervalRef.current = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);

        // Stop timer when it reaches 0
        if (newTimeLeft <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 1000);

    } else if (initialTimeLeft !== undefined && predictionId !== undefined) {
      // Enhanced mode for Active Predictions with persistent state
      const countdownKey = `prediction_${predictionId}`;
      const now = Date.now();

      // Check if we have existing state for this prediction
      let startTime: number;
      let duration: number;

      const existingState = countdownStates.get(countdownKey);
      if (existingState) {
        // Use existing state to calculate current time left
        startTime = existingState.startTime;
        duration = existingState.duration;

        // Calculate actual time left based on elapsed time
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const currentTimeLeft = Math.max(0, duration - elapsedSeconds);
        setTimeLeft(currentTimeLeft);

        console.log(`⏰ [COUNTDOWN-RESTORE] Prediction ${predictionId}: ${currentTimeLeft}s left (elapsed: ${elapsedSeconds}s from ${duration}s)`);
      } else {
        // First time - initialize state
        duration = Math.max(0, Math.floor(Number(initialTimeLeft)));
        startTime = now;
        countdownStates.set(countdownKey, { startTime, duration });
        setTimeLeft(duration);

        console.log(`🆕 [COUNTDOWN-INIT] Prediction ${predictionId}: Starting ${duration}s countdown`);
      }

      // Update every second with persistent calculation
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const newTimeLeft = Math.max(0, duration - elapsedSeconds);

        setTimeLeft(newTimeLeft);

        // Stop timer when it reaches 0 and clean up state
        if (newTimeLeft <= 0) {
          countdownStates.delete(countdownKey);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          console.log(`⏰ [COUNTDOWN-EXPIRED] Prediction ${predictionId}: Timer expired`);
        }
      }, 1000);

    } else if (initialTimeLeft !== undefined) {
      // Fallback mode for components without predictionId
      const startingSeconds = Math.max(0, Math.floor(Number(initialTimeLeft)));
      setTimeLeft(startingSeconds);

      // Update every second with live countdown
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
          return newTime;
        });
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetTime, initialTimeLeft, predictionId]);

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