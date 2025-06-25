import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, Award, Calendar, History, Eye, Activity, 
  DollarSign, CreditCard, Wallet, TrendingUp, TrendingDown, 
  UserCircle, Upload, RefreshCw
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
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <Card key={challenge.id} className="bg-surface border-surface-light">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{challenge.title}</h3>
                <p className="text-slate-400">{challenge.description}</p>
              </div>
              <Badge variant="secondary">{challenge.reward} NTIQ</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">
                Ends: {new Date(challenge.endDate).toLocaleDateString()}
              </span>
              <Button size="sm" disabled={challenge.status === 'completed'}>
                {challenge.status === 'completed' ? 'Completed' : 'Start Challenge'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
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

  return (
    <div className="space-y-4">
      {rewards.map((reward) => (
        <Card key={reward.id} className="bg-surface border-surface-light">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">+{reward.amount} NTIQ</p>
                <p className="text-slate-400 text-sm">
                  {reward.type} - {reward.cryptocurrency || 'General'}
                </p>
              </div>
              <span className="text-slate-300 text-sm">
                {new Date(reward.earnedAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MarketWatchComponent() {
  const { data: watchlist = [], isLoading } = useQuery<MarketWatch[]>({
    queryKey: ["/api/user/market-watch"],
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

  return (
    <div className="space-y-4">
      {watchlist.map((item) => (
        <Card key={item.id} className="bg-surface border-surface-light">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {item.cryptocurrency.toUpperCase()}
                </h3>
                <p className="text-slate-400">Target: ${item.targetPrice}</p>
              </div>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-slate-300 text-sm">
              Alert Type: {item.alertType} • Created: {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
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
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/user/transactions"],
  });

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="h-16 bg-primary hover:bg-primary/80">
          <CreditCard className="mr-2" size={20} />
          Buy NTIQ
        </Button>
        <Button variant="outline" className="h-16 bg-surface-light border-surface-light hover:bg-primary/10">
          <DollarSign className="mr-2" size={20} />
          Withdraw
        </Button>
        <Button variant="outline" className="h-16 bg-surface-light border-surface-light hover:bg-primary/10">
          <Wallet className="mr-2" size={20} />
          Wallet Info
        </Button>
      </div>

      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No transactions yet</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-3 border-b border-surface-light last:border-0">
                <div>
                  <p className="text-white font-medium">{transaction.type}</p>
                  <p className="text-slate-400 text-sm">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} NTIQ
                  </p>
                  <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
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
              <div className="space-y-6">
                <Card className="bg-surface border-surface-light">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <UserCircle className="text-white" size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">User Profile</h2>
                        <p className="text-slate-400">Active Member</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-surface-light rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-primary">1000</div>
                        <div className="text-sm text-slate-400">NTIQ Balance</div>
                      </div>
                      <div className="bg-surface-light rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">5</div>
                        <div className="text-sm text-slate-400">Total Predictions</div>
                      </div>
                      <div className="bg-surface-light rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">80%</div>
                        <div className="text-sm text-slate-400">Accuracy Rate</div>
                      </div>
                      <div className="bg-surface-light rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">250</div>
                        <div className="text-sm text-slate-400">Total Rewards</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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