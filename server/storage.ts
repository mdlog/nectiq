import { users, predictions, cryptocurrencies, rewards, withdrawals, purchases, deposits, securityEvents, adminLogs, transactionLogs, systemSettings, banners, events, predictionBattles, battleComments, battleReactions, battleSpectators, survivalTournaments, survivalParticipants, survivalRounds, survivalPredictions, userAchievements, userDailyChallenges, userAnalytics, walletFingerprints, abuseDetections, cryptoTransactions, referrals, monthlyTierRewards, tierPromotions, predictionReactions, predictionComments, userVerifications, type User, type InsertUser, type Prediction, type InsertPrediction, type Cryptocurrency, type InsertCryptocurrency, type Reward, type InsertReward, type Withdrawal, type InsertWithdrawal, type Purchase, type InsertPurchase, type Banner, type InsertBanner, type Event, type InsertEvent, type PredictionBattle, type InsertPredictionBattle, type BattleComment, type InsertBattleComment, type SurvivalTournament, type InsertSurvivalTournament, type SurvivalParticipant, type InsertSurvivalParticipant, type SurvivalRound, type InsertSurvivalRound, type SurvivalPrediction, type InsertSurvivalPrediction } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, gte, lte, like, or, isNull, inArray, sql, lt, ne } from "drizzle-orm";
import { BalanceService } from "./services/balanceService.js";

// Utility function to normalize wallet addresses (lowercase for consistency)
function normalizeWalletAddress(address: string): string {
  if (!address) return address;
  return address.toLowerCase().trim();
}

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
  getAllUsers(): Promise<User[]>;
  getTopPredictors(limit?: number): Promise<User[]>;
  getEnhancedLeaderboard(limit?: number): Promise<any[]>;

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
  getComprehensiveRewards(userId: number, limit?: number): Promise<any[]>;

  // Leaderboard operations
  getTopPredictors(limit?: number): Promise<User[]>;
  resetLeaderboard(): Promise<void>;

  // Multi-chain Deposit operations
  createDeposit(deposit: any): Promise<any>;
  getUserDeposits(userId: number, limit?: number): Promise<any[]>;
  getDepositsByStatus(status: string): Promise<any[]>;
  updateDepositStatus(id: number, status: string, transactionHash?: string, blockNumber?: number): Promise<void>;
  getDepositByTransactionHash(hash: string): Promise<any>;
  getUserById(id: number): Promise<User | undefined>;

  // Multi-chain Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getUserWithdrawals(userId: number, limit?: number): Promise<Withdrawal[]>;
  updateWithdrawalStatus(id: number, status: string, transactionHash?: string, adminNote?: string, processedBy?: number): Promise<void>;

  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getUserPurchases(userId: number, limit?: number): Promise<Purchase[]>;

  // Crypto transaction operations  
  createCryptoTransaction(transaction: any): Promise<any>;
  getTransactionByHash(hash: string): Promise<any>;
  getUserCryptoTransactions(userId: number, limit?: number): Promise<any[]>;

  // User management operations
  deleteUser(id: number): Promise<void>;
  
  // Email and Twitter verification operations
  updateUserVerification(id: number, email?: string, twitterHandle?: string): Promise<User>;
  verifyUserEmail(id: number): Promise<User>;
  verifyUserTwitter(id: number): Promise<User>;
  checkEmailExists(email: string, excludeUserId?: number): Promise<boolean>;
  checkTwitterExists(twitterHandle: string, excludeUserId?: number): Promise<boolean>;
  getUsersByEmailOrTwitter(email?: string, twitterHandle?: string): Promise<User[]>;

  // Security event operations
  createSecurityEvent(event: any): Promise<any>;
  getSecurityEvents(filters?: any): Promise<any[]>;
  updateSecurityEvent(id: number, updates: any): Promise<void>;
  getSecurityStats(): Promise<any>;

  // Admin log operations
  createAdminLog(log: any): Promise<any>;
  getAdminLogs(filters?: any): Promise<any[]>;

  // Platform statistics operations
  getPlatformStats(): Promise<any>;

  // Transaction log operations
  createTransactionLog(transaction: any): Promise<any>;
  getTransactionLogs(filters?: any): Promise<any[]>;
  getTransactionStats(): Promise<any>;
  
  // Crypto transaction operations
  createCryptoTransaction(transaction: any): Promise<any>;

  // System settings operations
  getSystemSettings(): Promise<any>;
  getSystemSetting(category: string, key: string): Promise<string | null>;
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

  // Referral operations
  createReferral(referrerId: number, referredId: number, referralCode: string): Promise<void>;
  getReferralData(userId: number): Promise<any>;
  generateReferralCode(userId: number): Promise<string>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getReferralStats(userId: number): Promise<any>;

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
  clearAllBattles(): Promise<number>;

  // Survival Tournament operations
  createSurvivalTournament(tournament: any): Promise<any>;
  getAllSurvivalTournaments(): Promise<any[]>;
  getSurvivalTournament(id: number): Promise<any>;
  joinSurvivalTournament(tournamentId: number, userId: number): Promise<any>;
  startSurvivalTournament(tournamentId: number): Promise<void>;
  createSurvivalRound(round: any): Promise<any>;
  submitSurvivalPrediction(prediction: any): Promise<any>;
  processSurvivalRound(roundId: number): Promise<void>;
  eliminateParticipants(roundId: number, incorrectPredictions: number[]): Promise<void>;
  getSurvivalParticipants(tournamentId: number): Promise<any[]>;
  getSurvivalRounds(tournamentId: number): Promise<any[]>;
  getSurvivalPredictions(roundId: number): Promise<any[]>;
  updateSurvivalTournament(id: number, updates: any): Promise<void>;
  deleteSurvivalTournament(id: number): Promise<void>;
  getUserSurvivalStatus(userId: number): Promise<any>;

  // Live Activity operations
  getLiveActivities(limit?: number): Promise<any[]>;
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
    const normalizedAddress = normalizeWalletAddress(walletAddress);
    const [user] = await db.select().from(users).where(eq(users.walletAddress, normalizedAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const uid = await generateUniqueUID();
    
    // Normalize wallet address before insertion
    const normalizedUser = {
      ...insertUser,
      uid,
      walletAddress: insertUser.walletAddress ? normalizeWalletAddress(insertUser.walletAddress) : null
    };
    
    const [user] = await db
      .insert(users)
      .values(normalizedUser)
      .returning();
    return user;
  }

  async updateUserBalance(id: number, balance: number): Promise<void> {
    console.log(`🔧 [BALANCE UPDATE] Updating user ${id} balance to ${balance}`);
    const result = await db
      .update(users)
      .set({ balance })
      .where(eq(users.id, id));
    console.log(`✅ [BALANCE UPDATE] Database update completed for user ${id}, new balance: ${balance}`);
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

  async updateUserVerification(userId: number, email?: string, twitterHandle?: string): Promise<User> {
    const updates: any = {};
    if (email !== undefined) {
      updates.email = email;
      updates.emailVerified = false;
    }
    if (twitterHandle !== undefined) {
      updates.twitterHandle = twitterHandle;
      updates.twitterVerified = false;
    }
    
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async verifyUserEmail(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async verifyUserTwitter(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ twitterVerified: true })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async checkEmailExists(email: string, excludeUserId?: number): Promise<boolean> {
    const conditions = [eq(users.email, email)];
    if (excludeUserId) {
      conditions.push(ne(users.id, excludeUserId));
    }
    const result = await db.select().from(users).where(and(...conditions));
    return result.length > 0;
  }

  async checkTwitterExists(twitterHandle: string, excludeUserId?: number): Promise<boolean> {
    const conditions = [eq(users.twitterHandle, twitterHandle)];
    if (excludeUserId) {
      conditions.push(ne(users.id, excludeUserId));
    }
    const result = await db.select().from(users).where(and(...conditions));
    return result.length > 0;
  }

  async getUsersByEmailOrTwitter(email?: string, twitterHandle?: string): Promise<User[]> {
    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (twitterHandle) conditions.push(eq(users.twitterHandle, twitterHandle));
    
    if (conditions.length === 0) return [];
    
    return await db.select().from(users).where(or(...conditions));
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
    return await db.select({
      id: predictions.id,
      userId: predictions.userId,
      cryptocurrency: predictions.cryptocurrency,
      predictedPrice: predictions.predictedPrice,
      actualPrice: predictions.actualPrice,
      stakeAmount: predictions.stakeAmount,
      timeframe: predictions.timeframe,
      targetTime: predictions.targetTime,
      createdAt: predictions.createdAt,
      completedAt: predictions.completedAt,
      status: predictions.status,
      rewardAmount: predictions.rewardAmount,
      accuracy: predictions.accuracy,
      // Include user details
      userUid: users.uid,
      username: users.username,
      walletAddress: users.walletAddress
    })
    .from(predictions)
    .leftJoin(users, eq(predictions.userId, users.id))
    .orderBy(desc(predictions.createdAt));
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

  // Create reward entry for prediction outcome (win or loss)
  async createPredictionReward(userId: number, predictionId: number, amount: number, cryptocurrency: string, accuracy: string): Promise<void> {
    try {
      const isWin = amount > 0;
      const description = isWin 
        ? `${cryptocurrency.toUpperCase()} prediction win (${accuracy}% accuracy)`
        : `${cryptocurrency.toUpperCase()} prediction loss`;

      await db.insert(rewards).values({
        userId,
        predictionId,
        amount,
        cryptocurrency,
        accuracy,
        description,
      });

      console.log(`Created reward entry: User ${userId}, Amount ${amount} NTIQ, ${isWin ? 'WIN' : 'LOSS'}`);
    } catch (error) {
      console.error('Error creating prediction reward:', error);
    }
  }

  async getUserRewards(userId: number): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.userId, userId)).orderBy(desc(rewards.createdAt));
  }

  async getRecentRewards(userId: number, limit: number = 10): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.userId, userId)).orderBy(desc(rewards.createdAt)).limit(limit);
  }

  async getRecentPredictionResults(userId: number, limit: number = 10): Promise<any[]> {
    const results = await db.select({
      id: predictions.id,
      cryptocurrency: predictions.cryptocurrency,
      predictedPrice: predictions.predictedPrice,
      actualPrice: predictions.actualPrice,
      stakeAmount: predictions.stakeAmount,
      rewardAmount: predictions.rewardAmount,
      accuracy: predictions.accuracy,
      status: predictions.status,
      completedAt: predictions.completedAt,
      createdAt: predictions.createdAt
    })
    .from(predictions)
    .where(and(
      eq(predictions.userId, userId),
      eq(predictions.status, 'completed')
    ))
    .orderBy(desc(predictions.completedAt))
    .limit(limit);

    return results;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select({
      id: users.id,
      uid: users.uid,
      username: users.username,
      password: users.password,
      walletAddress: users.walletAddress,
      authMethod: users.authMethod,
      isAdmin: users.isAdmin,
      balance: users.balance,
      totalPredictions: users.totalPredictions,
      correctPredictions: users.correctPredictions,
      totalRewards: users.totalRewards,
      profilePhoto: users.profilePhoto,
      email: users.email,
      twitterHandle: users.twitterHandle,
      emailVerified: users.emailVerified,
      twitterVerified: users.twitterVerified
    }).from(users).orderBy(desc(users.totalRewards));
  }

  async getTopPredictors(limit: number = 10): Promise<User[]> {
    return await db.select({
      id: users.id,
      uid: users.uid,
      username: users.username,
      password: users.password,
      walletAddress: users.walletAddress,
      authMethod: users.authMethod,
      isAdmin: users.isAdmin,
      balance: users.balance,
      totalPredictions: users.totalPredictions,
      correctPredictions: users.correctPredictions,
      totalRewards: users.totalRewards,
      profilePhoto: users.profilePhoto,
      email: users.email,
      twitterHandle: users.twitterHandle,
      emailVerified: users.emailVerified,
      twitterVerified: users.twitterVerified
    }).from(users).where(eq(users.isAdmin, false)).orderBy(desc(users.totalRewards)).limit(limit);
  }

  async getEnhancedLeaderboard(limit: number = 10): Promise<any[]> {
    // Get users with basic data
    const usersData = await db.select({
      id: users.id,
      uid: users.uid,
      username: users.username,
      totalPredictions: users.totalPredictions,
      correctPredictions: users.correctPredictions,
      totalRewards: users.totalRewards,
      profilePhoto: users.profilePhoto,
    }).from(users).where(eq(users.isAdmin, false));

    // Enhance with battle and survival data
    const enhancedUsers = await Promise.all(usersData.map(async (user) => {
      // Get battle statistics
      const battleStatsQuery = await db.select({
        totalBattles: sql<number>`COUNT(*)`,
        wonBattles: sql<number>`SUM(CASE WHEN ${predictionBattles.winnerId} = ${user.id} THEN 1 ELSE 0 END)`
      }).from(predictionBattles)
      .where(
        and(
          or(
            eq(predictionBattles.challengerId, user.id),
            eq(predictionBattles.challengedId, user.id)
          ),
          eq(predictionBattles.status, 'completed')
        )
      );

      // Get battle rewards from transaction_logs instead of battles table
      const battleRewardsQuery = await db.select({
        battleRewards: sql<number>`COALESCE(SUM(${transactionLogs.amount}), 0)`
      }).from(transactionLogs)
      .where(
        and(
          eq(transactionLogs.userId, user.id),
          eq(transactionLogs.type, 'battle_reward'),
          eq(transactionLogs.status, 'completed')
        )
      );

      const battleStats = battleStatsQuery[0] || {
        totalBattles: 0,
        wonBattles: 0
      };

      const battleRewardsStats = battleRewardsQuery[0] || {
        battleRewards: 0
      };

      // Get survival tournament statistics
      const survivalStatsQuery = await db.select({
        totalTournaments: sql<number>`COUNT(DISTINCT ${survivalParticipants.tournamentId})`,
        wonTournaments: sql<number>`COUNT(DISTINCT CASE WHEN ${survivalTournaments.winnerId} = ${user.id} THEN ${survivalParticipants.tournamentId} END)`,
        survivalRewards: sql<number>`SUM(CASE WHEN ${survivalTournaments.winnerId} = ${user.id} THEN ${survivalTournaments.prizePool} ELSE 0 END)`
      }).from(survivalParticipants)
      .leftJoin(survivalTournaments, eq(survivalParticipants.tournamentId, survivalTournaments.id))
      .where(eq(survivalParticipants.userId, user.id));

      const survivalStats = survivalStatsQuery[0] || {
        totalTournaments: 0,
        wonTournaments: 0,
        survivalRewards: 0
      };

      // Calculate win rates
      const predictionWinRate = user.totalPredictions > 0 ? 
        (user.correctPredictions / user.totalPredictions) * 100 : 0;
      const battleWinRate = battleStats.totalBattles > 0 ? 
        (battleStats.wonBattles / battleStats.totalBattles) * 100 : 0;

      return {
        ...user,
        winRate: predictionWinRate,
        // Battle stats
        totalBattles: battleStats.totalBattles,
        wonBattles: battleStats.wonBattles,
        battleWinRate: battleWinRate,
        battleRewards: battleRewardsStats.battleRewards || 0,
        // Survival stats
        totalSurvivalTournaments: survivalStats.totalTournaments,
        wonSurvivalTournaments: survivalStats.wonTournaments,
        survivalRewards: survivalStats.survivalRewards || 0,
        // Combined rewards (this should match totalRewards but let's calculate to be sure)
        combinedRewards: user.totalRewards
      };
    }));

    // Sort by total rewards and apply limit
    return enhancedUsers
      .sort((a, b) => b.totalRewards - a.totalRewards)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  }

  async resetLeaderboard(): Promise<void> {
    // Reset all user statistics to zero
    await db.update(users).set({
      totalPredictions: 0,
      correctPredictions: 0,
      totalRewards: 0,
    });
  }

  // Multi-chain Deposit operations  
  async createDeposit(deposit: any): Promise<any> {
    const [newDeposit] = await db.insert(deposits).values(deposit).returning();
    return newDeposit;
  }

  async getUserDeposits(userId: number, limit: number = 10): Promise<any[]> {
    return await db.select()
      .from(deposits)
      .where(eq(deposits.userId, userId))
      .orderBy(desc(deposits.createdAt))
      .limit(limit);
  }

  async updateDepositStatus(id: number, status: string, transactionHash?: string, blockNumber?: number): Promise<void> {
    const updateData: any = { status };
    if (transactionHash) updateData.transactionHash = transactionHash;
    if (blockNumber) updateData.blockNumber = blockNumber;
    if (status === 'confirmed') updateData.processedAt = new Date();

    await db.update(deposits)
      .set(updateData)
      .where(eq(deposits.id, id));
  }

  async getDepositByTransactionHash(hash: string): Promise<any> {
    const result = await db.select()
      .from(deposits)
      .where(eq(deposits.transactionHash, hash))
      .limit(1);
    return result[0];
  }

  async getDepositsByStatus(status: string): Promise<any[]> {
    return await db.select()
      .from(deposits)
      .where(eq(deposits.status, status))
      .orderBy(desc(deposits.createdAt));
  }

  // New methods for deposit expiration handling
  async getExpiredDeposits(): Promise<any[]> {
    const now = new Date();
    return await db.select()
      .from(deposits)
      .where(
        and(
          eq(deposits.status, 'pending'),
          sql`${deposits.expiresAt} < ${now.toISOString()}`
        )
      );
  }

  async cancelExpiredDeposit(id: number): Promise<void> {
    await db.update(deposits)
      .set({ 
        status: 'cancelled',
        processedAt: new Date()
      })
      .where(eq(deposits.id, id));
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  // Multi-chain Withdrawal operations
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

  async updateWithdrawalStatus(id: number, status: string, transactionHash?: string, adminNote?: string, processedBy?: number): Promise<void> {
    const updateData: any = { status };
    if (transactionHash) updateData.transactionHash = transactionHash;
    if (adminNote) updateData.adminNote = adminNote;
    if (processedBy) updateData.processedBy = processedBy;
    if (status === 'completed' || status === 'approved' || status === 'rejected') {
      updateData.processedAt = new Date();
    }

    await db.update(withdrawals)
      .set(updateData)
      .where(eq(withdrawals.id, id));
  }

  // Admin withdrawal approval methods
  async updateWithdrawalStatus(withdrawalId: number, status: string, adminId: number, adminNote?: string): Promise<void> {
    await db
      .update(withdrawals)
      .set({
        status,
        processedBy: adminId,
        processedAt: new Date(),
        adminNote: adminNote || null
      })
      .where(eq(withdrawals.id, withdrawalId));
  }

  async rejectWithdrawal(withdrawalId: number, adminId: number, adminNote: string): Promise<void> {
    // Get withdrawal details first
    const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, withdrawalId));
    
    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    // Update withdrawal status to rejected
    await db
      .update(withdrawals)
      .set({
        status: "rejected",
        processedBy: adminId,
        processedAt: new Date(),
        adminNote
      })
      .where(eq(withdrawals.id, withdrawalId));

    // Refund the user's balance using BalanceService for proper audit trail
    await BalanceService.processTransaction({
      userId: withdrawal.userId,
      type: 'withdrawal_refund',
      amount: withdrawal.ntiqAmount, // Fixed: use ntiqAmount instead of ptsAmount
      description: `Withdrawal refund - ${adminNote}`,
      relatedId: withdrawal.id,
      metadata: {
        withdrawalId: withdrawal.id,
        originalAmount: withdrawal.ntiqAmount,
        adminNote
      }
    }, this);
  }

  async completeWithdrawal(withdrawalId: number, adminId: number, adminNote?: string, transactionHash?: string): Promise<void> {
    const updateData: any = {
      status: "completed",
      processedBy: adminId,
      processedAt: new Date()
    };

    if (adminNote) {
      updateData.adminNote = adminNote;
    }

    // Note: We would store transactionHash if we had that field in schema
    // For now, we can include it in the admin note if provided
    if (transactionHash && adminNote) {
      updateData.adminNote = `${adminNote} | TX: ${transactionHash}`;
    } else if (transactionHash) {
      updateData.adminNote = `Transaction Hash: ${transactionHash}`;
    }

    await db
      .update(withdrawals)
      .set(updateData)
      .where(eq(withdrawals.id, withdrawalId));
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

  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    // Clean deleteUser implementation - only use tables that exist in database
    try {
      console.log(`🧹 Starting clean deletion process for user ${id}`);
      
      // Get user info first
      const [user] = await db.select({ 
        username: users.username,
        walletAddress: users.walletAddress 
      }).from(users).where(eq(users.id, id));
      
      if (!user) {
        throw new Error('User not found');
      }
      
      console.log(`👤 Deleting user: ${user.username} (${user.walletAddress})`);
      
      // Delete in safe order using drizzle delete methods
      
      // 1. Delete battle comments
      console.log('🔹 Deleting battle comments...');
      await db.delete(battleComments).where(eq(battleComments.userId, id));
      
      // 2. Delete prediction battles
      console.log('🔹 Deleting prediction battles...');
      await db.delete(predictionBattles).where(or(
        eq(predictionBattles.challengerId, id),
        eq(predictionBattles.challengedId, id)
      ));
      
      // 3. Delete survival data
      console.log('🔹 Deleting survival predictions...');
      await db.delete(survivalPredictions).where(eq(survivalPredictions.userId, id));
      
      console.log('🔹 Deleting survival participants...');
      await db.delete(survivalParticipants).where(eq(survivalParticipants.userId, id));
      
      // 4. Delete achievements and challenges
      console.log('🔹 Deleting user achievements...');
      await db.delete(userAchievements).where(eq(userAchievements.userId, id));
      
      console.log('🔹 Deleting daily challenges...');
      await db.delete(userDailyChallenges).where(eq(userDailyChallenges.userId, id));
      
      // 5. Delete core data
      console.log('🔹 Deleting transaction logs...');
      await db.delete(transactionLogs).where(eq(transactionLogs.userId, id));
      
      console.log('🔹 Deleting security events...');
      await db.delete(securityEvents).where(eq(securityEvents.userId, id));
      
      console.log('🔹 Deleting rewards...');
      await db.delete(rewards).where(eq(rewards.userId, id));
      
      console.log('🔹 Deleting predictions...');
      await db.delete(predictions).where(eq(predictions.userId, id));
      
      console.log('🔹 Deleting purchases...');
      await db.delete(purchases).where(eq(purchases.userId, id));
      
      console.log('🔹 Deleting withdrawals...');
      await db.delete(withdrawals).where(eq(withdrawals.userId, id));
      
      // 6. Delete wallet and security data - only if they exist
      if (user?.walletAddress) {
        try {
          console.log('🔹 Deleting wallet fingerprints...');
          await db.delete(walletFingerprints).where(eq(walletFingerprints.walletAddress, user.walletAddress));
        } catch (error) {
          console.warn('❌ walletFingerprints table not found, skipping...');
        }
        
        try {
          console.log('🔹 Deleting abuse detections...');
          await db.delete(abuseDetections).where(eq(abuseDetections.primaryWalletAddress, user.walletAddress));
        } catch (error) {
          console.warn('❌ abuseDetections table not found, skipping...');
        }
      }
      
      // 7. Update referral references
      console.log('🔹 Updating referral references...');
      await db.update(users).set({ referredBy: null }).where(eq(users.referredBy, id));
      
      // 8. Finally delete the user
      console.log('🔹 Deleting user account...');
      await db.delete(users).where(eq(users.id, id));
      
      console.log(`✅ Successfully deleted user ${id} (${user.username}) and all related data`);
      return { success: true, message: `User ${user.username} deleted successfully` };
      
    } catch (error: any) {
      console.error(`❌ Error deleting user ${id}:`, error);
      console.error('💥 Error details:', error?.message || 'Unknown error');
      throw new Error(`Cannot delete user due to data dependencies: ${error?.message || 'Unknown database error'}`);
    }
  }

  async resetUser(id: number): Promise<void> {
    // Reset user to initial state - clear all data but keep user account
    try {
      console.log(`Starting user reset process for user ${id}`);
      
      // Get user info first for logging
      const [user] = await db.select({ 
        username: users.username, 
        walletAddress: users.walletAddress 
      }).from(users).where(eq(users.id, id));
      
      if (!user) {
        throw new Error('User not found');
      }
      
      console.log(`Resetting user: ${user.username} (${user.walletAddress})`);
      
      // Reset user data to initial state
      // 1. Reset basic user fields to initial values
      console.log('Resetting user profile to initial state...');
      await db.update(users).set({
        balance: 1000, // Reset to initial balance
        totalPredictions: 0,
        correctPredictions: 0,
        totalRewards: 0,
        profilePhoto: null,
        email: null,
        twitterHandle: null,
        emailVerified: false,
        twitterVerified: false,
        referralCode: null
      }).where(eq(users.id, id));
      
      // 2. Delete all battle-related data
      console.log('Clearing battle data...');
      await db.delete(battleComments).where(eq(battleComments.userId, id));
      await db.delete(predictionBattles).where(or(
        eq(predictionBattles.challengerId, id),
        eq(predictionBattles.challengedId, id)
      ));
      
      // 3. Delete survival tournament data
      console.log('Clearing survival tournament data...');
      await db.delete(survivalPredictions).where(eq(survivalPredictions.userId, id));
      await db.delete(survivalParticipants).where(eq(survivalParticipants.userId, id));
      
      // 4. Delete achievements and challenges
      console.log('Clearing achievements and challenges...');
      await db.delete(userAchievements).where(eq(userAchievements.userId, id));
      await db.delete(userDailyChallenges).where(eq(userDailyChallenges.userId, id));
      
      // 5. Delete social and interaction data (skip non-existent tables)
      console.log('Clearing social data...');
      // Note: predictionReactions and predictionComments tables don't exist
      
      // 6. Delete transaction and financial logs
      console.log('Clearing transaction history...');
      try {
        await db.delete(transactionLogs).where(eq(transactionLogs.userId, id));
      } catch (error: any) {
        console.warn('transactionLogs table operation failed:', error.message);
      }
      
      try {
        await db.delete(cryptoTransactions).where(eq(cryptoTransactions.userId, id));
      } catch (error: any) {
        console.warn('cryptoTransactions table operation failed:', error.message);
      }
      
      // 7. Delete analytics and security data (but keep basic security for protection)
      console.log('Clearing analytics and some security data...');
      try {
        await db.delete(userAnalytics).where(eq(userAnalytics.userId, id));
      } catch (error: any) {
        console.warn('userAnalytics table operation failed:', error.message);
      }
      
      // Note: Keep some security events for protection, only delete abuse detections
      try {
        await db.delete(abuseDetections).where(eq(abuseDetections.userId, id));
      } catch (error: any) {
        console.warn('abuseDetections table operation failed:', error.message);
      }
      
      // 8. Delete all financial records
      console.log('Clearing financial records...');
      await db.delete(rewards).where(eq(rewards.userId, id));
      await db.delete(predictions).where(eq(predictions.userId, id));
      await db.delete(purchases).where(eq(purchases.userId, id));
      await db.delete(withdrawals).where(eq(withdrawals.userId, id));
      
      // 9. Delete referral data
      console.log('Clearing referral data...');
      await db.delete(referrals).where(or(
        eq(referrals.referrerId, id),
        eq(referrals.referredUserId, id)
      ));
      
      // 10. Update any users who were referred by this user
      console.log('Updating referral references...');
      await db.update(users).set({
        referredBy: null
      }).where(eq(users.referredBy, id));
      
      console.log(`✅ Successfully reset user ${id} (${user.username}) - all data cleared, user reset to initial state with 1000 NTIQ balance`);
      
    } catch (error: any) {
      console.error(`Error resetting user ${id}:`, error);
      console.error('Error details:', error?.message || 'Unknown error');
      throw new Error(`Cannot reset user: ${error?.message || 'Unknown database error'}`);
    }
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

  // Crypto transaction operations
  async createCryptoTransaction(transaction: any): Promise<any> {
    const [newTransaction] = await db.insert(cryptoTransactions).values({
      userId: transaction.userId,
      transactionHash: transaction.transactionHash,
      paymentToken: transaction.paymentToken,
      cryptoAmount: transaction.cryptoAmount.toString(),
      ntiqAmount: transaction.ntiqAmount,
      userAddress: transaction.userAddress,
      status: transaction.status || 'completed',
      exchangeRate: transaction.exchangeRate || 100
    }).returning();
    return newTransaction;
  }

  async getTransactionByHash(hash: string): Promise<any> {
    const [transaction] = await db.select().from(cryptoTransactions)
      .where(eq(cryptoTransactions.transactionHash, hash))
      .limit(1);
    return transaction;
  }

  async getUserCryptoTransactions(userId: number, limit: number = 20): Promise<any[]> {
    const transactions = await db.select().from(cryptoTransactions)
      .where(eq(cryptoTransactions.userId, userId))
      .orderBy(desc(cryptoTransactions.createdAt))
      .limit(limit);
    return transactions;
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

  async getSystemSetting(category: string, key: string): Promise<string | null> {
    const [setting] = await db.select()
      .from(systemSettings)
      .where(and(
        eq(systemSettings.category, category),
        eq(systemSettings.key, key)
      ));
    
    return setting ? setting.value : null;
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

        // CRITICAL: Use BalanceService for guaranteed real-time balance updates
        try {
          const balanceResult = await BalanceService.processBattleReward(
            winnerId,
            battleId,
            parseFloat(String(battle.stakeAmount)),
            multiplier,
            this
          );
          
          // Update user total rewards for statistics
          const [winner] = await db.select().from(users).where(eq(users.id, winnerId));
          if (winner) {
            await db
              .update(users)
              .set({ 
                totalRewards: winner.totalRewards + winnerReward
              })
              .where(eq(users.id, winnerId));
          }
          
          console.log(`✅ BATTLE REWARD: Battle ${battleId} winner ${winnerId} received ${winnerReward} NTIQ`);
        } catch (error) {
          console.error(`❌ BATTLE REWARD ERROR: Failed to process battle ${battleId} reward:`, error);
          // Fallback to old method if BalanceService fails
          const [winner] = await db.select().from(users).where(eq(users.id, winnerId));
          if (winner) {
            await db
              .update(users)
              .set({ 
                balance: winner.balance + winnerReward,
                totalRewards: winner.totalRewards + winnerReward
              })
              .where(eq(users.id, winnerId));

            await this.logTransaction({
              userId: winnerId,
              type: 'battle_reward',
              amount: winnerReward,
              token: 'NTIQ',
              status: 'completed',
              relatedId: battleId
            });
          }
        }
      } else {
        // It's a tie - refund both players using BalanceService
        const stakeAmount = parseFloat(String(battle.stakeAmount));
        
        try {
          // Refund challenger
          await BalanceService.processTransaction({
            userId: battle.challengerId,
            type: 'battle_refund',
            amount: stakeAmount,
            description: `Battle tie refund - Battle #${battleId}`,
            relatedId: battleId
          }, this);
          
          // Refund challenged player
          if (battle.challengedId) {
            await BalanceService.processTransaction({
              userId: battle.challengedId,
              type: 'battle_refund',
              amount: stakeAmount,
              description: `Battle tie refund - Battle #${battleId}`,
              relatedId: battleId
            }, this);
          }
          
          console.log(`✅ BATTLE TIE: Battle ${battleId} both players refunded ${stakeAmount} NTIQ each`);
        } catch (error) {
          console.error(`❌ BATTLE REFUND ERROR: Failed to process battle ${battleId} refunds:`, error);
          // Fallback to old method if BalanceService fails
          const [challenger] = await db.select().from(users).where(eq(users.id, battle.challengerId));
          if (challenger) {
            await db
              .update(users)
              .set({ balance: challenger.balance + stakeAmount })
              .where(eq(users.id, battle.challengerId));

            await this.logTransaction({
              userId: battle.challengerId,
              type: 'battle_refund',
              amount: stakeAmount,
              token: 'NTIQ',
              status: 'completed',
              relatedId: battleId
            });
          }
          
          if (battle.challengedId) {
            const [challenged] = await db.select().from(users).where(eq(users.id, battle.challengedId));
            if (challenged) {
              await db
                .update(users)
                .set({ balance: challenged.balance + stakeAmount })
                .where(eq(users.id, battle.challengedId));

              await this.logTransaction({
                userId: battle.challengedId,
                type: 'battle_refund',
                amount: stakeAmount,
                token: 'NTIQ',
                status: 'completed',
                relatedId: battleId
              });
            }
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
          timeLeft: Math.max(0, Math.floor((new Date(battle.targetTime).getTime() - Date.now()) / 1000))
        };
      })
    );

    return battlesWithChallenged;
  }

  async getBattleHistory(): Promise<any[]> {
    try {
      // Get completed battles without complex joins first
      const battles = await db
        .select()
        .from(predictionBattles)
        .where(eq(predictionBattles.status, 'completed'))
        .orderBy(desc(predictionBattles.createdAt))
        .limit(50);

      // Get user details for each battle
      const battlesWithDetails = await Promise.all(
        battles.map(async (battle) => {
          let challenger = null;
          let challenged = null;
          let winner = null;

          // Get challenger info
          if (battle.challengerId) {
            const challengerUser = await this.getUser(battle.challengerId);
            if (challengerUser) {
              challenger = {
                username: challengerUser.username,
                profilePhoto: challengerUser.profilePhoto
              };
            }
          }

          // Get challenged user info
          if (battle.challengedId) {
            const challengedUser = await this.getUser(battle.challengedId);
            if (challengedUser) {
              challenged = {
                username: challengedUser.username,
                profilePhoto: challengedUser.profilePhoto
              };
            }
          }

          // Get winner info
          if (battle.winnerId) {
            const winnerUser = await this.getUser(battle.winnerId);
            if (winnerUser) {
              winner = {
                username: winnerUser.username,
                profilePhoto: winnerUser.profilePhoto
              };
            }
          }
          
          return {
            ...battle,
            challenger,
            challenged,
            challengedUsername: challenged?.username || null,
            winner
          };
        })
      );

      return battlesWithDetails;
    } catch (error) {
      console.error('Error fetching battle history:', error);
      return [];
    }
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
          timeLeft: Math.max(0, Math.floor((new Date(battle.targetTime).getTime() - Date.now()) / 1000))
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

  async clearAllBattles(): Promise<number> {
    // First, delete all battle comments
    await db.delete(battleComments);
    
    // Then delete all battles and get count
    const battles = await db.select().from(predictionBattles);
    const deletedCount = battles.length;
    
    await db.delete(predictionBattles);
    
    return deletedCount;
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
        challengerProfilePhoto: users.profilePhoto,
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
        let challengedProfilePhoto = null;

        if (battle.challengedId) {
          const [challengedUser] = await db
            .select({ username: users.username, uid: users.uid, profilePhoto: users.profilePhoto })
            .from(users)
            .where(eq(users.id, battle.challengedId));
          
          if (challengedUser) {
            challengedUsername = challengedUser.username;
            challengedUid = challengedUser.uid;
            challengedProfilePhoto = challengedUser.profilePhoto;
          }
        }

        return {
          ...battle,
          challengedUsername,
          challengedUid,
          challengedProfilePhoto,
          duration: Math.round((new Date(battle.targetTime).getTime() - new Date(battle.createdAt).getTime()) / (1000 * 60)),
          timeRemaining: Math.max(0, Math.floor((new Date(battle.targetTime).getTime() - Date.now()) / 1000))
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
          timeLeft: Math.max(0, Math.floor((new Date(battle.targetTime).getTime() - Date.now()) / 1000)),
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

    const totalStaked = battles.reduce((sum, battle) => {
      const stakeAmount = parseFloat(battle.stakeAmount?.toString() || '0');
      // Only multiply by 2 if battle has 2 participants (active or completed)
      // For open battles, only count the challenger's stake (x1)
      const multiplier = (battle.status === 'open') ? 1 : 2;
      return sum + (stakeAmount * multiplier);
    }, 0);
    
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
      throw new Error('Battle not found');
    }

    const now = new Date();
    const createdAt = new Date(battle.createdAt);
    const targetTime = new Date(battle.targetTime);
    
    // Calculate 80% join deadline if not set
    const battleDuration = targetTime.getTime() - createdAt.getTime();
    const joinDeadline = battle.joinDeadline ? 
      new Date(battle.joinDeadline) : 
      new Date(createdAt.getTime() + (battleDuration * 0.8));
    
    const minimumJoinTime = battle.minimumJoinTime || 5; // 5 seconds for testing purposes

    // Check 1: Is it still within join time limit
    if (now > joinDeadline) {
      throw new Error('Time to join has ended. You can only join within 80% of the battle duration.');
    }

    // Check 2: Has minimum join time passed
    const timeSinceCreation = (now.getTime() - createdAt.getTime()) / 1000; // in seconds
    if (timeSinceCreation < minimumJoinTime) {
      const remainingTime = Math.ceil((minimumJoinTime - timeSinceCreation));
      if (remainingTime > 60) {
        const remainingMinutes = Math.ceil(remainingTime / 60);
        throw new Error(`You must wait ${remainingMinutes} more minutes before joining to prevent unfair strategies.`);
      } else {
        throw new Error(`You must wait ${remainingTime} more seconds before joining to prevent unfair strategies.`);
      }
    }

    // Calculate fairness multipliers
    const currentPrice = await this.getCurrentCryptoPrice(battle.cryptocurrency);
    const priceAtCreation = battle.priceAtCreation ? parseFloat(battle.priceAtCreation.toString()) : currentPrice;
    const priceMovement = Math.abs((currentPrice - priceAtCreation) / priceAtCreation * 100);

    // Price movement penalty: if price moves > 2%, there's a penalty
    let fairnessMultiplier = 1.0;
    if (battle.priceMovementPenalty && priceMovement > 2) {
      fairnessMultiplier = Math.max(0.5, 1 - (priceMovement - 2) * 0.1); // Reduce multiplier based on movement
    }

    // Join time bonus: joining earlier gets a bonus
    const totalBattleTime = (joinDeadline.getTime() - createdAt.getTime()) / 1000;
    const joinTimePercentage = timeSinceCreation / totalBattleTime;
    let joinTimeBonus = 1.0;
    
    if (joinTimePercentage < 0.3) {
      joinTimeBonus = 1.2; // 20% bonus for joining in first 30%
    } else if (joinTimePercentage < 0.5) {
      joinTimeBonus = 1.1; // 10% bonus for joining in first 50%
    }

    // Update battle with challenged user and fairness calculations
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
        userId: transaction.userId,
        type: transaction.type || 'reward',
        amount: transaction.amount || 0,
        token: transaction.token || 'NTIQ',
        status: transaction.status || 'completed',
        hash: transaction.txHash || null,
        fromAddress: transaction.fromAddress || null,
        toAddress: transaction.toAddress || null,
        networkFee: transaction.networkFee || null,
        exchangeRate: null,
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

  // Survival Tournament Operations
  async createSurvivalTournament(tournamentData: any): Promise<any> {
    const [tournament] = await db
      .insert(survivalTournaments)
      .values(tournamentData)
      .returning();
    return tournament;
  }

  async getAllSurvivalTournaments(): Promise<any[]> {
    const tournaments = await db
      .select({
        id: survivalTournaments.id,
        title: survivalTournaments.title,
        description: survivalTournaments.description,
        cryptocurrency: survivalTournaments.cryptocurrency,
        entryFee: survivalTournaments.entryFee,
        maxParticipants: survivalTournaments.maxParticipants,
        currentParticipants: survivalTournaments.currentParticipants,
        prizePool: survivalTournaments.prizePool,
        rewardAmount: survivalTournaments.rewardAmount,
        rewardType: survivalTournaments.rewardType,
        status: survivalTournaments.status,
        currentRound: survivalTournaments.currentRound,
        roundDuration: survivalTournaments.roundDuration,
        round1Duration: survivalTournaments.round1Duration,
        round2Duration: survivalTournaments.round2Duration,
        round3Duration: survivalTournaments.round3Duration,
        startTime: survivalTournaments.startTime,
        endTime: survivalTournaments.endTime,
        nextRoundTime: survivalTournaments.nextRoundTime,
        winnerId: survivalTournaments.winnerId,
        createdAt: survivalTournaments.createdAt,
        creatorUsername: users.username,
        winnerUsername: users.username
      })
      .from(survivalTournaments)
      .leftJoin(users, eq(survivalTournaments.createdBy, users.id))
      .orderBy(desc(survivalTournaments.createdAt));

    // Add rounds data to each tournament
    const tournamentsWithRounds = await Promise.all(
      tournaments.map(async (tournament) => {
        const rounds = await this.getSurvivalRounds(tournament.id);
        return {
          ...tournament,
          rounds
        };
      })
    );

    return tournamentsWithRounds;
  }

  async getSurvivalTournament(id: number): Promise<any> {
    const [tournament] = await db
      .select({
        id: survivalTournaments.id,
        title: survivalTournaments.title,
        description: survivalTournaments.description,
        cryptocurrency: survivalTournaments.cryptocurrency,
        entryFee: survivalTournaments.entryFee,
        maxParticipants: survivalTournaments.maxParticipants,
        currentParticipants: survivalTournaments.currentParticipants,
        prizePool: survivalTournaments.prizePool,
        rewardAmount: survivalTournaments.rewardAmount,
        rewardType: survivalTournaments.rewardType,
        status: survivalTournaments.status,
        currentRound: survivalTournaments.currentRound,
        roundDuration: survivalTournaments.roundDuration,
        round1Duration: survivalTournaments.round1Duration,
        round2Duration: survivalTournaments.round2Duration,
        round3Duration: survivalTournaments.round3Duration,
        startTime: survivalTournaments.startTime,
        endTime: survivalTournaments.endTime,
        nextRoundTime: survivalTournaments.nextRoundTime,
        createdBy: survivalTournaments.createdBy,
        winnerId: survivalTournaments.winnerId,
        createdAt: survivalTournaments.createdAt,
        updatedAt: survivalTournaments.updatedAt,
        creatorUsername: users.username
      })
      .from(survivalTournaments)
      .leftJoin(users, eq(survivalTournaments.createdBy, users.id))
      .where(eq(survivalTournaments.id, id));
    
    return tournament || undefined;
  }

  async joinSurvivalTournament(tournamentId: number, userId: number): Promise<any> {
    // Get tournament entry fee first
    const tournament = await db.select({
      entryFee: survivalTournaments.entryFee,
      currentParticipants: survivalTournaments.currentParticipants,
      prizePool: survivalTournaments.prizePool
    }).from(survivalTournaments).where(eq(survivalTournaments.id, tournamentId));
    
    if (!tournament[0]) {
      throw new Error('Tournament not found');
    }
    
    const { entryFee, currentParticipants, prizePool } = tournament[0];
    
    // Insert participant
    const [participant] = await db
      .insert(survivalParticipants)
      .values({
        tournamentId: tournamentId,
        userId: userId,
        status: 'active'
      })
      .returning();
    
    // Update participant count and prize pool
    await db
      .update(survivalTournaments)
      .set({
        currentParticipants: currentParticipants + 1,
        prizePool: prizePool + entryFee
      })
      .where(eq(survivalTournaments.id, tournamentId));
    
    return participant;
  }

  async startSurvivalTournament(tournamentId: number): Promise<void> {
    await db
      .update(survivalTournaments)
      .set({
        status: 'active',
        startTime: new Date(),
        currentRound: 1
      })
      .where(eq(survivalTournaments.id, tournamentId));
  }

  async createSurvivalRound(roundData: any): Promise<any> {
    const [round] = await db
      .insert(survivalRounds)
      .values(roundData)
      .returning();
    return round;
  }

  async submitSurvivalPrediction(predictionData: any): Promise<any> {
    const [prediction] = await db
      .insert(survivalPredictions)
      .values(predictionData)
      .returning();
    return prediction;
  }

  async updateSurvivalPrediction(predictionId: number, updateData: any): Promise<any> {
    const [prediction] = await db
      .update(survivalPredictions)
      .set(updateData)
      .where(eq(survivalPredictions.id, predictionId))
      .returning();
    return prediction;
  }

  async processSurvivalRound(roundId: number): Promise<void> {
    // This method will be called to process round results
    // Implementation will depend on business logic
    console.log(`Processing survival round ${roundId}`);
  }

  async eliminateParticipants(roundId: number, incorrectPredictions: number[]): Promise<void> {
    if (incorrectPredictions.length > 0) {
      await db
        .update(survivalParticipants)
        .set({
          status: 'eliminated',
          eliminatedRound: roundId,
          eliminatedAt: new Date()
        })
        .where(inArray(survivalParticipants.id, incorrectPredictions));
    }
  }

  async getSurvivalParticipants(tournamentId: number): Promise<any[]> {
    return await db
      .select({
        id: survivalParticipants.id,
        userId: survivalParticipants.userId,
        username: users.username,
        uid: users.uid,
        status: survivalParticipants.status,
        eliminatedRound: survivalParticipants.eliminatedRound,
        joinedAt: survivalParticipants.joinedAt,
        eliminatedAt: survivalParticipants.eliminatedAt
      })
      .from(survivalParticipants)
      .leftJoin(users, eq(survivalParticipants.userId, users.id))
      .where(eq(survivalParticipants.tournamentId, tournamentId))
      .orderBy(desc(survivalParticipants.joinedAt));
  }

  async getTournamentParticipantsWithPredictions(tournamentId: number): Promise<any[]> {
    // Get current round
    const currentRound = await this.getCurrentRound(tournamentId);
    
    // Get all participants
    const participants = await db
      .select({
        id: survivalParticipants.id,
        userId: survivalParticipants.userId,
        username: users.username,
        uid: users.uid,
        status: survivalParticipants.status,
        eliminatedRound: survivalParticipants.eliminatedRound,
        joinedAt: survivalParticipants.joinedAt,
        eliminatedAt: survivalParticipants.eliminatedAt,
        profilePhoto: users.profilePhoto
      })
      .from(survivalParticipants)
      .leftJoin(users, eq(survivalParticipants.userId, users.id))
      .where(eq(survivalParticipants.tournamentId, tournamentId))
      .orderBy(desc(survivalParticipants.joinedAt));

    // If there's no current round, return participants without predictions
    if (!currentRound) {
      return participants.map(p => ({ ...p, prediction: null, submittedAt: null }));
    }

    // Get predictions for current round
    const predictions = await db
      .select({
        participantId: survivalPredictions.participantId,
        userId: survivalPredictions.userId,
        prediction: survivalPredictions.prediction,
        submittedAt: survivalPredictions.submittedAt,
        startingPrice: survivalPredictions.startingPrice
      })
      .from(survivalPredictions)
      .where(eq(survivalPredictions.roundId, currentRound.id));

    // Create a map for quick lookup
    const predictionMap = new Map();
    predictions.forEach(pred => {
      predictionMap.set(pred.participantId, pred);
    });

    // Merge participants with their predictions
    return participants.map(participant => {
      const prediction = predictionMap.get(participant.id);
      return {
        ...participant,
        prediction: prediction?.prediction || null,
        submittedAt: prediction?.submittedAt || null,
        startingPrice: prediction?.startingPrice || null,
        currentRound: currentRound?.roundNumber || 0
      };
    });
  }

  async getSurvivalRounds(tournamentId: number): Promise<any[]> {
    return await db
      .select()
      .from(survivalRounds)
      .where(eq(survivalRounds.tournamentId, tournamentId))
      .orderBy(survivalRounds.roundNumber);
  }

  async getSurvivalPredictions(roundId: number): Promise<any[]> {
    return await db
      .select({
        id: survivalPredictions.id,
        userId: survivalPredictions.userId,
        participantId: survivalPredictions.participantId,
        username: users.username,
        prediction: survivalPredictions.prediction,
        startingPrice: survivalPredictions.startingPrice,
        endingPrice: survivalPredictions.endingPrice,
        isCorrect: survivalPredictions.isCorrect,
        points: survivalPredictions.points,
        submittedAt: survivalPredictions.submittedAt
      })
      .from(survivalPredictions)
      .leftJoin(users, eq(survivalPredictions.userId, users.id))
      .where(eq(survivalPredictions.roundId, roundId))
      .orderBy(desc(survivalPredictions.submittedAt));
  }

  // Additional methods for survival round service
  async getCurrentRound(tournamentId: number): Promise<any> {
    const [round] = await db
      .select()
      .from(survivalRounds)
      .where(
        and(
          eq(survivalRounds.tournamentId, tournamentId),
          eq(survivalRounds.status, 'active')
        )
      );
    return round;
  }

  async getActiveParticipants(tournamentId: number): Promise<any[]> {
    return await db
      .select()
      .from(survivalParticipants)
      .where(
        and(
          eq(survivalParticipants.tournamentId, tournamentId),
          eq(survivalParticipants.status, 'active')
        )
      );
  }

  async updateRoundSurvivorCount(roundId: number, count: number): Promise<void> {
    await db
      .update(survivalRounds)
      .set({ survivorCount: count })
      .where(eq(survivalRounds.id, roundId));
  }

  async getRoundPredictions(roundId: number): Promise<any[]> {
    return this.getSurvivalPredictions(roundId);
  }

  async getSurvivalRound(roundId: number): Promise<any> {
    const [round] = await db
      .select()
      .from(survivalRounds)
      .where(eq(survivalRounds.id, roundId));
    return round;
  }

  async updateRound(roundId: number, updates: any): Promise<void> {
    await db
      .update(survivalRounds)
      .set(updates)
      .where(eq(survivalRounds.id, roundId));
  }

  async getRoundPredictions(roundId: number): Promise<any[]> {
    return await db
      .select({
        id: survivalPredictions.id,
        participantId: survivalPredictions.participantId,
        userId: survivalPredictions.userId,
        prediction: survivalPredictions.prediction,
        isCorrect: survivalPredictions.isCorrect
      })
      .from(survivalPredictions)
      .where(eq(survivalPredictions.roundId, roundId));
  }

  async updatePrediction(predictionId: number, updates: any): Promise<void> {
    await db
      .update(survivalPredictions)
      .set(updates)
      .where(eq(survivalPredictions.id, predictionId));
  }

  // Get active survival tournaments for automatic round checker
  async getActiveSurvivalTournaments(): Promise<any[]> {
    return await db
      .select()
      .from(survivalTournaments)
      .where(eq(survivalTournaments.status, 'active'));
  }

  // Get specific round by ID
  async getRound(roundId: number): Promise<any> {
    const [round] = await db
      .select()
      .from(survivalRounds)
      .where(eq(survivalRounds.id, roundId));
    return round;
  }

  // Complete a round with end price
  async completeRound(roundId: number, endPrice: number): Promise<void> {
    await db
      .update(survivalRounds)
      .set({ 
        status: 'completed',
        endPrice: endPrice.toString()
      })
      .where(eq(survivalRounds.id, roundId));
  }

  // Get participant's prediction for specific round
  async getParticipantRoundPrediction(userId: number, tournamentId: number, roundNumber: number): Promise<any> {
    // First get the round ID for this tournament and round number
    const [round] = await db
      .select()
      .from(survivalRounds)
      .where(
        and(
          eq(survivalRounds.tournamentId, tournamentId),
          eq(survivalRounds.roundNumber, roundNumber)
        )
      );
    
    if (!round) return null;
    
    // Then get the prediction for this round
    const [prediction] = await db
      .select()
      .from(survivalPredictions)
      .where(
        and(
          eq(survivalPredictions.userId, userId),
          eq(survivalPredictions.tournamentId, tournamentId),
          eq(survivalPredictions.roundId, round.id)
        )
      );
    return prediction;
  }

  // Create new round with individual duration
  async createRound(tournamentId: number, roundNumber: number, startPrice: number, durationMinutes: number): Promise<void> {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    await db
      .insert(survivalRounds)
      .values({
        tournamentId,
        roundNumber,
        cryptocurrency: 'bitcoin',
        startTime,
        endTime,
        startPrice: startPrice.toString(),
        status: 'active'
      });
  }

  // Set tournament winner
  async setTournamentWinner(tournamentId: number, winnerId: number): Promise<void> {
    await db
      .update(survivalTournaments)
      .set({ winnerId })
      .where(eq(survivalTournaments.id, tournamentId));
  }

  async getCompletedTournamentsWithWinners(): Promise<Array<{id: number, winnerId: number, prizePool: number}>> {
    const tournaments = await db
      .select({
        id: survivalTournaments.id,
        winnerId: survivalTournaments.winnerId,
        prizePool: survivalTournaments.prizePool
      })
      .from(survivalTournaments)
      .where(and(
        eq(survivalTournaments.status, 'completed'),
        isNotNull(survivalTournaments.winnerId)
      ));
    
    return tournaments.filter(t => t.winnerId !== null).map(t => ({
      id: t.id,
      winnerId: t.winnerId!,
      prizePool: t.prizePool
    }));
  }

  async checkTournamentRewardAwarded(tournamentId: number): Promise<boolean> {
    const reward = await db
      .select()
      .from(transactionLogs)
      .where(and(
        eq(transactionLogs.type, 'survival_tournament_reward'),
        eq(transactionLogs.relatedId, tournamentId)
      ))
      .limit(1);
    
    return reward.length > 0;
  }

  // Eliminate participant by userId and tournamentId
  async eliminateParticipant(userId: number, tournamentId: number, roundNumber: number): Promise<void> {
    await db
      .update(survivalParticipants)
      .set({
        status: 'eliminated',
        eliminatedRound: roundNumber,
        eliminatedAt: new Date()
      })
      .where(
        and(
          eq(survivalParticipants.userId, userId),
          eq(survivalParticipants.tournamentId, tournamentId)
        )
      );
  }

  // Original eliminateParticipant method (keep for backward compatibility)
  async eliminateParticipantById(participantId: number, roundNumber: number): Promise<void> {
    await db
      .update(survivalParticipants)
      .set({
        status: 'eliminated',
        eliminatedRound: roundNumber,
        eliminatedAt: new Date()
      })
      .where(eq(survivalParticipants.id, participantId));
  }

  // Update tournament status with optional winnerId
  async updateTournamentStatus(tournamentId: number, status: string, winnerId?: number | null): Promise<void> {
    const updates: any = { 
      status, 
      completedAt: new Date() 
    };
    
    if (winnerId) {
      updates.winnerId = winnerId;
    }

    await db
      .update(survivalTournaments)
      .set(updates)
      .where(eq(survivalTournaments.id, tournamentId));
  }

  async updateSurvivalTournament(id: number, updates: any): Promise<void> {
    await db
      .update(survivalTournaments)
      .set(updates)
      .where(eq(survivalTournaments.id, id));
  }

  async deleteSurvivalTournament(id: number): Promise<void> {
    // Delete related data first
    await db.delete(survivalPredictions).where(eq(survivalPredictions.tournamentId, id));
    await db.delete(survivalRounds).where(eq(survivalRounds.tournamentId, id));
    await db.delete(survivalParticipants).where(eq(survivalParticipants.tournamentId, id));
    await db.delete(survivalTournaments).where(eq(survivalTournaments.id, id));
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
      totalRewards: 0,
      profilePhoto: null,
      email: null,
      twitterHandle: null,
      emailVerified: false,
      twitterVerified: false
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

  async getComprehensiveRewards(userId: number, limit: number = 10): Promise<any[]> {
    try {
      console.log('Getting comprehensive rewards for user:', userId);
      
      // Simple query to get all transactions for user
      const transactions = await db
        .select()
        .from(transactionLogs)
        .where(eq(transactionLogs.userId, userId))
        .limit(limit);

      console.log('Found transactions:', transactions.length);

      // Return basic transaction data with minimal processing
      return transactions.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        cryptocurrency: null, // We'll enhance this later
        sourceDetails: null,
        createdAt: transaction.createdAt,
        status: transaction.status
      }));

    } catch (error) {
      console.error('Error in getComprehensiveRewards:', error);
      throw error;
    }
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

  // Multi-chain Deposit operations
  async createDeposit(deposit: any): Promise<any> {
    const id = this.currentWithdrawalId++; // Reuse counter
    const newDeposit = {
      id,
      ...deposit,
      createdAt: new Date(),
    };
    // Note: Using a simple Map for deposits (in real scenario would be separate)
    this.withdrawals.set(`deposit_${id}`, newDeposit); 
    return newDeposit;
  }

  async getUserDeposits(userId: number, limit: number = 10): Promise<any[]> {
    // Simple implementation - in real scenario would have separate deposits Map
    return Array.from(this.withdrawals.values())
      .filter((item: any) => item.userId === userId && item.amountUSD)
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateDepositStatus(id: number, status: string, transactionHash?: string, blockNumber?: number): Promise<void> {
    const deposit = this.withdrawals.get(`deposit_${id}`);
    if (deposit) {
      const updated = { 
        ...deposit, 
        status,
        ...(transactionHash && { transactionHash }),
        ...(blockNumber && { blockNumber }),
        ...(status === 'confirmed' && { processedAt: new Date() })
      };
      this.withdrawals.set(`deposit_${id}`, updated);
    }
  }

  async getDepositByTransactionHash(hash: string): Promise<any> {
    return Array.from(this.withdrawals.values())
      .find((item: any) => item.transactionHash === hash && item.amountUSD);
  }

  async getExpiredDeposits(): Promise<any[]> {
    const now = new Date();
    return Array.from(this.withdrawals.values())
      .filter((item: any) => 
        item.amountUSD && 
        item.status === 'pending' && 
        item.expiresAt && 
        new Date(item.expiresAt) < now
      );
  }

  async cancelExpiredDeposit(id: number): Promise<void> {
    const deposit = this.withdrawals.get(`deposit_${id}`);
    if (deposit) {
      const updated = { 
        ...deposit, 
        status: 'cancelled',
        processedAt: new Date()
      };
      this.withdrawals.set(`deposit_${id}`, updated);
    }
  }

  // Multi-chain Withdrawal operations
  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const withdrawal: Withdrawal = {
      id: this.currentWithdrawalId++,
      ...insertWithdrawal,
      status: insertWithdrawal.status || "pending",
      createdAt: new Date(),
    };
    this.withdrawals.set(withdrawal.id, withdrawal);
    return withdrawal;
  }

  async getUserWithdrawals(userId: number, limit: number = 10): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values())
      .filter((w: any) => w.userId === userId && !w.amountUSD) // Exclude deposits
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateWithdrawalStatus(id: number, status: string, transactionHash?: string, adminNote?: string, processedBy?: number): Promise<void> {
    const withdrawal = this.withdrawals.get(id);
    if (withdrawal) {
      const updated = { 
        ...withdrawal, 
        status,
        ...(transactionHash && { transactionHash }),
        ...(adminNote && { adminNote }),
        ...(processedBy && { processedBy }),
        ...((status === 'completed' || status === 'approved' || status === 'rejected') && { processedAt: new Date() })
      };
      this.withdrawals.set(id, updated);
    }
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



  async clearAllBattles(): Promise<number> {
    const battleCount = this.battles.size;
    this.battles.clear();
    this.battleComments.clear();
    return battleCount;
  }

  // Referral operations
  async createReferral(referrerId: number, referredId: number, referralCode: string): Promise<void> {
    await db.insert(referrals).values({
      referrerId,
      referredUserId: referredId,
      rewardAmount: 100, // 100 NTIQ reward per referral
    });
  }

  async getReferralData(userId: number): Promise<any> {
    // Get user's referral code
    const user = await db.select({
      referralCode: users.referralCode,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    const referralCode = user[0]?.referralCode || null;

    // Get referral stats
    const stats = await db.select({
      totalReferrals: count(referrals.id),
      referralRewards: sql<number>`COALESCE(SUM(${referrals.reward}), 0)`,
    })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));

    // Get referred users
    const referredUsers = await db.select({
      id: users.id,
      username: users.username,
      uid: users.uid,
      joinedAt: referrals.createdAt,
      rewardAmount: referrals.reward,
    })
    .from(referrals)
    .innerJoin(users, eq(referrals.referredId, users.id))
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt));

    return {
      referralCode,
      referralLink: referralCode ? `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/?ref=${referralCode}` : null,
      totalReferrals: stats[0]?.totalReferrals || 0,
      referralRewards: stats[0]?.referralRewards || 0,
      referredUsers: referredUsers.map(user => ({
        id: user.id,
        username: user.username,
        uid: user.uid,
        joinedAt: user.joinedAt.toISOString(),
        rewardAmount: user.rewardAmount,
      })),
    };
  }

  async generateReferralCode(userId: number): Promise<string> {
    // Generate unique referral code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Update user with referral code
    await db.update(users)
      .set({ referralCode: code })
      .where(eq(users.id, userId));

    return code;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.referralCode, referralCode))
      .limit(1);
    
    return user || undefined;
  }

  async getReferralStats(userId: number): Promise<any> {
    const [stats] = await db.select({
      totalReferrals: count(),
      totalRewards: sql<number>`COALESCE(SUM(${referrals.rewardAmount}), 0)`.as('totalRewards'),
    })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));

    return {
      totalReferrals: stats?.totalReferrals || 0,
      totalRewards: stats?.totalRewards || 0,
    };
  }



  async getUserSurvivalStatus(userId: number): Promise<any> {
    // Get all user's tournament participations
    const participations = await db
      .select({
        tournamentId: survivalParticipants.tournamentId,
        tournamentTitle: survivalTournaments.title,
        cryptocurrency: survivalTournaments.cryptocurrency,
        status: survivalParticipants.status,
        eliminatedRound: survivalParticipants.eliminatedRound,
        joinedAt: survivalParticipants.joinedAt,
        eliminatedAt: survivalParticipants.eliminatedAt,
        tournamentStatus: survivalTournaments.status,
        entryFee: survivalTournaments.entryFee,
        rewardAmount: survivalTournaments.rewardAmount,
        rewardType: survivalTournaments.rewardType,
        winnerId: survivalTournaments.winnerId,
        currentRound: survivalTournaments.currentRound,
        endTime: survivalTournaments.endTime,
        totalParticipants: survivalTournaments.maxParticipants,
        rounds: survivalTournaments.rounds
      })
      .from(survivalParticipants)
      .innerJoin(survivalTournaments, eq(survivalParticipants.tournamentId, survivalTournaments.id))
      .where(eq(survivalParticipants.userId, userId))
      .orderBy(desc(survivalParticipants.joinedAt));

    // Process tournament data
    const tournaments = await Promise.all(participations.map(async (p: any) => {
      // Get remaining participants for this tournament
      const allParticipants = await this.getSurvivalParticipants(p.tournamentId);
      const remainingParticipants = allParticipants.filter((participant: any) => 
        participant.status === 'active'
      ).length;

      // Get user's latest prediction for this tournament
      const predictions = await db
        .select({
          prediction: survivalPredictions.prediction
        })
        .from(survivalPredictions)
        .where(
          and(
            eq(survivalPredictions.userId, userId),
            eq(survivalPredictions.tournamentId, p.tournamentId)
          )
        )
        .orderBy(desc(survivalPredictions.createdAt))
        .limit(1);

      // Determine final position if eliminated or completed
      let finalPosition = null;
      if (p.status === 'eliminated' || p.status === 'winner') {
        const allFinishedParticipants = allParticipants.filter((participant: any) => 
          participant.status === 'eliminated' || participant.status === 'winner'
        );
        // Sort by elimination round (higher round = better position)
        allFinishedParticipants.sort((a: any, b: any) => {
          if (a.status === 'winner') return -1;
          if (b.status === 'winner') return 1;
          return (b.eliminatedRound || 0) - (a.eliminatedRound || 0);
        });
        finalPosition = allFinishedParticipants.findIndex((participant: any) => 
          participant.userId === userId
        ) + 1;
      }

      return {
        id: p.tournamentId,
        title: p.tournamentTitle,
        cryptocurrency: p.cryptocurrency,
        status: p.status,
        round: p.currentRound || 1,
        eliminatedRound: p.eliminatedRound,
        wonRound: p.status === 'winner' ? p.currentRound : null,
        totalParticipants: p.totalParticipants || allParticipants.length,
        remainingParticipants: remainingParticipants,
        prizePool: p.rewardAmount || 0,
        entryFee: p.entryFee || 0,
        joinedAt: p.joinedAt?.toISOString() || new Date().toISOString(),
        prediction: predictions[0]?.prediction || null,
        eliminatedAt: p.eliminatedAt?.toISOString() || null,
        wonAt: p.status === 'winner' ? p.endTime?.toISOString() : null,
        finalPosition: finalPosition
      };
    }));

    // Calculate stats
    const totalTournaments = tournaments.length;
    const tournamentsWon = tournaments.filter(t => t.status === 'winner').length;
    const totalWinnings = tournaments
      .filter(t => t.status === 'winner')
      .reduce((sum, t) => sum + t.prizePool, 0);
    
    const eliminatedTournaments = tournaments.filter(t => t.eliminatedRound);
    const averageRoundsReached = eliminatedTournaments.length > 0 
      ? eliminatedTournaments.reduce((sum, t) => sum + (t.eliminatedRound || 0), 0) / eliminatedTournaments.length
      : 0;
    
    const bestFinish = tournaments.reduce((best, t) => {
      if (t.finalPosition && (best === 0 || t.finalPosition < best)) {
        return t.finalPosition;
      }
      return best;
    }, 0);
    
    const winRate = totalTournaments > 0 ? (tournamentsWon / totalTournaments) * 100 : 0;

    return {
      tournaments: tournaments,
      stats: {
        totalTournaments,
        tournamentsWon,
        totalWinnings,
        averageRoundsReached: Math.round(averageRoundsReached * 10) / 10,
        bestFinish: bestFinish || 999,
        winRate: Math.round(winRate * 10) / 10
      }
    };
  }

  async getLiveActivities(limit: number = 20): Promise<any[]> {
    console.log('📊 [LIVE ACTIVITIES] Starting to fetch activities...');
    try {
      // Return some mock activities for testing first
      const mockActivities = [
        {
          id: 'mock_1',
          type: 'prediction',
          username: 'TestUser',
          description: 'Successfully predicted BTC price',
          amount: 150,
          cryptocurrency: 'bitcoin',
          timestamp: new Date().toISOString(),
          icon: 'TrendingUp',
          color: 'bg-green-600'
        },
        {
          id: 'mock_2',
          type: 'battle_win',
          username: 'BattleChamp',
          description: 'Won a prediction battle',
          amount: 200,
          cryptocurrency: 'ethereum',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          icon: 'Swords',
          color: 'bg-yellow-600'
        },
        {
          id: 'mock_3',
          type: 'achievement',
          username: 'AchievementHunter',
          description: 'Unlocked new achievement',
          amount: 100,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          icon: 'Crown',
          color: 'bg-purple-600'
        }
      ];

      console.log('✅ [LIVE ACTIVITIES] Returning mock activities:', mockActivities.length);
      return mockActivities.slice(0, limit);
    } catch (error) {
      console.error('❌ [LIVE ACTIVITIES] Error fetching live activities:', error);
      return [];
    }
  }

  // Platform statistics method - using direct database queries for reliability
  async getPlatformStats(): Promise<any> {
    console.log('📊 [PLATFORM STATS] Fetching platform statistics...');
    
    try {
      // Get basic count data
      const allPredictions = await db.select().from(predictions);
      const allBattles = await db.select().from(predictionBattles);
      const allUsers = await db.select().from(users);
      const allTransactions = await db.select().from(transactionLogs);
      const allSurvivalTournaments = await db.select().from(survivalTournaments);

      // Calculate active counts
      const activePredictions = allPredictions.filter(p => p.status === 'pending').length;
      const activeBattles = allBattles.filter(b => b.status === 'open' || b.status === 'active').length;
      const activeSurvivalTournaments = allSurvivalTournaments.filter(s => s.status === 'open' || s.status === 'active').length;

      // Calculate stake amounts
      const totalPredictionStakes = allPredictions.reduce((sum, p) => sum + (Number(p.stakeAmount) || 0), 0);
      console.log(`📊 [PLATFORM STATS] Total Prediction Stakes: ${totalPredictionStakes} NTIQ`);
      
      const totalBattleStakes = allBattles.reduce((sum, battle) => {
        const stakeAmount = Number(battle.stakeAmount) || 0;
        // Only multiply by 2 if battle has 2 participants (active or completed)
        // For open battles, only count the challenger's stake (x1)
        const multiplier = (battle.status === 'open') ? 1 : 2;
        console.log(`📊 [PLATFORM STATS] Battle ID ${battle.id}: stake=${stakeAmount}, status=${battle.status}, multiplier=${multiplier}, total=${stakeAmount * multiplier}`);
        return sum + (stakeAmount * multiplier);
      }, 0);
      console.log(`📊 [PLATFORM STATS] Total Battle Stakes: ${totalBattleStakes} NTIQ`);

      // Calculate total rewards from transaction logs
      const rewardTransactions = allTransactions.filter(t => 
        t.type === 'prediction_reward' || 
        t.type === 'battle_reward' || 
        t.type === 'achievement_reward' || 
        t.type === 'daily_challenge_reward'
      );
      const totalRewardsDistributed = rewardTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const stats = {
        totalPredictions: allPredictions.length,
        totalBattles: allBattles.length,
        totalSurvivalTournaments: allSurvivalTournaments.length,
        totalStakedNTIQ: Math.round(totalPredictionStakes + totalBattleStakes),
        totalRewardsDistributed: Math.round(totalRewardsDistributed),
        activePredictions,
        activeBattles,
        activeSurvivalTournaments,
        totalUsers: allUsers.length,
        totalTransactions: allTransactions.length
      };

      console.log('✅ [PLATFORM STATS] Real database stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [PLATFORM STATS] Error:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
