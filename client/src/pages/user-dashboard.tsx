import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Target, Trophy, Gift, TrendingUp, TrendingDown, Clock, Coins, Star, ArrowLeft, Wallet, DollarSign, RefreshCw, Activity, Award, Calendar, History, Eye, CreditCard, UserCircle, Upload, Copy, Check, Swords, Shield, CheckCircle, AlertCircle, Crown, Gem, Plus, Users, Zap } from "lucide-react";
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
import { Achievements } from "@/components/achievements";
import { DailyChallenges } from "@/components/daily-challenges";
import TradingViewChart from "@/components/TradingViewChart";
import { LivePrices } from "@/components/live-prices";
import { WalletConnect } from "@/components/wallet-connect";
import { WalletBalances } from "@/components/wallet-balances";
import { useWalletIntegration } from "@/hooks/useWalletIntegration";
import { ReferralSystem } from "@/components/ReferralSystem";
import { LoyaltyTier } from "@/components/loyalty-tier";
import { FinancialWallet } from "@/components/financial-wallet";
import { SurvivalStatus } from "@/components/survival-status";
import { MultiChainFinancial } from "@/components/multi-chain-financial";


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

export default function UserDashboard() {
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false, // Don't retry authentication requests
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    throwOnError: false, // Don't throw errors
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoPrice | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [, setLocation] = useLocation();
  const [walletCopied, setWalletCopied] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  // Debug function to track tab changes
  const handleTabChange = (value: string) => {
    console.log("🎯 Tab clicked:", value);
    setActiveTab(value);
  };

  // Manual refresh function for Market Overview
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchPrices();
    } catch (error) {
      console.error('Manual refresh error:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
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
        console.error('Copy wallet address error:', error);
        toast({
          title: "Copy Failed",
          description: "Unable to copy wallet address",
          variant: "destructive",
        });
      }
    }
  };

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
    retry: false,
    throwOnError: false,
    staleTime: 60000,
  });

  const { data: activePredictions = [], isLoading: predictionsLoading, error: predictionsError } = useQuery<ActivePrediction[]>({
    queryKey: ["/api/predictions/active"],
    enabled: !!user,
    retry: false,
    throwOnError: false,
    refetchInterval: false,
    staleTime: 60000,
  });

  const { data: recentRewards = [], isLoading: rewardsLoading, error: rewardsError } = useQuery<RecentReward[]>({
    queryKey: ["/api/rewards/recent"],
    enabled: !!user,
    retry: false,
    throwOnError: false,
    refetchInterval: false,
    staleTime: 60000,
  });

  const { data: prices = [], isLoading: pricesLoading, refetch: refetchPrices } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 30000, // Increased to 30 seconds to prevent rate limiting
    staleTime: 25000,
    retry: 3,
    retryDelay: 3000,
  });

  // Get real-time crypto prices for dynamic logo display in predictions
  const { data: cryptoPrices = [] } = useQuery<any[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 30000, // Increased to 30 seconds
    staleTime: 25000,
    retry: 2,
    retryDelay: 3000,
  });

  // Add missing query states that are referenced in debugging
  const { data: leaderboard = [], isLoading: leaderboardLoading, error: leaderboardError } = useQuery({
    queryKey: ["/api/leaderboard"],
    enabled: !!user,
    retry: false,
    throwOnError: false,
    staleTime: 60000,
  });

  const { data: liveFeed = [], isLoading: liveFeedLoading, error: liveFeedError } = useQuery({
    queryKey: ["/api/predictions/live-feed"],
    enabled: !!user,
    retry: false,
    throwOnError: false,
    refetchInterval: false,
    staleTime: 60000,
  });

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection in UserDashboard:', event.reason);
      event.preventDefault(); // Prevent the default console error
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error in UserDashboard:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

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

  // Show comprehensive loading state with debugging info
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Dashboard...</p>
          <p className="text-white/60 text-sm mt-2">Authenticating your wallet...</p>
        </div>
      </div>
    );
  }

  // Temporary: Skip authentication check to allow dashboard access
  console.log("🎯 [USER-DASHBOARD] Rendering dashboard", { 
    user: !!user, 
    userLoading,
    error: userError?.message 
  });

  console.log("🎯 [USER-DASHBOARD] Dashboard rendering started", { 
    userId: user?.id, 
    username: user?.username,
    userLoading,
    userError: userError?.message,
    hasUser: !!user
  });

  // Add debugging for each query state
  console.log("📊 [USER-DASHBOARD] Query states:", {
    predictionsLoading,
    predictionsError: predictionsError?.message,
    statsLoading,
    statsError: statsError?.message,
    rewardsLoading,
    rewardsError: rewardsError?.message,
    leaderboardLoading,
    leaderboardError: leaderboardError?.message,
    liveFeedLoading,
    liveFeedError: liveFeedError?.message
  });

  // Dashboard content for authenticated users
  console.log("🎯 [RENDER] Dashboard JSX about to return for user:", user?.username);
  
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>

      
      {/* Header */}
      <div className="bg-surface border-b border-surface-light" style={{ backgroundColor: '#2a2a2a' }}>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation - 1/3 of width */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl sticky top-4 h-fit">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Dashboard Menu</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Manage your account and track your performance</p>
              </div>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical" className="w-full">
                <div className="space-y-3">
                  <TabsList className="bg-transparent w-full h-auto p-0 flex-col space-y-3">
                    <TabsTrigger 
                      value="profile" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-blue-400/50 text-slate-300"
                    >
                      <UserCircle className="h-5 w-5" />
                      <span>Profile</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="predictions" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-green-400/50 text-slate-300"
                    >
                      <Clock className="h-5 w-5" />
                      <span>My Predictions</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="achievements" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-yellow-400/50 text-slate-300"
                    >
                      <Award className="h-5 w-5" />
                      <span>Achievements</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="challenges" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-purple-400/50 text-slate-300"
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Daily Challenges</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="loyalty" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-red-400/50 text-slate-300"
                    >
                      <Shield className="h-5 w-5" />
                      <span>Loyalty</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="market" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-orange-400/50 text-slate-300"
                    >
                      <Eye className="h-5 w-5" />
                      <span>Market Watch</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="performance" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-amber-400/50 text-slate-300"
                    >
                      <Activity className="h-5 w-5" />
                      <span>Performance</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="battles" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-emerald-400/50 text-slate-300"
                    >
                      <Swords className="h-5 w-5" />
                      <span>Battles</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="financial" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-rose-400/50 text-slate-300"
                    >
                      <Wallet className="h-5 w-5" />
                      <span>Financial</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="referral" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-pink-400/50 text-slate-300"
                    >
                      <Users className="h-5 w-5" />
                      <span>Referral Program</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="rewards" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-xl border border-transparent data-[state=active]:border-indigo-400/50 text-slate-300"
                    >
                      <History className="h-5 w-5" />
                      <span>Reward History</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Main Content Area - 2/3 of width */}
          <div className="lg:col-span-2 min-h-0">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
              <div className="flex flex-col h-full space-y-6">

                {/* Profile Tab */}
                <TabsContent value="profile" className="flex-1 h-full">
                  <div className="h-full">
                    <UserProfile />
                  </div>
                </TabsContent>

                {/* Active Predictions Tab */}
                <TabsContent value="predictions" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2" size={20} />
                  Active Predictions ({activePredictions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {activePredictions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 flex-1 flex flex-col justify-center">
                    <Clock className="mx-auto mb-2" size={32} />
                    <p>No active predictions</p>
                    <p className="text-sm">Start making predictions to see them here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activePredictions.map((prediction) => {
                      // Calculate accuracy using the new formula: (1 - |Predicted - Current| / Current) × 100
                      const predictedPrice = parseFloat(prediction.predictedPrice);
                      const currentPrice = parseFloat(prediction.currentPrice);
                      const accuracyDecimal = 1 - (Math.abs(predictedPrice - currentPrice) / currentPrice);
                      const accuracy = accuracyDecimal * 100;
                      const isPositive = accuracy >= 0;
                      const isExpired = prediction.timeLeft <= 0;
                      
                      // Format time left properly
                      const formatTimeLeft = (timeLeft: number): string => {
                        if (timeLeft <= 0) return "Expired";
                        
                        const hours = Math.floor(timeLeft / 3600);
                        const minutes = Math.floor((timeLeft % 3600) / 60);
                        const seconds = timeLeft % 60;
                        
                        if (hours > 0) {
                          return `${hours}h ${minutes}m`;
                        } else if (minutes > 0) {
                          return `${minutes}m ${seconds}s`;
                        } else {
                          return `${seconds}s`;
                        }
                      };
                      
                      return (
                        <div key={prediction.id} className="p-4 bg-surface-light rounded-lg border border-slate-600">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-10 h-10 flex-shrink-0">
                                <img 
                                  src={getCryptoImageUrl(prediction.cryptocurrency, cryptoPrices || [])}
                                  alt={prediction.cryptocurrency}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                      target.style.display = 'none';
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className={`w-10 h-10 ${getCryptoColor(prediction.cryptocurrency)} rounded-full hidden items-center justify-center text-white font-bold`}>
                                  {getCryptoIcon(prediction.cryptocurrency)}
                                </div>
                              </div>
                              <div>
                                <p className="font-semibold capitalize">{prediction.cryptocurrency}</p>
                                <p className="text-sm text-slate-400">{prediction.timeframe} prediction</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${isExpired ? "text-error" : "text-success"}`}>
                                {formatTimeLeft(prediction.timeLeft)}
                              </p>
                              <p className="text-xs text-slate-400">Stake: {prediction.stakeAmount} NTIQ</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-slate-400">Predicted Price</p>
                              <p className="font-semibold">${predictedPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Current Price</p>
                              <p className={`font-semibold ${currentPrice >= predictedPrice ? "text-success" : "text-error"}`}>
                                ${currentPrice.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${accuracy >= 90 ? "bg-success" : accuracy >= 70 ? "bg-warning" : "bg-error"}`}></div>
                              <span className={`text-sm font-medium ${accuracy >= 90 ? "text-success" : accuracy >= 70 ? "text-warning" : "text-error"}`}>
                                {accuracy.toFixed(2)}% accuracy
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
                  </div>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="flex-1 h-full">
                  <div className="h-full">
                    <Achievements />
                  </div>
                </TabsContent>

                {/* Daily Challenges Tab */}
                <TabsContent value="challenges" className="flex-1 h-full">
                  <div className="h-full">
                    <DailyChallenges />
                  </div>
                </TabsContent>

                {/* Loyalty Tab */}
                <TabsContent value="loyalty" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="mr-2" size={20} />
                          Loyalty Tier Program
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Earn rewards based on your prediction performance and platform activity
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="space-y-6">
                          {/* Current Tier Status */}
                          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                  <Crown className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-white">Bronze Tier</h3>
                                  <p className="text-sm text-slate-400">Current Status</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                Active
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Lifetime Earnings</span>
                                <span className="text-white font-medium">425 NTIQ</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Next Tier Progress</span>
                                <span className="text-white font-medium">42.5%</span>
                              </div>
                              <Progress value={42.5} className="h-2" />
                              <div className="text-xs text-slate-500">
                                575 NTIQ needed to reach Silver Tier
                              </div>
                            </div>
                          </div>

                          {/* Current Benefits */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                              <div className="flex items-center space-x-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                <span className="text-sm font-medium text-white">Reward Multiplier</span>
                              </div>
                              <div className="text-2xl font-bold text-green-400">1.0x</div>
                              <div className="text-xs text-slate-400">Base reward rate</div>
                            </div>
                            
                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                              <div className="flex items-center space-x-2 mb-2">
                                <Gift className="h-4 w-4 text-purple-400" />
                                <span className="text-sm font-medium text-white">Monthly Bonus</span>
                              </div>
                              <div className="text-2xl font-bold text-purple-400">0 NTIQ</div>
                              <div className="text-xs text-slate-400">No monthly bonus yet</div>
                            </div>
                            
                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                              <div className="flex items-center space-x-2 mb-2">
                                <Clock className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-medium text-white">Priority Support</span>
                              </div>
                              <div className="text-sm text-slate-400">Not available</div>
                            </div>
                            
                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                              <div className="flex items-center space-x-2 mb-2">
                                <Zap className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm font-medium text-white">Early Access</span>
                              </div>
                              <div className="text-sm text-slate-400">Not available</div>
                            </div>
                          </div>

                          {/* Tier Roadmap */}
                          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                            <h4 className="text-lg font-semibold text-white mb-4">Tier Roadmap</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <div className="flex items-center space-x-3">
                                  <Crown className="h-5 w-5 text-blue-400" />
                                  <div>
                                    <div className="font-medium text-blue-300">Bronze</div>
                                    <div className="text-xs text-slate-400">0+ NTIQ earned</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">Current</Badge>
                              </div>
                              
                              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center space-x-3">
                                  <Star className="h-5 w-5 text-slate-400" />
                                  <div>
                                    <div className="font-medium text-slate-300">Silver</div>
                                    <div className="text-xs text-slate-400">1,000+ NTIQ • 1.2x multiplier</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-slate-700 text-slate-400 border-slate-600">Locked</Badge>
                              </div>
                              
                              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center space-x-3">
                                  <Zap className="h-5 w-5 text-slate-400" />
                                  <div>
                                    <div className="font-medium text-slate-300">Gold</div>
                                    <div className="text-xs text-slate-400">5,000+ NTIQ • 1.5x multiplier • Monthly bonus</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-slate-700 text-slate-400 border-slate-600">Locked</Badge>
                              </div>
                              
                              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center space-x-3">
                                  <Gift className="h-5 w-5 text-slate-400" />
                                  <div>
                                    <div className="font-medium text-slate-300">Platinum</div>
                                    <div className="text-xs text-slate-400">25,000+ NTIQ • 2.0x multiplier • VIP benefits</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-slate-700 text-slate-400 border-slate-600">Locked</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Referral Program Tab */}
                <TabsContent value="referral" className="flex-1 h-full">
                  <div className="h-full">
                    <ReferralSystem />
                  </div>
                </TabsContent>

                {/* Rewards Tab */}
                <TabsContent value="rewards" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="mr-2" size={20} />
                  Recent Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {recentRewards.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 flex-1 flex flex-col justify-center">
                    <Gift className="mx-auto mb-2" size={32} />
                    <p>No rewards yet</p>
                    <p className="text-sm">Make accurate predictions to earn rewards!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRewards.map((reward) => {
                      const isWin = reward.amount > 0;
                      
                      // Determine source type and display text
                      let sourceText = '';
                      let sourceIcon = <Gift size={16} />;
                      
                      switch (reward.type) {
                        case 'prediction':
                          sourceText = `${reward.cryptocurrency?.toUpperCase() || 'CRYPTO'} Prediction ${isWin ? 'Win' : 'Loss'}`;
                          sourceIcon = isWin ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
                          break;
                        case 'battle':
                          // Parse battle description to extract opponent name
                          const battleDescription = reward.description || '';
                          const opponentMatch = battleDescription.match(/vs (.+?) -/);
                          const opponentName = opponentMatch ? opponentMatch[1] : 'Opponent';
                          sourceText = `Battle vs ${opponentName}`;
                          sourceIcon = <TrendingUp size={16} />;
                          break;
                        case 'survival':
                          sourceText = `Survival Tournament`;
                          sourceIcon = <TrendingUp size={16} />;
                          break;
                        case 'achievement':
                          sourceText = 'Achievement Reward';
                          sourceIcon = <Check size={16} />;
                          break;
                        case 'daily_challenge':
                          sourceText = 'Daily Challenge';
                          sourceIcon = <Gift size={16} />;
                          break;
                        default:
                          sourceText = `${reward.cryptocurrency?.toUpperCase() || 'CRYPTO'} Prediction ${isWin ? 'Win' : 'Loss'}`;
                          sourceIcon = isWin ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
                      }
                      
                      return (
                        <div key={reward.id} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-8 h-8 flex-shrink-0">
                              {/* Activity Type Badge */}
                              <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs font-bold flex items-center justify-center text-white z-10 ${
                                reward.type === 'battle' ? 'bg-purple-500' :
                                reward.type === 'survival' ? 'bg-orange-500' :
                                reward.type === 'achievement' ? 'bg-yellow-500' :
                                reward.type === 'daily_challenge' ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}>
                                {reward.type === 'battle' ? '⚔' : 
                                 reward.type === 'survival' ? '🏆' : 
                                 reward.type === 'achievement' ? '🎯' :
                                 reward.type === 'daily_challenge' ? '📅' :
                                 '📈'}
                              </div>
                              
                              {/* Main Icon */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reward.amount > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                                {sourceIcon}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                {sourceText}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatTimeAgo(reward.createdAt)}{reward.accuracy ? ` • ${parseFloat(reward.accuracy).toFixed(1)}% accuracy` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${reward.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {reward.amount > 0 ? '+' : ''}{reward.amount} NTIQ
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
                  </div>
                </TabsContent>

                {/* Market Watch Tab */}
                <TabsContent value="market" className="flex-1 h-full">
                  <div className="h-full space-y-6">
                    {/* Data Source Information */}
                    <div className="mb-4">
                      <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-green-200 mb-1">Unified Data Source</h4>
                            <p className="text-xs text-green-300">
                              Both <span className="text-yellow-400 font-semibold">Live Prices</span> and <span className="text-blue-400 font-semibold">TradingView Charts</span> 
                              now use the same <span className="text-green-400 font-semibold">Binance API</span> data source for consistent pricing across the platform.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Prices Section - Moved to Top */}
                    <div className="mb-6">
                      <LivePrices onCryptoSelect={handleCryptoSelect} />
                    </div>

                    {/* Chart Section - Now Takes Full Width */}
                    <div className="space-y-4">
                      {selectedCrypto && showChart ? (
                        <div className="space-y-4">
                          {/* Chart Header Info */}
                          <Card className="bg-surface border-surface-light">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                  <BarChart3 className="mr-2" size={20} />
                                  {selectedCrypto.name} ({selectedCrypto.symbol}) - Trading Chart
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

                          {/* TradingView Chart - Full Width */}
                          <TradingViewChart
                            cryptoId={selectedCrypto.id}
                            symbol={selectedCrypto.symbol}
                            name={selectedCrypto.name}
                            currentPrice={selectedCrypto.current_price}
                            priceChange24h={selectedCrypto.price_change_percentage_24h}
                            onPredictClick={(cryptoId) => setLocation(`/predict?crypto=${cryptoId}`)}
                          />
                        </div>
                      ) : (
                        <Card className="bg-surface border-surface-light">
                          <CardContent className="text-center py-12">
                            <BarChart3 className="mx-auto mb-4 text-slate-400" size={48} />
                            <h3 className="text-lg font-semibold mb-2">Interactive Price Charts</h3>
                            <p className="text-slate-400 mb-4">
                              Click on any cryptocurrency from the Live Prices panel to view its interactive TradingView chart
                            </p>
                            <div className="text-sm text-slate-500">
                              <p>• Professional TradingView charts with candlestick data</p>
                              <p>• Volume and RSI indicators</p>
                              <p>• Multiple timeframe analysis (5M - 1W)</p>
                              <p>• Fullscreen mode available</p>
                              <p>• Direct prediction integration</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Market Statistics - Moved to Bottom */}
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
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="flex-1 h-full">
                  <div className="h-full">
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
                    <span className="font-semibold text-success">{stats?.totalRewards || 0} NTIQ</span>
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
                  </div>
                </TabsContent>

                {/* Financial Tab - Deposit Only */}
                <TabsContent value="financial" className="flex-1 h-full">
                  <div className="h-full">
            <div className="space-y-6">
              <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <h3 className="text-lg font-bold mb-2 text-black dark:text-black">Multi-Chain Financial System</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Deposit and withdrawal system for multiple blockchains
                </p>
              </div>
              <MultiChainFinancial />
                    </div>
                  </div>
                </TabsContent>

                {/* Battles Tab */}
                <TabsContent value="battles" className="flex-1 h-full">
                  <div className="h-full">
                    <BattlesSection />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Battles Section Component
function BattlesSection() {
  const { data: battleData, isLoading: battlesLoading } = useQuery({
    queryKey: ["/api/user/battles"],
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });

  const { data: cryptoPrices } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 30000,
  });

  if (battlesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Loading battle data...</span>
      </div>
    );
  }

  const battles = (battleData as any)?.battles || [];
  const stats = (battleData as any)?.stats || {
    totalBattles: 0,
    wonBattles: 0,
    lostBattles: 0,
    activeBattles: 0,
    pendingBattles: 0,
    totalBattleRewards: 0
  };

  const winRate = stats.totalBattles > 0 ? ((stats.wonBattles / stats.totalBattles) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Battle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-surface border-surface-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Battles</CardTitle>
            <Swords className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBattles}</div>
            <div className="text-xs text-slate-400 mt-1">All time battles participated</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-surface-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Battles Won</CardTitle>
            <Trophy className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.wonBattles}</div>
            <div className="text-xs text-slate-400 mt-1">Win Rate: {winRate}%</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-surface-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Battle Rewards</CardTitle>
            <Coins className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.totalBattleRewards.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">NTIQ earned from battles</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-surface-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Battles</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeBattles}</div>
            <div className="text-xs text-slate-400 mt-1">Currently ongoing</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-surface-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pending Battles</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pendingBattles}</div>
            <div className="text-xs text-slate-400 mt-1">Waiting for opponent</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-surface-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Battles Lost</CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.lostBattles}</div>
            <div className="text-xs text-slate-400 mt-1">Learn and improve</div>
          </CardContent>
        </Card>
      </div>

      {/* Battle History */}
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2" size={20} />
            Battle History ({battles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {battles.length === 0 ? (
            <div className="text-center py-8">
              <Swords className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-400">No battles found</p>
              <p className="text-sm text-slate-500 mt-2">Start your first battle to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {battles.map((battle: any) => (
                <div key={battle.id} className="border border-surface-light rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {/* Cryptocurrency Logo */}
                      <img
                        src={getCryptoImageUrl(battle.cryptocurrency, cryptoPrices || [])}
                        alt={battle.cryptocurrency}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="font-semibold text-slate-200">
                          {battle.cryptocurrency?.toUpperCase()} Battle
                        </div>
                        <div className="text-xs text-slate-400">
                          {battle.isUserChallenger ? 'You challenged' : 'You were challenged by'} {' '}
                          {battle.isUserChallenger ? battle.challengedUsername || 'Open' : battle.challengerUsername}
                        </div>
                      </div>
                    </div>

                    {/* Battle Status */}
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          battle.status === 'completed' ? 'default' : 
                          battle.status === 'active' ? 'secondary' : 
                          'outline'
                        }
                        className={
                          battle.status === 'completed' ? 'bg-success text-white' :
                          battle.status === 'active' ? 'bg-primary text-white' :
                          'bg-orange-500 text-white'
                        }
                      >
                        {battle.status === 'completed' ? 'Completed' :
                         battle.status === 'active' ? 'Active' : 'Pending'}
                      </Badge>

                      {/* Win/Loss Indicator */}
                      {battle.status === 'completed' && battle.winnerId && (
                        <Badge 
                          variant={battle.winnerId === battle.challengerId && battle.isUserChallenger || 
                                  battle.winnerId === battle.challengedId && !battle.isUserChallenger ? 'default' : 'destructive'}
                          className={
                            battle.winnerId === battle.challengerId && battle.isUserChallenger || 
                            battle.winnerId === battle.challengedId && !battle.isUserChallenger
                              ? 'bg-success text-white' : 'bg-red-500 text-white'
                          }
                        >
                          {battle.winnerId === battle.challengerId && battle.isUserChallenger || 
                           battle.winnerId === battle.challengedId && !battle.isUserChallenger ? 'Won' : 'Lost'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Battle Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Stake Amount</div>
                      <div className="font-semibold text-warning">
                        {parseFloat(battle.stakeAmount || '0').toLocaleString()} NTIQ
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400">Target Time</div>
                      <div className="font-semibold">
                        {new Date(battle.targetTime).toLocaleDateString()}
                      </div>
                    </div>

                    {battle.status === 'active' && (
                      <div>
                        <div className="text-slate-400">Time Left</div>
                        <div className="font-semibold text-primary">
                          {Math.floor(battle.timeLeft / (1000 * 60 * 60))}h {Math.floor((battle.timeLeft % (1000 * 60 * 60)) / (1000 * 60))}m
                        </div>
                      </div>
                    )}

                    {battle.winnerReward && battle.status === 'completed' && (
                      <div>
                        <div className="text-slate-400">Reward</div>
                        <div className="font-semibold text-success">
                          +{parseFloat(battle.winnerReward).toLocaleString()} NTIQ
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Predictions Display */}
                  {(battle.challengerPrediction || battle.challengedPrediction) && (
                    <div className="mt-3 pt-3 border-t border-surface-light">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {battle.challengerPrediction && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              {battle.isUserChallenger ? 'Your' : battle.challengerUsername + "'s"} Prediction:
                            </span>
                            <span className="font-semibold">
                              ${parseFloat(battle.challengerPrediction).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6
                              })}
                            </span>
                          </div>
                        )}
                        
                        {battle.challengedPrediction && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              {!battle.isUserChallenger ? 'Your' : battle.challengedUsername + "'s"} Prediction:
                            </span>
                            <span className="font-semibold">
                              ${parseFloat(battle.challengedPrediction).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// User Profile Component
function UserProfile() {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [walletCopied, setWalletCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });

  // Fetch user tier information
  const { data: userTier } = useQuery({
    queryKey: ["/api/user/tier"],
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });

  // Function to get tier icon based on tier level
  const getTierIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
        return <Crown className="w-5 h-5 text-purple-400" />;
      case 'gold':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'silver':
        return <Award className="w-5 h-5 text-gray-400" />;
      case 'bronze':
        return <Gem className="w-5 h-5 text-orange-400" />;
      default:
        return null;
    }
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

  // Update username mutation
  const updateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update username');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Username Updated",
        description: "Your username has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditingUsername(false);
      setNewUsername("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    },
  });

  // Upload profile photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      const response = await fetch('/api/user/upload-profile-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload photo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only JPEG, PNG, and GIF files are allowed.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handlePhotoUpload = () => {
    if (selectedFile) {
      uploadPhotoMutation.mutate(selectedFile);
    }
  };

  const handlePhotoCancel = () => {
    setSelectedFile(null);
  };

  const handleUsernameEdit = () => {
    setNewUsername(user?.username || "");
    setIsEditingUsername(true);
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername("");
  };

  const handleUsernameSubmit = () => {
    if (!newUsername.trim()) {
      toast({
        title: "Invalid Username",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (newUsername.length < 3) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (newUsername === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    updateUsernameMutation.mutate(newUsername.trim());
  };

  if (!user) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4">Profile</h3>
        <div className="text-center py-8 text-slate-400">
          <UserCircle className="mx-auto mb-2" size={32} />
          <p>Please connect your wallet to view profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-surface border-surface-light">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <UserCircle className="text-white" size={32} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary/80 text-white rounded-full p-1 cursor-pointer transition-colors"
              >
                <Upload size={12} />
              </label>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                {userTier?.currentTier && getTierIcon(userTier.currentTier)}
              </div>
              <p className="text-slate-400">Active Member</p>
            </div>
          </div>

          {/* Photo upload preview and controls */}
          {selectedFile && (
            <div className="mb-4 p-4 bg-surface-light rounded-lg border border-primary/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-slate-400 text-sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handlePhotoUpload}
                    disabled={uploadPhotoMutation.isPending}
                    className="h-8 px-3"
                  >
                    {uploadPhotoMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      "Upload"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePhotoCancel}
                    className="h-8 px-3"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{user.balance}</div>
              <div className="text-sm text-slate-400">NTIQ Balance</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{user.totalPredictions || 0}</div>
              <div className="text-sm text-slate-400">Total Predictions</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{user.correctPredictions && user.totalPredictions ? `${((user.correctPredictions / user.totalPredictions) * 100).toFixed(1)}%` : '0%'}</div>
              <div className="text-sm text-slate-400">Accuracy Rate</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{user.totalRewards || 0}</div>
              <div className="text-sm text-slate-400">Total Rewards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-surface-light">
            <span className="text-slate-300">Username</span>
            <div className="flex items-center space-x-2">
              {isEditingUsername ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-40 h-8 text-sm bg-surface-light border-surface-light"
                    placeholder="Enter new username"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUsernameSubmit();
                      } else if (e.key === 'Escape') {
                        handleUsernameCancel();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleUsernameSubmit}
                    disabled={updateUsernameMutation.isPending}
                    className="h-8 px-2"
                  >
                    {updateUsernameMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUsernameCancel}
                    className="h-8 px-2"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{user.username}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleUsernameEdit}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                  >
                    <RefreshCw size={12} />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-surface-light">
            <span className="text-slate-300">Wallet Address</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-mono text-sm">
                {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Not connected'}
              </span>
              {user.walletAddress && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyWalletAddress}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                  title="Copy wallet address"
                >
                  {walletCopied ? <Check size={12} /> : <Copy size={12} />}
                </Button>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-surface-light">
            <span className="text-slate-300">Account Type</span>
            <span className="text-white font-medium">{user.isAdmin ? 'Administrator' : 'Standard User'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-300">Member Status</span>
            <span className="text-green-400 font-medium">Active</span>
          </div>
        </CardContent>
      </Card>

      {/* Survival Tournament Status */}
      <SurvivalStatus />
    </div>
  );
}