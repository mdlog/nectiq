import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Home, Users, DollarSign, Activity, TrendingUp, Award, BarChart3, ExternalLink, Settings } from "lucide-react";

// Stable admin panel with error handling
export default function AdminStable() {
  const [activeTab, setActiveTab] = useState("statistics");
  const [isLoading, setIsLoading] = useState(true);

  // Simple queries with better error handling
  const { data: adminStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ["/api/admin/transactions"],
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  // Helper functions
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const getExplorerUrl = (hash: string, token?: string): string => {
    const baseUrl = "https://etherscan.io/tx/";
    return `${baseUrl}${hash}`;
  };

  useEffect(() => {
    // Set loading to false after initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Nectiq Admin Panel</h1>
                <p className="text-slate-300 text-sm">Platform Management Dashboard</p>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 mb-6">
            <TabsTrigger value="statistics" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-600">
              <DollarSign className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "..." : (adminStats as any)?.totalUsers || 0}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Predictions</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "..." : (adminStats as any)?.totalPredictions || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Rewards</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "..." : formatAmount((adminStats as any)?.totalRewards || 0)}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Active Users</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "..." : (adminStats as any)?.activeUsers || 0}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Display */}
            {statsError && (
              <Card className="bg-red-900/20 border-red-700">
                <CardContent className="p-4">
                  <p className="text-red-300">Error loading statistics: {(statsError as any)?.message || 'Unknown error'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <DollarSign className="mr-2" size={20} />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-slate-400">Loading transactions...</p>
                  </div>
                ) : transactionsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-400 mb-2">Error loading transactions</p>
                    <p className="text-slate-400 text-sm">{(transactionsError as any)?.message || 'Unknown error'}</p>
                  </div>
                ) : transactionsData && Array.isArray(transactionsData) && transactionsData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">ID</TableHead>
                          <TableHead className="text-slate-300">User</TableHead>
                          <TableHead className="text-slate-300">Type</TableHead>
                          <TableHead className="text-slate-300">Amount NTIQ</TableHead>
                          <TableHead className="text-slate-300">Token Amount</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Hash</TableHead>
                          <TableHead className="text-slate-300">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactionsData.slice(0, 20).map((transaction: any) => (
                          <TableRow key={transaction.id} className="border-slate-700">
                            <TableCell className="text-white">{transaction.id}</TableCell>
                            <TableCell className="font-medium text-white">
                              {transaction.username || `User ${transaction.userId}`}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                transaction.type === 'deposit' ? 'default' :
                                transaction.type === 'withdrawal' ? 'destructive' :
                                'secondary'
                              }>
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-green-400">
                              {formatAmount(transaction.ntiqAmount || transaction.amount || 0)} NTIQ
                            </TableCell>
                            <TableCell className="font-mono text-blue-400">
                              {transaction.tokenAmount || '0'} {transaction.token || 'ETH'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                transaction.status === 'completed' ? 'default' :
                                transaction.status === 'pending' ? 'secondary' :
                                'destructive'
                              }>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {transaction.hash ? (
                                <a 
                                  href={getExplorerUrl(transaction.hash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                                >
                                  {transaction.hash.slice(0, 8)}...
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-slate-500">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-slate-400">
                              {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Transactions</h3>
                    <p className="text-slate-400">Transaction history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">User Management</h3>
                  <p className="text-slate-400">User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">System Settings</h3>
                  <p className="text-slate-400">System configuration options coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}