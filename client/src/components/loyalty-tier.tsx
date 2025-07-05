import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Zap, Gift, Shield, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TierInfo {
  tierName: string;
  minEarnings: number;
  maxEarnings: number | null;
  rewardMultiplier: number;
  cashbackPercentage: number;
  monthlyBonus: number;
  freeInsuranceDaily: number;
  prioritySupport: boolean;
  earlyAccess: boolean;
  personalManager: boolean;
}

interface UserTierData {
  currentTier: string;
  lifetimeEarnings: number;
  nextTier: string | null;
  nextTierRequirement: number | null;
  progressPercentage: number;
  currentBenefits: TierInfo;
  nextTierBenefits: TierInfo | null;
}

const tierColors = {
  bronze: "from-orange-600 to-amber-700",
  silver: "from-gray-400 to-slate-500", 
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-purple-400 to-pink-500"
};

const tierIcons = {
  bronze: Crown,
  silver: Star,
  gold: Zap,
  platinum: Gift
};

export function LoyaltyTier() {
  const { data: tierData, isLoading } = useQuery<UserTierData>({
    queryKey: ['/api/user/tier'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading || !tierData) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Loyalty Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const TierIcon = tierIcons[tierData.currentTier as keyof typeof tierIcons] || Crown;
  const tierGradient = tierColors[tierData.currentTier as keyof typeof tierColors];

  return (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${tierGradient} opacity-10`}></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${tierGradient}`}>
                <TierIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold capitalize">{tierData.currentTier} Tier</h3>
                <p className="text-sm text-muted-foreground">
                  {tierData.lifetimeEarnings.toLocaleString()} NTIQ Lifetime Earnings
                </p>
              </div>
            </div>
            <Badge variant="secondary" className={`bg-gradient-to-r ${tierGradient} text-white border-0`}>
              {tierData.currentBenefits.rewardMultiplier}x Multiplier
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* Progress to Next Tier */}
          {tierData.nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {tierData.nextTier}</span>
                <span className="font-medium">{tierData.progressPercentage}%</span>
              </div>
              <Progress value={tierData.progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Need {(tierData.nextTierRequirement! - tierData.lifetimeEarnings).toLocaleString()} more NTIQ
              </p>
            </div>
          )}

          {/* Current Benefits */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>{(tierData.currentBenefits.rewardMultiplier * 100 - 100)}% Bonus Rewards</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>{tierData.currentBenefits.cashbackPercentage}% Cashback</span>
            </div>
            {tierData.currentBenefits.monthlyBonus > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4 text-purple-500" />
                <span>{tierData.currentBenefits.monthlyBonus} NTIQ/month</span>
              </div>
            )}
            {tierData.currentBenefits.freeInsuranceDaily > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>{tierData.currentBenefits.freeInsuranceDaily} Free Insurance/day</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Tier Preview */}
      {tierData.nextTier && tierData.nextTierBenefits && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Unlock {tierData.nextTier} Tier Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {(tierData.nextTierBenefits.rewardMultiplier * 100 - 100)}% Bonus Rewards
                    <Badge variant="outline" className="ml-2 text-xs">
                      +{((tierData.nextTierBenefits.rewardMultiplier - tierData.currentBenefits.rewardMultiplier) * 100).toFixed(0)}%
                    </Badge>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {tierData.nextTierBenefits.cashbackPercentage}% Cashback
                    <Badge variant="outline" className="ml-2 text-xs">
                      +{(tierData.nextTierBenefits.cashbackPercentage - tierData.currentBenefits.cashbackPercentage).toFixed(1)}%
                    </Badge>
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {tierData.nextTierBenefits.monthlyBonus > 0 && (
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">
                      {tierData.nextTierBenefits.monthlyBonus} NTIQ/month
                      {tierData.currentBenefits.monthlyBonus === 0 && (
                        <Badge variant="outline" className="ml-2 text-xs text-green-600">NEW!</Badge>
                      )}
                    </span>
                  </div>
                )}
                {tierData.nextTierBenefits.freeInsuranceDaily > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">
                      {tierData.nextTierBenefits.freeInsuranceDaily} Free Insurance/day
                      {tierData.currentBenefits.freeInsuranceDaily === 0 && (
                        <Badge variant="outline" className="ml-2 text-xs text-green-600">NEW!</Badge>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border border-primary/10">
              <p className="text-sm text-center">
                Earn <span className="font-bold">{(tierData.nextTierRequirement! - tierData.lifetimeEarnings).toLocaleString()} more NTIQ</span> to unlock {tierData.nextTier} tier benefits!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loyalty Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tier) => {
              const isCurrentTier = tier === tierData.currentTier;
              const TierIconComponent = tierIcons[tier];
              const gradient = tierColors[tier];
              
              return (
                <div 
                  key={tier}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCurrentTier 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} ${!isCurrentTier ? 'opacity-50' : ''}`}>
                      <TierIconComponent className="h-5 w-5 text-white" />
                    </div>
                    <h4 className={`text-sm font-semibold capitalize ${isCurrentTier ? 'text-primary' : 'text-muted-foreground'}`}>
                      {tier}
                    </h4>
                    {isCurrentTier && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Tiers are based on lifetime NTIQ earnings and provide permanent benefits
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}