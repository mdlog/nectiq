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

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📦 Prerequisites](#-prerequisites)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🏃 Running the Application](#-running-the-application)
- [🏗 Architecture](#-architecture)
- [🔗 Smart Contracts](#-smart-contracts)
- [📡 API Documentation](#-api-documentation)
- [🚀 Deployment](#-deployment)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📞 Support](#-support)
- [🗺 Roadmap](#-roadmap)

---

## 🌟 Overview

**NECTIQ** is a cutting-edge Web3 gaming platform where users can predict cryptocurrency price movements and compete against others in real-time battles. Built with modern web technologies and blockchain integration, NECTIQ offers a seamless, secure, and engaging prediction gaming experience.

> 🚧 **Development Status:** NECTIQ is currently in **development phase** and deployed on **Polygon Amoy Testnet only**. The platform is fully functional for testing and development purposes on the testnet environment.

### 🎯 What Makes NECTIQ Unique?

**NECTIQ is a hybrid platform that combines three powerful Web3 categories:**

| Category | Contribution | Key Features |
|----------|-------------|--------------|
| 🎮 **GameFi (45%)** | Entertainment & Engagement | 4 game modes (Predictions, Battles, Tournaments, TrendRide), play-to-earn mechanics, comprehensive gamification system, competitive PvP gameplay |
| 💰 **DeFi (40%)** | Financial Infrastructure | Multi-chain support (7 networks), smart contracts, token economics (NTIQ), DAO governance, automated deposit/withdrawal system |
| 👥 **SocialFi (15%)** | Community & Viral Growth | Referral system, leaderboards, achievements, social sharing, community governance |

**Primary Classification:** *"GameFi Prediction Platform with DeFi Infrastructure on Polygon"*

**Why This Hybrid Approach Works:**
- ✅ **GameFi** attracts users (fun, engaging, viral growth)
- ✅ **DeFi** retains users (trust, transparency, sustainable economics)
- ✅ **SocialFi** grows the network (referrals, community ownership, network effects)

Unlike pure DeFi prediction markets (boring UI, limited engagement) or pure GameFi platforms (unsustainable tokenomics), NECTIQ combines the best of all three worlds for a **sustainable, engaging, and trustworthy** gaming experience.

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
- **Multi-chain deposits** (POL, WETH, USDC, USDT, LINK)
- **Automated deposit verification** (1-2 minutes)
- **Smart contract withdrawals** (instant & automated)
- **Transaction history** tracking with real-time updates
- **Real NTIQ token balance** from blockchain
- **Individual vault balances** per user

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
- ✅ **NTIQ Token Integration** (real token balance)
- ✅ **Multi-Token Vault Smart Contract**
- ✅ **Blockchain-First Architecture** (all predictions/battles/parlays require blockchain confirmation)
- ✅ **Smart Contract Integration** (7 deployed contracts on Polygon Amoy)
- ✅ **Transparent Operations** (all actions verifiable on blockchain)

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
- **Networks:** **Currently deployed on Polygon Amoy Testnet only** (testnet support for development)
- **Deposit Networks:** Ethereum, Base, BSC, Optimism, Arbitrum, Sepolia, Holesky (for multi-chain deposits only)
- **Wallets:** MetaMask, WalletConnect, Coinbase Wallet, Pelagus
- **Smart Contracts:** Enhanced Prediction Staking, Battle Escrow, Parlay Staking, Multi-Token Vault, Prediction Insurance, Referral System, NFT Achievement System
- **Development:** Hardhat, OpenZeppelin Contracts

> ⚠️ **Important Note:** The application is currently deployed on **Polygon Amoy Testnet only**. Smart contracts and main functionality are only available on Polygon Amoy Testnet. Other networks are supported only for deposit functionality.

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
- **MetaMask** or compatible Web3 wallet with **Polygon Amoy Testnet** configured
- **Testnet MATIC** for gas fees on Polygon Amoy Testnet

> 🌐 **Network Requirement:** The application currently runs on **Polygon Amoy Testnet only**. Ensure your wallet is configured with Polygon Amoy Testnet and you have testnet MATIC for transaction fees.

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
DEPLOYER_PRIVATE_KEY=your_deployer_private_key

# NTIQ Token (Polygon Amoy)
NTIQ_TOKEN_ADDRESS_AMOY=0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f
POLYGON_AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/your_project_id

# Smart Contract Addresses (see SMART_CONTRACTS.md for complete list)
# ENHANCED_PREDICTION_STAKING_ADDRESS=0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3
# ENHANCED_PARLAY_STAKING_ADDRESS=0x87D08a494D960240d3a2D5CdB155084CAF222584
# BATTLE_ESCROW_ADDRESS=0x65CBABb0864de26fc753F5044277644f72Df8490
# MULTI_TOKEN_VAULT_ADDRESS=0xe124893F7E1d5bF82586680c590f9510b6dCf42e
# PREDICTION_INSURANCE_ADDRESS=0x170aF9d61945c6AbD8619d6cafbd03E5fC8ae3Ce
# REFERRAL_SYSTEM_ADDRESS=0x7E9F85CDDb70A0d3Ab7738B61610d1774867c8e2
# NFT_ACHIEVEMENT_SYSTEM_ADDRESS=0x57c5aE2C1ed8ef90e264D165b5A7F7C750C50C3f
# BACKEND_SIGNER_PRIVATE_KEY=your_backend_signer_private_key

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

**For Smart Contract configuration, see [SMART_CONTRACTS.md](SMART_CONTRACTS.md#-environment-variables)**

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

> ⚠️ **Important:** Ensure your wallet is connected to **Polygon Amoy Testnet** to interact with smart contracts. The application will only function properly when connected to the correct network.

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

## 🔗 Smart Contracts

NECTIQ uses a comprehensive suite of smart contracts deployed on **Polygon Amoy Testnet** to ensure transparency, security, and decentralization. All contracts follow a **blockchain-first architecture**, meaning predictions, battles, and parlays are only created after successful blockchain transaction confirmation.

> 🚧 **Current Status:** The application is **temporarily limited to Polygon Amoy Testnet only**. All smart contracts, predictions, battles, and parlays are currently deployed and functional only on Polygon Amoy Testnet for development and testing purposes.

### 📋 Quick Reference

| Contract | Address | Purpose |
|----------|---------|---------|
| **NTIQ Token** | `0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f` | Native platform token |
| **Enhanced Prediction Staking** | `0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3` | Prediction staking & rewards |
| **Enhanced Parlay Staking** | `0x87D08a494D960240d3a2D5CdB155084CAF222584` | Parlay/TrendRide staking |
| **Battle Escrow** | `0x65CBABb0864de26fc753F5044277644f72Df8490` | Battle staking & resolution |
| **Multi-Token Vault** | `0xe124893F7E1d5bF82586680c590f9510b6dCf42e` | Multi-chain token management |
| **Prediction Insurance** | `0x170aF9d61945c6AbD8619d6cafbd03E5fC8ae3Ce` | Insurance for failed predictions |
| **Referral System** | `0x7E9F85CDDb70A0d3Ab7738B61610d1774867c8e2` | Referral tracking & rewards |
| **NFT Achievement System** | `0x57c5aE2C1ed8ef90e264D165b5A7F7C750C50C3f` | Achievement NFTs |

### 🔧 Key Features

- ✅ **Blockchain-First:** All operations require blockchain confirmation
- ✅ **Multi-Chain Support:** 7 supported networks for deposits
- ✅ **Smart Contract Security:** OpenZeppelin standards with access control
- ✅ **Transparent Operations:** All transactions verifiable on blockchain
- ✅ **Automated Processing:** Backend monitors and processes transactions

### 📖 Complete Documentation

For detailed information about smart contracts, functions, security features, and integration guides, see:

**📄 [Smart Contracts Documentation](SMART_CONTRACTS.md)**

This comprehensive guide includes:
- Detailed function documentation for all contracts
- Security features and architecture details
- Network configuration and environment setup
- Contract interaction flows and examples
- Deployment and verification information

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

**NECTIQ** is licensed under the **MIT License** - a permissive open-source license that allows for maximum flexibility and adoption.

### 📋 License Summary

The MIT License allows you to:
- ✅ **Use** the software for any purpose
- ✅ **Modify** the software for your needs
- ✅ **Distribute** copies of the software
- ✅ **Sublicense** the software under different terms
- ✅ **Sell** the software or include it in commercial products

### 🔒 License Requirements

The only requirement is that you include the original copyright notice and license text in any copy or substantial portion of the software.

### 📜 Full License Text

```
MIT License

Copyright (c) 2025 NECTIQ Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
 whosoever, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 🏢 Commercial Use

**NECTIQ** can be used in commercial applications without any restrictions. The MIT License is business-friendly and allows for:

- **Startups** to build commercial products using NECTIQ
- **Enterprises** to integrate NECTIQ into their systems
- **Developers** to create derivative works and monetize them
- **Contributors** to maintain their own commercial rights

### 🤝 Contributing

When contributing to NECTIQ, you agree that your contributions will be licensed under the same MIT License. This ensures consistency and clarity for all users and contributors.

### 📞 License Questions

If you have questions about the license or need clarification on usage rights, please contact us:

- **Email:** legal@nectiq.io
- **GitHub Issues:** [License Questions](https://github.com/mdlog/nectiq/issues)
- **Documentation:** See [LICENSE](LICENSE) file for the complete license text

### 🔗 Related Documentation

- **[LICENSE](LICENSE)** - Complete license file
- **[Contributing Guidelines](#-contributing)** - How to contribute to NECTIQ
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines
- **[Security Policy](SECURITY.md)** - Security reporting and policies

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

**Current Status:** Wave 1-2 Complete ✅ | **Next:** Wave 3-4 (Build & Optimize) 🔜

> 🚧 **Current Deployment:** The platform is currently deployed on **Polygon Amoy Testnet only** for development and testing purposes. Mainnet deployment is planned for future waves.

### 🎯 Development Path (5 Months)

**PHASE 1: PATH TO FUNDING (2.5 Months)**
- ✅ **Wave 1-2 (Week 1-4):** Foundation & Setup - COMPLETED
  - MVP built, Sepolia testnet live, investor materials ready
- 🔜 **Wave 3-4 (Week 5-8):** Build & Optimize - NEXT
  - User acquisition (1,000+ beta users), Polygon Mumbai testnet, business model validation
- 🎯 **Wave 5 (Week 9-10):** Pitch & Raise - FUNDING FOCUSED
  - **Target: $500K-$1M seed round**, 20+ VC meetings, term sheet execution

**PHASE 2: POST-FUNDING (2.5 Months)**
- 📋 **Wave 6-7:** Smart contracts & on-chain logic on Polygon PoS mainnet
- 📋 **Wave 8-9:** DAO governance, zkEVM integration, scaling optimization
- 🚀 **Wave 10:** Production mainnet launch with full features

> 🌐 **Network Migration:** Currently on Polygon Amoy Testnet → Future migration to Polygon PoS Mainnet planned in Wave 6-7

### 📊 Application Category

**NECTIQ is a hybrid DeFi + GameFi + SocialFi platform:**
- 🎮 **GameFi (45%)** - 4 game modes, play-to-earn, tournaments, gamification
- 💰 **DeFi (40%)** - Multi-chain, smart contracts, token economics, DAO governance
- 👥 **SocialFi (15%)** - Referrals, leaderboards, social features, community

**Primary Classification:** "GameFi Prediction Platform with DeFi Infrastructure on Polygon"

### 📄 Documentation

- **[Full Roadmap](ROADMAP.md)** - Complete 10-wave development plan with funding strategy
- **[Security Audit](SECURITY_AUDIT_REPORT.md)** - Security audit results (9/10 score)
- **[API Documentation](#-api-documentation)** - Complete API reference below

---

<div align="center">

**Built with ❤️ by the NECTIQ Team**

[Website](https://nectiq.io) • [Twitter](https://twitter.com/nectiq) • [Discord](https://discord.gg/nectiq)

</div>
