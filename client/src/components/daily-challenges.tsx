import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target, TrendingUp, Coins, Star, BarChart3 } from "lucide-react";

interface DailyChallenge {
  id: number;
  name: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  date: string;
  isActive: boolean;
}

interface UserDailyChallenge {
  id: number;
  userId: number;
  challengeId: number;
  progress: number;
  isCompleted: boolean;
  completedAt: string | null;
  date: string;
  challenge: DailyChallenge;
}

function getChallengeIcon(type: string, isCompleted: boolean) {
  const iconClass = `w-6 h-6 ${isCompleted ? 'text-green-500 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`;
  
  switch (type) {
    case 'make_predictions':
      return <Target className={iconClass} />;
    case 'accuracy_target':
      return <TrendingUp className={iconClass} />;
    case 'high_stake':
      return <Star className={iconClass} />;
    case 'diverse_predictions':
      return <BarChart3 className={iconClass} />;
    default:
      return <Target className={iconClass} />;
  }
}

function getChallengeTypeLabel(type: string) {
  switch (type) {
    case 'make_predictions':
      return 'Daily Predictions';
    case 'accuracy_target':
      return 'Accuracy Goal';
    case 'high_stake':
      return 'High Stakes';
    case 'diverse_predictions':
      return 'Crypto Diversity';
    default:
      return 'Challenge';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function DailyChallenges() {
  const { data: todaysChallenges = [], isLoading } = useQuery<UserDailyChallenge[]>({
    queryKey: ["/api/challenges/today"],
  });

  const { data: challengeHistory = [] } = useQuery<UserDailyChallenge[]>({
    queryKey: ["/api/challenges/history"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedToday = todaysChallenges.filter(c => c.isCompleted);
  const totalRewardsToday = completedToday.reduce((sum, c) => sum + c.challenge.reward, 0);
  const completionRate = todaysChallenges.length > 0 ? 
    Math.round((completedToday.length / todaysChallenges.length) * 100) : 0;

  // Calculate streak from history
  const recentDays = challengeHistory.reduce((acc, challenge) => {
    const date = challenge.date;
    if (!acc[date]) {
      acc[date] = { total: 0, completed: 0 };
    }
    acc[date].total++;
    if (challenge.isCompleted) {
      acc[date].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const dailyCompletions = Object.entries(recentDays)
    .map(([date, stats]) => ({
      date,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  let currentStreak = 0;
  for (const day of dailyCompletions) {
    if (day.completionRate >= 50) { // At least 50% completion
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-6">
      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-green-500 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedToday.length}/{todaysChallenges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Coins className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">NTIQ Earned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRewardsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Daily Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Challenges */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Challenges</h3>
          <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Badge>
        </div>

        {todaysChallenges.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No challenges available today. Check back tomorrow!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysChallenges.map((userChallenge) => (
              <Card 
                key={userChallenge.id} 
                className={`${
                  userChallenge.isCompleted 
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                    : 'border-blue-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getChallengeIcon(userChallenge.challenge.type, userChallenge.isCompleted)}
                      {userChallenge.isCompleted && (
                        <span className="text-lg">✅</span>
                      )}
                    </div>
                    <Badge variant={userChallenge.isCompleted ? "default" : "outline"} 
                           className={userChallenge.isCompleted ? 
                             "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : 
                             "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"}>
                      +{userChallenge.challenge.reward} NTIQ
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{userChallenge.challenge.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {userChallenge.challenge.description}
                  </p>
                  
                  {!userChallenge.isCompleted && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {userChallenge.progress} / {userChallenge.challenge.target}
                        </span>
                      </div>
                      <Progress 
                        value={(userChallenge.progress / userChallenge.challenge.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      {getChallengeTypeLabel(userChallenge.challenge.type)}
                    </Badge>
                    {userChallenge.isCompleted && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Completed {userChallenge.completedAt && 
                          new Date(userChallenge.completedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        }
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent History */}
      {challengeHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Challenge History</h3>
          <div className="space-y-2">
            {dailyCompletions.slice(0, 7).map(({ date, completionRate }) => (
              <Card key={date} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(date)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Completion:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.round(completionRate)}%</span>
                    </div>
                    <Progress value={completionRate} className="w-20 h-2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}