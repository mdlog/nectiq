import { users, predictions, cryptocurrencies, rewards, type User, type InsertUser, type Prediction, type InsertPrediction, type Cryptocurrency, type InsertCryptocurrency, type Reward, type InsertReward } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: number): Promise<void>;
  updateUserStats(id: number, totalPredictions: number, correctPredictions: number, totalRewards: number): Promise<void>;

  // Prediction operations
  createPrediction(prediction: any): Promise<Prediction>;
  getPrediction(id: number): Promise<Prediction | undefined>;
  getUserPredictions(userId: number): Promise<Prediction[]>;
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
    const [user] = await db
      .insert(users)
      .values(insertUser)
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private predictions: Map<number, Prediction>;
  private cryptocurrencies: Map<string, Cryptocurrency>;
  private rewards: Map<number, Reward>;
  private currentUserId: number;
  private currentPredictionId: number;
  private currentRewardId: number;

  constructor() {
    this.users = new Map();
    this.predictions = new Map();
    this.cryptocurrencies = new Map();
    this.rewards = new Map();
    this.currentUserId = 1;
    this.currentPredictionId = 1;
    this.currentRewardId = 1;

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
    const user: User = { 
      id,
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

  async deleteCryptocurrency(id: string): Promise<void> {
    this.cryptocurrencies.delete(id);
  }
}

export const storage = new DatabaseStorage();
