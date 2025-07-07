import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface PredictionTimingIndicatorProps {
  tournamentId: number;
}

export function PredictionTimingIndicator({ tournamentId }: PredictionTimingIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const { data: deadlineInfo, isLoading } = useQuery({
    queryKey: [`/api/survival-tournaments/${tournamentId}/prediction-deadline`],
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 0
  });

  if (isLoading || !deadlineInfo) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Loading timing info...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeElapsed = currentTime - deadlineInfo.roundStartTime;
  const timePercentage = timeElapsed / deadlineInfo.roundDuration;
  const deadlineCountdown = deadlineInfo.predictionDeadline - currentTime;
  const roundTimeRemaining = deadlineInfo.roundEndTime - currentTime;
  
  // Format countdown
  const formatTime = (ms: number): string => {
    if (ms <= 0) return 'Expired';
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Determine timing status and styling
  const getTimingStatus = () => {
    if (deadlineCountdown <= 0) {
      return {
        status: 'Deadline Passed',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: AlertTriangle,
        multiplier: '0x',
        description: 'Predictions are no longer accepted'
      };
    }
    
    if (timePercentage <= 0.25) {
      return {
        status: 'Early Bird Bonus',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: CheckCircle,
        multiplier: '1.3x',
        description: 'Perfect timing! +30% multiplier'
      };
    } else if (timePercentage <= 0.5) {
      return {
        status: 'Good Timing',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: TrendingUp,
        multiplier: '1.1x',
        description: 'Good timing! +10% multiplier'
      };
    } else if (timePercentage <= 0.75) {
      return {
        status: 'Late Penalty',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: TrendingDown,
        multiplier: '0.8x',
        description: 'Late submission: -20% penalty'
      };
    } else {
      return {
        status: 'Deadline Approaching',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: AlertTriangle,
        multiplier: '0x',
        description: 'Deadline very close!'
      };
    }
  };

  const timingStatus = getTimingStatus();
  const StatusIcon = timingStatus.icon;

  return (
    <Card className={`border-2 ${timingStatus.color}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              <span className="font-semibold">{timingStatus.status}</span>
              <span className="text-sm font-mono px-2 py-1 rounded bg-white border">
                {timingStatus.multiplier}
              </span>
            </div>
            <div className="text-sm font-medium">
              Round {deadlineInfo.roundNumber}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm opacity-90">
            {timingStatus.description}
          </p>
          
          {/* Timing information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1">Prediction Deadline</div>
              <div className="font-mono">
                {deadlineCountdown > 0 ? formatTime(deadlineCountdown) : 'Expired'}
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Round Ends In</div>
              <div className="font-mono">
                {roundTimeRemaining > 0 ? formatTime(roundTimeRemaining) : 'Ended'}
              </div>
            </div>
          </div>
          
          {/* Progress bar showing deadline */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs opacity-75">
              <span>Round Start</span>
              <span>75% Deadline</span>
              <span>Round End</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              {/* Progress fill */}
              <div 
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${Math.min(timePercentage * 100, 100)}%` }}
              />
              {/* Deadline marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{ left: '75%' }}
              />
            </div>
          </div>
          
          {/* Rules reminder */}
          <div className="text-xs opacity-75 pt-2 border-t">
            <div className="font-medium mb-1">Timing Rules:</div>
            <div>• First 25%: +30% multiplier (Early Bird)</div>
            <div>• 25-50%: +10% multiplier (Good Timing)</div>
            <div>• 50-75%: -20% penalty (Late)</div>
            <div>• After 75%: Predictions rejected</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PredictionTimingIndicator;