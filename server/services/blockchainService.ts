import { ethers } from 'ethers';
import { logger } from '../../shared/logger';

// Contract ABIs
import PredictionStakingABI from '../../artifacts/contracts/PredictionStaking.sol/PredictionStaking.json';
import BattleEscrowABI from '../../artifacts/contracts/BattleEscrow.sol/BattleEscrow.json';
import ParlayStakingABI from '../../artifacts/contracts/ParlayStaking.sol/ParlayStaking.json';
import TournamentPoolABI from '../../artifacts/contracts/TournamentPool.sol/TournamentPool.json';
import MultiTokenVaultABI from '../../artifacts/contracts/MultiTokenVault.sol/MultiTokenVault.json';
import PredictionInsuranceABI from '../../artifacts/contracts/PredictionInsurance.sol/PredictionInsurance.json';
import ReferralSystemABI from '../../artifacts/contracts/ReferralSystem.sol/ReferralSystem.json';
import AchievementSystemABI from '../../artifacts/contracts/AchievementSystem.sol/AchievementSystem.json';

// Configuration
const POLYGON_AMOY_RPC = process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';

// Contract addresses - Enhanced contracts (newly deployed)
const ENHANCED_PREDICTION_STAKING_ADDRESS = process.env.ENHANCED_PREDICTION_STAKING_ADDRESS || '';
const BATTLE_ESCROW_ADDRESS = process.env.BATTLE_ESCROW_ADDRESS || '';
const ENHANCED_PARLAY_STAKING_ADDRESS = process.env.ENHANCED_PARLAY_STAKING_ADDRESS || '';
const TOURNAMENT_POOL_ADDRESS = process.env.TOURNAMENT_POOL_ADDRESS || '';
const MULTI_TOKEN_VAULT_ADDRESS = process.env.MULTI_TOKEN_VAULT_ADDRESS || '';
const PREDICTION_INSURANCE_ADDRESS = process.env.PREDICTION_INSURANCE_ADDRESS || '';
const REFERRAL_SYSTEM_ADDRESS = process.env.REFERRAL_SYSTEM_ADDRESS || '';
const NFT_ACHIEVEMENT_SYSTEM_ADDRESS = process.env.NFT_ACHIEVEMENT_SYSTEM_ADDRESS || '';

// Legacy contract addresses (still available for backward compatibility)
const PREDICTION_STAKING_ADDRESS = process.env.PREDICTION_STAKING_ADDRESS || '';
const PARLAY_STAKING_ADDRESS = process.env.PARLAY_STAKING_ADDRESS || '';

export class BlockchainService {
    private static instance: BlockchainService;
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.Wallet;

    // Enhanced contracts (newly deployed)
    public enhancedPredictionStakingContract: ethers.Contract;
    public battleEscrowContract: ethers.Contract;
    public enhancedParlayStakingContract: ethers.Contract;
    public tournamentPoolContract: ethers.Contract;
    public multiTokenVaultContract: ethers.Contract;
    public predictionInsuranceContract: ethers.Contract;
    public referralSystemContract: ethers.Contract;
    public nftAchievementSystemContract: ethers.Contract;

    // Legacy contracts (backward compatibility)
    public predictionStakingContract: ethers.Contract;
    public parlayStakingContract: ethers.Contract;

    private constructor() {
        // Initialize provider with longer polling interval
        this.provider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC, {
            name: 'polygon-amoy',
            chainId: 80002
        });
        this.provider.pollingInterval = 30000; // 30 seconds

        // Initialize signer (admin wallet)
        if (!DEPLOYER_PRIVATE_KEY) {
            throw new Error('DEPLOYER_PRIVATE_KEY not set in environment');
        }
        this.signer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, this.provider);

        // Initialize enhanced contracts
        this.enhancedPredictionStakingContract = new ethers.Contract(
            ENHANCED_PREDICTION_STAKING_ADDRESS,
            PredictionStakingABI.abi,
            this.signer
        );

        this.battleEscrowContract = new ethers.Contract(
            BATTLE_ESCROW_ADDRESS,
            BattleEscrowABI.abi,
            this.signer
        );

        this.enhancedParlayStakingContract = new ethers.Contract(
            ENHANCED_PARLAY_STAKING_ADDRESS,
            ParlayStakingABI.abi,
            this.signer
        );

        this.tournamentPoolContract = new ethers.Contract(
            TOURNAMENT_POOL_ADDRESS,
            TournamentPoolABI.abi,
            this.signer
        );

        this.multiTokenVaultContract = new ethers.Contract(
            MULTI_TOKEN_VAULT_ADDRESS,
            MultiTokenVaultABI.abi,
            this.signer
        );

        this.predictionInsuranceContract = new ethers.Contract(
            PREDICTION_INSURANCE_ADDRESS,
            PredictionInsuranceABI.abi,
            this.signer
        );

        this.referralSystemContract = new ethers.Contract(
            REFERRAL_SYSTEM_ADDRESS,
            ReferralSystemABI.abi,
            this.signer
        );

        this.nftAchievementSystemContract = new ethers.Contract(
            NFT_ACHIEVEMENT_SYSTEM_ADDRESS,
            AchievementSystemABI.abi,
            this.signer
        );

        // Initialize legacy contracts (backward compatibility)
        this.predictionStakingContract = new ethers.Contract(
            PREDICTION_STAKING_ADDRESS,
            PredictionStakingABI.abi,
            this.signer
        );

        this.parlayStakingContract = new ethers.Contract(
            PARLAY_STAKING_ADDRESS,
            ParlayStakingABI.abi,
            this.signer
        );

        logger.info('🔗 [BLOCKCHAIN] Blockchain service initialized');
        logger.info(`   Provider: ${POLYGON_AMOY_RPC}`);
        logger.info(`   Admin: ${this.signer.address}`);
        logger.info('📋 [BLOCKCHAIN] Enhanced Contracts:');
        logger.info(`   Enhanced Prediction Staking: ${ENHANCED_PREDICTION_STAKING_ADDRESS}`);
        logger.info(`   Enhanced Parlay Staking: ${ENHANCED_PARLAY_STAKING_ADDRESS}`);
        logger.info(`   Multi-Token Vault: ${MULTI_TOKEN_VAULT_ADDRESS}`);
        logger.info(`   Prediction Insurance: ${PREDICTION_INSURANCE_ADDRESS}`);
        logger.info(`   Referral System: ${REFERRAL_SYSTEM_ADDRESS}`);
        logger.info(`   NFT Achievement System: ${NFT_ACHIEVEMENT_SYSTEM_ADDRESS}`);
        logger.info('📋 [BLOCKCHAIN] Legacy Contracts:');
        logger.info(`   Battle Escrow: ${BATTLE_ESCROW_ADDRESS}`);
        logger.info(`   Tournament Pool: ${TOURNAMENT_POOL_ADDRESS}`);
        logger.info(`   Legacy Prediction Staking: ${PREDICTION_STAKING_ADDRESS}`);
        logger.info(`   Legacy Parlay Staking: ${PARLAY_STAKING_ADDRESS}`);
    }

    public static getInstance(): BlockchainService {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
    }

    /**
     * Get provider instance
     */
    public getProvider(): ethers.JsonRpcProvider {
        return this.provider;
    }

    /**
     * Get signer instance
     */
    public getSigner(): ethers.Wallet {
        return this.signer;
    }

    /**
     * Generate prediction ID from database ID
     */
    public generatePredictionId(dbPredictionId: number): string {
        return ethers.id(`prediction_${dbPredictionId}`);
    }

    /**
     * Generate battle ID from database ID
     */
    public generateBattleId(dbBattleId: number): string {
        return ethers.id(`battle_${dbBattleId}`);
    }

    /**
     * Generate parlay ID from database ID
     */
    public generateParlayId(dbParlayId: number): string {
        return ethers.id(`parlay_${dbParlayId}`);
    }

    /**
     * Generate tournament ID from database ID
     */
    public generateTournamentId(dbTournamentId: number): string {
        return ethers.id(`tournament_${dbTournamentId}`);
    }

    /**
     * Wait for transaction confirmation
     */
    public async waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt | null> {
        try {
            logger.info(`⏳ [BLOCKCHAIN] Waiting for transaction: ${txHash}`);
            const receipt = await this.provider.waitForTransaction(txHash, confirmations);

            if (receipt && receipt.status === 1) {
                logger.info(`✅ [BLOCKCHAIN] Transaction confirmed: ${txHash}`);
            } else {
                logger.error(`❌ [BLOCKCHAIN] Transaction failed: ${txHash}`);
            }

            return receipt;
        } catch (error) {
            logger.error(`❌ [BLOCKCHAIN] Error waiting for transaction ${txHash}:`, error);
            throw error;
        }
    }

    /**
     * Get transaction receipt
     */
    public async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
        try {
            return await this.provider.getTransactionReceipt(txHash);
        } catch (error) {
            logger.error(`❌ [BLOCKCHAIN] Error getting receipt for ${txHash}:`, error);
            return null;
        }
    }

    /**
     * Check if transaction is confirmed
     */
    public async isTransactionConfirmed(txHash: string): Promise<boolean> {
        const receipt = await this.getTransactionReceipt(txHash);
        return receipt !== null && receipt.status === 1;
    }
}

// Export singleton instance
export const blockchainService = BlockchainService.getInstance();
