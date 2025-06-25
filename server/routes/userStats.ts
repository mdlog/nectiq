import { Request, Response } from 'express';
import { db } from '../db';
import { users, predictions, rewards, banners, abuseDetections } from '../../shared/schema';
import { eq, and, gte, lte, sql, desc, count } from 'drizzle-orm';

export async function getUserStatistics(req: Request, res: Response) {
  try {
    const timeRange = req.query.range as string || '7d'; // 24h, 7d, 30d, all
    
    // Calculate date ranges
    const now = new Date();
    const getDateRange = (range: string) => {
      switch (range) {
        case '24h':
          return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case '7d':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default:
          return new Date(0); // All time
      }
    };
    
    const startDate = getDateRange(timeRange);

    // Total Users
    const totalUsersResult = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // New Users in time range
    const newUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startDate));
    const newUsers = newUsersResult[0]?.count || 0;

    // Active Users (users who made predictions in time range)
    const activeUsersResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${predictions.userId})` })
      .from(predictions)
      .where(gte(predictions.submissionTime, startDate));
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Admin Users
    const adminUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isAdmin, true));
    const adminUsers = adminUsersResult[0]?.count || 0;

    // Users with wallet connections
    const walletUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.walletAddress} IS NOT NULL AND ${users.walletAddress} != ''`);
    const walletUsers = walletUsersResult[0]?.count || 0;

    // Rich Users (balance > 1000 NTIQ)
    const richUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.balance, 1000));
    const richUsers = richUsersResult[0]?.count || 0;

    // Total Predictions in time range
    const totalPredictionsResult = await db
      .select({ count: count() })
      .from(predictions)
      .where(gte(predictions.submissionTime, startDate));
    const totalPredictions = totalPredictionsResult[0]?.count || 0;

    // Successful Predictions (resolved and claimed)
    const successfulPredictionsResult = await db
      .select({ count: count() })
      .from(predictions)
      .where(
        and(
          gte(predictions.submissionTime, startDate),
          eq(predictions.resolved, true),
          eq(predictions.claimed, true)
        )
      );
    const successfulPredictions = successfulPredictionsResult[0]?.count || 0;

    // Total Rewards Paid
    const totalRewardsResult = await db
      .select({ total: sql<number>`SUM(${rewards.amount})` })
      .from(rewards)
      .where(gte(rewards.createdAt, startDate));
    const totalRewards = totalRewardsResult[0]?.total || 0;

    // Average User Balance
    const avgBalanceResult = await db
      .select({ avg: sql<number>`AVG(${users.balance})` })
      .from(users);
    const avgBalance = avgBalanceResult[0]?.avg || 0;

    // Top Performing Users (by accuracy)
    const topUsers = await db
      .select({
        userId: predictions.userId,
        username: users.username,
        totalPredictions: count(),
        avgAccuracy: sql<number>`AVG(${predictions.accuracyScore})`,
        totalRewards: sql<number>`SUM(${predictions.rewardAmount})`,
      })
      .from(predictions)
      .innerJoin(users, eq(predictions.userId, users.id))
      .where(
        and(
          gte(predictions.submissionTime, startDate),
          eq(predictions.resolved, true)
        )
      )
      .groupBy(predictions.userId, users.username)
      .orderBy(desc(sql`AVG(${predictions.accuracyScore})`))
      .limit(10);

    // User Registration Trend (daily for last 30 days)
    const registrationTrend = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Activity Trend (predictions per day for last 30 days)
    const activityTrend = await db
      .select({
        date: sql<string>`DATE(${predictions.submissionTime})`,
        count: count(),
      })
      .from(predictions)
      .where(gte(predictions.submissionTime, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`DATE(${predictions.submissionTime})`)
      .orderBy(sql`DATE(${predictions.submissionTime})`);

    // User Segments
    const userSegments = {
      newUsers: newUsers,
      activeUsers: activeUsers,
      dormantUsers: totalUsers - activeUsers,
      adminUsers: adminUsers,
      walletUsers: walletUsers,
      richUsers: richUsers,
    };

    // Prediction Statistics
    const predictionStats = {
      total: totalPredictions,
      successful: successfulPredictions,
      successRate: totalPredictions > 0 ? (successfulPredictions / totalPredictions) * 100 : 0,
      pending: totalPredictions - successfulPredictions,
    };

    // Financial Statistics
    const financialStats = {
      totalRewards: totalRewards,
      avgBalance: avgBalance,
      avgRewardPerUser: activeUsers > 0 ? totalRewards / activeUsers : 0,
    };

    // Growth Metrics
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const previousNewUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, previousPeriodStart),
          lte(users.createdAt, startDate)
        )
      );
    const previousNewUsers = previousNewUsersResult[0]?.count || 0;
    
    const newUsersGrowth = previousNewUsers > 0 
      ? ((newUsers - previousNewUsers) / previousNewUsers) * 100 
      : newUsers > 0 ? 100 : 0;

    const growthMetrics = {
      newUsersGrowth: newUsersGrowth,
      newUsersChange: newUsers - previousNewUsers,
    };

    const response = {
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        adminUsers,
        timeRange,
        lastUpdated: now.toISOString(),
      },
      userSegments,
      predictionStats,
      financialStats,
      growthMetrics,
      topUsers,
      trends: {
        registrations: registrationTrend,
        activity: activityTrend,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUserGrowthMetrics(req: Request, res: Response) {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Daily user registrations
    const dailyRegistrations = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
        cumulative: sql<number>`COUNT(*) OVER (ORDER BY DATE(${users.createdAt}) ROWS UNBOUNDED PRECEDING)`,
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Daily active users (users making predictions)
    const dailyActiveUsers = await db
      .select({
        date: sql<string>`DATE(${predictions.submissionTime})`,
        count: sql<number>`COUNT(DISTINCT ${predictions.userId})`,
      })
      .from(predictions)
      .where(gte(predictions.submissionTime, startDate))
      .groupBy(sql`DATE(${predictions.submissionTime})`)
      .orderBy(sql`DATE(${predictions.submissionTime})`);

    // User retention (users who made predictions in their first week)
    const retentionData = await db
      .select({
        userId: users.id,
        registrationDate: users.createdAt,
        firstPrediction: sql<Date>`MIN(${predictions.submissionTime})`,
        daysBetween: sql<number>`EXTRACT(DAY FROM MIN(${predictions.submissionTime}) - ${users.createdAt})`,
      })
      .from(users)
      .leftJoin(predictions, eq(users.id, predictions.userId))
      .where(gte(users.createdAt, startDate))
      .groupBy(users.id, users.createdAt)
      .having(sql`MIN(${predictions.submissionTime}) IS NOT NULL`);

    res.json({
      dailyRegistrations,
      dailyActiveUsers,
      retentionData,
      period: `${days} days`,
    });
  } catch (error) {
    console.error('Error fetching growth metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUserEngagementMetrics(req: Request, res: Response) {
  try {
    // User engagement levels based on prediction activity
    const engagementLevels = await db
      .select({
        userId: predictions.userId,
        username: users.username,
        predictionCount: count(),
        avgAccuracy: sql<number>`AVG(${predictions.accuracyScore})`,
        totalStaked: sql<number>`SUM(${predictions.stakeAmount})`,
        totalRewards: sql<number>`SUM(${predictions.rewardAmount})`,
        lastActivity: sql<Date>`MAX(${predictions.submissionTime})`,
        engagementScore: sql<number>`
          (COUNT(*) * 0.4) + 
          (AVG(${predictions.accuracyScore}) * 0.3) + 
          (SUM(${predictions.stakeAmount}) * 0.3 / 100)
        `,
      })
      .from(predictions)
      .innerJoin(users, eq(predictions.userId, users.id))
      .where(eq(predictions.resolved, true))
      .groupBy(predictions.userId, users.username)
      .orderBy(desc(sql`
        (COUNT(*) * 0.4) + 
        (AVG(${predictions.accuracyScore}) * 0.3) + 
        (SUM(${predictions.stakeAmount}) * 0.3 / 100)
      `))
      .limit(50);

    // Categorize users by engagement level
    const highEngagement = engagementLevels.filter(u => Number(u.engagementScore) > 50);
    const mediumEngagement = engagementLevels.filter(u => Number(u.engagementScore) > 20 && Number(u.engagementScore) <= 50);
    const lowEngagement = engagementLevels.filter(u => Number(u.engagementScore) <= 20);

    res.json({
      engagementLevels,
      segments: {
        high: highEngagement.length,
        medium: mediumEngagement.length,
        low: lowEngagement.length,
      },
      topEngaged: highEngagement.slice(0, 10),
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}