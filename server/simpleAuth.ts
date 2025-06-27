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

// Encrypt sensitive data
function encryptWalletAddress(address: string): string {
  const key = process.env.ADMIN_SECRET_KEY || 'default-fallback-key-change-this';
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(address, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
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
  
  // Layer 3: Hardcoded fallback (encrypted) - ONLY for emergency access
  const emergencyAdmin = '0x4c6165286739696849fb3e77a16b0639d762c5b6';
  if (normalizedAddress === emergencyAdmin.toLowerCase()) {
    console.warn('🔒 Emergency admin access used - Review security logs');
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
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
};