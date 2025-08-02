import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, TrendingUp, TrendingDown, Clock, Target, Coins, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface CoinPrediction {
  cryptocurrency: string;
  prediction: "up" | "down";
  startPrice: number;
}

interface ParlayPrediction {
  id: number;
  stakeAmount: number;
  targetTime: string;
  duration: string;
  totalMultiplier: number;
  status: string;
  completedAt?: string;
  createdAt: string;
  rewardAmount?: number;
  totalCoinCount: number;
  correctPredictions?: number;
  coins: Array<{
    cryptocurrency: string;
    prediction: string;
    startPrice: number;
    endPrice?: number;
    isCorrect?: boolean;
  }>;
}

const cryptocurrencies = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "binancecoin", name: "BNB", symbol: "BNB" },
  { id: "cardano", name: "Cardano", symbol: "ADA" },
  { id: "solana", name: "Solana", symbol: "SOL" }
];

const durations = [
  { value: "1h", label: "1 Hour", multiplier: 1.2 },
  { value: "6h", label: "6 Hours", multiplier: 1.5 },
  { value: "24h", label: "24 Hours", multiplier: 2.0 },
  { value: "7d", label: "7 Days", multiplier: 3.0 }
];

export default function ParlayPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [stakeAmount, setStakeAmount] = useState("50");
  const [selectedDuration, setSelectedDuration] = useState("24h");
  const [coinPredictions, setCoinPredictions] = useState<CoinPrediction[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    staleTime: 1000 * 60 * 5
  });

  // Fetch current crypto prices
  const { data: cryptoPrices } = useQuery({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 2000,
    staleTime: 1000
  });

  // Fetch user's parlay predictions
  const { data: userParlays, isLoading: loadingParlays } = useQuery<ParlayPrediction[]>({
    queryKey: ["/api/parlay/user"],
    enabled: !!user
  });

  // Create parlay mutation
  const createParlayMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/parlay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create parlay");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Parlay prediction created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parlay/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowCreateForm(false);
      setCoinPredictions([]);
      setStakeAmount("50");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const addCoinPrediction = () => {
    if (coinPredictions.length >= 5) {
      toast({
        title: "Maximum Reached",
        description: "You can add up to 5 coins in a parlay",
        variant: "destructive"
      });
      return;
    }

    setCoinPredictions([
      ...coinPredictions,
      {
        cryptocurrency: "bitcoin",
        prediction: "up",
        startPrice: 0
      }
    ]);
  };

  const removeCoinPrediction = (index: number) => {
    setCoinPredictions(coinPredictions.filter((_, i) => i !== index));
  };

  const updateCoinPrediction = (index: number, field: keyof CoinPrediction, value: any) => {
    const updated = [...coinPredictions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Update start price when crypto changes
    if (field === "cryptocurrency" && cryptoPrices) {
      const crypto = cryptoPrices.find((c: any) => c.id === value);
      if (crypto) {
        updated[index].startPrice = crypto.current_price;
      }
    }
    
    setCoinPredictions(updated);
  };

  const calculateTotalMultiplier = () => {
    const coinCount = coinPredictions.length;
    const durationMultiplier = durations.find(d => d.value === selectedDuration)?.multiplier || 1;
    const baseMultiplier = 1.5;
    return Math.pow(baseMultiplier, coinCount) * durationMultiplier;
  };

  const handleCreateParlay = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create parlay predictions",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(stakeAmount) < 50) {
      toast({
        title: "Invalid Stake",
        description: "Minimum stake is 50 NTIQ",
        variant: "destructive"
      });
      return;
    }

    if (coinPredictions.length < 2) {
      toast({
        title: "Insufficient Coins",
        description: "At least 2 coins required for parlay",
        variant: "destructive"
      });
      return;
    }

    if (user.balance < parseFloat(stakeAmount)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough NTIQ for this stake",
        variant: "destructive"
      });
      return;
    }

    // Set start prices from current market data
    const coinsWithPrices = coinPredictions.map(coin => {
      const crypto = cryptoPrices?.find((c: any) => c.id === coin.cryptocurrency);
      return {
        ...coin,
        startPrice: crypto?.current_price || 0
      };
    });

    createParlayMutation.mutate({
      stakeAmount: parseFloat(stakeAmount),
      duration: selectedDuration,
      coins: coinsWithPrices
    });
  };

  const formatTimeRemaining = (targetTime: string) => {
    const now = new Date();
    const target = new Date(targetTime);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "won": return "default";
      case "lost": return "destructive";
      default: return "outline";
    }
  };

  // Initialize start prices when crypto prices are loaded
  useEffect(() => {
    if (cryptoPrices && coinPredictions.length > 0) {
      const updatedPredictions = coinPredictions.map(coin => {
        const crypto = cryptoPrices.find((c: any) => c.id === coin.cryptocurrency);
        return {
          ...coin,
          startPrice: crypto?.current_price || coin.startPrice
        };
      });
      setCoinPredictions(updatedPredictions);
    }
  }, [cryptoPrices]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Parlay Predictions
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create multi-coin predictions with exponential rewards. The more coins you predict correctly, 
          the higher your multiplier!
        </p>
      </div>

      {/* User Balance */}
      {user && (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Balance</span>
              <span className="text-2xl font-bold text-green-600">
                {user.balance.toLocaleString()} NTIQ
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Parlay Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Create New Parlay
              </CardTitle>
              <CardDescription>
                Predict multiple coins for exponential rewards
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant={showCreateForm ? "outline" : "default"}
            >
              {showCreateForm ? "Cancel" : "Create Parlay"}
            </Button>
          </div>
        </CardHeader>

        {showCreateForm && (
          <CardContent className="space-y-6">
            {/* Stake and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stake">Stake Amount (NTIQ)</Label>
                <Input
                  id="stake"
                  type="number"
                  min="50"
                  step="1"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Minimum 50 NTIQ"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label} ({duration.multiplier}x)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Coin Predictions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Coin Predictions</Label>
                <Button
                  onClick={addCoinPrediction}
                  size="sm"
                  variant="outline"
                  disabled={coinPredictions.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Coin
                </Button>
              </div>

              {coinPredictions.map((coin, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Cryptocurrency</Label>
                      <Select
                        value={coin.cryptocurrency}
                        onValueChange={(value) => updateCoinPrediction(index, "cryptocurrency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptocurrencies.map((crypto) => (
                            <SelectItem key={crypto.id} value={crypto.id}>
                              {crypto.name} ({crypto.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Current Price</Label>
                      <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                        ${cryptoPrices?.find((c: any) => c.id === coin.cryptocurrency)?.current_price?.toFixed(2) || "Loading..."}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Prediction</Label>
                      <Select
                        value={coin.prediction}
                        onValueChange={(value) => updateCoinPrediction(index, "prediction", value as "up" | "down")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              Up
                            </div>
                          </SelectItem>
                          <SelectItem value="down">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              Down
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={() => removeCoinPrediction(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {coinPredictions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Add at least 2 coins to create a parlay prediction</p>
                </div>
              )}
            </div>

            {/* Multiplier and Reward Preview */}
            {coinPredictions.length >= 2 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Multiplier:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {calculateTotalMultiplier().toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Potential Reward:</span>
                  <span className="text-xl font-bold text-green-600">
                    {(parseFloat(stakeAmount || "0") * calculateTotalMultiplier()).toFixed(0)} NTIQ
                  </span>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  All coins must be predicted correctly to win the full reward
                </p>
              </div>
            )}

            {/* Create Button */}
            <Button
              onClick={handleCreateParlay}
              disabled={coinPredictions.length < 2 || createParlayMutation.isPending}
              className="w-full"
              size="lg"
            >
              {createParlayMutation.isPending ? "Creating..." : "Create Parlay Prediction"}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* User's Parlay History */}
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Parlay Predictions
          </CardTitle>
          <CardDescription>
            Track your multi-coin predictions and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingParlays ? (
            <div className="text-center py-8">Loading your parlays...</div>
          ) : userParlays && userParlays.length > 0 ? (
            <div className="space-y-4">
              {userParlays.map((parlay) => (
                <Card key={parlay.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">Parlay #{parlay.id}</h3>
                        <Badge variant={getStatusBadgeVariant(parlay.status)}>
                          {parlay.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {parlay.totalCoinCount} coins • {parlay.totalMultiplier.toFixed(2)}x multiplier
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold">
                        {parlay.stakeAmount} NTIQ
                      </div>
                      {parlay.status === "active" && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimeRemaining(parlay.targetTime)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coin Predictions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {parlay.coins.map((coin, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {cryptocurrencies.find(c => c.id === coin.cryptocurrency)?.symbol || coin.cryptocurrency.toUpperCase()}
                          </span>
                          {coin.prediction === "up" ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <div>${coin.startPrice.toFixed(2)}</div>
                          {coin.endPrice && (
                            <div className={`font-semibold ${coin.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              ${coin.endPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Result */}
                  {parlay.status === "completed" && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <span>Result:</span>
                        <span className={`font-semibold ${parlay.rewardAmount && parlay.rewardAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parlay.correctPredictions}/{parlay.totalCoinCount} correct
                          {parlay.rewardAmount && parlay.rewardAmount > 0 && ` • +${parlay.rewardAmount} NTIQ`}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No parlay predictions yet</p>
              <p className="text-sm">Create your first multi-coin prediction above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}