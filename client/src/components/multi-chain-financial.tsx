import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSwitchChain, useWriteContract, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wallet, 
  Plus, 
  Send, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Coins,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DepositCountdownTimer } from '@/components/deposit-countdown-timer';
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// ERC-20 Transfer ABI for Wagmi
const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// Blockchain Logo Components
const EthereumLogo = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L4 12.5L12 17L20 12.5L12 2Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
    />
    <path
      d="M4 12.5L12 22L20 12.5L12 17L4 12.5Z"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
);

const BaseLogo = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="currentColor"
    />
    <path
      d="M12 6v12M6 12h12"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const BSCLogo = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor"/>
    <path
      d="M8 12h8M12 8v8M9.5 9.5l5 5M14.5 9.5l-5 5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const OptimismLogo = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor"/>
    <path
      d="M8 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4zM14 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z"
      fill="white"
    />
  </svg>
);

const ArbitrumLogo = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 12L12 22L21 12L12 2Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
    />
    <path
      d="M8 12L12 6L16 12L12 18L8 12Z"
      fill="white"
    />
  </svg>
);

const SepoliaLogo = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor"/>
    <path
      d="M12 7v10M7 12h10M9 9l6 6M15 9l-6 6"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const HoleskyLogo = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

// Supported chain configuration (adminWallet removed for security - fetched from server)
const SUPPORTED_CHAINS = [
  {
    chainId: 1,
    name: "Ethereum",
    symbol: "ETH",
    shortName: "eth",
    color: "text-blue-600",
    logo: EthereumLogo,
    explorerUrl: "https://etherscan.io",
    tokens: {
      ETH: { address: "native", decimals: 18 },
      USDC: { address: "0xA0b86a33E6b4A3C6d4b1B4BcF8F7f8d7C6cC9c9e", decimals: 6 },
      USDT: { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", decimals: 6 }
    }
  },
  {
    chainId: 8453,
    name: "Base",
    symbol: "ETH",
    shortName: "base",
    color: "text-blue-500",
    logo: BaseLogo,
    explorerUrl: "https://basescan.org",
    tokens: {
      ETH: { address: "native", decimals: 18 },
      USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
      USDT: { address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimals: 6 }
    }
  },
  {
    chainId: 56,
    name: "BSC",
    symbol: "BNB",
    shortName: "bsc",
    color: "text-yellow-600",
    logo: BSCLogo,
    explorerUrl: "https://bscscan.com",
    tokens: {
      ETH: { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", decimals: 18 },
      USDC: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
      USDT: { address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 }
    }
  },
  {
    chainId: 10,
    name: "Optimism",
    symbol: "ETH",
    shortName: "optimism",
    color: "text-red-600",
    logo: OptimismLogo,
    explorerUrl: "https://optimistic.etherscan.io",
    tokens: {
      ETH: { address: "native", decimals: 18 },
      USDC: { address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", decimals: 6 },
      USDT: { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6 }
    }
  },
  {
    chainId: 42161,
    name: "Arbitrum",
    symbol: "ETH",
    shortName: "arbitrum",
    color: "text-indigo-600",
    logo: ArbitrumLogo,
    explorerUrl: "https://arbiscan.io",
    tokens: {
      ETH: { address: "native", decimals: 18 },
      USDC: { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", decimals: 6 },
      USDT: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6 }
    }
  },
  {
    chainId: 11155111,
    name: "Sepolia",
    symbol: "ETH",
    shortName: "sepolia",
    color: "text-purple-600",
    logo: SepoliaLogo,
    explorerUrl: "https://sepolia.etherscan.io",
    tokens: {
      ETH: { address: "native", decimals: 18 },
      USDC: { address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", decimals: 6 },
      USDT: { address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", decimals: 6 }
    }
  },
  {
    chainId: 17000,
    name: "Holesky",
    symbol: "ETH",
    shortName: "holesky",
    color: "text-gray-600",
    logo: HoleskyLogo,
    explorerUrl: "https://holesky.etherscan.io",
    tokens: {
      ETH: { address: "native", decimals: 18 },
      USDC: { address: "0x449cde79f489e2ae32e6314d8d966ca64e040409", decimals: 6 }, // Official Circle USDC on Holesky
      USDT: { address: "0x87350147a24099bf1e7e677576f01c1415857c75", decimals: 6 }  // Verified USDT on Holesky
    }
  }
];

interface DepositData {
  id: number;
  chainName: string;
  tokenType: string;
  amountUSD: string;
  ntiqAmount: number;
  status: string;
  transactionHash?: string;
  ethPriceSnapshot?: string;
  createdAt: string;
  expiresAt?: string;
}

interface WithdrawalData {
  id: number;
  chainName: string;
  tokenType: string;
  ntiqAmount: number;
  usdAmount: string;
  feeAmount?: string;
  netAmount?: string;
  ethPriceSnapshot?: string;
  status: string;
  transactionHash?: string;
  adminNote?: string;
  createdAt: string;
}

export function MultiChainFinancial() {
  const [selectedAction, setSelectedAction] = useState<"deposit" | "withdraw">("deposit");
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [selectedToken, setSelectedToken] = useState<"ETH" | "USDC" | "USDT">("ETH");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [fixedEthAmount, setFixedEthAmount] = useState<string>("0");
  const [confirmationEthAmount, setConfirmationEthAmount] = useState<string>("0");
  const [expandedDeposits, setExpandedDeposits] = useState<Set<number>>(new Set());
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [processedHashes, setProcessedHashes] = useState<Set<string>>(new Set());
  
  // Pagination states
  const [depositPage, setDepositPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const itemsPerPage = 5;
  
  const queryClient = useQueryClient();
  
  // Wagmi hooks for consistent wallet technology
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: contractTxHash, isPending: isContractPending } = useWriteContract();
  const { sendTransaction, data: ethTxHash, isPending: isEthPending } = useSendTransaction();
  
  // Use the appropriate transaction hash based on transaction type
  const txHash = ethTxHash || contractTxHash;
  const isTransactionPending = isEthPending || isContractPending;
  
  const { data: transactionReceipt, isLoading: isReceiptLoading } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Secure query to get admin wallet address from server
  const { data: adminWalletData, isLoading: adminWalletLoading } = useQuery({
    queryKey: ["/api/deposit/admin-wallet"],
    staleTime: 300000, // Cache for 5 minutes
    retry: 3,
  });

  // Pagination component
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void; 
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">{currentPage}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Query to get user data
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    staleTime: 30000,
  });

  // Query to get deposit history
  const { data: deposits, isLoading: depositsLoading, refetch: refetchDeposits } = useQuery({
    queryKey: ["/api/user/deposits"],
    refetchInterval: 5000, // More frequent refresh
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data
  });

  // Query to get withdrawal history
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["/api/user/withdrawals"],
    refetchInterval: 10000,
  });

  // Query to get crypto prices for ETH conversion
  const { data: cryptoPrices } = useQuery({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 5000,
    staleTime: 0,
  });

  // Calculate pagination for deposits
  const getPaginatedDeposits = () => {
    if (!deposits) return [];
    const startIndex = (depositPage - 1) * itemsPerPage;
    return deposits.slice(startIndex, startIndex + itemsPerPage);
  };

  // Calculate pagination for withdrawals
  const getPaginatedWithdrawals = () => {
    if (!withdrawals) return [];
    const startIndex = (withdrawalPage - 1) * itemsPerPage;
    return withdrawals.slice(startIndex, startIndex + itemsPerPage);
  };

  // Calculate total pages
  const totalDepositPages = Math.ceil((deposits?.length || 0) / itemsPerPage);
  const totalWithdrawalPages = Math.ceil((withdrawals?.length || 0) / itemsPerPage);

  // Function to calculate token amount from USD for deposit history action view
  const calculateTokenAmountForHistory = (usdAmount: number, tokenType: string, ethPriceSnapshot?: string): string => {
    if (import.meta.env.DEV) {
      console.log(`🔍 [ETH-CALC] Calculating for ${tokenType}, USD: ${usdAmount}, snapshot: ${ethPriceSnapshot}`);
    }
    
    if (tokenType === 'USDC' || tokenType === 'USDT') {
      // For USDC/USDT, add 2% fee to the amount user needs to send
      const amountWithFee = usdAmount * 1.02;
      return amountWithFee.toFixed(2);
    }
    
    if (tokenType === 'ETH') {
      // For ETH deposits, use snapshot price if available, otherwise use current price
      let price = 0;
      
      if (ethPriceSnapshot && ethPriceSnapshot !== 'null') {
        price = parseFloat(ethPriceSnapshot);
        if (import.meta.env.DEV) {
          console.log(`🔍 [ETH-CALC] Using snapshot price: ${price}`);
        }
      } else if (cryptoPrices && cryptoPrices.length > 0) {
        const ethPrice = cryptoPrices.find((crypto: any) => crypto.id === 'ethereum');
        price = ethPrice?.current_price || 0;
        if (import.meta.env.DEV) {
          console.log(`🔍 [ETH-CALC] Using current price: ${price}, cryptoPrices length: ${cryptoPrices.length}`);
        }
      } else {
        // Emergency fallback price (approximate current ETH price)
        price = 3400; // Use a reasonable ETH price as fallback
        if (import.meta.env.DEV) {
          console.log(`🔍 [ETH-CALC] Using fallback price: ${price}`);
        }
      }
      
      if (price === 0) {
        if (import.meta.env.DEV) {
          console.log(`❌ [ETH-CALC] No valid price found, returning 0.000000`);
        }
        return "0.000000";
      }
      
      // Calculate base ETH amount and add 2% fee
      const baseTokenAmount = usdAmount / price;
      const tokenAmountWithFee = baseTokenAmount * 1.02;
      const result = tokenAmountWithFee.toFixed(6);
      if (import.meta.env.DEV) {
        console.log(`✅ [ETH-CALC] Final result: ${result} ETH (base: ${baseTokenAmount}, with fee: ${tokenAmountWithFee})`);
      }
      return result;
    }
    
    return "0.000000";
  };

  // Function to format deposit history display - show token amount that user actually paid (including fee)
  const formatDepositDisplay = (deposit: DepositData): string => {
    // Safety check for amountUSD
    if (!deposit.amountUSD || deposit.amountUSD === "NaN" || isNaN(parseFloat(deposit.amountUSD))) {
      return `0.00 ${deposit.tokenType}`;
    }
    
    if (deposit.tokenType === 'USDC' || deposit.tokenType === 'USDT') {
      // Use calculateTokenAmountForHistory to get amount with fee included
      const parsedAmount = parseFloat(deposit.amountUSD);
      const amountWithFee = calculateTokenAmountForHistory(parsedAmount, deposit.tokenType, deposit.ethPriceSnapshot);
      return `${amountWithFee} ${deposit.tokenType}`;
    }
    
    if (deposit.tokenType === 'ETH') {
      // Calculate ETH amount from USD amount with fee included
      const parsedAmount = parseFloat(deposit.amountUSD);
      const ethAmount = calculateTokenAmountForHistory(parsedAmount, deposit.tokenType, deposit.ethPriceSnapshot);
      return `${ethAmount} ETH`;
    }
    
    // For other tokens, also use calculateTokenAmountForHistory
    const parsedAmount = parseFloat(deposit.amountUSD);
    const amountWithFee = calculateTokenAmountForHistory(parsedAmount, deposit.tokenType, deposit.ethPriceSnapshot);
    return `${amountWithFee} ${deposit.tokenType}`;
  };

  // Function to calculate withdrawal amount for different tokens
  const calculateWithdrawalAmount = (ntiqAmount: number, tokenType: string): string => {
    const usdAmount = ntiqAmount * 0.01; // 1 NTIQ = $0.01
    
    if (tokenType === 'USDC' || tokenType === 'USDT') {
      // Apply 2.5% fee for stablecoins too
      const netAmount = usdAmount * 0.975; // 97.5% after 2.5% fee
      return netAmount.toFixed(2);
    }
    
    if (tokenType === 'ETH') {
      if (cryptoPrices && cryptoPrices.length > 0) {
        const ethPrice = cryptoPrices.find((crypto: any) => crypto.id === 'ethereum');
        if (ethPrice?.current_price) {
          const ethAmount = usdAmount / ethPrice.current_price;
          const netEthAmount = ethAmount * 0.975; // 97.5% after 2.5% fee
          return netEthAmount.toFixed(6);
        }
      }
      return "0.000000";
    }
    
    return "0.000000";
  };

  // Function to calculate fee amount for withdrawal
  const calculateWithdrawalFee = (ntiqAmount: number, tokenType: string): string => {
    const usdAmount = ntiqAmount * 0.01; // 1 NTIQ = $0.01
    const feeUsd = usdAmount * 0.025; // 2.5% fee
    
    if (tokenType === 'USDC' || tokenType === 'USDT') {
      return feeUsd.toFixed(2);
    }
    
    if (tokenType === 'ETH') {
      if (cryptoPrices && cryptoPrices.length > 0) {
        const ethPrice = cryptoPrices.find((crypto: any) => crypto.id === 'ethereum');
        if (ethPrice?.current_price) {
          const feeEthAmount = feeUsd / ethPrice.current_price;
          return feeEthAmount.toFixed(6);
        }
      }
      return "0.000000";
    }
    
    return "0.000000";
  };

  // Toggle function for expanding deposit action view
  const toggleDepositExpanded = (depositId: number) => {
    const newExpanded = new Set(expandedDeposits);
    if (newExpanded.has(depositId)) {
      newExpanded.delete(depositId);
    } else {
      newExpanded.add(depositId);
    }
    setExpandedDeposits(newExpanded);
  };

  const checkBlockchainStatus = async (depositId: number) => {
    setIsCheckingStatus(true);
    try {
      // First, force refresh all deposit data from server
      await queryClient.invalidateQueries({ queryKey: ["/api/user/deposits"] });
      await queryClient.refetchQueries({ queryKey: ["/api/user/deposits"] });
      
      // Also refresh user balance
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/user"] });

      toast({
        title: "Status Refreshed",
        description: "Deposit status has been updated from database",
      });
    } catch (error: any) {
      console.error('Error checking blockchain status:', error);
      toast({
        title: "Error",
        description: "Failed to refresh deposit status",
        variant: "destructive",
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Effect to calculate fixed ETH amount when deposit amount changes for ETH deposits
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`🔍 [DEPOSIT-CALC] useEffect triggered - Token: ${selectedToken}, Amount: ${depositAmount}, CryptoPrices: ${cryptoPrices?.length || 0}`);
    }
    
    if (selectedToken === "ETH" && depositAmount) {
      const usd = parseFloat(depositAmount);
      if (!isNaN(usd) && usd > 0) {
        let ethPrice = 0;
        
        if (cryptoPrices && cryptoPrices.length > 0) {
          const ethData = cryptoPrices.find((crypto: any) => crypto.id === "ethereum");
          ethPrice = ethData?.current_price || 0;
          if (import.meta.env.DEV) {
            console.log(`🔍 [DEPOSIT-CALC] Found ETH price from API: ${ethPrice}`);
          }
        }
        
        if (ethPrice === 0) {
          // Use fallback price when API data is not available
          ethPrice = 3400; // Reasonable ETH price fallback
          console.log(`🔍 [DEPOSIT-CALC] Using fallback ETH price: ${ethPrice}`);
        }
        
        // Calculate ETH amount based on USD + add 2% fee on ETH payment
        const baseEthAmount = usd / ethPrice;
        const ethAmountWithFee = baseEthAmount * 1.02; // Add 2% fee to ETH payment
        const result = ethAmountWithFee.toFixed(6);
        
        console.log(`✅ [DEPOSIT-CALC] Setting fixedEthAmount: ${result} (USD: ${usd}, ETH Price: ${ethPrice})`);
        setFixedEthAmount(result);
      } else {
        console.log(`❌ [DEPOSIT-CALC] Invalid USD amount: ${usd}`);
        setFixedEthAmount("0");
      }
    } else {
      console.log(`🔍 [DEPOSIT-CALC] Conditions not met - setting fixedEthAmount to 0`);
      setFixedEthAmount("0");
    }
  }, [depositAmount, selectedToken, cryptoPrices]);

  // Mutation to create deposit request
  const createDepositMutation = useMutation({
    mutationFn: async (depositData: {
      chainName: string;
      chainId: number;
      tokenType: string;
      tokenAddress: string;
      amountUSD: string;
      toWalletAddress: string;
      fromWalletAddress: string;
    }) => {
      const response = await apiRequest("/api/deposits/create", {
        method: "POST",
        body: JSON.stringify(depositData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowDepositModal(false);
      setDepositAmount("");
      toast({
        title: "Deposit Request Created",
        description: "Please transfer to the displayed address to complete deposit",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deposit request",
        variant: "destructive",
      });
    },
  });

  // Mutation to create withdrawal request
  const createWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: {
      ntiqAmount: number;
      chainName: string;
      tokenType: string;
      toWalletAddress: string;
    }) => {
      const response = await apiRequest("/api/withdrawals/create", {
        method: "POST",
        body: JSON.stringify(withdrawalData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      toast({
        title: "Withdrawal Request Created",
        description: "Your withdrawal request is pending admin approval",
      });
    },
    onError: (error: any) => {
      console.error('Withdrawal error:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.toLowerCase().includes('authentication')) {
        toast({
          title: "Authentication Required",
          description: "Please connect your wallet to create withdrawal requests",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create withdrawal request",
          variant: "destructive",
        });
      }
    },
  });

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Error",
        description: "Deposit amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    // Check if admin wallet data is available
    if (!adminWalletData?.adminWallet) {
      toast({
        title: "Security Error",
        description: "Cannot retrieve secure admin wallet address. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const tokenConfig = selectedChain.tokens[selectedToken];
    const amountUSD = parseFloat(depositAmount);

    createDepositMutation.mutate({
      chainName: selectedChain.shortName,
      chainId: selectedChain.chainId,
      tokenType: selectedToken,
      tokenAddress: tokenConfig.address,
      amountUSD: depositAmount,
      toWalletAddress: adminWalletData.adminWallet, // Use secure admin wallet from server
      fromWalletAddress: user?.walletAddress || "0x0000000000000000000000000000000000000000", // Use authenticated user's wallet address
    });
  };

  const handleWithdraw = () => {
    // Check if user is authenticated first
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet and login to access withdrawal features",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawAmount || parseInt(withdrawAmount) <= 0) {
      toast({
        title: "Error",
        description: "Withdrawal amount must be greater than 0 NTIQ",
        variant: "destructive",
      });
      return;
    }

    const ntiqAmount = parseInt(withdrawAmount);
    if (ntiqAmount > user.balance) {
      toast({
        title: "Error",
        description: "Insufficient NTIQ balance",
        variant: "destructive",
      });
      return;
    }

    createWithdrawalMutation.mutate({
      ntiqAmount,
      chainName: selectedChain.shortName,
      tokenType: selectedToken,
      toWalletAddress: user.walletAddress || "",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  // MOBILE-OPTIMIZED wallet transaction function (enhanced for mobile MetaMask)
  const sendViaWallet = async (deposit: any) => {
    try {
      console.log('🔧 [MOBILE-DEBUG] sendViaWallet called, checking connection...');
      
      // Check wallet connection using consistent RainbowKit/Wagmi technology
      if (!isConnected || !address) {
        console.log('🚨 [MOBILE-DEBUG] Wallet not connected:', { isConnected, address });
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet using RainbowKit to continue",
          variant: "destructive",
        });
        return;
      }
      
      console.log('🔧 [MOBILE-DEBUG] Wallet connected, proceeding with transaction...');

      // Get chain configuration
      const targetChain = SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName);
      if (!targetChain) {
        toast({
          title: "Chain Not Supported",
          description: "This chain is not supported for wallet transactions",
          variant: "destructive",
        });
        return;
      }

      // Calculate token amount using snapshot price - includes 2% fee for payment
      const tokenAmount = calculateTokenAmountForHistory(parseFloat(deposit.amountUSD), deposit.tokenType, deposit.ethPriceSnapshot);
      if (!tokenAmount || tokenAmount === "0.000000") {
        toast({
          title: "Invalid Transaction",
          description: "Cannot calculate transaction amount",
          variant: "destructive",
        });
        return;
      }

      // Get secure admin wallet address
      const secureAdminWallet = adminWalletData?.adminWallet;
      if (!secureAdminWallet) {
        toast({
          title: "Security Error",
          description: "Cannot retrieve secure admin wallet address",
          variant: "destructive",
        });
        return;
      }

      // Switch to target network if needed (consistent with RainbowKit)
      if (chain?.id !== targetChain.chainId) {
        try {
          await switchChain({ chainId: targetChain.chainId });
          toast({
            title: "Network Switched",
            description: `Switched to ${targetChain.name}`,
          });
        } catch (error: any) {
          toast({
            title: "Network Switch Failed",
            description: "Please switch network manually in your wallet",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Preparing Transaction",
        description: "Please confirm the transaction in your wallet",
      });

      // Handle ETH transfer using Wagmi sendTransaction
      if (deposit.tokenType === 'ETH') {
        const ethValue = parseEther(tokenAmount);
        
        console.log('🔧 [WALLET-DEBUG] Attempting ETH transaction:', {
          to: secureAdminWallet,
          value: ethValue.toString(),
          tokenAmount,
          chainId: chain?.id,
          targetChainId: targetChain.chainId,
          isConnected,
          address
        });
        
        // MOBILE-OPTIMIZED ETH transaction - Direct call without Promise wrapper
        try {
          console.log('🔧 [MOBILE-DEBUG] Attempting ETH sendTransaction...');
          
          // CRITICAL MOBILE FIX: Direct call to sendTransaction for better mobile compatibility
          const result = sendTransaction({
            to: secureAdminWallet as `0x${string}`,
            value: ethValue,
          });
          
          console.log('🔧 [MOBILE-DEBUG] ETH transaction initiated:', result);
          
          // Mobile-specific success feedback
          toast({
            title: "Transaction Initiated",
            description: "Check your MetaMask mobile app to confirm the transaction",
          });
          
        } catch (sendError: any) {
          console.error('🚨 [MOBILE-ERROR] sendTransaction failed:', sendError);
          toast({
            title: "Transaction Failed",
            description: `MetaMask error: ${sendError.message || 'Unknown error'}`,
            variant: "destructive",
          });
          throw sendError;
        }
      }

    } catch (error: any) {
      console.error('Wallet transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction via wallet",
        variant: "destructive",
      });
    }
  };

  // Mutation to update deposit with transaction hash
  const updateDepositMutation = useMutation({
    mutationFn: async (data: { depositId: number; transactionHash: string; status: string }) => {
      const response = await apiRequest(`/api/deposits/${data.depositId}/update-transaction`, {
        method: "POST",
        body: JSON.stringify({
          transactionHash: data.transactionHash,
          status: data.status,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Toast notification removed to prevent duplicate notifications
    },
    onError: (error: any) => {
      console.error('❌ [DEPOSIT-UPDATE] Failed to update deposit:', error);
      toast({
        title: "Update Failed",
        description: "Failed to save transaction hash, but transaction was sent",
        variant: "destructive",
      });
    },
  });

  // Handle transaction success/failure using useEffect - ENHANCED FOR MOBILE
  useEffect(() => {
    if (txHash && !isTransactionPending && !processedHashes.has(txHash)) {
      console.log('🔧 [WALLET-SUCCESS] Wagmi transaction sent:', txHash);
      console.log('📱 [MOBILE-DEBUG] Mobile transaction detection - checking deposits for update...');

      // CRITICAL FIX: Update the most recent deposit with transaction hash
      // This fixes the issue where deposits were created without transaction hashes
      if (deposits && deposits.length > 0) {
        console.log(`📱 [MOBILE-DEBUG] Found ${deposits.length} deposits, searching for pending deposit...`);
        
        const latestDeposit = deposits.find(d => d.status === 'pending' && !d.transactionHash);
        if (latestDeposit) {
          console.log(`🔧 [DEPOSIT-FIX] Updating deposit ${latestDeposit.id} with transaction hash:`, txHash);
          console.log(`📱 [MOBILE-SUCCESS] Mobile deposit auto-update triggered for deposit ${latestDeposit.id}`);
          
          // Mark this hash as processed to prevent duplicates
          setProcessedHashes(prev => new Set(prev).add(txHash));
          
          updateDepositMutation.mutate({
            depositId: latestDeposit.id,
            transactionHash: txHash,
            status: 'processing',
          });

          toast({
            title: "Transaction Sent",
            description: `Transaction hash saved and deposit is processing`,
          });
        } else {
          console.warn('🚨 [DEPOSIT-WARNING] No pending deposit found to update with transaction hash');
          console.log('📱 [MOBILE-DEBUG] Available deposits:', deposits.map(d => ({ id: d.id, status: d.status, hasHash: !!d.transactionHash })));
        }
      } else {
        console.warn('📱 [MOBILE-WARNING] No deposits found for transaction hash update');
      }
    }
  }, [txHash, isTransactionPending, deposits, updateDepositMutation, processedHashes]);

  // Handle contract transaction hash (for ERC-20 tokens like USDC/USDT) - ENHANCED FOR MOBILE
  useEffect(() => {
    if (contractTxHash && !isContractPending && !processedHashes.has(contractTxHash)) {
      console.log('🔧 [CONTRACT-SUCCESS] Wagmi contract transaction sent:', contractTxHash);
      console.log('📱 [MOBILE-CONTRACT-DEBUG] Mobile contract transaction detection - checking deposits for update...');

      // CRITICAL FIX: Update the most recent deposit with contract transaction hash
      if (deposits && deposits.length > 0) {
        console.log(`📱 [MOBILE-CONTRACT-DEBUG] Found ${deposits.length} deposits, searching for pending deposit...`);
        
        const latestDeposit = deposits.find(d => d.status === 'pending' && !d.transactionHash);
        if (latestDeposit) {
          console.log(`🔧 [DEPOSIT-FIX] Updating deposit ${latestDeposit.id} with contract transaction hash:`, contractTxHash);
          console.log(`📱 [MOBILE-CONTRACT-SUCCESS] Mobile contract deposit auto-update triggered for deposit ${latestDeposit.id}`);
          
          // Mark this hash as processed to prevent duplicates
          setProcessedHashes(prev => new Set(prev).add(contractTxHash));
          
          updateDepositMutation.mutate({
            depositId: latestDeposit.id,
            transactionHash: contractTxHash,
            status: 'processing',
          });

          toast({
            title: "Token Transaction Sent",
            description: `Transaction hash saved and deposit is processing`,
          });
        } else {
          console.warn('🚨 [DEPOSIT-WARNING] No pending deposit found to update with contract transaction hash');
          console.log('📱 [MOBILE-CONTRACT-DEBUG] Available deposits:', deposits.map(d => ({ id: d.id, status: d.status, hasHash: !!d.transactionHash })));
        }
      } else {
        console.warn('📱 [MOBILE-CONTRACT-WARNING] No deposits found for contract transaction hash update');
      }
    }
  }, [contractTxHash, isContractPending, deposits, updateDepositMutation, processedHashes]);

  // Handle sendTransaction errors - ENHANCED FOR MOBILE
  useEffect(() => {
    if (isEthPending) {
      console.log('🔧 [WALLET-DEBUG] ETH transaction is pending...');
      console.log('📱 [MOBILE-DEBUG] Mobile ETH transaction pending - user should confirm in MetaMask app');
    }
  }, [isEthPending]);

  // Handle writeContract errors - ENHANCED FOR MOBILE
  useEffect(() => {
    if (isContractPending) {
      console.log('🔧 [WALLET-DEBUG] Contract transaction is pending...');
      console.log('📱 [MOBILE-DEBUG] Mobile contract transaction pending - user should confirm in MetaMask app');
    }
  }, [isContractPending]);

  // Handle transaction receipt - CRITICAL FOR MOBILE AUTO-UPDATE
  useEffect(() => {
    if (transactionReceipt && !isReceiptLoading && transactionReceipt.transactionHash) {
      console.log('🎉 [MOBILE-RECEIPT] Transaction receipt received:', transactionReceipt.transactionHash);
      
      // MOBILE FIX: Ensure deposit gets updated with confirmed transaction hash
      if (deposits && deposits.length > 0) {
        const latestDeposit = deposits.find(d => 
          (d.status === 'pending' || d.status === 'processing') && 
          (!d.transactionHash || d.transactionHash === transactionReceipt.transactionHash)
        );
        
        if (latestDeposit && !processedHashes.has(transactionReceipt.transactionHash)) {
          console.log(`🔧 [MOBILE-RECEIPT-FIX] Updating deposit ${latestDeposit.id} with confirmed transaction hash:`, transactionReceipt.transactionHash);
          
          // Mark this hash as processed to prevent duplicates
          setProcessedHashes(prev => new Set(prev).add(transactionReceipt.transactionHash));
          
          updateDepositMutation.mutate({
            depositId: latestDeposit.id,
            transactionHash: transactionReceipt.transactionHash,
            status: 'processing',
          });
        }
      }
      
      toast({
        title: "Transaction Confirmed",
        description: "Transaction confirmed on blockchain and deposit updated",
      });
      
      // Refresh deposit data with priority for mobile
      queryClient.invalidateQueries({ queryKey: ["/api/user/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Force refetch immediately for mobile reliability
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/user/deposits"] });
      }, 1000);
    }
  }, [transactionReceipt, isReceiptLoading, queryClient, deposits, updateDepositMutation, processedHashes]);

  // Function to send USDC/USDT via Wagmi (consistent with RainbowKit)
  const sendStablecoinViaWallet = async (deposit: any) => {
    try {
      // Check wallet connection using consistent RainbowKit/Wagmi technology
      if (!isConnected || !address) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet using RainbowKit to continue",
          variant: "destructive",
        });
        return;
      }

      // Get chain configuration
      const targetChain = SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName);
      if (!targetChain) {
        toast({
          title: "Chain Not Supported",
          description: "This chain is not supported for wallet transactions",
          variant: "destructive",
        });
        return;
      }

      // Get token configuration
      const tokenConfig = targetChain.tokens[deposit.tokenType as keyof typeof targetChain.tokens];
      if (!tokenConfig || !tokenConfig.address || tokenConfig.address === 'native') {
        toast({
          title: "Token Not Supported",
          description: "This token is not supported for wallet transactions",
          variant: "destructive",
        });
        return;
      }

      // Calculate stablecoin amount
      const tokenAmount = calculateTokenAmountForHistory(parseFloat(deposit.amountUSD), deposit.tokenType, deposit.ethPriceSnapshot);
      if (!tokenAmount || tokenAmount === "0.00") {
        toast({
          title: "Invalid Amount",
          description: "Invalid token amount calculated",
          variant: "destructive",
        });
        return;
      }

      // Get secure admin wallet address
      const secureAdminWallet = adminWalletData?.adminWallet;
      if (!secureAdminWallet) {
        toast({
          title: "Security Error",
          description: "Cannot retrieve secure admin wallet address",
          variant: "destructive",
        });
        return;
      }

      // Switch to target network if needed (consistent with RainbowKit)
      if (chain?.id !== targetChain.chainId) {
        try {
          await switchChain({ chainId: targetChain.chainId });
          toast({
            title: "Network Switched",
            description: `Switched to ${targetChain.name}`,
          });
        } catch (error: any) {
          toast({
            title: "Network Switch Failed",
            description: "Please switch network manually in your wallet",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Preparing Transaction",
        description: "Please confirm the transaction in your wallet",
      });

      // Handle ERC-20 token transfer using Wagmi
      const decimals = tokenConfig.decimals || 6; // USDC/USDT typically use 6 decimals
      const tokenValue = parseUnits(tokenAmount, decimals);
      
      // MOBILE-OPTIMIZED ERC-20 token transaction - Direct call without Promise wrapper
      try {
        console.log('🔧 [MOBILE-DEBUG] Attempting token writeContract...');
        
        // CRITICAL MOBILE FIX: Direct call to writeContract for better mobile compatibility
        const result = writeContract({
          address: tokenConfig.address as `0x${string}`,
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [secureAdminWallet as `0x${string}`, tokenValue],
        });
        
        console.log('🔧 [MOBILE-DEBUG] Token transaction initiated:', result);
        
        // Mobile-specific success feedback
        toast({
          title: "Transaction Initiated",
          description: "Check your MetaMask mobile app to confirm the token transaction",
        });
        
      } catch (contractError: any) {
        console.error('🚨 [MOBILE-ERROR] writeContract failed:', contractError);
        toast({
          title: "Transaction Failed",
          description: `MetaMask error: ${contractError.message || 'Unknown error'}`,
          variant: "destructive",
        });
        throw contractError;
      }

    } catch (error: any) {
      console.error('Wallet stablecoin transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send stablecoin transaction via wallet",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Function to get fixed ETH amount (already calculated with 2% fee)
  const getFixedETHAmount = (): string => {
    return fixedEthAmount;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", text: "Pending" },
      processing: { color: "bg-blue-500", text: "Processing" },
      confirmed: { color: "bg-blue-600", text: "Confirmed" },
      processed: { color: "bg-green-500", text: "Processed" },
      completed: { color: "bg-green-600", text: "Completed" },
      approved: { color: "bg-blue-600", text: "Approved" },
      rejected: { color: "bg-red-500", text: "Rejected" },
      failed: { color: "bg-red-600", text: "Failed" },
      cancelled: { color: "bg-gray-500", text: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Your NTIQ Balance</h3>
              <div className="flex items-center space-x-2 mt-2">
                <Coins className="w-6 h-6" />
                <span className="text-3xl font-bold">{user?.balance?.toLocaleString() || "0"}</span>
                <span className="text-sm opacity-80">NTIQ</span>
              </div>
              <p className="text-sm opacity-70 mt-1">
                ≈ ${((user?.balance || 0) * 0.01).toFixed(2)} USD (1 NTIQ = $0.01)
              </p>
            </div>
            <div className="text-right">
              <CreditCard className="w-12 h-12 opacity-60" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Tabs */}
      <Tabs value={selectedAction} onValueChange={(value) => setSelectedAction(value as "deposit" | "withdraw")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit" className="flex items-center space-x-2">
            <ArrowDownCircle className="w-4 h-4" />
            <span>Deposit</span>
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="flex items-center space-x-2">
            <ArrowUpCircle className="w-4 h-4" />
            <span>Withdraw</span>
          </TabsTrigger>
        </TabsList>

        {/* Deposit Tab */}
        <TabsContent value="deposit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deposit Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowDownCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Deposit ETH/USDC/USDT to NTIQ</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chain Selection */}
                <div>
                  <Label>Select Blockchain</Label>
                  <Select value={selectedChain.shortName} onValueChange={(value) => {
                    const chain = SUPPORTED_CHAINS.find(c => c.shortName === value);
                    if (chain) setSelectedChain(chain);
                  }}>
                    <SelectTrigger>
                      <div className="flex items-center space-x-2">
                        <selectedChain.logo className={`w-5 h-5 ${selectedChain.color}`} />
                        <span>{selectedChain.name}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CHAINS.map((chain) => (
                        <SelectItem key={chain.chainId} value={chain.shortName}>
                          <div className="flex items-center space-x-2">
                            <chain.logo className={`w-5 h-5 ${chain.color}`} />
                            <span>{chain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Token Selection */}
                <div>
                  <Label>Select Token</Label>
                  <Select value={selectedToken} onValueChange={(value) => setSelectedToken(value as "ETH" | "USDC" | "USDT")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Deposit Amount */}
              <div>
                <Label>Deposit Amount (USD)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount in USD"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
                {depositAmount && (
                  <div className="text-sm mt-1 space-y-1">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800 space-y-1">
                      <p className="text-gray-700 dark:text-gray-300">
                        USD Amount: <span className="font-bold text-gray-900 dark:text-white">${parseFloat(depositAmount).toFixed(2)}</span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        You will receive: <span className="font-bold text-blue-600">{(parseFloat(depositAmount) * 100).toLocaleString()} NTIQ</span>
                      </p>
                      {selectedToken !== "ETH" && (
                        <p className="text-gray-700 dark:text-gray-300">
                          Payment Fee (2%): <span className="font-bold text-orange-600">+${(parseFloat(depositAmount) * 0.02).toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                    {selectedToken === "ETH" && fixedEthAmount !== "0" && (
                      <div className="text-orange-600 space-y-1">
                        <p>ETH to send: <span className="font-bold">{getFixedETHAmount()} ETH</span></p>
                        <p className="text-xs text-orange-500">
                          (Includes 2% processing fee on ETH payment)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                    onClick={() => {
                      // Capture fixed ETH amount when dialog opens
                      if (selectedToken === "ETH" && fixedEthAmount !== "0") {
                        setConfirmationEthAmount(fixedEthAmount);
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Deposit Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirm Deposit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Chain:</span>
                        <div className="flex items-center space-x-2">
                          <selectedChain.logo className={`w-5 h-5 ${selectedChain.color}`} />
                          <span className="font-medium text-gray-900 dark:text-white">{selectedChain.name}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Token:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Amount:</span>
                        <span className="font-medium text-gray-900 dark:text-white">${depositAmount} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">NTIQ received:</span>
                        <span className="font-bold text-blue-600">{(parseFloat(depositAmount || "0") * 100).toLocaleString()} NTIQ</span>
                      </div>
                      {selectedToken !== "ETH" && (
                        <div className="border-t pt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">Payment Fee (2%):</span>
                            <span className="font-bold text-orange-600">+${(parseFloat(depositAmount || "0") * 0.02).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      {selectedToken === "ETH" && depositAmount && confirmationEthAmount !== "0" && (
                        <div className="border-t pt-2 mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">ETH to send:</span>
                            <span className="font-bold text-orange-600">{confirmationEthAmount} ETH</span>
                          </div>
                          <div className="text-xs text-orange-500 text-right">
                            (Includes 2% processing fee on ETH payment)
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Deposit Destination Address:</h4>
                      <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded border">
                        <code className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                          {adminWalletLoading ? "Loading secure address..." : adminWalletData?.adminWallet || "Loading..."}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(adminWalletData?.adminWallet || "")}
                          disabled={adminWalletLoading || !adminWalletData?.adminWallet}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      {selectedToken === "ETH" && depositAmount && confirmationEthAmount !== "0" ? (
                        <div className="text-xs text-blue-600 dark:text-blue-300 mt-2 space-y-1">
                          <p>⚠️ Make sure to transfer from the same wallet as your login wallet</p>
                          <p className="font-bold bg-orange-100 dark:bg-orange-900/30 p-2 rounded border-orange-300 border">
                            📤 Send exactly <span className="text-orange-700 dark:text-orange-300">{confirmationEthAmount} ETH</span> to the address above
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                          ⚠️ Make sure to transfer from the same wallet as your login wallet
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowDepositModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleDeposit}
                        disabled={createDepositMutation.isPending}
                      >
                        {createDepositMutation.isPending ? "Processing..." : "Confirm"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Deposit History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Deposit History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {depositsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : deposits?.length ? (
                <>
                <div className="space-y-3">
                  {getPaginatedDeposits().map((deposit: DepositData) => (
                    <div key={deposit.id} className="border rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{formatDepositDisplay(deposit)}</span>
                            <span>→</span>
                            <span className="font-bold text-blue-600">{deposit.ntiqAmount.toLocaleString()} NTIQ</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              {(() => {
                                const chain = SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName);
                                if (chain) {
                                  const LogoComponent = chain.logo;
                                  return <LogoComponent className={`w-4 h-4 ${chain.color}`} />;
                                }
                                return null;
                              })()}
                              <span>{SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName)?.name}</span>
                            </div>
                            {deposit.transactionHash && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-auto p-1"
                                onClick={() => {
                                  const chain = SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName);
                                  if (chain) {
                                    window.open(`${chain.explorerUrl}/tx/${deposit.transactionHash}`, '_blank');
                                  }
                                }}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          {getStatusBadge(deposit.status)}
                          <div className="text-xs text-gray-500">
                            {new Date(deposit.createdAt).toLocaleDateString('en-US')}
                          </div>
                          {deposit.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => toggleDepositExpanded(deposit.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              {expandedDeposits.has(deposit.id) ? 'Hide Action' : 'Action View'}
                            </Button>
                          )}
                          {deposit.status === 'processing' && deposit.transactionHash && (
                            <Button
                              size="sm"
                              variant="default"
                              className="mt-2 bg-blue-600 hover:bg-blue-700"
                              onClick={() => checkBlockchainStatus(deposit.id)}
                              disabled={isCheckingStatus}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {isCheckingStatus ? 'Checking...' : 'Check Status'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Countdown Timer for Pending Deposits */}
                      {deposit.status === 'pending' && deposit.expiresAt && (
                        <div className="border-t">
                          <DepositCountdownTimer 
                            expiresAt={deposit.expiresAt}
                            status={deposit.status}
                            onExpired={() => {
                              // Refresh deposits when timer expires
                              refetchDeposits();
                            }}
                            className="m-3"
                          />
                        </div>
                      )}
                      
                      {/* Action View for Pending Deposits */}
                      {deposit.status === 'pending' && expandedDeposits.has(deposit.id) && (
                        <div className="border-t bg-orange-50 dark:bg-orange-900/20 p-4">
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-3 flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Transfer Details for Completion
                          </h4>
                          
                          <div className="space-y-3">
                            {/* Token Amount to Transfer */}
                            <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{deposit.tokenType} Amount to Send:</span>
                                <div className="text-right">
                                  <span className="font-bold text-lg text-blue-600">
                                    {calculateTokenAmountForHistory(parseFloat(deposit.amountUSD), deposit.tokenType, deposit.ethPriceSnapshot)} {deposit.tokenType}
                                  </span>
                                  <div className="text-xs text-gray-500">
                                    (≈ ${deposit.amountUSD} USD + 2% fee)
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Destination Address */}
                            <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Send To Address:</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (adminWalletData?.adminWallet) {
                                      copyToClipboard(adminWalletData.adminWallet);
                                    }
                                  }}
                                  disabled={adminWalletLoading || !adminWalletData?.adminWallet}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                              <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block break-all text-gray-900 dark:text-gray-100">
                                {adminWalletLoading ? "Loading secure address..." : adminWalletData?.adminWallet || "Loading..."}
                              </code>
                            </div>
                            
                            {/* Network Info */}
                            <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Network:</span>
                                <div className="flex items-center space-x-2">
                                  {(() => {
                                    const chain = SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName);
                                    if (chain) {
                                      const LogoComponent = chain.logo;
                                      return <LogoComponent className={`w-5 h-5 ${chain.color}`} />;
                                    }
                                    return null;
                                  })()}
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName)?.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Token Contract Address (for USDC/USDT) */}
                            {(deposit.tokenType === 'USDC' || deposit.tokenType === 'USDT') && (
                              <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{deposit.tokenType} Contract:</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      const chain = SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName);
                                      const tokenAddress = chain?.tokens[deposit.tokenType as keyof typeof chain.tokens]?.address;
                                      if (tokenAddress && tokenAddress !== 'native') {
                                        copyToClipboard(tokenAddress);
                                      }
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                                <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block break-all text-gray-900 dark:text-gray-100">
                                  {(() => {
                                    const chain = SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName);
                                    const tokenAddress = chain?.tokens[deposit.tokenType as keyof typeof chain.tokens]?.address;
                                    return tokenAddress !== 'native' ? tokenAddress : 'Native Token';
                                  })()}
                                </code>
                              </div>
                            )}
                            
                            {/* Warning */}
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-800">
                              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                ⚠️ Make sure to transfer the exact amount to complete your deposit. Status will automatically update to "completed" once the transaction is confirmed.
                              </p>
                            </div>
                            
                            {/* MOBILE-OPTIMIZED Wallet Send Button (for ETH deposits only) - Enhanced for Mobile MetaMask */}
                            {deposit.tokenType === 'ETH' && (
                              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                <Button
                                  onClick={(e) => {
                                    console.log('🔧 [MOBILE-DEBUG] ETH wallet button clicked');
                                    e.preventDefault();
                                    e.stopPropagation();
                                    sendViaWallet(deposit);
                                  }}
                                  onTouchStart={(e) => {
                                    console.log('🔧 [MOBILE-DEBUG] ETH wallet button touched');
                                    e.currentTarget.focus();
                                  }}
                                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium touch-manipulation"
                                  size="lg"
                                  disabled={isTransactionPending || !isConnected}
                                  style={{ minHeight: '48px', touchAction: 'manipulation' }}
                                  data-testid="send-eth-wallet-button"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {isTransactionPending ? 'Sending...' : `Send ${calculateTokenAmountForHistory(parseFloat(deposit.amountUSD), deposit.tokenType, deposit.ethPriceSnapshot)} ETH via Wallet`}
                                </Button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                  Tap to send ETH via MetaMask mobile (includes 2% processing fee)
                                </p>
                              </div>
                            )}
                            
                            {/* MOBILE-OPTIMIZED Wallet Send Button (for USDC/USDT deposits) - Enhanced for Mobile MetaMask */}
                            {(deposit.tokenType === 'USDC' || deposit.tokenType === 'USDT') && (
                              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                <Button
                                  onClick={(e) => {
                                    console.log('🔧 [MOBILE-DEBUG] Token wallet button clicked');
                                    e.preventDefault();
                                    e.stopPropagation();
                                    sendStablecoinViaWallet(deposit);
                                  }}
                                  onTouchStart={(e) => {
                                    console.log('🔧 [MOBILE-DEBUG] Token wallet button touched');
                                    e.currentTarget.focus();
                                  }}
                                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium touch-manipulation"
                                  size="lg"
                                  disabled={isTransactionPending || !isConnected}
                                  style={{ minHeight: '48px', touchAction: 'manipulation' }}
                                  data-testid="send-token-wallet-button"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {isTransactionPending ? 'Sending...' : `Send ${calculateTokenAmountForHistory(parseFloat(deposit.amountUSD), deposit.tokenType, deposit.ethPriceSnapshot)} ${deposit.tokenType} via Wallet`}
                                </Button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                  Tap to send {deposit.tokenType} via MetaMask mobile (includes 2% processing fee)
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <PaginationControls
                  currentPage={depositPage}
                  totalPages={totalDepositPages}
                  onPageChange={setDepositPage}
                />
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowDownCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No deposit history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Withdrawal Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Withdraw NTIQ to ETH/USDC/USDT</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Authentication Warning */}
                {!user && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Authentication Required</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Please connect your wallet and login to access withdrawal features. All withdrawal requests require user authentication for security.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chain Selection */}
                <div>
                  <Label>Select Blockchain</Label>
                  <Select value={selectedChain.shortName} onValueChange={(value) => {
                    const chain = SUPPORTED_CHAINS.find(c => c.shortName === value);
                    if (chain) setSelectedChain(chain);
                  }}>
                    <SelectTrigger>
                      <div className="flex items-center space-x-2">
                        <selectedChain.logo className={`w-5 h-5 ${selectedChain.color}`} />
                        <span>{selectedChain.name}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CHAINS.map((chain) => (
                        <SelectItem key={chain.chainId} value={chain.shortName}>
                          <div className="flex items-center space-x-2">
                            <chain.logo className={`w-5 h-5 ${chain.color}`} />
                            <span>{chain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Token Selection */}
                <div>
                  <Label>Select Token</Label>
                  <Select value={selectedToken} onValueChange={(value) => setSelectedToken(value as "ETH" | "USDC" | "USDT")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Withdraw Amount */}
              <div>
                <Label>Withdrawal Amount (NTIQ)</Label>
                <Input
                  type="number"
                  placeholder="Enter NTIQ amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={user?.balance || 0}
                />
                {withdrawAmount && (
                  <div className="text-sm mt-1 space-y-1">
                    <p className="text-gray-600">
                      You will receive: <span className="font-bold text-blue-600">{calculateWithdrawalAmount(parseInt(withdrawAmount), selectedToken)} {selectedToken}</span>
                    </p>
                    <p className="text-orange-600 text-xs">
                      Fee (2.5%): <span className="font-medium">{calculateWithdrawalFee(parseInt(withdrawAmount), selectedToken)} {selectedToken}</span>
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Available balance: {user?.balance?.toLocaleString() || "0"} NTIQ
                </p>
              </div>

              <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!withdrawAmount || parseInt(withdrawAmount) <= 0 || parseInt(withdrawAmount) > (user?.balance || 0)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Create Withdrawal Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirm Withdrawal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Chain:</span>
                        <div className="flex items-center space-x-2">
                          <selectedChain.logo className={`w-5 h-5 ${selectedChain.color}`} />
                          <span className="font-medium text-gray-900 dark:text-white">{selectedChain.name}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Token:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">NTIQ:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{parseInt(withdrawAmount || "0").toLocaleString()} NTIQ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">You will receive:</span>
                        <span className="font-bold text-blue-600">{calculateWithdrawalAmount(parseInt(withdrawAmount || "0"), selectedToken)} {selectedToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Processing fee (2.5%):</span>
                        <span className="font-medium text-orange-600">{calculateWithdrawalFee(parseInt(withdrawAmount || "0"), selectedToken)} {selectedToken}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Destination Address:</h4>
                      <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded border">
                        <code className="flex-1 text-sm text-gray-900 dark:text-gray-100">{formatAddress(user?.walletAddress || "")}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(user?.walletAddress || "")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-2">
                        ⚠️ Withdrawal will be sent to the wallet address used for login
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowWithdrawModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={handleWithdraw}
                        disabled={createWithdrawalMutation.isPending}
                      >
                        {createWithdrawalMutation.isPending ? "Processing..." : "Confirm"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Withdrawal History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : withdrawals?.length ? (
                <>
                <div className="space-y-3">
                  {getPaginatedWithdrawals().map((withdrawal: WithdrawalData) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{withdrawal.ntiqAmount.toLocaleString()} NTIQ</span>
                          <span>→</span>
                          <span className="font-bold text-blue-600">{(() => {
                            // Calculate the actual token amount based on NTIQ amount and token type
                            const ntiqAmount = withdrawal.ntiqAmount || 0;
                            let tokenAmount = 'N/A';
                            const tokenType = withdrawal.tokenType || 'N/A';
                            
                            if (tokenType === 'USDC' || tokenType === 'USDT') {
                              // USDC/USDT: use stored net_amount if available, otherwise calculate
                              if (withdrawal.netAmount) {
                                // Use pre-calculated net amount from database (already includes fee deduction)
                                tokenAmount = parseFloat(withdrawal.netAmount).toFixed(2);
                              } else {
                                // Fallback calculation for older withdrawals
                                const usdValue = ntiqAmount * 0.01; // Total USD value
                                const netUsdValue = usdValue * 0.975; // Apply 2.5% fee deduction  
                                tokenAmount = netUsdValue.toFixed(2);
                              }
                            } else if (tokenType === 'ETH') {
                              // ETH: use stored net_amount if available, otherwise calculate from snapshot
                              if (withdrawal.netAmount) {
                                // Use pre-calculated net amount from database (already includes fee deduction)
                                tokenAmount = parseFloat(withdrawal.netAmount).toFixed(6);
                              } else if (withdrawal.ethPriceSnapshot) {
                                // Calculate from stored ETH price snapshot
                                const ethPrice = parseFloat(withdrawal.ethPriceSnapshot);
                                const usdValue = ntiqAmount * 0.01; // Total USD value
                                const netUsdValue = usdValue * 0.975; // Apply 2.5% fee deduction
                                tokenAmount = (netUsdValue / ethPrice).toFixed(6);
                              } else {
                                // Fallback for older withdrawals without net amount or price snapshot
                                const usdValue = ntiqAmount * 0.01; // Total USD value
                                const netUsdValue = usdValue * 0.975; // Apply 2.5% fee deduction
                                
                                // Use real-time ETH price from cryptoPrices as fallback only
                                if (cryptoPrices && cryptoPrices.length > 0) {
                                  const ethPrice = cryptoPrices.find((crypto: any) => crypto.id === 'ethereum');
                                  if (ethPrice?.current_price) {
                                    tokenAmount = (netUsdValue / ethPrice.current_price).toFixed(6);
                                  } else {
                                    // Final fallback to estimated price if real-time not available
                                    tokenAmount = (netUsdValue / 2300).toFixed(6);
                                  }
                                } else {
                                  // Final fallback to estimated price
                                  tokenAmount = (netUsdValue / 2300).toFixed(6);
                                }
                              }
                            } else {
                              tokenAmount = (ntiqAmount * 0.01).toFixed(2);
                            }
                            
                            return `${tokenAmount} ${tokenType}`;
                          })()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            {(() => {
                              const chain = SUPPORTED_CHAINS.find(c => c.shortName === withdrawal.chainName);
                              if (chain) {
                                const LogoComponent = chain.logo;
                                return <LogoComponent className={`w-4 h-4 ${chain.color}`} />;
                              }
                              return null;
                            })()}
                            <span>{SUPPORTED_CHAINS.find(c => c.shortName === withdrawal.chainName)?.name}</span>
                          </div>
                          {withdrawal.transactionHash && 
                           withdrawal.transactionHash.length === 66 && 
                           withdrawal.transactionHash.startsWith('0x') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-auto p-1"
                              onClick={() => {
                                const chain = SUPPORTED_CHAINS.find(c => c.shortName === withdrawal.chainName);
                                if (chain) {
                                  window.open(`${chain.explorerUrl}/tx/${withdrawal.transactionHash}`, '_blank');
                                }
                              }}
                              title="View transaction on blockchain explorer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                          {withdrawal.transactionHash && 
                           withdrawal.transactionHash === 'VERIFIED_ON_BLOCKCHAIN' && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Verified</span>
                            </div>
                          )}
                        </div>
                        {withdrawal.adminNote && (
                          <p className="text-xs text-gray-500 italic">{withdrawal.adminNote}</p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        {getStatusBadge(withdrawal.status)}
                        <div className="text-xs text-gray-500">
                          {new Date(withdrawal.createdAt).toLocaleDateString('en-US')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <PaginationControls
                  currentPage={withdrawalPage}
                  totalPages={totalWithdrawalPages}
                  onPageChange={setWithdrawalPage}
                />
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowUpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No withdrawal history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}