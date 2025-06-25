import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Award, Star, TrendingUp, Coins } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  icon: string;
  isActive: boolean;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  progress: number;
  isCompleted: boolean;
  completedAt: string | null;
  achievement: Achievement;
}

function getAchievementIcon(type: string, isCompleted: boolean) {
  const iconClass = `w-6 h-6 ${isCompleted ? 'text-yellow-500' : 'text-gray-400'}`;
  
  switch (type) {
    case 'prediction_count':
      return <Target className={iconClass} />;
    case 'accuracy':
      return <TrendingUp className={iconClass} />;
    case 'streak':
      return <Trophy className={iconClass} />;
    case 'rewards':
      return <Coins className={iconClass} />;
    case 'high_stake':
      return <Star className={iconClass} />;
    default:
      return <Award className={iconClass} />;
  }
}

function getAchievementTypeLabel(type: string) {
  switch (type) {
    case 'prediction_count':
      return 'Predictions';
    case 'accuracy':
      return 'Accuracy';
    case 'streak':
      return 'Win Streak';
    case 'rewards':
      return 'Rewards';
    case 'high_stake':
      return 'High Stakes';
    default:
      return 'Achievement';
  }
}

export function Achievements() {
  const { data: userAchievements = [], isLoading } = useQuery<UserAchievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: allAchievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements/all"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedAchievements = userAchievements.filter(ua => ua.isCompleted);
  const inProgressAchievements = userAchievements.filter(ua => !ua.isCompleted);

  // Get achievements not yet started
  const startedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
  const notStartedAchievements = allAchievements.filter(a => !startedAchievementIds.has(a.id));

  const totalRewards = completedAchievements.reduce((sum, ua) => sum + ua.achievement.reward, 0);

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-black dark:text-white">Completed</p>
                <p className="text-2xl font-bold">{completedAchievements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-black dark:text-white">In Progress</p>
                <p className="text-2xl font-bold">{inProgressAchievements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Coins className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-black dark:text-white">Total Rewards</p>
                <p className="text-2xl font-bold">{totalRewards.toLocaleString()} NTIQ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Achievements */}
      {completedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-600">🏆 Completed Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAchievements.map((userAchievement) => (
              <Card key={userAchievement.id} className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getAchievementIcon(userAchievement.achievement.type, true)}
                      <span className="text-lg">{userAchievement.achievement.icon}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{userAchievement.achievement.reward} NTIQ
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{userAchievement.achievement.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-3 font-medium">
                    {userAchievement.achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getAchievementTypeLabel(userAchievement.achievement.type)}
                    </Badge>
                    <span className="text-xs text-green-600 font-medium">✓ Completed</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600">🎯 In Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAchievements.map((userAchievement) => (
              <Card key={userAchievement.id} className="border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getAchievementIcon(userAchievement.achievement.type, false)}
                      <span className="text-lg">{userAchievement.achievement.icon}</span>
                    </div>
                    <Badge variant="outline">
                      +{userAchievement.achievement.reward} NTIQ
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{userAchievement.achievement.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white dark:text-white mb-3 font-semibold">
                    {userAchievement.achievement.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white dark:text-white font-semibold">Progress</span>
                      <span className="font-bold text-white dark:text-white">
                        {userAchievement.progress} / {userAchievement.achievement.target}
                      </span>
                    </div>
                    <Progress 
                      value={(userAchievement.progress / userAchievement.achievement.target) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {getAchievementTypeLabel(userAchievement.achievement.type)}
                    </Badge>
                    <span className="text-xs text-white dark:text-white font-semibold">Target: {userAchievement.achievement.target}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Achievements */}
      {notStartedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 text-white dark:text-white">📋 Available Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notStartedAchievements.map((achievement) => (
              <Card key={achievement.id} className="border-gray-200 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getAchievementIcon(achievement.type, false)}
                      <span className="text-lg grayscale">{achievement.icon}</span>
                    </div>
                    <Badge variant="outline">
                      +{achievement.reward} NTIQ
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white dark:text-white font-bold">{achievement.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white dark:text-white mb-3 font-semibold">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs font-semibold">
                      {getAchievementTypeLabel(achievement.type)}
                    </Badge>
                    <span className="text-xs text-white dark:text-white font-semibold">Target: {achievement.target}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}