import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroStats } from "@/components/hero-stats";
import { PredictionForm } from "@/components/prediction-form";
import { ActivePredictions } from "@/components/active-predictions";
import { LivePrices } from "@/components/live-prices";
import { TopPredictors } from "@/components/top-predictors";
import { RecentRewards } from "@/components/recent-rewards";

import { PredictionBattles } from "@/components/prediction-battles";
import { BannerSection } from "@/components/banner-section";
import { EventsSection } from "@/components/events-section";
import { SimpleActivityFeed } from "@/components/simple-activity-feed";
import CryptoChart from "@/components/crypto-chart";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Target } from "lucide-react";
import type { CryptoPrice } from "@/types";

// Running Price Ticker Component for Dashboard
function DashboardPriceTicker() {
  const { data: prices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 15000, // Reduced to 15 seconds to prevent rate limiting
    refetchIntervalInBackground: true,
    staleTime: 10000, // 10 seconds
    retry: 2, // Retry failed requests
  });

  if (!prices.length) return null;

  return (
    <div className="bg-surface border border-surface-light rounded-lg overflow-hidden">
      <div className="ticker-container py-4">
        <div className="ticker-content animate-scroll">
          {/* Triple the array to create longer seamless loop */}
          {[...prices, ...prices, ...prices].map((crypto, index) => {
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

export default function Dashboard() {
  const [selectedCryptoId, setSelectedCryptoId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [preSelectedForPrediction, setPreSelectedForPrediction] = useState<string | undefined>(undefined);

  // Fetch live prices for real-time updates
  const { data: livePrices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 500, // Ultra-fast updates every 0.5 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  // Auto-select Bitcoin as default when prices are loaded
  useEffect(() => {
    if (livePrices.length > 0 && !selectedCryptoId) {
      const bitcoin = livePrices.find(crypto => crypto.id === 'bitcoin');
      if (bitcoin) {
        setSelectedCryptoId('bitcoin');
        setShowChart(true);
      }
    }
  }, [livePrices, selectedCryptoId]);

  // Find the currently selected crypto from live prices
  const selectedCrypto = selectedCryptoId 
    ? livePrices.find(crypto => crypto.id === selectedCryptoId) 
    : null;

  const handleCryptoSelect = (crypto: CryptoPrice) => {
    setSelectedCryptoId(crypto.id);
    setShowChart(true);
  };

  const handlePredictClick = (cryptoId: string) => {
    setPreSelectedForPrediction(cryptoId);
    setShowPredictionForm(true);
    // Scroll to prediction form
    setTimeout(() => {
      const form = document.querySelector('[data-prediction-form]');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-6">
          {/* Left Sidebar - Live Prices */}
          <div className="lg:col-span-1 space-y-6">
            <LivePrices 
              onCryptoSelect={handleCryptoSelect}
              onPredictClick={handlePredictClick}
            />
            
            {/* Banner Section - Below Live Prices */}
            <BannerSection position="below_live_prices" />
          </div>

          {/* Main Content - Center */}
          <div className="lg:col-span-2 space-y-3 md:space-y-6">
            {/* Chart Section */}
            {selectedCrypto && showChart ? (
              <div className="space-y-2 md:space-y-4">
                <CryptoChart
                  cryptoId={selectedCrypto.id}
                  symbol={selectedCrypto.symbol}
                  name={selectedCrypto.name}
                  currentPrice={selectedCrypto.current_price}
                  priceChange24h={selectedCrypto.price_change_percentage_24h}
                  onPredictClick={handlePredictClick}
                />
              </div>
            ) : (
              <Card className="bg-surface-light border-border-subtle">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Select a Cryptocurrency
                  </h3>
                  <p className="text-gray-500">
                    Choose a cryptocurrency from Live Prices to view its interactive chart and start making predictions.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Active Predictions */}
            <div className="mt-8">
              <ActivePredictions />
            </div>
            
            {/* Events Section */}
            <div className="mt-8">
              <EventsSection />
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <TopPredictors />
            <RecentRewards />
          </div>
        </div>
        
        {/* Live Activity Feed */}
        <div className="mt-8">
          <SimpleActivityFeed />
        </div>
        
        {/* Running Price Ticker */}
        <div className="mt-12">
          <DashboardPriceTicker />
        </div>
      </main>
      
      {/* Prediction Form Modal */}
      {showPredictionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-surface-light rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Make New Prediction</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPredictionForm(false);
                  setPreSelectedForPrediction(undefined);
                }}
                className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full w-8 h-8 p-0"
              >
                ×
              </Button>
            </div>
            <PredictionForm 
              preSelectedCrypto={preSelectedForPrediction}
              onSuccess={() => {
                setShowPredictionForm(false);
                setPreSelectedForPrediction(undefined);
              }}
            />
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
