import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Trophy, AlertCircle, Clock, Target, TrendingUp, TrendingDown } from "lucide-react";
import { SocialShare, createShareData } from "@/components/SocialShare";

interface SurvivalStatus {
  tournaments: Array<{
    id: number;
    title: string;
    cryptocurrency: string;
    status: 'active' | 'eliminated' | 'winner' | 'completed';
    round: number;
    eliminatedRound?: number;
    wonRound?: number;
    totalParticipants: number;
    remainingParticipants: number;
    prizePool: number;
    entryFee: number;
    joinedAt: string;
    prediction?: string;
    eliminatedAt?: string;
    wonAt?: string;
    finalPosition?: number;
  }>;
  stats: {
    totalTournaments: number;
    tournamentsWon: number;
    totalWinnings: number;
    averageRoundsReached: number;
    bestFinish: number;
    winRate: number;
  };
}

export function SurvivalStatus() {
  const { data: survivalStatus, isLoading } = useQuery<SurvivalStatus>({
    queryKey: ["/api/user/survival-status"],
    staleTime: 10000, // 10 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2" size={20} />
            Survival Tournament Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-400">Loading survival status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!survivalStatus || survivalStatus.tournaments.length === 0) {
    return (
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2" size={20} />
            Survival Tournament Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <AlertCircle className="mx-auto text-slate-400" size={48} />
            <p className="text-slate-400">No tournament participation yet</p>
            <p className="text-xs text-slate-500">Join a survival tournament to see your status here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-600 text-white">ACTIVE</Badge>;
      case 'eliminated':
        return <Badge className="bg-red-600 text-white">ELIMINATED</Badge>;
      case 'winner':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold border border-yellow-400">WIN 🏆</Badge>;
      case 'completed':
        return <Badge className="bg-gray-600 text-white">COMPLETED</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status.toUpperCase()}</Badge>;
    }
  };

  const getPredictionIcon = (prediction?: string) => {
    if (prediction === 'up') return <TrendingUp className="text-green-500" size={16} />;
    if (prediction === 'down') return <TrendingDown className="text-red-500" size={16} />;
    return <Target className="text-gray-500" size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Tournament Statistics */}
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2" size={20} />
            Survival Tournament Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{survivalStatus.stats.totalTournaments}</div>
              <div className="text-xs text-slate-400">Total Tournaments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{survivalStatus.stats.tournamentsWon}</div>
              <div className="text-xs text-slate-400">Tournaments Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{survivalStatus.stats.totalWinnings}</div>
              <div className="text-xs text-slate-400">Total Winnings (NTIQ)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{survivalStatus.stats.averageRoundsReached.toFixed(1)}</div>
              <div className="text-xs text-slate-400">Avg Rounds Reached</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">#{survivalStatus.stats.bestFinish}</div>
              <div className="text-xs text-slate-400">Best Finish</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{survivalStatus.stats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament History */}
      <Card className="bg-surface border-surface-light">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2" size={20} />
            Tournament History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {survivalStatus.tournaments.map((tournament) => (
              <div key={tournament.id} className="bg-surface-light rounded-lg p-4 border border-surface-light">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-white">{tournament.title}</h4>
                    <p className="text-sm text-slate-400">{tournament.cryptocurrency.toUpperCase()}</p>
                  </div>
                  {getStatusBadge(tournament.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Round:</span>
                      <span className="text-white">{tournament.round}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entry Fee:</span>
                      <span className="text-white">{tournament.entryFee} NTIQ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prize Pool:</span>
                      <span className="text-green-400">{tournament.prizePool} NTIQ</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Participants:</span>
                      <span className="text-white">{tournament.remainingParticipants}/{tournament.totalParticipants}</span>
                    </div>
                    {tournament.prediction && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Last Prediction:</span>
                        <div className="flex items-center space-x-1">
                          {getPredictionIcon(tournament.prediction)}
                          <span className="text-white uppercase">{tournament.prediction}</span>
                        </div>
                      </div>
                    )}
                    {tournament.finalPosition && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Final Position:</span>
                        <span className="text-yellow-400">#{tournament.finalPosition}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status specific information */}
                {tournament.status === 'eliminated' && tournament.eliminatedRound && (
                  <div className="mt-3 p-2 bg-red-900/20 rounded border border-red-700/30">
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                      <AlertCircle size={16} />
                      <span>Eliminated in Round {tournament.eliminatedRound}</span>
                    </div>
                  </div>
                )}

                {tournament.status === 'winner' && (
                  <div className="mt-3 p-2 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded border border-yellow-500/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-yellow-300 text-sm">
                        <Trophy size={16} />
                        <span className="font-semibold">WIN - Tournament Champion!</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-green-400 font-bold text-sm">
                          +{tournament.prizePool} NTIQ
                        </div>
                        {/* Share Button for Tournament Win */}
                        <SocialShare
                          compact={true}
                          data={createShareData.survival(
                            tournament.finalPosition || 1,
                            tournament.round,
                            tournament.totalParticipants - tournament.remainingParticipants,
                            tournament.prizePool
                          )}
                        />
                      </div>
                    </div>
                    {tournament.wonAt && (
                      <div className="text-xs text-yellow-400/70 mt-1">
                        Won on {new Date(tournament.wonAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                {tournament.status === 'active' && (
                  <div className="mt-3 p-2 bg-blue-900/20 rounded border border-blue-700/30">
                    <div className="flex items-center space-x-2 text-blue-400 text-sm">
                      <Clock size={16} />
                      <span>Tournament in progress - Round {tournament.round}</span>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-xs text-slate-500">
                  Joined: {new Date(tournament.joinedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}