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
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#e2e8f0',
      },
      grid: {
        vertLines: { color: '#334155', style: 1 },
        horzLines: { color: '#334155', style: 1 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#3b82f6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#3b82f6',
        },
        horzLine: {
          color: '#3b82f6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#3b82f6',
        },
      },
      rightPriceScale: {
        borderColor: '#475569',
        textColor: '#e2e8f0',
      },
      timeScale: {
        borderColor: '#475569',
        textColor: '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        visible: true,
        fontSize: 20,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(255, 255, 255, 0.05)',
        text: `${name} • Nectiq`,
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 200 : 400,
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
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
      });

      const candleData = chartData.map(item => ({
        time: item.time,
        open: item.open || item.value,
        high: item.high || item.value * 1.01,
        low: item.low || item.value * 0.99,
        close: item.close || item.value,
      }));

      series.setData(candleData);
    } else if (chartType === 'area') {
      series = chartRef.current.addAreaSeries({
        lineColor: '#3b82f6',
        topColor: 'rgba(59, 130, 246, 0.4)',
        bottomColor: 'rgba(59, 130, 246, 0.0)',
      });

      const areaData = chartData.map(item => ({
        time: item.time,
        value: item.close || item.value,
      }));

      series.setData(areaData);
    } else {
      series = chartRef.current.addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
      });

      const lineData = chartData.map(item => ({
        time: item.time,
        value: item.close || item.value,
      }));

      series.setData(lineData);
    }

    seriesRef.current = series;

    // Add volume series if enabled and in candlestick mode
    if (showVolume && chartType === 'candlestick') {
      const volumeSeries = chartRef.current.addHistogramSeries({
        color: '#64748b',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      const volumeData = chartData.map(item => ({
        time: item.time,
        value: item.volume || Math.random() * 1000000,
        color: (item.close || item.value) >= (item.open || item.value) ? 
               'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)',
      }));

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
    <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <div>
              <CardTitle className="text-xl text-white">{name} ({symbol})</CardTitle>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-2xl font-bold text-white">
                  ${currentPrice.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 6 
                  })}
                </span>
                <Badge 
                  variant={priceChange24h >= 0 ? "default" : "destructive"}
                  className={`${priceChange24h >= 0 ? 'bg-green-600' : 'bg-red-600'} text-white`}
                >
                  {priceChange24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe buttons */}
            <div className="flex border border-slate-600 rounded-lg overflow-hidden">
              {['1', '7', '30', '90'].map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "ghost"}
                  size="sm"
                  className={`px-3 py-1 rounded-none border-0 ${
                    timeframe === period 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  onClick={() => setTimeframe(period)}
                >
                  {period}D
                </Button>
              ))}
            </div>

            {/* Chart type buttons */}
            <div className="flex border border-slate-600 rounded-lg overflow-hidden">
              <Button
                variant={chartType === 'candlestick' ? "default" : "ghost"}
                size="sm"
                className={`px-3 py-1 rounded-none border-0 ${
                  chartType === 'candlestick' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setChartType('candlestick')}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? "default" : "ghost"}
                size="sm"
                className={`px-3 py-1 rounded-none border-0 ${
                  chartType === 'line' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setChartType('line')}
              >
                <LineChart className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === 'area' ? "default" : "ghost"}
                size="sm"
                className={`px-3 py-1 rounded-none border-0 ${
                  chartType === 'area' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setChartType('area')}
              >
                <Activity className="w-4 h-4" />
              </Button>
            </div>

            {/* Control buttons */}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-slate-700"
              onClick={() => setShowVolume(!showVolume)}
            >
              <Volume2 className={`w-4 h-4 ${showVolume ? 'text-blue-400' : 'text-slate-500'}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-slate-700"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
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
          <div className="p-4 border-t border-slate-700">
            <Button 
              onClick={handlePredictClick}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
            >
              <Target className="w-4 h-4 mr-2" />
              Make Prediction for {symbol}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}