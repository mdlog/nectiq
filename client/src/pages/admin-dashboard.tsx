import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { 
  BarChart3, Users, TrendingUp, DollarSign, Activity, Settings, 
  Shield, Database, Search, Bell, User, ChevronDown, Menu, 
  Target, Trophy, Gamepad2, AlertTriangle, RefreshCw, Download
} from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType, Prediction } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalRewards: number;
  activeUsers: number;
  accuracyAverage: number;
  totalStaked: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

function MetricCard({ title, value, icon, trend, color }: MetricCardProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-gray-400 text-xs mt-1">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
        active 
          ? 'bg-red-600 text-white shadow-lg' 
          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

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

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-white text-xl font-bold">Access Denied</h1>
          <p className="text-gray-400 mt-2">You don't have permission to access this panel.</p>
          <Button 
            onClick={() => setLocation("/home")} 
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Back to App
          </Button>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { icon: <BarChart3 />, label: "Dashboard", section: "Dashboard" },
    { icon: <Users />, label: "Users", section: "Users" },
    { icon: <Target />, label: "Predictions", section: "Predictions" },
    { icon: <Trophy />, label: "Battles", section: "Battles" },
    { icon: <Gamepad2 />, label: "Tournaments", section: "Tournaments" },
    { icon: <Shield />, label: "Security", section: "Security" },
    { icon: <Settings />, label: "Settings", section: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-white" size={18} />
              </div>
              <span className="text-white font-bold text-xl">DarkPan</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white lg:hidden"
            >
              <Menu size={20} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search..."
                className="pl-9 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 w-64"
              />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* User menu */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gray-700 text-white">
                  {user.username?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-white text-sm font-medium">{user.username || 'Admin'}</p>
                <p className="text-gray-400 text-xs">Admin</p>
              </div>
              <ChevronDown className="text-gray-400" size={16} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`bg-gray-800/30 border-r border-gray-700/50 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16'
        } ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="p-6">
            {/* Admin Profile */}
            <div className="flex items-center space-x-3 mb-8">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gray-700 text-white">
                  {user.username?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div>
                  <p className="text-white font-medium">{user.username || 'Admin'}</p>
                  <p className="text-gray-400 text-sm">Admin</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.section}
                  icon={item.icon}
                  label={sidebarOpen ? item.label : ''}
                  active={activeSection === item.section}
                  onClick={() => setActiveSection(item.section)}
                />
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeSection === "Dashboard" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-white text-2xl font-bold">Dashboard</h1>
                  <p className="text-gray-400 mt-1">Welcome back to Nectiq Admin Panel</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Download size={16} className="mr-2" />
                  Export Data
                </Button>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Today Sale"
                  value={`$${stats?.totalStaked?.toLocaleString() || '0'}`}
                  icon={<TrendingUp className="text-white" size={24} />}
                  color="bg-red-600"
                />
                <MetricCard
                  title="Total Sale"
                  value={`$${stats?.totalRewards?.toLocaleString() || '0'}`}
                  icon={<BarChart3 className="text-white" size={24} />}
                  color="bg-red-600"
                />
                <MetricCard
                  title="Today Revenue"
                  value={`$${stats?.totalStaked?.toLocaleString() || '0'}`}
                  icon={<DollarSign className="text-white" size={24} />}
                  color="bg-red-600"
                />
                <MetricCard
                  title="Total Revenue"
                  value={`$${stats?.totalRewards?.toLocaleString() || '0'}`}
                  icon={<Activity className="text-white" size={24} />}
                  color="bg-red-600"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Worldwide Sales Chart */}
                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Worldwide Sales</CardTitle>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400">
                      Show All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-900/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="mx-auto text-gray-600 mb-2" size={48} />
                        <p className="text-gray-400">Chart visualization coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales & Revenue Chart */}
                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Sales & Revenue</CardTitle>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400">
                      Show All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-900/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="mx-auto text-gray-600 mb-2" size={48} />
                        <p className="text-gray-400">Chart visualization coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Sales Table */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Recent Sales</CardTitle>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400">
                    Show All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.slice(0, 5).map((prediction) => (
                      <div key={prediction.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                            <Target className="text-white" size={16} />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {prediction.cryptocurrency} Prediction
                            </p>
                            <p className="text-gray-400 text-sm">
                              ${prediction.predictedPrice?.toLocaleString()} predicted
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            {prediction.stakeAmount} NTIQ
                          </p>
                          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            {prediction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {predictions.length === 0 && (
                      <div className="text-center py-8">
                        <Target className="mx-auto text-gray-600 mb-2" size={48} />
                        <p className="text-gray-400">No recent predictions</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other sections can be added here */}
          {activeSection !== "Dashboard" && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Settings size={48} className="mx-auto" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">{activeSection}</h2>
              <p className="text-gray-400">This section is under development</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}