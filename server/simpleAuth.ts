// Simple authentication middleware for wallet-based admin access
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    walletAddress: string;
    isAdmin: boolean;
  };
}

// Admin wallet addresses
const ADMIN_WALLETS = [
  '0x4c6165286739696849fb3e77a16b0639d762c5b6'
];

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
      // Auto-create user for admin wallets
      if (ADMIN_WALLETS.includes(walletAddress.toLowerCase())) {
        user = await storage.createUser({
          username: `admin_${walletAddress.slice(-6)}`,
          walletAddress: walletAddress,
          authMethod: "wallet",
          isAdmin: true
        });
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