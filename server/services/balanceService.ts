import { ethers } from 'ethers';

// NTIQ Token contract configuration
const NTIQ_TOKEN_ADDRESS = process.env.NTIQ_TOKEN_SIMPLE_ADDRESS || '0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f';
const POLYGON_AMOY_RPC = process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';

// NTIQ Token ABI (minimal for balance checking)
const NTIQ_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

export class BalanceService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC);

    // Initialize contract
    this.contract = new ethers.Contract(NTIQ_TOKEN_ADDRESS, NTIQ_TOKEN_ABI, this.provider);
  }

  /**
   * Get NTIQ token balance for a wallet address
   * @param address - Wallet address to check balance for
   * @returns Promise<number> - Balance in NTIQ tokens (formatted)
   */
  async getBalance(address: string): Promise<number> {
    try {
      console.log(`🔍 [BALANCE-SERVICE] Getting balance for address: ${address}`);

      // Get balance from contract
      const balanceWei = await this.contract.balanceOf(address);
      console.log(`🔍 [BALANCE-SERVICE] Raw balance (wei): ${balanceWei.toString()}`);

      // Convert from wei to tokens
      const balance = parseFloat(ethers.formatEther(balanceWei));
      console.log(`🔍 [BALANCE-SERVICE] Formatted balance: ${balance}`);

      return balance;
    } catch (error) {
      console.error(`❌ [BALANCE-SERVICE] Error getting balance for ${address}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const balanceService = new BalanceService();