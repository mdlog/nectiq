import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, DollarSign, Activity, TrendingUp, Award, Home } from "lucide-react";

// Minimal admin panel that should always work
export default function AdminMinimal() {
  const [activeTab, setActiveTab] = useState("overview");

  console.log('🔧 [ADMIN-MINIMAL] Component mounted');

  // Simple stats query
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: 1,
  });

  console.log('🔧 [ADMIN-MINIMAL] Stats data:', { stats, statsLoading, statsError });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Simple Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Nectiq Admin (Minimal)</h1>
              <p className="text-sm text-slate-400">Testing Panel</p>
            </div>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="debug" className="data-[state=active]:bg-blue-600">
              Debug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Users</p>
                      <p className="text-xl font-bold">
                        {statsLoading ? "Loading..." : stats?.totalUsers || 0}
                      </p>
                    </div>
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Predictions</p>
                      <p className="text-xl font-bold">
                        {statsLoading ? "Loading..." : stats?.totalPredictions || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Rewards</p>
                      <p className="text-xl font-bold">
                        {statsLoading ? "Loading..." : stats?.totalRewards || 0}
                      </p>
                    </div>
                    <Award className="h-6 w-6 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Users</p>
                      <p className="text-xl font-bold">
                        {statsLoading ? "Loading..." : stats?.activeUsers || 0}
                      </p>
                    </div>
                    <Activity className="h-6 w-6 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {statsError && (
              <Card className="bg-red-900/20 border-red-700">
                <CardContent className="p-4">
                  <p className="text-red-300">Error: {(statsError as any)?.message}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="debug" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm font-mono">
                  <p><span className="text-blue-400">Stats Loading:</span> {statsLoading ? 'Yes' : 'No'}</p>
                  <p><span className="text-blue-400">Stats Error:</span> {statsError ? 'Yes' : 'No'}</p>
                  <p><span className="text-blue-400">Stats Data:</span> {stats ? 'Available' : 'None'}</p>
                  <p><span className="text-blue-400">Component Status:</span> Rendered Successfully</p>
                  <p><span className="text-blue-400">Current Time:</span> {new Date().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}