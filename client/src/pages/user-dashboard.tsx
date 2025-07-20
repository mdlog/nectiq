import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  UserCircle, 
  Trophy, 
  Target, 
  Gift, 
  TrendingUp, 
  BarChart3, 
  Activity,
  Award,
  Calendar,
  Eye,
  CreditCard,
  Swords,
  Shield,
  Users,
  Crown,
  Gem,
  Star
} from "lucide-react";
import type { User } from "@shared/schema";
import type { UserStats, ActivePrediction, RecentReward } from "@/types";
import { Achievements } from "@/components/achievements";
import { DailyChallenges } from "@/components/daily-challenges";
import { ReferralSection } from "@/components/referral-section";
import { MultiChainFinancial } from "@/components/multi-chain-financial";

export default function UserDashboard() {
  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    retry: false,
  });

  // Fetch active predictions
  const { data: activePredictions, isLoading: predictionsLoading } = useQuery<ActivePrediction[]>({
    queryKey: ["/api/user/predictions/active"],
    retry: false,
  });

  // Fetch recent rewards
  const { data: recentRewards, isLoading: rewardsLoading } = useQuery<RecentReward[]>({
    queryKey: ["/api/user/rewards"],
    retry: false,
  });

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-400">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const accuracyLevel = {
    label: (stats?.accuracy || 0) >= 80 ? "Expert" : 
           (stats?.accuracy || 0) >= 60 ? "Advanced" : 
           (stats?.accuracy || 0) >= 40 ? "Intermediate" : "Beginner",
    color: (stats?.accuracy || 0) >= 80 ? "text-success" : 
           (stats?.accuracy || 0) >= 60 ? "text-warning" : 
           (stats?.accuracy || 0) >= 40 ? "text-primary" : "text-slate-400"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <Card className="bg-surface border-surface-light sticky top-8">
              <CardHeader className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      user.isAdmin 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}>
                      <UserCircle className="text-white" size={32} />
                      {user.isAdmin && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                          <Crown className="text-white" size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{user.username}</h2>
                    <p className="text-slate-400 text-sm">
                      {user.isAdmin ? 'Administrator' : 'Standard User'}
                    </p>
                    <p className="text-success font-semibold">
                      {user.balance?.toLocaleString() || 0} NTIQ
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <div className="px-6 pb-6">
                <Tabs defaultValue="profile" orientation="vertical" className="w-full">
                  <TabsList className="flex flex-col gap-4 h-auto w-full bg-transparent p-0">
                    <TabsTrigger 
                      value="profile" 
                      className="w-full justify-start px-5 py-4 bg-slate-800/50 hover:bg-slate-700/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 rounded-xl transition-all duration-300"
                    >
                      <UserCircle className="mr-3 h-5 w-5" />
                      Profile
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="predictions" 
                      className="w-full justify-start px-5 py-4 bg-slate-800/50 hover:bg-slate-700/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-xl transition-all duration-300"
                    >
                      <Target className="mr-3 h-5 w-5" />
                      My Predictions
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="achievements" 
                      className="w-full justify-start px-5 py-4 bg-slate-800/50 hover:bg-slate-700/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 rounded-xl transition-all duration-300"
                    >
                      <Award className="mr-3 h-5 w-5" />
                      Achievements
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="challenges" 
                      className="w-full justify-start px-5 py-4 bg-slate-800/50 hover:bg-slate-700/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 rounded-xl transition-all duration-300"
                    >
                      <Calendar className="mr-3 h-5 w-5" />
                      Daily Challenges
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="loyalty" 
                      className="w-full justify-start px-5 py-4 bg-slate-800/50 hover:bg-slate-700/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 rounded-xl transition-all duration-300"
                    >
                      <Crown className="mr-3 h-5 w-5" />
                      Loyalty
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="referral" 
                      className="w-full justify-start px-5 py-4 bg-slate-800/50 hover:bg-slate-700/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 rounded-xl transition-all duration-300"
                    >
                      <Users className="mr-3 h-5 w-5" />
                      Referral Program
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="financial" 
                      className="w-full justify-start px-5 py-4 bg-slate-800/50 hover:bg-slate-700/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 rounded-xl transition-all duration-300"
                    >
                      <CreditCard className="mr-3 h-5 w-5" />
                      Financial
                    </TabsTrigger>
                  </TabsList>

                  {/* Main Content Area */}
                  <div className="ml-8 flex-1">
                    {/* Profile Tab */}
                    <TabsContent value="profile" className="mt-0">
                      <Card className="bg-surface border-surface-light">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <UserCircle className="mr-2" size={20} />
                            Account Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b border-surface-light">
                            <span className="text-slate-300">User ID</span>
                            <span className="text-white font-medium">#{user.id}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-surface-light">
                            <span className="text-slate-300">Username</span>
                            <span className="text-white font-medium">{user.username}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-surface-light">
                            <span className="text-slate-300">Balance</span>
                            <span className="text-success font-semibold">{user.balance?.toLocaleString() || 0} NTIQ</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-surface-light">
                            <span className="text-slate-300">Wallet Address</span>
                            <span className="text-white font-mono text-sm">
                              {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Not connected'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-surface-light">
                            <span className="text-slate-300">Account Type</span>
                            <span className="text-white font-medium">{user.isAdmin ? 'Administrator' : 'Standard User'}</span>
                          </div>
                          <div className="flex justify-between items-center py-3">
                            <span className="text-slate-300">Member Status</span>
                            <span className="text-green-400 font-medium">Active</span>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* My Predictions Tab */}
                    <TabsContent value="predictions" className="mt-0">
                      <Card className="bg-surface border-surface-light">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Target className="mr-2" size={20} />
                            Active Predictions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {predictionsLoading ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-slate-400">Loading predictions...</p>
                            </div>
                          ) : !activePredictions || activePredictions.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                              <Target className="mx-auto mb-4" size={48} />
                              <h3 className="text-lg font-semibold mb-2">No Active Predictions</h3>
                              <p className="text-sm">Make your first prediction to start earning rewards!</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {activePredictions.map((prediction) => (
                                <div key={prediction.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold">{prediction.cryptocurrency}</div>
                                      <div className="text-sm text-slate-400">
                                        Stake: {prediction.stakeAmount} NTIQ
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                      Active
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Achievements Tab */}
                    <TabsContent value="achievements" className="mt-0">
                      <Achievements />
                    </TabsContent>

                    {/* Daily Challenges Tab */}
                    <TabsContent value="challenges" className="mt-0">
                      <DailyChallenges />
                    </TabsContent>

                    {/* Loyalty Tab */}
                    <TabsContent value="loyalty" className="mt-0">
                      <Card className="bg-surface border-surface-light">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Crown className="mr-2 text-yellow-500" size={20} />
                            Loyalty Tier Program
                          </CardTitle>
                          <p className="text-slate-400 text-sm">
                            Earn rewards and unlock exclusive benefits as you advance through loyalty tiers
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Current Tier Status */}
                          <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                  <Crown className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-white">Bronze Tier</h3>
                                  <p className="text-sm text-slate-400">Current Status</p>
                                </div>
                              </div>
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Active</Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-slate-300">Progress to Silver</span>
                                  <span className="text-slate-300">42.5%</span>
                                </div>
                                <Progress value={42.5} className="h-2" />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-slate-400">Lifetime Earnings</p>
                                  <p className="text-white font-semibold">425 NTIQ</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Current Multiplier</p>
                                  <p className="text-success font-semibold">1.0x</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Current Benefits */}
                          <div>
                            <h4 className="text-lg font-semibold mb-3 text-white">Current Benefits</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <div>
                                  <div className="font-medium text-slate-300">Base Rewards</div>
                                  <div className="text-xs text-slate-400">1.0x reward multiplier</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <Gift className="h-5 w-5 text-yellow-500" />
                                <div>
                                  <div className="font-medium text-slate-300">Monthly Bonus</div>
                                  <div className="text-xs text-slate-400">Basic loyalty bonus</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tier Roadmap */}
                          <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">Tier Roadmap</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/20">
                                <div className="flex items-center space-x-3">
                                  <Gem className="h-5 w-5 text-amber-400" />
                                  <div>
                                    <div className="font-medium text-amber-300">Silver</div>
                                    <div className="text-xs text-slate-400">1,000+ NTIQ • 1.25x multiplier • Priority support</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">Next</Badge>
                              </div>
                              
                              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center space-x-3">
                                  <Crown className="h-5 w-5 text-slate-400" />
                                  <div>
                                    <div className="font-medium text-slate-300">Gold</div>
                                    <div className="text-xs text-slate-400">5,000+ NTIQ • 1.5x multiplier • Exclusive features</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-slate-700 text-slate-400 border-slate-600">Locked</Badge>
                              </div>
                              
                              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex items-center space-x-3">
                                  <Gift className="h-5 w-5 text-slate-400" />
                                  <div>
                                    <div className="font-medium text-slate-300">Platinum</div>
                                    <div className="text-xs text-slate-400">25,000+ NTIQ • 2.0x multiplier • VIP benefits</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-slate-700 text-slate-400 border-slate-600">Locked</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Referral Program Tab */}
                    <TabsContent value="referral" className="mt-0">
                      <ReferralSection />
                    </TabsContent>

                    {/* Financial Tab */}
                    <TabsContent value="financial" className="mt-0">
                      <div className="space-y-6">
                        <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <h3 className="text-lg font-bold mb-2 text-black dark:text-white">Multi-Chain Financial System</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Deposit and withdrawal system for multiple blockchains
                          </p>
                        </div>
                        <MultiChainFinancial />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Performance Summary */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats?.totalPredictions || 0}</div>
                      <div className="text-sm text-slate-400">Total Predictions</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${accuracyLevel.color}`}>{stats?.accuracy || 0}%</div>
                      <div className="text-sm text-slate-400">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{stats?.totalRewards || 0}</div>
                      <div className="text-sm text-slate-400">Total Rewards</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning">
                        {stats?.rank ? `#${stats.rank}` : "Unranked"}
                      </div>
                      <div className="text-sm text-slate-400">Global Rank</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Rewards */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="mr-2" size={20} />
                    Recent Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rewardsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-slate-400">Loading rewards...</p>
                    </div>
                  ) : !recentRewards || recentRewards.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Gift className="mx-auto mb-4" size={48} />
                      <h3 className="text-lg font-semibold mb-2">No Rewards Yet</h3>
                      <p className="text-sm">Make accurate predictions to earn rewards!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentRewards.map((reward) => (
                        <div key={reward.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{reward.description}</div>
                              <div className="text-sm text-slate-400">
                                {new Date(reward.earnedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className={`font-bold ${reward.amount > 0 ? 'text-success' : 'text-error'}`}>
                              {reward.amount > 0 ? '+' : ''}{reward.amount} NTIQ
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}