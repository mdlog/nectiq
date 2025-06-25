import { Request } from 'express';
import { db } from './db';
import { walletFingerprints, abuseDetections } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';

interface WalletSecurityCheck {
  success: boolean;
  message: string;
  confidence: number;
  requiresReview: boolean;
  suspiciousWallets: string[];
}

export class WalletSecurityService {
  // Generate device fingerprint for monitoring
  static generateDeviceFingerprint(req: Request, clientData?: any): string {
    const components = [
      req.ip || req.connection.remoteAddress || '',
      req.headers['user-agent'] || '',
      req.headers['accept-language'] || '',
      clientData?.screenResolution || '',
      clientData?.timezone || '',
      clientData?.platform || ''
    ];
    
    return crypto.createHash('sha256')
      .update(components.join('|'))
      .digest('hex')
      .substring(0, 16);
  }

  // Simplified wallet login validation - always allow but monitor
  static async validateWalletLogin(walletAddress: string, req: Request): Promise<WalletSecurityCheck> {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint(req);
      const clientIP = req.ip || req.connection.remoteAddress || '';
      
      // Cek fingerprint wallet yang ada dalam 24 jam terakhir dari IP yang sama
      const recentWallets = await db.select()
        .from(walletFingerprints)
        .where(
          and(
            eq(walletFingerprints.ipAddress, clientIP),
            sql`${walletFingerprints.createdAt} > NOW() - INTERVAL '24 hours'`
          )
        );

      // Jika tidak ada wallet sebelumnya dari IP ini, izinkan
      if (recentWallets.length === 0) {
        await this.recordWalletFingerprint(walletAddress, req);
        return {
          success: true,
          message: 'Login berhasil - perangkat baru',
          confidence: 0,
          requiresReview: false,
          suspiciousWallets: []
        };
      }

      // Cek apakah ada wallet berbeda dengan device fingerprint yang sama
      const suspiciousWallets = recentWallets.filter(w => 
        w.walletAddress !== walletAddress && 
        w.deviceFingerprint === deviceFingerprint
      );

      if (suspiciousWallets.length > 2) {
        // Only block if more than 2 different wallets detected (more lenient)
        await this.recordAbuseDetection(
          walletAddress, 
          suspiciousWallets.map(w => w.walletAddress), 
          85, 
          'Multiple wallets detected from same device fingerprint',
          req
        );

        return {
          success: false,
          message: 'Too many wallets detected from this device. Please contact support if this is an error.',
          confidence: 85,
          requiresReview: true,
          suspiciousWallets: suspiciousWallets.map(w => w.walletAddress)
        };
      } else if (suspiciousWallets.length > 0) {
        // Just record for monitoring but allow login
        await this.recordAbuseDetection(
          walletAddress,
          suspiciousWallets.map(w => w.walletAddress),
          60,
          'Potential multi-wallet usage detected',
          req
        );
      }

      // Record this wallet login for future tracking
      await this.recordWalletFingerprint(walletAddress, req);

      // Check for multiple different wallets from same IP (monitoring only)
      const differentWallets = recentWallets.filter(w => w.walletAddress !== walletAddress);
      
      if (differentWallets.length >= 5) {
        // Only flag if 5+ different wallets (very lenient)
        await this.recordAbuseDetection(
          walletAddress,
          differentWallets.map(w => w.walletAddress),
          40,
          'Multiple wallets detected from same IP - monitoring only',
          req
        );

        return {
          success: true,
          message: 'Login successful - monitoring active',
          confidence: 40,
          requiresReview: false,
          suspiciousWallets: []
        };
      }

      // Login normal
      await this.recordWalletFingerprint(walletAddress, req);
      return {
        success: true,
        message: 'Login berhasil',
        confidence: 0,
        requiresReview: false,
        suspiciousWallets: []
      };

    } catch (error) {
      console.error('Wallet security check error:', error);
      // Izinkan login jika ada error tapi tandai untuk review
      return {
        success: true,
        message: 'Login berhasil dengan peringatan keamanan',
        confidence: 0,
        requiresReview: true,
        suspiciousWallets: []
      };
    }
  }

  // Record wallet fingerprint
  static async recordWalletFingerprint(walletAddress: string, req: Request): Promise<void> {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint(req);
      const clientIP = req.ip || req.connection.remoteAddress || '';
      
      await db.insert(walletFingerprints).values({
        walletAddress,
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'] || '',
        deviceFingerprint,
        browserFingerprint: this.generateDeviceFingerprint(req),
        screenResolution: '',
        timezone: '',
        language: req.headers['accept-language']?.split(',')[0] || '',
        platform: req.headers['sec-ch-ua-platform'] || ''
      });
    } catch (error) {
      console.error('Error recording wallet fingerprint:', error);
    }
  }

  // Record abuse detection
  static async recordAbuseDetection(
    walletAddress: string,
    suspiciousWallets: string[],
    confidence: number,
    reason: string,
    req: Request
  ): Promise<void> {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || '';
      
      await db.insert(abuseDetections).values({
        primaryWalletAddress: walletAddress,
        suspiciousWalletAddresses: JSON.stringify(suspiciousWallets),
        similarityScore: confidence.toString(),
        detectionReason: reason,
        status: confidence >= 90 ? 'confirmed' : 'pending',
        action: confidence >= 90 ? 'block' : 'warn',
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'] || ''
      });
    } catch (error) {
      console.error('Error recording abuse detection:', error);
    }
  }

  // Get abuse detections untuk admin panel
  static async getAbuseDetections(limit: number = 50): Promise<any[]> {
    try {
      return await db.select()
        .from(abuseDetections)
        .orderBy(desc(abuseDetections.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting abuse detections:', error);
      return [];
    }
  }

  // Update abuse detection status (untuk admin review)
  static async updateAbuseDetection(
    id: number,
    status: 'confirmed' | 'false_positive' | 'reviewed',
    reviewNotes?: string,
    reviewedBy?: number
  ): Promise<void> {
    try {
      await db.update(abuseDetections)
        .set({
          status,
          reviewNotes,
          reviewedBy,
          reviewedAt: new Date()
        })
        .where(eq(abuseDetections.id, id));
    } catch (error) {
      console.error('Error updating abuse detection:', error);
    }
  }
}