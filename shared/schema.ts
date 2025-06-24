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

// Achievement System Tables
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'prediction_count', 'accuracy', 'streak', 'rewards'
  target: integer("target").notNull(), // target value to achieve
  reward: integer("reward").notNull(), // PTS reward
  icon: varchar("icon", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Challenges Tables
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'make_predictions', 'accuracy_target', 'login_streak'
  target: integer("target").notNull(),
  reward: integer("reward").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userDailyChallenges = pgTable("user_daily_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => dailyChallenges.id).notNull(),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referral System Tables
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredId: integer("referred_id").references(() => users.id).notNull(),
  referralCode: varchar("referral_code", { length: 20 }).notNull(),
  reward: integer("reward").default(1000), // 1000 PTS bonus
  isRewarded: boolean("is_rewarded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Analytics Tables
export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  predictionsCount: integer("predictions_count").default(0),
  correctPredictions: integer("correct_predictions").default(0),
  totalStaked: integer("total_staked").default(0),
  totalRewards: integer("total_rewards").default(0),
  winStreak: integer("win_streak").default(0),
  maxWinStreak: integer("max_win_streak").default(0),
  loginStreak: integer("login_streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security Events and Admin Logs Tables
export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  event: text("event").notNull(),
  details: text("details").notNull(),
  severity: varchar("severity", { length: 20 }).notNull().default("medium"), // 'low', 'medium', 'high', 'critical'
  walletAddress: varchar("wallet_address", { length: 42 }),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  country: varchar("country", { length: 100 }),
  status: varchar("status", { length: 30 }).notNull().default("investigating"), // 'investigating', 'under-review', 'verified', 'auto-blocked'
  resolved: boolean("resolved").default(false),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  targetType: varchar("target_type", { length: 50 }), // 'user', 'prediction', 'security_event', 'settings'
  targetId: integer("target_id"),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
  dataType: varchar("data_type", { length: 20 }).notNull().default("string"), // 'string', 'number', 'boolean', 'json'
  description: text("description"),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transactionLogs = pgTable("transaction_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 30 }).notNull(), // 'purchase', 'withdrawal', 'reward', 'stake', 'refund'
  amount: integer("amount").notNull(),
  token: varchar("token", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  hash: varchar("hash", { length: 66 }),
  fromAddress: varchar("from_address", { length: 42 }),
  toAddress: varchar("to_address", { length: 42 }),
  networkFee: varchar("network_fee", { length: 50 }),
  exchangeRate: numeric("exchange_rate", { precision: 18, scale: 8 }),
  relatedId: integer("related_id"), // ID of related purchase, withdrawal, prediction, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  isActive: boolean("is_active").notNull().default(true),
  position: varchar("position", { length: 20 }).notNull().default("below_live_prices"),
  priority: integer("priority").notNull().default(0),
  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  predictions: many(predictions),
  rewards: many(rewards),
  withdrawals: many(withdrawals),
  purchases: many(purchases),
  achievements: many(userAchievements),
  dailyChallenges: many(userDailyChallenges),
  referralsGiven: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" }),
  analytics: many(userAnalytics),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const dailyChallengesRelations = relations(dailyChallenges, ({ many }) => ({
  userChallenges: many(userDailyChallenges),
}));

export const userDailyChallengesRelations = relations(userDailyChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userDailyChallenges.userId],
    references: [users.id],
  }),
  challenge: one(dailyChallenges, {
    fields: [userDailyChallenges.challengeId],
    references: [dailyChallenges.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const userAnalyticsRelations = relations(userAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [userAnalytics.userId],
    references: [users.id],
  }),
}));

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, {
    fields: [securityEvents.userId],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [securityEvents.resolvedBy],
    references: [users.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
  }),
}));

export const transactionLogsRelations = relations(transactionLogs, ({ one }) => ({
  user: one(users, {
    fields: [transactionLogs.userId],
    references: [users.id],
  }),
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

// Achievement types
export const insertAchievementSchema = createInsertSchema(achievements);
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Daily Challenge types
export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges);
export const insertUserDailyChallengeSchema = createInsertSchema(userDailyChallenges).omit({
  id: true,
  createdAt: true,
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type UserDailyChallenge = typeof userDailyChallenges.$inferSelect;
export type InsertUserDailyChallenge = z.infer<typeof insertUserDailyChallengeSchema>;

// Referral types
export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

// Analytics types
export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
  createdAt: true,
});

export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;

// Transaction Log types
export const insertTransactionLogSchema = createInsertSchema(transactionLogs).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertTransactionLog = z.infer<typeof insertTransactionLogSchema>;
export type TransactionLog = typeof transactionLogs.$inferSelect;

// Banner types
export const insertBannerSchema = createInsertSchema(banners).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;
