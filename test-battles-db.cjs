const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq, desc } = require('drizzle-orm');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nectiq';
const sql = postgres(connectionString);
const db = drizzle(sql);

// Import schema
const { predictionBattles, users } = require('./shared/schema.ts');

async function testBattlesDatabase() {
    try {
        console.log('🔍 [TEST-DB] Testing battles database...');

        // Check if battles table exists and has data
        const allBattles = await db.select().from(predictionBattles).orderBy(desc(predictionBattles.createdAt));
        console.log('📊 [TEST-DB] Total battles in database:', allBattles.length);

        if (allBattles.length > 0) {
            console.log('📋 [TEST-DB] Recent battles:');
            allBattles.slice(0, 5).forEach((battle, index) => {
                console.log(`  ${index + 1}. ID: ${battle.id}, Status: ${battle.status}, Crypto: ${battle.cryptocurrency}, Stake: ${battle.stakeAmount}, Created: ${battle.createdAt}`);
            });

            // Check open battles specifically
            const openBattles = allBattles.filter(b => b.status === 'open');
            console.log('🔓 [TEST-DB] Open battles:', openBattles.length);

            // Check active battles
            const activeBattles = allBattles.filter(b => b.status === 'active');
            console.log('⚡ [TEST-DB] Active battles:', activeBattles.length);

        } else {
            console.log('❌ [TEST-DB] No battles found in database');
        }

        // Test the getLiveBattles query
        console.log('\n🔍 [TEST-DB] Testing getLiveBattles query...');
        const liveBattles = await db
            .select({
                id: predictionBattles.id,
                challengerId: predictionBattles.challengerId,
                challengedId: predictionBattles.challengedId,
                cryptocurrency: predictionBattles.cryptocurrency,
                timeframe: predictionBattles.timeframe,
                stakeAmount: predictionBattles.stakeAmount,
                challengerPrediction: predictionBattles.challengerPrediction,
                challengedPrediction: predictionBattles.challengedPrediction,
                status: predictionBattles.status,
                targetTime: predictionBattles.targetTime,
                createdAt: predictionBattles.createdAt,
                battleType: predictionBattles.battleType,
                isPublic: predictionBattles.isPublic,
                challengerUsername: users.username,
            })
            .from(predictionBattles)
            .leftJoin(users, eq(predictionBattles.challengerId, users.id))
            .where(
                eq(predictionBattles.status, 'open') ||
                eq(predictionBattles.status, 'active')
            )
            .orderBy(desc(predictionBattles.createdAt));

        console.log('📊 [TEST-DB] Live battles from query:', liveBattles.length);
        if (liveBattles.length > 0) {
            liveBattles.forEach((battle, index) => {
                console.log(`  ${index + 1}. ID: ${battle.id}, Status: ${battle.status}, Challenger: ${battle.challengerUsername}, Crypto: ${battle.cryptocurrency}`);
            });
        }

    } catch (error) {
        console.error('❌ [TEST-DB] Error:', error);
    } finally {
        await sql.end();
    }
}

testBattlesDatabase();
