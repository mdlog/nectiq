import type { Express, Request, Response } from "express";
import { MultiChainWalletService } from "../services/walletService";
import { db } from "../db";
import { userWallets, chainBalances, depositTransactions, withdrawalRequests, supportedChains, supportedTokens, inAppCredits } from "@shared/wallet-schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

// Validation schemas
const addWalletSchema = z.object({
  walletType: z.string().min(1),
  chainType: z.string().min(1),
  walletAddress: z.string().min(1),
  publicKey: z.string().optional()
});

const withdrawSchema = z.object({
  walletId: z.number(),
  chainType: z.string(),
  tokenSymbol: z.string(),
  amount: z.string(),
  toAddress: z.string()
});

const depositSchema = z.object({
  walletId: z.number(),
  chainType: z.string(),
  tokenSymbol: z.string(),
  amount: z.string(),
  transactionHash: z.string(),
  fromAddress: z.string(),
  toAddress: z.string(),
  blockNumber: z.number().optional(),
  gasUsed: z.string().optional(),
  gasFee: z.string().optional()
});

export function setupWalletRoutes(app: Express) {
  // Get wallet summary untuk user
  app.get("/api/wallet/summary", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const summary = await MultiChainWalletService.getWalletSummary(req.session.userId);
      res.json(summary);
    } catch (error) {
      console.error("Error getting wallet summary:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get supported chains
  app.get("/api/wallet/chains", async (req: Request, res: Response) => {
    try {
      const chains = await db.select()
        .from(supportedChains)
        .where(eq(supportedChains.isActive, true))
        .orderBy(supportedChains.name);
      
      res.json(chains);
    } catch (error) {
      console.error("Error getting supported chains:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get supported tokens untuk chain tertentu
  app.get("/api/wallet/tokens/:chainId", async (req: Request, res: Response) => {
    try {
      const { chainId } = req.params;
      
      const tokens = await db.select()
        .from(supportedTokens)
        .where(
          and(
            eq(supportedTokens.chainId, chainId),
            eq(supportedTokens.isActive, true)
          )
        )
        .orderBy(supportedTokens.symbol);
      
      res.json(tokens);
    } catch (error) {
      console.error("Error getting supported tokens:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add wallet baru
  app.post("/api/wallet/add", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validation = addWalletSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: validation.error.errors
        });
      }

      const walletData = validation.data;
      const newWallet = await MultiChainWalletService.registerWallet(req.session.userId, walletData);
      
      res.json({
        success: true,
        wallet: newWallet
      });
    } catch (error) {
      console.error("Error adding wallet:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Create withdrawal request
  app.post("/api/wallet/withdraw", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validation = withdrawSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: validation.error.errors
        });
      }

      const withdrawalData = validation.data;
      const withdrawal = await MultiChainWalletService.createWithdrawalRequest(
        req.session.userId, 
        withdrawalData
      );
      
      res.json({
        success: true,
        withdrawal
      });
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Process deposit (webhook atau manual admin)
  app.post("/api/wallet/deposit", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validation = depositSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: validation.error.errors
        });
      }

      const depositData = {
        ...validation.data,
        userId: req.session.userId
      };

      const deposit = await MultiChainWalletService.processDeposit(depositData);
      
      res.json({
        success: true,
        deposit
      });
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Get user's wallets
  app.get("/api/wallet/my-wallets", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const wallets = await db.select()
        .from(userWallets)
        .where(eq(userWallets.userId, req.session.userId))
        .orderBy(desc(userWallets.createdAt));
      
      res.json(wallets);
    } catch (error) {
      console.error("Error getting user wallets:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get balances untuk wallet tertentu
  app.get("/api/wallet/:walletId/balances", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const walletId = parseInt(req.params.walletId);
      
      // Verify wallet belongs to user
      const wallet = await db.select()
        .from(userWallets)
        .where(
          and(
            eq(userWallets.id, walletId),
            eq(userWallets.userId, req.session.userId)
          )
        )
        .limit(1);

      if (wallet.length === 0) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      const balances = await db.select()
        .from(chainBalances)
        .where(eq(chainBalances.walletId, walletId))
        .orderBy(chainBalances.tokenSymbol);
      
      res.json(balances);
    } catch (error) {
      console.error("Error getting wallet balances:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get transaction history
  app.get("/api/wallet/transactions", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { type = "all", limit = 20, offset = 0 } = req.query;

      let deposits = [];
      let withdrawals = [];

      if (type === "all" || type === "deposits") {
        deposits = await db.select()
          .from(depositTransactions)
          .where(eq(depositTransactions.userId, req.session.userId))
          .orderBy(desc(depositTransactions.createdAt))
          .limit(parseInt(limit as string))
          .offset(parseInt(offset as string));
      }

      if (type === "all" || type === "withdrawals") {
        withdrawals = await db.select()
          .from(withdrawalRequests)
          .where(eq(withdrawalRequests.userId, req.session.userId))
          .orderBy(desc(withdrawalRequests.createdAt))
          .limit(parseInt(limit as string))
          .offset(parseInt(offset as string));
      }

      res.json({
        deposits,
        withdrawals
      });
    } catch (error) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get in-app credits
  app.get("/api/wallet/credits", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const credits = await db.select()
        .from(inAppCredits)
        .where(eq(inAppCredits.userId, req.session.userId))
        .orderBy(desc(inAppCredits.createdAt));
      
      // Calculate totals by credit type
      const summary = credits.reduce((acc, credit) => {
        const type = credit.creditType;
        if (!acc[type]) {
          acc[type] = { total: 0, count: 0 };
        }
        acc[type].total += parseFloat(credit.amount);
        acc[type].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      res.json({
        credits,
        summary
      });
    } catch (error) {
      console.error("Error getting credits:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update wallet verification status
  app.patch("/api/wallet/:walletId/verify", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const walletId = parseInt(req.params.walletId);
      
      // Verify wallet belongs to user
      const wallet = await db.select()
        .from(userWallets)
        .where(
          and(
            eq(userWallets.id, walletId),
            eq(userWallets.userId, req.session.userId)
          )
        )
        .limit(1);

      if (wallet.length === 0) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Update verification status
      await db.update(userWallets)
        .set({ 
          isVerified: true,
          updatedAt: new Date()
        })
        .where(eq(userWallets.id, walletId));
      
      res.json({ success: true, message: "Wallet verified successfully" });
    } catch (error) {
      console.error("Error verifying wallet:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete wallet
  app.delete("/api/wallet/:walletId", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const walletId = parseInt(req.params.walletId);
      
      // Verify wallet belongs to user
      const wallet = await db.select()
        .from(userWallets)
        .where(
          and(
            eq(userWallets.id, walletId),
            eq(userWallets.userId, req.session.userId)
          )
        )
        .limit(1);

      if (wallet.length === 0) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Check if wallet has pending transactions
      const pendingDeposits = await db.select()
        .from(depositTransactions)
        .where(
          and(
            eq(depositTransactions.walletId, walletId),
            eq(depositTransactions.status, "pending")
          )
        );

      const pendingWithdrawals = await db.select()
        .from(withdrawalRequests)
        .where(
          and(
            eq(withdrawalRequests.walletId, walletId),
            eq(withdrawalRequests.status, "pending")
          )
        );

      if (pendingDeposits.length > 0 || pendingWithdrawals.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete wallet with pending transactions" 
        });
      }

      // Delete balances first (foreign key constraint)
      await db.delete(chainBalances)
        .where(eq(chainBalances.walletId, walletId));

      // Delete wallet
      await db.delete(userWallets)
        .where(eq(userWallets.id, walletId));
      
      res.json({ success: true, message: "Wallet deleted successfully" });
    } catch (error) {
      console.error("Error deleting wallet:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  console.log("✅ Wallet routes setup completed");
}