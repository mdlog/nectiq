/**
 * SECURITY: Centralized security configuration
 * This file manages secure access to environment variables and prevents exposure
 */

// SECURITY: Type-safe environment variable access
interface SecurityConfig {
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly adminWallets: string[];
  readonly adminIPs: string[];
  readonly hasPrivateKey: boolean;
  readonly hasEtherscanKey: boolean;
  readonly hasDatabaseUrl: boolean;
}

/**
 * SECURITY: Safe environment variable checker
 * Returns boolean without exposing actual values
 */
function checkEnvVar(name: string): boolean {
  return Boolean(process.env[name] && process.env[name]!.length > 0);
}

/**
 * SECURITY: Safe environment variable getter with validation
 * Throws error if required variable is missing
 */
function getRequiredEnvVar(name: string, description: string = ''): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`🚨 [SECURITY] Required environment variable ${name} is not set. ${description}`);
  }
  return value;
}

/**
 * SECURITY: Safe environment variable getter with default
 */
function getOptionalEnvVar(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

/**
 * SECURITY: Safe array environment variable getter
 */
function getArrayEnvVar(name: string): string[] {
  const value = process.env[name];
  if (!value) return [];
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

/**
 * SECURITY: Create security configuration without exposing values
 */
export const securityConfig: SecurityConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  adminWallets: getArrayEnvVar('ADMIN_WALLET_ADDRESSES'),
  adminIPs: getArrayEnvVar('ADMIN_IP_WHITELIST'),
  hasPrivateKey: checkEnvVar('ADMIN_PRIVATE_KEY'),
  hasEtherscanKey: checkEnvVar('ETHERSCAN_API_KEY'),
  hasDatabaseUrl: checkEnvVar('DATABASE_URL'),
};

/**
 * SECURITY: Log security configuration without exposing sensitive data
 */
export function logSecurityStatus(): void {
  console.log('🔐 [SECURITY] Environment configuration status:');
  console.log(`   Environment: ${securityConfig.isDevelopment ? 'Development' : 'Production'}`);
  console.log(`   Admin wallets configured: ${securityConfig.adminWallets.length}`);
  console.log(`   Admin IPs configured: ${securityConfig.adminIPs.length}`);
  console.log(`   Private key configured: ${securityConfig.hasPrivateKey ? 'Yes' : 'No'}`);
  console.log(`   Etherscan API configured: ${securityConfig.hasEtherscanKey ? 'Yes' : 'No'}`);
  console.log(`   Database configured: ${securityConfig.hasDatabaseUrl ? 'Yes' : 'No'}`);
}

/**
 * SECURITY: Secure environment variable access functions
 */
export const secureEnv = {
  // Required variables with validation
  getDatabaseUrl: () => getRequiredEnvVar('DATABASE_URL', 'Database connection required'),
  getAdminPrivateKey: () => getRequiredEnvVar('ADMIN_PRIVATE_KEY', 'Admin operations require private key'),
  
  // Optional variables with defaults
  getEtherscanApiKey: () => getOptionalEnvVar('ETHERSCAN_API_KEY', 'YOUR_API_KEY_HERE'),
  getWithdrawalInterval: () => parseInt(getOptionalEnvVar('WITHDRAWAL_CHECK_INTERVAL', '5')),
  getAutoWithdrawalsEnabled: () => getOptionalEnvVar('ENABLE_AUTO_WITHDRAWALS', 'false') !== 'false',
  
  // Network configurations (safe defaults)
  getEthereumRpcUrl: () => getOptionalEnvVar('ETHEREUM_RPC_URL', 'https://eth-mainnet.g.alchemy.com/v2/demo'),
  getSepoliaRpcUrl: () => getOptionalEnvVar('SEPOLIA_RPC_URL', 'https://eth-sepolia.public.blastapi.io'),
  getBaseRpcUrl: () => getOptionalEnvVar('BASE_RPC_URL', 'https://base-mainnet.g.alchemy.com/v2/demo'),
  getBscRpcUrl: () => getOptionalEnvVar('BSC_RPC_URL', 'https://bsc-dataseed.binance.org/'),
  
  // Array configurations
  getAdminWallets: () => securityConfig.adminWallets,
  getAdminIPs: () => securityConfig.adminIPs,
  
  // Validation helpers
  hasPrivateKey: () => securityConfig.hasPrivateKey,
  hasEtherscanKey: () => securityConfig.hasEtherscanKey,
  isConfigured: (envVar: string) => checkEnvVar(envVar),
};

/**
 * SECURITY: Sanitize string for logging (mask sensitive parts)
 */
export function sanitizeForLog(value: string, maskAfter: number = 6): string {
  if (!value || value.length <= maskAfter) return value;
  return value.substring(0, maskAfter) + '...';
}

/**
 * SECURITY: Validate environment on startup
 */
export function validateSecurityEnvironment(): void {
  const errors: string[] = [];
  
  if (!securityConfig.hasDatabaseUrl) {
    errors.push('DATABASE_URL is required');
  }
  
  if (securityConfig.adminWallets.length === 0) {
    errors.push('At least one ADMIN_WALLET_ADDRESSES must be configured');
  }
  
  if (errors.length > 0) {
    console.error('🚨 [SECURITY] Environment validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    throw new Error('Security environment validation failed');
  }
  
  console.log('✅ [SECURITY] Environment validation passed');
  logSecurityStatus();
}