import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Users, BarChart3, Activity, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CryptoSentimentData {
  cryptocurrency: string;
  totalPredictions: number;
  bullishPercentage: number;
  bearishPercentage: number;
  bullishPredictions: number;
  bearishPredictions: number;
  totalStaked: number;
  averagePredictedPrice: number;
  currentPrice: number;
  priceDifference: number;
  sentiment: string;
}

interface PlatformStats {
  totalActivePredictions: number;
  totalActiveStake: number;
  averageStakeAmount: number;
  uniqueCryptocurrencies: number;
  overallBullishPercentage: number;
  overallBearishPercentage: number;
  marketMood: string;
}

interface MarketSentimentResponse {
  cryptoSentiment: CryptoSentimentData[];
  platformStats: PlatformStats;
  lastUpdated: string;
}

export function MarketSentimentDashboard() {
  const { data: sentimentData, isLoading, error } = useQuery<MarketSentimentResponse>({
    queryKey: ["/api/market/sentiment"],
    refetchInterval: 30000, // Update every 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 25000, // Data stays fresh for 25 seconds
    retry: 3,
  });

  if (isLoading) {
    return (
      <Card className="bg-surface-light border-slate-600" data-testid="sentiment-loading">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-600 rounded w-3/4"></div>
            <div className="h-4 bg-slate-600 rounded w-1/2"></div>
            <div className="h-4 bg-slate-600 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !sentimentData) {
    return (
      <Card className="bg-surface-light border-slate-600" data-testid="sentiment-error">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Unable to load market sentiment data</p>
        </CardContent>
      </Card>
    );
  }

  const { cryptoSentiment, platformStats } = sentimentData;

  // Get crypto display name
  const getCryptoDisplayName = (cryptoId: string): string => {
    const displayMapping: { [key: string]: string } = {
      'bitcoin': 'Bitcoin (BTC)',
      'ethereum': 'Ethereum (ETH)',
      'binancecoin': 'BNB',
      'cardano': 'Cardano (ADA)',
      'solana': 'Solana (SOL)',
      'litecoin': 'Litecoin (LTC)',
      'chainlink': 'Chainlink (LINK)',
      'sui': 'Sui (SUI)',
      'avalanche-2': 'Avalanche (AVAX)',
      'aptos': 'Aptos (APT)',
      'uniswap': 'Uniswap (UNI)',
      'hyperliquid': 'Hyperliquid (HYPE)',
      'filecoin': 'Filecoin (FIL)',
      'bittensor': 'Bittensor (TAO)',
      'bitcoin-cash': 'Bitcoin Cash (BCH)',
      'ethereum-classic': 'Ethereum Classic (ETC)'
    };
    return displayMapping[cryptoId] || cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1);
  };

  // Get sentiment color and icon
  const getSentimentDisplay = (sentiment: string, bullishPercentage: number) => {
    if (sentiment === 'Very Bullish') {
      return { color: 'text-green-400', bg: 'bg-green-500/20', icon: TrendingUp, badge: 'bg-green-500/20 text-green-400' };
    } else if (sentiment === 'Bullish') {
      return { color: 'text-green-500', bg: 'bg-green-500/10', icon: TrendingUp, badge: 'bg-green-500/10 text-green-500' };
    } else if (sentiment === 'Very Bearish') {
      return { color: 'text-red-400', bg: 'bg-red-500/20', icon: TrendingDown, badge: 'bg-red-500/20 text-red-400' };
    } else {
      return { color: 'text-red-500', bg: 'bg-red-500/10', icon: TrendingDown, badge: 'bg-red-500/10 text-red-500' };
    }
  };

  const getMoodColor = (mood: string) => {
    if (mood === 'Very Optimistic') return 'text-green-400';
    if (mood === 'Optimistic') return 'text-green-500';
    if (mood === 'Neutral') return 'text-yellow-500';
    if (mood === 'Pessimistic') return 'text-red-500';
    return 'text-red-400';
  };

  return (
    <Card className="bg-surface-light border-slate-600" data-testid="market-sentiment-dashboard">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Market Sentiment
        </CardTitle>
        <p className="text-xs text-slate-400">
          Live analysis from {platformStats.totalActivePredictions} active predictions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Market Mood */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg" data-testid="overall-mood">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white">Market Mood</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${getMoodColor(platformStats.marketMood)} font-medium`}>
              {platformStats.marketMood}
            </Badge>
            <span className="text-xs text-slate-400">
              {platformStats.overallBullishPercentage}% Bullish
            </span>
          </div>
        </div>

        {/* Platform Statistics Row */}
        <div className="grid grid-cols-2 gap-3" data-testid="platform-stats">
          <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded">
            <Users className="w-3 h-3 text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Active Predictions</p>
              <p className="text-sm font-semibold text-white">{platformStats.totalActivePredictions}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded">
            <DollarSign className="w-3 h-3 text-yellow-400" />
            <div>
              <p className="text-xs text-slate-400">Total Staked</p>
              <p className="text-sm font-semibold text-white">{platformStats.totalActiveStake.toLocaleString()} NTIQ</p>
            </div>
          </div>
        </div>

        {/* Top Cryptocurrencies by Prediction Volume */}
        <div className="space-y-3" data-testid="crypto-sentiment-list">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Most Predicted Cryptos
          </h4>
          
          {cryptoSentiment.slice(0, 5).map((crypto, index) => {
            const sentimentDisplay = getSentimentDisplay(crypto.sentiment, crypto.bullishPercentage);
            const Icon = sentimentDisplay.icon;
            
            return (
              <div 
                key={crypto.cryptocurrency} 
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                data-testid={`crypto-sentiment-${crypto.cryptocurrency}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon className={`w-4 h-4 ${sentimentDisplay.color} flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {getCryptoDisplayName(crypto.cryptocurrency)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {crypto.totalPredictions} predictions • {crypto.totalStaked.toLocaleString()} NTIQ
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${crypto.bullishPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">
                        {crypto.bullishPercentage}%
                      </span>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${sentimentDisplay.badge} mt-1`}>
                      {crypto.sentiment}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Update Time */}
        <div className="text-xs text-slate-500 text-center" data-testid="last-updated">
          Last updated: {new Date(sentimentData.lastUpdated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}