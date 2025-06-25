import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, Award, Calendar, History, Eye, Activity, 
  DollarSign, CreditCard, Wallet, TrendingUp, TrendingDown, 
  UserCircle, Upload, RefreshCw, Target, Plus, Settings, 
  Bell, X, Check, Edit2
} from "lucide-react";
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { Achievements } from "@/components/achievements";

// Define types for data structures
interface User {
  id: number;
  uid: string;
  username: string;
  walletAddress: string | null;
  isAdmin: boolean;
  balance: number;
  totalPredictions: number;
  correctPredictions: number;
  totalRewards: number;
  profilePhoto?: string | null;
}

interface Prediction {
  id: number;
  uid: string;
  cryptocurrency: string;
  currentPrice: number;
  predictedPrice: number;
  priceDirection: string;
  stake: number;
  reward: number | null;
  timeFrame: string;
  predictedAt: string;
  resolvedAt: string | null;
  status: string;
  accuracy?: number;
}

interface Achievement {
  id: number;
  uid: string;
  achievementType: string;
  title: string;
  description: string;
  points: number;
  unlockedAt: string;
}

interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  reward: number;
  endDate: string;
  status: string;
}

interface RewardHistory {
  id: number;
  uid: string;
  predictionId: number;
  amount: number;
  type: string;
  earnedAt: string;
  cryptocurrency?: string;
}

interface Transaction {
  id: number;
  uid: string;
  type: string;
  amount: number;
  status: string;
  walletAddress?: string;
  transactionHash?: string;
  createdAt: string;
}

interface MarketWatch {
  id: number;
  uid: string;
  cryptocurrency: string;
  targetPrice: number;
  alertType: string;
  isActive: boolean;
  createdAt: string;
}

function MyPredictions() {
  const { data: predictions = [], isLoading } = useQuery<Prediction[]>({
    queryKey: ["/api/user/predictions"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-surface-light animate-pulse">
            <div className="h-4 bg-surface-light rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-surface-light rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-8 border border-surface-light text-center">
        <Clock className="mx-auto mb-4 text-slate-400" size={48} />
        <h3 className="text-xl font-bold mb-2">No Predictions Yet</h3>
        <p className="text-slate-400 mb-6">Start making predictions to see them here!</p>
        <Button className="bg-primary hover:bg-primary/80">
          Make Your First Prediction
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {predictions.map((prediction) => (
        <Card key={prediction.id} className="bg-surface border-surface-light">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {prediction.cryptocurrency.toUpperCase()}
                </h3>
                <p className="text-slate-400 text-sm">
                  Predicted {new Date(prediction.predictedAt).toLocaleDateString()}
                </p>
              </div>
              <Badge 
                variant={
                  prediction.status === 'pending' ? 'secondary' :
                  prediction.status === 'won' ? 'default' : 'destructive'
                }
              >
                {prediction.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-slate-400 text-xs">Current Price</p>
                <p className="text-white font-medium">${prediction.currentPrice}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Predicted Price</p>
                <p className="text-white font-medium">${prediction.predictedPrice}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Stake</p>
                <p className="text-white font-medium">{prediction.stake} NTIQ</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Potential Reward</p>
                <p className="text-primary font-medium">
                  {prediction.reward ? `${prediction.reward} NTIQ` : 'Pending'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {prediction.priceDirection === 'up' ? (
                  <TrendingUp className="text-green-400" size={16} />
                ) : (
                  <TrendingDown className="text-red-400" size={16} />
                )}
                <span className="text-sm text-slate-300">
                  Predicting {prediction.priceDirection} in {prediction.timeFrame}
                </span>
              </div>
              {prediction.accuracy && (
                <span className="text-sm text-primary">
                  Accuracy: {prediction.accuracy.toFixed(2)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DailyChallenges() {
  const { data: challenges = [], isLoading } = useQuery<DailyChallenge[]>({
    queryKey: ["/api/daily-challenges"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-surface-light animate-pulse">
            <div className="h-4 bg-surface-light rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-surface-light rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar size={20} />
            <span>Today's Challenges</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-surface-light rounded-lg p-4 border border-primary/20">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Morning Predictor</h3>
                <p className="text-slate-300 text-sm">Make 3 predictions before 12:00 PM today</p>
              </div>
              <Badge variant="secondary" className="ml-3">Active</Badge>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>1/3</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '33%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Award className="text-primary" size={16} />
                <span className="text-primary font-bold">+50 NTIQ</span>
              </div>
              <span className="text-slate-400 text-sm">Ends: Today</span>
            </div>
          </div>

          <div className="bg-surface-light rounded-lg p-4 border border-primary/20">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Accuracy Master</h3>
                <p className="text-slate-300 text-sm">Achieve 80% accuracy on your next 5 predictions</p>
              </div>
              <Badge variant="secondary" className="ml-3">Active</Badge>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>2/5</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Award className="text-primary" size={16} />
                <span className="text-primary font-bold">+100 NTIQ</span>
              </div>
              <span className="text-slate-400 text-sm">Ends: Tomorrow</span>
            </div>
          </div>

          <div className="bg-surface-light rounded-lg p-4 border border-primary/20">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">High Roller</h3>
                <p className="text-slate-300 text-sm">Stake more than 200 NTIQ in a single prediction</p>
              </div>
              <Badge variant="secondary" className="ml-3">Active</Badge>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>0/1</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Award className="text-primary" size={16} />
                <span className="text-primary font-bold">+75 NTIQ</span>
              </div>
              <span className="text-slate-400 text-sm">Ends: Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white">Weekly Challenges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-surface-light rounded-lg p-4 border border-secondary/20">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-medium mb-1">Consistency Champion</h3>
                <p className="text-slate-300 text-sm">Make at least 1 prediction every day this week</p>
              </div>
              <Badge variant="secondary">4/7 days</Badge>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Days Complete</span>
                <span>4/7</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Award className="text-secondary" size={16} />
                <span className="text-secondary font-bold">+500 NTIQ</span>
              </div>
              <span className="text-slate-400 text-sm">3 days left</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RewardHistoryComponent() {
  const { data: rewards = [], isLoading } = useQuery<RewardHistory[]>({
    queryKey: ["/api/user/rewards"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-4 border border-surface-light animate-pulse">
            <div className="h-4 bg-surface-light rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-surface-light rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const mockRewards = [
    {
      id: 1,
      type: "prediction",
      amount: 150,
      cryptocurrency: "Bitcoin",
      accuracy: 92.5,
      earnedAt: "2025-06-25T14:30:00Z",
      multiplier: "3x"
    },
    {
      id: 2,
      type: "achievement",
      amount: 100,
      description: "Accuracy Master - 5 consecutive 80%+ predictions",
      earnedAt: "2025-06-24T18:45:00Z"
    },
    {
      id: 3,
      type: "prediction",
      amount: 75,
      cryptocurrency: "Ethereum",
      accuracy: 78.2,
      earnedAt: "2025-06-24T10:15:00Z",
      multiplier: "1.5x"
    },
    {
      id: 4,
      type: "daily_challenge",
      amount: 50,
      description: "Morning Predictor - Complete 3 predictions before noon",
      earnedAt: "2025-06-23T11:30:00Z"
    },
    {
      id: 5,
      type: "prediction",
      amount: 250,
      cryptocurrency: "Solana",
      accuracy: 99.1,
      earnedAt: "2025-06-22T16:20:00Z",
      multiplier: "5x"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <History size={20} />
            <span>Recent Rewards</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRewards.map((reward) => (
            <div key={reward.id} className="bg-surface-light rounded-lg p-4 border border-primary/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {reward.type === 'prediction' && <Target className="text-primary" size={16} />}
                    {reward.type === 'achievement' && <Award className="text-secondary" size={16} />}
                    {reward.type === 'daily_challenge' && <Calendar className="text-orange-500" size={16} />}
                    <h3 className="text-white font-medium">
                      {reward.type === 'prediction' && `${reward.cryptocurrency} Prediction`}
                      {reward.type === 'achievement' && 'Achievement Unlocked'}
                      {reward.type === 'daily_challenge' && 'Daily Challenge'}
                    </h3>
                  </div>
                  
                  {reward.type === 'prediction' && (
                    <div className="flex items-center space-x-4 text-sm text-slate-300">
                      <span>Accuracy: {reward.accuracy}%</span>
                      <Badge variant="secondary" className="text-xs">{reward.multiplier}</Badge>
                    </div>
                  )}
                  
                  {(reward.type === 'achievement' || reward.type === 'daily_challenge') && (
                    <p className="text-slate-300 text-sm">{reward.description}</p>
                  )}
                  
                  <p className="text-slate-400 text-xs mt-1">
                    {new Date(reward.earnedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Award className="text-primary" size={16} />
                    <span className="text-primary font-bold text-lg">+{reward.amount}</span>
                    <span className="text-primary font-medium">NTIQ</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white">Reward Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-light rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="text-primary" size={16} />
                <span className="text-slate-300 text-sm">Predictions</span>
              </div>
              <p className="text-white font-bold text-lg">505 NTIQ</p>
              <p className="text-slate-400 text-xs">Last 30 days</p>
            </div>
            
            <div className="bg-surface-light rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="text-secondary" size={16} />
                <span className="text-slate-300 text-sm">Achievements</span>
              </div>
              <p className="text-white font-bold text-lg">300 NTIQ</p>
              <p className="text-slate-400 text-xs">Last 30 days</p>
            </div>
            
            <div className="bg-surface-light rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="text-orange-500" size={16} />
                <span className="text-slate-300 text-sm">Challenges</span>
              </div>
              <p className="text-white font-bold text-lg">150 NTIQ</p>
              <p className="text-slate-400 text-xs">Last 30 days</p>
            </div>
            
            <div className="bg-surface-light rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="text-green-500" size={16} />
                <span className="text-slate-300 text-sm">Total</span>
              </div>
              <p className="text-white font-bold text-lg">955 NTIQ</p>
              <p className="text-slate-400 text-xs">Last 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MarketWatchComponent() {
  const [showAddAlert, setShowAddAlert] = useState(false);
  const { data: watchlist = [], isLoading } = useQuery<MarketWatch[]>({
    queryKey: ["/api/user/market-watch"],
  });

  const { data: cryptoPrices = [] } = useQuery({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-surface-light animate-pulse">
            <div className="h-4 bg-surface-light rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-surface-light rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const mockWatchlist = [
    {
      id: 1,
      cryptocurrency: "Bitcoin",
      symbol: "BTC",
      targetPrice: 105000,
      currentPrice: 102547.83,
      alertType: "above",
      isActive: true,
      createdAt: "2025-06-24T10:30:00Z",
      priceChange24h: 2.3
    },
    {
      id: 2,
      cryptocurrency: "Ethereum",
      symbol: "ETH",
      targetPrice: 3800,
      currentPrice: 3845.67,
      alertType: "below",
      isActive: true,
      createdAt: "2025-06-23T14:20:00Z",
      priceChange24h: -1.2
    },
    {
      id: 3,
      cryptocurrency: "Solana",
      symbol: "SOL",
      targetPrice: 220,
      currentPrice: 218.45,
      alertType: "above",
      isActive: false,
      createdAt: "2025-06-22T09:15:00Z",
      priceChange24h: 0.8
    }
  ];

  const calculateProgress = (current: number, target: number, type: string) => {
    if (type === "above") {
      return Math.min((current / target) * 100, 100);
    } else {
      return Math.min(((target / current) * 100), 100);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center space-x-2">
              <Eye size={20} />
              <span>Price Alerts</span>
            </CardTitle>
            <Button 
              onClick={() => setShowAddAlert(true)}
              size="sm"
              className="bg-primary hover:bg-primary/80"
            >
              <Plus size={16} className="mr-1" />
              Add Alert
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockWatchlist.map((item) => {
            const progress = calculateProgress(item.currentPrice, item.targetPrice, item.alertType);
            const isTriggered = (item.alertType === "above" && item.currentPrice >= item.targetPrice) || 
                              (item.alertType === "below" && item.currentPrice <= item.targetPrice);
            
            return (
              <div key={item.id} className={`bg-surface-light rounded-lg p-4 border ${isTriggered ? 'border-green-500' : 'border-primary/20'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-medium">{item.cryptocurrency}</h3>
                      <Badge variant="secondary" className="text-xs">{item.symbol}</Badge>
                      {isTriggered && <Badge className="bg-green-500 text-white text-xs">Triggered!</Badge>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Current Price</p>
                        <p className="text-white font-medium">${item.currentPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Target Price</p>
                        <p className="text-white font-medium">${item.targetPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Alert: When price goes {item.alertType} target</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${isTriggered ? 'bg-green-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <Badge variant={item.isActive ? "default" : "secondary"} className="mb-2">
                      {item.isActive ? "Active" : "Paused"}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Settings size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400">
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-surface">
                  <span>Created: {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className={`flex items-center space-x-1 ${item.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.priceChange24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{item.priceChange24h >= 0 ? '+' : ''}{item.priceChange24h}% (24h)</span>
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white">Alert Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-light rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Eye className="text-primary" size={16} />
                <span className="text-slate-300 text-sm">Active Alerts</span>
              </div>
              <p className="text-white font-bold text-lg">2</p>
              <p className="text-slate-400 text-xs">Currently monitoring</p>
            </div>
            
            <div className="bg-surface-light rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Bell className="text-green-500" size={16} />
                <span className="text-slate-300 text-sm">Triggered</span>
              </div>
              <p className="text-white font-bold text-lg">1</p>
              <p className="text-slate-400 text-xs">This week</p>
            </div>
            
            <div className="bg-surface-light rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="text-secondary" size={16} />
                <span className="text-slate-300 text-sm">Above Target</span>
              </div>
              <p className="text-white font-bold text-lg">1</p>
              <p className="text-slate-400 text-xs">Price alerts</p>
            </div>
            
            <div className="bg-surface-light rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingDown className="text-orange-500" size={16} />
                <span className="text-slate-300 text-sm">Below Target</span>
              </div>
              <p className="text-white font-bold text-lg">1</p>
              <p className="text-slate-400 text-xs">Price alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceAnalytics() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  if (!user) return null;

  const accuracyRate = user.totalPredictions > 0 
    ? ((user.correctPredictions / user.totalPredictions) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{accuracyRate}%</div>
            <div className="text-slate-400">Accuracy Rate</div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{user.totalRewards}</div>
            <div className="text-slate-400">Total Rewards</div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-surface-light">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{user.totalPredictions}</div>
            <div className="text-slate-400">Total Predictions</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Win Rate</span>
            <span className="text-white">{accuracyRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Average Stake</span>
            <span className="text-white">
              {user.totalPredictions > 0 ? Math.round(user.balance / user.totalPredictions) : 0} NTIQ
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total Earnings</span>
            <span className="text-green-400">{user.totalRewards} NTIQ</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialSection() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/user/transactions"],
  });

  const [activeFinancialTab, setActiveFinancialTab] = useState("overview");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const queryClient = useQueryClient();

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        throw new Error('Failed to process withdrawal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      setWithdrawAmount("");
    },
  });

  const buyNTIQMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch('/api/transactions/buy-ntiq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        throw new Error('Failed to process purchase');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      setBuyAmount("");
    },
  });

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= (user?.balance || 0)) {
      withdrawMutation.mutate(amount);
    }
  };

  const handleBuyNTIQ = () => {
    const amount = parseFloat(buyAmount);
    if (amount > 0) {
      buyNTIQMutation.mutate(amount);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-surface-light animate-pulse">
            <div className="h-4 bg-surface-light rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-surface-light rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Navigation */}
      <Card className="bg-surface border-surface-light">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={activeFinancialTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveFinancialTab("overview")}
              className="flex items-center space-x-2"
            >
              <Wallet size={16} />
              <span>Overview</span>
            </Button>
            <Button
              variant={activeFinancialTab === "buy" ? "default" : "outline"}
              onClick={() => setActiveFinancialTab("buy")}
              className="flex items-center space-x-2"
            >
              <CreditCard size={16} />
              <span>Buy NTIQ</span>
            </Button>
            <Button
              variant={activeFinancialTab === "withdraw" ? "default" : "outline"}
              onClick={() => setActiveFinancialTab("withdraw")}
              className="flex items-center space-x-2"
            >
              <DollarSign size={16} />
              <span>Withdraw</span>
            </Button>
            <Button
              variant={activeFinancialTab === "history" ? "default" : "outline"}
              onClick={() => setActiveFinancialTab("history")}
              className="flex items-center space-x-2"
            >
              <History size={16} />
              <span>History</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Tab */}
      {activeFinancialTab === "overview" && (
        <Card className="bg-surface border-surface-light">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Wallet size={20} />
              <span>Financial Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-light rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{user?.balance?.toLocaleString() || "0"}</div>
                <div className="text-sm text-slate-400">Current Balance</div>
              </div>
              <div className="bg-surface-light rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{user?.totalRewards?.toLocaleString() || "0"}</div>
                <div className="text-sm text-slate-400">Total Earned</div>
              </div>
              <div className="bg-surface-light rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{user?.totalPredictions || "0"}</div>
                <div className="text-sm text-slate-400">Total Predictions</div>
              </div>
            </div>

            <div className="bg-surface-light rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Wallet Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Wallet Address:</span>
                  <span className="text-white font-mono text-sm">
                    {user?.walletAddress ? `${user.walletAddress.slice(0, 10)}...${user.walletAddress.slice(-10)}` : 'Not connected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Status:</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Member Since:</span>
                  <span className="text-white">January 2025</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buy NTIQ Tab */}
      {activeFinancialTab === "buy" && (
        <Card className="bg-surface border-surface-light">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <CreditCard size={20} />
              <span>Buy NTIQ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-surface-light rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Purchase NTIQ Tokens</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm">Amount (NTIQ)</label>
                  <Input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-surface border-surface-light text-white"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" onClick={() => setBuyAmount("100")}>100</Button>
                  <Button variant="outline" onClick={() => setBuyAmount("500")}>500</Button>
                  <Button variant="outline" onClick={() => setBuyAmount("1000")}>1K</Button>
                  <Button variant="outline" onClick={() => setBuyAmount("5000")}>5K</Button>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Exchange Rate:</span>
                    <span className="text-white">1 USD = 100 NTIQ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Total Cost:</span>
                    <span className="text-primary font-bold">
                      ${buyAmount ? (parseFloat(buyAmount) / 100).toFixed(2) : "0.00"} USD
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={handleBuyNTIQ}
                  disabled={!buyAmount || buyNTIQMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/80"
                >
                  {buyNTIQMutation.isPending ? "Processing..." : "Buy NTIQ"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Tab */}
      {activeFinancialTab === "withdraw" && (
        <Card className="bg-surface border-surface-light">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <DollarSign size={20} />
              <span>Withdraw Funds</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-surface-light rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Withdraw NTIQ</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm">Amount (NTIQ)</label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    max={user?.balance || 0}
                    className="bg-surface border-surface-light text-white"
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    Available: {user?.balance?.toLocaleString() || "0"} NTIQ
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" onClick={() => setWithdrawAmount("100")}>100</Button>
                  <Button variant="outline" onClick={() => setWithdrawAmount("500")}>500</Button>
                  <Button variant="outline" onClick={() => setWithdrawAmount("1000")}>1K</Button>
                  <Button variant="outline" onClick={() => setWithdrawAmount(user?.balance?.toString() || "0")}>Max</Button>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Withdrawal Fee:</span>
                    <span className="text-yellow-400">2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">You'll Receive:</span>
                    <span className="text-white font-bold">
                      {withdrawAmount ? (parseFloat(withdrawAmount) * 0.98).toFixed(0) : "0"} NTIQ
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || withdrawMutation.isPending || parseFloat(withdrawAmount) > (user?.balance || 0)}
                  variant="outline"
                  className="w-full border-red-500/50 hover:bg-red-500/10"
                >
                  {withdrawMutation.isPending ? "Processing..." : "Withdraw NTIQ"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History Tab */}
      {activeFinancialTab === "history" && (
        <Card className="bg-surface border-surface-light">
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Wallet className="mx-auto mb-2" size={32} />
                  <p>No transactions yet</p>
                </div>
              ) : (
                transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'buy' ? 'bg-green-500/20 text-green-400' : 
                        transaction.type === 'withdraw' ? 'bg-red-500/20 text-red-400' : 
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {transaction.type === 'buy' ? <TrendingUp size={16} /> : 
                         transaction.type === 'withdraw' ? <TrendingDown size={16} /> : 
                         <DollarSign size={16} />}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {transaction.type === 'buy' ? 'Buy NTIQ' : 
                           transaction.type === 'withdraw' ? 'Withdraw' : 
                           'Reward'}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        transaction.type === 'buy' || transaction.type === 'reward' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'withdraw' ? '-' : '+'}
                        {transaction.amount.toLocaleString()} NTIQ
                      </div>
                      <div className="text-xs text-slate-400">
                        {transaction.status === 'completed' ? 'Completed' : transaction.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// User Profile Component
function UserProfile() {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Update username mutation
  const updateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update username');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Username Updated",
        description: "Your username has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditingUsername(false);
      setNewUsername("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      const response = await fetch('/api/user/upload-profile-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload photo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only JPEG, PNG, and GIF files are allowed.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handlePhotoUpload = () => {
    if (selectedFile) {
      uploadPhotoMutation.mutate(selectedFile);
    }
  };

  const handlePhotoCancel = () => {
    setSelectedFile(null);
  };

  const handleUsernameEdit = () => {
    setNewUsername(user?.username || "");
    setIsEditingUsername(true);
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername("");
  };

  const handleUsernameSubmit = () => {
    if (!newUsername.trim()) {
      toast({
        title: "Invalid Username",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (newUsername.length < 3) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (newUsername === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    updateUsernameMutation.mutate(newUsername.trim());
  };

  if (!user) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h3 className="text-lg font-bold mb-4">Profile</h3>
        <div className="text-center py-8 text-slate-400">
          <UserCircle className="mx-auto mb-2" size={32} />
          <p>Please connect your wallet to view profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-surface border-surface-light">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <UserCircle className="text-white" size={32} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary/80 text-white rounded-full p-1 cursor-pointer transition-colors"
              >
                <Upload size={12} />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.username}</h2>
              <p className="text-slate-400">Active Member</p>
            </div>
          </div>

          {/* Photo upload preview and controls */}
          {selectedFile && (
            <div className="mb-4 p-4 bg-surface-light rounded-lg border border-primary/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-slate-400 text-sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handlePhotoUpload}
                    disabled={uploadPhotoMutation.isPending}
                    className="h-8 px-3"
                  >
                    {uploadPhotoMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      "Upload"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePhotoCancel}
                    className="h-8 px-3"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{user.balance}</div>
              <div className="text-sm text-slate-400">NTIQ Balance</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{user.totalPredictions || 0}</div>
              <div className="text-sm text-slate-400">Total Predictions</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{user.correctPredictions && user.totalPredictions ? `${((user.correctPredictions / user.totalPredictions) * 100).toFixed(1)}%` : '0%'}</div>
              <div className="text-sm text-slate-400">Accuracy Rate</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{user.totalRewards || 0}</div>
              <div className="text-sm text-slate-400">Total Rewards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-surface-light">
            <span className="text-slate-300">Username</span>
            <div className="flex items-center space-x-2">
              {isEditingUsername ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-40 h-8 text-sm bg-surface-light border-surface-light"
                    placeholder="Enter new username"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUsernameSubmit();
                      } else if (e.key === 'Escape') {
                        handleUsernameCancel();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleUsernameSubmit}
                    disabled={updateUsernameMutation.isPending}
                    className="h-8 px-2"
                  >
                    {updateUsernameMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUsernameCancel}
                    className="h-8 px-2"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{user.username}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleUsernameEdit}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                  >
                    <RefreshCw size={12} />
                  </Button>
                </div>
              )}
            </div>
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

      {/* Quick Actions */}
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="bg-surface-light border-surface-light hover:bg-primary/10">
              <Clock className="mr-2" size={16} />
              View Predictions
            </Button>
            <Button variant="outline" className="bg-surface-light border-surface-light hover:bg-primary/10">
              <Award className="mr-2" size={16} />
              Check Achievements
            </Button>
            <Button variant="outline" className="bg-surface-light border-surface-light hover:bg-primary/10">
              <History className="mr-2" size={16} />
              Reward History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Track your predictions, achievements, and rewards
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-surface border border-surface-light">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <UserCircle size={16} />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center space-x-2">
                <Clock size={16} />
                <span className="hidden sm:inline">My Predictions</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center space-x-2">
                <Award size={16} />
                <span className="hidden sm:inline">Achievements</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center space-x-2">
                <Calendar size={16} />
                <span className="hidden sm:inline">Daily Challenges</span>
              </TabsTrigger>
              <TabsTrigger value="rewards" className="flex items-center space-x-2">
                <History size={16} />
                <span className="hidden sm:inline">Reward History</span>
              </TabsTrigger>
              <TabsTrigger value="watch" className="flex items-center space-x-2">
                <Eye size={16} />
                <span className="hidden sm:inline">Market Watch</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center space-x-2">
                <Activity size={16} />
                <span className="hidden sm:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center space-x-2">
                <Wallet size={16} />
                <span className="hidden sm:inline">Financial</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <UserProfile />
            </TabsContent>
            
            <TabsContent value="predictions">
              <MyPredictions />
            </TabsContent>
            
            <TabsContent value="achievements">
              <Achievements />
            </TabsContent>
            
            <TabsContent value="challenges">
              <DailyChallenges />
            </TabsContent>
            
            <TabsContent value="rewards">
              <RewardHistoryComponent />
            </TabsContent>
            
            <TabsContent value="watch">
              <MarketWatchComponent />
            </TabsContent>

            <TabsContent value="performance">
              <PerformanceAnalytics />
            </TabsContent>

            <TabsContent value="financial">
              <FinancialSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}