import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  CreditCard
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Supported chain configuration
const SUPPORTED_CHAINS = [
  {
    chainId: 1,
    name: "Ethereum",
    symbol: "ETH",
    shortName: "eth",
    icon: "🔷",
    explorerUrl: "https://etherscan.io",
    adminWallet: "0x742d35cC6765C88Ed8C7fe6B4e7F96c0C5A3d6E2", // Contoh wallet admin
    tokens: {
      USDC: { address: "0xA0b86a33E6b4A3C6d4b1B4BcF8F7f8d7C6cC9c9e", decimals: 6 },
      USDT: { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", decimals: 6 }
    }
  },
  {
    chainId: 8453,
    name: "Base",
    symbol: "ETH",
    shortName: "base",
    icon: "🔵",
    explorerUrl: "https://basescan.org",
    adminWallet: "0x742d35cC6765C88Ed8C7fe6B4e7F96c0C5A3d6E2",
    tokens: {
      USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
      USDT: { address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimals: 6 }
    }
  },
  {
    chainId: 56,
    name: "BSC",
    symbol: "BNB",
    shortName: "bsc",
    icon: "🟡",
    explorerUrl: "https://bscscan.com",
    adminWallet: "0x742d35cC6765C88Ed8C7fe6B4e7F96c0C5A3d6E2",
    tokens: {
      USDC: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
      USDT: { address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 }
    }
  },
  {
    chainId: 10,
    name: "Optimism",
    symbol: "ETH",
    shortName: "optimism",
    icon: "🔴",
    explorerUrl: "https://optimistic.etherscan.io",
    adminWallet: "0x742d35cC6765C88Ed8C7fe6B4e7F96c0C5A3d6E2",
    tokens: {
      USDC: { address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", decimals: 6 },
      USDT: { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6 }
    }
  },
  {
    chainId: 42161,
    name: "Arbitrum",
    symbol: "ETH",
    shortName: "arbitrum",
    icon: "🟦",
    explorerUrl: "https://arbiscan.io",
    adminWallet: "0x742d35cC6765C88Ed8C7fe6B4e7F96c0C5A3d6E2",
    tokens: {
      USDC: { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", decimals: 6 },
      USDT: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6 }
    }
  },
  {
    chainId: 11155111,
    name: "Sepolia",
    symbol: "ETH",
    shortName: "sepolia",
    icon: "🧪",
    explorerUrl: "https://sepolia.etherscan.io",
    adminWallet: "0x742d35cC6765C88Ed8C7fe6B4e7F96c0C5A3d6E2",
    tokens: {
      USDC: { address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", decimals: 6 },
      USDT: { address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", decimals: 6 }
    }
  },
  {
    chainId: 17000,
    name: "Holesky",
    symbol: "ETH",
    shortName: "holesky",
    icon: "🕳️",
    explorerUrl: "https://holesky.etherscan.io",
    adminWallet: "0x742d35cC6765C88Ed8C7fe6B4e7F96c0C5A3d6E2",
    tokens: {
      USDC: { address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", decimals: 6 },
      USDT: { address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", decimals: 6 }
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
  createdAt: string;
}

interface WithdrawalData {
  id: number;
  chainName: string;
  tokenType: string;
  ntiqAmount: number;
  usdAmount: string;
  status: string;
  transactionHash?: string;
  adminNote?: string;
  createdAt: string;
}

export function MultiChainFinancial() {
  const [selectedAction, setSelectedAction] = useState<"deposit" | "withdraw">("deposit");
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [selectedToken, setSelectedToken] = useState<"USDC" | "USDT">("USDC");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const queryClient = useQueryClient();

  // Query to get user data
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    staleTime: 30000,
  });

  // Query to get deposit history
  const { data: deposits, isLoading: depositsLoading } = useQuery({
    queryKey: ["/api/user/deposits"],
    refetchInterval: 10000,
  });

  // Query to get withdrawal history
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["/api/user/withdrawals"],
    refetchInterval: 10000,
  });

  // Mutation to create deposit request
  const createDepositMutation = useMutation({
    mutationFn: async (depositData: {
      chainName: string;
      chainId: number;
      tokenType: string;
      tokenAddress: string;
      amountUSD: string;
      toWalletAddress: string;
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
      toast({
        title: "Error",
        description: error.message || "Failed to create withdrawal request",
        variant: "destructive",
      });
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

    const tokenConfig = selectedChain.tokens[selectedToken];
    const amountUSD = parseFloat(depositAmount);

    createDepositMutation.mutate({
      chainName: selectedChain.shortName,
      chainId: selectedChain.chainId,
      tokenType: selectedToken,
      tokenAddress: tokenConfig.address,
      amountUSD: depositAmount,
      toWalletAddress: selectedChain.adminWallet,
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseInt(withdrawAmount) <= 0) {
      toast({
        title: "Error",
        description: "Withdrawal amount must be greater than 0 NTIQ",
        variant: "destructive",
      });
      return;
    }

    const ntiqAmount = parseInt(withdrawAmount);
    if (user && ntiqAmount > user.balance) {
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
      toWalletAddress: user?.walletAddress || "",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", text: "Pending" },
      confirmed: { color: "bg-blue-500", text: "Confirmed" },
      processed: { color: "bg-green-500", text: "Processed" },
      completed: { color: "bg-green-600", text: "Completed" },
      approved: { color: "bg-blue-600", text: "Approved" },
      rejected: { color: "bg-red-500", text: "Rejected" },
      failed: { color: "bg-red-600", text: "Failed" },
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowDownCircle className="w-5 h-5 text-green-600" />
                <span>Deposit USDC/USDT to NTIQ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chain Selection */}
                <div>
                  <Label>Pilih Blockchain</Label>
                  <Select value={selectedChain.shortName} onValueChange={(value) => {
                    const chain = SUPPORTED_CHAINS.find(c => c.shortName === value);
                    if (chain) setSelectedChain(chain);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CHAINS.map((chain) => (
                        <SelectItem key={chain.chainId} value={chain.shortName}>
                          <div className="flex items-center space-x-2">
                            <span>{chain.icon}</span>
                            <span>{chain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Token Selection */}
                <div>
                  <Label>Pilih Token</Label>
                  <Select value={selectedToken} onValueChange={(value) => setSelectedToken(value as "USDC" | "USDT")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <p className="text-sm text-gray-600 mt-1">
                    You will receive: <span className="font-bold text-blue-600">{(parseFloat(depositAmount) * 100).toLocaleString()} NTIQ</span>
                  </p>
                )}
              </div>

              <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
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
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Chain:</span>
                        <span className="font-medium">{selectedChain.icon} {selectedChain.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token:</span>
                        <span className="font-medium">{selectedToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">${depositAmount} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NTIQ received:</span>
                        <span className="font-bold text-blue-600">{(parseFloat(depositAmount || "0") * 100).toLocaleString()} NTIQ</span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Deposit Destination Address:</h4>
                      <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                        <code className="flex-1 text-sm">{selectedChain.adminWallet}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(selectedChain.adminWallet)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        ⚠️ Make sure to transfer from the same wallet as your login wallet
                      </p>
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
                <span>Deposit History</span>
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
                <div className="space-y-3">
                  {deposits.map((deposit: DepositData) => (
                    <div key={deposit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">${deposit.amountUSD} {deposit.tokenType}</span>
                          <span>→</span>
                          <span className="font-bold text-blue-600">{deposit.ntiqAmount.toLocaleString()} NTIQ</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName)?.icon}</span>
                          <span>{SUPPORTED_CHAINS.find(c => c.shortName === deposit.chainName)?.name}</span>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowDownCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No deposit history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpCircle className="w-5 h-5 text-blue-600" />
                <span>Withdraw NTIQ to USDC/USDT</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chain Selection */}
                <div>
                  <Label>Pilih Blockchain</Label>
                  <Select value={selectedChain.shortName} onValueChange={(value) => {
                    const chain = SUPPORTED_CHAINS.find(c => c.shortName === value);
                    if (chain) setSelectedChain(chain);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CHAINS.map((chain) => (
                        <SelectItem key={chain.chainId} value={chain.shortName}>
                          <div className="flex items-center space-x-2">
                            <span>{chain.icon}</span>
                            <span>{chain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Token Selection */}
                <div>
                  <Label>Pilih Token</Label>
                  <Select value={selectedToken} onValueChange={(value) => setSelectedToken(value as "USDC" | "USDT")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <p className="text-sm text-gray-600 mt-1">
                    You will receive: <span className="font-bold text-blue-600">${(parseInt(withdrawAmount) * 0.01).toFixed(2)} {selectedToken}</span>
                  </p>
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
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Chain:</span>
                        <span className="font-medium">{selectedChain.icon} {selectedChain.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token:</span>
                        <span className="font-medium">{selectedToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NTIQ:</span>
                        <span className="font-medium">{parseInt(withdrawAmount || "0").toLocaleString()} NTIQ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>USD received:</span>
                        <span className="font-bold text-blue-600">${(parseInt(withdrawAmount || "0") * 0.01).toFixed(2)} {selectedToken}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Destination Address:</h4>
                      <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                        <code className="flex-1 text-sm">{formatAddress(user?.walletAddress || "")}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(user?.walletAddress || "")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-yellow-600 mt-2">
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
                <span>Withdrawal History</span>
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
                <div className="space-y-3">
                  {withdrawals.map((withdrawal: WithdrawalData) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{withdrawal.ntiqAmount.toLocaleString()} NTIQ</span>
                          <span>→</span>
                          <span className="font-bold text-blue-600">${withdrawal.usdAmount} {withdrawal.tokenType}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{SUPPORTED_CHAINS.find(c => c.shortName === withdrawal.chainName)?.icon}</span>
                          <span>{SUPPORTED_CHAINS.find(c => c.shortName === withdrawal.chainName)?.name}</span>
                          {withdrawal.transactionHash && (
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
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowUpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No withdrawal history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}