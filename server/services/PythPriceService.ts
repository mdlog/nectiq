import { HermesClient } from "@pythnetwork/hermes-client";
import { CryptoPrice } from "./cryptoService";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { cryptocurrencies } from "../../shared/schema";

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
  private cryptoDataCache: Map<string, any> = new Map();
  private lastCacheUpdate: number = 0;
  private cacheExpiry: number = 30000; // 30 seconds cache

  constructor() {
    this.client = new HermesClient("https://hermes.pyth.network");
    console.log("🔗 [PYTH] Pyth Network service initialized - FULLY DYNAMIC MODE");
  }

  /**
   * Load cryptocurrency data from database
   */
  private async loadCryptocurrenciesFromDB(): Promise<void> {
    try {
      // FORCE RELOAD: Always clear cache to get fresh data
      this.cryptoDataCache.clear();
      this.lastCacheUpdate = 0;

      console.log("🔄 [PYTH] Loading cryptocurrency data from database...");
      const cryptos = await db.select().from(cryptocurrencies);
      
      this.cryptoDataCache.clear();
      for (const crypto of cryptos) {
        if (crypto.pythFeedId) {
          console.log(`🔍 [PYTH-DEBUG] Loading crypto: ${crypto.id}, image: ${crypto.image}`);
          this.cryptoDataCache.set(crypto.id, {
            id: crypto.id,
            name: crypto.name,
            symbol: crypto.symbol,
            pythFeedId: crypto.pythFeedId,
            image: crypto.image // Use image directly from database without fallback
          });
        }
      }

      this.lastCacheUpdate = Date.now();
      console.log(`✅ [PYTH] Loaded ${this.cryptoDataCache.size} cryptocurrencies from database`);
    } catch (error) {
      console.error("❌ [PYTH] Error loading cryptocurrencies from database:", error);
      throw error;
    }
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    this.cryptoDataCache.clear();
    this.lastCacheUpdate = 0;
    console.log("🔄 [PYTH] Cache manually cleared - fresh database load on next request");
  }

  /**
   * Get latest prices from Pyth Network (fully dynamic from database)
   */
  async getLatestPrices(): Promise<CryptoPrice[]> {
    try {
      console.log("🔍 [PYTH] getLatestPrices called - force loading from database");
      await this.loadCryptocurrenciesFromDB();
      
      const priceIds = Array.from(this.cryptoDataCache.values()).map(crypto => crypto.pythFeedId);
      console.log("🔍 [PYTH] Fetching latest prices for", priceIds.length, "cryptocurrencies");
      
      if (priceIds.length === 0) {
        console.warn("⚠️ [PYTH] No cryptocurrencies with Pyth Feed IDs found in database");
        return [];
      }
      
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
   * Start streaming real-time price updates (fully dynamic from database)
   */
  async startPriceStream(callback: (prices: CryptoPrice[]) => void): Promise<EventSource> {
    try {
      await this.loadCryptocurrenciesFromDB();
      
      const priceIds = Array.from(this.cryptoDataCache.values()).map(crypto => crypto.pythFeedId);
      console.log("🔄 [PYTH] Starting price stream for", priceIds.length, "cryptocurrencies");
      
      if (priceIds.length === 0) {
        throw new Error("No cryptocurrencies with Pyth Feed IDs found in database");
      }
      
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
   * Format Pyth price data to match our CryptoPrice interface (using database cache)
   */
  private formatPrices(pythData: PythPriceData[]): CryptoPrice[] {
    const prices: CryptoPrice[] = [];

    for (const data of pythData) {
      const cryptoInfo = this.findCryptoBypythFeedId(data.id);
      if (!cryptoInfo) {
        console.warn("⚠️ [PYTH] Unknown price ID:", data.id);
        continue;
      }

      console.log(`🔍 [PYTH-FORMAT] Processing ${cryptoInfo.id}, image: ${cryptoInfo.image}`);

      try {
        // Convert price from Pyth format (price * 10^expo) to regular decimal
        const price = parseFloat(data.price.price) * Math.pow(10, data.price.expo);
        const confidence = parseFloat(data.price.conf) * Math.pow(10, data.price.expo);
        
        // Calculate 24h change (placeholder - Pyth doesn't provide this directly)
        // In production, you might want to store previous prices and calculate this
        const change24h = 0; // Will be enhanced in future iterations

        const cryptoPrice: CryptoPrice = {
          id: cryptoInfo.id,
          symbol: cryptoInfo.symbol,
          name: cryptoInfo.name,
          image: cryptoInfo.image,
          current_price: price,
          price_change_percentage_24h: change24h,
          market_cap: 0, // Pyth doesn't provide market cap
          total_volume: 0, // Pyth doesn't provide volume
          confidence_interval: confidence,
          last_updated: new Date(data.price.publish_time * 1000).toISOString(),
          source: 'pyth'
        };

        prices.push(cryptoPrice);
      } catch (error) {
        console.error("❌ [PYTH] Error formatting price for", cryptoInfo.id, ":", error);
      }
    }

    return prices;
  }

  /**
   * Find crypto data by Pyth Feed ID from cache
   */
  private findCryptoBypythFeedId(pythFeedId: string): any | null {
    for (const crypto of this.cryptoDataCache.values()) {
      if (crypto.pythFeedId === pythFeedId) {
        return crypto;
      }
    }
    return null;
  }

  /**
   * Validate if a Pyth Feed ID is supported by Pyth Network
   */
  async validatePythFeedId(pythFeedId: string): Promise<{ isValid: boolean; error?: string; priceData?: any }> {
    try {
      // Validate format first - accept both 0x prefixed and non-prefixed formats
      const feedIdWithoutPrefix = pythFeedId.startsWith('0x') ? pythFeedId.slice(2) : pythFeedId;
      if (!pythFeedId || feedIdWithoutPrefix.length !== 64) {
        return {
          isValid: false,
          error: "Invalid Pyth Feed ID format. Must be 64-character hex string (with or without 0x prefix)"
        };
      }
      
      // Use the original format for API call (Pyth expects 0x prefix)
      const normalizedFeedId = pythFeedId.startsWith('0x') ? pythFeedId : `0x${pythFeedId}`;

      console.log(`🔍 [PYTH-VALIDATION] Testing Feed ID: ${normalizedFeedId}`);
      
      // Attempt to fetch price data for this Feed ID
      const priceUpdates = await this.client.getLatestPriceUpdates([normalizedFeedId]);
      
      if (!priceUpdates || !priceUpdates.parsed || priceUpdates.parsed.length === 0) {
        return {
          isValid: false,
          error: "Pyth Feed ID not found or not supported by Pyth Network. Please verify the Feed ID at https://www.pyth.network/developers/price-feed-ids"
        };
      }

      const priceData = priceUpdates.parsed[0];
      
      // Check if price data is valid
      if (!priceData.price || !priceData.price.price) {
        return {
          isValid: false,
          error: "Pyth Feed ID exists but no valid price data available"
        };
      }

      console.log(`✅ [PYTH-VALIDATION] Feed ID ${normalizedFeedId} is VALID - Price: ${priceData.price.price}`);
      
      return {
        isValid: true,
        priceData: priceData
      };
    } catch (error: any) {
      console.error(`❌ [PYTH-VALIDATION] Error validating Feed ID ${normalizedFeedId}:`, error);
      
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return {
          isValid: false,
          error: "Pyth Feed ID not found. Please verify the Feed ID at https://www.pyth.network/developers/price-feed-ids"
        };
      }
      
      return {
        isValid: false,
        error: `Pyth Network validation failed: ${error.message}`
      };
    }
  }

  /**
   * Get list of supported cryptocurrencies from database
   */
  async getSupportedCryptocurrencies(): Promise<string[]> {
    await this.loadCryptocurrenciesFromDB();
    return Array.from(this.cryptoDataCache.keys());
  }

  /**
   * Get supported cryptocurrency IDs from database
   */
  async getSupportedCryptos(): Promise<string[]> {
    return await this.getSupportedCryptocurrencies();
  }

  /**
   * Check if a cryptocurrency is supported (from database cache)
   */
  async isSupported(cryptoId: string): Promise<boolean> {
    await this.loadCryptocurrenciesFromDB();
    return this.cryptoDataCache.has(cryptoId);
  }



  /**
   * Refresh cache manually
   */
  async refreshCache(): Promise<void> {
    this.lastCacheUpdate = 0; // Force refresh
    await this.loadCryptocurrenciesFromDB();
  }
}

// Export singleton instance
export const pythPriceService = new PythPriceService();