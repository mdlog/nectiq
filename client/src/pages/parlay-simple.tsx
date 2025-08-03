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
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

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

export default function ParlaySimple() {
  console.log("🚀 [PARLAY-SIMPLE] Component rendering...");
  
  const [parlayCards, setParlayCards] = useState<ParlayCard[]>([]);
  const [stakeAmount, setStakeAmount] = useState("");
  const [totalMultiplier, setTotalMultiplier] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch live crypto prices
  const { data: cryptos = [], isLoading: cryptosLoading } = useQuery({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 2000
  }) as { data: Cryptocurrency[], isLoading: boolean };

  console.log("📊 [PARLAY] Cryptos loaded:", cryptos.length);

  // Fetch user's active parlays (with safe error handling)
  const { data: userParlays = [], isLoading: parlaysLoading, error: parlaysError } = useQuery({
    queryKey: ["/api/parlay/user"],
    refetchInterval: 30000,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true
  });

  const safeParlays = Array.isArray(userParlays) ? userParlays : [];
  console.log("📊 [PARLAY] User parlays:", { count: safeParlays.length, loading: parlaysLoading, error: parlaysError });

  // Calculate duration multiplier
  const getDurationMultiplier = (duration: string) => {
    switch (duration) {
      case '1h': return 1.2;
      case '6h': return 1.5;
      case '24h': return 2.0;
      case '7d': return 3.0;
      default: return 1;
    }
  };

  // Update total multiplier when cards change
  useEffect(() => {
    const newMultiplier = parlayCards.reduce((acc, card) => {
      return acc * (1.5 * getDurationMultiplier(card.duration));
    }, 1);
    setTotalMultiplier(newMultiplier);
  }, [parlayCards]);

  // Calculate potential win
  const potentialWin = parseFloat(stakeAmount || "0") * totalMultiplier;

  // Add new parlay card
  const addParlayCard = () => {
    const newCard: ParlayCard = {
      id: Date.now().toString(),
      cryptocurrency: '',
      prediction: 'up',
      duration: '1h',
      startPrice: 0
    };
    setParlayCards([...parlayCards, newCard]);
    console.log("➕ [PARLAY] Added card:", newCard.id);
  };

  // Remove parlay card
  const removeParlayCard = (id: string) => {
    setParlayCards(parlayCards.filter(card => card.id !== id));
    console.log("🗑️ [PARLAY] Removed card:", id);
  };

  // Update parlay card
  const updateParlayCard = (id: string, field: keyof ParlayCard, value: any) => {
    setParlayCards(parlayCards.map(card => {
      if (card.id === id) {
        const updatedCard = { ...card, [field]: value };
        
        // If cryptocurrency changed, update start price
        if (field === 'cryptocurrency') {
          const crypto = cryptos.find(c => c.id === value);
          if (crypto) {
            updatedCard.startPrice = crypto.current_price;
          }
        }
        
        console.log("✏️ [PARLAY] Updated card:", id, field, value);
        return updatedCard;
      }
      return card;
    }));
  };

  // Create parlay mutation
  const createParlayMutation = useMutation({
    mutationFn: async (data: { stakeAmount: string; coins: any[] }) => {
      console.log("🟢 [PARLAY] Creating parlay:", data);
      return apiRequest("/api/parlay/create", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (result) => {
      console.log("✅ [PARLAY] Created successfully:", result);
      toast({
        title: "Parlay Created!",
        description: "Your prediction has been submitted successfully",
      });
      setParlayCards([]);
      setStakeAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/parlay/user"] });
    },
    onError: (error: any) => {
      console.error("❌ [PARLAY] Creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create parlay",
        variant: "destructive"
      });
    }
  });

  // Handle submit
  const handleSubmit = () => {
    if (parlayCards.length < 2) {
      toast({
        title: "Minimum 2 Predictions Required",
        description: "Add at least 2 cryptocurrency predictions",
        variant: "destructive"
      });
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) < 50) {
      toast({
        title: "Invalid Stake Amount",
        description: "Minimum stake amount is 50 NTIQ",
        variant: "destructive"
      });
      return;
    }

    const coins = parlayCards.map(card => ({
      cryptocurrency: card.cryptocurrency,
      prediction: card.prediction,
      duration: card.duration,
      startPrice: card.startPrice
    }));

    createParlayMutation.mutate({ stakeAmount, coins });
  };

  if (cryptosLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading cryptocurrency data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Parlay Predictions</h1>
          <p className="text-xl text-blue-200">Combine multiple predictions for exponential rewards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Parlay Cards Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Card Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={addParlayCard} 
                  className="w-full" 
                  variant="outline"
                  disabled={parlayCards.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Prediction Card ({parlayCards.length}/5)
                </Button>
              </CardContent>
            </Card>

            {/* Active Parlays Section - Safe rendering */}
            {!parlaysError && safeParlays.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Active Parlays ({safeParlays.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {safeParlays.slice(0, 3).map((parlay: any) => {
                    try {
                      // Calculate potential win using server data structure
                      const multiplier = parlay?.totalMultiplier || parlay?.multiplier || 0;
                      const calculatedPotentialWin = parlay?.stakeAmount && multiplier ? 
                        Math.round(parlay.stakeAmount * parseFloat(multiplier)) : 0;
                      
                      // Calculate expires at from targetTime 
                      const expiresAt = parlay?.targetTime || parlay?.expiresAt;
                      
                      return (
                        <div key={parlay?.id || Math.random()} className="bg-gray-800 p-4 rounded border-l-4 border-blue-500">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary">
                              {multiplier ? `${parseFloat(multiplier).toFixed(2)}x` : 'N/A'} Multiplier
                            </Badge>
                            <span className="text-sm text-gray-400">
                              {parlay?.createdAt ? new Date(parlay.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Stake:</span>
                              <span className="ml-2 font-semibold">{parlay?.stakeAmount || 0} NTIQ</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Potential Win:</span>
                              <span className="ml-2 font-semibold text-green-400">
                                {calculatedPotentialWin} NTIQ
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {parlay?.coins?.length || parlay?.totalCoinCount || 0} predictions • Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      );
                    } catch (err) {
                      console.error("Error rendering parlay:", err);
                      return null;
                    }
                  })}
                  {safeParlays.length > 3 && (
                    <p className="text-center text-gray-400 text-sm">
                      +{safeParlays.length - 3} more active parlays
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Parlay Cards */}
            {parlayCards.map((card) => (
              <Card key={card.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Prediction #{parlayCards.indexOf(card) + 1}</CardTitle>
                    <Button 
                      onClick={() => removeParlayCard(card.id)} 
                      variant="destructive" 
                      size="sm"
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
                        {cryptos.map((crypto) => (
                          <SelectItem key={crypto.id} value={crypto.id}>
                            <div className="flex items-center gap-2">
                              <img src={crypto.image} alt={crypto.name} className="w-5 h-5" />
                              <span>{crypto.name} (${crypto.current_price.toFixed(2)})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prediction Direction */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Prediction</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => updateParlayCard(card.id, 'prediction', 'up')}
                        variant={card.prediction === 'up' ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Price Up
                      </Button>
                      <Button
                        onClick={() => updateParlayCard(card.id, 'prediction', 'down')}
                        variant={card.prediction === 'down' ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                      >
                        <TrendingDown className="w-4 h-4" />
                        Price Down
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

                  {/* Show current price */}
                  {card.cryptocurrency && (
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-400">Current Price</div>
                      <div className="text-lg font-semibold">
                        ${cryptos.find(c => c.id === card.cryptocurrency)?.current_price.toFixed(2) || 'Loading...'}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {parlayCards.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-400">No prediction cards added yet. Click "Add Prediction Card" to start.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parlay Summary</CardTitle>
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
                    <span className="text-gray-400">Cards:</span>
                    <span>{parlayCards.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Multiplier:</span>
                    <Badge variant="secondary">{totalMultiplier.toFixed(2)}x</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stake:</span>
                    <span>{stakeAmount || 0} NTIQ</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-600 pt-2">
                    <span>Potential Win:</span>
                    <span className="text-green-400">{potentialWin.toFixed(0)} NTIQ</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  size="lg"
                  disabled={parlayCards.length < 2 || !stakeAmount || createParlayMutation.isPending}
                >
                  {createParlayMutation.isPending ? "Creating..." : "Create Parlay"}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">How Parlay Works</h3>
                <ul className="text-sm text-gray-400 space-y-1">
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
      </main>
      
      <Footer />
    </div>
  );
}