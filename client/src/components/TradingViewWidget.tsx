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
    console.log("🚀 [TRADINGVIEW] Starting widget initialization for", pythSymbol);
    setIsLoading(true);
    setHasError(false);
    
    onLoadScriptRef.current = createWidget;

    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Force fallback after 3 seconds to avoid long loading
    retryTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.log("⏰ [TRADINGVIEW] 3 second timeout reached, switching to fallback chart for better UX");
        setHasError(true);
        setIsLoading(false);
      }
    }, 3000); // Reduced to 3 seconds for faster fallback

    // Check if TradingView is already available in window
    if (typeof (window as any).TradingView !== 'undefined') {
      console.log("✅ [TRADINGVIEW] TradingView already available, creating widget immediately");
      setTimeout(() => {
        if (onLoadScriptRef.current) {
          onLoadScriptRef.current();
        }
      }, 100);
      return () => {
        onLoadScriptRef.current = null;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    }

    if (!tvScriptLoadingPromise) {
      console.log("📥 [TRADINGVIEW] Loading TradingView script...");
      tvScriptLoadingPromise = new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.getElementById("tradingview-widget-loading-script");
        if (existingScript) {
          existingScript.remove();
          console.log("🔄 [TRADINGVIEW] Removed existing script");
        }

        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.async = true;
        script.onload = () => {
          console.log("📊 [TRADINGVIEW] Script loaded successfully from https://s3.tradingview.com/tv.js");
          console.log("📊 [TRADINGVIEW] TradingView object available:", !!((window as any).TradingView));
          setTimeout(() => {
            resolve();
          }, 200); // Increased delay for better initialization
        };
        script.onerror = (error) => {
          console.error("❌ [TRADINGVIEW] Failed to load script:", error);
          reject(new Error("Failed to load TradingView script"));
        };

        document.head.appendChild(script);
        console.log("📥 [TRADINGVIEW] Script element added to document head");
      });
    }

    tvScriptLoadingPromise
      .then(() => {
        console.log("🎯 [TRADINGVIEW] Script promise resolved, creating widget");
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
      console.log("🔧 [TRADINGVIEW] Window TradingView available:", !!((window as any).TradingView));
      
      const container = document.getElementById("tradingview-widget");
      if (!container) {
        console.error("❌ [TRADINGVIEW] Container 'tradingview-widget' not found in DOM");
        console.error("❌ [TRADINGVIEW] Available elements:", document.querySelectorAll('[id*="trading"]'));
        setHasError(true);
        setIsLoading(false);
        return;
      }
      console.log("✅ [TRADINGVIEW] Container found:", container);

      if (!("TradingView" in (window as any))) {
        console.error("❌ [TRADINGVIEW] TradingView not available in window object");
        console.error("❌ [TRADINGVIEW] Available window properties:", Object.keys(window).filter(k => k.toLowerCase().includes('trading')));
        setHasError(true);
        setIsLoading(false);
        return;
      }
      console.log("✅ [TRADINGVIEW] TradingView object available in window");

      try {
        // Remove existing widget if it exists
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }

        // Clear existing content
        container.innerHTML = '';
        console.log("🔧 [TRADINGVIEW] Container cleared, creating widget with config:", {
          symbol: pythSymbol,
          interval: selectedTimeframe,
          theme: systemTheme,
          container_id: "tradingview-widget"
        });
        
        widgetRef.current = new (window as any).TradingView.widget({
          autosize: true,
          symbol: pythSymbol,
          interval: selectedTimeframe,
          timezone: "Asia/Jakarta",
          theme: systemTheme,
          style: "1",
          locale: "id",
          toolbar_bg: systemTheme === "dark" ? "#1f2937" : "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: "tradingview-widget",
          hide_top_toolbar: false,
          hide_legend: false,
          hide_side_toolbar: true,
          save_image: false,
          disabled_features: [
            "use_localstorage_for_settings",
            "volume_force_overlay", 
            "create_volume_indicator_by_default",
            "header_widget_dom_node",
            "header_widget",
            "compare_symbol",
            "border_around_the_chart",
            "remove_library_container_border",
            "left_toolbar",
            "control_bar",
            "timeframes_toolbar", 
            "edit_buttons_in_legend",
            "context_menus",
            "main_series_scale_menu",
            "show_logo_on_all_charts",
            "caption_buttons_text_if_possible",
            "header_settings",
            "header_chart_type",
            "header_resolutions",
            "header_screenshot", 
            "header_undo_redo",
            "header_saveload",
            "go_to_date",
            "adaptive_logo",
            "study_templates",
            "trading_panel",
            "order_panel",
            "dom_widget",
            "news",
            "popup_hints",
            "show_interval_dialog_on_key_press"
          ],
          studies: [
            "Volume@tv-basicstudies",
            "RSI@tv-basicstudies"
          ],
          loading_screen: {
            backgroundColor: systemTheme === "dark" ? "#1f2937" : "#ffffff",
            foregroundColor: "#00d4aa"
          },
          onChartReady: () => {
            console.log("✅ [TRADINGVIEW] Chart ready successfully with", systemTheme, "theme for", pythSymbol);
            setIsLoading(false);
            setHasError(false);
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
              retryTimeoutRef.current = null;
            }
            
            // Remove overlay buttons after chart is ready
            setTimeout(() => {
              const removeOverlayButtons = () => {
                console.log("🔧 [TRADINGVIEW] Attempting to remove overlay buttons...");
                const container = document.getElementById("tradingview-widget");
                if (container) {
                  // Find all possible overlay buttons
                  const selectors = [
                    'button[style*="position: absolute"]',
                    'div[style*="position: absolute"] button',
                    'button[style*="background"][style*="#"]',
                    '[style*="z-index"] button',
                    'button:contains("Make")',
                    'button:contains("Prediction")',
                    'iframe + div button',
                    '[style*="bottom"] button'
                  ];
                  
                  selectors.forEach(selector => {
                    try {
                      const elements = container.querySelectorAll(selector);
                      elements.forEach(el => {
                        if (el && el.style) {
                          el.style.display = 'none';
                          el.style.visibility = 'hidden';
                          el.style.opacity = '0';
                          console.log("🗑️ [TRADINGVIEW] Removed overlay button:", el);
                        }
                      });
                    } catch (e) {
                      console.log("⚠️ [TRADINGVIEW] Could not apply selector:", selector);
                    }
                  });
                  
                  // Also hide any iframe overlay content
                  const iframes = container.querySelectorAll('iframe');
                  iframes.forEach(iframe => {
                    try {
                      // Try to access iframe content if same-origin
                      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                      if (iframeDoc) {
                        const overlayButtons = iframeDoc.querySelectorAll('button[style*="position: absolute"], [style*="overlay"] button');
                        overlayButtons.forEach(btn => {
                          btn.style.display = 'none';
                          console.log("🗑️ [TRADINGVIEW] Removed iframe overlay button:", btn);
                        });
                      }
                    } catch (e) {
                      console.log("⚠️ [TRADINGVIEW] Cannot access iframe content (cross-origin)");
                    }
                  });
                }
              };
              
              removeOverlayButtons();
              // Run again after a delay in case buttons are added dynamically
              setTimeout(removeOverlayButtons, 1000);
              setTimeout(removeOverlayButtons, 3000);
            }, 500);
          }
        });
      } catch (error) {
        console.error("❌ [TRADINGVIEW] Widget creation error:", error);
        console.log("🔄 [TRADINGVIEW] Falling back to fallback chart due to widget creation error");
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
        isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[700px]'
      }`}>
        <div 
          id="tradingview-widget" 
          className="w-full h-full"
        />
        
        {/* CSS to hide overlay buttons in TradingView widget */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Hide TradingView overlay buttons and prediction buttons */
            #tradingview-widget iframe {
              pointer-events: auto;
            }
            
            /* Hide any overlay buttons that might appear on the chart */
            div[data-testid*="overlay"],
            div[class*="overlay"],
            div[class*="prediction"],
            div[class*="button-overlay"],
            button[class*="prediction"],
            button[data-testid*="prediction"],
            .tradingview-widget-container button[style*="position: absolute"],
            .tradingview-widget-container div[style*="position: absolute"][style*="z-index"] button,
            .tradingview-widget-container [class*="overlay-button"],
            .tradingview-widget-container [id*="prediction"],
            .tradingview-widget-container [data-name*="prediction"] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
            }
            
            /* Specifically target blue prediction-like buttons */
            .tradingview-widget-container button[style*="background"][style*="blue"],
            .tradingview-widget-container button[style*="background-color"][style*="rgb(59"],
            .tradingview-widget-container button[style*="background-color"][style*="#3b"],
            .tradingview-widget-container div[style*="background"][style*="blue"] button,
            
            /* Target cyan/blue overlay buttons positioned at bottom of chart */
            .tradingview-widget-container button[style*="position: absolute"][style*="bottom"],
            .tradingview-widget-container div[style*="position: absolute"][style*="bottom"] button,
            .tradingview-widget-container [style*="background"][style*="cyan"],
            .tradingview-widget-container [style*="background"][style*="#00"],
            .tradingview-widget-container [style*="z-index"][style*="position: absolute"] button,
            
            /* Target buttons with "Make Prediction" or similar text */
            .tradingview-widget-container button:contains("Make"),
            .tradingview-widget-container button:contains("Prediction"),
            .tradingview-widget-container button:contains("Buat"),
            .tradingview-widget-container button:contains("Prediksi"),
            
            /* Hide any floating overlay elements */
            .tradingview-widget-container > div[style*="position: absolute"]:not([class*="tradingview"]),
            .tradingview-widget-container iframe + div[style*="position: absolute"],
            
            /* More aggressive targeting of bottom overlay buttons */
            .tradingview-widget-container [style*="bottom: 0"],
            .tradingview-widget-container [style*="bottom:0"],
            .tradingview-widget-container [style*="bottom: 10px"],
            .tradingview-widget-container [style*="bottom: 20px"] {
              display: none !important;
            }
          `
        }} />
        
        {/* Loading indicator - Reduced loading time for better UX */}
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
                Connecting to Pyth Network data... (3s timeout)
              </p>
              <p className={`text-xs mt-1 ${systemTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Will fallback to Chart.js if TradingView fails
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