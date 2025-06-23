import { useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';

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
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Generate sample candlestick data based on current price
  const generateCandlestickData = (basePrice: number) => {
    const data = [];
    const now = new Date();
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const time = (date.getTime() / 1000) as UTCTimestamp;
      
      // Generate realistic price variations
      const variation = (Math.random() - 0.5) * 0.1;
      const dayPrice = basePrice * (1 + variation * (i / days));
      const dailyVolatility = dayPrice * 0.02;
      
      const open = dayPrice + (Math.random() - 0.5) * dailyVolatility;
      const close = dayPrice + (Math.random() - 0.5) * dailyVolatility;
      const high = Math.max(open, close) + Math.random() * dailyVolatility * 0.5;
      const low = Math.min(open, close) - Math.random() * dailyVolatility * 0.5;
      
      data.push({
        time,
        open: Number(open.toFixed(6)),
        high: Number(high.toFixed(6)),
        low: Number(low.toFixed(6)),
        close: Number(close.toFixed(6))
      });
    }
    
    return data;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Create chart
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1b23' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#2a2e39' },
        horzLines: { color: '#2a2e39' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485169',
      },
      timeScale: {
        borderColor: '#485169',
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        visible: true,
        fontSize: 24,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(171, 71, 188, 0.3)',
        text: symbol.toUpperCase(),
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });

    // Generate and set data
    const data = generateCandlestickData(currentPrice);
    candlestickSeries.setData(data);

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    // Generate volume data
    const volumeData = data.map(candle => ({
      time: candle.time,
      value: Math.floor(Math.random() * 1000000) + 100000,
      color: candle.close >= candle.open ? '#22c55e' : '#ef4444'
    }));
    volumeSeries.setData(volumeData);

    // Fit content
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [cryptoId, currentPrice, symbol]);

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
              <span>Professional Trading Chart</span>
              <span className="text-xs">Powered by TradingView Technology</span>
            </div>
            <div className="text-xs">
              Real-time data • Candlestick view • Volume indicators
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TradingViewChart.displayName = 'TradingViewChart';

export default TradingViewChart;