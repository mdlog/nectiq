# Implementation Tasks: Blockchain Staking Integration

## Overview

This document contains the implementation tasks for integrating smart contract staking into all features of the Nectiq application.

---

## Phase 1: Smart Contract Development

### Task 1: Setup Hardhat Project
- [ ] 1.1 Initialize Hardhat project in `/contracts` directory
  - Install Hardhat: `npm install --save-dev hardhat`
  - Run `npx hardhat init`
  - Configure for Polygon Amoy testnet
  - _Requirements: All from requirements.md_

- [ ] 1.2 Install OpenZeppelin contracts
  - Install: `npm install @openzeppelin/contracts`
  - Import ReentrancyGuard, Ownable, Pausable, SafeERC20
  - _Requirements: Requirement 8 (Smart Contract Security)_

- [ ] 1.3 Configure hardhat.config.ts
  - Add Polygon Amoy network configuration
  - Set up deployer wallet from DEPLOYER_PRIVATE_KEY
  - Configure Polygonscan API for verification
  - _Requirements: Requirement 8_

### Task 2: Develop PredictionStaking Contract
- [ ] 2.1 Create PredictionStaking.sol contract
  - Define state variables (ntiqToken, admin, treasury, platformFeeRate)
  - Define PredictionStake struct
  - Implement constructor
  - _Requirements: Requirement 1_

- [ ] 2.2 Implement lockStake function
  - Validate stake amount (50-10,000 NTIQ)
  - Transfer NTIQ from user using transferFrom
  - Store stake info with predictionId
  - Emit StakeLocked event
  - _Requirements: Requirement 1.1, 1.2, 1.3_

- [ ] 2.3 Implement releaseReward function
  - Calculate reward based on multiplier
  - Apply 4% platform fee if multiplier >= 1.5x
  - Transfer reward to user
  - Transfer fee to treasury
  - Emit RewardReleased event
  - _Requirements: Requirement 1.6_

- [ ] 2.4 Implement forfeitStake function
  - Mark stake as forfeited
  - Transfer entire stake to treasury
  - Emit StakeForfeited event
  - _Requirements: Requirement 1.7_

- [ ]* 2.5 Write unit tests for PredictionStaking
  - Test lockStake with valid/invalid amounts
  - Test releaseReward with different multipliers
  - Test forfeitStake
  - Test platform fee calculations
  - _Requirements: Requirement 8_

### Task 3: Develop BattleEscrow Contract
- [ ] 3.1 Create BattleEscrow.sol contract
  - Define state variables
  - Define Battle struct and BattleStatus enum
  - Implement constructor
  - _Requirements: Requirement 2_

- [ ] 3.2 Implement createBattle function
  - Transfer stake from challenger
  - Create battle record
  - Emit BattleCreated event
  - _Requirements: Requirement 2.1_

- [ ] 3.3 Implement acceptBattle function
  - Transfer stake from challenged user
  - Update battle status
  - Emit BattleAccepted event
  - _Requirements: Requirement 2.2_

- [ ] 3.4 Implement resolveBattle function
  - Calculate total pool and platform fee (3.5%)
  - Transfer reward to winner
  - Transfer fee to treasury
  - Emit BattleResolved event
  - _Requirements: Requirement 2.3_

- [ ] 3.5 Implement cancelBattle function
  - Refund stakes to both parties
  - Update status to Cancelled
  - Emit BattleCancelled event
  - _Requirements: Requirement 2.4, 2.5_

- [ ]* 3.6 Write unit tests for BattleEscrow
  - Test battle creation and acceptance
  - Test battle resolution with winner
  - Test battle cancellation
  - Test platform fee calculations
  - _Requirements: Requirement 8_

### Task 4: Develop ParlayStaking Contract
- [ ] 4.1 Create ParlayStaking.sol contract
  - Define state variables
  - Define ParlayStake struct
  - Implement constructor
  - _Requirements: Requirement 3_

- [ ] 4.2 Implement lockParlayStake function
  - Validate coin count (2-10)
  - Transfer NTIQ from user
  - Store parlay info
  - Emit ParlayStakeLocked event
  - _Requirements: Requirement 3.1_

- [ ] 4.3 Implement releaseCompoundReward function
  - Calculate gross reward from multiplier
  - Apply 6% platform fee
  - Transfer net reward to user
  - Transfer fee to treasury
  - Emit ParlayRewardReleased event
  - _Requirements: Requirement 3.2_

- [ ] 4.4 Implement forfeitStake function
  - Mark parlay as forfeited
  - Transfer stake to treasury
  - Emit ParlayStakeForfeited event
  - _Requirements: Requirement 3.3_

- [ ]* 4.5 Write unit tests for ParlayStaking
  - Test parlay stake locking
  - Test compound reward calculation
  - Test stake forfeiture
  - Test platform fee calculations
  - _Requirements: Requirement 8_

### Task 5: Develop TournamentPool Contract
- [ ] 5.1 Create TournamentPool.sol contract
  - Define state variables
  - Define Tournament struct and TournamentStatus enum
  - Implement constructor
  - _Requirements: Requirement 4_

- [ ] 5.2 Implement joinTournament function
  - Transfer entry fee from user
  - Add to prize pool
  - Mark user as participant
  - Emit TournamentJoined event
  - _Requirements: Requirement 4.1_

- [ ] 5.3 Implement distributePrizes function
  - Validate total amounts <= prize pool
  - Transfer prizes to winners
  - Update tournament status
  - Emit PrizesDistributed event
  - _Requirements: Requirement 4.2, 4.3, 4.4_

- [ ] 5.4 Implement refundParticipants function
  - Refund entry fees to all participants
  - Update status to Cancelled
  - Emit TournamentCancelled event
  - _Requirements: Requirement 4.5_

- [ ]* 5.5 Write unit tests for TournamentPool
  - Test tournament joining
  - Test prize distribution (single and multiple winners)
  - Test participant refunds
  - _Requirements: Requirement 8_

### Task 6: Deploy Contracts to Polygon Amoy
- [ ] 6.1 Create deployment script
  - Deploy PredictionStaking contract
  - Deploy BattleEscrow contract
  - Deploy ParlayStaking contract
  - Deploy TournamentPool contract
  - Save deployed addresses
  - _Requirements: Requirement 8_

- [ ] 6.2 Verify contracts on Polygonscan
  - Verify PredictionStaking
  - Verify BattleEscrow
  - Verify ParlayStaking
  - Verify TournamentPool
  - _Requirements: Requirement 8.1_

- [ ] 6.3 Update .env with contract addresses
  - Add PREDICTION_STAKING_ADDRESS
  - Add BATTLE_ESCROW_ADDRESS
  - Add PARLAY_STAKING_ADDRESS
  - Add TOURNAMENT_POOL_ADDRESS
  - _Requirements: All requirements_

---

## Phase 2: Backend Integration

### Task 7: Create Contract Service Layer
- [ ] 7.1 Create blockchainService.ts
  - Initialize ethers providers
  - Load contract ABIs
  - Create contract instances
  - Export contract interaction functions
  - _Requirements: Requirement 5_

- [ ] 7.2 Create predictionStakingService.ts
  - Implement lockStake wrapper
  - Implement releaseReward wrapper
  - Implement forfeitStake wrapper
  - Add transaction monitoring
  - _Requirements: Requirement 1, 6_

- [ ] 7.3 Create battleEscrowService.ts
  - Implement createBattle wrapper
  - Implement acceptBattle wrapper
  - Implement resolveBattle wrapper
  - Implement cancelBattle wrapper
  - _Requirements: Requirement 2, 6_

- [ ] 7.4 Create parlayStakingService.ts
  - Implement lockParlayStake wrapper
  - Implement releaseCompoundReward wrapper
  - Implement forfeitStake wrapper
  - _Requirements: Requirement 3, 6_

- [ ] 7.5 Create tournamentPoolService.ts
  - Implement joinTournament wrapper
  - Implement distributePrizes wrapper
  - Implement refundParticipants wrapper
  - _Requirements: Requirement 4, 6_

### Task 8: Update Prediction Service
- [ ] 8.1 Modify createPrediction endpoint
  - Check blockchain NTIQ balance
  - Call predictionStakingService.lockStake
  - Store transaction hash in database
  - Return transaction status
  - _Requirements: Requirement 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 8.2 Modify processPrediction function
  - Calculate accuracy multiplier
  - Call predictionStakingService.releaseReward or forfeitStake
  - Update database with transaction hash
  - _Requirements: Requirement 1.6, 1.7_

- [ ] 8.3 Add transaction monitoring
  - Listen for StakeLocked events
  - Listen for RewardReleased events
  - Listen for StakeForfeited events
  - Update database on confirmation
  - _Requirements: Requirement 6.2, 6.3, 6.4_

### Task 9: Update Battle Service
- [ ] 9.1 Modify createBattle endpoint
  - Check blockchain NTIQ balance
  - Call battleEscrowService.createBattle
  - Store transaction hash
  - _Requirements: Requirement 2.1_

- [ ] 9.2 Modify acceptBattle endpoint
  - Check blockchain NTIQ balance
  - Call battleEscrowService.acceptBattle
  - Store transaction hash
  - _Requirements: Requirement 2.2_

- [ ] 9.3 Modify resolveBattle function
  - Determine winner
  - Call battleEscrowService.resolveBattle
  - Update database
  - _Requirements: Requirement 2.3_

- [ ] 9.4 Add battle event monitoring
  - Listen for BattleCreated events
  - Listen for BattleAccepted events
  - Listen for BattleResolved events
  - _Requirements: Requirement 6_

### Task 10: Update Parlay Service
- [ ] 10.1 Modify createParlay endpoint
  - Check blockchain NTIQ balance
  - Call parlayStakingService.lockParlayStake
  - Store transaction hash
  - _Requirements: Requirement 3.1_

- [ ] 10.2 Modify processCompletedParlays function
  - Calculate compound multiplier
  - Call parlayStakingService.releaseCompoundReward or forfeitStake
  - Update database
  - _Requirements: Requirement 3.2, 3.3_

- [ ] 10.3 Add parlay event monitoring
  - Listen for ParlayStakeLocked events
  - Listen for ParlayRewardReleased events
  - _Requirements: Requirement 6_

### Task 11: Update Survival Tournament Service
- [ ] 11.1 Modify joinTournament endpoint
  - Check blockchain NTIQ balance
  - Call tournamentPoolService.joinTournament
  - Store transaction hash
  - _Requirements: Requirement 4.1_

- [ ] 11.2 Modify finishTournament function
  - Prepare winners array and amounts
  - Call tournamentPoolService.distributePrizes
  - Update database
  - _Requirements: Requirement 4.2, 4.3, 4.4_

- [ ] 11.3 Add tournament event monitoring
  - Listen for TournamentJoined events
  - Listen for PrizesDistributed events
  - _Requirements: Requirement 6_

### Task 12: Implement Balance Synchronization
- [ ] 12.1 Create balanceSyncService.ts
  - Fetch blockchain balance via ntiqTokenService
  - Compare with database balance
  - Update database if mismatch
  - Log discrepancies
  - _Requirements: Requirement 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12.2 Add real-time balance endpoint
  - GET /api/user/blockchain-balance
  - Return both database and blockchain balance
  - Show sync status
  - _Requirements: Requirement 5.6_

- [ ] 12.3 Implement periodic sync
  - Run balance sync every 5 minutes
  - Sync on user login
  - Sync after transactions
  - _Requirements: Requirement 5_

---

## Phase 3: Frontend Integration

### Task 13: Create Contract Hooks
- [ ] 13.1 Create usePredictionStaking hook
  - useContractWrite for lockStake
  - useContractRead for stake info
  - useWaitForTransaction for confirmation
  - _Requirements: Requirement 1_

- [ ] 13.2 Create useBattleEscrow hook
  - useContractWrite for createBattle, acceptBattle
  - useContractRead for battle info
  - _Requirements: Requirement 2_

- [ ] 13.3 Create useParlayStaking hook
  - useContractWrite for lockParlayStake
  - useContractRead for parlay info
  - _Requirements: Requirement 3_

- [ ] 13.4 Create useTournamentPool hook
  - useContractWrite for joinTournament
  - useContractRead for tournament info
  - _Requirements: Requirement 4_

### Task 14: Update Prediction UI
- [ ] 14.1 Add NTIQ approval flow
  - Show approval dialog before stake
  - Call approve() on NTIQ token
  - Wait for approval confirmation
  - _Requirements: Requirement 1.3, 7.1, 7.2_

- [ ] 14.2 Update prediction form
  - Check blockchain balance
  - Show gas fee estimate
  - Add transaction status indicator
  - Show Polygonscan link after submission
  - _Requirements: Requirement 1, 6, 7_

- [ ] 14.3 Add transaction monitoring UI
  - Show pending transaction spinner
  - Show confirmation message
  - Show error message with retry option
  - _Requirements: Requirement 6.3, 6.4, 6.5, 9_

### Task 15: Update Battle UI
- [ ] 15.1 Add approval flow for battles
  - Approval for createBattle
  - Approval for acceptBattle
  - _Requirements: Requirement 2, 7_

- [ ] 15.2 Update battle creation form
  - Check blockchain balance
  - Show gas fee estimate
  - Add transaction status
  - _Requirements: Requirement 2.1, 7_

- [ ] 15.3 Update battle acceptance UI
  - Check blockchain balance
  - Show total pool and potential reward
  - Add transaction status
  - _Requirements: Requirement 2.2, 7_

### Task 16: Update Parlay UI
- [ ] 16.1 Add approval flow for parlay
  - Show approval dialog
  - Display compound multiplier preview
  - _Requirements: Requirement 3, 7_

- [ ] 16.2 Update parlay creation form
  - Check blockchain balance
  - Show potential reward calculation
  - Add transaction status
  - _Requirements: Requirement 3.1, 7_

### Task 17: Update Survival Tournament UI
- [ ] 17.1 Add approval flow for tournament
  - Show approval dialog
  - Display prize pool info
  - _Requirements: Requirement 4, 7_

- [ ] 17.2 Update tournament join UI
  - Check blockchain balance
  - Show entry fee and prize pool
  - Add transaction status
  - _Requirements: Requirement 4.1, 7_

### Task 18: Add Transaction History UI
- [ ] 18.1 Create transaction history component
  - Display all blockchain transactions
  - Show transaction hash
  - Add Polygonscan links
  - Show transaction status (pending/confirmed/failed)
  - _Requirements: Requirement 6.1, 6.2, 6.6_

- [ ] 18.2 Add transaction details modal
  - Show full transaction info
  - Display gas used
  - Show block number
  - Add copy transaction hash button
  - _Requirements: Requirement 6_

---

## Phase 4: Testing & Quality Assurance

### Task 19: Integration Testing
- [ ]* 19.1 Test prediction flow end-to-end
  - Create prediction with blockchain stake
  - Wait for target time
  - Verify reward distribution
  - Check balance sync
  - _Requirements: All Requirement 1_

- [ ]* 19.2 Test battle flow end-to-end
  - Create battle
  - Accept battle
  - Resolve battle
  - Verify reward distribution
  - _Requirements: All Requirement 2_

- [ ]* 19.3 Test parlay flow end-to-end
  - Create parlay with multiple coins
  - Wait for all predictions
  - Verify compound reward
  - _Requirements: All Requirement 3_

- [ ]* 19.4 Test tournament flow end-to-end
  - Join tournament
  - Complete rounds
  - Verify prize distribution
  - _Requirements: All Requirement 4_

### Task 20: Error Handling Testing
- [ ]* 20.1 Test insufficient balance scenarios
  - Attempt stake with low balance
  - Verify error message
  - _Requirements: Requirement 9.1, 9.2_

- [ ]* 20.2 Test transaction failure scenarios
  - User rejects transaction
  - Transaction times out
  - Contract reverts
  - _Requirements: Requirement 9.3, 9.4, 9.5_

- [ ]* 20.3 Test gas fee scenarios
  - High gas fee warning
  - Insufficient POL for gas
  - _Requirements: Requirement 7.1, 7.2, 7.3_

### Task 21: Security Audit
- [ ]* 21.1 Conduct internal security review
  - Review all smart contracts
  - Check for reentrancy vulnerabilities
  - Verify access control
  - _Requirements: Requirement 8_

- [ ]* 21.2 Perform external audit (optional)
  - Hire security auditor
  - Fix identified issues
  - Get audit report
  - _Requirements: Requirement 8_

---

## Phase 5: Migration & Deployment

### Task 22: User Migration
- [ ] 22.1 Create migration tool
  - Allow users to convert database balance to blockchain tokens
  - Transfer tokens to user wallet
  - Zero out database balance
  - _Requirements: Requirement 10.2, 10.3, 10.4_

- [ ] 22.2 Create migration UI
  - Show current database balance
  - Show conversion rate (1:1)
  - Add "Convert to Blockchain" button
  - Show transaction status
  - _Requirements: Requirement 10_

- [ ] 22.3 Implement gradual migration
  - Phase 1: Optional migration (users can choose)
  - Phase 2: Encourage migration (show benefits)
  - Phase 3: Force migration (deadline)
  - _Requirements: Requirement 10.5_

### Task 23: Documentation
- [ ] 23.1 Update user documentation
  - Explain blockchain staking
  - Add wallet connection guide
  - Document transaction process
  - _Requirements: All requirements_

- [ ] 23.2 Create developer documentation
  - Document smart contract APIs
  - Add integration examples
  - Document event monitoring
  - _Requirements: All requirements_

- [ ] 23.3 Create admin documentation
  - Document admin functions
  - Add troubleshooting guide
  - Document emergency procedures
  - _Requirements: Requirement 8_

### Task 24: Deployment to Mainnet
- [ ] 24.1 Deploy contracts to Polygon mainnet
  - Deploy all 4 contracts
  - Verify on Polygonscan
  - Update .env with mainnet addresses
  - _Requirements: All requirements_

- [ ] 24.2 Update frontend for mainnet
  - Switch network configuration
  - Update contract addresses
  - Test all features
  - _Requirements: All requirements_

- [ ] 24.3 Monitor and optimize
  - Monitor gas usage
  - Optimize contract calls
  - Monitor transaction success rate
  - _Requirements: Performance requirements_

---

## Summary

**Total Tasks:** 24 main tasks
**Subtasks:** 100+ implementation steps
**Estimated Timeline:** 9-10 weeks

**Priority:**
- **P0 (Must Have):** Tasks 1-12, 13-18 (Smart contracts + Backend + Frontend)
- **P1 (Should Have):** Tasks 19-21 (Testing + Security)
- **P2 (Nice to Have):** Tasks 22-24 (Migration + Documentation + Mainnet)

**Next Steps:**
1. Review and approve this task list
2. Start with Task 1: Setup Hardhat Project
3. Proceed sequentially through phases
4. Test thoroughly at each phase
5. Deploy to testnet first, then mainnet

---

**Note:** Tasks marked with `*` are optional testing tasks that can be skipped for MVP but are recommended for production.
