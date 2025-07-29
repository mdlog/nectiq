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
  const [activeSection, setActiveSection] = useState("dashboard");

  // Get current user
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Get admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  // Get admin data based on active section
  const { data: sectionData, isLoading: sectionLoading } = useQuery({
    queryKey: [`/api/admin/${activeSection === 'dashboard' ? 'stats' : activeSection}`],
    enabled: activeSection !== 'dashboard' || !!stats,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Access denied. Admin privileges required.</div>
      </div>
    );
  }

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      color: "text-blue-400"
    },
    {
      id: "analytics", 
      label: "Analytics",
      icon: TrendingUp,
      color: "text-green-400"
    },
    {
      id: "monitor",
      label: "Live Monitor", 
      icon: Activity,
      color: "text-purple-400"
    },
    {
      id: "users",
      label: "All Users",
      icon: Users,
      color: "text-cyan-400",
      isSubMenu: true,
      parent: "User Management"
    },
    {
      id: "profiles",
      label: "User Profiles",
      icon: User,
      color: "text-cyan-400", 
      isSubMenu: true,
      parent: "User Management"
    },
    {
      id: "admin-users",
      label: "Admin Users",
      icon: Shield,
      color: "text-cyan-400",
      isSubMenu: true, 
      parent: "User Management"
    },
    {
      id: "user-activity",
      label: "User Activity",
      icon: Clock,
      color: "text-cyan-400",
      isSubMenu: true,
      parent: "User Management"
    },
    {
      id: "predictions",
      label: "Predictions",
      icon: TrendingUp,
      color: "text-yellow-400",
      isSubMenu: true,
      parent: "Predictions & Battles"
    },
    {
      id: "battles",
      label: "Battle System", 
      icon: Shield,
      color: "text-yellow-400",
      isSubMenu: true,
      parent: "Predictions & Battles"
    },
    {
      id: "survival",
      label: "Survival Rounds",
      icon: Activity,
      color: "text-yellow-400",
      isSubMenu: true,
      parent: "Predictions & Battles"
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: BarChart3,
      color: "text-yellow-400",
      isSubMenu: true,
      parent: "Predictions & Battles"
    },
    {
      id: "balances",
      label: "User Balances",
      icon: Coins,
      color: "text-green-400",
      isSubMenu: true,
      parent: "Financial Monitoring"
    },
    {
      id: "deposits",
      label: "Deposits",
      icon: TrendingUp,
      color: "text-green-400",
      isSubMenu: true,
      parent: "Financial Monitoring"
    },
    {
      id: "withdrawals",
      label: "Withdrawals",
      icon: RefreshCw,
      color: "text-green-400",
      isSubMenu: true,
      parent: "Financial Monitoring"
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Activity,
      color: "text-green-400",
      isSubMenu: true,
      parent: "Financial Monitoring"
    },
    {
      id: "cryptocurrencies",
      label: "Cryptocurrencies",
      icon: Database,
      color: "text-orange-400",
      isSubMenu: true,
      parent: "System & Security"
    },
    {
      id: "security",
      label: "Security Logs",
      icon: Shield,
      color: "text-orange-400",
      isSubMenu: true,
      parent: "System & Security"
    },
    {
      id: "settings",
      label: "System Settings",
      icon: Settings,
      color: "text-orange-400",
      isSubMenu: true,
      parent: "System & Security"
    },
    {
      id: "audit",
      label: "Audit Trail",
      icon: Lock,
      color: "text-orange-400",
      isSubMenu: true,
      parent: "System & Security"
    }
  ];

  const getMenuGroups = () => {
    const groups = new Map();
    
    menuItems.forEach(item => {
      if (!item.isSubMenu) {
        if (!groups.has('main')) groups.set('main', []);
        groups.get('main').push(item);
      } else {
        if (!groups.has(item.parent)) groups.set(item.parent, []);
        groups.get(item.parent).push(item);
      }
    });
    
    return groups;
  };

  const renderSidebarMenu = () => {
    const groups = getMenuGroups();
    
    return (
      <div className="space-y-6">
        {/* Main Menu Items */}
        {groups.get('main')?.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-slate-700 border-l-4 border-blue-500'
                  : 'hover:bg-slate-700/50'
              } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`h-5 w-5 ${item.color}`} />
              {!sidebarCollapsed && (
                <span className="text-slate-300 font-medium">{item.label}</span>
              )}
            </button>
          );
        })}

        {/* Grouped Menu Items */}
        {Array.from(groups.entries())
          .filter(([groupName]) => groupName !== 'main')
          .map(([groupName, items]) => (
            <div key={groupName} className="space-y-2">
              {!sidebarCollapsed && (
                <h3 className="text-slate-400 text-sm font-semibold px-4 uppercase tracking-wide">
                  {groupName}
                </h3>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-slate-700 border-l-4 border-blue-500'
                        : 'hover:bg-slate-700/50'
                    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className={`h-4 w-4 ${item.color}`} />
                    {!sidebarCollapsed && (
                      <span className="text-slate-300 text-sm">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {/* Welcome Header */}
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
                    <div className="text-3xl font-bold text-white">{stats?.activeUsers || 0}</div>
                    <p className="text-blue-100 text-sm">Active Users</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</div>
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
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                  <p className="text-green-400 text-sm">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm font-medium">Total Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalPredictions || 0}</div>
                  <p className="text-blue-400 text-sm">+8% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm font-medium">Total Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalRewards || 0} NTIQ</div>
                  <p className="text-purple-400 text-sm">+15% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm font-medium">Accuracy Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.accuracyAverage || 0}%</div>
                  <p className="text-yellow-400 text-sm">+3% from last month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-20">
            <div className="text-slate-400 mb-4">
              <Database className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {menuItems.find(item => item.id === activeSection)?.label || "Section"}
            </h3>
            <p className="text-slate-400">
              Content for this section will be implemented soon.
            </p>
            {sectionLoading && (
              <div className="mt-4 text-blue-400">Loading data...</div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`bg-slate-800 border-r border-slate-700 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-80'
      }`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">Nectiq Admin</h1>
                <p className="text-slate-400 text-sm">Control Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {renderSidebarMenu()}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
}