import { useState, useEffect } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Coins, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface TokenBalance {
  symbol: string;
  balance: string;
  usdValue?: string;
  color: string;
}

interface WalletBalancesProps {
  walletAddress: string;
}

export function WalletBalances({ walletAddress }: WalletBalancesProps) {
  const { primaryWallet } = useDynamicContext();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Token contracts on Ethereum mainnet
  const tokens = {
    ETH: {
      symbol: "ETH",
      decimals: 18,
      color: "text-blue-400",
      contract: null // Native ETH
    },
    USDT: {
      symbol: "USDT",
      decimals: 6,
      color: "text-green-400",
      contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    },
    USDC: {
      symbol: "USDC",
      decimals: 6,
      color: "text-blue-500",
      contract: "0xA0b86a33E6417C0e3cC9e38F6BBEaE8a47E6fB7b"
    }
  };

  const fetchTokenBalance = async (tokenConfig: any): Promise<TokenBalance> => {
    try {
      if (!primaryWallet) {
        return {
          symbol: tokenConfig.symbol,
          balance: "0",
          color: tokenConfig.color
        };
      }

      let balance = "0";

      if (tokenConfig.symbol === "ETH") {
        // Get ETH balance using multiple approaches
        try {
          // Method 1: Direct window.ethereum call
          if (typeof window !== 'undefined' && window.ethereum) {
            try {
              const balanceHex = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [walletAddress, 'latest']
              });
              
              if (balanceHex) {
                const balanceBigInt = BigInt(balanceHex);
                const balanceInEth = Number(balanceBigInt) / Math.pow(10, 18);
                balance = balanceInEth.toFixed(5);
                console.log(`ETH Balance (window.ethereum): ${balance} ETH (Raw: ${balanceHex})`);
              }
            } catch (directError) {
              console.log("Direct window.ethereum method failed:", directError);
            }
          }
          
          // Method 2: Dynamic wallet RPC call (if Method 1 failed)
          if (balance === "0" && primaryWallet) {
            try {
              const result = await primaryWallet.makeRpcCall({
                method: "eth_getBalance",
                params: [walletAddress, "latest"]
              });

              if (result) {
                const balanceHex = result;
                const balanceBigInt = BigInt(balanceHex);
                const balanceInEth = Number(balanceBigInt) / Math.pow(10, 18);
                balance = balanceInEth.toFixed(5);
                console.log(`ETH Balance (Dynamic RPC): ${balance} ETH (Raw: ${balanceHex})`);
              }
            } catch (rpcError) {
              console.log("Dynamic RPC method failed:", rpcError);
            }
          }
          
          // Method 3: getBalance fallback (if both above failed)
          if (balance === "0" && primaryWallet) {
            try {
              const ethBalance = await primaryWallet.getBalance();
              console.log("ETH Balance (getBalance method):", ethBalance);
              
              if (ethBalance && ethBalance !== "0") {
                let balanceValue = 0;
                if (typeof ethBalance === 'string') {
                  if (ethBalance.startsWith('0x')) {
                    balanceValue = Number(BigInt(ethBalance)) / Math.pow(10, 18);
                  } else {
                    balanceValue = parseFloat(ethBalance);
                  }
                } else if (typeof ethBalance === 'number') {
                  balanceValue = ethBalance;
                }
                
                balance = balanceValue.toFixed(5);
                console.log(`ETH Balance (getBalance): ${balance} ETH`);
              }
            } catch (fallbackError) {
              console.log("getBalance method failed:", fallbackError);
            }
          }
          
        } catch (error) {
          console.log("All ETH balance methods failed:", error);
          balance = "0";
        }
      } else {
        // Get ERC-20 token balance
        try {
          // ERC-20 balanceOf function call
          const balanceOfABI = [{
            "constant": true,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "type": "function"
          }];

          const contractCall = {
            to: tokenConfig.contract,
            data: `0x70a08231000000000000000000000000${walletAddress.slice(2)}`
          };

          const result = await primaryWallet.makeRpcCall({
            method: "eth_call",
            params: [contractCall, "latest"]
          });

          if (result) {
            const balanceHex = result;
            const balanceBigInt = BigInt(balanceHex);
            const balanceFloat = Number(balanceBigInt) / Math.pow(10, tokenConfig.decimals);
            balance = balanceFloat.toFixed(5);
          }
        } catch (error) {
          console.log(`${tokenConfig.symbol} balance fetch error:`, error);
          balance = "0";
        }
      }

      return {
        symbol: tokenConfig.symbol,
        balance,
        color: tokenConfig.color
      };
    } catch (error) {
      console.log(`Error fetching ${tokenConfig.symbol} balance:`, error);
      return {
        symbol: tokenConfig.symbol,
        balance: "0",
        color: tokenConfig.color
      };
    }
  };

  const fetchAllBalances = async () => {
    if (!primaryWallet || !walletAddress) return;
    
    setLoading(true);
    try {
      const tokenPromises = Object.values(tokens).map(token => fetchTokenBalance(token));
      const results = await Promise.all(tokenPromises);
      setBalances(results);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress && primaryWallet) {
      fetchAllBalances();
    }
  }, [walletAddress, primaryWallet]);

  if (!walletAddress || !primaryWallet) {
    return (
      <div className="text-xs text-slate-500">
        Connect wallet to view token balances
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white font-medium">Token Balances:</span>
        <Button
          onClick={fetchAllBalances}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          disabled={loading}
        >
          <RefreshCw 
            size={12} 
            className={`${loading ? 'animate-spin' : ''} text-slate-400`} 
          />
        </Button>
      </div>

      <div className="space-y-1.5">
        {balances.map((token) => (
          <div key={token.symbol} className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Coins size={12} className={token.color} />
              <span className="text-xs text-gray-300">{token.symbol}:</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`text-xs font-medium ${token.color}`}>
                {parseFloat(token.balance).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">{token.symbol}</span>
            </div>
          </div>
        ))}
      </div>

      {lastUpdated && (
        <div className="text-xs text-gray-300 text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <div className="text-xs text-gray-300 space-y-0.5">
        <p className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Real-time balances from Ethereum mainnet
        </p>
        <p>• ETH: Native Ethereum balance</p>
        <p>• USDT: Tether USD token balance</p>
        <p>• USDC: USD Coin token balance</p>
      </div>
    </div>
  );
}