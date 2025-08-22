import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Target } from "lucide-react";
import useSystemTheme from "@/hooks/useSystemTheme";

interface TradingViewChartProps {
  cryptoId: string;
}

// Map cryptocurrency IDs to TradingView symbols
const cryptoToTradingViewSymbol: Record<string, string> = {
  'bitcoin': 'BINANCE:BTCUSDT',
  'ethereum': 'BINANCE:ETHUSDT',
  'solana': 'BINANCE:SOLUSDT',
  'binancecoin': 'BINANCE:BNBUSDT',
  'chainlink': 'BINANCE:LINKUSDT',
  'avalanche-2': 'BINANCE:AVAXUSDT',
  'ethereum-classic': 'BINANCE:ETCUSDT',
  'litecoin': 'BINANCE:LTCUSDT',
  'bitcoin-cash': 'BINANCE:BCHUSDT',
  'aptos': 'BINANCE:APTUSDT',
  'sui': 'BINANCE:SUIUSDT',
  'hyperliquid': 'BYBIT:HYPEUSDT',
  'okb': 'OKX:OKBUSDT',
  'aave': 'BINANCE:AAVEUSDT',
  'bittensor': 'BINANCE:TAOUSDT'
};

const TradingViewChart = ({ cryptoId }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const systemTheme = useSystemTheme();

  const symbol = cryptoToTradingViewSymbol[cryptoId] || 'BINANCE:BTCUSDT';

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content safely
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    // Use textContent instead of innerHTML for security
    script.textContent = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: systemTheme === 'dark' ? "dark" : "light",
      style: "1", // Candlestick
      locale: "en",
      toolbar_bg: systemTheme === 'dark' ? "#1a1a1a" : "#ffffff",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      details: true,
      hotlist: true,
      studies: [
        "Volume@tv-basicstudies",
        "RSI@tv-basicstudies"
      ],
      container_id: "tradingview_widget"
    });

    // Create widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.id = "tradingview_widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    // Cleanup function
    return () => {
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [symbol, systemTheme]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getCryptoName = (id: string) => {
    const names: Record<string, string> = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'solana': 'Solana',
      'binancecoin': 'BNB',
      'chainlink': 'Chainlink',
      'avalanche-2': 'Avalanche',
      'ethereum-classic': 'Ethereum Classic',
      'litecoin': 'Litecoin',
      'bitcoin-cash': 'Bitcoin Cash',
      'aptos': 'Aptos',
      'sui': 'Sui',
      'hyperliquid': 'Hyperliquid',
      'okb': 'OKB',
      'aave': 'Aave',
      'bittensor': 'Bittensor'
    };
    return names[id] || 'Unknown';
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">{getCryptoName(cryptoId)} Chart</h2>
              <span className="text-sm text-muted-foreground">TradingView Professional Chart</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={toggleFullscreen}>
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Fullscreen Chart */}
          <div className="flex-1">
            <div 
              ref={containerRef}
              className="tradingview-widget-container h-full w-full"
            >
              <div className="tradingview-widget-container__widget h-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Chart Content */}
      <div className="h-[700px]">
        <div 
          ref={containerRef}
          className="tradingview-widget-container h-full w-full"
          style={{ height: "100%", width: "100%" }}
        >
          <div className="tradingview-widget-container__widget h-full"></div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewChart;