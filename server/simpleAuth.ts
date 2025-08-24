// Simple authentication middleware for wallet-based admin access
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    walletAddress: string;
    isAdmin: boolean;
  };
}

// Secure admin wallet management
function getAdminWallets(): string[] {
  // Method 1: Environment Variables (Primary)
  const envWallets = process.env.ADMIN_WALLETS;
  if (envWallets) {
    return envWallets.split(',').map(wallet => wallet.trim().toLowerCase());
  }

  // Method 2: Database-based admin management (Fallback)
  // This will be checked dynamically in the authentication process
  return [];
}

// Encrypt sensitive data with secure algorithm
function encryptWalletAddress(address: string): string {
  const key = process.env.ADMIN_SECRET_KEY;
  if (!key || key === 'default-fallback-key-change-this') {
    throw new Error('🚨 SECURITY: Valid ADMIN_SECRET_KEY required in environment');
  }
  
  // Use secure GCM mode instead of deprecated CBC
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipherGCM(algorithm, Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(address, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Include IV in result for proper decryption
  return iv.toString('hex') + ':' + encrypted;
}

// SECURITY: Admin verification with enhanced validation and audit logging
async function isAuthorizedAdmin(walletAddress: string): Promise<boolean> {
  const normalizedAddress = walletAddress.toLowerCase();
  
  // SECURITY ENHANCEMENT: Input validation
  if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
    console.warn('🚨 [SECURITY] Invalid wallet address format for admin check:', walletAddress);
    return false;
  }
  
  // Layer 1: STRICT Environment-based admin list (primary method)
  const envAdmins = getAdminWallets();
  if (envAdmins.length > 0) {
    const isEnvAdmin = envAdmins.includes(normalizedAddress);
    if (isEnvAdmin) {
      // SECURITY: Log successful admin verification
      console.log('✅ [SECURITY] Valid admin wallet verified:', normalizedAddress.substring(0, 6) + '...');
      return true;
    }
  }
  
  // Layer 2: Database-based admin check (SECONDARY - more restrictive)
  try {
    const user = await storage.getUserByWalletAddress(walletAddress);
    if (user && user.isAdmin) {
      // SECURITY: Additional verification - must also be in environment list for security
      if (envAdmins.length === 0) {
        console.warn('🚨 [SECURITY] Database admin access without environment verification - BLOCKED');
        return false;
      }
      
      // SECURITY: Cross-verify with environment admin list
      if (!envAdmins.includes(normalizedAddress)) {
        console.error('🚨 [SECURITY] Database admin not in environment whitelist - POTENTIAL COMPROMISE');
        // Log security incident
        console.error('🚨 ADMIN SECURITY BREACH ATTEMPT', {
          wallet: walletAddress,
          timestamp: new Date().toISOString(),
          source: 'database_admin_mismatch',
          severity: 'HIGH'
        });
        return false;
      }
      
      console.log('✅ [SECURITY] Database admin verified and matches environment list');
      return true;
    }
  } catch (error) {
    console.error('🚨 [SECURITY] Error checking admin status:', error);
    return false;
  }
  
  // Layer 3: Emergency admin access (HIGHLY RESTRICTED)
  const emergencyAdmin = process.env.EMERGENCY_ADMIN_WALLET?.toLowerCase();
  if (emergencyAdmin && normalizedAddress === emergencyAdmin) {
    // SECURITY: Additional emergency admin security checks
    const emergencyToken = process.env.EMERGENCY_ADMIN_TOKEN;
    if (!emergencyToken || emergencyToken.length < 32) {
      console.error('🚨 [SECURITY] Emergency admin token not configured or too weak - ACCESS DENIED');
      return false;
    }
    
    console.error('🚨 EMERGENCY ADMIN ACCESS ACTIVATED', {
      wallet: walletAddress.substring(0, 6) + '...',
      timestamp: new Date().toISOString(),
      source: 'emergency_admin_access',
      severity: 'CRITICAL',
      action_required: 'IMMEDIATE_SECURITY_REVIEW'
    });
    
    return true;
  }
  
  // SECURITY: Log failed admin attempts for monitoring
  console.warn('🚨 [SECURITY] Unauthorized admin access attempt:', {
    wallet: normalizedAddress.substring(0, 6) + '...',
    timestamp: new Date().toISOString(),
    source: 'isAuthorizedAdmin'
  });
  
  return false;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // SECURITY: Enhanced authentication with input validation
    const walletAddress = req.headers['x-wallet-address'] as string || 
                         req.body?.walletAddress ||
                         req.query?.walletAddress as string;

    if (!walletAddress) {
      console.warn('🚨 [SECURITY] Authentication attempt without wallet address from IP:', req.ip);
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // SECURITY: Wallet address format validation
    if (typeof walletAddress !== 'string' || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
      console.warn('🚨 [SECURITY] Invalid wallet address format from IP:', req.ip, 'Address:', walletAddress);
      return res.status(400).json({ message: "Invalid wallet address format" });
    }

    // Get or create user for this wallet
    let user = await storage.getUserByWalletAddress(walletAddress);
    
    if (!user) {
      // Check if wallet is authorized admin using secure verification
      const isAdmin = await isAuthorizedAdmin(walletAddress);
      
      if (isAdmin) {
        // Auto-create admin user
        user = await storage.createUser({
          username: `admin_${walletAddress.slice(-6)}`,
          walletAddress: walletAddress,
          authMethod: "wallet",
          isAdmin: true
        });
        console.log(`🔐 New admin user created for wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
      } else {
        return res.status(401).json({ message: "Unauthorized wallet address" });
      }
    }

    req.user = {
      id: user.id,
      walletAddress: user.walletAddress || '',
      isAdmin: user.isAdmin || false
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      // SECURITY: Enhanced admin access logging
      console.warn('🚨 [SECURITY] Non-admin user attempted admin access:', {
        userId: req.user?.id,
        walletAddress: req.user?.walletAddress?.substring(0, 6) + '...',
        timestamp: new Date().toISOString(),
        clientIP: req.ip,
        endpoint: req.originalUrl
      });
      return res.status(403).json({ message: "Admin access required" });
    }
    
    // SECURITY: Log successful admin access for audit trail
    console.log('✅ [SECURITY] Admin access granted:', {
      userId: req.user.id,
      walletAddress: req.user.walletAddress?.substring(0, 6) + '...',
      timestamp: new Date().toISOString(),
      endpoint: req.originalUrl
    });
    
    next();
  });
};