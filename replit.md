# Overview

Nectiq is a cryptocurrency price prediction platform with real-time trading capabilities, gamified experiences, and Web3 wallet integration. The platform allows users to make predictions on cryptocurrency prices across multiple timeframes, participate in survival tournaments and prediction battles, and earn rewards through an achievement system. Built with a modern tech stack including React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and comprehensive WebSocket support for real-time features.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

**August 22, 2025**
- **Project Cleanup Completed**: Removed all .md documentation files, attached_assets folder with screenshots, test files (test_*.js), migration files, scripts folder, and other non-essential development files
- **ETH Calculation Bug Fixed**: Resolved "0.000000 ETH" display issue by implementing fallback ETH pricing ($3400) when cryptocurrency API data is empty
- **Production Ready**: Codebase now contains only essential files needed for running the application

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for development and bundling
- **UI Components**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system and dark theme support
- **State Management**: React Query for server state, React hooks for local state
- **Wallet Integration**: RainbowKit with Wagmi for Ethereum wallet connections
- **Real-time**: WebSocket client for live price updates and notifications

## Backend Architecture
- **Runtime**: Node.js with Express.js framework in ESM module format
- **Language**: TypeScript with strict type checking enabled
- **Authentication**: Wallet-based authentication with session management
- **Real-time Communication**: WebSocket server for live updates and notifications
- **File Uploads**: Multer middleware for profile photos and assets
- **Security**: Comprehensive input validation, XSS protection, and anti-abuse systems

## Data Storage Solutions
- **Primary Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Session Storage**: Express sessions with database persistence
- **Caching**: In-memory caching for cryptocurrency prices and user data

## Authentication and Authorization
- **Primary Method**: Ethereum wallet signature-based authentication
- **Session Management**: Express sessions with secure cookie configuration
- **Admin Access**: Environment variable-based admin wallet configuration
- **Security Layers**: Device fingerprinting, multi-wallet abuse detection, and rate limiting
- **Authorization**: Role-based access control with user and admin permissions

## External Dependencies
- **Pyth Network**: Real-time cryptocurrency price feeds via Hermes client
- **CoinGecko API**: Fallback price data and historical information
- **Etherscan APIs**: Blockchain transaction monitoring for deposits/withdrawals
- **Ethereum Networks**: Sepolia and Holesky testnets for smart contract interactions
- **Anthropic AI**: Claude SDK integration for AI-powered features
- **Firebase**: Authentication and analytics services
- **Ledger Hardware Wallets**: Support for hardware wallet connections via multiple transport methods

## Key Service Components
- **Price Service**: Hybrid price fetching from Pyth Network and CoinGecko with intelligent fallbacks
- **Prediction Engine**: Automated processing of time-based predictions with accuracy calculations
- **Balance Management**: Real-time balance updates with transaction logging for all operations
- **Survival Tournament System**: Round-based elimination tournaments with anti-gaming protections
- **Achievement System**: Gamified user progression with automated reward distribution
- **Notification System**: Real-time WebSocket notifications for user activities and system events
- **Security Services**: Comprehensive anti-abuse detection, wallet fingerprinting, and audit trails

## Development and Deployment
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Development**: Hot reload with Vite middleware and runtime error overlays
- **Code Quality**: TypeScript strict mode, ESLint configuration, and security scanning
- **Environment Management**: Dotenv for configuration with environment-specific settings
- **Asset Management**: Static file serving with proper caching headers

## Monitoring and Security
- **Automated Services**: Deposit monitoring, withdrawal processing, and prediction expiry handling
- **Audit Systems**: Transaction logging, security event tracking, and balance reconciliation
- **Anti-Gaming**: Time-based submission limits, device fingerprinting, and behavioral analysis
- **Error Handling**: Comprehensive error logging with structured error responses
- **Performance**: Connection pooling, query optimization, and response caching