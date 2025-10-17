import { ethers } from 'ethers';
import { logger } from '../../shared/logger';

// NTIQ Token contract configuration
const NTIQ_TOKEN_ADDRESS = process.env.NTIQ_TOKEN_SIMPLE_ADDRESS || '0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f';
const POLYGON_AMOY_RPC = process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';

// NTIQ Token ABI (minimal for balance checking and transfers)
const NTIQ_TOKEN_ABI = [
  // View functions
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",

  // Transfer functions
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",

  // Owner functions
  "function owner() external view returns (address)",
  "function distributeAirdrop(address[] calldata recipients, uint256[] calldata amounts) external",
  "function transferToTreasury() external",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event AirdropDistributed(uint256 recipientCount)"
];

export class NTIQTokenService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private deployerWallet?: ethers.Wallet;

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC);

    // Initialize contract
    this.contract = new ethers.Contract(NTIQ_TOKEN_ADDRESS, NTIQ_TOKEN_ABI, this.provider);

    // Initialize deployer wallet if private key is available
    const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (deployerPrivateKey) {
      this.deployerWallet = new ethers.Wallet(deployerPrivateKey, this.provider);
      console.log('🔑 NTIQ Token Service: Deployer wallet initialized');
    } else {
      console.warn('⚠️ NTIQ Token Service: DEPLOYER_PRIVATE_KEY not found, airdrop functions disabled');
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    address: string;
  }> {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatEther(totalSupply),
        address: NTIQ_TOKEN_ADDRESS
      };
    } catch (error) {
      logger.error('Failed to get NTIQ token info:', error);
      throw error;
    }
  }

  /**
   * Get balance of an address in NTIQ tokens
   */
  async getBalance(address: string): Promise<number> {
    try {
      logger.info(`🔍 [NTIQ-BALANCE] Getting balance for address: ${address}`);
      logger.info(`🔍 [NTIQ-BALANCE] Using contract address: ${NTIQ_TOKEN_ADDRESS}`);
      
      // Normalize address to checksum format for consistency
      const normalizedAddress = ethers.getAddress(address);
      logger.info(`🔍 [NTIQ-BALANCE] Normalized address: ${normalizedAddress}`);
      
      const balance = await this.contract.balanceOf(normalizedAddress);
      const balanceInNTIQ = parseFloat(ethers.formatEther(balance));
      
      logger.info(`💰 [NTIQ-BALANCE] Raw balance (wei): ${balance.toString()}`);
      logger.info(`💰 [NTIQ-BALANCE] Balance in NTIQ: ${balanceInNTIQ}`);
      
      return balanceInNTIQ;
    } catch (error) {
      logger.error(`❌ [NTIQ-BALANCE] Failed to get NTIQ balance for ${address}:`, error);
      return 0;
    }
  }

  /**
   * Get balance in wei (raw format)
   */
  async getBalanceWei(address: string): Promise<bigint> {
    try {
      return await this.contract.balanceOf(address);
    } catch (error) {
      logger.error(`Failed to get NTIQ balance wei for ${address}:`, error);
      return 0n;
    }
  }

  /**
   * Check if user has sufficient balance
   */
  async hasSufficientBalance(address: string, requiredAmount: number): Promise<boolean> {
    try {
      const balance = await this.getBalance(address);
      return balance >= requiredAmount;
    } catch (error) {
      logger.error(`Failed to check sufficient balance for ${address}:`, error);
      return false;
    }
  }

  /**
   * Distribute airdrop to multiple addresses
   */
  async distributeAirdrop(recipients: string[], amounts: number[]): Promise<string> {
    if (!this.deployerWallet) {
      throw new Error('Deployer wallet not initialized');
    }

    if (recipients.length !== amounts.length) {
      throw new Error('Recipients and amounts arrays must have the same length');
    }

    try {
      // Connect contract with deployer wallet
      const contractWithSigner = this.contract.connect(this.deployerWallet) as any;

      // Convert amounts to wei
      const amountsWei = amounts.map(amount => ethers.parseEther(amount.toString()));

      // Execute airdrop
      const tx = await contractWithSigner.distributeAirdrop(recipients, amountsWei);

      logger.info(`🎁 NTIQ Airdrop initiated: ${recipients.length} recipients, tx: ${tx.hash}`);

      // Wait for confirmation
      await tx.wait();

      logger.info(`✅ NTIQ Airdrop completed: ${tx.hash}`);

      return tx.hash;
    } catch (error) {
      logger.error('Failed to distribute NTIQ airdrop:', error);
      throw error;
    }
  }

  /**
   * Transfer tokens from deployer to user (for new user airdrop)
   */
  async transferToUser(userAddress: string, amount: number): Promise<string> {
    if (!this.deployerWallet) {
      throw new Error('Deployer wallet not initialized');
    }

    try {
      // Connect contract with deployer wallet
      const contractWithSigner = this.contract.connect(this.deployerWallet) as any;

      // Convert amount to wei
      const amountWei = ethers.parseEther(amount.toString());

      // Execute transfer
      const tx = await contractWithSigner.transfer(userAddress, amountWei);

      logger.info(`💸 NTIQ Transfer initiated: ${amount} NTIQ to ${userAddress}, tx: ${tx.hash}`);

      // Wait for confirmation
      await tx.wait();

      logger.info(`✅ NTIQ Transfer completed: ${tx.hash}`);

      return tx.hash;
    } catch (error) {
      logger.error(`Failed to transfer NTIQ to ${userAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get deployer balance
   */
  async getDeployerBalance(): Promise<number> {
    if (!this.deployerWallet) {
      throw new Error('Deployer wallet not initialized');
    }

    return await this.getBalance(this.deployerWallet.address);
  }

  /**
   * Check if contract is properly initialized
   */
  async isInitialized(): Promise<boolean> {
    try {
      const name = await this.contract.name();
      return name === 'NECTIQ Token';
    } catch (error) {
      logger.error('Failed to verify NTIQ token initialization:', error);
      return false;
    }
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return NTIQ_TOKEN_ADDRESS;
  }

  /**
   * Get deployer address
   */
  getDeployerAddress(): string | null {
    return this.deployerWallet?.address || null;
  }

  /**
   * Format balance for display
   */
  formatBalance(balanceWei: bigint, decimals: number = 4): string {
    const balance = parseFloat(ethers.formatEther(balanceWei));
    return balance.toFixed(decimals);
  }

  /**
   * Parse amount to wei
   */
  parseAmount(amount: number): bigint {
    return ethers.parseEther(amount.toString());
  }

  /**
   * Format amount from wei
   */
  formatAmount(amountWei: bigint): number {
    return parseFloat(ethers.formatEther(amountWei));
  }
}

// Export singleton instance
export const ntiqTokenService = new NTIQTokenService();
