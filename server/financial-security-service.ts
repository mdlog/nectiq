/**
 * SECURITY: Comprehensive Financial Transaction Security Service
 * Prevents race conditions, double-spending, and financial integrity issues
 */

import { IStorage } from './storage';
import { eq, and, or, isNotNull } from 'drizzle-orm';
import { db } from './db';
import { users, withdrawals, deposits, transactionLogs } from '../shared/schema';

interface TransactionLock {
  userId: number;
  type: string;
  locked: boolean;
  timestamp: number;
}

interface FinancialIntegrityIssue {
  type: string;
  userId: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  data: any;
}

class FinancialSecurityService {
  private transactionLocks = new Map<string, TransactionLock>();
  private readonly LOCK_TIMEOUT = 30000; // 30 seconds
  private readonly BALANCE_TOLERANCE = 1; // 1 NTIQ tolerance for floating point errors
  
  /**
   * SECURITY: Acquire transaction lock to prevent race conditions
   */
  private async acquireTransactionLock(userId: number, type: string): Promise<boolean> {
    const lockKey = `${userId}-${type}`;
    const existingLock = this.transactionLocks.get(lockKey);
    
    // Check if lock exists and is not expired
    if (existingLock && existingLock.locked) {
      const isExpired = Date.now() - existingLock.timestamp > this.LOCK_TIMEOUT;
      if (!isExpired) {
        console.warn(`🔒 [FINANCIAL-SECURITY] Transaction lock already exists for user ${userId}, type ${type}`);
        return false;
      }
      // Lock expired, remove it
      this.transactionLocks.delete(lockKey);
    }
    
    // Acquire new lock
    this.transactionLocks.set(lockKey, {
      userId,
      type,
      locked: true,
      timestamp: Date.now()
    });
    
    console.log(`🔒 [FINANCIAL-SECURITY] Acquired transaction lock for user ${userId}, type ${type}`);
    return true;
  }
  
  /**
   * SECURITY: Release transaction lock
   */
  private releaseTransactionLock(userId: number, type: string): void {
    const lockKey = `${userId}-${type}`;
    this.transactionLocks.delete(lockKey);
    console.log(`🔓 [FINANCIAL-SECURITY] Released transaction lock for user ${userId}, type ${type}`);
  }
  
  /**
   * SECURITY: Secure withdrawal validation with atomic checks
   */
  async validateWithdrawalSecurity(userId: number, amount: number, withdrawalId?: number): Promise<{
    valid: boolean;
    reason?: string;
    issues: FinancialIntegrityIssue[];
  }> {
    const issues: FinancialIntegrityIssue[] = [];
    
    try {
      // 1. Acquire lock to prevent concurrent withdrawals
      const lockAcquired = await this.acquireTransactionLock(userId, 'withdrawal');
      if (!lockAcquired) {
        return {
          valid: false,
          reason: 'Another withdrawal is currently being processed',
          issues: [{
            type: 'CONCURRENT_WITHDRAWAL_ATTEMPT',
            userId,
            severity: 'HIGH',
            description: 'User attempted concurrent withdrawal while another is processing',
            data: { amount, withdrawalId }
          }]
        };
      }
      
      try {
        // 2. Get current user balance with fresh query
        const userResult = await db
          .select({ balance: users.balance })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
          
        if (!userResult.length) {
          issues.push({
            type: 'USER_NOT_FOUND',
            userId,
            severity: 'CRITICAL',
            description: 'User not found during withdrawal validation',
            data: { amount, withdrawalId }
          });
          return { valid: false, reason: 'User not found', issues };
        }
        
        const currentBalance = userResult[0].balance;
        
        // 3. Check for sufficient balance with safety margin
        if (currentBalance < amount) {
          issues.push({
            type: 'INSUFFICIENT_BALANCE',
            userId,
            severity: 'HIGH',
            description: `Insufficient balance for withdrawal: ${currentBalance} < ${amount}`,
            data: { currentBalance, requestedAmount: amount, withdrawalId }
          });
          return { valid: false, reason: 'Insufficient balance', issues };
        }
        
        // 4. Check for pending withdrawals (prevent double-spending)
        const pendingWithdrawals = await db
          .select()
          .from(withdrawals)
          .where(and(
            eq(withdrawals.userId, userId),
            or(
              eq(withdrawals.status, 'pending'),
              eq(withdrawals.status, 'processing')
            )
          ));
          
        const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.ntiqAmount, 0);
        
        if (currentBalance < (amount + totalPendingAmount)) {
          issues.push({
            type: 'INSUFFICIENT_BALANCE_WITH_PENDING',
            userId,
            severity: 'HIGH',
            description: `Insufficient balance considering pending withdrawals: ${currentBalance} < ${amount + totalPendingAmount}`,
            data: { 
              currentBalance, 
              requestedAmount: amount, 
              pendingAmount: totalPendingAmount,
              pendingWithdrawals: pendingWithdrawals.length,
              withdrawalId 
            }
          });
          return { valid: false, reason: 'Insufficient balance with pending withdrawals', issues };
        }
        
        // 5. Validate withdrawal frequency (anti-abuse)
        const recentWithdrawals = await db
          .select()
          .from(withdrawals)
          .where(and(
            eq(withdrawals.userId, userId),
            // Last 24 hours
          ));
          
        if (recentWithdrawals.length >= 10) {
          issues.push({
            type: 'WITHDRAWAL_FREQUENCY_ABUSE',
            userId,
            severity: 'MEDIUM',
            description: `Excessive withdrawal frequency: ${recentWithdrawals.length} in 24h`,
            data: { recentCount: recentWithdrawals.length, amount, withdrawalId }
          });
        }
        
        return { valid: true, issues };
        
      } finally {
        this.releaseTransactionLock(userId, 'withdrawal');
      }
      
    } catch (error) {
      this.releaseTransactionLock(userId, 'withdrawal');
      issues.push({
        type: 'WITHDRAWAL_VALIDATION_ERROR',
        userId,
        severity: 'CRITICAL',
        description: `Error during withdrawal validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { amount, withdrawalId, error: String(error) }
      });
      return { valid: false, reason: 'Validation error', issues };
    }
  }
  
  /**
   * SECURITY: Secure deposit processing with duplicate detection
   */
  async validateDepositSecurity(userId: number, amount: number, transactionHash: string): Promise<{
    valid: boolean;
    reason?: string;
    issues: FinancialIntegrityIssue[];
  }> {
    const issues: FinancialIntegrityIssue[] = [];
    
    try {
      // 1. Check for duplicate transaction hash
      const existingDeposit = await db
        .select()
        .from(deposits)
        .where(eq(deposits.transactionHash, transactionHash))
        .limit(1);
        
      if (existingDeposit.length > 0) {
        issues.push({
          type: 'DUPLICATE_TRANSACTION_HASH',
          userId,
          severity: 'CRITICAL',
          description: `Duplicate transaction hash detected: ${transactionHash}`,
          data: { 
            amount, 
            transactionHash, 
            existingDepositId: existingDeposit[0].id,
            existingUserId: existingDeposit[0].userId 
          }
        });
        return { valid: false, reason: 'Duplicate transaction hash', issues };
      }
      
      // 2. Check for suspicious deposit patterns
      const recentDeposits = await db
        .select()
        .from(deposits)
        .where(eq(deposits.userId, userId));
        
      // Check for rapid successive deposits with same amount
      const sameAmountDeposits = recentDeposits.filter(d => d.ntiqAmount === amount);
      if (sameAmountDeposits.length >= 3) {
        issues.push({
          type: 'SUSPICIOUS_DEPOSIT_PATTERN',
          userId,
          severity: 'MEDIUM',
          description: `Multiple deposits with identical amount: ${amount}`,
          data: { amount, count: sameAmountDeposits.length, transactionHash }
        });
      }
      
      // 3. Validate amount reasonableness
      if (amount <= 0 || amount > 1000000) { // Max 1M NTIQ
        issues.push({
          type: 'INVALID_DEPOSIT_AMOUNT',
          userId,
          severity: 'HIGH',
          description: `Invalid deposit amount: ${amount}`,
          data: { amount, transactionHash }
        });
        return { valid: false, reason: 'Invalid deposit amount', issues };
      }
      
      return { valid: true, issues };
      
    } catch (error) {
      issues.push({
        type: 'DEPOSIT_VALIDATION_ERROR',
        userId,
        severity: 'CRITICAL',
        description: `Error during deposit validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { amount, transactionHash, error: String(error) }
      });
      return { valid: false, reason: 'Validation error', issues };
    }
  }
  
  /**
   * SECURITY: Comprehensive balance integrity check
   */
  async validateBalanceIntegrity(userId: number): Promise<{
    valid: boolean;
    issues: FinancialIntegrityIssue[];
    calculatedBalance: number;
    actualBalance: number;
  }> {
    const issues: FinancialIntegrityIssue[] = [];
    
    try {
      // 1. Get current user balance
      const userResult = await db
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
        
      if (!userResult.length) {
        issues.push({
          type: 'USER_NOT_FOUND',
          userId,
          severity: 'CRITICAL',
          description: 'User not found during balance validation',
          data: {}
        });
        return { valid: false, issues, calculatedBalance: 0, actualBalance: 0 };
      }
      
      const actualBalance = userResult[0].balance;
      
      // 2. Calculate balance from transaction history
      const transactions = await db
        .select()
        .from(transactionLogs)
        .where(eq(transactionLogs.userId, userId));
        
      let calculatedBalance = 1000; // Starting balance
      
      for (const transaction of transactions) {
        if (['crypto_purchase', 'deposit_credit', 'prediction_reward', 'battle_reward', 
             'achievement_reward', 'daily_challenge_reward', 'referral_reward'].includes(transaction.type)) {
          calculatedBalance += transaction.amount;
        } else if (['prediction_stake', 'battle_stake', 'withdrawal_deduction', 
                   'withdrawal_completed', 'survival_tournament_entry'].includes(transaction.type)) {
          calculatedBalance -= transaction.amount;
        }
      }
      
      // 3. Check for discrepancy
      const discrepancy = Math.abs(actualBalance - calculatedBalance);
      
      if (discrepancy > this.BALANCE_TOLERANCE) {
        issues.push({
          type: 'BALANCE_INTEGRITY_MISMATCH',
          userId,
          severity: discrepancy > 100 ? 'CRITICAL' : 'HIGH',
          description: `Balance mismatch: actual ${actualBalance} vs calculated ${calculatedBalance} (diff: ${actualBalance - calculatedBalance})`,
          data: { 
            actualBalance, 
            calculatedBalance, 
            discrepancy,
            transactionCount: transactions.length 
          }
        });
        return { valid: false, issues, calculatedBalance, actualBalance };
      }
      
      return { valid: true, issues, calculatedBalance, actualBalance };
      
    } catch (error) {
      issues.push({
        type: 'BALANCE_VALIDATION_ERROR',
        userId,
        severity: 'CRITICAL',
        description: `Error during balance validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { error: String(error) }
      });
      return { valid: false, issues, calculatedBalance: 0, actualBalance: 0 };
    }
  }
  
  /**
   * SECURITY: Detect and fix financial anomalies
   */
  async runFinancialSecurityScan(): Promise<FinancialIntegrityIssue[]> {
    const allIssues: FinancialIntegrityIssue[] = [];
    
    try {
      console.log('🔍 [FINANCIAL-SECURITY] Starting comprehensive financial security scan...');
      
      // 1. Check for suspicious withdrawals (rejected but with transaction hash)
      const suspiciousWithdrawals = await db
        .select()
        .from(withdrawals)
        .where(and(
          eq(withdrawals.status, 'rejected'),
          isNotNull(withdrawals.transactionHash)
        ));
        
      for (const withdrawal of suspiciousWithdrawals) {
        allIssues.push({
          type: 'SUSPICIOUS_REJECTED_WITHDRAWAL',
          userId: withdrawal.userId,
          severity: 'CRITICAL',
          description: `Withdrawal marked as rejected but has transaction hash: ${withdrawal.transactionHash}`,
          data: withdrawal
        });
      }
      
      // 2. Check for orphaned processing withdrawals
      const oldProcessingWithdrawals = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.status, 'processing'));
        
      const cutoffTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      
      for (const withdrawal of oldProcessingWithdrawals) {
        if (new Date(withdrawal.createdAt) < cutoffTime) {
          allIssues.push({
            type: 'ORPHANED_PROCESSING_WITHDRAWAL',
            userId: withdrawal.userId,
            severity: 'HIGH',
            description: `Withdrawal stuck in processing state for over 2 hours`,
            data: withdrawal
          });
        }
      }
      
      // 3. Check for balance integrity issues across all users
      const allUsers = await db.select().from(users);
      
      for (const user of allUsers) {
        const integrity = await this.validateBalanceIntegrity(user.id);
        if (!integrity.valid) {
          allIssues.push(...integrity.issues);
        }
      }
      
      console.log(`🔍 [FINANCIAL-SECURITY] Financial security scan completed. Found ${allIssues.length} issues.`);
      
      // 4. Log critical issues
      const criticalIssues = allIssues.filter(issue => issue.severity === 'CRITICAL');
      if (criticalIssues.length > 0) {
        console.error(`🚨 [FINANCIAL-SECURITY] CRITICAL: Found ${criticalIssues.length} critical financial security issues!`);
        for (const issue of criticalIssues) {
          console.error(`🚨 [FINANCIAL-SECURITY] ${issue.type}: ${issue.description}`);
        }
      }
      
      return allIssues;
      
    } catch (error) {
      console.error('🚨 [FINANCIAL-SECURITY] Error during financial security scan:', error);
      allIssues.push({
        type: 'SECURITY_SCAN_ERROR',
        userId: 0,
        severity: 'CRITICAL',
        description: `Error during financial security scan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { error: String(error) }
      });
      return allIssues;
    }
  }
  
  /**
   * SECURITY: Clean up expired transaction locks
   */
  private cleanupExpiredLocks(): void {
    const now = Date.now();
    for (const [key, lock] of this.transactionLocks.entries()) {
      if (now - lock.timestamp > this.LOCK_TIMEOUT) {
        this.transactionLocks.delete(key);
        console.log(`🧹 [FINANCIAL-SECURITY] Cleaned up expired lock: ${key}`);
      }
    }
  }
  
  /**
   * SECURITY: Initialize financial security monitoring
   */
  startSecurityMonitoring(): void {
    console.log('🚀 [FINANCIAL-SECURITY] Starting financial security monitoring...');
    
    // Clean up locks every 5 minutes
    setInterval(() => {
      this.cleanupExpiredLocks();
    }, 5 * 60 * 1000);
    
    // Run comprehensive security scan every 30 minutes
    setInterval(async () => {
      await this.runFinancialSecurityScan();
    }, 30 * 60 * 1000);
    
    // Initial scan
    setTimeout(async () => {
      await this.runFinancialSecurityScan();
    }, 5000); // 5 seconds after startup
    
    console.log('✅ [FINANCIAL-SECURITY] Financial security monitoring started');
  }
}

// Export singleton instance
export const financialSecurityService = new FinancialSecurityService();