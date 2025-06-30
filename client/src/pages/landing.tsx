import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { TrendingUp, Trophy, Zap, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Content */}
      <main className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Logo and Title Section */}
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <Coins className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="text-foreground text-3xl font-bold">Nectiq</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Cryptocurrency
              <br />
              <span className="text-primary">Price Predictions</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Make predictions, earn rewards, and compete in our gamified crypto prediction platform.
            </p>
          </div>

          {/* Wallet Connection Card */}
          <div className="max-w-md mx-auto mb-16">
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-card-foreground">
                  Connect Wallet to Continue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DynamicWidget />
                <p className="text-sm text-muted-foreground text-center">
                  Connect your wallet to access all features
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
              <CardHeader className="text-center">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-card-foreground">Predict Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Make accurate cryptocurrency price predictions across multiple timeframes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
              <CardHeader className="text-center">
                <Trophy className="w-12 h-12 text-secondary mx-auto mb-4" />
                <CardTitle className="text-card-foreground">Earn Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Get NTIQ tokens for successful predictions with up to 5x multipliers
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
              <CardHeader className="text-center">
                <Zap className="w-12 h-12 text-warning mx-auto mb-4" />
                <CardTitle className="text-card-foreground">Compete</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Join tournaments, battles, and climb leaderboards in survival mode
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}