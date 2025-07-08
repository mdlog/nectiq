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
      case '14': return '28';  // 14D timeframe shows 28 days of data  
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
    
    // Show more labels for better date visibility like in the reference image
    let maxLabels = 10;  // Increased to show more dates
    if (actualDays >= 28) maxLabels = 8;   // For 28+ days (14D timeframe) 
    if (actualDays >= 60) maxLabels = 7;   // For 60+ days
    if (actualDays >= 180) maxLabels = 6;  // For 180+ days
    
    const step = Math.max(1, Math.floor(totalPoints / maxLabels));
    
    if (index % step !== 0 && index !== totalPoints - 1) {
      return null; // Don't show this label
    }
    
    if (actualDays <= 7) {
      // For 7 days or less, show month and day
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else if (actualDays <= 60) {
      // For up to 60 days, show month and day in abbreviated format like "Jun 24"
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
    
    // Create ultra-premium radial gradient background
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    bgGradient.addColorStop(0, 'rgba(15, 23, 42, 1)');
    bgGradient.addColorStop(0.3, 'rgba(30, 41, 59, 0.98)');
    bgGradient.addColorStop(0.6, 'rgba(51, 65, 85, 0.95)');
    bgGradient.addColorStop(1, 'rgba(71, 85, 105, 0.9)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle noise texture for premium feel
    ctx.globalAlpha = 0.02;
    for (let i = 0; i < width; i += 6) {
      for (let j = 0; j < height; j += 6) {
        if (Math.random() > 0.7) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i, j, 1, 1);
        }
      }
    }
    ctx.globalAlpha = 1;

    // Set up balanced chart dimensions for better proportions
    const leftPadding = 70; // Optimal space for price labels
    const rightPadding = 100; // Adequate space for real-time price display
    const topPadding = 30; // Reduced top padding for better height utilization
    const bottomPadding = 45; // Optimal space for date labels
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

    // Draw ultra-premium grid lines with enhanced gradients
    const gridGradient = ctx.createLinearGradient(0, topPadding, 0, topPadding + chartHeight);
    gridGradient.addColorStop(0, 'rgba(100, 116, 139, 0.5)');
    gridGradient.addColorStop(0.2, 'rgba(120, 136, 159, 0.4)');
    gridGradient.addColorStop(0.5, 'rgba(100, 116, 139, 0.3)');
    gridGradient.addColorStop(0.8, 'rgba(80, 96, 119, 0.2)');
    gridGradient.addColorStop(1, 'rgba(60, 76, 99, 0.1)');
    
    // Draw horizontal grid lines with subtle glow - more lines for better proportion
    ctx.strokeStyle = gridGradient;
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(100, 116, 139, 0.3)';
    ctx.shadowBlur = 1;
    for (let i = 0; i <= 8; i++) { // Increased from 5 to 8 for better proportions
      const y = topPadding + (chartHeight * i) / 8;
      ctx.beginPath();
      ctx.moveTo(leftPadding, y);
      ctx.lineTo(leftPadding + chartWidth, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines for better readability - optimized spacing
    ctx.shadowBlur = 0.5;
    const verticalLines = Math.min(chartData.length, 12); // Increased from 8 to 12
    for (let i = 0; i <= verticalLines; i++) {
      const x = leftPadding + (chartWidth * i) / verticalLines;
      ctx.beginPath();
      ctx.moveTo(x, topPadding);
      ctx.lineTo(x, topPadding + chartHeight);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Draw professional gradient price line with glow effect
    const lineGradient = ctx.createLinearGradient(leftPadding, topPadding, leftPadding + chartWidth, topPadding);
    if (priceChange24h >= 0) {
      lineGradient.addColorStop(0, '#10b981');
      lineGradient.addColorStop(0.5, '#06d6a0');
      lineGradient.addColorStop(1, '#0ea5e9');
    } else {
      lineGradient.addColorStop(0, '#ef4444');
      lineGradient.addColorStop(0.5, '#f97316');
      lineGradient.addColorStop(1, '#ec4899');
    }

    // Create line path function for reuse
    const createLinePath = () => {
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
    };

    // Draw multiple glow layers for dramatic effect
    const glowColor = priceChange24h >= 0 ? '#10b981' : '#ef4444';
    
    // Outer glow (widest, most transparent)
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    createLinePath();
    ctx.stroke();
    
    // Medium glow
    ctx.shadowBlur = 10;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.3;
    createLinePath();
    ctx.stroke();
    
    // Inner glow
    ctx.shadowBlur = 5;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;
    createLinePath();
    ctx.stroke();
    
    // Main line with premium gradient
    ctx.shadowBlur = 2;
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1;
    createLinePath();
    ctx.stroke();
    
    // Reset shadow for other elements
    ctx.shadowBlur = 0;
    
    // Add premium highlight points along the line
    chartData.forEach((point, index) => {
      const x = leftPadding + (chartWidth * index) / (chartData.length - 1);
      const y = topPadding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      
      // Skip too many points for performance, show only key points
      if (index % Math.max(1, Math.floor(chartData.length / 12)) === 0 || index === chartData.length - 1) {
        // Outer glow for points
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.fillStyle = glowColor;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Inner bright point
        ctx.shadowBlur = 4;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Center highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Draw enhanced gradient fill with multiple stops
    const areaGradient = ctx.createLinearGradient(0, topPadding, 0, topPadding + chartHeight);
    if (priceChange24h >= 0) {
      areaGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      areaGradient.addColorStop(0.3, 'rgba(6, 214, 160, 0.2)');
      areaGradient.addColorStop(0.7, 'rgba(14, 165, 233, 0.1)');
      areaGradient.addColorStop(1, 'rgba(14, 165, 233, 0)');
    } else {
      areaGradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      areaGradient.addColorStop(0.3, 'rgba(249, 115, 22, 0.2)');
      areaGradient.addColorStop(0.7, 'rgba(236, 72, 153, 0.1)');
      areaGradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
    }
    
    ctx.fillStyle = areaGradient;
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

    // Draw enhanced price labels with background
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 8; i++) {
      const value = maxValue - (valueRange * i) / 8;
      const y = topPadding + (chartHeight * i) / 8;
      const text = `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      })}`;
      
      // Draw premium glass morphism background for label
      const textMetrics = ctx.measureText(text);
      const bgWidth = textMetrics.width + 16;
      const bgHeight = 20;
      
      // Premium gradient background
      const labelGradient = ctx.createLinearGradient(leftPadding - bgWidth, y - bgHeight/2, leftPadding, y + bgHeight/2);
      labelGradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      labelGradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.9)');
      labelGradient.addColorStop(1, 'rgba(51, 65, 85, 0.85)');
      ctx.fillStyle = labelGradient;
      
      // Add shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillRect(leftPadding - bgWidth, y - bgHeight/2, bgWidth, bgHeight);
      ctx.shadowBlur = 0;
      
      // Add premium border
      const borderGradient = ctx.createLinearGradient(leftPadding - bgWidth, y - bgHeight/2, leftPadding, y + bgHeight/2);
      borderGradient.addColorStop(0, 'rgba(148, 163, 184, 0.5)');
      borderGradient.addColorStop(1, 'rgba(100, 116, 139, 0.3)');
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 1;
      ctx.strokeRect(leftPadding - bgWidth, y - bgHeight/2, bgWidth, bgHeight);
      
      // Draw label text with subtle glow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 2;
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(text, leftPadding - 8, y + 4);
      ctx.shadowBlur = 0;
    }

    // Draw enhanced date labels with background
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    chartData.forEach((point, index) => {
      const dateLabel = formatDateLabel(point.time, index, chartData.length);
      if (dateLabel) {
        const x = leftPadding + (chartWidth * index) / (chartData.length - 1);
        const y = topPadding + chartHeight + 22;
        
        // Draw premium glass morphism background for date label
        const textMetrics = ctx.measureText(dateLabel);
        const bgWidth = textMetrics.width + 14;
        const bgHeight = 20;
        
        // Premium gradient background for date labels
        const dateLabelGradient = ctx.createLinearGradient(x - bgWidth/2, y - 12, x + bgWidth/2, y + 8);
        dateLabelGradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        dateLabelGradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.9)');
        dateLabelGradient.addColorStop(1, 'rgba(51, 65, 85, 0.85)');
        ctx.fillStyle = dateLabelGradient;
        
        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillRect(x - bgWidth/2, y - 12, bgWidth, bgHeight);
        ctx.shadowBlur = 0;
        
        // Add premium border
        const dateBorderGradient = ctx.createLinearGradient(x - bgWidth/2, y - 12, x + bgWidth/2, y + 8);
        dateBorderGradient.addColorStop(0, 'rgba(148, 163, 184, 0.5)');
        dateBorderGradient.addColorStop(1, 'rgba(100, 116, 139, 0.3)');
        ctx.strokeStyle = dateBorderGradient;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - bgWidth/2, y - 12, bgWidth, bgHeight);
        
        // Draw label text with subtle glow
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 2;
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(dateLabel, x, y + 3);
        ctx.shadowBlur = 0;
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

      // Draw premium price label background
      const priceText = `$${currentPrice.toFixed(2)}`;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'left';
      const textWidth = ctx.measureText(priceText).width;
      const labelPadding = 10;
      const labelHeight = 26;
      
      // Premium gradient background for price label
      const priceGradient = ctx.createLinearGradient(rightEdge + 5, priceY - labelHeight/2, rightEdge + 5 + textWidth + labelPadding * 2, priceY + labelHeight/2);
      if (priceChange24h >= 0) {
        priceGradient.addColorStop(0, '#10b981');
        priceGradient.addColorStop(0.5, '#059669');
        priceGradient.addColorStop(1, '#047857');
      } else {
        priceGradient.addColorStop(0, '#ef4444');
        priceGradient.addColorStop(0.5, '#dc2626');
        priceGradient.addColorStop(1, '#b91c1c');
      }
      
      // Add shadow to price label
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = priceGradient;
      ctx.fillRect(rightEdge + 5, priceY - labelHeight/2, textWidth + labelPadding * 2, labelHeight);
      ctx.shadowBlur = 0;

      // Add border to price label
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rightEdge + 5, priceY - labelHeight/2, textWidth + labelPadding * 2, labelHeight);

      // Draw price text with glow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(priceText, rightEdge + 5 + labelPadding, priceY + 5);
      ctx.shadowBlur = 0;

      // Draw premium animated circle at the price point with glow
      const circleColor = priceChange24h >= 0 ? '#10b981' : '#ef4444';
      
      // Outer glow
      ctx.shadowColor = circleColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = circleColor;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(rightEdge - 40, priceY, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner bright circle
      ctx.shadowBlur = 5;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(rightEdge - 40, priceY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Center white highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(rightEdge - 40, priceY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawCandlestickChart = (ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, leftPadding: number, topPadding: number) => {
    const values = chartData.flatMap(d => [d.high!, d.low!]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw professional grid lines matching line chart
    const gridGradient = ctx.createLinearGradient(0, topPadding, 0, topPadding + chartHeight);
    gridGradient.addColorStop(0, 'rgba(100, 116, 139, 0.5)');
    gridGradient.addColorStop(0.2, 'rgba(120, 136, 159, 0.4)');
    gridGradient.addColorStop(0.5, 'rgba(100, 116, 139, 0.3)');
    gridGradient.addColorStop(0.8, 'rgba(80, 96, 119, 0.2)');
    gridGradient.addColorStop(1, 'rgba(60, 76, 99, 0.1)');
    
    ctx.strokeStyle = gridGradient;
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(100, 116, 139, 0.3)';
    ctx.shadowBlur = 1;
    for (let i = 0; i <= 8; i++) {
      const y = topPadding + (chartHeight * i) / 8;
      ctx.beginPath();
      ctx.moveTo(leftPadding, y);
      ctx.lineTo(leftPadding + chartWidth, y);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

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

    // Draw premium price labels with glass morphism
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 8; i++) {
      const value = maxValue - (valueRange * i) / 8;
      const y = topPadding + (chartHeight * i) / 8;
      const text = `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      })}`;
      
      // Draw premium glass morphism background for label
      const textMetrics = ctx.measureText(text);
      const bgWidth = textMetrics.width + 16;
      const bgHeight = 20;
      
      // Premium gradient background
      const labelGradient = ctx.createLinearGradient(leftPadding - bgWidth, y - bgHeight/2, leftPadding, y + bgHeight/2);
      labelGradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      labelGradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.9)');
      labelGradient.addColorStop(1, 'rgba(51, 65, 85, 0.85)');
      
      ctx.fillStyle = labelGradient;
      ctx.shadowColor = 'rgba(15, 23, 42, 0.8)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillRect(leftPadding - bgWidth, y - bgHeight/2, bgWidth, bgHeight);
      ctx.shadowBlur = 0;
      
      // Add premium border
      const borderGradient = ctx.createLinearGradient(leftPadding - bgWidth, y - bgHeight/2, leftPadding, y + bgHeight/2);
      borderGradient.addColorStop(0, 'rgba(148, 163, 184, 0.5)');
      borderGradient.addColorStop(1, 'rgba(100, 116, 139, 0.3)');
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 1;
      ctx.strokeRect(leftPadding - bgWidth, y - bgHeight/2, bgWidth, bgHeight);
      
      // Draw label text with glow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 2;
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(text, leftPadding - 8, y + 4);
      ctx.shadowBlur = 0;
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
        // Improved proportional height: 420px on mobile, 480px on desktop for better chart proportions
        const canvasHeight = window.innerWidth < 768 ? 420 : 480;
        
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
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-2xl mx-2 md:mx-0 rounded-2xl backdrop-blur-sm">
      <CardHeader className="pb-4 px-4 md:px-6 bg-gradient-to-r from-slate-800/60 to-slate-700/40 rounded-t-2xl border-b border-slate-600/30">
        {/* Modern Professional Header */}
        <div className="space-y-4">
          {/* Title and Price Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-slate-800"></div>
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold text-white">
                  {name}
                </div>
                <div className="text-sm text-slate-400 font-medium">
                  {symbol.toUpperCase()}
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mt-1">
                  ${currentPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                  })}
                </div>
              </div>
            </div>
            
            {/* Enhanced Price Change Badge */}
            <div className="flex items-center">
              <div className={`flex items-center text-lg md:text-xl px-4 py-3 rounded-2xl font-bold shadow-lg border ${
                priceChange24h >= 0 
                  ? 'text-emerald-300 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/30' 
                  : 'text-red-300 bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/30'
              }`}>
                {priceChange24h >= 0 ? <TrendingUp size={20} className="mr-2" /> : <TrendingDown size={20} className="mr-2" />}
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Professional Chart Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          {/* Enhanced Timeframe Selector */}
          <div className="flex gap-2 bg-slate-800/40 backdrop-blur-sm rounded-xl p-1.5 border border-slate-600/30">
            {timeframeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeframe === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(option.value)}
                className={`text-sm px-4 py-2 min-w-[55px] h-9 rounded-lg font-medium transition-all duration-200 ${
                  timeframe === option.value 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Enhanced Chart Type Selector */}
          <div className="flex gap-1.5 bg-slate-800/40 backdrop-blur-sm rounded-xl p-1.5 border border-slate-600/30">
            <Button
              variant={chartType === 'line' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType('line')}
              className={`text-sm px-4 py-2 h-9 rounded-lg font-medium transition-all duration-200 ${
                chartType === 'line' 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:shadow-xl' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'candlestick' ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType('candlestick')}
              className={`text-sm px-4 py-2 h-9 rounded-lg font-medium transition-all duration-200 flex items-center ${
                chartType === 'candlestick' 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:shadow-xl' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-1.5" />
              Candles
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 bg-gradient-to-b from-slate-800/30 to-slate-900/60">
        {/* Professional Chart Area */}
        <div className="relative px-4 md:px-6 py-4">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm z-10 rounded-xl">
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-lg font-medium">Loading Chart Data...</span>
              </div>
            </div>
          )}
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
            <canvas 
              ref={canvasRef}
              className="w-full h-[350px] md:h-[420px] bg-transparent"
              style={{ minHeight: '350px' }}
            />
            
            {/* Professional grid overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/20 to-transparent"></div>
            
            {/* Subtle inner glow */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-inner"></div>
          </div>
        </div>

        {/* Enhanced Predict Button */}
        {onPredictClick && (
          <div className="p-4 md:p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
            <Button
              onClick={() => onPredictClick(cryptoId)}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white py-4 md:py-3 text-lg font-bold rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/25 border border-blue-400/30"
              size="lg"
            >
              <Target size={22} className="mr-3" />
              Make Prediction for {symbol.toUpperCase()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}