import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface TradingViewWidgetProps {
  cryptoId: string;
  onPredictionClick?: () => void;
}

// Map cryptocurrency IDs to Pyth TradingView symbols
const cryptoToPythSymbol: Record<string, string> = {
  'bitcoin': 'PYTH:BTCUSD',
  'ethereum': 'PYTH:ETHUSD',
  'solana': 'PYTH:SOLUSD',
  'binancecoin': 'PYTH:BNBUSD',
  'chainlink': 'PYTH:LINKUSD',
  'avalanche-2': 'PYTH:AVAXUSD',
  'ethereum-classic': 'PYTH:ETCUSD',
  'litecoin': 'PYTH:LTCUSD',
  'bitcoin-cash': 'PYTH:BCHUSD',
  'aptos': 'PYTH:APTUSD',
  'sui': 'PYTH:SUIUSD',
  'hyperliquid': 'PYTH:HYPEUSD',
  'okb': 'PYTH:OKBUSD'
};

let tvScriptLoadingPromise: Promise<void> | null = null;

export default function TradingViewWidget({ cryptoId, onPredictionClick }: TradingViewWidgetProps) {
  const onLoadScriptRef = useRef<(() => void) | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('D');
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  const pythSymbol = cryptoToPythSymbol[cryptoId] || 'PYTH:BTCUSD';

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = () => resolve();

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById("tradingview-widget") && "TradingView" in (window as any)) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: pythSymbol,
          interval: selectedTimeframe,
          timezone: "Asia/Jakarta",
          theme: "dark",
          style: "1",
          locale: "id",
          toolbar_bg: "#1f2937",
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: "tradingview-widget",
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          studies: [
            "Volume@tv-basicstudies",
            "RSI@tv-basicstudies"
          ],
          loading_screen: {
            backgroundColor: "#1f2937",
            foregroundColor: "#00d4aa"
          }
        });
      }
    }
  }, [pythSymbol, selectedTimeframe]);

  const timeframes = [
    { label: '1M', value: '1' },
    { label: '5M', value: '5' },
    { label: '15M', value: '15' },
    { label: '1H', value: '60' },
    { label: '4H', value: '240' },
    { label: '1D', value: 'D' },
    { label: '1W', value: 'W' }
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      widgetContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={widgetContainerRef}
      className={`bg-gray-900 rounded-lg overflow-hidden border border-gray-700 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">
            {pythSymbol.replace('PYTH:', '').replace('USD', '/USD')} Chart
          </h3>
          
          {/* Timeframe Selector */}
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedTimeframe === tf.value
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onPredictionClick && (
            <Button 
              onClick={onPredictionClick}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2"
            >
              Buat Prediksi
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-gray-300 hover:text-white"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>

      {/* TradingView Widget Container */}
      <div className={`tradingview-widget-container bg-gray-900 ${
        isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[500px]'
      }`}>
        <div 
          id="tradingview-widget" 
          className="w-full h-full"
        />
        
        {/* Loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Pyth Network Chart...</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">
            Timeframe: {timeframes.find(tf => tf.value === selectedTimeframe)?.label} | Data: Pyth Network
          </span>
          <span className="text-cyan-400 font-medium">
            Real-time Pyth Network Data
          </span>
        </div>
      </div>
    </div>
  );
}