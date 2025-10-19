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
- **Networks:** Ethereum, Base, BSC, Optimism, Arbitrum, Sepolia, Holesky, Polygon Amoy
- **Wallets:** MetaMask, WalletConnect, Coinbase Wallet, Pelagus
- **Smart Contracts:** Enhanced Prediction Staking, Battle Escrow, Parlay Staking, Multi-Token Vault, Prediction Insurance, Referral System, NFT Achievement System
- **Development:** Hardhat, OpenZeppelin Contracts

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
DEPLOYER_PRIVATE_KEY=your_deployer_private_key

# NTIQ Token (Polygon Amoy)
NTIQ_TOKEN_ADDRESS_AMOY=0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f
POLYGON_AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/your_project_id

# Smart Contract Addresses (Polygon Amoy Testnet)
ENHANCED_PREDICTION_STAKING_ADDRESS=0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3
ENHANCED_PARLAY_STAKING_ADDRESS=0x87D08a494D960240d3a2D5CdB155084CAF222584
BATTLE_ESCROW_ADDRESS=0x65CBABb0864de26fc753F5044277644f72Df8490
MULTI_TOKEN_VAULT_ADDRESS=0xe124893F7E1d5bF82586680c590f9510b6dCf42e
PREDICTION_INSURANCE_ADDRESS=0x170aF9d61945c6AbD8619d6cafbd03E5fC8ae3Ce
REFERRAL_SYSTEM_ADDRESS=0x7E9F85CDDb70A0d3Ab7738B61610d1774867c8e2
NFT_ACHIEVEMENT_SYSTEM_ADDRESS=0x57c5aE2C1ed8ef90e264D165b5A7F7C750C50C3f

# Backend Signer
BACKEND_SIGNER_PRIVATE_KEY=your_backend_signer_private_key

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

#### Smart Contract Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ENHANCED_PREDICTION_STAKING_ADDRESS` | Enhanced Prediction Staking contract address | Yes | - |
| `ENHANCED_PARLAY_STAKING_ADDRESS` | Enhanced Parlay Staking contract address | Yes | - |
| `BATTLE_ESCROW_ADDRESS` | Battle Escrow contract address | Yes | - |
| `MULTI_TOKEN_VAULT_ADDRESS` | Multi-Token Vault contract address | Yes | - |
| `PREDICTION_INSURANCE_ADDRESS` | Prediction Insurance contract address | Yes | - |
| `REFERRAL_SYSTEM_ADDRESS` | Referral System contract address | Yes | - |
| `NFT_ACHIEVEMENT_SYSTEM_ADDRESS` | NFT Achievement System contract address | Yes | - |
| `BACKEND_SIGNER_PRIVATE_KEY` | Backend signer private key for contract interactions | Yes | - |

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

## 🔗 Smart Contracts

NECTIQ uses a comprehensive suite of smart contracts deployed on **Polygon Amoy Testnet** to ensure transparency, security, and decentralization. All contracts are **blockchain-first**, meaning predictions, battles, and parlays are only created after successful blockchain transaction confirmation.

### 📍 Contract Addresses (Polygon Amoy Testnet)

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

### 🪙 Supported Tokens (Polygon Amoy)

| Token | Address | Decimals | Purpose |
|-------|---------|----------|---------|
| **WETH** | `0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619` | 18 | Wrapped Ethereum |
| **USDC** | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` | 6 | USD Coin |
| **LINK** | `0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39` | 18 | Chainlink Token |

### 🔧 Smart Contract Functions

#### 1. **Enhanced Prediction Staking Contract**

**Purpose:** Handles prediction staking and reward distribution with blockchain-first approach.

**Key Functions:**
```solidity
// Lock stake for prediction
function lockStake(
    bytes32 predictionId,
    uint256 amount,
    uint256 duration,
    uint256 predictedPrice
) external returns (bool);

// Release reward after prediction resolution
function releaseReward(
    bytes32 predictionId,
    uint256 actualPrice
) external returns (bool);
```

**Features:**
- ✅ **Blockchain-First:** Predictions only created after successful stake lock
- ✅ **Automatic Rewards:** Rewards released based on prediction accuracy
- ✅ **Transparent:** All transactions verifiable on blockchain
- ✅ **Secure:** Stake locked until prediction resolution

#### 2. **Enhanced Parlay Staking Contract**

**Purpose:** Manages TrendRide/Parlay predictions with compound staking and rewards.

**Key Functions:**
```solidity
// Lock stake for parlay prediction
function lockParlayStake(
    bytes32 parlayId,
    uint256 amount,
    uint8 coinCount,
    uint256 duration
) external returns (bool);

// Release compound reward for winning parlay
function releaseCompoundReward(
    bytes32 parlayId
) external returns (bool);
```

**Features:**
- ✅ **Compound Staking:** Multiple predictions in single transaction
- ✅ **Higher Multipliers:** Increased rewards for successful parlays
- ✅ **All-or-Nothing:** All predictions must win to claim rewards
- ✅ **Blockchain Verification:** Every parlay verified on-chain

#### 3. **Battle Escrow Contract**

**Purpose:** Manages head-to-head prediction battles with escrow functionality.

**Key Functions:**
```solidity
// Create new battle
function createBattle(
    bytes32 battleId,
    uint256 stakeAmount
) external returns (bool);

// Accept battle challenge
function acceptBattle(
    bytes32 battleId
) external returns (bool);

// Resolve battle and distribute rewards
function resolveBattle(
    bytes32 battleId,
    address winner
) external returns (bool);
```

**Features:**
- ✅ **Escrow System:** Stakes locked until battle resolution
- ✅ **Winner Takes All:** Winner receives both stakes (minus platform fee)
- ✅ **Fair Resolution:** Automated winner determination
- ✅ **Transparent:** All battle data on blockchain

#### 4. **Multi-Token Vault Contract**

**Purpose:** Manages multi-chain token deposits and withdrawals with signature-based security.

**Key Functions:**
```solidity
// Deposit POL (native token)
function depositPOL() external payable;

// Deposit ERC20 tokens
function depositToken(
    address token,
    uint256 amount
) external;

// Request withdrawal with signature
function requestWithdrawal(
    address token,
    uint256 amount,
    bytes signature
) external;

// Get user balance for specific token
function getUserBalance(
    address user,
    address token
) external view returns (uint256);
```

**Features:**
- ✅ **Multi-Token Support:** POL, WETH, USDC, LINK, NTIQ
- ✅ **Signature Security:** Withdrawals require backend signature
- ✅ **Automated Processing:** Backend monitors and processes withdrawals
- ✅ **Real-time Balances:** Live balance updates from blockchain

#### 5. **Prediction Insurance Contract**

**Purpose:** Provides insurance for failed predictions to reduce user risk.

**Key Functions:**
```solidity
// Buy insurance for prediction
function buyInsurance(
    bytes32 predictionId,
    uint256 stakeAmount
) external returns (bool);

// Claim insurance refund
function claimInsurance(
    bytes32 predictionId
) external returns (bool);

// Get insurance details
function getInsuranceClaim(
    bytes32 predictionId
) external view returns (
    address user,
    uint256 stakeAmount,
    uint256 insuranceCost,
    uint256 refundAmount,
    bool claimed,
    uint256 timestamp
);
```

**Features:**
- ✅ **Risk Mitigation:** Partial refund for failed predictions
- ✅ **Optional Coverage:** Users can choose to buy insurance
- ✅ **Transparent Claims:** All insurance data on blockchain
- ✅ **Fair Pricing:** Insurance cost based on prediction risk

#### 6. **Referral System Contract**

**Purpose:** Tracks referrals and distributes referral rewards on-chain.

**Key Functions:**
```solidity
// Register referral relationship
function registerReferral(
    address referrer,
    address referee
) external returns (bool);

// Get referral data for user
function getReferralData(
    address referee
) external view returns (
    address referrer,
    uint256 totalEarnings,
    uint256 totalActivities,
    bool active
);

// Get total referral earnings
function getUserTotalReferralEarnings(
    address referrer
) external view returns (uint256);
```

**Features:**
- ✅ **On-Chain Tracking:** All referrals recorded on blockchain
- ✅ **Automatic Rewards:** Referral rewards distributed automatically
- ✅ **Transparent:** Referral relationships publicly verifiable
- ✅ **Sustainable:** Rewards based on referred user activity

#### 7. **NFT Achievement System Contract**

**Purpose:** Manages achievement NFTs and tracks user progress on-chain.

**Key Functions:**
```solidity
// Get achievement details
function getAchievement(
    uint256 achievementId
) external view returns (
    uint256 id,
    string category,
    string name,
    string description,
    uint256 threshold,
    bool isMintable
);

// Get user progress for category
function getUserProgress(
    address user,
    string category
) external view returns (uint256);

// Check if user has minted achievement
function checkUserHasMinted(
    address user,
    uint256 achievementId
) external view returns (bool);

// Standard ERC721 functions
function balanceOf(address owner) external view returns (uint256);
function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
```

**Features:**
- ✅ **ERC721 Standard:** Compatible with all NFT marketplaces
- ✅ **Progress Tracking:** User progress tracked on-chain
- ✅ **Achievement Categories:** Multiple achievement types
- ✅ **Mintable NFTs:** Users can mint achievement NFTs

### 🔒 Security Features

#### Blockchain-First Architecture
- **No Off-Chain Predictions:** All predictions require blockchain transaction
- **Transparent Operations:** Every action verifiable on blockchain
- **Immutable Records:** Prediction history cannot be altered
- **Decentralized Verification:** No single point of failure

#### Smart Contract Security
- **OpenZeppelin Standards:** Using battle-tested security libraries
- **Access Control:** Role-based permissions for admin functions
- **Reentrancy Protection:** Protection against reentrancy attacks
- **Pausable Contracts:** Emergency pause functionality

#### Multi-Signature Security
- **Admin Multi-Sig:** Critical functions require multiple signatures
- **Timelock Delays:** Important changes have delay periods
- **Governance Integration:** Community can vote on protocol changes

### 🌐 Network Configuration

**Primary Network:** Polygon Amoy Testnet
- **Chain ID:** 80002
- **RPC URL:** `https://rpc-amoy.polygon.technology`
- **Explorer:** `https://amoy.polygonscan.com`
- **Native Token:** MATIC

**Supported Networks for Deposits:**
- Ethereum (Mainnet & Sepolia)
- Base (Mainnet)
- BSC (Mainnet)
- Optimism (Mainnet)
- Arbitrum (Mainnet)
- Polygon (Amoy Testnet)

### 📊 Contract Interaction Flow

```mermaid
graph TD
    A[User Creates Prediction] --> B[Approve NTIQ Token]
    B --> C[Call lockStake Function]
    C --> D[Stake Locked on Blockchain]
    D --> E[Prediction Created in Database]
    E --> F[Wait for Price Resolution]
    F --> G[Call releaseReward Function]
    G --> H[Reward Distributed]
    
    I[User Creates Battle] --> J[Call createBattle Function]
    J --> K[Stake Escrowed]
    K --> L[Battle Created in Database]
    L --> M[Opponent Accepts Battle]
    M --> N[Call acceptBattle Function]
    N --> O[Both Stakes Escrowed]
    O --> P[Battle Resolution]
    P --> Q[Call resolveBattle Function]
    Q --> R[Winner Receives Rewards]
```

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

**Current Status:** Wave 1-2 Complete ✅ | **Next:** Wave 3-4 (Build & Optimize) 🔜

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
