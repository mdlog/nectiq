# Balance Cleanup Plan: Remove Database Balance System

## Objective
Remove all database balance references and migrate to 100% blockchain-based NTIQ token balance system.

---

## Phase 1: Database Schema Changes

### Task 1: Remove balance field from users table
**File:** `shared/schema.ts`

**Changes:**
1. Remove `balance: integer("balance").notNull().default(1000)` from users table (line 14)
2. Remove `totalRewards: integer("total_rewards").notNull().default(0)` (line 17) - This should be calculated from blockchain
3. Remove `referralRewards: integer("referral_rewards").notNull().default(0)` (line 28) - Should use blockchain
4. Remove `lifetimeEarnings: integer("lifetime_earnings").notNull().default(0)` (line 29) - Calculate from blockchain

**Migration SQL:**
```sql
ALTER TABLE users DROP COLUMN balance;
ALTER TABLE users DROP COLUMN total_rewards;
ALTER TABLE users DROP COLUMN referral_rewards;
ALTER TABLE users DROP COLUMN lifetime_earnings;
```

---

## Phase 2: Backend Service Updates

### Task 2: Update routes.ts - Remove all balance references

**File:** `server/routes.ts`

**Areas to update:**

1. **Line 1180-1181:** Referral bonus - Remove database balance update
   - Replace with blockchain token transfer via `ntiqTokenService.transfer()`

2. **Line 1237, 1430:** User response objects - Remove `balance` field
   - Replace with real-time blockchain balance call

3. **Line 2147-2154:** `/api/user/balance` endpoint
   - Remove `databaseBalance` field
   - Only return `realNTIQBalance`

4. **Line 2580-2592:** Referral rewards - Remove SQL balance updates
   - Replace with blockchain token transfers

5. **Line 2641:** User update endpoint - Remove balance update logic
   - Balance should only be managed via blockchain

6. **Line 2698-2701:** Withdrawal balance check
   - Replace with blockchain balance check

7. **Line 2755, 2767:** Withdrawal response - Remove balance field
   - Return blockchain balance instead

8. **Line 4325, 4387:** Leaderboard - Remove `totalRewards: user.balance`
   - Calculate from blockchain transaction history

9. **Line 5223-5225, 5284-5286:** Admin stats - Total NTIQ calculation
   - Calculate from blockchain total supply instead of database sum

10. **Line 5382:** User list - Remove balance field
    - Add blockchain balance if needed

11. **Line 5497-5502:** Starting balance logic
    - Remove entirely - users get NTIQ via airdrop

12. **Line 5552:** Admin user update - Remove balance update
    - Balance should only be managed via blockchain

13. **Line 6410-6441:** System health check
    - Remove balance consistency checks
    - Add blockchain sync status instead

14. **Line 7396-7408:** User creation default balance
    - Remove balance initialization
    - Users get initial NTIQ via airdrop

15. **Line 7476-7479:** Admin balance adjustment
    - Remove entirely - use blockchain transfers

16. **Line 8663-8666:** Balance consistency audit
    - Remove endpoint - no longer needed

17. **Line 9545-9550, 9685-9688, 9778-9780:** Withdrawal balance checks
    - Replace all with blockchain balance checks

18. **Line 10188-10191:** Tournament entry fee check
    - Replace with blockchain balance check

19. **Line 10587-10589:** Prediction response
    - Remove `newBalance` field
    - Return blockchain balance if needed

20. **Line 12157:** User profile - Remove balance field
    - Add blockchain balance call

### Task 3: Update balanceService.ts

**File:** `server/services/balanceService.ts`

**Changes:**
- Remove all database balance manipulation functions
- Keep only blockchain balance query functions
- Remove `updateBalance()`, `addBalance()`, `deductBalance()` functions
- Keep `getBlockchainBalance()` function

### Task 4: Update predictionService.ts

**File:** `server/services/predictionService.ts`

**Changes:**
- Remove any database balance checks
- Use only blockchain balance via `ntiqTokenService.getBalance()`
- Remove balance deduction logic (handled by smart contract)

### Task 5: Update other services

**Files to check:**
- `server/services/achievementService.ts` - Remove balance rewards
- `server/services/loyaltyService.ts` - Use blockchain for rewards
- `server/services/customTournamentService.ts` - Use blockchain balance
- `server/services/dailyChallengeService.ts` - Use blockchain rewards

---

## Phase 3: Frontend Updates

### Task 6: Update user dashboard

**File:** `client/src/pages/user-dashboard.tsx`

**Changes:**
- Remove any database balance displays
- Show only blockchain balance
- Update balance fetch to use blockchain API

### Task 7: Update financial components

**File:** `client/src/components/multi-chain-financial.tsx`

**Changes:**
- Remove database balance references
- Show only blockchain NTIQ balance

### Task 8: Update admin panel

**File:** `client/src/pages/admin-working.tsx`

**Changes:**
- Remove balance adjustment features
- Add blockchain transfer features instead
- Update user list to show blockchain balance

---

## Phase 4: Database Migration

### Task 9: Create migration script

**File:** `scripts/migrate-balance-to-blockchain.ts`

**Purpose:**
- One-time script to transfer existing database balances to blockchain
- For each user with balance > 0:
  1. Get user's database balance
  2. Transfer NTIQ tokens to user's wallet via `ntiqTokenService.transfer()`
  3. Log the transfer
  4. Mark as migrated

**Script outline:**
```typescript
// Pseudo-code
for each user in database:
  if user.balance > 0:
    txHash = await ntiqTokenService.transfer(user.walletAddress, user.balance)
    log migration: userId, balance, txHash
    // Balance column will be dropped after migration
```

### Task 10: Run database migration

**Steps:**
1. Backup database
2. Run balance migration script
3. Verify all balances transferred
4. Run SQL to drop balance columns
5. Deploy updated schema

---

## Phase 5: Testing & Verification

### Task 11: Test all features with blockchain balance

**Test cases:**
1. ✅ User registration - No database balance, only blockchain
2. ✅ NTIQ airdrop - Tokens go to blockchain wallet
3. ✅ Predictions - Stake from blockchain balance
4. ✅ Battles - Stake from blockchain balance
5. ✅ Parlay - Stake from blockchain balance
6. ✅ Tournaments - Entry fee from blockchain balance
7. ✅ Referral rewards - Transfer via blockchain
8. ✅ Withdrawals - Check blockchain balance
9. ✅ Admin panel - Show blockchain balances
10. ✅ Leaderboard - Calculate from blockchain

### Task 12: Verify no database balance references remain

**Verification:**
```bash
# Search for any remaining balance references
grep -r "user.balance" server/
grep -r "users.balance" server/
grep -r "balance.*database" server/
grep -r "UPDATE.*balance" server/
```

---

## Phase 6: Documentation Updates

### Task 13: Update API documentation

**Changes:**
- Remove balance field from user response schemas
- Add blockchain balance endpoints
- Update all balance-related API docs

### Task 14: Update user guide

**File:** `.kiro/specs/blockchain-staking-integration/USER_GUIDE.md`

**Changes:**
- Remove references to database balance
- Emphasize blockchain-only balance system
- Update balance checking instructions

---

## Implementation Order

### Priority 1 (Critical - Do First):
1. ✅ Task 9: Create migration script
2. ✅ Task 10: Run migration (transfer all database balances to blockchain)
3. ✅ Task 2: Update routes.ts (remove all balance references)
4. ✅ Task 3: Update balanceService.ts

### Priority 2 (High - Do Next):
5. ✅ Task 4: Update predictionService.ts
6. ✅ Task 5: Update other services
7. ✅ Task 6-8: Update frontend components

### Priority 3 (Medium - After Testing):
8. ✅ Task 1: Drop balance columns from schema
9. ✅ Task 11-12: Testing & verification

### Priority 4 (Low - Final):
10. ✅ Task 13-14: Documentation updates

---

## Rollback Plan

If issues occur:
1. Keep database backup before dropping columns
2. Can restore balance column if needed
3. Blockchain transfers are permanent - cannot rollback
4. Test thoroughly before production deployment

---

## Success Criteria

✅ No database balance field in schema
✅ All balance checks use blockchain
✅ All balance updates use blockchain transfers
✅ Frontend shows only blockchain balance
✅ All tests pass with blockchain balance
✅ No grep results for database balance references
✅ Migration script successfully transferred all balances

---

## Estimated Timeline

- **Phase 1-2:** 2-3 hours (Schema + Backend)
- **Phase 3:** 1-2 hours (Frontend)
- **Phase 4:** 1 hour (Migration)
- **Phase 5:** 2-3 hours (Testing)
- **Phase 6:** 1 hour (Documentation)

**Total:** 7-10 hours

---

## Notes

- This is a **breaking change** - requires careful testing
- Users must have wallet addresses to receive blockchain balance
- Ensure sufficient NTIQ tokens in treasury for migration
- Consider doing migration in batches for large user bases
- Monitor gas costs for mass transfers

---

**Status:** Ready to implement
**Next Step:** Start with Task 9 (Create migration script)
