import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroStats } from "@/components/hero-stats";
import { PredictionForm } from "@/components/prediction-form";
import { ActivePredictions } from "@/components/active-predictions";
import { LivePrices } from "@/components/live-prices";
import { TopPredictors } from "@/components/top-predictors";
import { RecentRewards } from "@/components/recent-rewards";

import { useWalletRequired } from "@/hooks/useWalletRequired";

import { PredictionBattles } from "@/components/prediction-battles";
import { BannerSection } from "@/components/banner-section";
import { EventsSection } from "@/components/events-section";
import { SimpleActivityFeed } from "@/components/simple-activity-feed";
import TradingViewChart from "@/components/TradingViewChart";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Target, TrendingUp, Users, Award, Zap } from "lucide-react";
import type { CryptoPrice } from "@/types";
import type { User as UserType } from "@shared/schema";



export default function Dashboard() {
  const [selectedCryptoId, setSelectedCryptoId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [preSelectedForPrediction, setPreSelectedForPrediction] = useState<string | undefined>(undefined);
  
  // Check authentication state
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnMount: true,
  });
  
  const isAuthenticated = !!user;
  
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

  // Create different content based on authentication state
  const renderUnauthenticatedHome = () => (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section for Unauthenticated Users */}
        <div className="text-center py-12 mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Welcome to Nectiq
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Accuracy-based cryptocurrency price prediction platform. Predict prices, join battles, and earn NTIQ tokens.
          </p>
        </div>

        {/* Live Prices - Always Visible */}
        <div className="mb-8">
          <LivePrices onCryptoSelect={handleCryptoSelect} />
        </div>

        {/* Chart Section - Always Visible */}
        {showChart && selectedCrypto && (
          <div className="mb-20">
            <Card>
              <CardContent className="p-0">
                <div className="h-96">
                  <TradingViewChart 
                    cryptoId={selectedCrypto.id}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Cards for Unauthenticated Users */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-16">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Price Prediction</h3>
            <p className="text-muted-foreground text-sm">
              Predict cryptocurrency prices across various timeframes and earn rewards based on accuracy
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Battle Mode</h3>
            <p className="text-muted-foreground text-sm">
              Challenge other users in prediction battles and win total rewards from both parties
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">NTIQ Rewards</h3>
            <p className="text-muted-foreground text-sm">
              Earn NTIQ tokens as rewards for accurate predictions and use them for various platform features
            </p>
          </Card>
        </div>

        {/* Platform Stats */}
        <HeroStats />

        {/* Call to Action */}
        <div className="text-center py-12 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet and start participating in the cryptocurrency prediction platform
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );

  const renderAuthenticatedHome = () => (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 md:py-8">
        {/* Live Prices Section - Moved to Top */}
        <div className="mb-4 sm:mb-6">
          <LivePrices 
            onCryptoSelect={handleCryptoSelect}
            onPredictClick={handlePredictClick}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Chart Section (Now Takes More Space) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Section */}
            {selectedCrypto && showChart ? (
              <>
                <Card>
                  <CardContent className="p-0">
                    <div className="h-96">
                      <TradingViewChart
                        cryptoId={selectedCrypto.id}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Tombol Predict di bawah chart */}
                <div className="mb-6">
                  <Button 
                    onClick={() => selectedCrypto && handlePredictClick(selectedCrypto.id)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Buat Prediksi
                  </Button>
                </div>
              </>
            ) : (
              <Card className="bg-surface-light border-border-subtle mb-6">
                <CardContent className="p-4 sm:p-8 text-center">
                  <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-300 mb-2">
                    Select a Cryptocurrency
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    Choose a cryptocurrency from Live Prices to view its interactive chart and start making predictions.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Active Predictions */}
            <ActivePredictions />
            
            {/* Events Section */}
            <EventsSection />
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
      
      {/* Wallet requirement functionality removed */}
    </div>
  );

  // Return different content based on authentication
  return isAuthenticated ? renderAuthenticatedHome() : renderUnauthenticatedHome();
}
