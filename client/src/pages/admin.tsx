import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Award, Activity, BarChart3, Eye, Settings, Lock, AlertTriangle } from "lucide-react";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { User, Prediction, Reward } from "@shared/schema";
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