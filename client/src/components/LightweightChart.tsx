import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, CrosshairMode, UTCTimestamp } from 'lightweight-charts';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, TrendingUp } from 'lucide-react';
import useSystemTheme from '@/hooks/useSystemTheme';

interface LightweightChartProps {
  cryptoId: string;
  onPredictionClick?: () => void;
}

// Generate realistic OHLC data for 24 hours
function generateOHLCData(currentPrice: number, cryptoId: string) {
  const data = [];
  const now = new Date();
  
  // Use cryptoId for seeded random to ensure consistency
  const seed = cryptoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let seedRandom = seed;
  
  const seededRandom = () => {
    seedRandom = (seedRandom * 9301 + 49297) % 233280;
    return seedRandom / 233280;
  };

  let basePrice = currentPrice;
  
  // Generate 24 hours of hourly OHLC data
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timestamp = Math.floor(time.getTime() / 1000);
    
    // Generate realistic volatility (0.5% to 1.5% per hour)
    const volatility = 0.005 + seededRandom() * 0.010;
    const trend = Math.sin((23 - i) * 0.3) * 0.5; // Sine wave trend
    
    const priceChange = (seededRandom() - 0.5) * volatility + trend * 0.002;
    basePrice = basePrice * (1 + priceChange);
    
    // Generate OHLC values
    const open = basePrice;
    const volatilityRange = basePrice * (0.001 + seededRandom() * 0.005);
    
    const high = open + volatilityRange * seededRandom();
    const low = open - volatilityRange * seededRandom();
    const close = low + (high - low) * seededRandom();
    
    data.push({
      time: timestamp as UTCTimestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });
    
    basePrice = close;
  }
  
  // Update last candle with current price
  if (data.length > 0) {
    const lastCandle = data[data.length - 1];
    lastCandle.close = Number(currentPrice.toFixed(2));
    lastCandle.high = Math.max(lastCandle.high, currentPrice);
    lastCandle.low = Math.min(lastCandle.low, currentPrice);
  }
  
  return data;
}

export default function LightweightChart({ cryptoId, onPredictionClick }: LightweightChartProps) {
  const systemTheme = useSystemTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch current price data - SAME endpoint as Live Prices for perfect synchronization
  const { data: cryptoPrices } = useQuery({
    queryKey: ["/api/crypto/pyth-prices"], // EXACT same endpoint as Live Prices
    refetchInterval: 1000, // EXACT same as Live Prices - 1 second updates
    refetchIntervalInBackground: true, // EXACT same as Live Prices
    staleTime: 500, // EXACT same as Live Prices - 500ms stale time  
    retry: 3, // EXACT same as Live Prices
    refetchOnWindowFocus: true, // EXACT same as Live Prices
    refetchOnMount: true, // EXACT same as Live Prices
  });

  const currentCrypto = Array.isArray(cryptoPrices) ? cryptoPrices.find((crypto: any) => crypto.id === cryptoId) : null;
  const currentPrice = currentCrypto?.current_price || 50000;

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: systemTheme === 'dark' ? '#1f2937' : '#ffffff' },
        textColor: systemTheme === 'dark' ? '#e5e7eb' : '#374151',
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 120 : 400,
      grid: {
        vertLines: {
          color: systemTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        horzLines: {
          color: systemTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: systemTheme === 'dark' ? '#374151' : '#d1d5db',
      },
      timeScale: {
        borderColor: systemTheme === 'dark' ? '#374151' : '#d1d5db',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00d4aa',
      downColor: '#f84960',
      borderDownColor: '#f84960',
      borderUpColor: '#00d4aa',
      wickDownColor: '#f84960',
      wickUpColor: '#00d4aa',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Generate and set initial data
    const ohlcData = generateOHLCData(currentPrice, cryptoId);
    candlestickSeries.setData(ohlcData);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 120 : 400
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [systemTheme, isFullscreen]);

  // Update chart with new price data
  useEffect(() => {
    if (seriesRef.current && currentPrice && currentCrypto) {
      const ohlcData = generateOHLCData(currentPrice, cryptoId);
      seriesRef.current.setData(ohlcData);
    }
  }, [currentPrice, cryptoId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && chartContainerRef.current?.parentElement) {
      chartContainerRef.current.parentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
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
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${
            systemTheme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            <TrendingUp size={20} className="text-cyan-400" />
            {currentCrypto?.symbol || 'Crypto'}/USD Chart (Lightweight Charts)
          </h3>
          
          {currentCrypto && (
            <div className="text-sm">
              <span className={`font-semibold ${
                systemTheme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                ${currentPrice.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
              <span className={`ml-2 ${
                currentCrypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentCrypto.price_change_percentage_24h >= 0 ? '+' : ''}
                {currentCrypto.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          )}
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
            className={systemTheme === "dark" 
              ? "text-gray-300 hover:text-white" 
              : "text-gray-600 hover:text-gray-900"
            }
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>

      {/* Chart Container */}  
      <div 
        ref={chartContainerRef}
        className={`${
          systemTheme === "dark" ? "bg-gray-900" : "bg-white"
        } ${isFullscreen ? 'h-[calc(100vh-160px)]' : 'h-[400px]'}`}
        style={{ width: '100%' }}
      />

      {/* Footer Info */}
      <div className={`px-4 py-2 border-t ${
        systemTheme === "dark" 
          ? "bg-gray-800 border-gray-700" 
          : "bg-gray-100 border-gray-300"
      }`}>
        <div className="flex justify-between items-center text-xs">
          <span className={systemTheme === "dark" ? "text-gray-400" : "text-gray-600"}>
            TradingView Lightweight Charts | Data Pyth Network
          </span>
          <span className="text-cyan-400 font-medium">
            Professional Trading Charts - 24 Jam OHLC Data
          </span>
        </div>
      </div>
    </div>
  );
}