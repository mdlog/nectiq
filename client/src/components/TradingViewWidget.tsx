import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import useSystemTheme from "@/hooks/useSystemTheme";
import FallbackChart from "./FallbackChart";

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
  const systemTheme = useSystemTheme();
  const onLoadScriptRef = useRef<(() => void) | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('D');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pythSymbol = cryptoToPythSymbol[cryptoId] || 'PYTH:BTCUSD';

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    onLoadScriptRef.current = createWidget;

    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Set timeout for loading - reduced to 5 seconds for faster fallback
    retryTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.log("⏰ [TRADINGVIEW] Timeout reached, switching to fallback chart");
        setHasError(true);
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.getElementById("tradingview-widget-loading-script");
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = () => {
          console.log("📊 [TRADINGVIEW] Script loaded successfully");
          resolve();
        };
        script.onerror = () => {
          console.error("❌ [TRADINGVIEW] Failed to load script");
          reject(new Error("Failed to load TradingView script"));
        };

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise
      .then(() => {
        if (onLoadScriptRef.current) {
          onLoadScriptRef.current();
        }
      })
      .catch((error) => {
        console.error("❌ [TRADINGVIEW] Error loading:", error);
        setHasError(true);
        setIsLoading(false);
      });

    return () => {
      onLoadScriptRef.current = null;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };

    function createWidget() {
      console.log("🔧 [TRADINGVIEW] Creating widget for:", pythSymbol, "with theme:", systemTheme);
      
      const container = document.getElementById("tradingview-widget");
      if (!container) {
        console.error("❌ [TRADINGVIEW] Container not found");
        setHasError(true);
        setIsLoading(false);
        return;
      }

      if (!("TradingView" in (window as any))) {
        console.error("❌ [TRADINGVIEW] TradingView not available in window");
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        // Remove existing widget if it exists
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }

        // Clear existing content
        container.innerHTML = '';
        
        widgetRef.current = new (window as any).TradingView.widget({
          autosize: true,
          symbol: pythSymbol,
          interval: selectedTimeframe,
          timezone: "Asia/Jakarta",
          theme: systemTheme, // Use system theme
          style: "1",
          locale: "id",
          toolbar_bg: systemTheme === "dark" ? "#1f2937" : "#f1f3f6",
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
            backgroundColor: systemTheme === "dark" ? "#1f2937" : "#ffffff",
            foregroundColor: "#00d4aa"
          },
          onChartReady: () => {
            console.log("✅ [TRADINGVIEW] Chart ready with", systemTheme, "theme");
            setIsLoading(false);
            setHasError(false);
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }
          }
        });
      } catch (error) {
        console.error("❌ [TRADINGVIEW] Widget creation error:", error);
        setHasError(true);
        setIsLoading(false);
      }
    }
  }, [pythSymbol, selectedTimeframe, systemTheme]); // Added systemTheme dependency

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
      className={`rounded-lg overflow-hidden border ${
        systemTheme === "dark" 
          ? "bg-gray-900 border-gray-700" 
          : "bg-white border-gray-300"
      } ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        systemTheme === "dark" 
          ? "bg-gray-800 border-gray-700" 
          : "bg-gray-100 border-gray-300"
      }`}>
        <div className="flex items-center gap-4">
          <h3 className={`text-lg font-semibold ${
            systemTheme === "dark" ? "text-white" : "text-gray-900"
          }`}>
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
      <div className={`tradingview-widget-container bg-gray-900 relative ${
        isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[500px]'
      }`}>
        <div 
          id="tradingview-widget" 
          className="w-full h-full"
        />
        
        {/* Loading indicator */}
        {isLoading && !hasError && (
          <div className={`absolute inset-0 flex items-center justify-center z-10 ${
            systemTheme === "dark" ? "bg-gray-900" : "bg-white"
          }`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className={systemTheme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Loading TradingView Chart...
              </p>
              <p className={`text-xs mt-2 ${systemTheme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                Connecting to Pyth Network data...
              </p>
            </div>
          </div>
        )}

        {/* Error state - Show fallback chart instead */}
        {hasError && (
          <div className={`absolute inset-0 z-10 ${
            systemTheme === "dark" ? "bg-gray-900" : "bg-white"
          }`}>
            <FallbackChart 
              cryptoId={cryptoId}
              onPredictionClick={onPredictionClick}
            />
          </div>
        )}
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