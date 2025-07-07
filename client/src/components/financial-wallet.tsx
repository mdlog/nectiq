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
import { Wallet, Plus, Send, Copy, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WalletData {
  id: number;
  walletType: string;
  chainType: string;
  walletAddress: string;
  isActive: boolean;
  isVerified: boolean;
}

interface BalanceData {
  tokenSymbol: string;
  balance: string;
  usdValue: string;
  chainType: string;
}

export function FinancialWallet() {
  const [selectedChain, setSelectedChain] = useState<string>("ethereum");
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const queryClient = useQueryClient();

  // Hardcoded supported chains untuk sementara
  const supportedChains = [
    { chainId: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { chainId: 'bsc', name: 'BSC', symbol: 'BNB' },
    { chainId: 'polygon', name: 'Polygon', symbol: 'MATIC' },
    { chainId: 'solana', name: 'Solana', symbol: 'SOL' }
  ];

  // Query untuk mendapatkan wallet summary
  const { data: walletSummary, isLoading } = useQuery({
    queryKey: ["/api/wallet/summary"],
    refetchInterval: 5000,
    retry: false,
  });

  // Mutation untuk menambah wallet
  const addWalletMutation = useMutation({
    mutationFn: async (walletData: { walletType: string; chainType: string; walletAddress: string }) => {
      const response = await apiRequest("/api/wallet/add", {
        method: "POST",
        body: JSON.stringify(walletData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/summary"] });
      setShowAddWallet(false);
      toast({
        title: "Wallet Added Successfully",
        description: "New wallet has been registered to the system",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add wallet",
        variant: "destructive",
      });
    },
  });

  // Mutation untuk withdrawal
  const withdrawMutation = useMutation({
    mutationFn: async (withdrawData: { 
      walletId: number; 
      chainType: string; 
      tokenSymbol: string; 
      amount: string; 
      toAddress: string; 
    }) => {
      const response = await apiRequest("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify(withdrawData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/summary"] });
      setShowWithdraw(false);
      toast({
        title: "Withdrawal Request Created",
        description: "Withdrawal request has been submitted for processing",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address has been copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainIcon = (chainType: string) => {
    const icons: { [key: string]: string } = {
      ethereum: "🔷",
      bsc: "🟡",
      polygon: "🟣",
      solana: "🌟"
    };
    return icons[chainType] || "⚡";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Total Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Multi-Chain Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total USD Value</p>
              <p className="text-2xl font-bold">${walletSummary?.totalUsdValue?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Wallets</p>
              <p className="text-2xl font-bold">{walletSummary?.wallets?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">NTIQ Credits</p>
              <p className="text-2xl font-bold">
                {walletSummary?.credits?.find((c: any) => c.creditType === 'NTIQ')?.amount || "0"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs untuk setiap chain */}
      <Tabs value={selectedChain} onValueChange={setSelectedChain}>
        <TabsList className="grid grid-cols-4 w-full">
          {supportedChains.map((chain) => (
            <TabsTrigger key={chain.chainId} value={chain.chainId} className="flex items-center gap-2">
              <span>{getChainIcon(chain.chainId)}</span>
              {chain.symbol}
            </TabsTrigger>
          ))}
        </TabsList>

        {supportedChains.map((chain) => (
          <TabsContent key={chain.chainId} value={chain.chainId}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Wallet List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{chain.name} Wallets</CardTitle>
                  <Dialog open={showAddWallet} onOpenChange={setShowAddWallet}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Wallet
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add {chain.name} Wallet</DialogTitle>
                      </DialogHeader>
                      <AddWalletForm 
                        chainType={chain.chainId} 
                        onSubmit={(data) => addWalletMutation.mutate(data)}
                        isLoading={addWalletMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {walletSummary?.wallets
                      ?.filter((w: WalletData) => w.chainType === chain.chainId)
                      ?.map((wallet: WalletData) => (
                      <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={wallet.isVerified ? "default" : "secondary"}>
                              {wallet.walletType}
                            </Badge>
                            {wallet.isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{formatAddress(wallet.walletAddress)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(wallet.walletAddress)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No wallets added for {chain.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Balances */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Token Balances</CardTitle>
                  <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Withdraw
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Withdraw {chain.name}</DialogTitle>
                      </DialogHeader>
                      <WithdrawForm 
                        chainType={chain.chainId}
                        wallets={walletSummary?.wallets?.filter((w: WalletData) => w.chainType === chain.chainId) || []}
                        balances={walletSummary?.balances?.filter((b: BalanceData) => b.chainType === chain.chainId) || []}
                        onSubmit={(data) => withdrawMutation.mutate(data)}
                        isLoading={withdrawMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {walletSummary?.balances
                      ?.filter((b: BalanceData) => b.chainType === chain.chainId)
                      ?.map((balance: BalanceData, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{balance.tokenSymbol}</p>
                          <p className="text-sm text-muted-foreground">${balance.usdValue}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{parseFloat(balance.balance).toFixed(6)}</p>
                          <p className="text-sm text-muted-foreground">{balance.tokenSymbol}</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No token balances for {chain.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Conversion Info */}
      {/* Conversion Info & Coming Soon Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Multi-Chain Wallet System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🚀 Coming Soon</h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                Advanced multi-chain wallet integration for seamless deposit/buy and withdrawal management across Ethereum, BSC, Polygon, and Solana networks.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <p className="font-medium text-sm">1 ETH</p>
                  <p className="text-xs text-muted-foreground">= 1000 NTIQ</p>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <p className="font-medium text-sm">1 BNB</p>
                  <p className="text-xs text-muted-foreground">= 300 NTIQ</p>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <p className="font-medium text-sm">1 SOL</p>
                  <p className="text-xs text-muted-foreground">= 50 NTIQ</p>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border">
                  <p className="font-medium text-sm">1 USDT</p>
                  <p className="text-xs text-muted-foreground">= 1 NTIQ</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                For now, use the existing Withdraw and Buy NTIQ tabs above for basic transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Komponen untuk form add wallet
function AddWalletForm({ 
  chainType, 
  onSubmit, 
  isLoading 
}: { 
  chainType: string; 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    walletType: "",
    walletAddress: "",
    publicKey: ""
  });

  const walletTypes: { [key: string]: string[] } = {
    ethereum: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
    bsc: ["MetaMask", "Trust Wallet", "Binance Wallet"],
    polygon: ["MetaMask", "WalletConnect"],
    solana: ["Phantom", "Solflare", "Backpack"]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      chainType
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="walletType">Wallet Type</Label>
        <Select value={formData.walletType} onValueChange={(value) => setFormData({...formData, walletType: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select wallet type" />
          </SelectTrigger>
          <SelectContent>
            {(walletTypes[chainType] || []).map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="walletAddress">Wallet Address</Label>
        <Input
          id="walletAddress"
          value={formData.walletAddress}
          onChange={(e) => setFormData({...formData, walletAddress: e.target.value})}
          placeholder="0x..."
          required
        />
      </div>

      {chainType === 'solana' && (
        <div>
          <Label htmlFor="publicKey">Public Key (Optional)</Label>
          <Input
            id="publicKey"
            value={formData.publicKey}
            onChange={(e) => setFormData({...formData, publicKey: e.target.value})}
            placeholder="Public key for Solana"
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Wallet"}
      </Button>
    </form>
  );
}

// Komponen untuk form withdraw
function WithdrawForm({ 
  chainType, 
  wallets, 
  balances, 
  onSubmit, 
  isLoading 
}: { 
  chainType: string;
  wallets: WalletData[];
  balances: BalanceData[];
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    walletId: "",
    tokenSymbol: "",
    amount: "",
    toAddress: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      walletId: parseInt(formData.walletId),
      chainType
    });
  };

  const selectedBalance = balances.find(b => 
    b.tokenSymbol === formData.tokenSymbol
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="walletId">From Wallet</Label>
        <Select value={formData.walletId} onValueChange={(value) => setFormData({...formData, walletId: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select wallet" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id.toString()}>
                {wallet.walletType} - {formatAddress(wallet.walletAddress)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="tokenSymbol">Token</Label>
        <Select value={formData.tokenSymbol} onValueChange={(value) => setFormData({...formData, tokenSymbol: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {balances.map((balance) => (
              <SelectItem key={balance.tokenSymbol} value={balance.tokenSymbol}>
                {balance.tokenSymbol} - {parseFloat(balance.balance).toFixed(6)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.000001"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="0.0"
          max={selectedBalance?.balance || "0"}
          required
        />
        {selectedBalance && (
          <p className="text-sm text-muted-foreground mt-1">
            Available: {parseFloat(selectedBalance.balance).toFixed(6)} {selectedBalance.tokenSymbol}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="toAddress">To Address</Label>
        <Input
          id="toAddress"
          value={formData.toAddress}
          onChange={(e) => setFormData({...formData, toAddress: e.target.value})}
          placeholder="Destination address"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processing..." : "Create Withdrawal Request"}
      </Button>
    </form>
  );
}

function formatAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}