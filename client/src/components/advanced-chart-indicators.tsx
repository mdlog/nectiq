import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Signal, 
  Activity,
  Zap,
  DollarSign,
  PieChart,
  BarChart4,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ChartIndicatorsProps {
  currentPrice: number;
  priceChange24h: number;
  symbol: string;
  chartData: any[];
}

export function AdvancedChartIndicators({ currentPrice, priceChange24h, symbol, chartData }: ChartIndicatorsProps) {
  // Calculate technical indicators
  const calculateRSI = (prices: number[], period = 14) => {
    if (prices.length < period) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateMACD = (prices: number[]) => {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
    
    const ema12 = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;
    const ema26 = prices.slice(-26).reduce((a, b) => a + b, 0) / 26;
    const macd = ema12 - ema26;
    const signal = macd * 0.15; // Simplified signal line
    const histogram = macd - signal;
    
    return { macd, signal, histogram };
  };

  const calculateBollingerBands = (prices: number[], period = 20) => {
    if (prices.length < period) return { upper: currentPrice * 1.02, lower: currentPrice * 0.98, middle: currentPrice };
    
    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((a, b) => a + b, 0) / period;
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2)
    };
  };

  const prices = chartData.map(d => d.value || d.close || d.price);
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const bollinger = calculateBollingerBands(prices);

  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { text: 'Overbought', color: 'text-red-500', bg: 'bg-red-50' };
    if (rsi < 30) return { text: 'Oversold', color: 'text-green-500', bg: 'bg-green-50' };
    return { text: 'Neutral', color: 'text-gray-500', bg: 'bg-gray-50' };
  };

  const getMACDSignal = (macd: any) => {
    if (macd.histogram > 0) return { text: 'Bullish', color: 'text-green-500', bg: 'bg-green-50' };
    return { text: 'Bearish', color: 'text-red-500', bg: 'bg-red-50' };
  };

  const getBollingerSignal = (current: number, bands: any) => {
    if (current > bands.upper) return { text: 'Resistance', color: 'text-red-500', bg: 'bg-red-50' };
    if (current < bands.lower) return { text: 'Support', color: 'text-green-500', bg: 'bg-green-50' };
    return { text: 'Range', color: 'text-blue-500', bg: 'bg-blue-50' };
  };

  const rsiSignal = getRSISignal(rsi);
  const macdSignal = getMACDSignal(macd);
  const bollingerSignal = getBollingerSignal(currentPrice, bollinger);

  return (
    <Card className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Signal className="w-5 h-5 text-blue-500" />
            <span>Technical Analysis - {symbol}</span>
          </div>
          <Badge variant="outline" className="bg-white/50">
            Real-time Indicators
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Technical Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* RSI Indicator */}
          <div className={`p-4 rounded-lg border ${rsiSignal.bg} border-gray-200`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <span className="font-medium">RSI (14)</span>
              </div>
              <Badge className={`${rsiSignal.color} bg-white/80`}>
                {rsiSignal.text}
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-1">{rsi.toFixed(1)}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full relative"
                style={{ width: '100%' }}
              >
                <div 
                  className="absolute top-0 w-1 h-2 bg-black rounded-full"
                  style={{ left: `${rsi}%`, transform: 'translateX(-50%)' }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>30</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>

          {/* MACD Indicator */}
          <div className={`p-4 rounded-lg border ${macdSignal.bg} border-gray-200`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BarChart4 className="w-4 h-4 text-blue-500" />
                <span className="font-medium">MACD</span>
              </div>
              <Badge className={`${macdSignal.color} bg-white/80`}>
                {macdSignal.text}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>MACD:</span>
                <span className="font-bold">{macd.macd.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Signal:</span>
                <span className="font-bold">{macd.signal.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Histogram:</span>
                <span className={`font-bold ${macd.histogram > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {macd.histogram.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Bollinger Bands */}
          <div className={`p-4 rounded-lg border ${bollingerSignal.bg} border-gray-200`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Bollinger Bands</span>
              </div>
              <Badge className={`${bollingerSignal.color} bg-white/80`}>
                {bollingerSignal.text}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Upper:</span>
                <span className="font-bold text-red-500">${bollinger.upper.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Middle:</span>
                <span className="font-bold">${bollinger.middle.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Lower:</span>
                <span className="font-bold text-green-500">${bollinger.lower.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/70 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center mb-1">
              {priceChange24h >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-xs text-gray-600">24h Change</div>
            <div className={`font-bold ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange24h.toFixed(2)}%
            </div>
          </div>

          <div className="bg-white/70 p-3 rounded-lg text-center">
            <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-xs text-gray-600">Volatility</div>
            <div className="font-bold text-yellow-600">
              {(Math.abs(priceChange24h) > 5 ? 'High' : Math.abs(priceChange24h) > 2 ? 'Medium' : 'Low')}
            </div>
          </div>

          <div className="bg-white/70 p-3 rounded-lg text-center">
            <DollarSign className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="text-xs text-gray-600">Support</div>
            <div className="font-bold text-green-600">
              ${(currentPrice * 0.95).toFixed(2)}
            </div>
          </div>

          <div className="bg-white/70 p-3 rounded-lg text-center">
            <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-orange-500" />
            <div className="text-xs text-gray-600">Resistance</div>
            <div className="font-bold text-red-600">
              ${(currentPrice * 1.05).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Trading Signals Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>AI Trading Signal Summary</span>
            </h3>
            <Badge variant="secondary">Powered by Technical Analysis</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Key Signals:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${rsiSignal.color.includes('green') ? 'bg-green-500' : rsiSignal.color.includes('red') ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>RSI indicates {rsiSignal.text.toLowerCase()} conditions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${macdSignal.color.includes('green') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>MACD shows {macdSignal.text.toLowerCase()} momentum</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${bollingerSignal.color.includes('green') ? 'bg-green-500' : bollingerSignal.color.includes('red') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                  <span>Price is near {bollingerSignal.text.toLowerCase()}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Recommendation:</h4>
              <div className="text-sm space-y-1">
                {rsi > 70 && macd.histogram < 0 ? (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Consider taking profits - overvalued signals</span>
                  </div>
                ) : rsi < 30 && macd.histogram > 0 ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Potential buying opportunity detected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Activity className="w-3 h-3" />
                    <span>Monitor for clearer signals</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  * This is not financial advice. Always do your own research.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}