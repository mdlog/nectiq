# Panduan Setup Lokal - Nectiq Cryptocurrency Prediction Platform

**Terakhir Diperbarui: 5 Agustus 2025**

### Status Update Terbaru (Agustus 2025)
- ✅ **Enhanced CSV Export System**: 8 fungsi export dengan coverage data komprehensif untuk development lokal
- ✅ **Advanced Admin Panel**: Kontrol administratif penuh tersedia untuk setup lokal
- ✅ **TypeScript Stability**: Semua error LSP diagnostics diperbaiki untuk development environment
- ✅ **Development Ready**: Platform siap untuk setup dan development lokal dengan testing komprehensif

## 📋 Persyaratan Sistem

### Software yang Diperlukan:
- **Node.js** versi 18 atau lebih baru
- **PostgreSQL** versi 12 atau lebih baru
- **Git** untuk clone repository
- **npm** atau **yarn** package manager

### Akun External yang Diperlukan:
- **Firebase Project** (untuk autentikasi email)
- **Dynamic Labs Account** (untuk wallet authentication)
- **WalletConnect Project** (untuk Web3 integration)

## 🚀 Langkah-langkah Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd nectiq-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database PostgreSQL

#### Opsi A: Local PostgreSQL Installation
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database dan user
sudo -u postgres psql
CREATE DATABASE nectiq_db;
CREATE USER nectiq_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nectiq_db TO nectiq_user;
\q
```

#### Opsi B: Docker PostgreSQL
```bash
# Pull dan run PostgreSQL container
docker run --name nectiq-postgres \
  -e POSTGRES_DB=nectiq_db \
  -e POSTGRES_USER=nectiq_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:14
```

### 4. Setup Environment Variables

Buat file `.env` di root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://nectiq_user:your_secure_password@localhost:5432/nectiq_db"
PGHOST=localhost
PGPORT=5432
PGUSER=nectiq_user
PGPASSWORD=your_secure_password
PGDATABASE=nectiq_db

# Application Settings
NODE_ENV=development
SESSION_SECRET=your_super_secret_session_key_min_32_chars

# Firebase Configuration (dapatkan dari Firebase Console)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Dynamic Labs Configuration (dapatkan dari Dynamic Labs Dashboard)
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# WalletConnect Configuration (dapatkan dari WalletConnect Cloud)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Admin Configuration (opsional - untuk akses admin)
ADMIN_WALLET_ADDRESSES=0xYourAdminWalletAddress1,0xYourAdminWalletAddress2
ADMIN_PRIVATE_KEY=your_admin_private_key_for_automated_withdrawals
```

### 5. Setup External Services

#### Firebase Setup:
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru atau gunakan existing
3. Enable Authentication dengan Google Sign-in
4. Tambahkan `localhost:5000` ke Authorized domains
5. Dapatkan API Key, Project ID, dan App ID dari Project Settings

#### Dynamic Labs Setup:
1. Daftar di [Dynamic Labs](https://app.dynamic.xyz/)
2. Buat environment baru
3. Configure wallet providers (MetaMask, WalletConnect, dll)
4. Dapatkan Environment ID dari dashboard

#### WalletConnect Setup:
1. Daftar di [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Buat project baru
3. Dapatkan Project ID

### 6. Database Migration
```bash
# Push schema ke database
npm run db:push

# Verify migration
npm run db:studio
# Buka http://localhost:4983 untuk melihat database
```

### 7. Seed Initial Data (Opsional)

Untuk menambahkan cryptocurrency awal, jalankan:
```bash
# Insert sample cryptocurrencies dengan Pyth Network Feed IDs
npm run seed
```

### 8. Jalankan Development Server
```bash
# Start development server
npm run dev
```

Aplikasi akan berjalan di:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api
- **Database Studio**: http://localhost:4983 (jika menjalankan db:studio)

## 🔧 Scripts yang Tersedia

```bash
# Development
npm run dev          # Start development server
npm run build        # Build production version
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open database studio
npm run db:migrate   # Run database migrations

# Development Tools
npm run type-check   # Check TypeScript types
npm run lint         # Run ESLint
```

## 🏗️ Struktur Project

```
nectiq-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   └── db.ts            # Database configuration
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema definitions
├── contracts/           # Smart contracts (if any)
└── scripts/            # Utility scripts
```

## 🔐 Konfigurasi Keamanan

### Environment Variables Security:
- Jangan commit file `.env` ke Git
- Gunakan `.env.example` sebagai template
- Gunakan strong session secret (minimal 32 karakter)

### Database Security:
- Gunakan strong password untuk database user
- Restrict database access hanya dari localhost
- Regular backup database

### Admin Access:
- Set admin wallet addresses di environment variables
- Gunakan hardware wallet untuk admin accounts
- Monitor admin activities melalui logs

## 👨‍💼 Admin Login & Access

### Cara Login Sebagai Admin:
1. **Setup Admin Wallet Address** di `.env`:
   ```env
   ADMIN_WALLET_ADDRESSES=0x4C6165286739696849Fb3e77A16b0639D762c5B6,0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4
   ```

2. **Import Private Key ke MetaMask** (UNTUK TESTING SAJA):
   ```
   Private Key untuk 0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4:
   0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ```
   
   **⚠️ HANYA UNTUK LOCALHOST TESTING - JANGAN GUNAKAN DI PRODUCTION!**

3. **Login Process**:
   - Buka aplikasi di browser: `http://localhost:5000`
   - Klik "Login or Sign Up"
   - Connect wallet menggunakan MetaMask dengan private key di atas
   - Setelah wallet terconnect, menu "Admin" akan muncul di navigation bar
   - Klik menu "Admin" atau akses langsung: `http://localhost:5000/admin`

### ⚠️ TROUBLESHOOTING ADMIN ACCESS:

**Jika Menu Admin Tidak Muncul:**

1. **Check Environment Variables**:
   ```bash
   # Pastikan .env berisi:
   ADMIN_WALLET_ADDRESSES=0x4C6165286739696849Fb3e77A16b0639D762c5B6,0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4
   ```

2. **Restart Server**:
   ```bash
   # Stop aplikasi (Ctrl+C) lalu restart:
   npm run dev
   ```

3. **Check Database Admin Status**:
   ```bash
   # Akses database untuk check admin status:
   npm run db:studio
   # Atau manual SQL check:
   # SELECT * FROM users WHERE walletAddress = '0x3e4d881819768fab30c5a79f3a9a7e69f0a935a4';
   ```

4. **Manual Database Update** (jika diperlukan):
   ```sql
   UPDATE users 
   SET isAdmin = true 
   WHERE walletAddress = '0x3e4d881819768fab30c5a79f3a9a7e69f0a935a4';
   ```

5. **Clear Browser Cache**:
   - Hard refresh browser (Ctrl+F5)
   - Clear localStorage/sessionStorage
   - Logout dan login ulang

**Debug Console Checks:**
- Buka Developer Tools (F12)
- Check Console untuk error messages
- Check Network tab untuk API calls
- Look for "Admin verification debug" logs

**Jika Masih Bermasalah:**
1. Logout dari wallet completely
2. Clear browser cache
3. Restart npm server
4. Login ulang dengan private key yang benar
5. Check URL: `http://localhost:5000/admin` langsung

3. **Admin Panel Features**:
   - **User Management**: Kelola semua user, export data CSV
   - **Cryptocurrency Management**: Tambah/edit cryptocurrency dengan Pyth Network Feed IDs
   - **Predictions**: Monitor semua prediction user
   - **Financial**: Kelola deposits, withdrawals, purchases
   - **Platform Statistics**: Overview lengkap platform metrics

### Default Admin Accounts (Development):
```
Admin Wallet 1: 0x4C6165286739696849Fb3e77A16b0639D762c5B6
Admin Wallet 2: 0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4 ✅ (Recommended untuk testing)

Private Key untuk Wallet 2: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**⚠️ PENTING**: 
- Private key di atas HANYA untuk localhost testing
- JANGAN PERNAH gunakan di production atau mainnet
- Ganti dengan wallet address Anda sendiri di production

### Admin Authentication Flow:
1. User connect wallet → Sistem check wallet address
2. Jika address ada di `ADMIN_WALLET_ADDRESSES` → Grant admin access
3. Admin dapat akses semua fitur management
4. Security audit log semua admin activities

### Admin Panel Navigation:
- **Statistics**: Overview platform metrics
- **Users**: User management & CSV export  
- **Cryptocurrencies**: Manage Pyth Network integrations
- **Predictions**: Monitor all user predictions
- **Purchases**: Transaction monitoring
- **Deposits**: Deposit management
- **Withdrawals**: Withdrawal processing

## 🚨 Troubleshooting

### Database Connection Issues:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connection
psql -h localhost -U nectiq_user -d nectiq_db
```

### Port Conflicts:
```bash
# Check what's running on port 5000
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### Node.js Version Issues:
```bash
# Check Node.js version
node --version

# Use nvm to manage versions
nvm install 18
nvm use 18
```

### Build Errors:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist/
npm run build
```

## 📊 Monitoring & Logs

### Application Logs:
- Development: Console output
- Production: Consider using PM2 atau forever

### Database Monitoring:
```bash
# Monitor active connections
psql -c "SELECT * FROM pg_stat_activity;"

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('nectiq_db'));"
```

## 🔄 Updates & Maintenance

### Regular Updates:
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

### Database Backup:
```bash
# Backup database
pg_dump -h localhost -U nectiq_user nectiq_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql -h localhost -U nectiq_user nectiq_db < backup_file.sql
```

## 📞 Support

Jika mengalami masalah:
1. Check logs di console/terminal
2. Verify environment variables
3. Confirm database connection
4. Check external service configurations (Firebase, Dynamic Labs)

## 🎯 Production Deployment

Untuk deployment production, pertimbangkan:
- Use process manager (PM2, Docker)
- Setup reverse proxy (Nginx)
- Configure SSL certificates
- Use production database (cloud PostgreSQL)
- Setup monitoring dan alerting
- Configure backup strategies

---

**✅ Checklist Setup:**
- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env`)
- [ ] Firebase project setup
- [ ] Dynamic Labs environment setup
- [ ] WalletConnect project setup
- [ ] Database migrated (`npm run db:push`)
- [ ] Development server running (`npm run dev`)
- [ ] Application accessible at localhost:5000

Selamat! Aplikasi Nectiq sekarang berjalan di komputer lokal Anda. 🚀