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
  const [preSelectedForPrediction, setPreSelectedForPrediction] = useState<string | undefined>(undefined);

  const handleCryptoSelect = (crypto: CryptoPrice) => {
    setSelectedCrypto(crypto);
    setShowChart(true);
  };

  const handlePredictClick = (cryptoId: string) => {
    setPreSelectedForPrediction(cryptoId);
    // Scroll to prediction form
    const form = document.querySelector('[data-prediction-form]');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Interactive Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Live Prices - Interactive Selection */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2" size={20} />
                    Select Cryptocurrency for Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LivePrices onCryptoSelect={handleCryptoSelect} />
                </CardContent>
              </Card>

              {/* Interactive Chart */}
              {selectedCrypto && showChart ? (
                <div className="space-y-4">

                  <CryptoChart
                    cryptoId={selectedCrypto.id}
                    symbol={selectedCrypto.symbol}
                    name={selectedCrypto.name}
                    currentPrice={selectedCrypto.current_price}
                    priceChange24h={selectedCrypto.price_change_percentage_24h}
                  />
                  
                  {/* Quick Action */}
                  <Card className="bg-surface border-surface-light">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={selectedCrypto.image} 
                            alt={selectedCrypto.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-semibold">{selectedCrypto.symbol}</p>
                            <p className="text-sm text-slate-400">${selectedCrypto.current_price.toLocaleString()}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePredictClick(selectedCrypto.id)}
                          className="flex items-center space-x-2"
                        >
                          <Target size={14} />
                          <span>Predict {selectedCrypto.symbol}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-surface border-surface-light">
                  <CardContent className="text-center py-12">
                    <BarChart3 className="mx-auto mb-4 text-slate-400" size={48} />
                    <h3 className="text-lg font-semibold mb-2">Interactive Price Charts</h3>
                    <p className="text-slate-400 mb-4">
                      Click on any cryptocurrency to view its interactive price chart
                    </p>
                    <div className="text-sm text-slate-500">
                      <p>• Real-time price data analysis</p>
                      <p>• Multiple timeframe views</p>
                      <p>• Seamless prediction workflow</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div data-prediction-form>
              <PredictionForm preSelectedCrypto={preSelectedForPrediction} />
            </div>
            <ActivePredictions />
          </div>
          
          <div className="space-y-6">
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
