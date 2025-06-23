import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroStats } from "@/components/hero-stats";
import { PredictionForm } from "@/components/prediction-form";
import { ActivePredictions } from "@/components/active-predictions";
import { LivePrices } from "@/components/live-prices";
import { TopPredictors } from "@/components/top-predictors";
import { RecentRewards } from "@/components/recent-rewards";
import { RulesSection } from "@/components/rules-section";
import CryptoChart from "@/components/crypto-chart";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Target } from "lucide-react";
import type { CryptoPrice } from "@/types";

export default function Dashboard() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoPrice | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [preSelectedForPrediction, setPreSelectedForPrediction] = useState<string | undefined>(undefined);

  const handleCryptoSelect = (crypto: CryptoPrice) => {
    setSelectedCrypto(crypto);
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Live Prices */}
          <div className="lg:col-span-1">
            <LivePrices 
              onCryptoSelect={handleCryptoSelect}
              onPredictClick={handlePredictClick}
            />
          </div>

          {/* Main Content - Center */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Section */}
            {selectedCrypto && showChart ? (
              <div className="space-y-4">
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
            
            {/* Prediction Form */}
            {showPredictionForm && (
              <div data-prediction-form>
                <PredictionForm 
                  preSelectedCrypto={preSelectedForPrediction} 
                  onClose={() => setShowPredictionForm(false)}
                />
              </div>
            )}

            {/* Active Predictions */}
            <ActivePredictions />
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <TopPredictors />
            <RecentRewards />
          </div>
        </div>
        
        <RulesSection />
      </main>
      
      <Footer />
    </div>
  );
}
