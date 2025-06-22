import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, TrendingUp, Award, Activity, BarChart3, Eye, Settings, Lock, AlertTriangle, Plus, Trash2, Coins } from "lucide-react";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { User, Prediction, Reward, Cryptocurrency } from "@shared/schema";
import type { LeaderboardEntry } from "@/types";

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalRewards: number;
  activeUsers: number;
  accuracyAverage: number;
  totalStaked: number;
}

export default function AdminPanel() {
  const [newCryptoId, setNewCryptoId] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, error: statsError, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: users = [], error: usersError } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: predictions = [], error: predictionsError } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/predictions"],
    retry: false,
  });

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: recentActivity = [], error: activityError } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/activity"],
    retry: false,
  });

  const { data: cryptocurrencies = [] } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/admin/cryptocurrencies"],
    retry: false,
  });

  const addCryptoMutation = useMutation({
    mutationFn: async (cryptoId: string) => {
      const response = await fetch("/api/admin/cryptocurrencies", {
        method: "POST",
        body: JSON.stringify({ cryptoId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add cryptocurrency");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cryptocurrency added successfully from CoinGecko",
      });
      setNewCryptoId("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cryptocurrencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/prices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add cryptocurrency",
        variant: "destructive",
      });
    },
  });

  const deleteCryptoMutation = useMutation({
    mutationFn: async (cryptoId: string) => {
      const response = await fetch(`/api/admin/cryptocurrencies/${cryptoId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cryptocurrency deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cryptocurrencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/prices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete cryptocurrency",
        variant: "destructive",
      });
    },
  });

  const handleAddCrypto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCryptoId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a CoinGecko cryptocurrency ID",
        variant: "destructive",
      });
      return;
    }
    addCryptoMutation.mutate(newCryptoId.trim().toLowerCase());
  };

  // Check if user lacks admin permissions
  const isUnauthorized = (statsError as any)?.message?.includes("403") || 
                         (statsError as any)?.message?.includes("Admin access required") ||
                         (usersError as any)?.message?.includes("403") ||
                         (predictionsError as any)?.message?.includes("403") ||
                         (activityError as any)?.message?.includes("403");

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">
                Akses Ditolak
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Hanya pengguna dengan wallet tertentu yang dapat mengakses panel admin.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Silakan hubungi administrator untuk mendapatkan akses ke panel admin.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Kembali ke Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Active</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-surface border-b border-surface-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Settings className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold">Admin Panel - CryptoPredikt</h1>
            </div>
            <Button variant="outline" className="bg-surface-light border-surface-light" onClick={() => window.location.href = '/'}>
              <Eye className="mr-2" size={16} />
              Back to App
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Predictions</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPredictions || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Rewards</CardTitle>
              <Award className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRewards?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Avg Accuracy</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.accuracyAverage?.toFixed(1) || 0}%</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Staked</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStaked?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Views */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-surface border border-surface-light">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary">Users</TabsTrigger>
            <TabsTrigger value="cryptocurrencies" className="data-[state=active]:bg-primary">Cryptocurrencies</TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-primary">Predictions</TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary">Leaderboard</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary">Recent Activity</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2" size={20} />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{user.username[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-slate-400">ID: {user.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Balance</p>
                          <p className="font-semibold">{user.balance.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Predictions</p>
                          <p className="font-semibold">{user.totalPredictions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Accuracy</p>
                          <p className="font-semibold text-success">
                            {user.totalPredictions > 0 ? ((user.correctPredictions / user.totalPredictions) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Rewards</p>
                          <p className="font-semibold text-warning">{user.totalRewards.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cryptocurrencies Tab */}
          <TabsContent value="cryptocurrencies">
            <div className="space-y-6">
              {/* Add New Cryptocurrency Form */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2" size={20} />
                    Add New Cryptocurrency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCrypto} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="crypto-id">CoinGecko ID</Label>
                        <Input
                          id="crypto-id"
                          placeholder="e.g., dogecoin, shiba-inu, pepe"
                          value={newCryptoId}
                          onChange={(e) => setNewCryptoId(e.target.value)}
                          required
                        />
                        <p className="text-sm text-slate-400">
                          Enter the CoinGecko ID of the cryptocurrency. All other data will be fetched automatically.
                        </p>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={addCryptoMutation.isPending}
                        >
                          {addCryptoMutation.isPending ? "Adding..." : "Add from CoinGecko"}
                        </Button>
                      </div>
                    </div>
                  </form>
                  
                  {/* Help Section */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to find CoinGecko ID:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>1. Go to coingecko.com and search for your cryptocurrency</li>
                      <li>2. Look at the URL: coingecko.com/en/coins/<strong>cryptocurrency-id</strong></li>
                      <li>3. Use that ID here (e.g., "bitcoin", "ethereum", "dogecoin")</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Cryptocurrencies List */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="mr-2" size={20} />
                    Manage Cryptocurrencies ({cryptocurrencies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cryptocurrencies.map((crypto) => (
                      <div key={crypto.id} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">{crypto.symbol}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{crypto.name}</p>
                            <p className="text-sm text-slate-400">ID: {crypto.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm text-slate-400">Current Price</p>
                            <p className="font-semibold">${crypto.currentPrice?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-slate-400">24h Change</p>
                            <p className={`font-semibold ${
                              Number(crypto.priceChange24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {crypto.priceChange24h ? `${Number(crypto.priceChange24h).toFixed(2)}%` : 'N/A'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-slate-400">Last Updated</p>
                            <p className="text-sm">
                              {crypto.lastUpdated ? new Date(crypto.lastUpdated).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCryptoMutation.mutate(crypto.id)}
                            disabled={deleteCryptoMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {cryptocurrencies.length === 0 && (
                      <div className="text-center py-12">
                        <Coins className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Cryptocurrencies</h3>
                        <p className="text-slate-400">Add your first cryptocurrency to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  All Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.map((prediction) => (
                    <div key={prediction.id} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-400">ID</p>
                          <p className="font-semibold">#{prediction.id}</p>
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{prediction.cryptocurrency}</p>
                          <p className="text-sm text-slate-400">User ID: {prediction.userId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Predicted</p>
                          <p className="font-semibold">${parseFloat(prediction.predictedPrice).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Actual</p>
                          <p className="font-semibold">
                            {prediction.actualPrice ? `$${parseFloat(prediction.actualPrice).toLocaleString()}` : "Pending"}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Stake</p>
                          <p className="font-semibold">{prediction.stakeAmount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Timeframe</p>
                          <p className="font-semibold">{prediction.timeframe}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Status</p>
                          {getStatusBadge(prediction.status)}
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Created</p>
                          <p className="font-semibold text-xs">{formatTimeAgo(prediction.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2" size={20} />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => {
                    const rank = index + 1;
                    const getRankColor = () => {
                      switch (rank) {
                        case 1: return "bg-warning text-dark";
                        case 2: return "bg-slate-400 text-dark";
                        case 3: return "bg-amber-600 text-white";
                        default: return "bg-surface-light text-slate-300";
                      }
                    };

                    return (
                      <div key={user.id} className="flex items-center space-x-4 p-4 bg-surface-light rounded-lg">
                        <div className={`flex items-center justify-center w-10 h-10 ${getRankColor()} font-bold rounded-full`}>
                          {rank <= 3 ? (rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉") : rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-slate-400">ID: {user.id}</p>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm text-slate-400">Predictions</p>
                            <p className="font-semibold">{user.totalPredictions}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-slate-400">Correct</p>
                            <p className="font-semibold text-success">{user.correctPredictions}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-slate-400">Accuracy</p>
                            <p className="font-semibold text-success">{user.accuracy}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-slate-400">Total Rewards</p>
                            <p className="font-semibold text-warning">{user.totalRewards.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2" size={20} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-semibold">
                            User {activity.userId} made {activity.cryptocurrency} prediction
                          </p>
                          <p className="text-sm text-slate-400">
                            Predicted ${parseFloat(activity.predictedPrice).toLocaleString()} for {activity.timeframe}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(activity.status)}
                        <span className="text-sm text-slate-400">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}