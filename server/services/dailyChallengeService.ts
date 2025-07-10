import { db } from "../db";
import { 
  dailyChallenges, 
  userDailyChallenges, 
  type DailyChallenge,
  type UserDailyChallenge,
  type InsertDailyChallenge,
  type InsertUserDailyChallenge 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { storage } from "../storage";
import { BalanceService } from "./balanceService";

export class DailyChallengeService {
  // Generate daily challenges for today
  async generateDailyChallenges(): Promise<DailyChallenge[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if challenges already exist for today
    const existingChallenges = await db
      .select()
      .from(dailyChallenges)
      .where(and(
        eq(dailyChallenges.date, today),
        eq(dailyChallenges.isActive, true)
      ));

    if (existingChallenges.length > 0) {
      return existingChallenges;
    }

    // Generate new challenges for today
    const challengeTemplates = [
      {
        name: "Daily Predictor",
        description: "Make 3 predictions today",
        type: "make_predictions",
        target: 3,
        reward: 200
      },
      {
        name: "Accuracy Champion",
        description: "Achieve 70% accuracy on predictions today",
        type: "accuracy_target",
        target: 70,
        reward: 300
      },
      {
        name: "High Roller",
        description: "Make a prediction with 500+ NTIQ stake",
        type: "high_stake",
        target: 500,
        reward: 400
      },
      {
        name: "Crypto Explorer",
        description: "Make predictions on 2 different cryptocurrencies",
        type: "diverse_predictions",
        target: 2,
        reward: 250
      }
    ];

    // Randomly select 2-3 challenges for today
    const selectedChallenges = challengeTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 2);

    const newChallenges: DailyChallenge[] = [];
    
    for (const template of selectedChallenges) {
      const [challenge] = await db
        .insert(dailyChallenges)
        .values({
          ...template,
          date: today,
          isActive: true
        })
        .returning();
      
      newChallenges.push(challenge);
    }

    return newChallenges;
  }

  // Get today's challenges for a user
  async getUserTodayChallenges(userId: number): Promise<(UserDailyChallenge & { challenge: DailyChallenge })[]> {
    const today = new Date().toISOString().split('T')[0];
    
    // Ensure challenges exist for today
    await this.generateDailyChallenges();
    
    const todayChallenges = await db
      .select()
      .from(dailyChallenges)
      .where(and(
        eq(dailyChallenges.date, today),
        eq(dailyChallenges.isActive, true)
      ));

    const userChallenges = [];

    for (const challenge of todayChallenges) {
      let userChallenge = await db
        .select()
        .from(userDailyChallenges)
        .where(and(
          eq(userDailyChallenges.userId, userId),
          eq(userDailyChallenges.challengeId, challenge.id),
          eq(userDailyChallenges.date, today)
        ))
        .limit(1);

      if (userChallenge.length === 0) {
        // Create new user challenge tracking
        const [newUserChallenge] = await db
          .insert(userDailyChallenges)
          .values({
            userId,
            challengeId: challenge.id,
            progress: 0,
            isCompleted: false,
            date: today
          })
          .returning();
        
        userChallenges.push({
          ...newUserChallenge,
          challenge
        });
      } else {
        userChallenges.push({
          ...userChallenge[0],
          challenge
        });
      }
    }

    return userChallenges;
  }

  // Update challenge progress for a user
  async updateChallengeProgress(userId: number): Promise<UserDailyChallenge[]> {
    const today = new Date().toISOString().split('T')[0];
    const completedChallenges: UserDailyChallenge[] = [];
    
    const userChallenges = await this.getUserTodayChallenges(userId);
    
    for (const userChallenge of userChallenges) {
      if (userChallenge.isCompleted) continue;

      const progress = await this.calculateChallengeProgress(userId, userChallenge.challenge, today);
      const isCompleted = progress >= userChallenge.challenge.target;

      const [updated] = await db
        .update(userDailyChallenges)
        .set({
          progress,
          isCompleted,
          completedAt: isCompleted ? new Date() : userChallenge.completedAt
        })
        .where(eq(userDailyChallenges.id, userChallenge.id))
        .returning();

      if (isCompleted && !userChallenge.isCompleted) {
        // CRITICAL FIX: Use BalanceService for daily challenge rewards
        const balanceResult = await BalanceService.processTransaction({
          userId,
          type: 'daily_challenge_reward',
          amount: userChallenge.challenge.reward,
          description: `Daily challenge reward: ${userChallenge.challenge.name}`,
          relatedId: userChallenge.challengeId
        }, storage);
        
        console.log(`✅ Awarded ${userChallenge.challenge.reward} NTIQ to user ${userId} for daily challenge: ${userChallenge.challenge.name}`);
        completedChallenges.push(updated);
      }
    }

    return completedChallenges;
  }

  // Calculate progress for different challenge types
  private async calculateChallengeProgress(userId: number, challenge: DailyChallenge, date: string): Promise<number> {
    const predictions = await storage.getUserPredictions(userId);
    const todayPredictions = predictions.filter(p => 
      p.createdAt.toISOString().split('T')[0] === date
    );

    switch (challenge.type) {
      case 'make_predictions':
        return todayPredictions.length;

      case 'accuracy_target':
        if (todayPredictions.length === 0) return 0;
        const completedToday = todayPredictions.filter(p => p.status === 'completed');
        if (completedToday.length === 0) return 0;
        
        const correctToday = completedToday.filter(p => p.accuracy !== null && parseFloat(p.accuracy) >= 90);
        return Math.round((correctToday.length / completedToday.length) * 100);

      case 'high_stake':
        const maxStakeToday = Math.max(...todayPredictions.map(p => p.stakeAmount), 0);
        return maxStakeToday >= challenge.target ? challenge.target : maxStakeToday;

      case 'diverse_predictions':
        const uniqueCryptos = new Set(todayPredictions.map(p => p.cryptocurrency));
        return uniqueCryptos.size;

      default:
        return 0;
    }
  }

  // Get user's challenge history
  async getUserChallengeHistory(userId: number, limit: number = 7): Promise<(UserDailyChallenge & { challenge: DailyChallenge })[]> {
    return await db
      .select({
        id: userDailyChallenges.id,
        userId: userDailyChallenges.userId,
        challengeId: userDailyChallenges.challengeId,
        progress: userDailyChallenges.progress,
        isCompleted: userDailyChallenges.isCompleted,
        completedAt: userDailyChallenges.completedAt,
        date: userDailyChallenges.date,
        createdAt: userDailyChallenges.createdAt,
        challenge: dailyChallenges,
      })
      .from(userDailyChallenges)
      .innerJoin(dailyChallenges, eq(userDailyChallenges.challengeId, dailyChallenges.id))
      .where(eq(userDailyChallenges.userId, userId))
      .orderBy(userDailyChallenges.date)
      .limit(limit);
  }
}

export const dailyChallengeService = new DailyChallengeService();