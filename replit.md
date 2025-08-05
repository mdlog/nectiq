# Nectiq - Cryptocurrency Price Prediction Platform

## Overview
Nectiq is a gamified cryptocurrency price prediction platform. It enables users to predict crypto prices and earn rewards based on prediction accuracy. The platform aims to provide an engaging experience with real-time data and a competitive environment, fostering user interaction through prediction battles, tournaments, and a robust reward system, with the business vision of optimizing platform profitability while providing attractive rewards.

## User Preferences
```
Preferred communication style: Simple, everyday language.
```

## System Architecture
Nectiq features a modern React frontend and a Node.js/Express backend with a PostgreSQL database.

**Frontend:**
- **Framework & UI**: React 18 with TypeScript, utilizing Shadcn/ui components and Radix UI primitives, styled with Tailwind CSS.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter for client-side routing.
- **Web3 Integration**: Wagmi and Web3Modal for wallet connections, with Rainbow Kit for an enhanced wallet connection UI.
- **Build**: Vite.
- **UI/UX Decisions**: Focus on a clean, professional interface with modern design elements, consistent spacing, and intuitive navigation. Charts are designed for optimal readability, leveraging TradingView Lightweight Charts for professional trading visualization with real-time updates and customizable timeframes. Automatic OS theme detection provides a seamless dark/light mode experience.

**Backend:**
- **Runtime & Framework**: Node.js with TypeScript (ESM modules) and Express.js.
- **Database**: PostgreSQL via Drizzle ORM, hosted on Neon Database for serverless capabilities.
- **Authentication**: Supports both traditional username/password and Web3 wallet authentication. New wallet addresses are auto-registered. Includes session-based authentication with secure cookie handling and admin access via designated wallets.
- **Core Features**:
    - **Prediction Engine**: Supports various cryptocurrencies (Bitcoin, Ethereum, BNB, Cardano, Solana, Dogecoin, Ripple, Avalanche) and timeframes (1 hour, 6 hours, 24 hours, 7 days). Accuracy is percentage-based with reward multipliers (e.g., ≥ 99.5% = 3.0x, ≥ 90% = 0.9x). A platform fee of 4% is applied to winning predictions (1.5x, 2.0x, 3.0x multipliers).
    - **Reward System**: Point-based economy (NTIQ) with multipliers for accuracy, progressive rewards, achievements, and daily challenges.
    - **Real-Time Features**: Live cryptocurrency price updates (1-second intervals), interactive price charts, active prediction tracking with countdown timers, and a live leaderboard.
    - **Gamified Elements**: Prediction Battles (head-to-head challenges) and Survival Tournaments (elimination-based predictions) with fair play mechanisms.
    - **Financial System**: Multi-chain deposit and withdrawal system (ETH, USDC, USDT) with automated processing, real-time tracking, and integrated fee structures.
    - **Security**: Robust security measures including input validation, CORS, secure session management, anti-multi wallet abuse (device fingerprinting, IP tracking), and comprehensive admin oversight tools. Enterprise-grade security achieved through resolved vulnerabilities like hardcoded credentials, deprecated crypto algorithms, missing authentication, XSS, path traversal, input validation, and SQL injection protection.
    - **Architecture Decisions**: Emphasis on modularity, scalability, and maintainability. Components are designed for reusability, and services are decoupled. Prioritizes direct Pyth Network integration for institutional-grade real-time price feeds.

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity.
- **drizzle-orm**: Type-safe database operations.
- **wagmi**, **web3modal**, **@rainbow-me/rainbowkit**: Web3 wallet connection and UI.
- **@tanstack/react-query**: Server state management.
- **axios**: HTTP client for external API calls.
- **CoinGecko API**: Used for real-time cryptocurrency prices, historical data, and image URLs.
- **Pyth Network**: Primary source for institutional-grade real-time cryptocurrency price feeds.
- **express-session**: For server-side session management.
- **Chart.js**: Used for fallback chart display.
- **lightweight-charts**: TradingView Lightweight Charts library for professional chart visualization.
- **@radix-ui/react-***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Component variant management.
- **lucide-react**: Icon library.
- **vite**, **tsx**, **esbuild**: Development and build tools.
- **Etherscan API**: Used for monitoring and verifying blockchain transactions (deposits, withdrawals).
- **Firebase**: For linking wallet addresses with Gmail verification.

## Recent Updates (August 5, 2025)
### CSV Export System Enhancement Completed ✅
- **Complete Data Coverage**: All 8 export functions enhanced with comprehensive field coverage
- **Enhanced Exports**: Users, Predictions, Parlays, Battles, Survival, Transactions, Cryptocurrencies, Leaderboard
- **Timestamp File Naming**: All exports include timestamp-based naming for better organization
- **Null Value Handling**: Robust data validation and safe null value processing
- **Admin Security**: Enhanced admin-only access controls for all export functions

### Technical Stability Achieved ✅
- **TypeScript Resolution**: All LSP diagnostics and type errors completely resolved
- **Application Stability**: System running with enhanced error handling and performance
- **Data Integrity**: Improved data validation and type casting across all modules
- **Production Readiness**: Platform verified for stable production deployment

### Current System Status
- **All documentation updated**: 19 .md files refreshed with latest system status (August 5, 2025)
- **Error-free operation**: Zero TypeScript/React errors in current system state
- **Enhanced admin capabilities**: Complete CSV export system operational
- **Real-time monitoring**: All systems operational with comprehensive logging