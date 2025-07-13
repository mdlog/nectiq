import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3, LineChart, Activity, Layers, Zap } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

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

type ChartType = 'line' | 'candlestick' | 'area' | 'bar' | 'bubble';

export default function CryptoChart({ cryptoId, symbol, name, currentPrice, priceChange24h, onPredictClick }: CryptoChartProps) {
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
      
      data.push({
        time: date.toISOString().split('T')[0],
        value: dayPrice,
      });
    }
    
    setChartData(data);
  };

  useEffect(() => {
    fetchChartData(timeframe);
  }, [cryptoId, timeframe, chartType]);

  // Chart.js configuration
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        borderColor: priceChange24h >= 0 ? '#10b981' : '#ef4444',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            });
          },
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y;
            return `Price: $${value.toLocaleString(undefined, {
              minimumFractionDigits: value >= 1 ? 2 : 6,
              maximumFractionDigits: value >= 1 ? 2 : 6
            })}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: parseInt(timeframe) <= 7 ? 'day' : 'week',
          displayFormats: {
            day: 'MMM dd',
            week: 'MMM dd'
          }
        },
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.08)',
          lineWidth: 0.5,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            weight: 'bold'
          },
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        }
      },
      y: {
        position: 'left',
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.08)',
          lineWidth: 0.5,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            weight: 'bold'
          },
          callback: function(value) {
            const numValue = Number(value);
            if (numValue >= 1000) {
              return `$${numValue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}`;
            } else if (numValue >= 1) {
              return `$${numValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;
            } else {
              return `$${numValue.toLocaleString(undefined, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 6
              })}`;
            }
          }
        },
        border: {
          display: false,
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
        hoverBorderWidth: 2,
        hoverBorderColor: '#ffffff',
        hoverBackgroundColor: priceChange24h >= 0 ? '#10b981' : '#ef4444',
      },
      line: {
        borderWidth: 3,
        tension: 0.4,
      }
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      }
    }
  };

  // Prepare chart data for Chart.js
  const chartJsData = {
    labels: chartData.map(d => d.time),
    datasets: [
      {
        label: `${symbol} Price`,
        data: chartData.map(d => ({
          x: d.time,
          y: d.value
        })),
        borderColor: priceChange24h >= 0 ? '#10b981' : '#ef4444',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return 'rgba(16, 185, 129, 0.1)';
          }
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          if (priceChange24h >= 0) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.1)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.1)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
          }
          return gradient;
        },
        fill: chartType === 'area' || chartType === 'line',
        pointBackgroundColor: priceChange24h >= 0 ? '#10b981' : '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        shadowColor: priceChange24h >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
      }
    ]
  };

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <CardTitle className="flex items-center text-lg md:text-xl">
              <BarChart3 className="mr-2" size={24} />
              {symbol} - ${currentPrice.toLocaleString(undefined, { 
                minimumFractionDigits: currentPrice >= 1 ? 2 : 6,
                maximumFractionDigits: currentPrice >= 1 ? 2 : 6 
              })}
            </CardTitle>
            <div className="flex items-center">
              {priceChange24h >= 0 ? (
                <TrendingUp className="mr-1 text-success" size={16} />
              ) : (
                <TrendingDown className="mr-1 text-error" size={16} />
              )}
              <span className={`text-sm font-semibold ${priceChange24h >= 0 ? 'text-success' : 'text-error'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
              </span>
            </div>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-600 bg-slate-800/50 p-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-8 px-3"
              >
                <LineChart size={14} className="mr-1" />
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className="h-8 px-3"
              >
                <Activity size={14} className="mr-1" />
                Area
              </Button>
              <Button
                variant={chartType === 'candlestick' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('candlestick')}
                className="h-8 px-3"
              >
                <BarChart3 size={14} className="mr-1" />
                Candle
              </Button>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-slate-400 mr-2">Timeframe:</span>
          <div className="flex rounded-lg border border-slate-600 bg-slate-800/50 p-1">
            {[
              { value: '1', label: '1D' },
              { value: '7', label: '7D' },
              { value: '30', label: '1M' },
              { value: '90', label: '3M' }
            ].map((tf) => (
              <Button
                key={tf.value}
                variant={timeframe === tf.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe(tf.value)}
                className="h-8 px-3 text-xs"
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-slate-400">Loading chart data...</span>
            </div>
          ) : (
            <Line data={chartJsData} options={chartOptions} />
          )}
        </div>

        {/* Predict Button */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
            onClick={() => onPredictClick?.(cryptoId)}
          >
            <Target className="mr-2" size={18} />
            Make Prediction for {symbol}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}