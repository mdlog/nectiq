import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Target, Trophy, Gift, TrendingUp, Clock, Coins, Star, ArrowLeft, Wallet, DollarSign, RefreshCw, Activity, Award, Calendar, History, Eye, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
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
import { Achievements } from "@/components/achievements";
import { DailyChallenges } from "@/components/daily-challenges";
import CryptoChart from "@/components/crypto-chart";
import { LivePrices } from "@/components/live-prices";
import { WalletConnect } from "@/components/wallet-connect";
import { useWalletIntegration } from "@/hooks/useWalletIntegration";

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
                <div className="text-xs text-slate-500">{withdrawal.ptsAmount.toLocaleString()} PTS</div>
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

  // Manual refresh function for Market Overview
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetchPrices();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  const { data: activePredictions = [] } = useQuery<ActivePrediction[]>({
    queryKey: ["/api/predictions/active"],
    refetchInterval: 30000,
  });

  const { data: recentRewards = [] } = useQuery<RecentReward[]>({
    queryKey: ["/api/rewards/recent"],
    refetchInterval: 30000,
  });

  const { data: prices = [], isLoading: pricesLoading, refetch: refetchPrices } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 3000, // Real-time updates every 3 seconds
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
              <h1 className="text-xl font-bold">My Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-surface-light px-3 py-1 rounded-lg">
                <Coins className="text-warning" size={16} />
                <span className="font-semibold">{user?.balance?.toLocaleString() || "0"}</span>
                <span className="text-xs text-slate-400">NTIQ</span>
              </div>
              {getRankBadge(stats?.rank)}
              <Button 
                variant="outline" 
                className="bg-surface-light border-surface-light" 
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username || "User"}!</h2>
          <p className="text-slate-400">Track your predictions, analyze performance, and climb the leaderboard.</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Predictions</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPredictions || 0}</div>
              <div className="text-xs text-slate-400 mt-1">Lifetime predictions made</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Accuracy Rate</CardTitle>
              <Target className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats?.accuracy || 0}%</div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${accuracyLevel.bg} ${accuracyLevel.color}`}>
                {accuracyLevel.label}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Current Rank</CardTitle>
              <Trophy className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {stats?.rank ? `#${stats.rank}` : "N/A"}
              </div>
              <div className="text-xs text-slate-400 mt-1">Global ranking</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Rewards</CardTitle>
              <Gift className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.totalRewards || 0}</div>
              <div className="text-xs text-slate-400 mt-1">Points earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="predictions" className="space-y-4">
          <TabsList className="bg-surface border border-surface-light">
            <TabsTrigger value="predictions" className="data-[state=active]:bg-primary">
              <Clock className="mr-1" size={16} />
              My Predictions
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-primary">
              <Award className="mr-1" size={16} />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-primary">
              <Calendar className="mr-1" size={16} />
              Daily Challenges
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-primary">
              <History className="mr-1" size={16} />
              Reward History
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-primary">
              <Eye className="mr-1" size={16} />
              Market Watch
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-primary">
              <Activity className="mr-1" size={16} />
              Performance
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-primary">
              <Wallet className="mr-1" size={16} />
              Financial
            </TabsTrigger>
          </TabsList>

          {/* Active Predictions Tab */}
          <TabsContent value="predictions">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2" size={20} />
                  Active Predictions ({activePredictions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activePredictions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="mx-auto mb-2" size={32} />
                    <p>No active predictions</p>
                    <p className="text-sm">Start making predictions to see them here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activePredictions.map((prediction) => {
                      const accuracy = ((parseFloat(prediction.currentPrice) - parseFloat(prediction.predictedPrice)) / parseFloat(prediction.predictedPrice)) * 100;
                      const isPositive = accuracy >= 0;
                      const isExpired = prediction.timeLeft <= 0;
                      
                      return (
                        <div key={prediction.id} className="p-4 bg-surface-light rounded-lg border border-slate-600">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${getCryptoColor(prediction.cryptocurrency)} rounded-full flex items-center justify-center text-white font-bold`}>
                                {getCryptoIcon(prediction.cryptocurrency)}
                              </div>
                              <div>
                                <p className="font-semibold capitalize">{prediction.cryptocurrency}</p>
                                <p className="text-sm text-slate-400">{prediction.timeframe} prediction</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${isExpired ? "text-error" : "text-success"}`}>
                                {isExpired ? "Expired" : formatTimeLeft(prediction.timeLeft)}
                              </p>
                              <p className="text-xs text-slate-400">Stake: {prediction.stakeAmount} NTIQ</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-slate-400">Predicted Price</p>
                              <p className="font-semibold">${parseFloat(prediction.predictedPrice).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Current Price</p>
                              <p className={`font-semibold ${isPositive ? "text-success" : "text-error"}`}>
                                ${parseFloat(prediction.currentPrice).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${isPositive ? "bg-success" : "bg-error"}`}></div>
                              <span className={`text-sm font-medium ${isPositive ? "text-success" : "text-error"}`}>
                                {isPositive ? "+" : ""}{accuracy.toFixed(2)}% from prediction
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(Math.abs(accuracy), 100)} 
                              className="w-20 h-2"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Achievements />
          </TabsContent>

          {/* Daily Challenges Tab */}
          <TabsContent value="challenges">
            <DailyChallenges />
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="mr-2" size={20} />
                  Recent Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentRewards.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Gift className="mx-auto mb-2" size={32} />
                    <p>No rewards yet</p>
                    <p className="text-sm">Make accurate predictions to earn rewards!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRewards.map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                            <Gift className="text-white" size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {reward.cryptocurrency.toUpperCase()} Prediction Reward
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatTimeAgo(reward.createdAt)} • {parseFloat(reward.accuracy).toFixed(1)}% accuracy
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-success">
                            +{reward.amount} PTS
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Watch Tab */}
          <TabsContent value="market">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Prices - Interactive */}
              <div className="space-y-4">
                <LivePrices onCryptoSelect={handleCryptoSelect} />
                
                {/* Selected Crypto Info */}
                {selectedCrypto && showChart && (
                  <Card className="bg-surface border-surface-light">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <BarChart3 className="mr-2" size={20} />
                          Selected: {selectedCrypto.name} ({selectedCrypto.symbol})
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowChart(false);
                            setSelectedCrypto(null);
                          }}
                        >
                          Close Chart
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={selectedCrypto.image} 
                            alt={selectedCrypto.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-semibold">{selectedCrypto.symbol}</p>
                            <p className="text-sm text-slate-400">{selectedCrypto.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            ${selectedCrypto.current_price.toLocaleString(undefined, { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 6 
                            })}
                          </p>
                          <p className={`text-sm ${selectedCrypto.price_change_percentage_24h >= 0 ? 'text-success' : 'text-error'}`}>
                            {selectedCrypto.price_change_percentage_24h >= 0 ? '+' : ''}
                            {selectedCrypto.price_change_percentage_24h.toFixed(2)}% (24h)
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          className="w-full"
                          onClick={() => setLocation(`/predict?crypto=${selectedCrypto.id}`)}
                        >
                          <Target className="mr-2" size={16} />
                          Make Prediction for {selectedCrypto.symbol}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Interactive Chart */}
              <div className="space-y-4">
                {selectedCrypto && showChart ? (
                  <CryptoChart
                    cryptoId={selectedCrypto.id}
                    symbol={selectedCrypto.symbol}
                    name={selectedCrypto.name}
                    currentPrice={selectedCrypto.current_price}
                    priceChange24h={selectedCrypto.price_change_percentage_24h}
                  />
                ) : (
                  <Card className="bg-surface border-surface-light">
                    <CardContent className="text-center py-12">
                      <BarChart3 className="mx-auto mb-4 text-slate-400" size={48} />
                      <h3 className="text-lg font-semibold mb-2">Interactive Price Charts</h3>
                      <p className="text-slate-400 mb-4">
                        Click on any cryptocurrency from the Live Prices panel to view its interactive price chart
                      </p>
                      <div className="text-sm text-slate-500">
                        <p>• Real-time price data from CoinGecko</p>
                        <p>• Multiple timeframe analysis</p>
                        <p>• Direct prediction integration</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Quick Stats */}
                <Card className="bg-surface border-surface-light">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2" size={20} />
                      Market Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Cryptocurrencies</span>
                        <span className="font-semibold">{prices.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gainers (24h)</span>
                        <span className="font-semibold text-success">
                          {prices.filter(p => p.price_change_percentage_24h > 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Losers (24h)</span>
                        <span className="font-semibold text-error">
                          {prices.filter(p => p.price_change_percentage_24h < 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Top Performer</span>
                        <span className="font-semibold text-success">
                          {prices.length > 0 ? 
                            prices.reduce((prev, current) => 
                              prev.price_change_percentage_24h > current.price_change_percentage_24h ? prev : current
                            ).symbol : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Accuracy Level</span>
                    <span className={`font-semibold ${accuracyLevel.color}`}>{accuracyLevel.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Success Rate</span>
                    <span className="font-semibold">{stats?.accuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Predictions</span>
                    <span className="font-semibold">{stats?.totalPredictions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Earnings</span>
                    <span className="font-semibold text-success">{stats?.totalRewards || 0} PTS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Global Rank</span>
                    <span className="font-semibold text-warning">
                      {stats?.rank ? `#${stats.rank}` : "Unranked"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle>Next Level Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Predictions Progress</span>
                      <span>{stats?.totalPredictions || 0}/10</span>
                    </div>
                    <Progress value={Math.min(((stats?.totalPredictions || 0) / 10) * 100, 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Accuracy Goal</span>
                      <span>{stats?.accuracy || 0}%/75%</span>
                    </div>
                    <Progress value={Math.min(((stats?.accuracy || 0) / 75) * 100, 100)} />
                  </div>
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary">
                      💡 Keep making accurate predictions to climb the leaderboard and unlock achievement badges!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab - Combined Withdraw, Buy NTIQ, and Wallet */}
          <TabsContent value="financial">
            {/* Financial Actions Navigation */}
            <div className="mb-6">
              <div className="flex space-x-4 bg-surface border border-surface-light rounded-lg p-2">
                <Button
                  variant={selectedFinancialAction === "withdraw" ? "default" : "ghost"}
                  onClick={() => setSelectedFinancialAction("withdraw")}
                  className="flex-1"
                >
                  <DollarSign className="mr-2" size={16} />
                  Withdraw
                </Button>
                <Button
                  variant={selectedFinancialAction === "buy" ? "default" : "ghost"}
                  onClick={() => setSelectedFinancialAction("buy")}
                  className="flex-1"
                >
                  <CreditCard className="mr-2" size={16} />
                  Buy NTIQ
                </Button>
                <Button
                  variant={selectedFinancialAction === "wallet" ? "default" : "ghost"}
                  onClick={() => setSelectedFinancialAction("wallet")}
                  className="flex-1"
                >
                  <Wallet className="mr-2" size={16} />
                  Wallet
                </Button>
              </div>
            </div>

            {/* Withdraw Section */}
            {selectedFinancialAction === "withdraw" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Withdrawal Form */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="mr-2" size={20} />
                    Withdraw NTIQ to Crypto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                  {/* Balance Overview */}
                  <div className="p-4 bg-surface-light rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Available Balance</span>
                      <div className="flex items-center space-x-2">
                        <Coins className="text-warning" size={16} />
                        <span className="font-bold text-lg">{user?.balance?.toLocaleString() || "0"}</span>
                        <span className="text-xs text-slate-400">NTIQ</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      Exchange Rate: 1 NTIQ = 0.01 USDT/USDC
                    </div>
                  </div>

                  {/* Token Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="token">Choose Token</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={selectedToken === "USDT" ? "default" : "outline"}
                        onClick={() => setSelectedToken("USDT")}
                        className="flex-1"
                      >
                        <DollarSign className="mr-2" size={16} />
                        USDT
                      </Button>
                      <Button
                        variant={selectedToken === "USDC" ? "default" : "outline"}
                        onClick={() => setSelectedToken("USDC")}
                        className="flex-1"
                      >
                        <DollarSign className="mr-2" size={16} />
                        USDC
                      </Button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount to Withdraw (NTIQ)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter NTIQ amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="1000"
                      max={user?.balance || 0}
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Min: 1000 NTIQ</span>
                      <span>Max: {user?.balance?.toLocaleString() || "0"} NTIQ</span>
                    </div>
                  </div>

                  {/* Conversion Preview */}
                  {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-center text-sm">
                        <span>You will receive:</span>
                        <span className="font-semibold text-primary">
                          {(parseFloat(withdrawAmount) * 0.01).toFixed(2)} {selectedToken}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Withdraw Button */}
                  <Button
                    onClick={() => {
                      const amount = parseFloat(withdrawAmount);
                      if (amount >= 1000 && amount <= (user?.balance || 0)) {
                        withdrawMutation.mutate({ amount, token: selectedToken });
                      }
                    }}
                    disabled={
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) < 1000 ||
                      parseFloat(withdrawAmount) > (user?.balance || 0) ||
                      withdrawMutation.isPending
                    }
                    className="w-full"
                  >
                    {withdrawMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Wallet className="mr-2" size={16} />
                        Withdraw to Wallet
                      </>
                    )}
                  </Button>

                  {/* Info */}
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>• Withdrawals are processed instantly</p>
                    <p>• Tokens will be sent to your connected wallet</p>
                    <p>• Minimum withdrawal: 1000 NTIQ (10.00 {selectedToken})</p>
                    <p>• No withdrawal fees applied</p>
                  </div>
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawal History */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2" size={20} />
                    Withdrawal History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WithdrawalHistory />
                </CardContent>
              </Card>
            </div>
            )}

            {/* Buy NTIQ Section */}
            {selectedFinancialAction === "buy" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buy NTIQ Form */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="mr-2" size={20} />
                    Buy NTIQ with Crypto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Balance */}
                    <div className="p-4 bg-surface-light rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Current NTIQ Balance</span>
                        <div className="flex items-center space-x-2">
                          <Coins className="text-warning" size={16} />
                          <span className="font-bold text-lg">{user?.balance?.toLocaleString() || "0"}</span>
                          <span className="text-xs text-slate-400">NTIQ</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        Use NTIQ to make predictions and earn rewards
                      </div>
                    </div>

                    {/* Payment Token Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="paymentToken">Choose Payment Method</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={selectedPaymentToken === "ETH" ? "default" : "outline"}
                          onClick={() => setSelectedPaymentToken("ETH")}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1">
                            Ξ
                          </div>
                          <span className="text-xs">ETH</span>
                        </Button>
                        <Button
                          variant={selectedPaymentToken === "USDT" ? "default" : "outline"}
                          onClick={() => setSelectedPaymentToken("USDT")}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1">
                            $
                          </div>
                          <span className="text-xs">USDT</span>
                        </Button>
                        <Button
                          variant={selectedPaymentToken === "USDC" ? "default" : "outline"}
                          onClick={() => setSelectedPaymentToken("USDC")}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1">
                            $
                          </div>
                          <span className="text-xs">USDC</span>
                        </Button>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="buyAmount">Amount to Purchase (NTIQ)</Label>
                      <Input
                        id="buyAmount"
                        type="number"
                        placeholder="Enter NTIQ amount"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        min="100"
                      />
                      <div className="text-xs text-slate-400">
                        Exchange Rate: 1 {selectedPaymentToken} = 100 NTIQ
                      </div>
                    </div>

                    {/* Conversion Preview */}
                    {buyAmount && parseFloat(buyAmount) > 0 && (
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex justify-between items-center text-sm">
                          <span>You will pay:</span>
                          <span className="font-semibold text-primary">
                            {(parseFloat(buyAmount) * 0.01).toFixed(4)} {selectedPaymentToken}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Buy Button */}
                    <Button
                      onClick={() => {
                        const amount = parseFloat(buyAmount);
                        if (amount >= 100) {
                          // Handle buy NTIQ logic
                          console.log('Buy NTIQ:', { amount, token: selectedPaymentToken });
                        }
                      }}
                      disabled={!buyAmount || parseFloat(buyAmount) < 100}
                      className="w-full"
                    >
                      <Coins className="mr-2" size={16} />
                      Buy NTIQ
                    </Button>

                    {/* Info */}
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>• Payments are processed instantly via smart contracts</p>
                      <p>• NTIQ will be credited to your account immediately</p>
                      <p>• Minimum purchase: 100 NTIQ</p>
                      <p>• Supported tokens: ETH, USDT, USDC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase History */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2" size={20} />
                    Purchase History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PurchaseHistory />
                </CardContent>
              </Card>
            </div>
            )}

            {/* Wallet Section */}
            {selectedFinancialAction === "wallet" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="mr-2" size={20} />
                    Wallet Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WalletConnect />
                </CardContent>
              </Card>

              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle>Wallet Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-300">Secure Connection</p>
                        <p className="text-xs text-slate-400">Your wallet is connected via Web3Modal</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-300">Balance Sync</p>
                        <p className="text-xs text-slate-400">Real-time balance updates from blockchain</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-300">Multi-Network</p>
                        <p className="text-xs text-slate-400">Supports Ethereum, Polygon, and Arbitrum</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}