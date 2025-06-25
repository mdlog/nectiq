import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Coins, 
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from "lucide-react";

export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How to Play CryptoPredikt</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn how to make accurate cryptocurrency price predictions and earn rewards in our gamified platform.
            </p>
          </div>

          {/* Quick Start Guide */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    1
                  </div>
                  <h3 className="font-semibold mb-2 text-black dark:text-white">Choose Crypto</h3>
                  <p className="text-sm text-black dark:text-muted-foreground">Select from Bitcoin, Ethereum, BNB, Cardano, or Solana</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    2
                  </div>
                  <h3 className="font-semibold mb-2 text-black dark:text-white">Predict Price</h3>
                  <p className="text-sm text-black dark:text-muted-foreground">Enter your predicted price for the selected timeframe</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    3
                  </div>
                  <h3 className="font-semibold mb-2 text-black dark:text-white">Set Stake</h3>
                  <p className="text-sm text-black dark:text-muted-foreground">Choose your stake amount (10-1000 points)</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    4
                  </div>
                  <h3 className="font-semibold mb-2 text-black dark:text-white">Earn Rewards</h3>
                  <p className="text-sm text-black dark:text-muted-foreground">Get rewards based on your prediction accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeframes */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2" />
                Prediction Timeframes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <Badge variant="secondary" className="mb-2">1 Hour</Badge>
                  <p className="text-sm text-muted-foreground">Fast-paced predictions for quick market movements</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge variant="secondary" className="mb-2">6 Hours</Badge>
                  <p className="text-sm text-muted-foreground">Medium-term predictions for intraday trends</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge variant="secondary" className="mb-2">24 Hours</Badge>
                  <p className="text-sm text-muted-foreground">Daily predictions for overnight market changes</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge variant="secondary" className="mb-2">7 Days</Badge>
                  <p className="text-sm text-muted-foreground">Weekly predictions for longer market cycles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward System */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2" />
                Tiered Reward System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center">
                    <Star className="text-yellow-500 mr-3" />
                    <div>
                      <h4 className="font-semibold">Perfect Prediction</h4>
                      <p className="text-sm text-muted-foreground">Within ±0.1% of actual price</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500 text-black">5x Stake</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center">
                    <TrendingUp className="text-green-500 mr-3" />
                    <div>
                      <h4 className="font-semibold">Excellent Prediction</h4>
                      <p className="text-sm text-muted-foreground">Within ±1% of actual price</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">3x Stake</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center">
                    <CheckCircle className="text-blue-500 mr-3" />
                    <div>
                      <h4 className="font-semibold">Good Prediction</h4>
                      <p className="text-sm text-muted-foreground">Within ±5% of actual price</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">1.5x Stake</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center">
                    <AlertTriangle className="text-red-500 mr-3" />
                    <div>
                      <h4 className="font-semibold">Poor Prediction</h4>
                      <p className="text-sm text-muted-foreground">More than ±5% difference</p>
                    </div>
                  </div>
                  <Badge variant="destructive">0x Stake</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Tips */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2" />
                Strategy Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">Best Practices</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      Study market trends and recent price movements
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      Start with smaller stakes while learning
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      Consider multiple timeframes for different strategies
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      Track your accuracy over time to improve
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Common Mistakes</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <AlertTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      Making predictions based on emotions
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      Staking too much on uncertain predictions
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      Ignoring market volatility and news events
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      Not diversifying across different cryptocurrencies
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supported Cryptocurrencies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="mr-2" />
                Supported Cryptocurrencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    ₿
                  </div>
                  <h4 className="font-semibold">Bitcoin</h4>
                  <p className="text-xs text-muted-foreground">BTC</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    Ξ
                  </div>
                  <h4 className="font-semibold">Ethereum</h4>
                  <p className="text-xs text-muted-foreground">ETH</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    B
                  </div>
                  <h4 className="font-semibold">BNB</h4>
                  <p className="text-xs text-muted-foreground">BNB</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    A
                  </div>
                  <h4 className="font-semibold">Cardano</h4>
                  <p className="text-xs text-muted-foreground">ADA</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    S
                  </div>
                  <h4 className="font-semibold">Solana</h4>
                  <p className="text-xs text-muted-foreground">SOL</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-600">
                <AlertTriangle className="mr-2" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <ul className="space-y-2 text-sm">
                  <li>• This platform is for entertainment and educational purposes only</li>
                  <li>• All predictions are made with virtual points, not real money</li>
                  <li>• Cryptocurrency markets are highly volatile and unpredictable</li>
                  <li>• Past performance does not guarantee future results</li>
                  <li>• Always do your own research before making real investments</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}