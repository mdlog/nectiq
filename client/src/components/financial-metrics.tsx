import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface FinancialMetricsProps {
  cryptoId: string;
  symbol: string;
}

interface CryptoMetrics {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  volume_24h: number;
  volume_change_24h: number;
  price_change_24h: number;
  price_change_7d: number;
  price_change_30d: number;
  circulating_supply: number;
  total_supply: number;
}

export default function FinancialMetrics({ cryptoId, symbol }: FinancialMetricsProps) {
  const { data: metrics, isLoading } = useQuery<CryptoMetrics>({
    queryKey: ['/api/crypto/metrics', cryptoId],
    queryFn: () => fetch(`/api/crypto/metrics/${cryptoId}`).then(res => res.json()),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000
  });

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatSupply = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const calculateMonthlyVolume = (dailyVolume: number) => {
    // Estimate monthly volume (30 days average)
    return dailyVolume * 30;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const monthlyVolume = calculateMonthlyVolume(metrics.volume_24h);
  const volumeChange = metrics.volume_change_24h || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-8">
      {/* Volume Harian */}
      <Card className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border-white/20 hover:border-blue-400/40 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-300">Volume Harian</h3>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {formatNumber(metrics.volume_24h)}
          </div>
          <div className={`flex items-center gap-1 text-xs ${
            volumeChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {volumeChange >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(volumeChange).toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      {/* Volume Bulanan */}
      <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border-white/20 hover:border-green-400/40 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-green-400" />
            <h3 className="text-sm font-medium text-gray-300">Volume Bulanan</h3>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {formatNumber(monthlyVolume)}
          </div>
          <div className="text-xs text-gray-400">
            Estimasi 30 hari
          </div>
        </CardContent>
      </Card>

      {/* Market Cap */}
      <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border-white/20 hover:border-orange-400/40 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-medium text-gray-300">Market Cap</h3>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {formatNumber(metrics.market_cap)}
          </div>
          <div className="text-xs text-gray-400">
            Rank #{metrics.market_cap_rank}
          </div>
        </CardContent>
      </Card>

      {/* Circulating Supply */}
      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border-white/20 hover:border-purple-400/40 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-medium text-gray-300">Supply</h3>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {formatSupply(metrics.circulating_supply)} {symbol}
          </div>
          <div className="text-xs text-gray-400">
            {metrics.total_supply > 0 ? (
              `Total: ${formatSupply(metrics.total_supply)} ${symbol}`
            ) : (
              'Unlimited supply'
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}