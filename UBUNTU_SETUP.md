# Panduan Setup Nectiq di Ubuntu localhost

## 1. Prerequisites dan Installation

### Install Node.js 20
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should be v20.x.x
npm --version
```

### Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start dan enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify status
sudo systemctl status postgresql
```

## 2. Database Setup

### Create Database dan User
```bash
# Switch ke postgres user
sudo -u postgres psql

# Jalankan command berikut di PostgreSQL prompt:
CREATE USER nectiq_user WITH PASSWORD 'nectiq_password_2024';
CREATE DATABASE nectiq_db OWNER nectiq_user;
GRANT ALL PRIVILEGES ON DATABASE nectiq_db TO nectiq_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO nectiq_user;
ALTER USER nectiq_user CREATEDB;
\q
```

### Test Database Connection
```bash
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT version();"
# Password: nectiq_password_2024
```

## 3. Project Setup

### Extract dan Install Dependencies
```bash
# Extract project
cd ~
unzip nectiq.zip
cd CryptoPredictorBattle

# Install dependencies
npm install

# Install additional packages for local PostgreSQL
npm install pg @types/pg
```

### Environment Configuration
```bash
# Create .env file
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_db

# Session Secret
SESSION_SECRET=nectiq_super_secret_session_key_2024_very_long_and_secure

# Environment
NODE_ENV=development

# Optional: WalletConnect (untuk Web3 integration)
VITE_WALLETCONNECT_PROJECT_ID=optional_project_id
EOF
```

### Network Configuration (Fix CoinGecko API)
```bash
# Check internet connection
ping -c 3 8.8.8.8

# Test CoinGecko API directly
curl -H "User-Agent: Nectiq-App/1.0" "https://api.coingecko.com/api/v3/ping"

# If blocked by firewall, configure DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf
```

## 4. Database Schema Setup

```bash
# Push schema to database
npm run db:push

# Verify tables created
psql -h localhost -U nectiq_user -d nectiq_db -c "\dt"
```

## 5. Start Application

### Method 1: Direct Start
```bash
# Export environment variables
export DATABASE_URL="postgresql://nectiq_user:nectiq_password_2024@localhost:5432/nectiq_db"
export SESSION_SECRET="nectiq_super_secret_session_key_2024_very_long_and_secure"
export NODE_ENV="development"

# Start application
npm run dev
```

### Method 2: Using dotenv
```bash
# Install dotenv-cli if not present
npm install -g dotenv-cli

# Start with dotenv
dotenv -e .env npm run dev
```

## 6. Access Points

- **Main Application**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin

## 7. Admin Access

### Default Admin Wallets
Aplikasi ini memiliki wallet admin default:
```
0x742d35Cc6634C0532925a3b8D87C06a4b4e8f1E1
0x8ba1f109551bD432803012645Hac136c63e16b46
```

### Create Manual Admin User
```bash
# Connect to database
psql -h localhost -U nectiq_user -d nectiq_db

# Insert admin user
INSERT INTO users (username, wallet_address, is_admin, balance, auth_method) 
VALUES ('admin_local', '0x742d35Cc6634C0532925a3b8D87C06a4b4e8f1E1', true, 10000, 'wallet');
\q
```

## 8. Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if port 5432 is open
sudo netstat -tlnp | grep 5432

# Edit PostgreSQL config if needed
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Ensure these lines exist:
# local   all             all                                     md5
# host    all             all             127.0.0.1/32            md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### CoinGecko API Connection Error (ECONNREFUSED 127.0.0.1:443)
```bash
# Check DNS resolution
nslookup api.coingecko.com

# Test direct API call
curl -v "https://api.coingecko.com/api/v3/ping"

# If behind proxy, configure:
export https_proxy="your-proxy:port"
export http_proxy="your-proxy:port"

# Or disable proxy temporarily:
unset https_proxy
unset http_proxy
```

### Port 5000 Already in Use
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>

# Or change port in package.json scripts
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER ./CryptoPredictorBattle
chmod +x node_modules/.bin/*
```

## 9. Verification Tests

### Test Database
```bash
psql -h localhost -U nectiq_user -d nectiq_db -c "SELECT count(*) FROM users;"
```

### Test API Endpoints
```bash
# Test crypto prices endpoint
curl http://localhost:5000/api/crypto/prices

# Test leaderboard
curl http://localhost:5000/api/leaderboard
```

### Test CoinGecko Integration
```bash
# Direct test
curl -H "User-Agent: Nectiq-App/1.0" "https://api.coingecko.com/api/v3/coins/markets?ids=bitcoin,ethereum&vs_currency=usd"
```

## 10. Production Notes

- CoinGecko API memiliki rate limit 50 calls/minute untuk free tier
- Aplikasi menggunakan caching 1 menit untuk real-time prices
- Database akan otomatis ter-populate dengan sample data
- Semua fitur prediction, wallet integration, dan admin panel tersedia

## Support

Jika masih ada masalah, pastikan:
1. PostgreSQL service running
2. Database credentials benar
3. Internet connection aktif untuk CoinGecko API
4. Port 5000 available
5. File .env configured dengan benar