import { HermesClient } from "@pythnetwork/hermes-client";
import { CryptoPrice } from "./cryptoService";

export interface PythPriceData {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
}

export interface PythPriceUpdate {
  parsed: PythPriceData[];
  binary: {
    encoding: string;
    data: string[];
  };
}

export class PythPriceService {
  private client: HermesClient;
  private priceIds: Record<string, string> = {
    'bitcoin': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    'ethereum': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    'binancecoin': '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
    'solana': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    'cardano': '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
    'dogecoin': '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
    'ripple': '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8'
  };

  private cryptoMapping: Record<string, { name: string; symbol: string; image: string }> = {
    'bitcoin': { name: 'Bitcoin', symbol: 'BTC', image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png' },
    'ethereum': { name: 'Ethereum', symbol: 'ETH', image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png' },
    'binancecoin': { name: 'BNB', symbol: 'BNB', image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
    'solana': { name: 'Solana', symbol: 'SOL', image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png' },
    'cardano': { name: 'Cardano', symbol: 'ADA', image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png' },
    'dogecoin': { name: 'Dogecoin', symbol: 'DOGE', image: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png' },
    'ripple': { name: 'Ripple', symbol: 'XRP', image: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' }
  };

  constructor() {
    this.client = new HermesClient("https://hermes.pyth.network");
    console.log("🔗 [PYTH] Pyth Network service initialized");
  }

  /**
   * Get latest prices from Pyth Network
   */
  async getLatestPrices(): Promise<CryptoPrice[]> {
    try {
      const priceIds = Object.values(this.priceIds);
      console.log("🔍 [PYTH] Fetching latest prices for", priceIds.length, "cryptocurrencies");
      
      const priceUpdates = await this.client.getLatestPriceUpdates(priceIds);
      
      if (!priceUpdates || !priceUpdates.parsed) {
        throw new Error("Invalid response from Pyth Network");
      }

      const formattedPrices = this.formatPrices(priceUpdates.parsed);
      console.log("✅ [PYTH] Successfully fetched", formattedPrices.length, "prices from Pyth Network");
      
      return formattedPrices;
    } catch (error) {
      console.error("❌ [PYTH] Error fetching prices:", error);
      throw error;
    }
  }

  /**
   * Start streaming real-time price updates
   */
  async startPriceStream(callback: (prices: CryptoPrice[]) => void): Promise<EventSource> {
    try {
      const priceIds = Object.values(this.priceIds);
      console.log("🔄 [PYTH] Starting price stream for", priceIds.length, "cryptocurrencies");
      
      const eventSource = await this.client.getPriceUpdatesStream(priceIds);

      eventSource.onmessage = (event) => {
        try {
          const update: PythPriceUpdate = JSON.parse(event.data);
          if (update.parsed && update.parsed.length > 0) {
            const formattedPrices = this.formatPrices(update.parsed);
            console.log("📡 [PYTH] Received streaming update for", formattedPrices.length, "prices");
            callback(formattedPrices);
          }
        } catch (error) {
          console.error("❌ [PYTH] Error processing stream data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ [PYTH] Stream error:", error);
      };

      console.log("✅ [PYTH] Price stream started successfully");
      return eventSource;
    } catch (error) {
      console.error("❌ [PYTH] Error starting price stream:", error);
      throw error;
    }
  }

  /**
   * Format Pyth price data to match our CryptoPrice interface
   */
  private formatPrices(pythData: PythPriceData[]): CryptoPrice[] {
    const prices: CryptoPrice[] = [];

    for (const data of pythData) {
      const cryptoId = this.findCryptoIdByPriceId(data.id);
      if (!cryptoId) {
        console.warn("⚠️ [PYTH] Unknown price ID:", data.id);
        continue;
      }

      const cryptoInfo = this.cryptoMapping[cryptoId];
      if (!cryptoInfo) {
        console.warn("⚠️ [PYTH] No mapping found for crypto:", cryptoId);
        continue;
      }

      try {
        // Convert price from Pyth format (price * 10^expo) to regular decimal
        const price = parseFloat(data.price.price) * Math.pow(10, data.price.expo);
        const confidence = parseFloat(data.price.conf) * Math.pow(10, data.price.expo);
        
        // Calculate 24h change (placeholder - Pyth doesn't provide this directly)
        // In production, you might want to store previous prices and calculate this
        const change24h = 0; // Will be enhanced in future iterations

        const cryptoPrice: CryptoPrice = {
          id: cryptoId,
          symbol: cryptoInfo.symbol,
          name: cryptoInfo.name,
          image: cryptoInfo.image,
          current_price: price,
          price_change_24h: change24h,
          price_change_percentage_24h: change24h,
          market_cap: 0, // Pyth doesn't provide market cap
          total_volume: 0, // Pyth doesn't provide volume
          confidence_interval: confidence,
          last_updated: new Date(data.price.publish_time * 1000).toISOString(),
          source: 'pyth'
        };

        prices.push(cryptoPrice);
      } catch (error) {
        console.error("❌ [PYTH] Error formatting price for", cryptoId, ":", error);
      }
    }

    return prices;
  }

  /**
   * Add new cryptocurrency to Pyth Network integration
   */
  addCryptocurrency(cryptoId: string, pythFeedId: string): void {
    try {
      // Validate Pyth Feed ID format
      if (!pythFeedId || !pythFeedId.startsWith('0x') || pythFeedId.length !== 66) {
        throw new Error("Invalid Pyth Feed ID format. Must be 64-character hex string starting with '0x'");
      }

      // Add to price IDs mapping
      this.priceIds[cryptoId] = pythFeedId;
      
      // Add basic crypto mapping (this can be enhanced later with CoinGecko data)
      if (!this.cryptoMapping[cryptoId]) {
        this.cryptoMapping[cryptoId] = {
          name: cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1),
          symbol: cryptoId.toUpperCase().substring(0, 4),
          image: `https://coin-images.coingecko.com/coins/images/1/large/${cryptoId}.png`
        };
      }

      console.log(`✅ [PYTH] Added ${cryptoId} with Pyth Feed ID: ${pythFeedId}`);
    } catch (error) {
      console.error(`❌ [PYTH] Failed to add ${cryptoId}:`, error);
      throw error;
    }
  }

  /**
   * Remove cryptocurrency from Pyth Network integration
   */
  removeCryptocurrency(cryptoId: string): void {
    try {
      delete this.priceIds[cryptoId];
      delete this.cryptoMapping[cryptoId];
      console.log(`✅ [PYTH] Removed ${cryptoId} from Pyth Network integration`);
    } catch (error) {
      console.error(`❌ [PYTH] Failed to remove ${cryptoId}:`, error);
      throw error;
    }
  }

  /**
   * Get list of supported cryptocurrencies
   */
  getSupportedCryptocurrencies(): string[] {
    return Object.keys(this.priceIds);
  }

  /**
   * Find crypto ID by Pyth price ID
   */
  private findCryptoIdByPriceId(priceId: string): string | null {
    // Remove '0x' prefix if present for comparison
    const cleanPriceId = priceId.startsWith('0x') ? priceId.slice(2) : priceId;
    
    for (const [cryptoId, pythPriceId] of Object.entries(this.priceIds)) {
      const cleanPythPriceId = pythPriceId.startsWith('0x') ? pythPriceId.slice(2) : pythPriceId;
      if (cleanPythPriceId === cleanPriceId) {
        return cryptoId;
      }
    }
    return null;
  }

  /**
   * Get supported cryptocurrency IDs
   */
  getSupportedCryptos(): string[] {
    return Object.keys(this.priceIds);
  }

  /**
   * Check if a cryptocurrency is supported
   */
  isSupported(cryptoId: string): boolean {
    return cryptoId in this.priceIds;
  }
}

// Export singleton instance
export const pythPriceService = new PythPriceService();