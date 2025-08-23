# 🎯 Panduan Lengkap Fitur Prediksi Nectiq
*Updated: Agustus 2025 - Sesuai dengan Implementasi Sistem Aktual*

## 📖 Daftar Isi
1. [Regular Prediction](#regular-prediction)
2. [Battle](#battle)  
3. [TrendRide (Parlay)](#trendride-parlay)
4. [Survival](#survival)
5. [Sistem Reward & Platform Fees](#sistem-reward)
6. [Tips & Strategi](#tips--strategi)
7. [System Updates](#system-updates)

---

## 🔮 Regular Prediction

### Penjelasan
Regular Prediction adalah fitur prediksi standar di mana Anda menebak harga cryptocurrency di masa depan. Anda dapat memilih berbagai mata uang kripto dan jangka waktu prediksi.

### Cara Bermain
1. **Pilih Cryptocurrency**: Bitcoin, Ethereum, BNB, Cardano, Solana, Dogecoin, Ripple, Avalanche
2. **Pilih Timeframe**: 
   - 1 Jam (paling cepat)
   - 6 Jam 
   - 24 Jam (1 hari)
   - 7 Hari (1 minggu)
3. **Masukkan Prediksi Harga**: Berapa harga yang Anda prediksi
4. **Konfirmasi Prediksi**: Tunggu sampai waktu berakhir

### Sistem Penilaian (NEW SYSTEM 2025)
- **Perfect (≥99.5%)**: 3.0x multiplier - Prediksi sangat akurat
- **Excellent (≥98%)**: 2.0x multiplier - Prediksi sangat baik  
- **Great (≥95%)**: 1.5x multiplier - Prediksi baik
- **Good (≥90%)**: 0.9x multiplier - Prediksi cukup (user rugi 10%)
- **Poor (<90%)**: 0x multiplier - Stake hangus total

### Platform Fee
- **4%** dari reward untuk winning predictions (multiplier ≥1.5x)
- Tidak ada fee untuk losing predictions

### Formula Perhitungan Akurasi
```
Accuracy = (1 - |Predicted Price - Actual Price| / Actual Price) × 100%
```

### Contoh Reward Regular Prediction
```
Cryptocurrency: Bitcoin (BTC)
Stake: 1000 NTIQ
Harga Saat Ini: $114,850
Prediksi Anda: $115,000
Hasil Aktual: $114,950

Perhitungan Akurasi:
- Selisih: |115,000 - 114,950| = $50
- Akurasi: (1 - 50/114,950) × 100% = 99.956%

💰 REWARD CALCULATION:
Accuracy: 99.956% → 3.0x multiplier (≥99.5%)
Gross Reward: 1000 × 3.0 = 3000 NTIQ
Platform Fee (4%): 3000 × 0.04 = 120 NTIQ
Net Reward: 3000 - 120 = 2880 NTIQ
Net Profit: 2880 - 1000 = 1880 NTIQ

CONTOH GOOD PREDICTION (User Rugi):
Accuracy: 91.5% → 0.9x multiplier (≥90%)
Net Reward: 1000 × 0.9 = 900 NTIQ
User Loss: 100 NTIQ (Platform Fee: tidak ada)

CONTOH POOR PREDICTION (Stake Hangus):
Accuracy: 85% → 0x multiplier (<90%)
Net Reward: 0 NTIQ (Stake hangus total ke platform)

⚠️ NOTE: Time multipliers belum diimplementasikan dalam sistem saat ini
```

---

## ⚔️ Battle

### Penjelasan
Battle adalah kompetisi head-to-head antara dua pemain. Anda menantang pemain lain atau menerima tantangan untuk memprediksi harga cryptocurrency yang sama dalam timeframe yang sama.

### Cara Bermain
1. **Buat Battle Baru** atau **Terima Tantangan**
2. **Pilih Cryptocurrency & Timeframe** (sama untuk kedua pemain)
3. **Masukkan Prediksi Harga** secara bersamaan
4. **Tunggu Hasil**: Pemain dengan prediksi paling akurat menang

### Aturan Battle
- **Entry Fee**: Setiap pemain bayar entry fee yang sama
- **Winner Takes All**: Pemenang dapat total pool prize
- **Tie Breaker**: Jika akurasi sama, pembagian hadiah 50:50
- **Time Limit**: Battle otomatis batal jika tidak ada lawan dalam 30 menit

### Sistem Reward Battle (IMPLEMENTASI AKTUAL)
```
Formula: Winner Reward = Total Pool × Accuracy Multiplier
Platform Fee: 0% (Tidak ada fee untuk battles)
```

### Contoh Reward Battle
```
BATTLE: Player A vs Player B
Cryptocurrency: Ethereum (ETH)
Timeframe: 6 Jam
Entry Fee: 500 NTIQ per pemain
Total Pool: 1000 NTIQ

Harga Saat Mulai: $3,420
Player A Prediksi: $3,450
Player B Prediksi: $3,380
Hasil Aktual: $3,435

Perhitungan Akurasi:
Player A: (1 - |3450-3435|/3435) × 100% = 99.56%
Player B: (1 - |3380-3435|/3435) × 100% = 98.40%

🏆 PEMENANG: Player A (lebih akurat)
💰 REWARD CALCULATION:
Accuracy Multiplier: 99.56% → 3.0x (≥99.5%)
Player A Reward: 500 × 2 × 3.0 = 3000 NTIQ*
Player B: 0 NTIQ (kalah)

*Reward bisa melebihi pool karena accuracy multiplier bonus
Platform Fee: 0% (Battles bebas fee)

⚠️ NOTE: Sistem accuracy multiplier untuk battles sama 
dengan regular predictions untuk konsistensi reward
```

---

## 🎲 TrendRide (Parlay)

### Penjelasan
TrendRide adalah prediksi UP/DOWN dengan system multiplier exponential. Anda dapat memilih multiple cryptocurrencies dan semua prediksi harus benar untuk menang. Semakin banyak prediksi yang dipilih, semakin tinggi multiplier dan risk.

### Cara Bermain
1. **Pilih Multiple Cryptocurrencies** (1-5 coins)
2. **Pilih Timeframe** (sama untuk semua coins)
3. **Pilih Arah**: UP (Naik) atau DOWN (Turun) untuk setiap coin
4. **Tentukan Stake**: Jumlah NTIQ yang ingin dipertaruhkan
5. **Konfirmasi**: Tunggu hasil - SEMUA prediksi harus benar

### Multiplier TrendRide (SISTEM AKTUAL 2025)
- **1 Jam**: 1.2x base multiplier
- **6 Jam**: 1.5x base multiplier  
- **24 Jam**: 2.0x base multiplier
- **7 Hari**: 3.0x base multiplier

### Formula Perhitungan
```
Total Multiplier = (1.5 × Duration Multiplier)^Number_of_Predictions
```

### Platform Fee
- **6%** dari gross reward untuk semua winning TrendRide predictions

### Contoh Reward TrendRide
```
TRENDRIDE PREDICTION (Single Coin)
Cryptocurrency: Bitcoin (BTC)
Timeframe: 24 Jam
Stake: 500 NTIQ
Prediksi: UP (Naik)
Number of Predictions: 1

Harga Saat Mulai: $114,850
Harga Setelah 24 Jam: $115,200

✅ HASIL: MENANG (Harga naik dari $114,850 ke $115,200)

💰 REWARD CALCULATION:
Duration Multiplier: 2.0x (24 jam)
Total Multiplier: (1.5 × 2.0)^1 = 3.0x
Gross Reward: 500 × 3.0 = 1500 NTIQ
Platform Fee (6%): 1500 × 0.06 = 90 NTIQ
Net Reward: 1500 - 90 = 1410 NTIQ
Net Profit: 1410 - 500 = 910 NTIQ

CONTOH MULTI-PREDICTION (High Risk, High Reward):
Jika Anda pilih 3 coins (BTC + ETH + SOL), 7 hari:
Total Multiplier: (1.5 × 3.0)^3 = 91.125x
Gross Reward: 100 × 91.125 = 9112.5 NTIQ
Platform Fee (6%): 546.75 NTIQ
Net Reward: 8565.75 NTIQ

❌ Jika KALAH (minimal 1 prediksi salah):
Anda kehilangan stake sepenuhnya: -100 NTIQ
⚠️ RISK: Semua prediksi harus benar untuk menang!
```

---

## 🏆 Survival

### Penjelasan
Survival adalah turnamen eliminasi di mana pemain harus membuat prediksi yang benar secara berturut-turut. Setiap putaran yang salah akan mengeliminasi pemain. Semakin lama bertahan, semakin besar hadiah.

### Cara Bermain
1. **Daftar Tournament**: Bayar entry fee untuk bergabung
2. **Round 1**: Semua pemain buat prediksi untuk crypto/timeframe yang sama
3. **Eliminasi**: Pemain dengan prediksi terburuk dieliminasi
4. **Round Berikutnya**: Ulangi sampai tersisa 1 pemenang
5. **Final Prize**: Pemenang dapat total prize pool

### Struktur Tournament
- **Entry Fee**: 25-100 NTIQ (tergantung level tournament)
- **Min Players**: 8 pemain
- **Max Players**: 64 pemain
- **Rounds**: Log₂(players) rounds
- **Elimination**: 50% pemain terburuk setiap round

### Contoh Reward Survival
```
SURVIVAL TOURNAMENT - "Weekend Crypto Challenge"
Entry Fee: 50 NTIQ
Total Players: 32 pemain
Total Prize Pool: 32 × 50 = 1,600 NTIQ

STRUCTURE:
Round 1: 32 → 16 players (16 eliminated)
Round 2: 16 → 8 players (8 eliminated)  
Round 3: 8 → 4 players (4 eliminated)
Round 4: 4 → 2 players (2 eliminated)
Round 5: 2 → 1 WINNER (1 eliminated)

💰 PRIZE DISTRIBUTION:
🥇 1st Place: 800 NTIQ (50% of pool)
🥈 2nd Place: 320 NTIQ (20% of pool)
🥉 3rd-4th Place: 160 NTIQ each (10% each)
🏅 5th-8th Place: 40 NTIQ each (2.5% each)

EXAMPLE PLAYER JOURNEY:
Round 1: Predict Bitcoin 1h → Survived (rank 8/32)
Round 2: Predict Ethereum 6h → Survived (rank 4/16)
Round 3: Predict BNB 24h → Survived (rank 2/8)
Round 4: Predict Solana 1h → Survived (rank 1/4)
Round 5: Predict Cardano 6h → WON!

🏆 TOTAL EARNED: 800 NTIQ
📈 ROI: 1,500% (800/50 = 16x return)
```

---

## 💰 Sistem Reward

### Base Rewards (SISTEM AKTUAL 2025)
- **Regular Prediction**: Stake × Accuracy Multiplier (setelah fee 4%)
- **Battle Win**: Stake × 2 × Accuracy Multiplier (0% fee)
- **TrendRide**: Stake × Total Multiplier (setelah fee 6%)
- **Survival**: Berdasarkan posisi final (0% fee tambahan)

### Platform Fee Structure
- **Regular Predictions**: 4% dari winning rewards
- **TrendRide**: 6% dari gross reward
- **Battles**: 0% (Bebas fee)
- **Survival**: 0% (Hanya entry fee)
- **Withdrawals**: 2.5% (otomatis)

### Accuracy Multiplier (SISTEM BARU)
- **Perfect (≥99.5%)**: 3.0x multiplier
- **Excellent (≥98%)**: 2.0x multiplier  
- **Great (≥95%)**: 1.5x multiplier
- **Good (≥90%)**: 0.9x multiplier (user rugi 10%)
- **Poor (<90%)**: 0x multiplier (stake hangus)

### Time Multiplier
⚠️ **BELUM DIIMPLEMENTASIKAN**: Time multiplier untuk regular predictions 
masih dalam tahap pengembangan dan belum tersedia di sistem saat ini.

### Achievement Rewards
- **Perfect Prediction**: +100 NTIQ bonus
- **Win Streak 5**: +50 NTIQ bonus
- **Win Streak 10**: +150 NTIQ bonus
- **Daily Challenge**: +25 NTIQ bonus
- **Weekly Champion**: +500 NTIQ bonus

### Contoh Reward Maksimal (SISTEM AKTUAL)
```
SCENARIO: Perfect Regular Prediction
Stake: 2000 NTIQ
Accuracy: 99.8% (Perfect category)
Multiplier: 3.0x

CALCULATION:
Gross Reward: 2000 × 3.0 = 6000 NTIQ
Platform Fee (4%): 6000 × 0.04 = 240 NTIQ
Net Reward: 6000 - 240 = 5760 NTIQ
Net Profit: 5760 - 2000 = 3760 NTIQ

💵 VALUE: 5760 NTIQ = $57.60 USD

TRENDRIDE MAKSIMAL (Extreme Risk):
Stake: 200 NTIQ, 5 Coins, 7 hari
Total Multiplier: (1.5 × 3.0)^5 = 1,845.28x
Gross Reward: 200 × 1,845.28 = 369,056 NTIQ
Platform Fee (6%): 22,143 NTIQ
Net Reward: 346,913 NTIQ
Net Profit: 346,713 NTIQ

💵 VALUE: 346,913 NTIQ = $3,469.13 USD

⚠️ EXTREME RISK: 5 predictions semua harus benar!
Probabilitas menang: sangat rendah (1 in 32 jika 50/50 odds)
Rekomendasi: Mulai dengan 1-2 predictions untuk risk management
```

---

## 🎯 Tips & Strategi

### Regular Prediction
1. **Analisis Trend**: Pelajari pola harga historical
2. **News Impact**: Perhatikan berita crypto terkini
3. **Timeframe Strategy**: Mulai dengan timeframe pendek untuk belajar
4. **Risk Management**: Jangan prediksi terlalu ekstrem

### Battle
1. **Choose Opponents Wisely**: Pilih lawan yang skill levelnya seimbang
2. **Quick Decision**: Buat keputusan cepat untuk tidak kehilangan momentum
3. **Psychology**: Jangan terpancing emosi jika kalah

### Parlay
1. **Conservative Approach**: Mulai dengan stake kecil
2. **Trend Following**: Ikuti trend yang kuat untuk timeframe pendek
3. **Diversification**: Jangan all-in pada satu prediksi

### Survival
1. **Consistency Over Accuracy**: Fokus konsisten daripada perfect
2. **Study Others**: Pelajari pola prediksi pemain lain
3. **Stamina Management**: Siapkan mental untuk tournament panjang
4. **Risk Assessment**: Seimbangkan antara safety dan aggression

### General Tips
- **Start Small**: Mulai dengan investasi kecil
- **Learn Continuously**: Selalu belajar dari hasil prediksi
- **Track Performance**: Catat statistik personal Anda
- **Community**: Bergabung dengan diskusi komunitas
- **Patience**: Crypto market volatile, butuh kesabaran

---

## 📊 Conversion Rate
**1 NTIQ = $0.01 USD**

Semua reward dapat di-withdraw ke wallet crypto Anda atau digunakan untuk prediksi selanjutnya.

---

## 🔄 System Updates

### Agustus 2025 - Major System Overhaul
- ✅ **Regular Predictions**: New accuracy-based multiplier system implemented
- ✅ **Platform Fees**: Transparent fee structure (4% regular, 6% TrendRide)
- ✅ **TrendRide Formula**: Exponential multiplier system for multi-predictions
- ✅ **Battle System**: Enhanced reward calculation with accuracy multipliers
- ⚠️ **Time Multipliers**: Currently under development for regular predictions

### Known Issues
- Time multiplier for regular predictions not yet implemented
- Achievement system being redesigned
- Win streak bonuses under review

### Upcoming Features
- Time-based multipliers for regular predictions
- Enhanced achievement rewards
- Tournament brackets system expansion
- Referral bonus integration

---

*Dokumen ini diupdate secara berkala untuk mencerminkan sistem aktual platform Nectiq. Terakhir diupdate: Agustus 23, 2025*

---

## 🔗 Multi-Chain Support

### Supported Blockchains untuk Deposit/Withdrawal:
- **Mainnet**: Ethereum, Base, BSC, Optimism, Arbitrum
- **Testnet**: Sepolia, Holesky

### Supported Tokens:
- **ETH** (Native Ethereum)
- **USDC** (USD Coin)
- **USDT** (Tether USD)

### Withdrawal Fees:
- **Semua Networks**: 2.5% otomatis dari jumlah withdrawal
- **Minimum Withdrawal**: Varies by network and token
- **Processing Time**: 5-30 menit (tergantung blockchain congestion)

*Fitur multi-chain memungkinkan fleksibilitas maksimal dalam deposit dan withdrawal cross-blockchain*