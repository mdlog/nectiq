import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Trophy, Zap, Shield, TrendingUp, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Nectiq</h1>
                <p className="text-blue-200 text-sm">Crypto Prediction Platform</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">How It Works</a>
              <a href="#rewards" className="text-white/80 hover:text-white transition-colors">Rewards</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Predict Crypto Prices,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}Earn NTIQ Rewards
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
              Join the ultimate cryptocurrency prediction platform. Battle other traders, 
              participate in survival tournaments, and earn rewards for accurate predictions.
            </p>
            
            {/* Login Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Start Predicting Now</h3>
              <div className="space-y-4">
                <DynamicWidget />
                <p className="text-sm text-blue-200">
                  Connect your wallet to access all features
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Platform Features</h2>
            <p className="text-xl text-blue-200">Everything you need for crypto prediction gaming</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-blue-400 mb-4" />
                <CardTitle className="text-white">Price Predictions</CardTitle>
                <CardDescription className="text-blue-200">
                  Predict cryptocurrency prices across multiple timeframes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• 1 hour to 7 day predictions</li>
                  <li>• Real-time price tracking</li>
                  <li>• Accuracy-based rewards</li>
                  <li>• Multiple cryptocurrencies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <Trophy className="w-12 h-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Prediction Battles</CardTitle>
                <CardDescription className="text-blue-200">
                  Challenge other traders in head-to-head prediction duels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Real-time battle system</li>
                  <li>• Stake NTIQ tokens</li>
                  <li>• Winner takes all</li>
                  <li>• Live spectator mode</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <Zap className="w-12 h-12 text-yellow-400 mb-4" />
                <CardTitle className="text-white">Survival Tournaments</CardTitle>
                <CardDescription className="text-blue-200">
                  Battle royale-style prediction tournaments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Multiple elimination rounds</li>
                  <li>• Growing prize pools</li>
                  <li>• Last survivor wins all</li>
                  <li>• Strategic gameplay</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <Shield className="w-12 h-12 text-green-400 mb-4" />
                <CardTitle className="text-white">Secure & Fair</CardTitle>
                <CardDescription className="text-blue-200">
                  Advanced security and anti-abuse systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Wallet-based authentication</li>
                  <li>• Anti-multi-wallet protection</li>
                  <li>• Real-time price feeds</li>
                  <li>• Transparent rewards</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <Coins className="w-12 h-12 text-orange-400 mb-4" />
                <CardTitle className="text-white">NTIQ Rewards</CardTitle>
                <CardDescription className="text-blue-200">
                  Earn platform tokens for accurate predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• 5x multiplier for perfect predictions</li>
                  <li>• Daily challenge bonuses</li>
                  <li>• Achievement rewards</li>
                  <li>• Leaderboard rankings</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <Users className="w-12 h-12 text-pink-400 mb-4" />
                <CardTitle className="text-white">Social Features</CardTitle>
                <CardDescription className="text-blue-200">
                  Connect with the prediction community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Global leaderboards</li>
                  <li>• User profiles</li>
                  <li>• Performance tracking</li>
                  <li>• Achievement sharing</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-blue-200">Simple steps to start earning</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Choose & Predict</h3>
                <p className="text-blue-200">
                  Select a cryptocurrency and predict its price movement. 
                  Choose your timeframe and stake NTIQ tokens.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Wait & Track</h3>
                <p className="text-blue-200">
                  Monitor your predictions in real-time. Watch live price updates 
                  and see how close you are to the target.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Earn Rewards</h3>
                <p className="text-blue-200">
                  Get rewarded based on prediction accuracy. Perfect predictions 
                  earn 5x multiplier, great ones get 3x.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Reward System</h2>
            <p className="text-xl text-blue-200">Earn more with better accuracy</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30">
                <CardHeader className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">5x</div>
                  <CardTitle className="text-white">Perfect</CardTitle>
                  <CardDescription className="text-green-200">±0.1% accuracy</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30">
                <CardHeader className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">3x</div>
                  <CardTitle className="text-white">Great</CardTitle>
                  <CardDescription className="text-blue-200">±1% accuracy</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
                <CardHeader className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">1.5x</div>
                  <CardTitle className="text-white">Good</CardTitle>
                  <CardDescription className="text-yellow-200">±5% accuracy</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black/50 backdrop-blur-md border-t border-white/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Nectiq</span>
            </div>
            <p className="text-blue-200 mb-4">
              The ultimate cryptocurrency prediction platform
            </p>
            <p className="text-sm text-blue-300">
              © 2025 Nectiq. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}