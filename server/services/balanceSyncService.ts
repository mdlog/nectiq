import { storage } from '../storage';
import { logger } from '../../shared/logger';

export class BalanceSyncService {
    private static instance: BalanceSyncService;
    private syncInterval: NodeJS.Timeout | null = null;

    private constructor() { }

    public static getInstance(): BalanceSyncService {
        if (!BalanceSyncService.instance) {
            BalanceSyncService.instance = new BalanceSyncService();
        }
        return BalanceSyncService.instance;
    }

    /**
     * Get real NTIQ token balance from blockchain
     */
    async getBlockchainBalance(walletAddress: string): Promise<number> {
        try {
            const { ntiqTokenService } = await import('./ntiqTokenService');
            return await ntiqTokenService.getBalance(walletAddress);
        } catch (error) {
            logger.error(`❌ [BALANCE-SYNC] Failed to get blockchain balance for ${walletAddress}:`, error);
            return 0;
        }
    }

    /**
     * Sync user balance with blockchain
     */
    async syncUserBalance(userId: number): Promise<{
        success: boolean;
        databaseBalance: number;
        blockchainBalance: number;
        synced: boolean;
        discrepancy?: number;
    }> {
        try {
            const user = await storage.getUser(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (!user.walletAddress) {
                return {
                    success: true,
                    databaseBalance: user.balance,
                    blockchainBalance: 0,
                    synced: true
                };
            }

            // Get blockchain balance
            const blockchainBalance = await this.getBlockchainBalance(user.walletAddress);
            const databaseBalance = user.balance;

            // Check for discrepancy
            const discrepancy = Math.abs(blockchainBalance - databaseBalance);
            const synced = discrepancy === 0;

            if (!synced) {
                logger.warn(`⚠️ [BALANCE-SYNC] Balance mismatch for user ${userId}:`);
                logger.warn(`   Database: ${databaseBalance} NTIQ`);
                logger.warn(`   Blockchain: ${blockchainBalance} NTIQ`);
                logger.warn(`   Discrepancy: ${discrepancy} NTIQ`);

                // Update database balance to match blockchain (blockchain is source of truth)
                await storage.updateUserBalance(userId, blockchainBalance);
                logger.info(`✅ [BALANCE-SYNC] Updated database balance to match blockchain: ${blockchainBalance} NTIQ`);
            }

            return {
                success: true,
                databaseBalance,
                blockchainBalance,
                synced,
                discrepancy: synced ? undefined : discrepancy
            };
        } catch (error: any) {
            logger.error(`❌ [BALANCE-SYNC] Error syncing balance for user ${userId}:`, error);
            return {
                success: false,
                databaseBalance: 0,
                blockchainBalance: 0,
                synced: false
            };
        }
    }

    /**
     * Sync all users with wallet addresses
     */
    async syncAllUsers(): Promise<{
        totalUsers: number;
        syncedUsers: number;
        failedUsers: number;
        discrepancies: number;
    }> {
        try {
            logger.info('🔄 [BALANCE-SYNC] Starting bulk balance sync...');

            const allUsers = await storage.getAllUsers();
            const usersWithWallets = allUsers.filter(user => user.walletAddress);

            let syncedUsers = 0;
            let failedUsers = 0;
            let discrepancies = 0;

            for (const user of usersWithWallets) {
                const result = await this.syncUserBalance(user.id);
                if (result.success) {
                    syncedUsers++;
                    if (!result.synced) {
                        discrepancies++;
                    }
                } else {
                    failedUsers++;
                }
            }

            logger.info(`✅ [BALANCE-SYNC] Bulk sync completed:`);
            logger.info(`   Total users: ${usersWithWallets.length}`);
            logger.info(`   Synced: ${syncedUsers}`);
            logger.info(`   Failed: ${failedUsers}`);
            logger.info(`   Discrepancies found: ${discrepancies}`);

            return {
                totalUsers: usersWithWallets.length,
                syncedUsers,
                failedUsers,
                discrepancies
            };
        } catch (error) {
            logger.error(`❌ [BALANCE-SYNC] Error in bulk sync:`, error);
            throw error;
        }
    }

    /**
     * Start periodic balance sync (every 5 minutes)
     */
    startPeriodicSync(intervalMinutes: number = 5): void {
        if (this.syncInterval) {
            logger.warn('⚠️ [BALANCE-SYNC] Periodic sync already running');
            return;
        }

        const intervalMs = intervalMinutes * 60 * 1000;

        logger.info(`🔄 [BALANCE-SYNC] Starting periodic sync (every ${intervalMinutes} minutes)`);

        this.syncInterval = setInterval(async () => {
            try {
                await this.syncAllUsers();
            } catch (error) {
                logger.error('❌ [BALANCE-SYNC] Error in periodic sync:', error);
            }
        }, intervalMs);

        // Run initial sync
        this.syncAllUsers().catch(error => {
            logger.error('❌ [BALANCE-SYNC] Error in initial sync:', error);
        });
    }

    /**
     * Stop periodic balance sync
     */
    stopPeriodicSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            logger.info('🛑 [BALANCE-SYNC] Periodic sync stopped');
        }
    }

    /**
     * Sync balance after transaction
     */
    async syncAfterTransaction(userId: number, transactionType: string): Promise<void> {
        try {
            logger.info(`🔄 [BALANCE-SYNC] Syncing balance after ${transactionType} for user ${userId}`);
            await this.syncUserBalance(userId);
        } catch (error) {
            logger.error(`❌ [BALANCE-SYNC] Error syncing after transaction:`, error);
        }
    }

    /**
     * Sync balance on user login
     */
    async syncOnLogin(userId: number): Promise<void> {
        try {
            logger.info(`🔄 [BALANCE-SYNC] Syncing balance on login for user ${userId}`);
            await this.syncUserBalance(userId);
        } catch (error) {
            logger.error(`❌ [BALANCE-SYNC] Error syncing on login:`, error);
        }
    }
}

// Export singleton instance
export const balanceSyncService = BalanceSyncService.getInstance();
