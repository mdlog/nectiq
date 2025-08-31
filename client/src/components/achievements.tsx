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
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">🏆 Achievements</h2>
        <p className="text-gray-600 dark:text-gray-400">Complete challenges and earn NTIQ rewards!</p>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">Completed</p>
                <p className="text-2xl font-bold text-yellow-950 dark:text-yellow-50">{completedAchievements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">In Progress</p>
                <p className="text-2xl font-bold text-blue-950 dark:text-blue-50">{inProgressAchievements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Coins className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-200">Total Rewards</p>
                <p className="text-2xl font-bold text-green-950 dark:text-green-50">{totalRewards.toLocaleString()} NTIQ</p>
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
              <Card key={userAchievement.id} className="border-green-200 bg-gray-100 dark:bg-gray-800">
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
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{userAchievement.achievement.name}</CardTitle>
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
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{userAchievement.achievement.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {userAchievement.achievement.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
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
                    <span className="text-xs text-gray-600 dark:text-gray-400">Target: {userAchievement.achievement.target}</span>
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
          <h3 className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-300">📋 Available Achievements</h3>
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
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{achievement.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getAchievementTypeLabel(achievement.type)}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-500">Target: {achievement.target}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {userAchievements.length === 0 && allAchievements.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Achievements Available</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Start making predictions to unlock achievements and earn rewards!
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-lg text-sm font-medium">
            <Target className="w-4 h-4 mr-2" />
            Make your first prediction to get started
          </div>
        </div>
      )}

      {/* Help Text */}
      {(completedAchievements.length > 0 || inProgressAchievements.length > 0 || notStartedAchievements.length > 0) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Tips for Achievements</h4>
              <ul className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <li>• Make accurate predictions to unlock accuracy-based achievements</li>
                <li>• Place higher stakes to earn high-stakes achievement rewards</li>
                <li>• Build win streaks for bonus multiplier achievements</li>
                <li>• Check back regularly for new achievements and challenges</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}