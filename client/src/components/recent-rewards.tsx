import { useQuery } from "@tanstack/react-query";
import { Gift, Check, X, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { RecentReward } from "@/types";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 rewards per page

  const { data: rewards = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/rewards/recent"],
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  // Get real-time crypto prices for dynamic logo display
  const { data: cryptoPrices = [] } = useQuery<any[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 1000,
    staleTime: 30000, // 30 seconds
  });

  // Calculate pagination
  const totalPages = Math.ceil(rewards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRewards = rewards.slice(startIndex, endIndex);

  // Reset to first page when rewards change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [rewards.length, currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light h-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Gift className="text-primary mr-2 animate-pulse" size={18} />
          Recent Rewards
          <div className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </h3>
        <div className="flex-1">
          <EnhancedSkeleton type="reward" count={3} />
        </div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light h-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Gift className="text-primary mr-2" size={18} />
          Recent Rewards
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <EngagementPlaceholder type="rewards" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Gift className="text-primary mr-2" size={18} />
        Recent Rewards
      </h3>
      
      <div className="space-y-3 flex-1">
        {currentRewards.map((reward) => {
          const isWin = reward.amount > 0;
          
          // Determine source type and display text
          let sourceText = '';
          let sourceIcon = <Gift size={16} />;
          
          switch (reward.type) {
            case 'prediction':
              sourceText = `${reward.cryptocurrency?.toUpperCase() || 'CRYPTO'} Prediction ${isWin ? 'Win' : 'Loss'}`;
              sourceIcon = isWin ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
              break;
            case 'battle':
              // Parse battle description to extract opponent name
              const battleDescription = reward.description || '';
              const opponentMatch = battleDescription.match(/vs (.+?) -/);
              const opponentName = opponentMatch ? opponentMatch[1] : 'Opponent';
              sourceText = `Battle vs ${opponentName}`;
              sourceIcon = <TrendingUp size={16} />;
              break;
            case 'survival':
              sourceText = `Survival Tournament`;
              sourceIcon = <TrendingUp size={16} />;
              break;
            case 'achievement':
              sourceText = 'Achievement Reward';
              sourceIcon = <Check size={16} />;
              break;
            case 'daily_challenge':
              sourceText = 'Daily Challenge';
              sourceIcon = <Gift size={16} />;
              break;
            default:
              sourceText = 'Reward';
              sourceIcon = <Gift size={16} />;
          }
          
          return (
            <div key={reward.id} className={`flex items-center justify-between p-3 rounded-lg ${
              isWin ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8 flex-shrink-0">
                  {/* Activity Type Badge */}
                  <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs font-bold flex items-center justify-center text-white z-10 ${
                    reward.type === 'battle' ? 'bg-purple-500' :
                    reward.type === 'survival' ? 'bg-orange-500' :
                    reward.type === 'achievement' ? 'bg-yellow-500' :
                    reward.type === 'daily_challenge' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}>
                    {reward.type === 'battle' ? '⚔' : 
                     reward.type === 'survival' ? '🏆' : 
                     reward.type === 'achievement' ? '🎯' :
                     reward.type === 'daily_challenge' ? '📅' :
                     '📈'}
                  </div>
                  
                  {reward.cryptocurrency ? (
                    <>
                      <img 
                        src={getCryptoImageUrl(reward.cryptocurrency, cryptoPrices || [])} 
                        alt={reward.cryptocurrency}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback icon based on win/loss
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLDivElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isWin ? 'bg-green-500' : 'bg-red-500'
                      }`} style={{ display: 'none' }}>
                        {sourceIcon}
                      </div>
                    </>
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isWin ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {sourceIcon}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {sourceText}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTimeAgo(reward.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isWin ? `+${Math.abs(reward.amount)}` : `-${Math.abs(reward.amount)}`} NTIQ
                </p>
                {reward.sourceDetails?.accuracy && (
                  <p className="text-xs text-slate-400">
                    {parseFloat(reward.sourceDetails.accuracy || "0").toFixed(1)}% accuracy
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-auto pt-3 border-t border-surface-light">
          <div className="flex items-center justify-center">
            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-surface hover:bg-surface-light text-gray-700 dark:text-gray-300 hover:text-primary'
                }`}
              >
                <ChevronLeft size={14} className="mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (totalPages <= 5 || pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-6 h-6 mx-0.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-surface hover:bg-surface-light text-gray-700 dark:text-gray-300 hover:text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="w-6 h-6 flex items-center justify-center text-gray-400 text-xs">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-surface hover:bg-surface-light text-gray-700 dark:text-gray-300 hover:text-primary'
                }`}
              >
                Next
                <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
          
          {/* Pagination Info - Compact version */}
          <div className="text-center mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {startIndex + 1}-{Math.min(endIndex, rewards.length)} of {rewards.length} rewards
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
