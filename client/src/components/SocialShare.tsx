import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Copy, 
  Trophy, 
  TrendingUp, 
  Target,
  Sword,
  Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareData {
  type: 'prediction' | 'battle' | 'survival';
  title: string;
  result: string;
  accuracy?: number;
  reward?: number;
  crypto?: string;
  timeframe?: string;
  position?: number;
  battleOpponent?: string;
  survivalRound?: number;
  eliminatedPlayers?: number;
}

interface SocialShareProps {
  data: ShareData;
  compact?: boolean;
}

export function SocialShare({ data, compact = false }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const generateShareText = (platform: 'twitter' | 'facebook' | 'general') => {
    const baseUrl = window.location.origin;
    const hashtags = platform === 'twitter' ? ' #Nectiq #CryptoPrediction #DeFi #Web3' : '';
    
    let text = '';
    let emoji = '';
    
    switch (data.type) {
      case 'prediction':
        emoji = data.accuracy && data.accuracy >= 90 ? '🎯' : data.accuracy && data.accuracy >= 70 ? '📈' : '💡';
        text = `${emoji} Just made a ${data.crypto} prediction on Nectiq!\n\n`;
        text += `🔮 Result: ${data.result}\n`;
        if (data.accuracy) text += `🎯 Accuracy: ${data.accuracy.toFixed(2)}%\n`;
        if (data.reward) text += `💰 Reward: ${data.reward} NTIQ\n`;
        if (data.timeframe) {
          // Check if timeframe contains price prediction details
          if (data.timeframe.includes('Predicted:')) {
            text += `📊 ${data.timeframe}\n`;
          } else {
            text += `⏰ Timeframe: ${data.timeframe}\n`;
          }
        }
        text += `\n🚀 Join the crypto prediction game!`;
        break;
        
      case 'battle':
        emoji = data.result === 'won' ? '👑' : data.result === 'lost' ? '⚔️' : '🤝';
        text = `${emoji} Battle completed on Nectiq!\n\n`;
        text += `⚔️ Result: ${data.result.toUpperCase()}\n`;
        if (data.battleOpponent) text += `🥊 vs ${data.battleOpponent}\n`;
        if (data.crypto) text += `💰 Asset: ${data.crypto}\n`;
        if (data.reward) text += `🏆 Reward: ${data.reward} NTIQ\n`;
        text += `\n🔥 Challenge other traders now!`;
        break;
        
      case 'survival':
        emoji = data.position && data.position <= 3 ? '🏆' : '🏃‍♂️';
        text = `${emoji} Survival Tournament completed!\n\n`;
        if (data.position) text += `🏅 Final Position: #${data.position}\n`;
        if (data.survivalRound) text += `🎯 Rounds Survived: ${data.survivalRound}\n`;
        if (data.eliminatedPlayers) text += `💥 Players Eliminated: ${data.eliminatedPlayers}\n`;
        if (data.reward) text += `💰 Prize: ${data.reward} NTIQ\n`;
        text += `\n🎮 Join the ultimate crypto survival game!`;
        break;
    }
    
    text += `\n\n🌐 ${baseUrl}${hashtags}`;
    return text;
  };

  const shareToTwitter = () => {
    const text = generateShareText('twitter');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const text = generateShareText('facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const copyToClipboard = () => {
    const text = generateShareText('general');
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Share text copied to clipboard",
      });
    });
  };

  const SharePreview = () => (
    <Card className="bg-slate-800 border-slate-700 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {data.type === 'prediction' && <Target className="h-6 w-6 text-white" />}
            {data.type === 'battle' && <Sword className="h-6 w-6 text-white" />}
            {data.type === 'survival' && <Crown className="h-6 w-6 text-white" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
              </Badge>
              {data.result === 'won' && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Trophy className="h-3 w-3 mr-1" />
                  Victory
                </Badge>
              )}
              {data.accuracy && data.accuracy >= 90 && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  High Accuracy
                </Badge>
              )}
            </div>
            <h3 className="text-white font-semibold mb-1">{data.title}</h3>
            <p className="text-slate-300 text-sm whitespace-pre-line">
              {generateShareText('general').split('\n\n🌐')[0]}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Share Your Achievement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <SharePreview />
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={shareToTwitter}
                className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                onClick={shareToFacebook}
                className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Achievement
          </h3>
        </div>
        
        <SharePreview />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            onClick={shareToTwitter}
            className="bg-blue-500 hover:bg-blue-600 text-white gap-2 flex-1"
          >
            <Twitter className="h-5 w-5" />
            Share on Twitter
          </Button>
          <Button
            onClick={shareToFacebook}
            className="bg-blue-700 hover:bg-blue-800 text-white gap-2 flex-1"
          >
            <Facebook className="h-5 w-5" />
            Share on Facebook
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="gap-2 flex-1"
          >
            <Copy className="h-5 w-5" />
            Copy Text
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to quickly generate share data
export const createShareData = {
  prediction: (crypto: string, result: string, accuracy?: number, reward?: number, timeframe?: string): ShareData => ({
    type: 'prediction',
    title: `${crypto} Prediction ${accuracy ? (accuracy >= 90 ? 'Perfect!' : 'Successful!') : 'Completed'}`,
    result,
    accuracy,
    reward,
    crypto,
    timeframe
  }),

  predictionWithDetails: (crypto: string, reward: number, accuracy: number, details: { predictedPrice?: string | null, actualPrice?: string | null, accuracy?: string }): ShareData => ({
    type: 'prediction',
    title: `${crypto} Prediction ${accuracy >= 90 ? 'Perfect!' : accuracy >= 70 ? 'Successful!' : 'Completed'}`,
    result: `Won ${reward} NTIQ with ${accuracy.toFixed(1)}% accuracy`,
    accuracy,
    reward,
    crypto,
    timeframe: details.predictedPrice && details.actualPrice ? `Predicted: $${parseFloat(details.predictedPrice).toLocaleString()} → Actual: $${parseFloat(details.actualPrice).toLocaleString()}` : undefined
  }),
  
  battle: (result: 'won' | 'lost' | 'tie', crypto: string, opponent?: string, reward?: number): ShareData => ({
    type: 'battle',
    title: `Crypto Battle ${result === 'won' ? 'Victory!' : result === 'lost' ? 'Fought Hard!' : 'Draw!'}`,
    result,
    crypto,
    battleOpponent: opponent,
    reward
  }),
  
  survival: (position: number, round: number, eliminated: number, reward?: number): ShareData => ({
    type: 'survival',
    title: `Survival Tournament ${position <= 3 ? 'Champion!' : 'Survivor!'}`,
    result: position <= 3 ? 'champion' : 'eliminated',
    position,
    survivalRound: round,
    eliminatedPlayers: eliminated,
    reward
  })
};