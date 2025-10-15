# Blockchain Staking Integration Spec

## Overview

Spec ini mendokumentasikan migrasi dari **database-based balance** ke **blockchain-based staking** menggunakan real NTIQ tokens untuk semua fitur staking di aplikasi Nectiq.

## Goal

Mengintegrasikan smart contract untuk semua fitur staking agar:
- ✅ Semua stake menggunakan real NTIQ tokens dari blockchain
- ✅ Semua reward dibayarkan langsung ke wallet user
- ✅ Semua transaksi verifiable on-chain
- ✅ Platform lebih decentralized dan trustless

## Current Status

📝 **Requirements Phase** - Requirements document telah dibuat dan siap untuk review.

## Files in This Spec

1. **`requirements.md`** - Detailed requirements dengan user stories dan acceptance criteria
2. **`design.md`** - (To be created) Smart contract architecture dan system design
3. **`tasks.md`** - (To be created) Implementation tasks dan checklist

## Features to Migrate

### 1. Predictions Staking
- Current: Database balance deduction
- Target: Smart contract locks NTIQ tokens
- Impact: High - Core feature

### 2. Battle Staking
- Current: Database balance for both parties
- Target: Smart contract escrow for battle stakes
- Impact: Medium - Popular feature

### 3. Parlay Staking
- Current: Database balance for multi-predictions
- Target: Smart contract with compound rewards
- Impact: Medium - Growing feature

### 4. Survival Tournament
- Current: Database balance for entry fees
- Target: Smart contract prize pool management
- Impact: Low - Occasional feature

## Key Requirements Summary

### Must Have (P0)
1. ✅ Smart contract for prediction staking
2. ✅ Smart contract for battle staking
3. ✅ Balance synchronization (blockchain ↔ database)
4. ✅ Transaction history with explorer links
5. ✅ Error handling and rollback mechanisms

### Should Have (P1)
6. ✅ Gas fee estimation and warnings
7. ✅ Parlay smart contract integration
8. ✅ Survival tournament smart contract
9. ✅ Migration tool for existing users
10. ✅ Admin dashboard for monitoring

### Nice to Have (P2)
11. ⭕ Batch transaction optimization
12. ⭕ Insurance mechanism on-chain
13. ⭕ Automated reward distribution
14. ⭕ Multi-signature admin controls

## Technical Stack

### Smart Contracts
- **Language:** Solidity ^0.8.20
- **Framework:** Hardhat
- **Standards:** ERC-20 (NTIQ Token)
- **Network:** Polygon Amoy (testnet) → Polygon (mainnet)

### Backend
- **Language:** TypeScript
- **Framework:** Express.js
- **Blockchain Library:** Ethers.js v6
- **Database:** PostgreSQL (for metadata)

### Frontend
- **Framework:** React + TypeScript
- **Wallet Integration:** RainbowKit + Wagmi
- **UI Library:** Radix UI + Tailwind CSS

## Smart Contracts to Develop

### 1. PredictionStaking.sol
```solidity
// Handles prediction stakes and rewards
- lockStake(uint256 amount, bytes32 predictionId)
- releaseReward(address user, uint256 amount, bytes32 predictionId)
- refundStake(address user, bytes32 predictionId)
```

### 2. BattleEscrow.sol
```solidity
// Handles battle stakes in escrow
- createBattle(uint256 stake, bytes32 battleId)
- acceptBattle(bytes32 battleId)
- resolveBattle(bytes32 battleId, address winner)
- cancelBattle(bytes32 battleId)
```

### 3. ParlayStaking.sol
```solidity
// Handles parlay multi-predictions
- lockParlayStake(uint256 amount, bytes32 parlayId, uint8 coinCount)
- releaseCompoundReward(address user, uint256 amount, bytes32 parlayId)
- forfeitStake(bytes32 parlayId)
```

### 4. TournamentPool.sol
```solidity
// Handles survival tournament prize pools
- joinTournament(uint256 entryFee, bytes32 tournamentId)
- distributePrizes(bytes32 tournamentId, address[] winners, uint256[] amounts)
- refundParticipants(bytes32 tournamentId)
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  (React + RainbowKit + Wagmi)                               │
│  - Wallet Connection                                         │
│  - Transaction Signing                                       │
│  - Balance Display                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP/WebSocket
                 │
┌────────────────▼────────────────────────────────────────────┐
│                         Backend                              │
│  (Express.js + Ethers.js)                                   │
│  - API Endpoints                                             │
│  - Transaction Monitoring                                    │
│  - Database Sync                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ JSON-RPC
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    Polygon Amoy Network                      │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  NTIQ Token      │  │ PredictionStaking│               │
│  │  Contract        │  │  Contract        │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  BattleEscrow    │  │ ParlayStaking    │               │
│  │  Contract        │  │  Contract        │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐                                       │
│  │ TournamentPool   │                                       │
│  │  Contract        │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## User Flow Example: Making a Prediction

### Current Flow (Database)
```
1. User fills prediction form
2. Click "Submit Prediction"
3. Check database balance
4. Deduct from database
5. Create prediction record
6. Show success message
```

### New Flow (Blockchain)
```
1. User fills prediction form
2. Click "Submit Prediction"
3. Check blockchain NTIQ balance
4. Show approval dialog
5. User approves NTIQ spending in wallet
6. Show staking dialog
7. User confirms stake transaction
8. Wait for blockchain confirmation
9. Create prediction record with tx hash
10. Show success with explorer link
```

## Migration Strategy

### Phase 1: Parallel System (Week 1-2)
- Deploy smart contracts to testnet
- Add blockchain staking alongside database
- Users can choose which system to use
- Test with small group of users

### Phase 2: Gradual Migration (Week 3-4)
- Encourage users to migrate to blockchain
- Offer migration tool to convert database balance
- Monitor for issues and bugs
- Collect user feedback

### Phase 3: Full Migration (Week 5-6)
- Make blockchain staking default
- Deprecate database balance system
- Migrate remaining users
- Update documentation

### Phase 4: Cleanup (Week 7-8)
- Remove database balance code
- Optimize smart contracts
- Deploy to mainnet
- Celebrate! 🎉

## Success Metrics

### Technical Metrics
- ✅ 100% of stakes use blockchain tokens
- ✅ <30s average transaction time
- ✅ <1% transaction failure rate
- ✅ 99.9% balance sync accuracy

### Business Metrics
- ✅ 80%+ user adoption within 1 month
- ✅ 90%+ user satisfaction score
- ✅ 50%+ increase in trust/transparency perception
- ✅ 0 critical security incidents

### User Experience Metrics
- ✅ <5 clicks to complete stake
- ✅ <3s balance check time
- ✅ 95%+ successful first-time transactions
- ✅ <10% support tickets related to staking

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Smart contract bug | Critical | Low | Audit, testing, gradual rollout |
| High gas fees | High | Medium | Optimize contracts, batch txs |
| User confusion | Medium | High | Clear UI, tooltips, docs |
| Blockchain downtime | High | Low | Fallback RPCs, status page |
| Token loss | Critical | Very Low | Emergency pause, insurance |

## Next Steps

### For Product Owner:
1. ✅ Review requirements document
2. ⏳ Approve scope and timeline
3. ⏳ Allocate budget for audit
4. ⏳ Approve migration strategy

### For Development Team:
1. ✅ Review requirements
2. ⏳ Create design document
3. ⏳ Design smart contract architecture
4. ⏳ Create implementation tasks
5. ⏳ Set up development environment

### For Users:
1. ⏳ Announcement of upcoming changes
2. ⏳ Educational content about blockchain staking
3. ⏳ Beta testing opportunity
4. ⏳ Migration assistance

## Questions to Answer

Before proceeding to design phase:

1. **Security:** Do we need a security audit before testnet deployment?
2. **Budget:** What is the budget for smart contract development and audit?
3. **Timeline:** Is 9-10 weeks acceptable or do we need to expedite?
4. **Migration:** Should we force migration or allow users to keep database balance?
5. **Mainnet:** When do we plan to deploy to Polygon mainnet?
6. **Insurance:** Should we implement on-chain insurance for predictions?
7. **Governance:** Do we need multi-sig for admin functions?

## Resources

- **NTIQ Token Contract:** `0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f`
- **Polygon Amoy RPC:** `https://rpc-amoy.polygon.technology`
- **Polygonscan Amoy:** `https://amoy.polygonscan.com`
- **Hardhat Docs:** `https://hardhat.org/docs`
- **OpenZeppelin Contracts:** `https://docs.openzeppelin.com/contracts`

## Contact

For questions or feedback on this spec:
- Create an issue in the project repository
- Contact the development team
- Review in team meeting

---

**Status:** 📝 Requirements Complete - Awaiting Review

**Last Updated:** 2025-10-14

**Next Milestone:** Design Document Creation
