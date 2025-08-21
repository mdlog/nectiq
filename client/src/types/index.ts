export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  confidence_interval?: number;
  last_updated?: string;
  source?: string;
  image?: string;
}

export interface UserStats {
  totalPredictions: number;
  accuracy: number;
  rank: number | null;
  totalRewards: number;
}

export interface ActivePrediction {
  id: number;
  cryptocurrency: string;
  predictedPrice: string;
  currentPrice: string;
  stakeAmount: number;
  timeframe: string;
  targetTime: string;
  timeLeft: number;
  accuracy?: string;
  status: string;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  rank: number; // Backend-provided ranking for consistency
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  totalRewards: number;
  // Battle data
  totalBattles?: number;
  wonBattles?: number;
  battleWinRate?: number;
  battleRewards?: number;
  // Survival data
  totalSurvivalTournaments?: number;
  wonSurvivalTournaments?: number;
  survivalRewards?: number;
  // Additional fields for filtering
  weeklyPoints?: number;
  monthlyPoints?: number;
  profilePhoto?: string;
  uid?: string;
  winRate?: number;
}

export interface RecentReward {
  id: number;
  amount: number;
  description: string;
  createdAt: string;
  cryptocurrency: string;
  accuracy: string;
  isWin?: boolean;
  stakeAmount?: number;
  rewardAmount?: number;
}
