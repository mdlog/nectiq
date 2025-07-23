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
    queryKey: ['/api/crypto/pyth-prices'],
    refetchInterval: 1000, // Same as Live Prices - ultra-fast updates
    refetchIntervalInBackground: true, // Enable background updates
    staleTime: 500, // Same as Live Prices - very fresh data
    retry: 3, // More retry attempts for reliability
  });

  // Get crypto info
  const cryptoInfo = cryptoData?.find((c: any) => c.id === cryptoId);

  // Generate realistic historical data with STATIC baseline and dynamic endpoint only
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

    // Membuat baseline price berdasarkan cryptocurrency yang dipilih
    const getBaselinePrice = (cryptoId: string, currentPrice: number) => {
      // Gunakan current price sebagai base, dikurangi sedikit untuk trend naik
      return currentPrice * 0.985; // 1.5% di bawah current price
    };
    
    const baselinePrice = getBaselinePrice(cryptoId, currentPrice);
    const staticHistoricalPrices: number[] = [];
    
    // Generate STATIC historical prices (konsisten, tidak berubah setiap render)
    // Menggunakan seed yang konsisten berdasarkan cryptoId agar pattern sama
    const seedValue = cryptoId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    let seed = seedValue;
    
    // Simple seeded random function untuk konsistensi
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    // Generate STATIC historical prices yang tidak berubah-ubah
    for (let i = 0; i < dataPoints - 1; i++) {
      const variation = 0.002; // 0.2% max variation
      const randomFactor = (seededRandom() - 0.5) * variation * 2;
      const priceVariation = 1 + randomFactor;
      
      if (i === 0) {
        staticHistoricalPrices[i] = baselinePrice;
      } else {
        staticHistoricalPrices[i] = staticHistoricalPrices[i - 1] * priceVariation;
      }
    }
    
    // HANYA data point terakhir yang menggunakan current price (dinamis real-time)
    staticHistoricalPrices[dataPoints - 1] = currentPrice;
    


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
      data.push(staticHistoricalPrices[i]);
    }

    return { labels, data };
  };

  const { labels, data } = generateHistoricalData();

  // Modern Binance-inspired color scheme
  const isPositive = cryptoInfo?.price_change_percentage_24h ? cryptoInfo.price_change_percentage_24h >= 0 : true;
  
  // Premium Binance/TradingView colors - subtle but professional
  const primaryColor = isPositive ? '#00d4aa' : '#f84960'; // Modern cyan/coral
  const gradientStart = isPositive ? 'rgba(0, 212, 170, 0.25)' : 'rgba(248, 73, 96, 0.25)';
  const gradientMid = isPositive ? 'rgba(0, 212, 170, 0.08)' : 'rgba(248, 73, 96, 0.08)';
  const gradientEnd = 'rgba(255, 255, 255, 0)';
  
  // Ultra-premium gradient with advanced configuration  
  const createAdvancedGradient = (ctx: any, chartArea: any) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(0.4, gradientMid);
    gradient.addColorStop(1, gradientEnd);
    return gradient;
  };

  // Ultra-modern chart configuration
  const chartData = {
    labels,
    datasets: [
      {
        label: `${cryptoInfo?.name || cryptoId} Price`,
        data,
        borderColor: primaryColor,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return gradientEnd;
          return createAdvancedGradient(ctx, chartArea);
        },
        borderWidth: 3,
        fill: true,
        tension: 0.25, // Extra smooth for premium feel
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: primaryColor,
        pointHoverBorderColor: '#1a1a1a',
        pointHoverBorderWidth: 3,
        segment: {
          borderColor: (ctx: any) => {
            // Dynamic color based on trend
            const current = ctx.p1.parsed.y;
            const previous = ctx.p0.parsed.y;
            return current >= previous ? (isPositive ? '#00d4aa' : '#f84960') : (isPositive ? '#00b894' : '#e84142');
          }
        }
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30,
        right: 25, // Margin lebih kecil untuk efisiensi ruang maksimal
        bottom: 20,
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
        backgroundColor: 'rgba(20, 21, 26, 0.96)',
        titleColor: '#eaecef',
        bodyColor: '#eaecef',
        borderColor: primaryColor,
        borderWidth: 1.5,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 11,
          weight: '600',
          family: 'Roboto, Inter, sans-serif'
        },
        bodyFont: {
          size: 13,
          weight: '700',
          family: 'Roboto, Inter, sans-serif'
        },
        padding: {
          x: 16,
          y: 12
        },
        caretSize: 6,
        caretPadding: 8,
        titleMarginBottom: 8,
        callbacks: {
          title: function(context: any) {
            return `${cryptoInfo?.name || cryptoId} • ${context[0]?.label || ''}`;
          },
          label: function(context: any) {
            const value = context.parsed.y;
            return `$${value.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 8 
            })}`;
          },
          afterLabel: function(context: any) {
            if (cryptoInfo?.price_change_percentage_24h) {
              const change = cryptoInfo.price_change_percentage_24h;
              const sign = change >= 0 ? '+' : '';
              return `24h: ${sign}${change.toFixed(2)}%`;
            }
            return '';
          }
        }
      },
      // Ultra-modern price indicator like Binance
      annotation: {
        annotations: cryptoInfo && data.length > 0 ? {
          currentPriceLine: {
            type: 'line' as const,
            yMin: cryptoInfo.current_price,
            yMax: cryptoInfo.current_price,
            borderColor: primaryColor,
            borderWidth: 2,
            borderDash: [5, 5],
            scaleID: 'y1',
            label: {
              enabled: true,
              content: `${cryptoInfo.current_price.toFixed(2)}`,
              position: 'end',
              backgroundColor: primaryColor,
              color: '#ffffff',
              font: {
                weight: '700',
                size: 11,
                family: 'Roboto, Inter, sans-serif'
              },
              padding: {
                x: 10,
                y: 6
              },
              cornerRadius: 4,
              xAdjust: 25,
              yAdjust: 0,
              borderColor: 'rgba(255, 255, 255, 0.8)',
              borderWidth: 1
            }
          },
          // Dot hijau prominent di ujung kanan line chart dengan harga running
          runningPriceDot: {
            type: 'point' as const,
            xValue: data.length - 1, // Index ujung kanan chart (data point terakhir)
            yValue: cryptoInfo.current_price,
            backgroundColor: '#00d4aa', // Hijau cyan premium
            borderColor: '#ffffff',
            borderWidth: 4,
            radius: 8, // Dot lebih besar dan prominent
            scaleID: 'y1',
            z: 999 // Pastikan di atas semua elemen
          },
          // Label harga running di sebelah kiri dot hijau
          runningPriceLabel: {
            type: 'label' as const,
            xValue: data.length - 1, // Index ujung kanan chart
            yValue: cryptoInfo.current_price,
            content: `$${cryptoInfo.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            backgroundColor: '#00d4aa',
            color: '#ffffff',
            font: {
              weight: '800',
              size: 12,
              family: 'Roboto, Inter, sans-serif'
            },
            padding: {
              x: 12,
              y: 8
            },
            cornerRadius: 6,
            xAdjust: -70, // Posisi di sebelah kiri dot dengan jarak yang lebih nyaman
            yAdjust: 0, // Sejajar dengan dot
            borderColor: '#ffffff',
            borderWidth: 2,
            z: 900 // Di bawah dot
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
        hoverRadius: 8,
        hoverBorderWidth: 3,
        hoverBackgroundColor: primaryColor,
        hoverBorderColor: '#ffffff'
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
          display: true,
          color: 'rgba(255, 255, 255, 0.03)',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: '#737a8c',
          maxTicksLimit: 7,
          font: {
            size: 10,
            family: 'Roboto, Inter, sans-serif',
            weight: '400'
          },
          padding: 12
        },
        border: {
          display: false
        }
      },
      y: {
        display: false, // Main Y-axis hidden
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.03)',
          lineWidth: 1,
          drawBorder: false,
          drawTicks: false
        },
        // Optimal price range for maximum detail
        min: cryptoInfo ? Math.floor(cryptoInfo.current_price * 0.96) : undefined,
        max: cryptoInfo ? Math.ceil(cryptoInfo.current_price * 1.04) : undefined,
      },
      // Enhanced right Y-axis like Binance
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.03)',
          lineWidth: 1,
          drawBorder: false,
          drawTicks: false
        },
        ticks: {
          color: '#737a8c',
          callback: function(value: any) {
            const numValue = Number(value);
            // Binance-style formatting
            if (numValue >= 1000000) {
              return `${(numValue / 1000000).toFixed(1)}M`;
            } else if (numValue >= 100000) {
              return `${Math.round(numValue / 1000)}K`;
            } else if (numValue >= 10000) {
              return `${(numValue / 1000).toFixed(1)}K`;
            } else if (numValue >= 1000) {
              return `${(numValue / 1000).toFixed(2)}K`;
            } else if (numValue >= 100) {
              return `$${numValue.toFixed(0)}`;
            }
            return `$${numValue.toFixed(2)}`;
          },
          maxTicksLimit: 8,
          font: {
            size: 10,
            family: 'Roboto, Inter, sans-serif',
            weight: '500'
          },
          padding: 20
        },
        min: cryptoInfo ? Math.floor(cryptoInfo.current_price * 0.96) : undefined,
        max: cryptoInfo ? Math.ceil(cryptoInfo.current_price * 1.04) : undefined,
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
                      Real-time
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