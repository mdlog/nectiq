export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
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
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  totalRewards: number;
}

export interface RecentReward {
  id: number;
  amount: number;
  description: string;
  createdAt: string;
  cryptocurrency: string;
  accuracy: string;
}
