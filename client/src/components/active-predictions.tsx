import { useQuery } from "@tanstack/react-query";
import { Clock, TrendingUp, TrendingDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { ActivePrediction } from "@/types";
import type { User } from "@shared/schema";
import { CountdownTimer } from "@/components/countdown-timer";
import { EngagementPlaceholder } from "@/components/engagement-placeholder";
import { EnhancedSkeleton } from "@/components/enhanced-skeleton";

// Dynamic function to get crypto image from live API data
function getCryptoImageUrl(cryptoId: string, cryptoPrices: any[]): string {
  // First try to get image from real-time crypto data
  const cryptoData = cryptoPrices?.find(crypto => crypto.id === cryptoId);
  if (cryptoData?.image) {
    return cryptoData.image;
  }
  
  // Fallback: Try common CoinGecko image patterns for new cryptocurrencies
  // This will automatically work for most cryptocurrencies added to the platform
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
    'matic-network': '4713'
  };
  
  const imageId = commonIds[cryptoId] || '1';
  return `https://coin-images.coingecko.com/coins/images/${imageId}/large/${cryptoId}.png`;
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
  
  // Using the new percentage accuracy formula:
  // accuracy = (1 - |Predicted Price - Actual Price| / Actual Price) × 100
  const difference = Math.abs(predictedNum - currentNum);
  const accuracyDecimal = 1 - (difference / currentNum);
  const accuracyPercentage = accuracyDecimal * 100;
  
  // Ensure accuracy is between 0 and 100
  return Math.max(0, Math.min(100, accuracyPercentage));
}

export function ActivePredictions() {
  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 3;

  // Check if user is authenticated first
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
  });

  const isAuthenticated = !!user;

  // SYNCHRONIZED: Use same data source as Live Prices for consistency
  const { data: cryptoPrices = [] } = useQuery<any[]>({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 1000, // Same as Live Prices - ultra-fast updates
    refetchIntervalInBackground: true, // Enable background updates
    staleTime: 500, // Same as Live Prices - very fresh data
    retry: 3, // More retry attempts for reliability
  });

  const { data: predictions = [], isLoading } = useQuery<ActivePrediction[]>({
    queryKey: ["/api/predictions/active"],
    refetchInterval: false, // Disable auto-refresh to prevent rate limiting
    refetchIntervalInBackground: false,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    enabled: isAuthenticated, // Only enable query if authenticated
  });

  // Filter predictions based on search query
  const filteredPredictions = (predictions || []).filter(prediction =>
    prediction?.cryptocurrency?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalItems = filteredPredictions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPredictions = filteredPredictions.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Navigation functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Show authentication message if not logged in
  if (!isAuthenticated) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light min-h-[500px]">
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
      <div className="bg-surface rounded-xl p-4 sm:p-6 border border-surface-light min-h-[500px]">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center">
          <Clock className="text-warning mr-2 animate-pulse" size={16} />
          Active Predictions
          <div className="ml-2 w-2 h-2 bg-warning rounded-full animate-pulse"></div>
        </h3>
        <EnhancedSkeleton type="prediction" count={2} />
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-4 sm:p-6 border border-surface-light min-h-[500px]">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center">
          <Clock className="text-warning mr-2" size={16} />
          Active Predictions
        </h3>
        <EngagementPlaceholder type="predictions" />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-4 sm:p-6 border border-surface-light min-h-[500px]">
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center">
        <Clock className="text-warning mr-2" size={16} />
        Active Predictions
        {totalItems > 0 && (
          <span className="ml-auto text-xs sm:text-sm text-slate-400">
            {totalItems} predictions
          </span>
        )}
      </h3>

      {/* Search Bar */}
      {predictions.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search cryptocurrency..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-surface-light border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Results Info */}
      {searchQuery && (
        <div className="mb-4 text-sm text-slate-400">
          {filteredPredictions.length > 0 
            ? `Found ${filteredPredictions.length} prediction${filteredPredictions.length !== 1 ? 's' : ''} for "${searchQuery}"`
            : `No predictions found for "${searchQuery}"`
          }
        </div>
      )}

      {/* No Results */}
      {filteredPredictions.length === 0 && searchQuery && (
        <div className="text-center py-8 text-slate-400">
          <Search className="mx-auto mb-2" size={32} />
          <p>No predictions found</p>
          <p className="text-sm">Try searching for a different cryptocurrency</p>
        </div>
      )}
      
      {/* Predictions List */}
      {paginatedPredictions.length > 0 && (
        <div className="space-y-4">
          {paginatedPredictions.map((prediction) => {
            // Get live current price from Pyth Network data
            const cryptoMatch = cryptoPrices.find(crypto => 
              crypto.id === prediction.cryptocurrency.toLowerCase() || 
              crypto.symbol.toLowerCase() === prediction.cryptocurrency.toLowerCase() ||
              crypto.name.toLowerCase() === prediction.cryptocurrency.toLowerCase()
            );
            const liveCurrentPrice = cryptoMatch?.current_price || prediction.currentPrice;
            
            const accuracy = calculateAccuracy(prediction.predictedPrice, liveCurrentPrice.toString());
            // Accuracy is now a percentage (0-100), determine if prediction is good based on threshold
            const isGoodPrediction = accuracy >= 90; // 90% minimum threshold for reward
            const isExpired = prediction.timeLeft <= 0;
            
            return (
              <div key={prediction.id} className="bg-surface-light rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <img 
                        src={getCryptoImageUrl(prediction.cryptocurrency, cryptoPrices || [])}
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
                        {isExpired ? "Expired" : <CountdownTimer timeLeft={prediction.timeLeft} format="compact" />}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">
                      Predicted: $
                      <span className="font-semibold text-white">
                        {parseFloat(prediction.predictedPrice).toLocaleString()}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Current: $
                      <span className="font-semibold text-slate-300">
                        {parseFloat(liveCurrentPrice.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    <div className={`w-2 h-2 rounded-full ${isGoodPrediction ? "bg-success pulse-green" : "bg-warning"}`}></div>
                    {isGoodPrediction ? (
                      <TrendingUp className="text-success" size={12} />
                    ) : (
                      <TrendingDown className="text-warning" size={12} />
                    )}
                    <span className={`text-xs font-medium ${isGoodPrediction ? "text-success" : "text-warning"}`}>
                      {accuracy.toFixed(2)}% accuracy
                    </span>
                    {accuracy >= 99.5 && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded ml-1">
                        Perfect! 3x
                      </span>
                    )}
                    {accuracy >= 98 && accuracy < 99.5 && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded ml-1">
                        Excellent! 2.5x
                      </span>
                    )}
                    {accuracy >= 95 && accuracy < 98 && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-1 py-0.5 rounded ml-1">
                        Great! 2x
                      </span>
                    )}
                    {accuracy >= 90 && accuracy < 95 && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded ml-1">
                        Good! 1x
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} predictions
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-1 rounded text-sm ${
                currentPage === 1
                  ? 'text-slate-500 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1 rounded text-sm ${
                currentPage === totalPages
                  ? 'text-slate-500 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}