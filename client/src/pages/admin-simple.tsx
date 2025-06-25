import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Users, TrendingUp, Award, Activity, Eye, Settings, Trash2, Download } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { SimpleAdminAuth } from "@/components/simple-admin-auth";
import { useAdminWebSocket } from "@/hooks/useAdminWebSocket";

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalRewards: number;
  activeUsers: number;
  accuracyAverage: number;
  totalStaked: number;
}

export default function AdminPanelSimple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  // Real-time WebSocket connection
  const { isConnected: wsConnected } = useAdminWebSocket();

  // Data queries
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  // Clear all users mutation
  const clearAllUsersMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/clear-all-users", {
        method: "POST"
      });
    },
    onSuccess: () => {
      toast({
        title: "Database Cleared",
        description: "All users and related data have been permanently removed",
        variant: "destructive",
        duration: 10000
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedUsers([]);
    },
    onError: (error) => {
      toast({
        title: "Clear Database Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete single user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleClearAllUsers = () => {
    const confirmed = window.confirm(
      "⚠️ CRITICAL WARNING ⚠️\n\n" +
      "This will PERMANENTLY DELETE ALL USERS from the database, including:\n" +
      "• All user accounts (including admin accounts)\n" +
      "• All predictions and rewards\n" +
      "• All purchase and withdrawal history\n" +
      "• All security logs and transaction data\n" +
      "• All banners and system data\n\n" +
      "This action CANNOT be undone!\n\n" +
      "Are you absolutely sure you want to proceed?"
    );
    
    if (confirmed) {
      const finalConfirmation = window.prompt("Type 'DELETE ALL' to confirm (case sensitive):");
      if (finalConfirmation === "DELETE ALL") {
        clearAllUsersMutation.mutate();
      } else {
        toast({
          title: "Operation Cancelled",
          description: "Database clear operation was cancelled - incorrect confirmation text",
          variant: "default"
        });
      }
    }
  };

  const handleExportUsers = () => {
    const csvContent = [
      ["ID", "Username", "UID", "Wallet Address", "Balance", "Total Predictions", "Correct Predictions", "Accuracy", "Total Rewards"].join(","),
      ...users.map(user => [
        user.id,
        user.username,
        user.uid,
        user.walletAddress || "No wallet",
        user.balance,
        user.totalPredictions,
        user.correctPredictions,
        user.totalPredictions > 0 ? ((user.correctPredictions / user.totalPredictions) * 100).toFixed(1) + "%" : "N/A",
        user.totalRewards
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <SimpleAdminAuth>
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
              <Button variant="outline" className="bg-surface-light border-surface-light" onClick={() => setLocation('/')}>
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
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-slate-500">
                    {wsConnected ? 'Real-time ON' : 'Real-time OFF'}
                  </span>
                </div>
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
                <div className="text-2xl font-bold">{stats?.totalRewards || 0} NTIQ</div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-surface-light">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-surface-light">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Avg Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.accuracyAverage?.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-surface-light">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total Staked</CardTitle>
                <Award className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalStaked || 0} NTIQ</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-surface border border-surface-light">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users size={16} />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center space-x-2">
                <Settings size={16} />
                <span>System Info</span>
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center">
                        <Users className="mr-2" size={20} />
                        User Management ({users.length})
                      </span>
                      
                      {/* Clear All Users - Dangerous Operation */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearAllUsers}
                        disabled={clearAllUsersMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 border-red-600"
                      >
                        <Trash2 className="mr-2" size={16} />
                        {clearAllUsersMutation.isPending ? "Clearing..." : "Clear ALL Users"}
                      </Button>
                      
                      {/* Export Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportUsers}
                        className="ml-auto"
                      >
                        <Download className="mr-2" size={16} />
                        Export CSV
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-sm font-semibold text-foreground">No users found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The database is empty. Users will appear here after registration.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {users.length} user(s)
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Wallet</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Predictions</TableHead>
                            <TableHead>Accuracy</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{user.username}</div>
                                  <div className="text-sm text-muted-foreground">UID: {user.uid}</div>
                                  {user.isAdmin && (
                                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.walletAddress ? (
                                  <code className="text-xs">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</code>
                                ) : (
                                  <span className="text-muted-foreground">No wallet</span>
                                )}
                              </TableCell>
                              <TableCell>{user.balance.toLocaleString()} NTIQ</TableCell>
                              <TableCell>{user.totalPredictions}</TableCell>
                              <TableCell>
                                {user.totalPredictions > 0 
                                  ? `${((user.correctPredictions / user.totalPredictions) * 100).toFixed(1)}%`
                                  : 'N/A'
                                }
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  disabled={deleteUserMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Info Tab */}
            <TabsContent value="info">
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">WebSocket Status</h4>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={wsConnected ? 'text-green-600' : 'text-red-600'}>
                            {wsConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">Database Status</h4>
                        <span className="text-green-600">Connected</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Available Actions</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• View and manage users</li>
                        <li>• Delete individual users</li>
                        <li>• Clear entire database (with confirmation)</li>
                        <li>• Export user data as CSV</li>
                        <li>• Real-time monitoring via WebSocket</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SimpleAdminAuth>
  );
}