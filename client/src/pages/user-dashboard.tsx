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
import "../styles/mobile-user-dashboard.css";
// import { WalletBalances } from "@/components/wallet-balances"; // Removed - not needed
import { useWalletIntegration } from "@/hooks/useWalletIntegration";
import { ReferralSystem } from "@/components/ReferralSystem";
import { LoyaltyTier } from "@/components/loyalty-tier";
import { FinancialWallet } from "@/components/financial-wallet";
import { SurvivalStatus } from "@/components/survival-status";
import { MultiChainFinancial } from "@/components/multi-chain-financial";
import { WalletEmailVerification } from "@/components/WalletEmailVerification";
import { SocialShare, createShareData } from "@/components/SocialShare";


// Dynamic function to get crypto image from live API data
function getCryptoImageUrl(cryptoId: string, cryptoPrices: any[]): string {
  const cryptoData = cryptoPrices?.find(crypto => crypto.id === cryptoId);
  return cryptoData?.image || `https://coin-images.coingecko.com/coins/images/1/large/${cryptoId}.png`;
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
                <div className="font-medium text-sm">{withdrawal.ntiqAmount} NTIQ</div>
                <div className="text-xs text-slate-500">${withdrawal.usdAmount}</div>
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
  const [forceRefreshRewards, setForceRefreshRewards] = useState(0);

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

  // Force refresh rewards function
  const handleRefreshRewards = () => {
    console.log('🔄 [DASHBOARD-REWARDS] Force refreshing rewards data...');
    setForceRefreshRewards(prev => prev + 1);
    // Also invalidate query cache for good measure
    queryClient.invalidateQueries({ queryKey: ["/api/user/rewards/history"] });
    
    toast({
      title: "Rewards Refreshed",
      description: "Latest reward data has been loaded from server",
    });
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
    queryKey: ["/api/user/rewards/history", forceRefreshRewards], // Add forceRefresh to invalidate cache
    enabled: !!user,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
    throwOnError: false,
    refetchInterval: false,
    staleTime: 0, // Force fresh data to show latest changes
    gcTime: 0, // Clear cache immediately
  });

  // Debug authentication and reward loading
  console.log('🔍 [DASHBOARD] User authentication status:', {
    user: !!user,
    userId: user?.id,
    username: user?.username,
    rewardsEnabled: !!user,
    rewardsLoading,
    rewardsError: rewardsError?.message,
    rewardsCount: recentRewards.length
  });

  // Force refresh rewards when user becomes available
  useEffect(() => {
    if (user && user.id && !rewardsLoading && recentRewards.length === 0) {
      console.log('🔄 [DASHBOARD] User authenticated, force refreshing rewards...');
      queryClient.invalidateQueries({ queryKey: ["/api/user/rewards/history"] });
    }
  }, [user, rewardsLoading, recentRewards.length, queryClient]);

  const { data: prices = [], isLoading: pricesLoading, refetch: refetchPrices } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 1000, // Same as Live Prices - ultra-fast updates
    refetchIntervalInBackground: true, // Enable background updates
    staleTime: 500, // Same as Live Prices - very fresh data
    retry: 3, // More retry attempts for reliability
  });

  // Get real-time crypto prices for dynamic logo display in predictions
  const { data: cryptoPrices = [] } = useQuery<any[]>({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 1000, // Same as Live Prices - ultra-fast updates
    refetchIntervalInBackground: true, // Enable background updates
    staleTime: 500, // Same as Live Prices - very fresh data
    retry: 3, // More retry attempts for reliability
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
        <div className="container max-w-7xl mx-auto px-4">
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
                <span className="text-sm sm:text-base font-semibold text-yellow-400 dark:text-yellow-300">{user?.balance?.toLocaleString() || "0"}</span>
                <span className="text-xs text-yellow-200 dark:text-yellow-200">NTIQ</span>
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

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 md:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">Welcome back, {user?.username || "User"}!</h2>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base">Track your predictions, analyze performance, and climb the leaderboard.</p>
        </div>

        {/* Key Stats */}
        <div className="admin-stats-grid grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Card className="admin-card bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="admin-card-title text-xs sm:text-sm font-medium text-slate-400">Total Predictions</CardTitle>
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="admin-card-value text-lg sm:text-2xl font-bold">{stats?.totalPredictions?.toLocaleString() || "0"}</div>
              <div className="text-xs text-slate-400 mt-1 hidden sm:block">Lifetime predictions made</div>
            </CardContent>
          </Card>

          <Card className="admin-card bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="admin-card-title text-xs sm:text-sm font-medium text-slate-400">Accuracy Rate</CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="admin-card-value text-lg sm:text-2xl font-bold text-success">{stats?.accuracy || 0}%</div>
              <div className={`text-xs px-1 sm:px-2 py-1 rounded-full inline-block mt-1 ${accuracyLevel.bg} ${accuracyLevel.color} hidden sm:block`}>
                {accuracyLevel.label}
              </div>
            </CardContent>
          </Card>

          <Card className="admin-card bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="admin-card-title text-xs sm:text-sm font-medium text-slate-400">Current Rank</CardTitle>
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="admin-card-value text-lg sm:text-2xl font-bold text-warning">
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
              <div className="text-lg sm:text-2xl font-bold text-primary">{stats?.totalRewards?.toLocaleString() || "0"}</div>
              <div className="text-xs text-slate-400 mt-1 hidden sm:block">Points earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="admin-layout grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Sidebar Navigation - 1/3 of width */}
          <div className="lg:col-span-1">
            <div className="admin-sidebar bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl sticky top-4 h-fit">
              <div className="mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Dashboard Menu</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Manage your account and track your performance</p>
              </div>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical" className="w-full">
                <div className="space-y-1 sm:space-y-2 md:space-y-3">
                  <TabsList className="admin-tabs-nav bg-transparent w-full h-auto p-0 flex-col space-y-1 sm:space-y-2 md:space-y-3">
                    <TabsTrigger 
                      value="profile" 
                      className="admin-tab-button w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-blue-400/50 text-slate-300"
                    >
                      <UserCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Profile</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="predictions" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-green-400/50 text-slate-300"
                    >
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>My Predictions</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="achievements" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-yellow-400/50 text-slate-300"
                    >
                      <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Achievements</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="challenges" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-purple-400/50 text-slate-300"
                    >
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Daily Challenges</span>
                      <span className="sm:hidden">Challenges</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="loyalty" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-red-400/50 text-slate-300"
                    >
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Loyalty</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="market" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-orange-400/50 text-slate-300"
                    >
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Market Watch</span>
                      <span className="sm:hidden">Market</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="performance" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-amber-400/50 text-slate-300"
                    >
                      <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Performance</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="battles" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-emerald-400/50 text-slate-300"
                    >
                      <Swords className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Battles</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="financial" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-rose-400/50 text-slate-300"
                    >
                      <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Financial</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="referral" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-pink-400/50 text-slate-300"
                    >
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Referral Program</span>
                      <span className="sm:hidden">Referral</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="history" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-indigo-400/50 text-slate-300"
                    >
                      <History className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">History</span>
                      <span className="sm:hidden">History</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="analytics" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-violet-400/50 text-slate-300"
                    >
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Analytics</span>
                      <span className="sm:hidden">Analytics</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="rewards" 
                      className="w-full justify-start data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-transparent data-[state=active]:border-cyan-400/50 text-slate-300"
                    >
                      <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Rewards</span>
                      <span className="sm:hidden">Rewards</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Main Content Area - 2/3 of width */}
          <div className="lg:col-span-2 min-h-0">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
              <div className="flex flex-col h-full space-y-3 sm:space-y-4 md:space-y-6">

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
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-sm sm:text-base">
                  <Clock className="mr-2" size={16} />
                  Active Predictions ({activePredictions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-3 sm:p-4 md:p-6">
                {activePredictions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 flex-1 flex flex-col justify-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Make Your First Prediction</h3>
                    <p className="text-sm text-slate-400 mb-6">Start earning NTIQ rewards</p>
                    
                    <div className="space-y-3 text-left max-w-sm mx-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-slate-300">Choose from 15+ cryptocurrencies</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-300">Multiple time frames: 1h, 6h, 24h, 7d</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-slate-300">Up to 3x multiplier for ≥99.5% accuracy</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 mt-6">Select a cryptocurrency above to get started</p>
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
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Trophy className="mr-2" size={20} />
                          Achievements
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Complete challenges and earn NTIQ rewards!
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto">
                          <Achievements />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Daily Challenges Tab */}
                <TabsContent value="challenges" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Calendar className="mr-2" size={20} />
                          Daily Challenges
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Complete daily challenges to earn bonus NTIQ rewards!
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto">
                          <DailyChallenges />
                        </div>
                      </CardContent>
                    </Card>
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
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="mr-2" size={20} />
                          Referral Program
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Refer friends and earn NTIQ rewards together!
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto">
                          <ReferralSystem />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Rewards Tab */}
                <TabsContent value="rewards" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Gift className="mr-2" size={20} />
                    Recent Rewards
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshRewards}
                    className="text-xs hover:bg-primary/20 border-primary/30"
                  >
                    <RefreshCw className="mr-1" size={14} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {rewardsLoading ? (
                  <div className="text-center py-8 text-slate-400 flex-1 flex flex-col justify-center">
                    <RefreshCw className="mx-auto mb-2 animate-spin" size={32} />
                    <p>Loading rewards...</p>
                    <p className="text-sm">Fetching latest data from server...</p>
                  </div>
                ) : rewardsError?.message?.includes('Authentication') || rewardsError?.message?.includes('401') ? (
                  <div className="text-center py-8 text-amber-400 flex-1 flex flex-col justify-center">
                    <AlertCircle className="mx-auto mb-2" size={32} />
                    <p>Authentication Required</p>
                    <p className="text-sm">Connect your wallet to view reward history</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 mx-auto" 
                      onClick={handleRefreshRewards}
                    >
                      <RefreshCw className="mr-1" size={14} />
                      Retry
                    </Button>
                  </div>
                ) : recentRewards.length === 0 ? (
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
                      
                      const rewardType = (reward as any).type || 'prediction';
                      switch (rewardType) {
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
                        case 'parlay':
                          sourceText = `Parlay Bet`;
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
                                rewardType === 'battle' ? 'bg-purple-500' :
                                rewardType === 'survival' ? 'bg-orange-500' :
                                rewardType === 'parlay' ? 'bg-indigo-500' :
                                rewardType === 'achievement' ? 'bg-yellow-500' :
                                rewardType === 'daily_challenge' ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}>
                                {rewardType === 'battle' ? '⚔' : 
                                 rewardType === 'survival' ? '🏆' : 
                                 rewardType === 'parlay' ? '🎲' :
                                 rewardType === 'achievement' ? '🎯' :
                                 rewardType === 'daily_challenge' ? '📅' :
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
                          <div className="text-right flex items-center gap-2">
                            <p className={`text-sm font-semibold ${reward.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {reward.amount > 0 ? '+' : ''}{reward.amount} NTIQ
                            </p>
                            
                            {/* Share Button for Prediction Wins with Enhanced Details */}
                            {reward.amount > 0 && rewardType === 'prediction' && (reward as any).sourceDetails && (
                              <SocialShare
                                compact={true}
                                data={createShareData.predictionWithDetails(
                                  reward.cryptocurrency?.toUpperCase() || 'CRYPTO',
                                  reward.amount,
                                  parseFloat(reward.accuracy || '0'),
                                  {
                                    predictedPrice: (reward as any).sourceDetails.predictedPrice,
                                    actualPrice: (reward as any).sourceDetails.actualPrice,
                                    accuracy: (reward as any).sourceDetails.accuracy
                                  }
                                )}
                              />
                            )}
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
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart3 className="mr-2" size={20} />
                          Market Watch
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Monitor live prices and view interactive charts with real-time data
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto space-y-6">
                          {/* Live Prices Section - Moved to Top */}
                          <div className="mb-6">
                            <LivePrices onCryptoSelect={handleCryptoSelect} />
                          </div>

                          {/* Chart Section - Now Takes Full Width */}
                          <div className="space-y-6">
                            {selectedCrypto && showChart ? (
                              <>
                                <Card>
                                  <CardContent className="p-0">
                                    <TradingViewChart
                                      cryptoId={selectedCrypto.id}
                                    />
                                  </CardContent>
                                </Card>
                                
                                {/* Make Prediction Button Below Chart */}
                                <div className="mb-6">
                                  <Button 
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    onClick={() => setLocation(`/predict?crypto=${selectedCrypto.id}`)}
                                  >
                                    <Target className="mr-2" size={16} />
                                    Make Prediction
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <Card className="bg-surface border-surface-light mb-6">
                                <CardContent className="text-center py-12">
                                  <BarChart3 className="mx-auto mb-4 text-slate-400" size={48} />
                                  <h3 className="text-lg font-semibold mb-2">Interactive Price Charts</h3>
                                  <p className="text-slate-400 mb-4">
                                    Click on any cryptocurrency from the Live Prices panel to view its professional TradingView Charts with Pyth Network data
                                  </p>
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
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="mr-2" size={20} />
                          Performance Overview
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Track your prediction accuracy and earnings performance
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto">
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
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Financial Tab - Deposit Only */}
                <TabsContent value="financial" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Wallet className="mr-2" size={20} />
                          Multi-Chain Financial System
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Deposit and withdrawal system for multiple blockchains
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto">
                          <MultiChainFinancial />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <History className="mr-2" size={20} />
                          Prediction History
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          View your complete prediction history and performance
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto">
                          <PredictionHistory />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart3 className="mr-2" size={20} />
                          Performance Analytics
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Detailed analytics and performance insights
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto">
                          <UserAnalytics />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Battles Tab */}
                <TabsContent value="battles" className="flex-1 h-full">
                  <div className="h-full">
                    <Card className="bg-surface border-surface-light h-full flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Swords className="mr-2" size={20} />
                          Prediction Battles
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          Challenge other players and compete for rewards!
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        <div className="overflow-y-auto">
                          <BattlesSection />
                        </div>
                      </CardContent>
                    </Card>
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

// Prediction History Component
function PredictionHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/user/prediction-history", currentPage, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/user/prediction-history?page=${currentPage}&limit=${pageSize}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch prediction history');
      return response.json();
    },
    retry: 2,
    staleTime: 30000,
  });

  if (historyLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Loading prediction history...</span>
      </div>
    );
  }

  const predictions = historyData?.predictions || [];
  const pagination = historyData?.pagination || { page: 1, totalPages: 1, totalCount: 0 };

  const getStatusBadge = (prediction: any) => {
    if (!prediction.resolved) {
      return <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">Pending</Badge>;
    }
    if (prediction.claimed) {
      return <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">Won</Badge>;
    }
    return <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">Lost</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatAccuracy = (accuracy: number | null) => {
    return accuracy ? `${accuracy.toFixed(2)}%` : 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{pagination.totalCount}</div>
            <div className="text-sm text-slate-400">Total Predictions</div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {predictions.filter((p: any) => p.claimed).length}
            </div>
            <div className="text-sm text-slate-400">Successful</div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {predictions.filter((p: any) => !p.resolved).length}
            </div>
            <div className="text-sm text-slate-400">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-400">
              {predictions.reduce((sum: number, p: any) => sum + (p.rewardAmount || 0), 0).toLocaleString()} NTIQ
            </div>
            <div className="text-sm text-slate-400">Total Rewards</div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="bg-surface border-surface-light">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-surface-light">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Crypto</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Prediction</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Final Price</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Timeframe</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Accuracy</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Reward</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {predictions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-slate-400">
                      No prediction history found
                    </td>
                  </tr>
                ) : (
                  predictions.map((prediction: any) => (
                    <tr key={prediction.id} className="border-b border-surface-light/50 hover:bg-surface-light/30">
                      <td className="p-4">
                        <div className="font-medium text-white">{prediction.cryptocurrency}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-300">{formatPrice(prediction.predictedPrice)}</div>
                        <div className="text-xs text-slate-500">Stake: {prediction.stakeAmount} NTIQ</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-300">
                          {prediction.finalPrice ? formatPrice(prediction.finalPrice) : 'Pending'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-300">{prediction.timeframe}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-300">{formatAccuracy(prediction.accuracyScore)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-primary font-medium">
                          {prediction.rewardAmount ? `${prediction.rewardAmount} NTIQ` : '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(prediction)}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-300 text-sm">
                          {new Date(prediction.submissionTime).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(prediction.submissionTime).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// User Analytics Component
function UserAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ["/api/user/analytics", selectedPeriod],
    queryFn: async () => {
      const params = new URLSearchParams({ period: selectedPeriod });
      const url = `/api/user/analytics?${params}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analytics fetch failed: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    },
    retry: 1,
    staleTime: 30000,
  });

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Loading analytics data...</span>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-400 mb-4">
          <span className="text-lg">⚠️ Analytics Data Unavailable</span>
        </div>
        <p className="text-slate-400 mb-4">
          {analyticsError instanceof Error ? analyticsError.message : 'Failed to load analytics data'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const analytics = analyticsData || {};
  const overview = analytics.overview || {};
  const cryptoPerformance = analytics.cryptoPerformance || [];
  const timeframePerformance = analytics.timeframePerformance || [];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-surface border border-surface-light rounded px-2 py-1 text-white text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{overview.totalPredictions || 0}</div>
            <div className="text-sm text-slate-400">Total Predictions</div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {overview.avgAccuracy ? `${overview.avgAccuracy.toFixed(1)}%` : '0%'}
            </div>
            <div className="text-sm text-slate-400">Average Accuracy</div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {overview.winRate ? `${overview.winRate.toFixed(1)}%` : '0%'}
            </div>
            <div className="text-sm text-slate-400">Win Rate</div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-400">
              {overview.totalRewards?.toLocaleString() || 0} NTIQ
            </div>
            <div className="text-sm text-slate-400">Total Rewards</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Cryptocurrency */}
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-lg text-white">Performance by Cryptocurrency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cryptoPerformance.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No performance data available for the selected period
              </div>
            ) : (
              cryptoPerformance.map((crypto: any, index: number) => (
                <div key={index} className="bg-surface-light rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-white">{crypto.cryptocurrency}</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-slate-400">
                        Win Rate: <span className="text-green-400 font-medium">
                          {crypto.winRate ? `${crypto.winRate.toFixed(1)}%` : '0%'}
                        </span>
                      </span>
                      <span className="text-slate-400">
                        Predictions: <span className="text-primary font-medium">{crypto.predictionsCount}</span>
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Average Accuracy:</span>
                      <span className="ml-2 text-white font-medium">
                        {crypto.avgAccuracy ? `${crypto.avgAccuracy.toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Rewards:</span>
                      <span className="ml-2 text-primary font-medium">
                        {crypto.totalRewards?.toLocaleString() || 0} NTIQ
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Successful:</span>
                      <span className="ml-2 text-green-400 font-medium">
                        {crypto.claimedCount}/{crypto.predictionsCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance by Timeframe */}
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-lg text-white">Performance by Timeframe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeframePerformance.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No timeframe performance data available
              </div>
            ) : (
              timeframePerformance.map((timeframe: any, index: number) => (
                <div key={index} className="bg-surface-light rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-white">{timeframe.timeframe}</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-slate-400">
                        Win Rate: <span className="text-green-400 font-medium">
                          {timeframe.winRate ? `${timeframe.winRate.toFixed(1)}%` : '0%'}
                        </span>
                      </span>
                      <span className="text-slate-400">
                        Predictions: <span className="text-primary font-medium">{timeframe.predictionsCount}</span>
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Average Accuracy:</span>
                      <span className="ml-2 text-white font-medium">
                        {timeframe.avgAccuracy ? `${timeframe.avgAccuracy.toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Successful:</span>
                      <span className="ml-2 text-green-400 font-medium">
                        {timeframe.claimedCount}/{timeframe.predictionsCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-surface border-surface-light">
          <CardHeader>
            <CardTitle className="text-lg text-white">Best Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Best Accuracy:</span>
              <span className="text-green-400 font-medium">
                {overview.bestAccuracy ? `${overview.bestAccuracy.toFixed(2)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Staked:</span>
              <span className="text-yellow-400 font-medium">
                {overview.totalStaked?.toLocaleString() || 0} NTIQ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ROI:</span>
              <span className="text-purple-400 font-medium">
                {overview.totalStaked ? 
                  `${(((overview.totalRewards || 0) - (overview.totalStaked || 0)) / (overview.totalStaked || 1) * 100).toFixed(1)}%` : 
                  'N/A'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-surface-light">
          <CardHeader>
            <CardTitle className="text-lg text-white">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Resolved Predictions:</span>
              <span className="text-blue-400 font-medium">{overview.totalResolved || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Successful Claims:</span>
              <span className="text-green-400 font-medium">{overview.totalClaimed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Success Rate:</span>
              <span className="text-primary font-medium">
                {overview.totalResolved ? 
                  `${((overview.totalClaimed || 0) / (overview.totalResolved || 1) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
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
            <div className="text-2xl font-bold">{stats.totalBattles?.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">All time battles participated</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-surface-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Battles Won</CardTitle>
            <Trophy className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.wonBattles?.toLocaleString()}</div>
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
            <div className="text-2xl font-bold text-primary">{stats.activeBattles?.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">Currently ongoing</div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-surface-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pending Battles</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pendingBattles?.toLocaleString()}</div>
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
                        <>
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
                          
                          {/* Share Button for Battle Results */}
                          {(battle.winnerId === battle.challengerId && battle.isUserChallenger || 
                            battle.winnerId === battle.challengedId && !battle.isUserChallenger) && (
                            <SocialShare
                              compact={true}
                              data={createShareData.battle(
                                battle.cryptocurrency?.toUpperCase() || 'CRYPTO',
                                battle.isUserChallenger ? battle.challengedUsername || 'Opponent' : battle.challengerUsername || 'Opponent',
                                parseFloat(battle.winnerReward?.toString() || '0')
                              )}
                            />
                          )}
                        </>
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
  const [showEmailDialog, setShowEmailDialog] = useState(false);
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
    onSuccess: (data) => {
      console.log('✅ [PROFILE-UPLOAD] Upload successful:', data);
      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    onError: (error: any) => {
      console.error('❌ [PROFILE-UPLOAD] Upload failed:', error);
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
      // Validate file type - Only JPG and PNG allowed
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only JPG and PNG files are allowed.",
          variant: "destructive",
        });
        // Reset input value
        if (event.target) {
          event.target.value = '';
        }
        return;
      }

      // Validate file size (max 10MB - will be compressed automatically)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB. Don't worry, it will be automatically compressed to an optimal size.",
          variant: "destructive",
        });
        // Reset input value
        if (event.target) {
          event.target.value = '';
        }
        return;
      }

      console.log('📷 [PROFILE-UPLOAD] File selected:', file.name, 'Size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
      setSelectedFile(file);
    }
  };

  const handlePhotoUpload = () => {
    if (selectedFile) {
      console.log('🚀 [PROFILE-UPLOAD] Starting upload for:', selectedFile.name);
      uploadPhotoMutation.mutate(selectedFile);
    }
  };

  const handlePhotoCancel = () => {
    console.log('❌ [PROFILE-UPLOAD] Upload cancelled');
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
              {selectedFile ? (
                // Show preview when file is selected
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              ) : user?.profilePhoto ? (
                // Show current profile photo
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                // Show default avatar
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <UserCircle className="text-white" size={32} />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary/80 text-white rounded-full p-1 cursor-pointer transition-colors"
                title="Change profile photo"
              >
                {selectedFile ? <Check size={12} /> : <Upload size={12} />}
              </label>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                {userTier && (userTier as any).currentTier && getTierIcon((userTier as any).currentTier)}
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
              <div className="text-2xl font-bold text-yellow-400 dark:text-yellow-300">{user.balance?.toLocaleString() || "0"}</div>
              <div className="text-sm text-yellow-200 dark:text-yellow-200">NTIQ Balance</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{user.totalPredictions?.toLocaleString() || "0"}</div>
              <div className="text-sm text-slate-400">Total Predictions</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{user.correctPredictions && user.totalPredictions ? `${((user.correctPredictions / user.totalPredictions) * 100).toFixed(1)}%` : '0%'}</div>
              <div className="text-sm text-slate-400">Accuracy Rate</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{user.totalRewards?.toLocaleString() || "0"}</div>
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
            <span className="text-slate-300">Linked Email</span>
            <div className="flex items-center space-x-2">
              {user.email ? (
                <>
                  <span className="text-white font-medium">{user.email}</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    Verified
                  </Badge>
                </>
              ) : (
                <>
                  <span className="text-slate-400">Not linked</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEmailDialog(true)}
                    className="ml-2 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
                  >
                    Link Email
                  </Button>
                </>
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

      {/* Email Verification Dialog */}
      {showEmailDialog && user && (
        <WalletEmailVerification 
          walletAddress={user.walletAddress || ''}
          onSuccess={() => {
            setShowEmailDialog(false);
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          }}
          onCancel={() => setShowEmailDialog(false)}
        />
      )}
    </div>
  );
}