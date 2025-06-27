import { users, predictions, cryptocurrencies, rewards, withdrawals, purchases, securityEvents, adminLogs, transactionLogs, systemSettings, banners, events, predictionBattles, battleSpectators, battleComments, battleReactions, type User, type InsertUser, type Prediction, type InsertPrediction, type Cryptocurrency, type InsertCryptocurrency, type Reward, type InsertReward, type Withdrawal, type InsertWithdrawal, type Purchase, type InsertPurchase, type Banner, type InsertBanner, type Event, type InsertEvent, type PredictionBattle, type InsertPredictionBattle, type BattleComment, type InsertBattleComment } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, gte, lte, like, or, isNull, inArray, sql, lt } from "drizzle-orm";

// Generate unique 9-digit UID
function generateUID(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

// Check if UID already exists and generate a new one if needed
async function generateUniqueUID(): Promise<string> {
  let uid: string;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    uid = generateUID();
    const existingUser = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existingUser.length === 0) {
      return uid;
    }
    attempts++;
  } while (attempts < maxAttempts);
  
  throw new Error("Failed to generate unique UID after multiple attempts");
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: number): Promise<void>;
  updateUserStats(id: number, totalPredictions: number, correctPredictions: number, totalRewards: number): Promise<void>;
  updateUsername(id: number, username: string): Promise<void>;
  updateProfilePhoto(id: number, profilePhoto: string): Promise<void>;

  // Prediction operations
  createPrediction(prediction: any): Promise<Prediction>;
  getPrediction(id: number): Promise<Prediction | undefined>;
  getUserPredictions(userId: number): Promise<Prediction[]>;
  getAllPredictions(): Promise<Prediction[]>;
  getActivePredictions(): Promise<Prediction[]>;
  updatePredictionResult(id: number, actualPrice: string, accuracy: string, rewardAmount: number, status: string): Promise<void>;
  getRecentPredictions(limit?: number): Promise<Prediction[]>;

  // Cryptocurrency operations
  getCryptocurrency(id: string): Promise<Cryptocurrency | undefined>;
  getAllCryptocurrencies(): Promise<Cryptocurrency[]>;
  upsertCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency>;
  deleteCryptocurrency(id: string): Promise<void>;

  // Reward operations
  createReward(reward: InsertReward): Promise<Reward>;
  getUserRewards(userId: number): Promise<Reward[]>;
  getRecentRewards(userId: number, limit?: number): Promise<Reward[]>;

  // Leaderboard operations
  getTopPredictors(limit?: number): Promise<User[]>;
  resetLeaderboard(): Promise<void>;

  // Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getUserWithdrawals(userId: number, limit?: number): Promise<Withdrawal[]>;

  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getUserPurchases(userId: number, limit?: number): Promise<Purchase[]>;

  // User management operations
  deleteUser(id: number): Promise<void>;

  // Security event operations
  createSecurityEvent(event: any): Promise<any>;
  getSecurityEvents(filters?: any): Promise<any[]>;
  updateSecurityEvent(id: number, updates: any): Promise<void>;
  getSecurityStats(): Promise<any>;

  // Admin log operations
  createAdminLog(log: any): Promise<any>;
  getAdminLogs(filters?: any): Promise<any[]>;

  // Transaction log operations
  createTransactionLog(transaction: any): Promise<any>;
  getTransactionLogs(filters?: any): Promise<any[]>;
  getTransactionStats(): Promise<any>;

  // System settings operations
  getSystemSettings(): Promise<any>;
  updateSystemSetting(category: string, key: string, value: any, adminId: number): Promise<void>;

  // Banner operations
  createBanner(banner: any): Promise<any>;
  getAllBanners(): Promise<any[]>;
  getActiveBanners(position?: string): Promise<any[]>;
  updateBanner(id: number, banner: any): Promise<void>;
  deleteBanner(id: number): Promise<void>;

  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getAllEvents(): Promise<Event[]>;
  getActiveEvents(): Promise<Event[]>;
  getFeaturedEvents(): Promise<Event[]>;
  getEventsByType(eventType: string): Promise<Event[]>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<void>;
  deleteEvent(id: number): Promise<void>;
  getEvent(id: number): Promise<Event | undefined>;

  // Battle operations
  createBattle(battle: any): Promise<any>;
  getLiveBattles(): Promise<any[]>;
  getBattle(id: number): Promise<any>;
  getBattleById(id: number): Promise<any>;
  getBattleHistory(): Promise<any[]>;
  updateBattle(id: number, updates: any): Promise<void>;
  deleteBattle(id: number): Promise<void>;
  createBattleComment(comment: any): Promise<any>;
  getBattleComments(battleId: number): Promise<any[]>;
  getAllBattles(filters?: any): Promise<any[]>;
  getAdminBattles(filters: any, dateFilters: any, pagination: any): Promise<any[]>;
  getBattleStats(): Promise<any>;
  getUserBattles(userId: number): Promise<any[]>;
  addToUserBalance(userId: number, amount: number): Promise<void>;
  updateUser(id: number, updates: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const uid = await generateUniqueUID();
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, uid })
      .returning();
    return user;
  }

  async updateUserBalance(id: number, balance: number): Promise<void> {
    await db
      .update(users)
      .set({ balance })
      .where(eq(users.id, id));
  }

  async updateUserStats(id: number, totalPredictions: number, correctPredictions: number, totalRewards: number): Promise<void> {
    await db
      .update(users)
      .set({ totalPredictions, correctPredictions, totalRewards })
      .where(eq(users.id, id));
  }

  async updateUsername(id: number, username: string): Promise<void> {
    await db
      .update(users)
      .set({ username })
      .where(eq(users.id, id));
  }

  async updateProfilePhoto(id: number, profilePhoto: string): Promise<void> {
    await db
      .update(users)
      .set({ profilePhoto })
      .where(eq(users.id, id));
  }

  async createPrediction(predictionData: any): Promise<Prediction> {
    const [prediction] = await db
      .insert(predictions)
      .values(predictionData)
      .returning();
    return prediction;
  }

  async getPrediction(id: number): Promise<Prediction | undefined> {
    const [prediction] = await db.select().from(predictions).where(eq(predictions.id, id));
    return prediction || undefined;
  }

  async getUserPredictions(userId: number): Promise<Prediction[]> {
    return await db.select().from(predictions).where(eq(predictions.userId, userId)).orderBy(desc(predictions.createdAt));
  }

  async getAllPredictions(): Promise<Prediction[]> {
    return await db.select().from(predictions).orderBy(desc(predictions.createdAt));
  }

  async getActivePredictions(): Promise<Prediction[]> {
    return await db.select().from(predictions).where(eq(predictions.status, "pending"));
  }

  async updatePredictionResult(id: number, actualPrice: string, accuracy: string, rewardAmount: number, status: string): Promise<void> {
    await db
      .update(predictions)
      .set({ 
        actualPrice, 
        accuracy, 
        rewardAmount, 
        status, 
        completedAt: new Date() 
      })
      .where(eq(predictions.id, id));
  }

  async getRecentPredictions(limit: number = 10): Promise<Prediction[]> {
    return await db.select().from(predictions).orderBy(desc(predictions.createdAt)).limit(limit);
  }

  async getCryptocurrency(id: string): Promise<Cryptocurrency | undefined> {
    const [crypto] = await db.select().from(cryptocurrencies).where(eq(cryptocurrencies.id, id));
    return crypto || undefined;
  }

  async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return await db.select().from(cryptocurrencies);
  }

  async upsertCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency> {
    const [result] = await db
      .insert(cryptocurrencies)
      .values({ ...crypto, lastUpdated: new Date() })
      .onConflictDoUpdate({
        target: cryptocurrencies.id,
        set: {
          currentPrice: crypto.currentPrice,
          priceChange24h: crypto.priceChange24h,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return result;
  }

  async deleteCryptocurrency(id: string): Promise<void> {
    await db.delete(cryptocurrencies).where(eq(cryptocurrencies.id, id));
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db
      .insert(rewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async getUserRewards(userId: number): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.userId, userId)).orderBy(desc(rewards.createdAt));
  }

  async getRecentRewards(userId: number, limit: number = 10): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.userId, userId)).orderBy(desc(rewards.createdAt)).limit(limit);
  }

  async getTopPredictors(limit: number = 10): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.totalRewards)).limit(limit);
  }

  async resetLeaderboard(): Promise<void> {
    // Reset all user statistics to zero
    await db.update(users).set({
      totalPredictions: 0,
      correctPredictions: 0,
      totalRewards: 0,
    });
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [withdrawal] = await db
      .insert(withdrawals)
      .values(insertWithdrawal)
      .returning();
    return withdrawal;
  }

  async getUserWithdrawals(userId: number, limit: number = 10): Promise<Withdrawal[]> {
    return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.createdAt)).limit(limit);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values(insertPurchase)
      .returning();
    return purchase;
  }

  async getUserPurchases(userId: number, limit: number = 10): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt)).limit(limit);
  }

  async deleteUser(id: number): Promise<void> {
    // Delete user data in correct order to handle foreign key constraints
    
    // 1. Delete rewards first (references predictions and users)
    await db.delete(rewards).where(eq(rewards.userId, id));
    
    // 2. Delete predictions (references users)
    await db.delete(predictions).where(eq(predictions.userId, id));
    
    // 3. Delete purchases (references users)
    await db.delete(purchases).where(eq(purchases.userId, id));
    
    // 4. Delete withdrawals (references users)
    await db.delete(withdrawals).where(eq(withdrawals.userId, id));
    
    // 5. Delete transaction logs (references users)
    await db.delete(transactionLogs).where(eq(transactionLogs.userId, id));
    
    // 6. Delete admin logs where this user is the admin
    await db.delete(adminLogs).where(eq(adminLogs.adminId, id));
    
    // 7. Finally delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  // Security event operations
  async createSecurityEvent(event: any): Promise<any> {
    const [newEvent] = await db.insert(securityEvents).values(event).returning();
    return newEvent;
  }

  async getSecurityEvents(filters: any = {}): Promise<any[]> {
    let query = db.select().from(securityEvents);
    
    if (filters.severity && filters.severity !== 'all') {
      query = query.where(eq(securityEvents.severity, filters.severity));
    }
    
    if (filters.resolved !== undefined) {
      query = query.where(eq(securityEvents.resolved, filters.resolved));
    }
    
    if (filters.startDate) {
      query = query.where(gte(securityEvents.createdAt, new Date(filters.startDate)));
    }
    
    if (filters.endDate) {
      query = query.where(lte(securityEvents.createdAt, new Date(filters.endDate)));
    }

    const events = await query.orderBy(desc(securityEvents.createdAt));
    return events;
  }

  async updateSecurityEvent(id: number, updates: any): Promise<void> {
    await db.update(securityEvents).set(updates).where(eq(securityEvents.id, id));
  }

  async getSecurityStats(): Promise<any> {
    const events = await db.select().from(securityEvents);
    
    return {
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highEvents: events.filter(e => e.severity === 'high').length,
      mediumEvents: events.filter(e => e.severity === 'medium').length,
      unresolvedEvents: events.filter(e => !e.resolved).length,
      autoBlockedIps: events.filter(e => e.status === 'auto-blocked').length
    };
  }

  // Admin log operations
  async createAdminLog(log: any): Promise<any> {
    const [newLog] = await db.insert(adminLogs).values(log).returning();
    return newLog;
  }

  async getAdminLogs(filters: any = {}): Promise<any[]> {
    let query = db.select().from(adminLogs)
      .leftJoin(users, eq(adminLogs.adminId, users.id));
    
    if (filters.adminId) {
      query = query.where(eq(adminLogs.adminId, filters.adminId));
    }
    
    if (filters.action) {
      query = query.where(like(adminLogs.action, `%${filters.action}%`));
    }

    const logs = await query.orderBy(desc(adminLogs.createdAt));
    return logs.map(log => ({
      ...log.admin_logs,
      adminUsername: log.users?.username || 'Unknown'
    }));
  }

  // Transaction log operations
  async createTransactionLog(transaction: any): Promise<any> {
    const [newTransaction] = await db.insert(transactionLogs).values(transaction).returning();
    return newTransaction;
  }

  async getTransactionLogs(filters: any = {}): Promise<any[]> {
    let query = db.select().from(transactionLogs)
      .leftJoin(users, eq(transactionLogs.userId, users.id));
    
    if (filters.type && filters.type !== 'all') {
      query = query.where(eq(transactionLogs.type, filters.type));
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.where(eq(transactionLogs.status, filters.status));
    }
    
    if (filters.token && filters.token !== 'all') {
      query = query.where(eq(transactionLogs.token, filters.token));
    }

    const transactions = await query.orderBy(desc(transactionLogs.createdAt));
    return transactions.map(tx => ({
      ...tx.transaction_logs,
      username: tx.users?.username,
      uid: tx.users?.uid
    }));
  }

  async getTransactionStats(): Promise<any> {
    const transactions = await db.select().from(transactionLogs);
    
    const purchases = transactions.filter(t => t.type === 'purchase');
    const withdrawals = transactions.filter(t => t.type === 'withdrawal');
    const rewards = transactions.filter(t => t.type === 'reward');
    
    return {
      totalTransactions: transactions.length,
      totalPurchases: purchases.length,
      totalWithdrawals: withdrawals.length,
      totalRewards: rewards.length,
      totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
      avgTransactionSize: transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0
    };
  }

  // System settings operations
  async getSystemSettings(): Promise<any> {
    const settings = await db.select().from(systemSettings);
    
    const settingsObj: any = {
      platform: {},
      security: {},
      exchangeRates: {}
    };
    
    settings.forEach(setting => {
      if (!settingsObj[setting.category]) {
        settingsObj[setting.category] = {};
      }
      
      let value = setting.value;
      if (setting.dataType === 'number') {
        value = parseFloat(setting.value);
      } else if (setting.dataType === 'boolean') {
        value = setting.value === 'true';
      } else if (setting.dataType === 'json') {
        value = JSON.parse(setting.value);
      }
      
      settingsObj[setting.category][setting.key] = value;
    });
    
    // Set defaults if not found
    return {
      platform: {
        minPredictionAmount: settingsObj.platform.minPredictionAmount || 10,
        maxPredictionAmount: settingsObj.platform.maxPredictionAmount || 10000,
        withdrawalFee: settingsObj.platform.withdrawalFee || 2.5,
        minWithdrawal: settingsObj.platform.minWithdrawal || 1000,
        ...settingsObj.platform
      },
      security: {
        rateLimit: settingsObj.security.rateLimit || 500,
        maxPredictionsPerHour: settingsObj.security.maxPredictionsPerHour || 5,
        maxWithdrawalsPerHour: settingsObj.security.maxWithdrawalsPerHour || 5,
        sessionTimeout: settingsObj.security.sessionTimeout || 24,
        ...settingsObj.security
      },
      exchangeRates: {
        ethToPts: settingsObj.exchangeRates.ethToPts || 300000,
        usdtToPts: settingsObj.exchangeRates.usdtToPts || 100,
        ptsToUsdt: settingsObj.exchangeRates.ptsToUsdt || 0.01,
        ...settingsObj.exchangeRates
      }
    };
  }

  async updateSystemSetting(category: string, key: string, value: any, adminId: number): Promise<void> {
    const dataType = typeof value === 'number' ? 'number' : 
                     typeof value === 'boolean' ? 'boolean' : 
                     typeof value === 'object' ? 'json' : 'string';
    
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    await db.insert(systemSettings)
      .values({
        category,
        key,
        value: stringValue,
        dataType,
        updatedBy: adminId,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [systemSettings.category, systemSettings.key],
        set: {
          value: stringValue,
          dataType,
          updatedBy: adminId,
          updatedAt: new Date()
        }
      });
  }

  async createBanner(bannerData: any): Promise<any> {
    const [banner] = await db
      .insert(banners)
      .values(bannerData)
      .returning();
    return banner;
  }

  async getAllBanners(): Promise<any[]> {
    return await db
      .select()
      .from(banners)
      .orderBy(desc(banners.priority), desc(banners.createdAt));
  }

  async getActiveBanners(position?: string): Promise<any[]> {
    const now = new Date();
    let query = db
      .select()
      .from(banners)
      .where(
        and(
          eq(banners.isActive, true),
          or(
            isNull(banners.startDate),
            lte(banners.startDate, now)
          ),
          or(
            isNull(banners.endDate),
            gte(banners.endDate, now)
          )
        )
      );

    if (position) {
      query = query.where(and(
        eq(banners.isActive, true),
        eq(banners.position, position),
        or(
          isNull(banners.startDate),
          lte(banners.startDate, now)
        ),
        or(
          isNull(banners.endDate),
          gte(banners.endDate, now)
        )
      ));
    }

    return await query.orderBy(desc(banners.priority));
  }

  async updateBanner(id: number, bannerData: any): Promise<void> {
    await db
      .update(banners)
      .set({ ...bannerData, updatedAt: new Date() })
      .where(eq(banners.id, id));
  }

  async deleteBanner(id: number): Promise<void> {
    await db
      .delete(banners)
      .where(eq(banners.id, id));
  }

  // Event operations
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return event;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getActiveEvents(): Promise<Event[]> {
    const now = new Date();
    return await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.isActive, true),
          lte(events.startDate, now),
          gte(events.endDate, now)
        )
      )
      .orderBy(desc(events.isFeatured), desc(events.startDate));
  }

  async getFeaturedEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(and(eq(events.isActive, true), eq(events.isFeatured, true)))
      .orderBy(desc(events.startDate));
  }

  async getEventsByType(eventType: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(and(eq(events.isActive, true), eq(events.eventType, eventType)))
      .orderBy(desc(events.startDate));
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<void> {
    await db
      .update(events)
      .set({ ...eventData, updatedAt: new Date() })
      .where(eq(events.id, id));
  }

  async deleteEvent(id: number): Promise<void> {
    await db
      .delete(events)
      .where(eq(events.id, id));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  // Battle operations
  async createBattle(battleData: any): Promise<any> {
    // Calculate join deadline and fairness parameters
    const now = new Date();
    const targetTime = new Date(battleData.targetTime);
    const timeframeMinutes = this.getTimeframeInMinutes(battleData.timeframe);
    
    // Join deadline adalah 80% dari total waktu battle
    const joinDeadlineMinutes = Math.floor(timeframeMinutes * 0.8);
    const joinDeadline = new Date(now.getTime() + joinDeadlineMinutes * 60 * 1000);
    
    // Get current price untuk fairness calculation
    const currentPrice = await this.getCurrentCryptoPrice(battleData.cryptocurrency);
    
    const enhancedBattleData = {
      ...battleData,
      joinDeadline,
      minimumJoinTime: 300, // 5 menit minimum
      priceAtCreation: currentPrice,
      priceMovementPenalty: true,
      fairnessMultiplier: "1.00",
      joinTimeBonus: "1.00"
    };

    const [battle] = await db
      .insert(predictionBattles)
      .values(enhancedBattleData)
      .returning();
    return battle;
  }

  private getTimeframeInMinutes(timeframe: string): number {
    switch(timeframe) {
      case '1h': return 60;
      case '6h': return 360;
      case '24h': return 1440;
      case '7d': return 10080;
      default: return 60;
    }
  }

  async getCurrentCryptoPrice(cryptoId: string): Promise<number> {
    try {
      // Gunakan axios untuk mengambil data dari CoinGecko API secara langsung
      const axios = await import('axios');
      const response = await axios.default.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids: cryptoId,
          vs_currencies: 'usd'
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Nectiq-Crypto-App/1.0'
        }
      });

      return response.data[cryptoId]?.usd || 0;
    } catch (error) {
      console.error(`Error fetching price for ${cryptoId}:`, error);
      // Fallback ke database jika API gagal
      try {
        const [crypto] = await db.select().from(cryptocurrencies).where(eq(cryptocurrencies.id, cryptoId));
        return crypto ? parseFloat(crypto.currentPrice) : 0;
      } catch (dbError) {
        console.error(`Database fallback failed for ${cryptoId}:`, dbError);
        return 0;
      }
    }
  }

  // Method to resolve expired battles
  private async resolveExpiredBattles(): Promise<void> {
    try {
      // Find all active battles that have passed their target time
      const expiredBattles = await db
        .select()
        .from(predictionBattles)
        .where(and(
          eq(predictionBattles.status, 'active'),
          lt(predictionBattles.targetTime, new Date())
        ));

      for (const battle of expiredBattles) {
        await this.resolveBattle(battle.id);
      }
    } catch (error) {
      console.error('Error resolving expired battles:', error);
    }
  }

  // Method to resolve a specific battle
  private async resolveBattle(battleId: number): Promise<void> {
    try {
      const [battle] = await db
        .select()
        .from(predictionBattles)
        .where(eq(predictionBattles.id, battleId));

      if (!battle || battle.status !== 'active') {
        return;
      }

      // Get current crypto price
      const currentPrice = await this.getCurrentCryptoPrice(battle.cryptocurrency);
      
      if (!currentPrice || !battle.challengerPrediction || !battle.challengedPrediction) {
        // If we can't get price or missing predictions, mark as cancelled
        await db
          .update(predictionBattles)
          .set({ 
            status: 'cancelled',
            actualPrice: currentPrice?.toString() || '0'
          })
          .where(eq(predictionBattles.id, battleId));
        return;
      }

      // Calculate accuracy for both predictions
      const challengerAccuracy = Math.abs((parseFloat(battle.challengerPrediction) - currentPrice) / currentPrice) * 100;
      const challengedAccuracy = Math.abs((parseFloat(battle.challengedPrediction) - currentPrice) / currentPrice) * 100;

      let winnerId: number | null = null;
      let winnerReward = 0;

      // Determine winner (lower accuracy percentage = more accurate prediction)
      if (challengerAccuracy < challengedAccuracy) {
        winnerId = battle.challengerId;
      } else if (challengedAccuracy < challengerAccuracy) {
        winnerId = battle.challengedId;
      }
      // If equal accuracy, it's a tie (winnerId remains null)

      // Calculate reward based on accuracy and stake
      if (winnerId) {
        const winnerAccuracy = winnerId === battle.challengerId ? challengerAccuracy : challengedAccuracy;
        let multiplier = 1;

        // Accuracy-based multipliers
        if (winnerAccuracy <= 0.1) multiplier = 5;
        else if (winnerAccuracy <= 1) multiplier = 3;
        else if (winnerAccuracy <= 5) multiplier = 1.5;
        else multiplier = 1;

        winnerReward = parseFloat(String(battle.stakeAmount)) * 2 * multiplier; // Double stake + multiplier

        // Update winner's balance
        const [winner] = await db.select().from(users).where(eq(users.id, winnerId));
        if (winner) {
          await db
            .update(users)
            .set({ 
              balance: winner.balance + winnerReward,
              totalRewards: winner.totalRewards + winnerReward
            })
            .where(eq(users.id, winnerId));
        }
      } else {
        // It's a tie - refund both players
        const stakeAmount = parseFloat(String(battle.stakeAmount));
        const [challenger] = await db.select().from(users).where(eq(users.id, battle.challengerId));
        
        if (challenger) {
          await db
            .update(users)
            .set({ balance: challenger.balance + stakeAmount })
            .where(eq(users.id, battle.challengerId));
        }
        
        if (battle.challengedId) {
          const [challenged] = await db.select().from(users).where(eq(users.id, battle.challengedId));
          if (challenged) {
            await db
              .update(users)
              .set({ balance: challenged.balance + stakeAmount })
              .where(eq(users.id, battle.challengedId));
          }
        }
      }

      // Update battle status to completed
      await db
        .update(predictionBattles)
        .set({
          status: 'completed',
          winnerId: winnerId || null,
          actualPrice: currentPrice.toString()
        })
        .where(eq(predictionBattles.id, battleId));

      console.log(`Battle ${battleId} resolved. Winner: ${winnerId || 'Tie'}, Reward: ${winnerReward}`);

    } catch (error) {
      console.error(`Error resolving battle ${battleId}:`, error);
    }
  }

  async getLiveBattles(): Promise<any[]> {
    // First, resolve any expired battles
    await this.resolveExpiredBattles();

    // Get battles with challenger and challenged user info
    const battles = await db
      .select({
        id: predictionBattles.id,
        challengerId: predictionBattles.challengerId,
        challengedId: predictionBattles.challengedId,
        cryptocurrency: predictionBattles.cryptocurrency,
        timeframe: predictionBattles.timeframe,
        stakeAmount: predictionBattles.stakeAmount,
        challengerPrediction: predictionBattles.challengerPrediction,
        challengedPrediction: predictionBattles.challengedPrediction,
        status: predictionBattles.status,
        targetTime: predictionBattles.targetTime,
        createdAt: predictionBattles.createdAt,
        spectatorCount: predictionBattles.spectatorCount,
        battleType: predictionBattles.battleType,
        isPublic: predictionBattles.isPublic,
        challengerUsername: users.username,
        challengerPhoto: users.profilePhoto
      })
      .from(predictionBattles)
      .leftJoin(users, eq(predictionBattles.challengerId, users.id))
      .where(or(
        eq(predictionBattles.status, 'open'),
        eq(predictionBattles.status, 'active')
      ))
      .orderBy(desc(predictionBattles.createdAt));

    // Get challenged user info for battles that have challengedId
    const battlesWithChallenged = await Promise.all(
      battles.map(async (battle) => {
        let challenged = null;
        if (battle.challengedId) {
          const [challengedUser] = await db
            .select({
              username: users.username,
              profilePhoto: users.profilePhoto
            })
            .from(users)
            .where(eq(users.id, battle.challengedId));
          
          if (challengedUser) {
            challenged = {
              username: challengedUser.username,
              profilePhoto: challengedUser.profilePhoto
            };
          }
        }

        // Get current crypto price
        const currentPrice = await this.getCurrentCryptoPrice(battle.cryptocurrency);
        
        return {
          ...battle,
          challenger: {
            username: battle.challengerUsername,
            profilePhoto: battle.challengerPhoto
          },
          challenged,
          currentPrice,
          timeLeft: Math.max(0, new Date(battle.targetTime).getTime() - Date.now())
        };
      })
    );

    return battlesWithChallenged;
  }

  async getBattleHistory(): Promise<any[]> {
    // Get completed battles with user info
    const battles = await db
      .select({
        id: predictionBattles.id,
        challengerId: predictionBattles.challengerId,
        challengedId: predictionBattles.challengedId,
        cryptocurrency: predictionBattles.cryptocurrency,
        timeframe: predictionBattles.timeframe,
        stakeAmount: predictionBattles.stakeAmount,
        challengerPrediction: predictionBattles.challengerPrediction,
        challengedPrediction: predictionBattles.challengedPrediction,
        status: predictionBattles.status,
        targetTime: predictionBattles.targetTime,
        actualPrice: predictionBattles.actualPrice,
        winnerId: predictionBattles.winnerId,
        winnerReward: predictionBattles.winnerReward,
        createdAt: predictionBattles.createdAt,
        challengerUsername: users.username,
        challengerPhoto: users.profilePhoto
      })
      .from(predictionBattles)
      .leftJoin(users, eq(predictionBattles.challengerId, users.id))
      .where(eq(predictionBattles.status, 'completed'))
      .orderBy(desc(predictionBattles.createdAt))
      .limit(50); // Limit to 50 most recent battles

    // Get challenged user and winner info
    const battlesWithDetails = await Promise.all(
      battles.map(async (battle) => {
        let challenged = null;
        let winner = null;

        if (battle.challengedId) {
          const [challengedUser] = await db
            .select({
              username: users.username,
              profilePhoto: users.profilePhoto
            })
            .from(users)
            .where(eq(users.id, battle.challengedId));
          
          if (challengedUser) {
            challenged = {
              username: challengedUser.username,
              profilePhoto: challengedUser.profilePhoto
            };
          }
        }

        if (battle.winnerId) {
          const [winnerUser] = await db
            .select({
              username: users.username,
              profilePhoto: users.profilePhoto
            })
            .from(users)
            .where(eq(users.id, battle.winnerId));
          
          if (winnerUser) {
            winner = {
              username: winnerUser.username,
              profilePhoto: winnerUser.profilePhoto
            };
          }
        }
        
        return {
          ...battle,
          challenger: {
            username: battle.challengerUsername,
            profilePhoto: battle.challengerPhoto
          },
          challenged,
          winner
        };
      })
    );

    return battlesWithDetails;
  }

  async getBattle(id: number): Promise<any> {
    const [battle] = await db.select().from(predictionBattles).where(eq(predictionBattles.id, id));
    return battle || undefined;
  }

  async getAllBattles(filters: any = {}): Promise<any[]> {
    let query = db
      .select({
        id: predictionBattles.id,
        challengerId: predictionBattles.challengerId,
        challengedId: predictionBattles.challengedId,
        cryptocurrency: predictionBattles.cryptocurrency,
        timeframe: predictionBattles.timeframe,
        stakeAmount: predictionBattles.stakeAmount,
        challengerPrediction: predictionBattles.challengerPrediction,
        challengedPrediction: predictionBattles.challengedPrediction,
        status: predictionBattles.status,
        targetTime: predictionBattles.targetTime,
        createdAt: predictionBattles.createdAt,
        spectatorCount: predictionBattles.spectatorCount,
        battleType: predictionBattles.battleType,
        isPublic: predictionBattles.isPublic,
        challengerUsername: users.username
      })
      .from(predictionBattles)
      .leftJoin(users, eq(predictionBattles.challengerId, users.id));

    // Apply filters
    const conditions = [];
    if (filters.status && filters.status !== 'all') {
      conditions.push(eq(predictionBattles.status, filters.status));
    }
    if (filters.cryptocurrency && filters.cryptocurrency !== 'all') {
      conditions.push(eq(predictionBattles.cryptocurrency, filters.cryptocurrency));
    }
    if (filters.startDate) {
      conditions.push(gte(predictionBattles.createdAt, new Date(filters.startDate)));
    }
    if (filters.endDate) {
      conditions.push(lte(predictionBattles.createdAt, new Date(filters.endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const battles = await query.orderBy(desc(predictionBattles.createdAt));

    // Get challenged user info for battles that have challengedId
    const battlesWithUsers = await Promise.all(
      battles.map(async (battle) => {
        let challengedUsername = null;
        if (battle.challengedId) {
          const [challengedUser] = await db
            .select({ username: users.username })
            .from(users)
            .where(eq(users.id, battle.challengedId));
          
          if (challengedUser) {
            challengedUsername = challengedUser.username;
          }
        }

        return {
          ...battle,
          challengedUsername,
          timeLeft: Math.max(0, new Date(battle.targetTime).getTime() - Date.now())
        };
      })
    );

    return battlesWithUsers;
  }

  async getBattleById(id: number): Promise<any> {
    const [battle] = await db
      .select()
      .from(predictionBattles)
      .where(eq(predictionBattles.id, id));
    return battle;
  }

  async deleteBattle(id: number): Promise<void> {
    await db
      .delete(predictionBattles)
      .where(eq(predictionBattles.id, id));
  }

  async getAdminBattles(filters: any, dateFilters: any, pagination: any): Promise<any[]> {
    let query = db
      .select({
        id: predictionBattles.id,
        challengerId: predictionBattles.challengerId,
        challengedId: predictionBattles.challengedId,
        cryptocurrency: predictionBattles.cryptocurrency,
        challengerPrediction: predictionBattles.challengerPrediction,
        challengedPrediction: predictionBattles.challengedPrediction,
        stakeAmount: predictionBattles.stakeAmount,
        targetTime: predictionBattles.targetTime,
        status: predictionBattles.status,
        winnerId: predictionBattles.winnerId,
        createdAt: predictionBattles.createdAt,
        challengerUsername: users.username,
        challengerUid: users.uid,
      })
      .from(predictionBattles)
      .leftJoin(users, eq(predictionBattles.challengerId, users.id));

    // Apply filters
    const conditions = [];
    if (filters.status) {
      conditions.push(eq(predictionBattles.status, filters.status));
    }
    if (filters.cryptocurrency) {
      conditions.push(eq(predictionBattles.cryptocurrency, filters.cryptocurrency));
    }
    if (dateFilters.startDate) {
      conditions.push(gte(predictionBattles.createdAt, new Date(dateFilters.startDate)));
    }
    if (dateFilters.endDate) {
      conditions.push(lte(predictionBattles.createdAt, new Date(dateFilters.endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const battles = await query
      .orderBy(desc(predictionBattles.createdAt))
      .limit(pagination.limit)
      .offset((pagination.page - 1) * pagination.limit);

    // Get challenged user information
    const battlesWithUsers = await Promise.all(
      battles.map(async (battle) => {
        let challengedUsername = null;
        let challengedUid = null;

        if (battle.challengedId) {
          const [challengedUser] = await db
            .select({ username: users.username, uid: users.uid })
            .from(users)
            .where(eq(users.id, battle.challengedId));
          
          if (challengedUser) {
            challengedUsername = challengedUser.username;
            challengedUid = challengedUser.uid;
          }
        }

        return {
          ...battle,
          challengedUsername,
          challengedUid,
          duration: Math.round((new Date(battle.targetTime).getTime() - new Date(battle.createdAt).getTime()) / (1000 * 60)),
          timeRemaining: Math.max(0, new Date(battle.targetTime).getTime() - Date.now())
        };
      })
    );

    return battlesWithUsers;
  }

  async addToUserBalance(userId: number, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        balance: sql`${users.balance} + ${amount}`
      })
      .where(eq(users.id, userId));
  }

  async getUserBattles(userId: number): Promise<any[]> {
    const battles = await db
      .select()
      .from(predictionBattles)
      .where(or(
        eq(predictionBattles.challengerId, userId),
        eq(predictionBattles.challengedId, userId)
      ))
      .orderBy(desc(predictionBattles.createdAt));

    // Get user information for battles
    const battlesWithUsers = await Promise.all(
      battles.map(async (battle) => {
        let challengerUsername = null;
        let challengedUsername = null;

        // Get challenger info
        const [challenger] = await db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, battle.challengerId));
        
        if (challenger) {
          challengerUsername = challenger.username;
        }

        // Get challenged user info
        if (battle.challengedId) {
          const [challenged] = await db
            .select({ username: users.username })
            .from(users)
            .where(eq(users.id, battle.challengedId));
          
          if (challenged) {
            challengedUsername = challenged.username;
          }
        }

        return {
          ...battle,
          challengerUsername,
          challengedUsername,
          timeLeft: Math.max(0, new Date(battle.targetTime).getTime() - Date.now()),
          isUserChallenger: battle.challengerId === userId
        };
      })
    );

    return battlesWithUsers;
  }

  async getBattleStats(): Promise<any> {
    const battles = await db.select().from(predictionBattles);
    
    const totalBattles = battles.length;
    const activeBattles = battles.filter(b => b.status === 'active').length;
    const completedBattles = battles.filter(b => b.status === 'completed').length;
    const openBattles = battles.filter(b => b.status === 'open').length;

    const totalStaked = battles.reduce((sum, battle) => sum + (parseFloat(battle.stakeAmount?.toString() || '0') * 2), 0);
    
    // Calculate average battle duration
    const completedBattlesWithDuration = battles.filter(b => b.status === 'completed' && b.targetTime && b.createdAt);
    const avgDuration = completedBattlesWithDuration.length > 0 
      ? completedBattlesWithDuration.reduce((sum, battle) => {
          const duration = new Date(battle.targetTime).getTime() - new Date(battle.createdAt).getTime();
          return sum + duration;
        }, 0) / completedBattlesWithDuration.length
      : 0;

    return {
      totalBattles,
      activeBattles,
      completedBattles,
      openBattles,
      totalStaked,
      avgDurationHours: Math.round(avgDuration / (1000 * 60 * 60) * 10) / 10
    };
  }

  async joinBattle(battleId: number, userId: number, prediction: number): Promise<any> {
    const battle = await this.getBattle(battleId);
    if (!battle) {
      throw new Error('Battle tidak ditemukan');
    }

    const now = new Date();
    const createdAt = new Date(battle.createdAt);
    const targetTime = new Date(battle.targetTime);
    
    // Calculate 80% join deadline if not set
    const battleDuration = targetTime.getTime() - createdAt.getTime();
    const joinDeadline = battle.joinDeadline ? 
      new Date(battle.joinDeadline) : 
      new Date(createdAt.getTime() + (battleDuration * 0.8));
    
    const minimumJoinTime = battle.minimumJoinTime || 30; // 30 detik default untuk user experience yang lebih baik

    // Check 1: Apakah masih dalam batas waktu join
    if (now > joinDeadline) {
      throw new Error('Waktu untuk bergabung telah berakhir. Anda hanya dapat bergabung dalam 80% dari durasi battle.');
    }

    // Check 2: Apakah sudah melewati minimum join time
    const timeSinceCreation = (now.getTime() - createdAt.getTime()) / 1000; // dalam detik
    if (timeSinceCreation < minimumJoinTime) {
      const remainingTime = Math.ceil((minimumJoinTime - timeSinceCreation));
      if (remainingTime > 60) {
        const remainingMinutes = Math.ceil(remainingTime / 60);
        throw new Error(`Anda harus menunggu ${remainingMinutes} menit lagi sebelum dapat bergabung untuk mencegah strategi unfair.`);
      } else {
        throw new Error(`Anda harus menunggu ${remainingTime} detik lagi sebelum dapat bergabung untuk mencegah strategi unfair.`);
      }
    }

    // Calculate fairness multipliers
    const currentPrice = await this.getCurrentCryptoPrice(battle.cryptocurrency);
    const priceAtCreation = battle.priceAtCreation ? parseFloat(battle.priceAtCreation.toString()) : currentPrice;
    const priceMovement = Math.abs((currentPrice - priceAtCreation) / priceAtCreation * 100);

    // Price movement penalty: jika harga bergerak > 2%, ada penalti
    let fairnessMultiplier = 1.0;
    if (battle.priceMovementPenalty && priceMovement > 2) {
      fairnessMultiplier = Math.max(0.5, 1 - (priceMovement - 2) * 0.1); // Reduce multiplier berdasarkan movement
    }

    // Join time bonus: bergabung lebih awal mendapat bonus
    const totalBattleTime = (joinDeadline.getTime() - createdAt.getTime()) / 1000;
    const joinTimePercentage = timeSinceCreation / totalBattleTime;
    let joinTimeBonus = 1.0;
    
    if (joinTimePercentage < 0.3) {
      joinTimeBonus = 1.2; // 20% bonus untuk join dalam 30% pertama
    } else if (joinTimePercentage < 0.5) {
      joinTimeBonus = 1.1; // 10% bonus untuk join dalam 50% pertama
    }

    // Update battle dengan challenged user dan fairness calculations
    const [updatedBattle] = await db
      .update(predictionBattles)
      .set({
        challengedId: userId,
        challengedPrediction: prediction.toString(),
        status: 'active',
        acceptedAt: now,
        fairnessMultiplier: fairnessMultiplier.toFixed(2),
        joinTimeBonus: joinTimeBonus.toFixed(2)
      })
      .where(eq(predictionBattles.id, battleId))
      .returning();

    return {
      ...updatedBattle,
      joinFairness: {
        priceMovement: priceMovement.toFixed(2),
        fairnessMultiplier: fairnessMultiplier.toFixed(2),
        joinTimeBonus: joinTimeBonus.toFixed(2),
        joinTimePercentage: (joinTimePercentage * 100).toFixed(1)
      }
    };
  }



  async logTransaction(transaction: any): Promise<void> {
    try {
      await db.insert(transactionLogs).values({
        amount: transaction.amount || 0,
        token: transaction.token || 'NTIQ',
        type: transaction.type || 'battle',
        description: transaction.description || '',
        status: transaction.status || 'completed',
        fromAddress: transaction.fromAddress || null,
        toAddress: transaction.toAddress || null,
        txHash: transaction.txHash || null,
        networkFee: transaction.networkFee || null,
        relatedId: transaction.relatedId || null
      });
    } catch (error) {
      console.error('Error logging transaction:', error);
    }
  }

  async updateBattle(id: number, updates: any): Promise<void> {
    await db
      .update(predictionBattles)
      .set(updates)
      .where(eq(predictionBattles.id, id));
  }

  async createBattleComment(commentData: any): Promise<any> {
    const [comment] = await db
      .insert(battleComments)
      .values(commentData)
      .returning();
    return comment;
  }

  async getBattleComments(battleId: number): Promise<any[]> {
    return await db
      .select()
      .from(battleComments)
      .where(eq(battleComments.battleId, battleId))
      .orderBy(desc(battleComments.createdAt));
  }

  async updateUser(id: number, updates: any): Promise<void> {
    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id));
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private predictions: Map<number, Prediction>;
  private cryptocurrencies: Map<string, Cryptocurrency>;
  private rewards: Map<number, Reward>;
  private withdrawals: Map<number, Withdrawal>;
  private purchases: Map<number, Purchase>;
  private currentUserId: number;
  private currentPredictionId: number;
  private currentRewardId: number;
  private currentWithdrawalId: number;
  private currentPurchaseId: number;

  constructor() {
    this.users = new Map();
    this.predictions = new Map();
    this.cryptocurrencies = new Map();
    this.rewards = new Map();
    this.withdrawals = new Map();
    this.purchases = new Map();
    this.currentUserId = 1;
    this.currentPredictionId = 1;
    this.currentRewardId = 1;
    this.currentWithdrawalId = 1;
    this.currentPurchaseId = 1;

    // Create default users with some test data
    this.createUser({ username: "demo", password: "demo" });
    this.createUser({ username: "alice", password: "alice123" });
    this.createUser({ username: "bob", password: "bob123" });
    this.createUser({ username: "charlie", password: "charlie123" });

    // Add some test predictions and stats for demo purposes
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Update some users with sample stats
    await this.updateUserStats(2, 15, 12, 850); // Alice - high accuracy
    await this.updateUserStats(3, 8, 5, 320);   // Bob - medium accuracy
    await this.updateUserStats(4, 22, 14, 1200); // Charlie - most active
    await this.updateUserBalance(2, 1850);
    await this.updateUserBalance(3, 820);
    await this.updateUserBalance(4, 2200);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const uid = generateUID();
    const user: User = { 
      id,
      uid,
      username: insertUser.username,
      password: insertUser.password || null,
      walletAddress: insertUser.walletAddress || null,
      authMethod: insertUser.authMethod || "password",
      isAdmin: insertUser.isAdmin || false,
      balance: 1000,
      totalPredictions: 0,
      correctPredictions: 0,
      totalRewards: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, balance: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, balance });
    }
  }

  async updateUserStats(id: number, totalPredictions: number, correctPredictions: number, totalRewards: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, totalPredictions, correctPredictions, totalRewards });
    }
  }

  async createPrediction(predictionData: any): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const prediction: Prediction = {
      id,
      userId: predictionData.userId,
      cryptocurrency: predictionData.cryptocurrency,
      predictedPrice: predictionData.predictedPrice,
      actualPrice: null,
      stakeAmount: predictionData.stakeAmount,
      timeframe: predictionData.timeframe,
      targetTime: predictionData.targetTime,
      createdAt: new Date(),
      completedAt: null,
      status: "pending",
      rewardAmount: null,
      accuracy: null,
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async getPrediction(id: number): Promise<Prediction | undefined> {
    return this.predictions.get(id);
  }

  async getUserPredictions(userId: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(prediction => prediction.userId === userId);
  }

  async getActivePredictions(): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(prediction => prediction.status === "pending");
  }

  async updatePredictionResult(id: number, actualPrice: string, accuracy: string, rewardAmount: number, status: string): Promise<void> {
    const prediction = this.predictions.get(id);
    if (prediction) {
      this.predictions.set(id, {
        ...prediction,
        actualPrice,
        accuracy,
        rewardAmount,
        status,
        completedAt: new Date(),
      });
    }
  }

  async getRecentPredictions(limit: number = 10): Promise<Prediction[]> {
    return Array.from(this.predictions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getCryptocurrency(id: string): Promise<Cryptocurrency | undefined> {
    return this.cryptocurrencies.get(id);
  }

  async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptocurrencies.values());
  }

  async upsertCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency> {
    const cryptocurrency: Cryptocurrency = {
      ...crypto,
      lastUpdated: new Date(),
    };
    this.cryptocurrencies.set(crypto.id, cryptocurrency);
    return cryptocurrency;
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = this.currentRewardId++;
    const reward: Reward = {
      ...insertReward,
      id,
      createdAt: new Date(),
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async getUserRewards(userId: number): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(reward => reward.userId === userId);
  }

  async getRecentRewards(userId: number, limit: number = 10): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter(reward => reward.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getTopPredictors(limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.totalPredictions > 0)
      .sort((a, b) => {
        const accuracyA = a.totalPredictions > 0 ? (a.correctPredictions / a.totalPredictions) : 0;
        const accuracyB = b.totalPredictions > 0 ? (b.correctPredictions / b.totalPredictions) : 0;
        return accuracyB - accuracyA;
      })
      .slice(0, limit);
  }

  async resetLeaderboard(): Promise<void> {
    // Reset all user statistics to zero
    for (const user of this.users.values()) {
      user.totalPredictions = 0;
      user.correctPredictions = 0;
      user.totalRewards = 0;
    }
  }

  async deleteCryptocurrency(id: string): Promise<void> {
    this.cryptocurrencies.delete(id);
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const withdrawal: Withdrawal = {
      id: this.currentWithdrawalId++,
      ...insertWithdrawal,
      status: insertWithdrawal.status || "completed",
      createdAt: new Date(),
    };
    this.withdrawals.set(withdrawal.id, withdrawal);
    return withdrawal;
  }

  async getUserWithdrawals(userId: number, limit: number = 10): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values())
      .filter(w => w.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const purchase: Purchase = {
      id: this.currentPurchaseId++,
      userId: insertPurchase.userId,
      ptsAmount: insertPurchase.ptsAmount,
      paymentAmount: insertPurchase.paymentAmount,
      paymentToken: insertPurchase.paymentToken,
      transactionHash: insertPurchase.transactionHash || null,
      status: insertPurchase.status || "completed",
      createdAt: new Date(),
    };
    this.purchases.set(purchase.id, purchase);
    return purchase;
  }

  async getUserPurchases(userId: number, limit: number = 10): Promise<Purchase[]> {
    return Array.from(this.purchases.values())
      .filter(purchase => purchase.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async deleteUser(id: number): Promise<void> {
    // Delete user's predictions
    const userPredictions = Array.from(this.predictions.values()).filter(p => p.userId === id);
    userPredictions.forEach(p => this.predictions.delete(p.id));
    
    // Delete user's rewards  
    const userRewards = Array.from(this.rewards.values()).filter(r => r.userId === id);
    userRewards.forEach(r => this.rewards.delete(r.id));
    
    // Delete user's withdrawals
    const userWithdrawals = Array.from(this.withdrawals.values()).filter(w => w.userId === id);
    userWithdrawals.forEach(w => this.withdrawals.delete(w.id));
    
    // Delete user's purchases
    const userPurchases = Array.from(this.purchases.values()).filter(p => p.userId === id);
    userPurchases.forEach(p => this.purchases.delete(p.id));
    
    // Delete the user
    this.users.delete(id);
  }
}

export const storage = new DatabaseStorage();
