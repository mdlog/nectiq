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
- June 23, 2025. Added filter functionality to Admin Panel predictions (filter by asset and status with Indonesian interface)
- June 23, 2025. Implemented comprehensive Metamask wallet UI integration with pop-up functionality and balance synchronization
- June 23, 2025. Changed point unit from PTS to NTIQ throughout the entire application including header balance, admin panel, and user management sections
- June 23, 2025. Enhanced User Management in Admin Panel with advanced filtering (all/admins/rich users/no wallet), column sorting (balance, predictions, accuracy, rewards), search functionality, bulk selection with checkboxes, bulk delete operations, and CSV export capabilities
- June 23, 2025. Comprehensive Predictions improvements in Admin Panel: advanced sorting (time, stake, reward), date range filtering, accuracy visual meters, reward outcome display, enhanced status badges (Win/Loss), user profile linking, percentage difference calculations, and CSV/JSON export functionality
- June 23, 2025. Comprehensive Leaderboard "Top Performers" enhancements in Admin Panel: time filters (weekly/monthly/all time), sorting by accuracy/rewards/streak with clickable headers, badge gamification (fire for streaks, star for 90%+ accuracy), visual accuracy meters with color coding, clickable user profiles with tooltips, reward multiplier insights, CSV export functionality, and seasonal competition feature preview with entry fees and reset automation concepts
- June 23, 2025. Comprehensive Security Dashboard improvements: enhanced statistics with severity levels (critical/high/medium), auto-actions settings for IP blocking and alerts, advanced filtering by severity/wallet/IP/date, comprehensive security events table with bulk operations, export functionality, and visual enhancements with Indonesian language interface
- June 24, 2025. Fixed color contrast issues in System Settings section of Admin Panel: resolved white text on white background problems in input fields, security settings, exchange rates, prediction limits, "Keamanan Tambahan" section, and "Potensi Baru: Mode Event" section for improved readability
- June 24, 2025. Fixed prediction submission error "Invalid cryptocurrency" by implementing dynamic validation from database instead of hardcoded list, reduced minimum stake from 10 to 1 NTIQ, and updated error messages to use NTIQ instead of PTS
- June 24, 2025. Fixed missing cryptocurrency logos in Active Predictions section by implementing CoinGecko image URLs with proper fallback system, added support for all cryptocurrencies (chainlink, polkadot, litecoin, matic-network, hyperliquid), and updated stake display to show NTIQ instead of PTS
- June 24, 2025. Fixed database configuration for Ubuntu localhost setup by switching from Neon serverless to standard PostgreSQL, added comprehensive Ubuntu setup guide with network troubleshooting for CoinGecko API connection issues
- June 24, 2025. Resolved ECONNREFUSED 127.0.0.1:1443 error in Ubuntu localhost by fixing axios proxy configuration, adding automated ubuntu-fix.sh script, improving error handling for network issues, and ensuring fallback data system works when CoinGecko API is unreachable
- June 24, 2025. Implemented comprehensive banner/advertisement management system: added banners table to database schema, created banner management interface in Admin Panel with upload/edit/delete capabilities, added banner display section below Live Prices with dismiss functionality, priority-based ordering, and scheduled banner display with start/end date support
- June 24, 2025. Enhanced banner upload system: changed from URL input to direct image upload with file validation (max 5MB, image types only), drag & drop interface, preview functionality, and server-side file handling with multer
- June 24, 2025. Fixed banner date format validation errors and simplified banner display to show only images without titles for cleaner visual presentation
- June 24, 2025. Made banner dismiss button (X) visible only to admin users, regular users cannot close banners for better advertisement retention
- June 24, 2025. Added icons to all Admin Panel menu tabs: Target icon for Predictions, Trophy icon for Top Performers, reorganized tab layout to include Banner tab with Megaphone icon
- June 24, 2025. Increased Nectiq logo size by 20% in header (h-10 to h-12) and footer (h-8 to h-10) for better visibility and brand presence
- June 24, 2025. Enhanced prediction form modal with improved styling: added backdrop blur, enhanced shadow effects, better close button styling, and improved visual hierarchy for pop-up form experience
- June 24, 2025. Fixed prediction form modal implementation: removed inline form to ensure only pop-up modal appears, added authentication checks before opening form, improved error handling for 401 authentication errors
- June 24, 2025. Fixed FormData cloning error in banner upload system by restructuring file upload mutation to avoid structuredClone issues with browser extensions
- June 24, 2025. Implemented comprehensive Anti-Multi Wallet Abuse system: device fingerprinting, IP tracking, browser detection, similarity scoring, automatic abuse detection, admin management interface with review and action capabilities
- June 24, 2025. Created comprehensive smart contract system: PredictionBattle contract with staking mechanism, NTIQ ERC-20 token, PriceOracle for CoinGecko integration, automatic accuracy calculation and reward distribution, configured for Holesky and Sepolia testnet deployment
- June 24, 2025. Successfully deployed and tested smart contracts locally: all core functions working (submitPrediction, resolvePrediction, claimReward), accuracy calculation verified, reward multipliers functioning correctly (1x-5x based on prediction accuracy)
- June 24, 2025. Created simplified smart contracts without external dependencies: SimpleNTIQ token, SimplePriceOracle, SimplePredictionBattle - all functions tested and working perfectly with automatic accuracy calculation and reward distribution
- June 24, 2025. Prepared complete deployment system for Holesky and Sepolia testnets: deployment scripts, testing scripts, comprehensive documentation, and frontend integration guides ready for testnet deployment
- June 24, 2025. Implemented One-Click Social Media Sharing feature: achievement cards with Twitter/Facebook sharing, custom message editing, social preview, achievement gallery with filters, and automatic share buttons for high-accuracy predictions
- June 25, 2025. Added comprehensive User Statistics to Admin Panel: total users, new users by time period, active/dormant segmentation, prediction statistics, financial metrics, growth charts with registrations and retention data, top performers, and real-time refresh capabilities
- June 25, 2025. Simplified Settings menu in Admin Panel with clean English interface: organized into essential categories (Prediction Limits, Financial Settings, Security & Rate Limits, Exchange Rates), removed cluttered Indonesian text and complex configurations, added proper placeholders for guidance
- June 25, 2025. Fixed prediction form to display "NTIQ" instead of "PTS" for stake amount: updated button labels (50 NTIQ, 100 NTIQ, etc.), input placeholder, and validation messages for consistent currency branding throughout the application
- June 25, 2025. Added icons to all user dashboard menu tabs: Clock for My Predictions, Award for Achievements, Calendar for Daily Challenges, History for Reward History, Eye for Market Watch, Activity for Performance, DollarSign for Withdraw, CreditCard for Buy NTIQ, and Wallet - improving visual consistency with admin panel design
- June 25, 2025. Fixed "PTS" to "NTIQ" currency references in Achievements component: updated total rewards display, completed achievement badges, in-progress achievement badges, and not-started achievement badges for consistent NTIQ branding throughout the achievements system
- June 25, 2025. Implemented smooth client-side navigation throughout the application: replaced all window.location.href calls with Wouter's useLocation hook for seamless navigation between pages without full page reloads, including header navigation, admin panel, user dashboard, and predict buttons
- June 25, 2025. Enhanced header navigation menu: converted anchor tags to buttons with client-side routing for Home, My Dashboard, Leaderboard, How to Play, and Admin links ensuring smooth transitions without page reloads when navigating between main sections
- June 25, 2025. Fixed admin panel authentication error: removed undefined isAuthenticated variable reference that was causing runtime error, admin panel now loads properly for authorized wallet addresses
- June 25, 2025. Database cleanup: removed duplicate user entry (ID 5) with same wallet address as admin user (ID 6), keeping the user with more activity data (11 predictions vs 2 predictions)
- June 25, 2025. Fixed bulk user deletion functionality in Admin Panel: enhanced error handling with individual deletion tracking, added confirmation dialog, improved success/failure reporting, and removed admin user deletion restriction for proper bulk operations
- June 25, 2025. Updated achievement card text colors: changed achievement descriptions from gray (text-muted-foreground) to black for better readability in light mode and white for dark mode
- June 25, 2025. Simplified User Dashboard menu: consolidated "Withdraw", "Buy NTIQ", and "Wallet" tabs into a single "Financial" tab with internal navigation for cleaner interface and better user experience
- June 25, 2025. Implemented comprehensive backup and recovery system: automated database backups with pg_dump, file upload backups, configuration exports, backup manifests with checksums, CLI backup tools (npm run backup:create/list/restore), admin panel integration, and complete backup/recovery documentation
- June 25, 2025. Added pagination to Leaderboard page: 10 users per page with Previous/Next navigation, page numbers with ellipsis for large datasets, smart pagination showing first/last/current pages, pagination info display, automatic reset to page 1 when filters change, and proper rank calculation across pages
- June 26, 2025. Enhanced Leaderboard with search functionality: search by username with real-time filtering, pagination works with search results, search result count display, improved UI with search icon and placeholder text, empty state messages for both no data and no search results
- June 26, 2025. Implemented comprehensive real-time transaction tracking system using WebSocket: live updates for buy NTIQ transactions, withdrawal transactions, and new predictions in Admin Panel without page reload, real-time status indicators (LIVE/OFFLINE), toast notifications for new activities, automatic data refresh via query invalidation, WebSocket connection management with auto-reconnect functionality
- June 26, 2025. Fixed Delete Selected button functionality in Admin Panel Users management: resolved non-responsive button issue through comprehensive debugging, enhanced confirmation dialog with user names and clear warnings, improved error handling for bulk deletion operations, added extensive console logging for troubleshooting
- June 26, 2025. Fixed admin wallet authentication toast notification showing "Welcome undefined": corrected username handling for admin users, added fallback username generation, updated database to ensure admin users have proper usernames
- June 26, 2025. Created comprehensive How to Play page: complete guide with quick start steps, supported cryptocurrencies showcase, prediction timeframes explanation, detailed reward system with accuracy multipliers and calculation formulas, tips & strategies section, important notes, and call-to-action sections for better user onboarding and fixed routing to display the new content
- June 26, 2025. Added header and footer components to How to Play, Leaderboard, and My Dashboard pages for consistent layout and navigation across all main pages
- June 26, 2025. Added custom wallet logos to wallet connect interface: created SVG logo components for MetaMask, WalletConnect, Coinbase, Phantom, Rabby, OKX, Keplr, SubWallet, Leap, Backpack, Nightly, Injected, and Web3Modal wallets with proper branding colors and designs
- June 26, 2025. Fixed prediction submission error "Cannot read properties of undefined (reading 'ok')": enhanced error handling in prediction form, improved API response parsing in queryClient.ts, added proper null checks and fallback error messages for better user experience
- June 26, 2025. Added Profile menu to My Dashboard: comprehensive user profile section with account information, quick stats (balance, predictions, accuracy, rewards), recent activity summary with navigation shortcuts, profile header with user avatar, and account details display
- June 26, 2025. Added username editing feature to Profile menu: inline edit functionality with input field, save/cancel buttons, username validation (3-20 characters, alphanumeric + underscore/hyphen), duplicate username checking, API endpoint for username updates, and real-time UI updates
- June 26, 2025. Fixed profile photo display in Leaderboard: added profilePhoto field to database query, updated API response to include profile photo URLs, fixed database records for users with uploaded photos
- June 26, 2025. Updated How to Play page Reward System section: renamed to "How It Works" with 3-step process visualization (Choose & Predict, Wait & Track, Earn Rewards), maintained detailed accuracy multipliers and calculation formulas for consistency with user workflow understanding
- June 26, 2025. Redesigned How It Works section to match user's design reference: created compact card layout with integrated reward multipliers display (Perfect ±0.1% 5x, Great ±1% 3x, Good ±5% 1.5x), simplified layout with horizontal reward indicators, updated stake range to 1-500 NTIQ
- June 26, 2025. Added comprehensive Calculation Formula section to How to Play page: detailed accuracy calculation formula with mathematical examples (|Predicted Price - Actual Price| / Actual Price × 100%), final reward calculation breakdown with timeframe and accuracy multipliers, maximum reward scenarios, and practical examples for perfect and great predictions
- June 26, 2025. Fixed Achievements menu text readability issues: changed all text colors from black to white (text-white dark:text-white) with font-semibold for all descriptions, progress indicators, targets, and labels to ensure maximum contrast and perfect readability against backgrounds
- June 26, 2025. Changed "Completed Achievements" card background from white/green to grey (bg-gray-100 dark:bg-gray-800) for better visual distinction and improved design consistency
- June 26, 2025. Fixed text color contrast in "Completed Achievements" section: updated title colors to text-gray-900 dark:text-gray-100 for proper visibility against grey background
- June 26, 2025. Relocated Predict button from above price chart to below chart: moved from chart header to full-width button below chart area, enhanced with larger size and clearer "Make Prediction for [SYMBOL]" text for improved user experience and accessibility
- June 26, 2025. Completed comprehensive database cleanup: deleted all users including Admin ID 5, removed all related data (predictions, rewards, security events, admin logs, etc.), handled foreign key constraints properly, database now has 0 users and is ready for fresh start
- June 26, 2025. Updated User Management display in Admin Panel: changed user information from showing "ID: {user.id}" to "UID: {user.uid}" for better user identification consistency with UID column display
- June 26, 2025. Implemented comprehensive Anti-Multi Wallet Abuse Security System: device fingerprinting with IP tracking, browser detection, hardware analysis; automatic abuse detection with confidence scoring (90%+ blocks login, 70-89% flags for review); integrated into wallet login flow with WalletSecurityService; database tables for wallet fingerprints and abuse detections; admin API endpoints for reviewing and managing detected abuse cases; comprehensive security documentation in SECURITY_GUIDE.md with implementation details, monitoring strategies, and user appeal processes
- June 26, 2025. Fixed Dashboard authentication issues: adjusted anti-abuse system thresholds to prevent legitimate users from being blocked (increased IP threshold from 2 to 5 wallets, reduced confidence scores), modified device fingerprint detection to allow login while logging suspicious activity for review, resolved wallet login blocking that was preventing Dashboard access
- June 26, 2025. Enhanced Profile menu with copy wallet address functionality: added copy button next to wallet address with Indonesian toast notifications, visual feedback with icon changes (copy to checkmark), auto-reset after 2 seconds, error handling for clipboard failures
- June 26, 2025. Added cryptocurrency logos to Recent Rewards and Active Predictions sections: implemented CoinGecko image URLs matching Live Prices section, added fallback to icons if images fail to load, updated currency display to NTIQ, supports all cryptocurrencies including Bitcoin, Ethereum, BNB, Cardano, Solana, Chainlink, Polkadot, Litecoin, Polygon, Hyperliquid, and Sahara AI
- June 26, 2025. Fixed Sahara AI logo display issue in Active Predictions: corrected CoinGecko image ID from 44077 to 66681 to match the actual Sahara AI token image URL, logo now displays consistently across Live Prices, Recent Rewards, and Active Predictions sections
- June 26, 2025. Implemented dynamic cryptocurrency logo system for Active Predictions: replaced static URL mapping with real-time data from CoinGecko API, automatically supports new cryptocurrencies added through Admin Panel (like TRON/TRX), uses live crypto price data for image URLs with intelligent fallback system, ensures cryptocurrency logos display consistently without manual code updates
- June 26, 2025. Added pagination and search functionality to Active Predictions: implemented 3 predictions per page display, search by cryptocurrency name with real-time filtering, pagination controls with Previous/Next buttons and page numbers, search result count display, empty state handling for no search results, automatic page reset when search query changes
- June 26, 2025. Fixed cryptocurrency logos missing in My Dashboard > Predictions menu: implemented dynamic logo system using real-time CoinGecko API data matching Active Predictions component, added getCryptoImageUrl function with intelligent fallback system, supports all cryptocurrencies automatically including newly added ones through Admin Panel
- June 26, 2025. Fixed TRON logo not displaying in Recent Rewards component: implemented dynamic cryptocurrency logo system using real-time CoinGecko API data, replaced static image mapping with live crypto price data integration, added proper fallback system for all cryptocurrencies including TRON, ensures consistent logo display across all platform sections
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```