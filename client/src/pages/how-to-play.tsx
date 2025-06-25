import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  Award, 
  Target, 
  Clock, 
  DollarSign, 
  Users, 
  Trophy,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Star,
  Zap
} from "lucide-react";
import { useLocation } from "wouter";

export default function HowToPlay() {
  const [, setLocation] = useLocation();

  const cryptoSupported = [
    { name: "Bitcoin", symbol: "BTC", color: "bg-orange-500" },
    { name: "Ethereum", symbol: "ETH", color: "bg-blue-500" },
    { name: "BNB", symbol: "BNB", color: "bg-yellow-500" },
    { name: "Cardano", symbol: "ADA", color: "bg-blue-600" },
    { name: "Solana", symbol: "SOL", color: "bg-purple-500" },
    { name: "Chainlink", symbol: "LINK", color: "bg-blue-400" },
    { name: "Polkadot", symbol: "DOT", color: "bg-pink-500" },
    { name: "Litecoin", symbol: "LTC", color: "bg-gray-500" }
  ];

  const timeframes = [
    { duration: "1 Hour", multiplier: "1.5x", difficulty: "Easy" },
    { duration: "6 Hours", multiplier: "2x", difficulty: "Medium" },
    { duration: "24 Hours", multiplier: "3x", difficulty: "Hard" },
    { duration: "7 Days", multiplier: "5x", difficulty: "Expert" }
  ];

  const accuracyRewards = [
    { range: "±0.1%", multiplier: "5x", reward: "Perfect Prediction", color: "bg-green-500" },
    { range: "±0.5%", multiplier: "4x", reward: "Excellent", color: "bg-blue-500" },
    { range: "±1%", multiplier: "3x", reward: "Great", color: "bg-purple-500" },
    { range: "±2%", multiplier: "2x", reward: "Good", color: "bg-orange-500" },
    { range: "±5%", multiplier: "1.5x", reward: "Fair", color: "bg-yellow-500" },
    { range: ">5%", multiplier: "1x", reward: "Base", color: "bg-gray-500" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/20 via-background to-background border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              How to Play Nectiq
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Master the art of cryptocurrency price prediction and earn NTIQ rewards. 
              Learn the rules, strategies, and tips to become a top predictor.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => setLocation("/")} 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
              >
                <Target className="mr-2 h-5 w-5" />
                Start Predicting
              </Button>
              <Button 
                onClick={() => setLocation("/leaderboard")} 
                variant="outline" 
                size="lg"
              >
                <Trophy className="mr-2 h-5 w-5" />
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        {/* Quick Start Guide */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Quick Start Guide</h2>
            <p className="text-muted-foreground">Get started in just 4 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">1. Connect Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect your Web3 wallet (MetaMask, WalletConnect) to start playing. 
                  New users get automatically registered.
                </p>
              </CardContent>
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">Step 1</Badge>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">2. Choose Crypto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select from 8 supported cryptocurrencies and pick your preferred 
                  prediction timeframe (1h to 7 days).
                </p>
              </CardContent>
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">Step 2</Badge>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">3. Make Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Predict the future price and stake NTIQ points (1-500). 
                  Higher stakes mean higher potential rewards.
                </p>
              </CardContent>
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">Step 3</Badge>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg">4. Earn Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Wait for the prediction deadline and earn NTIQ rewards based on 
                  your accuracy. Perfect predictions get 5x multiplier!
                </p>
              </CardContent>
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">Step 4</Badge>
              </div>
            </Card>
          </div>
        </section>

        {/* Supported Cryptocurrencies */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Supported Cryptocurrencies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cryptoSupported.map((crypto) => (
              <Card key={crypto.symbol} className="text-center">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 ${crypto.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white font-bold">{crypto.symbol}</span>
                  </div>
                  <h3 className="font-semibold">{crypto.name}</h3>
                  <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Prediction Timeframes */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Prediction Timeframes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeframes.map((timeframe, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Clock className="w-6 h-6 text-primary" />
                    <Badge variant={
                      timeframe.difficulty === "Easy" ? "default" :
                      timeframe.difficulty === "Medium" ? "secondary" :
                      timeframe.difficulty === "Hard" ? "destructive" : "outline"
                    }>
                      {timeframe.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{timeframe.duration}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Base Multiplier:</span>
                      <span className="font-semibold text-green-500">{timeframe.multiplier}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Longer timeframes offer higher base rewards but require more patience and skill.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Reward System */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Reward System</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Accuracy Multipliers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accuracyRewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${reward.color} rounded-full`}></div>
                        <div>
                          <div className="font-medium">{reward.range}</div>
                          <div className="text-xs text-muted-foreground">{reward.reward}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-bold">
                        {reward.multiplier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-blue-500" />
                  Calculation Formula
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-surface-light p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Final Reward =</div>
                    <div className="font-mono text-lg">
                      Stake × Timeframe × Accuracy
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Minimum Stake:</span>
                    <span className="font-medium">1 NTIQ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Maximum Stake:</span>
                    <span className="font-medium">500 NTIQ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Maximum Multiplier:</span>
                    <span className="font-medium text-green-500">25x (7d × 5x accuracy)</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-sm">
                    <strong>Example:</strong> 100 NTIQ stake on 24h prediction with ±0.1% accuracy = 
                    <span className="text-green-500 font-bold"> 1,500 NTIQ reward</span>
                    <div className="text-xs text-muted-foreground mt-1">
                      (100 × 3x timeframe × 5x accuracy = 1,500)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tips & Strategies */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Tips & Strategies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Study price charts and historical patterns
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Follow crypto news and market sentiment
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Use technical indicators for better accuracy
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Target className="mr-2 h-5 w-5 text-blue-500" />
                  Stake Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Start with smaller stakes while learning
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Increase stakes on high-confidence predictions
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Diversify across different timeframes
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5 text-purple-500" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Check leaderboard for top predictors
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Learn from successful prediction patterns
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Share achievements on social media
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Important Notes */}
        <section>
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-600">
                <AlertCircle className="mr-2 h-5 w-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start">
                <Info className="mr-2 h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Prediction Deadline:</strong> Predictions are automatically resolved at the specified deadline. 
                  Late submissions are not accepted.
                </p>
              </div>
              <div className="flex items-start">
                <Info className="mr-2 h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Price Source:</strong> All prices are sourced from CoinGecko API for fairness and accuracy.
                </p>
              </div>
              <div className="flex items-start">
                <Info className="mr-2 h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Rewards Distribution:</strong> NTIQ rewards are automatically calculated and distributed 
                  when predictions are resolved.
                </p>
              </div>
              <div className="flex items-start">
                <Info className="mr-2 h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Minimum Balance:</strong> Ensure you have sufficient NTIQ balance before making predictions. 
                  Staked amounts are locked until resolution.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Predicting?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of users who are already earning NTIQ rewards through accurate 
                cryptocurrency price predictions. Start your journey today!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => setLocation("/")} 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Make Your First Prediction
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => setLocation("/dashboard")} 
                  variant="outline" 
                  size="lg"
                >
                  <Users className="mr-2 h-5 w-5" />
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}