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

  // Professional color scheme based on market movement
  const isPositive = cryptoInfo?.price_change_percentage_24h ? cryptoInfo.price_change_percentage_24h >= 0 : true;
  
  // CoinMarketCap inspired colors - more vibrant and professional
  const lineColor = isPositive ? '#16c784' : '#ea3943'; // CMC green/red
  const shadowColor = isPositive ? 'rgba(22, 199, 132, 0.3)' : 'rgba(234, 57, 67, 0.3)';
  
  // Enhanced gradient configuration
  const createGradient = (ctx: any, chartArea: any) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    if (isPositive) {
      gradient.addColorStop(0, 'rgba(22, 199, 132, 0.3)');
      gradient.addColorStop(0.5, 'rgba(22, 199, 132, 0.1)');
      gradient.addColorStop(1, 'rgba(22, 199, 132, 0.02)');
    } else {
      gradient.addColorStop(0, 'rgba(234, 57, 67, 0.3)');
      gradient.addColorStop(0.5, 'rgba(234, 57, 67, 0.1)');
      gradient.addColorStop(1, 'rgba(234, 57, 67, 0.02)');
    }
    return gradient;
  };

  // Professional chart configuration
  const chartData = {
    labels,
    datasets: [
      {
        label: `${cryptoInfo?.name || cryptoId} Price`,
        data,
        borderColor: lineColor,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          return createGradient(ctx, chartArea);
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.2, // Optimal smoothness
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        // Add glow effect
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 8,
        shadowColor: shadowColor,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 25,
        right: 25,
        bottom: 15,
        left: 5
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
        backgroundColor: 'rgba(17, 25, 40, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: lineColor,
        borderWidth: 1,
        cornerRadius: 10,
        displayColors: false,
        titleFont: {
          size: 11,
          weight: '600',
          family: 'system-ui, -apple-system, sans-serif'
        },
        bodyFont: {
          size: 13,
          weight: '700',
          family: 'system-ui, -apple-system, sans-serif'
        },
        padding: {
          x: 14,
          y: 10
        },
        caretSize: 8,
        caretPadding: 10,
        callbacks: {
          title: function() {
            return `${cryptoInfo?.symbol?.toUpperCase() || cryptoId.toUpperCase()} Price`;
          },
          label: function(context: any) {
            const value = context.parsed.y;
            return `$${value.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 6 
            })}`;
          }
        },
        filter: function(tooltipItem: any) {
          return tooltipItem.datasetIndex === 0;
        }
      },
      // Professional current price indicator
      annotation: {
        annotations: cryptoInfo && data.length > 0 ? {
          currentPriceLine: {
            type: 'line' as const,
            yMin: cryptoInfo.current_price,
            yMax: cryptoInfo.current_price,
            borderColor: lineColor,
            borderWidth: 1.5,
            borderDash: [8, 4],
            scaleID: 'y1',
            label: {
              enabled: true,
              content: `$${cryptoInfo.current_price.toFixed(2)}`,
              position: 'end',
              backgroundColor: lineColor,
              color: '#ffffff',
              font: {
                weight: '600',
                size: 12,
                family: 'system-ui, -apple-system, sans-serif'
              },
              padding: {
                x: 12,
                y: 8
              },
              cornerRadius: 8,
              xAdjust: 30,
              yAdjust: 0,
              borderColor: '#ffffff',
              borderWidth: 2
            }
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
          display: false, // Ultra-clean horizontal view
        },
        ticks: {
          color: '#8b93a6',
          maxTicksLimit: 6,
          font: {
            size: 11,
            family: 'system-ui, -apple-system, sans-serif',
            weight: '400'
          },
          padding: 8
        },
        border: {
          display: false,
          width: 0
        }
      },
      y: {
        display: false, // Hidden primary axis
        grid: {
          color: 'rgba(139, 147, 166, 0.06)',
          drawBorder: false,
          lineWidth: 0.5
        },
        // Tighter price range for better detail
        min: cryptoInfo ? cryptoInfo.current_price * 0.94 : undefined,
        max: cryptoInfo ? cryptoInfo.current_price * 1.06 : undefined,
      },
      // Professional right-side price scale
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(139, 147, 166, 0.06)',
          drawBorder: false,
          lineWidth: 0.5,
          drawTicks: false
        },
        ticks: {
          color: '#8b93a6',
          callback: function(value: any) {
            const numValue = Number(value);
            // Enhanced formatting like TradingView/CoinMarketCap
            if (numValue >= 1000000) {
              return `${(numValue / 1000000).toFixed(2)}M`;
            } else if (numValue >= 100000) {
              return `${(numValue / 1000).toFixed(0)}K`;
            } else if (numValue >= 10000) {
              return `${(numValue / 1000).toFixed(1)}K`;
            } else if (numValue >= 1000) {
              return `${(numValue / 1000).toFixed(2)}K`;
            }
            return `$${numValue.toFixed(2)}`;
          },
          maxTicksLimit: 6,
          font: {
            size: 11,
            family: 'system-ui, -apple-system, sans-serif',
            weight: '500'
          },
          padding: 16,
          align: 'end'
        },
        min: cryptoInfo ? cryptoInfo.current_price * 0.94 : undefined,
        max: cryptoInfo ? cryptoInfo.current_price * 1.06 : undefined,
        border: {
          display: false,
          width: 0
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