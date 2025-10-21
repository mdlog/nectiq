import { ethers } from 'ethers';
import { blockchainService } from './blockchainService';
import { logger } from '../../shared/logger';
import { storage } from '../storage';

export interface CreateBattleParams {
    battleId: string;
    challenger: string;
    challenged: string;
    stakeAmount: string; // in NTIQ
}

export interface AcceptBattleParams {
    battleId: string;
    challenged: string;
}

export interface ResolveBattleParams {
    battleId: string;
    winner: string;
}

export interface CancelBattleParams {
    battleId: string;
}

export class BattleEscrowService {
    private contract: ethers.Contract;

    constructor() {
        this.contract = blockchainService.battleEscrowContract;
    }

    /**
     * Create a new battle
     */
    async createBattle(params: CreateBattleParams): Promise<string> {
        try {
            const { battleId, challenger, challenged, stakeAmount } = params;

            const stakeAmountWei = ethers.parseEther(stakeAmount);

            logger.info(`⚔️ [BATTLE] Creating battle ${battleId}`);
            logger.info(`   Challenger: ${challenger}`);
            logger.info(`   Challenged: ${challenged}`);
            logger.info(`   Stake: ${stakeAmount} NTIQ`);

            const tx = await this.contract.createBattle(
                battleId,
                challenger,
                challenged,
                stakeAmountWei
            );

            logger.info(`📝 [BATTLE] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [BATTLE] Battle created successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [BATTLE] Error creating battle:`, error);
            throw new Error(`Failed to create battle: ${error.message}`);
        }
    }

    /**
     * Accept a battle
     */
    async acceptBattle(params: AcceptBattleParams): Promise<string> {
        try {
            const { battleId, challenged } = params;

            logger.info(`✅ [BATTLE] Accepting battle ${battleId}`);
            logger.info(`   Challenged: ${challenged}`);

            const tx = await this.contract.acceptBattle(battleId, challenged);

            logger.info(`📝 [BATTLE] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [BATTLE] Battle accepted successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [BATTLE] Error accepting battle:`, error);
            throw new Error(`Failed to accept battle: ${error.message}`);
        }
    }

    /**
     * Resolve a battle
     */
    async resolveBattle(params: ResolveBattleParams): Promise<string> {
        try {
            const { battleId, winner } = params;

            logger.info(`🏆 [BATTLE] Resolving battle ${battleId}`);
            logger.info(`   Winner: ${winner}`);

            const tx = await this.contract.resolveBattle(battleId, winner);

            logger.info(`📝 [BATTLE] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [BATTLE] Battle resolved successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [BATTLE] Error resolving battle:`, error);
            throw new Error(`Failed to resolve battle: ${error.message}`);
        }
    }

    /**
     * Cancel a battle
     */
    async cancelBattle(params: CancelBattleParams): Promise<string> {
        try {
            const { battleId } = params;

            logger.info(`🚫 [BATTLE] Cancelling battle ${battleId}`);

            const tx = await this.contract.cancelBattle(battleId);

            logger.info(`📝 [BATTLE] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [BATTLE] Battle cancelled successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [BATTLE] Error cancelling battle:`, error);
            throw new Error(`Failed to cancel battle: ${error.message}`);
        }
    }

    /**
     * Get battle info from smart contract
     */
    async getBattleInfo(battleId: string): Promise<any> {
        try {
            const battleInfo = await this.contract.battles(battleId);

            return {
                challenger: battleInfo.challenger,
                challenged: battleInfo.challenged,
                stakeAmount: ethers.formatEther(battleInfo.stakeAmount),
                status: battleInfo.status,
                winner: battleInfo.winner,
                createdAt: Number(battleInfo.createdAt)
            };
        } catch (error: any) {
            logger.error(`❌ [BATTLE] Error getting battle info:`, error);
            throw new Error(`Failed to get battle info: ${error.message}`);
        }
    }

    /**
     * Listen for BattleCreated events
     */
    onBattleCreated(callback: (battleId: string, challenger: string, challenged: string, stakeAmount: bigint) => void) {
        this.contract.on('BattleCreated', (battleId, challenger, challenged, stakeAmount) => {
            logger.info(`🔔 [BATTLE] BattleCreated event received`);
            logger.info(`   Battle ID: ${battleId}`);
            logger.info(`   Challenger: ${challenger}`);
            logger.info(`   Challenged: ${challenged}`);
            logger.info(`   Stake: ${ethers.formatEther(stakeAmount)} NTIQ`);

            callback(battleId, challenger, challenged, stakeAmount);
        });
    }

    /**
     * Listen for BattleAccepted events
     */
    onBattleAccepted(callback: (battleId: string, challenged: string) => void) {
        this.contract.on('BattleAccepted', (battleId, challenged) => {
            logger.info(`🔔 [BATTLE] BattleAccepted event received`);
            logger.info(`   Battle ID: ${battleId}`);
            logger.info(`   Challenged: ${challenged}`);

            callback(battleId, challenged);
        });
    }

    /**
     * Listen for BattleResolved events
     */
    onBattleResolved(callback: (battleId: string, winner: string, reward: bigint, fee: bigint) => void) {
        this.contract.on('BattleResolved', (battleId, winner, reward, fee) => {
            logger.info(`🔔 [BATTLE] BattleResolved event received`);
            logger.info(`   Battle ID: ${battleId}`);
            logger.info(`   Winner: ${winner}`);
            logger.info(`   Reward: ${ethers.formatEther(reward)} NTIQ`);
            logger.info(`   Fee: ${ethers.formatEther(fee)} NTIQ`);

            callback(battleId, winner, reward, fee);
        });
    }

    /**
     * Listen for BattleCancelled events
     */
    onBattleCancelled(callback: (battleId: string) => void) {
        this.contract.on('BattleCancelled', (battleId) => {
            logger.info(`🔔 [BATTLE] BattleCancelled event received`);
            logger.info(`   Battle ID: ${battleId}`);

            callback(battleId);
        });
    }

    /**
     * Check and process completed battles without blockchain rewards
     */
    async checkAndProcessCompletedBattles(): Promise<void> {
        try {
            console.log('🔍 [BATTLE-PROCESSOR] Starting completed battles check...');

            // Validate blockchain service configuration first
            const { BlockchainService } = await import('./blockchainService');
            if (!BlockchainService.validateConfiguration()) {
                console.error('❌ [BATTLE-PROCESSOR] Blockchain service configuration invalid - skipping reward processing');
                return;
            }

            // Get all completed battles that don't have blockchain resolve hash
            const completedBattles = await storage.getCompletedBattlesWithoutBlockchainReward();

            if (completedBattles.length === 0) {
                console.log('✅ [BATTLE-PROCESSOR] No completed battles without blockchain rewards found');
                return;
            }

            console.log(`🔍 [BATTLE-PROCESSOR] Found ${completedBattles.length} completed battles without blockchain rewards`);

            let successCount = 0;
            let failureCount = 0;

            for (const battle of completedBattles) {
                try {
                    await this.processCompletedBattleReward(battle);
                    successCount++;
                } catch (error) {
                    failureCount++;
                    console.error(`❌ [BATTLE-PROCESSOR] Failed to process battle ${battle.id}:`, error);
                }
            }

            console.log(`✅ [BATTLE-PROCESSOR] Processing complete: ${successCount} successful, ${failureCount} failed`);
        } catch (error) {
            console.error('❌ [BATTLE-PROCESSOR] Critical error in completed battles processing:', error);
            // Don't throw error to prevent scheduled task from crashing
        }
    }

    /**
     * Process completed battle reward
     */
    async processCompletedBattleReward(battle: any): Promise<void> {
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                console.log(`🔍 [BATTLE-BLOCKCHAIN-REWARD] Processing completed battle ${battle.id} for blockchain reward... (Attempt ${retryCount + 1}/${maxRetries})`);

                // Check if battle has blockchain battle hash
                if (!battle.blockchainBattleHash) {
                    console.log(`⚠️ [BATTLE-BLOCKCHAIN-REWARD] Battle ${battle.id} has no blockchain battle hash - skipping`);
                    return;
                }

                // Check if battle already has blockchain resolve hash
                if (battle.blockchainResolveHash) {
                    console.log(`✅ [BATTLE-BLOCKCHAIN-REWARD] Battle ${battle.id} already has blockchain resolve hash - skipping`);
                    return;
                }

                // Check if battle has winner reward
                if (!battle.winnerReward || battle.winnerReward <= 0) {
                    console.log(`⚠️ [BATTLE-BLOCKCHAIN-REWARD] Battle ${battle.id} has no winner reward - skipping`);
                    return;
                }

                // Check if battle has winner
                if (!battle.winnerId) {
                    console.log(`⚠️ [BATTLE-BLOCKCHAIN-REWARD] Battle ${battle.id} has no winner - skipping`);
                    return;
                }

                // Get winner user information
                const winnerUser = await storage.getUser(battle.winnerId);
                if (!winnerUser || !winnerUser.walletAddress) {
                    console.log(`⚠️ [BATTLE-BLOCKCHAIN-REWARD] Battle ${battle.id} winner has no wallet address - skipping`);
                    return;
                }

                console.log(`💰 [BATTLE-BLOCKCHAIN-REWARD] Processing reward for battle ${battle.id}:`);
                console.log(`   Winner: ${winnerUser.username}`);
                console.log(`   Winner Wallet: ${winnerUser.walletAddress}`);
                console.log(`   Winner Reward: ${battle.winnerReward} NTIQ`);
                console.log(`   Blockchain Battle Hash: ${battle.blockchainBattleHash}`);

                // Try to resolve battle on blockchain
                try {
                    // Try with database ID first
                    let blockchainBattleId = blockchainService.generateBattleId(battle.id);
                    let txHash = null;

                    try {
                        txHash = await this.resolveBattle({
                            battleId: blockchainBattleId,
                            winner: winnerUser.walletAddress
                        });
                        logger.info(`🔗 [BATTLE-BLOCKCHAIN-REWARD] Battle ${battle.id} resolved with database ID: ${txHash}`);
                    } catch (dbIdError) {
                        logger.warn(`⚠️ [BATTLE-BLOCKCHAIN-REWARD] Failed with database ID, trying alternative methods:`, dbIdError.message);

                        // Try to extract battle ID from blockchain transaction
                        try {
                            const provider = blockchainService.getProvider();
                            const tx = await provider.getTransaction(battle.blockchainBattleHash);

                            if (tx && tx.data) {
                                // Extract battle ID from transaction data (first parameter after function selector)
                                const data = tx.data.substring(10); // Remove function selector
                                const battleIdHex = '0x' + data.substring(0, 64);

                                logger.info(`🔍 [BATTLE-BLOCKCHAIN-REWARD] Extracted battle ID from transaction: ${battleIdHex}`);

                                txHash = await this.resolveBattle({
                                    battleId: battleIdHex,
                                    winner: winnerUser.walletAddress
                                });

                                logger.info(`🔗 [BATTLE-BLOCKCHAIN-REWARD] Battle ${battle.id} resolved with extracted ID: ${txHash}`);
                            }
                        } catch (extractError) {
                            logger.error(`❌ [BATTLE-BLOCKCHAIN-REWARD] Failed to extract battle ID from transaction:`, extractError);
                            throw new Error(`Failed to resolve battle: ${extractError.message}`);
                        }
                    }

                    if (txHash) {
                        // Update battle with resolve transaction hash
                        await storage.updateBattle(battle.id, {
                            blockchainResolveHash: txHash
                        });

                        // CRITICAL: Update user.totalRewards for leaderboard ranking
                        if (battle.winnerId && battle.rewardAmount > 0) {
                            const currentUser = await storage.getUser(battle.winnerId);
                            if (currentUser) {
                                const newTotalRewards = currentUser.totalRewards + battle.rewardAmount;
                                await storage.updateUserStats(
                                    battle.winnerId,
                                    currentUser.totalPredictions,
                                    currentUser.correctPredictions,
                                    newTotalRewards
                                );
                                console.log(`📊 [LEADERBOARD] Updated user ${battle.winnerId} totalRewards: ${currentUser.totalRewards} -> ${newTotalRewards} (+${battle.rewardAmount})`);
                            }
                        }

                        logger.info(`✅ [BATTLE-BLOCKCHAIN-REWARD] Battle ${battle.id} resolved successfully: ${txHash}`);
                        console.log(`✅ [BATTLE-BLOCKCHAIN-REWARD] Successfully processed reward for battle ${battle.id}`);
                        return; // Success - exit retry loop
                    } else {
                        throw new Error('Failed to get transaction hash from blockchain service');
                    }
                } catch (blockchainError) {
                    logger.error(`❌ [BATTLE-BLOCKCHAIN-REWARD] Failed to resolve battle on blockchain for battle ${battle.id}:`, blockchainError);
                    console.log(`❌ [BATTLE-BLOCKCHAIN-REWARD] Failed to process blockchain reward for battle ${battle.id}: ${blockchainError.message}`);

                    retryCount++;
                    if (retryCount < maxRetries) {
                        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                        console.log(`🔄 [BATTLE-BLOCKCHAIN-REWARD] Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        console.error(`❌ [BATTLE-BLOCKCHAIN-REWARD] Max retries reached for battle ${battle.id}`);
                        throw blockchainError;
                    }
                }
            } catch (error) {
                console.error(`❌ [BATTLE-BLOCKCHAIN-REWARD] Critical error processing completed battle ${battle.id}:`, error);
                throw error;
            }
        }
    }
}

// Export singleton instance
export const battleEscrowService = new BattleEscrowService();
