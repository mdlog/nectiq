import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Users, TrendingUp, Award, Activity, BarChart3, Settings, Lock, Plus, Database, Calendar, DollarSign, Zap, Trophy, Megaphone, Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalRewards: number;
  activeUsers: number;
  accuracyAverage: number;
  totalStaked: number;
}

interface User {
  id: number;
  username: string;
  walletAddress: string | null;
  balance: number;
  isAdmin: boolean;
  authMethod: string;
  totalPredictions: number;
  correctPredictions: number;
  totalRewards: number;
}

interface Prediction {
  id: number;
  userId: number;
  cryptoId: string;
  predictedPrice: number;
  actualPrice: number | null;
  timeframe: string;
  stakeAmount: number;
  status: string;
  accuracy: number | null;
  reward: number | null;
  createdAt: string;
}

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  image: string;
  pythFeedId: string | null;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("statistics");

  // Queries
  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 30000,
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/predictions"],
    refetchInterval: 30000,
  });

  const { data: cryptocurrencies, isLoading: cryptoLoading } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/admin/cryptocurrencies"],
    refetchInterval: 30000,
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Nectiq Admin Panel
          </h1>
          <p className="text-slate-400 mt-2">Comprehensive platform management dashboard</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="statistics" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-green-600">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="cryptocurrencies" className="data-[state=active]:bg-yellow-600">
              <Database className="h-4 w-4 mr-2" />
              Crypto
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-orange-600">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-red-600">
              <DollarSign className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-pink-600">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-indigo-600">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-violet-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-400">Total Users</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "Loading..." : (adminStats?.totalUsers || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-400">Total Predictions</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "Loading..." : (adminStats?.totalPredictions || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-yellow-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-400">Total Rewards</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "Loading..." : `${adminStats?.totalRewards || 0} NTIQ`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-purple-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-400">Active Users</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "Loading..." : (adminStats?.activeUsers || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Overview */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 text-blue-400" size={20} />
                  Platform Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {statsLoading ? "Loading..." : `${((adminStats?.accuracyAverage || 0) * 100).toFixed(1)}%`}
                    </div>
                    <div className="text-sm text-slate-400">Average Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {statsLoading ? "Loading..." : (adminStats?.totalStaked || 0)}
                    </div>
                    <div className="text-sm text-slate-400">Total Staked (NTIQ)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {usersLoading ? "Loading..." : (usersData?.length || 0)}
                    </div>
                    <div className="text-sm text-slate-400">Registered Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2" size={20} />
                    User Management ({usersData?.length || 0})
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2" size={16} />
                    Add New User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading users...</div>
                  </div>
                ) : usersData && usersData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Predictions</TableHead>
                        <TableHead>Rewards</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'N/A'}
                          </TableCell>
                          <TableCell>{user.balance} NTIQ</TableCell>
                          <TableCell>
                            <Badge variant={user.isAdmin ? "default" : "secondary"}>
                              {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.totalPredictions}</TableCell>
                          <TableCell>{user.totalRewards} NTIQ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Users Found</h3>
                    <p className="text-slate-400">Add your first user to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cryptocurrencies Tab */}
          <TabsContent value="cryptocurrencies" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="mr-2" size={20} />
                    Cryptocurrency Management ({cryptocurrencies?.length || 0})
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2" size={16} />
                    Add New Cryptocurrency
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cryptoLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading cryptocurrencies...</div>
                  </div>
                ) : cryptocurrencies && cryptocurrencies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cryptocurrencies.map((crypto) => (
                      <Card key={crypto.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={crypto.image} 
                              alt={crypto.name}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="%23666"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8">${crypto.symbol}</text></svg>`;
                              }}
                            />
                            <div>
                              <h3 className="font-semibold text-white">{crypto.name}</h3>
                              <p className="text-sm text-slate-400">{crypto.symbol}</p>
                              <p className="text-xs text-slate-500">
                                {crypto.pythFeedId ? "Pyth Network" : "No Feed"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Cryptocurrencies</h3>
                    <p className="text-slate-400">Add your first cryptocurrency to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  All Predictions ({predictions?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictionsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading predictions...</div>
                  </div>
                ) : predictions && predictions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Crypto</TableHead>
                        <TableHead>Predicted Price</TableHead>
                        <TableHead>Actual Price</TableHead>
                        <TableHead>Timeframe</TableHead>
                        <TableHead>Stake</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reward</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.slice(0, 10).map((prediction) => (
                        <TableRow key={prediction.id}>
                          <TableCell>{prediction.userId}</TableCell>
                          <TableCell className="font-mono">{prediction.cryptoId}</TableCell>
                          <TableCell>${prediction.predictedPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            {prediction.actualPrice ? `$${prediction.actualPrice.toLocaleString()}` : 'Pending'}
                          </TableCell>
                          <TableCell>{prediction.timeframe}</TableCell>
                          <TableCell>{prediction.stakeAmount} NTIQ</TableCell>
                          <TableCell>
                            <Badge variant={
                              prediction.status === 'completed' ? 'default' : 
                              prediction.status === 'active' ? 'secondary' : 'outline'
                            }>
                              {prediction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {prediction.reward ? `${prediction.reward} NTIQ` : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Predictions</h3>
                    <p className="text-slate-400">Predictions will appear here when users start making them</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="mr-2" size={20} />
                    Platform Leaderboard
                  </div>
                  <Button variant="outline">
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading leaderboard...</div>
                  </div>
                ) : leaderboardData && (leaderboardData as any).users && (leaderboardData as any).users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Total Rewards</TableHead>
                        <TableHead>Predictions</TableHead>
                        <TableHead>Streak</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {((leaderboardData as any).users || []).slice(0, 10).map((user: any, index: number) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {index === 0 && "🥇"}
                              {index === 1 && "🥈"}
                              {index === 2 && "🥉"}
                              {index > 2 && `#${index + 1}`}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.accuracy >= 90 ? "default" : user.accuracy >= 80 ? "secondary" : "outline"}>
                              {user.accuracy ? `${user.accuracy.toFixed(1)}%` : '0%'}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.totalRewards || 0} NTIQ</TableCell>
                          <TableCell>{user.totalPredictions || 0}</TableCell>
                          <TableCell>
                            {user.currentStreak >= 5 ? "🔥" : user.accuracy >= 90 ? "⭐" : ""} 
                            {user.currentStreak || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Leaderboard Data</h3>
                    <p className="text-slate-400">Leaderboard will populate as users make predictions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder tabs for other sections */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2" size={20} />
                  Transaction Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">Transaction Management</h3>
                  <p className="text-slate-400">Monitor deposits, withdrawals, and NTIQ transactions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2" size={20} />
                  Security Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">Security Dashboard</h3>
                  <p className="text-slate-400">Monitor login attempts, admin actions, and security events</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Event Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">Event Management</h3>
                  <p className="text-slate-400">Create and manage platform events and announcements</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2" size={20} />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">Platform Configuration</h3>
                  <p className="text-slate-400">Configure platform settings and parameters</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}