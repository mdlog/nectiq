import React from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, ChartLine } from "lucide-react";
import type { CryptoPrice } from "@/types";

function getValidImageUrl(crypto: CryptoPrice): string {
  // Use image from API/database directly - no more manual mappings needed
  return crypto.image || '';
}

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
    monero: "XMR",
    uniswap: "UNI",
    ripple: "XRP",
    bittensor: "TAO",
    polkadot: "DOT",
    chainlink: "LINK",
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
    monero: "bg-orange-600",
    uniswap: "bg-pink-500",
    ripple: "bg-blue-400",
    bittensor: "bg-green-600",
    polkadot: "bg-pink-600",
    chainlink: "bg-blue-700",
  };
  return colors[id] || "bg-gray-500";
}

interface LivePricesProps {
  onCryptoSelect?: (crypto: CryptoPrice) => void;
  onPredictClick?: (cryptoId: string) => void;
}

export function LivePrices({ onCryptoSelect, onPredictClick }: LivePricesProps) {
  console.log("🔍 [LIVE-PRICES-INIT] Live Prices component rendered/re-rendered");

  // 🔑 STATE: Store last valid data to prevent disappearing during empty API responses
  const [lastValidData, setLastValidData] = React.useState<CryptoPrice[]>([]);

  // REAL-TIME PRICES FROM PYTH NETWORK - Synchronized with other components
  // OPTIMISTIC UPDATES: Keep previous data visible while fetching new data
  const { data: prices = [], isLoading, dataUpdatedAt, isFetching } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/pyth-prices"], // Using Pyth Network for ultra-fast real-time data
    refetchInterval: 1000, // Same as Active Predictions and Battles - 1 second refresh
    refetchIntervalInBackground: true, // Enable background updates
    staleTime: 500, // Same as other components - 500ms stale time
    retry: 3,
    retryDelay: 500, // Wait 500ms between retries
    refetchOnWindowFocus: true, // Enable refresh on window focus for consistency
    refetchOnMount: true, // Fetch on component mount
    placeholderData: (previousData) => previousData, // ✅ KEEP OLD DATA VISIBLE during fetch
    gcTime: 300000, // Keep cached data for 5 minutes (300 seconds)
  });

  console.log("🔍 [LIVE-PRICES-QUERY] Query state:", { isLoading, isFetching, pricesLength: prices?.length });

  // 🔑 CRITICAL FIX: Update lastValidData only if we receive non-empty data
  // This prevents data from disappearing when API temporarily returns empty array
  React.useEffect(() => {
    if (prices && Array.isArray(prices) && prices.length > 0) {
      console.log("✅ [LIVE-PRICES-UPDATE] Updating last valid data with", prices.length, "items");
      setLastValidData(prices);
    } else {
      console.log("⚠️ [LIVE-PRICES-SKIP] Skipping update - empty/invalid data, keeping previous data");
    }
  }, [prices]);

  // Add visual indicator for when data was last updated
  const lastUpdate = new Date(dataUpdatedAt).toLocaleTimeString();

  // 🔑 USE LAST VALID DATA: Always display last valid data, even if current fetch returns empty
  // Sort prices by market cap (highest price first) - memoize to prevent unnecessary re-sorts
  const sortedPrices = React.useMemo(() => {
    const dataToUse = (prices && prices.length > 0) ? prices : lastValidData;

    console.log("🔍 [LIVE-PRICES-DEBUG] Using data:", {
      currentPrices: prices?.length || 0,
      lastValid: lastValidData.length,
      using: dataToUse.length,
      source: (prices && prices.length > 0) ? 'current' : 'lastValid'
    });

    if (!dataToUse || !Array.isArray(dataToUse) || dataToUse.length === 0) {
      console.log("🔴 [LIVE-PRICES-DEBUG] No data available at all");
      return [];
    }

    const sorted = [...dataToUse].sort((a, b) => b.current_price - a.current_price);
    console.log("✅ [LIVE-PRICES-DEBUG] Sorted prices:", sorted.length, "items");
    return sorted;
  }, [prices, lastValidData]);

  // Only show skeleton on FIRST LOAD when no data exists and actively loading
  // Never show skeleton during subsequent fetches (isFetching) - this prevents flicker
  if (isLoading && sortedPrices.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-2 border border-surface-light">
        <h3 className="text-base font-bold mb-3 flex items-center">
          <ChartLine className="text-success mr-2" size={16} />
          Live Prices
        </h3>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-track-surface-light scrollbar-thumb-primary pb-2">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="crypto-card px-3 py-2 bg-surface-light rounded-md animate-pulse flex-shrink-0">
              <div className="w-16 h-14 bg-slate-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no data even after loading, show empty state (not loading skeleton)
  if (!isLoading && sortedPrices.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-2 border border-surface-light">
        <h3 className="text-base font-bold mb-3 flex items-center">
          <ChartLine className="text-success mr-2" size={16} />
          Live Prices
        </h3>
        <div className="text-center py-4 text-slate-400">
          <p className="text-sm">No price data available</p>
          <p className="text-xs mt-1">Prices will appear shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg p-1 sm:p-2 border border-surface-light">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-sm sm:text-base font-bold flex items-center">
          <ChartLine className="text-success mr-1 sm:mr-2" size={14} />
          <span className="hidden sm:inline">Live Prices</span>
          <span className="sm:hidden">Prices</span>
          <span className="ml-1 sm:ml-2 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-1 sm:px-2 py-0.5 rounded-full font-medium">
            Pyth
          </span>
        </h3>
        <div className="flex items-center text-xs text-green-400">
          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${isFetching ? 'bg-orange-400 animate-spin' : 'bg-green-400 animate-pulse'}`}></div>
          REAL-TIME {lastUpdate}
        </div>
      </div>

      {/* Scrollable horizontal list */}
      <div className="relative">
        <div
          className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-track-surface-light scrollbar-thumb-primary hover:scrollbar-thumb-primary/80 pb-2"
          style={{
            scrollbarWidth: 'thin',
            msOverflowStyle: 'auto'
          }}
        >
          {sortedPrices.map((crypto) => {
            const isPositive = crypto.price_change_percentage_24h >= 0;

            return (
              <div
                key={crypto.id}
                className="crypto-card px-3 py-2 bg-surface-light rounded-md transition-all duration-300 ease-in-out cursor-pointer hover:bg-slate-700 hover:scale-105 flex-shrink-0"
                onClick={() => onCryptoSelect?.(crypto)}
                style={{
                  opacity: isFetching ? 0.95 : 1,
                  transition: 'opacity 0.3s ease-in-out, transform 0.2s ease-in-out'
                }}
              >
                <div className="flex flex-col items-center space-y-1 min-w-0">
                  {/* Crypto logo and symbol */}
                  <div className="relative w-5 h-5 flex-shrink-0">
                    {(() => {
                      const validImageUrl = getValidImageUrl(crypto);
                      if (validImageUrl) {
                        return (
                          <img
                            src={validImageUrl}
                            alt={crypto.name}
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) {
                                target.style.display = 'none';
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                    {/* Fallback removed - only show logo images, no text fallback */}
                  </div>

                  {/* Symbol */}
                  <p className="font-semibold text-xs whitespace-nowrap">{crypto.symbol}</p>

                  {/* Price */}
                  <p className="font-medium text-xs whitespace-nowrap">${crypto.current_price.toFixed(2)}</p>

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
      </div>
    </div>
  );
}
