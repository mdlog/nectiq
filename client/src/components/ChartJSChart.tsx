import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line, Bar } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Maximize2, Minimize2, TrendingUp, Activity } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

interface ChartJSChartProps {
  cryptoId: string;
  onPredictionClick: () => void;
}

interface TimeframeOption {
  value: string;
  label: string;
  minutes: number;
}

const timeframes: TimeframeOption[] = [
  { value: '1m', label: '1M', minutes: 1 },
  { value: '5m', label: '5M', minutes: 5 },
  { value: '15m', label: '15M', minutes: 15 },
  { value: '1h', label: '1H', minutes: 60 },
  { value: '4h', label: '4H', minutes: 240 },
  { value: '1d', label: '1D', minutes: 1440 },
];

export default function ChartJSChart({ cryptoId, onPredictionClick }: ChartJSChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Fetch crypto data (same source as Live Prices for consistency)
  const { data: cryptoData } = useQuery<any[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 3000, // 3 seconds for real-time sync with Live Prices
    staleTime: 1000, // Very fresh data
    refetchInBackground: true,
  });

  // Get crypto info
  const cryptoInfo = cryptoData?.find((c: any) => c.id === cryptoId);

  // Generate realistic historical data with current price as endpoint
  const generateHistoricalData = () => {
    if (!cryptoInfo) return { labels: [], data: [] };

    const currentPrice = cryptoInfo.current_price;
    const timeframeData = timeframes.find(tf => tf.value === selectedTimeframe);
    const intervalMs = (timeframeData?.minutes || 60) * 60 * 1000;
    
    // Determine data points based on timeframe
    const dataPoints = selectedTimeframe === '1m' ? 60 :
                       selectedTimeframe === '5m' ? 72 :
                       selectedTimeframe === '15m' ? 64 :
                       selectedTimeframe === '1h' ? 48 :
                       selectedTimeframe === '4h' ? 42 :
                       selectedTimeframe === '1d' ? 30 : 48;

    const labels: string[] = [];
    const data: number[] = [];
    const now = Date.now();

    // Generate historical prices working backwards from current price with controlled volatility
    const historicalPrices: number[] = [];
    
    // Start with current price as the last point
    historicalPrices[dataPoints - 1] = currentPrice;
    
    // Generate previous prices working backwards with much smaller variations
    for (let i = dataPoints - 2; i >= 0; i--) {
      // Use much smaller, more realistic volatility
      let maxVariation = 0.005; // 0.5% max variation per step
      switch (selectedTimeframe) {
        case '1m':
        case '5m':
          maxVariation = 0.001; // 0.1% for very short timeframes
          break;
        case '15m':
          maxVariation = 0.002; // 0.2%
          break;
        case '1h':
          maxVariation = 0.003; // 0.3%
          break;
        case '4h':
          maxVariation = 0.008; // 0.8%
          break;
        case '1d':
          maxVariation = 0.015; // 1.5% max
          break;
      }

      // Create small, realistic price movement
      const randomVariation = (Math.random() - 0.5) * maxVariation * 2;
      const priceChange = 1 + randomVariation;
      
      // Work backwards from the next price point with strict bounds
      const nextPrice = historicalPrices[i + 1];
      const newPrice = nextPrice / priceChange;
      
      // Ensure price stays within reasonable bounds (±20% of current price)
      const minPrice = currentPrice * 0.8;
      const maxPrice = currentPrice * 1.2;
      historicalPrices[i] = Math.max(minPrice, Math.min(maxPrice, newPrice));
    }

    // Now build labels and data arrays
    for (let i = 0; i < dataPoints; i++) {
      const timestamp = new Date(now - (dataPoints - 1 - i) * intervalMs);
      
      // Format label based on timeframe
      let label = '';
      if (selectedTimeframe === '1m' || selectedTimeframe === '5m') {
        label = timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      } else if (selectedTimeframe === '15m' || selectedTimeframe === '1h') {
        label = timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      } else if (selectedTimeframe === '4h') {
        label = timestamp.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + 
                timestamp.toLocaleTimeString('id-ID', { hour: '2-digit' });
      } else {
        label = timestamp.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      }
      
      labels.push(label);
      data.push(historicalPrices[i]);
    }

    return { labels, data };
  };

  const { labels, data } = generateHistoricalData();

  // Determine if price is going up or down for color scheme
  const isPositive = cryptoInfo?.price_change_percentage_24h ? cryptoInfo.price_change_percentage_24h >= 0 : true;
  const lineColor = isPositive ? '#16a34a' : '#dc2626'; // Green for up, red for down
  const fillColor = isPositive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)';

  // Chart.js configuration with CoinMarketCap style
  const chartData = {
    labels,
    datasets: [
      {
        label: `${cryptoInfo?.name || cryptoId} Price`,
        data,
        borderColor: lineColor,
        backgroundColor: fillColor,
        borderWidth: 2,
        fill: true, // Always fill for area chart effect
        tension: 0.1, // Less tension for more realistic movements
        pointRadius: 0, // No points on line
        pointHoverRadius: 6,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 10,
        left: 10
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const value = context.parsed.y;
            return `Price: $${value.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}`;
          }
        }
      },
      // Add annotation plugin for current price indicator
      annotation: {
        annotations: cryptoInfo && data.length > 0 ? {
          currentPriceLabel: {
            type: 'label',
            xValue: labels[labels.length - 1],
            yValue: cryptoInfo.current_price,
            backgroundColor: lineColor,
            borderColor: '#ffffff',
            borderWidth: 2,
            borderRadius: 4,
            content: `$${cryptoInfo.current_price.toLocaleString()}`,
            color: '#ffffff',
            font: {
              weight: 'bold',
              size: 12
            },
            padding: 6,
            xAdjust: 40,
            yAdjust: 0
          }
        } : {}
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 6,
        hoverBorderWidth: 2,
      },
      line: {
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const,
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false, // Hide vertical grid lines for cleaner look
        },
        ticks: {
          color: '#6b7280',
          maxTicksLimit: 6,
          font: {
            size: 11
          }
        },
        border: {
          display: false
        }
      },
      y: {
        display: false, // Hide left Y-axis
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
        },
        // Set realistic min/max based on current price
        min: cryptoInfo ? cryptoInfo.current_price * 0.85 : undefined,
        max: cryptoInfo ? cryptoInfo.current_price * 1.15 : undefined,
      },
      // Right Y-axis for price labels (CoinMarketCap style)
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          callback: function(value: any) {
            // Format price labels similar to CoinMarketCap
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return `$${value.toLocaleString()}`;
          },
          maxTicksLimit: 6,
          font: {
            size: 11,
            weight: '500'
          },
          padding: 8
        },
        // Match the left axis scale
        min: cryptoInfo ? cryptoInfo.current_price * 0.85 : undefined,
        max: cryptoInfo ? cryptoInfo.current_price * 1.15 : undefined,
        border: {
          display: false
        }
      },
    },
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`bg-surface-dark border border-surface-light rounded-lg ${
      isFullscreen ? 'fixed inset-0 z-50 m-4' : ''
    }`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-light">
        <div className="flex items-center space-x-4">
          {/* Crypto Info */}
          <div className="flex items-center space-x-3">
            {cryptoInfo?.image && (
              <img src={cryptoInfo.image} alt={cryptoId} className="w-8 h-8 rounded-full" />
            )}
            <div>
              <h3 className="font-semibold text-white">
                {cryptoInfo?.name || cryptoId} ({cryptoInfo?.symbol?.toUpperCase()})
              </h3>
              {cryptoInfo && (
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-white">
                    ${cryptoInfo.current_price.toFixed(2)}
                  </span>
                  <span className={`text-sm ${cryptoInfo.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {cryptoInfo.price_change_percentage_24h >= 0 ? '+' : ''}{cryptoInfo.price_change_percentage_24h.toFixed(2)}% (24h)
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-green-400 text-xs">
                      Sinkron dengan Live Prices
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="flex items-center space-x-3">
          {/* Chart Type Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
              className="h-8 px-3"
            >
              <TrendingUp size={14} className="mr-1" />
              Line
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="h-8 px-3"
            >
              <Activity size={14} className="mr-1" />
              Bar
            </Button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1 bg-surface border border-surface-light rounded-lg p-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={selectedTimeframe === tf.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeframe(tf.value)}
                className="h-7 px-2 text-xs"
              >
                {tf.label}
              </Button>
            ))}
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-4">
        <div style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '400px' }}>
          {chartType === 'line' ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Make Prediction Button */}
      <div className="p-4 border-t border-surface-light">
        <Button 
          onClick={onPredictionClick}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3"
        >
          Make Price Prediction
        </Button>
      </div>
    </div>
  );
}