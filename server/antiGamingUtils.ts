/**
 * Hybrid Anti-Gaming System for Survival Tournaments
 * Prevents last-second prediction submissions and rewards early predictions
 */

export interface AntiGamingCalculation {
  isValid: boolean;
  timePercentage: number;
  timingMultiplier: number;
  earlyBirdBonus: boolean;
  latePenalty: boolean;
  deadlinePassed: boolean;
  message?: string;
  bonusDescription?: string;
}

export interface RoundTiming {
  roundStartTime: number;
  roundDuration: number;
  submissionTime: number;
}

/**
 * Calculate anti-gaming metrics for a survival prediction
 */
export function calculateAntiGamingMetrics(timing: RoundTiming): AntiGamingCalculation {
  const { roundStartTime, roundDuration, submissionTime } = timing;
  
  const timeElapsed = submissionTime - roundStartTime;
  const timePercentage = timeElapsed / roundDuration;
  
  // 1. Hard deadline check - tidak boleh submit di 25% terakhir (75% deadline)
  const PREDICTION_DEADLINE = 0.75; // 75% of round duration
  const deadlinePassed = timePercentage > PREDICTION_DEADLINE;
  
  if (deadlinePassed) {
    const deadlineTimeMs = roundStartTime + (roundDuration * PREDICTION_DEADLINE);
    const deadlineRemaining = Math.max(0, deadlineTimeMs - submissionTime);
    
    return {
      isValid: false,
      timePercentage,
      timingMultiplier: 0,
      earlyBirdBonus: false,
      latePenalty: true,
      deadlinePassed: true,
      message: `Prediction deadline has passed. You can only predict in the first 75% of the round.`,
      bonusDescription: deadlineRemaining > 0 ? 
        `Deadline in ${Math.floor(deadlineRemaining / 1000)} seconds` : 
        'Deadline has passed'
    };
  }
  
  // 2. Calculate timing multiplier and bonuses
  let timingMultiplier = 1.0;
  let earlyBirdBonus = false;
  let latePenalty = false;
  let bonusDescription = '';
  
  if (timePercentage <= 0.25) {
    // 0-25% of round: Early bird bonus (30% extra)
    timingMultiplier = 1.3;
    earlyBirdBonus = true;
    bonusDescription = 'Early Bird Bonus +30%';
  } else if (timePercentage <= 0.5) {
    // 25-50% of round: Good timing bonus (10% extra)
    timingMultiplier = 1.1;
    bonusDescription = 'Good Timing Bonus +10%';
  } else if (timePercentage <= 0.75) {
    // 50-75% of round: Late penalty (20% reduction)
    timingMultiplier = 0.8;
    latePenalty = true;
    bonusDescription = 'Late Penalty -20%';
  }
  
  return {
    isValid: true,
    timePercentage,
    timingMultiplier,
    earlyBirdBonus,
    latePenalty,
    deadlinePassed: false,
    bonusDescription
  };
}

/**
 * Get prediction deadline countdown for frontend display
 */
export function getPredictionDeadline(roundStartTime: number, roundDuration: number): {
  deadlineTime: number;
  deadlineCountdown: number;
  isExpired: boolean;
} {
  const PREDICTION_DEADLINE = 0.75;
  const deadlineTime = roundStartTime + (roundDuration * PREDICTION_DEADLINE);
  const deadlineCountdown = deadlineTime - Date.now();
  const isExpired = deadlineCountdown <= 0;
  
  return {
    deadlineTime,
    deadlineCountdown,
    isExpired
  };
}

/**
 * Format countdown time for display
 */
export function formatCountdown(milliseconds: number): string {
  if (milliseconds <= 0) return 'Expired';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
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
}

/**
 * Get timing bonus description for UI
 */
export function getTimingBonusDescription(timePercentage: number): {
  bonus: string;
  color: string;
  multiplier: number;
} {
  if (timePercentage <= 0.25) {
    return { bonus: 'Early Bird +30%', color: 'text-green-600', multiplier: 1.3 };
  } else if (timePercentage <= 0.5) {
    return { bonus: 'Good Timing +10%', color: 'text-blue-600', multiplier: 1.1 };
  } else if (timePercentage <= 0.75) {
    return { bonus: 'Late Penalty -20%', color: 'text-red-600', multiplier: 0.8 };
  } else {
    return { bonus: 'Deadline Passed', color: 'text-red-800', multiplier: 0 };
  }
}