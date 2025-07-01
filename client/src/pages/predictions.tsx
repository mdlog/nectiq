import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Award, Calendar, Clock, Users, Target, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface PredictionEvent {
  id: number;
  eventType: 'daily' | 'weekly' | 'monthly';
  title: string;
  description: string;
  cryptocurrency: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startPrice: number;
  endPrice?: number;
  winnerId?: number;
}

interface EventParticipant {
  id: number;
  userId: number;
  prediction: number;
  joinedAt: string;
  finalRank?: number;
  accuracy?: number;
  reward?: number;
  status: string;
  username: string;
  profilePhoto?: string;
}

interface EventLeaderboard {
  userId: number;
  username: string;
  profilePhoto?: string;
  totalEvents: number;
  avgAccuracy: number;
  totalRewards: number;
  bestRank: number;
}

export default function Predictions() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedEvent, setSelectedEvent] = useState<PredictionEvent | null>(null);
  const [predictionValue, setPredictionValue] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prediction events
  const { data: events = [], isLoading: eventsLoading } = useQuery<PredictionEvent[]>({
    queryKey: ["/api/prediction-events", activeTab],
    refetchInterval: 3000,
  });

  // Fetch event leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<EventLeaderboard[]>({
    queryKey: ["/api/prediction-events/leaderboard", activeTab],
    refetchInterval: 5000,
  });

  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: async ({ eventId, prediction }: { eventId: number; prediction: number }) => {
      return apiRequest(`/api/prediction-events/${eventId}/join`, {
        method: "POST",
        body: { prediction },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined the prediction event!",
      });
      setShowJoinDialog(false);
      setPredictionValue("");
      queryClient.invalidateQueries({ queryKey: ["/api/prediction-events"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Join",
        description: error.message || "Failed to join prediction event",
        variant: "destructive",
      });
    },
  });

  const handleJoinEvent = (event: PredictionEvent) => {
    setSelectedEvent(event);
    setShowJoinDialog(true);
  };

  const handleSubmitPrediction = () => {
    if (!selectedEvent || !predictionValue) return;
    
    const prediction = parseFloat(predictionValue);
    if (isNaN(prediction) || prediction <= 0) {
      toast({
        title: "Invalid Prediction",
        description: "Please enter a valid price prediction",
        variant: "destructive",
      });
      return;
    }

    joinEventMutation.mutate({ eventId: selectedEvent.id, prediction });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-500';
      case 'weekly': return 'bg-green-500';
      case 'monthly': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
  };

  const filteredEvents = events.filter(event => event.eventType === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">🎯 Prediction Events</h1>
          <p className="text-muted-foreground">Compete in time-based cryptocurrency prediction challenges</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'daily' | 'weekly' | 'monthly')}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Active Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Active {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Events
                </CardTitle>
                <CardDescription>
                  Join prediction events and compete for rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center py-8">Loading events...</div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No {activeTab} events available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                      <Card key={event.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge className={`${getEventTypeColor(event.eventType)} text-white`}>
                              {event.eventType.toUpperCase()}
                            </Badge>
                            <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                              {event.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {event.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Cryptocurrency:</span>
                            <span className="font-medium uppercase">{event.cryptocurrency}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Entry Fee:</span>
                            <span className="font-medium">{event.entryFee} NTIQ</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Participants:</span>
                            <span className="font-medium">{event.currentParticipants}/{event.maxParticipants}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Time Remaining:</span>
                            <span className="font-medium">{formatTimeRemaining(event.endTime)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Prize Pool:</span>
                            <span className="font-medium text-green-600">{event.prizePool} NTIQ</span>
                          </div>
                          {event.status === 'active' && (
                            <Button 
                              className="w-full mt-4" 
                              onClick={() => handleJoinEvent(event)}
                              disabled={event.currentParticipants >= event.maxParticipants}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              {event.currentParticipants >= event.maxParticipants ? 'Event Full' : 'Join Event'}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Leaderboard
                </CardTitle>
                <CardDescription>
                  Top performers in {activeTab} prediction events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="text-center py-8">Loading leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leaderboard data available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.slice(0, 10).map((user, index) => (
                      <div
                        key={user.userId}
                        className="flex items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(index + 1)}
                          </div>
                          
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={user.profilePhoto ? `/uploads/${user.profilePhoto.split('/').pop()}` : undefined} 
                              alt={user.username}
                            />
                            <AvatarFallback>
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold">{user.username}</h3>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>{user.totalEvents} events</span>
                              <span>Best: #{user.bestRank}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={user.avgAccuracy >= 70 ? "default" : user.avgAccuracy >= 50 ? "secondary" : "outline"}>
                                {user.avgAccuracy.toFixed(1)}% avg
                              </Badge>
                            </div>
                            <div className="text-sm font-medium">
                              {user.totalRewards.toLocaleString()} NTIQ
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Join Event Dialog */}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Prediction Event</DialogTitle>
              <DialogDescription>
                {selectedEvent?.title} - Entry Fee: {selectedEvent?.entryFee} NTIQ
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Your Price Prediction (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter your price prediction..."
                  value={predictionValue}
                  onChange={(e) => setPredictionValue(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Current price: ${selectedEvent?.startPrice?.toLocaleString()}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitPrediction}
                disabled={!predictionValue || joinEventMutation.isPending}
              >
                {joinEventMutation.isPending ? "Joining..." : "Join Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}