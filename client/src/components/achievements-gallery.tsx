import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, TrendingUp, Filter, Calendar, Award } from 'lucide-react';
import { AchievementCard } from './achievement-card';

interface Prediction {
  id: number;
  cryptocurrency: string;
  predictedPrice: number;
  actualPrice: number;
  accuracyScore: number;
  rewardAmount: number;
  stakeAmount: number;
  submissionTime: string;
  targetTime: string;
  resolved: boolean;
  claimed: boolean;
}

export function AchievementsGallery() {
  const [sortBy, setSortBy] = useState<'accuracy' | 'reward' | 'date'>('accuracy');
  const [filterBy, setFilterBy] = useState<'all' | 'perfect' | 'high' | 'medium'>('all');

  // Fetch user's successful predictions
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['/api/predictions/user-history'],
    enabled: true,
  });

  // Filter and sort predictions
  const processedPredictions = React.useMemo(() => {
    let filtered = predictions.filter((p: Prediction) => p.resolved && p.claimed);

    // Apply filters
    if (filterBy !== 'all') {
      filtered = filtered.filter((p: Prediction) => {
        const accuracy = (p.accuracyScore / 10000) * 100;
        switch (filterBy) {
          case 'perfect': return accuracy >= 99.9;
          case 'high': return accuracy >= 95 && accuracy < 99.9;
          case 'medium': return accuracy >= 90 && accuracy < 95;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a: Prediction, b: Prediction) => {
      switch (sortBy) {
        case 'accuracy':
          return b.accuracyScore - a.accuracyScore;
        case 'reward':
          return b.rewardAmount - a.rewardAmount;
        case 'date':
          return new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [predictions, sortBy, filterBy]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalPredictions = predictions.filter((p: Prediction) => p.resolved).length;
    const successfulPredictions = processedPredictions.length;
    const totalRewards = processedPredictions.reduce((sum: number, p: Prediction) => sum + p.rewardAmount, 0);
    const avgAccuracy = processedPredictions.length > 0 
      ? processedPredictions.reduce((sum: number, p: Prediction) => sum + p.accuracyScore, 0) / processedPredictions.length / 100
      : 0;

    return {
      totalPredictions,
      successfulPredictions,
      totalRewards,
      avgAccuracy,
      successRate: totalPredictions > 0 ? (successfulPredictions / totalPredictions) * 100 : 0
    };
  }, [predictions, processedPredictions]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading achievements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.successfulPredictions}</div>
            <div className="text-sm text-muted-foreground">Successful Predictions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.avgAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Average Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalRewards.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total NTIQ Earned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.successRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Your Achievements
            </CardTitle>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accuracy">By Accuracy</SelectItem>
                  <SelectItem value="reward">By Reward</SelectItem>
                  <SelectItem value="date">By Date</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="perfect">Perfect (99.9%+)</SelectItem>
                  <SelectItem value="high">High (95%+)</SelectItem>
                  <SelectItem value="medium">Medium (90%+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {processedPredictions.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
              <p className="text-muted-foreground mb-4">
                Make successful predictions to earn achievements and share them with friends!
              </p>
              <Button>Make Your First Prediction</Button>
            </div>
          ) : (
            <Tabs defaultValue="grid" className="space-y-4">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processedPredictions.map((prediction: Prediction) => (
                    <AchievementCard
                      key={prediction.id}
                      prediction={prediction}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="list">
                <div className="space-y-4">
                  {processedPredictions.map((prediction: Prediction) => (
                    <div key={prediction.id} className="max-w-2xl">
                      <AchievementCard
                        prediction={prediction}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}