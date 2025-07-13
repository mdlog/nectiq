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

  // Fetch recent predictions
  const { data: predictions = [] } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/predictions"],
    enabled: !!user?.isAdmin,
  });

  // Fetch users
  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
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
              <h2 className="text-2xl font-bold mb-4">Statistics</h2>
              <UserStatistics />
            </div>
          )}
          {activeSection === "Users" && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">User Management</h2>
              <p className="text-gray-400">User management interface coming soon...</p>
            </div>
          )}
          {activeSection === "Predictions" && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">Predictions</h2>
              <p className="text-gray-400">Predictions management interface coming soon...</p>
            </div>
          )}
          {activeSection === "Battles" && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">Battles</h2>
              <p className="text-gray-400">Battles management interface coming soon...</p>
            </div>
          )}
          {activeSection === "Tournaments" && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">Tournaments</h2>
              <p className="text-gray-400">Tournaments management interface coming soon...</p>
            </div>
          )}
          {activeSection === "Transactions" && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">Transactions</h2>
              <p className="text-gray-400">Transactions management interface coming soon...</p>
            </div>
          )}
          {activeSection === "Security" && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">Security</h2>
              <p className="text-gray-400">Security management interface coming soon...</p>
            </div>
          )}
          {activeSection === "Settings" && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-gray-400">Settings interface coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}