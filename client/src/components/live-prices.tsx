import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, ChartLine, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CryptoPrice } from "@/types";

function getCryptoIcon(id: string): string {
  const icons: Record<string, string> = {
    bitcoin: "₿",
    ethereum: "Ξ",
    binancecoin: "BNB",
    cardano: "ADA",
    solana: "SOL",
    aave: "AAVE",
    litecoin: "LTC",
    hyperliquid: "HYPE",
    "avalanche-2": "AVAX",
    "matic-network": "MATIC",
  };
  return icons[id] || id.toUpperCase().slice(0, 4);
}

function getCryptoColor(id: string): string {
  const colors: Record<string, string> = {
    bitcoin: "bg-orange-500",
    ethereum: "bg-blue-500",
    binancecoin: "bg-yellow-500",
    cardano: "bg-blue-600",
    solana: "bg-purple-500",
    aave: "bg-purple-600",
    litecoin: "bg-gray-500",
    hyperliquid: "bg-green-500",
    "avalanche-2": "bg-red-500",
    "matic-network": "bg-purple-700",
  };
  return colors[id] || "bg-gray-500";
}

interface LivePricesProps {
  onCryptoSelect?: (crypto: CryptoPrice) => void;
  onPredictClick?: (cryptoId: string) => void;
}

export function LivePrices({ onCryptoSelect, onPredictClick }: LivePricesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4; // Show 4 items at once in horizontal view

  const { data: prices = [], isLoading, dataUpdatedAt } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 3000, // Faster updates every 3 seconds
    refetchIntervalInBackground: true, // Enable background updates for real-time feel
    staleTime: 1000, // Very fresh data - 1 second stale time
    retry: 3, // More retry attempts for reliability
    refetchOnWindowFocus: true, // Refresh when user focuses window
    refetchOnMount: true, // Refresh on component mount
  });

  // Add visual indicator for when data was last updated
  const lastUpdate = new Date(dataUpdatedAt).toLocaleTimeString();

  // Sort prices by market cap (highest price first)
  const sortedPrices = prices.sort((a, b) => b.current_price - a.current_price);
  
  // Calculate visible items for horizontal scroll
  const maxIndex = Math.max(0, sortedPrices.length - itemsPerView);
  const visiblePrices = sortedPrices.slice(currentIndex, currentIndex + itemsPerView);
  
  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Reset index if it exceeds bounds
  if (currentIndex > maxIndex && maxIndex >= 0) {
    setCurrentIndex(0);
  }

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-surface-light">
        <h3 className="text-base font-bold mb-3 flex items-center">
          <ChartLine className="text-success mr-2" size={16} />
          Live Prices
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1.5 justify-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="crypto-card px-3 py-2 bg-surface-light rounded-md animate-pulse flex-shrink-0">
                <div className="w-16 h-14 bg-slate-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg p-4 border border-surface-light">
      <h3 className="text-base font-bold mb-3 flex items-center">
        <ChartLine className="text-success mr-2" size={16} />
        Live Prices
        <div className="ml-auto flex items-center text-xs text-green-400">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-1"></div>
          REAL-TIME
          <div className="ml-2 text-xs text-gray-400">
            {lastUpdate}
          </div>
        </div>
      </h3>
      
      {/* Horizontal layout with navigation */}
      <div className="flex items-center gap-2">
        {/* Left navigation button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {/* Horizontal cryptocurrency grid */}
        <div className="flex-1 flex gap-1.5 justify-center">
          {visiblePrices.map((crypto) => {
            const isPositive = crypto.price_change_percentage_24h >= 0;
            
            return (
              <div 
                key={crypto.id} 
                className="crypto-card px-3 py-2 bg-surface-light rounded-md transition-all duration-200 cursor-pointer hover:bg-slate-700 hover:scale-105 flex-shrink-0"
                onClick={() => onCryptoSelect?.(crypto)}
              >
                <div className="flex flex-col items-center space-y-1 min-w-0">
                  {/* Crypto logo and symbol */}
                  <div className="relative w-4 h-4 flex-shrink-0">
                    <img 
                      src={crypto.image} 
                      alt={crypto.name}
                      className="w-4 h-4 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          target.style.display = 'none';
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div className={`w-4 h-4 ${getCryptoColor(crypto.id)} rounded-full hidden items-center justify-center text-white text-xs font-bold`}>
                      {getCryptoIcon(crypto.id)}
                    </div>
                  </div>
                  
                  {/* Symbol */}
                  <p className="font-semibold text-xs whitespace-nowrap">{crypto.symbol}</p>
                  
                  {/* Price */}
                  <p className="font-medium text-xs whitespace-nowrap">${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  
                  {/* Change percentage */}
                  <div className="flex items-center space-x-0.5">
                    {isPositive ? (
                      <TrendingUp className="text-success" size={8} />
                    ) : (
                      <TrendingDown className="text-error" size={8} />
                    )}
                    <span className={`text-xs font-medium whitespace-nowrap ${isPositive ? "text-success" : "text-error"}`}>
                      {isPositive ? "+" : ""}{crypto.price_change_percentage_24h.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right navigation button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={currentIndex >= maxIndex}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Navigation indicators */}
      {sortedPrices.length > itemsPerView && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="text-xs text-slate-400">
            Showing {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, sortedPrices.length)} of {sortedPrices.length}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.ceil(sortedPrices.length / itemsPerView) }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  Math.floor(currentIndex / itemsPerView) === i
                    ? "bg-success"
                    : "bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
