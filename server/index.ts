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

// SECURITY: Log environment status without exposing values
console.log("🔍 Environment variables loaded:");
console.log("   ADMIN_WALLET_ADDRESSES configured:", process.env.ADMIN_WALLET_ADDRESSES ? 'Yes' : 'No');
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
import { BattleExpiryService } from "./services/battleExpiryService.js";

const app = express();

// ===== DEDICATED HEALTH CHECK ENDPOINT FOR DEPLOYMENT =====
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Note: Root route (/) is handled by Vite middleware for frontend in development
// and by static files in production - no override needed here

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
    secure: process.env.NODE_ENV === 'production', // SECURITY: Enable HTTPS-only in production
    httpOnly: true, // SECURITY: Prevent XSS attacks by blocking JavaScript access
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // SECURITY: Strict CSRF protection in production
  },
  name: 'connect.sid' // Explicit session name for proper authentication
}));

// SECURITY: Enhanced CORS middleware with strict origin validation
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // SECURITY: Whitelist of allowed origins - NO wildcards for production security
  const allowedOrigins = [
    'https://app.dynamicauth.com',
    'https://api.dynamicauth.com',
    'https://auth.dynamicauth.com',
    'https://dynamicauth.com',
    'https://replit.dev',
    'https://replit.app'
  ];
  
  // Development environment - allow localhost and replit domains
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push(
      'http://localhost:5000',
      'http://localhost:3000',
      'https://localhost:5000',
      'https://localhost:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:3000',
      'https://127.0.0.1:5000',
      'https://127.0.0.1:3000'
    );
    
    // Add current replit domain dynamically for development
    if (origin && origin.includes('replit.dev')) {
      allowedOrigins.push(origin);
    }
  }
  
  // SECURITY: Strict origin validation - only allow whitelisted origins
  let corsOrigin = false; // Default: deny all origins
  if (!origin) {
    // Same-origin requests (no origin header) are allowed
    corsOrigin = '*';
  } else if (allowedOrigins.includes(origin)) {
    corsOrigin = origin;
  } else {
    // Log suspicious origin attempts for security monitoring
    console.warn(`🚨 [SECURITY] Blocked CORS request from unauthorized origin: ${origin}`);
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

// SECURITY: Enhanced rate limiting middleware with tiered protection
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// SECURITY: Tiered rate limiting based on endpoint sensitivity
const getRateLimitConfig = (req: any) => {
  const path = req.path;
  
  // DEVELOPMENT: Very lenient rate limiting for development mode
  if (process.env.NODE_ENV === 'development') {
    // Vite dev server requests - very lenient
    if (path.startsWith('/@fs/') || path.startsWith('/@vite/') || path.startsWith('/src/') || 
        path.startsWith('/node_modules/') || path.includes('.js') || path.includes('.ts') || 
        path.includes('.jsx') || path.includes('.tsx') || path.includes('.css')) {
      return { maxRequests: 1000, windowMs: 60000, type: 'dev_assets' };
    }
    
    // API endpoints in development - more lenient
    if (path.startsWith('/api/')) {
      return { maxRequests: 300, windowMs: 60000, type: 'dev_api' };
    }
    
    // All other development requests
    return { maxRequests: 500, windowMs: 60000, type: 'dev_public' };
  }
  
  // PRODUCTION: Strict rate limiting for production
  // CRITICAL: Admin endpoints - very restrictive
  if (path.startsWith('/api/admin')) {
    return { maxRequests: 10, windowMs: 60000, type: 'admin' };
  }
  
  // HIGH: Authentication endpoints - restrictive
  if (path.includes('/auth') || path.includes('/login') || path.includes('/verify')) {
    return { maxRequests: 20, windowMs: 60000, type: 'auth' };
  }
  
  // HIGH: Financial endpoints - restrictive
  if (path.includes('/deposit') || path.includes('/withdraw') || path.includes('/transaction')) {
    return { maxRequests: 30, windowMs: 60000, type: 'financial' };
  }
  
  // MEDIUM: User operations - moderate
  if (path.includes('/prediction') || path.includes('/battle') || path.includes('/user')) {
    return { maxRequests: 60, windowMs: 60000, type: 'user' };
  }
  
  // LOW: Public data endpoints - lenient but still controlled
  return { maxRequests: 120, windowMs: 60000, type: 'public' };
};

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const config = getRateLimitConfig(req);
  
  const limitKey = `${clientIP}_${config.type}`;
  
  if (!rateLimitMap.has(limitKey)) {
    rateLimitMap.set(limitKey, { count: 1, resetTime: now + config.windowMs });
    return next();
  }
  
  const clientData = rateLimitMap.get(limitKey);
  
  if (now > clientData.resetTime) {
    rateLimitMap.set(limitKey, { count: 1, resetTime: now + config.windowMs });
    return next();
  }
  
  if (clientData.count >= config.maxRequests) {
    // SECURITY: Enhanced rate limit logging with threat intelligence
    console.warn('🚨 [SECURITY] Rate limit exceeded:', {
      clientIP: clientIP,
      endpoint: req.path,
      limitType: config.type,
      currentCount: clientData.count,
      maxAllowed: config.maxRequests,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']?.substring(0, 100)
    });
    
    return res.status(429).json({ 
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
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

// Background services initialization function (runs after server starts)
async function initializeBackgroundServices() {
  console.log('🚀 [STARTUP] Server is listening - now initializing background services...');
  
  try {
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

    // Initialize Processing Withdrawals Blockchain Monitor
    try {
      console.log('🔧 Initializing Processing Withdrawals Blockchain Monitor...');
      const { AutomatedWithdrawalService } = await import('./automated-withdrawal-service');
      
      // Only initialize if admin private key exists
      if (process.env.ADMIN_PRIVATE_KEY) {
        const networks = {
          ethereum: { 
            rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
            chainId: 11155111,
            gasLimit: '21000',
            maxGasPrice: '20000000000',
            tokenContracts: {
              USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
              USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06'
            }
          },
          sepolia: { 
            rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
            chainId: 11155111,
            gasLimit: '21000',
            maxGasPrice: '20000000000',
            tokenContracts: {
              USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
              USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06'
            }
          }
        };
        
        const automatedService = new AutomatedWithdrawalService({
          adminPrivateKey: process.env.ADMIN_PRIVATE_KEY,
          networks,
          maxDailyWithdrawal: 10000,
          maxSingleWithdrawal: 5000,
          autoApprovalThreshold: 100
        }, storage);
        
        // Check processing withdrawals every 2 minutes
        setInterval(async () => {
          try {
            console.log('🔍 [PROCESSING-MONITOR] Checking processing withdrawals for blockchain confirmation...');
            await automatedService.monitorProcessingWithdrawals();
          } catch (error) {
            console.error('❌ [PROCESSING-MONITOR] Error:', error);
          }
        }, 120000); // 2 minutes
        
        console.log('✅ Processing withdrawals blockchain monitor started - checking every 2 minutes');
      } else {
        console.log('⚠️ Processing withdrawals monitor disabled - ADMIN_PRIVATE_KEY not found');
      }
    } catch (error) {
      console.error('❌ Failed to initialize processing withdrawals monitor:', error);
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
    try {
      console.log('🔧 Initializing Battle Expiry Service...');
      const battleExpiryService = BattleExpiryService.getInstance();
      battleExpiryService.start();
      console.log('✅ Battle expiry service started successfully - monitoring every 30 seconds');
    } catch (error) {
      console.error('❌ Failed to initialize battle expiry service:', error);
    }

    // Initialize Financial Security Service for comprehensive transaction security
    try {
      console.log('🔧 Initializing Financial Security Service...');
      const { financialSecurityService } = await import('./financial-security-service');
      financialSecurityService.startSecurityMonitoring();
      console.log('✅ Financial security service started successfully - monitoring financial transactions');
    } catch (error) {
      console.error('❌ Failed to initialize financial security service:', error);
    }
    
    console.log('🎉 [STARTUP] All background services initialized successfully!');
  } catch (error) {
    console.error('❌ [STARTUP] Error during background service initialization:', error);
  }
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
    
    // Initialize background services AFTER server starts listening
    // This ensures health checks pass during deployment
    setImmediate(() => {
      initializeBackgroundServices().catch(error => {
        console.error('❌ [STARTUP] Critical error during background service initialization:', error);
      });
    });
  });
})();
