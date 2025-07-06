import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface SimpleChartTestProps {
  cryptoId: string;
  currentPrice: number;
}

export function SimpleChartTest({ cryptoId, currentPrice }: SimpleChartTestProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: 'black',
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Generate simple test data
    const data = [];
    let basePrice = currentPrice || 100;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 0.05;
      basePrice = basePrice * (1 + variation);
      
      const open = basePrice * 0.998;
      const close = basePrice * 1.002;
      const high = Math.max(open, close) * 1.01;
      const low = Math.min(open, close) * 0.99;
      
      data.push({
        time: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
      });
    }

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    console.log(`✅ Simple chart created for ${cryptoId} with ${data.length} data points`);

    return () => {
      chart.remove();
    };
  }, [cryptoId, currentPrice]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-2">Test Chart for {cryptoId}</h3>
      <div 
        ref={chartContainerRef}
        className="w-full border border-gray-300 rounded"
        style={{ height: '300px' }}
      />
    </div>
  );
}