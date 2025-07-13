import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { 
  BarChart3, Users, TrendingUp, DollarSign, Activity, Settings, 
  Shield, Database, Search, Bell, User, ChevronDown, Menu, 
  Target, Trophy, Gamepad2, AlertTriangle, RefreshCw, Download,
  Plus, Trash2, Coins, Edit, UserPlus, UserX, Lock, FileText, 
  Calendar, Zap, Ban, Filter, ChevronUp, X, AlertCircle, Info, 
  Clock, CheckCircle, Lightbulb, Cog, Copy, Code, Archive, 
  FileDown, FileSpreadsheet, ShieldCheck, Pause, Save, Megaphone, 
  Star, MapPin, ExternalLink, Swords, Play, RotateCcw, Eye, Award
} from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType, Prediction, Reward, Cryptocurrency } from "@shared/schema";
import type { LeaderboardEntry } from "@/types";
import { SimpleAdminAuth } from "@/components/simple-admin-auth";
import { BannerManagement } from "@/components/admin/banner-management";
import { UserStatistics } from "@/components/admin/user-statistics";
import { useAdminWebSocket } from "@/hooks/useAdminWebSocket";

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalRewards: number;
  activeUsers: number;
  accuracyAverage: number;
  totalStaked: number;
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize WebSocket for real-time updates
  useAdminWebSocket();

  // User management state
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [userFilter, setUserFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userSortField, setUserSortField] = useState<"balance" | "accuracy" | "predictions" | "rewards">("balance");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Create user form state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    walletAddress: "",
    balance: 5000,
  });

  // Predictions state
  const [predictionsPage, setPredictionsPage] = useState(1);
  const [predictionsPerPage] = useState(10);
  const [predictionsAssetFilter, setPredictionsAssetFilter] = useState("all");
  const [predictionsStatusFilter, setPredictionsStatusFilter] = useState("all");
  const [predictionsSearchTerm, setPredictionsSearchTerm] = useState("");
  const [predictionsSortField, setPredictionsSortField] = useState<"createdAt" | "stake" | "reward">("createdAt");
  const [predictionsSortOrder, setPredictionsSortOrder] = useState<"asc" | "desc">("desc");

  // Battles state
  const [battlesPage, setBattlesPage] = useState(1);
  const [battlesPerPage] = useState(10);
  const [battlesStatusFilter, setBattlesStatusFilter] = useState("all");
  const [battlesCryptoFilter, setBattlesCryptoFilter] = useState("all");
  const [battlesSearchQuery, setBattlesSearchQuery] = useState("");
  const [selectedBattles, setSelectedBattles] = useState<number[]>([]);
  const [showBattleDetailsModal, setShowBattleDetailsModal] = useState(false);
  const [selectedBattleDetails, setSelectedBattleDetails] = useState<any>(null);

  // Transactions state
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "purchase" | "withdrawal">("all");
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionsPerPage] = useState(15);

  // Security state
  const [securityEventFilter, setSecurityEventFilter] = useState<"all" | "medium" | "high" | "critical">("all");
  const [securityPage, setSecurityPage] = useState(1);
  const [securityEventsPerPage] = useState(20);
  const [securitySearchQuery, setSecuritySearchQuery] = useState("");

  // Cryptocurrency management
  const [newCryptoId, setNewCryptoId] = useState("");

  // Check authentication
  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
    refetchInterval: 5000,
  });

  // Fetch all data
  const { data: predictions = [] } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/predictions"],
    enabled: !!user?.isAdmin,
    refetchInterval: 5000,
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
    refetchInterval: 5000,
  });

  const { data: battles = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/battles"],
    enabled: !!user?.isAdmin,
    refetchInterval: 5000,
  });

  const { data: tournaments = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/survival-tournaments"],
    enabled: !!user?.isAdmin,
    refetchInterval: 5000,
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/transactions"],
    enabled: !!user?.isAdmin,
    refetchInterval: 5000,
  });

  const { data: securityEvents = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/security-events"],
    enabled: !!user?.isAdmin,
    refetchInterval: 10000,
  });

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
    enabled: !!user?.isAdmin,
    refetchInterval: 5000,
  });

  const { data: cryptocurrencies = [] } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/crypto/supported"],
    enabled: !!user?.isAdmin,
  });

  // Mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsCreateUserOpen(false);
      setNewUser({ username: "", walletAddress: "", balance: 5000 });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
  });

  const cancelBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      return apiRequest(`/api/admin/battles/${battleId}/cancel`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      toast({
        title: "Success",
        description: "Battle cancelled successfully",
      });
    },
  });

  const addCryptocurrencyMutation = useMutation({
    mutationFn: async (cryptoId: string) => {
      return apiRequest("/api/admin/crypto/add", {
        method: "POST",
        body: JSON.stringify({ cryptoId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/supported"] });
      setNewCryptoId("");
      toast({
        title: "Success",
        description: "Cryptocurrency added successfully",
      });
    },
  });

  // Authentication check
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SimpleAdminAuth />;
  }

  // For wallet authentication, check if the wallet address is admin
  if (user.walletAddress && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-white">Access Denied</h1>
          <p className="text-gray-400 mb-4">
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => window.location.href = "/home"} variant="outline">
            Back to App
          </Button>
        </div>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarItems = [
    { id: "Dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "Statistics", label: "Statistics", icon: Activity },
    { id: "Users", label: "User Management", icon: Users },
    { id: "Predictions", label: "Predictions", icon: Target },
    { id: "Battles", label: "Battles", icon: Swords },
    { id: "Tournaments", label: "Tournaments", icon: Trophy },
    { id: "Transactions", label: "Transactions", icon: DollarSign },
    { id: "Security", label: "Security", icon: Shield },
    { id: "Settings", label: "Settings", icon: Settings },
  ];

  const renderDashboardContent = () => {
    if (!stats) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Today Sale</p>
                  <p className="text-2xl font-bold text-white">{stats.totalStaked}</p>
                  <p className="text-xs text-green-400">+2.5% from yesterday</p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Sale</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRewards}</p>
                  <p className="text-xs text-green-400">+5.4% from last month</p>
                </div>
                <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Today Revenue</p>
                  <p className="text-2xl font-bold text-white">{stats.totalPredictions}</p>
                  <p className="text-xs text-red-400">-1.2% from yesterday</p>
                </div>
                <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-green-400">+8.2% from last month</p>
                </div>
                <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Worldwide Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Chart placeholder</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Sales & Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Chart placeholder</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Sale</TableHead>
                  <TableHead className="text-gray-400">Earnings</TableHead>
                  <TableHead className="text-gray-400">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.slice(0, 5).map((prediction, idx) => (
                  <TableRow key={prediction.id} className="border-gray-700">
                    <TableCell className="text-white">User {prediction.userId}</TableCell>
                    <TableCell className="text-gray-400">user{prediction.userId}@example.com</TableCell>
                    <TableCell className="text-white">{prediction.stake} NTIQ</TableCell>
                    <TableCell className="text-green-400">{prediction.rewardAmount || 0} NTIQ</TableCell>
                    <TableCell className="text-white">Active</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Brand */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-white font-semibold">Nectiq Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    activeSection === item.id
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {sidebarOpen && <span className="ml-2">{item.label}</span>}
                </Button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">{activeSection}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>
              
              {/* Profile */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-red-500 text-white">
                    {user?.username?.[0]?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {activeSection === "Dashboard" && renderDashboardContent()}
          
          {activeSection === "Statistics" && (
            <div className="text-white">
              <UserStatistics />
            </div>
          )}
          
          {activeSection === "Users" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">User Management</h2>
                  <p className="text-gray-400">Manage platform users and their accounts</p>
                </div>
                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-500 hover:bg-red-600">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Username</Label>
                        <Input
                          value={newUser.username}
                          onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Wallet Address</Label>
                        <Input
                          value={newUser.walletAddress}
                          onChange={(e) => setNewUser({...newUser, walletAddress: e.target.value})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Initial Balance (NTIQ)</Label>
                        <Input
                          type="number"
                          value={newUser.balance}
                          onChange={(e) => setNewUser({...newUser, balance: parseInt(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <Button 
                        onClick={() => createUserMutation.mutate(newUser)}
                        disabled={createUserMutation.isPending}
                        className="w-full bg-red-500 hover:bg-red-600"
                      >
                        {createUserMutation.isPending ? "Creating..." : "Create User"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                        <SelectItem value="rich">High Balance</SelectItem>
                        <SelectItem value="no-wallet">No Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">
                          <Checkbox />
                        </TableHead>
                        <TableHead className="text-gray-400">User</TableHead>
                        <TableHead className="text-gray-400">Balance</TableHead>
                        <TableHead className="text-gray-400">Predictions</TableHead>
                        <TableHead className="text-gray-400">Accuracy</TableHead>
                        <TableHead className="text-gray-400">Total Rewards</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.filter(user => {
                        const matchesSearch = user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) || false;
                        const matchesFilter = userFilter === "all" || 
                          (userFilter === "admins" && user.isAdmin) ||
                          (userFilter === "rich" && user.balance > 5000) ||
                          (userFilter === "no-wallet" && !user.walletAddress);
                        return matchesSearch && matchesFilter;
                      }).map((user) => (
                        <TableRow key={user.id} className="border-gray-700">
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-white">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-red-500 text-white">
                                  {user.username?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.username}</p>
                                <p className="text-sm text-gray-400">UID: {user.uid}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{user.balance} NTIQ</TableCell>
                          <TableCell className="text-white">
                            {predictions.filter(p => p.userId === user.id).length}
                          </TableCell>
                          <TableCell className="text-white">
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              85%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {Math.floor(Math.random() * 1000)} NTIQ
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:text-white"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                disabled={deleteUserMutation.isPending}
                                className="border-red-600 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeSection === "Predictions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Predictions Management</h2>
                  <p className="text-gray-400">Monitor and manage user predictions</p>
                </div>
              </div>

              {/* Filters */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search predictions..."
                        value={predictionsSearchTerm}
                        onChange={(e) => setPredictionsSearchTerm(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Select value={predictionsAssetFilter} onValueChange={setPredictionsAssetFilter}>
                      <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all">All Assets</SelectItem>
                        <SelectItem value="bitcoin">Bitcoin</SelectItem>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="bnb">BNB</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={predictionsStatusFilter} onValueChange={setPredictionsStatusFilter}>
                      <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Predictions Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">User</TableHead>
                        <TableHead className="text-gray-400">Asset</TableHead>
                        <TableHead className="text-gray-400">Predicted Price</TableHead>
                        <TableHead className="text-gray-400">Current Price</TableHead>
                        <TableHead className="text-gray-400">Stake</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Reward</TableHead>
                        <TableHead className="text-gray-400">Time Left</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.map((prediction) => (
                        <TableRow key={prediction.id} className="border-gray-700">
                          <TableCell className="text-white">
                            User {prediction.userId}
                          </TableCell>
                          <TableCell className="text-white">
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              {prediction.cryptocurrency.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            ${prediction.predictedPrice}
                          </TableCell>
                          <TableCell className="text-white">
                            ${Math.floor(Math.random() * 100000)}
                          </TableCell>
                          <TableCell className="text-white">
                            {prediction.stake} NTIQ
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={prediction.status === 'active' ? 'default' : 'secondary'}
                              className={
                                prediction.status === 'active' ? 'bg-green-500 text-white' :
                                prediction.status === 'completed' ? 'bg-blue-500 text-white' :
                                'bg-gray-500 text-white'
                              }
                            >
                              {prediction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {prediction.rewardAmount || 0} NTIQ
                          </TableCell>
                          <TableCell className="text-white">
                            <Clock className="h-4 w-4 inline mr-1" />
                            2h 30m
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "Battles" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Battle Management</h2>
                  <p className="text-gray-400">Monitor and manage prediction battles</p>
                </div>
              </div>

              {/* Battle Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Battles</p>
                        <p className="text-2xl font-bold text-white">{battles.length}</p>
                      </div>
                      <Swords className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Active Battles</p>
                        <p className="text-2xl font-bold text-white">
                          {battles.filter(b => b.status === 'active').length}
                        </p>
                      </div>
                      <Play className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Open Battles</p>
                        <p className="text-2xl font-bold text-white">
                          {battles.filter(b => b.status === 'open').length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Completed</p>
                        <p className="text-2xl font-bold text-white">
                          {battles.filter(b => b.status === 'completed').length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Battles Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Battle ID</TableHead>
                        <TableHead className="text-gray-400">Challenger</TableHead>
                        <TableHead className="text-gray-400">Opponent</TableHead>
                        <TableHead className="text-gray-400">Asset</TableHead>
                        <TableHead className="text-gray-400">Stake</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {battles.map((battle) => (
                        <TableRow key={battle.id} className="border-gray-700">
                          <TableCell className="text-white">#{battle.id}</TableCell>
                          <TableCell className="text-white">
                            User {battle.challengerId}
                          </TableCell>
                          <TableCell className="text-white">
                            {battle.challengedId ? `User ${battle.challengedId}` : 'Waiting...'}
                          </TableCell>
                          <TableCell className="text-white">
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              {battle.cryptocurrency?.toUpperCase() || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{battle.stake} NTIQ</TableCell>
                          <TableCell>
                            <Badge 
                              variant={battle.status === 'active' ? 'default' : 'secondary'}
                              className={
                                battle.status === 'active' ? 'bg-green-500 text-white' :
                                battle.status === 'open' ? 'bg-blue-500 text-white' :
                                'bg-gray-500 text-white'
                              }
                            >
                              {battle.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedBattleDetails(battle);
                                  setShowBattleDetailsModal(true);
                                }}
                                className="border-gray-600 text-gray-300 hover:text-white"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {battle.status === 'open' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => cancelBattleMutation.mutate(battle.id)}
                                  disabled={cancelBattleMutation.isPending}
                                  className="border-red-600 text-red-400 hover:text-red-300"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "Tournaments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Tournament Management</h2>
                  <p className="text-gray-400">Manage survival tournaments</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tournament
                </Button>
              </div>

              {/* Tournament Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Tournaments</p>
                        <p className="text-2xl font-bold text-white">{tournaments.length}</p>
                      </div>
                      <Trophy className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Active</p>
                        <p className="text-2xl font-bold text-white">
                          {tournaments.filter(t => t.status === 'active').length}
                        </p>
                      </div>
                      <Play className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Participants</p>
                        <p className="text-2xl font-bold text-white">
                          {tournaments.reduce((sum, t) => sum + (t.participantCount || 0), 0)}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tournaments Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Tournament</TableHead>
                        <TableHead className="text-gray-400">Asset</TableHead>
                        <TableHead className="text-gray-400">Entry Fee</TableHead>
                        <TableHead className="text-gray-400">Participants</TableHead>
                        <TableHead className="text-gray-400">Prize Pool</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tournaments.map((tournament) => (
                        <TableRow key={tournament.id} className="border-gray-700">
                          <TableCell className="text-white">
                            <div>
                              <p className="font-medium">{tournament.title}</p>
                              <p className="text-sm text-gray-400">{tournament.description}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              {tournament.cryptocurrency?.toUpperCase() || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{tournament.entryFee} NTIQ</TableCell>
                          <TableCell className="text-white">
                            {tournament.participantCount || 0}/{tournament.maxParticipants}
                          </TableCell>
                          <TableCell className="text-white">
                            {(tournament.entryFee || 0) * (tournament.participantCount || 0)} NTIQ
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={tournament.status === 'active' ? 'default' : 'secondary'}
                              className={
                                tournament.status === 'active' ? 'bg-green-500 text-white' :
                                tournament.status === 'open' ? 'bg-blue-500 text-white' :
                                'bg-gray-500 text-white'
                              }
                            >
                              {tournament.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:text-white"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:text-white"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "Transactions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Transaction Management</h2>
                  <p className="text-gray-400">Monitor platform transactions and withdrawals</p>
                </div>
              </div>

              {/* Transaction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Transactions</p>
                        <p className="text-2xl font-bold text-white">{transactions.length}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-white">
                          {transactions.filter(t => t.status === 'pending').length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Completed</p>
                        <p className="text-2xl font-bold text-white">
                          {transactions.filter(t => t.status === 'completed').length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Volume</p>
                        <p className="text-2xl font-bold text-white">$45,231</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transactions Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Transaction ID</TableHead>
                        <TableHead className="text-gray-400">User</TableHead>
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">Amount</TableHead>
                        <TableHead className="text-gray-400">Token</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="border-gray-700">
                          <TableCell className="text-white">#{transaction.id}</TableCell>
                          <TableCell className="text-white">User {transaction.userId}</TableCell>
                          <TableCell className="text-white">
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              {transaction.type || 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{transaction.amount}</TableCell>
                          <TableCell className="text-white">
                            {transaction.token || 'NTIQ'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                              className={
                                transaction.status === 'completed' ? 'bg-green-500 text-white' :
                                transaction.status === 'pending' ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              }
                            >
                              {transaction.status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:text-white"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "Security" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Security Dashboard</h2>
                  <p className="text-gray-400">Monitor security events and threats</p>
                </div>
              </div>

              {/* Security Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Events</p>
                        <p className="text-2xl font-bold text-white">{securityEvents.length}</p>
                      </div>
                      <Shield className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Critical</p>
                        <p className="text-2xl font-bold text-white">
                          {securityEvents.filter(e => e.severity === 'critical').length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">High</p>
                        <p className="text-2xl font-bold text-white">
                          {securityEvents.filter(e => e.severity === 'high').length}
                        </p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Medium</p>
                        <p className="text-2xl font-bold text-white">
                          {securityEvents.filter(e => e.severity === 'medium').length}
                        </p>
                      </div>
                      <Info className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security Events Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Event</TableHead>
                        <TableHead className="text-gray-400">Severity</TableHead>
                        <TableHead className="text-gray-400">IP Address</TableHead>
                        <TableHead className="text-gray-400">User</TableHead>
                        <TableHead className="text-gray-400">Description</TableHead>
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {securityEvents.map((event) => (
                        <TableRow key={event.id} className="border-gray-700">
                          <TableCell className="text-white">{event.event_type || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                event.severity === 'critical' ? 'text-red-400 border-red-400' :
                                event.severity === 'high' ? 'text-orange-400 border-orange-400' :
                                event.severity === 'medium' ? 'text-yellow-400 border-yellow-400' :
                                'text-blue-400 border-blue-400'
                              }
                            >
                              {event.severity || 'low'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{event.ip_address}</TableCell>
                          <TableCell className="text-white">
                            {event.userId ? `User ${event.userId}` : 'Anonymous'}
                          </TableCell>
                          <TableCell className="text-white">{event.description}</TableCell>
                          <TableCell className="text-white">
                            {new Date(event.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:text-white"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "Settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Platform Settings</h2>
                  <p className="text-gray-400">Configure platform parameters and limits</p>
                </div>
              </div>

              {/* Settings Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prediction Limits */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Prediction Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Minimum Prediction Amount (NTIQ)</Label>
                      <Input
                        type="number"
                        defaultValue={1}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Maximum Prediction Amount (NTIQ)</Label>
                      <Input
                        type="number"
                        defaultValue={10000}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button className="w-full bg-red-500 hover:bg-red-600">
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Financial Settings */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Financial Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Withdrawal Fee (%)</Label>
                      <Input
                        type="number"
                        defaultValue={2.5}
                        step="0.1"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Minimum Withdrawal (NTIQ)</Label>
                      <Input
                        type="number"
                        defaultValue={1000}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button className="w-full bg-red-500 hover:bg-red-600">
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Rate Limit (requests/hour)</Label>
                      <Input
                        type="number"
                        defaultValue={500}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Auto-block suspicious IPs</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Enable 2FA requirement</Label>
                      <Switch />
                    </div>
                    <Button className="w-full bg-red-500 hover:bg-red-600">
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Cryptocurrency Management */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Cryptocurrency Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Add New Cryptocurrency</Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter CoinGecko ID (e.g., bitcoin)"
                          value={newCryptoId}
                          onChange={(e) => setNewCryptoId(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Button
                          onClick={() => addCryptocurrencyMutation.mutate(newCryptoId)}
                          disabled={addCryptocurrencyMutation.isPending || !newCryptoId}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300">Supported Cryptocurrencies</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {cryptocurrencies.map((crypto) => (
                          <div key={crypto.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                            <span className="text-white text-sm">{crypto.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {crypto.symbol.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Battle Details Modal */}
      <Dialog open={showBattleDetailsModal} onOpenChange={setShowBattleDetailsModal}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Battle Details</DialogTitle>
          </DialogHeader>
          {selectedBattleDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-gray-300 font-medium">Challenger</h4>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-white">User {selectedBattleDetails.challengerId}</p>
                    <p className="text-gray-400 text-sm">
                      Prediction: ${selectedBattleDetails.challengerPrediction || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-gray-300 font-medium">Opponent</h4>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-white">
                      {selectedBattleDetails.challengedId ? 
                        `User ${selectedBattleDetails.challengedId}` : 
                        'Waiting for opponent...'
                      }
                    </p>
                    <p className="text-gray-400 text-sm">
                      Prediction: ${selectedBattleDetails.challengedPrediction || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-gray-300 font-medium">Cryptocurrency</h4>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {selectedBattleDetails.cryptocurrency?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-gray-300 font-medium">Stake Amount</h4>
                  <p className="text-white">{selectedBattleDetails.stake} NTIQ</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-gray-300 font-medium">Status</h4>
                  <Badge 
                    variant={selectedBattleDetails.status === 'active' ? 'default' : 'secondary'}
                    className={
                      selectedBattleDetails.status === 'active' ? 'bg-green-500 text-white' :
                      selectedBattleDetails.status === 'open' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }
                  >
                    {selectedBattleDetails.status}
                  </Badge>
                </div>
              </div>

              {selectedBattleDetails.winnerId && (
                <div className="space-y-2">
                  <h4 className="text-gray-300 font-medium">Winner</h4>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded">
                    <p className="text-yellow-400 font-medium">
                      User {selectedBattleDetails.winnerId}
                    </p>
                    <p className="text-gray-300 text-sm">
                      Reward: {selectedBattleDetails.stake * 2} NTIQ
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}