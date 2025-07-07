import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const SurvivalTest = () => {
  console.log('SURVIVAL TEST PAGE LOADED SUCCESSFULLY');
  
  // Test basic data fetching
  const { data: tournaments = [], isLoading, error } = useQuery({
    queryKey: ['/api/survival-tournaments'],
    retry: 1
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  console.log('Test data:', { tournaments, user, isLoading, error });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Survival Page Test</h1>
          
          <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
              ✅ Test Page Loaded Successfully!
            </h2>
            <p className="text-green-700 dark:text-green-300">
              This page confirms the routing and basic React components are working.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-3">
                Tournament Data Status
              </h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</li>
                <li><strong>Error:</strong> {error ? 'Yes' : 'No'}</li>
                <li><strong>Tournament Count:</strong> {tournaments.length}</li>
                <li><strong>Data Available:</strong> {tournaments.length > 0 ? 'Yes' : 'No'}</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-3">
                User Authentication
              </h3>
              <ul className="space-y-2 text-sm">
                <li><strong>User Logged In:</strong> {user ? 'Yes' : 'No'}</li>
                <li><strong>Username:</strong> {user?.username || 'N/A'}</li>
                <li><strong>Is Admin:</strong> {user?.isAdmin ? 'Yes' : 'No'}</li>
                <li><strong>Balance:</strong> {user?.balance || 0} NTIQ</li>
              </ul>
            </div>
          </div>

          {tournaments.length > 0 && (
            <div className="mt-8 bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">
                Available Tournaments
              </h3>
              <div className="space-y-4">
                {tournaments.map((tournament: any) => (
                  <div key={tournament.id} className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-bold text-lg">{tournament.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{tournament.description}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><strong>Status:</strong> {tournament.status}</p>
                      <p><strong>Crypto:</strong> {tournament.cryptocurrency}</p>
                      <p><strong>Entry Fee:</strong> {tournament.entryFee} NTIQ</p>
                      <p><strong>Round:</strong> {tournament.currentRound}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Check browser console for detailed logs
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SurvivalTest;