import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3, Expand, Activity } from 'lucide-react';
import FinancialMetrics from '@/components/financial-metrics';
import { useQuery } from '@tanstack/react-query';

// TradingView symbol mapping untuk cryptocurrency
const getTradingViewSymbol = (cryptoId: string): string => {
  const symbolMapping: Record<string, string> = {
    'bitcoin': 'BINANCE:BTCUSDT',
    'ethereum': 'BINANCE:ETHUSDT', 
    'binancecoin': 'BINANCE:BNBUSDT',
    'cardano': 'BINANCE:ADAUSDT',
    'solana': 'BINANCE:SOLUSDT',
    'aave': 'BINANCE:AAVEUSDT',
    'litecoin': 'BINANCE:LTCUSDT',
    'avalanche-2': 'BINANCE:AVAXUSDT',
    'matic-network': 'BINANCE:MATICUSDT',
    'chainlink': 'BINANCE:LINKUSDT',
    'hyperliquid': 'BINANCE:BTCUSDT', // Fallback ke BTC jika tidak ada
  };
  
  return symbolMapping[cryptoId] || 'BINANCE:BTCUSDT';
};

interface TradingViewChartProps {
  cryptoId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  onPredictClick?: (cryptoId: string) => void;
}

const TradingViewChart = ({ 
  cryptoId, 
  symbol, 
  name, 
  currentPrice, 
  priceChange24h,
  onPredictClick 
}: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cryptoLogo, setCryptoLogo] = useState<string>('');
  const [showPythOverlay, setShowPythOverlay] = useState(true);
  const interval = 'D'; // Default 1 day - fixed since TradingView has built-in controls

  // Fetch real-time Pyth Network prices
  const { data: pythPrices, isLoading: pythLoading } = useQuery({
    queryKey: ['/api/crypto/pyth-prices'],
    refetchInterval: 3000, // Update every 3 seconds for real-time data
    staleTime: 1000,
  });

  // Get current crypto data from Pyth Network
  const currentPythData = pythPrices?.find((p: any) => p.id === cryptoId);
  
  // Fetch cryptocurrency logo from crypto prices API
  const fetchCryptoLogo = async () => {
    try {
      const response = await fetch('/api/crypto/prices');
      if (response.ok) {
        const cryptos = await response.json();
        const crypto = cryptos.find((c: any) => c.id === cryptoId);
        if (crypto && crypto.image) {
          setCryptoLogo(crypto.image);
        }
      }
    } catch (error) {
      console.error('Error fetching crypto logo:', error);
    }
  };

  useEffect(() => {
    fetchCryptoLogo();
  }, [cryptoId]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous chart
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    const tradingViewSymbol = getTradingViewSymbol(cryptoId);
    
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tradingViewSymbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1", // Candlestick
      locale: "en",
      toolbar_bg: "#1a1a1a",
      enable_publishing: false,
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: "tradingview_chart",
      // Advanced features
      details: true,
      hotlist: false,
      studies: [
        "Volume@tv-basicstudies",
        "RSI@tv-basicstudies"
      ],
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      // Custom styling
      backgroundColor: "rgba(0, 0, 0, 0)",
      gridColor: "rgba(255, 255, 255, 0.06)",
      scaleColor: "rgba(255, 255, 255, 0.6)"
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [cryptoId, interval]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className="bg-surface border-surface-light h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {cryptoLogo && (
                <img 
                  src={cryptoLogo} 
                  alt={name} 
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  {name} ({symbol.toUpperCase()})
                  {currentPythData && (
                    <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                      Pyth Live
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-400">TradingView Chart</p>
                  {currentPythData && (
                    <div className="flex items-center gap-2 text-xs">
                      <Activity size={12} className="text-green-400" />
                      <span className="text-green-400">
                        ${currentPythData.price?.toFixed(8)} 
                        {currentPythData.confidence && (
                          <span className="text-gray-500 ml-1">±${currentPythData.confidence.toFixed(8)}</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentPythData && (
                <Button
                  variant={showPythOverlay ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPythOverlay(!showPythOverlay)}
                  className={`text-white border-surface-light ${showPythOverlay ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-surface-light'}`}
                >
                  <Activity size={16} />
                  {showPythOverlay ? 'Hide' : 'Show'} Pyth
                </Button>
              )}
              <Button
                variant="outline" 
                size="sm"
                onClick={toggleFullscreen}
                className="text-white border-surface-light hover:bg-surface-light"
              >
                <Expand size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 relative">
          <div className={`${isFullscreen ? 'h-screen' : 'h-96'} w-full`}>
            <div 
              ref={containerRef}
              className="tradingview-widget-container"
              style={{ height: "100%", width: "100%" }}
            >
              <div 
                className="tradingview-widget-container__widget"
                id="tradingview_chart"
              ></div>
            </div>
            
            {/* Pyth Network Price Overlay */}
            {showPythOverlay && currentPythData && !pythLoading && (
              <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-green-400" />
                  <span className="text-green-400 text-sm font-semibold">Pyth Network Live</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400 text-xs">Price:</span>
                    <span className="text-white font-mono text-sm">
                      ${currentPythData.price?.toFixed(8)}
                    </span>
                  </div>
                  {currentPythData.confidence && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-400 text-xs">Confidence:</span>
                      <span className="text-green-400 font-mono text-xs">
                        ±${currentPythData.confidence.toFixed(8)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400 text-xs">Updated:</span>
                    <span className="text-gray-300 font-mono text-xs">
                      {new Date(currentPythData.timestamp || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-gray-700">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs">Live Feed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator for Pyth data */}
            {showPythOverlay && pythLoading && (
              <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-400 text-sm">Loading Pyth data...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Make Prediction Button - positioned below chart */}
      {onPredictClick && !isFullscreen && (
        <div className="mt-4">
          <Button 
            onClick={() => onPredictClick(cryptoId)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg w-full"
            size="lg"
          >
            <Target size={20} className="mr-3" />
            Make Prediction
          </Button>
        </div>
      )}

      {/* Financial Metrics - hanya tampil jika tidak fullscreen */}
      {!isFullscreen && (
        <div className="mt-6">
          <FinancialMetrics cryptoId={cryptoId} symbol={symbol} />
        </div>
      )}
    </div>
  );
};

export default TradingViewChart;