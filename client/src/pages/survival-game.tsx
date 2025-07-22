import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { TournamentCard } from '@/components/tournament-card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WalletRequiredModal } from '@/components/WalletRequiredModal';
import { useWalletRequired } from '@/hooks/useWalletRequired';
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

// Types
interface SurvivalTournament {
  id: number;
  title: string;
  description: string;
  cryptocurrency: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  rewardAmount: number;
  rewardType: string;
  status: 'open' | 'active' | 'completed' | 'cancelled';
  roundDuration: number;
  round1Duration?: number | null;
  round2Duration?: number | null;
  round3Duration?: number | null;
  individualRoundDurations?: string | null;
  startTime: string;
  endTime: string;
  nextRoundTime: string;
  participants: Array<{
    id: number;
    userId: number;
    status: string;
    username?: string;
    profilePhoto?: string;
  }>;
  rounds: Array<{
    id: number;
    roundNumber: number;
    status: string;
    startTime: string;
    endTime: string;
    startPrice?: number;
    endPrice?: number;
  }>;
  currentRound: number;
}

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const SurvivalGame = () => {
  // State for pagination, search, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const tournamentsPerPage = 4; // 4 tournaments per page
  
  // Wallet requirement system
  const { isModalOpen, actionType, checkWalletRequired, onWalletConnected, closeModal } = useWalletRequired();

  // Fetch semua tournament (open dan active)
  const { data: tournaments = [], isLoading: tournamentLoading, error: tournamentError } = useQuery<SurvivalTournament[]>({
    queryKey: ['/api/survival-tournaments'],
    refetchInterval: 3000, // Refresh setiap 3 detik
    retry: 1
  });

  // Filter and search tournaments
  const filteredTournaments = useMemo(() => {
    let filtered = tournaments.filter(t => t.status === 'open' || t.status === 'active' || t.status === 'completed');
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(tournament => 
        tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.cryptocurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [tournaments, searchQuery, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTournaments.length / tournamentsPerPage);
  const startIndex = (currentPage - 1) * tournamentsPerPage;
  const endIndex = startIndex + tournamentsPerPage;
  const displayTournaments = filteredTournaments.slice(startIndex, endIndex);

  // Reset to page 1 when search query or filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  // Fetch live Pyth Network prices for survival gameplay
  const { data: cryptoPrices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 3000, // Refresh every 3 seconds for live Pyth Network data
    staleTime: 1000, // Data considered fresh for 1 second
    retry: 2,
  });

  if (tournamentLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Nectiq Survival Mode</h1>
              <p className="text-gray-600 mb-8">Loading tournaments...</p>
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (tournamentError) {
    // Don't show error for rate limiting, show loading instead
    const errorMessage = String(tournamentError);
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('Too many requests');
    
    if (isRateLimit) {
      return (
        <>
          <Header />
          <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold mb-4">Nectiq Survival Mode</h1>
                <p className="text-yellow-600 mb-8">Loading tournaments... Please wait</p>
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-64 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </>
      );
    }
    
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Nectiq Survival Mode</h1>
              <p className="text-red-600 mb-8">Error loading tournaments: {errorMessage}</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }


  return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">Nectiq Survival Mode</h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-2">
                Battle Royale Prediction Tournaments
              </p>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
                Join survival tournaments where you predict cryptocurrency price movements. 
                Make the wrong prediction and get eliminated. Last survivor wins the prize pool!
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col gap-4">
                {/* Mobile: Stack all elements vertically */}
                <div className="flex flex-col gap-3">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search tournaments..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:min-w-[180px]">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                      <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="pl-10 w-full">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tournaments</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="flex items-center gap-2 justify-center sm:justify-start whitespace-nowrap"
                      >
                        <X className="h-4 w-4" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
                {/* Results count - always visible at bottom */}
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  {filteredTournaments.length > 0 ? (
                    `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredTournaments.length)} of ${filteredTournaments.length} tournaments`
                  ) : (
                    'No tournaments found'
                  )}
                </div>
              </div>
            </div>



          {/* Tournament Grid */}
          {displayTournaments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {displayTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  user={user}
                  cryptoPrices={cryptoPrices}
                  onWalletRequired={checkWalletRequired}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">
                {searchQuery || statusFilter !== 'all' ? 'No tournaments found' : 'No Active Tournaments'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== 'all' ? (
                  <>Try adjusting your search terms or filters, or check back later for new tournaments.</>
                ) : (
                  <>There are currently no survival tournaments available. 
                  New tournaments are created regularly by administrators.</>
                )}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <p className="text-sm text-muted-foreground">
                  Check back soon or contact an administrator to create new tournaments.
                </p>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredTournaments.length > tournamentsPerPage && (
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current page
                  const showPage = page === 1 || 
                                  page === totalPages || 
                                  (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  if (!showPage) {
                    // Show ellipsis
                    if (page === 2 && currentPage > 3) {
                      return <span key={page} className="px-2 text-muted-foreground text-sm">...</span>;
                    }
                    if (page === totalPages - 1 && currentPage < totalPages - 2) {
                      return <span key={page} className="px-2 text-muted-foreground text-sm">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0 text-sm"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Tournament Stats */}
          {filteredTournaments.length > 0 && (
            <div className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left">
                {searchQuery || statusFilter !== 'all' ? 'Filtered Results Statistics' : 'Tournament Statistics'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredTournaments.filter(t => t.status === 'active' || t.status === 'open').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Tournaments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredTournaments.reduce((total, t) => total + t.currentParticipants, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredTournaments.reduce((total, t) => total + t.prizePool, 0)} NTIQ
                  </div>
                  <div className="text-sm text-muted-foreground">Total Prize Pool</div>
                </div>
              </div>
            </div>
          )}

          {/* How It Works Section */}
          <div className="mt-12 bg-card rounded-lg p-6 border">
            <h3 className="text-xl font-semibold mb-4">How Survival Mode Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Join Tournament</h4>
                <p className="text-sm text-muted-foreground">
                  Pay the entry fee and join a survival tournament with other players.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Predict Prices</h4>
                <p className="text-sm text-muted-foreground">
                  Each round, predict if the cryptocurrency price will go UP or DOWN.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">Survive & Win</h4>
                <p className="text-sm text-muted-foreground">
                  Wrong predictions eliminate you. Last survivor wins the entire prize pool!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Wallet Required Modal */}
      <WalletRequiredModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onWalletConnected={onWalletConnected}
        actionType={actionType}
      />
    </>
  );

};

export default SurvivalGame;