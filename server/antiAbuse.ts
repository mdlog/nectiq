import { Request } from 'express';
import { db } from './db';
import { walletFingerprints, abuseDetections, users } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';

interface DeviceFingerprint {
  ipAddress: string;
  userAgent: string;
  browserFingerprint?: string;
  deviceFingerprint?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  platform?: string;
}

export class AntiAbuseSystem {
  // Enhanced browser fingerprint with more security components
  static generateBrowserFingerprint(req: Request, clientData?: any): string {
    const components = [
      req.headers['user-agent'] || '',
      req.headers['accept-language'] || '',
      req.headers['accept-encoding'] || '',
      req.headers['accept'] || '',
      req.headers['sec-ch-ua'] || '',
      req.headers['sec-ch-ua-platform'] || '',
      clientData?.screenResolution || '',
      clientData?.timezone || '',
      clientData?.platform || '',
      clientData?.language || '',
      clientData?.colorDepth || '',
      clientData?.pixelRatio || '',
      clientData?.hardwareConcurrency || '',
      clientData?.maxTouchPoints || ''
    ];
    
    return crypto.createHash('sha256')
      .update(components.join('|'))
      .digest('hex')
      .substring(0, 16);
  }

  // Enhanced strict mode detection for preventing multi-wallet abuse
  static async detectStrictMultiWallet(walletAddress: string, req: Request, clientData?: any): Promise<{
    isAbuse: boolean;
    confidence: number;
    reason: string;
    suspiciousWallets: string[];
    action: 'allow' | 'warn' | 'block';
  }> {
    const currentFingerprint = {
      ipAddress: this.extractIPFingerprint(req),
      userAgent: req.headers['user-agent'] || '',
      browserFingerprint: this.generateBrowserFingerprint(req, clientData),
      deviceFingerprint: this.generateDeviceFingerprint(req, clientData),
      screenResolution: clientData?.screenResolution || '',
      timezone: clientData?.timezone || '',
      language: clientData?.language || '',
      platform: clientData?.platform || ''
    };

    // Get all wallet fingerprints from same IP in last 24 hours
    const recentWallets = await db.select()
      .from(walletFingerprints)
      .where(
        and(
          eq(walletFingerprints.ipAddress, currentFingerprint.ipAddress),
          sql`${walletFingerprints.createdAt} > NOW() - INTERVAL '24 hours'`
        )
      );

    if (recentWallets.length === 0) {
      return {
        isAbuse: false,
        confidence: 0,
        reason: 'New device/IP combination',
        suspiciousWallets: [],
        action: 'allow'
      };
    }

    // Check for exact matches (same device, different wallet)
    const exactMatches = recentWallets.filter(wallet => 
      wallet.walletAddress !== walletAddress &&
      (
        wallet.deviceFingerprint === currentFingerprint.deviceFingerprint ||
        (wallet.browserFingerprint === currentFingerprint.browserFingerprint &&
         wallet.screenResolution === currentFingerprint.screenResolution)
      )
    );

    if (exactMatches.length > 0) {
      return {
        isAbuse: true,
        confidence: 95,
        reason: 'Identical device fingerprint detected with different wallet',
        suspiciousWallets: exactMatches.map(w => w.walletAddress),
        action: 'block'
      };
    }

    // Check for high similarity (likely same person, different browser/device)
    let maxSimilarity = 0;
    const suspiciousWallets: string[] = [];
    
    for (const wallet of recentWallets) {
      if (wallet.walletAddress === walletAddress) continue;
      
      const similarity = this.calculateAdvancedSimilarity(currentFingerprint, {
        ipAddress: wallet.ipAddress,
        userAgent: wallet.userAgent,
        browserFingerprint: wallet.browserFingerprint || '',
        deviceFingerprint: wallet.deviceFingerprint || '',
        screenResolution: wallet.screenResolution || '',
        timezone: wallet.timezone || '',
        language: wallet.language || '',
        platform: wallet.platform || ''
      });

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }

      if (similarity > 0.7) {
        suspiciousWallets.push(wallet.walletAddress);
      }
    }

    // Determine action based on similarity and pattern
    let action: 'allow' | 'warn' | 'block' = 'allow';
    let isAbuse = false;

    if (maxSimilarity >= 0.9) {
      action = 'block';
      isAbuse = true;
    } else if (maxSimilarity >= 0.7 || suspiciousWallets.length >= 2) {
      action = 'warn';
      isAbuse = true;
    }

    return {
      isAbuse,
      confidence: Math.round(maxSimilarity * 100),
      reason: maxSimilarity >= 0.9 
        ? 'Very high similarity with existing wallet from same device'
        : maxSimilarity >= 0.7 
        ? 'High similarity pattern detected - possible multi-wallet abuse'
        : 'Low risk detected',
      suspiciousWallets,
      action
    };
  }

  // Advanced similarity calculation with weighted factors
  static calculateAdvancedSimilarity(fp1: DeviceFingerprint, fp2: DeviceFingerprint): number {
    let score = 0;
    let totalWeight = 0;

    // IP Address (highest weight - same IP is very suspicious)
    if (fp1.ipAddress === fp2.ipAddress) {
      score += 0.4;
    }
    totalWeight += 0.4;

    // Device Fingerprint (very high weight)
    if (fp1.deviceFingerprint === fp2.deviceFingerprint) {
      score += 0.3;
    }
    totalWeight += 0.3;

    // Browser Fingerprint (high weight)
    if (fp1.browserFingerprint === fp2.browserFingerprint) {
      score += 0.15;
    }
    totalWeight += 0.15;

    // Screen Resolution (medium weight)
    if (fp1.screenResolution === fp2.screenResolution && fp1.screenResolution) {
      score += 0.1;
    }
    totalWeight += 0.1;

    // Timezone (low weight but important)
    if (fp1.timezone === fp2.timezone && fp1.timezone) {
      score += 0.03;
    }
    totalWeight += 0.03;

    // Language (low weight)
    if (fp1.language === fp2.language && fp1.language) {
      score += 0.02;
    }
    totalWeight += 0.02;

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  // Automated action based on detection results
  static async executeAntiAbuseAction(
    walletAddress: string, 
    detection: {
      isAbuse: boolean;
      confidence: number;
      reason: string;
      suspiciousWallets: string[];
      action: 'allow' | 'warn' | 'block';
    },
    req: Request
  ): Promise<{
    allowed: boolean;
    message: string;
    requiresManualReview: boolean;
  }> {
    if (detection.action === 'allow') {
      return {
        allowed: true,
        message: 'Login allowed',
        requiresManualReview: false
      };
    }

    // Log security event
    await this.createAbuseDetection(
      walletAddress,
      detection.suspiciousWallets,
      detection.confidence,
      detection.reason,
      req
    );

    if (detection.action === 'block') {
      // Immediate block for high confidence abuse
      return {
        allowed: false,
        message: 'Login blocked: Multiple wallet abuse detected from same device. Please contact support if this is a mistake.',
        requiresManualReview: true
      };
    }

    if (detection.action === 'warn') {
      // Allow but flag for review
      return {
        allowed: true,
        message: 'Login allowed but flagged for security review',
        requiresManualReview: true
      };
    }

    return {
      allowed: true,
      message: 'Login allowed',
      requiresManualReview: false
    };
  }

  // Enhanced wallet validation on login
  static async validateWalletLogin(walletAddress: string, req: Request, clientData?: any): Promise<{
    success: boolean;
    message: string;
    requiresManualReview: boolean;
    securityScore: number;
  }> {
    try {
      // Perform strict multi-wallet detection
      const detection = await this.detectStrictMultiWallet(walletAddress, req, clientData);
      
      // Execute appropriate action
      const actionResult = await this.executeAntiAbuseAction(walletAddress, detection, req);
      
      // Record wallet fingerprint for future checks
      await this.recordWalletFingerprint(
        walletAddress,
        0, // userId will be set later after successful login
        req,
        clientData
      );

      return {
        success: actionResult.allowed,
        message: actionResult.message,
        requiresManualReview: actionResult.requiresManualReview,
        securityScore: detection.confidence
      };
    } catch (error) {
      console.error('Wallet validation error:', error);
      return {
        success: true, // Allow login on system error but flag for review
        message: 'Security check completed with warnings',
        requiresManualReview: true,
        securityScore: 0
      };
    }
  }

  // Generate device fingerprint (more stable than browser fingerprint)
  static generateDeviceFingerprint(req: Request, clientData?: any): string {
    const components = [
      this.extractIPFingerprint(req),
      clientData?.platform || '',
      clientData?.screenResolution || '',
      clientData?.timezone || ''
    ];
    
    return crypto.createHash('sha256')
      .update(components.join('|'))
      .digest('hex')
      .substring(0, 16);
  }

  // Extract IP-based fingerprint (handle proxies/VPNs)
  static extractIPFingerprint(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const clientIP = req.connection.remoteAddress;
    
    // Use the most reliable IP source
    const ip = forwarded?.split(',')[0].trim() || realIP || clientIP || '';
    
    // Create IP subnet fingerprint (last octet removed for privacy)
    const ipParts = ip.split('.');
    if (ipParts.length === 4) {
      return `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.xxx`;
    }
    
    return ip;
  }

  // Record wallet fingerprint
  static async recordWalletFingerprint(
    userId: number, 
    walletAddress: string, 
    req: Request, 
    clientData?: any
  ) {
    const fingerprint: DeviceFingerprint = {
      ipAddress: this.extractIPFingerprint(req),
      userAgent: req.headers['user-agent'] || '',
      browserFingerprint: this.generateBrowserFingerprint(req, clientData),
      deviceFingerprint: this.generateDeviceFingerprint(req, clientData),
      screenResolution: clientData?.screenResolution,
      timezone: clientData?.timezone,
      language: clientData?.language || req.headers['accept-language']?.split(',')[0],
      platform: clientData?.platform
    };

    // Check if fingerprint already exists
    const existing = await db.select()
      .from(walletFingerprints)
      .where(and(
        eq(walletFingerprints.userId, userId),
        eq(walletFingerprints.walletAddress, walletAddress)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing fingerprint
      await db.update(walletFingerprints)
        .set({
          ...fingerprint,
          lastSeen: new Date(),
          isActive: true
        })
        .where(eq(walletFingerprints.id, existing[0].id));
    } else {
      // Create new fingerprint
      await db.insert(walletFingerprints).values({
        userId,
        walletAddress,
        ...fingerprint
      });
    }

    // Check for potential abuse after recording
    await this.detectPotentialAbuse(userId, walletAddress, fingerprint);
  }

  // Detect potential multi-wallet abuse
  static async detectPotentialAbuse(
    userId: number, 
    walletAddress: string, 
    currentFingerprint: DeviceFingerprint
  ) {
    // Find similar fingerprints from different users
    const similarFingerprints = await db.select({
      userId: walletFingerprints.userId,
      walletAddress: walletFingerprints.walletAddress,
      ipAddress: walletFingerprints.ipAddress,
      browserFingerprint: walletFingerprints.browserFingerprint,
      deviceFingerprint: walletFingerprints.deviceFingerprint,
      userAgent: walletFingerprints.userAgent,
      createdAt: walletFingerprints.createdAt
    })
    .from(walletFingerprints)
    .where(and(
      eq(walletFingerprints.isActive, true),
      sql`${walletFingerprints.userId} != ${userId}` // Different user
    ));

    for (const fingerprint of similarFingerprints) {
      const similarity = this.calculateSimilarityScore(currentFingerprint, fingerprint);
      
      if (similarity >= 0.7) { // High similarity threshold
        await this.createAbuseDetection(
          userId,
          fingerprint.userId,
          similarity,
          currentFingerprint,
          fingerprint
        );
      }
    }
  }

  // Calculate similarity score between two fingerprints
  static calculateSimilarityScore(fp1: any, fp2: any): number {
    let matches = 0;
    let total = 0;

    // IP Address similarity (high weight)
    total += 3;
    if (fp1.ipAddress === fp2.ipAddress) matches += 3;

    // Device fingerprint similarity (high weight)
    total += 2;
    if (fp1.deviceFingerprint === fp2.deviceFingerprint) matches += 2;

    // Browser fingerprint similarity (medium weight)
    total += 2;
    if (fp1.browserFingerprint === fp2.browserFingerprint) matches += 2;

    // User agent similarity (medium weight)
    total += 1;
    if (fp1.userAgent === fp2.userAgent) matches += 1;

    // Screen resolution similarity (low weight)
    total += 1;
    if (fp1.screenResolution === fp2.screenResolution) matches += 1;

    return total > 0 ? matches / total : 0;
  }

  // Create abuse detection record
  static async createAbuseDetection(
    primaryUserId: number,
    suspiciousUserId: number,
    similarityScore: number,
    primaryFingerprint: any,
    suspiciousFingerprint: any
  ) {
    // Check if this abuse detection already exists
    const existing = await db.select()
      .from(abuseDetections)
      .where(and(
        eq(abuseDetections.primaryUserId, primaryUserId),
        eq(abuseDetections.suspiciousUserId, suspiciousUserId),
        eq(abuseDetections.status, 'pending')
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing detection with higher similarity score
      if (similarityScore > existing[0].similarityScore) {
        await db.update(abuseDetections)
          .set({
            similarityScore,
            evidenceData: {
              primaryFingerprint,
              suspiciousFingerprint,
              detectionTimestamp: new Date().toISOString()
            },
            updatedAt: new Date()
          })
          .where(eq(abuseDetections.id, existing[0].id));
      }
      return;
    }

    // Create new abuse detection
    await db.insert(abuseDetections).values({
      primaryUserId,
      suspiciousUserId,
      abuseType: 'multi_wallet',
      similarityScore,
      evidenceData: {
        primaryFingerprint,
        suspiciousFingerprint,
        detectionTimestamp: new Date().toISOString(),
        similarityBreakdown: {
          ipMatch: primaryFingerprint.ipAddress === suspiciousFingerprint.ipAddress,
          deviceMatch: primaryFingerprint.deviceFingerprint === suspiciousFingerprint.deviceFingerprint,
          browserMatch: primaryFingerprint.browserFingerprint === suspiciousFingerprint.browserFingerprint,
          userAgentMatch: primaryFingerprint.userAgent === suspiciousFingerprint.userAgent
        }
      },
      status: 'pending'
    });

    // Auto-action for high similarity scores
    if (similarityScore >= 0.9) {
      await this.takeAutoAction(primaryUserId, suspiciousUserId, similarityScore);
    }
  }

  // Take automatic action for high-confidence abuse cases
  static async takeAutoAction(primaryUserId: number, suspiciousUserId: number, similarityScore: number) {
    // For now, just flag for review - can be enhanced with automatic restrictions
    await db.update(abuseDetections)
      .set({
        actionTaken: 'flagged_for_review',
        updatedAt: new Date()
      })
      .where(and(
        eq(abuseDetections.primaryUserId, primaryUserId),
        eq(abuseDetections.suspiciousUserId, suspiciousUserId)
      ));
  }

  // Get abuse detections for admin review
  static async getAbuseDetections(limit: number = 50, status?: string) {
    const conditions = status ? [eq(abuseDetections.status, status)] : [];
    
    return await db.select({
      id: abuseDetections.id,
      primaryUserId: abuseDetections.primaryUserId,
      suspiciousUserId: abuseDetections.suspiciousUserId,
      abuseType: abuseDetections.abuseType,
      similarityScore: abuseDetections.similarityScore,
      evidenceData: abuseDetections.evidenceData,
      status: abuseDetections.status,
      actionTaken: abuseDetections.actionTaken,
      createdAt: abuseDetections.createdAt,
      primaryUser: {
        id: users.id,
        username: users.username,
        walletAddress: users.walletAddress
      },
      suspiciousUser: {
        id: users.id,
        username: users.username,
        walletAddress: users.walletAddress
      }
    })
    .from(abuseDetections)
    .leftJoin(users, eq(abuseDetections.primaryUserId, users.id))
    .leftJoin(users, eq(abuseDetections.suspiciousUserId, users.id))
    .where(and(...conditions))
    .orderBy(desc(abuseDetections.createdAt))
    .limit(limit);
  }

  // Update abuse detection status
  static async updateAbuseDetection(
    id: number, 
    status: string, 
    actionTaken?: string, 
    reviewedBy?: number
  ) {
    return await db.update(abuseDetections)
      .set({
        status,
        actionTaken,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(abuseDetections.id, id));
  }

  // Get user's wallet fingerprints
  static async getUserFingerprints(userId: number) {
    return await db.select()
      .from(walletFingerprints)
      .where(and(
        eq(walletFingerprints.userId, userId),
        eq(walletFingerprints.isActive, true)
      ))
      .orderBy(desc(walletFingerprints.lastSeen));
  }

  // Check if user is flagged for abuse
  static async isUserFlagged(userId: number): Promise<boolean> {
    const flagged = await db.select()
      .from(abuseDetections)
      .where(and(
        sql`(${abuseDetections.primaryUserId} = ${userId} OR ${abuseDetections.suspiciousUserId} = ${userId})`,
        eq(abuseDetections.status, 'confirmed')
      ))
      .limit(1);

    return flagged.length > 0;
  }
}