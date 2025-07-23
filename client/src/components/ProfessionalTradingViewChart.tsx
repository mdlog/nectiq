import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Expand, Minimize, TrendingUp, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ProfessionalTradingViewChartProps {
  cryptoId: string;
  onPredictionClick?: () => void;
}

interface PythPriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  confidence_interval: number;
  last_updated: string;
}

// Symbol mapping untuk TradingView
const cryptoSymbolMap: Record<string, string> = {
  'bitcoin': 'BTCUSD',
  'ethereum': 'ETHUSD',
  'binancecoin': 'BNBUSD',
  'solana': 'SOLUSD',
  'chainlink': 'LINKUSD',
  'avalanche-2': 'AVAXUSD',
  'litecoin': 'LTCUSD',
  'bitcoin-cash': 'BCHUSD',
  'ethereum-classic': 'ETCUSD',
  'aptos': 'APTUSD',
  'sui': 'SUIUSD',
  'hyperliquid': 'HYPERUSD',
  'okb': 'OKBUSD'
};

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function ProfessionalTradingViewChart({ 
  cryptoId, 
  onPredictionClick 
}: ProfessionalTradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState('1H');

  // Fetch Pyth Network prices untuk header info
  const { data: pythData } = useQuery<PythPriceData[]>({
    queryKey: ['/api/crypto/pyth-prices'],
    refetchInterval: 3000,
  });

  // Fetch crypto data untuk logo dan metadata
  const { data: cryptoData } = useQuery<any[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 60000,
    staleTime: 45000,
  });

  const currentCryptoData = pythData?.find((crypto: PythPriceData) => crypto.id === cryptoId);
  const cryptoInfo = cryptoData?.find((c: any) => c.id === cryptoId);
  const tradingViewSymbol = cryptoSymbolMap[cryptoId] || 'BTCUSD';

  // Load TradingView script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      setIsLoading(false);
      initWidget();
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize TradingView widget
  const initWidget = () => {
    if (!containerRef.current || !window.TradingView) return;

    // Clear existing widget
    if (widgetRef.current) {
      widgetRef.current = null;
    }
    
    containerRef.current.innerHTML = '';

    try {
      widgetRef.current = new window.TradingView.widget({
        container_id: containerRef.current.id || 'tradingview-widget',
        width: '100%',
        height: isFullscreen ? window.innerHeight - 200 : 500,
        symbol: `BINANCE:${tradingViewSymbol}`,
        interval: selectedInterval,
        timezone: 'Asia/Jakarta',
        theme: 'dark',
        style: '1', // Candlestick
        locale: 'en',
        toolbar_bg: '#1a1a1a',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        studies: [
          'Volume@tv-basicstudies',
          'RSI@tv-basicstudies',
          'MACD@tv-basicstudies'
        ],
        overrides: {
          // Dark theme customization
          'paneProperties.background': '#0f0f0f',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.gridProperties.color': '#1f1f1f',
          'scalesProperties.textColor': '#ffffff',
          'scalesProperties.backgroundColor': '#1a1a1a',
          'mainSeriesProperties.candleStyle.upColor': '#00d4aa',
          'mainSeriesProperties.candleStyle.downColor': '#f84960',
          'mainSeriesProperties.candleStyle.borderUpColor': '#00d4aa',
          'mainSeriesProperties.candleStyle.borderDownColor': '#f84960',
          'mainSeriesProperties.candleStyle.wickUpColor': '#00d4aa',
          'mainSeriesProperties.candleStyle.wickDownColor': '#f84960',
        },
        loading_screen: {
          backgroundColor: '#0f0f0f',
          foregroundColor: '#00d4aa'
        },
        disabled_features: [
          'header_symbol_search',
          'symbol_search_hot_key',
          'header_screenshot',
          'header_chart_type'
        ],
        enabled_features: [
          'hide_left_toolbar_by_default'
        ]
      });
    } catch (error) {
      console.error('Error initializing TradingView widget:', error);
    }
  };

  // Reinitialize when symbol or interval changes
  useEffect(() => {
    if (!isLoading && window.TradingView) {
      const timer = setTimeout(initWidget, 100);
      return () => clearTimeout(timer);
    }
  }, [cryptoId, selectedInterval, isFullscreen, isLoading]);

  // Set unique container ID
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.id = `tradingview-${cryptoId}-${Date.now()}`;
    }
  }, [cryptoId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const intervals = [
    { value: '1', label: '1M' },
    { value: '5', label: '5M' },
    { value: '15', label: '15M' },
    { value: '60', label: '1H' },
    { value: '240', label: '4H' },
    { value: '1D', label: '1D' },
  ];

  return (
    <div className={`bg-surface rounded-lg border border-surface-light ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
    }`}>
      {/* Header dengan crypto info dan controls */}
      <div className="flex items-center justify-between p-4 border-b border-surface-light">
        <div className="flex items-center space-x-4">
          {/* Crypto Info */}
          <div className="flex items-center space-x-3">
            {cryptoInfo?.image && (
              <img 
                src={cryptoInfo.image} 
                alt={cryptoInfo?.name || cryptoId}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-accent">
                {cryptoInfo?.name || currentCryptoData?.name || cryptoId.toUpperCase()}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{cryptoInfo?.symbol?.toUpperCase() || currentCryptoData?.symbol}</span>
                {currentCryptoData && (
                  <>
                    <span>•</span>
                    <span className="text-accent font-mono">
                      ${currentCryptoData.current_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* TradingView Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
            <BarChart3 size={16} className="text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">TradingView Professional</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Interval Selector */}
          <div className="flex items-center space-x-1">
            {intervals.map((interval) => (
              <Button
                key={interval.value}
                variant={selectedInterval === interval.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedInterval(interval.value)}
                className={`px-2 py-1 text-xs ${
                  selectedInterval === interval.value
                    ? 'bg-accent/20 text-accent border-accent/30'
                    : 'text-gray-400 hover:text-white hover:bg-surface-light'
                }`}
              >
                {interval.label}
              </Button>
            ))}
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white border-surface-light hover:bg-surface-light"
          >
            {isFullscreen ? <Minimize size={16} /> : <Expand size={16} />}
          </Button>
        </div>
      </div>

      {/* TradingView Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="text-sm text-gray-400">Loading Professional Chart...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={containerRef}
          className={`w-full ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[500px]'} bg-surface`}
        />
      </div>

      {/* Prediction Button */}
      {onPredictionClick && (
        <div className="p-4 border-t border-surface-light">
          <Button
            onClick={onPredictionClick}
            className="w-full bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-600 text-white font-semibold py-3 transition-all duration-200"
          >
            <TrendingUp size={18} className="mr-2" />
            Make Price Prediction
          </Button>
        </div>
      )}
    </div>
  );
}