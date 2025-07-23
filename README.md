# Nectiq - Cryptocurrency Price Prediction Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2020.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Dynamic Labs](https://img.shields.io/badge/Dynamic_Labs-Web3_Auth-purple.svg)](https://www.dynamic.xyz/)

Nectiq is a cutting-edge cryptocurrency price prediction platform that transforms trading into an interactive and engaging experience. Users can make predictions on cryptocurrency prices, participate in prediction battles, survival tournaments, and earn rewards based on their accuracy using real-time Pyth Network price feeds.

## 🌟 Features

### Core Prediction System
- **Multi-Timeframe Predictions**: Support for 1 hour, 6 hours, 24 hours, and 7-day predictions
- **13 Major Cryptocurrencies**: Bitcoin, Ethereum, Solana, BNB, Cardano, Dogecoin, Ripple, Avalanche, Chainlink, Litecoin, Bitcoin Cash, Ethereum Classic, Aptos, Sui, Hyperliquid, and OKB
- **Accuracy-Based Rewards**: 5x multiplier for perfect predictions (±0.1% accuracy)
- **Real-Time Price Feeds**: Powered exclusively by Pyth Network for institutional-grade data accuracy
- **Advanced Charting**: Ultra-modern Binance-style charts with real-time green dot price indicators

### Gaming Features
- **Prediction Battles**: Head-to-head competitions between users with live win probability calculations
- **Survival Tournaments**: Last-player-standing competitions with escalating rounds and shared prize pools
- **Achievement System**: Comprehensive unlockable achievements for various milestones
- **Global Leaderboard**: Rankings based on total rewards including survival tournaments, battles, and prediction accuracy
- **NTIQ Token Economy**: Integrated point system for staking, rewards, and platform activities

### User Experience
- **Web3 Wallet Integration**: Support for MetaMask, WalletConnect, and 20+ wallets via Dynamic Labs
- **Modern Dashboard**: Comprehensive user analytics with modern sidebar navigation and real-time statistics
- **Professional Charts**: Chart.js-powered visualization with green dot running price indicators and gradient backgrounds
- **Live Price Updates**: Real-time cryptocurrency prices updating every 1-3 seconds
- **Responsive Design**: Optimized for desktop and mobile with ultra-modern UI components

### Financial System
- **Multi-Chain Deposits/Withdrawals**: Support for ETH, USDC, and USDT across multiple networks
- **Automated Processing**: Smart withdrawal system with fraud detection and automated approval for transactions ≤$500 USD
- **Comprehensive Admin Panel**: Full platform management with security monitoring and user oversight
- **Complete Audit Trail**: Detailed transaction logging for all financial operations
- **Firebase Email Verification**: Optional Gmail linking for enhanced account security

## 🚀 Technology Stack

### Frontend Architecture
- **React 18** with TypeScript and modern hooks
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS + Shadcn/ui** for premium component design
- **TanStack Query** for advanced server state management
- **Chart.js** with custom plugins for real-time cryptocurrency visualization
- **Dynamic Labs** for enterprise-grade Web3 wallet authentication
- **Wouter** for lightweight client-side routing

### Backend Architecture  
- **Node.js + Express.js** with TypeScript ESM modules
- **Drizzle ORM** with PostgreSQL for type-safe database operations
- **Neon Database** for serverless PostgreSQL with connection pooling
- **Express Session** with secure cookie-based authentication
- **Comprehensive API** with 50+ endpoints for platform operations

### Real-Time Data & Blockchain
- **Pyth Network** - Exclusive source for institutional-grade price feeds (NO CoinGecko pricing)
- **CoinGecko API** - Only for cryptocurrency metadata and logo fetching
- **Multi-Chain Support** - Ethereum, BSC, Optimism, Arbitrum networks
- **Automated Services** - 24/7 monitoring for deposits, withdrawals, and tournaments

### Development & Security
- **Replit Hosting** with automated deployment and scaling
- **Comprehensive Security** - Anti-fraud systems, IP monitoring, audit logging
- **Admin Security** - Multi-wallet admin authentication with session management
- **Financial Security** - Automated withdrawal limits, fraud detection, balance validation

## 📋 Prerequisites

- Node.js 20.0.0 or higher
- PostgreSQL database (Neon Database recommended)
- Web3 wallet (MetaMask recommended)
- Dynamic Labs account for wallet authentication
- Pyth Network access for real-time price feeds

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd nectiq-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file with required variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your-pg-host
PGPORT=5432
PGUSER=your-pg-user
PGPASSWORD=your-pg-password
PGDATABASE=your-pg-database

# Session Security
SESSION_SECRET=your-secure-session-secret

# Dynamic Labs Configuration (Required)
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Firebase Configuration (Optional - for email verification)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Admin Configuration (Required for admin features)
ADMIN_WALLET_ADDRESSES=0x1234...,0x5678...
ADMIN_PRIVATE_KEY=your-admin-private-key-for-automated-withdrawals

# External APIs (Required for full functionality)
ETHERSCAN_API_KEY=your-etherscan-api-key
```

### 4. Database Setup
```bash
# Initialize database schema
npm run db:push

# Generate TypeScript types
npm run db:generate
```

### 5. Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🎮 Platform Features

### Current Gaming Components
- **Active Predictions**: Real-time tracking with countdown timers and accuracy calculations
- **Prediction Battles**: 1v1 competitions with live probability calculations
- **Survival Tournaments**: Multi-round elimination tournaments with shared prize pools
- **Comprehensive Leaderboard**: Global rankings including all gaming activities with correct total rewards calculation
- **Recent Rewards System**: Live tracking of wins, losses, and tournament prizes including survival tournament rewards

### Live Price System
- **Pyth Network Integration**: 13 cryptocurrencies with real-time institutional data
- **Chart Visualization**: Ultra-modern charts with green dot running price indicators and gradient backgrounds
- **Live Updates**: 1-second price refresh intervals for maximum accuracy
- **Professional UI**: Binance-inspired design with premium cyan theme and Roboto typography

## 🌐 Supported Networks

### Current Implementation
- **Sepolia Testnet** - Primary development and testing network
- **Holesky Testnet** - Alternative Ethereum testnet
- **Multi-Chain Ready** - Architecture supports Ethereum, BSC, Optimism, Arbitrum

### Supported Cryptocurrencies (Pyth Network Only)
1. **Bitcoin (BTC)** - $118,522 (example live price)
2. **Ethereum (ETH)** - $3,672 (example live price)
3. **Solana (SOL)** - $197 (example live price)
4. **BNB (BNB)** - $759 (example live price)
5. **Cardano (ADA)** - $0.87 (example live price)
6. **Dogecoin (DOGE)** - $0.27 (example live price)
7. **Ripple (XRP)** - $3.48 (example live price)
8. **Avalanche (AVAX)** - $25.44 (example live price)
9. **Chainlink (LINK)** - Live pricing
10. **Litecoin (LTC)** - Live pricing
11. **Bitcoin Cash (BCH)** - Live pricing
12. **Ethereum Classic (ETC)** - Live pricing
13. **Aptos (APT)** - Live pricing
14. **Sui (SUI)** - Live pricing
15. **Hyperliquid (HYPE)** - Live pricing
16. **OKB (OKB)** - Live pricing

## 📊 API Architecture

### Core Endpoints
- `GET /api/crypto/pyth-prices` - Real-time Pyth Network price feeds
- `GET /api/crypto/prices` - Formatted cryptocurrency prices with metadata
- `GET /api/user` - Current user session and statistics
- `GET /api/leaderboard` - Global rankings with enhanced calculations including survival rewards

### Gaming System
- `GET /api/predictions/active` - Live predictions with real-time updates
- `GET /api/battles` - Active prediction battles
- `GET /api/survival-tournaments` - Tournament system management
- `GET /api/rewards/recent` - Recent gaming activity including survival tournaments

### Financial Operations
- `POST /api/deposits` - Multi-chain deposit creation with countdown timers
- `POST /api/withdrawals` - Automated withdrawal processing
- `GET /api/transactions` - Complete transaction history

### Admin Panel (50+ endpoints)
- Complete user management, financial oversight, security monitoring
- Real-time statistics, transaction management, platform configuration
- Advanced security features with audit logging and IP monitoring

## 🔧 Current Platform Status

### Active Features
- **Total Users**: 5 registered users
- **Total Predictions**: 4 completed predictions
- **Active Battles**: 1 ongoing battle
- **Survival Tournaments**: 1 completed tournament (QuantumShark2230 won 100 NTIQ)
- **Total Rewards Distributed**: 575 NTIQ
- **Price Update Frequency**: 1-3 seconds for all cryptocurrencies

### Database Schema
- **15+ tables**: users, predictions, battles, survival_tournaments, deposits, withdrawals, transaction_logs, etc.
- **Complete relationships**: Foreign keys, indexes, and constraints
- **Audit trail**: transaction_logs table for all financial operations including survival tournament rewards

### Recent Major Fixes (July 2025)
- ✅ **Survival Rewards System**: Fixed getUserSurvivalHistory() method and API integration
- ✅ **Leaderboard Calculations**: Enhanced with survival tournament rewards inclusion
- ✅ **Chart Visualization**: Implemented ultra-modern Binance-style charts with green dot indicators
- ✅ **Price Synchronization**: Achieved 1-second real-time price updates across all components
- ✅ **Tournament Integration**: Complete survival tournament system with proper reward distribution

## 🔒 Security Implementation

### Multi-Layer Security
- **Authentication**: Wallet signature verification + session management
- **Financial Security**: Automated fraud detection, withdrawal limits, balance validation
- **Admin Security**: Multi-wallet admin verification with audit logging
- **Platform Security**: IP monitoring, rate limiting, comprehensive security events

### Anti-Fraud Systems
- Real-time transaction monitoring
- Automated deposit/withdrawal security checks
- IP blacklisting and suspicious activity detection
- Complete audit trail for all operations

## 🚀 Deployment

### Current Environment
- **Platform**: Replit with custom domain support
- **Database**: Neon PostgreSQL with connection pooling
- **Admin Access**: Multi-wallet authentication system active
- **Security**: Comprehensive anti-fraud and monitoring systems operational

### Production Features
- Automated withdrawal processing (≤$500 USD)
- Real-time price feeds with 1-second updates
- Complete admin panel with security monitoring
- Multi-chain deposit/withdrawal support
- Advanced user dashboard with sidebar navigation

## 🛠️ Troubleshooting

### Known Limitations
- **Pyth Network Compatibility**: Only cryptocurrencies with verified Pyth Feed IDs supported
- **Domain Authorization**: Firebase requires current domain in authorized domains list
- **Admin Features**: Requires proper environment variable configuration

### Performance Metrics
- **API Response Time**: ~200ms for price feeds
- **Database Queries**: Optimized with connection pooling
- **Real-Time Updates**: Sub-second price synchronization
- **Chart Performance**: 60fps with smooth animations

## 🤝 Contributing

### Development Standards
- TypeScript strict mode with comprehensive type safety
- Pyth Network exclusive pricing (NO CoinGecko for prices)
- Modern React patterns with hooks and context
- Comprehensive error handling and logging

### Code Quality
- ESLint + Prettier configuration
- Drizzle ORM for type-safe database operations
- Comprehensive API documentation
- Security-first development approach

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pyth Network** - Exclusive provider of institutional-grade cryptocurrency price feeds
- **Dynamic Labs** - Enterprise Web3 wallet authentication platform
- **CoinGecko** - Cryptocurrency metadata and logo provider (images only)
- **Neon Database** - Serverless PostgreSQL hosting solution
- **Replit** - Development platform and hosting infrastructure

## 📞 Support & Contact

For technical support and platform inquiries:
- **GitHub Issues**: Create detailed bug reports and feature requests
- **Security Issues**: Use responsible disclosure for security vulnerabilities
- **Platform Status**: All systems operational with real-time monitoring

---

**🚀 Nectiq - The Future of Cryptocurrency Prediction Gaming**