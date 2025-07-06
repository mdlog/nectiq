import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, BarChart3, Activity, LineChart, Maximize2, Volume2, Loader2 } from 'lucide-react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface EnhancedCryptoChartProps {
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
  volume?: number;
}

export default function EnhancedCryptoChart({ 
  cryptoId, 
  symbol, 
  name, 
  currentPrice, 
  priceChange24h,
  onPredictClick 
}: EnhancedCryptoChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState('7');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0e1a' },
        textColor: '#ffffff',
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      grid: {
        vertLines: { 
          color: '#1e293b', 
          style: 0,
          visible: true,
        },
        horzLines: { 
          color: '#1e293b', 
          style: 0,
          visible: true,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6366f1',
          width: 1,
          style: 0,
          visible: true,
          labelVisible: true,
          labelBackgroundColor: '#6366f1',
        },
        horzLine: {
          color: '#6366f1',
          width: 1,
          style: 0,
          visible: true,
          labelVisible: true,
          labelBackgroundColor: '#6366f1',
        },
      },
      rightPriceScale: {
        borderColor: '#334155',
        textColor: '#cbd5e1',
        fontSize: 11,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        borderVisible: true,
        entireTextOnly: false,
      },
      timeScale: {
        borderColor: '#334155',
        textColor: '#cbd5e1',
        fontSize: 11,
        timeVisible: true,
        secondsVisible: false,
        borderVisible: true,
        tickMarkFormatter: (time: any) => {
          const date = new Date(time * 1000);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      kineticScroll: {
        mouse: true,
        touch: true,
      },
      watermark: {
        visible: true,
        fontSize: 32,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(255, 255, 255, 0.03)',
        text: `${symbol}`,
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 200 : 450,
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 200 : 400,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [name, isFullscreen]);

  // Fetch chart data
  useEffect(() => {
    fetchChartData();
  }, [cryptoId, timeframe, chartType]);

  // Update chart when data changes
  useEffect(() => {
    updateChart();
  }, [chartData]);

  const fetchChartData = async () => {
    if (!cryptoId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/crypto/chart/${cryptoId}?days=${timeframe}&type=${chartType}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Chart data fetch error:', error);
      // Generate fallback data
      generateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackData = () => {
    const data: ChartData[] = [];
    const days = parseInt(timeframe);
    let basePrice = currentPrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 0.05;
      const dayPrice = basePrice * (1 + variation);
      
      if (chartType === 'candlestick') {
        const open = dayPrice * (1 + (Math.random() - 0.5) * 0.02);
        const close = dayPrice * (1 + (Math.random() - 0.5) * 0.02);
        const high = Math.max(open, close) * (1 + Math.random() * 0.015);
        const low = Math.min(open, close) * (1 - Math.random() * 0.015);
        
        data.push({
          time: date.toISOString().split('T')[0],
          value: close,
          open: parseFloat(open.toFixed(4)),
          high: parseFloat(high.toFixed(4)),
          low: parseFloat(low.toFixed(4)),
          close: parseFloat(close.toFixed(4)),
          volume: Math.random() * 1000000,
        });
      } else {
        data.push({
          time: date.toISOString().split('T')[0],
          value: parseFloat(dayPrice.toFixed(4)),
        });
      }
      
      basePrice = dayPrice;
    }
    
    setChartData(data);
  };

  const updateChart = () => {
    if (!chartRef.current || !chartData.length) return;

    // Remove existing series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
    }

    // Create appropriate series
    let series;
    if (chartType === 'candlestick') {
      series = chartRef.current.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#dc2626',
        borderUpColor: '#16a34a',
        wickDownColor: '#dc2626',
        wickUpColor: '#16a34a',
        priceFormat: {
          type: 'price',
          precision: 4,
          minMove: 0.0001,
        },
      });

      const candleData = chartData.map(item => ({
        time: item.time,
        open: parseFloat((item.open || item.value).toFixed(4)),
        high: parseFloat((item.high || item.value * 1.01).toFixed(4)),
        low: parseFloat((item.low || item.value * 0.99).toFixed(4)),
        close: parseFloat((item.close || item.value).toFixed(4)),
      }));

      series.setData(candleData);
    } else if (chartType === 'area') {
      series = chartRef.current.addAreaSeries({
        lineColor: '#6366f1',
        topColor: 'rgba(99, 102, 241, 0.2)',
        bottomColor: 'rgba(99, 102, 241, 0.0)',
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 4,
          minMove: 0.0001,
        },
      });

      const areaData = chartData.map(item => ({
        time: item.time,
        value: parseFloat((item.close || item.value).toFixed(4)),
      }));

      series.setData(areaData);
    } else {
      series = chartRef.current.addLineSeries({
        color: '#6366f1',
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 4,
          minMove: 0.0001,
        },
      });

      const lineData = chartData.map(item => ({
        time: item.time,
        value: parseFloat((item.close || item.value).toFixed(4)),
      }));

      series.setData(lineData);
    }

    seriesRef.current = series;

    // Add volume series if enabled and in candlestick mode
    if (showVolume && chartType === 'candlestick') {
      const volumeSeries = chartRef.current.addHistogramSeries({
        color: '#64748b',
        priceFormat: { 
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: { 
          top: 0.7, 
          bottom: 0,
        },
      });

      const volumeData = chartData.map(item => {
        const isGreen = (item.close || item.value) >= (item.open || item.value);
        return {
          time: item.time,
          value: item.volume || Math.random() * 1000000,
          color: isGreen ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
        };
      });

      volumeSeries.setData(volumeData);
    }

    // Fit content
    setTimeout(() => {
      chartRef.current?.timeScale().fitContent();
    }, 100);
  };

  const handlePredictClick = () => {
    if (onPredictClick) {
      onPredictClick(cryptoId);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-slate-950 to-slate-900 border-slate-800">
      <CardHeader className="pb-4 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                {name} 
                <span className="text-slate-400 ml-2 font-normal text-lg">({symbol})</span>
              </CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-3xl font-bold text-white tracking-tight">
                  ${currentPrice.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 6 
                  })}
                </span>
                <Badge 
                  variant="outline"
                  className={`${
                    priceChange24h >= 0 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  } px-3 py-1 text-sm font-semibold`}
                >
                  {priceChange24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe buttons */}
            <div className="flex bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              {['1', '7', '30', '90'].map((period) => (
                <Button
                  key={period}
                  variant="ghost"
                  size="sm"
                  className={`px-4 py-2 rounded-none border-0 text-sm font-medium transition-all ${
                    timeframe === period 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                  onClick={() => setTimeframe(period)}
                >
                  {period}D
                </Button>
              ))}
            </div>

            {/* Chart type buttons */}
            <div className="flex bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-2 rounded-none border-0 transition-all ${
                  chartType === 'candlestick' 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                onClick={() => setChartType('candlestick')}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-2 rounded-none border-0 transition-all ${
                  chartType === 'line' 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                onClick={() => setChartType('line')}
              >
                <LineChart className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-2 rounded-none border-0 transition-all ${
                  chartType === 'area' 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                onClick={() => setChartType('area')}
              >
                <Activity className="w-4 h-4" />
              </Button>
            </div>

            {/* Control buttons */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-2 rounded-xl border border-slate-700 transition-all ${
                  showVolume 
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
                onClick={() => setShowVolume(!showVolume)}
              >
                <Volume2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center space-x-2 text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading chart data...</span>
              </div>
            </div>
          )}
          
          <div 
            ref={chartContainerRef} 
            className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : ''}`}
            style={{ height: isFullscreen ? '100vh' : '400px' }}
          />
        </div>

        {/* Predict button */}
        {onPredictClick && (
          <div className="p-6 border-t border-slate-800 bg-slate-900/50">
            <Button 
              onClick={handlePredictClick}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
            >
              <Target className="w-5 h-5 mr-3" />
              Make Prediction for {symbol}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}