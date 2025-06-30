import { useQuery } from "@tanstack/react-query";
import { Gift, Check, X, TrendingUp, TrendingDown } from "lucide-react";
import type { RecentReward } from "@/types";

// Dynamic function to get crypto image from live API data
function getCryptoImageUrl(cryptoId: string, cryptoPrices: any[]): string {
  // First try to get image from real-time crypto data
  const cryptoData = cryptoPrices?.find(crypto => crypto.id === cryptoId);
  if (cryptoData?.image) {
    return cryptoData.image;
  }
  
  // Fallback: Try common CoinGecko image patterns for new cryptocurrencies
  const commonIds: Record<string, string> = {
    'bitcoin': '1',
    'ethereum': '279',
    'tron': '1094',
    'binancecoin': '825',
    'cardano': '975',
    'solana': '4128',
    'chainlink': '877',
    'polkadot': '12171',
    'litecoin': '2',
    'matic-network': '4713',
    'hyperliquid': '44077',
    'sahara-ai': '66681'
  };
  
  const imageId = commonIds[cryptoId] || '1';
  return `https://coin-images.coingecko.com/coins/images/${imageId}/large/${cryptoId}.png`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
}

export function RecentRewards() {
  const { data: rewards = [], isLoading } = useQuery<RecentReward[]>({
    queryKey: ["/api/rewards/recent"],
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  // Get real-time crypto prices for dynamic logo display
  const { data: cryptoPrices = [] } = useQuery<any[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 1000,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Gift className="text-primary mr-2" size={18} />
          Recent Rewards
        </h3>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-3 bg-surface-light rounded-lg animate-pulse">
              <div className="h-12 bg-slate-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Gift className="text-primary mr-2" size={18} />
          Recent Rewards
        </h3>
        <div className="text-center py-8 text-slate-400">
          <Gift className="mx-auto mb-2" size={32} />
          <p>No predictions yet</p>
          <p className="text-sm">Make predictions to see your results here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Gift className="text-primary mr-2" size={18} />
        Recent Rewards
      </h3>
      
      <div className="space-y-3">
        {rewards.map((reward) => (
          <div key={reward.id} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 flex-shrink-0">
                <img 
                  src={getCryptoImageUrl(reward.cryptocurrency, cryptoPrices || [])} 
                  alt={reward.cryptocurrency}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to success checkmark if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLDivElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                  <Check className="text-white" size={16} />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {reward.cryptocurrency.toUpperCase()} Prediction
                </p>
                <p className="text-xs text-slate-400">
                  {formatTimeAgo(reward.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-success">
                +{reward.amount} NTIQ
              </p>
              <p className="text-xs text-slate-400">
                {parseFloat(reward.accuracy).toFixed(1)}% accuracy
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
