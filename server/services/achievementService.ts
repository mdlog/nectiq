import { db } from "../db";
import { 
  achievements, 
  userAchievements, 
  users,
  type Achievement,
  type UserAchievement,
  type InsertUserAchievement 
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { storage } from "../storage";
import { BalanceService } from "./balanceService";

export class AchievementService {
  // Check and update achievements for a user
  async checkAndUpdateAchievements(userId: number): Promise<UserAchievement[]> {
    const user = await storage.getUser(userId);
    if (!user) return [];

    const completedAchievements: UserAchievement[] = [];
    
    // Get all achievements
    const allAchievements = await db.select().from(achievements).where(eq(achievements.isActive, true));
    
    // Get user's current achievements
    const userAchievementsList = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    for (const achievement of allAchievements) {
      const existingUserAchievement = userAchievementsList.find(
        ua => ua.achievementId === achievement.id
      );

      if (existingUserAchievement?.isCompleted) continue;

      const progress = await this.calculateProgress(userId, achievement);
      const isCompleted = progress >= achievement.target;

      if (existingUserAchievement) {
        // Update existing achievement
        const [updated] = await db
          .update(userAchievements)
          .set({
            progress,
            isCompleted,
            completedAt: isCompleted ? new Date() : existingUserAchievement.completedAt,
          })
          .where(eq(userAchievements.id, existingUserAchievement.id))
          .returning();

        if (isCompleted && !existingUserAchievement.isCompleted) {
          // CRITICAL FIX: Use BalanceService for achievement rewards
          const balanceResult = await BalanceService.processTransaction({
            userId,
            type: 'achievement_reward',
            amount: achievement.reward,
            description: `Achievement reward: ${achievement.name}`,
            relatedId: achievement.id
          }, storage);
          
          completedAchievements.push(updated);
          console.log(`✅ Awarded ${achievement.reward} NTIQ to user ${userId} for achievement: ${achievement.name}`);
        }
      } else {
        // Create new achievement tracking
        const [newUserAchievement] = await db
          .insert(userAchievements)
          .values({
            userId,
            achievementId: achievement.id,
            progress,
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
          })
          .returning();

        if (isCompleted) {
          // CRITICAL FIX: Use BalanceService for achievement rewards
          const balanceResult = await BalanceService.processTransaction({
            userId,
            type: 'achievement_reward',
            amount: achievement.reward,
            description: `Achievement reward: ${achievement.name}`,
            relatedId: achievement.id
          }, storage);
          
          completedAchievements.push(newUserAchievement);
          console.log(`✅ Awarded ${achievement.reward} NTIQ to user ${userId} for new achievement: ${achievement.name}`);
        }
      }
    }

    return completedAchievements;
  }

  // Calculate progress for specific achievement types
  private async calculateProgress(userId: number, achievement: Achievement): Promise<number> {
    const user = await storage.getUser(userId);
    if (!user) return 0;

    switch (achievement.type) {
      case 'prediction_count':
        return user.totalPredictions;

      case 'accuracy':
        if (user.totalPredictions >= 10) {
          return Math.round((user.correctPredictions / user.totalPredictions) * 100);
        }
        return 0;

      case 'streak':
        // Get current win streak from latest predictions
        const recentPredictions = await storage.getUserPredictions(userId);
        let currentStreak = 0;
        for (let i = recentPredictions.length - 1; i >= 0; i--) {
          const prediction = recentPredictions[i];
          if (prediction.status === 'completed' && prediction.accuracy !== null && parseFloat(prediction.accuracy) >= 90) {
            currentStreak++;
          } else {
            break;
          }
        }
        return currentStreak;

      case 'rewards':
        return user.totalRewards;

      case 'high_stake':
        // Check if user has made any prediction with stake >= target
        const predictions = await storage.getUserPredictions(userId);
        const maxStake = predictions.length > 0 ? Math.max(...predictions.map(p => p.stakeAmount)) : 0;
        return maxStake >= achievement.target ? achievement.target : 0;

      default:
        return 0;
    }
  }

  // Get user achievements with details
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        progress: userAchievements.progress,
        isCompleted: userAchievements.isCompleted,
        completedAt: userAchievements.completedAt,
        createdAt: userAchievements.createdAt,
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
  }

  // Get all available achievements
  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.isActive, true));
  }
}

export const achievementService = new AchievementService();