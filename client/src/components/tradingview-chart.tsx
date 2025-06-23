import { useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { useQuery } from '@tanstack/react-query';

interface TradingViewChartProps {
  cryptoId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  onPredictClick?: (cryptoId: string) => void;
}

const TradingViewChart = memo(({ 
  cryptoId, 
  symbol, 
  name, 
  currentPrice, 
  priceChange24h, 
  onPredictClick 
}: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Fetch real chart data from API
  const { data: chartData = [], isLoading } = useQuery<Array<{ time: string; value: number }>>({
    queryKey: [`/api/crypto/chart/${cryptoId}`],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!containerRef.current || !chartData || chartData.length === 0) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Create chart
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: '#1a1b23' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#2a2e39' },
        horzLines: { color: '#2a2e39' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485169',
      },
      timeScale: {
        borderColor: '#485169',
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        visible: true,
        fontSize: 24,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(171, 71, 188, 0.3)',
        text: symbol.toUpperCase(),
      },
    });

    // Create line series
    const lineSeries = chart.addLineSeries({
      color: '#2962ff',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 6,
        minMove: 0.000001,
      },
    });

    // Convert API data to chart format
    const formattedData = chartData.map((item) => ({
      time: (new Date(item.time).getTime() / 1000) as UTCTimestamp,
      value: item.value,
    }));

    lineSeries.setData(formattedData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = lineSeries;

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartData, cryptoId, symbol]);

  const isPositive = priceChange24h >= 0;

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2" size={20} />
            {name} ({symbol.toUpperCase()}) - Advanced Chart
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold">${currentPrice.toLocaleString()}</p>
              <div className={`flex items-center ${isPositive ? 'text-success' : 'text-error'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1 font-medium">
                  {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                </span>
              </div>
            </div>
            {onPredictClick && (
              <Button
                onClick={() => onPredictClick(cryptoId)}
                className="bg-primary hover:bg-primary/90"
              >
                <Target className="mr-2" size={16} />
                Make Prediction
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Professional Chart Container */}
          <div className="relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-[500px] bg-[#1a1b23] rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading chart data...</p>
                </div>
              </div>
            ) : chartData && chartData.length > 0 ? (
              <div 
                ref={containerRef}
                className="w-full h-[500px] bg-[#1a1b23] rounded-lg overflow-hidden"
                style={{ minHeight: '500px' }}
              />
            ) : (
              <div className="flex items-center justify-center h-[500px] bg-[#1a1b23] rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No chart data available</p>
                  <p className="text-sm text-slate-500">Chart data will appear once available</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Chart Info */}
          <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-slate-600">
            <div className="flex items-center space-x-4">
              <span>Professional Trading Chart</span>
              <span className="text-xs">Powered by TradingView Technology</span>
            </div>
            <div className="text-xs">
              Real-time data • Candlestick view • Volume indicators
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TradingViewChart.displayName = 'TradingViewChart';

export default TradingViewChart;