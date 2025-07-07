import { pgTable, text, integer, decimal, boolean, timestamp, serial, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabel untuk manajemen wallet multi-chain
export const userWallets = pgTable("user_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletType: varchar("wallet_type", { length: 50 }).notNull(), // "MetaMask", "Phantom", "TrustWallet", etc.
  chainType: varchar("chain_type", { length: 50 }).notNull(), // "ethereum", "bsc", "solana", "polygon"
  walletAddress: text("wallet_address").notNull(),
  publicKey: text("public_key"),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabel untuk saldo multi-chain per user
export const chainBalances = pgTable("chain_balances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull(),
  chainType: varchar("chain_type", { length: 50 }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 20 }).notNull(), // "ETH", "BNB", "SOL", "MATIC"
  tokenAddress: text("token_address"), // Contract address untuk token (null untuk native token)
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
  usdValue: decimal("usd_value", { precision: 15, scale: 2 }).default("0"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Tabel untuk deposit/top-up transactions
export const depositTransactions = pgTable("deposit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull(),
  chainType: varchar("chain_type", { length: 50 }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  usdAmount: decimal("usd_amount", { precision: 15, scale: 2 }),
  transactionHash: text("transaction_hash").notNull(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // "pending", "confirmed", "failed"
  blockNumber: integer("block_number"),
  gasUsed: decimal("gas_used", { precision: 20, scale: 8 }),
  gasFee: decimal("gas_fee", { precision: 20, scale: 8 }),
  confirmations: integer("confirmations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// Tabel untuk smart contract interactions
export const smartContractInteractions = pgTable("smart_contract_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull(),
  chainType: varchar("chain_type", { length: 50 }).notNull(),
  contractAddress: text("contract_address").notNull(),
  functionName: varchar("function_name", { length: 100 }).notNull(),
  inputData: jsonb("input_data"), // Parameter function
  outputData: jsonb("output_data"), // Return value
  transactionHash: text("transaction_hash"),
  gasLimit: decimal("gas_limit", { precision: 20, scale: 8 }),
  gasUsed: decimal("gas_used", { precision: 20, scale: 8 }),
  gasPrice: decimal("gas_price", { precision: 20, scale: 8 }),
  status: varchar("status", { length: 20 }).default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  executedAt: timestamp("executed_at"),
});

// Tabel untuk internal credit system (saldo in-app)
export const inAppCredits = pgTable("in_app_credits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  creditType: varchar("credit_type", { length: 50 }).notNull(), // "NTIQ", "GAME_COINS", "BONUS"
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull(), // "deposit", "reward", "purchase", "referral"
  sourceId: integer("source_id"), // ID dari source transaction
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabel untuk withdraw/penarikan otomatis
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull(),
  chainType: varchar("chain_type", { length: 50 }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  usdAmount: decimal("usd_amount", { precision: 15, scale: 2 }),
  toAddress: text("to_address").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // "pending", "processing", "completed", "failed", "cancelled"
  transactionHash: text("transaction_hash"),
  gasEstimate: decimal("gas_estimate", { precision: 20, scale: 8 }),
  actualGasFee: decimal("actual_gas_fee", { precision: 20, scale: 8 }),
  processingFee: decimal("processing_fee", { precision: 20, scale: 8 }),
  netAmount: decimal("net_amount", { precision: 20, scale: 8 }),
  errorMessage: text("error_message"),
  adminNote: text("admin_note"),
  processedBy: integer("processed_by"), // Admin user ID
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at"),
});

// Tabel untuk konfigurasi chain dan token
export const supportedChains = pgTable("supported_chains", {
  id: serial("id").primaryKey(),
  chainId: varchar("chain_id", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  rpcUrl: text("rpc_url").notNull(),
  blockExplorerUrl: text("block_explorer_url"),
  isTestnet: boolean("is_testnet").default(false),
  isActive: boolean("is_active").default(true),
  minConfirmations: integer("min_confirmations").default(12),
  avgBlockTime: integer("avg_block_time").default(15), // seconds
  gasMultiplier: decimal("gas_multiplier", { precision: 3, scale: 2 }).default("1.2"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportedTokens = pgTable("supported_tokens", {
  id: serial("id").primaryKey(),
  chainId: varchar("chain_id", { length: 20 }).notNull(),
  contractAddress: text("contract_address"), // null untuk native token
  symbol: varchar("symbol", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  decimals: integer("decimals").notNull(),
  isNative: boolean("is_native").default(false),
  isActive: boolean("is_active").default(true),
  minDeposit: decimal("min_deposit", { precision: 20, scale: 8 }).default("0"),
  maxDeposit: decimal("max_deposit", { precision: 20, scale: 8 }),
  withdrawalFee: decimal("withdrawal_fee", { precision: 20, scale: 8 }).default("0"),
  logoUrl: text("logo_url"),
  coingeckoId: varchar("coingecko_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas untuk validation
export const insertUserWalletSchema = createInsertSchema(userWallets);
export const insertChainBalanceSchema = createInsertSchema(chainBalances);
export const insertDepositTransactionSchema = createInsertSchema(depositTransactions);
export const insertSmartContractInteractionSchema = createInsertSchema(smartContractInteractions);
export const insertInAppCreditSchema = createInsertSchema(inAppCredits);
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests);
export const insertSupportedChainSchema = createInsertSchema(supportedChains);
export const insertSupportedTokenSchema = createInsertSchema(supportedTokens);

// Types
export type UserWallet = typeof userWallets.$inferSelect;
export type InsertUserWallet = z.infer<typeof insertUserWalletSchema>;
export type ChainBalance = typeof chainBalances.$inferSelect;
export type InsertChainBalance = z.infer<typeof insertChainBalanceSchema>;
export type DepositTransaction = typeof depositTransactions.$inferSelect;
export type InsertDepositTransaction = z.infer<typeof insertDepositTransactionSchema>;
export type SmartContractInteraction = typeof smartContractInteractions.$inferSelect;
export type InsertSmartContractInteraction = z.infer<typeof insertSmartContractInteractionSchema>;
export type InAppCredit = typeof inAppCredits.$inferSelect;
export type InsertInAppCredit = z.infer<typeof insertInAppCreditSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type SupportedChain = typeof supportedChains.$inferSelect;
export type InsertSupportedChain = z.infer<typeof insertSupportedChainSchema>;
export type SupportedToken = typeof supportedTokens.$inferSelect;
export type InsertSupportedToken = z.infer<typeof insertSupportedTokenSchema>;