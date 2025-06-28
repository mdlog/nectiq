import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trophy, Users, Clock, DollarSign, Target, Sword, Timer } from "lucide-react";
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
  startTime?: string;
  endTime?: string;
  nextRoundTime?: string;
  creatorUsername: string;
  winnerUsername?: string;
  participants?: any[];
  rounds?: any[];
}

const SurvivalTournaments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState<SurvivalTournament | null>(null);

  // Fetch all survival tournaments
  const { data: tournaments = [], isLoading } = useQuery<SurvivalTournament[]>({
    queryKey: ['/api/survival-tournaments'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch user data
  const { data: user } = useQuery<any>({
    queryKey: ['/api/user'],
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      return apiRequest(`/api/survival-tournaments/${tournamentId}/join`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Success",
        description: "Joined tournament successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join tournament",
        variant: "destructive",
      });
    },
  });

  const handleJoinTournament = (tournament: SurvivalTournament) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to join tournaments",
        variant: "destructive",
      });
      return;
    }

    if (tournament.status !== 'open') {
      toast({
        title: "Cannot Join",
        description: "This tournament is no longer accepting participants",
        variant: "destructive",
      });
      return;
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      toast({
        title: "Tournament Full",
        description: "This tournament has reached its maximum number of participants",
        variant: "destructive",
      });
      return;
    }

    if (user.balance < tournament.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${tournament.entryFee} NTIQ to join this tournament`,
        variant: "destructive",
      });
      return;
    }

    joinTournamentMutation.mutate(tournament.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'accepting_participants':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Open</Badge>;
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Loading tournaments...</p>
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
          <div className="flex items-center justify-center mb-4">
            <Sword className="h-8 w-8 text-red-400 mr-2" />
            <h1 className="text-4xl font-bold text-white">Survival Tournaments</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Elimination-style tournaments where wrong predictions eliminate participants. Last survivor wins the entire prize pool!
          </p>
        </div>

        {/* Admin Notice */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md text-center">
            <p className="text-blue-800 text-sm">
              <strong>Admin Only:</strong> Tournament creation is restricted to administrators. Contact an admin to create new tournaments.
            </p>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament: SurvivalTournament) => (
            <Card key={tournament.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-white">
                    {tournament.title}
                  </CardTitle>
                  {getStatusBadge(tournament.status)}
                </div>
                <CardDescription className="text-gray-300">
                  {tournament.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Cryptocurrency */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Asset:</span>
                    <span className="font-medium text-white">{tournament.cryptocurrency.toUpperCase()}</span>
                  </div>
                  
                  {/* Participants */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Participants:
                    </span>
                    <span className="text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                  </div>
                  
                  {/* Entry Fee */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Entry Fee:
                    </span>
                    <span className="text-green-400 font-medium">{tournament.entryFee} NTIQ</span>
                  </div>
                  
                  {/* Prize Pool */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      Prize Pool:
                    </span>
                    <span className="text-yellow-400 font-bold">{tournament.prizePool} NTIQ</span>
                  </div>
                  
                  {/* Round Duration */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center">
                      <Timer className="w-4 h-4 mr-1" />
                      Round Duration:
                    </span>
                    <span className="text-white">{Math.floor(tournament.roundDuration / 60)} min</span>
                  </div>
                  
                  {/* Current Round (if active) */}
                  {tournament.status === 'active' && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Current Round:
                      </span>
                      <span className="text-blue-400 font-medium">Round {tournament.currentRound}</span>
                    </div>
                  )}
                  
                  {/* Time Remaining (if active) */}
                  {tournament.status === 'active' && tournament.nextRoundTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Next Round:
                      </span>
                      <span className="text-orange-400 font-medium">
                        {formatTimeRemaining(tournament.nextRoundTime)}
                      </span>
                    </div>
                  )}
                  
                  {/* Winner (if completed) */}
                  {tournament.status === 'completed' && tournament.winnerUsername && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Winner:</span>
                      <span className="text-yellow-400 font-bold">{tournament.winnerUsername}</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 space-y-2">
                  {(tournament.status === 'open' || tournament.status === 'pending' || tournament.status === 'accepting_participants') && 
                   tournament.currentParticipants < tournament.maxParticipants && (
                    <Button
                      onClick={() => handleJoinTournament(tournament)}
                      disabled={joinTournamentMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      {joinTournamentMutation.isPending ? 'Joining...' : `Join Tournament (${tournament.entryFee} NTIQ)`}
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-white border-white/30 hover:bg-white/10">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{tournament.title}</DialogTitle>
                        <DialogDescription>
                          Tournament Details
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-gray-600">{tournament.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Tournament Info</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Asset:</span>
                              <span>{tournament.cryptocurrency.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Entry Fee:</span>
                              <span>{tournament.entryFee} NTIQ</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Participants:</span>
                              <span>{tournament.maxParticipants}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Prize Pool:</span>
                              <span>{tournament.prizePool} NTIQ</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Round Duration:</span>
                              <span>{Math.floor(tournament.roundDuration / 60)} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Creator:</span>
                              <span>{tournament.creatorUsername}</span>
                            </div>
                          </div>
                        </div>
                        
                        {tournament.status === 'active' && (
                          <div>
                            <h4 className="font-medium mb-2">Current Status</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Current Round:</span>
                                <span>Round {tournament.currentRound}</span>
                              </div>
                              {tournament.nextRoundTime && (
                                <div className="flex justify-between">
                                  <span>Next Round In:</span>
                                  <span>{formatTimeRemaining(tournament.nextRoundTime)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {tournament.status === 'completed' && tournament.winnerUsername && (
                          <div>
                            <h4 className="font-medium mb-2">Tournament Result</h4>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                              <p className="font-medium text-yellow-800">
                                Winner: {tournament.winnerUsername}
                              </p>
                              <p className="text-sm text-yellow-600">
                                Prize: {tournament.prizePool} NTIQ
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tournaments available
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Tournaments are created by administrators. Check back later for new tournaments!
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SurvivalTournaments;