import { Request, Response } from 'express';
import { db } from '../../db.js';
import { deposits, withdrawals, users } from '../../../shared/schema.js';
import { eq, desc, and, sql, or, like } from 'drizzle-orm';

// Get comprehensive transaction history
export async function getTransactionHistory(req: Request, res: Response) {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Base query for deposits
    const depositsQuery = db
      .select({
        id: deposits.id,
        userId: deposits.userId,
        username: users.username,
        uid: users.uid,
        amount: deposits.ntiqAmount,
        tokenType: deposits.tokenType,
        chainName: deposits.chainName,
        status: deposits.status,
        transactionHash: deposits.transactionHash,
        createdAt: deposits.createdAt,
        processedAt: deposits.processedAt,
        type: sql<string>`'deposit'`,
        fromAddress: deposits.fromWalletAddress,
        toAddress: sql<string>`'0x4C6165286739696849Fb3e77A16b0639D762c5B6'` // Admin wallet
      })
      .from(deposits)
      .leftJoin(users, eq(deposits.userId, users.id));

    // Base query for withdrawals  
    const withdrawalsQuery = db
      .select({
        id: withdrawals.id,
        userId: withdrawals.userId,
        username: users.username,
        uid: users.uid,
        amount: withdrawals.ntiqAmount,
        tokenType: withdrawals.tokenType,
        chainName: withdrawals.chainName,
        status: withdrawals.status,
        transactionHash: withdrawals.transactionHash,
        createdAt: withdrawals.createdAt,
        processedAt: withdrawals.processedAt,
        type: sql<string>`'withdrawal'`,
        fromAddress: sql<string>`'0x4C6165286739696849Fb3e77A16b0639D762c5B6'`, // Admin wallet
        toAddress: withdrawals.toWalletAddress
      })
      .from(withdrawals)
      .leftJoin(users, eq(withdrawals.userId, users.id));

    // Apply filters
    const conditions = [];
    
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(users.username, searchPattern),
          like(users.uid, searchPattern),
          like(deposits.transactionHash, searchPattern),
          like(withdrawals.transactionHash, searchPattern)
        )
      );
    }

    if (status && status !== 'all') {
      conditions.push(eq(deposits.status, status as string));
      conditions.push(eq(withdrawals.status, status as string));
    }

    // Get results based on type filter
    let allTransactions: any[] = [];

    if (!type || type === 'all' || type === 'deposit') {
      const depositResults = await depositsQuery
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(deposits.createdAt));
      allTransactions.push(...depositResults);
    }

    if (!type || type === 'all' || type === 'withdrawal') {
      const withdrawalResults = await withdrawalsQuery
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(withdrawals.createdAt));
      allTransactions.push(...withdrawalResults);
    }

    // Sort by creation date
    allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const paginatedTransactions = allTransactions.slice(offset, offset + Number(limit));

    // Get total count for pagination
    const totalCount = allTransactions.length;

    res.json({
      transactions: paginatedTransactions,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit))
    });

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
}

// Get transaction statistics
export async function getTransactionStats(req: Request, res: Response) {
  try {
    // Get deposit statistics
    const depositStats = await db
      .select({
        totalDeposits: sql<number>`COUNT(*)`,
        completedDeposits: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
        pendingDeposits: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        totalDepositAmount: sql<number>`COALESCE(SUM(CASE WHEN status = 'completed' THEN ntiq_amount ELSE 0 END), 0)`
      })
      .from(deposits);

    // Get withdrawal statistics
    const withdrawalStats = await db
      .select({
        totalWithdrawals: sql<number>`COUNT(*)`,
        completedWithdrawals: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
        pendingWithdrawals: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        totalWithdrawalAmount: sql<number>`COALESCE(SUM(CASE WHEN status = 'completed' THEN ntiq_amount ELSE 0 END), 0)`
      })
      .from(withdrawals);

    res.json({
      deposits: depositStats[0] || {
        totalDeposits: 0,
        completedDeposits: 0,
        pendingDeposits: 0,
        totalDepositAmount: 0
      },
      withdrawals: withdrawalStats[0] || {
        totalWithdrawals: 0,
        completedWithdrawals: 0,
        pendingWithdrawals: 0,
        totalWithdrawalAmount: 0
      }
    });

  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch transaction statistics' });
  }
}