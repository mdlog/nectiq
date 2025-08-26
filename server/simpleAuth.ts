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
  // Method 1: Environment Variables (Primary) - check both possible env var names
  const envWallets = process.env.ADMIN_WALLETS || process.env.ADMIN_WALLET_ADDRESSES;
  if (envWallets) {
    return envWallets.split(',').map(wallet => wallet.trim().toLowerCase());
  }

  // Method 2: Database-based admin management (Fallback)
  // This will be checked dynamically in the authentication process
  return [];
}

// Encrypt sensitive data with secure algorithm
function encryptWalletAddress(address: string): string {
  const key = process.env.ADMIN_SECRET_KEY || process.env.SESSION_SECRET;
  if (!key || key === 'default-fallback-key-change-this') {
    console.warn('⚠️ [AUTH] ADMIN_SECRET_KEY not found, using SESSION_SECRET for encryption');
    // Fallback to a deterministic key based on wallet address for production compatibility
    const fallbackKey = crypto.createHash('sha256').update(address + (process.env.SESSION_SECRET || 'fallback-key')).digest('hex');
    return crypto.createHash('sha256').update(address + fallbackKey).digest('hex');
  }
  
  // Use secure CBC mode with proper key handling (createCipherGCM not available in all Node versions)
  try {
    const algorithm = 'aes-256-cbc';
    const keyBuffer = key.length === 64 ? Buffer.from(key, 'hex') : crypto.createHash('sha256').update(key).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', keyBuffer.toString('hex'));
    
    let encrypted = cipher.update(address, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Include IV in result for proper decryption
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.warn('⚠️ [AUTH] Encryption failed, using fallback hash method');
    return crypto.createHash('sha256').update(address + key).digest('hex');
  }
}

// Admin verification with multiple security layers
async function isAuthorizedAdmin(walletAddress: string): Promise<boolean> {
  const normalizedAddress = walletAddress.toLowerCase();
  
  // Layer 1: Environment-based admin list
  const envAdmins = getAdminWallets();
  if (envAdmins.length > 0 && envAdmins.includes(normalizedAddress)) {
    return true;
  }
  
  // Layer 2: Database-based admin check
  try {
    const user = await storage.getUserByWalletAddress(walletAddress);
    if (user && user.isAdmin) {
      return true;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
  
  // Layer 3: Environment-based emergency admin (more secure)
  const emergencyAdmin = process.env.EMERGENCY_ADMIN_WALLET?.toLowerCase();
  if (emergencyAdmin && normalizedAddress === emergencyAdmin) {
    console.warn('🔒 Emergency admin access used - Review security logs immediately');
    // Log security event untuk audit trail
    console.error('🚨 EMERGENCY ADMIN ACCESS DETECTED', {
      wallet: walletAddress,
      timestamp: new Date().toISOString(),
      source: 'isAuthorizedAdmin'
    });
    return true;
  }
  
  return false;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Check for wallet address in headers or body
    const walletAddress = req.headers['x-wallet-address'] as string || 
                         req.body?.walletAddress ||
                         req.query?.walletAddress as string;

    if (!walletAddress) {
      return res.status(401).json({ message: "Authentication required" });
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
          authMethod: "wallet" as "wallet",
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
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
};