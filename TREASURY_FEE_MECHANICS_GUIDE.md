# 💰 TREASURY FEE PERCENTAGE - PANDUAN LENGKAP

**Date:** January 2025  
**Purpose:** Menjelaskan cara kerja treasuryFeePercentage dalam NTIQToken.sol  
**Context:** Deflationary mechanics & revenue sharing

---

## 📋 TABLE OF CONTENTS

1. [Quick Answer](#quick-answer)
2. [Fee Structure Overview](#fee-structure-overview)
3. [How It Works: Step-by-Step](#how-it-works-step-by-step)
4. [Real-World Example](#real-world-example)
5. [DAO Treasury Usage](#dao-treasury-usage)
6. [Revenue Sharing to Stakers](#revenue-sharing-to-stakers)
7. [Code Implementation](#code-implementation)
8. [Backend Integration](#backend-integration)

---

## ⚡ QUICK ANSWER

### **Q: Bagaimana treasuryFeePercentage bekerja?**

**A: Platform fees didistribusikan otomatis ke 3 tempat:**

```
100% Platform Fees
├─ 50% → TOKEN BURN 🔥 (deflationary)
├─ 30% → DAO TREASURY 💰 (community controlled)
└─ 20% → OPERATIONS 🏢 (team salaries & infrastructure)
```

**treasuryFeePercentage = 30%** berarti **30% dari total fees** masuk ke **DAO Treasury** yang dikelola oleh komunitas (vNTIQ holders).

---

## 📊 FEE STRUCTURE OVERVIEW

### **Defined in NTIQToken.sol:**

```solidity
// Line 57-60
uint256 public burnFeePercentage = 50;      // 50% of fees burned
uint256 public treasuryFeePercentage = 30;  // 30% to DAO treasury
uint256 public operationsFeePercentage = 20; // 20% to operations
```

### **Visual Breakdown:**

```
┌──────────────────────────────────────────────────────────────────┐
│                    PLATFORM FEE DISTRIBUTION                      │
└──────────────────────────────────────────────────────────────────┘

                     100% Platform Fees
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐        ┌─────────┐       ┌──────────┐
    │  50%   │        │   30%   │       │   20%    │
    │  BURN  │        │TREASURY │       │OPERATIONS│
    │   🔥   │        │   💰    │       │    🏢    │
    └────────┘        └─────────┘       └──────────┘
        │                  │                  │
        ▼                  ▼                  ▼
  Destroyed         DAO Control         Team Salaries
  Forever           Community           Infrastructure
                    Governance          Legal & Ops
```

---

## 🔄 HOW IT WORKS: STEP-BY-STEP

### **STEP 1: Platform Collects Fees**

Platform mengumpulkan fees dari berbagai aktivitas:

| Activity | Fee Rate | Example Volume | Fees Collected |
|----------|----------|----------------|----------------|
| **Prediction Loss** | 100% of stake | 500,000 NTIQ | 500,000 NTIQ |
| **Battle Commission** | 2% | 5,000,000 NTIQ | 100,000 NTIQ |
| **Tournament Entry** | 5% | 1,000,000 NTIQ | 50,000 NTIQ |
| **Withdrawal Fee** | 0.5% | 2,000,000 NTIQ | 10,000 NTIQ |
| **Premium Subscriptions** | Flat | 40,000 NTIQ | 40,000 NTIQ |
| **TOTAL** | | | **700,000 NTIQ** |

**These fees accumulate in:** Contract address atau admin wallet

---

### **STEP 2: Admin Triggers Fee Processing**

```javascript
// Backend: server/index.ts atau automated script
async function processFees() {
  const ntiqToken = await ethers.getContractAt(
    "NTIQToken",
    process.env.NTIQ_TOKEN_ADDRESS
  );
  
  // Get total fees collected this period
  const totalFees = ethers.parseUnits("700000", 18); // 700K NTIQ
  
  // Process fees (automatic distribution)
  const tx = await ntiqToken.processPlatformFees(totalFees);
  await tx.wait();
  
  console.log("✅ Fees processed!");
  console.log("   • Burned: 350,000 NTIQ");
  console.log("   • Treasury: 210,000 NTIQ");
  console.log("   • Operations: 140,000 NTIQ");
}
```

---

### **STEP 3: Smart Contract Auto-Distributes**

```solidity
// contracts/NTIQToken.sol (Line 416-430)
function processPlatformFees(uint256 totalFees) external onlyOwner {
    // Calculate amounts based on percentages
    uint256 burnAmount = (totalFees * burnFeePercentage) / 100;
    uint256 treasuryAmount = (totalFees * treasuryFeePercentage) / 100;
    uint256 operationsAmount = (totalFees * operationsFeePercentage) / 100;
    
    // 1. Burn tokens (permanent supply reduction)
    _burn(address(this), burnAmount);
    totalBurned += burnAmount;
    
    // 2. Send to DAO Treasury (community controlled)
    _transfer(address(this), daoTreasury, treasuryAmount);
    
    // 3. Send to Operations (platform sustainability)
    _transfer(address(this), operationsWallet, operationsAmount);
    
    emit TokensBurned(address(this), burnAmount);
}
```

**Calculation Example:**
```
Input: totalFees = 700,000 NTIQ

Calculation:
├─ burnAmount = 700,000 × 50 / 100 = 350,000 NTIQ
├─ treasuryAmount = 700,000 × 30 / 100 = 210,000 NTIQ
└─ operationsAmount = 700,000 × 20 / 100 = 140,000 NTIQ

Total distributed: 350,000 + 210,000 + 140,000 = 700,000 ✅
```

---

### **STEP 4: What Happens to Each Portion**

#### **A. Burn (50% = 350,000 NTIQ) 🔥**

```
Effect: Permanent supply reduction

Before:
├─ Total Supply: 1,000,000,000 NTIQ
└─ Circulating: 150,000,000 NTIQ

After Burn:
├─ Total Supply: 999,650,000 NTIQ (-350K)
├─ Circulating: 149,650,000 NTIQ
└─ Price Impact: Positive (scarcity ↑)

Who Benefits:
├─ All token holders (increased scarcity)
├─ Stakers (higher token value)
└─ Long-term investors (deflationary model)
```

#### **B. DAO Treasury (30% = 210,000 NTIQ) 💰**

```
Destination: DAO Treasury Wallet (multisig)
Control: Community governance via vNTIQ voting

Usage Allocation (voted by community):
├─ Marketing & Partnerships: 40% = 84,000 NTIQ
│  ├─ Influencer campaigns
│  ├─ Social media ads
│  └─ Event sponsorships
│
├─ Development Grants: 30% = 63,000 NTIQ
│  ├─ New feature development
│  ├─ Third-party integrations
│  └─ Community developers
│
├─ Bug Bounties: 20% = 42,000 NTIQ
│  ├─ Security researchers
│  ├─ Critical bug fixes
│  └─ Platform improvements
│
└─ Emergency Reserve: 10% = 21,000 NTIQ
   ├─ Unexpected costs
   ├─ Legal issues
   └─ Crisis management

ADDITIONALLY:
30% of DAO Treasury → Distributed to stakers (revenue sharing)
= 210,000 × 30% = 63,000 NTIQ to all stakers!
```

#### **C. Operations (20% = 140,000 NTIQ) 🏢**

```
Destination: Operations Wallet (team controlled)
Purpose: Platform sustainability

Usage Allocation:
├─ Team Salaries: 60% = 84,000 NTIQ
│  ├─ Developers
│  ├─ Designers
│  ├─ Community managers
│  └─ Support staff
│
├─ Infrastructure: 25% = 35,000 NTIQ
│  ├─ Server costs
│  ├─ Database hosting
│  ├─ CDN & bandwidth
│  └─ Blockchain RPC nodes
│
└─ Legal & Compliance: 15% = 21,000 NTIQ
   ├─ Legal consultations
   ├─ Regulatory compliance
   ├─ Licenses & permits
   └─ Audits
```

---

## 🎮 REAL-WORLD EXAMPLE

### **Scenario: Platform Aktif Selama 1 Bulan**

```
════════════════════════════════════════════════════════════════════

MONTH 1 ACTIVITY:

Daily Predictions:        1,000 predictions/day
├─ Average stake:         100 NTIQ
├─ Win rate:              45% (mathematical edge for platform)
├─ Platform profit:       55,000 NTIQ/day
└─ Monthly:               1,650,000 NTIQ

Daily Battles:            50 battles/day
├─ Average wager:         500 NTIQ
├─ Platform fee:          2% = 10 NTIQ per battle
├─ Daily fees:            500 NTIQ
└─ Monthly:               15,000 NTIQ

Weekly Tournaments:       4 tournaments/week
├─ Average prize pool:    10,000 NTIQ
├─ Platform fee:          5% = 500 NTIQ
├─ Weekly fees:           2,000 NTIQ
└─ Monthly:               8,000 NTIQ

Withdrawals:              500 withdrawals/month
├─ Average amount:        5,000 NTIQ
├─ Fee:                   0.5% = 25 NTIQ each
└─ Monthly:               12,500 NTIQ

Premium Subscriptions:    100 users
├─ Monthly fee:           500 NTIQ/user
└─ Monthly:               50,000 NTIQ

────────────────────────────────────────────────────────────────

TOTAL MONTHLY FEES: 1,735,500 NTIQ

════════════════════════════════════════════════════════════════════

FEE DISTRIBUTION:

1. BURN (50%):
   └─ 867,750 NTIQ 🔥 DESTROYED FOREVER
      
2. DAO TREASURY (30%):
   └─ 520,650 NTIQ 💰
      ├─ Marketing: 208,260 NTIQ
      ├─ Development: 156,195 NTIQ
      ├─ Bug Bounties: 104,130 NTIQ
      └─ Emergency: 52,065 NTIQ
      
      PLUS: 30% to stakers (156,195 NTIQ)
      
3. OPERATIONS (20%):
   └─ 347,100 NTIQ 🏢
      ├─ Salaries: 208,260 NTIQ
      ├─ Infrastructure: 86,775 NTIQ
      └─ Legal: 52,065 NTIQ

════════════════════════════════════════════════════════════════════

ANNUAL IMPACT:

Monthly Burn: 867,750 NTIQ
Annual Burn: 10,413,000 NTIQ (~1% of total supply)

After 1 year:
├─ Total Supply: 1,000,000,000 → 989,587,000 (-1.04%)
├─ After 5 years: ~950,000,000 (-5%)
├─ After 10 years: ~900,000,000 (-10%)
└─ Deflationary model creates value for all holders! ✅

════════════════════════════════════════════════════════════════════
```

---

## 🏛️ DAO TREASURY USAGE

### **Who Controls It?**
```
DAO Treasury = Community-Controlled Wallet (Multisig)

Control Structure:
├─ Gnosis Safe (5-of-9 multisig)
├─ Signers:
│  ├─ 3 Core team members
│  ├─ 3 Community elected representatives
│  └─ 3 Strategic advisors
│
└─ Governance:
   ├─ vNTIQ holders vote on proposals
   ├─ Example: "Spend 100K NTIQ on marketing campaign"
   ├─ If passed: Multisig executes
   └─ If rejected: Funds stay in treasury
```

### **What Can Treasury Do?**

| Category | Budget Allocation | Examples |
|----------|-------------------|----------|
| **Marketing** | 40% (84K/month) | Influencer partnerships, ads, events |
| **Development** | 30% (63K/month) | New features, integrations, audits |
| **Bug Bounties** | 20% (42K/month) | Security rewards, critical fixes |
| **Emergency** | 10% (21K/month) | Unexpected costs, legal issues |

### **Governance Process:**

```
1. Community Member Creates Proposal
   ├─ "Spend 100,000 NTIQ on influencer campaign"
   ├─ Must have 15,000+ vNTIQ to propose
   └─ Proposal posted on governance forum

2. vNTIQ Holders Vote
   ├─ Voting period: 3 days
   ├─ Quorum required: 10% of vNTIQ
   └─ Pass threshold: >75% approval (treasury decisions)

3. If Approved:
   ├─ Multisig signers execute
   ├─ Treasury sends 100K NTIQ to marketing wallet
   └─ Transaction visible on-chain

4. If Rejected:
   └─ Funds remain in treasury
```

---

## 💎 REVENUE SHARING TO STAKERS

### **Additional Benefit: Real Yield**

**From the DAO Treasury portion (30%), an additional 30% goes to stakers:**

```
DAO Treasury receives: 210,000 NTIQ per month

Distribution:
├─ 70% stays in treasury: 147,000 NTIQ
│  └─ For marketing, dev grants, etc.
│
└─ 30% to stakers: 63,000 NTIQ
   └─ Distributed proportionally to all stakers
```

### **Example Calculation:**

```
Total Staked Globally: 10,000,000 NTIQ
Monthly Revenue to Distribute: 63,000 NTIQ

Alice's Stake:
├─ Amount staked: 100,000 NTIQ
├─ % of total: 100,000 / 10,000,000 = 1%
├─ Monthly share: 63,000 × 1% = 630 NTIQ
├─ Annual share: 630 × 12 = 7,560 NTIQ
└─ APY from revenue: 7,560 / 100,000 = 7.56% 🎉

Bob's Stake (Diamond Tier):
├─ Amount staked: 500,000 NTIQ (Diamond tier)
├─ % of total: 500,000 / 10,000,000 = 5%
├─ Base monthly share: 63,000 × 5% = 3,150 NTIQ
├─ Diamond bonus (10%): 3,150 × 1.10 = 3,465 NTIQ
├─ Annual share: 3,465 × 12 = 41,580 NTIQ
└─ APY from revenue: 41,580 / 500,000 = 8.32% ✨
```

**This is REAL YIELD - not inflation!**

---

## 💻 CODE IMPLEMENTATION

### **Smart Contract Function:**

```solidity
// contracts/NTIQToken.sol (Line 416-430)

/**
 * @dev Process platform fees with automatic distribution
 * @param totalFees Total fees collected
 */
function processPlatformFees(uint256 totalFees) external onlyOwner {
    // Calculate distribution amounts
    uint256 burnAmount = (totalFees * burnFeePercentage) / 100;
    uint256 treasuryAmount = (totalFees * treasuryFeePercentage) / 100;
    uint256 operationsAmount = (totalFees * operationsFeePercentage) / 100;
    
    // 1. Burn tokens (deflationary)
    _burn(address(this), burnAmount);
    totalBurned += burnAmount;
    
    // 2. Send to DAO Treasury
    _transfer(address(this), daoTreasury, treasuryAmount);
    
    // 3. Send to Operations
    _transfer(address(this), operationsWallet, operationsAmount);
    
    emit TokensBurned(address(this), burnAmount);
}
```

### **Breakdown:**

| Variable | Value | Calculation | Result |
|----------|-------|-------------|--------|
| `totalFees` | 700,000 | Input parameter | 700,000 NTIQ |
| `burnAmount` | | 700,000 × 50 / 100 | 350,000 NTIQ |
| `treasuryAmount` | | 700,000 × 30 / 100 | **210,000 NTIQ** |
| `operationsAmount` | | 700,000 × 20 / 100 | 140,000 NTIQ |

---

## 🔗 BACKEND INTEGRATION

### **How Backend Calls This:**

```typescript
// server/services/feeProcessorService.ts (NEW FILE)

import { ethers } from 'ethers';
import { logger } from '../../shared/logger';

export class FeeProcessorService {
  private ntiqToken: any;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, this.provider);
    
    this.ntiqToken = new ethers.Contract(
      process.env.NTIQ_TOKEN_ADDRESS!,
      NTIQTokenABI,
      this.wallet
    );
  }
  
  /**
   * Process fees accumulated in the current period
   */
  async processAccumulatedFees(): Promise<void> {
    try {
      // Get total fees from database
      const totalFees = await this.getTotalFeesFromDB();
      
      if (totalFees === 0n) {
        logger.info("No fees to process");
        return;
      }
      
      logger.info(`Processing ${ethers.formatUnits(totalFees, 18)} NTIQ in fees...`);
      
      // Call smart contract
      const tx = await this.ntiqToken.processPlatformFees(totalFees);
      await tx.wait();
      
      logger.info("✅ Fees processed successfully!");
      logger.info(`   • Burned: ${ethers.formatUnits(totalFees * 50n / 100n, 18)} NTIQ`);
      logger.info(`   • Treasury: ${ethers.formatUnits(totalFees * 30n / 100n, 18)} NTIQ`);
      logger.info(`   • Operations: ${ethers.formatUnits(totalFees * 20n / 100n, 18)} NTIQ`);
      
      // Mark fees as processed in database
      await this.markFeesAsProcessed(totalFees);
      
    } catch (error) {
      logger.error("Error processing fees:", error);
      throw error;
    }
  }
  
  /**
   * Get total unprocessed fees from database
   */
  private async getTotalFeesFromDB(): Promise<bigint> {
    // Query from your database
    const result = await db.query(`
      SELECT SUM(fee_amount) as total
      FROM platform_fees
      WHERE processed = false
    `);
    
    return BigInt(result.rows[0].total || 0);
  }
  
  /**
   * Run automatically every week
   */
  async runWeekly(): Promise<void> {
    logger.info("Running weekly fee processing...");
    await this.processAccumulatedFees();
  }
}

// Initialize and schedule
export const feeProcessor = new FeeProcessorService();

// Run every Monday at 00:00 UTC
import cron from 'node-cron';
cron.schedule('0 0 * * 1', async () => {
  await feeProcessor.runWeekly();
});
```

---

## 📊 MONTHLY IMPACT ANALYSIS

### **Assuming Moderate Activity:**

```
Monthly Fees Collected: 1,735,500 NTIQ

Distribution:
┌─────────────────────────────────────────────────────────────┐
│  🔥 BURN (50%): 867,750 NTIQ                                │
│     Effect: Supply reduced by 0.087% per month              │
│     Annual: ~1% supply reduction                            │
│     Long-term: Significant deflationary pressure            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  💰 DAO TREASURY (30%): 520,650 NTIQ                        │
│     ├─ Marketing: 208,260 NTIQ                              │
│     ├─ Development: 156,195 NTIQ                            │
│     ├─ Bug Bounties: 104,130 NTIQ                           │
│     ├─ Emergency: 52,065 NTIQ                               │
│     └─ To Stakers (30%): 156,195 NTIQ (REAL YIELD!)         │
│                                                              │
│     Governance: vNTIQ holders vote on spending              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🏢 OPERATIONS (20%): 347,100 NTIQ                          │
│     ├─ Team Salaries: 208,260 NTIQ                          │
│     ├─ Infrastructure: 86,775 NTIQ                          │
│     └─ Legal: 52,065 NTIQ                                   │
│                                                              │
│     Purpose: Keep platform running smoothly                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 WHY THIS STRUCTURE?

### **50% Burn:**
- ✅ Creates scarcity (deflationary)
- ✅ Benefits all holders
- ✅ Counteracts token emission from rewards
- ✅ Proven model (BNB, ETH post-merge)

### **30% Treasury:**
- ✅ Community-controlled (decentralized)
- ✅ Funds growth initiatives
- ✅ Revenue sharing to stakers (real yield)
- ✅ Aligns with DAO governance

### **20% Operations:**
- ✅ Ensures platform sustainability
- ✅ Pays team fairly
- ✅ Covers infrastructure costs
- ✅ Professional operations

---

## 🔄 ADJUSTABLE PARAMETERS

### **Can Be Changed by Governance:**

```solidity
// contracts/NTIQToken.sol (Line 490-497)

function updateFeePercentages(
    uint256 _burnFee,
    uint256 _treasuryFee,
    uint256 _operationsFee
) external onlyOwner {
    require(_burnFee + _treasuryFee + _operationsFee == 100, "Must total 100%");
    burnFeePercentage = _burnFee;
    treasuryFeePercentage = _treasuryFee;
    operationsFeePercentage = _operationsFee;
}
```

**Example Scenarios:**

| Scenario | Burn | Treasury | Ops | Rationale |
|----------|------|----------|-----|-----------|
| **Current (Default)** | 50% | 30% | 20% | Balanced approach |
| **Aggressive Deflation** | 70% | 20% | 10% | Bear market, focus on scarcity |
| **Growth Phase** | 30% | 50% | 20% | Bull market, fund expansion |
| **Revenue Sharing Focus** | 40% | 40% | 20% | Reward loyal stakers more |

**Note:** Any change requires governance vote!

---

## 📈 LONG-TERM PROJECTIONS

### **Year 1:**
```
Monthly Fees: 1,735,500 NTIQ
Annual Fees: 20,826,000 NTIQ

Distribution:
├─ Burn: 10,413,000 NTIQ (supply -1.04%)
├─ Treasury: 6,247,800 NTIQ
│  └─ To Stakers: 1,874,340 NTIQ
└─ Operations: 4,165,200 NTIQ
```

### **Year 2 (5x Growth):**
```
Monthly Fees: 8,677,500 NTIQ
Annual Fees: 104,130,000 NTIQ

Distribution:
├─ Burn: 52,065,000 NTIQ (supply -5.2%)
├─ Treasury: 31,239,000 NTIQ
│  └─ To Stakers: 9,371,700 NTIQ
└─ Operations: 20,826,000 NTIQ
```

### **Year 3 (3x Growth):**
```
Monthly Fees: 26,032,500 NTIQ
Annual Fees: 312,390,000 NTIQ

Distribution:
├─ Burn: 156,195,000 NTIQ (supply -15.6%)
├─ Treasury: 93,717,000 NTIQ
│  └─ To Stakers: 28,115,100 NTIQ
└─ Operations: 62,478,000 NTIQ
```

**Cumulative 3-Year Burn: 218,673,000 NTIQ (~22% of supply!)**

---

## 🔐 SECURITY & TRANSPARENCY

### **Transparency Measures:**

1. **All Transactions On-Chain**
   - Every burn, transfer, distribution is public
   - Anyone can verify on Polygonscan
   
2. **Monthly Reports**
   - Treasury balance
   - Burn statistics
   - Revenue distribution
   - Staker rewards

3. **Public Multisig**
   - All signers disclosed
   - Transaction history visible
   - Community can monitor

4. **Automated Auditing**
   - Smart contract events tracked
   - Dashboard shows real-time stats
   - Alerts for unusual activity

---

## 🎯 SUMMARY

### **treasuryFeePercentage = 30% berarti:**

1. **30% dari platform fees** masuk ke **DAO Treasury**
2. **Community controls** penggunaan via governance
3. **30% dari treasury** didistribusikan ke **stakers** (real yield)
4. **Sisanya** untuk marketing, development, bug bounties

### **Benefits:**

| Stakeholder | Benefit |
|-------------|---------|
| **Token Holders** | Deflationary burn increases value |
| **Stakers** | Real yield from revenue sharing |
| **Community** | Control over treasury via governance |
| **Team** | Sustainable operations funding |
| **Platform** | Growth funding from treasury |

### **Why This Works:**

- ✅ **Balanced:** No single party gets too much
- ✅ **Sustainable:** Operations funded, platform can run
- ✅ **Deflationary:** 50% burn creates scarcity
- ✅ **Community-First:** 30% controlled by DAO
- ✅ **Real Yield:** Stakers earn actual revenue, not just inflation

---

**NTIQ has one of the most sophisticated tokenomics in the prediction gaming space!** 🚀

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Prepared By:** NECTIQ Core Team

**Related Documentation:**
- NTIQ_TOKENOMICS_REVISED.md - Full tokenomics overview
- NTIQToken.sol - Smart contract implementation
- TOKEN_DISTRIBUTION_GUIDE.md - Distribution methods

---

*Transparency, Sustainability, and Community-First: The NTIQ Way* 💎

