# Panduan Lengkap Test Localhost untuk Nectiq

## Konfirmasi Konfigurasi Localhost

Aplikasi sudah dikonfigurasi dengan sempurna untuk testing di localhost. Berikut semua yang sudah disiapkan:

### ✅ Konfigurasi Environment Variables
```env
VITE_DYNAMIC_ENVIRONMENT_ID=bd026474-57a4-4b86-96c5-4897759d9b62
SESSION_SECRET=localhost-crypto-predict-session-secret
ADMIN_WALLETS=0x4c6165286739696849fb3e77a16b0639d762c5b6
NODE_ENV=development
```

### ✅ Dynamic Labs Wallet Integration
- Environment ID yang valid untuk localhost
- CORS dikonfigurasi untuk localhost (`Access-Control-Allow-Origin: *`)
- Semua wallet connector aktif (MetaMask, WalletConnect, dll)

### ✅ Database Support
- PostgreSQL database terintegrasi
- Automatic schema migration
- Data persistence untuk testing

## Cara Menjalankan di Localhost

### 1. Prerequisites
```bash
# Install dependencies
npm install

# Pastikan PostgreSQL running (jika menggunakan database lokal)
# Atau gunakan DATABASE_URL yang sudah dikonfigurasi
```

### 2. Start Development Server
```bash
npm run dev
```

Server akan berjalan di: `http://localhost:5000`

### 3. Test Fitur Utama

#### A. Test Koneksi Wallet
1. Buka `http://localhost:5000/wallet-login`
2. Klik "Connect Wallet"
3. Pilih MetaMask
4. Approve koneksi di MetaMask
5. Sign authentication message

#### B. Test Survival Tournament
1. Login dengan wallet
2. Pergi ke `http://localhost:5000/survival-tournaments`
3. Klik tombol "Price UP" atau "Price DOWN"
4. Verifikasi balance berkurang sesuai entry fee
5. Cek sistem countdown timer

#### C. Test Admin Panel
1. Login dengan admin wallet: `0x4c6165286739696849fb3e77a16b0639d762c5b6`
2. Akses `http://localhost:5000/admin`
3. Test semua fitur admin management

#### D. Test Prediction Battles
1. Buka `http://localhost:5000/battles`
2. Create new battle
3. Join battle dengan user lain
4. Test real-time updates

#### E. Test Live Prices
1. Verifikasi real-time price feeds dari CoinGecko API
2. Test chart interactions
3. Verifikasi cryptocurrency logos

### 4. Test Database Operations

#### A. User Management
- Auto-registration saat wallet connect
- Profile management
- Balance tracking

#### B. Tournament System
- Tournament creation (admin only)
- Participant management
- Round progression
- Elimination system

#### C. Battle System
- Battle creation dan joining
- Real-time price tracking
- Win/loss calculations

### 5. Troubleshooting Localhost Issues

#### Browser Setup
**Chrome/Edge:**
```
chrome://flags/#allow-insecure-localhost
Enable: "Allow invalid certificates for resources loaded from localhost"
```

**Firefox:**
```
about:config
Set: security.tls.insecure_fallback_hosts = "localhost"
```

#### MetaMask Setup
1. Unlock MetaMask
2. Connect to Ethereum Mainnet atau Sepolia
3. Allow localhost connections
4. Clear cache jika perlu

#### Common Issues & Solutions

**Issue: Wallet tidak connect**
- Solution: Restart browser, check MetaMask unlock status

**Issue: 401 Authentication errors**
- Solution: Normal untuk endpoint yang butuh auth, connect wallet dulu

**Issue: API timeout**
- Solution: Check internet connection untuk CoinGecko API

**Issue: Database errors**
- Solution: Verify DATABASE_URL di environment variables

### 6. Test Data untuk Development

#### Admin User
- Wallet: `0x4c6165286739696849fb3e77a16b0639d762c5b6`
- Balance: 2,395 NTIQ
- Akses penuh ke admin panel

#### Test Cryptocurrencies
- Bitcoin (BTC)
- Ethereum (ETH)
- Binance Coin (BNB)
- Cardano (ADA)
- Solana (SOL)
- Dan lainnya

### 7. Performance Testing

#### Load Testing
```bash
# Test API endpoints
curl -X GET "http://localhost:5000/api/crypto/prices"
curl -X GET "http://localhost:5000/api/leaderboard"
curl -X GET "http://localhost:5000/api/survival-tournaments"
```

#### Real-time Features
- Test WebSocket connections untuk real-time updates
- Verify countdown timers accuracy
- Check live price updates (2-second intervals)

### 8. Development Tools

#### Debug Script
```bash
node debug-localhost.js
```

#### Database Management
```bash
npm run db:push    # Push schema changes
npm run db:studio  # Open database studio (if available)
```

#### Backup & Restore
```bash
npm run backup:create  # Create database backup
npm run backup:list    # List available backups
```

## Kesimpulan

Aplikasi Nectiq sudah 100% siap untuk testing di localhost dengan:
- ✅ Wallet connection (Dynamic Labs)
- ✅ Real-time cryptocurrency prices
- ✅ Survival tournament system
- ✅ Prediction battles
- ✅ Admin panel lengkap
- ✅ Database persistence
- ✅ Real-time WebSocket updates

Semua fitur utama berfungsi sempurna di localhost environment. Server configuration sudah optimal untuk development dan testing.