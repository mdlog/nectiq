import { useQuery } from "@tanstack/react-query";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import type { ActivePrediction } from "@/types";
import type { User } from "@shared/schema";

function formatTimeLeft(timeLeft: number): string {
  if (timeLeft <= 0) return "Expired";
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s left`;
  }
  return `${minutes}m ${seconds}s left`;
}

function getCryptoImageUrl(cryptoId: string): string {
  const imageMap: Record<string, string> = {
    bitcoin: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
    ethereum: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
    binancecoin: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    cardano: "https://coin-images.coingecko.com/coins/images/975/large/cardano.png",
    solana: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
    chainlink: "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    polkadot: "https://coin-images.coingecko.com/coins/images/12171/large/polkadot.png",
    litecoin: "https://coin-images.coingecko.com/coins/images/2/large/litecoin.png",
    "matic-network": "https://coin-images.coingecko.com/coins/images/4713/large/matic-token-icon.png",
    hyperliquid: "https://coin-images.coingecko.com/coins/images/44077/large/hyperliquid.jpeg",
    "sahara-ai": "https://coin-images.coingecko.com/coins/images/66681/large/Token_Logo_3x.png"
  };
  
  return imageMap[cryptoId] || `https://coin-images.coingecko.com/coins/images/1/large/${cryptoId}.png`;
}

function getCryptoIcon(crypto: string): string {
  const icons: Record<string, string> = {
    bitcoin: "₿",
    ethereum: "Ξ",
    binancecoin: "BNB",
    cardano: "ADA",
    solana: "SOL",
    chainlink: "LINK",
    polkadot: "DOT",
    litecoin: "LTC",
    "matic-network": "MATIC",
    hyperliquid: "HYPE",
  };
  return icons[crypto] || crypto.toUpperCase().slice(0, 4);
}

function getCryptoColor(crypto: string): string {
  const colors: Record<string, string> = {
    bitcoin: "bg-orange-500",
    ethereum: "bg-blue-500",
    binancecoin: "bg-yellow-500",
    cardano: "bg-blue-600",
    solana: "bg-purple-500",
    chainlink: "bg-blue-400",
    polkadot: "bg-pink-500",
    litecoin: "bg-gray-500",
    "matic-network": "bg-purple-600",
    hyperliquid: "bg-green-500",
  };
  return colors[crypto] || "bg-gray-500";
}



function calculateAccuracy(predicted: string, current: string): number {
  const predictedNum = parseFloat(predicted);
  const currentNum = parseFloat(current);
  if (currentNum === 0) return 0;
  return ((currentNum - predictedNum) / predictedNum) * 100;
}

export function ActivePredictions() {
  // Check if user is authenticated first
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
  });

  const isAuthenticated = !!user;

  const { data: predictions = [], isLoading } = useQuery<ActivePrediction[]>({
    queryKey: ["/api/predictions/active"],
    refetchInterval: isAuthenticated ? 1000 : false, // Only refetch if authenticated
    refetchIntervalInBackground: isAuthenticated,
    staleTime: 0,
    enabled: isAuthenticated, // Only enable query if authenticated
  });

  // Show authentication message if not logged in
  if (!isAuthenticated) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Clock className="text-warning mr-2" size={18} />
          Active Predictions
        </h3>
        <div className="text-center py-8 text-slate-400">
          <Clock className="mx-auto mb-2" size={32} />
          <p>Connect your wallet to view predictions</p>
          <p className="text-sm">Sign in to track your active predictions</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Clock className="text-warning mr-2" size={18} />
          Active Predictions
        </h3>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-surface-light rounded-lg p-4 border border-slate-600 animate-pulse">
              <div className="h-16 bg-slate-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Clock className="text-warning mr-2" size={18} />
          Active Predictions
        </h3>
        <div className="text-center py-8 text-slate-400">
          <Clock className="mx-auto mb-2" size={32} />
          <p>No active predictions</p>
          <p className="text-sm">Make your first prediction above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Clock className="text-warning mr-2" size={18} />
        Active Predictions
      </h3>
      
      <div className="space-y-4">
        {predictions.map((prediction) => {
          const accuracy = calculateAccuracy(prediction.predictedPrice, prediction.currentPrice);
          const isPositive = accuracy >= 0;
          const isExpired = prediction.timeLeft <= 0;
          
          return (
            <div key={prediction.id} className="bg-surface-light rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <img 
                      src={getCryptoImageUrl(prediction.cryptocurrency)}
                      alt={prediction.cryptocurrency}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          target.style.display = 'none';
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div className={`w-8 h-8 ${getCryptoColor(prediction.cryptocurrency)} rounded-full hidden items-center justify-center text-white text-sm font-bold`}>
                      {getCryptoIcon(prediction.cryptocurrency)}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{prediction.cryptocurrency}</p>
                    <p className="text-xs text-slate-400">
                      {isExpired ? "Expired" : formatTimeLeft(prediction.timeLeft)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">
                    Predicted: <span className="font-semibold">${parseFloat(prediction.predictedPrice).toLocaleString()}</span>
                  </p>
                  <p className="text-sm text-slate-300">
                    Current: <span className={`font-semibold ${isPositive ? "text-warning" : "text-error"}`}>
                      ${parseFloat(prediction.currentPrice).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {prediction.timeframe} Prediction
                  </span>
                  <span className="text-xs text-slate-400">
                    Stake: {prediction.stakeAmount} NTIQ
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isPositive ? "bg-success pulse-green" : "bg-error"}`}></div>
                  {isPositive ? (
                    <TrendingUp className="text-success" size={12} />
                  ) : (
                    <TrendingDown className="text-error" size={12} />
                  )}
                  <span className={`text-xs font-medium ${isPositive ? "text-success" : "text-error"}`}>
                    {isPositive ? "+" : ""}{accuracy.toFixed(2)}% accuracy
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
