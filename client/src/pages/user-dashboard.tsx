import { useQuery } from "@tanstack/react-query";
import { BarChart3, Target, Trophy, Gift, TrendingUp, Clock, Coins, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { User } from "@shared/schema";
import type { UserStats, ActivePrediction, RecentReward, CryptoPrice } from "@/types";

export default function UserDashboard() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

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

  const { data: prices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 30000,
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-surface border-b border-surface-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span className="text-xs text-slate-400">PTS</span>
              </div>
              {getRankBadge(stats?.rank)}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              My Predictions
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-primary">
              Reward History
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-primary">
              Market Watch
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-primary">
              Performance
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
                              <p className="text-xs text-slate-400">Stake: {prediction.stakeAmount} PTS</p>
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
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prices.map((crypto) => {
                    const isPositive = crypto.price_change_percentage_24h >= 0;
                    
                    return (
                      <div key={crypto.id} className="p-4 bg-surface-light rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${getCryptoColor(crypto.id)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                              {getCryptoIcon(crypto.id)}
                            </div>
                            <div>
                              <p className="font-semibold">{crypto.symbol}</p>
                              <p className="text-xs text-slate-400">{crypto.name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">${crypto.current_price.toLocaleString()}</p>
                          <p className={`text-sm ${isPositive ? "text-success" : "text-error"}`}>
                            {isPositive ? "+" : ""}{crypto.price_change_percentage_24h.toFixed(2)}% (24h)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
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
        </Tabs>
      </main>
    </div>
  );
}