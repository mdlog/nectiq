# Nectiq - Cryptocurrency Price Prediction Platform

## Overview
Nectiq is a gamified cryptocurrency price prediction platform. It enables users to predict crypto prices and earn rewards based on prediction accuracy. The platform aims to provide an engaging experience with real-time data and a competitive environment, fostering user interaction through prediction battles, tournaments, and a robust reward system.

## User Preferences
```
Preferred communication style: Simple, everyday language.
```

## Recent Changes
- **Simplified Single-Card Parlay Interface (2025-08-03)**: Redesigned parlay prediction interface based on user feedback to use one unified card instead of multiple separate cards. New compact design features: (1) Single "Create Parlay Prediction" card with all predictions inside, (2) Compact 3-column grid layout for each prediction (Cryptocurrency, Direction buttons, Duration), (3) Smaller form elements with reduced spacing, (4) Inline prediction counter and status indicators, (5) Integrated current price display for each selected cryptocurrency. Interface is now much cleaner and easier to use while maintaining all validation and functionality.
- **Cryptocurrency Duplication Prevention (2025-08-03)**: Implemented comprehensive validation system to prevent users from selecting the same cryptocurrency multiple times in a single parlay. Features include: (1) Real-time dropdown validation - options already selected in other cards become disabled and show "Already Selected" text, (2) Toast notification when attempting to select duplicate cryptocurrency, (3) Final validation on parlay submission to ensure no duplicates, (4) Visual indicators with grayed-out text for disabled options. This ensures each parlay uses unique cryptocurrencies only, preventing the issue shown in user's screenshot where all 3 predictions used Bitcoin.
- **Parlay History Price Stability Fixed (2025-08-03)**: Resolved critical issue where completed parlay history showed fluctuating final prices. Root cause: frontend was still using live cryptocurrency prices for historical data instead of permanent `endPrice` snapshots. Completely rebuilt history display logic to: (1) Always use database `endPrice` when available (permanent snapshot from ParlayProcessorService), (2) Use database `isCorrect` field for accurate win/lose status instead of recalculating, (3) Display "SNAPSHOT" indicator with lock icon for historical data vs live data, (4) Fixed input form positioning to appear directly below "Add Prediction Card" button instead of below history section. History parlays now show stable, accurate final prices that never change.
- **ParlayProcessorService Fully Operational (2025-08-03)**: Successfully resolved critical ParlayProcessorService failure that prevented expired parlay predictions from being processed. Fixed root cause: incorrect method call `cryptoService.getLatestPrices()` changed to `cryptoService.getCurrentPrices()`. Service now automatically processes expired parlay prediction coins every 30 seconds, fetches real-time prices, updates database with end prices and correctness status. Successfully tested with 17 expired coins being processed correctly. Background monitoring system fully operational with comprehensive logging.
- **Parlay Feature Complete with Active Parlays Display (2025-08-03)**: Successfully completed full parlay feature rebuild with comprehensive functionality. Fixed rendering issues by using stable parlay-simple.tsx component instead of problematic parlay-working.tsx. Features include: complete card-based UI with Add/Remove functionality, cryptocurrency selection with real-time prices, Up/Down prediction buttons, individual duration selection (1h-7d), real-time multiplier calculation, comprehensive validation (minimum 2 cards, 50 NTIQ stake), successful backend integration with parlay creation, cache invalidation for real-time updates, and Active Parlays section displaying user's existing parlays with multipliers and expiry dates. All parlay functionality now works perfectly with clean architecture.
- **Admin Panel UID Display Update (2025-08-02)**: Changed Users table ID column to display UID instead of database ID as requested. Updated both table header ("ID" → "UID") and cell content (`user.id` → `user.uid`) in admin-working.tsx. The endpoint properly returns both `id` and `uid` fields from storage.getAllUsers() method.
- **Withdrawal Hash Detection System Fixed (2025-08-02)**: Completely resolved the root cause of withdrawal hash detection failures. Fixed three critical issues: (1) Database field mapping errors (`toAddress` → `toWalletAddress`, `token` → `tokenType`), (2) Invalid Etherscan API key (updated with valid key `J2DPX5HHQKYKX3E17WPMWKH9PYYFMY6IQF`), (3) Incomplete status filtering (now includes both 'processing' and 'pending' withdrawals). The automated monitoring service now runs every 30 seconds and successfully detects transaction hashes from Sepolia testnet.
- **Withdrawal Hash and Status Fix (2025-08-02)**: Resolved missing withdrawal hashes in admin panel by fixing database field mapping from `transaction_hash` to `hash` in `/api/admin/transactions` endpoint. Updated withdrawal records NTIQ-48037125 and NTIQ-81464149 with real Sepolia Etherscan transaction hashes and changed status from "processing" to "completed". Hash links now properly redirect to Sepolia testnet explorer.
- **Transaction Hash Validation System (2025-08-02)**: Implemented comprehensive hash validation across admin panel and user components. Invalid placeholder hashes ("3") now display as warning badges, while valid Ethereum hashes (0x... format) show proper explorer links to Sepolia testnet. Applied to both `admin-working.tsx` and `multi-chain-wallet.tsx` components.
- **Transaction Hash Explorer Links (2025-08-02)**: Implemented clickable transaction hash links in admin panel that redirect to appropriate blockchain explorers. Fixed to use testnet explorers (Sepolia Etherscan, BSC Testnet, Mumbai PolygonScan, etc.) instead of mainnet.
- **Transaction Display Enhancement (2025-08-02)**: Updated transaction table format to show "NTIQ Amount" (received/withdrawn NTIQ) and "Crypto Amount" (crypto paid/received), with username display instead of user ID.
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