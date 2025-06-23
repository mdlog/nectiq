import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';

interface CryptoChartProps {
  cryptoId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  onPredictClick?: (cryptoId: string) => void;
}

// TradingView widget script injection
declare global {
  interface Window {
    TradingView: any;
  }
}

export default function CryptoChart({ cryptoId, symbol, name, currentPrice, priceChange24h, onPredictClick }: CryptoChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [interval, setInterval] = useState('1D');
  const [loading, setLoading] = useState(true);

  // Map crypto symbols to TradingView symbols
  const getTradingViewSymbol = (cryptoId: string, symbol: string): string => {
    const symbolMap: { [key: string]: string } = {
      'bitcoin': 'BTCUSD',
      'ethereum': 'ETHUSD',
      'binancecoin': 'BNBUSD',
      'cardano': 'ADAUSD',
      'solana': 'SOLUSD',
      'dogecoin': 'DOGEUSD',
      'ripple': 'XRPUSD',
      'polkadot': 'DOTUSD',
      'chainlink': 'LINKUSD',
      'litecoin': 'LTCUSD',
      'polygon': 'MATICUSD',
      'avalanche-2': 'AVAXUSD',
      'uniswap': 'UNIUSD',
      'hyperliquid': 'HYPEUSD'
    };
    
    return symbolMap[cryptoId] || `${symbol.toUpperCase()}USD`;
  };

  const loadTradingViewScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.TradingView) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load TradingView script'));
      document.head.appendChild(script);
    });
  };

  const initializeTradingViewWidget = async () => {
    if (!chartContainerRef.current) return;

    try {
      await loadTradingViewScript();
      setLoading(false);

      // Clear any existing widget
      chartContainerRef.current.innerHTML = '';

      const tradingViewSymbol = getTradingViewSymbol(cryptoId, symbol);

      new window.TradingView.widget({
        autosize: true,
        symbol: `BINANCE:${tradingViewSymbol}`,
        interval: interval,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#1e293b",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: chartContainerRef.current.id,
        backgroundColor: "#0f172a",
        gridColor: "#334155",
        hide_side_toolbar: true,
        allow_symbol_change: false,
        studies: [],
        show_popup_button: false,
        popup_width: "1000",
        popup_height: "650",
        overrides: {
          "paneProperties.background": "#0f172a",
          "paneProperties.vertGridProperties.color": "#334155",
          "paneProperties.horzGridProperties.color": "#334155",
          "symbolWatermarkProperties.transparency": 90,
          "scalesProperties.textColor": "#94a3b8",
          "scalesProperties.backgroundColor": "#1e293b"
        },
        disabled_features: [
          "use_localstorage_for_settings",
          "volume_force_overlay",
          "left_toolbar",
          "context_menus",
          "edit_buttons_in_legend",
          "border_around_the_chart",
          "remove_library_container_border"
        ],
        enabled_features: [
          "study_templates"
        ]
      });
    } catch (error) {
      console.error('Error loading TradingView widget:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chartContainerRef.current) {
      chartContainerRef.current.id = `tradingview-widget-${cryptoId}-${Date.now()}`;
      initializeTradingViewWidget();
    }
  }, [cryptoId, interval]);

  const timeframeOptions = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
  ];

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <BarChart3 className="text-primary" size={24} />
            <div>
              <div className="flex items-center gap-2">
                {name} ({symbol.toUpperCase()})
                <span className={`flex items-center text-sm px-2 py-1 rounded-full ${
                  priceChange24h >= 0 
                    ? 'text-green-400 bg-green-400/10' 
                    : 'text-red-400 bg-red-400/10'
                }`}>
                  {priceChange24h >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                  {priceChange24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-sm font-normal text-slate-400 mt-1">
                ${currentPrice.toLocaleString()}
              </div>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {onPredictClick && (
              <Button
                onClick={() => onPredictClick(cryptoId)}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Target size={16} className="mr-1" />
                Predict
              </Button>
            )}
          </div>
        </div>
        
        {/* Chart Controls */}
        <div className="flex items-center justify-between pt-4">
          {/* Timeframe Selector */}
          <div className="flex gap-1">
            {timeframeOptions.map((option) => (
              <Button
                key={option.value}
                variant={interval === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setInterval(option.value)}
                className="h-8 px-3 text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/80 z-10">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                Loading TradingView Chart...
              </div>
            </div>
          )}
          
          <div 
            ref={chartContainerRef}
            className="w-full h-[500px] bg-surface-dark rounded-b-lg"
            style={{ minHeight: '500px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}