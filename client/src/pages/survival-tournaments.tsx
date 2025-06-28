import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trophy, Users, Clock, DollarSign, Plus, Target, Sword, Timer } from "lucide-react";
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/survival-tournaments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/survival-tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Tournament created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    },
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

  const handleCreateTournament = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      cryptocurrency: formData.get('cryptocurrency'),
      entryFee: parseInt(formData.get('entryFee') as string),
      maxParticipants: parseInt(formData.get('maxParticipants') as string),
      roundDuration: parseInt(formData.get('roundDuration') as string),
    };

    createTournamentMutation.mutate(data);
  };

  const handleJoinTournament = (tournament: SurvivalTournament) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to join tournaments",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCryptoImageUrl = (cryptoId: string) => {
    const cryptoImages: Record<string, string> = {
      bitcoin: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      ethereum: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      binancecoin: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
      cardano: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
      solana: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    };
    return cryptoImages[cryptoId] || '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading tournaments...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Survival Tournaments
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Elimination-style tournaments where wrong predictions eliminate participants. Last survivor wins the entire prize pool!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-8">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Survival Tournament</DialogTitle>
                <DialogDescription>
                  Create a new elimination tournament where participants make predictions to survive.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateTournament} className="space-y-4">
                <div>
                  <Label htmlFor="title">Tournament Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter tournament title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tournament description (optional)"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cryptocurrency">Cryptocurrency</Label>
                  <Select name="cryptocurrency" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                      <SelectItem value="binancecoin">BNB</SelectItem>
                      <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                      <SelectItem value="solana">Solana (SOL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entryFee">Entry Fee (NTIQ)</Label>
                    <Input
                      id="entryFee"
                      name="entryFee"
                      type="number"
                      min="10"
                      max="1000"
                      defaultValue="100"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      min="2"
                      max="100"
                      defaultValue="20"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="roundDuration">Round Duration (seconds)</Label>
                  <Select name="roundDuration" defaultValue="300">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="180">3 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                      <SelectItem value="900">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTournamentMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament: SurvivalTournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <img
                      src={getCryptoImageUrl(tournament.cryptocurrency)}
                      alt={tournament.cryptocurrency}
                      className="w-6 h-6"
                    />
                    {tournament.title}
                  </CardTitle>
                  <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                    {tournament.status.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>{tournament.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Tournament Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Entry: {tournament.entryFee} NTIQ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span>Prize: {tournament.prizePool} NTIQ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sword className="w-4 h-4 text-red-600" />
                    <span>Round {tournament.currentRound}</span>
                  </div>
                </div>

                {/* Round Duration */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Timer className="w-4 h-4" />
                  <span>Round Duration: {Math.floor(tournament.roundDuration / 60)}m {tournament.roundDuration % 60}s</span>
                </div>

                {/* Creator Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Created by: <span className="font-medium">{tournament.creatorUsername}</span>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {tournament.status === 'open' && (
                    <Button
                      onClick={() => handleJoinTournament(tournament)}
                      disabled={joinTournamentMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {joinTournamentMutation.isPending ? "Joining..." : "Join Tournament"}
                    </Button>
                  )}
                  
                  {tournament.status === 'active' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedTournament(tournament)}
                    >
                      View Tournament
                    </Button>
                  )}
                  
                  {tournament.status === 'completed' && (
                    <div className="text-center">
                      {tournament.winnerUsername ? (
                        <div className="text-sm">
                          <span className="text-yellow-600 font-medium">Winner: </span>
                          <span className="font-medium">{tournament.winnerUsername}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">No survivors</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {tournaments.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Tournaments Available
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Be the first to create a survival tournament and test your prediction skills!
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Tournament
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SurvivalTournaments;