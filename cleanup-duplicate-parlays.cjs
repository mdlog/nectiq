#!/usr/bin/env node

/**
 * Script to clean up duplicate parlay predictions
 * This script identifies and removes duplicate parlays based on blockchain transaction hash
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function cleanupDuplicateParlays() {
  try {
    console.log('🔍 [CLEANUP] Starting duplicate parlay cleanup...');
    
    const client = await pool.connect();
    
    // Find all duplicate blockchain hashes
    const duplicates = await client.query(`
      SELECT blockchain_stake_hash, COUNT(*) as count, 
             ARRAY_AGG(id ORDER BY created_at ASC) as parlay_ids,
             ARRAY_AGG(created_at ORDER BY created_at ASC) as created_dates
      FROM parlay_predictions
      WHERE blockchain_stake_hash IS NOT NULL
      GROUP BY blockchain_stake_hash
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.rows.length === 0) {
      console.log('✅ [CLEANUP] No duplicate parlays found');
      return;
    }
    
    console.log(`⚠️ [CLEANUP] Found ${duplicates.rows.length} duplicate blockchain hashes:`);
    
    for (const duplicate of duplicates.rows) {
      const { blockchain_stake_hash, count, parlay_ids, created_dates } = duplicate;
      
      console.log(`\n🔗 [CLEANUP] Processing duplicate hash: ${blockchain_stake_hash}`);
      console.log(`   Count: ${count} duplicates`);
      console.log(`   Parlay IDs: [${parlay_ids.join(', ')}]`);
      console.log(`   Created dates: [${created_dates.join(', ')}]`);
      
      // Keep the oldest parlay (first in array), delete the rest
      const keepId = parlay_ids[0];
      const deleteIds = parlay_ids.slice(1);
      
      console.log(`   Keeping parlay ID: ${keepId}`);
      console.log(`   Deleting parlay IDs: [${deleteIds.join(', ')}]`);
      
      try {
        // Delete parlay prediction coins first (foreign key constraint)
        const deleteCoinsResult = await client.query(`
          DELETE FROM parlay_prediction_coins 
          WHERE parlay_id = ANY($1)
        `, [deleteIds]);
        
        console.log(`   Deleted ${deleteCoinsResult.rowCount} parlay coins`);
        
        // Delete duplicate parlays
        const deleteParlaysResult = await client.query(`
          DELETE FROM parlay_predictions 
          WHERE id = ANY($1)
        `, [deleteIds]);
        
        console.log(`   Deleted ${deleteParlaysResult.rowCount} duplicate parlays`);
        
      } catch (error) {
        console.error(`   ❌ Error cleaning up parlay ${blockchain_stake_hash}:`, error.message);
      }
    }
    
    // Verify cleanup
    const remainingDuplicates = await client.query(`
      SELECT blockchain_stake_hash, COUNT(*) as count
      FROM parlay_predictions
      WHERE blockchain_stake_hash IS NOT NULL
      GROUP BY blockchain_stake_hash
      HAVING COUNT(*) > 1
    `);
    
    if (remainingDuplicates.rows.length === 0) {
      console.log('\n✅ [CLEANUP] All duplicates successfully removed');
    } else {
      console.log('\n⚠️ [CLEANUP] Some duplicates remain:');
      console.table(remainingDuplicates.rows);
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ [CLEANUP] Error:', error);
  } finally {
    await pool.end();
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupDuplicateParlays();
}

module.exports = { cleanupDuplicateParlays };
