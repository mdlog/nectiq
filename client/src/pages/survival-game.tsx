import { useQuery } from '@tanstack/react-query';
import { TournamentCard } from '@/components/tournament-card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

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
  // Fetch semua tournament (open dan active)
  const { data: tournaments = [], isLoading: tournamentLoading, error: tournamentError } = useQuery<SurvivalTournament[]>({
    queryKey: ['/api/survival-tournaments'],
    refetchInterval: 3000, // Refresh setiap 3 detik
    retry: 1
  });

  // Filter tournament yang open atau active saja
  const activeTournaments = tournaments.filter(t => t.status === 'open' || t.status === 'active');
  
  // Debug logging
  console.log('=== SURVIVAL PAGE RENDER START ===');
  console.log('Tournament loading:', tournamentLoading);
  console.log('Tournament error:', tournamentError?.message || 'none');
  console.log('All tournaments count:', tournaments?.length || 0);
  console.log('All tournaments:', tournaments);
  console.log('Active tournaments count:', activeTournaments?.length || 0);
  console.log('Active tournaments:', activeTournaments);
  console.log('User data:', user);
  console.log('Crypto prices count:', cryptoPrices?.length || 0);
  console.log('About to render component...');
  console.log('=== END DEBUG ===');

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  // Fetch crypto prices
  const { data: cryptoPrices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  if (tournamentLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Nectiq Survival Mode</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Loading tournaments...</p>
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Nectiq Survival Mode</h1>
              <p className="text-red-600 mb-8">Error loading tournaments. Please try again later.</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  console.log('=== SURVIVAL PAGE RENDERING MAIN COMPONENT ===');
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Nectiq Survival Mode</h1>
            <p className="text-xl text-muted-foreground mb-2">
              Battle Royale Prediction Tournaments
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join survival tournaments where you predict cryptocurrency price movements. 
              Make the wrong prediction and get eliminated. Last survivor wins the prize pool!
            </p>
            
            {/* Debug Info for User */}
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-left max-w-md mx-auto">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <p>Loading: {tournamentLoading ? 'Yes' : 'No'}</p>
              <p>Error: {tournamentError ? 'Yes' : 'No'}</p>
              <p>Tournaments: {tournaments.length}</p>
              <p>Active: {activeTournaments.length}</p>
              <p>User: {user ? user.username : 'Not logged in'}</p>
              <p>Crypto Prices: {cryptoPrices.length}</p>
            </div>
          </div>

          {/* Tournament Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Tournament Status</h2>
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg mb-6">
              <p><strong>Loading:</strong> {tournamentLoading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {tournamentError ? JSON.stringify(tournamentError) : 'None'}</p>
              <p><strong>Total Tournaments:</strong> {tournaments.length}</p>
              <p><strong>Active Tournaments:</strong> {activeTournaments.length}</p>
            </div>
          </div>

          {activeTournaments.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Active Tournaments ({activeTournaments.length})</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeTournaments.map((tournament) => {
                  console.log('Rendering tournament:', tournament.id, tournament.title);
                  try {
                    return (
                      <div key={tournament.id} className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg border">
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">{tournament.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{tournament.description}</p>
                        <div className="space-y-2 text-sm">
                          <p><strong>Status:</strong> {tournament.status}</p>
                          <p><strong>Cryptocurrency:</strong> {tournament.cryptocurrency}</p>
                          <p><strong>Entry Fee:</strong> {tournament.entryFee} NTIQ</p>
                          <p><strong>Current Round:</strong> {tournament.currentRound}</p>
                          <p><strong>Participants:</strong> {tournament.currentParticipants}/{tournament.maxParticipants}</p>
                          <p><strong>Prize Pool:</strong> {tournament.prizePool} NTIQ</p>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            TournamentCard component temporarily replaced with simple display for debugging
                          </p>
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering tournament card:', error, tournament);
                    return (
                      <div key={tournament.id} className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
                        <p className="text-red-600 dark:text-red-300">Error loading tournament: {tournament.title}</p>
                        <pre className="text-xs mt-2">{JSON.stringify(error, null, 2)}</pre>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          ) : tournaments.length > 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No Active Tournaments</h2>
              <p className="text-muted-foreground mb-6">
                There are {tournaments.length} tournaments, but none are currently accepting participants or active.
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left max-w-lg mx-auto">
                {tournaments.map((t, i) => (
                  <p key={i} className="text-sm">
                    <strong>{t.title}:</strong> {t.status}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No Tournaments Available</h2>
              <p className="text-muted-foreground mb-6">
                There are currently no survival tournaments available. 
                New tournaments are created regularly by administrators.
              </p>
              <p className="text-sm text-muted-foreground">
                Check back soon or contact an administrator to create new tournaments.
              </p>
            </div>
          )}

          {/* Tournament Stats */}
          {activeTournaments.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Tournament Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeTournaments.length}</div>
                  <div className="text-sm text-muted-foreground">Active Tournaments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activeTournaments.reduce((total, t) => total + t.currentParticipants, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {activeTournaments.reduce((total, t) => total + t.prizePool, 0)} NTIQ
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
    </>
  );
};

export default SurvivalGame;