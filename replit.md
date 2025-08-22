# Nectiq - Cryptocurrency Price Prediction Platform

## Overview
Nectiq is a gamified cryptocurrency price prediction platform. It enables users to predict crypto prices and earn rewards based on prediction accuracy, fostering user interaction through prediction battles, tournaments, and a robust reward system. The platform's business vision is to optimize profitability while providing attractive rewards and an engaging user experience with real-time data and a competitive environment.

## User Preferences
```
Preferred communication style: Simple, everyday language.
```

## System Architecture
Nectiq features a modern React frontend and a Node.js/Express backend with a PostgreSQL database.

## Recent Critical Fixes (August 2025)
- **✅ DEPOSIT TRANSACTION HASH AUTO-CAPTURE**: Fixed critical issue where deposit transaction hashes were not automatically saved, requiring manual intervention for every deposit. Frontend now automatically updates deposits with transaction hashes via `/api/deposits/:id/update-transaction` endpoint when transactions are sent through Wagmi hooks.
- **✅ TRENDRIDE REBRANDING 100% COMPLETE**: Successfully migrated all "Parlay" references to "TrendRide" across the entire platform (August 22, 2025). Updated frontend components, navigation menus (desktop and mobile), admin panel, UI text, variable names, function declarations, export functionality, and debug logs for consistent branding throughout the application. URL routing remains `/parlay` for backend consistency while display names show "TrendRide".
- **✅ WALLET DISCONNECTION STATE MANAGEMENT**: Fixed critical wallet disconnect bug where user balance remained visible and users could create battles after wallet disconnection. Implemented proper state clearing, cache invalidation, and global wallet address reset on disconnect.
- **✅ ROUTING PROTECTION SYSTEM**: Implemented comprehensive ProtectedRoute component with wallet requirement enforcement. Pages requiring wallet connection automatically redirect to homepage with English notification when accessed without wallet. Leaderboard and How-to-Play remain accessible without wallet.

**Frontend:**
- **Framework & UI**: React 18 with TypeScript, utilizing Shadcn/ui components and Radix UI primitives, styled with Tailwind CSS.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter for client-side routing.
- **Web3 Integration**: Wagmi and Web3Modal for wallet connections, with Rainbow Kit for an enhanced wallet connection UI.
- **Build**: Vite.
- **UI/UX Decisions**: Focus on a clean, professional interface with modern design elements, consistent spacing, and intuitive navigation. Charts leverage TradingView Lightweight Charts for professional trading visualization with real-time updates and customizable timeframes. Automatic OS theme detection provides dark/light mode experience.

**Backend:**
- **Runtime & Framework**: Node.js with TypeScript (ESM modules) and Express.js.
- **Database**: PostgreSQL via Drizzle ORM, hosted on Neon Database for serverless capabilities.
- **Authentication**: Supports both traditional username/password and Web3 wallet authentication. New wallet addresses are auto-registered. Includes session-based authentication with secure cookie handling and admin access via designated wallets.
- **Core Features**:
    - **Prediction Engine**: Supports various cryptocurrencies (Bitcoin, Ethereum, BNB, Cardano, Solana, Dogecoin, Ripple, Avalanche) and timeframes (1 hour, 6 hours, 24 hours, 7 days). Includes both accuracy-based regular predictions and UP/DOWN parlay predictions with fixed multipliers.
    - **Reward System**: Point-based economy (NTIQ) with multipliers for accuracy, progressive rewards, achievements, and daily challenges.
    - **Real-Time Features**: Live cryptocurrency price updates (1-second intervals), interactive price charts, active prediction tracking with countdown timers, and a live leaderboard.
    - **Gamified Elements**: Prediction Battles (head-to-head challenges) and Survival Tournaments (elimination-based predictions) with fair play mechanisms.
    - **Financial System**: Multi-chain deposit and withdrawal system (ETH, USDC, USDT) with automated processing, real-time tracking, and integrated fee structures. Automated monitoring of processing withdrawals with blockchain confirmation. Automatic MetaMask chain switching for admin approvals with full mobile wallet support.
    - **Security**: Robust security measures including input validation, CORS, secure session management, anti-multi wallet abuse (device fingerprinting, IP tracking), and comprehensive admin oversight tools.
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
- **lightweight-charts**: TradingView Lightweight Charts library for professional chart visualization.
- **@radix-ui/react-***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Component variant management.
- **lucide-react**: Icon library.
- **vite**, **tsx**, **esbuild**: Development and build tools.
- **Etherscan API**: Used for monitoring and verifying blockchain transactions (deposits, withdrawals).
- **Firebase**: For linking wallet addresses with Gmail verification.

## Security Architecture
- **Environment Variables**: All sensitive data (API keys, wallet addresses, database credentials) stored securely in Replit Secrets
- **Secret Management**: Complete migration from hardcoded values to environment variables completed August 2025
- **Database Security**: Neon PostgreSQL with encrypted connections and environment-based authentication
- **API Security**: Secured endpoints with proper authentication and authorization middleware