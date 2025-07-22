import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroStats } from "@/components/hero-stats";
import { PredictionForm } from "@/components/prediction-form";
import { ActivePredictions } from "@/components/active-predictions";
import { LivePrices } from "@/components/live-prices";
import { TopPredictors } from "@/components/top-predictors";
import { RecentRewards } from "@/components/recent-rewards";
import { WalletRequiredModal } from "@/components/WalletRequiredModal";
import { useWalletRequired } from "@/hooks/useWalletRequired";

import { PredictionBattles } from "@/components/prediction-battles";
import { BannerSection } from "@/components/banner-section";
import { EventsSection } from "@/components/events-section";
import { SimpleActivityFeed } from "@/components/simple-activity-feed";
import ChartJSChart from "@/components/ChartJSChart";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Target } from "lucide-react";
import type { CryptoPrice } from "@/types";



export default function Dashboard() {
  const [selectedCryptoId, setSelectedCryptoId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [preSelectedForPrediction, setPreSelectedForPrediction] = useState<string | undefined>(undefined);
  
  // Wallet requirement system
  const { isModalOpen, actionType, checkWalletRequired, onWalletConnected, closeModal } = useWalletRequired();

  // Fetch live prices with optimized intervals to prevent rate limiting
  const { data: livePrices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 60000, // Reduced to 1 minute to prevent overwhelming server
    refetchIntervalInBackground: false, // Disable background updates
    staleTime: 45000, // 45 seconds stale time
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
    // Check if wallet is required before allowing prediction
    checkWalletRequired(() => {
      setPreSelectedForPrediction(cryptoId);
      setShowPredictionForm(true);
      // Scroll to prediction form
      setTimeout(() => {
        const form = document.querySelector('[data-prediction-form]');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, 'prediction');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 md:py-8">
        {/* Live Prices Section - Moved to Top */}
        <div className="mb-6">
          <LivePrices 
            onCryptoSelect={handleCryptoSelect}
            onPredictClick={handlePredictClick}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          {/* Main Content - Chart Section (Now Takes More Space) */}
          <div className="lg:col-span-2 space-y-3 md:space-y-6">
            {/* Chart Section */}
            {selectedCrypto && showChart ? (
              <div className="space-y-2 md:space-y-4">
                <ChartJSChart
                  cryptoId={selectedCrypto.id}
                  onPredictionClick={() => handlePredictClick(selectedCrypto.id)}
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
            <div className="mt-4">
              <ActivePredictions />
            </div>
            
            {/* Events Section */}
            <div className="mt-4">
              <EventsSection />
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="flex flex-col space-y-6 h-full min-h-[600px] sticky top-4">
              <div className="flex-1">
                <TopPredictors />
              </div>
              <div className="flex-1">
                <RecentRewards />
              </div>
            </div>
          </div>
        </div>

        {/* Banner Section - Horizontal Layout Above Live Activity */}
        <div className="mt-8">
          <BannerSection position="below_live_prices" className="horizontal-banners" />
        </div>
        
        {/* Live Activity Feed */}
        <div className="mt-6">
          <SimpleActivityFeed />
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
      
      {/* Wallet Required Modal */}
      <WalletRequiredModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onWalletConnected={onWalletConnected}
        actionType={actionType}
      />
    </div>
  );
}
