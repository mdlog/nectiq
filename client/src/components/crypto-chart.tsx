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

    // Set up chart dimensions with optimal padding for proper label visibility
    const leftPadding = 100; // More space for price labels on the left
    const rightPadding = 120; // Increased space for real-time price display to prevent cutoff
    const topPadding = 30;
    const bottomPadding = 50; // Space for date labels at bottom
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
    
    // Add padding to prevent line from touching chart edges
    const valuePadding = valueRange * 0.1; // 10% padding
    const paddedMinValue = minValue - valuePadding;
    const paddedMaxValue = maxValue + valuePadding;
    const paddedValueRange = paddedMaxValue - paddedMinValue;

    // Add consistent padding for grid lines
    const chartAreaPadding = chartWidth * 0.05;
    const usableWidth = chartWidth - (chartAreaPadding * 2);
    
    // Draw elegant grid lines with premium styling
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 4; i++) {
      const y = topPadding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(leftPadding + chartAreaPadding, y);
      ctx.lineTo(leftPadding + chartAreaPadding + usableWidth, y);
      ctx.stroke();
    }

    // Draw subtle vertical grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.04)';
    for (let i = 1; i <= 9; i++) {
      const x = leftPadding + chartAreaPadding + (usableWidth * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, topPadding);
      ctx.lineTo(x, topPadding + chartHeight);
      ctx.stroke();
    }

    // Draw elegant price line with enhanced effects
    const chartColor = priceChange24h >= 0 ? '#10b981' : '#ef4444';
    
    // Create subtle outer glow for premium feel
    ctx.strokeStyle = chartColor;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = chartColor;
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x = leftPadding + chartAreaPadding + (usableWidth * index) / (chartData.length - 1);
      const y = topPadding + chartHeight - ((point.value - paddedMinValue) / paddedValueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    
    // Draw main line with crisp gradient
    ctx.globalAlpha = 1;
    const gradient = ctx.createLinearGradient(0, 0, chartWidth, 0);
    if (priceChange24h >= 0) {
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(0.3, '#34d399');
      gradient.addColorStop(0.7, '#6ee7b7');
      gradient.addColorStop(1, '#10b981');
    } else {
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(0.3, '#f87171');
      gradient.addColorStop(0.7, '#fca5a5');
      gradient.addColorStop(1, '#ef4444');
    }
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = chartColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x = leftPadding + chartAreaPadding + (usableWidth * index) / (chartData.length - 1);
      const y = topPadding + chartHeight - ((point.value - paddedMinValue) / paddedValueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw elegant gradient fill with enhanced smoothness
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    const areaGradient = ctx.createLinearGradient(0, topPadding, 0, topPadding + chartHeight);
    if (priceChange24h >= 0) {
      areaGradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      areaGradient.addColorStop(0.2, 'rgba(52, 211, 153, 0.15)');
      areaGradient.addColorStop(0.5, 'rgba(110, 231, 183, 0.08)');
      areaGradient.addColorStop(0.8, 'rgba(16, 185, 129, 0.03)');
      areaGradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
    } else {
      areaGradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
      areaGradient.addColorStop(0.2, 'rgba(248, 113, 113, 0.15)');
      areaGradient.addColorStop(0.5, 'rgba(252, 165, 165, 0.08)');
      areaGradient.addColorStop(0.8, 'rgba(239, 68, 68, 0.03)');
      areaGradient.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
    }
    
    ctx.fillStyle = areaGradient;
    ctx.beginPath();
    ctx.moveTo(leftPadding + chartAreaPadding, topPadding + chartHeight);
    chartData.forEach((point, index) => {
      const x = leftPadding + chartAreaPadding + (usableWidth * index) / (chartData.length - 1);
      const y = topPadding + chartHeight - ((point.value - paddedMinValue) / paddedValueRange) * chartHeight;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(leftPadding + chartAreaPadding + usableWidth, topPadding + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw premium price labels with better visibility
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2;
    
    for (let i = 0; i <= 5; i++) {
      const value = paddedMaxValue - (paddedValueRange * i) / 5;
      const y = topPadding + (chartHeight * i) / 5;
      
      // Format price with appropriate decimal places and commas
      let formattedValue;
      if (value >= 1000) {
        formattedValue = value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      } else if (value >= 1) {
        formattedValue = value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4
        });
      } else {
        formattedValue = value.toLocaleString(undefined, {
          minimumFractionDigits: 6,
          maximumFractionDigits: 8
        });
      }
      
      ctx.fillText(`$${formattedValue}`, leftPadding - 15, y + 4);
    }
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw premium date labels at the bottom
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 2;
    
    chartData.forEach((point, index) => {
      const dateLabel = formatDateLabel(point.time, index, chartData.length);
      if (dateLabel) {
        const x = leftPadding + chartAreaPadding + (usableWidth * index) / (chartData.length - 1);
        const y = topPadding + chartHeight + 25;
        ctx.fillText(dateLabel, x, y);
      }
    });
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw real-time price indicator at the edge of the chart
    if (chartData.length > 0) {
      const lastPrice = chartData[chartData.length - 1].value;
      const priceY = topPadding + chartHeight - ((lastPrice - paddedMinValue) / paddedValueRange) * chartHeight;
      const chartAreaPadding = chartWidth * 0.05;
      const rightEdge = leftPadding + chartWidth - chartAreaPadding;

      // Draw elegant price line with sophisticated dash pattern
      ctx.strokeStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.shadowColor = priceChange24h >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.moveTo(rightEdge - 50, priceY);
      ctx.lineTo(rightEdge - 20, priceY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw premium price label background - positioned within chart area
      const priceText = `$${currentPrice.toLocaleString(undefined, {
        minimumFractionDigits: currentPrice >= 1 ? 2 : 6,
        maximumFractionDigits: currentPrice >= 1 ? 2 : 6
      })}`;
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      const textWidth = ctx.measureText(priceText).width;
      const labelPadding = 8;
      const labelHeight = 26;
      
      // Position label inside chart area, not extending beyond
      const labelX = rightEdge - textWidth - labelPadding * 2 - 25;
      
      // Create gradient background for price label
      const labelGradient = ctx.createLinearGradient(labelX, priceY - labelHeight/2, labelX + textWidth + labelPadding * 2, priceY + labelHeight/2);
      if (priceChange24h >= 0) {
        labelGradient.addColorStop(0, '#059669');
        labelGradient.addColorStop(1, '#047857');
      } else {
        labelGradient.addColorStop(0, '#dc2626');
        labelGradient.addColorStop(1, '#b91c1c');
      }
      
      ctx.fillStyle = labelGradient;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fillRect(labelX, priceY - labelHeight/2, textWidth + labelPadding * 2, labelHeight);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw price label border
      ctx.strokeStyle = priceChange24h >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(labelX, priceY - labelHeight/2, textWidth + labelPadding * 2, labelHeight);

      // Draw premium price text
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 2;
      ctx.fillText(priceText, labelX + textWidth + labelPadding, priceY + 5);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw premium glowing circle at the price point
      ctx.fillStyle = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.shadowColor = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(rightEdge - 50, priceY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Add inner white circle for premium effect
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(rightEdge - 50, priceY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawCandlestickChart = (ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, leftPadding: number, topPadding: number) => {
    const values = chartData.flatMap(d => [d.high!, d.low!]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;
    
    // Add padding to prevent candles from touching chart edges
    const valuePadding = valueRange * 0.1; // 10% padding
    const paddedMinValue = minValue - valuePadding;
    const paddedMaxValue = maxValue + valuePadding;
    const paddedValueRange = paddedMaxValue - paddedMinValue;

    // Add consistent padding for candlestick chart
    const chartAreaPadding = chartWidth * 0.05;
    const usableWidth = chartWidth - (chartAreaPadding * 2);
    
    // Draw premium grid lines with padding
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = topPadding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(leftPadding + chartAreaPadding, y);
      ctx.lineTo(leftPadding + chartAreaPadding + usableWidth, y);
      ctx.stroke();
    }

    // Draw vertical grid lines with padding
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
    for (let i = 0; i <= 10; i++) {
      const x = leftPadding + chartAreaPadding + (usableWidth * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, topPadding);
      ctx.lineTo(x, topPadding + chartHeight);
      ctx.stroke();
    }

    const candleWidth = usableWidth / chartData.length * 0.6;

    chartData.forEach((candle, index) => {
      const x = leftPadding + chartAreaPadding + (usableWidth * (index + 0.5)) / chartData.length;
      const openY = topPadding + chartHeight - ((candle.open! - paddedMinValue) / paddedValueRange) * chartHeight;
      const closeY = topPadding + chartHeight - ((candle.close! - paddedMinValue) / paddedValueRange) * chartHeight;
      const highY = topPadding + chartHeight - ((candle.high! - paddedMinValue) / paddedValueRange) * chartHeight;
      const lowY = topPadding + chartHeight - ((candle.low! - paddedMinValue) / paddedValueRange) * chartHeight;

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

    // Draw premium price labels with better visibility
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2;
    
    for (let i = 0; i <= 5; i++) {
      const value = paddedMaxValue - (paddedValueRange * i) / 5;
      const y = topPadding + (chartHeight * i) / 5;
      
      // Format price with appropriate decimal places and commas
      let formattedValue;
      if (value >= 1000) {
        formattedValue = value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      } else if (value >= 1) {
        formattedValue = value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4
        });
      } else {
        formattedValue = value.toLocaleString(undefined, {
          minimumFractionDigits: 6,
          maximumFractionDigits: 8
        });
      }
      
      ctx.fillText(`$${formattedValue}`, leftPadding - 15, y + 4);
    }
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw premium date labels at the bottom
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 2;
    
    chartData.forEach((candle, index) => {
      const dateLabel = formatDateLabel(candle.time, index, chartData.length);
      if (dateLabel) {
        const chartAreaPadding = chartWidth * 0.05;
        const usableWidth = chartWidth - (chartAreaPadding * 2);
        const x = leftPadding + chartAreaPadding + (usableWidth * (index + 0.5)) / chartData.length;
        const y = topPadding + chartHeight + 25;
        ctx.fillText(dateLabel, x, y);
      }
    });
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw real-time price indicator for candlestick
    if (chartData.length > 0) {
      const lastCandle = chartData[chartData.length - 1];
      const currentPriceY = topPadding + chartHeight - ((currentPrice - paddedMinValue) / paddedValueRange) * chartHeight;
      const chartAreaPadding = chartWidth * 0.05;
      const rightEdge = leftPadding + chartWidth - chartAreaPadding;

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
      ctx.fillRect(rightEdge + 15, currentPriceY - labelHeight/2, textWidth + labelPadding * 2, labelHeight);

      // Draw price text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(priceText, rightEdge + 15 + labelPadding, currentPriceY + 5);

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
        // Mobile-responsive height: 350px on mobile, 400px on desktop
        const canvasHeight = window.innerWidth < 768 ? 350 : 400;
        
        canvas.width = container.clientWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = container.clientWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        
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
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl backdrop-blur-sm mx-2 md:mx-0 rounded-2xl">
      <CardHeader className="pb-4 px-6">
        {/* Premium header layout */}
        <div className="space-y-4">
          {/* Title and Price Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-slate-600/30">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-md"></div>
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold text-white">
                  {name} ({symbol.toUpperCase()})
                </div>
                <div className="text-lg md:text-xl font-bold text-emerald-400 mt-1">
                  ${currentPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: currentPrice >= 1 ? 2 : 6
                  })}
                </div>
              </div>
            </div>
            
            {/* Premium Price Change Badge */}
            <div className="flex items-center">
              <div className={`flex items-center px-4 py-2 rounded-xl font-bold text-lg shadow-lg border ${
                priceChange24h >= 0 
                  ? 'text-green-400 bg-green-500/20 border-green-500/30 shadow-green-500/20' 
                  : 'text-red-400 bg-red-500/20 border-red-500/30 shadow-red-500/20'
              }`}>
                {priceChange24h >= 0 ? <TrendingUp size={20} className="mr-2" /> : <TrendingDown size={20} className="mr-2" />}
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium Chart Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-700/30">
          {/* Timeframe Selector - Premium styling */}
          <div className="flex gap-1 flex-wrap">
            {timeframeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeframe === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(option.value)}
                className={`h-10 px-4 text-sm font-bold min-w-[52px] transition-all duration-200 ${
                  timeframe === option.value 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-600/30'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Chart Type Selector - Premium styling */}
          <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-600/30">
            <Button
              variant={chartType === 'line' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType('line')}
              className={`h-9 px-5 text-sm font-bold transition-all duration-200 ${
                chartType === 'line' 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'candlestick' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType('candlestick')}
              className={`h-9 px-5 text-sm font-bold transition-all duration-200 ${
                chartType === 'candlestick' 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Candles
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Premium Chart Area */}
        <div className="relative px-4 pb-4">
          {loading && (
            <div className="absolute inset-4 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm z-10 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="animate-spin w-7 h-7 border-3 border-slate-600 border-t-blue-500 rounded-full shadow-lg"></div>
                <span className="text-sm font-semibold">Loading premium chart data...</span>
              </div>
            </div>
          )}
          
          <canvas 
            ref={canvasRef}
            className="w-full h-[350px] md:h-[400px] bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 rounded-xl border border-slate-700/50 shadow-2xl"
            style={{ minHeight: '350px' }}
          />
        </div>

        {/* Premium Predict Button */}
        {onPredictClick && (
          <div className="p-6">
            <Button
              onClick={() => onPredictClick(cryptoId)}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white py-3 text-base font-bold rounded-xl shadow-xl shadow-blue-500/25 border border-blue-500/30 transition-all duration-300 transform hover:scale-[1.02]"
              size="default"
            >
              <Target size={18} className="mr-2" />
              Make Prediction for {symbol.toUpperCase()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}