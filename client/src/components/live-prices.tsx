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
  };
  return icons[id] || id.toUpperCase();
}

function getCryptoColor(id: string): string {
  const colors: Record<string, string> = {
    bitcoin: "bg-orange-500",
    ethereum: "bg-blue-500",
    binancecoin: "bg-yellow-500",
    cardano: "bg-blue-600",
    solana: "bg-purple-500",
  };
  return colors[id] || "bg-gray-500";
}

interface LivePricesProps {
  onCryptoSelect?: (crypto: CryptoPrice) => void;
  onPredictClick?: (cryptoId: string) => void;
}

export function LivePrices({ onCryptoSelect, onPredictClick }: LivePricesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: prices = [], isLoading } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 500, // Ultra-fast updates every 0.5 seconds
    refetchIntervalInBackground: true, // Continue updating when tab is not active
    staleTime: 5000, // 5 seconds for price data
  });

  // Sort prices by market cap (highest price first)
  const sortedPrices = prices.sort((a, b) => b.current_price - a.current_price);
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedPrices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPrices = sortedPrices.slice(startIndex, endIndex);

  // Reset to first page if current page exceeds total pages
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <ChartLine className="text-success mr-2" size={18} />
          Live Prices
        </h3>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="crypto-card p-3 bg-surface-light rounded-lg animate-pulse">
              <div className="h-12 bg-slate-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <ChartLine className="text-success mr-2" size={18} />
        Live Prices
        <div className="ml-auto flex items-center text-xs text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
          REAL-TIME
        </div>
      </h3>
      
      <div className="space-y-3">
        {currentPrices.map((crypto) => {
          const isPositive = crypto.price_change_percentage_24h >= 0;
          
          return (
            <div 
              key={crypto.id} 
              className="crypto-card p-3 bg-surface-light rounded-lg transition-colors cursor-pointer hover:bg-slate-700"
              onClick={() => onCryptoSelect?.(crypto)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <img 
                      src={crypto.image || `https://coin-images.coingecko.com/coins/images/${crypto.id === 'bitcoin' ? '1' : crypto.id === 'ethereum' ? '279' : crypto.id === 'binancecoin' ? '825' : crypto.id === 'cardano' ? '975' : crypto.id === 'solana' ? '4128' : '1'}/large/${crypto.id}.png`} 
                      alt={crypto.name}
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
                    <div className={`w-8 h-8 ${getCryptoColor(crypto.id)} rounded-full hidden items-center justify-center text-white text-sm font-bold`}>
                      {getCryptoIcon(crypto.id)}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{crypto.symbol}</p>
                    <p className="text-xs text-slate-400">{crypto.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex items-center space-x-1">
                    {isPositive ? (
                      <TrendingUp className="text-success" size={12} />
                    ) : (
                      <TrendingDown className="text-error" size={12} />
                    )}
                    <p className={`text-xs ${isPositive ? "text-success" : "text-error"}`}>
                      {isPositive ? "+" : ""}{crypto.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedPrices.length)} of {sortedPrices.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and adjacent pages
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsis = index > 0 && array[index - 1] < page - 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="text-xs text-slate-400 mx-1">...</span>}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
