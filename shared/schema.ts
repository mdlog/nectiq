import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(1000),
  totalPredictions: integer("total_predictions").notNull().default(0),
  correctPredictions: integer("correct_predictions").notNull().default(0),
  totalRewards: integer("total_rewards").notNull().default(0),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cryptocurrency: varchar("cryptocurrency", { length: 10 }).notNull(),
  predictedPrice: numeric("predicted_price", { precision: 18, scale: 8 }).notNull(),
  actualPrice: numeric("actual_price", { precision: 18, scale: 8 }),
  stakeAmount: integer("stake_amount").notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull(), // 1h, 6h, 24h, 7d
  targetTime: timestamp("target_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, completed, expired
  rewardAmount: integer("reward_amount").default(0),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
});

export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: varchar("id", { length: 20 }).primaryKey(), // e.g., "bitcoin", "ethereum"
  symbol: varchar("symbol", { length: 10 }).notNull(), // e.g., "BTC", "ETH"
  name: text("name").notNull(),
  currentPrice: numeric("current_price", { precision: 18, scale: 8 }).notNull(),
  priceChange24h: numeric("price_change_24h", { precision: 5, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  predictionId: integer("prediction_id").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  balance: true,
  totalPredictions: true,
  correctPredictions: true,
  totalRewards: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  actualPrice: true,
  completedAt: true,
  status: true,
  rewardAmount: true,
  accuracy: true,
}).extend({
  timeframe: z.enum(["1h", "6h", "24h", "7d"]),
  cryptocurrency: z.enum(["bitcoin", "ethereum", "binancecoin", "cardano", "solana"]),
});

export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies);

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptocurrency = z.infer<typeof insertCryptocurrencySchema>;

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
