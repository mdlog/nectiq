import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3, Expand } from 'lucide-react';
import FinancialMetrics from '@/components/financial-metrics';

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
    'monero': 'BINANCE:XMRUSDT',
    'uniswap': 'BINANCE:UNIUSDT',
    'ripple': 'BINANCE:XRPUSDT',
    'bittensor': 'BINANCE:BTCUSDT', // TAO tidak tersedia di Binance, fallback ke BTC
    'hyperliquid': 'BINANCE:BTCUSDT', // HYPE tidak tersedia di Binance, fallback ke BTC
    'polkadot': 'BINANCE:DOTUSDT',
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
  const interval = 'D'; // Default 1 day - fixed since TradingView has built-in controls
  
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
    console.log(`🔄 TradingView Chart Update: ${cryptoId} -> ${tradingViewSymbol}`);
    
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
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg text-white">{name} ({symbol.toUpperCase()})</CardTitle>
                  <span className="text-xl font-bold text-white">
                    ${currentPrice.toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 6 
                    })}
                  </span>
                  <span className={`flex items-center text-sm font-medium ${
                    priceChange24h >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {priceChange24h >= 0 ? (
                      <TrendingUp size={14} className="mr-1" />
                    ) : (
                      <TrendingDown size={14} className="mr-1" />
                    )}
                    {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
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
        
        <CardContent className="p-0">
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