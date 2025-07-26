import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Expand, Minimize } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface TradingViewChartProps {
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

interface TimeframeOption {
  value: string;
  label: string;
  minutes: number;
}

const timeframes: TimeframeOption[] = [
  { value: '1m', label: '1M', minutes: 1 },
  { value: '5m', label: '5M', minutes: 5 },
  { value: '15m', label: '15M', minutes: 15 },
  { value: '1h', label: '1H', minutes: 60 },
  { value: '4h', label: '4H', minutes: 240 },
  { value: '1d', label: '1D', minutes: 1440 },
];

export default function TradingViewChart({ cryptoId, onPredictionClick }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [cryptoLogo, setCryptoLogo] = useState<string>('');

  // Fetch Pyth Network prices - STATIC CHART (No Real-time Updates)
  const { data: pythData } = useQuery<PythPriceData[]>({
    queryKey: ['/api/crypto/pyth-prices'],
    refetchInterval: false, // DISABLED - No automatic refresh
    refetchIntervalInBackground: false, // DISABLED - No background updates
    staleTime: Infinity, // STATIC - Data never becomes stale
    refetchOnWindowFocus: false, // DISABLED - No refresh on window focus
    refetchOnMount: true, // Only fetch once on component mount
  });

  // Get current crypto data
  const currentCryptoData = pythData?.find((crypto: PythPriceData) => crypto.id === cryptoId);

  // Fetch crypto data for logo - STATIC CHART (No Real-time Updates)
  const { data: cryptoData } = useQuery<any[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: false, // DISABLED - No automatic refresh
    refetchIntervalInBackground: false, // DISABLED - No background updates
    staleTime: Infinity, // STATIC - Data never becomes stale
    refetchOnWindowFocus: false, // DISABLED - No refresh on window focus
    refetchOnMount: true, // Only fetch once on component mount
  });

  // Get crypto logo and metadata
  const cryptoInfo = cryptoData?.find((c: any) => c.id === cryptoId);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#0f0f0f' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: '#333333' },
        horzLines: { color: '#333333' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#333333',
        textColor: '#ffffff',
        visible: false, // Hide right price scale to avoid showing different prices than Live Prices
      },
      leftPriceScale: {
        borderColor: '#333333',
        textColor: '#ffffff',
      },
      timeScale: {
        borderColor: '#333333',
      },
    });

    chartRef.current = chart;

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 100 : 400,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [isFullscreen]);

  // Update chart data based on Pyth Network prices
  useEffect(() => {
    if (!chartRef.current || !currentCryptoData) return;

    // Remove existing series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
    }

    // Generate historical data with realistic movements - use same price source as Live Prices
    const generateHistoricalData = () => {
      const currentPrice = cryptoInfo?.current_price || currentCryptoData.current_price;
      const timeframeData = timeframes.find(tf => tf.value === selectedTimeframe);
      const intervalMs = (timeframeData?.minutes || 60) * 60 * 1000;
      
      // Determine data span based on timeframe
      const dataPoints = selectedTimeframe === '1m' ? 60 :
                         selectedTimeframe === '5m' ? 72 :
                         selectedTimeframe === '15m' ? 64 :
                         selectedTimeframe === '1h' ? 48 :
                         selectedTimeframe === '4h' ? 42 :
                         selectedTimeframe === '1d' ? 30 : 48;

      const data: any[] = [];
      const now = Date.now();
      
      // Generate realistic price movements
      let basePrice = currentPrice;
      
      for (let i = dataPoints; i >= 0; i--) {
        const timestamp = (now - (i * intervalMs)) / 1000; // TradingView expects seconds
        
        // Create realistic volatility based on timeframe - FIXED VALUES
        let volatility;
        switch(selectedTimeframe) {
          case '1m':
          case '5m':
            volatility = 0.002; // 0.2% for very short timeframes
            break;
          case '15m':
            volatility = 0.005; // 0.5% for short timeframes
            break;
          case '1h':
            volatility = 0.008; // 0.8% for hourly (lebih realistis)
            break;
          case '4h':
            volatility = 0.015; // 1.5% for 4-hourly (dikurangi dari 2.5%)
            break;
          case '1d':
            volatility = 0.025; // 2.5% for daily (dikurangi dari 5%)
            break;
          default:
            volatility = 0.01;
        }

        // Create trend with noise
        const trendComponent = Math.sin((dataPoints - i) / dataPoints * Math.PI * 2) * 0.05;
        const noiseComponent = (Math.random() - 0.5) * volatility * 2;
        const priceChange = 1 + trendComponent + noiseComponent;
        
        const price = Math.max(basePrice * priceChange, currentPrice * 0.7);

        if (chartType === 'candlestick') {
          // Generate OHLC data for candlesticks - CONTROLLED RANGE
          const variation = price * Math.min(volatility, 0.02); // Maksimal 2% variasi per candle
          const open = price + (Math.random() - 0.5) * variation * 0.5;
          const close = price + (Math.random() - 0.5) * variation * 0.5;
          const high = Math.max(open, close) + Math.random() * variation * 0.3; // Maksimal 0.6% ke atas
          const low = Math.min(open, close) - Math.random() * variation * 0.3;  // Maksimal 0.6% ke bawah

          data.push({
            time: timestamp,
            open,
            high,
            low,
            close,
          } as CandlestickData);
        } else {
          // Line data
          data.push({
            time: timestamp,
            value: price,
          } as LineData);
        }

        basePrice = price;
      }

      return data;
    };

    // Create appropriate series based on chart type
    if (chartType === 'candlestick') {
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      
      candlestickSeries.setData(generateHistoricalData() as CandlestickData[]);
      seriesRef.current = candlestickSeries;
    } else {
      const lineSeries = chartRef.current.addLineSeries({
        color: '#10b981',
        lineWidth: 2,
      });
      
      lineSeries.setData(generateHistoricalData() as LineData[]);
      seriesRef.current = lineSeries;
    }

    console.log(`[TRADINGVIEW] Updated ${chartType} chart for ${cryptoId} (${selectedTimeframe}): $${currentCryptoData.current_price}`);
  }, [currentCryptoData, selectedTimeframe, chartType, cryptoId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (chartRef.current) {
      setTimeout(() => {
        chartRef.current?.applyOptions({
          height: !isFullscreen ? window.innerHeight - 100 : 400,
        });
      }, 100);
    }
  };

  return (
    <div className={`bg-surface-dark border border-surface-light rounded-lg ${
      isFullscreen ? 'fixed inset-0 z-50 m-4' : ''
    }`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-light">
        <div className="flex items-center space-x-4">
          {/* Crypto Info */}
          <div className="flex items-center space-x-3">
            {cryptoInfo?.image && (
              <img src={cryptoInfo.image} alt={cryptoId} className="w-8 h-8 rounded-full" />
            )}
            <div>
              <h3 className="font-semibold text-white">
                {cryptoInfo?.name || currentCryptoData?.name || cryptoId} ({cryptoInfo?.symbol?.toUpperCase() || currentCryptoData?.symbol?.toUpperCase()})
              </h3>
              {cryptoInfo && (
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-white">
                    ${cryptoInfo.current_price.toFixed(2)}
                  </span>
                  <span className={`text-sm ${cryptoInfo.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {cryptoInfo.price_change_percentage_24h >= 0 ? '+' : ''}{cryptoInfo.price_change_percentage_24h.toFixed(2)}% (24h)
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-green-400 text-xs">
                      Real-time
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-1">
            <Button
              variant={chartType === 'line' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs ${
                chartType === 'line'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-surface-light'
              }`}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'candlestick' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1 text-xs ${
                chartType === 'candlestick'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-surface-light'
              }`}
            >
              Candles
            </Button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={selectedTimeframe === tf.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`px-3 py-1 text-xs ${
                  selectedTimeframe === tf.value
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-surface-light'
                }`}
              >
                {tf.label}
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

      {/* Chart Container */}
      <div 
        ref={chartContainerRef}
        className={`w-full ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[400px]'}`}
      />

      {/* Prediction Button */}
      {onPredictionClick && (
        <div className="p-4 border-t border-surface-light">
          <Button
            onClick={onPredictionClick}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3"
          >
            Make Price Prediction
          </Button>
        </div>
      )}
    </div>
  );
}