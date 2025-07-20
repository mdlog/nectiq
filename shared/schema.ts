import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, decimal, jsonb } from "drizzle-orm/pg-core";
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
  profilePhoto: text("profile_photo"),
  email: text("email"),
  twitterHandle: text("twitter_handle"),
  emailVerified: boolean("email_verified").notNull().default(false),
  twitterVerified: boolean("twitter_verified").notNull().default(false),
  referralCode: varchar("referral_code", { length: 8 }).unique(),
  referredBy: integer("referred_by").references(() => users.id),
  totalReferrals: integer("total_referrals").notNull().default(0),
  referralRewards: integer("referral_rewards").notNull().default(0),
  loyaltyTier: varchar("loyalty_tier", { length: 10 }).notNull().default("bronze"), // bronze, silver, gold, platinum
  lifetimeEarnings: integer("lifetime_earnings").notNull().default(0), // Total NTIQ earned (untuk tier calculation)
  lastTierUpdate: timestamp("last_tier_update").defaultNow(),
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
  amount: integer("amount").notNull(), // Can be positive (win) or negative (loss)
  cryptocurrency: varchar("cryptocurrency", { length: 20 }).notNull(),
  accuracy: varchar("accuracy", { length: 10 }),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Multi-Chain Deposits Table
export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fromWalletAddress: varchar("from_wallet_address", { length: 42 }).notNull(), // User's wallet address
  toWalletAddress: varchar("to_wallet_address", { length: 42 }).notNull(), // Admin wallet address
  chainName: varchar("chain_name", { length: 20 }).notNull(), // eth, base, bsc, optimism, arbitrum, sepolia, holesky
  chainId: integer("chain_id").notNull(), // Chain ID for verification
  tokenType: varchar("token_type", { length: 10 }).notNull(), // ETH, USDC, or USDT
  tokenAddress: varchar("token_address", { length: 42 }).notNull(), // Token contract address
  amountUSD: numeric("amount_usd", { precision: 18, scale: 6 }).notNull(), // USD amount deposited
  ntiqAmount: integer("ntiq_amount").notNull(), // NTIQ amount to credit (amountUSD * 100)
  ethPriceSnapshot: numeric("eth_price_snapshot", { precision: 20, scale: 8 }), // ETH price at deposit creation time
  transactionHash: varchar("transaction_hash", { length: 66 }).unique(),
  blockNumber: integer("block_number"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, confirmed, processed, failed, cancelled
  processedAt: timestamp("processed_at"),
  expiresAt: timestamp("expires_at").notNull(), // Deposit expires after 1 hour if not completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  ntiqAmount: integer("ntiq_amount").notNull(), // NTIQ amount to withdraw
  usdAmount: numeric("usd_amount", { precision: 18, scale: 6 }).notNull(), // USD equivalent (ntiqAmount * 0.01)
  feeAmount: numeric("fee_amount", { precision: 18, scale: 6 }).default("0"), // 2.5% processing fee amount in token
  netAmount: numeric("net_amount", { precision: 18, scale: 6 }).notNull(), // Amount user receives after fee (97.5% of total)
  ethPriceSnapshot: numeric("eth_price_snapshot", { precision: 20, scale: 8 }), // ETH price at withdrawal creation time
  chainName: varchar("chain_name", { length: 20 }).notNull(), // Target chain for withdrawal
  tokenType: varchar("token_type", { length: 10 }).notNull(), // ETH, USDC, or USDT
  toWalletAddress: varchar("to_wallet_address", { length: 42 }).notNull(), // User's wallet address
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, processing, completed, rejected
  transactionHash: varchar("transaction_hash", { length: 66 }),
  adminNote: text("admin_note"), // Admin note for approval/rejection
  processedBy: integer("processed_by").references(() => users.id), // Admin who processed it
  processedAt: timestamp("processed_at"), // When it was processed
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

// Referral System Tables - moved to line 247

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

export const userVerifications = pgTable("user_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletAddress: text("wallet_address").notNull(),
  email: text("email"),
  twitterHandle: text("twitter_handle"),
  emailVerificationCode: text("email_verification_code"),
  twitterVerificationCode: text("twitter_verification_code"),
  emailVerified: boolean("email_verified").notNull().default(false),
  twitterVerified: boolean("twitter_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cryptoTransactions = pgTable("crypto_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  transactionHash: varchar("transaction_hash", { length: 66 }).notNull().unique(),
  paymentToken: varchar("payment_token", { length: 10 }).notNull(), // ETH, USDT, USDC
  cryptoAmount: numeric("crypto_amount", { precision: 18, scale: 8 }).notNull(),
  ntiqAmount: integer("ntiq_amount").notNull(),
  userAddress: varchar("user_address", { length: 42 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, completed, failed
  blockNumber: integer("block_number"),
  gasUsed: varchar("gas_used", { length: 50 }),
  networkFee: varchar("network_fee", { length: 50 }),
  exchangeRate: numeric("exchange_rate", { precision: 18, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredId: integer("referred_id").notNull().references(() => users.id),
  referralCode: varchar("referral_code", { length: 8 }),
  reward: integer("reward").notNull().default(100), // Default 100 NTIQ reward
  isRewarded: boolean("is_rewarded").notNull().default(false),
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

export const predictionReactions = pgTable("prediction_reactions", {
  id: serial("id").primaryKey(),
  predictionId: integer("prediction_id").notNull().references(() => predictions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 20 }).notNull(), // like, fire, rocket, thinking
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const predictionComments = pgTable("prediction_comments", {
  id: serial("id").primaryKey(),
  predictionId: integer("prediction_id").notNull().references(() => predictions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  imageUrl: text("image_url"),
  eventType: varchar("event_type", { length: 30 }).notNull().default("nectiq"), // "nectiq", "partner", "community"
  status: varchar("status", { length: 20 }).notNull().default("upcoming"), // "upcoming", "ongoing", "completed", "cancelled"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationUrl: text("registration_url"),
  externalUrl: text("external_url"),
  prizePool: text("prize_pool"),
  participantCount: integer("participant_count").default(0),
  maxParticipants: integer("max_participants"),
  requirements: text("requirements"),
  tags: text("tags"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Anti-Multi Wallet Abuse Tables
export const walletFingerprints = pgTable("wallet_fingerprints", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 100 }).notNull(),
  userId: integer("user_id").references(() => users.id),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent").notNull(),
  browserFingerprint: varchar("browser_fingerprint", { length: 64 }),
  deviceFingerprint: varchar("device_fingerprint", { length: 64 }),
  screenResolution: varchar("screen_resolution", { length: 20 }),
  timezone: varchar("timezone", { length: 50 }),
  language: varchar("language", { length: 10 }),
  platform: varchar("platform", { length: 50 }),
  colorDepth: varchar("color_depth", { length: 10 }),
  pixelRatio: varchar("pixel_ratio", { length: 10 }),
  hardwareConcurrency: varchar("hardware_concurrency", { length: 10 }),
  maxTouchPoints: varchar("max_touch_points", { length: 10 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const abuseDetections = pgTable("abuse_detections", {
  id: serial("id").primaryKey(),
  primaryWalletAddress: varchar("primary_wallet_address", { length: 100 }).notNull(),
  suspiciousWalletAddresses: text("suspicious_wallet_addresses").notNull(), // JSON array of wallet addresses
  similarityScore: numeric("similarity_score", { precision: 5, scale: 2 }).notNull(),
  detectionReason: text("detection_reason").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // "pending", "reviewed", "confirmed", "false_positive"
  action: varchar("action", { length: 20 }).notNull().default("warn"), // "allow", "warn", "block"
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Prediction Battles System
export const predictionBattles = pgTable("prediction_battles", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").references(() => users.id).notNull(),
  challengedId: integer("challenged_id").references(() => users.id),
  battleType: varchar("battle_type", { length: 20 }).notNull().default("head_to_head"), // 'head_to_head', 'tournament', 'public_challenge'
  cryptocurrency: varchar("cryptocurrency", { length: 20 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull(), // 1h, 6h, 24h, 7d
  stakeAmount: integer("stake_amount").notNull(),
  challengerPrediction: numeric("challenger_prediction", { precision: 18, scale: 8 }),
  challengedPrediction: numeric("challenged_prediction", { precision: 18, scale: 8 }),
  actualPrice: numeric("actual_price", { precision: 18, scale: 8 }),
  winnerId: integer("winner_id").references(() => users.id),
  winnerReward: integer("winner_reward").default(0),
  status: varchar("status", { length: 20 }).notNull().default("open"), // 'open', 'accepted', 'active', 'completed', 'cancelled'
  targetTime: timestamp("target_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  spectatorCount: integer("spectator_count").default(0),
  isPublic: boolean("is_public").default(true),
  
  // Anti-Late Joining Mechanisms
  joinDeadline: timestamp("join_deadline").notNull(), // Deadline untuk bergabung (misal: 80% dari total waktu)
  minimumJoinTime: integer("minimum_join_time").notNull().default(300), // Minimum 5 menit untuk bergabung
  priceAtCreation: numeric("price_at_creation", { precision: 18, scale: 8 }).notNull(), // Harga saat battle dibuat
  priceMovementPenalty: boolean("price_movement_penalty").default(true), // Apakah ada penalti movement
  fairnessMultiplier: numeric("fairness_multiplier", { precision: 5, scale: 2 }).default("1.00"), // Multiplier keadilan
  joinTimeBonus: numeric("join_time_bonus", { precision: 5, scale: 2 }).default("1.00"), // Bonus untuk join lebih awal
});

export const battleSpectators = pgTable("battle_spectators", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").references(() => predictionBattles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  leftAt: timestamp("left_at"),
});

export const battleComments: any = pgTable("battle_comments", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").references(() => predictionBattles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  replyToId: integer("reply_to_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const battleReactions = pgTable("battle_reactions", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").references(() => predictionBattles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(), // 'like', 'fire', 'rocket', 'thinking', 'clap'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Survival Tournament Tables
export const survivalTournaments = pgTable("survival_tournaments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  cryptocurrency: varchar("cryptocurrency", { length: 20 }).notNull(),
  entryFee: integer("entry_fee").notNull().default(100), // NTIQ required to join
  prizePool: integer("prize_pool").notNull().default(0),
  maxParticipants: integer("max_participants").notNull().default(32),
  currentParticipants: integer("current_participants").notNull().default(0),
  roundDuration: integer("round_duration").notNull().default(60), // minutes per round (default for all rounds)
  round1Duration: integer("round1_duration"), // minutes for round 1 (overrides roundDuration if set)
  round2Duration: integer("round2_duration"), // minutes for round 2 (overrides roundDuration if set)
  round3Duration: integer("round3_duration"), // minutes for round 3 (overrides roundDuration if set)
  rewardType: varchar("reward_type", { length: 10 }).notNull().default("NTIQ"), // NTIQ, USDT, USDC
  rewardAmount: integer("reward_amount").notNull().default(1000), // Winner reward amount
  status: varchar("status", { length: 20 }).notNull().default("open"), // open, active, completed, cancelled
  currentRound: integer("current_round").notNull().default(0),
  winnerId: integer("winner_id").references(() => users.id),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  nextRoundTime: timestamp("next_round_time"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const survivalParticipants = pgTable("survival_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => survivalTournaments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, eliminated, winner
  eliminatedRound: integer("eliminated_round"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  eliminatedAt: timestamp("eliminated_at"),
});

export const survivalRounds = pgTable("survival_rounds", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => survivalTournaments.id).notNull(),
  roundNumber: integer("round_number").notNull(),
  cryptocurrency: varchar("cryptocurrency", { length: 20 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  startPrice: numeric("start_price", { precision: 18, scale: 8 }).notNull(),
  endPrice: numeric("end_price", { precision: 18, scale: 8 }),
  priceDirection: varchar("price_direction", { length: 10 }), // up, down, calculated after round
  eliminatedCount: integer("eliminated_count").notNull().default(0),
  survivorCount: integer("survivor_count").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, active, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const survivalPredictions = pgTable("survival_predictions", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => survivalTournaments.id).notNull(),
  roundId: integer("round_id").references(() => survivalRounds.id).notNull(),
  participantId: integer("participant_id").references(() => survivalParticipants.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  prediction: varchar("prediction", { length: 10 }).notNull(), // "up" or "down"
  startingPrice: numeric("starting_price", { precision: 18, scale: 8 }).notNull(), // Price when prediction was made
  endingPrice: numeric("ending_price", { precision: 18, scale: 8 }), // Price when round ended
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  isCorrect: boolean("is_correct"),
  points: integer("points").default(0),
  
  // Anti-Gaming System Fields
  roundStartTime: timestamp("round_start_time").notNull(), // When the round started
  roundDuration: integer("round_duration").notNull(), // Round duration in milliseconds
  submissionTimePercentage: numeric("submission_time_percentage", { precision: 5, scale: 2 }).notNull(), // 0.00 to 1.00 (0% to 100% of round)
  timingMultiplier: numeric("timing_multiplier", { precision: 3, scale: 2 }).notNull().default("1.00"), // Bonus/penalty multiplier based on submission timing
  predictionDeadlinePassed: boolean("prediction_deadline_passed").notNull().default(false), // Whether prediction was made after deadline
  earlyBirdBonus: boolean("early_bird_bonus").notNull().default(false), // Whether user got early bird bonus
  latePenalty: boolean("late_penalty").notNull().default(false), // Whether user got late penalty
});

// Loyalty Program Tables
export const loyaltyTiers = pgTable("loyalty_tiers", {
  id: serial("id").primaryKey(),
  tierName: varchar("tier_name", { length: 10 }).notNull().unique(), // bronze, silver, gold, platinum
  minEarnings: integer("min_earnings").notNull(), // Minimum lifetime earnings required
  maxEarnings: integer("max_earnings"), // Maximum for this tier (null for highest tier)
  rewardMultiplier: numeric("reward_multiplier", { precision: 3, scale: 2 }).notNull().default("1.00"), // 1.00, 1.10, 1.25, 1.50
  cashbackPercentage: numeric("cashback_percentage", { precision: 3, scale: 2 }).notNull().default("1.00"), // 1%, 2%, 3%, 5%
  monthlyBonus: integer("monthly_bonus").notNull().default(0), // Monthly NTIQ bonus
  freeInsuranceDaily: integer("free_insurance_daily").notNull().default(0), // Free prediction insurance per day
  prioritySupport: boolean("priority_support").notNull().default(false),
  earlyAccess: boolean("early_access").notNull().default(false),
  personalManager: boolean("personal_manager").notNull().default(false),
});

export const monthlyTierRewards = pgTable("monthly_tier_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  tier: varchar("tier", { length: 10 }).notNull(),
  bonusAmount: integer("bonus_amount").notNull(),
  freeEntries: integer("free_entries").notNull().default(0),
  claimed: boolean("claimed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tierPromotions = pgTable("tier_promotions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fromTier: varchar("from_tier", { length: 10 }).notNull(),
  toTier: varchar("to_tier", { length: 10 }).notNull(),
  lifetimeEarnings: integer("lifetime_earnings").notNull(), // Earnings at time of promotion
  promotedAt: timestamp("promoted_at").notNull().defaultNow(),
  celebrationSent: boolean("celebration_sent").notNull().default(false),
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
  referredUser: one(users, {
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

export const eventsRelations = relations(events, ({ one }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
}));

export const predictionReactionsRelations = relations(predictionReactions, ({ one }) => ({
  prediction: one(predictions, {
    fields: [predictionReactions.predictionId],
    references: [predictions.id],
  }),
  user: one(users, {
    fields: [predictionReactions.userId],
    references: [users.id],
  }),
}));

export const predictionCommentsRelations = relations(predictionComments, ({ one }) => ({
  prediction: one(predictions, {
    fields: [predictionComments.predictionId],
    references: [predictions.id],
  }),
  user: one(users, {
    fields: [predictionComments.userId],
    references: [users.id],
  }),
}));

// Battle Relations
export const predictionBattlesRelations = relations(predictionBattles, ({ one, many }) => ({
  challenger: one(users, {
    fields: [predictionBattles.challengerId],
    references: [users.id],
    relationName: "challenger",
  }),
  challenged: one(users, {
    fields: [predictionBattles.challengedId],
    references: [users.id],
    relationName: "challenged",
  }),
  winner: one(users, {
    fields: [predictionBattles.winnerId],
    references: [users.id],
    relationName: "winner",
  }),
  spectators: many(battleSpectators),
  comments: many(battleComments),
  reactions: many(battleReactions),
}));

export const battleSpectatorsRelations = relations(battleSpectators, ({ one }) => ({
  battle: one(predictionBattles, {
    fields: [battleSpectators.battleId],
    references: [predictionBattles.id],
  }),
  user: one(users, {
    fields: [battleSpectators.userId],
    references: [users.id],
  }),
}));

export const battleCommentsRelations = relations(battleComments, ({ one }) => ({
  battle: one(predictionBattles, {
    fields: [battleComments.battleId],
    references: [predictionBattles.id],
  }),
  user: one(users, {
    fields: [battleComments.userId],
    references: [users.id],
  }),
  replyTo: one(battleComments, {
    fields: [battleComments.replyToId],
    references: [battleComments.id],
  }),
}));

export const battleReactionsRelations = relations(battleReactions, ({ one }) => ({
  battle: one(predictionBattles, {
    fields: [battleReactions.battleId],
    references: [predictionBattles.id],
  }),
  user: one(users, {
    fields: [battleReactions.userId],
    references: [users.id],
  }),
}));

// Survival Tournament Relations
export const survivalTournamentsRelations = relations(survivalTournaments, ({ one, many }) => ({
  creator: one(users, {
    fields: [survivalTournaments.createdBy],
    references: [users.id],
  }),
  winner: one(users, {
    fields: [survivalTournaments.winnerId],
    references: [users.id],
  }),
  participants: many(survivalParticipants),
  rounds: many(survivalRounds),
}));

export const survivalParticipantsRelations = relations(survivalParticipants, ({ one, many }) => ({
  tournament: one(survivalTournaments, {
    fields: [survivalParticipants.tournamentId],
    references: [survivalTournaments.id],
  }),
  user: one(users, {
    fields: [survivalParticipants.userId],
    references: [users.id],
  }),
  predictions: many(survivalPredictions),
}));

export const survivalRoundsRelations = relations(survivalRounds, ({ one, many }) => ({
  tournament: one(survivalTournaments, {
    fields: [survivalRounds.tournamentId],
    references: [survivalTournaments.id],
  }),
  predictions: many(survivalPredictions),
}));

export const survivalPredictionsRelations = relations(survivalPredictions, ({ one }) => ({
  tournament: one(survivalTournaments, {
    fields: [survivalPredictions.tournamentId],
    references: [survivalTournaments.id],
  }),
  round: one(survivalRounds, {
    fields: [survivalPredictions.roundId],
    references: [survivalRounds.id],
  }),
  participant: one(survivalParticipants, {
    fields: [survivalPredictions.participantId],
    references: [survivalParticipants.id],
  }),
  user: one(users, {
    fields: [survivalPredictions.userId],
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

// Deposits Relations
export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, {
    fields: [deposits.userId],
    references: [users.id],
  }),
}));

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  blockNumber: true,
  status: true,
  processedAt: true,
  expiresAt: true,
  createdAt: true,
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
  status: true,
  transactionHash: true,
  adminNote: true,
  processedBy: true,
  processedAt: true,
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

export const insertPredictionReactionSchema = createInsertSchema(predictionReactions).omit({
  id: true,
  createdAt: true,
});

export const insertPredictionCommentSchema = createInsertSchema(predictionComments).omit({
  id: true,
  createdAt: true,
});

export type PredictionReaction = typeof predictionReactions.$inferSelect;
export type InsertPredictionReaction = z.infer<typeof insertPredictionReactionSchema>;

export type PredictionComment = typeof predictionComments.$inferSelect;
export type InsertPredictionComment = z.infer<typeof insertPredictionCommentSchema>;

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

// Event types
export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Battle types
export const insertPredictionBattleSchema = createInsertSchema(predictionBattles).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
  completedAt: true,
  spectatorCount: true,
  winnerId: true,
  winnerReward: true,
  actualPrice: true,
}).extend({
  timeframe: z.enum(["1h", "6h", "24h", "7d"]),
  battleType: z.enum(["head_to_head", "tournament", "public_challenge"]),
});

export const insertBattleSpectatorSchema = createInsertSchema(battleSpectators).omit({
  id: true,
  joinedAt: true,
  leftAt: true,
});

export const insertBattleCommentSchema = createInsertSchema(battleComments).omit({
  id: true,
  createdAt: true,
});

export const insertBattleReactionSchema = createInsertSchema(battleReactions).omit({
  id: true,
  createdAt: true,
});

export type PredictionBattle = typeof predictionBattles.$inferSelect;
export type InsertPredictionBattle = z.infer<typeof insertPredictionBattleSchema>;

// Survival Tournament insert schemas and types
export const insertSurvivalTournamentSchema = createInsertSchema(survivalTournaments).omit({
  id: true,
  currentParticipants: true,
  prizePool: true,
  currentRound: true,
  winnerId: true,
  startTime: true,
  endTime: true,
  nextRoundTime: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurvivalParticipantSchema = createInsertSchema(survivalParticipants).omit({
  id: true,
  eliminatedRound: true,
  joinedAt: true,
  eliminatedAt: true,
});

export const insertSurvivalRoundSchema = createInsertSchema(survivalRounds).omit({
  id: true,
  endPrice: true,
  priceDirection: true,
  eliminatedCount: true,
  survivorCount: true,
  createdAt: true,
  completedAt: true,
});

export const insertSurvivalPredictionSchema = createInsertSchema(survivalPredictions).omit({
  id: true,
  submittedAt: true,
  isCorrect: true,
  points: true,
}).extend({
  prediction: z.enum(["up", "down"]),
});

export type SurvivalTournament = typeof survivalTournaments.$inferSelect;
export type InsertSurvivalTournament = z.infer<typeof insertSurvivalTournamentSchema>;

export type SurvivalParticipant = typeof survivalParticipants.$inferSelect;
export type InsertSurvivalParticipant = z.infer<typeof insertSurvivalParticipantSchema>;

export type SurvivalRound = typeof survivalRounds.$inferSelect;
export type InsertSurvivalRound = z.infer<typeof insertSurvivalRoundSchema>;

export type SurvivalPrediction = typeof survivalPredictions.$inferSelect;
export type InsertSurvivalPrediction = z.infer<typeof insertSurvivalPredictionSchema>;
export type BattleSpectator = typeof battleSpectators.$inferSelect;
export type InsertBattleSpectator = z.infer<typeof insertBattleSpectatorSchema>;
export type BattleComment = typeof battleComments.$inferSelect;
export type InsertBattleComment = z.infer<typeof insertBattleCommentSchema>;
export type BattleReaction = typeof battleReactions.$inferSelect;
export type InsertBattleReaction = z.infer<typeof insertBattleReactionSchema>;

// Crypto transaction types
export const insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions).omit({
  id: true,
  blockNumber: true,
  gasUsed: true,
  networkFee: true,
  createdAt: true,
  updatedAt: true,
});

export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = z.infer<typeof insertCryptoTransactionSchema>;


