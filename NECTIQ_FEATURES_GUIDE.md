# 🎯 Panduan Lengkap Fitur Prediksi Nectiq

## 📖 Daftar Isi
1. [Regular Prediction](#regular-prediction)
2. [Battle](#battle)
3. [Parlay](#parlay)
4. [Survival](#survival)
5. [Sistem Reward](#sistem-reward)
6. [Tips & Strategi](#tips--strategi)

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

### Sistem Penilaian
- **Akurasi Perfect (100%)**: Prediksi tepat sasaran
- **Akurasi Tinggi (95-99%)**: Selisih sangat kecil
- **Akurasi Sedang (80-94%)**: Selisih kecil
- **Akurasi Rendah (50-79%)**: Selisih besar
- **Gagal (<50%)**: Prediksi sangat meleset

### Contoh Reward Regular Prediction
```
Cryptocurrency: Bitcoin (BTC)
Timeframe: 24 Jam
Harga Saat Ini: $113,250
Prediksi Anda: $114,000
Hasil Aktual: $113,800

Perhitungan Akurasi:
- Selisih: |114,000 - 113,800| = $200
- Persentase Error: (200/113,800) × 100 = 0.176%
- Akurasi: 100% - 0.176% = 99.824%

💰 REWARD:
Base Points: 100 NTIQ
Accuracy Multiplier: 2.5x (akurasi >99%)
Time Multiplier: 1.5x (24 jam)
Total Reward: 100 × 2.5 × 1.5 = 375 NTIQ
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

### Contoh Reward Battle
```
BATTLE: Player A vs Player B
Cryptocurrency: Ethereum (ETH)
Timeframe: 6 Jam
Entry Fee: 50 NTIQ per pemain
Total Pool: 100 NTIQ

Harga Saat Ini: $3,420
Player A Prediksi: $3,450
Player B Prediksi: $3,380
Hasil Aktual: $3,435

Perhitungan:
Player A Error: |3,450 - 3,435| = $15 (0.437%)
Player B Error: |3,380 - 3,435| = $55 (1.601%)

🏆 PEMENANG: Player A
💰 REWARD:
- Player A: 100 NTIQ (total pool) + 25 NTIQ bonus
- Player B: 0 NTIQ
- Battle Win Streak Bonus: +10 NTIQ (jika menang berturut-turut)
```

---

## 🎲 Parlay

### Penjelasan
Parlay adalah prediksi UP/DOWN sederhana dengan multiplier tetap. Anda hanya perlu menebak apakah harga akan naik atau turun dari harga saat ini dalam timeframe tertentu.

### Cara Bermain
1. **Pilih Cryptocurrency**
2. **Pilih Timeframe**
3. **Pilih Arah**: UP (Naik) atau DOWN (Turun)
4. **Tentukan Stake**: Jumlah NTIQ yang ingin dipertaruhkan
5. **Konfirmasi**: Tunggu hasil

### Multiplier Parlay
- **1 Jam**: 1.8x multiplier
- **6 Jam**: 2.2x multiplier  
- **24 Jam**: 3.0x multiplier
- **7 Hari**: 5.0x multiplier

### Contoh Reward Parlay
```
PARLAY PREDICTION
Cryptocurrency: Solana (SOL)
Timeframe: 24 Jam
Stake: 100 NTIQ
Prediksi: UP (Naik)
Multiplier: 3.0x

Harga Saat Mulai: $145.50
Harga Setelah 24 Jam: $148.20

✅ HASIL: MENANG (Harga naik dari $145.50 ke $148.20)

💰 REWARD:
Stake: 100 NTIQ
Multiplier: 3.0x
Total Payout: 100 × 3.0 = 300 NTIQ
Net Profit: 300 - 100 = 200 NTIQ

❌ Jika KALAH:
Anda kehilangan stake: -100 NTIQ
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

### Base Rewards
- **Regular Prediction**: 50-200 NTIQ (tergantung timeframe)
- **Battle Win**: Prize pool + bonus
- **Parlay**: Stake × Multiplier  
- **Survival**: Berdasarkan posisi final

### Multiplier Bonus
- **Accuracy Multiplier**:
  - 99-100%: 3x
  - 95-98%: 2.5x
  - 90-94%: 2x
  - 80-89%: 1.5x
  - <80%: 1x

- **Time Multiplier**:
  - 1 Jam: 1x
  - 6 Jam: 1.2x
  - 24 Jam: 1.5x
  - 7 Hari: 2x

### Achievement Rewards
- **Perfect Prediction**: +100 NTIQ bonus
- **Win Streak 5**: +50 NTIQ bonus
- **Win Streak 10**: +150 NTIQ bonus
- **Daily Challenge**: +25 NTIQ bonus
- **Weekly Champion**: +500 NTIQ bonus

### Contoh Kombinasi Reward Maksimal
```
SCENARIO: Perfect Weekly Bitcoin Prediction
Base Reward: 200 NTIQ (7 hari)
Accuracy: 100% (3x multiplier)
Time: 7 hari (2x multiplier)
Perfect Prediction Bonus: +100 NTIQ
Win Streak 10 Bonus: +150 NTIQ

TOTAL CALCULATION:
Base × Accuracy × Time + Bonuses
= 200 × 3 × 2 + 100 + 150
= 1,200 + 250
= 1,450 NTIQ

💵 VALUE: 1,450 NTIQ = $14.50 USD
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

*Dokumen ini akan terus diupdate seiring dengan penambahan fitur baru di platform Nectiq.*