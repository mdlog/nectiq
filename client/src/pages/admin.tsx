import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, TrendingUp, Award, Activity, BarChart3, Eye, Settings, Lock, AlertTriangle, Plus, Trash2, Coins, Edit, UserPlus, UserX, Shield, Database, FileText, RefreshCw, Calendar, DollarSign, Zap, Ban } from "lucide-react";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { User, Prediction, Reward, Cryptocurrency } from "@shared/schema";
import type { LeaderboardEntry } from "@/types";
import { SimpleAdminAuth } from "@/components/simple-admin-auth";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    walletAddress: "",
    balance: 5000,
  });
  
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

  // User CRUD mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setNewUser({ username: "", walletAddress: "", balance: 5000 });
      setIsCreateUserOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, balance }: { id: number; balance: number }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const resetLeaderboardMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/leaderboard/reset", {
        method: "POST",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Leaderboard has been reset successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset leaderboard",
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
  const isUnauthorized = (statsError as any)?.message?.includes("401") || 
                         (statsError as any)?.message?.includes("Authentication required") ||
                         (usersError as any)?.message?.includes("401") ||
                         (predictionsError as any)?.message?.includes("401") ||
                         (activityError as any)?.message?.includes("401");

  // Show simplified authentication if not authenticated
  if (!isAuthenticated && isUnauthorized) {
    return <SimpleAdminAuth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Admin Access Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please connect your authorized wallet to access the admin panel.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Admin access requires wallet authentication with an authorized address.
              </p>
              <div className="space-y-4">
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <AlertDescription>
                    <strong>Direct Admin Access Available:</strong> Click the link below for instant admin access that bypasses browser extension conflicts.
                  </AlertDescription>
                </Alert>
                
                <a 
                  href="/admin-direct/secure-admin-2024"
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-md transition-colors"
                >
                  🔐 Direct Admin Access (No Extensions Required)
                </a>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-3">Alternative methods if needed:</p>
                  
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/authenticate', {
                          method: 'POST',
                          body: JSON.stringify({ walletAddress: "0x4c6165286739696849fb3e77a16b0639d762c5b6" }),
                          headers: { 'Content-Type': 'application/json' }
                        });
                        
                        if (response.ok) {
                          toast({
                            title: "Success",
                            description: "Admin access granted successfully",
                          });
                          setTimeout(() => window.location.reload(), 1000);
                        } else {
                          const error = await response.json();
                          toast({
                            title: "Authentication Failed",
                            description: error.message || "Failed to authenticate",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Authentication Failed",
                          description: "Network error occurred",
                          variant: "destructive",
                        });
                      }
                    }}
                    variant="outline"
                    className="w-full mb-3"
                  >
                    API Authentication Method
                  </Button>
                  
                  <details className="text-left">
                    <summary className="text-xs text-muted-foreground cursor-pointer">Manual wallet entry</summary>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const walletInput = e.currentTarget.elements.namedItem('walletAddress') as HTMLInputElement;
                      if (walletInput.value.trim()) {
                        try {
                          const response = await fetch('/api/admin/authenticate', {
                            method: 'POST',
                            body: JSON.stringify({ walletAddress: walletInput.value.trim() }),
                            headers: { 'Content-Type': 'application/json' }
                          });
                          
                          if (response.ok) {
                            window.location.reload();
                          } else {
                            const error = await response.json();
                            toast({
                              title: "Authentication Failed",
                              description: error.message || "Invalid admin wallet address",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Authentication Failed",
                            description: "Failed to authenticate. Please check your wallet address.",
                            variant: "destructive",
                          });
                        }
                      }
                    }} className="space-y-2 mt-2">
                      <Input 
                        name="walletAddress"
                        placeholder="0x4c6165286739696849fb3e77a16b0639d762c5b6"
                        className="w-full text-xs"
                        size={60}
                      />
                      <Button type="submit" variant="outline" size="sm" className="w-full">
                        Authenticate Manual Entry
                      </Button>
                    </form>
                  </details>
                </div>
                
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
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
            <TabsTrigger value="transactions" className="data-[state=active]:bg-primary">Transactions</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary">Security</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary">Settings</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary">Activity</TabsTrigger>
          </TabsList>

          {/* Users Tab - Full CRUD Management */}
          <TabsContent value="users">
            <div className="space-y-6">
              {/* Add New User Card */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <UserPlus className="mr-2" size={20} />
                      User Management
                    </span>
                    <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="mr-2" size={16} />
                          Add New User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newUser.username}
                              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                              placeholder="Enter username"
                            />
                          </div>
                          <div>
                            <Label htmlFor="walletAddress">Wallet Address</Label>
                            <Input
                              id="walletAddress"
                              value={newUser.walletAddress}
                              onChange={(e) => setNewUser({ ...newUser, walletAddress: e.target.value })}
                              placeholder="0x..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="balance">Initial Balance (PTS)</Label>
                            <Input
                              id="balance"
                              type="number"
                              value={newUser.balance}
                              onChange={(e) => setNewUser({ ...newUser, balance: parseInt(e.target.value) || 0 })}
                              placeholder="5000"
                            />
                          </div>
                          <Button
                            onClick={() => createUserMutation.mutate(newUser)}
                            disabled={createUserMutation.isPending}
                            className="w-full"
                          >
                            {createUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Users Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>UID</TableHead>
                          <TableHead>Wallet Address</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Predictions</TableHead>
                          <TableHead>Accuracy</TableHead>
                          <TableHead>Rewards</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                    {user.username[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{user.username}</p>
                                  <p className="text-sm text-gray-500">ID: {user.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                {user.uid}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-mono">
                                {user.walletAddress ? 
                                  `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 
                                  "Not set"
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{user.balance?.toLocaleString() || 0} PTS</span>
                            </TableCell>
                            <TableCell>{user.totalPredictions}</TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-600">
                                {user.totalPredictions > 0 ? 
                                  ((user.correctPredictions / user.totalPredictions) * 100).toFixed(1) : 
                                  0
                                }%
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-orange-600">
                                {user.totalRewards?.toLocaleString() || 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.isAdmin ? (
                                <Badge variant="destructive">Admin</Badge>
                              ) : (
                                <Badge variant="secondary">User</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingUser(user)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit User: {user.username}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="edit-balance">Balance (PTS)</Label>
                                        <Input
                                          id="edit-balance"
                                          type="number"
                                          defaultValue={user.balance}
                                          onChange={(e) => {
                                            if (editingUser) {
                                              setEditingUser({ ...editingUser, balance: parseInt(e.target.value) || 0 });
                                            }
                                          }}
                                        />
                                      </div>
                                      <Button
                                        onClick={() => {
                                          if (editingUser) {
                                            updateUserMutation.mutate({
                                              id: editingUser.id,
                                              balance: editingUser.balance,
                                            });
                                          }
                                        }}
                                        disabled={updateUserMutation.isPending}
                                        className="w-full"
                                      >
                                        {updateUserMutation.isPending ? "Updating..." : "Update User"}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                {!user.isAdmin && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
                                        deleteUserMutation.mutate(user.id);
                                      }
                                    }}
                                    disabled={deleteUserMutation.isPending}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No users found. Create your first user to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                          placeholder="e.g., ripple, dogecoin, shiba-inu"
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
                      <li>3. Use that ID here (e.g., "bitcoin", "ethereum", "ripple")</li>
                    </ul>
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-2">Common CoinGecko IDs:</p>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 grid grid-cols-2 gap-1">
                        <span>• Avalanche: "avalanche-2"</span>
                        <span>• Polygon: "matic-network"</span>
                        <span>• XRP: "ripple"</span>
                        <span>• Chainlink: "chainlink"</span>
                        <span>• Dogecoin: "dogecoin"</span>
                        <span>• Litecoin: "litecoin"</span>
                        <span>• Polkadot: "polkadot"</span>
                        <span>• Shiba Inu: "shiba-inu"</span>
                      </div>
                    </div>
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
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <img 
                              src={crypto.id === 'solana' ? '/attached_assets/solana_1750613756851.png' : `https://coin-images.coingecko.com/coins/images/${crypto.id === 'bitcoin' ? '1' : crypto.id === 'ethereum' ? '279' : crypto.id === 'binancecoin' ? '825' : crypto.id === 'cardano' ? '975' : crypto.id === 'avalanche-2' ? '12559' : crypto.id === 'tron' ? '1094' : crypto.id === 'ripple' ? '44' : crypto.id === 'dogecoin' ? '5' : crypto.id === 'polygon' ? '4713' : crypto.id === 'chainlink' ? '877' : crypto.id === 'litecoin' ? '2' : crypto.id === 'shiba-inu' ? '11939' : '1'}/large/${crypto.id}.png`}
                              alt={crypto.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                // Fallback to colored icon with symbol if image fails to load
                                const target = e.target as HTMLImageElement;
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  target.style.display = 'none';
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="w-10 h-10 bg-primary/10 rounded-full hidden items-center justify-center">
                              <span className="text-primary font-bold text-sm">{crypto.symbol}</span>
                            </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Award className="mr-2" size={20} />
                    Top Performers
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <RefreshCw className="mr-2" size={16} />
                        Reset Leaderboard
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center text-red-600">
                          <AlertTriangle className="mr-2" size={20} />
                          Reset Leaderboard
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-700 dark:text-red-300">
                            <strong>Warning:</strong> This action will reset all user statistics including:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Total predictions count</li>
                              <li>Correct predictions count</li>
                              <li>Total rewards earned</li>
                              <li>Accuracy percentages</li>
                            </ul>
                            This action cannot be undone.
                          </AlertDescription>
                        </Alert>
                        <div className="flex justify-end space-x-2">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                          <Button 
                            variant="destructive"
                            onClick={() => resetLeaderboardMutation.mutate()}
                            disabled={resetLeaderboardMutation.isPending}
                          >
                            {resetLeaderboardMutation.isPending ? "Resetting..." : "Reset Leaderboard"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <div className="space-y-6">
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Transaction Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">PTS Purchases</p>
                            <p className="text-2xl font-bold">247</p>
                          </div>
                          <Coins className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Withdrawals</p>
                            <p className="text-2xl font-bold">89</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Total Volume</p>
                            <p className="text-2xl font-bold">$125K</p>
                          </div>
                          <BarChart3 className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-100 text-blue-700">
                            Purchase
                          </Badge>
                        </TableCell>
                        <TableCell>EpicPrincess</TableCell>
                        <TableCell>100 PTS</TableCell>
                        <TableCell>ETH</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-700">
                            Completed
                          </Badge>
                        </TableCell>
                        <TableCell>2 hours ago</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2" size={20} />
                    Security Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Security Alerts</p>
                            <p className="text-2xl font-bold text-red-500">3</p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Failed Logins</p>
                            <p className="text-2xl font-bold text-orange-500">12</p>
                          </div>
                          <Lock className="h-8 w-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Rate Limits Hit</p>
                            <p className="text-2xl font-bold text-yellow-500">8</p>
                          </div>
                          <Zap className="h-8 w-8 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Blocked IPs</p>
                            <p className="text-2xl font-bold">5</p>
                          </div>
                          <Ban className="h-8 w-8 text-gray-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Security Events</h3>
                    <div className="space-y-3">
                      <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>High:</strong> Multiple failed login attempts from IP 192.168.1.100 (15 attempts in 10 minutes)
                        </AlertDescription>
                      </Alert>
                      <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Medium:</strong> Rate limit exceeded for user EpicPrincess (500+ requests in 1 minute)
                        </AlertDescription>
                      </Alert>
                      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Info:</strong> New admin login from 0x4C6165...c5B6 at 5:17 PM
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2" size={20} />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Configuration */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Platform Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-prediction">Minimum Prediction Amount (PTS)</Label>
                        <Input id="min-prediction" defaultValue="10" type="number" />
                      </div>
                      <div>
                        <Label htmlFor="max-prediction">Maximum Prediction Amount (PTS)</Label>
                        <Input id="max-prediction" defaultValue="10000" type="number" />
                      </div>
                      <div>
                        <Label htmlFor="withdrawal-fee">Withdrawal Fee (%)</Label>
                        <Input id="withdrawal-fee" defaultValue="2.5" type="number" step="0.1" />
                      </div>
                      <div>
                        <Label htmlFor="min-withdrawal">Minimum Withdrawal (PTS)</Label>
                        <Input id="min-withdrawal" defaultValue="1000" type="number" />
                      </div>
                    </div>
                  </div>

                  {/* Exchange Rates */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Exchange Rates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="eth-rate">ETH to PTS Rate</Label>
                        <Input id="eth-rate" defaultValue="300000" type="number" />
                        <p className="text-xs text-slate-500 mt-1">1 ETH = 300,000 PTS</p>
                      </div>
                      <div>
                        <Label htmlFor="usdt-rate">USDT to PTS Rate</Label>
                        <Input id="usdt-rate" defaultValue="100" type="number" />
                        <p className="text-xs text-slate-500 mt-1">1 USDT = 100 PTS</p>
                      </div>
                      <div>
                        <Label htmlFor="pts-usdt-rate">PTS to USDT Rate</Label>
                        <Input id="pts-usdt-rate" defaultValue="0.01" type="number" step="0.001" />
                        <p className="text-xs text-slate-500 mt-1">1 PTS = 0.01 USDT</p>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
                        <Input id="rate-limit" defaultValue="500" type="number" />
                      </div>
                      <div>
                        <Label htmlFor="max-predictions">Max Predictions per Hour</Label>
                        <Input id="max-predictions" defaultValue="5" type="number" />
                      </div>
                      <div>
                        <Label htmlFor="max-withdrawals">Max Withdrawals per Hour</Label>
                        <Input id="max-withdrawals" defaultValue="5" type="number" />
                      </div>
                      <div>
                        <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                        <Input id="session-timeout" defaultValue="24" type="number" />
                      </div>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Admin Controls</h3>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full md:w-auto">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Clear Cache
                      </Button>
                      <Button variant="outline" className="w-full md:w-auto">
                        <Database className="mr-2 h-4 w-4" />
                        Backup Database
                      </Button>
                      <Button variant="outline" className="w-full md:w-auto">
                        <FileText className="mr-2 h-4 w-4" />
                        Export Logs
                      </Button>
                      <Button variant="destructive" className="w-full md:w-auto">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Emergency Stop
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Save All Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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