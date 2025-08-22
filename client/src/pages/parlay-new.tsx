import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, TrendingUp, TrendingDown } from "lucide-react";

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

interface ParlayCard {
  id: string;
  cryptocurrency: string;
  prediction: 'up' | 'down';
  duration: '1h' | '6h' | '24h' | '7d';
  startPrice: number;
}

interface ActiveParlay {
  id: string;
  stakeAmount: number;
  multiplier: number;
  potentialWin: number;
  status: 'active' | 'completed' | 'failed';
  createdAt: string;
  expiresAt: string;
  coins: {
    cryptocurrency: string;
    prediction: 'up' | 'down';
    duration: string;
    startPrice: number;
    currentPrice?: number;
    targetPrice?: number;
    isWinning?: boolean;
  }[];
}

export default function ParlayNew() {
  console.log("🚀 [PARLAY] Component rendering...");
  
  const [parlayCards, setParlayCards] = useState<ParlayCard[]>([]);
  const [stakeAmount, setStakeAmount] = useState("");
  const [totalMultiplier, setTotalMultiplier] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch live crypto prices
  const { data: cryptos = [] } = useQuery({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 2000
  }) as { data: any[] };

  // Fetch user's active parlays
  const { data: userParlays = [], isLoading: parlaysLoading, error: parlaysError } = useQuery({
    queryKey: ["/api/parlay/user"],
    refetchInterval: 10000,
    retry: 1,
    retryOnMount: false,
    refetchOnWindowFocus: false
  }) as { data: ActiveParlay[], isLoading: boolean, error: any };

  // Debug parlays error
  useEffect(() => {
    if (parlaysError) {
      console.error("🔥 [PARLAY] Error fetching user parlays:", parlaysError);
    }
  }, [parlaysError]);

  // Create parlay mutation
  const createParlayMutation = useMutation({
    mutationFn: async (data: { stakeAmount: string; coins: any[] }) => {
      console.log("🟢 [FRONTEND] Sending parlay creation request:", data);
      return apiRequest("/api/parlay/create", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (result) => {
      console.log("✅ [FRONTEND] Parlay created successfully:", result);
      toast({
        title: "Parlay Created!",
        description: "Your prediction has been submitted successfully",
      });
      setParlayCards([]);
      setStakeAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/parlay/user"] });
    },
    onError: (error: any) => {
      console.error("❌ [FRONTEND] Parlay creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create parlay",
        variant: "destructive"
      });
    }
  });

  // Calculate total multiplier when cards change
  useEffect(() => {
    if (parlayCards.length === 0) {
      setTotalMultiplier(1);
      return;
    }

    let multiplier = 1;
    const durationMultipliers = { '1h': 1.2, '6h': 1.5, '24h': 2.0, '7d': 3.0 };
    
    parlayCards.forEach(card => {
      const coinMultiplier = 1.5 * (durationMultipliers[card.duration] || 1.2);
      multiplier *= coinMultiplier;
    });
    
    setTotalMultiplier(multiplier);
  }, [parlayCards]);

  const addParlayCard = () => {
    if (parlayCards.length >= 5) {
      toast({
        title: "Maximum Reached",
        description: "You can only add up to 5 coins in a parlay",
        variant: "destructive"
      });
      return;
    }

    const newCard: ParlayCard = {
      id: Date.now().toString(),
      cryptocurrency: '',
      prediction: 'up',
      duration: '1h',
      startPrice: 0
    };
    
    setParlayCards([...parlayCards, newCard]);
  };

  const removeParlayCard = (id: string) => {
    setParlayCards(parlayCards.filter(card => card.id !== id));
  };

  const updateParlayCard = (id: string, field: keyof ParlayCard, value: any) => {
    setParlayCards(parlayCards.map(card => {
      if (card.id === id) {
        const updatedCard = { ...card, [field]: value };
        
        // Update start price when cryptocurrency changes
        if (field === 'cryptocurrency' && value) {
          const crypto = cryptos.find((c: Cryptocurrency) => c.id === value);
          if (crypto) {
            updatedCard.startPrice = crypto.current_price;
          }
        }
        
        return updatedCard;
      }
      return card;
    }));
  };

  const handleSubmit = () => {
    if (!stakeAmount || parseFloat(stakeAmount) < 50) {
      toast({
        title: "Invalid Stake",
        description: "Minimum stake is 50 NTIQ",
        variant: "destructive"
      });
      return;
    }

    if (parlayCards.length < 2) {
      toast({
        title: "Not Enough Coins",
        description: "Add at least 2 coins to create a parlay",
        variant: "destructive"
      });
      return;
    }

    // Validate all cards are complete
    const incompleteCard = parlayCards.find(card => 
      !card.cryptocurrency || card.startPrice === 0
    );
    
    if (incompleteCard) {
      toast({
        title: "Incomplete Selection",
        description: "Please select cryptocurrency for all cards",
        variant: "destructive"
      });
      return;
    }

    // Submit parlay
    const coins = parlayCards.map(card => ({
      cryptocurrency: card.cryptocurrency,
      prediction: card.prediction,
      duration: card.duration,
      startPrice: card.startPrice
    }));

    createParlayMutation.mutate({
      stakeAmount,
      coins
    });
  };

  const potentialWin = parseFloat(stakeAmount || "0") * totalMultiplier;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Parlay Predictions</h1>
          <p className="text-muted-foreground">
            Create and monitor your multi-coin predictions for higher rewards
          </p>
        </div>

        {/* Active Parlays Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Your Active Parlays</h2>
            {!parlaysLoading && (
              <Badge variant="secondary">
                {userParlays.length} {userParlays.length === 1 ? 'Active' : 'Active'}
              </Badge>
            )}
          </div>
          
          {parlaysLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading your TrendRides...</p>
              </div>
            </div>
          ) : userParlays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userParlays.map((parlay: ActiveParlay) => (
                <Card key={parlay.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">TrendRide #{parlay.id.slice(-6)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {parlay.coins.length} coins • {parlay.multiplier.toFixed(2)}x
                        </p>
                      </div>
                      <Badge 
                        variant={parlay.status === 'active' ? 'default' : 
                                parlay.status === 'completed' ? 'secondary' : 'destructive'}
                      >
                        {parlay.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stake:</span>
                      <span className="font-medium">{parlay.stakeAmount} NTIQ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Potential Win:</span>
                      <span className="font-medium text-green-600">{parlay.potentialWin.toFixed(0)} NTIQ</span>
                    </div>
                    <div className="space-y-2">
                      {parlay.coins.map((coin, index) => {
                        const crypto = cryptos.find((c: Cryptocurrency) => c.id === coin.cryptocurrency);
                        return (
                          <div key={index} className="flex items-center justify-between text-xs bg-muted p-2 rounded">
                            <div className="flex items-center gap-2">
                              {crypto && <img src={crypto.image} alt={crypto.name} className="w-4 h-4" />}
                              <span className="font-medium">{crypto?.symbol.toUpperCase()}</span>
                              <Badge 
                                variant="outline" 
                                className={coin.prediction === 'up' ? 'text-green-600' : 'text-red-600'}
                              >
                                {coin.prediction === 'up' ? '↗' : '↘'}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground">{coin.duration}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Expires: {new Date(parlay.expiresAt).toLocaleDateString()} {new Date(parlay.expiresAt).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Active Parlays</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any active parlay predictions yet. Create your first multi-coin prediction below to get started.
                  </p>
                  <Button 
                    onClick={() => {
                      // Scroll to create section
                      const createSection = document.querySelector('#create-parlay-section');
                      if (createSection) {
                        createSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    variant="outline"
                  >
                    Create Your First Parlay
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create New Parlay Section */}
        <div id="create-parlay-section" className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Create New Parlay</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parlay Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Prediction Cards ({parlayCards.length}/5)</h2>
              <Button onClick={addParlayCard} disabled={parlayCards.length >= 5}>
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>

            {parlayCards.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">No prediction cards yet</p>
                  <Button onClick={addParlayCard}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Card
                  </Button>
                </CardContent>
              </Card>
            ) : (
              parlayCards.map((card, index) => (
                <Card key={card.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Card {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParlayCard(card.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cryptocurrency Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cryptocurrency</label>
                      <Select
                        value={card.cryptocurrency}
                        onValueChange={(value) => updateParlayCard(card.id, 'cryptocurrency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptos.map((crypto: Cryptocurrency) => (
                            <SelectItem key={crypto.id} value={crypto.id}>
                              <div className="flex items-center gap-2">
                                <img src={crypto.image} alt={crypto.name} className="w-5 h-5" />
                                <span>{crypto.symbol.toUpperCase()}</span>
                                <span className="text-muted-foreground">${crypto.current_price.toFixed(2)}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Current Price Display */}
                    {card.cryptocurrency && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-lg font-semibold">${card.startPrice.toFixed(2)}</p>
                      </div>
                    )}

                    {/* Prediction Direction */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prediction</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={card.prediction === 'up' ? 'default' : 'outline'}
                          onClick={() => updateParlayCard(card.id, 'prediction', 'up')}
                          className={card.prediction === 'up' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Up
                        </Button>
                        <Button
                          variant={card.prediction === 'down' ? 'default' : 'outline'}
                          onClick={() => updateParlayCard(card.id, 'prediction', 'down')}
                          className={card.prediction === 'down' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          <TrendingDown className="w-4 h-4 mr-2" />
                          Down
                        </Button>
                      </div>
                    </div>

                    {/* Duration Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Duration</label>
                      <Select
                        value={card.duration}
                        onValueChange={(value) => updateParlayCard(card.id, 'duration', value as ParlayCard['duration'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 Hour (1.2x)</SelectItem>
                          <SelectItem value="6h">6 Hours (1.5x)</SelectItem>
                          <SelectItem value="24h">24 Hours (2.0x)</SelectItem>
                          <SelectItem value="7d">7 Days (3.0x)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Summary Card */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>TrendRide Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Stake Amount (NTIQ)</label>
                  <Input
                    type="number"
                    placeholder="Minimum 50 NTIQ"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="50"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cards:</span>
                    <span>{parlayCards.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Multiplier:</span>
                    <Badge variant="secondary">{totalMultiplier.toFixed(2)}x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stake:</span>
                    <span>{stakeAmount || 0} NTIQ</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Potential Win:</span>
                    <span className="text-green-600">{potentialWin.toFixed(0)} NTIQ</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  size="lg"
                  disabled={parlayCards.length < 2 || !stakeAmount || createParlayMutation.isPending}
                >
                  {createParlayMutation.isPending ? "Creating..." : "Create TrendRide"}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">How TrendRide Works</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Combine 2-5 cryptocurrency predictions</li>
                  <li>• Each coin has individual duration</li>
                  <li>• Multipliers compound for higher rewards</li>
                  <li>• All predictions must be correct to win</li>
                  <li>• Minimum stake: 50 NTIQ</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}