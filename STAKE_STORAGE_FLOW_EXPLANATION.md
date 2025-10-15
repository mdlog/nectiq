# 🏦 **ALUR PENYIMPANAN STAKE USER SAAT MAKE PREDICTION**

## 📋 **OVERVIEW**

Ketika user melakukan **Make Prediction** di platform Nectiq, stake NTIQ mereka disimpan di **Smart Contract** di blockchain Polygon Amoy, bukan di database. Berikut adalah alur lengkapnya:

---

## 🔄 **ALUR PENYIMPANAN STAKE**

### **1. USER INTERACTION (Frontend)** 🖥️
```
User Dashboard → Click "Make Prediction" → PredictionBlockchainForm
```

**Proses:**
- User mengisi form prediction (cryptocurrency, timeframe, predicted price, stake amount)
- User klik "Submit Prediction"
- Frontend menggunakan `wagmi` hooks untuk interaksi blockchain

### **2. BLOCKCHAIN TRANSACTION (Smart Contract)** ⛓️
```
User Wallet → MetaMask Popup → Smart Contract Interaction
```

**Smart Contract yang Digunakan:**
- **Contract:** `EnhancedPredictionStaking.sol`
- **Address:** `0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3`
- **Function:** `lockStake(predictionId, amount, duration, predictedPrice)`

**Proses di Smart Contract:**
```solidity
function lockStake(
    bytes32 predictionId,
    uint256 amount,
    uint256 duration,
    uint256 predictedPrice
) external nonReentrant whenNotPaused returns (bool) {
    // 1. Validasi input
    require(amount >= MIN_STAKE, "Stake below minimum");
    require(amount <= MAX_STAKE, "Stake above maximum");
    
    // 2. Transfer NTIQ dari user ke contract
    ntiqToken.safeTransferFrom(msg.sender, address(this), amount);
    
    // 3. Simpan stake info
    stakes[predictionId] = PredictionStake({
        user: msg.sender,
        amount: amount,
        timestamp: block.timestamp,
        duration: duration,
        predictedPrice: predictedPrice,
        // ... other fields
    });
    
    // 4. Update total staked
    userTotalStaked[msg.sender] += amount;
    totalStaked += amount;
    
    // 5. Emit event
    emit StakeLocked(predictionId, msg.sender, amount, block.timestamp);
}
```

### **3. STAKE STORAGE LOCATION** 🏦

**Stake disimpan di:**
- **Smart Contract:** `EnhancedPredictionStaking.sol`
- **Mapping:** `stakes[bytes32 predictionId]`
- **Structure:** `PredictionStake` struct

**Data yang Disimpan:**
```solidity
struct PredictionStake {
    address user;           // Alamat wallet user
    uint256 amount;         // Jumlah NTIQ yang di-stake
    uint256 timestamp;      // Waktu stake
    uint256 duration;       // Durasi prediction (1h, 6h, 24h, 7d)
    uint256 predictedPrice; // Harga yang diprediksi
    uint256 actualPrice;    // Harga aktual (diisi saat release)
    uint256 accuracy;       // Akurasi prediction (basis points)
    bool released;          // Apakah reward sudah di-release
    bool forfeited;         // Apakah stake di-forfeit
    uint256 rewardAmount;   // Jumlah reward yang diterima
    uint256 durationMultiplier; // Multiplier berdasarkan durasi
}
```

### **4. DATABASE RECORD (Backend)** 💾
```
Blockchain Transaction → Backend API → Database
```

**Endpoint:** `/api/predictions/blockchain`

**Proses:**
1. Frontend mengirim data prediction ke backend setelah blockchain transaction berhasil
2. Backend menyimpan record prediction di database
3. Database hanya menyimpan metadata, bukan stake amount

**Database Schema:**
```sql
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    cryptocurrency VARCHAR(50),
    timeframe VARCHAR(10),
    predicted_price DECIMAL(20,8),
    stake_amount DECIMAL(20,8),
    target_time TIMESTAMP,
    blockchain_stake_hash VARCHAR(66), -- Transaction hash dari blockchain
    blockchain_status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 **DETAILED FLOW**

### **Step 1: Frontend Preparation** 🖥️
```typescript
// PredictionBlockchainForm.tsx
const handlePredictionSubmit = async (data: PredictionFormData) => {
    // 1. Check NTIQ balance
    const ntiqBalance = await readContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS.NTIQToken,
        functionName: 'balanceOf',
        args: [address!],
    });
    
    // 2. Check allowance
    const allowance = await readContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS.NTIQToken,
        functionName: 'allowance',
        args: [address!, CONTRACTS.ENHANCED_PREDICTION_STAKING],
    });
    
    // 3. Approve if needed
    if (allowance < stakeAmount) {
        await writeContract({
            address: CONTRACTS.NTIQ_TOKEN,
            abi: CONTRACTS.ABIS.NTIQToken,
            functionName: 'approve',
            args: [CONTRACTS.ENHANCED_PREDICTION_STAKING, stakeAmountWei],
        });
    }
    
    // 4. Lock stake
    await writeContract({
        address: CONTRACTS.ENHANCED_PREDICTION_STAKING,
        abi: CONTRACTS.ABIS.ENHANCED_PREDICTION_STAKING,
        functionName: 'lockStake',
        args: [predictionId, stakeAmountWei, duration, predictedPriceWei],
    });
};
```

### **Step 2: Smart Contract Execution** ⛓️
```solidity
// EnhancedPredictionStaking.sol
function lockStake(...) external {
    // 1. Transfer NTIQ dari user ke contract
    ntiqToken.safeTransferFrom(msg.sender, address(this), amount);
    
    // 2. Simpan di mapping stakes[predictionId]
    stakes[predictionId] = PredictionStake({...});
    
    // 3. Update global counters
    userTotalStaked[msg.sender] += amount;
    totalStaked += amount;
}
```

### **Step 3: Backend Recording** 💾
```typescript
// server/routes.ts
app.post("/api/predictions/blockchain", async (req, res) => {
    const { blockchainTxHash, stakeAmount, ... } = req.body;
    
    // 1. Simpan prediction di database
    const prediction = await storage.createPrediction({
        userId,
        cryptocurrency,
        timeframe,
        predictedPrice,
        stakeAmount,
        targetTime
    });
    
    // 2. Update dengan blockchain transaction hash
    await db.update(predictions)
        .set({
            blockchainStakeHash: blockchainTxHash,
            blockchainStatus: 'confirmed'
        })
        .where(eq(predictions.id, prediction.id));
});
```

---

## 🏦 **STAKE STORAGE LOCATIONS**

### **1. Smart Contract Storage** ⛓️
- **Location:** `EnhancedPredictionStaking.sol` contract
- **Address:** `0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3`
- **Network:** Polygon Amoy Testnet
- **Storage:** `mapping(bytes32 => PredictionStake) public stakes`
- **Security:** Immutable, decentralized, transparent

### **2. Database Metadata** 💾
- **Location:** PostgreSQL database
- **Table:** `predictions`
- **Purpose:** Metadata dan tracking
- **Security:** Centralized, but stake amount is not stored here

### **3. User Wallet** 👛
- **Before Stake:** NTIQ tokens di user wallet
- **After Stake:** NTIQ tokens transferred ke smart contract
- **During Stake:** User tidak bisa menggunakan NTIQ yang di-stake

---

## 🔒 **SECURITY FEATURES**

### **Smart Contract Security** 🛡️
- **ReentrancyGuard:** Mencegah reentrancy attacks
- **Ownable:** Hanya owner yang bisa release rewards
- **Pausable:** Contract bisa di-pause jika ada masalah
- **SafeERC20:** Safe token transfers

### **Access Control** 🔐
- **User Approval:** User harus approve contract untuk spend NTIQ
- **Minimum/Maximum Stake:** 50-10,000 NTIQ limits
- **Duration Validation:** Hanya durasi yang valid (1h, 6h, 24h, 7d)

---

## 📊 **STAKE TRACKING**

### **User dapat melihat stake mereka di:**

1. **Smart Contract Functions:**
   ```solidity
   function getUserTotalStaked(address user) public view returns (uint256)
   function getStake(bytes32 predictionId) public view returns (PredictionStake memory)
   ```

2. **Frontend Components:**
   - Dashboard balance (real-time dari blockchain)
   - Active Predictions list
   - Transaction history

3. **Blockchain Explorers:**
   - PolygonScan Amoy: `https://amoy.polygonscan.com/`
   - Contract address: `0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3`

---

## 🎯 **SUMMARY**

**Ketika user melakukan Make Prediction:**

1. **Stake NTIQ** disimpan di **Smart Contract** di blockchain Polygon Amoy
2. **Database** hanya menyimpan metadata dan transaction hash
3. **User wallet** kehilangan NTIQ yang di-stake (transferred ke contract)
4. **Stake** tetap aman di smart contract sampai prediction selesai
5. **Reward** akan dikirim kembali ke user wallet jika prediction benar

**Keuntungan sistem ini:**
- ✅ **Decentralized:** Stake tidak dikontrol oleh server
- ✅ **Transparent:** Semua transaksi bisa dilihat di blockchain
- ✅ **Secure:** Smart contract dengan security features
- ✅ **Trustless:** User tidak perlu percaya pada server

**Stake user disimpan di Smart Contract, bukan database!** 🏦⛓️
