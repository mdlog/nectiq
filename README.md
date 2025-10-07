# 🎮 NECTIQ - Crypto Price Prediction Platform

<div align="center">

![Nectiq Logo](client/src/assets/nectiq-logo.png)

**Real-time Crypto Price Prediction Game with Multi-Chain Support**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [API](#api) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**NECTIQ** is a cutting-edge Web3 gaming platform where users can predict cryptocurrency price movements and compete against others in real-time battles. Built with modern web technologies and blockchain integration, NECTIQ offers a seamless, secure, and engaging prediction gaming experience.

### Key Highlights

- 🚀 **Real-time Price Feeds** via Pyth Network
- 🔐 **Web3 Wallet Integration** (MetaMask, WalletConnect, Coinbase, Pelagus)
- 💰 **Multi-Chain Deposits** (Ethereum, Base, BSC, Optimism, Arbitrum, Sepolia, Holesky)
- ⚡ **Automated Deposit Verification** using blockchain explorers
- 🎮 **Multiple Game Modes** (Predictions, Battles, Survival, TrendRide)
- 📊 **Live Leaderboards** and achievements
- 🎁 **Referral System** with rewards
- 🔔 **Real-time Notifications** via WebSocket

---

## ✨ Features

### 🎯 Core Features

#### 1. **Price Predictions**
- Predict crypto price movements (Up/Down)
- Multiple timeframes (1min, 5min, 15min, 1hour)
- Real-time price updates every second
- Instant result verification
- Win multipliers based on difficulty

#### 2. **Prediction Battles**
- Challenge other players in head-to-head battles
- Stake NTIQ tokens
- Public and private battle modes
- Real-time battle updates
- Winner takes all (minus platform fee)

#### 3. **Survival Tournaments**
- Multi-round elimination tournaments
- Progressive difficulty
- Top performers advance to next rounds
- Grand prizes for winners
- Live tournament brackets

#### 4. **TrendRide Predictions**
- Combine multiple predictions
- Higher risk, higher rewards
- All predictions must win
- Boosted multipliers
- Strategic gameplay

#### 5. **Financial Management**
- **Multi-chain deposits** (ETH, USDC, USDT)
- **Automated deposit verification** (1-2 minutes)
- **Safe withdrawals** with manual admin approval
- **Transaction history** tracking
- **Balance auditing** with transaction logs

### 🔧 Technical Features

#### Real-time Systems
- ✅ **Live Price Updates** (1-second refresh rate)
- ✅ **Persistent Data Display** (no flickering)
- ✅ **WebSocket Notifications** (instant updates)
- ✅ **Auto-refresh** on data updates

#### Security
- ✅ **Wallet-based Authentication**
- ✅ **Session Management**
- ✅ **CORS Protection**
- ✅ **Rate Limiting**
- ✅ **Anti-abuse Detection**
- ✅ **Audit Logging**

#### Blockchain Integration
- ✅ **Multi-chain Support** (7 networks)
- ✅ **Automated Deposit Monitoring**
- ✅ **Transaction Verification**
- ✅ **Blockchain Explorer APIs**
- ✅ **Gas Fee Optimization**

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Web3:** Wagmi + RainbowKit
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM
- **Real-time:** WebSocket
- **Session:** express-session
- **Security:** Helmet, CORS

### Blockchain & APIs
- **Price Feeds:** Pyth Network
- **Blockchain APIs:** Etherscan, BSCScan, BaseScan, Arbiscan, Optimism Etherscan
- **Networks:** Ethereum, Base, BSC, Optimism, Arbitrum, Sepolia, Holesky
- **Wallets:** MetaMask, WalletConnect, Coinbase Wallet, Pelagus

### DevOps & Tools
- **Package Manager:** npm
- **Database Migrations:** Drizzle Kit
- **Process Manager:** PM2
- **Version Control:** Git
- **Deployment:** VPS/Cloud

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** 9 or higher (comes with Node.js)
- **PostgreSQL** 15+ or access to [Neon Database](https://neon.tech)
- **Git** for version control

### Required API Keys (Free)

1. **Etherscan API Key** (Required for Ethereum networks)
   - Sign up: https://etherscan.io/register
   - Free tier: 100,000 requests/day

2. **Blockchain Explorer API Keys** (Optional, for other networks)
   - BSCScan: https://bscscan.com/register
   - BaseScan: https://basescan.org/register
   - Arbiscan: https://arbiscan.io/register
   - Optimistic Etherscan: https://optimistic.etherscan.io/register

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nectiq.git
cd nectiq
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

**Option A: Use Neon Database (Recommended)**
1. Sign up at [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb nectiq
```

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Variables:**
```bash
# Server
PORT=5003
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/nectiq

# Blockchain API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Wallets
ADMIN_WALLET_ADDRESSES=0xYourAdminWallet
DEPOSIT_WALLET_ADDRESS=0xYourDepositWallet

# Session
SESSION_SECRET=generate_a_strong_random_secret
```

**Generate Session Secret:**
```bash
openssl rand -base64 32
```

### 5. Run Database Migrations

```bash
npm run db:push
```

### 6. Seed Cryptocurrency Data (Optional)

```bash
node seed-crypto.mjs
```

---

## ⚙️ Configuration

### Environment Variables Reference

See `.env.example` for a complete list of available configuration options.

#### Core Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | Yes | 5003 |
| `NODE_ENV` | Environment mode | Yes | production |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `ETHERSCAN_API_KEY` | Etherscan API key | Yes | - |
| `ADMIN_WALLET_ADDRESSES` | Admin wallet addresses (comma-separated) | Yes | - |
| `DEPOSIT_WALLET_ADDRESS` | Deposit destination wallet | Yes | - |
| `SESSION_SECRET` | Session encryption secret | Yes | - |

#### Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `BSCSCAN_API_KEY` | BSC blockchain explorer API | - |
| `BASESCAN_API_KEY` | Base blockchain explorer API | - |
| `ARBISCAN_API_KEY` | Arbitrum blockchain explorer API | - |
| `OPTIMISM_API_KEY` | Optimism blockchain explorer API | - |
| `DEPOSIT_CHECK_INTERVAL` | Deposit monitoring interval (ms) | 60000 |
| `WITHDRAWAL_CHECK_INTERVAL` | Withdrawal monitoring interval (ms) | 120000 |

---

## 🏃 Running the Application

### Development Mode

```bash
# Build the application
npm run build

# Start the server
npm run start
```

**Note:** Vite dev mode requires file watchers which may hit system limits. Production mode (build + start) is recommended.

### Production Mode with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.cjs

# View logs
pm2 logs nectiq

# Stop
pm2 stop nectiq

# Restart
pm2 restart nectiq
```

### Access the Application

Once running, access the application at:
- **Local:** http://localhost:5003
- **Production:** https://yourdomain.com

---

## 🏗 Architecture

### System Overview

```
┌─────────────────┐
│   React Client  │ ← User Interface (Vite + React + TailwindCSS)
└────────┬────────┘
         │
         │ HTTP/WebSocket
         ↓
┌─────────────────┐
│  Express Server │ ← API & Business Logic (Node.js + TypeScript)
└────────┬────────┘
         │
         ├─→ PostgreSQL ← Database (Neon/PostgreSQL)
         ├─→ Pyth Network ← Price Feeds
         ├─→ Etherscan API ← Blockchain Verification
         └─→ WebSocket ← Real-time Updates
```

### Key Components

#### Frontend (`/client`)
- **Pages:** Landing, Dashboard, Battles, Survival, Leaderboard, Admin
- **Components:** Live Prices, Prediction Cards, Battle List, User Stats
- **Hooks:** Custom React hooks for Web3, WebSocket, authentication
- **State:** React Query for server state, React Context for app state

#### Backend (`/server`)
- **Routes:** Authentication, Predictions, Battles, Deposits, Withdrawals, Admin
- **Services:** 
  - `PythPriceService` - Real-time price feeds
  - `DepositMonitorService` - Automated deposit verification
  - `BalanceService` - Transaction ledger management
  - `AchievementService` - User achievements
  - `ReferralService` - Referral tracking
- **Middleware:** Authentication, rate limiting, CORS, session management
- **WebSocket:** Real-time notifications and updates

#### Database (`/shared/schema.ts`)
- **Users:** Wallet-based authentication, balances, profiles
- **Predictions:** Price predictions with results
- **Battles:** Head-to-head competitions
- **Tournaments:** Survival mode tournaments
- **Deposits/Withdrawals:** Financial transactions
- **Transaction Logs:** Audit trail for all balance changes

---

## 📡 API Documentation

### Authentication

#### POST `/api/auth/wallet-connect`
Connect with Web3 wallet and create/login user.

**Request:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x...",
  "message": "Sign in to Nectiq"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "CryptoNinja123",
    "walletAddress": "0x742d35...",
    "balance": 1000,
    "isAdmin": false
  }
}
```

### Live Prices

#### GET `/api/crypto/pyth-prices`
Get real-time cryptocurrency prices from Pyth Network.

**Response:**
```json
[
  {
    "id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "current_price": 122450.50,
    "price_change_percentage_24h": 2.5,
    "source": "pyth",
    "last_updated": "2025-10-07T16:05:54.000Z"
  }
]
```

### Deposits

#### POST `/api/deposits/create`
Create a new deposit request.

**Request:**
```json
{
  "chainName": "sepolia",
  "chainId": 11155111,
  "tokenType": "ETH",
  "tokenAddress": "native",
  "amountUSD": "10.00",
  "toWalletAddress": "0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4",
  "fromWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "message": "Deposit request created successfully",
  "deposit": {
    "id": 1,
    "uniqueTransactionId": "12345678",
    "ntiqAmount": 1000,
    "status": "pending",
    "expiresAt": "2025-10-07T17:30:00.000Z"
  }
}
```

### Admin Panel

#### GET `/api/admin/stats`
Get platform statistics (admin only).

**Response:**
```json
{
  "totalUsers": 1523,
  "totalPredictions": 45678,
  "totalDeposits": 125000,
  "activeBattles": 23,
  "platformBalance": 500000
}
```

---

## 🗄 Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  wallet_address VARCHAR(42) UNIQUE,
  balance INTEGER DEFAULT 1000,
  is_admin BOOLEAN DEFAULT FALSE,
  auth_method VARCHAR(20) DEFAULT 'wallet',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Deposits
```sql
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  unique_transaction_id VARCHAR(8) UNIQUE,
  chain_name VARCHAR(20) NOT NULL,
  token_type VARCHAR(10) NOT NULL,
  amount_usd NUMERIC(18,6) NOT NULL,
  ntiq_amount INTEGER NOT NULL,
  transaction_hash VARCHAR(66) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  processed_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Predictions
```sql
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  crypto_id VARCHAR(50) NOT NULL,
  prediction VARCHAR(10) NOT NULL,
  entry_price NUMERIC(20,8) NOT NULL,
  exit_price NUMERIC(20,8),
  stake INTEGER NOT NULL,
  result VARCHAR(10),
  profit INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

See `shared/schema.ts` for complete schema definitions.

---

## 🚀 Deployment

### Prerequisites for Production

1. **VPS/Cloud Server** (Ubuntu 20.04+ recommended)
2. **Domain name** with DNS configured
3. **SSL certificate** (Let's Encrypt recommended)
4. **PostgreSQL database** (Neon or self-hosted)

### Deployment Steps

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install -y nginx
```

#### 2. Clone and Install

```bash
# Clone repository
git clone https://github.com/yourusername/nectiq.git
cd nectiq

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Build application
npm run build
```

#### 3. Database Setup

```bash
# Push database schema
npm run db:push

# Seed cryptocurrencies (optional)
node seed-crypto.mjs
```

#### 4. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.cjs

# Set PM2 to start on boot
pm2 startup
pm2 save

# Monitor logs
pm2 logs nectiq
```

#### 5. Configure Nginx (Optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 6. SSL Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **File Watcher Limit Exceeded**
```bash
# Error: ENOSPC: System limit for number of file watchers reached

# Solution: Use production build instead
npm run build
npm run start
```

#### 2. **Deposit Stuck in Processing**
```bash
# Check deposit monitor logs
tail -f /tmp/nectiq-prod.log | grep DEPOSIT-MONITOR

# Manually complete deposit (if blockchain confirmed)
# See documentation: docs/MANUAL_DEPOSIT_COMPLETION.md
```

#### 3. **Live Prices Not Showing**
```bash
# Check Pyth Network API
curl http://localhost:5003/api/crypto/pyth-prices

# Verify cryptocurrencies in database
npm run db:studio
```

#### 4. **Wallet Connection Issues**
- Ensure CORS is properly configured
- Check that wallet provider domains are in CSP
- Verify wallet addresses are correct
- Clear browser cache and try again

#### 5. **Admin Panel Not Accessible**
- Verify `ADMIN_WALLET_ADDRESSES` in `.env`
- Ensure wallet address matches exactly (lowercase)
- Clear cache and re-login
- Check user's `isAdmin` flag in database

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

### Testing

```bash
# Run tests (when available)
npm test

# Build and check for errors
npm run build
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Pyth Network** - Real-time price feeds
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Drizzle ORM** - Type-safe database queries
- **TanStack Query** - Server state management
- **Neon Database** - Serverless PostgreSQL

---

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/nectiq/issues)
- **Discord:** [Join our community](https://discord.gg/nectiq)
- **Email:** support@nectiq.io

---

## 🗺 Roadmap

**NECTIQ is on a journey to become 100% decentralized.**

For our complete roadmap with 10 waves of progressive decentralization, see **[ROADMAP.md](ROADMAP.md)**.

### Current Status: Wave 1 (Foundation) ✅
- ✅ Multi-chain deposit system
- ✅ Automated deposit verification
- ✅ Real-time price feeds (Pyth Network)
- ✅ Wallet-based authentication
- ✅ Admin panel & security features

### Next Milestone: Wave 2 (Q2 2025)
- 🎯 NTIQ Token Smart Contract deployment
- 🎯 On-chain deposit/withdrawal contracts
- 🎯 Basic prediction smart contracts
- 🎯 Oracle integration (Pyth on-chain)

**View the full decentralization roadmap:** [ROADMAP.md](ROADMAP.md)

---

<div align="center">

**Built with ❤️ by the NECTIQ Team**

[Website](https://nectiq.io) • [Twitter](https://twitter.com/nectiq) • [Discord](https://discord.gg/nectiq)

</div>
