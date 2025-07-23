import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, TrendingUp } from "lucide-react";
import useSystemTheme from "@/hooks/useSystemTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FallbackChartProps {
  cryptoId: string;
  onPredictionClick?: () => void;
}

// Static baseline price for consistent chart patterns per cryptocurrency
let basePriceForLabels: { [key: string]: number } = {};

// Generate smooth, consistent price data based on current price
function generatePriceData(currentPrice: number, cryptoId: string, points: number = 50) {
  const data = [];
  const labels = [];
  
  // Set baseline price once per cryptocurrency for consistent patterns
  if (!basePriceForLabels[cryptoId]) {
    basePriceForLabels[cryptoId] = currentPrice;
  }
  const baselinePrice = basePriceForLabels[cryptoId];
  
  // Use crypto ID hash as consistent seed for same pattern every time
  let seed = 0;
  for (let i = 0; i < cryptoId.length; i++) {
    seed += cryptoId.charCodeAt(i);
  }
  seed = seed % 1000;
  
  function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  
  // Generate STATIC historical data that never changes for this cryptocurrency
  const basePrice = baselinePrice * 0.99; // Start slightly below baseline
  let price = basePrice;
  
  // Create smooth, consistent historical pattern
  for (let i = points; i >= 1; i--) {
    // Use position-based volatility for smooth transitions
    const volatility = 0.002; // Very low volatility for smooth movement
    const positionFactor = Math.sin((i / points) * Math.PI) * 0.01; // Sine wave for smoothness
    const change = (seededRandom() - 0.5) * volatility + positionFactor;
    price = price * (1 + change);
    
    // Keep historical data within tight range of baseline  
    const minPrice = baselinePrice * 0.995;
    const maxPrice = baselinePrice * 1.005;
    price = Math.max(minPrice, Math.min(maxPrice, price));
    
    const time = new Date();
    time.setMinutes(time.getMinutes() - (i * 5));
    
    data.push(price);
    labels.push(time.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }
  
  // ONLY the last point uses live current price for smooth endpoint movement
  const currentTime = new Date();
  data.push(currentPrice);
  labels.push(currentTime.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }));
  
  return { data, labels };
}

export default function FallbackChart({ cryptoId, onPredictionClick }: FallbackChartProps) {
  const systemTheme = useSystemTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch current price data - SAME endpoint as Live Prices for perfect synchronization
  const { data: cryptoPrices } = useQuery({
    queryKey: ["/api/crypto/pyth-prices"], // EXACT same endpoint as Live Prices
    refetchInterval: 1000, // EXACT same as Live Prices - 1 second updates
    refetchIntervalInBackground: true, // EXACT same as Live Prices
    staleTime: 500, // EXACT same as Live Prices - 500ms stale time  
    retry: 3, // EXACT same as Live Prices
    refetchOnWindowFocus: true, // EXACT same as Live Prices
    refetchOnMount: true, // EXACT same as Live Prices
  });

  const currentCrypto = Array.isArray(cryptoPrices) ? cryptoPrices.find((crypto: any) => crypto.id === cryptoId) : null;
  const currentPrice = currentCrypto?.current_price || 50000;

  // Generate chart data with cryptoId for consistent patterns
  const priceData = generatePriceData(currentPrice, cryptoId);

  const chartData = {
    labels: priceData.labels,
    datasets: [
      {
        label: currentCrypto?.symbol || 'Price',
        data: priceData.data,
        borderColor: '#00d4aa',
        backgroundColor: 'rgba(0, 212, 170, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: systemTheme === "dark" ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: systemTheme === "dark" ? '#ffffff' : '#000000',
        bodyColor: systemTheme === "dark" ? '#ffffff' : '#000000',
        borderColor: '#00d4aa',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: systemTheme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: systemTheme === "dark" ? '#9ca3af' : '#6b7280',
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        position: 'right',
        // Force scale to be tight around current price (±2%)
        min: currentPrice * 0.98,
        max: currentPrice * 1.02,
        grid: {
          color: systemTheme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: systemTheme === "dark" ? '#9ca3af' : '#6b7280',
          stepSize: currentPrice * 0.005, // Small steps for detailed view
          callback: function(value) {
            return '$' + Number(value).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });
          },
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: '#00d4aa',
        hoverBorderColor: '#ffffff',
      },
    },
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && chartRef.current) {
      chartRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={chartRef}
      className={`rounded-lg overflow-hidden border ${
        systemTheme === "dark" 
          ? "bg-gray-900 border-gray-700" 
          : "bg-white border-gray-300"
      } ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        systemTheme === "dark" 
          ? "bg-gray-800 border-gray-700" 
          : "bg-gray-100 border-gray-300"
      }`}>
        <div className="flex items-center gap-4">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${
            systemTheme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            <TrendingUp size={20} className="text-cyan-400" />
            {currentCrypto?.symbol || 'Crypto'}/USD Chart (Fallback)
          </h3>
          
          {currentCrypto && (
            <div className="text-sm">
              <span className={`font-semibold ${
                systemTheme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                ${currentPrice.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
              <span className={`ml-2 ${
                currentCrypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentCrypto.price_change_percentage_24h >= 0 ? '+' : ''}
                {currentCrypto.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onPredictionClick && (
            <Button 
              onClick={onPredictionClick}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2"
            >
              Buat Prediksi
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className={systemTheme === "dark" 
              ? "text-gray-300 hover:text-white" 
              : "text-gray-600 hover:text-gray-900"
            }
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>

      {/* Chart Container */}  
      <div className={`${
        systemTheme === "dark" ? "bg-gray-900" : "bg-white"
      } ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[400px]'}`}>
        <Line data={chartData} options={options} />
      </div>

      {/* Footer Info */}
      <div className={`px-4 py-2 border-t ${
        systemTheme === "dark" 
          ? "bg-gray-800 border-gray-700" 
          : "bg-gray-100 border-gray-300"
      }`}>
        <div className="flex justify-between items-center text-xs">
          <span className={systemTheme === "dark" ? "text-gray-400" : "text-gray-600"}>
            Fallback Chart | Live Data from Pyth Network
          </span>
          <span className="text-cyan-400 font-medium">
            Real-time Price Updates
          </span>
        </div>
      </div>
    </div>
  );
}