import { db } from "../db";
import {
    customTournaments,
    customTournamentParticipants,
    customTournamentRounds,
    customTournamentPredictions,
    users,
    cryptocurrencies
} from "@shared/schema";
import { eq, and, desc, sql, asc } from "drizzle-orm";
import type {
    CustomTournament,
    InsertCustomTournament,
    InsertCustomTournamentParticipant,
    InsertCustomTournamentRound,
    InsertCustomTournamentPrediction
} from "@shared/schema";

export class CustomTournamentService {
    /**
     * Generate unique tournament code (8 characters)
     */
    private static generateTournamentCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Calculate creation fee based on tournament settings
     */
    private static calculateCreationFee(maxParticipants: number, numberOfRounds: number): number {
        // Base fee: 100 NTIQ
        // +5 NTIQ per participant slot
        // +50 NTIQ per round
        const baseFee = 100;
        const participantFee = Math.min(maxParticipants, 50) * 5;
        const roundFee = numberOfRounds * 50;
        return baseFee + participantFee + roundFee;
    }

    /**
     * Create a new custom tournament
     */
    static async createTournament(
        creatorId: number,
        tournamentData: {
            name: string;
            description?: string;
            entryFee: number;
            maxParticipants: number;
            prizeDistribution: any;
            numberOfRounds: number;
            cryptocurrency: string;
            roundDuration: number;
            eliminationRules: string;
            isPrivate: boolean;
        }
    ): Promise<{ success: boolean; tournament?: CustomTournament; error?: string }> {
        try {
            // Calculate creation fee
            const creationFee = this.calculateCreationFee(
                tournamentData.maxParticipants,
                tournamentData.numberOfRounds
            );

            // Check user balance
            const [creator] = await db
                .select()
                .from(users)
                .where(eq(users.id, creatorId))
                .limit(1);

            if (!creator || creator.balance < creationFee) {
                return { success: false, error: `Insufficient balance. Need ${creationFee} NTIQ to create tournament.` };
            }

            // Verify cryptocurrency exists
            const [crypto] = await db
                .select()
                .from(cryptocurrencies)
                .where(eq(cryptocurrencies.id, tournamentData.cryptocurrency))
                .limit(1);

            if (!crypto) {
                return { success: false, error: "Invalid cryptocurrency selected" };
            }

            // Generate unique tournament code
            let tournamentCode = this.generateTournamentCode();
            let codeExists = true;
            let attempts = 0;

            while (codeExists && attempts < 10) {
                const [existing] = await db
                    .select()
                    .from(customTournaments)
                    .where(eq(customTournaments.tournamentCode, tournamentCode))
                    .limit(1);

                if (!existing) {
                    codeExists = false;
                } else {
                    tournamentCode = this.generateTournamentCode();
                    attempts++;
                }
            }

            if (codeExists) {
                return { success: false, error: "Failed to generate unique tournament code" };
            }

            // Deduct creation fee
            await db
                .update(users)
                .set({ balance: creator.balance - creationFee })
                .where(eq(users.id, creatorId));

            // Distribute creation fee: 50% burned, 30% to DAO, 20% to prize pool
            const burnedAmount = Math.floor(creationFee * 0.50);
            const daoAmount = Math.floor(creationFee * 0.30);
            const prizeSeed = creationFee - burnedAmount - daoAmount;

            // Create tournament
            const [tournament] = await db
                .insert(customTournaments)
                .values({
                    tournamentCode,
                    creatorId,
                    name: tournamentData.name,
                    description: tournamentData.description || '',
                    entryFee: tournamentData.entryFee,
                    creationFee,
                    maxParticipants: tournamentData.maxParticipants,
                    prizePool: prizeSeed, // Start with 20% of creation fee
                    prizeDistribution: tournamentData.prizeDistribution,
                    numberOfRounds: tournamentData.numberOfRounds,
                    cryptocurrency: tournamentData.cryptocurrency,
                    roundDuration: tournamentData.roundDuration,
                    eliminationRules: tournamentData.eliminationRules,
                    isPrivate: tournamentData.isPrivate,
                    status: 'open'
                })
                .returning();

            console.log(`✅ Tournament created: ${tournament.name} (Code: ${tournamentCode}) by User ${creatorId}`);
            console.log(`   Creation fee: ${creationFee} NTIQ (Burned: ${burnedAmount}, DAO: ${daoAmount}, Prize: ${prizeSeed})`);

            return { success: true, tournament };
        } catch (error) {
            console.error('❌ Error creating tournament:', error);
            return { success: false, error: "Failed to create tournament" };
        }
    }

    /**
     * Join a tournament
     */
    static async joinTournament(
        userId: number,
        tournamentCode: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            // Get tournament
            const [tournament] = await db
                .select()
                .from(customTournaments)
                .where(eq(customTournaments.tournamentCode, tournamentCode))
                .limit(1);

            if (!tournament) {
                return { success: false, error: "Tournament not found" };
            }

            if (tournament.status !== 'open') {
                return { success: false, error: "Tournament is no longer accepting participants" };
            }

            if (tournament.currentParticipants >= tournament.maxParticipants) {
                return { success: false, error: "Tournament is full" };
            }

            // Check if already joined
            const [existing] = await db
                .select()
                .from(customTournamentParticipants)
                .where(and(
                    eq(customTournamentParticipants.tournamentId, tournament.id),
                    eq(customTournamentParticipants.userId, userId)
                ))
                .limit(1);

            if (existing) {
                return { success: false, error: "Already joined this tournament" };
            }

            // Check user balance
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!user || user.balance < tournament.entryFee) {
                return { success: false, error: `Insufficient balance. Need ${tournament.entryFee} NTIQ to join.` };
            }

            // Deduct entry fee
            await db
                .update(users)
                .set({ balance: user.balance - tournament.entryFee })
                .where(eq(users.id, userId));

            // Add to prize pool
            await db
                .update(customTournaments)
                .set({
                    prizePool: tournament.prizePool + tournament.entryFee,
                    currentParticipants: tournament.currentParticipants + 1
                })
                .where(eq(customTournaments.id, tournament.id));

            // Create participant record
            await db
                .insert(customTournamentParticipants)
                .values({
                    tournamentId: tournament.id,
                    userId
                });

            console.log(`✅ User ${userId} joined tournament ${tournament.name} (Code: ${tournamentCode})`);

            return { success: true };
        } catch (error) {
            console.error('❌ Error joining tournament:', error);
            return { success: false, error: "Failed to join tournament" };
        }
    }

    /**
     * Get tournament details with participants
     */
    static async getTournamentDetails(tournamentCode: string): Promise<any> {
        try {
            const [tournament] = await db
                .select()
                .from(customTournaments)
                .where(eq(customTournaments.tournamentCode, tournamentCode))
                .limit(1);

            if (!tournament) {
                return null;
            }

            // Get participants
            const participants = await db
                .select({
                    id: customTournamentParticipants.id,
                    userId: customTournamentParticipants.userId,
                    username: users.username,
                    isEliminated: customTournamentParticipants.isEliminated,
                    eliminatedRound: customTournamentParticipants.eliminatedRound,
                    totalPoints: customTournamentParticipants.totalPoints,
                    currentRank: customTournamentParticipants.currentRank,
                    prizeWon: customTournamentParticipants.prizeWon,
                    joinedAt: customTournamentParticipants.joinedAt
                })
                .from(customTournamentParticipants)
                .innerJoin(users, eq(customTournamentParticipants.userId, users.id))
                .where(eq(customTournamentParticipants.tournamentId, tournament.id))
                .orderBy(asc(customTournamentParticipants.joinedAt));

            // Get rounds
            const rounds = await db
                .select()
                .from(customTournamentRounds)
                .where(eq(customTournamentRounds.tournamentId, tournament.id))
                .orderBy(asc(customTournamentRounds.roundNumber));

            return {
                ...tournament,
                participants,
                rounds
            };
        } catch (error) {
            console.error('❌ Error fetching tournament details:', error);
            return null;
        }
    }

    /**
     * Get list of available tournaments (open status)
     */
    static async getAvailableTournaments(userId: number): Promise<any[]> {
        try {
            const tournaments = await db
                .select({
                    id: customTournaments.id,
                    tournamentCode: customTournaments.tournamentCode,
                    name: customTournaments.name,
                    description: customTournaments.description,
                    entryFee: customTournaments.entryFee,
                    maxParticipants: customTournaments.maxParticipants,
                    currentParticipants: customTournaments.currentParticipants,
                    prizePool: customTournaments.prizePool,
                    numberOfRounds: customTournaments.numberOfRounds,
                    cryptocurrency: customTournaments.cryptocurrency,
                    roundDuration: customTournaments.roundDuration,
                    status: customTournaments.status,
                    isPrivate: customTournaments.isPrivate,
                    creatorId: customTournaments.creatorId,
                    creatorUsername: users.username,
                    createdAt: customTournaments.createdAt
                })
                .from(customTournaments)
                .innerJoin(users, eq(customTournaments.creatorId, users.id))
                .where(eq(customTournaments.status, 'open'))
                .orderBy(desc(customTournaments.createdAt))
                .limit(50);

            // Filter out private tournaments unless user is invited/joined
            const filteredTournaments = await Promise.all(
                tournaments.map(async (tournament) => {
                    if (tournament.isPrivate) {
                        // Check if user joined
                        const [participant] = await db
                            .select()
                            .from(customTournamentParticipants)
                            .where(and(
                                eq(customTournamentParticipants.tournamentId, tournament.id),
                                eq(customTournamentParticipants.userId, userId)
                            ))
                            .limit(1);

                        return participant ? tournament : null;
                    }
                    return tournament;
                })
            );

            return filteredTournaments.filter(t => t !== null);
        } catch (error) {
            console.error('❌ Error fetching available tournaments:', error);
            return [];
        }
    }

    /**
     * Get user's tournament history
     */
    static async getUserTournaments(userId: number): Promise<any[]> {
        try {
            const userTournaments = await db
                .select({
                    id: customTournaments.id,
                    tournamentCode: customTournaments.tournamentCode,
                    name: customTournaments.name,
                    entryFee: customTournaments.entryFee,
                    prizePool: customTournaments.prizePool,
                    status: customTournaments.status,
                    isEliminated: customTournamentParticipants.isEliminated,
                    eliminatedRound: customTournamentParticipants.eliminatedRound,
                    totalPoints: customTournamentParticipants.totalPoints,
                    currentRank: customTournamentParticipants.currentRank,
                    prizeWon: customTournamentParticipants.prizeWon,
                    joinedAt: customTournamentParticipants.joinedAt,
                    cryptocurrency: customTournaments.cryptocurrency,
                    numberOfRounds: customTournaments.numberOfRounds,
                    currentRound: customTournaments.currentRound
                })
                .from(customTournamentParticipants)
                .innerJoin(customTournaments, eq(customTournamentParticipants.tournamentId, customTournaments.id))
                .where(eq(customTournamentParticipants.userId, userId))
                .orderBy(desc(customTournamentParticipants.joinedAt))
                .limit(50);

            return userTournaments;
        } catch (error) {
            console.error('❌ Error fetching user tournaments:', error);
            return [];
        }
    }

    /**
     * Start a tournament (creator only)
     */
    static async startTournament(tournamentId: number, creatorId: number): Promise<{ success: boolean; error?: string }> {
        try {
            const [tournament] = await db
                .select()
                .from(customTournaments)
                .where(eq(customTournaments.id, tournamentId))
                .limit(1);

            if (!tournament) {
                return { success: false, error: "Tournament not found" };
            }

            if (tournament.creatorId !== creatorId) {
                return { success: false, error: "Only tournament creator can start the tournament" };
            }

            if (tournament.status !== 'open') {
                return { success: false, error: "Tournament already started or completed" };
            }

            if (tournament.currentParticipants < 2) {
                return { success: false, error: "Need at least 2 participants to start" };
            }

            // Update tournament status
            await db
                .update(customTournaments)
                .set({
                    status: 'in_progress',
                    startTime: new Date()
                })
                .where(eq(customTournaments.id, tournamentId));

            // Create first round
            const currentPrice = await this.getCurrentPrice(tournament.cryptocurrency);

            await db
                .insert(customTournamentRounds)
                .values({
                    tournamentId: tournament.id,
                    roundNumber: 1,
                    cryptocurrency: tournament.cryptocurrency,
                    startPrice: currentPrice.toString(),
                    status: 'active',
                    startTime: new Date(),
                    endTime: new Date(Date.now() + tournament.roundDuration * 60 * 1000)
                });

            await db
                .update(customTournaments)
                .set({ currentRound: 1 })
                .where(eq(customTournaments.id, tournamentId));

            console.log(`✅ Tournament started: ${tournament.name} (ID: ${tournamentId})`);

            return { success: true };
        } catch (error) {
            console.error('❌ Error starting tournament:', error);
            return { success: false, error: "Failed to start tournament" };
        }
    }

    /**
     * Get current price for a cryptocurrency (mock - should use actual price service)
     */
    private static async getCurrentPrice(cryptoId: string): Promise<number> {
        try {
            const [crypto] = await db
                .select()
                .from(cryptocurrencies)
                .where(eq(cryptocurrencies.id, cryptoId))
                .limit(1);

            return crypto ? parseFloat(crypto.currentPrice.toString()) : 50000;
        } catch (error) {
            return 50000; // Fallback price
        }
    }

    /**
     * Cancel tournament (creator only, before it starts)
     */
    static async cancelTournament(tournamentId: number, creatorId: number): Promise<{ success: boolean; error?: string }> {
        try {
            const [tournament] = await db
                .select()
                .from(customTournaments)
                .where(eq(customTournaments.id, tournamentId))
                .limit(1);

            if (!tournament) {
                return { success: false, error: "Tournament not found" };
            }

            if (tournament.creatorId !== creatorId) {
                return { success: false, error: "Only creator can cancel the tournament" };
            }

            if (tournament.status !== 'open') {
                return { success: false, error: "Cannot cancel tournament that has already started" };
            }

            // Refund all participants
            const participants = await db
                .select()
                .from(customTournamentParticipants)
                .where(eq(customTournamentParticipants.tournamentId, tournamentId));

            for (const participant of participants) {
                await db
                    .update(users)
                    .set({
                        balance: sql`${users.balance} + ${tournament.entryFee}`
                    })
                    .where(eq(users.id, participant.userId));
            }

            // Update tournament status
            await db
                .update(customTournaments)
                .set({
                    status: 'cancelled',
                    endTime: new Date()
                })
                .where(eq(customTournaments.id, tournamentId));

            console.log(`✅ Tournament cancelled: ${tournament.name}, Refunded ${participants.length} participants`);

            return { success: true };
        } catch (error) {
            console.error('❌ Error cancelling tournament:', error);
            return { success: false, error: "Failed to cancel tournament" };
        }
    }
}

