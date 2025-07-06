import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface MinimalChartProps {
  cryptoId: string;
  currentPrice: number;
}

export const MinimalChart = ({ cryptoId, currentPrice }: MinimalChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('Creating minimal chart for', cryptoId, 'with price', currentPrice);

    // Clear container
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333333',
      },
      width: chartContainerRef.current.clientWidth || 600,
      height: 300,
      grid: {
        vertLines: { color: '#e0e0e0' },
        horzLines: { color: '#e0e0e0' },
      },
      timeScale: {
        borderColor: '#cccccc',
      },
      rightPriceScale: {
        borderColor: '#cccccc',
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#2563eb',
      lineWidth: 2,
    });

    // Generate simple test data
    const now = Math.floor(Date.now() / 1000);
    const data = [];
    
    for (let i = 30; i >= 0; i--) {
      const time = now - (i * 24 * 60 * 60); // Daily intervals
      const randomVariation = (Math.random() - 0.5) * currentPrice * 0.05;
      const price = currentPrice + randomVariation;
      
      data.push({
        time: time,
        value: Math.max(0, price),
      });
    }

    console.log('Setting chart data:', data.slice(0, 3));
    lineSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [cryptoId, currentPrice]);

  return (
    <div className="w-full bg-white border border-gray-300 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Minimal Chart Test - {cryptoId}</h3>
      <div 
        ref={chartContainerRef}
        className="w-full"
        style={{ height: '300px' }}
      />
    </div>
  );
};