import { useQuery } from "@tanstack/react-query";
import { Brain, Target, Award, Clock, Lightbulb, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PredictionInsightsData {
  bestPerformingTimeframe: {
    timeframe: string;
    accuracy: number;
    totalPredictions: number;
  };
  mostPredictedCrypto: {
    cryptocurrency: string;
    totalPredictions: number;
    accuracy: number;
  };
  averageAccuracy: number;
  totalSuccessfulPredictions: number;
  streakInfo: {
    currentStreak: number;
    bestStreak: number;
    type: string;
  };
  recommendations: string[];
}

export function PredictionInsights() {
  const { data: insightsData, isLoading, error } = useQuery<PredictionInsightsData>({
    queryKey: ["/api/user/insights"],
    refetchInterval: 60000, // Update every minute
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <Card className="bg-surface-light border-slate-600" data-testid="prediction-insights-loading">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Your Insights
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

  if (error || !insightsData) {
    return (
      <Card className="bg-surface-light border-slate-600" data-testid="prediction-insights-error">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Your Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default insights when no data available */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg">
              <Target className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-white">Start Making Predictions</p>
                <p className="text-xs text-slate-400">Build your prediction history to unlock insights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-white">Pro Tip</p>
                <p className="text-xs text-slate-400">Shorter timeframes often have higher accuracy rates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg">
              <Award className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-white">Rewards</p>
                <p className="text-xs text-slate-400">Higher accuracy predictions earn more NTIQ rewards</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCryptoSymbol = (cryptoId: string) => {
    const mapping: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'solana': 'SOL',
      'avalanche-2': 'AVAX',
      'chainlink': 'LINK',
      'litecoin': 'LTC'
    };
    return mapping[cryptoId] || cryptoId.toUpperCase();
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400';
    if (accuracy >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-surface-light border-slate-600" data-testid="prediction-insights">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Your Insights
        </CardTitle>
        <p className="text-xs text-slate-400">
          Personalized prediction analytics and tips
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white">Overall Accuracy</span>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className={`${getAccuracyColor(insightsData.averageAccuracy)} font-medium`}>
                {insightsData.averageAccuracy.toFixed(1)}%
              </Badge>
            </div>
          </div>

          {/* Best Timeframe */}
          {insightsData.bestPerformingTimeframe && (
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">Best Timeframe</p>
                  <p className="text-xs text-slate-400">{insightsData.bestPerformingTimeframe.timeframe}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getAccuracyColor(insightsData.bestPerformingTimeframe.accuracy)}`}>
                  {insightsData.bestPerformingTimeframe.accuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">
                  {insightsData.bestPerformingTimeframe.totalPredictions} predictions
                </p>
              </div>
            </div>
          )}

          {/* Favorite Crypto */}
          {insightsData.mostPredictedCrypto && (
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-white">Favorite Crypto</p>
                  <p className="text-xs text-slate-400">
                    {getCryptoSymbol(insightsData.mostPredictedCrypto.cryptocurrency)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getAccuracyColor(insightsData.mostPredictedCrypto.accuracy)}`}>
                  {insightsData.mostPredictedCrypto.accuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">
                  {insightsData.mostPredictedCrypto.totalPredictions} predictions
                </p>
              </div>
            </div>
          )}

          {/* Current Streak */}
          {insightsData.streakInfo && (
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Current Streak</p>
                  <p className="text-xs text-slate-400">{insightsData.streakInfo.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-purple-400">
                  {insightsData.streakInfo.currentStreak}
                </p>
                <p className="text-xs text-slate-400">
                  Best: {insightsData.streakInfo.bestStreak}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            AI Recommendations
          </h4>
          
          {insightsData.recommendations?.slice(0, 3).map((recommendation, index) => (
            <div 
              key={index}
              className="p-2 bg-slate-800/20 rounded-lg border-l-2 border-primary/30"
              data-testid={`recommendation-${index}`}
            >
              <p className="text-xs text-slate-300 leading-relaxed">
                {recommendation}
              </p>
            </div>
          )) || (
            <div className="space-y-2">
              <div className="p-2 bg-slate-800/20 rounded-lg border-l-2 border-primary/30">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Focus on shorter timeframes (1h-6h) for better accuracy rates
                </p>
              </div>
              <div className="p-2 bg-slate-800/20 rounded-lg border-l-2 border-primary/30">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Study market trends before making predictions
                </p>
              </div>
              <div className="p-2 bg-slate-800/20 rounded-lg border-l-2 border-primary/30">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Higher stakes yield proportionally higher rewards
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}