import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';

interface CryptoChartProps {
  cryptoId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  onPredictClick?: (cryptoId: string) => void;
}

interface ChartData {
  time: string;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

type ChartType = 'line' | 'candlestick';

export default function CryptoChart({ cryptoId, symbol, name, currentPrice, priceChange24h, onPredictClick }: CryptoChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState('7');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  const fetchChartData = async (days: string) => {
    setLoading(true);
    try {
      if (chartType === 'candlestick') {
        // Fetch OHLC data for candlestick charts
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${cryptoId}/ohlc?vs_currency=usd&days=${days}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch OHLC data');
        }
        
        const data = await response.json();
        const formattedData: ChartData[] = data.map(([timestamp, open, high, low, close]: [number, number, number, number, number]) => ({
          time: new Date(timestamp).toISOString().split('T')[0],
          value: close,
          open,
          high,
          low,
          close,
        }));
        setChartData(formattedData);
      } else {
        // Fetch price data for line charts
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }
        
        const data = await response.json();
        const formattedData: ChartData[] = data.prices.map(([timestamp, price]: [number, number]) => ({
          time: new Date(timestamp).toISOString().split('T')[0],
          value: price,
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeChart = () => {
    if (!chartContainerRef.current) return;

    // Remove existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: {
          color: '#334155',
        },
        horzLines: {
          color: '#334155',
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    if (chartType === 'candlestick') {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
      });

      const candlestickData: CandlestickData[] = chartData.map(item => ({
        time: item.time,
        open: item.open!,
        high: item.high!,
        low: item.low!,
        close: item.close!,
      }));

      candlestickSeries.setData(candlestickData);
      seriesRef.current = candlestickSeries;
    } else {
      const lineSeries = chart.addLineSeries({
        color: priceChange24h >= 0 ? '#10b981' : '#ef4444',
        lineWidth: 2,
      });

      const lineData: LineData[] = chartData.map(item => ({
        time: item.time,
        value: item.value,
      }));

      lineSeries.setData(lineData);
      seriesRef.current = lineSeries;
    }

    // Auto-resize chart
    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  };

  useEffect(() => {
    fetchChartData(timeframe);
  }, [cryptoId, timeframe, chartType]);

  useEffect(() => {
    if (!loading && chartData.length > 0) {
      initializeChart();
    }
  }, [chartData, loading, chartType]);

  const timeframeOptions = [
    { value: '1', label: '1D' },
    { value: '7', label: '7D' },
    { value: '30', label: '30D' },
    { value: '90', label: '3M' },
    { value: '365', label: '1Y' },
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
                variant={timeframe === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(option.value)}
                className="h-8 px-3 text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex gap-1">
            <Button
              variant={chartType === 'line' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType('line')}
              className="h-8 px-3 text-xs"
            >
              Line
            </Button>
            <Button
              variant={chartType === 'candlestick' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType('candlestick')}
              className="h-8 px-3 text-xs"
            >
              Candles
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/80 z-10">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                Loading Chart...
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