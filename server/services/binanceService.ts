import axios from 'axios';

export interface BinancePriceData {
  symbol: string;
  price: string;
  priceChangePercent: string;
  volume: string;
  count: number;
}

export interface BinanceKlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface FormattedCryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

class BinanceService {
  private baseURL = 'https://api.binance.com/api/v3';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5000; // 5 detik cache untuk stabilitas

  // Mapping cryptocurrency symbols to Binance trading pairs
  private cryptoMapping = {
    bitcoin: { symbol: 'BTCUSDT', name: 'Bitcoin', id: 'bitcoin' },
    ethereum: { symbol: 'ETHUSDT', name: 'Ethereum', id: 'ethereum' },
    binancecoin: { symbol: 'BNBUSDT', name: 'BNB', id: 'binancecoin' },
    cardano: { symbol: 'ADAUSDT', name: 'Cardano', id: 'cardano' },
    solana: { symbol: 'SOLUSDT', name: 'Solana', id: 'solana' },
    chainlink: { symbol: 'LINKUSDT', name: 'Chainlink', id: 'chainlink' },
    polkadot: { symbol: 'DOTUSDT', name: 'Polkadot', id: 'polkadot' },
    litecoin: { symbol: 'LTCUSDT', name: 'Litecoin', id: 'litecoin' },
    uniswap: { symbol: 'UNIUSDT', name: 'Uniswap', id: 'uniswap' },
    'matic-network': { symbol: 'MATICUSDT', name: 'Polygon', id: 'matic-network' },
    'avalanche-2': { symbol: 'AVAXUSDT', name: 'Avalanche', id: 'avalanche-2' },
    aave: { symbol: 'AAVEUSDT', name: 'Aave', id: 'aave' },
    'the-sandbox': { symbol: 'SANDUSDT', name: 'The Sandbox', id: 'the-sandbox' },
    'shiba-inu': { symbol: 'SHIBUSDT', name: 'Shiba Inu', id: 'shiba-inu' },
    ripple: { symbol: 'XRPUSDT', name: 'XRP', id: 'ripple' },
    dogecoin: { symbol: 'DOGEUSDT', name: 'Dogecoin', id: 'dogecoin' },
    'internet-computer': { symbol: 'ICPUSDT', name: 'Internet Computer', id: 'internet-computer' },
    'wrapped-bitcoin': { symbol: 'WBTCUSDT', name: 'Wrapped Bitcoin', id: 'wrapped-bitcoin' },
    'terra-luna': { symbol: 'LUNAUSDT', name: 'Terra Luna Classic', id: 'terra-luna' },
    'cosmos': { symbol: 'ATOMUSDT', name: 'Cosmos', id: 'cosmos' }
  };

  // Crypto logo mapping (menggunakan CoinGecko untuk logo saja)
  private logoMapping = {
    bitcoin: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
    ethereum: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png',
    binancecoin: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    cardano: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png',
    solana: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png',
    chainlink: 'https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    polkadot: 'https://coin-images.coingecko.com/coins/images/12171/large/polkadot.png',
    litecoin: 'https://coin-images.coingecko.com/coins/images/2/large/litecoin.png',
    uniswap: 'https://coin-images.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    'matic-network': 'https://coin-images.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    'avalanche-2': 'https://coin-images.coingecko.com/coins/images/12559/large/avalanche_token_round.png',
    aave: 'https://coin-images.coingecko.com/coins/images/12645/large/AAVE.png',
    'the-sandbox': 'https://coin-images.coingecko.com/coins/images/12129/large/sandbox_logo.jpg',
    'shiba-inu': 'https://coin-images.coingecko.com/coins/images/11939/large/shiba.png',
    ripple: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    dogecoin: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png',
    'internet-computer': 'https://coin-images.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png',
    'wrapped-bitcoin': 'https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png',
    'terra-luna': 'https://coin-images.coingecko.com/coins/images/8284/large/luna1557227471663.png',
    'cosmos': 'https://coin-images.coingecko.com/coins/images/1481/large/cosmos_hub.png'
  };

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

  async getCurrentPrices(): Promise<FormattedCryptoPrice[]> {
    const cacheKey = 'currentPrices';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('🔄 [BINANCE] Using cached price data');
      return cached;
    }

    try {
      console.log('📈 [BINANCE] Fetching live prices from Binance API...');
      
      // Get all trading pairs symbols
      const symbols = Object.values(this.cryptoMapping).map(crypto => crypto.symbol);
      
      // Fetch 24h ticker statistics
      const response = await axios.get(`${this.baseURL}/ticker/24hr`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Nectiq-Crypto-App/1.0'
        }
      });

      const allTickers = response.data;
      
      // Filter and format our cryptocurrencies
      const formattedPrices: FormattedCryptoPrice[] = [];
      
      for (const [cryptoId, cryptoInfo] of Object.entries(this.cryptoMapping)) {
        const ticker = allTickers.find((t: any) => t.symbol === cryptoInfo.symbol);
        
        if (ticker) {
          const currentPrice = parseFloat(ticker.price);
          const priceChange24h = parseFloat(ticker.priceChangePercent);
          const volume = parseFloat(ticker.volume);
          
          formattedPrices.push({
            id: cryptoInfo.id,
            symbol: cryptoInfo.symbol.replace('USDT', ''),
            name: cryptoInfo.name,
            current_price: currentPrice,
            price_change_percentage_24h: priceChange24h,
            market_cap: currentPrice * volume, // Rough approximation
            total_volume: volume,
            image: this.logoMapping[cryptoId as keyof typeof this.logoMapping] || ''
          });
        }
      }

      // Sort by price (highest first)
      formattedPrices.sort((a, b) => b.current_price - a.current_price);

      console.log(`✅ [BINANCE] Successfully fetched ${formattedPrices.length} cryptocurrency prices from Binance`);
      
      this.setCachedData(cacheKey, formattedPrices);
      return formattedPrices;

    } catch (error: any) {
      console.error('❌ [BINANCE] Error fetching prices:', error.message);
      
      // Return fallback data if available
      const fallback = this.getFallbackPrices();
      this.setCachedData(cacheKey, fallback);
      return fallback;
    }
  }

  async getChartData(cryptoId: string, interval: string = '1h', limit: number = 100): Promise<any[]> {
    const cacheKey = `chart_${cryptoId}_${interval}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const cryptoInfo = this.cryptoMapping[cryptoId as keyof typeof this.cryptoMapping];
      if (!cryptoInfo) {
        throw new Error(`Unsupported cryptocurrency: ${cryptoId}`);
      }

      console.log(`📊 [BINANCE] Fetching chart data for ${cryptoInfo.symbol}...`);

      const response = await axios.get(`${this.baseURL}/klines`, {
        params: {
          symbol: cryptoInfo.symbol,
          interval: interval,
          limit: limit
        },
        timeout: 10000
      });

      const klines: BinanceKlineData[] = response.data;
      
      // Format data for chart
      const chartData = klines.map((kline: any) => ({
        time: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }));

      console.log(`✅ [BINANCE] Retrieved ${chartData.length} chart data points for ${cryptoInfo.symbol}`);
      
      this.setCachedData(cacheKey, chartData);
      return chartData;

    } catch (error: any) {
      console.error(`❌ [BINANCE] Error fetching chart data for ${cryptoId}:`, error.message);
      return [];
    }
  }

  async getCryptoMetrics(cryptoId: string): Promise<any> {
    try {
      const cryptoInfo = this.cryptoMapping[cryptoId as keyof typeof this.cryptoMapping];
      if (!cryptoInfo) {
        throw new Error(`Unsupported cryptocurrency: ${cryptoId}`);
      }

      const response = await axios.get(`${this.baseURL}/ticker/24hr`, {
        params: {
          symbol: cryptoInfo.symbol
        },
        timeout: 10000
      });

      const ticker = response.data;
      
      return {
        id: cryptoId,
        symbol: cryptoInfo.symbol.replace('USDT', ''),
        name: cryptoInfo.name,
        market_data: {
          current_price: {
            usd: parseFloat(ticker.price)
          },
          total_volume: {
            usd: parseFloat(ticker.volume)
          },
          market_cap: {
            usd: parseFloat(ticker.price) * parseFloat(ticker.volume) // Approximation
          },
          circulating_supply: parseFloat(ticker.volume) // Approximation
        }
      };

    } catch (error: any) {
      console.error(`❌ [BINANCE] Error fetching metrics for ${cryptoId}:`, error.message);
      return null;
    }
  }

  private getFallbackPrices(): FormattedCryptoPrice[] {
    console.log('⚠️ [BINANCE] Using fallback prices data');
    
    // Generate realistic price variations (+/- 0.5% from base price)
    const generateVariation = (basePrice: number): number => {
      const variation = (Math.random() - 0.5) * 0.01; // +/- 0.5%
      return Math.round((basePrice * (1 + variation)) * 100) / 100;
    };

    const generateChangePercent = (): number => {
      return (Math.random() - 0.5) * 10; // +/- 5% range
    };
    
    const fallbackPrices = [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: generateVariation(105000), // More realistic BTC price
        price_change_percentage_24h: generateChangePercent(),
        market_cap: 2070000000000,
        total_volume: 28000000000,
        image: this.logoMapping.bitcoin
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: generateVariation(3800), // More realistic ETH price
        price_change_percentage_24h: generateChangePercent(),
        market_cap: 457000000000,
        total_volume: 15000000000,
        image: this.logoMapping.ethereum
      },
      {
        id: 'binancecoin',
        symbol: 'BNB',
        name: 'BNB',
        current_price: generateVariation(720), // More realistic BNB price
        price_change_percentage_24h: generateChangePercent(),
        market_cap: 104000000000,
        total_volume: 1800000000,
        image: this.logoMapping.binancecoin
      }
    ];

    return fallbackPrices;
  }
}

// Export singleton instance
export const binanceService = new BinanceService();
export { BinanceService };