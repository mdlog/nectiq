# Migration to Real Blockchain Balance

## Overview
Mengubah sistem dari database balance ke real NTIQ token balance dari blockchain untuk semua fitur staking.

---

## Changes Required

### 1. Prediction Creation ✅ DONE
**File:** `server/routes.ts` - POST /api/predictions

**Changes:**
- ✅ Check `ntiqTokenService.getBalance()` instead of `user.balance`
- ✅ Require wallet address (reject if no wallet)
- ✅ Lock stake on blockchain FIRST before creating prediction
- ✅ Remove database balance deduction
- ✅ Only create prediction if blockchain transaction succeeds

---

### 2. Battle Creation 🔄 TODO
**File:** `server/routes.ts` - POST /api/battles

**Current Code:**
```typescript
// Check user balance
const user = await storage.getUser(userId);
if (!user || user.balance < stakeAmount) {
  return res.status(400).json({ message: 'Insufficient balance' });
}

// Deduct stake amount from user balance
const newBalance = user.balance - stakeAmount;
await storage.updateUser(userId, {
  balance: newBalance
});
```

**Required Changes:**
```typescript
// Check blockchain balance
const user = await storage.getUser(userId);
if (!user || !user.walletAddress) {
  return res.status(400).json({ message: 'Wallet address required' });
}

const blockchainBalance = await ntiqTokenService.getBalance(user.walletAddress);
if (blockchainBalance < stakeAmount) {
  return res.status(400).json({ 
    message: `Insufficient NTIQ balance. Required: ${stakeAmount}, Available: ${blockchainBalance.toFixed(2)}` 
  });
}

// Lock stake on blockchain FIRST
try {
  const battleId = blockchainService.generateBattleId(Date.now());
  const txHash = await battleEscrowService.createBattle({
    battleId,
    challenger: user.walletAddress,
    challenged: challengedAddress,
    stakeAmount: stakeAmount.toString()
  });
  
  // Then create battle in database
  const battle = await storage.createBattle({...});
  
  // Update with blockchain hash
  await db.update(predictionBattles)
    .set({ blockchainBattleHash: txHash, blockchainStatus: 'confirmed' })
    .where(eq(predictionBattles.id, battle.id));
    
} catch (error) {
  return res.status(500).json({ message: 'Failed to create battle on blockchain' });
}

// Remove database balance deduction
```

---

### 3. Battle Join/Accept 🔄 TODO
**File:** `server/routes.ts` - POST /api/battles/:id/join

**Current Code:**
```typescript
// Check user balance
if (user.balance < battle.stakeAmount) {
  return res.status(400).json({ message: `Insufficient balance. Required ${battle.stakeAmount} NTIQ` });
}

// Deduct stake from user balance
await storage.updateUser(userId, {
  balance: user.balance - battle.stakeAmount
});
```

**Required Changes:**
```typescript
// Check blockchain balance
if (!user.walletAddress) {
  return res.status(400).json({ message: 'Wallet address required' });
}

const blockchainBalance = await ntiqTokenService.getBalance(user.walletAddress);
if (blockchainBalance < battle.stakeAmount) {
  return res.status(400).json({ 
    message: `Insufficient NTIQ balance. Required: ${battle.stakeAmount}, Available: ${blockchainBalance.toFixed(2)}` 
  });
}

// Accept battle on blockchain FIRST
try {
  const blockchainBattleId = blockchainService.generateBattleId(battleId);
  const txHash = await battleEscrowService.acceptBattle({
    battleId: blockchainBattleId,
    challenged: user.walletAddress
  });
  
  // Then update database
  const joinResult = await storage.joinBattle(battleId, userId, parseFloat(challengedPrediction));
  
  // Update with blockchain hash
  await db.update(predictionBattles)
    .set({ blockchainAcceptHash: txHash, blockchainStatus: 'confirmed' })
    .where(eq(predictionBattles.id, battleId));
    
} catch (error) {
  return res.status(500).json({ message: 'Failed to accept battle on blockchain' });
}

// Remove database balance deduction
```

---

### 4. Parlay Creation 🔄 TODO
**File:** `server/routes.ts` - POST /api/parlay/create

**Current Code:**
```typescript
if (!user || user.balance < parseFloat(stakeAmount)) {
  return res.status(400).json({ message: "Insufficient balance" });
}

// Deduct balance
await BalanceService.processTransaction({
  userId: user.id,
  type: 'parlay_stake',
  amount: -stake,
  description: `Parlay prediction - ${coins.length} coins`,
  relatedId: parlay.id
}, storage);
```

**Required Changes:**
```typescript
if (!user || !user.walletAddress) {
  return res.status(400).json({ message: "Wallet address required" });
}

const blockchainBalance = await ntiqTokenService.getBalance(user.walletAddress);
if (blockchainBalance < parseFloat(stakeAmount)) {
  return res.status(400).json({ 
    message: `Insufficient NTIQ balance. Required: ${stakeAmount}, Available: ${blockchainBalance.toFixed(2)}` 
  });
}

// Lock parlay stake on blockchain FIRST
try {
  const parlayId = blockchainService.generateParlayId(Date.now());
  const txHash = await parlayStakingService.lockParlayStake({
    parlayId,
    userAddress: user.walletAddress,
    stakeAmount: stake.toString(),
    coinCount: coins.length
  });
  
  // Then create parlay in database
  const [parlay] = await db.insert(parlayPredictions).values({...}).returning();
  
  // Update with blockchain hash
  await db.update(parlayPredictions)
    .set({ blockchainStakeHash: txHash, blockchainStatus: 'confirmed' })
    .where(eq(parlayPredictions.id, parlay.id));
    
} catch (error) {
  return res.status(500).json({ message: 'Failed to lock parlay stake on blockchain' });
}

// Remove database balance deduction
```

---

### 5. Tournament Join 🔄 TODO
**File:** `server/routes.ts` - POST /api/survival-tournaments/:id/join

**Current Code:**
```typescript
// Validate user has enough balance
const user = await storage.getUser(userId);
if (!user || user.balance < tournament.entryFee) {
  return res.status(400).json({ message: 'Insufficient balance for entry fee' });
}

// Deduct balance
const balanceResult = await BalanceService.processTransaction({
  userId,
  type: 'survival_entry',
  amount: tournament.entryFee,
  description: `Joined survival tournament - ${tournament.title}`,
  relatedId: tournamentId
}, storage);
```

**Required Changes:**
```typescript
// Check blockchain balance
const user = await storage.getUser(userId);
if (!user || !user.walletAddress) {
  return res.status(400).json({ message: 'Wallet address required' });
}

const blockchainBalance = await ntiqTokenService.getBalance(user.walletAddress);
if (blockchainBalance < tournament.entryFee) {
  return res.status(400).json({ 
    message: `Insufficient NTIQ balance. Required: ${tournament.entryFee}, Available: ${blockchainBalance.toFixed(2)}` 
  });
}

// Join tournament on blockchain FIRST
try {
  const blockchainTournamentId = blockchainService.generateTournamentId(tournamentId);
  const txHash = await tournamentPoolService.joinTournament({
    tournamentId: blockchainTournamentId,
    userAddress: user.walletAddress,
    entryFee: tournament.entryFee.toString()
  });
  
  // Then join in database
  const participant = await storage.joinSurvivalTournament(tournamentId, userId);
  
  logger.info(`🔗 [BLOCKCHAIN] User ${userId} joined tournament ${tournamentId}: ${txHash}`);
  
} catch (error) {
  return res.status(500).json({ message: 'Failed to join tournament on blockchain' });
}

// Remove database balance deduction
```

---

## Reward Distribution

### Prediction Rewards
**Current:** Database balance update
**New:** Smart contract releases reward automatically (already implemented)

### Battle Rewards
**Current:** Database balance update
**New:** Smart contract distributes to winner automatically (already implemented)

### Parlay Rewards
**Current:** Database balance update
**New:** Smart contract releases compound reward automatically (already implemented)

### Tournament Rewards
**Current:** Database balance update
**New:** Smart contract distributes prizes automatically (already implemented)

---

## User Balance Display

### Frontend Changes Required
1. **Remove database balance display**
2. **Show real blockchain balance** from `ntiqTokenService.getBalance()`
3. **Add "Connect Wallet" requirement** for all staking features
4. **Show transaction status** (pending, confirmed, failed)
5. **Add Polygonscan links** for all transactions

### API Endpoints to Update
- `GET /api/user` - Return blockchain balance instead of database balance
- `GET /api/user/blockchain-balance` - Already implemented ✅
- `POST /api/user/sync-balance` - Already implemented ✅

---

## Migration Strategy

### Phase 1: Dual System (Transition Period)
- Keep database balance for existing users
- Use blockchain balance for new transactions
- Allow users to "migrate" their database balance to blockchain

### Phase 2: Blockchain Only (Final State)
- All new users start with 0 database balance
- All transactions use blockchain balance
- Database balance becomes read-only (for historical data)

---

## Testing Checklist

### Before Testing
- [ ] Ensure NTIQ token contract is deployed
- [ ] Ensure all staking contracts are deployed
- [ ] Users have NTIQ tokens in their wallets
- [ ] Users have approved staking contracts to spend NTIQ

### Test Scenarios
- [ ] Create prediction with blockchain balance
- [ ] Create battle with blockchain balance
- [ ] Accept battle with blockchain balance
- [ ] Create parlay with blockchain balance
- [ ] Join tournament with blockchain balance
- [ ] Verify rewards are distributed on blockchain
- [ ] Check balance sync works correctly
- [ ] Test insufficient balance scenarios
- [ ] Test wallet not connected scenarios

---

## Rollback Plan

If issues occur:
1. Revert to database balance checks
2. Keep blockchain transactions as "optional"
3. Continue logging blockchain transactions for audit
4. Fix issues and redeploy

---

## Benefits

1. **True Decentralization** - No central database controlling balances
2. **Transparency** - All transactions visible on blockchain
3. **Security** - Smart contracts enforce rules
4. **Trust** - Users control their own tokens
5. **Auditability** - All transactions permanently recorded

---

## Risks

1. **Gas Fees** - Users pay gas for transactions (Polygon Amoy is testnet, free)
2. **Transaction Failures** - Network issues can cause failures
3. **User Experience** - Requires wallet connection and approvals
4. **Complexity** - More complex than database transactions

---

## Next Steps

1. ✅ Update prediction creation (DONE)
2. 🔄 Update battle creation and join
3. 🔄 Update parlay creation
4. 🔄 Update tournament join
5. 🔄 Update frontend to show blockchain balance
6. 🔄 Add wallet connection requirement
7. 🔄 Test all features end-to-end
8. 🔄 Deploy to production

