import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Plus, Users, Clock, Coins, Shield, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function TournamentDashboard() {
    const [activeTab, setActiveTab] = useState("browse");
    const [searchCode, setSearchCode] = useState("");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch available tournaments
    const { data: availableTournaments = [], isLoading: loadingAvailable } = useQuery({
        queryKey: ["/api/tournaments/available"],
        refetchInterval: 5000, // Refresh every 5 seconds
    });

    // Fetch user's tournaments
    const { data: myTournaments = [], isLoading: loadingMy } = useQuery({
        queryKey: ["/api/tournaments/my-tournaments"],
        refetchInterval: 5000,
    });

    // Fetch cryptocurrencies for tournament creation
    const { data: cryptos = [] } = useQuery({
        queryKey: ["/api/crypto/pyth-prices"],
    });

    // Join tournament mutation
    const joinMutation = useMutation({
        mutationFn: async (tournamentCode: string) => {
            const response = await apiRequest("/api/tournaments/join", {
                method: "POST",
                body: JSON.stringify({ tournamentCode }),
            });
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "✅ Joined Tournament",
                description: "You have successfully joined the tournament!",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/tournaments/available"] });
            queryClient.invalidateQueries({ queryKey: ["/api/tournaments/my-tournaments"] });
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            setSearchCode("");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to join tournament",
                variant: "destructive",
            });
        },
    });

    // Create tournament state
    const [tournamentForm, setTournamentForm] = useState({
        name: "",
        description: "",
        entryFee: 100,
        maxParticipants: 25,
        numberOfRounds: 3,
        cryptocurrency: "",
        roundDuration: 60,
        eliminationRules: "bottom_50",
        isPrivate: false,
        prizeDistribution: { first: 50, second: 30, third: 20 },
    });

    // Create tournament mutation
    const createMutation = useMutation({
        mutationFn: async () => {
            const response = await apiRequest("/api/tournaments/create", {
                method: "POST",
                body: JSON.stringify(tournamentForm),
            });
            return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: "🏆 Tournament Created!",
                description: `Your tournament has been created! Code: ${data.tournament?.tournamentCode}`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/tournaments/available"] });
            queryClient.invalidateQueries({ queryKey: ["/api/tournaments/my-tournaments"] });
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            setCreateModalOpen(false);
            setTournamentForm({
                name: "",
                description: "",
                entryFee: 100,
                maxParticipants: 25,
                numberOfRounds: 3,
                cryptocurrency: "",
                roundDuration: 60,
                eliminationRules: "bottom_50",
                isPrivate: false,
                prizeDistribution: { first: 50, second: 30, third: 20 },
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

    const handleJoinByCode = () => {
        if (searchCode.trim().length === 8) {
            joinMutation.mutate(searchCode.trim().toUpperCase());
        } else {
            toast({
                title: "Invalid Code",
                description: "Please enter an 8-character tournament code",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const statusStyles = {
            open: "bg-green-500/20 text-green-300 border-green-500/30",
            in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            completed: "bg-gray-500/20 text-gray-300 border-gray-500/30",
            cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
        };
        return (
            <Badge className={statusStyles[status as keyof typeof statusStyles] || ""}>
                {status.replace("_", " ").toUpperCase()}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center text-white">
                        <Trophy className="text-primary mr-3" size={28} />
                        Custom Tournaments
                    </h2>
                    <p className="text-slate-400 mt-1">
                        Create your own tournaments or join existing ones
                    </p>
                </div>

                <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="gradient-bg hover:opacity-90">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Tournament
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-surface border-surface-light max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-white">Create Custom Tournament</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Set up your tournament rules and invite players
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label className="text-slate-300">Tournament Name</Label>
                                    <Input
                                        placeholder="e.g., BTC Weekend Challenge"
                                        className="bg-surface-light border-surface-light text-white"
                                        value={tournamentForm.name}
                                        onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label className="text-slate-300">Description (Optional)</Label>
                                    <Input
                                        placeholder="Tournament description"
                                        className="bg-surface-light border-surface-light text-white"
                                        value={tournamentForm.description}
                                        onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Entry Fee (NTIQ)</Label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        className="bg-surface-light border-surface-light text-white"
                                        value={tournamentForm.entryFee}
                                        onChange={(e) => setTournamentForm({ ...tournamentForm, entryFee: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Max Participants</Label>
                                    <Input
                                        type="number"
                                        placeholder="25"
                                        className="bg-surface-light border-surface-light text-white"
                                        value={tournamentForm.maxParticipants}
                                        onChange={(e) => setTournamentForm({ ...tournamentForm, maxParticipants: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Cryptocurrency</Label>
                                    <Select
                                        value={tournamentForm.cryptocurrency}
                                        onValueChange={(value) => setTournamentForm({ ...tournamentForm, cryptocurrency: value })}
                                    >
                                        <SelectTrigger className="bg-surface-light border-surface-light text-white">
                                            <SelectValue placeholder="Select crypto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cryptos.map((crypto: any) => (
                                                <SelectItem key={crypto.id} value={crypto.id}>
                                                    {crypto.symbol?.toUpperCase()} - {crypto.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Number of Rounds</Label>
                                    <Input
                                        type="number"
                                        placeholder="3"
                                        className="bg-surface-light border-surface-light text-white"
                                        value={tournamentForm.numberOfRounds}
                                        onChange={(e) => setTournamentForm({ ...tournamentForm, numberOfRounds: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Round Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        placeholder="60"
                                        className="bg-surface-light border-surface-light text-white"
                                        value={tournamentForm.roundDuration}
                                        onChange={(e) => setTournamentForm({ ...tournamentForm, roundDuration: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Elimination Rules</Label>
                                    <Select
                                        value={tournamentForm.eliminationRules}
                                        onValueChange={(value) => setTournamentForm({ ...tournamentForm, eliminationRules: value })}
                                    >
                                        <SelectTrigger className="bg-surface-light border-surface-light text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bottom_50">Bottom 50% Eliminated</SelectItem>
                                            <SelectItem value="bottom_25">Bottom 25% Eliminated</SelectItem>
                                            <SelectItem value="all_wrong">All Wrong Predictions Eliminated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="bg-surface-light border border-primary/20 rounded-lg p-4 space-y-2">
                                <div className="text-sm font-medium text-slate-300">Estimated Costs</div>
                                <div className="space-y-1 text-xs text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Creation Fee:</span>
                                        <span className="text-primary font-medium">
                                            {100 + Math.min(tournamentForm.maxParticipants, 50) * 5 + tournamentForm.numberOfRounds * 50} NTIQ
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Potential Prize Pool:</span>
                                        <span className="text-green-400 font-medium">
                                            {tournamentForm.entryFee * tournamentForm.maxParticipants} NTIQ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCreateModalOpen(false)}
                                className="border-surface-light"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => createMutation.mutate()}
                                disabled={createMutation.isPending || !tournamentForm.name || !tournamentForm.cryptocurrency}
                                className="gradient-bg"
                            >
                                {createMutation.isPending ? "Creating..." : "Create Tournament"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Join by Code */}
            <Card className="bg-surface border-surface-light">
                <CardContent className="pt-6">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Enter 8-character tournament code..."
                                className="bg-surface-light border-surface-light pl-10 text-white"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                                maxLength={8}
                            />
                        </div>
                        <Button
                            onClick={handleJoinByCode}
                            disabled={joinMutation.isPending || searchCode.length !== 8}
                            className="gradient-bg"
                        >
                            {joinMutation.isPending ? "Joining..." : "Join"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-surface border border-surface-light">
                    <TabsTrigger value="browse" className="data-[state=active]:bg-primary">
                        Browse Tournaments
                    </TabsTrigger>
                    <TabsTrigger value="my-tournaments" className="data-[state=active]:bg-primary">
                        My Tournaments
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="space-y-4 mt-4">
                    {loadingAvailable ? (
                        <div className="text-center py-8 text-slate-400">Loading tournaments...</div>
                    ) : availableTournaments.length === 0 ? (
                        <Card className="bg-surface border-surface-light">
                            <CardContent className="pt-6 text-center">
                                <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-400">No tournaments available at the moment</p>
                                <p className="text-sm text-slate-500 mt-2">Be the first to create one!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableTournaments.map((tournament: any) => (
                                <Card key={tournament.id} className="bg-surface border-surface-light hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-white text-lg">{tournament.name}</CardTitle>
                                            {getStatusBadge(tournament.status)}
                                        </div>
                                        <CardDescription className="text-slate-400">
                                            by {tournament.creatorUsername}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400 flex items-center">
                                                <Coins className="h-4 w-4 mr-1" />
                                                Entry Fee:
                                            </span>
                                            <span className="text-primary font-medium">{tournament.entryFee} NTIQ</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400 flex items-center">
                                                <Trophy className="h-4 w-4 mr-1" />
                                                Prize Pool:
                                            </span>
                                            <span className="text-green-400 font-medium">{tournament.prizePool} NTIQ</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400 flex items-center">
                                                <Users className="h-4 w-4 mr-1" />
                                                Players:
                                            </span>
                                            <span className="text-white">
                                                {tournament.currentParticipants} / {tournament.maxParticipants}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400 flex items-center">
                                                <Clock className="h-4 w-4 mr-1" />
                                                Rounds:
                                            </span>
                                            <span className="text-white">{tournament.numberOfRounds} rounds</span>
                                        </div>
                                        <div className="text-xs text-center font-mono bg-surface-light px-2 py-1 rounded border border-primary/20">
                                            Code: {tournament.tournamentCode}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full gradient-bg"
                                            onClick={() => joinMutation.mutate(tournament.tournamentCode)}
                                            disabled={joinMutation.isPending}
                                        >
                                            Join Tournament
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="my-tournaments" className="space-y-4 mt-4">
                    {loadingMy ? (
                        <div className="text-center py-8 text-slate-400">Loading your tournaments...</div>
                    ) : myTournaments.length === 0 ? (
                        <Card className="bg-surface border-surface-light">
                            <CardContent className="pt-6 text-center">
                                <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-400">You haven't joined any tournaments yet</p>
                                <p className="text-sm text-slate-500 mt-2">Browse tournaments to get started!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myTournaments.map((tournament: any) => (
                                <Card key={tournament.id} className="bg-surface border-surface-light">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-white text-lg">{tournament.name}</CardTitle>
                                            {getStatusBadge(tournament.status)}
                                        </div>
                                        {tournament.isEliminated && (
                                            <Badge className="bg-red-500/20 text-red-300 border-red-500/30 w-fit">
                                                Eliminated - Round {tournament.eliminatedRound}
                                            </Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Prize Pool:</span>
                                            <span className="text-green-400 font-medium">{tournament.prizePool} NTIQ</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Your Points:</span>
                                            <span className="text-primary font-medium">{tournament.totalPoints}</span>
                                        </div>
                                        {tournament.currentRank && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Current Rank:</span>
                                                <span className="text-white font-medium">#{tournament.currentRank}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Progress:</span>
                                            <span className="text-white">
                                                Round {tournament.currentRound} / {tournament.numberOfRounds}
                                            </span>
                                        </div>
                                        {tournament.prizeWon > 0 && (
                                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2 text-center">
                                                <div className="text-green-300 font-semibold">
                                                    🏆 Won: {tournament.prizeWon} NTIQ
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-xs text-center font-mono bg-surface-light px-2 py-1 rounded border border-primary/20">
                                            Code: {tournament.tournamentCode}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

