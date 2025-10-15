# Design Document: Blockchain Staking Integration

## Overview

This document provides detailed technical design for migrating all staking features from database-based balance to blockchain-based NTIQ token staking using smart contracts on Polygon Amoy.

## Executive Summary

### Current System Analysis

After deep code analysis, I've identified the complete flow for all staking features:

**Features Using Staking:**
1. **Predictions** - 50-10,000 NTIQ stake, accuracy-based rewards (0.9x-3.0x)
2. **Battles** - Variable stake, winner-takes-all minus 3.5% platform fee
3. **Parlay** - Multi-prediction compound rewards, 6% platform fee
4. **Survival Tournament** - Entry fee, prize pool distribution

### Key Findings from Code Analysis

#### 1. Prediction System (`predictionService.ts`)
```typescript
// Accuracy Multipliers:
- ≥99.5%: 3.0x (Perfect prediction)
- ≥98%: 2.0x (Excellent)
- ≥95%: 1.5x (Great)
- ≥90%: 0.9x (Good - user loses 10%, platform gains 10%)
- <90%: 0x (Stake forfeited - platform gains 100%)

// Platform Fee: 4% on winning predictions (1.5x, 2.0x, 3.0x)
```

#### 2. Battle System (`balanceService.ts`)
```typescript
// Battle Reward Calculation:
totalPool = stakeAmount * 2
platformFee = totalPool * 0.035 (3.5%)
winnerReward = totalPool - platformFee
```

#### 3. Parlay System (`parlayProcessorService.ts`)
```typescript
// Compound Multiplier Formula:
totalMultiplier = (1.5 × durationMultiplier)^numberOfPredictions

// Duration Multipliers:
1h: 1.2x
6h: 1.5x
24h: 2.0x
7d: 3.0x

// Platform Fee: 6% on gross reward
```

#### 4. Survival Tournament (`survivalRoundService.ts`)
```typescript
// Prize Pool: Sum of all entry fees
// Distribution: Winner takes all OR split among survivors
```

---

## Architecture Design

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Prediction  │  │   Battle     │  │    Parlay    │         │
│  │     UI       │  │     UI       │  │      UI      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │  Wagmi Hooks    │                           │
│                   │  (useContract)  │                           │
│                   └────────┬────────┘                           │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ JSON-RPC
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      Backend Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Prediction  │  │   Battle     │  │    Parlay    │          │
│  │   Service    │  │   Service    │  │   Service    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
│                   ┌────────▼────────┐                            │
│                   │  Ethers.js v6   │                            │
│                   │  (Contract API) │                            │
│                   └────────┬────────┘                            │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             │ JSON-RPC
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                    Polygon Amoy Blockchain                         │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    NTIQ Token Contract                     │   │
│  │  - ERC20 Standard                                          │   │
│  │  - transfer(), approve(), transferFrom()                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PredictionStaking Contract                    │   │
│  │  - lockStake(amount, predictionId)                        │   │
│  │  - releaseReward(user, multiplier, predictionId)          │   │
│  │  - forfeitStake(predictionId)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                BattleEscrow Contract                       │   │
│  │  - createBattle(stake, battleId)                          │   │
│  │  - acceptBattle(battleId)                                 │   │
│  │  - resolveBattle(battleId, winnerId)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                ParlayStaking Contract                      │   │
│  │  - lockParlayStake(amount, parlayId, coinCount)           │   │
│  │  - releaseCompoundReward(user, multiplier, parlayId)      │   │
│  │  - forfeitStake(parlayId)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              TournamentPool Contract                       │   │
│  │  - joinTournament(entryFee, tournamentId)                 │   │
│  │  - distributePrizes(tournamentId, winners[], amounts[])   │   │
│  │  - refundParticipants(tournamentId)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Specifications

### 1. PredictionStaking Contract

**Purpose:** Handle prediction stakes and accuracy-based rewards

**State Variables:**
```solidity
IERC20 public ntiqToken;
address public admin;
uint256 public platformFeeRate = 400; // 4% = 400 basis points
mapping(bytes32 => PredictionStake) public stakes;
```

**Data Structures:**
```solidity
struct PredictionStake {
    address user;
    uint256 amount;
    uint256 timestamp;
    bool released;
    bool forfeited;
}
```

**Key Functions:**
