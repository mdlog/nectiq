// Enhanced Smart Contract Configuration
// All contract addresses are loaded from environment variables

// Contract ABIs (Simplified for frontend use) - MUST BE DEFINED FIRST
const ABIS = {
    // Enhanced Prediction Staking ABI (key functions)
    ENHANCED_PREDICTION_STAKING: [
        {
            name: 'lockStake',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'predictionId', type: 'bytes32' },
                { name: 'amount', type: 'uint256' },
                { name: 'duration', type: 'uint256' },
                { name: 'predictedPrice', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
        {
            name: 'releaseReward',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'predictionId', type: 'bytes32' },
                { name: 'actualPrice', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
    ] as const,

    // Enhanced Parlay Staking ABI (key functions)
    ENHANCED_PARLAY_STAKING: [
        {
            name: 'lockParlayStake',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'parlayId', type: 'bytes32' },
                { name: 'amount', type: 'uint256' },
                { name: 'coinCount', type: 'uint8' },
                { name: 'duration', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
        {
            name: 'releaseCompoundReward',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'parlayId', type: 'bytes32' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
    ] as const,

    // Prediction Insurance ABI (key functions)
    PREDICTION_INSURANCE: [
        {
            name: 'buyInsurance',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'predictionId', type: 'bytes32' },
                { name: 'stakeAmount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
        {
            name: 'claimInsurance',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'predictionId', type: 'bytes32' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
        {
            name: 'getInsuranceClaim',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'predictionId', type: 'bytes32' },
            ],
            outputs: [
                { name: 'user', type: 'address' },
                { name: 'stakeAmount', type: 'uint256' },
                { name: 'insuranceCost', type: 'uint256' },
                { name: 'refundAmount', type: 'uint256' },
                { name: 'claimed', type: 'bool' },
                { name: 'timestamp', type: 'uint256' },
            ],
        },
    ] as const,

    // Referral System ABI (key functions)
    REFERRAL_SYSTEM: [
        {
            name: 'registerReferral',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'referrer', type: 'address' },
                { name: 'referee', type: 'address' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
        {
            name: 'getReferralData',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'referee', type: 'address' },
            ],
            outputs: [
                { name: 'referrer', type: 'address' },
                { name: 'totalEarnings', type: 'uint256' },
                { name: 'totalActivities', type: 'uint256' },
                { name: 'active', type: 'bool' },
            ],
        },
        {
            name: 'getUserTotalReferralEarnings',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'referrer', type: 'address' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
        },
    ] as const,

    // NFT Achievement System ABI (key functions)
    NFT_ACHIEVEMENT_SYSTEM: [
        {
            name: 'getAchievement',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'achievementId', type: 'uint256' },
            ],
            outputs: [
                { name: 'id', type: 'uint256' },
                { name: 'category', type: 'string' },
                { name: 'name', type: 'string' },
                { name: 'description', type: 'string' },
                { name: 'threshold', type: 'uint256' },
                { name: 'isMintable', type: 'bool' },
            ],
        },
        {
            name: 'getUserProgress',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'category', type: 'string' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
        },
        {
            name: 'checkUserHasMinted',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'achievementId', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
        {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'owner', type: 'address' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
        },
        {
            name: 'tokenOfOwnerByIndex',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'owner', type: 'address' },
                { name: 'index', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
        },
    ] as const,

    // Battle Escrow ABI (key functions)
    BATTLE_ESCROW: [
        {
            inputs: [
                { internalType: 'bytes32', name: 'battleId', type: 'bytes32' },
                { internalType: 'uint256', name: 'stakeAmount', type: 'uint256' }
            ],
            name: 'createBattle',
            outputs: [
                { internalType: 'bool', name: '', type: 'bool' }
            ],
            stateMutability: 'nonpayable',
            type: 'function'
        },
        {
            inputs: [
                { internalType: 'bytes32', name: 'battleId', type: 'bytes32' }
            ],
            name: 'acceptBattle',
            outputs: [
                { internalType: 'bool', name: '', type: 'bool' }
            ],
            stateMutability: 'nonpayable',
            type: 'function'
        },
        {
            inputs: [
                { internalType: 'bytes32', name: 'battleId', type: 'bytes32' },
                { internalType: 'address', name: 'winner', type: 'address' }
            ],
            name: 'resolveBattle',
            outputs: [
                { internalType: 'bool', name: '', type: 'bool' }
            ],
            stateMutability: 'nonpayable',
            type: 'function'
        },
    ] as const,

    // Tournament Pool ABI (key functions)
    TOURNAMENT_POOL: [
        {
            inputs: [
                { internalType: 'bytes32', name: 'tournamentId', type: 'bytes32' },
                { internalType: 'uint256', name: 'entryFee', type: 'uint256' }
            ],
            name: 'joinTournament',
            outputs: [
                { internalType: 'bool', name: '', type: 'bool' }
            ],
            stateMutability: 'nonpayable',
            type: 'function'
        },
        {
            inputs: [
                { internalType: 'bytes32', name: 'tournamentId', type: 'bytes32' }
            ],
            name: 'createTournament',
            outputs: [
                { internalType: 'bool', name: '', type: 'bool' }
            ],
            stateMutability: 'nonpayable',
            type: 'function'
        },
        {
            inputs: [
                { internalType: 'bytes32', name: 'tournamentId', type: 'bytes32' },
                { internalType: 'address', name: 'winner', type: 'address' }
            ],
            name: 'resolveTournament',
            outputs: [
                { internalType: 'bool', name: '', type: 'bool' }
            ],
            stateMutability: 'nonpayable',
            type: 'function'
        },
    ] as const,

    // Multi-Token Vault ABI (key functions)
    MULTI_TOKEN_VAULT: [
        {
            name: 'depositPOL',
            type: 'function',
            stateMutability: 'payable',
            inputs: [],
            outputs: [],
        },
        {
            name: 'depositToken',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'token', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
            outputs: [],
        },
        {
            name: 'requestWithdrawal',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'token', type: 'address' },
                { name: 'amount', type: 'uint256' },
                { name: 'signature', type: 'bytes' },
            ],
            outputs: [],
        },
        {
            name: 'getUserBalance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'token', type: 'address' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
        },
    ] as const,

    // ERC20 ABI (standard functions)
    ERC20: [
        {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
        {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'account', type: 'address' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
        },
        {
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
        },
        {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
    ] as const,

    // NTIQ Token ABI (same as ERC20 for now)
    NTIQToken: [
        {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
        {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'account', type: 'address' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
        },
        {
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
        },
        {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
        },
    ] as const,
} as const;

export const CONTRACTS = {
    // Active Contracts Only
    ENHANCED_PREDICTION_STAKING: (import.meta.env.VITE_ENHANCED_PREDICTION_STAKING_ADDRESS || '0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3') as `0x${string}`,
    ENHANCED_PARLAY_STAKING: (import.meta.env.VITE_ENHANCED_PARLAY_STAKING_ADDRESS || '0x87D08a494D960240d3a2D5CdB155084CAF222584') as `0x${string}`,
    BATTLE_ESCROW: (import.meta.env.VITE_BATTLE_ESCROW_ADDRESS || '0x65CBABb0864de26fc753F5044277644f72Df8490') as `0x${string}`,
    MULTI_TOKEN_VAULT: (import.meta.env.VITE_MULTI_TOKEN_VAULT_ADDRESS || '0xe124893F7E1d5bF82586680c590f9510b6dCf42e') as `0x${string}`,
    PREDICTION_INSURANCE: (import.meta.env.VITE_PREDICTION_INSURANCE_ADDRESS || '0x170aF9d61945c6AbD8619d6cafbd03E5fC8ae3Ce') as `0x${string}`,
    REFERRAL_SYSTEM: (import.meta.env.VITE_REFERRAL_SYSTEM_ADDRESS || '0x7E9F85CDDb70A0d3Ab7738B61610d1774867c8e2') as `0x${string}`,
    NFT_ACHIEVEMENT_SYSTEM: (import.meta.env.VITE_NFT_ACHIEVEMENT_SYSTEM_ADDRESS || '0x57c5aE2C1ed8ef90e264D165b5A7F7C750C50C3f') as `0x${string}`,
    TOURNAMENT_POOL: (import.meta.env.VITE_TOURNAMENT_POOL_ADDRESS || '0x384cDE1104b1c75e6469E07e2eD40E674Ce04EBe') as `0x${string}`,

    // NTIQ Token
    NTIQ_TOKEN: (import.meta.env.VITE_NTIQ_TOKEN_ADDRESS || '0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f') as `0x${string}`,

    // Token Contracts (Polygon Amoy Testnet)
    WETH: (import.meta.env.VITE_AMOY_WETH_ADDRESS || '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619') as `0x${string}`,
    USDC: (import.meta.env.VITE_AMOY_USDC_ADDRESS || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174') as `0x${string}`,
    LINK: (import.meta.env.VITE_AMOY_LINK_ADDRESS || '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39') as `0x${string}`,

    // Contract ABIs - NOW PROPERLY DEFINED
    ABIS,
} as const;

// Chain Configuration
export const CHAIN_CONFIG = {
    POLYGON_AMOY: {
        id: 80002,
        name: 'Polygon Amoy Testnet',
        rpcUrl: 'https://rpc-amoy.polygon.technology',
        explorerUrl: 'https://amoy.polygonscan.com',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
        },
    },
} as const;

// Export ABIS separately for direct access
export { ABIS };

// Utility functions
export const generatePredictionId = (dbPredictionId: number): `0x${string}` => {
    // Simple hash function for frontend (matches backend implementation)
    const hash = `0x${dbPredictionId.toString(16).padStart(64, '0')}`;
    return hash as `0x${string}`;
};

export const generateBattleId = (dbBattleId: number): `0x${string}` => {
    const hash = `0x${dbBattleId.toString(16).padStart(64, '0')}`;
    return hash as `0x${string}`;
};

export const generateParlayId = (dbParlayId: number): `0x${string}` => {
    const hash = `0x${dbParlayId.toString(16).padStart(64, '0')}`;
    return hash as `0x${string}`;
};

export const generateTournamentId = (dbTournamentId: number): `0x${string}` => {
    const hash = `0x${dbTournamentId.toString(16).padStart(64, '0')}`;
    return hash as `0x${string}`;
};

// Duration multipliers (in basis points)
export const DURATION_MULTIPLIERS = {
    ONE_HOUR: 12000, // 1.2x
    SIX_HOURS: 15000, // 1.5x
    TWENTY_FOUR_HOURS: 20000, // 2.0x
    SEVEN_DAYS: 30000, // 3.0x
} as const;

// Accuracy multipliers (in basis points)
export const ACCURACY_MULTIPLIERS = {
    PERFECT: 20000, // 2.0x for ≥99.5% accuracy
    EXCELLENT: 15000, // 1.5x for ≥98% accuracy
    GOOD: 12500, // 1.25x for ≥95% accuracy
    BASIC: 10000, // 1.0x for ≥90% accuracy
} as const;

// Insurance rates (in basis points)
export const INSURANCE_RATES = {
    COST_RATE: 1000, // 10% of stake amount
    REFUND_RATE: 5000, // 50% of insurance cost
} as const;

// Referral rates (in basis points)
export const REFERRAL_RATES = {
    BONUS_RATE: 1000, // 10% of activity amount
} as const;

// Log contract addresses in development
if (import.meta.env.DEV) {
    console.log('📋 [CONTRACTS] Enhanced Contract Addresses:');
    console.log('   Enhanced Prediction Staking:', CONTRACTS.ENHANCED_PREDICTION_STAKING);
    console.log('   Enhanced Parlay Staking:', CONTRACTS.ENHANCED_PARLAY_STAKING);
    console.log('   Multi-Token Vault:', CONTRACTS.MULTI_TOKEN_VAULT);
    console.log('   Prediction Insurance:', CONTRACTS.PREDICTION_INSURANCE);
    console.log('   Referral System:', CONTRACTS.REFERRAL_SYSTEM);
    console.log('   NFT Achievement System:', CONTRACTS.NFT_ACHIEVEMENT_SYSTEM);
    console.log('   NTIQ Token:', CONTRACTS.NTIQ_TOKEN);
}
