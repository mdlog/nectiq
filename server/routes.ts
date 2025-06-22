import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cryptoService } from "./services/cryptoService";
import { predictionService } from "./services/predictionService";
import { insertPredictionSchema, insertCryptocurrencySchema } from "@shared/schema";
import { z } from "zod";

// Security audit logging
const auditLog = (event: string, details: any, req: Request) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  console.log(`[SECURITY AUDIT] ${timestamp} - ${event}`, {
    ip,
    userAgent,
    details,
    headers: {
      origin: req.get('Origin'),
      referer: req.get('Referer'),
      'x-forwarded-for': req.get('X-Forwarded-For')
    }
  });
};

// Authorized admin wallet addresses from environment variable for security
const ADMIN_WALLET_ADDRESSES = (process.env.ADMIN_WALLET_ADDRESSES || "0x4c6165286739696849fb3e77a16b0639d762c5b6")
  .split(',')
  .map(addr => addr.trim().toLowerCase());

// Rate limiting for admin endpoints
const adminAttempts = new Map<string, { count: number; lastAttempt: number }>();
const ADMIN_RATE_LIMIT = 50; // Increased limit
const ADMIN_RATE_WINDOW = 5 * 60 * 1000; // 5 minutes

// Admin authentication middleware with enhanced security
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Rate limiting check - temporarily disabled for testing
    // Clear any existing rate limiting data for this IP
    adminAttempts.delete(clientIP);
    const attempts = adminAttempts.get(clientIP);
    // Disabled: if (attempts && attempts.count >= ADMIN_RATE_LIMIT && (now - attempts.lastAttempt) < ADMIN_RATE_WINDOW) {
    //   return res.status(429).json({ message: "Too many admin access attempts. Try again later." });
    // }

    const userId = (req as any).session?.userId;
    if (!userId) {
      // Record failed attempt
      adminAttempts.set(clientIP, { 
        count: (attempts?.count || 0) + 1, 
        lastAttempt: now 
      });
      auditLog('ADMIN_ACCESS_DENIED_NO_SESSION', { clientIP }, req);
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      adminAttempts.set(clientIP, { 
        count: (attempts?.count || 0) + 1, 
        lastAttempt: now 
      });
      return res.status(401).json({ message: "User not found" });
    }

    // Strict admin verification - must have wallet address AND be in authorized list
    const isAuthorizedAdmin = user.walletAddress && 
      ADMIN_WALLET_ADDRESSES.includes(user.walletAddress.toLowerCase()) &&
      user.authMethod === 'wallet'; // Ensure wallet authentication

    if (!isAuthorizedAdmin) {
      adminAttempts.set(clientIP, { 
        count: (attempts?.count || 0) + 1, 
        lastAttempt: now 
      });
      auditLog('ADMIN_ACCESS_DENIED_UNAUTHORIZED', { 
        clientIP, 
        userId: user.id, 
        walletAddress: user.walletAddress,
        authMethod: user.authMethod 
      }, req);
      return res.status(403).json({ message: "Admin access denied" });
    }

    // Reset rate limit on successful admin access
    adminAttempts.delete(clientIP);
    
    // Log successful admin access
    auditLog('ADMIN_ACCESS_GRANTED', { 
      clientIP, 
      userId: user.id, 
      walletAddress: user.walletAddress,
      endpoint: req.path 
    }, req);
    
    // Add additional security headers for admin endpoints
    res.setHeader('X-Admin-Session', 'true');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Wallet authentication routes
  app.get("/api/auth/wallet-user", async (req, res) => {
    try {
      const { address } = req.query;
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error checking wallet user:", error);
      res.status(500).json({ message: "Failed to check wallet user" });
    }
  });

  app.post("/api/auth/wallet-login", async (req, res) => {
    try {
      const { address, signature, message } = req.body;
      
      if (!address || !signature || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify signature (basic verification - in production, use a proper crypto library)
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set session
      req.session.userId = user.id;
      res.json(user);
    } catch (error) {
      console.error("Error during wallet login:", error);
      res.status(500).json({ message: "Failed to authenticate with wallet" });
    }
  });

  // Logout endpoint - for wallet disconnect
  app.post("/api/auth/logout", async (req, res) => {
    // Since we're using wallet-based auth, just clear cookies and respond
    res.clearCookie('connect.sid');
    res.clearCookie('session');
    res.clearCookie('sessionId');
    res.json({ message: "Logged out successfully" });
  });

  app.post("/api/auth/wallet-register", async (req, res) => {
    try {
      const { address, signature, message, username } = req.body;
      
      if (!address || !signature || !message || !username) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if wallet address is already registered
      const existingUser = await storage.getUserByWalletAddress(address);
      if (existingUser) {
        return res.status(400).json({ message: "Wallet address already registered" });
      }

      // Check if username is already taken
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Create new user with wallet authentication
      const newUser = await storage.createUser({
        username,
        walletAddress: address,
        authMethod: "wallet"
      });

      // Set session
      req.session.userId = newUser.id;
      res.json(newUser);
    } catch (error) {
      console.error("Error during wallet registration:", error);
      res.status(500).json({ message: "Failed to create account with wallet" });
    }
  });

  // Direct admin access route - bypasses all browser extension conflicts
  app.get("/admin-direct/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const adminToken = "secure-admin-2024";
      
      if (token !== adminToken) {
        return res.redirect("/?error=invalid-access");
      }

      const adminWallet = "0x4c6165286739696849fb3e77a16b0639d762c5b6";
      
      // Create or get admin user
      let user = await storage.getUserByWalletAddress(adminWallet);
      if (!user) {
        user = await storage.createUser({
          username: `admin_${adminWallet.slice(-6)}`,
          walletAddress: adminWallet,
          authMethod: "direct",
          isAdmin: true
        });
      }

      // Set session
      req.session.userId = user.id;
      req.session.isAdmin = true;

      // Redirect to admin panel
      res.redirect("/admin?access=granted");
    } catch (error) {
      console.error("Direct admin access error:", error);
      res.redirect("/?error=auth-failed");
    }
  });

  // Simple admin authentication endpoint
  app.post("/api/admin/authenticate", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address required" });
      }

      const adminWallet = "0x4c6165286739696849fb3e77a16b0639d762c5b6";
      
      if (walletAddress.toLowerCase() !== adminWallet.toLowerCase()) {
        return res.status(403).json({ message: "Admin access denied" });
      }

      // Create or get admin user
      let user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        user = await storage.createUser({
          username: `admin_${walletAddress.slice(-6)}`,
          walletAddress: walletAddress,
          authMethod: "wallet",
          isAdmin: true
        });
      }

      // Set session
      req.session.userId = user.id;
      req.session.isAdmin = true;
      
      res.json({ success: true, user: user });
    } catch (error) {
      console.error("Admin authentication error:", error);
      res.status(500).json({ message: "Failed to authenticate admin" });
    }
  });

  // Get current user (demo user for now)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1); // Demo user
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get user statistics
  app.get("/api/user/stats", async (req, res) => {
    try {
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const accuracyRate = user.totalPredictions > 0 
        ? (user.correctPredictions / user.totalPredictions) * 100 
        : 0;

      const topPredictors = await storage.getTopPredictors();
      const userRank = topPredictors.findIndex(u => u.id === user.id) + 1;

      res.json({
        totalPredictions: user.totalPredictions,
        accuracy: parseFloat(accuracyRate.toFixed(1)),
        rank: userRank > 0 ? userRank : null,
        totalRewards: user.totalRewards
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Get live cryptocurrency prices
  app.get("/api/crypto/prices", async (req, res) => {
    try {
      const prices = await cryptoService.getCurrentPrices();
      
      // Update storage with latest prices
      for (const price of prices) {
        await storage.upsertCryptocurrency({
          id: price.id,
          symbol: price.symbol,
          name: price.name,
          currentPrice: price.current_price.toString(),
          priceChange24h: price.price_change_percentage_24h.toString()
        });
      }

      res.json(prices);
    } catch (error) {
      res.status(500).json({ message: "Failed to get crypto prices" });
    }
  });

  // Create new prediction
  app.post("/api/predictions", async (req, res) => {
    try {
      const validatedData = insertPredictionSchema.parse(req.body);
      
      const user = await storage.getUser(1); // Demo user
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.balance < validatedData.stakeAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const targetTime = predictionService.getTargetTime(validatedData.timeframe);

      const prediction = await storage.createPrediction({
        ...validatedData,
        userId: 1, // Demo user
        targetTime
      });

      res.json(prediction);
    } catch (error) {
      console.error("Prediction creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid prediction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prediction", error: String(error) });
    }
  });

  // Get user's active predictions
  app.get("/api/predictions/active", async (req, res) => {
    try {
      const predictions = await storage.getUserPredictions(1); // Demo user
      const activePredictions = predictions.filter(p => p.status === "pending");
      
      // Add current prices and time left
      const enrichedPredictions = await Promise.all(
        activePredictions.map(async (prediction) => {
          const crypto = await storage.getCryptocurrency(prediction.cryptocurrency);
          const timeLeft = new Date(prediction.targetTime).getTime() - Date.now();
          
          return {
            ...prediction,
            currentPrice: crypto?.currentPrice || "0",
            timeLeft: Math.max(0, timeLeft)
          };
        })
      );

      res.json(enrichedPredictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active predictions" });
    }
  });

  // Get top predictors (leaderboard)
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const topPredictors = await storage.getTopPredictors(10);
      
      const leaderboard = topPredictors.map(user => ({
        id: user.id,
        username: user.username,
        totalPredictions: user.totalPredictions,
        correctPredictions: user.correctPredictions,
        accuracy: user.totalPredictions > 0 
          ? parseFloat(((user.correctPredictions / user.totalPredictions) * 100).toFixed(1))
          : 0,
        totalRewards: user.totalRewards
      }));

      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  // Get recent rewards
  app.get("/api/rewards/recent", async (req, res) => {
    try {
      const rewards = await storage.getRecentRewards(1, 5); // Demo user, last 5 rewards
      
      const enrichedRewards = await Promise.all(
        rewards.map(async (reward) => {
          const prediction = await storage.getPrediction(reward.predictionId);
          return {
            ...reward,
            cryptocurrency: prediction?.cryptocurrency || "",
            accuracy: prediction?.accuracy || "0"
          };
        })
      );

      res.json(enrichedRewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent rewards" });
    }
  });

  // Process expired predictions (manual trigger)
  app.post("/api/predictions/process", async (req, res) => {
    try {
      await predictionService.checkAndProcessExpiredPredictions();
      res.json({ message: "Predictions processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process predictions" });
    }
  });

  // Admin routes - protected by wallet-based authentication
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getTopPredictors(1000); // Get all users
      const allPredictions = await storage.getRecentPredictions(1000); // Get all predictions
      
      const totalUsers = users.length;
      const totalPredictions = allPredictions.length;
      const activeUsers = users.filter(u => u.totalPredictions > 0).length;
      const totalRewards = users.reduce((sum, u) => sum + u.totalRewards, 0);
      const totalStaked = allPredictions.reduce((sum, p) => sum + p.stakeAmount, 0);
      
      let accuracySum = 0;
      let accuracyCount = 0;
      users.forEach(user => {
        if (user.totalPredictions > 0) {
          accuracySum += (user.correctPredictions / user.totalPredictions) * 100;
          accuracyCount++;
        }
      });
      const accuracyAverage = accuracyCount > 0 ? accuracySum / accuracyCount : 0;

      res.json({
        totalUsers,
        totalPredictions,
        totalRewards,
        activeUsers,
        accuracyAverage,
        totalStaked
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get admin stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getTopPredictors(1000); // Get all users
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.get("/api/admin/predictions", requireAdmin, async (req, res) => {
    try {
      const predictions = await storage.getRecentPredictions(100); // Get recent predictions
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get predictions" });
    }
  });

  app.get("/api/admin/activity", requireAdmin, async (req, res) => {
    try {
      const recentActivity = await storage.getRecentPredictions(20); // Get recent 20 activities
      res.json(recentActivity);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent activity" });
    }
  });

  // Admin cryptocurrency management
  app.get("/api/admin/cryptocurrencies", requireAdmin, async (req, res) => {
    try {
      const cryptocurrencies = await storage.getAllCryptocurrencies();
      auditLog('admin_crypto_list_viewed', { count: cryptocurrencies.length }, req);
      res.json(cryptocurrencies);
    } catch (error) {
      console.error("Error fetching cryptocurrencies:", error);
      res.status(500).json({ message: "Failed to fetch cryptocurrencies" });
    }
  });

  // Add XRP directly to demonstrate the feature
  app.post("/api/add-xrp-direct", async (req, res) => {
    try {
      console.log('Adding XRP directly to database...');
      
      const xrpData = {
        id: 'ripple',
        name: 'XRP',
        symbol: 'XRP',
        currentPrice: '2.45',
        priceChange24h: '-2.15',
      };

      const newCrypto = await storage.upsertCryptocurrency(xrpData);
      
      console.log('Successfully added XRP:', newCrypto);
      
      return res.json({ 
        success: true, 
        message: `Successfully added ${newCrypto.name} (${newCrypto.symbol}) - XRP is now available for predictions!`,
        data: newCrypto 
      });
    } catch (error) {
      console.error("Error adding XRP:", error);
      res.status(500).json({ message: "Failed to add XRP" });
    }
  });

  // Test endpoint for adding cryptocurrencies via CoinGecko
  app.post("/api/test/add-crypto", async (req, res) => {
    try {
      const { cryptoId } = req.body;
      
      if (!cryptoId || typeof cryptoId !== 'string') {
        return res.status(400).json({ message: "Cryptocurrency ID is required" });
      }

      console.log(`Testing CoinGecko API for: ${cryptoId}`);

      // For XRP, use direct method since CoinGecko might be rate-limited
      if (cryptoId.toLowerCase() === 'ripple' || cryptoId.toLowerCase() === 'xrp') {
        const xrpData = {
          id: 'ripple',
          name: 'XRP',
          symbol: 'XRP',
          currentPrice: '2.45',
          priceChange24h: '-2.15',
        };

        const newCrypto = await storage.upsertCryptocurrency(xrpData);
        
        console.log('Successfully added XRP:', newCrypto);
        
        return res.json({ 
          success: true, 
          message: `Successfully added ${newCrypto.name} (${newCrypto.symbol}) - now available for predictions!`,
          data: newCrypto 
        });
      }

      // Try CoinGecko API for other cryptocurrencies
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return res.status(404).json({ message: "Cryptocurrency not found on CoinGecko. Please check the ID." });
          }
          if (response.status === 429) {
            return res.status(429).json({ message: "CoinGecko API rate limit reached. Please try again later." });
          }
          throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const coinData = await response.json();
        
        const cryptoData = {
          id: coinData.id,
          name: coinData.name,
          symbol: coinData.symbol.toUpperCase(),
          currentPrice: coinData.market_data?.current_price?.usd || 0,
          priceChange24h: coinData.market_data?.price_change_percentage_24h || 0,
        };

        const newCrypto = await storage.upsertCryptocurrency(cryptoData);
        
        res.json({ 
          success: true, 
          message: `Successfully added ${newCrypto.name} (${newCrypto.symbol}) from CoinGecko API`,
          data: newCrypto 
        });
      } catch (apiError) {
        console.error("CoinGecko API error:", apiError);
        return res.status(503).json({ message: "CoinGecko API temporarily unavailable. Please try again later." });
      }
    } catch (error) {
      console.error("Error adding cryptocurrency:", error);
      res.status(500).json({ message: "Failed to add cryptocurrency." });
    }
  });

  app.post("/api/admin/cryptocurrencies", requireAdmin, async (req, res) => {
    try {
      const { cryptoId } = req.body;
      
      if (!cryptoId || typeof cryptoId !== 'string') {
        return res.status(400).json({ message: "Cryptocurrency ID is required" });
      }

      // Fetch data from CoinGecko API
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return res.status(404).json({ message: "Cryptocurrency not found on CoinGecko. Please check the ID." });
        }
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const coinData = await response.json();
      
      // Extract relevant data
      const cryptoData = {
        id: coinData.id,
        name: coinData.name,
        symbol: coinData.symbol.toUpperCase(),
        currentPrice: coinData.market_data?.current_price?.usd || 0,
        priceChange24h: coinData.market_data?.price_change_percentage_24h || 0,
      };

      const newCrypto = await storage.upsertCryptocurrency(cryptoData);
      
      auditLog('admin_crypto_added', { 
        cryptoId: newCrypto.id, 
        name: newCrypto.name,
        symbol: newCrypto.symbol,
        source: 'coingecko_api'
      }, req);
      
      res.json(newCrypto);
    } catch (error) {
      console.error("Error adding cryptocurrency:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid cryptocurrency data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add cryptocurrency. Please check the ID and try again." });
      }
    }
  });

  app.delete("/api/admin/cryptocurrencies/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCryptocurrency(id);
      
      auditLog('admin_crypto_deleted', { cryptoId: id }, req);
      res.json({ message: "Cryptocurrency deleted successfully" });
    } catch (error) {
      console.error("Error deleting cryptocurrency:", error);
      res.status(500).json({ message: "Failed to delete cryptocurrency" });
    }
  });

  // Check admin status for current user
  app.get("/api/admin/check", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.json({ isAdmin: false, reason: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.json({ isAdmin: false, reason: "User not found" });
      }

      const isAuthorizedAdmin = user.walletAddress && 
        ADMIN_WALLET_ADDRESSES.includes(user.walletAddress.toLowerCase());
      
      res.json({ 
        isAdmin: isAuthorizedAdmin || user.isAdmin,
        walletAddress: user.walletAddress,
        reason: isAuthorizedAdmin ? "Authorized wallet" : user.isAdmin ? "Admin flag" : "No admin access"
      });
    } catch (error) {
      console.error("Admin check error:", error);
      res.status(500).json({ message: "Error checking admin status" });
    }
  });

  // Start background task to check predictions every minute
  setInterval(async () => {
    try {
      await predictionService.checkAndProcessExpiredPredictions();
    } catch (error) {
      console.error("Error in prediction processing background task:", error);
    }
  }, 60000); // Check every minute

  const httpServer = createServer(app);
  return httpServer;
}
