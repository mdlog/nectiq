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
import { CountdownTimer } from '@/components/countdown-timer';
import { Swords, Plus, Search, Filter, Trophy, Clock, Users, DollarSign, Award } from 'lucide-react';

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
  const [historyPage, setHistoryPage] = useState(1);
  const [historyItemsPerPage] = useState(5);
  const { toast } = useToast();

  // Check user authentication
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  // Fetch battles data
  const { data: battles = [], isLoading: battlesLoading } = useQuery({
    queryKey: ['/api/battles/live'],
    refetchInterval: 2000, // Auto-refresh every 2 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  // Fetch battle statistics
  const { data: stats, isLoading: statsLoading } = useQuery<BattleStats>({
    queryKey: ['/api/battles/stats'],
    refetchInterval: 4000, // Auto-refresh every 4 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  // Fetch crypto prices for filtering
  const { data: cryptos = [] } = useQuery({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 1000, // Auto-refresh every 1 second
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
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

  // Filter battles for Open Battles tab (status = 'open')
  const openBattles = filteredBattles.filter((battle: Battle) => battle.status === 'open');
  
  // Filter battles for Active Battles tab (status = 'active')
  const activeBattles = filteredBattles.filter((battle: Battle) => battle.status === 'active');

  const getCryptoImageUrl = (cryptoId: string) => {
    const crypto = cryptos.find((c: any) => c.id === cryptoId);
    return crypto?.image || `https://assets.coingecko.com/coins/images/1/large/${cryptoId}.png`;
  };

  const getCryptoDisplayInfo = (cryptoId: string) => {
    const displayMapping: { [key: string]: { name: string, symbol: string } } = {
      bitcoin: { name: 'Bitcoin', symbol: 'BTC' },
      ethereum: { name: 'Ethereum', symbol: 'ETH' },
      binancecoin: { name: 'BNB', symbol: 'BNB' },
      cardano: { name: 'Cardano', symbol: 'ADA' },
      solana: { name: 'Solana', symbol: 'SOL' },
      stellar: { name: 'Stellar', symbol: 'XLM' },
      tron: { name: 'TRON', symbol: 'TRX' },
      sui: { name: 'Sui', symbol: 'SUI' },
      chainlink: { name: 'Chainlink', symbol: 'LINK' },
      polkadot: { name: 'Polkadot', symbol: 'DOT' },
      litecoin: { name: 'Litecoin', symbol: 'LTC' },
      'matic-network': { name: 'Polygon', symbol: 'MATIC' },
      hyperliquid: { name: 'Hyperliquid', symbol: 'HYPE' },
      'sahara-ai': { name: 'Sahara AI', symbol: 'SAHARA' }
    };
    
    return displayMapping[cryptoId] || { name: cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1), symbol: cryptoId.toUpperCase() };
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
          challengedPrediction: parseFloat(predictionPrice)
        })
      });

      const result = await response.json();
      
      toast({
        title: "Battle Joined!",
        description: `Successfully joined the ${selectedBattle.cryptocurrency} battle!`
      });
      setJoinDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/battles/live'] });
      
    } catch (error: any) {
      console.error('Join battle error:', error);
      
      // Extract error message from the error object
      let errorMessage = "An error occurred while joining the battle";
      
      if (error?.message) {
        // Remove the error code prefix (e.g., "400: ") to show clean message
        errorMessage = error.message.replace(/^\d+:\s*/, '');
        
        // Try to parse JSON from the error message if it looks like JSON
        try {
          const jsonMatch = errorMessage.match(/\{.*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.message) {
              errorMessage = parsed.message;
            }
          }
        } catch (parseError) {
          // If JSON parsing fails, use the original error message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Battle History Section Component
  const BattleHistorySection = () => {
    const { data: battleHistory, isLoading: isLoadingHistory, error } = useQuery({
      queryKey: ['/api/battles/history'],
    });

    const getCryptoImageUrl = (cryptoId: string) => {
      const imageMapping: { [key: string]: string } = {
        bitcoin: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        ethereum: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        binancecoin: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
        cardano: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
        solana: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        stellar: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
        tron: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
        sui: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg',
        chainlink: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
        polkadot: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
        litecoin: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
        'matic-network': 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
        hyperliquid: 'https://assets.coingecko.com/coins/images/33223/small/hyperliquid.png',
        'sahara-ai': 'https://assets.coingecko.com/coins/images/66681/small/SAHARA-token-200.png'
      };
      
      return imageMapping[cryptoId] || 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
    };

    const getCryptoDisplayInfo = (cryptoId: string) => {
      const displayMapping: { [key: string]: { name: string, symbol: string } } = {
        bitcoin: { name: 'Bitcoin', symbol: 'BTC' },
        ethereum: { name: 'Ethereum', symbol: 'ETH' },
        binancecoin: { name: 'BNB', symbol: 'BNB' },
        cardano: { name: 'Cardano', symbol: 'ADA' },
        solana: { name: 'Solana', symbol: 'SOL' },
        stellar: { name: 'Stellar', symbol: 'XLM' },
        tron: { name: 'TRON', symbol: 'TRX' },
        sui: { name: 'Sui', symbol: 'SUI' },
        chainlink: { name: 'Chainlink', symbol: 'LINK' },
        polkadot: { name: 'Polkadot', symbol: 'DOT' },
        litecoin: { name: 'Litecoin', symbol: 'LTC' },
        'matic-network': { name: 'Polygon', symbol: 'MATIC' },
        hyperliquid: { name: 'Hyperliquid', symbol: 'HYPE' },
        'sahara-ai': { name: 'Sahara AI', symbol: 'SAHARA' }
      };
      
      return displayMapping[cryptoId] || { name: cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1), symbol: cryptoId.toUpperCase() };
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

    if (error) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400">Error loading battle history. Please try again.</p>
          </CardContent>
        </Card>
      );
    }

    const completedBattles = battleHistory as any[] || [];

    if (completedBattles.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 text-gray-400 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
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

    // Pagination logic
    const totalItems = completedBattles.length;
    const totalPages = Math.ceil(totalItems / historyItemsPerPage);
    const startIndex = (historyPage - 1) * historyItemsPerPage;
    const endIndex = startIndex + historyItemsPerPage;
    const paginatedBattles = completedBattles.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
      setHistoryPage(page);
    };

    const renderPaginationButton = (page: number, isActive: boolean) => (
      <button
        key={page}
        onClick={() => handlePageChange(page)}
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        {page}
      </button>
    );

    const renderPagination = () => {
      if (totalPages <= 1) return null;

      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(renderPaginationButton(i, i === historyPage));
        }
      } else {
        pages.push(renderPaginationButton(1, historyPage === 1));
        
        if (historyPage > 3) {
          pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
        }
        
        const start = Math.max(2, historyPage - 1);
        const end = Math.min(totalPages - 1, historyPage + 1);
        
        for (let i = start; i <= end; i++) {
          pages.push(renderPaginationButton(i, i === historyPage));
        }
        
        if (historyPage < totalPages - 2) {
          pages.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
        }
        
        pages.push(renderPaginationButton(totalPages, historyPage === totalPages));
      }

      return (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} battles
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(historyPage - 1)}
              disabled={historyPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {pages}
            <button
              onClick={() => handlePageChange(historyPage + 1)}
              disabled={historyPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Battle History ({totalItems} completed)
          </h3>
        </div>
        
        <div className="grid gap-6">
          {paginatedBattles.map((battle: any) => (
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
                      <h4 className="font-semibold text-white">
                        {getCryptoDisplayInfo(battle.cryptocurrency).name}
                      </h4>
                      <p className="text-sm text-gray-300">
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
                    <p className="font-semibold text-gray-900 dark:text-white">{battle.challenged?.username || 'N/A'}</p>
                    <p className="text-lg font-bold text-red-900 dark:text-red-100">
                      {battle.challengedPrediction ? `$${parseFloat(battle.challengedPrediction).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6
                      })}` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Stake: {battle.stakeAmount} NTIQ
                    </div>
                    {(battle.winnerReward || battle.winner) && (
                      <div className="flex items-center text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4 mr-1" />
                        Reward: {battle.winnerReward || (battle.stakeAmount * 2)} NTIQ
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
        
        {/* Pagination Controls */}
        {renderPagination()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Swords className="h-10 w-10 text-gray-800 dark:text-white" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Prediction Battles
            </h1>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Challenge other users in cryptocurrency price predictions and win rewards!
            Create a battle or join existing battles to compete in real-time.
          </p>
        </div>

        {/* Battle Statistics */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
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

        {/* Create Battle Button */}
        <div className="mb-6 flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold">
                <Swords className="mr-2 h-5 w-5" />
                Create New Battle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Battle</DialogTitle>
              </DialogHeader>
              <PredictionBattles />
            </DialogContent>
          </Dialog>
        </div>

        {/* Battles Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live">Open Battles</TabsTrigger>
            <TabsTrigger value="create">Active Battles</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="live" className="mt-8">
            <div className="space-y-4">
              {battlesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Loading open battles...</p>
                </div>
              ) : openBattles.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Swords className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery || statusFilter !== 'all' || cryptoFilter !== 'all' 
                        ? 'No open battles match the current filters' 
                        : 'No open battles available yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchQuery || statusFilter !== 'all' || cryptoFilter !== 'all'
                        ? 'Try changing your search filters'
                        : 'Open battles are waiting for opponents to join. Check back later or create a new battle.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {openBattles.map((battle: Battle) => (
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
                              <h3 className="font-semibold text-white">
                                {getCryptoDisplayInfo(battle.cryptocurrency).name} ({getCryptoDisplayInfo(battle.cryptocurrency).symbol})
                              </h3>
                              <p className="text-sm text-gray-300">
                                Stake: {battle.stakeAmount} NTIQ
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(battle.status)}
                            <p className="text-sm text-gray-300 mt-1">
                              <CountdownTimer targetTime={battle.targetTime} />
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
                                  {user && user.id === battle.challengerId ? (
                                    `$${parseFloat(battle.challengerPrediction).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6
                                    })}`
                                  ) : (
                                    "🔒 Hidden"
                                  )}
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
          
          <TabsContent value="create" className="mt-8">
            <div className="space-y-4">
              {battlesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Loading active battles...</p>
                </div>
              ) : activeBattles.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Swords className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery || statusFilter !== 'all' || cryptoFilter !== 'all' 
                        ? 'No active battles match the current filters' 
                        : 'No active battles at the moment'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchQuery || statusFilter !== 'all' || cryptoFilter !== 'all'
                        ? 'Try changing your search filters'
                        : 'Active battles appear here when two players are competing. Check back later or join an open battle.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {activeBattles.map((battle: Battle) => (
                    <Card key={battle.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
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
                              <CardTitle className="text-lg capitalize">{getCryptoDisplayInfo(battle.cryptocurrency).name}</CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {battle.stakeAmount} NTIQ • <CountdownTimer targetTime={battle.targetTime} />
                              </div>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-600 text-white">
                            Active
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Battle participants */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="font-semibold text-blue-700 dark:text-blue-300">
                              {battle.challengerUsername}
                            </div>
                            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                              {user && (user.id === battle.challengerId || user.id === battle.challengedId) ? (
                                `$${parseFloat(battle.challengerPrediction).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}`
                              ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-400">🔒 Hidden</div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">Challenger</div>
                          </div>
                          
                          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="font-semibold text-red-700 dark:text-red-300">
                              {battle.challengedUsername || 'Opponent'}
                            </div>
                            <div className="text-lg font-bold text-red-900 dark:text-red-100">
                              {battle.challengedPrediction && user && (user.id === battle.challengerId || user.id === battle.challengedId) ? (
                                `$${parseFloat(battle.challengedPrediction).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}`
                              ) : battle.challengedPrediction ? (
                                <div className="text-sm text-gray-500 dark:text-gray-400">🔒 Hidden</div>
                              ) : (
                                '---'
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">Opponent</div>
                          </div>
                        </div>

                        {/* Current price */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Price</span>
                            <span className="font-semibold">
                              ${battle.currentPrice ? 
                                battle.currentPrice.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }) : 
                                'Loading...'
                              }
                            </span>
                          </div>
                          
                          {/* Win Probability Bar */}
                          {battle.challengerPrediction && battle.challengedPrediction && battle.currentPrice && (() => {
                            const currentPrice = battle.currentPrice;
                            const challengerPrediction = parseFloat(battle.challengerPrediction);
                            const challengedPrediction = parseFloat(battle.challengedPrediction);
                            
                            // Calculate accuracy percentages
                            const challengerAccuracy = Math.abs(challengerPrediction - currentPrice) / currentPrice * 100;
                            const challengedAccuracy = Math.abs(challengedPrediction - currentPrice) / currentPrice * 100;
                            
                            // Calculate win probabilities (inverse of accuracy - lower error = higher probability)
                            const totalError = challengerAccuracy + challengedAccuracy;
                            const challengerWinProb = totalError > 0 ? Math.round((challengedAccuracy / totalError) * 100) : 50;
                            const challengedWinProb = 100 - challengerWinProb;
                            
                            return (
                              <div className="mt-3 space-y-2">
                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                  <span>Win Probability</span>
                                </div>
                                
                                {/* Probability bar */}
                                <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${challengerWinProb}%` }}
                                  />
                                  <div 
                                    className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-500"
                                    style={{ width: `${challengedWinProb}%` }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-0.5 h-4 bg-gray-800 dark:bg-gray-200"></div>
                                  </div>
                                </div>
                                
                                {/* Percentage labels */}
                                <div className="flex justify-between text-xs font-medium">
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {battle.challengerUsername}: {challengerWinProb}%
                                  </span>
                                  <span className="text-red-600 dark:text-red-400">
                                    {battle.challengedUsername}: {challengedWinProb}%
                                  </span>
                                </div>
                                
                                {/* Accuracy details */}
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <span>Error: {challengerAccuracy.toFixed(2)}%</span>
                                  <span>Error: {challengedAccuracy.toFixed(2)}%</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-8">
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