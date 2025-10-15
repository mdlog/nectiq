import { ethers } from 'ethers';
import { blockchainService } from './blockchainService';
import { logger } from '../../shared/logger';

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
}

// Export singleton instance
export const battleEscrowService = new BattleEscrowService();
