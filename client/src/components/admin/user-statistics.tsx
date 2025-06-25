import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Activity, 
  Crown, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { UserGrowthChart } from './user-growth-chart';

interface UserStats {
  overview: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    adminUsers: number;
    timeRange: string;
    lastUpdated: string;
  };
  userSegments: {
    newUsers: number;
    activeUsers: number;
    dormantUsers: number;
    adminUsers: number;
    walletUsers: number;
    richUsers: number;
  };
  predictionStats: {
    total: number;
    successful: number;
    successRate: number;
    pending: number;
  };
  financialStats: {
    totalRewards: number;
    avgBalance: number;
    avgRewardPerUser: number;
  };
  growthMetrics: {
    newUsersGrowth: number;
    newUsersChange: number;
  };
  topUsers: Array<{
    userId: number;
    username: string;
    totalPredictions: number;
    avgAccuracy: number;
    totalRewards: number;
  }>;
  trends: {
    registrations: Array<{ date: string; count: number }>;
    activity: Array<{ date: string; count: number }>;
  };
}

export function UserStatistics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery<UserStats>({
    queryKey: ['/api/admin/user-statistics', { range: timeRange }],
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if enabled
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatCurrency = (num: number) => {
    return `${num.toLocaleString()} NTIQ`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Statistik Pengguna</h2>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Gagal memuat statistik pengguna</p>
          <Button onClick={() => refetch()} className="mt-4">
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Statistik Pengguna</h2>
          <p className="text-sm text-muted-foreground">
            Terakhir diperbarui: {new Date(stats.overview.lastUpdated).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Jam</SelectItem>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
              <SelectItem value="all">Semua</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Pengguna</p>
                <p className="text-2xl font-bold">{formatNumber(stats.overview.totalUsers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pengguna Baru</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{formatNumber(stats.overview.newUsers)}</p>
                  {getGrowthIcon(stats.growthMetrics.newUsersGrowth)}
                </div>
                <p className={`text-xs ${getGrowthColor(stats.growthMetrics.newUsersGrowth)}`}>
                  {stats.growthMetrics.newUsersGrowth > 0 ? '+' : ''}{formatPercentage(stats.growthMetrics.newUsersGrowth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pengguna Aktif</p>
                <p className="text-2xl font-bold">{formatNumber(stats.overview.activeUsers)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage((stats.overview.activeUsers / stats.overview.totalUsers) * 100)} dari total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Admin</p>
                <p className="text-2xl font-bold">{formatNumber(stats.overview.adminUsers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Tabs defaultValue="segments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="segments">Segmentasi Pengguna</TabsTrigger>
          <TabsTrigger value="predictions">Statistik Prediksi</TabsTrigger>
          <TabsTrigger value="financial">Statistik Keuangan</TabsTrigger>
          <TabsTrigger value="growth">Grafik Pertumbuhan</TabsTrigger>
          <TabsTrigger value="top-users">Top Pengguna</TabsTrigger>
        </TabsList>

        <TabsContent value="segments">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Segmentasi Berdasarkan Aktivitas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pengguna Aktif</span>
                  <Badge variant="default">{formatNumber(stats.userSegments.activeUsers)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pengguna Tidak Aktif</span>
                  <Badge variant="secondary">{formatNumber(stats.userSegments.dormantUsers)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pengguna Baru</span>
                  <Badge variant="outline">{formatNumber(stats.userSegments.newUsers)}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Segmentasi Berdasarkan Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Terhubung Wallet</span>
                  <Badge variant="default">{formatNumber(stats.userSegments.walletUsers)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tanpa Wallet</span>
                  <Badge variant="secondary">
                    {formatNumber(stats.overview.totalUsers - stats.userSegments.walletUsers)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rich Users (&gt;1000 NTIQ)</span>
                  <Badge variant="outline">{formatNumber(stats.userSegments.richUsers)}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Segmentasi Berdasarkan Role
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Admin</span>
                  <Badge variant="default">{formatNumber(stats.userSegments.adminUsers)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pengguna Biasa</span>
                  <Badge variant="secondary">
                    {formatNumber(stats.overview.totalUsers - stats.userSegments.adminUsers)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tingkat Admin</span>
                  <Badge variant="outline">
                    {formatPercentage((stats.userSegments.adminUsers / stats.overview.totalUsers) * 100)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Statistik Prediksi ({timeRange})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Prediksi</span>
                  <Badge variant="default">{formatNumber(stats.predictionStats.total)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prediksi Berhasil</span>
                  <Badge variant="default">{formatNumber(stats.predictionStats.successful)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tingkat Keberhasilan</span>
                  <Badge variant="outline">{formatPercentage(stats.predictionStats.successRate)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prediksi Pending</span>
                  <Badge variant="secondary">{formatNumber(stats.predictionStats.pending)}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Rata-rata Per Pengguna
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prediksi per Pengguna Aktif</span>
                  <Badge variant="outline">
                    {stats.overview.activeUsers > 0 
                      ? (stats.predictionStats.total / stats.overview.activeUsers).toFixed(1)
                      : '0'
                    }
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tingkat Keterlibatan</span>
                  <Badge variant="outline">
                    {formatPercentage((stats.overview.activeUsers / stats.overview.totalUsers) * 100)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Reward Dibayar</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.financialStats.totalRewards)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Rata-rata Saldo Pengguna</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.financialStats.avgBalance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Rata-rata Reward per Pengguna</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.financialStats.avgRewardPerUser)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <UserGrowthChart />
        </TabsContent>

        <TabsContent value="top-users">
          <Card>
            <CardHeader>
              <CardTitle>Top Pengguna Berdasarkan Akurasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topUsers.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(user.totalPredictions)} prediksi
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPercentage(user.avgAccuracy)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(user.totalRewards)} earned
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}