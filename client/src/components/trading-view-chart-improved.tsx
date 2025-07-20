import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  height?: number;
  theme?: "light" | "dark";
}

const TradingViewChart = ({ 
  symbol = "BINANCE:BTCUSDT",
  interval = "D",
  height = 600,
  theme = "dark"
}: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadTradingViewWidget = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if script already exists
        if (!document.querySelector('script[src*="tradingview.com/external-embedding"]')) {
          const script = document.createElement("script");
          script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
          script.type = "text/javascript";
          script.async = true;
          
          // Wait for script to load
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load TradingView script'));
            document.head.appendChild(script);
          });
        }

        // Clear previous widget if exists
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        // Create new widget
        if (mounted && containerRef.current && window.TradingView) {
          widgetRef.current = new window.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: interval,
            timezone: "Etc/UTC",
            theme: theme,
            style: "1",
            locale: "en",
            toolbar_bg: theme === "dark" ? "#1a1a1a" : "#ffffff",
            enable_publishing: false,
            allow_symbol_change: true,
            calendar: false,
            support_host: "https://www.tradingview.com",
            container_id: containerRef.current,
            onChartReady: () => {
              if (mounted) {
                setIsLoading(false);
              }
            }
          });
        }

      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load chart');
          setIsLoading(false);
        }
      }
    };

    loadTradingViewWidget();

    return () => {
      mounted = false;
      if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
        try {
          widgetRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      widgetRef.current = null;
    };
  }, [symbol, interval, theme]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load chart</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          </div>
        </div>
      );
    }

    return (
      <div 
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
        style={{ height: "100%", width: "100%" }}
      />
    );
  };

  return (
    <Card className="bg-gradient-card border-border h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
          {symbol.split(':')[1]?.replace('USDT', '/USDT') || 'Crypto'} Price Chart
        </h3>
        <p className="text-sm text-muted-foreground">
          Real-time {symbol.split(':')[1] || 'crypto'} with technical indicators
        </p>
      </div>
      
      <div 
        className="bg-chart-background relative"
        style={{ height: `${height}px` }}
      >
        {renderContent()}
      </div>
    </Card>
  );
};

export default TradingViewChart;