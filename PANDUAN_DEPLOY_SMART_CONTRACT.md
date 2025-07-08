# 🚀 Panduan Deploy Smart Contract Nectiq di Replit

## 📋 Persiapan Awal

### 1. Setup Wallet dan ETH Testnet

**A. Buat MetaMask Wallet:**
- Install MetaMask browser extension
- Buat wallet baru atau import yang sudah ada
- Simpan private key Anda (HARUS RAHASIA!)

**B. Dapatkan ETH Testnet Gratis:**
- **Holesky Testnet**: https://holesky-faucet.pk910.de/
- **Sepolia Testnet**: https://sepoliafaucet.com/
- Minimal butuh 0.1 ETH untuk deploy

### 2. Setup Environment Variables di Replit

**A. Buka file `.env` di Replit:**
```bash
# Copy private key Anda dari MetaMask (tanpa 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs (sudah ada)
HOLESKY_RPC_URL=https://ethereum-holesky.blockpi.network/v1/rpc/public
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Etherscan API key (optional untuk verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**B. Dapatkan Etherscan API Key (Optional):**
- Daftar di https://etherscan.io/apis
- Ambil API key gratis
- Masukkan ke file `.env`

## 🔧 Deployment Process

### 3. Compile Smart Contracts

**Jalankan di terminal Replit:**
```bash
# Compile semua contracts
npx hardhat compile
```

### 4. Deploy ke Testnet

**A. Deploy ke Holesky Testnet:**
```bash
npx hardhat run scripts/quick-deploy.cjs --network holesky
```

**B. Deploy ke Sepolia Testnet:**
```bash
npx hardhat run scripts/quick-deploy.cjs --network sepolia
```

**Output deployment akan seperti ini:**
```
🚀 Deploying SimpleNTIQ...
✅ SimpleNTIQ deployed to: 0x1234567890abcdef...

🚀 Deploying SimplePriceOracle...
✅ SimplePriceOracle deployed to: 0xabcdef1234567890...

🚀 Deploying SimplePredictionBattle...
✅ SimplePredictionBattle deployed to: 0x9876543210fedcba...

📋 Deployment Summary:
- Network: Holesky (Chain ID: 17000)
- SimpleNTIQ: 0x1234567890abcdef...
- SimplePriceOracle: 0xabcdef1234567890...
- SimplePredictionBattle: 0x9876543210fedcba...
```

### 5. Verify Contracts (Optional)

**Setelah deploy berhasil:**
```bash
# Verify di Etherscan
npx hardhat verify --network holesky CONTRACT_ADDRESS

# Contoh:
npx hardhat verify --network holesky 0x1234567890abcdef...
```

## 📊 Smart Contract Features

### Contract Yang Akan Di-Deploy:

**1. SimpleNTIQ Token (ERC-20)**
- Token utility untuk staking
- Symbol: NTIQ
- Supply: 1 Billion tokens
- Fungsi: mint, burn, transfer

**2. SimplePriceOracle**
- Oracle harga cryptocurrency
- Multi-cryptocurrency support
- Batch price updates

**3. SimplePredictionBattle**
- Kontrak utama untuk prediction battles
- Staking mechanism dengan NTIQ
- Reward system berdasarkan akurasi:
  - Perfect (±0.1%): 5x multiplier
  - High (±1%): 3x multiplier
  - Medium (±5%): 2x multiplier
  - Low (±10%): 1.5x multiplier

## 🔗 Update Frontend Integration

### 6. Update Contract Addresses

**Setelah deploy berhasil, update file `TESTNET_ADDRESSES.md`:**
```typescript
## Holesky Testnet
SimpleNTIQ Token: 0x1234567890abcdef...
SimplePriceOracle: 0xabcdef1234567890...
SimplePredictionBattle: 0x9876543210fedcba...

Deployment Status: Deployed ✅
```

### 7. Test Smart Contract Functions

**Jalankan testing script:**
```bash
# Test semua fungsi smart contract
npx hardhat run scripts/test-interaction.cjs --network holesky
```

## 📱 Frontend Integration

### 8. Connect Frontend ke Smart Contract

**Smart contract akan terintegrasi dengan:**
- Prediction battles dengan staking NTIQ
- Automatic reward calculation
- Real-time price feeds dari oracle
- User balance management

### 9. Admin Functions

**Sebagai admin, Anda bisa:**
- Update harga cryptocurrency di oracle
- Resolve predictions
- Manage tournament rewards
- Monitor all smart contract activities

## 🔒 Security Features

**Smart contracts include:**
- ReentrancyGuard protection
- Ownable admin controls
- Pausable emergency stops
- Input validation
- Authorized price feeders

## 📈 Monitoring & Analytics

**Track performance:**
- Total predictions submitted
- Reward distributions
- User accuracy statistics
- Contract balance monitoring

## 🛠️ Troubleshooting

### Common Issues:

**1. "Insufficient Gas" Error:**
```bash
# Increase gas limit in hardhat.config.cjs
gas: 3000000
```

**2. "Private Key Invalid" Error:**
```bash
# Check .env file format (no 0x prefix)
PRIVATE_KEY=1234567890abcdef... (NOT 0x1234...)
```

**3. "Network Connection Error":**
```bash
# Check RPC URL is accessible
curl https://ethereum-holesky.blockpi.network/v1/rpc/public
```

### Debug Commands:

```bash
# Check contract deployment status
npx hardhat console --network holesky

# View transaction details
npx hardhat run scripts/debug.js --network holesky
```

## 🎯 Next Steps After Deployment

1. **Test All Functions**: Submit predictions, resolve them, claim rewards
2. **Frontend Integration**: Connect deployed contracts to frontend
3. **User Testing**: Invite users to test with testnet tokens
4. **Production Ready**: Deploy to mainnet when ready

## 💡 Tips untuk Sukses

- **Backup Private Key**: Simpan di tempat aman
- **Test Extensively**: Gunakan testnet dulu sebelum mainnet
- **Monitor Gas Costs**: Optimasi untuk efisiensi
- **Security First**: Audit smart contract sebelum production
- **User Experience**: Pastikan frontend mudah digunakan

---

## 🚀 Ready to Deploy?

Setelah semua persiapan selesai, jalankan perintah berikut:

```bash
# 1. Compile contracts
npx hardhat compile

# 2. Deploy to testnet
npx hardhat run scripts/quick-deploy.cjs --network holesky

# 3. Test functionality
npx hardhat run scripts/test-interaction.cjs --network holesky

# 4. Update addresses and go live!
```

**Selamat! Smart contract Nectiq Anda siap beroperasi! 🎉**