import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import FinancialMetrics from '@/components/financial-metrics';
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
  ChartOptions,
  TooltipItem,
  ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

type ChartType = 'line' | 'candlestick';

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
      
      // Generate realistic price variation based on 24h change and timeframe
      const dayVariation = (Math.random() - 0.5) * 0.1; // ±5% daily variation
      const trendFactor = (priceChange24h / 100) * (i / actualDays); // Apply trend over time
      const priceMultiplier = 1 + dayVariation + trendFactor;
      
      const value = basePrice * priceMultiplier;
      
      data.push({
        time: date.toISOString(),
        value: Math.max(value, 0), // Ensure price is never negative
        open: value * (1 + (Math.random() - 0.5) * 0.02),
        high: value * (1 + Math.random() * 0.03),
        low: value * (1 - Math.random() * 0.03),
        close: value
      });
    }
    
    setChartData(data);
  };

  useEffect(() => {
    fetchChartData(timeframe);
  }, [cryptoId, timeframe, chartType]);

  // Prepare Chart.js data
  const chartJsData = {
    labels: chartData.map(item => {
      const date = new Date(item.time);
      if (timeframe === '1') {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      } else if (timeframe === '7') {
        return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      }
    }),
    datasets: [
      {
        label: `${symbol} Price`,
        data: chartData.map(item => item.value),
        borderColor: priceChange24h >= 0 ? '#10b981' : '#ef4444',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          if (priceChange24h >= 0) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(0.3, 'rgba(52, 211, 153, 0.2)');
            gradient.addColorStop(0.7, 'rgba(110, 231, 183, 0.1)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
            gradient.addColorStop(0.3, 'rgba(248, 113, 113, 0.2)');
            gradient.addColorStop(0.7, 'rgba(252, 165, 165, 0.1)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
          }
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: priceChange24h >= 0 ? '#10b981' : '#ef4444',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        shadowColor: priceChange24h >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
      }
    ]
  };

  // Chart.js options with elegant styling
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: priceChange24h >= 0 ? '#10b981' : '#ef4444',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const value = context.parsed.y;
            let formattedValue;
            if (value >= 1000) {
              formattedValue = value.toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
            } else if (value >= 1) {
              formattedValue = value.toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
              });
            } else {
              formattedValue = value.toLocaleString('id-ID', {
                minimumFractionDigits: 6,
                maximumFractionDigits: 8
              });
            }
            return `$${formattedValue}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.06)',
          lineWidth: 1
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            weight: '500'
          },
          maxTicksLimit: 8
        },
        border: {
          display: false
        }
      },
      y: {
        display: true,
        position: 'right',
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.08)',
          lineWidth: 1
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            weight: '600'
          },
          callback: function(tickValue: string | number) {
            const value = Number(tickValue);
            if (value >= 1000) {
              return `$${value.toLocaleString('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}`;
            } else if (value >= 1) {
              return `$${value.toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;
            } else {
              return `$${value.toLocaleString('id-ID', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 6
              })}`;
            }
          }
        },
        border: {
          display: false
        }
      }
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round'
      }
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (price >= 1) {
      return price.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      });
    } else {
      return price.toLocaleString('id-ID', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 8
      });
    }
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{symbol}</span>
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(currentPrice)}
                </span>
                <span className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                  priceChange24h >= 0 
                    ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
                    : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                }`}>
                  {priceChange24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {formatPercentage(priceChange24h)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {['1', '7', '30', '90'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeframe === tf
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tf === '1' ? '24H' : tf === '7' ? '7D' : tf === '30' ? '1M' : '3M'}
                </button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'candlestick' : 'line')}
              className="border-gray-200 dark:border-gray-700"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="h-80 mb-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Line data={chartJsData} options={chartOptions} />
          )}
        </div>

        {/* Financial Metrics Section */}
        <FinancialMetrics cryptoId={cryptoId} symbol={symbol} />
        
        {onPredictClick && (
          <Button 
            onClick={() => onPredictClick(cryptoId)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Target className="w-4 h-4 mr-2" />
            Make Prediction for {symbol}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}