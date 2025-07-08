import { TrendingUp, Trophy, Zap, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import nectiqLogo from "@/assets/nectiq-logo.png";

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image?: string;
}

function CryptoPriceTicker() {
  const { data: prices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 2000, // Update every 2 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  if (!prices.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-800 overflow-hidden">
      <div className="ticker-container py-3">
        <div className="ticker-content flex items-center space-x-8 animate-scroll">
          {/* Duplicate the array to create seamless loop */}
          {[...prices, ...prices].map((crypto, index) => {
            const isPositive = crypto.price_change_percentage_24h >= 0;
            return (
              <div key={`${crypto.id}-${index}`} className="flex items-center space-x-3 text-sm whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <img 
                    src={crypto.image || `https://coin-images.coingecko.com/coins/images/${
                      crypto.id === 'bitcoin' ? '1' : 
                      crypto.id === 'ethereum' ? '279' : 
                      crypto.id === 'binancecoin' ? '825' : 
                      crypto.id === 'cardano' ? '975' : 
                      crypto.id === 'solana' ? '4128' : 
                      crypto.id === 'chainlink' ? '877' : 
                      crypto.id === 'polkadot' ? '12171' : 
                      crypto.id === 'litecoin' ? '2' : 
                      crypto.id === 'matic-network' ? '4713' : 
                      crypto.id === 'tron' ? '1094' : 
                      crypto.id === 'stellar' ? '100' : 
                      crypto.id === 'hyperliquid' ? '44077' : 
                      crypto.id === 'sahara-ai' ? '66681' : '1'
                    }/large/${crypto.id}.png`} 
                    alt={crypto.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-white font-medium">{crypto.symbol.toUpperCase()}</span>
                </div>
                <span className="text-gray-300">
                  ${crypto.current_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: crypto.current_price >= 1 ? 2 : 6
                  })}
                </span>
                <span className={`${isPositive ? 'text-green-400' : 'text-red-400'} font-medium`}>
                  {isPositive ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LandingHeader() {
  const [, setLocation] = useLocation();
  
  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleGetStarted = () => {
    if (user) {
      // User is logged in, redirect to Home page
      setLocation("/home");
    } else {
      // User is not logged in, redirect to wallet login page
      setLocation("/wallet-login");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={nectiqLogo} 
              alt="Nectiq" 
              className="h-10 rounded-lg"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                mixBlendMode: 'screen'
              }}
            />
          </div>

          {/* Navigation - Simple for landing page */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>

          {/* Login/Sign Up Button */}
          <div className="flex items-center">
            <Button 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Login or Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Header */}
      <LandingHeader />
      
      {/* Main Content */}
      <main className="px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-16">
            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              Cryptocurrency
              <br />
              <span className="text-primary">Price Predictions</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Make predictions, earn rewards, and compete in our gamified crypto prediction platform.
            </p>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-6 mb-16">
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

          {/* About Section */}
          <div id="about" className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">About Nectiq</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nectiq combines the excitement of gaming with the potential of cryptocurrency markets. 
                Our platform offers multiple ways to engage with crypto predictions, from individual challenges 
                to competitive battles and survival tournaments.
              </p>
            </div>
          </div>



          {/* Contact Section */}
          <div id="contact" className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">
              Have questions? We're here to help you get started with crypto predictions.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Email: support@nectiq.com
              </p>
              <p className="text-sm text-muted-foreground">
                Follow us on social media for updates and tips
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Crypto Price Ticker at Bottom */}
      <CryptoPriceTicker />
    </div>
  );
}