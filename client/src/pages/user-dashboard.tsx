import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Target, Trophy, Gift, TrendingUp, TrendingDown, Clock, Coins, Star, ArrowLeft, Wallet, DollarSign, RefreshCw, Activity, Award, Calendar, History, Eye, CreditCard, UserCircle, Upload, Copy, Check, Swords, Shield, CheckCircle, AlertCircle, Crown, Gem, Edit } from "lucide-react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { User, Withdrawal } from "@shared/schema";
import type { UserStats, ActivePrediction, RecentReward, CryptoPrice } from "@/types";
import CryptoChart from "@/components/crypto-chart-chartjs";
import { LivePrices } from "@/components/live-prices";
import { WalletConnect } from "@/components/wallet-connect";
import { WalletBalances } from "@/components/wallet-balances";
import { useWalletIntegration } from "@/hooks/useWalletIntegration";
import { ReferralSection } from "@/components/referral-section";
import { LoyaltyTier } from "@/components/loyalty-tier";
import { SurvivalStatus } from "@/components/survival-status";


// Dynamic function to get crypto image from live API data
function getCryptoImageUrl(cryptoId: string, cryptoPrices: any[]): string {
  // First try to get image from real-time crypto data
  const cryptoData = cryptoPrices?.find(crypto => crypto.id === cryptoId);
  if (cryptoData?.image) {
    return cryptoData.image;
  }
  
  // Fallback: Try common CoinGecko image patterns for new cryptocurrencies
  const commonIds: Record<string, string> = {
    'bitcoin': '1',
    'ethereum': '279',
    'tron': '1094',
    'binancecoin': '825',
    'cardano': '975',
    'solana': '4128',
    'chainlink': '877',
    'polkadot': '12171',
    'litecoin': '2',
    'matic-network': '4713'
  };
  
  const imageId = commonIds[cryptoId] || '1';
  return `https://coin-images.coingecko.com/coins/images/${imageId}/large/${cryptoId}.png`;
}

// Purchase History Component
function PurchaseHistory() {
  const { data: purchases = [] } = useQuery<any[]>({
    queryKey: ["/api/user/purchases"],
  });

  if (purchases.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 mb-2">No purchases yet</div>
        <div className="text-sm text-slate-500">Your purchase history will appear here</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="p-3 bg-surface-light rounded-lg border border-surface-light">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-sm">{purchase.ptsAmount.toLocaleString()} NTIQ</div>
                <div className="text-xs text-slate-500">Paid with {purchase.paymentAmount} {purchase.paymentToken}</div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {purchase.status}
            </Badge>
          </div>
          <div className="text-xs text-slate-400">
            {new Date(purchase.createdAt).toLocaleDateString()} at {new Date(purchase.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Withdrawal History Component
function WithdrawalHistory() {
  const { data: withdrawals = [] } = useQuery<Withdrawal[]>({
    queryKey: ["/api/user/withdrawals"],
  });



  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 mb-2">No withdrawals yet</div>
        <div className="text-sm text-slate-500">Your withdrawal history will appear here</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {withdrawals.map((withdrawal) => (
        <div key={withdrawal.id} className="p-3 bg-surface-light rounded-lg border border-surface-light">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium text-sm">{withdrawal.tokenAmount} {withdrawal.token}</div>
                <div className="text-xs text-slate-500">{withdrawal.ptsAmount.toLocaleString()} NTIQ</div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {withdrawal.status}
            </Badge>
          </div>
          <div className="text-xs text-slate-400">
            {new Date(withdrawal.createdAt).toLocaleDateString()} at {new Date(withdrawal.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Predictions Section Component
function PredictionsSection() {
  const { data: activePredictions = [] } = useQuery<ActivePrediction[]>({
    queryKey: ["/api/predictions/active"],
    refetchInterval: 2000,
  });

  const { data: cryptoPrices = [] } = useQuery<any[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 15000,
  });

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          My Active Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activePredictions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">No active predictions</div>
            <div className="text-sm text-slate-500">Make your first prediction to see it here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {activePredictions.map((prediction) => (
              <div key={prediction.id} className="p-4 bg-surface-light rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={getCryptoImageUrl(prediction.cryptocurrency, cryptoPrices)}
                        alt={prediction.cryptocurrency}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">{prediction.cryptocurrency.toUpperCase()}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      Predicted: ${prediction.predictedPrice.toLocaleString()} • Stake: {prediction.stakeAmount} NTIQ
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Market Watch Section Component  
function MarketWatchSection() {
  const { data: prices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 1000,
  });

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Live Market Prices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {prices.slice(0, 6).map((crypto) => (
            <div key={crypto.id} className="p-4 bg-surface-light rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-medium">{crypto.symbol.toUpperCase()}</div>
                    <div className="text-sm text-slate-400">{crypto.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${crypto.current_price.toLocaleString()}</div>
                  <div className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Performance Section Component
function PerformanceSection() {
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Total Predictions</div>
              <div className="text-2xl font-bold">{stats?.totalPredictions || 0}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Accuracy Rate</div>
              <div className="text-2xl font-bold text-green-500">{stats?.accuracy || 0}%</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Global Rank</div>
              <div className="text-2xl font-bold text-yellow-500">#{stats?.rank || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Total Rewards</div>
              <div className="text-2xl font-bold text-blue-500">{stats?.totalRewards || 0} NTIQ</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Battles Section Component
function BattlesSection() {
  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5" />
          Prediction Battles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Swords className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <div className="text-slate-400 mb-2">No battle history yet</div>
          <div className="text-sm text-slate-500">Your battle results will appear here</div>
          <Button className="mt-4" onClick={() => window.location.href = '/battles'}>
            Join Battles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Rewards Section Component
function RewardsSection() {
  const { data: recentRewards = [] } = useQuery<RecentReward[]>({
    queryKey: ["/api/rewards/recent"],
    refetchInterval: 2000,
  });

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Rewards
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentRewards.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">No rewards yet</div>
            <div className="text-sm text-slate-500">Start predicting to earn rewards</div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentRewards.slice(0, 10).map((reward) => (
              <div key={reward.id} className="p-4 bg-surface-light rounded-lg border">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{reward.type}</div>
                    <div className="text-sm text-slate-400">{new Date(reward.date).toLocaleDateString()}</div>
                  </div>
                  <div className={`font-bold ${reward.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {reward.amount >= 0 ? '+' : ''}{reward.amount} NTIQ
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Achievements Component
function Achievements() {
  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          My Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-surface-light rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="font-medium">First Prediction</div>
                <div className="text-sm text-slate-400">Make your first prediction</div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">Not completed</Badge>
          </div>
          
          <div className="p-4 bg-surface-light rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium">Perfect Prediction</div>
                <div className="text-sm text-slate-400">Get 100% accuracy</div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">Not completed</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Daily Challenges Component
function DailyChallenges() {
  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-surface-light rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">Make 3 Predictions</div>
                <div className="text-sm text-slate-400">Progress: 0/3</div>
              </div>
              <Badge variant="outline">0/3</Badge>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          
          <div className="p-4 bg-surface-light rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">Win a Battle</div>
                <div className="text-sm text-slate-400">Progress: 0/1</div>
              </div>
              <Badge variant="outline">0/1</Badge>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Financial Wallet Component
function FinancialWallet() {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [buyAmount, setBuyAmount] = useState("");

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Financial Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Withdraw Section */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Withdraw NTIQ
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400">Amount (NTIQ)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-2 bg-surface-light border border-surface-light rounded-lg"
                  placeholder="Enter amount..."
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Receive as</label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full p-2 bg-surface-light border border-surface-light rounded-lg"
                >
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
              <Button className="w-full">Request Withdrawal</Button>
            </div>
          </div>

          {/* Buy Section */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Buy NTIQ
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400">Amount (NTIQ)</label>
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="w-full p-2 bg-surface-light border border-surface-light rounded-lg"
                  placeholder="Enter amount..."
                />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Exchange Rate: 1 ETH = 1000 NTIQ
                </div>
              </div>
              <Button className="w-full">Buy NTIQ</Button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-6">
          <h3 className="font-medium mb-4">Recent Transactions</h3>
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">No transactions yet</div>
            <div className="text-sm text-slate-500">Your transaction history will appear here</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserDashboard() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [buyAmount, setBuyAmount] = useState("");
  const [selectedPaymentToken, setSelectedPaymentToken] = useState("ETH");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoPrice | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [selectedFinancialAction, setSelectedFinancialAction] = useState("withdraw");
  const [, setLocation] = useLocation();
  const [walletCopied, setWalletCopied] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  // Manual refresh function for Market Overview
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetchPrices();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Copy wallet address function
  const copyWalletAddress = async () => {
    if (user?.walletAddress) {
      try {
        await navigator.clipboard.writeText(user.walletAddress);
        setWalletCopied(true);
        toast({
          title: "Wallet Address Copied",
          description: "Wallet address successfully copied to clipboard",
        });
        setTimeout(() => setWalletCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy wallet address",
          variant: "destructive",
        });
      }
    }
  };

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  const { data: activePredictions = [] } = useQuery<ActivePrediction[]>({
    queryKey: ["/api/predictions/active"],
    refetchInterval: 2000, // Ultra-fast updates every 2 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  const { data: recentRewards = [] } = useQuery<RecentReward[]>({
    queryKey: ["/api/rewards/recent"],
    refetchInterval: 2000, // Ultra-fast updates every 2 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  const { data: prices = [], isLoading: pricesLoading, refetch: refetchPrices } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 15000, // Reduced to 15 seconds to prevent rate limiting
  });

  // Get real-time crypto prices for dynamic logo display in predictions
  const { data: cryptoPrices = [] } = useQuery<any[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 15000, // Reduced to 15 seconds to prevent rate limiting
    staleTime: 10000, // 10 seconds
    retry: 2, // Retry failed requests
  });

  // Auto-select Bitcoin as default when prices are loaded
  useEffect(() => {
    if (prices.length > 0 && !selectedCrypto) {
      const bitcoin = prices.find(crypto => crypto.id === 'bitcoin');
      if (bitcoin) {
        setSelectedCrypto(bitcoin);
        setShowChart(true);
      }
    }
  }, [prices, selectedCrypto]);

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, token }: { amount: number; token: string }) => {
      const response = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, token }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Withdraw failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Withdrawal Successful",
        description: `${data.tokenAmount} ${data.token} has been sent to your wallet`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/withdrawals"] });
      setWithdrawAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  // Buy NTIQ mutation
  const buyNTIQMutation = useMutation({
    mutationFn: async ({ ntiqAmount, paymentToken }: { ntiqAmount: number; paymentToken: string }) => {
      const response = await fetch('/api/user/buy-ntiq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ntiqAmount, paymentToken }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Purchase failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful",
        description: `${data.ntiqAmount} NTIQ has been added to your balance`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/purchases"] });
      setBuyAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to process purchase",
        variant: "destructive",
      });
    },
  });

  const formatTimeLeft = (timeLeft: number): string => {
    if (timeLeft <= 0) return "Expired";
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getCryptoIcon = (crypto: string): string => {
    const icons: Record<string, string> = {
      bitcoin: "₿",
      ethereum: "Ξ",
      binancecoin: "BNB",
      cardano: "ADA",
      solana: "SOL",
    };
    return icons[crypto] || crypto.toUpperCase();
  };

  const getCryptoColor = (crypto: string): string => {
    const colors: Record<string, string> = {
      bitcoin: "bg-orange-500",
      ethereum: "bg-blue-500",
      binancecoin: "bg-yellow-500",
      cardano: "bg-blue-600",
      solana: "bg-purple-500",
    };
    return colors[crypto] || "bg-gray-500";
  };

  const getRankBadge = (rank: number | null | undefined) => {
    if (!rank) return <Badge variant="outline">Unranked</Badge>;
    
    if (rank === 1) return <Badge className="bg-warning text-dark">🥇 #1</Badge>;
    if (rank === 2) return <Badge className="bg-slate-400 text-dark">🥈 #2</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 text-white">🥉 #3</Badge>;
    if (rank <= 10) return <Badge className="bg-success text-white">Top 10</Badge>;
    return <Badge variant="secondary">#{rank}</Badge>;
  };

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy >= 90) return { label: "Expert", color: "text-warning", bg: "bg-warning/20" };
    if (accuracy >= 75) return { label: "Advanced", color: "text-success", bg: "bg-success/20" };
    if (accuracy >= 60) return { label: "Intermediate", color: "text-primary", bg: "bg-primary/20" };
    if (accuracy >= 40) return { label: "Beginner", color: "text-secondary", bg: "bg-secondary/20" };
    return { label: "Novice", color: "text-slate-400", bg: "bg-slate-400/20" };
  };

  const accuracyLevel = getAccuracyLevel(stats?.accuracy || 0);

  // Handle crypto selection from Live Prices
  const handleCryptoSelect = (crypto: CryptoPrice) => {
    setSelectedCrypto(crypto);
    setShowChart(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-surface border-b border-surface-light">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Star className="text-white" size={16} />
              </div>
              <h1 className="text-lg sm:text-xl font-bold">My Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2 bg-surface-light px-2 sm:px-3 py-1 rounded-lg">
                <Coins className="text-warning" size={14} />
                <span className="text-sm sm:text-base font-semibold">{user?.balance?.toLocaleString() || "0"}</span>
                <span className="text-xs text-slate-400">NTIQ</span>
              </div>
              <div className="hidden sm:block">
                {getRankBadge(stats?.rank)}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-surface-light border-surface-light text-xs sm:text-sm" 
                onClick={() => setLocation('/home')}
              >
                <ArrowLeft className="mr-1 sm:mr-2" size={14} />
                <span className="hidden sm:inline">Back to App</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome back, {user?.username || "User"}!</h2>
          <p className="text-slate-400 text-sm sm:text-base">Track your predictions, analyze performance, and climb the leaderboard.</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Total Predictions</CardTitle>
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-lg sm:text-2xl font-bold">{stats?.totalPredictions || 0}</div>
              <div className="text-xs text-slate-400 mt-1 hidden sm:block">Lifetime predictions made</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Accuracy Rate</CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-lg sm:text-2xl font-bold text-success">{stats?.accuracy || 0}%</div>
              <div className={`text-xs px-1 sm:px-2 py-1 rounded-full inline-block mt-1 ${accuracyLevel.bg} ${accuracyLevel.color} hidden sm:block`}>
                {accuracyLevel.label}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Current Rank</CardTitle>
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-lg sm:text-2xl font-bold text-warning">
                {stats?.rank ? `#${stats.rank}` : "N/A"}
              </div>
              <div className="text-xs text-slate-400 mt-1 hidden sm:block">Global ranking</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Total Rewards</CardTitle>
              <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-lg sm:text-2xl font-bold text-primary">{stats?.totalRewards || 0}</div>
              <div className="text-xs text-slate-400 mt-1 hidden sm:block">Points earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar Navigation */}
          <div className="lg:w-80 w-full">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl sticky top-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Star className="mr-2" size={20} />
                Dashboard Menu
              </h3>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`w-full justify-start transition-all duration-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === "profile" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border border-blue-400/50" 
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <UserCircle className="h-5 w-5" />
                  Profile
                </button>
                
                <button 
                  onClick={() => setActiveTab("predictions")}
                  className={`w-full justify-start transition-all duration-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === "predictions" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border border-blue-400/50" 
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  My Predictions
                </button>
                
                <button 
                  onClick={() => setActiveTab("achievements")}
                  className={`w-full justify-start transition-all duration-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === "achievements" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border border-blue-400/50" 
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <Award className="h-5 w-5" />
                  Achievements
                </button>
                
                <button 
                  onClick={() => setActiveTab("challenges")}
                  className={`w-full justify-start transition-all duration-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === "challenges" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border border-blue-400/50" 
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  Daily Challenges
                </button>
                
                <button 
                  onClick={() => setActiveTab("market")}
                  className={`w-full justify-start transition-all duration-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === "market" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border border-blue-400/50" 
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <Eye className="h-5 w-5" />
                  Market Watch
                </button>
                
                <button 
                  onClick={() => setActiveTab("performance")}
                  className={`w-full justify-start transition-all duration-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === "performance" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border border-blue-400/50" 
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <Activity className="h-5 w-5" />
                  Performance
                </button>
                
                <button 
                  onClick={() => setActiveTab("battles")}
                  className={`w-full justify-start transition-all duration-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === "battles" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border border-blue-400/50" 
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <Swords className="h-5 w-5" />
                  Battles
                </button>
                
                <button 
                  onClick={() => setActiveTab("financial")}
                  className={`w-full justify-start transition-all duration-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === "financial" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border border-blue-400/50" 
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <Wallet className="h-5 w-5" />
                  Financial
                </button>
                
                <button 
                  onClick={() => setActiveTab("rewards")}
                  className={`w-full justify-start transition-all duration-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === "rewards" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border border-blue-400/50" 
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <History className="h-5 w-5" />
                  Reward History
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Content Area */}
          <div className="flex-1">
            <div className="space-y-6">
              {/* Dynamic Content Based on Active Tab */}
              {activeTab === "profile" && <UserProfile />}
              {activeTab === "predictions" && <PredictionsSection />}
              {activeTab === "achievements" && <Achievements />}
              {activeTab === "challenges" && <DailyChallenges />}
              {activeTab === "market" && <MarketWatchSection />}
              {activeTab === "performance" && <PerformanceSection />}
              {activeTab === "battles" && <BattlesSection />}
              {activeTab === "financial" && <FinancialWallet />}
              {activeTab === "rewards" && <RewardsSection />}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// UserProfile Component - moved down to keep main component clean
function UserProfile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Loading user profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="bg-surface border-surface-light">
        <CardContent className="text-center py-8">
          <AlertCircle className="mx-auto mb-2 text-error" size={32} />
          <p className="text-error">Failed to load user profile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCircle className="mr-2" size={20} />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Avatar & Basic Info */}
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <h3 className="text-xl font-bold">{user.username}</h3>
          <p className="text-slate-400">UID: {user.uid}</p>
        </div>

        {/* Account Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Account Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Username</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={isEditingUsername ? newUsername : user.username}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={!isEditingUsername}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditingUsername) {
                      // Save username logic would go here
                      setIsEditingUsername(false);
                    } else {
                      setNewUsername(user.username);
                      setIsEditingUsername(true);
                    }
                  }}
                >
                  {isEditingUsername ? <Check size={16} /> : <Edit size={16} />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Balance</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={`${user.balance?.toLocaleString() || 0} NTIQ`}
                  disabled
                  className="flex-1"
                />
                <Coins className="text-warning" size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Wallet Address</label>
            <div className="flex items-center space-x-2">
              <Input
                value={user.walletAddress || "No wallet connected"}
                disabled
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (user.walletAddress) {
                    navigator.clipboard.writeText(user.walletAddress);
                  }
                }}
                title="Copy wallet address"
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
