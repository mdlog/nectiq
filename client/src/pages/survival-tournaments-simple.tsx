import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface SurvivalTournament {
  id: number;
  title: string;
  description: string;
  cryptocurrency: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  status: string;
  currentRound: number;
  roundDuration: number;
  creatorUsername: string;
}

const SurvivalTournamentsSimple = () => {
  // Fetch all survival tournaments
  const { data: tournaments = [], isLoading } = useQuery<SurvivalTournament[]>({
    queryKey: ['/api/survival-tournaments'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Loading tournaments...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Survival Tournaments</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Battle royale prediction tournaments - last survivor wins!
          </p>
        </div>

        {/* Debug Info */}
        <div className="mb-8 text-center">
          <p className="text-white">Found {tournaments.length} tournaments</p>
          <p className="text-gray-300 text-sm">
            {tournaments.map(t => `${t.title} (${t.status})`).join(', ')}
          </p>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">
                  {tournament.title}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {tournament.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Asset:</span>
                    <span className="font-medium text-white">{tournament.cryptocurrency.toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Participants:</span>
                    <span className="text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Entry Fee:</span>
                    <span className="text-green-400 font-medium">{tournament.entryFee} NTIQ</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Prize Pool:</span>
                    <span className="text-yellow-400 font-bold">{tournament.prizePool} NTIQ</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className="text-blue-400 font-medium">{tournament.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">
              No tournaments available
            </h3>
            <p className="text-gray-400 mb-6">
              Check back later for new tournaments!
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SurvivalTournamentsSimple;