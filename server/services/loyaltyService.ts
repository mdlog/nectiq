import { pool } from "../db";

export interface TierInfo {
  tierName: string;
  minEarnings: number;
  maxEarnings: number | null;
  rewardMultiplier: number;
  cashbackPercentage: number;
  monthlyBonus: number;
  freeInsuranceDaily: number;
  prioritySupport: boolean;
  earlyAccess: boolean;
  personalManager: boolean;
}

export interface UserTierData {
  currentTier: string;
  lifetimeEarnings: number;
  nextTier: string | null;
  nextTierRequirement: number | null;
  progressPercentage: number;
  currentBenefits: TierInfo;
  nextTierBenefits: TierInfo | null;
}

export class LoyaltyService {
  // Get all tier configurations
  static async getAllTiers(): Promise<TierInfo[]> {
    const query = `
      SELECT tier_name, min_earnings, max_earnings, reward_multiplier, 
             cashback_percentage, monthly_bonus, free_insurance_daily,
             priority_support, early_access, personal_manager
      FROM loyalty_tiers 
      ORDER BY min_earnings ASC
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => ({
      tierName: row.tier_name,
      minEarnings: row.min_earnings,
      maxEarnings: row.max_earnings,
      rewardMultiplier: parseFloat(row.reward_multiplier),
      cashbackPercentage: parseFloat(row.cashback_percentage),
      monthlyBonus: row.monthly_bonus,
      freeInsuranceDaily: row.free_insurance_daily,
      prioritySupport: row.priority_support,
      earlyAccess: row.early_access,
      personalManager: row.personal_manager
    }));
  }

  // Calculate user's tier based on lifetime earnings
  static async calculateTier(lifetimeEarnings: number): Promise<string> {
    const tiers = await this.getAllTiers();
    
    for (let i = tiers.length - 1; i >= 0; i--) {
      const tier = tiers[i];
      if (lifetimeEarnings >= tier.minEarnings) {
        return tier.tierName;
      }
    }
    
    return 'bronze'; // Default fallback
  }

  // Get user tier data with progress information
  static async getUserTierData(userId: number): Promise<UserTierData> {
    // Get user's current data
    const userQuery = `SELECT loyalty_tier, lifetime_earnings FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userResult.rows[0];
    const lifetimeEarnings = user.lifetime_earnings || 0;
    
    // Get all tiers
    const tiers = await this.getAllTiers();
    
    // Find current tier
    const currentTierName = await this.calculateTier(lifetimeEarnings);
    const currentTier = tiers.find(t => t.tierName === currentTierName)!;
    
    // Find next tier
    const currentTierIndex = tiers.findIndex(t => t.tierName === currentTierName);
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
    
    // Calculate progress
    let progressPercentage = 0;
    if (nextTier) {
      const currentTierMin = currentTier.minEarnings;
      const nextTierMin = nextTier.minEarnings;
      const userProgress = lifetimeEarnings - currentTierMin;
      const tierRange = nextTierMin - currentTierMin;
      progressPercentage = Math.min(100, (userProgress / tierRange) * 100);
    } else {
      progressPercentage = 100; // Already at max tier
    }

    return {
      currentTier: currentTierName,
      lifetimeEarnings,
      nextTier: nextTier?.tierName || null,
      nextTierRequirement: nextTier?.minEarnings || null,
      progressPercentage: Math.round(progressPercentage),
      currentBenefits: currentTier,
      nextTierBenefits: nextTier
    };
  }

  // Update user's lifetime earnings and check for tier promotion
  static async updateLifetimeEarnings(userId: number, earnedAmount: number): Promise<{ 
    promoted: boolean, 
    oldTier: string, 
    newTier: string,
    celebrationData?: any 
  }> {
    // Get current user data
    const userQuery = `SELECT loyalty_tier, lifetime_earnings FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const currentUser = userResult.rows[0];
    const oldTier = currentUser.loyalty_tier;
    const oldEarnings = currentUser.lifetime_earnings || 0;
    const newEarnings = oldEarnings + earnedAmount;
    
    // Calculate new tier
    const newTier = await this.calculateTier(newEarnings);
    
    // Update user's lifetime earnings and tier
    const updateQuery = `
      UPDATE users 
      SET lifetime_earnings = $1, loyalty_tier = $2, last_tier_update = NOW()
      WHERE id = $3
    `;
    await pool.query(updateQuery, [newEarnings, newTier, userId]);
    
    const promoted = oldTier !== newTier;
    
    // If promoted, log the promotion
    if (promoted) {
      const promotionQuery = `
        INSERT INTO tier_promotions (user_id, from_tier, to_tier, lifetime_earnings)
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(promotionQuery, [userId, oldTier, newTier, newEarnings]);
      
      // Get tier benefits for celebration
      const tierInfo = await this.getTierInfo(newTier);
      
      return {
        promoted: true,
        oldTier,
        newTier,
        celebrationData: {
          tierName: newTier,
          benefits: tierInfo,
          newEarnings
        }
      };
    }
    
    return { promoted: false, oldTier, newTier };
  }

  // Get tier information by name
  static async getTierInfo(tierName: string): Promise<TierInfo | null> {
    const query = `
      SELECT tier_name, min_earnings, max_earnings, reward_multiplier, 
             cashback_percentage, monthly_bonus, free_insurance_daily,
             priority_support, early_access, personal_manager
      FROM loyalty_tiers 
      WHERE tier_name = $1
    `;
    
    const result = await pool.query(query, [tierName]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      tierName: row.tier_name,
      minEarnings: row.min_earnings,
      maxEarnings: row.max_earnings,
      rewardMultiplier: parseFloat(row.reward_multiplier),
      cashbackPercentage: parseFloat(row.cashback_percentage),
      monthlyBonus: row.monthly_bonus,
      freeInsuranceDaily: row.free_insurance_daily,
      prioritySupport: row.priority_support,
      earlyAccess: row.early_access,
      personalManager: row.personal_manager
    };
  }

  // Generate monthly tier rewards for all users
  static async generateMonthlyRewards(month: string): Promise<number> {
    const usersQuery = `
      SELECT id, loyalty_tier, username 
      FROM users 
      WHERE loyalty_tier != 'bronze'
    `;
    
    const usersResult = await pool.query(usersQuery);
    let generatedCount = 0;
    
    for (const user of usersResult.rows) {
      const tierInfo = await this.getTierInfo(user.loyalty_tier);
      if (!tierInfo || tierInfo.monthlyBonus === 0) continue;
      
      // Check if reward already exists for this month
      const existingQuery = `
        SELECT id FROM monthly_tier_rewards 
        WHERE user_id = $1 AND month = $2
      `;
      const existingResult = await pool.query(existingQuery, [user.id, month]);
      
      if (existingResult.rows.length === 0) {
        // Create monthly reward
        const insertQuery = `
          INSERT INTO monthly_tier_rewards (user_id, month, tier, bonus_amount, free_entries)
          VALUES ($1, $2, $3, $4, $5)
        `;
        
        const freeEntries = user.loyalty_tier === 'gold' ? 1 : user.loyalty_tier === 'platinum' ? 3 : 0;
        
        await pool.query(insertQuery, [
          user.id, 
          month, 
          user.loyalty_tier, 
          tierInfo.monthlyBonus,
          freeEntries
        ]);
        
        generatedCount++;
      }
    }
    
    return generatedCount;
  }

  // Claim monthly tier reward
  static async claimMonthlyReward(userId: number, month: string): Promise<{
    success: boolean,
    reward?: { bonusAmount: number, freeEntries: number },
    message: string
  }> {
    const rewardQuery = `
      SELECT bonus_amount, free_entries, claimed
      FROM monthly_tier_rewards 
      WHERE user_id = $1 AND month = $2
    `;
    
    const rewardResult = await pool.query(rewardQuery, [userId, month]);
    
    if (rewardResult.rows.length === 0) {
      return { success: false, message: 'No monthly reward available for this month' };
    }
    
    const reward = rewardResult.rows[0];
    
    if (reward.claimed) {
      return { success: false, message: 'Monthly reward already claimed' };
    }
    
    // Mark as claimed and add to user balance
    const updateRewardQuery = `
      UPDATE monthly_tier_rewards 
      SET claimed = true, claimed_at = NOW()
      WHERE user_id = $1 AND month = $2
    `;
    
    const updateBalanceQuery = `
      UPDATE users 
      SET balance = balance + $1
      WHERE id = $2
    `;
    
    await pool.query(updateRewardQuery, [userId, month]);
    await pool.query(updateBalanceQuery, [reward.bonus_amount, userId]);
    
    return {
      success: true,
      reward: {
        bonusAmount: reward.bonus_amount,
        freeEntries: reward.free_entries
      },
      message: 'Monthly reward claimed successfully'
    };
  }
}