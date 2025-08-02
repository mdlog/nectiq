import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Users, TrendingUp, Award, Activity, BarChart3, Settings, Lock, Plus, Database, Calendar, DollarSign, Zap, Trophy, Megaphone, Swords, Edit, Trash2, Download, Search, Filter, AlertTriangle, Shield, Ban, UserPlus, RefreshCw, Coins, Eye, CheckCircle, XCircle, Clock, AlertCircle, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAccount, useWriteContract, useSendTransaction, useWaitForTransaction } from "wagmi";
import { parseEther, parseUnits } from "viem";

// Helper functions for blockchain explorer URLs
const getBlockchainExplorerUrl = (hash: string, token: string): string => {
  const lowerToken = token.toLowerCase();
  
  switch (lowerToken) {
    case 'eth':
    case 'usdc':
    case 'usdt':
      // Use Sepolia testnet explorer for Ethereum transactions
      return `https://sepolia.etherscan.io/tx/${hash}`;
    case 'bnb':
      // Use BSC testnet
      return `https://testnet.bscscan.com/tx/${hash}`;
    case 'matic':
    case 'pol':
      // Use Polygon Mumbai testnet
      return `https://mumbai.polygonscan.com/tx/${hash}`;
    case 'avax':
      // Use Avalanche Fuji testnet
      return `https://testnet.snowtrace.io/tx/${hash}`;
    case 'sol':
      // Solana devnet
      return `https://solscan.io/tx/${hash}?cluster=devnet`;
    case 'ada':
      // Cardano testnet
      return `https://preprod.cardanoscan.io/transaction/${hash}`;
    case 'dot':
      return `https://polkascan.io/polkadot/transaction/${hash}`;
    case 'xrp':
      // XRP testnet
      return `https://testnet.xrpl.org/transactions/${hash}`;
    case 'doge':
      // Dogecoin testnet
      return `https://sochain.com/tx/DOGETEST/${hash}`;
    case 'btc':
      // Bitcoin testnet
      return `https://blockstream.info/testnet/tx/${hash}`;
    default:
      // Default to Sepolia testnet
      return `https://sepolia.etherscan.io/tx/${hash}`;
  }
};

const getExplorerName = (token: string): string => {
  const lowerToken = token.toLowerCase();
  
  switch (lowerToken) {
    case 'eth':
    case 'usdc':
    case 'usdt':
      return 'Sepolia Etherscan';
    case 'bnb':
      return 'BSC Testnet';
    case 'matic':
    case 'pol':
      return 'Mumbai PolygonScan';
    case 'avax':
      return 'Fuji Snowtrace';
    case 'sol':
      return 'Solscan Devnet';
    case 'ada':
      return 'Cardano Preprod';
    case 'dot':
      return 'PolkaScan';
    case 'xrp':
      return 'XRPL Testnet';
    case 'doge':
      return 'DogeChain Testnet';
    case 'btc':
      return 'Bitcoin Testnet';
    default:
      return 'Sepolia Etherscan';
  }
};

const getChainDisplayName = (token: string): string => {
  const lowerToken = token.toLowerCase();
  
  switch (lowerToken) {
    case 'eth':
    case 'usdc':
    case 'usdt':
      return 'Sepolia';
    case 'bnb':
      return 'BSC Testnet';
    case 'matic':
    case 'pol':
      return 'Mumbai';
    case 'avax':
      return 'Fuji';
    case 'sol':
      return 'Solana Devnet';
    case 'ada':
      return 'Cardano Preprod';
    case 'dot':
      return 'Polkadot';
    case 'xrp':
      return 'XRPL Testnet';
    case 'doge':
      return 'Dogecoin Testnet';
    case 'btc':
      return 'Bitcoin Testnet';
    default:
      return 'Sepolia';
  }
};

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalRewards: number;
  activeUsers: number;
  accuracyAverage: number;
  totalStaked: number;
}

interface User {
  id: number;
  username: string;
  email?: string | null;
  emailVerified?: boolean;
  walletAddress: string | null;
  balance: number;
  isAdmin: boolean;
  authMethod: string;
  totalPredictions: number;
  correctPredictions: number;
  totalRewards: number;
}

interface Prediction {
  id: number;
  userId: number;
  cryptocurrency: string; // Sesuai dengan field dari backend
  predictedPrice: number;
  actualPrice: number | null;
  timeframe: string;
  stakeAmount: number;
  status: string;
  accuracy: number | null;
  reward: number | null;
  createdAt: string;
}

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  image: string;
  pythFeedId: string | null;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("statistics");
  
  // Web3 hooks
  const { isConnected, address, chain } = useAccount();
  const { writeContract, isPending: isWritePending, error: writeError } = useWriteContract();
  const { sendTransaction, isPending: isSendPending, error: sendError } = useSendTransaction();
  
  // State for various admin functions
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", walletAddress: "", isAdmin: false });
  const [newCrypto, setNewCrypto] = useState({ id: "", name: "", symbol: "", image: "", pythFeedId: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTimeframe, setFilterTimeframe] = useState("all");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<number | null>(null);
  const [fetchedLogoUrl, setFetchedLogoUrl] = useState("");
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Queries
  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000,
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/predictions"],
    refetchInterval: 30000,
  });

  const { data: cryptocurrencies, isLoading: cryptoLoading } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/admin/cryptocurrencies"],
    refetchInterval: 30000,
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 15000,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
    refetchInterval: 30000,
  });

  const { data: securityEvents, isLoading: securityLoading } = useQuery({
    queryKey: ["/api/admin/security"],
    refetchInterval: 15000,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    refetchInterval: 30000,
  });

  // Query untuk data harga real-time
  const { data: cryptoPrices } = useQuery({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 3000, // Update setiap 3 detik
  });

  // Mutations for admin actions
  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("/api/admin/users", {
        method: "POST",
        body: userData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Successfully", description: "User added successfully" });
      setShowAddUser(false);
      setNewUser({ username: "", walletAddress: "", isAdmin: false });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to add user",
        variant: "destructive" 
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Successfully", description: "User updated successfully" });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to update user",
        variant: "destructive" 
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Successfully", description: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to delete user",
        variant: "destructive" 
      });
    },
  });

  const addCryptoMutation = useMutation({
    mutationFn: async (cryptoData: any) => {
      console.log('🔧 Sending cryptocurrency data:', cryptoData);
      return apiRequest("/api/admin/cryptocurrencies", {
        method: "POST",
        body: JSON.stringify(cryptoData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cryptocurrencies"] });
      toast({ title: "Successfully", description: "Cryptocurrency added successfully" });
      setShowAddCrypto(false);
      setNewCrypto({ id: "", name: "", symbol: "", image: "", pythFeedId: "" });
      setFetchedLogoUrl("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to add cryptocurrency",
        variant: "destructive" 
      });
    },
  });

  const deleteCryptoMutation = useMutation({
    mutationFn: async (cryptoId: string) => {
      return apiRequest(`/api/admin/cryptocurrencies/${cryptoId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cryptocurrencies"] });
      toast({ title: "Successfully", description: "Cryptocurrency deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to delete cryptocurrency",
        variant: "destructive" 
      });
    },
  });

  // Withdrawal action handler
  const handleWithdrawalAction = async (withdrawalId: number, action: 'approve' | 'reject') => {
    setProcessingWithdrawal(withdrawalId);
    
    try {
      if (action === 'approve') {
        // Find the withdrawal transaction data
        const withdrawal = Array.isArray(transactionsData) ? transactionsData.find((tx: any) => tx.id === withdrawalId && tx.type === 'withdrawal') : null;
        
        if (!withdrawal) {
          throw new Error('Withdrawal data not found');
        }

        // Check if wallet is connected
        if (!isConnected) {
          throw new Error('Please connect wallet to approve withdrawals');
        }

        // Additional debugging info
        console.log(`🔍 [WALLET-DEBUG] Connected: ${isConnected}`);
        console.log(`🔍 [WALLET-DEBUG] Address: ${address}`);
        console.log(`🔍 [WALLET-DEBUG] Chain: ${chain?.name} (ID: ${chain?.id})`);
        console.log(`🔍 [WALLET-DEBUG] Write pending: ${isWritePending}`);
        console.log(`🔍 [WALLET-DEBUG] Send pending: ${isSendPending}`);

        // Prepare transaction parameters
        const cryptoAmount = withdrawal.netAmount || (withdrawal.amount / 1000).toString(); // Use netAmount or fallback
        const tokenSymbol = withdrawal.token;
        const recipientAddress = withdrawal.toAddress;

        toast({ 
          title: "MetaMask Required", 
          description: `Please confirm transaction in MetaMask: ${cryptoAmount} ${tokenSymbol} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}` 
        });

        // Call MetaMask transaction
        let transactionHash = '';
        
        if (tokenSymbol === 'ETH') {
          // For ETH transactions - use sendTransaction
          const tx = await sendTransaction({
            to: recipientAddress as `0x${string}`,
            value: parseEther(cryptoAmount)
          });
          transactionHash = tx || '';
        } else {
          // For ERC-20 tokens (USDC, USDT) - Simulation mode untuk testing
          console.log(`🔍 [USDC-DEBUG] Starting USDC withdrawal for ${cryptoAmount} ${tokenSymbol}`);
          
          const tokenAddresses = {
            'USDC': '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // Sepolia USDC testnet (official)
            'USDT': '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06'  // Sepolia USDT testnet
          };
          
          const tokenAddress = tokenAddresses[tokenSymbol as keyof typeof tokenAddresses];
          if (!tokenAddress) {
            throw new Error(`Unsupported token: ${tokenSymbol}`);
          }

          console.log(`🔍 [USDC-DEBUG] Token address: ${tokenAddress}`);
          console.log(`🔍 [USDC-DEBUG] Recipient: ${recipientAddress}`);
          
          // ERC-20 transfer function
          const decimals = tokenSymbol === 'USDC' || tokenSymbol === 'USDT' ? 6 : 18;
          const amountInWei = parseUnits(cryptoAmount, decimals);
          
          console.log(`🔍 [USDC-DEBUG] Amount in wei: ${amountInWei.toString()}`);
          console.log(`🔍 [USDC-DEBUG] Calling writeContract...`);
          
          // Show current wallet info and USDC contract details
          console.log(`🔍 [USDC-INFO] Using official Sepolia USDC contract: ${tokenAddress}`);
          console.log(`🔍 [USDC-INFO] Connected wallet: ${address}`);
          console.log(`🔍 [USDC-INFO] Chain: ${chain?.name} (ID: ${chain?.id})`);
          
          // Ask user to check their wallet for actual USDC balance
          toast({
            title: "USDC Withdrawal Ready",
            description: `Menggunakan USDC testnet resmi Sepolia. Pastikan wallet memiliki ${cryptoAmount} USDC untuk transaksi.`,
            variant: "default",
          });

          // Add button to get testnet USDC if needed
          console.log(`💡 [USDC-HELP] Cara mendapatkan USDC testnet Sepolia:`);
          console.log(`💡 [USDC-HELP] 1. Visit: https://faucet.circle.com/`);
          console.log(`💡 [USDC-HELP] 2. Connect wallet: ${address}`);
          console.log(`💡 [USDC-HELP] 3. Select Sepolia testnet`);
          console.log(`💡 [USDC-HELP] 4. Request USDC testnet tokens`);
          console.log(`💡 [USDC-HELP] 5. Contract USDC: ${tokenAddress}`);
          
          try {
            console.log(`🔄 [USDC-DEBUG] About to call writeContract with params:`, {
              address: tokenAddress,
              functionName: 'transfer',
              args: [recipientAddress, amountInWei.toString()],
              decimals,
              chainId: chain?.id
            });

            // Wait a moment to ensure wallet is ready
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log(`🔍 [USDC-DEBUG] Attempting real transaction...`);
            
            const tx = await writeContract({
              address: tokenAddress as `0x${string}`,
              abi: [
                {
                  name: 'transfer',
                  type: 'function',
                  inputs: [
                    { name: 'to', type: 'address' },
                    { name: 'amount', type: 'uint256' }
                  ],
                  outputs: [{ name: '', type: 'bool' }],
                  stateMutability: 'nonpayable'
                }
              ],
              functionName: 'transfer',
              args: [recipientAddress as `0x${string}`, amountInWei]
            });
            
            console.log(`✅ [USDC-DEBUG] Transaction submitted successfully: ${tx}`);
            console.log(`✅ [USDC-DEBUG] Transaction type:`, typeof tx);
            transactionHash = tx || '';
          } catch (writeError) {
            console.error(`❌ [USDC-DEBUG] WriteContract error details:`, {
              error: writeError,
              message: writeError?.message,
              code: writeError?.code,
              reason: writeError?.reason
            });
            
            // Check if error is due to insufficient balance
            if (writeError?.message?.includes('insufficient') || writeError?.message?.includes('balance')) {
              console.log(`💡 [USDC-DEBUG] Detected insufficient balance - wallet needs USDC testnet tokens`);
              toast({
                title: "Insufficient USDC Balance",
                description: "Wallet admin tidak memiliki cukup USDC di Sepolia testnet. Silakan deposit USDC testnet terlebih dahulu.",
                variant: "destructive",
              });
            }
            
            throw writeError;
          }
        }

        // First, update status to processing with hash
        await apiRequest(`/api/admin/withdrawals/${withdrawalId}/processing`, {
          method: 'POST',
          body: JSON.stringify({ 
            transactionHash,
            cryptoAmount,
            tokenSymbol 
          })
        });

        // Show processing message
        toast({ 
          title: "Transaction Submitted", 
          description: `Transaction submitted to blockchain: ${transactionHash.slice(0, 10)}... Waiting for confirmation...` 
        });

        // Invalidate queries to show processing status
        queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });

        // Enhanced transaction monitoring with multiple retries
        const checkTransactionStatus = async (attempts = 0, maxAttempts = 12) => {
          try {
            console.log(`🔍 [TX-MONITOR] Checking transaction status - Attempt ${attempts + 1}/${maxAttempts}`);
            
            // Use Etherscan API without API key (limited but functional)
            const response = await fetch(`https://sepolia.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${transactionHash}`);
            const data = await response.json();
            
            console.log(`📊 [TX-MONITOR] API Response:`, data);
            
            if (data.status === '1' && data.result?.status === '1') {
              // Transaction successful - update to completed
              console.log(`✅ [TX-MONITOR] Transaction confirmed on blockchain!`);
              
              await apiRequest(`/api/admin/withdrawals/${withdrawalId}/complete`, {
                method: 'POST',
                body: JSON.stringify({ 
                  transactionHash,
                  confirmed: true,
                  adminNote: 'Auto-confirmed via blockchain verification'
                })
              });
              
              queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
              toast({ 
                title: "✅ Transaction Confirmed", 
                description: `Withdrawal ID ${withdrawalId} confirmed on blockchain! Hash: ${transactionHash.slice(0, 20)}...` 
              });
              return;
            } else if (data.status === '1' && data.result?.status === '0') {
              // Transaction failed
              console.log(`❌ [TX-MONITOR] Transaction failed on blockchain`);
              toast({ 
                title: "❌ Transaction Failed", 
                description: `Withdrawal transaction failed on blockchain. Please check manually.`,
                variant: "destructive"
              });
              return;
            } else if (attempts < maxAttempts) {
              // Transaction still pending - retry
              console.log(`⏳ [TX-MONITOR] Transaction still pending, retrying in 10 seconds...`);
              setTimeout(() => checkTransactionStatus(attempts + 1, maxAttempts), 10000);
            } else {
              // Max attempts reached
              console.log(`⚠️ [TX-MONITOR] Max attempts reached, transaction may need manual verification`);
              toast({ 
                title: "⚠️ Manual Verification Required", 
                description: `Transaction monitoring timed out. Please verify withdrawal ${withdrawalId} manually on blockchain.`,
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error(`❌ [TX-MONITOR] Error checking transaction status:`, error);
            if (attempts < maxAttempts) {
              setTimeout(() => checkTransactionStatus(attempts + 1, maxAttempts), 15000);
            }
          }
        };

        // Start monitoring after 10 seconds
        setTimeout(() => checkTransactionStatus(), 10000);
      } else {
        // For reject action, just call API
        const response = await apiRequest(`/api/admin/withdrawals/${withdrawalId}/${action}`, {
          method: 'POST',
        });
        
        if (response) {
          queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
          toast({ 
            title: "Success", 
            description: `Withdrawal ${action}d successfully` 
          });
        }
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || `Failed to ${action} withdrawal`,
        variant: "destructive" 
      });
    } finally {
      setProcessingWithdrawal(null);
    }
  };

  // Handle withdrawal completion
  const handleCompleteWithdrawal = async (withdrawalId: number) => {
    if (!updateData.transactionHash.trim()) {
      toast({
        title: "Error",
        description: "Transaction hash is required to complete withdrawal",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`🔄 [COMPLETE-WD] Completing withdrawal ${withdrawalId} with hash: ${updateData.transactionHash}`);

      await apiRequest(`/api/admin/withdrawals/${withdrawalId}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          transactionHash: updateData.transactionHash,
          adminNote: updateData.adminNote || 'Manual completion via admin panel',
          confirmed: true
        })
      });

      // Reset form
      setUpdateData({ transactionHash: '', adminNote: '', status: 'processing' });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });

      toast({
        title: "✅ Withdrawal Completed",
        description: `Withdrawal ID ${withdrawalId} marked as completed with verified transaction hash.`
      });

      console.log(`✅ [COMPLETE-WD] Successfully completed withdrawal ${withdrawalId}`);

    } catch (error) {
      console.error(`❌ [COMPLETE-WD] Error completing withdrawal ${withdrawalId}:`, error);
      toast({
        title: "Error",
        description: "Failed to complete withdrawal. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch crypto logo from CoinGecko
  const fetchCryptoLogo = async () => {
    if (!newCrypto.id.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter a Crypto ID first",
        variant: "destructive" 
      });
      return;
    }

    setIsFetchingLogo(true);
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${newCrypto.id.toLowerCase()}`);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.image && data.image.large) {
        setFetchedLogoUrl(data.image.large);
        setNewCrypto(prev => ({
          ...prev,
          image: data.image.large,
          name: data.name || prev.name,
          symbol: data.symbol?.toUpperCase() || prev.symbol
        }));
        
        toast({ 
          title: "Success", 
          description: `Logo fetched successfully for ${data.name}` 
        });
      } else {
        throw new Error("Logo not found in API response");
      }
    } catch (error: any) {
      console.error("Error fetching logo:", error);
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to fetch logo from CoinGecko",
        variant: "destructive" 
      });
    } finally {
      setIsFetchingLogo(false);
    }
  };

  // Helper function untuk mencari harga cryptocurrency
  const getCryptoPrice = (cryptoId: string) => {
    if (!cryptoPrices || !Array.isArray(cryptoPrices)) return null;
    const crypto = cryptoPrices.find((c: any) => c.id === cryptoId);
    return crypto;
  };

  // Helper function untuk mendapatkan info cryptocurrency dari database admin
  const getCryptoInfo = (cryptoId: string) => {
    if (!cryptocurrencies || !Array.isArray(cryptocurrencies)) {
      // Fallback ke cryptoPrices jika cryptocurrencies tidak tersedia
      if (!cryptoPrices || !Array.isArray(cryptoPrices)) return null;
      const crypto = cryptoPrices.find((c: any) => c.id === cryptoId);
      return crypto ? {
        name: crypto.name,
        symbol: crypto.symbol?.toUpperCase(),
        image: crypto.image
      } : null;
    }
    
    const crypto = cryptocurrencies.find((c: Cryptocurrency) => c.id === cryptoId);
    return crypto ? {
      name: crypto.name,
      symbol: crypto.symbol?.toUpperCase(),
      image: crypto.image
    } : null;
  };

  // Filter functions
  const filteredUsers = usersData?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPredictions = predictions?.filter(prediction => {
    if (filterStatus !== "all" && prediction.status !== filterStatus) return false;
    if (filterTimeframe !== "all" && prediction.timeframe !== filterTimeframe) return false;
    return true;
  });

  // Export functions
  const exportUsers = () => {
    if (!usersData) return;
    const csvContent = [
      ["ID", "Username", "Wallet Address", "Balance", "Admin", "Total Predictions", "Total Rewards"].join(","),
      ...usersData.map(user => [
        user.id,
        user.username,
        user.walletAddress || "N/A",
        user.balance,
        user.isAdmin ? "Yes" : "No",
        user.totalPredictions,
        user.totalRewards
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Successfully", description: "Users exported successfully" });
  };

  const exportPredictions = () => {
    if (!predictions) return;
    const csvContent = [
      ["ID", "User ID", "Crypto", "Predicted Price", "Actual Price", "Timeframe", "Stake", "Status", "Reward"].join(","),
      ...predictions.map(prediction => {
        const cryptoInfo = getCryptoInfo(prediction.cryptoSymbol);
        const cryptoDisplay = cryptoInfo ? `${cryptoInfo.name} (${cryptoInfo.symbol})` : prediction.cryptoSymbol;
        return [
          prediction.id,
          prediction.userId,
          cryptoDisplay,
          prediction.predictedPrice,
          prediction.actualPrice || "N/A",
          prediction.timeframe,
          prediction.stakeAmount,
          prediction.status,
          prediction.reward || "N/A"
        ].join(",");
      })
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "predictions_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Successfully", description: "Predictions exported successfully" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Professional Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Nectiq Admin Panel
                </h1>
                <p className="text-slate-300 text-sm">Platform Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-700/50 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">System Online</span>
              </div>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                size="sm"
                className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-200"
              >
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">{/* Content wrapper moved here */}

        {/* Professional Navigation */}
        <div className="mb-8">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent w-full grid grid-cols-3 lg:grid-cols-9 gap-2 h-auto p-0">
                <TabsTrigger 
                  value="statistics" 
                  className="flex-col h-20 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 rounded-lg border-0"
                >
                  <BarChart3 className="h-6 w-6 mb-1" />
                  Statistics
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex-col h-20 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 rounded-lg border-0"
                >
                  <Users className="h-6 w-6 mb-1" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="cryptocurrencies" 
                  className="flex-col h-20 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 rounded-lg border-0"
                >
                  <Database className="h-6 w-6 mb-1" />
                  Crypto
                </TabsTrigger>
                <TabsTrigger 
                  value="predictions" 
                  className="flex-col h-20 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 rounded-lg border-0"
                >
                  <TrendingUp className="h-6 w-6 mb-1" />
                  Predictions
                </TabsTrigger>
                <TabsTrigger 
                  value="leaderboard" 
                  className="flex-col h-20 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 rounded-lg border-0"
                >
                  <Trophy className="h-6 w-6 mb-1" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions" 
                  className="flex-col h-20 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 rounded-lg border-0"
                >
                  <DollarSign className="h-6 w-6 mb-1" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex-col h-20 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 rounded-lg border-0"
                >
                  <Lock className="h-6 w-6 mb-1" />
                  Security
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="flex-col h-20 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 rounded-lg border-0"
                >
                  <Calendar className="h-6 w-6 mb-1" />
                  Events
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex-col h-20 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 rounded-lg border-0"
                >
                  <Settings className="h-6 w-6 mb-1" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">{/* Moved content to new wrapper */}

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-2">Total Users</p>
                      <p className="text-3xl font-bold text-white">
                        {statsLoading ? (
                          <div className="animate-pulse bg-slate-600 h-8 w-16 rounded"></div>
                        ) : (adminStats?.totalUsers || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-2">Total Predictions</p>
                      <p className="text-3xl font-bold text-white">
                        {statsLoading ? (
                          <div className="animate-pulse bg-slate-600 h-8 w-16 rounded"></div>
                        ) : (adminStats?.totalPredictions || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-2">Total Rewards</p>
                      <p className="text-3xl font-bold text-white">
                        {statsLoading ? (
                          <div className="animate-pulse bg-slate-600 h-8 w-20 rounded"></div>
                        ) : `${adminStats?.totalRewards || 0}`}
                      </p>
                      <p className="text-xs text-yellow-400 font-medium">NTIQ</p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <Award className="h-8 w-8 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-2">Active Users</p>
                      <p className="text-3xl font-bold text-white">
                        {statsLoading ? (
                          <div className="animate-pulse bg-slate-600 h-8 w-16 rounded"></div>
                        ) : (adminStats?.activeUsers || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Activity className="h-8 w-8 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Platform Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-white">
                    <BarChart3 className="mr-3 h-6 w-6 text-blue-400" />
                    Platform Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Average Accuracy</p>
                          <p className="text-lg font-bold text-white">
                            {statsLoading ? "Loading..." : `${((adminStats?.accuracyAverage || 0) * 100).toFixed(1)}%`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <DollarSign className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Total Staked</p>
                          <p className="text-lg font-bold text-white">
                            {statsLoading ? "Loading..." : (adminStats?.totalStaked || 0)} NTIQ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-white">
                    <Database className="mr-3 h-6 w-6 text-yellow-400" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Platform Status</p>
                          <p className="text-lg font-bold text-green-400">Online</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Users className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Registered Users</p>
                          <p className="text-lg font-bold text-white">
                            {usersLoading ? "Loading..." : (usersData?.length || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2" size={20} />
                    User Management ({filteredUsers?.length || 0})
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportUsers} variant="outline" size="sm">
                      <Download className="mr-2" size={16} />
                      Export CSV
                    </Button>
                    <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="mr-2" size={16} />
                          Add New User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Add New User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Username</Label>
                            <Input
                              value={newUser.username}
                              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Enter username"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Wallet Address</Label>
                            <Input
                              value={newUser.walletAddress}
                              onChange={(e) => setNewUser({...newUser, walletAddress: e.target.value})}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="0x..."
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newUser.isAdmin}
                              onCheckedChange={(checked) => setNewUser({...newUser, isAdmin: checked})}
                            />
                            <Label className="text-white">Admin privileges</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => addUserMutation.mutate(newUser)}
                              disabled={addUserMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {addUserMutation.isPending ? "Adding..." : "Add User"}
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddUser(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
                
                {/* Search Bar */}
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      placeholder="Search users by username, email, or wallet address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading users...</div>
                  </div>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Predictions</TableHead>
                        <TableHead>Rewards</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell className="text-sm">
                            {user.email ? (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-300">{user.email}</span>
                                {user.emailVerified && (
                                  <Badge variant="default" className="bg-green-600 text-xs">
                                    ✓ Verified
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">No email</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'N/A'}
                          </TableCell>
                          <TableCell>{user.balance} NTIQ</TableCell>
                          <TableCell>
                            <Badge variant={user.isAdmin ? "default" : "secondary"}>
                              {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.totalPredictions}</TableCell>
                          <TableCell>{user.totalRewards} NTIQ</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-slate-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-red-400 flex items-center">
                                      <AlertTriangle className="mr-2" size={20} />
                                      Delete User
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Alert className="border-red-600/50 bg-red-950/20">
                                      <AlertTriangle className="h-4 w-4 text-red-400" />
                                      <AlertDescription className="text-red-300">
                                        Are you sure you want to delete user <strong>{user.username}</strong>?
                                        This action cannot be undone and will remove all associated data.
                                      </AlertDescription>
                                    </Alert>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="destructive"
                                        onClick={() => deleteUserMutation.mutate(user.id)}
                                        disabled={deleteUserMutation.isPending}
                                      >
                                        {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
                                      </Button>
                                      <DialogTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogTrigger>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Users Found</h3>
                    <p className="text-slate-400">Add your first user to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cryptocurrencies Tab */}
          <TabsContent value="cryptocurrencies" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="mr-2" size={20} />
                    Cryptocurrency Management ({cryptocurrencies?.length || 0})
                  </div>
                  <Dialog open={showAddCrypto} onOpenChange={(open) => {
                    setShowAddCrypto(open);
                    if (!open) {
                      // Reset form when dialog closes
                      setNewCrypto({ id: "", name: "", symbol: "", image: "", pythFeedId: "" });
                      setFetchedLogoUrl("");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2" size={16} />
                        Add New Cryptocurrency
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add New Cryptocurrency</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Crypto ID</Label>
                          <Input
                            value={newCrypto.id}
                            onChange={(e) => setNewCrypto({...newCrypto, id: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="bitcoin"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Name</Label>
                          <Input
                            value={newCrypto.name}
                            onChange={(e) => setNewCrypto({...newCrypto, name: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Bitcoin"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Symbol</Label>
                          <Input
                            value={newCrypto.symbol}
                            onChange={(e) => setNewCrypto({...newCrypto, symbol: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="BTC"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Image URL</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newCrypto.image}
                              onChange={(e) => setNewCrypto({...newCrypto, image: e.target.value})}
                              className="bg-slate-700 border-slate-600 text-white flex-1"
                              placeholder="https://..."
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={fetchCryptoLogo}
                              disabled={isFetchingLogo || !newCrypto.id.trim()}
                              className="bg-green-600 hover:bg-green-700 border-green-600 text-white"
                            >
                              {isFetchingLogo ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Fetching...
                                </>
                              ) : (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Fetch Logo
                                </>
                              )}
                            </Button>
                          </div>
                          {fetchedLogoUrl && (
                            <div className="mt-2 p-2 bg-slate-700 border border-slate-600 rounded flex items-center gap-3">
                              <img 
                                src={fetchedLogoUrl} 
                                alt="Logo preview" 
                                className="w-10 h-10 rounded-full bg-white p-1"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="text-sm">
                                <div className="text-green-400 font-medium">✓ Logo fetched from CoinGecko</div>
                                <div className="text-slate-400 truncate max-w-xs">{fetchedLogoUrl}</div>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            Enter Crypto ID above, then click "Fetch Logo" to get logo from CoinGecko
                          </p>
                        </div>
                        <div>
                          <Label className="text-white">Pyth Network Feed ID</Label>
                          <Input
                            value={newCrypto.pythFeedId}
                            onChange={(e) => setNewCrypto({...newCrypto, pythFeedId: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="0x..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              // Format data according to backend expectation
                              const cryptoData = {
                                cryptoId: newCrypto.id,
                                name: newCrypto.name,
                                symbol: newCrypto.symbol,
                                image: newCrypto.image,
                                pythFeedId: newCrypto.pythFeedId
                              };
                              addCryptoMutation.mutate(cryptoData);
                            }}
                            disabled={addCryptoMutation.isPending || !newCrypto.id || !newCrypto.name || !newCrypto.symbol || !newCrypto.pythFeedId}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {addCryptoMutation.isPending ? "Adding..." : "Add Cryptocurrency"}
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddCrypto(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cryptoLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading cryptocurrencies...</div>
                  </div>
                ) : cryptocurrencies && cryptocurrencies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cryptocurrencies.map((crypto) => {
                      const priceData = getCryptoPrice(crypto.id);
                      return (
                        <Card key={crypto.id} className="bg-slate-700 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={crypto.image} 
                                  alt={crypto.name}
                                  className="w-10 h-10 rounded-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="%23666"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8">${crypto.symbol}</text></svg>`;
                                  }}
                                />
                                <div>
                                  <h3 className="font-semibold text-white">{crypto.name}</h3>
                                  <p className="text-sm text-slate-400">{crypto.symbol}</p>
                                  {priceData ? (
                                    <div className="text-xs">
                                      <p className="text-green-400 font-semibold">
                                        ${priceData.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                                      </p>
                                      <p className="text-slate-500">Pyth Network • Live</p>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-500">
                                      {crypto.pythFeedId ? "Pyth Network" : "No Feed"}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-slate-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-red-400 flex items-center">
                                      <AlertTriangle className="mr-2" size={20} />
                                      Delete Cryptocurrency
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Alert className="border-red-600/50 bg-red-950/20">
                                      <AlertTriangle className="h-4 w-4 text-red-400" />
                                      <AlertDescription className="text-red-300">
                                        Are you sure you want to delete <strong>{crypto.name} ({crypto.symbol})</strong>?
                                        This will remove all associated data and predictions.
                                      </AlertDescription>
                                    </Alert>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="destructive"
                                        onClick={() => deleteCryptoMutation.mutate(crypto.id)}
                                        disabled={deleteCryptoMutation.isPending}
                                      >
                                        {deleteCryptoMutation.isPending ? "Deleting..." : "Delete Cryptocurrency"}
                                      </Button>
                                      <DialogTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogTrigger>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Cryptocurrencies</h3>
                    <p className="text-slate-400">Add your first cryptocurrency to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2" size={20} />
                    All Predictions ({filteredPredictions?.length || 0})
                  </div>
                  <Button onClick={exportPredictions} variant="outline" size="sm">
                    <Download className="mr-2" size={16} />
                    Export CSV
                  </Button>
                </CardTitle>
                
                {/* Filters */}
                <div className="mt-4 flex gap-4">
                  <div>
                    <Label className="text-white">Status Filter</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Timeframe Filter</Label>
                    <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all">All Timeframes</SelectItem>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="6h">6 Hours</SelectItem>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {predictionsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading predictions...</div>
                  </div>
                ) : filteredPredictions && filteredPredictions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Crypto</TableHead>
                        <TableHead>Predicted Price</TableHead>
                        <TableHead>Actual Price</TableHead>
                        <TableHead>Timeframe</TableHead>
                        <TableHead>Stake</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPredictions.slice(0, 20).map((prediction) => (
                        <TableRow key={prediction.id}>
                          <TableCell>{prediction.id}</TableCell>
                          <TableCell>{prediction.userId}</TableCell>
                          <TableCell>
                            {(() => {
                              const cryptoInfo = getCryptoInfo(prediction.cryptocurrency);
                              return cryptoInfo ? (
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={cryptoInfo.image} 
                                    alt={cryptoInfo.name}
                                    className="w-6 h-6 rounded-full"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="%23666"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8">${cryptoInfo.symbol}</text></svg>`;
                                    }}
                                  />
                                  <div>
                                    <div className="font-medium text-white">{cryptoInfo.name}</div>
                                    <div className="text-xs text-slate-400">{cryptoInfo.symbol}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="font-mono text-slate-400">{prediction.cryptocurrency}</span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>${prediction.predictedPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            {prediction.actualPrice ? `$${prediction.actualPrice.toLocaleString()}` : 'Pending'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{prediction.timeframe}</Badge>
                          </TableCell>
                          <TableCell>{prediction.stakeAmount} NTIQ</TableCell>
                          <TableCell>
                            <Badge variant={
                              prediction.status === 'completed' ? 'default' : 
                              prediction.status === 'active' ? 'secondary' : 'outline'
                            }>
                              {prediction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {prediction.reward ? `${prediction.reward} NTIQ` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400">
                            {new Date(prediction.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Predictions</h3>
                    <p className="text-slate-400">Predictions will appear here when users start making them</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="mr-2" size={20} />
                    Platform Leaderboard
                  </div>
                  <Button variant="outline">
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading leaderboard...</div>
                  </div>
                ) : leaderboardData && (leaderboardData as any).users && (leaderboardData as any).users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Total Rewards</TableHead>
                        <TableHead>Predictions</TableHead>
                        <TableHead>Streak</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {((leaderboardData as any).users || []).slice(0, 10).map((user: any, index: number) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {index === 0 && "🥇"}
                              {index === 1 && "🥈"}
                              {index === 2 && "🥉"}
                              {index > 2 && `#${index + 1}`}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.accuracy >= 90 ? "default" : user.accuracy >= 80 ? "secondary" : "outline"}>
                              {user.accuracy ? `${user.accuracy.toFixed(1)}%` : '0%'}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.totalRewards || 0} NTIQ</TableCell>
                          <TableCell>{user.totalPredictions || 0}</TableCell>
                          <TableCell>
                            {user.currentStreak >= 5 ? "🔥" : user.accuracy >= 90 ? "⭐" : ""} 
                            {user.currentStreak || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Leaderboard Data</h3>
                    <p className="text-slate-400">Leaderboard will populate as users make predictions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Deposits</p>
                      <p className="text-3xl font-bold text-white">$0</p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">Total Withdrawals</p>
                      <p className="text-3xl font-bold text-white">$0</p>
                    </div>
                    <XCircle className="h-12 w-12 text-red-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">NTIQ Rewards</p>
                      <p className="text-3xl font-bold text-white">{adminStats?.totalRewards || 0}</p>
                    </div>
                    <Coins className="h-12 w-12 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Pending Transactions</p>
                      <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <Clock className="h-12 w-12 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Recent Transactions
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2" size={16} />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2" size={16} />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading transactions...</div>
                  </div>
                ) : transactionsData && Array.isArray(transactionsData) && transactionsData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>NTIQ Amount</TableHead>
                        <TableHead>Crypto Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hash</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(Array.isArray(transactionsData) ? transactionsData : []).slice(0, 20).map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{transaction.username || `User ${transaction.userId}`}</TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.type === 'deposit' ? 'default' :
                              transaction.type === 'withdrawal' ? 'destructive' :
                              'secondary'
                            }>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {transaction.type === 'deposit' 
                              ? `${transaction.amount.toLocaleString()} NTIQ`
                              : `${transaction.amount.toLocaleString()} NTIQ`
                            }
                          </TableCell>
                          <TableCell>
                            {transaction.type === 'withdrawal' && transaction.netAmount
                              ? `${parseFloat(transaction.netAmount).toFixed(6)} ${transaction.token}` // Untuk withdrawal: tampilkan setelah dipotong fee
                              : transaction.type === 'deposit' && transaction.usdAmount && transaction.token === 'ETH'
                              ? (() => {
                                  // Untuk deposit ETH: hitung crypto amount yang benar berdasarkan USD / harga snapshot + fee 2%
                                  // Menggunakan data historis dari database yang disimpan di ethPriceSnapshot
                                  const ethPriceSnapshot = transaction.ethPriceSnapshot || 3477; // Harga ETH saat deposit dari database
                                  const baseCryptoAmount = parseFloat(transaction.usdAmount) / ethPriceSnapshot;
                                  const cryptoAmountWithFee = baseCryptoAmount * 1.02; // Tambahkan fee 2% sesuai user dashboard
                                  return `${cryptoAmountWithFee.toFixed(6)} ${transaction.token}`;
                                })()
                              : transaction.type === 'deposit' && transaction.usdAmount
                              ? (() => {
                                  // Untuk deposit USDC/USDT: tambahkan fee 2% sesuai user dashboard
                                  const baseAmount = parseFloat(transaction.usdAmount);
                                  const amountWithFee = baseAmount * 1.02; // Tambahkan fee 2%
                                  return `${amountWithFee.toFixed(6)} ${transaction.token}`;
                                })() // Untuk token USDC/USDT dengan fee 2%
                              : transaction.usdAmount 
                              ? `${parseFloat(transaction.usdAmount).toFixed(6)} ${transaction.token}`
                              : `${(transaction.amount / 1000).toFixed(6)} ${transaction.token}`
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.status === 'completed' ? 'default' :
                              transaction.status === 'pending' ? 'secondary' :
                              'destructive'
                            }>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {transaction.hash && transaction.hash !== '3' && (transaction.hash.startsWith('0x') && transaction.hash.length >= 42) ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-2 py-1 bg-purple-900/50 rounded-md">
                                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                  <span className="text-purple-300 text-xs font-medium">
                                    {getChainDisplayName(transaction.token)}
                                  </span>
                                </div>
                                <a
                                  href={getBlockchainExplorerUrl(transaction.hash, transaction.token)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                                  title={`View transaction on ${getExplorerName(transaction.token)}`}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </a>
                                <span className="text-xs text-slate-400 font-mono">
                                  {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-6)}
                                </span>
                              </div>
                            ) : transaction.hash === '3' ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-900/50 rounded-md">
                                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                  <span className="text-orange-300 text-xs font-medium">Invalid Hash</span>
                                </div>
                                <span className="text-xs text-slate-500">Database contains placeholder value</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded-md">
                                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                  <span className="text-slate-400 text-xs font-medium">Pending</span>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {transaction.type === 'withdrawal' && transaction.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleWithdrawalAction(transaction.id, 'approve')}
                                  className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                  disabled={processingWithdrawal === transaction.id}
                                >
                                  {processingWithdrawal === transaction.id ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleWithdrawalAction(transaction.id, 'reject')}
                                  className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                  disabled={processingWithdrawal === transaction.id}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : transaction.type === 'withdrawal' && transaction.status === 'processing' ? (
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                                      Complete
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-slate-800 border-slate-700">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">Complete Withdrawal</DialogTitle>
                                      <DialogDescription className="text-slate-300">
                                        Mark withdrawal ID {transaction.id} as completed with verified transaction hash
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label className="text-white">Transaction Hash</Label>
                                        <Input
                                          value={updateData.transactionHash}
                                          onChange={(e) => setUpdateData({...updateData, transactionHash: e.target.value})}
                                          className="bg-slate-700 border-slate-600 text-white"
                                          placeholder="0x... (Enter verified transaction hash)"
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label className="text-white">Admin Note</Label>
                                        <Input
                                          value={updateData.adminNote}
                                          onChange={(e) => setUpdateData({...updateData, adminNote: e.target.value})}
                                          className="bg-slate-700 border-slate-600 text-white"
                                          placeholder="Manual completion confirmation"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        onClick={() => handleCompleteWithdrawal(transaction.id)}
                                        disabled={updateMutation.isPending}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        {updateMutation.isPending ? "Completing..." : "✅ Complete Withdrawal"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <span className="text-xs text-slate-400">Processing</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Transactions</h3>
                    <p className="text-slate-400">Transaction history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Successful Logins</p>
                      <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <Shield className="h-12 w-12 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Failed Attempts</p>
                      <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <AlertTriangle className="h-12 w-12 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">Blocked IPs</p>
                      <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <Ban className="h-12 w-12 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="mr-2" size={20} />
                    Security Events
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2" size={16} />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2" size={16} />
                      Export Log
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {securityLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading security events...</div>
                  </div>
                ) : securityEvents && Array.isArray(securityEvents) && securityEvents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>User/IP</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(Array.isArray(securityEvents) ? securityEvents : []).slice(0, 20).map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-xs text-slate-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{event.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {event.userAgent ? `${event.ip?.slice(0, 12)}...` : event.ip}
                          </TableCell>
                          <TableCell className="text-sm">{event.details}</TableCell>
                          <TableCell>
                            <Badge variant={
                              event.status === 'success' ? 'default' :
                              event.status === 'failed' ? 'destructive' :
                              'secondary'
                            }>
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              event.riskLevel === 'high' ? 'destructive' :
                              event.riskLevel === 'medium' ? 'secondary' :
                              'outline'
                            }>
                              {event.riskLevel || 'low'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Security Events</h3>
                    <p className="text-slate-400">Security monitoring is active. Events will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2" size={20} />
                  Admin Actions Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs text-slate-400">
                        {new Date().toLocaleString()}
                      </TableCell>
                      <TableCell>Admin_62c5b6</TableCell>
                      <TableCell>
                        <Badge variant="default">Panel Access</Badge>
                      </TableCell>
                      <TableCell>Admin Panel</TableCell>
                      <TableCell className="text-sm">Accessed admin dashboard</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-2" size={20} />
                    Event Management
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2" size={16} />
                    Create Event
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Platform Maintenance</h3>
                          <p className="text-slate-400 text-sm">Scheduled maintenance window</p>
                          <p className="text-xs text-slate-500">
                            {new Date(Date.now() + 86400000).toLocaleDateString()} - Active
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Trading Competition</h3>
                          <p className="text-slate-400 text-sm">Monthly prediction battle event</p>
                          <p className="text-xs text-slate-500">
                            {new Date(Date.now() + 604800000).toLocaleDateString()} - Upcoming
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2" size={20} />
                    Platform Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Maintenance Mode</Label>
                      <p className="text-sm text-slate-400">Enable platform maintenance</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2" size={16} />
                      {maintenanceMode ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">New User Registration</Label>
                      <p className="text-sm text-slate-400">Allow new users to register</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <UserPlus className="mr-2" size={16} />
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Prediction Limits</Label>
                      <p className="text-sm text-slate-400">Max predictions per user</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue={10}
                        className="w-20 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Token Economics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Starting Balance</Label>
                      <p className="text-sm text-slate-400">NTIQ tokens for new users</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue={1000}
                        className="w-24 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Min Stake Amount</Label>
                      <p className="text-sm text-slate-400">Minimum prediction stake</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue={50}
                        className="w-20 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Max Stake Amount</Label>
                      <p className="text-sm text-slate-400">Maximum prediction stake</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue={500}
                        className="w-20 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2" size={20} />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Reset Database</Label>
                    <p className="text-sm text-slate-400">⚠️ This will permanently delete all data</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Database className="mr-2" size={16} />
                        Reset Database
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-red-400 flex items-center">
                          <AlertTriangle className="mr-2" size={20} />
                          Confirm Database Reset
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert className="border-red-600/50 bg-red-950/20">
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-300">
                            This action cannot be undone. All users, predictions, transactions, and settings will be permanently deleted.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <Label className="text-white">Type "RESET" to confirm</Label>
                          <Input
                            placeholder="RESET"
                            className="bg-slate-700 border-slate-600 text-white"
                            value={resetConfirmText}
                            onChange={(e) => {
                              const value = e.target.value;
                              console.log('🔍 [RESET-DEBUG] Input changed:', { value, isRESET: value === 'RESET' });
                              setResetConfirmText(value);
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            disabled={resetConfirmText !== 'RESET' || isResetting}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            onClick={async () => {
                              console.log('🔥 [RESET-DEBUG] Confirm Reset button clicked!');
                              
                              if (resetConfirmText !== 'RESET') {
                                console.log('❌ [RESET-DEBUG] Invalid confirmation code:', resetConfirmText);
                                return;
                              }
                              
                              console.log('🚀 [RESET-DEBUG] Starting reset process...');
                              console.log('🔍 [RESET-DEBUG] Confirm text:', resetConfirmText);
                              
                              setIsResetting(true);
                              
                              try {
                                console.log('📡 [RESET-DEBUG] Making API call to /api/admin/reset-database');
                                const response = await fetch('/api/admin/reset-database', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'X-Admin-Operation': 'database-reset',
                                    'X-Bypass-Rate-Limit': 'true',
                                    'X-Admin-IP-Override': 'true'
                                  },
                                  credentials: 'include',
                                  body: JSON.stringify({ confirmationCode: 'RESET' })
                                });
                                
                                console.log('📄 [RESET-DEBUG] Response status:', response.status);
                                console.log('📄 [RESET-DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
                                
                                let result;
                                try {
                                  result = await response.json();
                                  console.log('✅ [RESET-DEBUG] Reset response JSON:', result);
                                } catch (jsonError) {
                                  console.error('❌ [RESET-DEBUG] JSON parse error:', jsonError);
                                  const text = await response.text();
                                  console.log('📄 [RESET-DEBUG] Raw response text:', text);
                                  result = { message: 'Failed to parse response: ' + text };
                                }
                                
                                if (response.ok && result.success) {
                                  console.log('🎉 [RESET-DEBUG] Reset successful!');
                                  toast({ 
                                    title: "Database Reset Successful", 
                                    description: "All data has been cleared. Page will reload...",
                                    variant: "default"
                                  });
                                  setTimeout(() => window.location.reload(), 2000);
                                } else {
                                  console.error('❌ [RESET-DEBUG] Reset failed:', result);
                                  toast({ 
                                    title: "Reset Failed", 
                                    description: result.message || result.error || 'Unknown error',
                                    variant: "destructive"
                                  });
                                }
                              } catch (error: any) {
                                console.error('❌ [RESET-DEBUG] Network/Fetch error:', error);
                                toast({ 
                                  title: "Network Error", 
                                  description: 'Reset failed: ' + error.message,
                                  variant: "destructive"
                                });
                              } finally {
                                setIsResetting(false);
                              }
                            }}
                          >
{isResetting ? "Resetting..." : "Confirm Reset"}
                          </Button>
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}