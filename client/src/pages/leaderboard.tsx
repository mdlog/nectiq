import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Target, Coins } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface LeaderboardEntry {
  id: number;
  username: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  totalRewards: number;
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return <span className="h-6 w-6 flex items-center justify-center text-sm font-bold text-slate-400">#{rank}</span>;
  }
}

function getRankColor(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
    case 2:
      return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30";
    case 3:
      return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30";
    default:
      return "bg-surface border-surface-light";
  }
}

function getAccuracyLevel(accuracy: number) {
  if (accuracy >= 80) return { label: "Expert", color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (accuracy >= 70) return { label: "Advanced", color: "text-green-500", bg: "bg-green-500/10" };
  if (accuracy >= 60) return { label: "Intermediate", color: "text-blue-500", bg: "bg-blue-500/10" };
  if (accuracy >= 50) return { label: "Novice", color: "text-purple-500", bg: "bg-purple-500/10" };
  return { label: "Beginner", color: "text-slate-500", bg: "bg-slate-500/10" };
}

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded mb-6 w-64"></div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 bg-surface rounded mb-4"></div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            🏆 Global Leaderboard
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Top predictors ranked by accuracy and total rewards earned. Compete with traders worldwide!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-surface border-surface-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                Total Competitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderboard?.length || 0}</div>
              <p className="text-xs text-slate-400 mt-1">Active predictors</p>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-500" />
                Best Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {leaderboard?.[0]?.accuracy || 0}%
              </div>
              <p className="text-xs text-slate-400 mt-1">Current leader</p>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                <Coins className="h-4 w-4 mr-2 text-primary" />
                Total Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {leaderboard?.reduce((sum, user) => sum + user.totalRewards, 0).toLocaleString() || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">PTS distributed</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-surface border-surface-light">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Top Predictors
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {leaderboard?.map((user, index) => {
                const rank = index + 1;
                const accuracyLevel = getAccuracyLevel(user.accuracy);
                
                return (
                  <div
                    key={user.id}
                    className={`p-4 flex items-center justify-between border-b border-surface-light last:border-b-0 transition-colors hover:bg-surface-light/50 ${rank <= 3 ? getRankColor(rank) : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">{user.username}</div>
                          <div className="text-sm text-slate-400">
                            {user.totalPredictions} predictions • {user.correctPredictions} correct
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Accuracy */}
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">
                          {user.accuracy}%
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${accuracyLevel.bg} ${accuracyLevel.color} border-none`}
                        >
                          {accuracyLevel.label}
                        </Badge>
                      </div>

                      {/* Total Rewards */}
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {user.totalRewards.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">PTS</div>
                      </div>

                      {/* Win Rate Indicator */}
                      <div className="text-center hidden md:block">
                        <div className="text-sm font-medium text-foreground">
                          {user.totalPredictions > 0 ? ((user.correctPredictions / user.totalPredictions) * 100).toFixed(1) : 0}%
                        </div>
                        <div className="text-xs text-slate-400">Win Rate</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {leaderboard?.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No Data Yet</h3>
                <p className="text-slate-400">Be the first to make predictions and claim the top spot!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-6">
              <h3 className="text-xl font-bold mb-2">Want to climb the ranks?</h3>
              <p className="text-slate-400 mb-4">
                Make accurate predictions to earn rewards and boost your leaderboard position
              </p>
              <a 
                href="/"
                className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Predicting
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}