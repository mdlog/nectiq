import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Home, Users, DollarSign, Activity } from "lucide-react";

export default function AdminSimpleTest() {
  const [activeTab, setActiveTab] = useState("statistics");

  // Basic queries with minimal configuration
  const { data: adminStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: 1,
  });

  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ["/api/admin/transactions"],
    retry: 1,
  });

  console.log('🔍 [SIMPLE-ADMIN] Stats:', { adminStats, statsLoading, statsError });
  console.log('🔍 [SIMPLE-ADMIN] Transactions:', { transactionsData, transactionsLoading, transactionsError });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Simple Header */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Shield className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Admin Panel (Test)</h1>
        </div>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Simple Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 mb-6">
          <TabsTrigger value="statistics" className="data-[state=active]:bg-blue-600">
            <Activity className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-600">
            <DollarSign className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold">
                      {statsLoading ? "Loading..." : (adminStats as any)?.totalUsers || 0}
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
                    <p className="text-slate-400 text-sm">Total Predictions</p>
                    <p className="text-2xl font-bold">
                      {statsLoading ? "Loading..." : (adminStats as any)?.totalPredictions || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Rewards</p>
                    <p className="text-2xl font-bold">
                      {statsLoading ? "Loading..." : (adminStats as any)?.totalRewards || 0}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {statsError && (
            <Card className="bg-red-900/50 border-red-700 mb-6">
              <CardContent className="p-4">
                <p className="text-red-300">
                  Error loading stats: {statsError.message || 'Unknown error'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2" size={20} />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Loading transactions...</p>
                </div>
              ) : transactionsError ? (
                <div className="text-center py-8">
                  <p className="text-red-400 mb-2">Error loading transactions</p>
                  <p className="text-slate-400 text-sm">
                    {transactionsError.message || 'Unknown error'}
                  </p>
                </div>
              ) : transactionsData && Array.isArray(transactionsData) && transactionsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.slice(0, 10).map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>{transaction.username || transaction.userId}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('id-ID').format(transaction.ntiqAmount || transaction.amount)} NTIQ
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.status === 'completed' ? 'bg-green-900 text-green-300' :
                            transaction.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {transaction.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt || transaction.timestamp).toLocaleDateString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}