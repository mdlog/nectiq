import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
  Zap,
  Swords,
  Shield
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function HowToPlay() {
  const [, setLocation] = useLocation();

  // Fetch real crypto prices for logos
  const { data: cryptoPrices } = useQuery<any[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 2000
  });

  const cryptoSupported = [
    { name: "Bitcoin", symbol: "BTC", id: "bitcoin", color: "bg-orange-500" },
    { name: "Ethereum", symbol: "ETH", id: "ethereum", color: "bg-blue-500" },
    { name: "BNB", symbol: "BNB", id: "binancecoin", color: "bg-yellow-500" },
    { name: "Cardano", symbol: "ADA", id: "cardano", color: "bg-blue-600" },
    { name: "Solana", symbol: "SOL", id: "solana", color: "bg-purple-500" },
    { name: "Chainlink", symbol: "LINK", id: "chainlink", color: "bg-blue-400" },
    { name: "Polkadot", symbol: "DOT", id: "polkadot", color: "bg-pink-500" },
    { name: "Litecoin", symbol: "LTC", id: "litecoin", color: "bg-gray-500" }
  ];

  // Function to get cryptocurrency logo URL
  function getCryptoImageUrl(cryptoId: string): string {
    // First try to get image from real-time crypto data
    if (cryptoPrices && Array.isArray(cryptoPrices)) {
      const cryptoData = cryptoPrices.find((crypto: any) => crypto.id === cryptoId);
      if (cryptoData?.image) {
        return cryptoData.image;
      }
    }
    
    // Fallback: Static mapping for supported cryptocurrencies
    const commonIds: Record<string, string> = {
      'bitcoin': '1',
      'ethereum': '279',
      'binancecoin': '825',
      'cardano': '975',
      'solana': '4128',
      'chainlink': '877',
      'polkadot': '12171',
      'litecoin': '2'
    };
    
    const imageId = commonIds[cryptoId] || '1';
    return `https://coin-images.coingecko.com/coins/images/${imageId}/large/${cryptoId}.png`;
  }

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
      <Header />
      
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

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Navigation Tabs */}
        <Tabs defaultValue="prediction" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="prediction" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Prediction
            </TabsTrigger>
            <TabsTrigger value="battle" className="flex items-center gap-2">
              <Swords className="h-4 w-4" />
              Battle Mode
            </TabsTrigger>
            <TabsTrigger value="survival" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Survival
            </TabsTrigger>
          </TabsList>

          {/* Prediction Tab Content */}
          <TabsContent value="prediction" className="space-y-12">
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
                  your accuracy. ≥99.5% accuracy gets 3x multiplier!
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
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <img 
                      src={getCryptoImageUrl(crypto.id)} 
                      alt={crypto.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        // Simple fallback: replace with symbol text
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `
                            <div class="w-12 h-12 ${crypto.color} rounded-full flex items-center justify-center">
                              <span class="text-white font-bold text-xs">${crypto.symbol}</span>
                            </div>
                          `;
                        }
                      }}
                    />
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

        {/* How It Works */}
        <section>
          <Card className="bg-surface border-surface-light">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center">
                <Info className="mr-2 h-6 w-6 text-primary" />
                How It Works
              </h2>
              
              {/* Simple 3-Step Process */}
              <div className="flex items-center justify-between max-w-4xl mx-auto mb-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="text-primary" size={24} />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Choose & Predict</h4>
                  <p className="text-sm text-muted-foreground">Pick crypto + target price</p>
                </div>
                
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-8"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                    <Clock className="text-secondary" size={24} />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Wait & Track</h4>
                  <p className="text-sm text-muted-foreground">5min to 24 hours</p>
                </div>
                
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-8"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Award className="text-green-500" size={24} />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Earn Rewards</h4>
                  <p className="text-sm text-muted-foreground">Up to 5x multiplier</p>
                </div>
              </div>

              {/* Compact Reward System */}
              <div className="bg-gradient-to-r from-primary/5 to-green-500/5 rounded-lg border border-primary/10 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-white text-xs">≥99.5% Accuracy</span>
                    <span className="text-emerald-500 font-bold text-lg">3.0x</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-white text-xs">≥98% Accuracy</span>
                    <span className="text-blue-500 font-bold text-lg">2.5x</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-white text-xs">≥95% Accuracy</span>
                    <span className="text-green-500 font-bold text-lg">2.0x</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-white text-xs">≥90% Accuracy</span>
                    <span className="text-yellow-500 font-bold text-lg">1.0x</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Minimum 90% accuracy required for rewards • Stake 1-500 NTIQ • Withdraw to USDT/USDC
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Calculation Formula */}
        <section>
          <Card className="bg-surface border-surface-light">
            <CardHeader>
              <CardTitle className="flex items-center text-center justify-center">
                <Zap className="mr-2 h-6 w-6 text-blue-500" />
                Calculation Formula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Accuracy Calculation */}
              <div className="bg-surface-light p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-4 text-center">How Accuracy is Calculated</h4>
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-sm text-muted-foreground mb-2">New Accuracy Formula:</div>
                      <div className="font-mono text-lg">
                        (1 - |Predicted Price - Actual Price| / Actual Price) × 100%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                      <h5 className="font-semibold text-emerald-500 mb-2">Example: Perfect Prediction</h5>
                      <div className="text-sm space-y-1">
                        <div>Predicted: $57,000</div>
                        <div>Actual: $58,600</div>
                        <div className="font-mono">(1 - |57,000 - 58,600| / 58,600) × 100% = 97.27%</div>
                        <div className="text-emerald-500 font-bold">Result: ≥95% = 2.0x Multiplier</div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-500 mb-2">Example: Good Prediction</h5>
                      <div className="text-sm space-y-1">
                        <div>Predicted: $50,000</div>
                        <div>Actual: $55,000</div>
                        <div className="font-mono">(1 - |50,000 - 55,000| / 55,000) × 100% = 90.91%</div>
                        <div className="text-yellow-500 font-bold">Result: ≥90% = 1.0x Multiplier</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Reward Calculation */}
              <div className="bg-surface-light p-6 rounded-lg">
                <h4 className="font-semibold text-lg mb-4 text-center">Final Reward Calculation</h4>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="text-sm text-muted-foreground mb-2">Final Reward Formula:</div>
                    <div className="font-mono text-xl">
                      Stake × Timeframe Multiplier × Accuracy Multiplier
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-muted-foreground">Timeframe Multipliers:</div>
                      <div className="space-y-1 mt-2">
                        <div>1 Hour: 1.5x</div>
                        <div>6 Hours: 2x</div>
                        <div>24 Hours: 3x</div>
                        <div>7 Days: 5x</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Accuracy Multipliers:</div>
                      <div className="space-y-1 mt-2">
                        <div>≥99.5%: 3.0x</div>
                        <div>≥98%: 2.5x</div>
                        <div>≥95%: 2.0x</div>
                        <div>≥90%: 1.0x</div>
                        <div>&lt;90%: 0x</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Maximum Possible:</div>
                      <div className="space-y-1 mt-2">
                        <div className="text-green-500 font-bold">500 NTIQ × 5x × 3x</div>
                        <div className="text-green-500 font-bold">= 7,500 NTIQ</div>
                        <div className="text-xs text-muted-foreground">(7-day ≥99.5% accuracy)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

          </TabsContent>

          {/* Battle Mode Tab Content */}
          <TabsContent value="battle" className="space-y-12">
            {/* Battle Mode Guide */}
            <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">How to Play: Prediction Battles</h2>
            <p className="text-muted-foreground">Challenge other players in head-to-head prediction battles</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Users className="mr-2 h-5 w-5" />
                  Creating a Battle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium">Select Cryptocurrency</p>
                      <p className="text-sm text-muted-foreground">Choose any supported crypto from the dropdown menu</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium">Set Battle Duration</p>
                      <p className="text-sm text-muted-foreground">Choose timeframe: 1 hour, 6 hours, 24 hours, or 7 days</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium">Set Stake Amount</p>
                      <p className="text-sm text-muted-foreground">Stake between 50-500 NTIQ (both players stake same amount)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</div>
                    <div>
                      <p className="font-medium">Make Price Prediction</p>
                      <p className="text-sm text-muted-foreground">Enter your predicted price for the end of the battle period</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <Target className="mr-2 h-5 w-5" />
                  Joining a Battle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium">Browse Open Battles</p>
                      <p className="text-sm text-muted-foreground">View available battles on the Battles page</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium">Check Battle Details</p>
                      <p className="text-sm text-muted-foreground">Review cryptocurrency, stake amount, and time remaining</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium">Join Before Deadline</p>
                      <p className="text-sm text-muted-foreground">Join within first 80% of battle duration to ensure fairness</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</div>
                    <div>
                      <p className="font-medium">Make Your Prediction</p>
                      <p className="text-sm text-muted-foreground">Enter your price prediction and confirm to join the battle</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Award className="mr-2 h-5 w-5" />
                Battle Results & Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Winner Takes All</h4>
                  <p className="text-sm text-muted-foreground">
                    Player with most accurate prediction wins both stakes (2x their original stake)
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Tie Scenario</h4>
                  <p className="text-sm text-muted-foreground">
                    If predictions are equally accurate (±0.01%), both players get their stakes refunded
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Fairness System</h4>
                  <p className="text-sm text-muted-foreground">
                    Anti-gaming features prevent last-minute joining and ensure fair competition
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

          </TabsContent>

          {/* Survival Tournament Tab Content */}
          <TabsContent value="survival" className="space-y-12">
            {/* Survival Tournament Guide */}
            <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">How to Play: Survival Tournaments</h2>
            <p className="text-muted-foreground">Battle royale-style prediction tournaments with elimination rounds</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <Users className="mr-2 h-5 w-5" />
                  Tournament Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">R1</div>
                    <div>
                      <p className="font-medium">Round 1 (15 minutes)</p>
                      <p className="text-sm text-muted-foreground">All participants predict UP or DOWN price movement</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">R2</div>
                    <div>
                      <p className="font-medium">Round 2 (30 minutes)</p>
                      <p className="text-sm text-muted-foreground">Survivors continue with longer prediction window</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">R3</div>
                    <div>
                      <p className="font-medium">Round 3 (1 hour)</p>
                      <p className="text-sm text-muted-foreground">Final round - maximum 3 rounds total</p>
                    </div>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Wrong predictions result in immediate elimination!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <Target className="mr-2 h-5 w-5" />
                  How to Participate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium">Join Tournament</p>
                      <p className="text-sm text-muted-foreground">Pay entry fee (varies per tournament) to participate</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium">Make Predictions</p>
                      <p className="text-sm text-muted-foreground">Choose UP or DOWN for each round before time expires</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium">Survive Elimination</p>
                      <p className="text-sm text-muted-foreground">Correct predictions advance you to the next round</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</div>
                    <div>
                      <p className="font-medium">Win Prize Rewards</p>
                      <p className="text-sm text-muted-foreground">Single survivor wins all, multiple survivors share the prize pool equally</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-purple-500/20 bg-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <Trophy className="mr-2 h-5 w-5" />
                Prize Pool & Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-sm">Entry Fees</h4>
                  <p className="text-xs text-muted-foreground">All entry fees form the prize pool</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-sm">Single Winner</h4>
                  <p className="text-xs text-muted-foreground">One survivor gets entire pool</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-sm">Prize Sharing</h4>
                  <p className="text-xs text-muted-foreground">Multiple survivors split pool equally</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                  <h4 className="font-semibold text-sm">Max 3 Rounds</h4>
                  <p className="text-xs text-muted-foreground">Tournament ends after Round 3</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                <h4 className="font-semibold mb-3 text-center">Prize Distribution Examples</h4>
                <div className="text-sm space-y-3">
                  <div className="text-center">
                    <p className="font-medium text-green-600">Single Winner Scenario:</p>
                    <p>10 players × 100 NTIQ = 1,000 NTIQ prize pool</p>
                    <p className="text-green-600">1 survivor wins full 1,000 NTIQ</p>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
                  <div className="text-center">
                    <p className="font-medium text-blue-600">Prize Sharing Scenario:</p>
                    <p>10 players × 100 NTIQ = 1,000 NTIQ prize pool</p>
                    <p className="text-blue-600">3 survivors each get 333 NTIQ (shared equally)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

          </TabsContent>
        </Tabs>

        {/* Shared sections outside tabs */}
        <div className="mt-12 space-y-12">
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
      
      <Footer />
    </div>
  );
}