import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Swords, Eye, MessageCircle, Flame, Rocket, ThumbsUp, Brain, Trophy, Clock, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Battle {
  id: number;
  challengerId: number;
  challengedId?: number;
  cryptocurrency: string;
  timeframe: string;
  stakeAmount: number;
  challengerPrediction: number;
  challengedPrediction?: number;
  currentPrice: number;
  status: string;
  targetTime: string;
  createdAt: string;
  spectatorCount: number;
  challenger: {
    username: string;
    profilePhoto?: string;
  };
  challenged?: {
    username: string;
    profilePhoto?: string;
  };
  timeLeft: number;
}

interface CreateBattleForm {
  cryptocurrency: string;
  timeframe: string;
  stakeAmount: number;
  challengerPrediction: number;
  isPublic: boolean;
}

export function PredictionBattles() {
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningBattle, setJoiningBattle] = useState<Battle | null>(null);
  const [joinPrediction, setJoinPrediction] = useState<number>(0);
  const [createForm, setCreateForm] = useState<CreateBattleForm>({
    cryptocurrency: '',
    timeframe: '',
    stakeAmount: 50,
    challengerPrediction: 0,
    isPublic: true
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  // Fetch live battles
  const { data: liveBattles = [], isLoading } = useQuery<Battle[]>({
    queryKey: ['/api/battles/live'],
    refetchInterval: 5000 // Update every 5 seconds
  });

  // Fetch cryptocurrencies for create form
  const { data: cryptos = [] } = useQuery({
    queryKey: ['/api/crypto/prices']
  });

  // Create battle mutation
  const createBattleMutation = useMutation({
    mutationFn: (data: CreateBattleForm) => apiRequest('/api/battles/create', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: 'Battle Created!',
        description: 'Your prediction battle has been created successfully.',
      });
      setShowCreateModal(false);
      setCreateForm({
        cryptocurrency: '',
        timeframe: '',
        stakeAmount: 50,
        challengerPrediction: 0,
        isPublic: true
      });
      // Force refresh the battles list with multiple strategies
      queryClient.invalidateQueries({ queryKey: ['/api/battles/live'] });
      queryClient.refetchQueries({ queryKey: ['/api/battles/live'] });
      // Also refresh after a short delay to ensure database consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/battles/live'] });
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create battle',
        variant: 'destructive',
      });
    }
  });

  // Join as spectator mutation
  const spectatorMutation = useMutation({
    mutationFn: (battleId: number) => apiRequest(`/api/battles/${battleId}/spectate`, {
      method: 'POST'
    }),
    onSuccess: () => {
      toast({
        title: 'Joined Battle',
        description: 'You are now spectating this battle.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/battles/live'] });
    }
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: ({ battleId, message }: { battleId: number; message: string }) => 
      apiRequest(`/api/battles/${battleId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ message })
      }),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: [`/api/battles/${selectedBattle?.id}/comments`] });
    }
  });

  // Join battle mutation
  const joinBattleMutation = useMutation({
    mutationFn: ({ battleId, prediction }: { battleId: number; prediction: number }) => 
      apiRequest(`/api/battles/${battleId}/join`, {
        method: 'POST',
        body: JSON.stringify({ challengedPrediction: prediction })
      }),
    onSuccess: (data: any) => {
      const fairnessInfo = data.fairnessInfo;
      let fairnessMessage = 'Anda telah bergabung dalam battle prediksi ini.';
      
      if (fairnessInfo) {
        fairnessMessage += `\n\nInformasi Keadilan:`;
        fairnessMessage += `\n• Pergerakan harga: ${fairnessInfo.priceMovement}%`;
        fairnessMessage += `\n• Multiplier keadilan: ${fairnessInfo.fairnessMultiplier}x`;
        fairnessMessage += `\n• Bonus waktu bergabung: ${fairnessInfo.joinTimeBonus}x`;
        fairnessMessage += `\n• Waktu bergabung: ${fairnessInfo.joinTimePercentage}% dari durasi battle`;
      }
      
      toast({
        title: 'Bergabung Battle Berhasil!',
        description: fairnessMessage,
      });
      setJoiningBattle(null);
      setJoinPrediction(0);
      queryClient.invalidateQueries({ queryKey: ['/api/battles/live'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Gagal bergabung battle',
        variant: 'destructive',
      });
    }
  });

  // React to battle mutation
  const reactionMutation = useMutation({
    mutationFn: ({ battleId, reactionType }: { battleId: number; reactionType: string }) => 
      apiRequest(`/api/battles/${battleId}/react`, {
        method: 'POST',
        body: JSON.stringify({ reactionType })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/battles/${selectedBattle?.id}/reactions`] });
    }
  });

  // Format time remaining
  const formatTimeLeft = (timeLeft: number) => {
    if (timeLeft <= 0) return 'Ended';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Get crypto logo URL
  const getCryptoImageUrl = (cryptoId: string) => {
    const cryptoMap: { [key: string]: string } = {
      'bitcoin': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      'ethereum': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      'binancecoin': 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
      'cardano': 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
      'solana': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      'polkadot': 'https://assets.coingecko.com/coins/images/12171/small/aJGBjJFU_400x400.jpg',
      'chainlink': 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
      'litecoin': 'https://assets.coingecko.com/coins/images/2/small/litecoin.png'
    };
    return cryptoMap[cryptoId] || `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`;
  };

  const handleCreateBattle = () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please connect your wallet to create prediction battles',
        variant: 'destructive',
      });
      return;
    }

    if (!createForm.cryptocurrency || !createForm.timeframe || !createForm.challengerPrediction) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (createForm.challengerPrediction <= 0) {
      toast({
        title: 'Error',
        description: 'Prediction price must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    createBattleMutation.mutate(createForm);
  };

  const handleJoinBattle = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Silakan hubungkan wallet untuk bergabung battle',
        variant: 'destructive',
      });
      return;
    }

    if (!joiningBattle) return;

    if (joinPrediction <= 0) {
      toast({
        title: 'Error',
        description: 'Masukkan prediksi harga yang valid',
        variant: 'destructive',
      });
      return;
    }

    // Check if user has enough balance
    if ((user as any)?.balance < joiningBattle.stakeAmount) {
      toast({
        title: 'Saldo Tidak Cukup',
        description: `Anda memerlukan ${joiningBattle.stakeAmount} NTIQ untuk bergabung battle ini`,
        variant: 'destructive',
      });
      return;
    }

    joinBattleMutation.mutate({
      battleId: joiningBattle.id,
      prediction: joinPrediction
    });
  };

  const BattleCard = ({ battle }: { battle: Battle }) => (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={getCryptoImageUrl(battle.cryptocurrency)} 
              alt={battle.cryptocurrency}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <CardTitle className="text-lg capitalize">{battle.cryptocurrency}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {battle.timeframe} • {formatTimeLeft(battle.timeLeft)}
              </div>
            </div>
          </div>
          <Badge variant={battle.status === 'active' ? 'default' : 'secondary'}>
            {battle.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Battle participants */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-700 dark:text-blue-300">
              {battle.challenger.username}
            </div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">${battle.challengerPrediction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-muted-foreground">Challenger</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="font-semibold text-red-700 dark:text-red-300">
              {battle.challenged?.username || 'Open'}
            </div>
            <div className="text-lg font-bold text-red-900 dark:text-red-100">
              {battle.challengedPrediction ? `$${battle.challengedPrediction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '---'}
            </div>
            <div className="text-xs text-muted-foreground">Opponent</div>
          </div>
        </div>

        {/* Current price and progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Price</span>
            <span className="font-semibold">${battle.currentPrice.toLocaleString()}</span>
          </div>
          
          {battle.challengerPrediction && battle.challengedPrediction && (
            <div className="space-y-1">
              <Progress 
                value={((battle.currentPrice - Math.min(battle.challengerPrediction, battle.challengedPrediction)) / 
                       (Math.max(battle.challengerPrediction, battle.challengedPrediction) - Math.min(battle.challengerPrediction, battle.challengedPrediction))) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${Math.min(battle.challengerPrediction, battle.challengedPrediction).toLocaleString()}</span>
                <span>${Math.max(battle.challengerPrediction, battle.challengedPrediction).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Battle info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>{battle.stakeAmount} NTIQ</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{battle.spectatorCount} watching</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Show Join button if battle is open and user is not the challenger */}
          {battle.status === 'open' && !battle.challengedId && user && (user as any).id !== battle.challengerId ? (
            <Button 
              size="sm" 
              onClick={() => setJoiningBattle(battle)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Swords className="w-4 h-4 mr-1" />
              Join Battle
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => spectatorMutation.mutate(battle.id)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              Watch
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedBattle(battle)}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="w-6 h-6" />
            Prediction Battles
          </h2>
          <p className="text-muted-foreground">
            Challenge other traders in head-to-head prediction battles
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                if (!user) {
                  toast({
                    title: 'Login Required',
                    description: 'Please connect your wallet to create prediction battles',
                    variant: 'destructive',
                  });
                  return;
                }
                setShowCreateModal(true);
              }}
              disabled={!user}
            >
              <Trophy className="w-4 h-4 mr-2" />
              {user ? 'Create Battle' : 'Login to Create Battle'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Battle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cryptocurrency</label>
                <Select 
                  value={createForm.cryptocurrency} 
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, cryptocurrency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(cryptos) && (cryptos as any[]).map((crypto: any) => (
                      <SelectItem key={crypto.id} value={crypto.id}>
                        {crypto.name} ({crypto.symbol.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Timeframe</label>
                <Select 
                  value={createForm.timeframe} 
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, timeframe: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="6h">6 Hours</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Stake Amount (NTIQ)</label>
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={createForm.stakeAmount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, stakeAmount: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Your Prediction ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={createForm.challengerPrediction}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, challengerPrediction: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <Button 
                onClick={handleCreateBattle} 
                disabled={createBattleMutation.isPending}
                className="w-full"
              >
                {createBattleMutation.isPending ? 'Creating...' : 'Create Battle'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Live battles grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </Card>
          ))}
        </div>
      ) : (liveBattles as Battle[]).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(liveBattles as Battle[]).map((battle: Battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Swords className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Battles</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to create a prediction battle and challenge other traders!
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create First Battle
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Battle detail modal */}
      {selectedBattle && (
        <Dialog open={!!selectedBattle} onOpenChange={() => setSelectedBattle(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <img 
                  src={getCryptoImageUrl(selectedBattle.cryptocurrency)} 
                  alt={selectedBattle.cryptocurrency}
                  className="w-6 h-6 rounded-full"
                />
                {selectedBattle.cryptocurrency.toUpperCase()} Battle
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="spectators">Spectators</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {selectedBattle.challenger.username}
                    </div>
                    <div className="text-2xl font-bold">${selectedBattle.challengerPrediction.toLocaleString()}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="font-semibold text-red-700 dark:text-red-300">
                      {selectedBattle.challenged?.username || 'Open'}
                    </div>
                    <div className="text-2xl font-bold">
                      {selectedBattle.challengedPrediction ? `$${selectedBattle.challengedPrediction.toLocaleString()}` : '---'}
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div className="text-3xl font-bold">${selectedBattle.currentPrice.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatTimeLeft(selectedBattle.timeLeft)} remaining
                  </div>
                </div>

                {/* Reaction buttons */}
                <div className="flex justify-center gap-2">
                  {[
                    { type: 'like', icon: ThumbsUp, label: 'Like' },
                    { type: 'fire', icon: Flame, label: 'Fire' },
                    { type: 'rocket', icon: Rocket, label: 'Rocket' },
                    { type: 'thinking', icon: Brain, label: 'Thinking' }
                  ].map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => reactionMutation.mutate({ battleId: selectedBattle.id, reactionType: type })}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="space-y-4">
                <div className="h-48 border rounded-lg p-4 overflow-y-auto space-y-2">
                  {/* Sample comments - replace with real data */}
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-sm">Spectator1</div>
                      <div className="text-sm">This is going to be close!</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    rows={2}
                  />
                  <Button 
                    onClick={() => commentMutation.mutate({ battleId: selectedBattle.id, message: newComment })}
                    disabled={!newComment.trim() || commentMutation.isPending}
                  >
                    Send
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="spectators" className="space-y-4">
                <div className="space-y-2">
                  {/* Sample spectators - replace with real data */}
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-sm">Spectator1</div>
                      <div className="text-xs text-muted-foreground">Joined 30 minutes ago</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Join Battle Dialog */}
      {joiningBattle && (
        <Dialog open={!!joiningBattle} onOpenChange={() => setJoiningBattle(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bergabung Battle Prediksi</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={getCryptoImageUrl(joiningBattle.cryptocurrency)} 
                    alt={joiningBattle.cryptocurrency}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-semibold capitalize">{joiningBattle.cryptocurrency}</div>
                    <div className="text-sm text-muted-foreground">{joiningBattle.timeframe}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Taruhan</div>
                    <div className="font-semibold">{joiningBattle.stakeAmount} NTIQ</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Prediksi Lawan</div>
                    <div className="font-semibold">${joiningBattle.challengerPrediction.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prediksi Harga Anda (USD)</label>
                <Input
                  type="number"
                  placeholder="Masukkan prediksi harga..."
                  value={joinPrediction || ''}
                  onChange={(e) => setJoinPrediction(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  Siapa yang lebih akurat akan memenangkan {joiningBattle.stakeAmount * 2} NTIQ
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setJoiningBattle(null)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleJoinBattle}
                  disabled={joinBattleMutation.isPending || !joinPrediction}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {joinBattleMutation.isPending ? 'Bergabung...' : 'Bergabung Battle'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}