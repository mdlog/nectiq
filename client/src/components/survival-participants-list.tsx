import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Clock, Users, Trophy, Skull } from 'lucide-react';

interface Participant {
  id: number;
  userId: number;
  username: string;
  uid: string;
  status: string;
  eliminatedRound: number | null;
  joinedAt: string;
  eliminatedAt: string | null;
  profilePhoto: string | null;
  prediction: string | null;
  submittedAt: string | null;
  startingPrice: number | null;
  currentRound: number;
}

interface SurvivalParticipantsListProps {
  tournamentId: number;
}

export function SurvivalParticipantsList({ tournamentId }: SurvivalParticipantsListProps) {
  const { data: participants = [], isLoading, error } = useQuery({
    queryKey: [`/api/survival-tournaments/${tournamentId}/participants-with-predictions`],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tournament Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tournament Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Failed to load participants</p>
        </CardContent>
      </Card>
    );
  }

  const activeParticipants = participants.filter((p: Participant) => p.status === 'active');
  const eliminatedParticipants = participants.filter((p: Participant) => p.status === 'eliminated');
  const totalPredictions = participants.filter((p: Participant) => p.prediction).length;

  const getStatusBadge = (participant: Participant) => {
    if (participant.status === 'active') {
      return <Badge variant="default" className="bg-green-500 text-white">Active</Badge>;
    } else if (participant.status === 'eliminated') {
      return <Badge variant="destructive" className="bg-red-500 text-white">Eliminated R{participant.eliminatedRound}</Badge>;
    } else if (participant.status === 'winner') {
      return <Badge variant="default" className="bg-yellow-500 text-black">Winner</Badge>;
    }
    return <Badge variant="outline">{participant.status}</Badge>;
  };

  const getPredictionDisplay = (participant: Participant) => {
    if (!participant.prediction) {
      return (
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Not predicted</span>
        </div>
      );
    }

    const isUp = participant.prediction.toLowerCase() === 'up';
    return (
      <div className={`flex items-center gap-1 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
        {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="font-semibold">{participant.prediction.toUpperCase()}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tournament Participants ({participants.length})
          </CardTitle>
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-green-500" />
              Active: {activeParticipants.length}
            </span>
            <span className="flex items-center gap-1">
              <Skull className="h-4 w-4 text-red-500" />
              Eliminated: {eliminatedParticipants.length}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Predictions: {totalPredictions}/{participants.length}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Active Participants */}
            {activeParticipants.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Active Players ({activeParticipants.length})
                </h4>
                <div className="space-y-2">
                  {activeParticipants.map((participant: Participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.profilePhoto || undefined} />
                          <AvatarFallback>{participant.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {participant.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            UID: {participant.uid}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getPredictionDisplay(participant)}
                        {getStatusBadge(participant)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eliminated Participants */}
            {eliminatedParticipants.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <Skull className="h-4 w-4" />
                  Eliminated Players ({eliminatedParticipants.length})
                </h4>
                <div className="space-y-2">
                  {eliminatedParticipants.map((participant: Participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 opacity-75"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.profilePhoto || undefined} />
                          <AvatarFallback>{participant.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {participant.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            UID: {participant.uid} • Eliminated Round {participant.eliminatedRound}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getPredictionDisplay(participant)}
                        {getStatusBadge(participant)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {participants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No participants yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prediction Summary */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Round {participants[0]?.currentRound || 0} Predictions Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">UP</span>
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                  {participants.filter((p: Participant) => p.prediction?.toLowerCase() === 'up').length}
                </div>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                  <TrendingDown className="h-5 w-5" />
                  <span className="font-semibold">DOWN</span>
                </div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                  {participants.filter((p: Participant) => p.prediction?.toLowerCase() === 'down').length}
                </div>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">WAITING</span>
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">
                  {participants.filter((p: Participant) => !p.prediction).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}