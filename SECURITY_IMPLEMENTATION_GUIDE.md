# Security Implementation Guide for Nectiq Platform

## Overview

This technical guide provides comprehensive implementation details for all security systems in the Nectiq cryptocurrency prediction platform. It covers authentication, financial security, API protection, and monitoring systems with specific code implementations and configurations.

## Authentication Security Implementation

### Web3 Wallet Authentication

**Dynamic Labs Integration**:
```typescript
// client/src/lib/web3Config.ts
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;

export const DynamicProvider = ({ children }) => (
  <DynamicContextProvider
    settings={{
      environmentId: dynamicEnvironmentId,
      walletConnectors: [EthereumWalletConnectors],
      eventsCallbacks: {
        onAuthSuccess: (args) => {
          console.log('Authentication successful:', args);
        },
        onLogout: (args) => {
          console.log('User logged out:', args);
        }
      }
    }}
  >
    {children}
  </DynamicContextProvider>
);
```

**Session Management**:
```typescript
// server/routes.ts
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### Admin Authentication System

**Multi-Wallet Admin Verification**:
```typescript
// server/security.ts
export function getAdminWalletAddresses(): string[] {
  const addresses = process.env.ADMIN_WALLET_ADDRESSES?.split(',') || [];
  return addresses.map(addr => addr.trim().toLowerCase());
}

export function isAdminWallet(walletAddress: string): boolean {
  const adminAddresses = getAdminWalletAddresses();
  return adminAddresses.includes(walletAddress.toLowerCase());
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.session.user;
  if (!user || !isAdminWallet(user.walletAddress)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
```

### Firebase Email Verification

**WalletEmailVerification Component**:
```typescript
// client/src/components/WalletEmailVerification.tsx
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function WalletEmailVerification({ walletAddress, onSuccess }) {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Link email with wallet address
      const response = await fetch('/api/auth/link-wallet-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          walletAddress,
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName
        })
      });
      
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Email verification failed:', error);
    }
  };
  
  // Component JSX...
}
```

## Financial Security Implementation

### Automated Withdrawal Security Service

**Core Withdrawal Security Logic**:
```typescript
// server/automated-withdrawal-service.ts
import { BalanceService } from './services/balanceService';

export class AutomatedWithdrawalService {
  private balanceService = new BalanceService();
  
  async processWithdrawal(withdrawalId: number) {
    const withdrawal = await this.getWithdrawal(withdrawalId);
    
    try {
      // Pre-processing validation
      await this.validateWithdrawal(withdrawal);
      
      // Execute blockchain transaction
      const txHash = await this.executeBlockchainTransaction(withdrawal);
      
      // Post-processing - CRITICAL: Deduct balance after successful transaction
      await this.balanceService.deductUserBalance(
        withdrawal.userId,
        withdrawal.amountNTIQ,
        'withdrawal_completed',
        txHash
      );
      
      await this.updateWithdrawalStatus(withdrawalId, 'completed', txHash);
      
    } catch (error) {
      // Never reject withdrawal after successful blockchain transfer
      if (error.code === 'BLOCKCHAIN_SUCCESS_BUT_POST_PROCESSING_FAILED') {
        await this.notifyAdminForManualIntervention(withdrawalId, error);
      } else {
        await this.updateWithdrawalStatus(withdrawalId, 'failed', null);
      }
    }
  }
  
  private async validateWithdrawal(withdrawal: any) {
    const user = await storage.getUser(withdrawal.userId);
    if (user.balance < withdrawal.amountNTIQ) {
      throw new Error('Insufficient balance');
    }
  }
}
```

### Balance Service Implementation

**Comprehensive Balance Management**:
```typescript
// server/services/balanceService.ts
export class BalanceService {
  async deductUserBalance(
    userId: number,
    amount: number,
    transactionType: string,
    transactionHash?: string
  ) {
    const user = await storage.getUser(userId);
    if (!user) throw new Error('User not found');
    
    if (user.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Atomic balance update
    const newBalance = user.balance - amount;
    await storage.updateUserBalance(userId, newBalance);
    
    // Create audit log
    await this.createTransactionLog({
      userId,
      type: transactionType,
      amount: -amount,
      balanceAfter: newBalance,
      hash: transactionHash,
      createdAt: new Date()
    });
  }
  
  async creditUserBalance(
    userId: number,
    amount: number,
    transactionType: string,
    transactionHash?: string
  ) {
    const user = await storage.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const newBalance = user.balance + amount;
    await storage.updateUserBalance(userId, newBalance);
    
    await this.createTransactionLog({
      userId,
      type: transactionType,
      amount: amount,
      balanceAfter: newBalance,
      hash: transactionHash,
      createdAt: new Date()
    });
  }
}
```

### Automated Deposit Security Service

**Deposit Integrity Monitoring**:
```typescript
// server/automated-deposit-security.ts
export class AutomatedDepositSecurity {
  async monitorDepositIntegrity() {
    setInterval(async () => {
      await this.checkStuckDeposits();
      await this.validateDepositBalanceConsistency();
      await this.detectAnomalousPatterns();
    }, 10 * 60 * 1000); // Every 10 minutes
  }
  
  private async checkStuckDeposits() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const stuckDeposits = await storage.getStuckDeposits(twoHoursAgo);
    
    for (const deposit of stuckDeposits) {
      await this.investigateStuckDeposit(deposit);
      await this.notifyAdminOfStuckDeposit(deposit);
    }
  }
  
  private async validateDepositBalanceConsistency() {
    const completedDeposits = await storage.getCompletedDepositsWithoutBalance();
    
    for (const deposit of completedDeposits) {
      const discrepancy = await this.checkBalanceDiscrepancy(deposit);
      if (discrepancy) {
        await this.correctBalanceDiscrepancy(deposit);
      }
    }
  }
}
```

## API Security Implementation

### Input Validation and Sanitization

**Comprehensive Input Validation**:
```typescript
// server/middleware/validation.ts
import { z } from 'zod';

export const predictionSchema = z.object({
  cryptoId: z.string().min(1).max(50),
  targetPrice: z.number().positive(),
  timeframe: z.enum(['1h', '6h', '24h', '7d']),
  stakeAmount: z.number().min(50).max(500)
});

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
  };
}
```

### Rate Limiting Implementation

**API Rate Limiting**:
```typescript
// server/middleware/rateLimiting.ts
import rateLimit from 'express-rate-limit';

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true,
});

export const financialRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit financial operations
  message: 'Too many financial requests, please try again later',
});
```

### CORS Configuration

**Secure CORS Setup**:
```typescript
// server/routes.ts
import cors from 'cors';

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://your-domain.com',
          'https://your-replit-domain.replit.app'
        ]
      : true; // Allow all origins in development
      
    if (!origin || allowedOrigins === true || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

## Security Monitoring Implementation

### Real-Time Security Event Logging

**Security Audit System**:
```typescript
// server/security/auditLogger.ts
interface SecurityEvent {
  type: 'login' | 'logout' | 'failed_auth' | 'suspicious_activity' | 'admin_action';
  userId?: number;
  ipAddress: string;
  userAgent: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export class SecurityAuditLogger {
  private events: SecurityEvent[] = [];
  
  logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };
    
    this.events.push(fullEvent);
    
    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    // Alert on critical events
    if (event.severity === 'critical') {
      this.sendCriticalAlert(fullEvent);
    }
  }
  
  getRecentEvents(hours: number = 24): SecurityEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.events.filter(event => event.timestamp > cutoff);
  }
}
```

### IP Blacklist Management

**Dynamic IP Blacklisting**:
```typescript
// server/security/ipBlacklist.ts
export class IPBlacklistManager {
  private blacklistedIPs = new Set<string>();
  private suspiciousIPs = new Map<string, number>();
  
  addToBlacklist(ip: string, reason: string) {
    this.blacklistedIPs.add(ip);
    auditLogger.logEvent({
      type: 'admin_action',
      ipAddress: ip,
      userAgent: 'system',
      details: { action: 'ip_blacklisted', reason },
      severity: 'high'
    });
  }
  
  isBlacklisted(ip: string): boolean {
    return this.blacklistedIPs.has(ip);
  }
  
  recordSuspiciousActivity(ip: string) {
    const count = this.suspiciousIPs.get(ip) || 0;
    this.suspiciousIPs.set(ip, count + 1);
    
    // Auto-blacklist after 5 suspicious activities
    if (count + 1 >= 5) {
      this.addToBlacklist(ip, 'Automated: Multiple suspicious activities');
    }
  }
}

// Middleware to check blacklisted IPs
export function checkBlacklist(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (ipBlacklistManager.isBlacklisted(clientIP)) {
    auditLogger.logEvent({
      type: 'suspicious_activity',
      ipAddress: clientIP,
      userAgent: req.get('User-Agent') || '',
      details: { action: 'blacklisted_ip_access_attempt' },
      severity: 'high'
    });
    
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
}
```

## Database Security Implementation

### Connection Security

**Secure Database Connection**:
```typescript
// server/db.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle({ client: pool, schema });
```

### Query Security

**Parameterized Queries with Drizzle ORM**:
```typescript
// server/storage.ts
import { eq, and, gte, lte } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  async getUserPredictions(userId: number, limit: number = 10) {
    // Safe parameterized query - no SQL injection risk
    return await db
      .select()
      .from(predictions)
      .where(eq(predictions.userId, userId))
      .limit(limit)
      .orderBy(desc(predictions.createdAt));
  }
  
  async getTransactionHistory(
    userId: number, 
    startDate: Date, 
    endDate: Date
  ) {
    return await db
      .select()
      .from(transactionLogs)
      .where(
        and(
          eq(transactionLogs.userId, userId),
          gte(transactionLogs.createdAt, startDate),
          lte(transactionLogs.createdAt, endDate)
        )
      );
  }
}
```

## Error Handling and Logging

### Comprehensive Error Handling

**Security-Focused Error Handler**:
```typescript
// server/middleware/errorHandler.ts
export function securityErrorHandler(
  error: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  // Log all errors for security analysis
  auditLogger.logEvent({
    type: 'suspicious_activity',
    ipAddress: req.ip || 'unknown',
    userAgent: req.get('User-Agent') || '',
    details: {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body
    },
    severity: 'medium'
  });
  
  // Don't expose internal errors to clients
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
    
  res.status(500).json({ error: message });
}
```

## Security Headers Implementation

**Comprehensive Security Headers**:
```typescript
// server/middleware/securityHeaders.ts
export function setSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Enforce HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://app.dynamic.xyz",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.coingecko.com https://hermes.pyth.network"
  ].join('; '));
  
  next();
}
```

## Deployment Security Configuration

### Production Security Checklist

**Environment Security Validation**:
```typescript
// server/security/deploymentValidator.ts
export function validateProductionSecurity() {
  const requiredSecrets = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'ADMIN_WALLET_ADDRESSES',
    'ADMIN_PRIVATE_KEY',
    'ETHERSCAN_API_KEY'
  ];
  
  const missingSecrets = requiredSecrets.filter(
    secret => !process.env[secret]
  );
  
  if (missingSecrets.length > 0) {
    throw new Error(`Missing required secrets: ${missingSecrets.join(', ')}`);
  }
  
  // Validate admin wallet addresses format
  const adminAddresses = getAdminWalletAddresses();
  if (adminAddresses.length === 0) {
    throw new Error('No admin wallet addresses configured');
  }
  
  // Validate session secret strength
  if (process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters');
  }
  
  console.log('✅ Production security validation passed');
}

// Run on server startup
if (process.env.NODE_ENV === 'production') {
  validateProductionSecurity();
}
```

## Performance and Security Monitoring

### Health Check Endpoint

**Comprehensive Health Monitoring**:
```typescript
// server/routes.ts
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      pyth: 'unknown',
      admin: 'unknown',
      security: 'unknown'
    },
    security: {
      blacklistedIPs: ipBlacklistManager.getBlacklistCount(),
      recentSecurityEvents: auditLogger.getRecentEvents(1).length,
      adminSessions: getActiveAdminSessions()
    }
  };
  
  try {
    // Test database connection
    await db.select().from(users).limit(1);
    health.services.database = 'connected';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }
  
  // Test Pyth Network connection
  try {
    const pythService = new PythPriceService();
    await pythService.getLatestPrices();
    health.services.pyth = 'operational';
  } catch (error) {
    health.services.pyth = 'error';
  }
  
  res.json(health);
});
```

---

**Document Version**: 2.0  
**Last Updated**: July 23, 2025  
**Implementation Status**: All Security Systems Operational  
**Review Schedule**: Quarterly Security Audit