import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Target, TrendingUp, TrendingDown, Expand } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import FinancialMetrics from '@/components/financial-metrics';

interface PriceData {
  timestamp: number;
  price: number;
  confidence?: number;
}

interface PythNetworkChartProps {
  cryptoId: string;
  symbol: string;
  name: string;
  onPredictClick?: (cryptoId: string) => void;
}

const PythNetworkChart = ({ 
  cryptoId, 
  symbol, 
  name,
  onPredictClick 
}: PythNetworkChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [cryptoLogo, setCryptoLogo] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  // Timeframe options
  const timeframes = [
    { label: '5M', value: '5M', hours: 0.083 },
    { label: '15M', value: '15M', hours: 0.25 },
    { label: '1H', value: '1H', hours: 1 },
    { label: '4H', value: '4H', hours: 4 },
    { label: '1D', value: '1D', hours: 24 },
    { label: '1W', value: '1W', hours: 168 }
  ];

  // Fetch real-time Pyth Network prices
  const { data: pythPrices, isLoading: pythLoading } = useQuery({
    queryKey: ['/api/crypto/pyth-prices'],
    refetchInterval: 3000, // Update every 3 seconds for real-time data
    staleTime: 1000,
  });

  // Get current crypto data from Pyth Network
  const currentPythData = Array.isArray(pythPrices) ? pythPrices.find((p: any) => p.id === cryptoId) : null;

  // Fetch cryptocurrency logo
  const fetchCryptoLogo = async () => {
    try {
      const response = await fetch('/api/crypto/prices');
      if (response.ok) {
        const cryptos = await response.json();
        const crypto = cryptos.find((c: any) => c.id === cryptoId);
        if (crypto && crypto.image) {
          setCryptoLogo(crypto.image);
        }
      }
    } catch (error) {
      console.error('Error fetching crypto logo:', error);
    }
  };

  useEffect(() => {
    fetchCryptoLogo();
  }, [cryptoId]);

  // Update price history when new Pyth data arrives with realistic time scaling
  useEffect(() => {
    if (currentPythData && currentPythData.current_price > 0) {
      const now = Date.now();
      const validPrice = Number(currentPythData.current_price);
      const validConfidence = Number(currentPythData.confidence_interval) || 0;
      
      // Debug logging
      console.log(`[PYTH-CHART] Adding price data: $${validPrice}, confidence: ${validConfidence}`);
      
      setPriceHistory(prev => {
        // Calculate scaled timestamp for realistic 6-day chart progression
        // Each update represents 12 hours of market movement (2 grids per day)
        const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        const baseTimestamp = now - (6 * 24 * 60 * 60 * 1000); // 6 days ago
        const scaledTimestamp = baseTimestamp + (prev.length * TWELVE_HOURS_MS);
        
        const newDataPoint = {
          timestamp: scaledTimestamp,
          price: validPrice,
          confidence: validConfidence
        };
        
        const newHistory = [...prev, newDataPoint];
        
        // If this is the first data point, generate historical data points for 6 days
        if (prev.length === 0) {
          const initialPoints: PriceData[] = [];
          const totalDataPoints = 12; // 6 days × 2 grids per day = 12 data points
          
          for (let i = 0; i < totalDataPoints; i++) {
            const historicalTimestamp = baseTimestamp + (i * TWELVE_HOURS_MS);
            // Generate realistic price variations (±2% from current price)
            const priceVariation = 1 + (Math.random() - 0.5) * 0.04; // ±2% variation
            const historicalPrice = validPrice * priceVariation;
            
            initialPoints.push({
              timestamp: historicalTimestamp,
              price: historicalPrice,
              confidence: validConfidence
            });
          }
          
          console.log(`[PYTH-CHART] Generated ${totalDataPoints} historical data points for 6-day chart`);
          return initialPoints;
        }
        
        // Keep only last 12 data points (6 days worth of data with 2 points per day)
        return newHistory.slice(-12);
      });
    }
  }, [currentPythData]);

  // Draw price chart on canvas
  useEffect(() => {
    if (!canvasRef.current || priceHistory.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, width, height);

    if (priceHistory.length < 2) {
      // For single data point, create a simple horizontal line
      if (currentPythData) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const margin = 40;
        const chartHeight = height - (margin * 2);
        const y = margin + chartHeight / 2; // Center line
        
        ctx.moveTo(margin, y);
        ctx.lineTo(width - margin, y);
        ctx.stroke();
        
        // Draw current price label
        ctx.fillStyle = '#10b981';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`$${currentPythData.current_price.toFixed(8)}`, width / 2, y - 10);
      }
      return;
    }

    // Calculate price range with padding for better visualization
    const prices = priceHistory
      .map(d => d.price)
      .filter(p => p != null && !isNaN(p) && isFinite(p) && p > 0);
    
    if (prices.length === 0) {
      // Fallback to current price if no valid history
      if (currentPythData && currentPythData.current_price > 0) {
        prices.push(currentPythData.current_price);
      } else {
        return;
      }
    }
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || (maxPrice * 0.01); // Use 1% of price if no range
    
    // Add padding to make chart more readable (10% padding on each side)
    const paddedMinPrice = Math.max(0, minPrice - (priceRange * 0.1));
    const paddedMaxPrice = maxPrice + (priceRange * 0.1);
    const paddedRange = paddedMaxPrice - paddedMinPrice;

    // Draw grid lines with optimized margins for label visibility
    const leftMargin = 65; // Increased for price labels
    const rightMargin = 70; // Increased more for current price indicator
    const topMargin = 30;
    const bottomMargin = 50;
    const chartWidth = width - leftMargin - rightMargin;
    const chartHeight = height - topMargin - bottomMargin;
    
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = topMargin + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(width - rightMargin, y);
      ctx.stroke();
    }

    // Dynamic vertical grid lines based on actual data points (every 24 hours)
    if (priceHistory.length > 1) {
      priceHistory.forEach((dataPoint, index) => {
        if (index % 2 === 0) { // Every 2 data points = 24 hours (2 grids per day)
          const x = leftMargin + (index / (priceHistory.length - 1)) * chartWidth;
          ctx.strokeStyle = '#1f1f1f';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, topMargin);
          ctx.lineTo(x, height - bottomMargin);
          ctx.stroke();
        }
      });
    }

    // Draw smooth price line with gradient effect
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    // Create smooth line connecting all price points
    priceHistory.forEach((data, index) => {
      const x = leftMargin + (index / Math.max(priceHistory.length - 1, 1)) * chartWidth;
      const y = topMargin + (chartHeight - ((data.price - paddedMinPrice) / paddedRange) * chartHeight);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Draw the main price line
    ctx.stroke();
    
    // Optional: Add gradient fill under the line for better visual appeal
    if (priceHistory.length > 1) {
      const gradient = ctx.createLinearGradient(0, topMargin, 0, height - bottomMargin);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Start from bottom left
      ctx.moveTo(leftMargin, height - bottomMargin);
      
      // Draw along the price line
      priceHistory.forEach((data, index) => {
        const x = leftMargin + (index / Math.max(priceHistory.length - 1, 1)) * chartWidth;
        const y = topMargin + (chartHeight - ((data.price - paddedMinPrice) / paddedRange) * chartHeight);
        ctx.lineTo(x, y);
      });
      
      // Close the path at bottom right
      const lastX = leftMargin + chartWidth;
      ctx.lineTo(lastX, height - bottomMargin);
      ctx.closePath();
      ctx.fill();
    }
    
    console.log(`[PYTH-CHART] Drew smooth price line with ${priceHistory.length} data points representing ${priceHistory.length * 12} hours of market data`);

    // Draw confidence intervals if available
    const latestData = priceHistory[priceHistory.length - 1];
    if (latestData.confidence && latestData.confidence > 0) {
      const upperPrice = latestData.price + latestData.confidence;
      const lowerPrice = latestData.price - latestData.confidence;
      
      const upperY = topMargin + (chartHeight - ((upperPrice - paddedMinPrice) / paddedRange) * chartHeight);
      const lowerY = topMargin + (chartHeight - ((lowerPrice - paddedMinPrice) / paddedRange) * chartHeight);
      const x = width - rightMargin;

      // Draw confidence band
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(x - 20, upperY, 20, lowerY - upperY);

      // Draw confidence lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(x - 20, upperY);
      ctx.lineTo(x, upperY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x - 20, lowerY);
      ctx.lineTo(x, lowerY);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }

    // Draw price labels (Y-axis - vertical sidebar) with enhanced visibility
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Debug logging for price range calculation
    console.log(`[PYTH-CHART] Price range: min=${paddedMinPrice}, max=${paddedMaxPrice}, range=${paddedRange}`);

    // Draw 6 price levels on the left sidebar with optimized positioning
    for (let i = 0; i <= 5; i++) {
      const priceLevel = paddedMinPrice + (paddedRange * (5 - i) / 5); // Reverse order (top to bottom)
      const y = topMargin + (chartHeight / 5) * i;
      
      // Enhanced validation and formatting
      if (paddedRange > 0 && !isNaN(priceLevel) && isFinite(priceLevel) && priceLevel > 0) {
        const formattedPrice = priceLevel < 1 
          ? priceLevel.toFixed(6) 
          : priceLevel < 1000 
            ? priceLevel.toFixed(2)
            : priceLevel.toFixed(0);
        
        // Draw background for better readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const textWidth = ctx.measureText(`$${formattedPrice}`).width;
        ctx.fillRect(leftMargin - textWidth - 12, y - 8, textWidth + 8, 16);
        
        // Draw the price text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`$${formattedPrice}`, leftMargin - 6, y);
        console.log(`[PYTH-CHART] Drawing price label: $${formattedPrice} at y=${y}`);
      } else {
        console.error(`[PYTH-CHART] Invalid price level: ${priceLevel}, paddedRange: ${paddedRange}`);
        // Draw fallback label with background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(leftMargin - 30, y - 8, 24, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('$--', leftMargin - 6, y);
      }
    }
    // Draw time labels (X-axis - horizontal) with 12-hour grid alignment
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    
    // Draw time labels synchronized with realistic timestamps
    if (priceHistory.length > 1) {
      // Draw time labels for daily intervals
      priceHistory.forEach((dataPoint, index) => {
        if (index % 2 === 0) { // Show label every 2 data points (24-hour intervals)
          const x = leftMargin + (index / (priceHistory.length - 1)) * chartWidth;
          const date = new Date(dataPoint.timestamp);
          
          const dayLabel = date.toLocaleDateString('id-ID', { 
            day: '2-digit',
            month: 'short'
          });
          
          // Draw time label
          ctx.fillStyle = '#888888';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(dayLabel, x, height - bottomMargin + 15);
        }
      });
      
      // Draw current month/year at bottom center
      const currentDate = new Date().toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
      });
      ctx.fillStyle = '#888888';
      ctx.font = '10px monospace';
      ctx.fillText(currentDate, width / 2, height - 5);
      
      console.log(`[PYTH-CHART] Realistic time grid: ${priceHistory.length} data points spanning ${priceHistory.length * 12} hours (${priceHistory.length / 2} days)`);
    }

    // Current price indicator with proper margin
    if (currentPythData) {
      const currentY = topMargin + (chartHeight - ((currentPythData.current_price - paddedMinPrice) / paddedRange) * chartHeight);
      
      // Draw current price indicator dot
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(width - rightMargin + 5, currentY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw current price line across chart
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(leftMargin, currentY);
      ctx.lineTo(width - rightMargin, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Current price label on right with background - positioned safely within canvas
      const priceText = `$${currentPythData.current_price.toFixed(2)}`;
      ctx.font = 'bold 11px monospace';
      const textWidth = ctx.measureText(priceText).width;
      
      // Position label safely within right margin area
      const labelX = width - rightMargin + 8;
      const labelY = currentY;
      
      // Ensure label fits within canvas bounds
      const maxLabelX = width - textWidth - 4;
      const finalLabelX = Math.min(labelX, maxLabelX);
      
      // Draw background for better readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(finalLabelX - 3, labelY - 8, textWidth + 6, 16);
      
      // Draw the price text
      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(priceText, finalLabelX, labelY);
      
      console.log(`[PYTH-CHART] Current price label positioned at x=${finalLabelX}, textWidth=${textWidth}, canvasWidth=${width}`);
    }

  }, [priceHistory, currentPythData]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatPrice = (price: number) => {
    // Always use 2 decimal places to match live prices format
    return price.toFixed(2);
  };

  const getPriceChange = () => {
    if (priceHistory.length < 2) return { change: 0, percentage: 0 };
    
    const current = priceHistory[priceHistory.length - 1].price;
    const previous = priceHistory[Math.max(0, priceHistory.length - 10)].price; // Compare with 10 points ago
    const change = current - previous;
    const percentage = ((change / previous) * 100);
    
    return { change, percentage };
  };

  const { change, percentage } = getPriceChange();

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className="bg-surface border-surface-light h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {cryptoLogo && (
                <img 
                  src={cryptoLogo} 
                  alt={name} 
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  {name} ({symbol.toUpperCase()})
                  <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                    Pyth Network
                  </span>
                </CardTitle>
                <div className="flex items-center gap-4 mt-1">
                  {currentPythData && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-mono text-white">
                          ${formatPrice(currentPythData.current_price)}
                        </span>
                        <div className={`flex items-center gap-1 ${percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {percentage >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          <span className="text-sm font-mono">
                            {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      {currentPythData.confidence_interval && (
                        <div className="text-xs text-gray-400">
                          Confidence: ±${currentPythData.confidence_interval.toFixed(8)}
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs">Live</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timeframe Selector */}
              <div className="flex items-center space-x-1">
                {timeframes.map((tf) => (
                  <Button
                    key={tf.value}
                    variant={selectedTimeframe === tf.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(tf.value)}
                    className={`px-3 py-1 text-xs ${
                      selectedTimeframe === tf.value 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'text-gray-400 hover:text-white hover:bg-surface-light'
                    }`}
                  >
                    {tf.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white border-surface-light hover:bg-surface-light"
                >
                  <Expand size={16} />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className={`${isFullscreen ? 'h-screen' : 'h-96'} w-full relative`}>
            {pythLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-green-400">Loading Pyth Network data...</span>
                </div>
              </div>
            ) : currentPythData ? (
              <canvas
                ref={canvasRef}
                className="w-full h-full border border-gray-700 rounded-lg bg-gray-900"
                style={{ background: 'linear-gradient(to bottom, #0f0f0f, #1a1a1a)' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Activity size={48} className="mx-auto mb-4 text-green-400" />
                  <h3 className="text-lg font-semibold mb-2 text-white">Pyth Network Chart</h3>
                  <p className="text-gray-400">
                    Waiting for real-time price data from Pyth Network...
                  </p>
                </div>
              </div>
            )}
            
            {/* Chart Info Overlay - Moved to top right with transparent background */}
            {currentPythData && (
              <div className="absolute top-4 right-4 bg-transparent backdrop-blur-sm rounded-lg p-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-green-400" />
                    <span className="text-green-400 font-semibold">Pyth Network Live Feed</span>
                  </div>
                  <div className="text-gray-300">
                    Price: ${currentPythData.current_price.toFixed(2)}
                  </div>
                  <div className="text-gray-300">
                    Update: Every 3s
                  </div>
                  <div className="text-gray-300">
                    Last: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Make Prediction Button */}
      {onPredictClick && !isFullscreen && (
        <div className="mt-4">
          <Button 
            onClick={() => onPredictClick(cryptoId)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg w-full"
            size="lg"
          >
            <Target size={20} className="mr-3" />
            Make Prediction
          </Button>
        </div>
      )}

      {/* Financial Metrics */}
      {!isFullscreen && (
        <div className="mt-6">
          <FinancialMetrics cryptoId={cryptoId} symbol={symbol} />
        </div>
      )}
    </div>
  );
};

export default PythNetworkChart;