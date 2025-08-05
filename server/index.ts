import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from "dotenv";
import { db } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { predictions, users, cryptocurrencies } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";

// Load environment variables
dotenv.config();

// Debug environment variables immediately after loading
console.log("🔍 Environment variables loaded:");
console.log("   ADMIN_WALLET_ADDRESSES:", process.env.ADMIN_WALLET_ADDRESSES);
console.log("   NODE_ENV:", process.env.NODE_ENV);

// Extend Express Request to include session
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
  }
}
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { survivalRoundService } from "./services/survivalRoundService";
import { storage } from "./storage";
import { DepositMonitorService } from "./services/depositMonitorService.js";
import { withdrawalMonitorService } from "./services/withdrawalMonitorService.js";
import { initializeDepositExpiryService } from "./services/deposit-expiry-service";
import { ParlayProcessorService } from "./services/parlayProcessorService.js";

const app = express();

// ===== LIVE ACTIVITIES ENDPOINT - EARLY PLACEMENT TO BYPASS MIDDLEWARE =====
app.get('/api/activities/live', async (req, res) => {
  console.log('🚀 [LIVE ACTIVITIES] Endpoint called');
  try {
    // Build live activities from existing data
    const activities = [];

    // Get recent completed predictions directly from database
    const recentPredictions = await db.select({
      id: predictions.id,
      userId: predictions.userId,
      cryptocurrency: predictions.cryptocurrency,
      predictedPrice: predictions.predictedPrice,
      actualPrice: predictions.actualPrice,
      stakeAmount: predictions.stakeAmount,
      rewardAmount: predictions.rewardAmount,
      accuracy: predictions.accuracy,
      status: predictions.status,
      completedAt: predictions.completedAt,
      createdAt: predictions.createdAt,
      username: users.username,
      cryptocurrencyName: cryptocurrencies.name
    })
    .from(predictions)
    .innerJoin(users, eq(predictions.userId, users.id))
    .innerJoin(cryptocurrencies, eq(predictions.cryptocurrency, cryptocurrencies.id))
    .where(eq(predictions.status, 'completed'))
    .orderBy(desc(predictions.completedAt))
    .limit(10);

    console.log('🔍 [LIVE ACTIVITIES] Recent predictions found:', recentPredictions.length);
    if (recentPredictions.length > 0) {
      console.log('🔍 [LIVE ACTIVITIES] Sample prediction:', JSON.stringify(recentPredictions[0], null, 2));
    }
    
    for (const prediction of recentPredictions) {
      const isCorrect = prediction.accuracy && Number(prediction.accuracy) < 5;
      const rewardAmount = prediction.rewardAmount || 0;
      const hasEarnings = rewardAmount > prediction.stakeAmount;
      
      activities.push({
        id: `prediction_${prediction.id}`,
        type: 'prediction',
        username: prediction.username,
        description: hasEarnings 
          ? `Won ${rewardAmount} NTIQ predicting ${prediction.cryptocurrencyName}` 
          : `Lost ${prediction.stakeAmount} NTIQ predicting ${prediction.cryptocurrencyName}`,
        amount: hasEarnings ? rewardAmount : prediction.stakeAmount,
        cryptocurrency: prediction.cryptocurrency,
        timestamp: prediction.completedAt || prediction.createdAt,
        icon: hasEarnings ? 'TrendingUp' : 'TrendingDown',
        color: hasEarnings ? 'bg-green-600' : 'bg-red-600'
      });
    }

    // Get recent battles (if available)
    try {
      const recentBattles = await storage.getBattleHistory(); // Get recent battles
      for (const battle of recentBattles) {
        if (battle.status === 'completed' && battle.winnerId) {
          activities.push({
            id: `battle_${battle.id}`,
            type: 'battle_win',
            username: battle.winnerUsername || 'Battle Winner',
            description: `Won a prediction battle`,
            amount: battle.winnerReward || (battle.stake * 2),
            cryptocurrency: battle.cryptocurrency,
            timestamp: battle.updatedAt || battle.createdAt,
            icon: 'Swords',
            color: 'bg-yellow-600'
          });
        }
      }
    } catch (battleError) {
      console.log('⚠️ [LIVE ACTIVITIES] No recent battles available');
    }

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log('✅ [LIVE ACTIVITIES] Built activities from existing data:', activities.length);
    res.json(activities.slice(0, 20)); // Return top 20 activities
  } catch (error) {
    console.error('❌ [LIVE ACTIVITIES] Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch live activities' });
  }
});

// Session configuration with enhanced debugging
app.use(session({
  secret: process.env.SESSION_SECRET || 'crypto-predict-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: false, // Allow frontend access to session
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Allow cross-origin requests
  },
  name: 'nectiq.session' // Custom session name
}));

// Enhanced CORS middleware - Complete Dynamic SDK support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Dynamic Labs specific domains for CORS
  const allowedOrigins = [
    'https://app.dynamicauth.com',
    'https://api.dynamicauth.com',
    'https://auth.dynamicauth.com',
    'https://dynamicauth.com',
    'https://replit.dev',
    'https://replit.app'
  ];
  
  // Handle undefined origin and determine CORS origin
  let corsOrigin = '*';
  if (origin && allowedOrigins.includes(origin)) {
    corsOrigin = origin;
  } else if (origin) {
    corsOrigin = origin; // Allow the current origin if defined
  }
  
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-Frame-Options, Cache-Control, X-Dynamic-Authorization, X-Dynamic-Token, X-Dynamic-User-Id, X-Dynamic-Environment-Id, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-Requested-With');
  
  // Enhanced security for Dynamic SDK and WebSocket connections
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Enhanced security headers middleware for Dynamic SDK
app.use((req, res, next) => {
  // Relaxed security headers for development and Dynamic SDK
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'ALLOWALL'); // Allow all frames for Dynamic SDK
  res.setHeader('X-XSS-Protection', '0'); // Disable XSS protection to avoid conflicts
  res.setHeader('Referrer-Policy', 'unsafe-url'); // Allow full referrer for Dynamic SDK
  
  // Ultra-permissive CSP for Dynamic SDK and wallet authentication
  res.setHeader('Content-Security-Policy', [
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' *",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:",
    "style-src 'self' 'unsafe-inline' * data:",
    "font-src 'self' * data:",
    "img-src 'self' * data: blob:",
    "connect-src 'self' * data: blob: ws: wss:",
    "frame-src 'self' *",
    "child-src 'self' *",
    "worker-src 'self' * blob:",
    "object-src 'none'",
    "media-src 'self' * data: blob:"
  ].join('; '));
  
  // HSTS for HTTPS
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// Request size and rate limiting for security
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Serve static files from attached_assets
app.use('/attached_assets', express.static('attached_assets'));

// Serve uploaded files (profile photos, banners, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple rate limiting middleware - adjusted for development
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 500; // Increased for development

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitMap.get(clientIP);
  
  if (now > clientData.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  
  clientData.count++;
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize survival round service for automatic elimination
console.log('🔧 Initializing Survival Round Service...');
survivalRoundService;

// Initialize automated audit system to prevent reward/balance inconsistencies
console.log('🔧 Audit system temporarily disabled for debugging...');

// ❌ AUTOMATED WITHDRAWAL SYSTEM DISABLED - Manual approval required
console.log('🚫 Automated Withdrawal System DISABLED - All withdrawals require manual approval');
console.log('✅ All withdrawals will be processed through admin panel approval system');
// Auto withdrawal disabled permanently to require manual admin approval

// Initialize automated deposit monitoring system
console.log('🔧 Initializing Automated Deposit Monitoring System...');
try {
  const depositMonitorService = DepositMonitorService.getInstance();
  await depositMonitorService.start();
  console.log('✅ Automated deposit monitoring system started successfully');
} catch (error) {
  console.error('❌ Failed to initialize automated deposit monitoring system:', error);
}

// Initialize Deposit Expiry Service for 1-hour auto-cancel
try {
  console.log('🔧 Initializing Deposit Expiry Service...');
  const depositExpiryService = initializeDepositExpiryService(storage as any);
  depositExpiryService.start();
  console.log('✅ Deposit expiry monitoring system started successfully');
} catch (error) {
  console.error('❌ Failed to initialize deposit expiry service:', error);
}

// Initialize Withdrawal Hash Detection Service
try {
  console.log('🔧 Initializing Withdrawal Hash Detection Service...');
  await withdrawalMonitorService.start();
  console.log('✅ Withdrawal hash detection system started successfully');
} catch (error) {
  console.error('❌ Failed to initialize withdrawal hash detection service:', error);
}

// Initialize Parlay Processor Service for automatic parlay completion
try {
  console.log('🔧 Initializing Parlay Processor Service...');
  const parlayProcessorService = new ParlayProcessorService();
  
  // Start periodic processing every 30 seconds
  setInterval(async () => {
    try {
      await parlayProcessorService.processExpiredParlayPredictions();
    } catch (error) {
      console.error('❌ [PARLAY-PROCESSOR] Periodic processing error:', error);
    }
  }, 30000); // 30 seconds
  
  // Run initial processing
  await parlayProcessorService.processExpiredParlayPredictions();
  console.log('✅ Parlay processor service started successfully - processing every 30 seconds');
} catch (error) {
  console.error('❌ Failed to initialize parlay processor service:', error);
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
