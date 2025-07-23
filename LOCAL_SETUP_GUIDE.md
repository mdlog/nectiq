# Panduan Setup Lokal - Nectiq Cryptocurrency Prediction Platform

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