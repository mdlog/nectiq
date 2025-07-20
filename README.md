# 🚀 Nectiq - Cryptocurrency Price Prediction Platform

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)

Nectiq is a gamified cryptocurrency price prediction platform that allows users to make predictions on cryptocurrency prices and earn rewards based on their accuracy. The platform features modern Web3 wallet integration, real-time price feeds, and a comprehensive reward system.

## ✨ Features

### 🎯 Core Functionality
- **Price Predictions**: Make predictions on Bitcoin, Ethereum, BNB, Cardano, and Solana
- **Multiple Timeframes**: 1 hour, 6 hours, 24 hours, and 7 days prediction windows
- **Accuracy-Based Rewards**: Up to 5x multiplier for perfect predictions (±0.1% accuracy)
- **Stake System**: Stake 50-500 NTIQ points on your predictions

### 🔐 Authentication & Wallet Integration
- **Multi-Chain Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Dynamic Labs Integration**: Seamless Web3 authentication with auto-registration
- **Complete Wallet Disconnect**: Full logout with MetaMask confirmation required for reconnection
- **Admin Panel**: Secure admin access with wallet-based authentication

### 💰 Financial System
- **Multi-Chain Deposits**: Support for ETH, USDC, USDT across 7 blockchain networks
- **Automated Withdrawals**: Smart contract-based withdrawal processing
- **Real-Time Balance**: Live balance updates with comprehensive transaction history
- **Fee Structure**: Transparent 2.5% withdrawal fee system

### 🏆 Gamification
- **Achievement System**: Unlock achievements for various milestones
- **Leaderboard**: Live rankings based on accuracy and total rewards
- **Battle Mode**: Challenge other users in prediction battles
- **Survival Tournaments**: Multi-round elimination tournaments
- **Daily Challenges**: Time-limited challenges with bonus rewards

### 📊 Real-Time Features
- **Live Price Charts**: Interactive TradingView-style charts with multiple timeframes
- **Synchronized Prices**: All users see identical real-time prices
- **Activity Feed**: Live updates of platform activities
- **WebSocket Integration**: Real-time notifications and updates

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

### Web3 Integration
- **Dynamic Labs** for wallet authentication
- **Wagmi + Web3Modal** for wallet connections
- **Ethers.js** for blockchain interactions
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

## ⚙️ Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Dynamic Labs (Web3 Authentication)
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

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

## 🔒 Security Features

- **Wallet-Based Authentication**: Secure Web3 wallet integration
- **Session Management**: Secure server-side session handling
- **Input Validation**: Comprehensive data validation using Zod
- **Rate Limiting**: API rate limiting and abuse prevention
- **Admin Protection**: Multi-layer admin authentication
- **Audit Logging**: Complete transaction and activity audit trails

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure MetaMask or supported wallet is installed
   - Check network configuration
   - Verify Dynamic Labs environment ID

2. **Database Connection Issues**
   - Verify DATABASE_URL is correctly set
   - Ensure PostgreSQL is running
   - Run `npm run db:push` to update schema

3. **Price Data Not Loading**
   - Check CoinGecko API connectivity
   - Verify rate limiting isn't blocking requests
   - Check console for API errors

4. **Deposit/Withdrawal Issues**
   - Verify contract addresses are correct
   - Check RPC URL connectivity
   - Ensure sufficient gas for transactions

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