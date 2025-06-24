# Setup Nectiq Platform di Ubuntu - Panduan Lengkap

## Step 1: Persiapan Sistem

### Update sistem dan install dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git unzip postgresql postgresql-contrib -y
```

### Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Harus v20.x.x
npm --version
```

## Step 2: Setup Database PostgreSQL

### Start PostgreSQL service
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql  # Pastikan running
```

### Create database dan user
```bash
# Switch ke postgres user
sudo -u postgres psql

# Di dalam PostgreSQL prompt, jalankan:
CREATE USER nectiq_user WITH PASSWORD 'nectiq_password_2024';
CREATE DATABASE nectiq_db OWNER nectiq_user;
GRANT ALL PRIVILEGES ON DATABASE nectiq_db TO nectiq_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO nectiq_user;
ALTER USER nectiq_user CREATEDB;
\q
```

### Test koneksi database
```bash
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT version();"
# Password: nectiq_password_2024
# Jika berhasil, akan tampil versi PostgreSQL
```

## Step 3: Extract dan Setup Project

### Extract file nectiq.zip
```bash
cd ~
unzip nectiq.zip
cd CryptoPredictorBattle  # Nama folder hasil extract
```

### Install dependencies
```bash
npm install
```

### Install packages tambahan untuk PostgreSQL
```bash
npm install pg @types/pg drizzle-orm
```

## Step 4: Konfigurasi Environment

### Buat file .env
```bash
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_db

# Session Secret
SESSION_SECRET=nectiq_super_secret_session_key_2024_very_long_and_secure

# Environment
NODE_ENV=development

# Optional: WalletConnect untuk Web3 integration
VITE_WALLETCONNECT_PROJECT_ID=optional_project_id
EOF
```

### Export environment variables
```bash
export DATABASE_URL="postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_db"
export SESSION_SECRET="nectiq_super_secret_session_key_2024_very_long_and_secure"
export NODE_ENV="development"
```

## Step 5: Fix Network Configuration

### Clear proxy settings untuk CoinGecko API
```bash
unset https_proxy
unset http_proxy
unset HTTPS_PROXY
unset HTTP_PROXY
export no_proxy="localhost,127.0.0.1"
```

### Test CoinGecko API connection
```bash
curl -H "User-Agent: Nectiq-App/1.0" "https://api.coingecko.com/api/v3/ping"
# Response: {"gecko_says":"(V3) To the Moon!"}
```

### Jika CoinGecko blocked, fix DNS
```bash
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf
```

## Step 6: Database Schema Setup

### Push schema ke database
```bash
npm run db:push
```

### Verify tables created
```bash
psql -h localhost -U nectiq_user -d nectiq_db -c "\dt"
# Harus menampilkan tables: users, predictions, cryptocurrencies, rewards, dll
```

## Step 7: Start Application

### Method 1: Direct start
```bash
npm run dev
```

### Method 2: Dengan environment variables explicit
```bash
DATABASE_URL="postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_db" \
SESSION_SECRET="nectiq_super_secret_session_key_2024_very_long_and_secure" \
NODE_ENV="development" \
npm run dev
```

## Step 8: Verification

### Test aplikasi berjalan
```bash
# Test endpoint utama
curl http://localhost:5000/
curl http://localhost:5000/api/crypto/prices
curl http://localhost:5000/api/leaderboard
```

### Access points
- **Main Application**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin

## Step 9: Admin Access Setup

### Default admin wallet addresses
```
0x742d35Cc6634C0532925a3b8D87C06a4b4e8f1E1
0x8ba1f109551bD432803012645Hac136c63e16b46
```

### Atau create manual admin user
```bash
psql -h localhost -U nectiq_user -d nectiq_db

INSERT INTO users (username, wallet_address, is_admin, balance, auth_method) 
VALUES ('admin_local', '0x742d35Cc6634C0532925a3b8D87C06a4b4e8f1E1', true, 10000, 'wallet');
\q
```

## Troubleshooting Common Issues

### Error: DATABASE_URL must be set
```bash
# Pastikan environment variables ter-set
echo $DATABASE_URL
# Jika kosong, export ulang:
export DATABASE_URL="postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_db"
```

### Error: connect ECONNREFUSED (PostgreSQL)
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Check port 5432
sudo netstat -tlnp | grep 5432
```

### Error: ECONNREFUSED 127.0.0.1:1443 (CoinGecko API)
```bash
# Clear proxy dan restart
unset https_proxy http_proxy HTTPS_PROXY HTTP_PROXY
export no_proxy="localhost,127.0.0.1"

# Test manual
curl -v "https://api.coingecko.com/api/v3/ping"
```

### Port 5000 already in use
```bash
# Find process
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

### Permission denied
```bash
# Fix ownership
sudo chown -R $USER:$USER ./CryptoPredictorBattle
```

## Features Yang Tersedia

### User Features
- Live cryptocurrency prices (real-time dari CoinGecko)
- Price prediction dengan NTIQ rewards
- Active predictions tracking
- Leaderboard dan user stats
- Metamask wallet integration

### Admin Features
- User management
- Cryptocurrency management
- Security dashboard
- System settings
- Audit logs dan security events

### Supported Cryptocurrencies
- Bitcoin (BTC)
- Ethereum (ETH)
- Binance Coin (BNB)
- Cardano (ADA)
- Solana (SOL)
- Chainlink (LINK)
- Polkadot (DOT)
- Litecoin (LTC)
- Polygon (MATIC)
- Hyperliquid (HYPE)

Platform Nectiq siap digunakan dengan semua fitur lengkap!