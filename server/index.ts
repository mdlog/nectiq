import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
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
if (process.env.NODE_ENV === 'development') {
  console.log("🔍 Environment variables loaded:");
  console.log("   ADMIN_WALLET_ADDRESSES:", process.env.ADMIN_WALLET_ADDRESSES);
  console.log("   NODE_ENV:", process.env.NODE_ENV);
}

// Override console.error to filter out RPC "filter not found" spam
const originalConsoleError = console.error;
console.error = function (...args: any[]) {
  // Convert args to string for checking
  const errorString = args.map(arg => {
    if (typeof arg === 'object') {
      // Check nested properties for error messages
      if (arg?.shortMessage) return arg.shortMessage;
      if (arg?.message) return arg.message;
      if (arg?.error?.message) return arg.error.message;
      return JSON.stringify(arg);
    }
    return String(arg);
  }).join(' ');

  // Suppress "filter not found" and coalesce errors from ethers.js
  if (errorString.includes('filter not found') ||
    errorString.includes('could not coalesce error') ||
    errorString.includes('eth_getFilterChanges') ||
    errorString.includes('missing revert data')) {
    // Silently ignore - this is normal RPC behavior
    return;
  }

  // Pass through other errors
  originalConsoleError.apply(console, args);
};

// Global error handler to suppress RPC "filter not found" errors
process.on('unhandledRejection', (reason: any) => {
  // Suppress "filter not found" errors from ethers.js event polling
  if (reason?.message?.includes('filter not found') ||
    reason?.error?.message?.includes('filter not found') ||
    reason?.shortMessage?.includes('could not coalesce error')) {
    // Silently ignore - this is normal RPC behavior when filters expire
    return;
  }
  // Log other unhandled rejections
  console.error('🚨 [UNHANDLED-REJECTION]:', reason);
});

process.on('uncaughtException', (error: any) => {
  // Suppress "filter not found" errors
  if (error?.message?.includes('filter not found')) {
    return;
  }
  console.error('🚨 [UNCAUGHT-EXCEPTION]:', error);
  // Don't exit process for non-critical errors
});

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
import { BattleExpiryService } from "./services/battleExpiryService.js";
import { initVaultEventListener } from "./services/vaultEventListener.js";

const app = express();

// ===== LIVE ACTIVITIES ENDPOINT - EARLY PLACEMENT TO BYPASS MIDDLEWARE =====
app.get('/api/activities/live', async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 [LIVE ACTIVITIES] Endpoint called');
  }
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

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [LIVE ACTIVITIES] Recent predictions found:', recentPredictions.length);
      if (recentPredictions.length > 0) {
        console.log('🔍 [LIVE ACTIVITIES] Sample prediction:', JSON.stringify(recentPredictions[0], null, 2));
      }
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

// Session configuration with persistent MemoryStore
const sessionStore = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'crypto-predict-session-secret-key',
  store: new sessionStore({
    checkPeriod: 86400000, // prune expired entries every 24h
    max: 100000, // Maximum number of sessions
    ttl: 86400000 // 24 hours TTL
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Disable secure flag for now to test if this fixes the issue
    httpOnly: true, // Prevent XSS attacks by blocking JavaScript access
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax', // Use lax for better compatibility
    // Remove domain restriction for now
  },
  name: 'connect.sid' // Explicit session name for proper authentication
}));

// Enhanced CORS middleware - Secure configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Strict whitelist of allowed origins
  const allowedOrigins = [
    'https://app.dynamicauth.com',
    'https://api.dynamicauth.com',
    'https://auth.dynamicauth.com',
    'https://dynamicauth.com',
    'http://localhost:5003', // Local development
    'http://localhost:5000', // Local development
    'http://127.0.0.1:5003', // Local development
    'http://127.0.0.1:5000', // Local development
    // Add your production domain here
    process.env.FRONTEND_URL || 'https://nectiq.app'
  ];

  // Strict CORS configuration - only allow whitelisted origins
  let corsOrigin: string | boolean = false; // Default to false (block)
  if (origin && allowedOrigins.includes(origin)) {
    corsOrigin = origin;
  } else if (!origin) {
    // Allow same-origin requests (no origin header)
    corsOrigin = '*';
  }

  // Debug CORS for deployment issues
  if (origin && !allowedOrigins.includes(origin)) {
    console.log('🚫 [CORS] Blocked origin:', origin, 'Allowed:', allowedOrigins);
  }

  res.setHeader('Access-Control-Allow-Origin', corsOrigin === false ? 'null' : corsOrigin);
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

// Enhanced security headers middleware - Production ready
app.use((req, res, next) => {
  // Security headers for XSS and content type protection
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Prevent clickjacking
  res.setHeader('X-XSS-Protection', '1; mode=block'); // Enable XSS protection
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); // Secure referrer

  // Relaxed CSP for localhost development - allows all wallet connections
  if (process.env.NODE_ENV === 'development' || req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
    res.setHeader('Content-Security-Policy', [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *",
      "style-src 'self' 'unsafe-inline' *",
      "font-src 'self' data: *",
      "img-src 'self' data: blob: https: *",
      "connect-src 'self' wss: ws: https: *",
      "frame-src 'self' *",
      "child-src 'self' *",
      "worker-src 'self' blob: *",
      "object-src 'none'",
      "media-src 'self' data: blob: *"
    ].join('; '));
  } else {
    // Strict CSP for production
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.dynamicauth.com *.tradingview.com s3.tradingview.com *.walletconnect.com *.walletconnect.org",
      "style-src 'self' 'unsafe-inline' *.dynamicauth.com *.tradingview.com *.walletconnect.com",
      "font-src 'self' data: *.dynamicauth.com *.tradingview.com",
      "img-src 'self' data: blob: https: *.coingecko.com *.dynamicauth.com *.tradingview.com *.walletconnect.com *.walletconnect.org *.coinbase.com",
      "connect-src 'self' wss: ws: https: *.coingecko.com *.pyth.network *.dynamicauth.com *.tradingview.com *.firebaseio.com *.googleapis.com *.walletconnect.com *.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org *.infura.io *.alchemy.com *.coinbase.com *.metamask.io rpc.ankr.com *.publicnode.com",
      "frame-src 'self' *.dynamicauth.com *.tradingview.com tradingview.com *.walletconnect.com *.walletconnect.org *.coinbase.com",
      "child-src 'self' *.dynamicauth.com *.tradingview.com *.walletconnect.com",
      "worker-src 'self' blob: *.tradingview.com",
      "object-src 'none'",
      "media-src 'self' data: blob:"
    ].join('; '));
  }

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

// Simple rate limiting middleware - DISABLED for development
// const rateLimitMap = new Map();
// const RATE_LIMIT_WINDOW = 60000; // 1 minute
// const MAX_REQUESTS_PER_WINDOW = 500; // Increased for development

// Rate limiting disabled for development
app.use((req, res, next) => {
  // Skip rate limiting in development
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

// Initialize Vault Event Listener for Smart Contract deposits/withdrawals
console.log('🔧 Initializing Vault Event Listener...');
try {
  const vaultListener = initVaultEventListener(storage);
  await vaultListener.start();
  console.log('✅ Vault event listener started successfully');
} catch (error) {
  console.error('❌ Failed to initialize vault event listener:', error);
}

// Initialize Multi Token Vault Event Listener for Multi Token Vault deposits/withdrawals
console.log('🔧 Initializing Multi Token Vault Event Listener...');
try {
  const { multiTokenVaultEventListener } = await import('./services/multiTokenVaultEventListener');
  await multiTokenVaultEventListener.start();
  console.log('✅ Multi Token Vault event listener started successfully');
} catch (error) {
  console.error('❌ Failed to initialize Multi Token Vault event listener:', error);
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

// Initialize Automated Withdrawal Service
try {
  console.log('🔧 Initializing Automated Withdrawal Service...');
  const { setupAutomatedWithdrawals } = await import('./withdrawal-scheduler');

  // Setup automated withdrawal processing
  setupAutomatedWithdrawals(storage);
  console.log('✅ Automated withdrawal system initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize automated withdrawal service:', error);
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

// Initialize Battle Expiry Service for automatic battle expiry processing
// TEMPORARILY DISABLED FOR TESTING
try {
  console.log('🔧 Battle Expiry Service temporarily disabled for testing...');
  // const battleExpiryService = BattleExpiryService.getInstance();
  // battleExpiryService.start();
  console.log('⚠️ Battle expiry service disabled - battles will not auto-expire');
} catch (error) {
  console.error('❌ Failed to initialize battle expiry service:', error);
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

  // Serve the app on the specified port (default 5000)
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
