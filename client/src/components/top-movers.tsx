import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CryptoPriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export function TopMovers() {
  const { data: cryptoPrices, isLoading, error } = useQuery<CryptoPriceData[]>({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 10000, // Update every 10 seconds
    staleTime: 5000,
  });

  if (isLoading) {
    return (
      <Card className="bg-surface-light border-slate-600" data-testid="top-movers-loading">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top Movers (24H)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-600 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !cryptoPrices) {
    return (
      <Card className="bg-surface-light border-slate-600" data-testid="top-movers-error">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top Movers (24H)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Unable to load price data</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by 24h change and get top 5 movers (both positive and negative)
  const sortedMovers = [...cryptoPrices]
    .filter(crypto => crypto.price_change_percentage_24h !== null)
    .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
    .slice(0, 5);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString()}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  return (
    <Card className="bg-surface-light border-slate-600" data-testid="top-movers">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top Movers (24H)
        </CardTitle>
        <p className="text-xs text-slate-400">
          Cryptocurrencies with highest price volatility
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedMovers.map((crypto, index) => {
          const isPositive = crypto.price_change_percentage_24h >= 0;
          const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
          const Icon = isPositive ? ArrowUp : ArrowDown;
          
          return (
            <div 
              key={crypto.id}
              className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
              data-testid={`top-mover-${crypto.id}`}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={crypto.image} 
                  alt={crypto.name}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-white">{crypto.symbol.toUpperCase()}</p>
                  <p className="text-xs text-slate-400">{formatPrice(crypto.current_price)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} font-medium flex items-center gap-1`}
                >
                  <Icon className="w-3 h-3" />
                  {formatChange(crypto.price_change_percentage_24h)}
                </Badge>
              </div>
            </div>
          );
        })}
        
        <div className="text-xs text-slate-500 text-center pt-2" data-testid="top-movers-updated">
          Updated every 10 seconds
        </div>
      </CardContent>
    </Card>
  );
}