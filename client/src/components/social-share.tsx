import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Twitter, Facebook, Copy, CheckCircle, Trophy, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SocialPreview } from './social-preview';

interface SocialShareProps {
  prediction: {
    id: number;
    cryptocurrency: string;
    predictedPrice: number;
    actualPrice: number;
    accuracyScore: number;
    rewardAmount: number;
    stakeAmount: number;
  };
  trigger?: React.ReactNode;
}

export function SocialShare({ prediction, trigger }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  const accuracyPercentage = (prediction.accuracyScore / 10000) * 100;
  const rewardMultiplier = prediction.rewardAmount / prediction.stakeAmount;
  
  // Generate achievement badge based on accuracy
  const getAchievementBadge = () => {
    if (accuracyPercentage >= 99.9) return { icon: Trophy, label: 'Perfect Predictor', color: 'bg-yellow-500' };
    if (accuracyPercentage >= 99) return { icon: Target, label: 'Sharpshooter', color: 'bg-orange-500' };
    if (accuracyPercentage >= 95) return { icon: Zap, label: 'Accuracy Master', color: 'bg-blue-500' };
    if (accuracyPercentage >= 90) return { icon: CheckCircle, label: 'Skilled Trader', color: 'bg-green-500' };
    return { icon: CheckCircle, label: 'Good Prediction', color: 'bg-gray-500' };
  };

  const achievement = getAchievementBadge();
  const AchievementIcon = achievement.icon;

  // Format cryptocurrency name
  const formatCrypto = (crypto: string) => {
    const cryptoNames: Record<string, string> = {
      'bitcoin': 'Bitcoin (BTC)',
      'ethereum': 'Ethereum (ETH)',
      'binancecoin': 'BNB',
      'cardano': 'Cardano (ADA)',
      'solana': 'Solana (SOL)',
      'chainlink': 'Chainlink (LINK)',
      'polkadot': 'Polkadot (DOT)',
      'litecoin': 'Litecoin (LTC)',
      'matic-network': 'Polygon (MATIC)',
      'hyperliquid': 'Hyperliquid (HYPE)'
    };
    return cryptoNames[crypto] || crypto.toUpperCase();
  };

  // Generate default share messages
  const generateShareMessage = (platform: 'twitter' | 'facebook' | 'generic') => {
    const crypto = formatCrypto(prediction.cryptocurrency);
    const accuracy = accuracyPercentage.toFixed(2);
    const multiplier = rewardMultiplier.toFixed(1);
    
    const baseMessage = `🎯 Just nailed a ${crypto} prediction on @NectiqApp with ${accuracy}% accuracy! Earned ${multiplier}x rewards 💰`;
    
    switch (platform) {
      case 'twitter':
        return `${baseMessage}\n\n🏆 Achievement: ${achievement.label}\n💡 Predicted: $${prediction.predictedPrice.toLocaleString()}\n📈 Actual: $${prediction.actualPrice.toLocaleString()}\n\n#CryptoPrediction #Trading #Nectiq #Accuracy`;
      case 'facebook':
        return `${baseMessage}\n\nI just achieved ${achievement.label} status by accurately predicting ${crypto} price movement!\n\nPredicted: $${prediction.predictedPrice.toLocaleString()}\nActual: $${prediction.actualPrice.toLocaleString()}\nAccuracy: ${accuracy}%\nReward Multiplier: ${multiplier}x\n\nJoin me on Nectiq for crypto prediction challenges!`;
      default:
        return baseMessage;
    }
  };

  // Share URLs
  const shareUrls = {
    twitter: (message: string) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
    facebook: (message: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(message)}`,
  };

  const handleShare = (platform: 'twitter' | 'facebook') => {
    const message = customMessage || generateShareMessage(platform);
    const url = shareUrls[platform](message);
    window.open(url, '_blank', 'width=600,height=400');
    
    toast({
      title: "Shared!",
      description: `Opening ${platform} to share your achievement.`,
    });
  };

  const handleCopyLink = async () => {
    const message = customMessage || generateShareMessage('generic');
    const shareText = `${message}\n\nCheck out Nectiq: ${window.location.origin}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied!",
        description: "Share message copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the text above.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Achievement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Achievement
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Achievement Badge */}
          <div className="text-center space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-full ${achievement.color} flex items-center justify-center`}>
              <AchievementIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{achievement.label}</h3>
              <p className="text-sm text-muted-foreground">
                {accuracyPercentage.toFixed(2)}% accuracy on {formatCrypto(prediction.cryptocurrency)}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">
                {rewardMultiplier.toFixed(1)}x Rewards
              </Badge>
              <Badge variant="outline">
                {prediction.rewardAmount.toLocaleString()} NTIQ
              </Badge>
            </div>
          </div>

          {/* Prediction Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Predicted:</span>
              <span className="font-medium">${prediction.predictedPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Actual:</span>
              <span className="font-medium">${prediction.actualPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Error:</span>
              <span className="font-medium">{(100 - accuracyPercentage).toFixed(2)}%</span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <SocialPreview 
              prediction={prediction}
              message={customMessage || generateShareMessage('generic')}
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Customize your message (optional)</label>
            <Textarea
              placeholder={generateShareMessage('generic')}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleShare('twitter')}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => handleShare('facebook')}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
            
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}