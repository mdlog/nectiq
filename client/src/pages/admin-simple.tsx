import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Database, 
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  Search,
  Edit,
  Eye,
  User,
  Menu,
  Bell,
  Lock,
  Coins,
  MoreHorizontal,
  Facebook,
  Linkedin,
  Clock
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalRewards: number;
  activeUsers: number;
  accuracyAverage: number;
  totalStaked: number;
}

export default function AdminPanel() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get current user
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: 1,
    refetchInterval: 30000,
  });

  // Get admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!currentUser?.isAdmin,
    retry: 2,
    refetchInterval: 10000,
  });

  // Get users
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!currentUser?.isAdmin,
    retry: 2,
    refetchInterval: 15000,
  });

  // Get predictions
  const { data: predictions = [] } = useQuery({
    queryKey: ["/api/admin/predictions"],
    enabled: !!currentUser?.isAdmin,
    retry: 2,
    refetchInterval: 10000,
  });

  // Get cryptocurrencies
  const { data: cryptocurrencies = [] } = useQuery({
    queryKey: ["/api/admin/cryptocurrencies"],
    enabled: !!currentUser?.isAdmin,
    retry: 2,
    refetchInterval: 30000,
  });

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <h2 className="text-2xl font-semibold text-white">
            Loading Dashboard
          </h2>
          <p className="text-slate-400">
            Initializing admin interface...
          </p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-400 mb-6">
              Administrator privileges required
            </p>
            <Badge variant="destructive" className="text-sm">
              Admin Access Required
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`bg-slate-800 border-r border-slate-700 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-white font-bold text-lg">Nectiq</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-700 bg-slate-700">
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
              <TrendingUp className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-3">Analytics</span>}
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
              <Coins className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-3">eCommerce</span>}
            </Button>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
                UI ELEMENTS
              </p>
            )}
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <Users className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Cards</span>}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <Database className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">eCommerce</span>}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <Settings className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Components</span>}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <Shield className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Icons</span>}
              </Button>
            </div>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
                FORMS & TABLES
              </p>
            )}
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <Edit className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Forms</span>}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <Activity className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Tables</span>}
              </Button>
            </div>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
                PAGES
              </p>
            )}
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <User className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Authentication</span>}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <Users className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">User Profile</span>}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <Clock className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Timeline</span>}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <Eye className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Pages</span>}
              </Button>
            </div>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
                CHARTS & MAPS
              </p>
            )}
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-700">
                <BarChart3 className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-3">Charts</span>}
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-slate-400 hover:bg-slate-700">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Search" 
                  className="pl-10 w-64 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-slate-400 hover:bg-slate-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              <Button variant="ghost" className="text-slate-400 hover:bg-slate-700">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 bg-slate-900 min-h-screen overflow-y-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Welcome back</p>
                    <h1 className="text-3xl font-bold text-white">{currentUser.username}!</h1>
                  </div>
                </div>
                
                <div className="flex items-center gap-12">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">42.5K</div>
                    <p className="text-blue-100 text-sm">Active Users</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">97.4K</div>
                    <p className="text-blue-100 text-sm">Total Users</p>
                  </div>
                  
                  {/* Circular Progress */}
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="36" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                      <circle cx="48" cy="48" r="36" stroke="#10B981" strokeWidth="8" fill="none" 
                        strokeDasharray={`${78 * 2.26} ${226 - 78 * 2.26}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">78%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 text-right">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-2">
                  20k users increased from last month
                </Badge>
                <p className="text-green-300 text-sm font-medium">+12.5% from last month</p>
              </div>
              
              {/* Illustration area */}
              <div className="absolute right-32 top-1/2 transform -translate-y-1/2">
                <div className="w-40 h-20 opacity-30">
                  {/* Simple illustration placeholder */}
                  <div className="w-full h-full bg-white/10 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Monthly Revenue */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Monthly Revenue</CardTitle>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-gradient-to-t from-blue-500/20 to-cyan-500/20 rounded-lg flex items-end p-2">
                    {/* Simple bar chart */}
                    <div className="flex items-end gap-1 w-full justify-between">
                      {[40, 60, 35, 80, 45, 70, 55, 90, 50, 65, 40, 75].map((height, i) => (
                        <div 
                          key={i} 
                          className="bg-gradient-to-t from-blue-500 to-cyan-500 rounded-sm w-2"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">68.9%</div>
                    <p className="text-green-400 text-sm font-medium">+34.5% ▲</p>
                    <p className="text-slate-400 text-xs mt-1">Average monthly sale for every author</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Type */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Device Type</CardTitle>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                      <circle cx="64" cy="64" r="48" stroke="#3B82F6" strokeWidth="8" fill="none" 
                        strokeDasharray={`${68 * 3.01} ${301 - 68 * 3.01}`} strokeLinecap="round" />
                      <circle cx="64" cy="64" r="48" stroke="#10B981" strokeWidth="8" fill="none" 
                        strokeDasharray={`${25 * 3.01} ${301 - 25 * 3.01}`} strokeLinecap="round"
                        strokeDashoffset={`-${68 * 3.01}`} />
                      <circle cx="64" cy="64" r="48" stroke="#F59E0B" strokeWidth="8" fill="none" 
                        strokeDasharray={`${7 * 3.01} ${301 - 7 * 3.01}`} strokeLinecap="round"
                        strokeDashoffset={`-${(68 + 25) * 3.01}`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">68%</div>
                        <p className="text-slate-400 text-xs">Total Views</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-300 text-sm">Desktop</span>
                      </div>
                      <span className="text-white text-sm">63%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-slate-300 text-sm">Tablet</span>
                      </div>
                      <span className="text-white text-sm">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-slate-300 text-sm">Mobile</span>
                      </div>
                      <span className="text-white text-sm">27%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Sales */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Total Sales</CardTitle>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 flex items-end">
                    <div className="flex items-end h-full gap-1 w-full">
                      {[60, 80, 40, 90, 50, 70, 85, 45, 95, 55, 75, 65].map((height, i) => (
                        <div 
                          key={i} 
                          className="bg-gradient-to-t from-purple-600 to-pink-500 rounded-sm flex-1"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">82.7K</div>
                    <p className="text-slate-400 text-sm">Total Sales</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        +12.8% from last month
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">354 users increased from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Accounts */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Total Accounts</CardTitle>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white">85,247</div>
                        <p className="text-green-400 text-sm font-medium">+ 23.3%</p>
                      </div>
                    </div>
                    {/* Wave chart */}
                    <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 400 64">
                      <path d="M0 32 C 100 16, 300 48, 400 32 L 400 64 L 0 64 Z" fill="url(#gradient)" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">Total Accounts</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Campaign Stats</CardTitle>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Campaigns</span>
                      <span className="text-green-400 text-sm font-medium">-28%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">54</span>
                      <div className="flex-1 h-16 relative">
                        <svg className="w-full h-full" viewBox="0 0 200 64">
                          <polyline 
                            fill="none" 
                            stroke="#10B981" 
                            strokeWidth="2"
                            points="0,45 20,30 40,50 60,25 80,35 100,20 120,40 140,15 160,30 180,10 200,25"
                          />
                          <path 
                            d="M0,45 L20,30 L40,50 L60,25 L80,35 L100,20 L120,40 L140,15 L160,30 L180,10 L200,25 L200,64 L0,64 Z"
                            fill="url(#campaignGradient)"
                          />
                          <defs>
                            <linearGradient id="campaignGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Leads */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Social Leads</CardTitle>
                  <MoreHorizontal className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Facebook className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white">Facebook</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white">55%</span>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="w-[55%] h-full bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Linkedin className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white">LinkedIn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white">67%</span>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="w-[67%] h-full bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}