import axios from 'axios';

// Configure axios defaults for better Ubuntu localhost compatibility
axios.defaults.timeout = 10000;
axios.defaults.headers.common['User-Agent'] = 'Nectiq-Crypto-App/1.0';

// Disable proxy for localhost development
if (process.env.NODE_ENV === 'development') {
  delete process.env.https_proxy;
  delete process.env.http_proxy;
  delete process.env.HTTPS_PROXY;
  delete process.env.HTTP_PROXY;
}
import { storage } from '../storage';

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image?: string;
}

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export class CryptoService {
  private lastFetchTime = 0;
  private cachedRealPrices: CryptoPrice[] = [];
  private readonly CACHE_DURATION = 60000; // Cache real prices for 1 minute

  // Method to clear cache when cryptocurrencies are deleted
  clearCache() {
    this.lastFetchTime = 0;
    this.cachedRealPrices = [];
  }

  async getCurrentPrices(): Promise<CryptoPrice[]> {
    const now = Date.now();
    
    // Try to fetch real prices every minute to avoid rate limits
    if (now - this.lastFetchTime > this.CACHE_DURATION) {
      try {
        // Get cryptocurrency list from database instead of hardcoded list
        const supportedCryptos = await storage.getAllCryptocurrencies();
        const cryptoIds = supportedCryptos.map(crypto => crypto.id);
        
        if (cryptoIds.length === 0) {
          this.cachedRealPrices = [];
          this.lastFetchTime = now;
          return [];
        }

        const response = await axios.get(`${COINGECKO_API_BASE}/coins/markets`, {
          params: {
            ids: cryptoIds.join(','),
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: false
          },
          timeout: 15000,
          headers: {
            'User-Agent': 'Nectiq-Crypto-App/1.0',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate'
          },
          // Disable proxy for Ubuntu localhost
          proxy: false,
          // Add retry configuration
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        });

        this.cachedRealPrices = response.data.map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h || 0,
          image: coin.id === 'solana' ? '/attached_assets/solana_1750613756851.png' : coin.image
        }));
        
        this.lastFetchTime = now;
        console.log('✅ Successfully fetched real crypto prices from CoinGecko');
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.log('⏳ CoinGecko rate limit reached, using cached data');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.log('🌐 Network connection issue, using fallback data');
          console.log('Error details:', error.code, error.address, error.port);
        } else {
          console.error('❌ Error fetching crypto prices:', error.message);
        }
      }
    }
    
    // Get database cryptocurrencies and merge with CoinGecko data
    let allPrices: CryptoPrice[] = [];
    
    try {
      // Get all cryptocurrencies from database
      const dbCryptos = await storage.getAllCryptocurrencies();
      
      // Convert database cryptos to CryptoPrice format with proper image URLs
      const dbPrices: CryptoPrice[] = dbCryptos.map(crypto => ({
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        current_price: parseFloat(crypto.currentPrice || '0'),
        price_change_percentage_24h: parseFloat(crypto.priceChange24h || '0'),
        image: this.getCryptoImageUrl(crypto.id)
      }));
      
      // If we have real cached prices from CoinGecko, merge them
      if (this.cachedRealPrices.length > 0) {
        // Create a map of CoinGecko prices for easier lookup
        const coinGeckoMap = new Map(this.cachedRealPrices.map(p => [p.id, p]));
        
        // Start with database prices
        allPrices = [...dbPrices];
        
        // Add/update with CoinGecko data (CoinGecko data takes precedence for real-time prices)
        for (const cgPrice of this.cachedRealPrices) {
          const existingIndex = allPrices.findIndex(p => p.id === cgPrice.id);
          if (existingIndex >= 0) {
            // Update existing with real-time CoinGecko data
            allPrices[existingIndex] = cgPrice;
          } else {
            // Add new CoinGecko crypto
            allPrices.push(cgPrice);
          }
        }
        
        return this.addRealtimeFluctuations(allPrices);
      }
      
      // If no CoinGecko data but we have database cryptos, add fluctuations to them
      if (dbPrices.length > 0) {
        return this.addRealtimeFluctuations(dbPrices);
      }
    } catch (error) {
      console.error('Error fetching database cryptocurrencies:', error);
    }
    
    // Only use fallback if no real data available
    return this.getFallbackPrices();
  }

  private addRealtimeFluctuations(basePrices: CryptoPrice[]): CryptoPrice[] {
    const microVariation = (Math.random() - 0.5) * 0.0008; // Very small fluctuation (0.08%)
    
    return basePrices.map(crypto => ({
      ...crypto,
      current_price: crypto.current_price * (1 + microVariation)
    }));
  }

  async getCryptoPrice(coinId: string): Promise<number> {
    try {
      const response = await axios.get(`${COINGECKO_API_BASE}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd'
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Nectiq-Crypto-App/1.0'
        }
      });

      return response.data[coinId]?.usd || 0;
    } catch (error) {
      console.error(`Error fetching price for ${coinId}:`, error);
      return 0;
    }
  }

  private getSymbolFromId(id: string): string {
    const mapping: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'cardano': 'ADA',
      'solana': 'SOL'
    };
    return mapping[id] || id.toUpperCase();
  }

  private getNameFromId(id: string): string {
    const mapping: Record<string, string> = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'binancecoin': 'Binance Coin',
      'cardano': 'Cardano',
      'solana': 'Solana'
    };
    return mapping[id] || id;
  }

  private getCryptoImageUrl(coinId: string): string {
    // Special case for Solana - use custom gradient logo
    if (coinId === 'solana') {
      return '/attached_assets/solana_1750613756851.png';
    }
    
    // Map of CoinGecko IDs to their image IDs for accurate logo fetching
    const imageIdMap: { [key: string]: string } = {
      'bitcoin': '1',
      'ethereum': '279', 
      'binancecoin': '825',
      'cardano': '975',
      'solana': '4128',
      'avalanche-2': '12559',
      'ripple': '44',
      'dogecoin': '5',
      'polygon': '4713',
      'chainlink': '877',
      'litecoin': '2',
      'shiba-inu': '11939',
      'tron': '1094'
    };
    
    const imageId = imageIdMap[coinId] || '1'; // Default to Bitcoin if not found
    return `https://coin-images.coingecko.com/coins/images/${imageId}/large/${coinId}.png`;
  }

  private getFallbackPrices(): CryptoPrice[] {
    const now = Date.now();
    // Create smooth, realistic price movement using sine waves and time
    const timeVariation = Math.sin(now / 30000) * 0.1 + Math.cos(now / 20000) * 0.05;
    const microVariation = (Math.random() - 0.5) * 0.0008; // Very small random fluctuation
    
    // Updated with more current cryptocurrency prices (June 2025)
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 67500 + (timeVariation * 500) + (microVariation * 67500),
        price_change_percentage_24h: 1.85 + (timeVariation * 0.5),
        image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 3850 + (timeVariation * 80) + (microVariation * 3850),
        price_change_percentage_24h: -0.75 + (timeVariation * 0.4),
        image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png'
      },
      {
        id: 'binancecoin',
        symbol: 'BNB',
        name: 'Binance Coin',
        current_price: 615 + (timeVariation * 12) + (microVariation * 615),
        price_change_percentage_24h: 0.65 + (timeVariation * 0.3),
        image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
      },
      {
        id: 'cardano',
        symbol: 'ADA',
        name: 'Cardano',
        current_price: 0.48 + (timeVariation * 0.01) + (microVariation * 0.48),
        price_change_percentage_24h: -1.12 + (timeVariation * 0.6),
        image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png'
      },
      {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        current_price: 168 + (timeVariation * 8) + (microVariation * 168),
        price_change_percentage_24h: 2.45 + (timeVariation * 0.7),
        image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png'
      }
    ];
  }
}

export const cryptoService = new CryptoService();
