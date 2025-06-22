import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: varchar("uid", { length: 9 }).notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password"),
  walletAddress: text("wallet_address"),
  authMethod: varchar("auth_method", { length: 20 }).notNull().default("password"), // "password" or "wallet"
  isAdmin: boolean("is_admin").notNull().default(false),
  balance: integer("balance").notNull().default(1000),
  totalPredictions: integer("total_predictions").notNull().default(0),
  correctPredictions: integer("correct_predictions").notNull().default(0),
  totalRewards: integer("total_rewards").notNull().default(0),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cryptocurrency: varchar("cryptocurrency", { length: 20 }).notNull(),
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
  userId: integer("user_id").notNull().references(() => users.id),
  predictionId: integer("prediction_id").notNull().references(() => predictions.id),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  ptsAmount: integer("pts_amount").notNull(),
  tokenAmount: varchar("token_amount", { length: 50 }).notNull(),
  token: varchar("token", { length: 10 }).notNull(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  ptsAmount: integer("pts_amount").notNull(),
  paymentAmount: varchar("payment_amount", { length: 50 }).notNull(),
  paymentToken: varchar("payment_token", { length: 10 }).notNull(),
  transactionHash: varchar("transaction_hash", { length: 66 }),
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  predictions: many(predictions),
  rewards: many(rewards),
  withdrawals: many(withdrawals),
  purchases: many(purchases),
}));

export const predictionsRelations = relations(predictions, ({ one, many }) => ({
  user: one(users, {
    fields: [predictions.userId],
    references: [users.id],
  }),
  rewards: many(rewards),
}));

export const rewardsRelations = relations(rewards, ({ one }) => ({
  user: one(users, {
    fields: [rewards.userId],
    references: [users.id],
  }),
  prediction: one(predictions, {
    fields: [rewards.predictionId],
    references: [predictions.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  uid: true,
  balance: true,
  totalPredictions: true,
  correctPredictions: true,
  totalRewards: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  userId: true,
  actualPrice: true,
  completedAt: true,
  status: true,
  rewardAmount: true,
  accuracy: true,
  targetTime: true,
  createdAt: true,
}).extend({
  timeframe: z.enum(["1h", "6h", "24h", "7d"]),
  cryptocurrency: z.enum(["bitcoin", "ethereum", "binancecoin", "cardano", "solana"]),
});

export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies);

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  createdAt: true,
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

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
