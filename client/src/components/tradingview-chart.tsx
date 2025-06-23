import { useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  cryptoId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  onPredictClick?: (cryptoId: string) => void;
}

const TradingViewChart = memo(({ 
  cryptoId, 
  symbol, 
  name, 
  currentPrice, 
  priceChange24h, 
  onPredictClick 
}: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  // Map cryptocurrency IDs to TradingView symbols
  const getTradingViewSymbol = (cryptoId: string): string => {
    const symbolMap: Record<string, string> = {
      'bitcoin': 'BITSTAMP:BTCUSD',
      'ethereum': 'BITSTAMP:ETHUSD',
      'binancecoin': 'BINANCE:BNBUSDT',
      'cardano': 'BINANCE:ADAUSDT',
      'solana': 'BINANCE:SOLUSDT',
      'ripple': 'BINANCE:XRPUSDT',
      'hyperliquid': 'BINANCE:HYPEUSDT'
    };
    return symbolMap[cryptoId] || 'BITSTAMP:BTCUSD';
  };

  const initializeWidget = () => {
    if (!containerRef.current || !window.TradingView) return;

    // Clear any existing widget
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        // Widget might already be removed
      }
    }

    // Clear container
    containerRef.current.innerHTML = '';

    const tradingViewSymbol = getTradingViewSymbol(cryptoId);

    // Create new TradingView widget
    widgetRef.current = new window.TradingView.widget({
      autosize: true,
      symbol: tradingViewSymbol,
      interval: '15', // 15 minutes
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1', // Candle style
      locale: 'en',
      toolbar_bg: '#1a1b23',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      container_id: containerRef.current.id,
      studies: [
        'Volume@tv-basicstudies',
        'RSI@tv-basicstudies'
      ],
      loading_screen: {
        backgroundColor: '#1a1b23',
        foregroundColor: '#2962ff'
      },
      overrides: {
        // Dark theme customization
        "paneProperties.background": "#1a1b23",
        "paneProperties.vertGridProperties.color": "#2a2e39",
        "paneProperties.horzGridProperties.color": "#2a2e39",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": "#AAA",
        "scalesProperties.backgroundColor": "#1a1b23"
      },
      disabled_features: [
        'use_localstorage_for_settings',
        'volume_force_overlay',
        'create_volume_indicator_by_default'
      ],
      enabled_features: [
        'study_templates'
      ],
      // custom_css_url: '/tradingview-custom.css' // Removed for now
    });
  };

  const loadTradingViewScript = () => {
    return new Promise<void>((resolve, reject) => {
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

  useEffect(() => {
    const containerId = `tradingview_${cryptoId}_${Date.now()}`;
    if (containerRef.current) {
      containerRef.current.id = containerId;
    }

    loadTradingViewScript()
      .then(() => {
        // Small delay to ensure TradingView is fully loaded
        setTimeout(initializeWidget, 100);
      })
      .catch((error) => {
        console.error('Failed to load TradingView:', error);
      });

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          // Widget might already be removed
        }
      }
    };
  }, [cryptoId]);

  const isPositive = priceChange24h >= 0;

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2" size={20} />
            {name} ({symbol.toUpperCase()}) - Advanced Chart
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold">${currentPrice.toLocaleString()}</p>
              <div className={`flex items-center ${isPositive ? 'text-success' : 'text-error'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1 font-medium">
                  {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                </span>
              </div>
            </div>
            {onPredictClick && (
              <Button
                onClick={() => onPredictClick(cryptoId)}
                className="bg-primary hover:bg-primary/90"
              >
                <Target className="mr-2" size={16} />
                Make Prediction
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* TradingView Chart Container */}
          <div 
            ref={containerRef}
            className="w-full h-[500px] bg-[#1a1b23] rounded-lg overflow-hidden"
            style={{ minHeight: '500px' }}
          />
          
          {/* Chart Info */}
          <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-slate-600">
            <div className="flex items-center space-x-4">
              <span>Powered by TradingView</span>
              <a 
                href={`https://www.tradingview.com/chart/?symbol=${getTradingViewSymbol(cryptoId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                <ExternalLink size={14} className="mr-1" />
                View Full Chart
              </a>
            </div>
            <div className="text-xs">
              Real-time data • 15-minute intervals
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TradingViewChart.displayName = 'TradingViewChart';

export default TradingViewChart;