# 💰 **SUMBER REWARD DAN ALUR KETIKA USER KALAH**

## 📋 **OVERVIEW**

Mari saya jelaskan dari mana reward diambil ketika user menang dan kemana stake disimpan ketika user kalah di sistem Nectiq.

---

## 🏆 **KETIKA USER MENANG - DARI MANA REWARD DIAMBIL?**

### **1. Sumber Reward Utama** 💎

**Reward diambil dari 2 sumber:**

#### **A. Stake User Sendiri (Principal + Multiplier)** 🎯
```solidity
// PredictionStaking.sol - releaseReward function
function releaseReward(bytes32 predictionId, uint256 actualPrice) external {
    // Calculate reward berdasarkan akurasi
    uint256 multiplierBasisPoints = _getAccuracyMultiplier(accuracy);
    
    // Base reward = stake amount × multiplier
    uint256 baseReward = (stake.amount * multiplierBasisPoints) / BASIS_POINTS;
    
    // Gross reward = base reward × duration multiplier
    uint256 grossReward = (baseReward * stake.durationMultiplier) / BASIS_POINTS;
    
    // Transfer reward ke user (dari contract balance)
    ntiqToken.safeTransfer(stake.user, netReward);
}
```

**Contoh Perhitungan:**
```
User Stake: 100 NTIQ
Akurasi: 98% → Multiplier: 1.5x
Duration: 24h → Duration Multiplier: 2.0x

Base Reward = 100 × 1.5 = 150 NTIQ
Gross Reward = 150 × 2.0 = 300 NTIQ
Platform Fee (4%) = 300 × 0.04 = 12 NTIQ
Net Reward = 300 - 12 = 288 NTIQ

User menerima: 288 NTIQ (dari 100 NTIQ stake mereka)
```

#### **B. Platform Fee dari User yang Kalah** 💸
```solidity
// Platform fee dari winning predictions
if (multiplierBasisPoints >= 1500) { // 1.5x atau lebih
    platformFee = (grossReward * PLATFORM_FEE_RATE) / BASIS_POINTS;
    netReward = grossReward - platformFee;
    
    // Fee dikirim ke treasury
    ntiqToken.safeTransfer(treasury, platformFee);
}
```

### **2. Reward Distribution System** 📊

**Reward tidak diambil dari "pool terpisah" tapi dari:**

1. **Contract Balance:** Semua stake yang di-lock di contract
2. **Treasury Funds:** Platform fees yang terkumpul
3. **Deflationary Mechanics:** Burned tokens yang mengurangi supply

---

## 💸 **KETIKA USER KALAH - KEMANA STAKE DISIMPAN?**

### **1. Stake User yang Kalah** ❌

```solidity
// PredictionStaking.sol - forfeitStake function
function forfeitStake(bytes32 predictionId) external onlyOwner {
    PredictionStake storage stake = stakes[predictionId];
    
    // Mark as forfeited
    stake.forfeited = true;
    
    // Transfer SELURUH stake ke treasury
    ntiqToken.safeTransfer(treasury, stake.amount);
    totalFeesCollected += stake.amount;
    
    emit StakeForfeited(predictionId, stake.user, stake.amount);
}
```

**Alur Stake yang Kalah:**
```
User Kalah (Akurasi < 90%)
    ↓
Stake 100% → Treasury Address
    ↓
Treasury menerima: 100 NTIQ (dari user yang kalah)
```

### **2. Treasury Address** 🏦

**Treasury adalah wallet khusus yang menerima:**
- ✅ **100% stake dari user yang kalah**
- ✅ **Platform fees dari user yang menang**
- ✅ **Fees dari battle, tournament, dll**

**Treasury Address:**
```solidity
// Di constructor PredictionStaking.sol
constructor(
    address _ntiqToken,
    address _treasury,  // ← Ini adalah treasury address
    address _oracle
) {
    treasury = _treasury;
}
```

### **3. Treasury Fund Distribution** 💰

**Dari Treasury, funds didistribusikan ke:**

```solidity
// NTIQToken.sol - processPlatformFees function
function processPlatformFees(uint256 totalFees) external onlyOwner {
    uint256 burnAmount = (totalFees * 50) / 100;        // 50% BURN
    uint256 treasuryAmount = (totalFees * 30) / 100;    // 30% DAO TREASURY
    uint256 operationsAmount = (totalFees * 20) / 100;  // 20% OPERATIONS
    
    // 1. Burn tokens (deflationary)
    _burn(address(this), burnAmount);
    
    // 2. Send to DAO Treasury (community controlled)
    _transfer(address(this), daoTreasury, treasuryAmount);
    
    // 3. Send to Operations (team salaries & infrastructure)
    _transfer(address(this), operationsWallet, operationsAmount);
}
```

---

## 🔄 **COMPLETE FLOW DIAGRAM**

### **Scenario 1: User Menang** 🏆

```
User A: Stake 100 NTIQ → Akurasi 98% → Reward 288 NTIQ
User B: Stake 100 NTIQ → Akurasi 85% → KALAH

Flow:
1. User A stake 100 NTIQ → Contract
2. User B stake 100 NTIQ → Contract
3. Prediction selesai:
   - User A: 288 NTIQ reward (dari contract balance)
   - User B: 0 NTIQ (stake 100% ke treasury)
   - Platform fee: 12 NTIQ (dari User A reward) → Treasury

Treasury menerima: 100 NTIQ (User B) + 12 NTIQ (Platform fee) = 112 NTIQ
```

### **Scenario 2: User Kalah** ❌

```
User A: Stake 100 NTIQ → Akurasi 85% → KALAH
User B: Stake 100 NTIQ → Akurasi 87% → KALAH

Flow:
1. User A stake 100 NTIQ → Contract
2. User B stake 100 NTIQ → Contract
3. Prediction selesai:
   - User A: 0 NTIQ (stake 100% ke treasury)
   - User B: 0 NTIQ (stake 100% ke treasury)

Treasury menerima: 100 NTIQ (User A) + 100 NTIQ (User B) = 200 NTIQ
```

---

## 📊 **REWARD CALCULATION EXAMPLES**

### **Example 1: Perfect Prediction** 🎯
```
User Stake: 100 NTIQ
Akurasi: 99.8% (Perfect)
Duration: 7 days

Calculation:
- Accuracy Multiplier: 2.0x (Perfect)
- Duration Multiplier: 3.0x (7 days)
- Base Reward: 100 × 2.0 = 200 NTIQ
- Gross Reward: 200 × 3.0 = 600 NTIQ
- Platform Fee: 600 × 0.04 = 24 NTIQ
- Net Reward: 600 - 24 = 576 NTIQ

User menerima: 576 NTIQ
Treasury menerima: 24 NTIQ
```

### **Example 2: Good Prediction** ✅
```
User Stake: 100 NTIQ
Akurasi: 95% (Good)
Duration: 24 hours

Calculation:
- Accuracy Multiplier: 1.25x (Good)
- Duration Multiplier: 2.0x (24h)
- Base Reward: 100 × 1.25 = 125 NTIQ
- Gross Reward: 125 × 2.0 = 250 NTIQ
- Platform Fee: 250 × 0.04 = 10 NTIQ
- Net Reward: 250 - 10 = 240 NTIQ

User menerima: 240 NTIQ
Treasury menerima: 10 NTIQ
```

### **Example 3: Losing Prediction** ❌
```
User Stake: 100 NTIQ
Akurasi: 85% (Losing)

Calculation:
- Accuracy < 90% → No reward
- Stake 100% → Treasury

User menerima: 0 NTIQ
Treasury menerima: 100 NTIQ
```

---

## 🏦 **TREASURY FUND MANAGEMENT**

### **Treasury Menerima dari:**

1. **Prediction Losses:** 100% stake dari user yang kalah
2. **Platform Fees:** 4% dari reward user yang menang
3. **Battle Fees:** 3.5% dari total battle pool
4. **Tournament Fees:** 5% dari entry fees
5. **Withdrawal Fees:** 0.5% dari withdrawal amount

### **Treasury Distribusi:**

```
100% Treasury Funds
├─ 50% → TOKEN BURN 🔥 (deflationary mechanism)
├─ 30% → DAO TREASURY 💰 (community governance)
└─ 20% → OPERATIONS 🏢 (team & infrastructure)
```

---

## 🔒 **SECURITY & TRANSPARENCY**

### **Smart Contract Security:**
- ✅ **ReentrancyGuard:** Mencegah reentrancy attacks
- ✅ **Ownable:** Hanya owner yang bisa release/forfeit
- ✅ **Pausable:** Contract bisa di-pause jika ada masalah
- ✅ **SafeERC20:** Safe token transfers

### **Transparency:**
- ✅ **All transactions** visible di blockchain
- ✅ **Treasury address** public dan auditable
- ✅ **Fee calculations** transparent di smart contract
- ✅ **Event logs** untuk tracking semua transaksi

---

## 🎯 **SUMMARY**

### **Ketika User Menang:** 🏆
- **Reward diambil dari:** Contract balance (stake user + multiplier)
- **Platform fee:** 4% dari gross reward → Treasury
- **User menerima:** Net reward setelah dikurangi platform fee

### **Ketika User Kalah:** ❌
- **Stake 100%** → Treasury address
- **Treasury menerima:** Seluruh stake amount
- **User menerima:** 0 NTIQ

### **Treasury Management:** 🏦
- **Menerima:** Semua stake yang kalah + platform fees
- **Distribusi:** 50% burn, 30% DAO, 20% operations
- **Transparency:** Semua transaksi visible di blockchain

**Sistem ini memastikan sustainability platform dengan deflationary mechanics dan community governance!** 💎
