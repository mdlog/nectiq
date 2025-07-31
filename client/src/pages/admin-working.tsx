import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Users, TrendingUp, Award, Activity, BarChart3, Settings, Lock, Plus, Database, Calendar, DollarSign, Zap, Trophy, Megaphone, Swords, Edit, Trash2, Download, Search, Filter, AlertTriangle, Shield, Ban, UserPlus, RefreshCw, Coins, Eye, CheckCircle, XCircle, Clock, AlertCircle, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  
  // State for various admin functions
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", walletAddress: "", isAdmin: false });
  const [newCrypto, setNewCrypto] = useState({ id: "", name: "", symbol: "", image: "", pythFeedId: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTimeframe, setFilterTimeframe] = useState("all");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);
  const [fetchedLogoUrl, setFetchedLogoUrl] = useState("");

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

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
    refetchInterval: 30000,
  });

  const { data: securityEvents, isLoading: securityLoading } = useQuery({
    queryKey: ["/api/admin/security"],
    refetchInterval: 15000,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    refetchInterval: 30000,
  });

  // Mutations for admin actions
  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("/api/admin/users", {
        method: "POST",
        body: userData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Successfully", description: "User added successfully" });
      setShowAddUser(false);
      setNewUser({ username: "", walletAddress: "", isAdmin: false });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to add user",
        variant: "destructive" 
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Successfully", description: "User updated successfully" });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to update user",
        variant: "destructive" 
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Successfully", description: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to delete user",
        variant: "destructive" 
      });
    },
  });

  const addCryptoMutation = useMutation({
    mutationFn: async (cryptoData: any) => {
      console.log('🔧 Sending cryptocurrency data:', cryptoData);
      return apiRequest("/api/admin/cryptocurrencies", {
        method: "POST",
        body: JSON.stringify(cryptoData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cryptocurrencies"] });
      toast({ title: "Successfully", description: "Cryptocurrency added successfully" });
      setShowAddCrypto(false);
      setNewCrypto({ id: "", name: "", symbol: "", image: "", pythFeedId: "" });
      setFetchedLogoUrl("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to add cryptocurrency",
        variant: "destructive" 
      });
    },
  });

  const deleteCryptoMutation = useMutation({
    mutationFn: async (cryptoId: string) => {
      return apiRequest(`/api/admin/cryptocurrencies/${cryptoId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cryptocurrencies"] });
      toast({ title: "Successfully", description: "Cryptocurrency deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to delete cryptocurrency",
        variant: "destructive" 
      });
    },
  });

  // Fetch crypto logo from CoinGecko
  const fetchCryptoLogo = async () => {
    if (!newCrypto.id.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter a Crypto ID first",
        variant: "destructive" 
      });
      return;
    }

    setIsFetchingLogo(true);
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${newCrypto.id.toLowerCase()}`);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.image && data.image.large) {
        setFetchedLogoUrl(data.image.large);
        setNewCrypto(prev => ({
          ...prev,
          image: data.image.large,
          name: data.name || prev.name,
          symbol: data.symbol?.toUpperCase() || prev.symbol
        }));
        
        toast({ 
          title: "Success", 
          description: `Logo fetched successfully for ${data.name}` 
        });
      } else {
        throw new Error("Logo not found in API response");
      }
    } catch (error: any) {
      console.error("Error fetching logo:", error);
      toast({ 
        title: "Failed", 
        description: error.message || "Failed to fetch logo from CoinGecko",
        variant: "destructive" 
      });
    } finally {
      setIsFetchingLogo(false);
    }
  };

  // Filter functions
  const filteredUsers = usersData?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPredictions = predictions?.filter(prediction => {
    if (filterStatus !== "all" && prediction.status !== filterStatus) return false;
    if (filterTimeframe !== "all" && prediction.timeframe !== filterTimeframe) return false;
    return true;
  });

  // Export functions
  const exportUsers = () => {
    if (!usersData) return;
    const csvContent = [
      ["ID", "Username", "Wallet Address", "Balance", "Admin", "Total Predictions", "Total Rewards"].join(","),
      ...usersData.map(user => [
        user.id,
        user.username,
        user.walletAddress || "N/A",
        user.balance,
        user.isAdmin ? "Yes" : "No",
        user.totalPredictions,
        user.totalRewards
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Successfully", description: "Users exported successfully" });
  };

  const exportPredictions = () => {
    if (!predictions) return;
    const csvContent = [
      ["ID", "User ID", "Crypto", "Predicted Price", "Actual Price", "Timeframe", "Stake", "Status", "Reward"].join(","),
      ...predictions.map(prediction => [
        prediction.id,
        prediction.userId,
        prediction.cryptoId,
        prediction.predictedPrice,
        prediction.actualPrice || "N/A",
        prediction.timeframe,
        prediction.stakeAmount,
        prediction.status,
        prediction.reward || "N/A"
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "predictions_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Successfully", description: "Predictions exported successfully" });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Nectiq Admin Panel
            </h1>
            <p className="text-slate-400 mt-2">Comprehensive platform management dashboard</p>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-blue-400 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Home
          </Button>
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
                    User Management ({filteredUsers?.length || 0})
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportUsers} variant="outline" size="sm">
                      <Download className="mr-2" size={16} />
                      Export CSV
                    </Button>
                    <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="mr-2" size={16} />
                          Add New User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Add New User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Username</Label>
                            <Input
                              value={newUser.username}
                              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Enter username"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Wallet Address</Label>
                            <Input
                              value={newUser.walletAddress}
                              onChange={(e) => setNewUser({...newUser, walletAddress: e.target.value})}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="0x..."
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newUser.isAdmin}
                              onCheckedChange={(checked) => setNewUser({...newUser, isAdmin: checked})}
                            />
                            <Label className="text-white">Admin privileges</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => addUserMutation.mutate(newUser)}
                              disabled={addUserMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {addUserMutation.isPending ? "Adding..." : "Add User"}
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddUser(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
                
                {/* Search Bar */}
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      placeholder="Search users by username or wallet address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading users...</div>
                  </div>
                ) : filteredUsers && filteredUsers.length > 0 ? (
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
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
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-slate-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-red-400 flex items-center">
                                      <AlertTriangle className="mr-2" size={20} />
                                      Delete User
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Alert className="border-red-600/50 bg-red-950/20">
                                      <AlertTriangle className="h-4 w-4 text-red-400" />
                                      <AlertDescription className="text-red-300">
                                        Are you sure you want to delete user <strong>{user.username}</strong>?
                                        This action cannot be undone and will remove all associated data.
                                      </AlertDescription>
                                    </Alert>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="destructive"
                                        onClick={() => deleteUserMutation.mutate(user.id)}
                                        disabled={deleteUserMutation.isPending}
                                      >
                                        {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
                                      </Button>
                                      <DialogTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogTrigger>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
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
                  <Dialog open={showAddCrypto} onOpenChange={(open) => {
                    setShowAddCrypto(open);
                    if (!open) {
                      // Reset form when dialog closes
                      setNewCrypto({ id: "", name: "", symbol: "", image: "", pythFeedId: "" });
                      setFetchedLogoUrl("");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2" size={16} />
                        Add New Cryptocurrency
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add New Cryptocurrency</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Crypto ID</Label>
                          <Input
                            value={newCrypto.id}
                            onChange={(e) => setNewCrypto({...newCrypto, id: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="bitcoin"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Name</Label>
                          <Input
                            value={newCrypto.name}
                            onChange={(e) => setNewCrypto({...newCrypto, name: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Bitcoin"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Symbol</Label>
                          <Input
                            value={newCrypto.symbol}
                            onChange={(e) => setNewCrypto({...newCrypto, symbol: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="BTC"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Image URL</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newCrypto.image}
                              onChange={(e) => setNewCrypto({...newCrypto, image: e.target.value})}
                              className="bg-slate-700 border-slate-600 text-white flex-1"
                              placeholder="https://..."
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={fetchCryptoLogo}
                              disabled={isFetchingLogo || !newCrypto.id.trim()}
                              className="bg-green-600 hover:bg-green-700 border-green-600 text-white"
                            >
                              {isFetchingLogo ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Fetching...
                                </>
                              ) : (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Fetch Logo
                                </>
                              )}
                            </Button>
                          </div>
                          {fetchedLogoUrl && (
                            <div className="mt-2 p-2 bg-slate-700 border border-slate-600 rounded flex items-center gap-3">
                              <img 
                                src={fetchedLogoUrl} 
                                alt="Logo preview" 
                                className="w-10 h-10 rounded-full bg-white p-1"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="text-sm">
                                <div className="text-green-400 font-medium">✓ Logo fetched from CoinGecko</div>
                                <div className="text-slate-400 truncate max-w-xs">{fetchedLogoUrl}</div>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            Enter Crypto ID above, then click "Fetch Logo" to get logo from CoinGecko
                          </p>
                        </div>
                        <div>
                          <Label className="text-white">Pyth Network Feed ID</Label>
                          <Input
                            value={newCrypto.pythFeedId}
                            onChange={(e) => setNewCrypto({...newCrypto, pythFeedId: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="0x..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              // Format data according to backend expectation
                              const cryptoData = {
                                cryptoId: newCrypto.id,
                                name: newCrypto.name,
                                symbol: newCrypto.symbol,
                                image: newCrypto.image,
                                pythFeedId: newCrypto.pythFeedId
                              };
                              addCryptoMutation.mutate(cryptoData);
                            }}
                            disabled={addCryptoMutation.isPending || !newCrypto.id || !newCrypto.name || !newCrypto.symbol || !newCrypto.pythFeedId}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {addCryptoMutation.isPending ? "Adding..." : "Add Cryptocurrency"}
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddCrypto(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                          <div className="flex items-center justify-between">
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-800 border-slate-700">
                                <DialogHeader>
                                  <DialogTitle className="text-red-400 flex items-center">
                                    <AlertTriangle className="mr-2" size={20} />
                                    Delete Cryptocurrency
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Alert className="border-red-600/50 bg-red-950/20">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <AlertDescription className="text-red-300">
                                      Are you sure you want to delete <strong>{crypto.name} ({crypto.symbol})</strong>?
                                      This will remove all associated data and predictions.
                                    </AlertDescription>
                                  </Alert>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => deleteCryptoMutation.mutate(crypto.id)}
                                      disabled={deleteCryptoMutation.isPending}
                                    >
                                      {deleteCryptoMutation.isPending ? "Deleting..." : "Delete Cryptocurrency"}
                                    </Button>
                                    <DialogTrigger asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogTrigger>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2" size={20} />
                    All Predictions ({filteredPredictions?.length || 0})
                  </div>
                  <Button onClick={exportPredictions} variant="outline" size="sm">
                    <Download className="mr-2" size={16} />
                    Export CSV
                  </Button>
                </CardTitle>
                
                {/* Filters */}
                <div className="mt-4 flex gap-4">
                  <div>
                    <Label className="text-white">Status Filter</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Timeframe Filter</Label>
                    <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all">All Timeframes</SelectItem>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="6h">6 Hours</SelectItem>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {predictionsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading predictions...</div>
                  </div>
                ) : filteredPredictions && filteredPredictions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Crypto</TableHead>
                        <TableHead>Predicted Price</TableHead>
                        <TableHead>Actual Price</TableHead>
                        <TableHead>Timeframe</TableHead>
                        <TableHead>Stake</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPredictions.slice(0, 20).map((prediction) => (
                        <TableRow key={prediction.id}>
                          <TableCell>{prediction.id}</TableCell>
                          <TableCell>{prediction.userId}</TableCell>
                          <TableCell className="font-mono">{prediction.cryptoId}</TableCell>
                          <TableCell>${prediction.predictedPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            {prediction.actualPrice ? `$${prediction.actualPrice.toLocaleString()}` : 'Pending'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{prediction.timeframe}</Badge>
                          </TableCell>
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
                          <TableCell className="text-xs text-slate-400">
                            {new Date(prediction.createdAt).toLocaleDateString()}
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

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Deposits</p>
                      <p className="text-3xl font-bold text-white">$0</p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">Total Withdrawals</p>
                      <p className="text-3xl font-bold text-white">$0</p>
                    </div>
                    <XCircle className="h-12 w-12 text-red-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">NTIQ Rewards</p>
                      <p className="text-3xl font-bold text-white">{adminStats?.totalRewards || 0}</p>
                    </div>
                    <Coins className="h-12 w-12 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Pending Transactions</p>
                      <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <Clock className="h-12 w-12 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Recent Transactions
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2" size={16} />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2" size={16} />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading transactions...</div>
                  </div>
                ) : transactionsData && transactionsData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hash</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionsData.slice(0, 20).map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{transaction.userId}</TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.type === 'deposit' ? 'default' :
                              transaction.type === 'withdrawal' ? 'destructive' :
                              'secondary'
                            }>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.amount}</TableCell>
                          <TableCell>{transaction.token}</TableCell>
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
                            {transaction.hash ? `${transaction.hash.slice(0, 10)}...` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Successful Logins</p>
                      <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <Shield className="h-12 w-12 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Failed Attempts</p>
                      <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <AlertTriangle className="h-12 w-12 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">Blocked IPs</p>
                      <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <Ban className="h-12 w-12 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="mr-2" size={20} />
                    Security Events
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2" size={16} />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2" size={16} />
                      Export Log
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {securityLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Loading security events...</div>
                  </div>
                ) : securityEvents && securityEvents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>User/IP</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {securityEvents.slice(0, 20).map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-xs text-slate-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{event.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {event.userAgent ? `${event.ip?.slice(0, 12)}...` : event.ip}
                          </TableCell>
                          <TableCell className="text-sm">{event.details}</TableCell>
                          <TableCell>
                            <Badge variant={
                              event.status === 'success' ? 'default' :
                              event.status === 'failed' ? 'destructive' :
                              'secondary'
                            }>
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              event.riskLevel === 'high' ? 'destructive' :
                              event.riskLevel === 'medium' ? 'secondary' :
                              'outline'
                            }>
                              {event.riskLevel || 'low'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No Security Events</h3>
                    <p className="text-slate-400">Security monitoring is active. Events will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2" size={20} />
                  Admin Actions Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs text-slate-400">
                        {new Date().toLocaleString()}
                      </TableCell>
                      <TableCell>Admin_62c5b6</TableCell>
                      <TableCell>
                        <Badge variant="default">Panel Access</Badge>
                      </TableCell>
                      <TableCell>Admin Panel</TableCell>
                      <TableCell className="text-sm">Accessed admin dashboard</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-2" size={20} />
                    Event Management
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2" size={16} />
                    Create Event
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Platform Maintenance</h3>
                          <p className="text-slate-400 text-sm">Scheduled maintenance window</p>
                          <p className="text-xs text-slate-500">
                            {new Date(Date.now() + 86400000).toLocaleDateString()} - Active
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">Trading Competition</h3>
                          <p className="text-slate-400 text-sm">Monthly prediction battle event</p>
                          <p className="text-xs text-slate-500">
                            {new Date(Date.now() + 604800000).toLocaleDateString()} - Upcoming
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2" size={20} />
                    Platform Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Maintenance Mode</Label>
                      <p className="text-sm text-slate-400">Enable platform maintenance</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2" size={16} />
                      {maintenanceMode ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">New User Registration</Label>
                      <p className="text-sm text-slate-400">Allow new users to register</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <UserPlus className="mr-2" size={16} />
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Prediction Limits</Label>
                      <p className="text-sm text-slate-400">Max predictions per user</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue={10}
                        className="w-20 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Token Economics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Starting Balance</Label>
                      <p className="text-sm text-slate-400">NTIQ tokens for new users</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue={1000}
                        className="w-24 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Min Stake Amount</Label>
                      <p className="text-sm text-slate-400">Minimum prediction stake</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue={50}
                        className="w-20 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Max Stake Amount</Label>
                      <p className="text-sm text-slate-400">Maximum prediction stake</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue={500}
                        className="w-20 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2" size={20} />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Reset Database</Label>
                    <p className="text-sm text-slate-400">⚠️ This will permanently delete all data</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Database className="mr-2" size={16} />
                        Reset Database
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-red-400 flex items-center">
                          <AlertTriangle className="mr-2" size={20} />
                          Confirm Database Reset
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert className="border-red-600/50 bg-red-950/20">
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-300">
                            This action cannot be undone. All users, predictions, transactions, and settings will be permanently deleted.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <Label className="text-white">Type "RESET" to confirm</Label>
                          <Input
                            placeholder="RESET"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="destructive" disabled>
                            Confirm Reset
                          </Button>
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}