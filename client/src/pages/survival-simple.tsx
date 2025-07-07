import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const SurvivalSimple = () => {
  console.log('=== SURVIVAL SIMPLE PAGE LOADED ===');

  const { data: tournaments = [], isLoading, error } = useQuery({
    queryKey: ['/api/survival-tournaments'],
    retry: 1,
    staleTime: 0
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 0
  });

  const { data: cryptoPrices = [] } = useQuery({
    queryKey: ['/api/crypto/prices'],
    retry: 1,
    staleTime: 0
  });

  console.log('=== SURVIVAL SIMPLE DATA ===');
  console.log('Tournaments:', tournaments);
  console.log('User:', user);
  console.log('Crypto Prices:', cryptoPrices?.length || 0);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  const activeTournaments = tournaments.filter((t: any) => t.status === 'open' || t.status === 'active');

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center text-white">Loading Survival Tournaments...</h1>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-white">Nectiq Survival Mode</h1>
          
          <div className="mb-8 bg-blue-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-200 mb-4">Debug Information</h2>
            <div className="space-y-2 text-sm text-blue-100">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error ? 'Yes' : 'No'}</p>
              <p><strong>Total Tournaments:</strong> {tournaments.length}</p>
              <p><strong>Active Tournaments:</strong> {activeTournaments.length}</p>
              <p><strong>User Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
              <p><strong>User Balance:</strong> {user?.balance || 0} NTIQ</p>
              <p><strong>Crypto Prices Count:</strong> {cryptoPrices.length}</p>
            </div>
          </div>

          {activeTournaments.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Active Tournaments ({activeTournaments.length})</h2>
              
              {activeTournaments.map((tournament: any) => {
                const currentCrypto = cryptoPrices.find((crypto: any) => crypto.id === tournament.cryptocurrency);
                const currentPrice = currentCrypto?.current_price || 0;
                
                return (
                  <div key={tournament.id} className="bg-slate-800 border border-slate-600 rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white">{tournament.title}</h3>
                      <p className="text-gray-400">{tournament.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <p className="text-white font-medium">{tournament.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Cryptocurrency</p>
                        <p className="text-white font-medium">{tournament.cryptocurrency}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Entry Fee</p>
                        <p className="text-white font-medium">{tournament.entryFee} NTIQ</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Round</p>
                        <p className="text-white font-medium">{tournament.currentRound}</p>
                      </div>
                    </div>

                    {currentPrice > 0 && (
                      <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded">
                        <p className="text-yellow-200 text-sm">Live Price</p>
                        <p className="text-yellow-100 text-lg font-bold">${currentPrice.toLocaleString()}</p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
                        Price UP ↗
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium">
                        Price DOWN ↘
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-400 mb-4">No Active Tournaments</h2>
              <p className="text-gray-500">
                {tournaments.length === 0 
                  ? "No tournaments found in database."
                  : `Found ${tournaments.length} tournaments, but none are currently active.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SurvivalSimple;