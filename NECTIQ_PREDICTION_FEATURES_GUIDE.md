# Nectiq - Panduan Lengkap Fitur Prediction Platform

## Daftar Isi
1. [Regular Prediction](#1-regular-prediction)
2. [Battle 1v1](#2-battle-1v1)
3. [Parlay Prediction](#3-parlay-prediction)
4. [Survival Tournament](#4-survival-tournament)
5. [Sistem Reward & Fee](#5-sistem-reward--fee)
6. [Contoh Perhitungan](#6-contoh-perhitungan)

---

## 1. Regular Prediction

### Mekanisme
- **Fungsi**: Prediksi harga cryptocurrency individual dalam timeframe tertentu
- **Cryptocurrency**: Bitcoin, Ethereum, BNB, Cardano, Solana, Dogecoin, Ripple, Avalanche
- **Timeframe**: 1 jam, 6 jam, 24 jam, 7 hari
- **Minimum Stake**: 10 NTIQ
- **Maximum Stake**: 10,000 NTIQ

### Cara Bergabung
1. Pilih cryptocurrency yang ingin diprediksi
2. Tentukan timeframe prediksi
3. Masukkan harga target prediksi
4. Set jumlah stake (10-10,000 NTIQ)
5. Konfirmasi prediksi

### Sistem Multiplier Berdasarkan Akurasi
| Akurasi | Multiplier | Deskripsi |
|---------|------------|-----------|
| ≥ 99.5% | 3.0x | Perfect Prediction |
| ≥ 95.0% | 2.0x | Excellent Prediction |
| ≥ 90.0% | 1.5x | Good Prediction |
| ≥ 80.0% | 0.9x | Fair Prediction |
| < 80.0% | 0.0x | Poor Prediction (Lose) |

### Fee Platform
- **Platform Fee**: 4% dari total reward (hanya untuk prediksi menang dengan multiplier 1.5x, 2.0x, 3.0x)
- **Fee tidak dikenakan** untuk prediksi dengan multiplier 0.9x atau kalah

### Contoh Regular Prediction
**Scenario**: Prediksi Bitcoin dalam 24 jam
- **Stake**: 100 NTIQ
- **Harga saat prediksi**: $65,000
- **Prediksi target**: $67,000
- **Harga aktual**: $66,800
- **Akurasi**: 98.5% (selisih $200 dari target $2,000)
- **Multiplier**: 2.0x (karena akurasi ≥ 95%)
- **Gross Reward**: 100 × 2.0 = 200 NTIQ
- **Platform Fee**: 200 × 4% = 8 NTIQ
- **Net Reward**: 200 - 8 = 192 NTIQ
- **Profit**: 192 - 100 = 92 NTIQ

---

## 2. Battle 1v1

### Mekanisme
- **Fungsi**: Duel prediksi head-to-head antara 2 pemain
- **Format**: Winner takes most (95% total stake pool)
- **Minimum Stake**: 50 NTIQ
- **Maximum Stake**: 5,000 NTIQ
- **Auto-matching**: Sistem otomatis mencari lawan dengan stake serupa

### Cara Bergabung
1. **Membuat Challenge**:
   - Pilih cryptocurrency & timeframe
   - Set stake amount
   - Tunggu lawan bergabung (max 30 menit)

2. **Menerima Challenge**:
   - Browse available battles
   - Pilih battle yang sesuai stake
   - Confirm participation

### Sistem Pemenang
- **Akurasi tertinggi menang**: Pemain dengan prediksi paling akurat menjadi pemenang
- **Tie-breaker**: Jika akurasi sama, pemain yang predict lebih dulu menang
- **Auto-refund**: Jika tidak ada lawan dalam 30 menit, stake dikembalikan

### Reward Distribution
- **Pemenang**: 95% dari total stake pool
- **Platform**: 5% dari total stake pool
- **Pecundang**: Kehilangan seluruh stake

### Contoh Battle 1v1
**Scenario**: Ethereum 6 jam prediction battle
- **Player A Stake**: 200 NTIQ
- **Player B Stake**: 200 NTIQ
- **Total Pool**: 400 NTIQ
- **Cryptocurrency**: Ethereum
- **Timeframe**: 6 jam

**Hasil**:
- **Player A Prediksi**: $3,200 (Akurasi: 92.5%)
- **Player B Prediksi**: $3,180 (Akurasi: 96.8%)
- **Harga Aktual**: $3,185

**Perhitungan**:
- **Total Pool**: 400 NTIQ
- **Platform Fee**: 400 × 5% = 20 NTIQ
- **Winner Reward**: 400 × 95% = 380 NTIQ
- **Player B (Winner)**: +380 NTIQ (Profit: 180 NTIQ)
- **Player A (Loser)**: -200 NTIQ

---

## 3. Parlay Prediction

### Mekanisme
- **Fungsi**: Prediksi multiple cryptocurrency sekaligus (2-5 coins)
- **Requirement**: Semua prediksi harus benar untuk menang
- **Minimum Stake**: 25 NTIQ per coin
- **Maximum Stake**: 2,000 NTIQ per coin
- **Timeframe**: Sama untuk semua coins dalam 1 parlay

### Cara Bergabung
1. Pilih 2-5 cryptocurrency
2. Set timeframe yang sama untuk semua
3. Masukkan target harga untuk setiap coin
4. Set stake amount per coin
5. Konfirmasi parlay bet

### Sistem Multiplier Parlay
| Jumlah Coins | Base Multiplier | Bonus Multiplier |
|--------------|-----------------|------------------|
| 2 Coins | 1.8x | +0.2x accuracy bonus |
| 3 Coins | 2.5x | +0.3x accuracy bonus |
| 4 Coins | 3.5x | +0.4x accuracy bonus |
| 5 Coins | 5.0x | +0.5x accuracy bonus |

### Accuracy Bonus
- **Rata-rata akurasi ≥ 95%**: +50% dari bonus multiplier
- **Rata-rata akurasi ≥ 90%**: +25% dari bonus multiplier
- **Rata-rata akurasi < 90%**: No bonus

### Fee Platform
- **Platform Fee**: 6% dari total reward untuk parlay yang menang
- **Semua prediksi harus akurasi ≥ 80%** untuk dianggap menang

### Contoh Parlay Prediction
**Scenario**: 3-coin parlay (Bitcoin, Ethereum, Solana) - 24 jam
- **Stake per coin**: 100 NTIQ
- **Total Stake**: 300 NTIQ

**Prediksi vs Hasil**:
| Coin | Target | Aktual | Akurasi |
|------|--------|--------|---------|
| Bitcoin | $67,000 | $66,500 | 92.5% |
| Ethereum | $3,200 | $3,180 | 93.8% |
| Solana | $180 | $178 | 94.4% |

**Perhitungan**:
- **Rata-rata Akurasi**: (92.5% + 93.8% + 94.4%) ÷ 3 = 93.6%
- **Base Multiplier**: 2.5x (3 coins)
- **Bonus Multiplier**: 0.3x × 25% = 0.075x (akurasi ≥ 90%)
- **Total Multiplier**: 2.5x + 0.075x = 2.575x
- **Gross Reward**: 300 × 2.575 = 772.5 NTIQ
- **Platform Fee**: 772.5 × 6% = 46.35 NTIQ
- **Net Reward**: 772.5 - 46.35 = 726.15 NTIQ
- **Profit**: 726.15 - 300 = 426.15 NTIQ

---

## 4. Survival Tournament

### Mekanisme
- **Fungsi**: Tournament eliminasi dengan multiple rounds
- **Format**: Last man standing wins
- **Entry Fee**: 100-1,000 NTIQ
- **Participants**: 8-32 pemain per tournament
- **Eliminasi**: 50% pemain terburuk setiap round

### Cara Bergabung
1. **Tournament Schedule**: Check jadwal tournament
2. **Registration**: Daftar sebelum deadline (1 jam sebelum start)
3. **Entry Fee**: Bayar entry fee sesuai tournament tier
4. **Wait**: Tunggu tournament dimulai

### Tournament Tiers
| Tier | Entry Fee | Max Participants | Prize Pool Distribution |
|------|-----------|------------------|------------------------|
| Bronze | 100 NTIQ | 8 players | Winner: 60%, Runner-up: 25% |
| Silver | 300 NTIQ | 16 players | Winner: 50%, 2nd: 25%, 3rd: 15% |
| Gold | 500 NTIQ | 32 players | Winner: 40%, 2nd: 20%, 3rd: 15%, 4th: 10% |
| Diamond | 1,000 NTIQ | 32 players | Winner: 35%, 2nd: 20%, 3rd: 15%, 4th: 12%, 5th: 8% |

### Round Structure
- **Round 1**: Eliminasi 50% pemain (akurasi terendah)
- **Round 2**: Eliminasi 50% dari sisanya
- **Final Round**: Menentukan pemenang final

### Fee Platform
- **Platform Fee**: 10% dari total prize pool
- **Remaining 90%**: Dibagi sesuai distribusi tier

### Contoh Survival Tournament
**Scenario**: Silver Tier Tournament (16 pemain, entry fee 300 NTIQ)
- **Total Entry**: 16 × 300 = 4,800 NTIQ
- **Platform Fee**: 4,800 × 10% = 480 NTIQ
- **Prize Pool**: 4,800 - 480 = 4,320 NTIQ

**Round Progression**:
- **Round 1**: 16 → 8 pemain (eliminasi 8 terburuk)
- **Round 2**: 8 → 4 pemain (eliminasi 4 terburuk)
- **Final**: 4 → Top 3 (menentukan ranking final)

**Prize Distribution**:
- **1st Place**: 4,320 × 50% = 2,160 NTIQ (Profit: 1,860 NTIQ)
- **2nd Place**: 4,320 × 25% = 1,080 NTIQ (Profit: 780 NTIQ)
- **3rd Place**: 4,320 × 15% = 648 NTIQ (Profit: 348 NTIQ)
- **4th-16th**: Lose entry fee (-300 NTIQ)

---

## 5. Sistem Reward & Fee

### Platform Fee Summary
| Feature | Platform Fee | Applied When |
|---------|--------------|--------------|
| Regular Prediction | 4% | Winning predictions (1.5x, 2.0x, 3.0x multiplier) |
| Battle 1v1 | 5% | Total stake pool |
| Parlay | 6% | Winning parlays |
| Survival | 10% | Total prize pool |

### NTIQ Token Economy
- **Earning**: Menang predictions, battles, parlays, tournaments
- **Spending**: Stake untuk predictions, entry fees
- **Minimum Balance**: 10 NTIQ untuk bermain
- **No Expiry**: NTIQ tidak ada expiry date

### Accuracy Calculation
```
Akurasi = 100% - (|Prediksi - Aktual| / |Target Range|) × 100%

Contoh:
- Prediksi: $67,000
- Aktual: $66,500  
- Target Range: $2,000 (movement dari current price)
- Akurasi = 100% - (500/2000) × 100% = 75%
```

---

## 6. Contoh Perhitungan Komprehensif

### Scenario: Pemain aktif dalam 1 hari

**Player Profile**: 
- Starting Balance: 1,000 NTIQ
- Target: Multiply balance melalui different features

#### Activity 1: Regular Prediction (Bitcoin 24h)
- **Stake**: 200 NTIQ
- **Akurasi**: 96.2%
- **Multiplier**: 2.0x
- **Gross**: 400 NTIQ
- **Fee**: 16 NTIQ
- **Net**: 384 NTIQ
- **Balance**: 1,000 - 200 + 384 = 1,184 NTIQ

#### Activity 2: Battle 1v1 (Ethereum 6h)
- **Stake**: 300 NTIQ
- **Opponent Stake**: 300 NTIQ
- **Result**: Win (akurasi 94% vs 88%)
- **Total Pool**: 600 NTIQ
- **Fee**: 30 NTIQ
- **Win**: 570 NTIQ
- **Balance**: 1,184 - 300 + 570 = 1,454 NTIQ

#### Activity 3: Parlay 2-coin (Solana + BNB 1h)
- **Stake**: 150 NTIQ per coin = 300 NTIQ total
- **Result**: Both predictions correct
- **Average Akurasi**: 91.5%
- **Multiplier**: 1.8x + 0.05x bonus = 1.85x
- **Gross**: 555 NTIQ
- **Fee**: 33.3 NTIQ
- **Net**: 521.7 NTIQ
- **Balance**: 1,454 - 300 + 521.7 = 1,675.7 NTIQ

#### Total Day Performance
- **Starting**: 1,000 NTIQ
- **Ending**: 1,675.7 NTIQ
- **Profit**: 675.7 NTIQ (67.57% gain)
- **Total Fees Paid**: 79.3 NTIQ

---

## Tips & Strategi

### Untuk Regular Predictions
- **Risk Management**: Jangan stake lebih dari 20% balance
- **Timeframe**: Mulai dengan timeframe pendek (1-6 jam)
- **Research**: Analisa chart dan market sentiment

### Untuk Battles
- **Opponent Analysis**: Perhatikan win rate lawan
- **Quick Decision**: Prediction speed bisa jadi tie-breaker
- **Conservative Stakes**: Start dengan stakes kecil

### Untuk Parlays
- **Correlation**: Pilih coins yang movement-nya tidak berkorelasi
- **Conservative Targets**: Lebih baik akurasi tinggi daripada target agresif
- **Maximum 3 coins**: Untuk pemula, stick to 2-3 coins

### Untuk Survival Tournaments
- **Entry Timing**: Daftar early untuk mempersiapkan strategi
- **Conservative Play**: Focus pada akurasi, bukan risk tinggi
- **Round Strategy**: Different strategy tiap round

---

**Disclaimer**: Semua contoh perhitungan di atas adalah illustrasi. Actual results bisa bervariasi tergantung market conditions dan accuracy prediksi individual.