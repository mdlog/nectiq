import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { PredictionBattles } from '@/components/prediction-battles';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Swords, Plus, Search, Filter, Trophy, Clock, Users, DollarSign } from 'lucide-react';

interface Battle {
  id: number;
  challengerId: number;
  challengerUsername: string;
  challengedId?: number;
  challengedUsername?: string;
  cryptocurrency: string;
  challengerPrediction: string;
  challengedPrediction?: string;
  stakeAmount: number;
  targetTime: string;
  status: string;
  timeLeft: number;
  currentPrice?: number;
}

interface BattleStats {
  totalBattles: number;
  activeBattles: number;
  completedBattles: number;
  openBattles: number;
  totalStaked: number;
  averageStake: number;
}

export default function BattlesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cryptoFilter, setCryptoFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('live');
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [predictionPrice, setPredictionPrice] = useState('');
  const { toast } = useToast();

  // Check user authentication
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  // Fetch battles data
  const { data: battles = [], isLoading: battlesLoading } = useQuery({
    queryKey: ['/api/battles/live'],
    refetchInterval: 5000,
  });

  // Fetch battle statistics
  const { data: stats, isLoading: statsLoading } = useQuery<BattleStats>({
    queryKey: ['/api/battles/stats'],
  });

  // Fetch crypto prices for filtering
  const { data: cryptos = [] } = useQuery({
    queryKey: ['/api/crypto/prices'],
  });

  // Filter battles based on search and filters
  const filteredBattles = battles.filter((battle: Battle) => {
    const matchesSearch = battle.cryptocurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         battle.challengerUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         battle.challengedUsername?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || battle.status === statusFilter;
    const matchesCrypto = cryptoFilter === 'all' || battle.cryptocurrency === cryptoFilter;
    
    return matchesSearch && matchesStatus && matchesCrypto;
  });

  const getCryptoImageUrl = (cryptoId: string) => {
    const crypto = cryptos.find((c: any) => c.id === cryptoId);
    return crypto?.image || `https://assets.coingecko.com/coins/images/1/large/${cryptoId}.png`;
  };

  const formatTimeLeft = (timeLeft: number) => {
    if (timeLeft <= 0) return 'Ended';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Join battle mutation
  const joinBattleMutation = useQuery({
    queryKey: ['/api/battles/join', selectedBattle?.id],
    enabled: false
  });

  const handleJoinBattle = (battle: Battle) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in first to join the battle.",
        variant: "destructive"
      });
      return;
    }

    setSelectedBattle(battle);
    setPredictionPrice('');
    setJoinDialogOpen(true);
  };

  const submitJoinBattle = async () => {
    if (!selectedBattle || !predictionPrice || !user) return;

    try {
      const response = await apiRequest(`/api/battles/${selectedBattle.id}/join`, {
        method: 'POST',
        body: JSON.stringify({
          prediction: parseFloat(predictionPrice)
        })
      });

      if (response.ok) {
        toast({
          title: "Battle Joined!",
          description: `Successfully joined the ${selectedBattle.cryptocurrency} battle!`
        });
        setJoinDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['/api/battles/live'] });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to join battle",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while joining the battle",
        variant: "destructive"
      });
    }
  };

  // Battle History Section Component
  const BattleHistorySection = () => {
    const { data: battleHistory, isLoading: isLoadingHistory } = useQuery({
      queryKey: ['/api/battles/history'],
    });

    const getCryptoImageUrl = (cryptoId: string) => {
      const cryptoPrices = cryptosQuery.data as any[];
      if (cryptoPrices) {
        const cryptoData = cryptoPrices.find((crypto: any) => crypto.id === cryptoId);
        if (cryptoData?.image) return cryptoData.image;
      }
      
      const imageMapping: { [key: string]: string } = {
        bitcoin: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        ethereum: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        binancecoin: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
        cardano: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
        solana: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        stellar: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
        tron: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
        sui: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg'
      };
      
      return imageMapping[cryptoId] || 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
    };

    if (isLoadingHistory) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading battle history...</p>
          </CardContent>
        </Card>
      );
    }

    const completedBattles = battleHistory as any[] || [];

    if (completedBattles.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Battle History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No completed battles found. Start participating in battles to see your history here.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Battle History ({completedBattles.length} completed)
          </h3>
        </div>
        
        <div className="grid gap-6">
          {completedBattles.map((battle: any) => (
            <Card key={battle.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={getCryptoImageUrl(battle.cryptocurrency)} 
                      alt={battle.cryptocurrency}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {battle.cryptocurrency.toUpperCase()}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(battle.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                      Completed
                    </Badge>
                    {battle.winner && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        <Award className="w-3 h-3 mr-1" />
                        Winner: {battle.winner.username}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Challenger */}
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Challenger</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{battle.challenger.username}</p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      ${parseFloat(battle.challengerPrediction).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6
                      })}
                    </p>
                  </div>

                  {/* Actual Price */}
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Final Price</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${battle.actualPrice ? parseFloat(battle.actualPrice).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6
                      }) : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(battle.targetTime).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Opponent */}
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">Opponent</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{battle.challengedUsername || 'N/A'}</p>
                    <p className="text-lg font-bold text-red-900 dark:text-red-100">
                      {battle.challengedPrediction ? `$${parseFloat(battle.challengedPrediction).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6
                      })}` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Stake: {battle.stakeAmount} NTIQ
                    </div>
                    {battle.winnerReward && (
                      <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <Award className="w-4 h-4 mr-1" />
                        Reward: {battle.winnerReward} NTIQ
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Duration: {battle.timeframe}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Swords className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Prediction Battles
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Challenge other users in cryptocurrency price predictions and win rewards!
            Create a battle or join existing battles.
          </p>
        </div>

        {/* Battle Statistics */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalBattles}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Battles</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeBattles}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.openBattles}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalStaked.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Staked NTIQ</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search battles by crypto or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={cryptoFilter} onValueChange={setCryptoFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Crypto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crypto</SelectItem>
                  {cryptos.map((crypto: any) => (
                    <SelectItem key={crypto.id} value={crypto.id}>
                      {crypto.symbol.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Battles Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live">Live Battles</TabsTrigger>
            <TabsTrigger value="create">Create Battle</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="live" className="mt-6">
            <div className="space-y-4">
              {battlesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Loading battles...</p>
                </div>
              ) : filteredBattles.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Swords className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery || statusFilter !== 'all' || cryptoFilter !== 'all' 
                        ? 'No battles match the current filters' 
                        : 'No battles available yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchQuery || statusFilter !== 'all' || cryptoFilter !== 'all'
                        ? 'Try changing your search filters'
                        : 'Create the first battle or wait for other users to create battles'}
                    </p>
                    {(!searchQuery && statusFilter === 'all' && cryptoFilter === 'all') && (
                      <Button onClick={() => setActiveTab('create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Battle
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredBattles.map((battle: Battle) => (
                    <Card key={battle.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getCryptoImageUrl(battle.cryptocurrency)}
                              alt={battle.cryptocurrency}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://assets.coingecko.com/coins/images/1/large/${battle.cryptocurrency}.png`;
                              }}
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {battle.cryptocurrency.toUpperCase()} Battle
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Stake: {battle.stakeAmount} NTIQ
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(battle.status)}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {formatTimeLeft(battle.timeLeft)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Battle Layout - 3 columns for desktop, stacked for mobile */}
                        <div className="space-y-4 md:space-y-0">
                          {/* Mobile: Current Price First */}
                          <div className="md:hidden">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Current Price
                              </h4>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {battle.currentPrice ? 
                                  `$${battle.currentPrice.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 6
                                  })}` : 
                                  'Loading...'
                                }
                              </p>
                            </div>
                          </div>

                          {/* Desktop/Mobile: Participants Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Challenger */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <div className="text-center">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                  Challenger
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  {battle.challengerUsername}
                                </p>
                                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                  ${parseFloat(battle.challengerPrediction).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 6
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            {/* Current Price - Desktop Only */}
                            <div className="hidden md:block bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                              <div className="text-center">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                  Current Price
                                </h4>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {battle.currentPrice ? 
                                    `$${battle.currentPrice.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6
                                    })}` : 
                                    'Loading...'
                                  }
                                </p>
                              </div>
                            </div>
                            
                            {/* Opponent */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                              <div className="text-center">
                                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                                  Opponent
                                </h4>
                                {battle.challengedUsername ? (
                                  <>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      {battle.challengedUsername}
                                    </p>
                                    <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                                      ${parseFloat(battle.challengedPrediction || '0').toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 6
                                      })}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                      Waiting...
                                    </p>
                                    <Button 
                                      size="sm" 
                                      className="bg-purple-600 hover:bg-purple-700 text-white"
                                      onClick={() => handleJoinBattle(battle)}
                                    >
                                      Join Battle
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="mt-6">
            <PredictionBattles />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <BattleHistorySection />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Join Battle Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Battle</DialogTitle>
          </DialogHeader>
          
          {selectedBattle && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-lg">
                  {selectedBattle.cryptocurrency}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stake: {selectedBattle.stakeAmount} NTIQ
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Price: ${selectedBattle.currentPrice?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                  }) || 'Loading...'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prediction">Your Price Prediction ($)</Label>
                <Input
                  id="prediction"
                  type="number"
                  placeholder="Enter your price prediction..."
                  value={predictionPrice}
                  onChange={(e) => setPredictionPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setJoinDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={submitJoinBattle}
                  disabled={!predictionPrice || parseFloat(predictionPrice) <= 0}
                >
                  Join Battle
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}