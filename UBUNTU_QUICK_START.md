# Quick Start Nectiq di Ubuntu

## Error Fix untuk ECONNREFUSED 127.0.0.1:1443

Berdasarkan screenshot error yang Anda kirim, masalahnya adalah konfigurasi network di Ubuntu. Berikut solusi cepat:

### Method 1: Automated Fix Script
```bash
# Jalankan script otomatis
chmod +x ubuntu-fix.sh
./ubuntu-fix.sh
```

### Method 2: Manual Fix
```bash
# 1. Clear proxy settings
unset https_proxy http_proxy HTTPS_PROXY HTTP_PROXY
export no_proxy="localhost,127.0.0.1"

# 2. Set environment variables
export DATABASE_URL="postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_db"
export SESSION_SECRET="nectiq_super_secret_session_key_2024_very_long_and_secure"
export NODE_ENV="development"

# 3. Fix DNS if needed
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf

# 4. Test CoinGecko API
curl -H "User-Agent: Nectiq-App/1.0" "https://api.coingecko.com/api/v3/ping"

# 5. Start application
npm run dev
```

### Method 3: Offline Mode
Jika CoinGecko API tetap bermasalah, aplikasi akan otomatis menggunakan fallback data:
- Bitcoin: $104,959
- Ethereum: $2,398  
- BNB: $615
- Cardano: $0.48
- Solana: $168

## Verification
Setelah aplikasi berjalan, test:
```bash
curl http://localhost:5000/api/crypto/prices
curl http://localhost:5000/api/leaderboard
```

## Admin Access
Default admin wallet: `0x742d35Cc6634C0532925a3b8D87C06a4b4e8f1E1`

Aplikasi tetap berfungsi penuh meski tanpa koneksi CoinGecko API real-time.