import { TrendingUp, Target, Zap, Award, Clock, Trophy, Users } from "lucide-react";

interface EngagementPlaceholderProps {
  type: 'predictions' | 'rewards' | 'activities' | 'battles';
  className?: string;
}

const placeholderContent = {
  predictions: {
    icon: Target,
    title: "Make Your First Prediction",
    subtitle: "Start earning NTIQ rewards",
    gradient: "from-blue-500 to-purple-600",
    accentColor: "blue-400",
    tips: [
      { icon: TrendingUp, text: "Choose from 10+ cryptocurrencies", color: "text-blue-400" },
      { icon: Clock, text: "Multiple time frames: 1h, 6h, 24h, 7d", color: "text-green-400" },
      { icon: Award, text: "Up to 5x multiplier for ±0.1% accuracy", color: "text-yellow-400" }
    ]
  },
  rewards: {
    icon: Award,
    title: "Your Rewards Await",
    subtitle: "Earn NTIQ for accurate predictions",
    gradient: "from-green-500 to-emerald-600",
    accentColor: "green-400",
    tips: [
      { icon: Zap, text: "Perfect predictions: 5x stake reward", color: "text-green-400" },
      { icon: Trophy, text: "Battle victories: Win opponent stakes", color: "text-purple-400" },
      { icon: Target, text: "Accuracy threshold: 90% minimum", color: "text-blue-400" }
    ]
  },
  activities: {
    icon: Zap,
    title: "Platform Activity",
    subtitle: "Live updates from all users",
    gradient: "from-orange-500 to-red-600",
    accentColor: "orange-400",
    tips: [
      { icon: Users, text: "Real-time prediction tracking", color: "text-orange-400" },
      { icon: Trophy, text: "Battle results and victories", color: "text-yellow-400" },
      { icon: Award, text: "Achievement unlocks", color: "text-green-400" }
    ]
  },
  battles: {
    icon: Trophy,
    title: "Join Prediction Battles",
    subtitle: "Challenge other predictors",
    gradient: "from-purple-500 to-pink-600",
    accentColor: "purple-400",
    tips: [
      { icon: Target, text: "Head-to-head price predictions", color: "text-purple-400" },
      { icon: Zap, text: "Winner takes both stakes", color: "text-pink-400" },
      { icon: Clock, text: "Multiple timeframes available", color: "text-blue-400" }
    ]
  }
};

export function EngagementPlaceholder({ type, className = "" }: EngagementPlaceholderProps) {
  const content = placeholderContent[type];
  const IconComponent = content.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main icon and title */}
      <div className="text-center py-4">
        <div className="relative mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${content.gradient} rounded-xl mx-auto flex items-center justify-center shadow-lg`}>
            <IconComponent className="text-white" size={24} />
          </div>
          <div className={`absolute -top-1 -right-1 w-4 h-4 bg-${content.accentColor} rounded-full animate-pulse shadow-md`}></div>
        </div>
        <h4 className="text-base font-semibold text-white mb-2">{content.title}</h4>
        <p className="text-sm text-slate-400 mb-4">{content.subtitle}</p>
      </div>
      
      {/* Feature tips */}
      <div className="space-y-2">
        {content.tips.map((tip, index) => {
          const TipIcon = tip.icon;
          return (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <div className={`w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0`}>
                <TipIcon className={tip.color} size={12} />
              </div>
              <p className="text-xs text-slate-300">{tip.text}</p>
            </div>
          );
        })}
      </div>
      
      {/* CTA hint */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          {type === 'predictions' && "Select a cryptocurrency above to get started"}
          {type === 'rewards' && "Make predictions to start earning rewards"}
          {type === 'activities' && "Live data updates every few seconds"}
          {type === 'battles' && "Visit Battles page to create or join challenges"}
        </p>
      </div>
    </div>
  );
}