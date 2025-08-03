import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Zap, CheckCircle } from 'lucide-react';
import { sanitizeInput } from '../lib/security';

interface SocialPreviewProps {
  prediction: {
    cryptocurrency: string;
    predictedPrice: number;
    actualPrice: number;
    accuracyScore: number;
    rewardAmount: number;
    stakeAmount: number;
  };
  message: string;
}

export function SocialPreview({ prediction, message }: SocialPreviewProps) {
  const accuracyPercentage = (prediction.accuracyScore / 10000) * 100;
  const rewardMultiplier = prediction.rewardAmount / prediction.stakeAmount;
  
  const getAchievement = () => {
    if (accuracyPercentage >= 99.9) return {
      icon: Trophy,
      label: 'Perfect Predictor',
      color: 'bg-yellow-500'
    };
    if (accuracyPercentage >= 99) return {
      icon: Target,
      label: 'Sharpshooter',
      color: 'bg-orange-500'
    };
    if (accuracyPercentage >= 95) return {
      icon: Zap,
      label: 'Accuracy Master',
      color: 'bg-blue-500'
    };
    return {
      icon: CheckCircle,
      label: 'Skilled Trader',
      color: 'bg-green-500'
    };
  };

  const achievement = getAchievement();
  const AchievementIcon = achievement.icon;

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-4">
        {/* Social Media Preview */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${achievement.color} flex items-center justify-center`}>
              <AchievementIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-semibold">Nectiq Achievement</div>
              <div className="text-sm text-muted-foreground">{achievement.label}</div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="text-sm leading-relaxed border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 dark:bg-blue-950">
            {sanitizeInput(message)}
          </div>

          {/* Stats */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">
              {accuracyPercentage.toFixed(2)}% Accuracy
            </Badge>
            <Badge variant="outline">
              {rewardMultiplier.toFixed(1)}x Rewards
            </Badge>
            <Badge variant="outline">
              {prediction.rewardAmount.toLocaleString()} NTIQ
            </Badge>
          </div>

          {/* Nectiq Branding */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Join the crypto prediction challenge at Nectiq
          </div>
        </div>
      </CardContent>
    </Card>
  );
}