import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Zap, CheckCircle, TrendingUp, Calendar, Coins } from 'lucide-react';
import { SocialShare } from './social-share';

interface AchievementCardProps {
  prediction: {
    id: number;
    cryptocurrency: string;
    predictedPrice: number;
    actualPrice: number;
    accuracyScore: number;
    rewardAmount: number;
    stakeAmount: number;
    submissionTime: string;
    targetTime: string;
  };
  onViewDetails?: () => void;
}

export function AchievementCard({ prediction, onViewDetails }: AchievementCardProps) {
  const accuracyPercentage = (prediction.accuracyScore / 10000) * 100;
  const rewardMultiplier = prediction.rewardAmount / prediction.stakeAmount;
  const profitAmount = prediction.rewardAmount - prediction.stakeAmount;
  
  // Get achievement details
  const getAchievement = () => {
    if (accuracyPercentage >= 99.9) return {
      icon: Trophy,
      label: 'Perfect Predictor',
      color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      textColor: 'text-yellow-600',
      description: 'Achieved near-perfect accuracy!'
    };
    if (accuracyPercentage >= 99) return {
      icon: Target,
      label: 'Sharpshooter',
      color: 'bg-gradient-to-r from-orange-400 to-orange-600',
      textColor: 'text-orange-600',
      description: 'Exceptional precision in prediction!'
    };
    if (accuracyPercentage >= 95) return {
      icon: Zap,
      label: 'Accuracy Master',
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
      textColor: 'text-blue-600',
      description: 'Outstanding market analysis!'
    };
    if (accuracyPercentage >= 90) return {
      icon: CheckCircle,
      label: 'Skilled Trader',
      color: 'bg-gradient-to-r from-green-400 to-green-600',
      textColor: 'text-green-600',
      description: 'Great trading instincts!'
    };
    return {
      icon: CheckCircle,
      label: 'Good Prediction',
      color: 'bg-gradient-to-r from-gray-400 to-gray-600',
      textColor: 'text-gray-600',
      description: 'Solid market prediction!'
    };
  };

  const achievement = getAchievement();
  const AchievementIcon = achievement.icon;

  // Format cryptocurrency
  const formatCrypto = (crypto: string) => {
    const cryptoNames: Record<string, string> = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'binancecoin': 'BNB',
      'cardano': 'Cardano',
      'solana': 'Solana',
      'chainlink': 'Chainlink',
      'polkadot': 'Polkadot',
      'litecoin': 'Litecoin',
      'matic-network': 'Polygon',
      'hyperliquid': 'Hyperliquid'
    };
    return cryptoNames[crypto] || crypto.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
      {/* Achievement Header */}
      <div className={`${achievement.color} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <AchievementIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{achievement.label}</h3>
              <p className="text-white/80 text-sm">{achievement.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{accuracyPercentage.toFixed(1)}%</div>
            <div className="text-white/80 text-sm">Accuracy</div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Prediction Summary */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-lg">{formatCrypto(prediction.cryptocurrency)}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(prediction.submissionTime)}
            </div>
          </div>
          <div className="text-right">
            <div className="flex gap-2">
              <Badge variant="secondary" className={achievement.textColor}>
                {rewardMultiplier.toFixed(1)}x
              </Badge>
              <Badge variant="outline">
                +{profitAmount.toLocaleString()} NTIQ
              </Badge>
            </div>
          </div>
        </div>

        {/* Price Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Predicted</div>
            <div className="font-semibold">${prediction.predictedPrice.toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Actual</div>
            <div className="font-semibold">${prediction.actualPrice.toLocaleString()}</div>
          </div>
        </div>

        {/* Reward Details */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Reward</span>
          </div>
          <div className="font-semibold text-green-600">
            {prediction.rewardAmount.toLocaleString()} NTIQ
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <SocialShare 
            prediction={prediction}
            trigger={
              <Button className="flex-1" size="sm">
                Share Achievement
              </Button>
            }
          />
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}