import axios from 'axios';

export interface CoinGeckoPriceData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

class CoinGeckoService {
  private baseURL = 'https://api.coingecko.com/api/v3';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 10000; // 10 detik cache untuk CoinGecko

  // Cryptocurrency IDs for CoinGecko
  private supportedCryptos = [
    'bitcoin',
    'ethereum', 
    'binancecoin',
    'cardano',
    'solana',
    'chainlink',
    'polkadot',
    'litecoin',
    'uniswap',
    'matic-network',
    'avalanche-2',
    'aave',
    'the-sandbox',
    'shiba-inu',
    'ripple',
    'dogecoin'
  ];

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getCurrentPrices(): Promise<CoinGeckoPriceData[]> {
    const cacheKey = 'coingecko_prices';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('🔄 [COINGECKO] Using cached price data');
      return cached;
    }

    try {
      console.log('📈 [COINGECKO] Fetching live prices from CoinGecko API...');
      
      const ids = this.supportedCryptos.join(',');
      const response = await axios.get(`${this.baseURL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: ids,
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        },
        timeout: 15000,
        headers: {
          'User-Agent': 'Nectiq-Crypto-App/1.0'
        }
      });

      const formattedPrices: CoinGeckoPriceData[] = response.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume
      }));

      console.log(`✅ [COINGECKO] Successfully fetched ${formattedPrices.length} cryptocurrency prices from CoinGecko`);
      
      this.setCachedData(cacheKey, formattedPrices);
      return formattedPrices;

    } catch (error: any) {
      console.error('❌ [COINGECKO] Error fetching prices:', error.message);
      
      // Return empty array if CoinGecko fails, let Binance handle fallback
      return [];
    }
  }
}

// Export singleton instance
export const coinGeckoService = new CoinGeckoService();
export { CoinGeckoService };