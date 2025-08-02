# Nectiq - Cryptocurrency Price Prediction Platform

## Overview
Nectiq is a gamified cryptocurrency price prediction platform. It enables users to predict crypto prices and earn rewards based on prediction accuracy. The platform aims to provide an engaging experience with real-time data and a competitive environment, fostering user interaction through prediction battles, tournaments, and a robust reward system.

## User Preferences
```
Preferred communication style: Simple, everyday language.
```

## Recent Changes
- **Admin Panel Enhancement (2025-08-02)**: Successfully resolved admin panel loading issues and enhanced transaction display functionality. Fixed TypeScript errors, improved backend API to return comprehensive transaction data with usernames and formatted amounts, and created professional admin interface with full navigation tabs.
- **Transaction Display Improvements (2025-08-02)**: Enhanced transactions table with username display instead of user IDs, formatted NTIQ amounts (e.g., "10,000 NTIQ"), clickable blockchain explorer links for transaction hashes, and proper token amount formatting.
- **Database Reset Fix (2025-08-02)**: Fixed disabled reset database button in admin panel Settings tab. Added proper input validation, dynamic button state management, and debug logging to `admin-working.tsx`.
- **Project Cleanup (2025-08-02)**: Removed unused admin files (`admin.tsx`, `admin-simple.tsx`). Only `admin-working.tsx` remains as the active admin panel implementation.

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
    - **Prediction Engine**: Supports various cryptocurrencies (Bitcoin, Ethereum, BNB, Cardano, Solana, Dogecoin, Ripple, Avalanche) and timeframes (1 hour, 6 hours, 24 hours, 7 days). Accuracy is percentage-based with reward multipliers.
    - **Reward System**: Point-based economy (NTIQ) with multipliers for accuracy, progressive rewards, achievements, and daily challenges.
    - **Real-Time Features**: Live cryptocurrency price updates (1-second intervals), interactive price charts, active prediction tracking with countdown timers, and a live leaderboard.
    - **Gamified Elements**: Prediction Battles (head-to-head challenges) and Survival Tournaments (elimination-based predictions) with fair play mechanisms (anti-last minute joining, fair fee structure).
    - **Financial System**: Multi-chain deposit and withdrawal system (ETH, USDC, USDT) with automated processing, real-time tracking, and integrated fee structures.
    - **Security**: Robust security measures including input validation, CORS, secure session management, anti-multi wallet abuse (device fingerprinting, IP tracking), and comprehensive admin oversight tools for security events and user management.
    - **Architecture Decisions**: Emphasis on modularity, scalability, and maintainability. Components are designed for reusability, and services are decoupled to ensure clear responsibilities (e.g., `BalanceService` for all financial transactions). Prioritizes direct Pyth Network integration for institutional-grade real-time price feeds, minimizing reliance on other APIs for core price data.

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity.
- **drizzle-orm**: Type-safe database operations.
- **wagmi**, **web3modal**, **@rainbow-me/rainbowkit**: Web3 wallet connection and UI.
- **@tanstack/react-query**: Server state management.
- **axios**: HTTP client for external API calls (CoinGecko, Pyth Network).
- **CoinGecko API**: Used for real-time cryptocurrency prices, historical data, and image URLs.
- **Pyth Network**: Primary source for institutional-grade real-time cryptocurrency price feeds.
- **express-session**: For server-side session management.
- **Chart.js**: Used for fallback chart display if TradingView fails.
- **lightweight-charts**: TradingView Lightweight Charts library for professional chart visualization.
- **@radix-ui/react-***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Component variant management.
- **lucide-react**: Icon library.
- **vite**, **tsx**, **esbuild**: Development and build tools.
- **Etherscan API**: Used for monitoring and verifying blockchain transactions (deposits, withdrawals).
- **Firebase**: For linking wallet addresses with Gmail verification (currently requires domain authorization setup).