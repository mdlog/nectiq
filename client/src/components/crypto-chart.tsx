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
      // Calculate actual days to fetch based on timeframe
      const actualDays = getActualDaysToFetch(days);
      
      // Use our backend endpoint to avoid CORS issues
      const response = await fetch(`/api/crypto/chart/${cryptoId}?days=${actualDays}&type=${chartType}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Generate fallback data based on current price with realistic variations
      generateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine actual days to fetch based on timeframe
  const getActualDaysToFetch = (timeframeDays: string): string => {
    switch(timeframeDays) {
      case '1': return '7';    // 1D timeframe shows 7 days of data
      case '7': return '14';   // 7D timeframe shows 14 days of data  
      case '30': return '60';  // 30D timeframe shows 60 days of data
      case '90': return '180'; // 90D timeframe shows 180 days of data
      default: return timeframeDays;
    }
  };

  const generateFallbackData = () => {
    // Use actual days to generate data based on timeframe
    const actualDays = parseInt(getActualDaysToFetch(timeframe));
    const data: ChartData[] = [];
    const basePrice = currentPrice;
    
    for (let i = actualDays; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price variations (±5% daily)
      const variation = (Math.random() - 0.5) * 0.1; // ±5%
      const dayPrice = basePrice * (1 + variation * (i / actualDays));
      
      if (chartType === 'candlestick') {
        const open = dayPrice * (1 + (Math.random() - 0.5) * 0.02);
        const close = dayPrice * (1 + (Math.random() - 0.5) * 0.02);
        const high = Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = Math.min(open, close) * (1 - Math.random() * 0.02);
        
        data.push({
          time: date.toISOString().split('T')[0],
          value: close,
          open,
          high,
          low,
          close,
        });
      } else {
        data.push({
          time: date.toISOString().split('T')[0],
          value: dayPrice,
        });
      }
    }
    
    setChartData(data);
  };

  // Helper function to format dates for x-axis labels
  const formatDateLabel = (timeStr: string, index: number, totalPoints: number) => {
    const date = new Date(timeStr);
    const actualDays = parseInt(getActualDaysToFetch(timeframe));
    
    // Adjust max labels based on data range - more data needs fewer labels
    let maxLabels = 6;
    if (actualDays >= 60) maxLabels = 5;  // For 60+ days, show fewer labels
    if (actualDays >= 180) maxLabels = 4; // For 180+ days, show even fewer labels
    
    const step = Math.max(1, Math.floor(totalPoints / maxLabels));
    
    if (index % step !== 0 && index !== totalPoints - 1) {
      return null; // Don't show this label
    }
    
    if (actualDays <= 7) {
      // For 7 days or less, show day and month
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else if (actualDays <= 30) {
      // For up to 30 days, show day and month
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      // For longer periods, show month and year for better context
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        year: '2-digit'
      });
    }
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Set up chart dimensions with extra space for price labels and date labels
    const leftPadding = 80; // More space for price labels on the left
    const rightPadding = 80; // Reduced space for real-time price display
    const topPadding = 40;
    const bottomPadding = 60; // Increased space for date labels at bottom
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

    // Draw date labels at the bottom
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    chartData.forEach((point, index) => {
      const dateLabel = formatDateLabel(point.time, index, chartData.length);
      if (dateLabel) {
        const x = leftPadding + (chartWidth * index) / (chartData.length - 1);
        const y = topPadding + chartHeight + 20;
        ctx.fillText(dateLabel, x, y);
      }
    });

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
      ctx.moveTo(rightEdge - 40, priceY);
      ctx.lineTo(rightEdge, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw price label background
      const priceText = `$${currentPrice.toFixed(2)}`;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      const textWidth = ctx.measureText(priceText).width;
      const labelPadding = 6;
      const labelHeight = 20;
      
      ctx.fillStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.fillRect(rightEdge + 5, priceY - labelHeight/2, textWidth + labelPadding * 2, labelHeight);

      // Draw price text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(priceText, rightEdge + 5 + labelPadding, priceY + 4);

      // Draw small circle at the price point
      ctx.fillStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(rightEdge - 40, priceY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawCandlestickChart = (ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, leftPadding: number, topPadding: number) => {
    const values = chartData.flatMap(d => [d.high!, d.low!]);
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

    const candleWidth = chartWidth / chartData.length * 0.6;

    chartData.forEach((candle, index) => {
      const x = leftPadding + (chartWidth * (index + 0.5)) / chartData.length;
      const openY = topPadding + chartHeight - ((candle.open! - minValue) / valueRange) * chartHeight;
      const closeY = topPadding + chartHeight - ((candle.close! - minValue) / valueRange) * chartHeight;
      const highY = topPadding + chartHeight - ((candle.high! - minValue) / valueRange) * chartHeight;
      const lowY = topPadding + chartHeight - ((candle.low! - minValue) / valueRange) * chartHeight;

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
      const y = topPadding + (chartHeight * i) / 5;
      ctx.fillText(`$${value.toFixed(2)}`, leftPadding - 5, y + 4);
    }

    // Draw date labels at the bottom
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    chartData.forEach((candle, index) => {
      const dateLabel = formatDateLabel(candle.time, index, chartData.length);
      if (dateLabel) {
        const x = leftPadding + (chartWidth * (index + 0.5)) / chartData.length;
        const y = topPadding + chartHeight + 20;
        ctx.fillText(dateLabel, x, y);
      }
    });

    // Draw real-time price indicator for candlestick
    if (chartData.length > 0) {
      const lastCandle = chartData[chartData.length - 1];
      const currentPriceY = topPadding + chartHeight - ((currentPrice - minValue) / valueRange) * chartHeight;
      const rightEdge = leftPadding + chartWidth;

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
  }, [chartData, loading, currentPrice, priceChange24h]);

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
            {/* Tombol Predict dipindahkan ke bawah chart */}
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
            className="w-full h-[400px] bg-slate-900 rounded-lg"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Predict Button - Full Width Below Chart */}
        {onPredictClick && (
          <div className="mt-4">
            <Button
              onClick={() => onPredictClick(cryptoId)}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold"
              size="lg"
            >
              <Target size={20} className="mr-2" />
              Make Prediction for {symbol.toUpperCase()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}