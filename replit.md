# Nectiq - Cryptocurrency Price Prediction Platform

## Overview

Nectiq is a gamified cryptocurrency price prediction platform that allows users to make predictions on cryptocurrency prices and earn rewards based on their accuracy. The platform features a modern React frontend with Web3 wallet integration and a Node.js/Express backend with PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Web3 Integration**: Wagmi + Web3Modal for wallet connections
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js with session-based authentication
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **External APIs**: CoinGecko API for real-time cryptocurrency prices
- **Session Management**: Express-session with in-memory storage

## Key Components

### Authentication System
- **Dual Authentication**: Traditional username/password and Web3 wallet authentication
- **Auto-Registration**: New wallet addresses automatically get registered with random usernames
- **Session Management**: Server-side sessions with secure cookie handling
- **Admin Access**: Special admin wallets with elevated privileges

### Prediction Engine
- **Supported Cryptocurrencies**: Bitcoin, Ethereum, BNB, Cardano, Solana
- **Prediction Timeframes**: 1 hour, 6 hours, 24 hours, 7 days
- **Accuracy Calculation**: Percentage-based accuracy with reward multipliers
- **Stake System**: Users stake points on predictions (50-500 PTS)

### Reward System
- **Point-Based Economy**: Users earn and spend PTS (points)
- **Accuracy Rewards**: 5x multiplier for perfect predictions (±0.1%)
- **Progressive Rewards**: Decreasing multipliers based on accuracy
- **Achievement System**: Unlockable achievements for various milestones
- **Daily Challenges**: Time-limited challenges with bonus rewards

### Real-Time Features
- **Live Price Updates**: Real-time cryptocurrency price feeds (1-second intervals)
- **Interactive Charts**: TradingView-style price charts with multiple timeframes
- **Active Prediction Tracking**: Real-time countdown timers and accuracy tracking
- **Leaderboard**: Live rankings based on accuracy and total rewards

## Data Flow

1. **User Authentication**: Users connect Web3 wallets or use traditional login
2. **Price Data Ingestion**: CoinGecko API provides real-time price data
3. **Prediction Creation**: Users make predictions with stake amounts
4. **Price Monitoring**: Background service monitors prediction deadlines
5. **Result Processing**: Automatic calculation of accuracy and rewards
6. **User Updates**: Real-time updates to user stats and leaderboard positions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@web3modal/wagmi**: Web3 wallet connection interface
- **@tanstack/react-query**: Server state management
- **axios**: HTTP client for external API calls

### UI and Styling
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit configuration
- **Database**: Neon Database with automatic provisioning
- **Port Configuration**: Default port 5000 with external port 80
- **Hot Reload**: Vite dev server with HMR enabled

### Production Build
- **Frontend Build**: Vite builds static assets to `dist/public`
- **Backend Bundle**: esbuild bundles server code to `dist/index.js`
- **Asset Serving**: Express serves static files in production mode
- **Database Migrations**: Drizzle Kit handles schema migrations

### Environment Variables
- `DATABASE_URL`: Neon Database connection string (auto-provisioned)
- `SESSION_SECRET`: Session encryption key
- `NODE_ENV`: Environment mode (development/production)
- `VITE_WALLETCONNECT_PROJECT_ID`: WalletConnect project identifier

### Security Features
- **Input Validation**: Comprehensive sanitization and validation
- **CORS Configuration**: Permissive CORS for wallet integration
- **Security Headers**: XSS protection, content type validation
- **Session Security**: HTTP-only cookies with secure settings
- **Admin Protection**: Wallet-based admin authentication

## Changelog

```
Changelog:
- June 23, 2025. Initial setup
- June 23, 2025. Added pagination to Admin Panel predictions (10 items per page with navigation controls)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```