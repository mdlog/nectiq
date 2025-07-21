# 🚀 Nectiq - Advanced Cryptocurrency Price Prediction Platform

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Dynamic Labs](https://img.shields.io/badge/Dynamic_Labs-Web3_Auth-purple.svg)](https://www.dynamic.xyz/)
[![Firebase](https://img.shields.io/badge/Firebase-Email_Verification-orange.svg)](https://firebase.google.com/)

Nectiq is a cutting-edge gamified cryptocurrency price prediction platform that combines Web3 wallet authentication, Firebase email verification, and real-time trading analytics. Users can make predictions on cryptocurrency prices, engage in competitive battles, and earn rewards based on their accuracy. The platform features enterprise-grade security, multi-chain support, and professional trading interfaces.

## ✨ Features

### 🎯 Core Functionality
- **Price Predictions**: Make predictions on Bitcoin, Ethereum, BNB, Cardano, and Solana
- **Multiple Timeframes**: 1 hour, 6 hours, 24 hours, and 7 days prediction windows
- **Accuracy-Based Rewards**: Up to 5x multiplier for perfect predictions (±0.1% accuracy)
- **Stake System**: Stake 50-500 NTIQ points on your predictions

### 🔐 Advanced Authentication & Security
- **Dynamic Labs Integration**: Enterprise-grade wallet authentication with 20+ wallet support
- **Firebase Email Verification**: Link wallet addresses with Gmail for enhanced security
- **Dual Authentication Methods**: Traditional email login and Web3 wallet authentication
- **Multi-Chain Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Complete Session Management**: Full logout with MetaMask confirmation required for reconnection
- **Admin Panel Security**: Multi-layer admin authentication with wallet-based access control
- **Email Linking System**: Secure email verification with Google Sign-In integration

### 💰 Financial System
- **Multi-Chain Deposits**: Support for ETH, USDC, USDT across 7 blockchain networks
- **Automated Withdrawals**: Smart contract-based withdrawal processing
- **Real-Time Balance**: Live balance updates with comprehensive transaction history
- **Fee Structure**: Transparent 2.5% withdrawal fee system

### 🏆 Gamification & Competition
- **Achievement System**: Unlock achievements for various milestones
- **Live Leaderboard**: Real-time rankings based on accuracy and total rewards
- **Battle Mode**: Challenge other users in prediction battles
- **Survival Tournaments**: Multi-round elimination tournaments with prize pools
- **Daily Challenges**: Time-limited challenges with bonus rewards
- **Referral Program**: Invite friends and earn rewards for successful referrals

### 🛡️ Advanced Admin Features
- **Comprehensive User Management**: View, edit, and manage all user accounts
- **Enhanced CSV Export**: Export complete user data with 21+ fields including email verification status
- **Financial Oversight**: Monitor all deposits, withdrawals, and financial transactions
- **Security Monitoring**: Real-time security events and user activity tracking
- **Platform Analytics**: Detailed statistics and platform performance metrics
- **Multi-Chain Transaction Management**: Monitor and process transactions across all networks

### 📊 Advanced Real-Time Features
- **Professional Trading Charts**: Full TradingView widget integration with candlestick charts
- **Live Price Feeds**: Real-time cryptocurrency prices with 3-second synchronization
- **Optimized UI Layout**: Single-row horizontal Live Prices display (14 coins per page)
- **WebSocket Integration**: Real-time notifications and platform updates
- **Activity Feed**: Live updates of predictions, battles, and platform activities
- **Price Consistency**: Synchronized micro-variations ensuring all users see identical prices

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **Shadcn/ui** components with Radix UI primitives
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **Chart.js** for interactive price charts

### Backend
- **Node.js** with TypeScript (ESM modules)
- **Express.js** with session-based authentication
- **PostgreSQL** with Drizzle ORM
- **Neon Database** (serverless PostgreSQL)
- **WebSocket** for real-time communication

### Web3 & Authentication Integration
- **Dynamic Labs** for enterprise-grade wallet authentication
- **Firebase** for Google Sign-In email verification and user management
- **Wagmi + Web3Modal** for wallet connections and smart contract interactions
- **Reown (formerly WalletConnect)** for cross-platform wallet connectivity
- **Ethers.js** for blockchain interactions and transaction processing
- **Multi-chain support**: Ethereum, Base, BSC, Optimism, Arbitrum, Sepolia, Holesky

### External APIs
- **CoinGecko API** for real-time cryptocurrency prices
- **Blockchain APIs** for transaction verification

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Environment variables (see Configuration section)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nectiq
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🔧 Firebase Setup

To enable email verification with Gmail integration:

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one

2. **Configure Authentication**
   - Enable Authentication → Sign-in providers → Google
   - Add your domain to Authorized domains list

3. **Get Configuration Keys**
   - Project Settings → General → Your apps
   - Copy `apiKey`, `projectId`, and `appId` values

4. **Add to Environment Variables**
   - Set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`

For detailed setup instructions, see `FIREBASE_SETUP_INSTRUCTIONS.md`

## ⚙️ Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Dynamic Labs (Web3 Authentication)
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Firebase (Email Verification)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Session Security
SESSION_SECRET=your_session_secret

# Admin Configuration
ADMIN_WALLET_ADDRESSES=0xAddress1,0xAddress2
ADMIN_PRIVATE_KEY=your_admin_private_key

# Blockchain RPC URLs
ETH_RPC_URL=https://eth-mainnet.public.blastapi.io
BASE_RPC_URL=https://base-mainnet.public.blastapi.io
BSC_RPC_URL=https://bsc-dataseed.binance.org
OPTIMISM_RPC_URL=https://optimism-mainnet.public.blastapi.io
ARBITRUM_RPC_URL=https://arbitrum-mainnet.public.blastapi.io
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
HOLESKY_RPC_URL=https://ethereum-holesky-rpc.publicnode.com

# Contract Addresses (per network)
ETH_USDC_ADDRESS=0xA0b86a33E6441d6A
ETH_USDT_ADDRESS=0xdAC17F958D2ee523
# ... (add other network contract addresses)
```

### Optional Configuration

```env
# Development
NODE_ENV=development

# API Rate Limiting
COINGECKO_API_KEY=your_coingecko_pro_api_key

# Blockchain Explorer APIs
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 📁 Project Structure

```
nectiq/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── providers/     # React context providers
├── server/                # Backend Express application
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   ├── services/          # Business logic services
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── contracts/             # Smart contracts (Solidity)
├── scripts/              # Deployment and utility scripts
└── docs/                 # Documentation files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🌐 Supported Networks

### Mainnet
- **Ethereum** (ETH, USDC, USDT)
- **Base** (ETH, USDC, USDT)
- **BSC** (ETH, USDC, USDT)
- **Optimism** (ETH, USDC, USDT)
- **Arbitrum** (ETH, USDC, USDT)

### Testnet
- **Sepolia** (ETH, USDC, USDT)
- **Holesky** (ETH, USDC, USDT)

## 🎮 How to Play

1. **Connect Your Wallet**: Use any supported Web3 wallet to connect
2. **Get NTIQ Tokens**: Deposit ETH, USDC, or USDT to receive NTIQ points
3. **Make Predictions**: Choose a cryptocurrency and predict price movement
4. **Stake Your Confidence**: Stake 50-500 NTIQ on your prediction
5. **Earn Rewards**: Get up to 5x your stake for accurate predictions
6. **Compete**: Join battles, tournaments, and daily challenges
7. **Withdraw**: Convert your NTIQ back to crypto and withdraw

## 🏗️ Deployment

### Replit Deployment

1. **Configure Environment Variables** in Replit Secrets
2. **Run the Application**
```bash
npm run dev
```

### Production Deployment

1. **Build the Application**
```bash
npm run build
```

2. **Start the Production Server**
```bash
npm run start
```

### Database Setup

The application uses Drizzle ORM with PostgreSQL. Run migrations:

```bash
npm run db:push
```

## 🔒 Enterprise Security Features

- **Multi-Factor Authentication**: Wallet + Email verification for enhanced security
- **Firebase Integration**: Google Sign-In with email verification and user management
- **Session Management**: Secure server-side sessions with complete logout functionality
- **Input Validation**: Comprehensive data validation using Zod schemas
- **Rate Limiting**: Advanced API rate limiting with synchronized price variations
- **Admin Protection**: Multi-layer admin authentication with wallet-based access control
- **Real-Time Security Monitoring**: Live security event tracking and automated threat detection
- **Audit Logging**: Complete transaction and activity audit trails with comprehensive export
- **Deposit Security**: Automated deposit monitoring with integrity verification
- **Withdrawal Security**: Multi-chain automated withdrawal processing with fraud detection

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure MetaMask or supported wallet is installed
   - Check network configuration and wallet permissions
   - Verify Dynamic Labs environment ID in environment variables
   - Check browser console for connection errors

2. **Firebase Email Verification Issues**
   - Verify Firebase configuration keys are set correctly
   - Check that current domain is added to Firebase Authorized domains
   - Ensure Google Sign-In provider is enabled in Firebase Console
   - Review browser console for authentication errors

3. **Database Connection Issues**
   - Verify DATABASE_URL is correctly set and accessible
   - Ensure PostgreSQL database is running and accessible
   - Run `npm run db:push` to update database schema
   - Check database connection logs for connectivity issues

4. **Price Data Not Loading**
   - Check CoinGecko API connectivity and rate limits
   - Verify micro-variation system is functioning during rate limits
   - Check console for API errors and network issues
   - Ensure synchronized price variations are working correctly

5. **Admin Panel Access Issues**
   - Verify admin wallet addresses are correctly configured
   - Check authentication method compatibility (wallet/both)
   - Ensure proper session management after email verification
   - Review security monitoring for blocked access attempts

6. **Deposit/Withdrawal Issues**
   - Verify multi-chain contract addresses are correct
   - Check RPC URL connectivity for all supported networks
   - Ensure sufficient gas for blockchain transactions
   - Monitor automated processing systems status

7. **CSV Export and Data Management**
   - Check admin permissions for user data export
   - Verify UTF-8 encoding and special character handling
   - Ensure comprehensive user data fields are accessible
   - Monitor export functionality for large datasets

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please contact:
- Email: support@nectiq.com
- Documentation: Check `replit.md` for detailed system information
- Issues: Create an issue in this repository

## 🎯 Roadmap

- [ ] Mobile application development
- [ ] Additional cryptocurrency support
- [ ] Advanced charting features
- [ ] Social trading features
- [ ] NFT integration
- [ ] DeFi yield farming integration

---

**Built with ❤️ by the Nectiq Team**