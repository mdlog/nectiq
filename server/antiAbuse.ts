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
  // Generate browser fingerprint from request headers and client data
  static generateBrowserFingerprint(req: Request, clientData?: any): string {
    const components = [
      req.headers['user-agent'] || '',
      req.headers['accept-language'] || '',
      req.headers['accept-encoding'] || '',
      req.headers['accept'] || '',
      clientData?.screenResolution || '',
      clientData?.timezone || '',
      clientData?.platform || '',
      clientData?.language || ''
    ];
    
    return crypto.createHash('sha256')
      .update(components.join('|'))
      .digest('hex')
      .substring(0, 16);
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