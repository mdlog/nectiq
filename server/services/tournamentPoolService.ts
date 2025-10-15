import { ethers } from 'ethers';
import { blockchainService } from './blockchainService';
import { logger } from '../../shared/logger';

export interface JoinTournamentParams {
    tournamentId: string;
    userAddress: string;
    entryFee: string; // in NTIQ
}

export interface DistributePrizesParams {
    tournamentId: string;
    winners: string[];
    amounts: string[]; // in NTIQ
}

export interface RefundParticipantsParams {
    tournamentId: string;
    participants: string[];
}

export class TournamentPoolService {
    private contract: ethers.Contract;

    constructor() {
        this.contract = blockchainService.tournamentPoolContract;
    }

    /**
     * Join a tournament
     */
    async joinTournament(params: JoinTournamentParams): Promise<string> {
        try {
            const { tournamentId, userAddress, entryFee } = params;

            const entryFeeWei = ethers.parseEther(entryFee);

            logger.info(`🏆 [TOURNAMENT] Joining tournament ${tournamentId}`);
            logger.info(`   User: ${userAddress}`);
            logger.info(`   Entry Fee: ${entryFee} NTIQ`);

            const tx = await this.contract.joinTournament(
                tournamentId,
                userAddress,
                entryFeeWei
            );

            logger.info(`📝 [TOURNAMENT] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [TOURNAMENT] Joined tournament successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [TOURNAMENT] Error joining tournament:`, error);
            throw new Error(`Failed to join tournament: ${error.message}`);
        }
    }

    /**
     * Distribute prizes to winners
     */
    async distributePrizes(params: DistributePrizesParams): Promise<string> {
        try {
            const { tournamentId, winners, amounts } = params;

            // Convert amounts to wei
            const amountsWei = amounts.map(amount => ethers.parseEther(amount));

            logger.info(`💰 [TOURNAMENT] Distributing prizes for tournament ${tournamentId}`);
            logger.info(`   Winners: ${winners.length}`);
            logger.info(`   Total Amount: ${amounts.reduce((sum, amt) => sum + parseFloat(amt), 0)} NTIQ`);

            const tx = await this.contract.distributePrizes(
                tournamentId,
                winners,
                amountsWei
            );

            logger.info(`📝 [TOURNAMENT] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [TOURNAMENT] Prizes distributed successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [TOURNAMENT] Error distributing prizes:`, error);
            throw new Error(`Failed to distribute prizes: ${error.message}`);
        }
    }

    /**
     * Refund participants (for cancelled tournaments)
     */
    async refundParticipants(params: RefundParticipantsParams): Promise<string> {
        try {
            const { tournamentId, participants } = params;

            logger.info(`🔄 [TOURNAMENT] Refunding participants for tournament ${tournamentId}`);
            logger.info(`   Participants: ${participants.length}`);

            const tx = await this.contract.refundParticipants(
                tournamentId,
                participants
            );

            logger.info(`📝 [TOURNAMENT] Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();

            if (receipt.status === 1) {
                logger.info(`✅ [TOURNAMENT] Participants refunded successfully`);
                logger.info(`   Transaction: ${tx.hash}`);
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (error: any) {
            logger.error(`❌ [TOURNAMENT] Error refunding participants:`, error);
            throw new Error(`Failed to refund participants: ${error.message}`);
        }
    }

    /**
     * Get tournament info from smart contract
     */
    async getTournamentInfo(tournamentId: string): Promise<any> {
        try {
            const tournamentInfo = await this.contract.tournaments(tournamentId);

            return {
                entryFee: ethers.formatEther(tournamentInfo.entryFee),
                prizePool: ethers.formatEther(tournamentInfo.prizePool),
                participantCount: Number(tournamentInfo.participantCount),
                status: tournamentInfo.status,
                createdAt: Number(tournamentInfo.createdAt)
            };
        } catch (error: any) {
            logger.error(`❌ [TOURNAMENT] Error getting tournament info:`, error);
            throw new Error(`Failed to get tournament info: ${error.message}`);
        }
    }

    /**
     * Listen for TournamentJoined events
     */
    onTournamentJoined(callback: (tournamentId: string, user: string, entryFee: bigint, prizePool: bigint) => void) {
        this.contract.on('TournamentJoined', (tournamentId, user, entryFee, prizePool) => {
            logger.info(`🔔 [TOURNAMENT] TournamentJoined event received`);
            logger.info(`   Tournament ID: ${tournamentId}`);
            logger.info(`   User: ${user}`);
            logger.info(`   Entry Fee: ${ethers.formatEther(entryFee)} NTIQ`);
            logger.info(`   Prize Pool: ${ethers.formatEther(prizePool)} NTIQ`);

            callback(tournamentId, user, entryFee, prizePool);
        });
    }

    /**
     * Listen for PrizesDistributed events
     */
    onPrizesDistributed(callback: (tournamentId: string, winners: string[], amounts: bigint[]) => void) {
        this.contract.on('PrizesDistributed', (tournamentId, winners, amounts) => {
            logger.info(`🔔 [TOURNAMENT] PrizesDistributed event received`);
            logger.info(`   Tournament ID: ${tournamentId}`);
            logger.info(`   Winners: ${winners.length}`);

            callback(tournamentId, winners, amounts);
        });
    }

    /**
     * Listen for TournamentCancelled events
     */
    onTournamentCancelled(callback: (tournamentId: string) => void) {
        this.contract.on('TournamentCancelled', (tournamentId) => {
            logger.info(`🔔 [TOURNAMENT] TournamentCancelled event received`);
            logger.info(`   Tournament ID: ${tournamentId}`);

            callback(tournamentId);
        });
    }
}

// Export singleton instance
export const tournamentPoolService = new TournamentPoolService();
