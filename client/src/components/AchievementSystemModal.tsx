import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Trophy,
    Medal,
    Star,
    Target,
    Users,
    Crown,
    Zap,
    Lock,
    CheckCircle2,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { CONTRACTS, ABIS } from '@/lib/contracts';

interface AchievementSystemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface Achievement {
    id: number;
    category: string;
    name: string;
    description: string;
    threshold: number;
    isMintable: boolean;
    progress: number;
    hasMinted: boolean;
    icon: React.ReactNode;
    color: string;
}

const ACHIEVEMENT_CATEGORIES = [
    {
        id: 'prediction_accuracy',
        name: 'Prediction Accuracy',
        icon: Target,
        color: 'blue',
        description: 'Make accurate predictions'
    },
    {
        id: 'win_streak',
        name: 'Win Streak',
        icon: Zap,
        color: 'yellow',
        description: 'Achieve consecutive wins'
    },
    {
        id: 'volume',
        name: 'Volume Trader',
        icon: TrendingUp,
        color: 'green',
        description: 'Trade high volumes'
    },
    {
        id: 'referral',
        name: 'Referral Master',
        icon: Users,
        color: 'purple',
        description: 'Refer friends successfully'
    },
    {
        id: 'tournament',
        name: 'Tournament Winner',
        icon: Crown,
        color: 'red',
        description: 'Win tournaments'
    },
    {
        id: 'special_event',
        name: 'Special Events',
        icon: Star,
        color: 'pink',
        description: 'Participate in special events'
    }
];

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
    {
        id: 1,
        category: 'prediction_accuracy',
        name: 'First Steps',
        description: 'Make your first 10 predictions',
        threshold: 10,
        isMintable: true,
        progress: 7,
        hasMinted: false,
        icon: <Target className="h-4 w-4" />,
        color: 'blue'
    },
    {
        id: 2,
        category: 'win_streak',
        name: 'Hot Streak',
        description: 'Win 5 predictions in a row',
        threshold: 5,
        isMintable: true,
        progress: 3,
        hasMinted: false,
        icon: <Zap className="h-4 w-4" />,
        color: 'yellow'
    },
    {
        id: 3,
        category: 'volume',
        name: 'Volume Trader',
        description: 'Trade 1000 NTIQ in total volume',
        threshold: 1000,
        isMintable: true,
        progress: 650,
        hasMinted: false,
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'green'
    },
    {
        id: 4,
        category: 'referral',
        name: 'Referral Master',
        description: 'Successfully refer 5 friends',
        threshold: 5,
        isMintable: true,
        progress: 2,
        hasMinted: false,
        icon: <Users className="h-4 w-4" />,
        color: 'purple'
    },
    {
        id: 5,
        category: 'tournament',
        name: 'Tournament Winner',
        description: 'Win your first tournament',
        threshold: 1,
        isMintable: true,
        progress: 0,
        hasMinted: false,
        icon: <Crown className="h-4 w-4" />,
        color: 'red'
    },
    {
        id: 6,
        category: 'special_event',
        name: 'Event Participant',
        description: 'Participate in a special event',
        threshold: 1,
        isMintable: true,
        progress: 0,
        hasMinted: false,
        icon: <Star className="h-4 w-4" />,
        color: 'pink'
    }
];

export function AchievementSystemModal({
    isOpen,
    onClose,
    onSuccess
}: AchievementSystemModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [achievements, setAchievements] = useState<Achievement[]>(SAMPLE_ACHIEVEMENTS);
    const [userAchievements, setUserAchievements] = useState<number[]>([]);

    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    // Get user's NFT balance (achievements owned)
    const { data: nftBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.NFT_ACHIEVEMENT_SYSTEM,
        abi: ABIS.NFT_ACHIEVEMENT_SYSTEM,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && isConnected,
        },
    });

    // Get user progress for each category
    const { data: predictionProgress } = useReadContract({
        address: CONTRACTS.NFT_ACHIEVEMENT_SYSTEM,
        abi: ABIS.NFT_ACHIEVEMENT_SYSTEM,
        functionName: 'getUserProgress',
        args: address ? [address, 'prediction_accuracy'] : undefined,
        query: {
            enabled: !!address && isConnected,
        },
    });

    const { data: winStreakProgress } = useReadContract({
        address: CONTRACTS.NFT_ACHIEVEMENT_SYSTEM,
        abi: ABIS.NFT_ACHIEVEMENT_SYSTEM,
        functionName: 'getUserProgress',
        args: address ? [address, 'win_streak'] : undefined,
        query: {
            enabled: !!address && isConnected,
        },
    });

    const { data: volumeProgress } = useReadContract({
        address: CONTRACTS.NFT_ACHIEVEMENT_SYSTEM,
        abi: ABIS.NFT_ACHIEVEMENT_SYSTEM,
        functionName: 'getUserProgress',
        args: address ? [address, 'volume'] : undefined,
        query: {
            enabled: !!address && isConnected,
        },
    });

    const { data: referralProgress } = useReadContract({
        address: CONTRACTS.NFT_ACHIEVEMENT_SYSTEM,
        abi: ABIS.NFT_ACHIEVEMENT_SYSTEM,
        functionName: 'getUserProgress',
        args: address ? [address, 'referral'] : undefined,
        query: {
            enabled: !!address && isConnected,
        },
    });

    // Update achievements with real progress data
    useEffect(() => {
        if (predictionProgress !== undefined) {
            setAchievements(prev => prev.map(achievement =>
                achievement.category === 'prediction_accuracy'
                    ? { ...achievement, progress: Number(predictionProgress) }
                    : achievement
            ));
        }
    }, [predictionProgress]);

    useEffect(() => {
        if (winStreakProgress !== undefined) {
            setAchievements(prev => prev.map(achievement =>
                achievement.category === 'win_streak'
                    ? { ...achievement, progress: Number(winStreakProgress) }
                    : achievement
            ));
        }
    }, [winStreakProgress]);

    useEffect(() => {
        if (volumeProgress !== undefined) {
            setAchievements(prev => prev.map(achievement =>
                achievement.category === 'volume'
                    ? { ...achievement, progress: Number(volumeProgress) }
                    : achievement
            ));
        }
    }, [volumeProgress]);

    useEffect(() => {
        if (referralProgress !== undefined) {
            setAchievements(prev => prev.map(achievement =>
                achievement.category === 'referral'
                    ? { ...achievement, progress: Number(referralProgress) }
                    : achievement
            ));
        }
    }, [referralProgress]);

    // Filter achievements by category
    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : achievements.filter(achievement => achievement.category === selectedCategory);

    // Calculate completion percentage
    const getCompletionPercentage = (achievement: Achievement) => {
        return Math.min((achievement.progress / achievement.threshold) * 100, 100);
    };

    // Check if achievement is completed
    const isCompleted = (achievement: Achievement) => {
        return achievement.progress >= achievement.threshold;
    };

    // Check if achievement can be minted
    const canMint = (achievement: Achievement) => {
        return isCompleted(achievement) && achievement.isMintable && !achievement.hasMinted;
    };

    const getCategoryIcon = (categoryId: string) => {
        const category = ACHIEVEMENT_CATEGORIES.find(cat => cat.id === categoryId);
        return category ? <category.icon className="h-4 w-4" /> : <Star className="h-4 w-4" />;
    };

    const getCategoryColor = (categoryId: string) => {
        const category = ACHIEVEMENT_CATEGORIES.find(cat => cat.id === categoryId);
        return category?.color || 'gray';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        Achievement System
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="achievements" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="achievements">Achievements</TabsTrigger>
                        <TabsTrigger value="progress">Progress</TabsTrigger>
                        <TabsTrigger value="owned">My NFTs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="achievements" className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <Button
                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory('all')}
                                className="whitespace-nowrap"
                            >
                                All Categories
                            </Button>
                            {ACHIEVEMENT_CATEGORIES.map(category => (
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category.id)}
                                    className="whitespace-nowrap"
                                >
                                    <category.icon className="h-4 w-4 mr-1" />
                                    {category.name}
                                </Button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredAchievements.map(achievement => {
                                const completionPercentage = getCompletionPercentage(achievement);
                                const completed = isCompleted(achievement);
                                const mintable = canMint(achievement);

                                return (
                                    <Card key={achievement.id} className="relative">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-full bg-${achievement.color}-100`}>
                                                        {achievement.icon}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-sm">{achievement.name}</CardTitle>
                                                        <p className="text-xs text-gray-600">{achievement.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {achievement.hasMinted && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    )}
                                                    {!achievement.isMintable && (
                                                        <Lock className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Progress</span>
                                                    <span>{achievement.progress} / {achievement.threshold}</span>
                                                </div>
                                                <Progress
                                                    value={completionPercentage}
                                                    className="h-2"
                                                />
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>{completionPercentage.toFixed(1)}% complete</span>
                                                    {completed && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Completed!
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-${achievement.color}-600 border-${achievement.color}-200`}
                                                >
                                                    {ACHIEVEMENT_CATEGORIES.find(cat => cat.id === achievement.category)?.name}
                                                </Badge>
                                                {achievement.isMintable && (
                                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                                        <Medal className="h-3 w-3 mr-1" />
                                                        NFT
                                                    </Badge>
                                                )}
                                            </div>

                                            {mintable && (
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        toast({
                                                            title: "Achievement Ready!",
                                                            description: "This achievement can be minted as an NFT",
                                                        });
                                                    }}
                                                >
                                                    <Trophy className="h-4 w-4 mr-2" />
                                                    Mint Achievement NFT
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="progress" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ACHIEVEMENT_CATEGORIES.map(category => {
                                const categoryAchievements = achievements.filter(a => a.category === category.id);
                                const totalProgress = categoryAchievements.reduce((sum, a) => sum + a.progress, 0);
                                const totalThreshold = categoryAchievements.reduce((sum, a) => sum + a.threshold, 0);
                                const overallProgress = totalThreshold > 0 ? (totalProgress / totalThreshold) * 100 : 0;

                                return (
                                    <Card key={category.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-full bg-${category.color}-100`}>
                                                    <category.icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm">{category.name}</CardTitle>
                                                    <p className="text-xs text-gray-600">{category.description}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Overall Progress</span>
                                                    <span>{overallProgress.toFixed(1)}%</span>
                                                </div>
                                                <Progress value={overallProgress} className="h-2" />
                                            </div>

                                            <div className="space-y-1 text-xs">
                                                {categoryAchievements.map(achievement => (
                                                    <div key={achievement.id} className="flex justify-between">
                                                        <span>{achievement.name}</span>
                                                        <span className={isCompleted(achievement) ? 'text-green-600' : ''}>
                                                            {achievement.progress}/{achievement.threshold}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="owned" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Trophy className="h-4 w-4" />
                                    Your Achievement NFTs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">
                                        You own {nftBalance ? Number(nftBalance) : 0} achievement NFTs
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Complete achievements to mint your first NFT!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="text-xs text-gray-500 text-center">
                    Complete achievements to earn NFT rewards and track your progress
                </div>
            </DialogContent>
        </Dialog>
    );
}
