# Requirements Document: Blockchain Staking Integration

## Introduction

Saat ini aplikasi Nectiq menggunakan database balance untuk semua fitur staking (predictions, battles, parlay, survival). Requirement ini adalah untuk mengintegrasikan smart contract agar semua staking menggunakan **real NTIQ tokens** dari blockchain, bukan hanya database balance.

Perubahan ini akan membuat aplikasi lebih decentralized, transparent, dan trustless karena semua stake dan reward akan dikelola oleh smart contract di Polygon Amoy blockchain.

## Current State Analysis

### Fitur yang Menggunakan Staking:

1. **Predictions** - User stake NTIQ untuk predict harga crypto
2. **Battles** - User stake NTIQ untuk challenge user lain
3. **Parlay** - User stake NTIQ untuk multiple predictions
4. **Survival Tournament** - User stake NTIQ untuk join tournament

### Current Flow (Database-Based):

```
User makes prediction
  ↓
Check database balance
  ↓
Deduct from database
  ↓
Store in predictions table
  ↓
Process result
  ↓
Update database balance
```

### Target Flow (Blockchain-Based):

```
User makes prediction
  ↓
Check blockchain balance
  ↓
User approves smart contract
  ↓
Smart contract locks tokens
  ↓
Store prediction in database
  ↓
Process result
  ↓
Smart contract releases reward
```

---

## Requirements

### Requirement 1: Smart Contract for Prediction Staking

**User Story:** As a user, I want to stake real NTIQ tokens from my wallet when making predictions, so that my stakes are secured on blockchain.

#### Acceptance Criteria

1. WHEN user creates a prediction THEN system SHALL check user's blockchain NTIQ balance
2. WHEN user has insufficient blockchain balance THEN system SHALL reject the prediction with clear error message
3. WHEN user has sufficient balance THEN system SHALL prompt user to approve token transfer
4. WHEN user approves transfer THEN smart contract SHALL lock the staked NTIQ tokens
5. WHEN tokens are locked THEN system SHALL create prediction record in database with transaction hash
6. WHEN prediction completes successfully THEN smart contract SHALL transfer reward to user's wallet
7. WHEN prediction fails THEN smart contract SHALL return staked tokens to user (minus platform fee if applicable)
8. IF smart contract transaction fails THEN system SHALL rollback database changes and notify user

### Requirement 2: Smart Contract for Battle Staking

**User Story:** As a user, I want to stake real NTIQ tokens when creating or accepting battles, so that battle stakes are trustless and transparent.

#### Acceptance Criteria

1. WHEN user creates a battle THEN system SHALL lock challenger's stake in smart contract
2. WHEN another user accepts battle THEN system SHALL lock challenged user's stake in smart contract
3. WHEN battle completes THEN smart contract SHALL transfer total pool (minus fee) to winner
4. WHEN battle expires without acceptance THEN smart contract SHALL return stake to challenger
5. WHEN battle is cancelled THEN smart contract SHALL return stakes to both parties
6. IF either party's transaction fails THEN system SHALL prevent battle from proceeding

### Requirement 3: Smart Contract for Parlay Staking

**User Story:** As a user, I want to stake real NTIQ tokens for parlay predictions, so that my multi-prediction stakes are secured on blockchain.

#### Acceptance Criteria

1. WHEN user creates parlay THEN system SHALL lock total stake in smart contract
2. WHEN all parlay predictions complete successfully THEN smart contract SHALL transfer compound reward
3. WHEN any parlay prediction fails THEN smart contract SHALL forfeit stake (minus insurance if applicable)
4. WHEN parlay has insurance THEN smart contract SHALL handle insurance payout separately
5. IF parlay creation fails THEN system SHALL not lock any tokens

### Requirement 4: Smart Contract for Survival Tournament

**User Story:** As a user, I want to stake real NTIQ tokens to join survival tournaments, so that tournament prize pools are transparent and secured.

#### Acceptance Criteria

1. WHEN user joins tournament THEN system SHALL lock entry fee in smart contract
2. WHEN tournament starts THEN smart contract SHALL hold all entry fees as prize pool
3. WHEN user is eliminated THEN their stake remains in prize pool
4. WHEN tournament completes THEN smart contract SHALL distribute prize pool to winner(s)
5. WHEN tournament is cancelled THEN smart contract SHALL refund all participants
6. IF tournament has multiple winners THEN smart contract SHALL split prize pool accordingly

### Requirement 5: Balance Synchronization

**User Story:** As a user, I want my database balance to sync with my blockchain balance, so that I always see accurate token amounts.

#### Acceptance Criteria

1. WHEN user connects wallet THEN system SHALL fetch real blockchain balance
2. WHEN blockchain balance changes THEN system SHALL update database balance
3. WHEN user makes transaction THEN system SHALL update both blockchain and database
4. WHEN sync fails THEN system SHALL show warning but allow user to continue
5. IF balances mismatch THEN system SHALL prioritize blockchain balance as source of truth
6. WHEN user views dashboard THEN system SHALL display both database and blockchain balance

### Requirement 6: Transaction History and Transparency

**User Story:** As a user, I want to see all my blockchain transactions, so that I can verify all stakes and rewards on-chain.

#### Acceptance Criteria

1. WHEN user stakes tokens THEN system SHALL store transaction hash in database
2. WHEN user views transaction history THEN system SHALL show blockchain explorer links
3. WHEN transaction is pending THEN system SHALL show pending status with spinner
4. WHEN transaction confirms THEN system SHALL update status to confirmed
5. WHEN transaction fails THEN system SHALL show error and allow retry
6. IF user clicks explorer link THEN system SHALL open Polygonscan in new tab

### Requirement 7: Gas Fee Handling

**User Story:** As a user, I want to understand gas fees for staking transactions, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN user initiates stake THEN system SHALL estimate gas fee
2. WHEN gas fee is high THEN system SHALL warn user before proceeding
3. WHEN user has insufficient POL for gas THEN system SHALL show clear error message
4. WHEN transaction is submitted THEN system SHALL show estimated gas cost
5. IF gas estimation fails THEN system SHALL use fallback estimate
6. WHEN transaction completes THEN system SHALL show actual gas used

### Requirement 8: Smart Contract Security

**User Story:** As a platform owner, I want smart contracts to be secure and auditable, so that user funds are protected.

#### Acceptance Criteria

1. WHEN smart contract is deployed THEN it SHALL be verified on Polygonscan
2. WHEN contract handles stakes THEN it SHALL use reentrancy guards
3. WHEN contract transfers tokens THEN it SHALL use SafeERC20 patterns
4. WHEN contract has admin functions THEN they SHALL be protected by access control
5. IF contract has emergency pause THEN only owner SHALL be able to trigger it
6. WHEN contract is upgraded THEN it SHALL use proxy pattern for upgradeability

### Requirement 9: Fallback and Error Handling

**User Story:** As a user, I want graceful error handling when blockchain transactions fail, so that I don't lose my tokens.

#### Acceptance Criteria

1. WHEN blockchain is unavailable THEN system SHALL show maintenance message
2. WHEN transaction times out THEN system SHALL allow user to retry
3. WHEN user rejects transaction THEN system SHALL cancel operation gracefully
4. WHEN smart contract reverts THEN system SHALL show revert reason
5. IF database update fails after blockchain success THEN system SHALL queue for retry
6. WHEN sync fails THEN system SHALL log error and notify admin

### Requirement 10: Migration from Database to Blockchain

**User Story:** As a platform owner, I want to migrate existing users from database balance to blockchain balance, so that transition is smooth.

#### Acceptance Criteria

1. WHEN migration starts THEN system SHALL snapshot all user balances
2. WHEN user has database balance THEN system SHALL offer to convert to blockchain tokens
3. WHEN user accepts conversion THEN system SHALL transfer tokens to their wallet
4. WHEN conversion completes THEN system SHALL zero out database balance
5. IF user declines conversion THEN system SHALL allow them to continue with database balance
6. WHEN all users migrated THEN system SHALL disable database balance system

---

## Non-Functional Requirements

### Performance

1. Blockchain transactions SHALL complete within 30 seconds on average
2. Balance checks SHALL complete within 2 seconds
3. Gas estimation SHALL complete within 1 second
4. System SHALL handle 100 concurrent staking transactions

### Security

1. Smart contracts SHALL be audited before mainnet deployment
2. Private keys SHALL never be stored in database
3. All transactions SHALL require user approval in wallet
4. Admin functions SHALL be protected by multi-sig

### Usability

1. Error messages SHALL be clear and actionable
2. Transaction status SHALL be visible at all times
3. Users SHALL be able to cancel pending transactions
4. System SHALL provide transaction receipts

### Compatibility

1. System SHALL work with MetaMask, WalletConnect, and Coinbase Wallet
2. Smart contracts SHALL be compatible with ERC-20 standard
3. System SHALL work on Polygon Amoy testnet and Polygon mainnet
4. Frontend SHALL work on Chrome, Firefox, and Brave browsers

---

## Success Criteria

1. ✅ All staking features use blockchain tokens instead of database balance
2. ✅ Users can stake, win, and withdraw real NTIQ tokens
3. ✅ All transactions are verifiable on Polygonscan
4. ✅ System handles errors gracefully without token loss
5. ✅ Database and blockchain balances stay synchronized
6. ✅ Gas fees are reasonable and predictable
7. ✅ Smart contracts pass security audit
8. ✅ User experience is smooth and intuitive

---

## Out of Scope

1. ❌ Cross-chain staking (only Polygon for now)
2. ❌ Automated market maker (AMM) integration
3. ❌ Staking pools or liquidity mining
4. ❌ NFT rewards or achievements
5. ❌ Governance token functionality
6. ❌ Layer 2 scaling solutions beyond Polygon

---

## Dependencies

1. **NTIQ Token Contract** - Already deployed at `0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f`
2. **Polygon Amoy RPC** - Available at `https://rpc-amoy.polygon.technology`
3. **Ethers.js v6** - Already installed
4. **RainbowKit** - Already integrated for wallet connection
5. **Wagmi** - Already integrated for blockchain interactions

---

## Risks and Mitigations

### Risk 1: Smart Contract Bugs
**Mitigation:** Thorough testing, audit, and gradual rollout

### Risk 2: High Gas Fees
**Mitigation:** Optimize contract code, batch transactions where possible

### Risk 3: User Confusion
**Mitigation:** Clear UI/UX, tooltips, and documentation

### Risk 4: Blockchain Downtime
**Mitigation:** Fallback RPC endpoints, graceful degradation

### Risk 5: Token Loss
**Mitigation:** Emergency pause function, insurance mechanism

---

## Timeline Estimate

- **Phase 1:** Smart Contract Development (2-3 weeks)
- **Phase 2:** Backend Integration (2 weeks)
- **Phase 3:** Frontend Integration (2 weeks)
- **Phase 4:** Testing & Audit (2 weeks)
- **Phase 5:** Migration & Deployment (1 week)

**Total:** 9-10 weeks

---

## Stakeholders

- **Users:** Want secure, transparent staking
- **Developers:** Need clear APIs and documentation
- **Platform Owner:** Wants decentralization and security
- **Auditors:** Need clean, auditable code

---

## Acceptance

This requirements document will be considered complete when:

1. ✅ All stakeholders have reviewed and approved
2. ✅ Technical feasibility has been confirmed
3. ✅ Smart contract architecture has been designed
4. ✅ Implementation plan has been created
5. ✅ Budget and timeline have been approved
