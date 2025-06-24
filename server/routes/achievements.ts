import { Request, Response } from 'express';
import { db } from './db';
import { predictions, rewards } from '../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// Get user's prediction history with achievements
export async function getUserAchievements(req: Request, res: Response) {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get all resolved and claimed predictions for the user
    const userPredictions = await db
      .select({
        id: predictions.id,
        cryptocurrency: predictions.cryptocurrency,
        predictedPrice: predictions.predictedPrice,
        actualPrice: predictions.actualPrice,
        accuracyScore: predictions.accuracyScore,
        rewardAmount: predictions.rewardAmount,
        stakeAmount: predictions.stakeAmount,
        submissionTime: predictions.submissionTime,
        targetTime: predictions.targetTime,
        resolved: predictions.resolved,
        claimed: predictions.claimed,
      })
      .from(predictions)
      .where(
        and(
          eq(predictions.userId, userId),
          eq(predictions.resolved, true),
          eq(predictions.claimed, true)
        )
      )
      .orderBy(desc(predictions.accuracyScore));

    // Calculate achievement statistics
    const achievements = userPredictions.map(prediction => {
      const accuracyPercentage = (prediction.accuracyScore || 0) / 100; // accuracyScore is already in percentage
      const rewardMultiplier = prediction.rewardAmount / prediction.stakeAmount;
      
      let achievementLevel = 'good';
      let achievementLabel = 'Good Prediction';
      
      if (accuracyPercentage >= 99.9) {
        achievementLevel = 'perfect';
        achievementLabel = 'Perfect Predictor';
      } else if (accuracyPercentage >= 99) {
        achievementLevel = 'sharpshooter';
        achievementLabel = 'Sharpshooter';
      } else if (accuracyPercentage >= 95) {
        achievementLevel = 'master';
        achievementLabel = 'Accuracy Master';
      } else if (accuracyPercentage >= 90) {
        achievementLevel = 'skilled';
        achievementLabel = 'Skilled Trader';
      }

      return {
        ...prediction,
        achievementLevel,
        achievementLabel,
        accuracyPercentage,
        rewardMultiplier,
        profitAmount: prediction.rewardAmount - prediction.stakeAmount
      };
    });

    res.json(achievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get achievement statistics for a user
export async function getAchievementStats(req: Request, res: Response) {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get all user predictions
    const allPredictions = await db
      .select({
        id: predictions.id,
        resolved: predictions.resolved,
        claimed: predictions.claimed,
        accuracyScore: predictions.accuracyScore,
        rewardAmount: predictions.rewardAmount,
        stakeAmount: predictions.stakeAmount,
      })
      .from(predictions)
      .where(eq(predictions.userId, userId));

    const totalPredictions = allPredictions.filter(p => p.resolved).length;
    const successfulPredictions = allPredictions.filter(p => p.resolved && p.claimed).length;
    const totalRewards = allPredictions
      .filter(p => p.claimed)
      .reduce((sum, p) => sum + (p.rewardAmount || 0), 0);

    let avgAccuracy = 0;
    let perfectCount = 0;
    let highAccuracyCount = 0;
    let mediumAccuracyCount = 0;

    if (successfulPredictions > 0) {
      const totalAccuracy = allPredictions
        .filter(p => p.resolved && p.claimed)
        .reduce((sum, p) => sum + (p.accuracyScore || 0), 0);
      
      avgAccuracy = totalAccuracy / successfulPredictions;

      // Count achievement levels
      allPredictions
        .filter(p => p.resolved && p.claimed)
        .forEach(p => {
          const accuracy = (p.accuracyScore || 0);
          if (accuracy >= 99.9) perfectCount++;
          else if (accuracy >= 95) highAccuracyCount++;
          else if (accuracy >= 90) mediumAccuracyCount++;
        });
    }

    const successRate = totalPredictions > 0 ? (successfulPredictions / totalPredictions) * 100 : 0;

    const stats = {
      totalPredictions,
      successfulPredictions,
      totalRewards,
      avgAccuracy,
      successRate,
      achievementCounts: {
        perfect: perfectCount,
        high: highAccuracyCount,
        medium: mediumAccuracyCount,
        total: successfulPredictions
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get global achievement leaderboard
export async function getAchievementLeaderboard(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const type = req.query.type as string || 'accuracy'; // accuracy, rewards, count

    let orderBy;
    switch (type) {
      case 'rewards':
        orderBy = desc(sql`SUM(${predictions.rewardAmount})`);
        break;
      case 'count':
        orderBy = desc(sql`COUNT(*)`);
        break;
      default:
        orderBy = desc(sql`AVG(${predictions.accuracyScore})`);
    }

    // This is a complex query that would need proper JOIN with users table
    // For now, returning a simplified version
    const topAchievers = await db
      .select({
        userId: predictions.userId,
        totalRewards: sql<number>`SUM(${predictions.rewardAmount})`,
        avgAccuracy: sql<number>`AVG(${predictions.accuracyScore})`,
        predictionCount: sql<number>`COUNT(*)`,
      })
      .from(predictions)
      .where(
        and(
          eq(predictions.resolved, true),
          eq(predictions.claimed, true)
        )
      )
      .groupBy(predictions.userId)
      .orderBy(orderBy)
      .limit(limit);

    res.json(topAchievers);
  } catch (error) {
    console.error('Error fetching achievement leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}