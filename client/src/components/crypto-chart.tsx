import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState('7');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);

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

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Set up chart dimensions with extra space for price labels
    const leftPadding = 80; // More space for price labels on the left
    const rightPadding = 120; // Extra space for real-time price display
    const topPadding = 40;
    const bottomPadding = 40;
    const chartWidth = width - leftPadding - rightPadding;
    const chartHeight = height - topPadding - bottomPadding;

    if (chartType === 'candlestick') {
      drawCandlestickChart(ctx, chartWidth, chartHeight, leftPadding, topPadding);
    } else {
      drawLineChart(ctx, chartWidth, chartHeight, leftPadding, topPadding);
    }
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, leftPadding: number, topPadding: number) => {
    const values = chartData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = topPadding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(leftPadding, y);
      ctx.lineTo(leftPadding + chartWidth, y);
      ctx.stroke();
    }

    // Draw price line
    ctx.strokeStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x = leftPadding + (chartWidth * index) / (chartData.length - 1);
      const y = topPadding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, topPadding, 0, topPadding + chartHeight);
    gradient.addColorStop(0, priceChange24h >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(leftPadding, topPadding + chartHeight);
    chartData.forEach((point, index) => {
      const x = leftPadding + (chartWidth * index) / (chartData.length - 1);
      const y = topPadding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(leftPadding + chartWidth, topPadding + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw price labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = maxValue - (valueRange * i) / 5;
      const y = topPadding + (chartHeight * i) / 5;
      ctx.fillText(`$${value.toFixed(2)}`, leftPadding - 5, y + 4);
    }

    // Draw real-time price indicator at the edge of the chart
    if (chartData.length > 0) {
      const lastPrice = chartData[chartData.length - 1].value;
      const priceY = topPadding + chartHeight - ((lastPrice - minValue) / valueRange) * chartHeight;
      const rightEdge = leftPadding + chartWidth;

      // Draw price line extending to the right edge
      ctx.strokeStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(rightEdge - 80, priceY);
      ctx.lineTo(rightEdge, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw price label background
      const priceText = `$${currentPrice.toFixed(2)}`;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      const textWidth = ctx.measureText(priceText).width;
      const labelPadding = 8;
      const labelHeight = 24;
      
      ctx.fillStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.fillRect(rightEdge + 5, priceY - labelHeight/2, textWidth + labelPadding * 2, labelHeight);

      // Draw price text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(priceText, rightEdge + 5 + labelPadding, priceY + 5);

      // Draw small circle at the price point
      ctx.fillStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(rightEdge - 80, priceY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawCandlestickChart = (ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, padding: number) => {
    const values = chartData.flatMap(d => [d.high!, d.low!]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    const candleWidth = chartWidth / chartData.length * 0.6;

    chartData.forEach((candle, index) => {
      const x = padding + (chartWidth * (index + 0.5)) / chartData.length;
      const openY = padding + chartHeight - ((candle.open! - minValue) / valueRange) * chartHeight;
      const closeY = padding + chartHeight - ((candle.close! - minValue) / valueRange) * chartHeight;
      const highY = padding + chartHeight - ((candle.high! - minValue) / valueRange) * chartHeight;
      const lowY = padding + chartHeight - ((candle.low! - minValue) / valueRange) * chartHeight;

      const isGreen = candle.close! >= candle.open!;
      const color = isGreen ? '#10b981' : '#ef4444';

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = color;
      const bodyHeight = Math.abs(closeY - openY) || 1;
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
    });

    // Draw price labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = maxValue - (valueRange * i) / 5;
      const y = padding + (chartHeight * i) / 5;
      ctx.fillText(`$${value.toFixed(2)}`, padding - 5, y + 4);
    }

    // Draw real-time price indicator for candlestick
    if (chartData.length > 0) {
      const lastCandle = chartData[chartData.length - 1];
      const currentPriceY = padding + chartHeight - ((currentPrice - minValue) / valueRange) * chartHeight;
      const rightEdge = padding + chartWidth;

      // Draw price line extending to the right edge
      ctx.strokeStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(rightEdge - 80, currentPriceY);
      ctx.lineTo(rightEdge, currentPriceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw price label background
      const priceText = `$${currentPrice.toFixed(2)}`;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      const textWidth = ctx.measureText(priceText).width;
      const labelPadding = 8;
      const labelHeight = 24;
      
      ctx.fillStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.fillRect(rightEdge + 5, currentPriceY - labelHeight/2, textWidth + labelPadding * 2, labelHeight);

      // Draw price text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(priceText, rightEdge + 5 + labelPadding, currentPriceY + 5);

      // Draw small circle at the price point
      ctx.fillStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(rightEdge - 80, currentPriceY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    fetchChartData(timeframe);
  }, [cryptoId, timeframe, chartType]);

  useEffect(() => {
    if (!loading) {
      drawChart();
    }
  }, [chartData, loading]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = container.clientWidth * dpr;
        canvas.height = 400 * dpr;
        canvas.style.width = container.clientWidth + 'px';
        canvas.style.height = '400px';
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
        
        if (!loading) {
          drawChart();
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [loading]);

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
          
          <canvas 
            ref={canvasRef}
            className="w-full h-[400px] bg-slate-900 rounded-b-lg"
            style={{ minHeight: '400px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}