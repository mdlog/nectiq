import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface TrendRideCard {
  id: string;
  cryptocurrency: string;
  prediction: 'up' | 'down';
  duration: '1h' | '6h' | '24h' | '7d';
  startPrice: number;
}

export default function TrendRideSimple() {
  console.log("🚀 [TRENDRIDE-SIMPLE] Component rendering...");
  
  const [trendRideCards, setTrendRideCards] = useState<TrendRideCard[]>([]);
  const [stakeAmount, setStakeAmount] = useState("");
  const [totalMultiplier, setTotalMultiplier] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch live crypto prices
  const { data: cryptos = [], isLoading: cryptosLoading } = useQuery({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 2000
  }) as { data: Cryptocurrency[], isLoading: boolean };

  console.log("📊 [TRENDRIDE] Cryptos loaded:", cryptos.length);

  // Fetch user's active TrendRides (with safe error handling)
  const { data: userTrendRides = [], isLoading: trendRidesLoading, error: trendRidesError } = useQuery({
    queryKey: ["/api/parlay/user"],
    refetchInterval: 30000,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true
  });

  const safeTrendRides = Array.isArray(userTrendRides) ? userTrendRides : [];
  console.log("📊 [TRENDRIDE] User TrendRides:", { count: safeTrendRides.length, loading: trendRidesLoading, error: trendRidesError });

  // Calculate duration multiplier
  const getTimeframeMultiplier = (duration: string) => {
    switch (duration) {
      case '1h': return 1.2;
      case '6h': return 1.5;
      case '24h': return 2.0;
      case '7d': return 3.0;
      default: return 1;
    }
  };

  // Format countdown timer
  const formatCountdown = (targetTime: string | Date) => {
    const target = new Date(targetTime);
    const now = currentTime;
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      return "00:00:00"; // Expired
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Check if countdown has expired
  const isCountdownExpired = (targetTime: string | Date) => {
    const target = new Date(targetTime);
    const now = currentTime;
    return now.getTime() >= target.getTime();
  };

  // Update total multiplier when cards change
  useEffect(() => {
    const newMultiplier = trendRideCards.reduce((acc, card) => {
      return acc * (1.5 * getTimeframeMultiplier(card.duration));
    }, 1);
    setTotalMultiplier(newMultiplier);
  }, [trendRideCards]);

  // Calculate potential win
  const potentialWin = parseFloat(stakeAmount || "0") * totalMultiplier;

  // Add new TrendRide card
  const addTrendRideCard = () => {
    const newCard: TrendRideCard = {
      id: Date.now().toString(),
      cryptocurrency: '',
      prediction: 'up',
      duration: '1h',
      startPrice: 0
    };
    setTrendRideCards([...trendRideCards, newCard]);
    console.log("➕ [TRENDRIDE] Added card:", newCard.id);
  };

  // Remove TrendRide card
  const removeTrendRideCard = (id: string) => {
    setTrendRideCards(trendRideCards.filter(card => card.id !== id));
    console.log("🗑️ [TRENDRIDE] Removed card:", id);
  };

  // Check for duplicate cryptocurrency selection
  const isDuplicateCryptocurrency = (id: string, cryptocurrency: string) => {
    return trendRideCards.some(card => 
      card.id !== id && 
      card.cryptocurrency === cryptocurrency && 
      cryptocurrency !== ''
    );
  };

  // Get list of already selected cryptocurrencies (excluding current card)
  const getSelectedCryptocurrencies = (excludeCardId: string) => {
    return trendRideCards
      .filter(card => card.id !== excludeCardId && card.cryptocurrency !== '')
      .map(card => card.cryptocurrency);
  };

  // Update TrendRide card
  const updateTrendRideCard = (id: string, field: keyof TrendRideCard, value: any) => {
    // Validate cryptocurrency selection for duplicates
    if (field === 'cryptocurrency' && value !== '') {
      if (isDuplicateCryptocurrency(id, value)) {
        toast({
          title: "Cryptocurrency Already Selected",
          description: "Each coin can only be selected once per TrendRide. Please choose a different cryptocurrency.",
          variant: "destructive"
        });
        return; // Don't update if duplicate
      }
    }

    setTrendRideCards(trendRideCards.map(card => {
      if (card.id === id) {
        const updatedCard = { ...card, [field]: value };
        
        // If cryptocurrency changed, update start price
        if (field === 'cryptocurrency') {
          const crypto = cryptos.find(c => c.id === value);
          if (crypto) {
            updatedCard.startPrice = crypto.current_price;
          }
        }
        
        console.log("✏️ [TRENDRIDE] Updated card:", id, field, value);
        return updatedCard;
      }
      return card;
    }));
  };

  // Create TrendRide mutation
  const createTrendRideMutation = useMutation({
    mutationFn: async (data: { stakeAmount: string; coins: any[] }) => {
      console.log("🟢 [TRENDRIDE] Creating TrendRide:", data);
      return apiRequest("/api/parlay/create", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (result) => {
      console.log("✅ [TRENDRIDE] Created successfully:", result);
      toast({
        title: "TrendRide Created!",
        description: "Your prediction has been submitted successfully",
      });
      setTrendRideCards([]);
      setStakeAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/parlay/user"] });
    },
    onError: (error: any) => {
      console.error("❌ [TRENDRIDE] Creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create TrendRide",
        variant: "destructive"
      });
    }
  });

  // Handle submit
  const handleSubmit = () => {
    if (trendRideCards.length < 2) {
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

    // Check for incomplete cards
    const incompleteCards = trendRideCards.filter(card => !card.cryptocurrency);
    if (incompleteCards.length > 0) {
      toast({
        title: "Incomplete Predictions",
        description: "Please select cryptocurrency for all prediction cards",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate cryptocurrencies
    const selectedCryptos = trendRideCards.map(card => card.cryptocurrency);
    const uniqueCryptos = new Set(selectedCryptos);
    if (selectedCryptos.length !== uniqueCryptos.size) {
      toast({
        title: "Duplicate Cryptocurrencies",
        description: "Each cryptocurrency can only be selected once per TrendRide",
        variant: "destructive"
      });
      return;
    }

    const coins = trendRideCards.map(card => ({
      cryptocurrency: card.cryptocurrency,
      prediction: card.prediction,
      duration: card.duration,
      startPrice: card.startPrice
    }));

    createTrendRideMutation.mutate({ stakeAmount, coins });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">TrendRide Predictions</h1>
          <p className="text-xl text-blue-200">Combine multiple predictions for exponential rewards</p>
        </div>

        {/* First Row: Create TrendRide and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* TrendRide Input Section - Single Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Single TrendRide Input Card */}
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="text-xl">Create TrendRide Prediction</CardTitle>
                <CardDescription>Add multiple predictions in one simple form</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Prediction Button */}
                <div className="flex justify-between items-center">
                  <Button 
                    onClick={addTrendRideCard} 
                    variant="outline"
                    disabled={trendRideCards.length >= 5}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prediction ({trendRideCards.length}/5)
                  </Button>
                  {trendRideCards.length > 0 && (
                    <p className="text-sm text-gray-400">{trendRideCards.length} prediction(s) added</p>
                  )}
                </div>

                {/* Predictions List - Compact Display */}
                {trendRideCards.length > 0 && (
                  <div className="space-y-3">
                    {trendRideCards.map((card, index) => (
                      <div key={card.id} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Prediction #{index + 1}</h4>
                          <Button 
                            onClick={() => removeTrendRideCard(card.id)} 
                            variant="destructive" 
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Cryptocurrency Selection */}
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">Cryptocurrency</label>
                            <Select
                              value={card.cryptocurrency}
                              onValueChange={(value) => updateTrendRideCard(card.id, 'cryptocurrency', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select crypto" />
                              </SelectTrigger>
                              <SelectContent>
                                {cryptos.map((crypto) => {
                                  const isAlreadySelected = getSelectedCryptocurrencies(card.id).includes(crypto.id);
                                  return (
                                    <SelectItem 
                                      key={crypto.id} 
                                      value={crypto.id}
                                      disabled={isAlreadySelected}
                                    >
                                      <div className="flex items-center gap-2">
                                        <img src={crypto.image} alt={crypto.name} className="w-4 h-4" />
                                        <span className={isAlreadySelected ? "text-gray-500" : ""}>
                                          {crypto.symbol?.toUpperCase()} (${crypto.current_price.toFixed(2)})
                                          {isAlreadySelected && " - Selected"}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Prediction Direction - Compact */}
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">Direction</label>
                            <div className="grid grid-cols-2 gap-1">
                              <Button
                                onClick={() => updateTrendRideCard(card.id, 'prediction', 'up')}
                                variant={card.prediction === 'up' ? 'default' : 'outline'}
                                size="sm"
                                className={`h-9 ${card.prediction === 'up' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'}`}
                              >
                                <TrendingUp className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => updateTrendRideCard(card.id, 'prediction', 'down')}
                                variant={card.prediction === 'down' ? 'default' : 'outline'}
                                size="sm"
                                className={`h-9 ${card.prediction === 'down' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'}`}
                              >
                                <TrendingDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Timeframe Selection */}
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">Timeframe</label>
                            <Select
                              value={card.duration}
                              onValueChange={(value) => updateTrendRideCard(card.id, 'duration', value as TrendRideCard['duration'])}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">1h (1.2x)</SelectItem>
                                <SelectItem value="6h">6h (1.5x)</SelectItem>
                                <SelectItem value="24h">24h (2.0x)</SelectItem>
                                <SelectItem value="7d">7d (3.0x)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Current Price Display - Compact */}
                        {card.cryptocurrency && (
                          <div className="text-center bg-gray-700/50 rounded p-2">
                            <span className="text-xs text-gray-400">Current: </span>
                            <span className="font-medium">
                              ${cryptos.find(c => c.id === card.cryptocurrency)?.current_price.toFixed(2) || 'Loading...'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Help Text */}
                {trendRideCards.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Click "Add Prediction" to start building your TrendRide</p>
                    <p className="text-sm text-gray-500 mt-1">Minimum 2 predictions required</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Summary Section - Right Column */}
          <div className="space-y-6">
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
                    <span className="text-gray-400">Cards:</span>
                    <span>{trendRideCards.length}</span>
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
                  disabled={trendRideCards.length < 2 || !stakeAmount || createTrendRideMutation.isPending}
                >
                  {createTrendRideMutation.isPending ? "Creating..." : "Create TrendRide"}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">How TrendRide Works</h3>
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

        {/* Second Row: Full Width TrendRide History */}
        <div className="w-full">
          {/* TrendRide History Section - Tab-based Active vs Completed */}
          {!trendRidesError && safeTrendRides.length > 0 && (() => {
              // Helper function to determine TrendRide status using DATABASE isCorrect
              const getTrendRideStatus = (parlay: any) => {
                const coinPredictions = parlay?.coins || [];
                if (coinPredictions.length === 0) return 'pending';
                
                let hasActivePredictions = false;
                let hasLosePredictions = false;
                let allWin = true;
                
                for (const coin of coinPredictions) {
                  if (!coin.startPrice) continue;
                  
                  // Check if duration has passed
                  const now = new Date();
                  const targetTime = new Date(coin.targetTime);
                  const durationPassed = now >= targetTime;
                  
                  if (!durationPassed) {
                    // Still active - prediction hasn't expired yet
                    hasActivePredictions = true;
                    allWin = false;
                  } else {
                    // Duration has passed - check database result
                    // CRITICAL: Use database isCorrect field set by ParlayProcessorService
                    if (coin.isCorrect !== null && coin.isCorrect !== undefined) {
                      // Database has processed result - most reliable
                      if (!coin.isCorrect) {
                        hasLosePredictions = true;
                        break; // If any loses, entire TrendRide loses
                      }
                    } else {
                      // Not yet processed by ParlayProcessorService - calculate manually as fallback
                      const startPrice = parseFloat(coin.startPrice);
                      const isUp = coin.prediction === 'up';
                      
                      let finalPrice;
                      if (coin.endPrice) {
                        finalPrice = parseFloat(coin.endPrice);
                      } else {
                        const currentCrypto = cryptos.find(c => c.id === coin.cryptocurrency);
                        finalPrice = currentCrypto?.current_price || 0;
                      }
                      
                      if (!finalPrice) continue;
                      
                      const priceChanged = finalPrice > startPrice;
                      const isCorrect = (isUp === priceChanged);
                      
                      if (!isCorrect) {
                        hasLosePredictions = true;
                        break; // If any loses, entire TrendRide loses
                      }
                    }
                  }
                }
                
                // Return overall status
                if (hasLosePredictions) return 'lose'; // Critical: ANY lose = entire TrendRide loses
                if (hasActivePredictions) return 'active'; // Still has active predictions
                if (allWin && !hasActivePredictions) return 'win'; // All won and none active
                return 'pending';
              };
              
              // Separate TrendRides into active and completed based on overall status
              const activeTrendRides = safeTrendRides.filter((parlay: any) => {
                const status = getTrendRideStatus(parlay);
                return status === 'active' || status === 'pending'; // Only truly active TrendRides
              });
              
              const completedTrendRides = safeTrendRides.filter((parlay: any) => {
                const status = getTrendRideStatus(parlay);
                return status === 'win' || status === 'lose'; // Completed TrendRides (won or lost)
              });
              
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>Your TrendRide History</CardTitle>
                    <p className="text-sm text-gray-400">Manage and track your TrendRide predictions</p>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="active" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="active" className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          Active ({activeTrendRides.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                          History ({completedTrendRides.length})
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Active TrendRides Tab */}
                      <TabsContent value="active" className="mt-4">
                        {activeTrendRides.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeTrendRides.slice(0, 5).map((parlay: any) => {
                      // Calculate potential win using server data structure
                      const multiplier = parlay?.totalMultiplier || parlay?.multiplier || 0;
                      const calculatedPotentialWin = parlay?.stakeAmount && multiplier ? 
                        Math.round(parlay.stakeAmount * parseFloat(multiplier)) : 0;
                      
                      // Calculate expires at from targetTime 
                      const expiresAt = parlay?.targetTime || parlay?.expiresAt;
                      
                      // Get coin prediction details
                      const coinPredictions = parlay?.coins || [];
                      
                      // Helper function to determine win/lose status for individual coin
                      const getPredictionStatus = (coin: any, currentPrice: number) => {
                        if (!coin.startPrice || !currentPrice) return 'pending';
                        
                        const startPrice = parseFloat(coin.startPrice);
                        const isUp = coin.prediction === 'up';
                        const priceChanged = currentPrice > startPrice;
                        
                        // Check if duration has passed
                        const now = new Date();
                        const targetTime = new Date(coin.targetTime);
                        const durationPassed = now >= targetTime;
                        
                        if (!durationPassed) return 'active';
                        
                        return (isUp === priceChanged) ? 'win' : 'lose';
                      };
                      
                      // Calculate overall parlay status: IF ANY SINGLE PREDICTION LOSES, ENTIRE PARLAY LOSES
                      const getOverallParlayStatus = () => {
                        if (coinPredictions.length === 0) return 'pending';
                        
                        let hasActivePredictions = false;
                        let hasLosePredictions = false;
                        let allWin = true;
                        
                        for (const coin of coinPredictions) {
                          const currentCrypto = cryptos.find(c => c.id === coin.cryptocurrency);
                          const currentPrice = currentCrypto?.current_price || 0;
                          const status = getPredictionStatus(coin, currentPrice);
                          
                          if (status === 'lose') {
                            hasLosePredictions = true;
                            break; // If any loses, entire parlay loses
                          } else if (status === 'active' || status === 'pending') {
                            hasActivePredictions = true;
                            allWin = false;
                          } else if (status !== 'win') {
                            allWin = false;
                          }
                        }
                        
                        // Return overall status
                        if (hasLosePredictions) return 'lose'; // Critical: ANY lose = entire parlay loses
                        if (hasActivePredictions) return 'active';
                        if (allWin) return 'win';
                        return 'pending';
                      };
                      
                      const overallStatus = getOverallParlayStatus();
                      
                      // Get border color based on overall status
                      const getBorderColor = (status: string) => {
                        switch (status) {
                          case 'win': return 'border-green-500';
                          case 'lose': return 'border-red-500';
                          case 'active': return 'border-blue-500';
                          default: return 'border-gray-500';
                        }
                      };
                      
                      return (
                        <div key={parlay?.id || Math.random()} className={`bg-gray-800 p-4 rounded border-l-4 ${getBorderColor(overallStatus)}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2">
                              <Badge variant="secondary">
                                {multiplier ? `${parseFloat(multiplier).toFixed(2)}x` : 'N/A'} Multiplier
                              </Badge>
                              <Badge 
                                variant={overallStatus === 'win' ? 'default' : overallStatus === 'lose' ? 'destructive' : 'secondary'}
                                className="font-semibold"
                              >
                                {overallStatus === 'win' ? '🏆 TRENDRIDE WIN' : 
                                 overallStatus === 'lose' ? '💔 TRENDRIDE LOST' : 
                                 overallStatus === 'active' ? '⏳ ACTIVE' : '⌛ PENDING'}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-400">
                              {parlay?.createdAt ? new Date(parlay.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          
                          {/* Stakes and Potential Win */}
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
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
                          
                          {/* Coin Predictions Details */}
                          {coinPredictions.length > 0 && (
                            <div className="space-y-2 mb-3">
                              <h4 className="text-xs font-semibold text-gray-300">Predictions ({coinPredictions.length}):</h4>
                              {coinPredictions.map((coin: any, index: number) => {
                                // Find current price for this cryptocurrency
                                const currentCrypto = cryptos.find(c => c.id === coin.cryptocurrency);
                                const liveCurrentPrice = parseFloat((currentCrypto?.current_price || 0).toFixed(2));
                                const startPrice = parseFloat(coin.startPrice || '0');
                                
                                // Check if duration has passed to determine which price to use
                                const now = new Date();
                                const targetTime = new Date(coin.targetTime);
                                const durationPassed = now >= targetTime;
                                
                                // CRITICAL: Always use endPrice if available (snapshot is permanent), otherwise use live price
                                const displayPrice = coin.endPrice ? 
                                  parseFloat(coin.endPrice) : liveCurrentPrice;
                                
                                // Debug logging for price formatting
                                console.log(`🎯 [PARLAY-PRICE-DEBUG] ${coin.cryptocurrency} - Raw: ${currentCrypto?.current_price}, Live: ${liveCurrentPrice}, Display: ${displayPrice}, Formatted: ${displayPrice.toFixed(2)}`);
                                
                                const status = getPredictionStatus(coin, liveCurrentPrice);
                                
                                // Price change calculation using appropriate price
                                const priceChange = startPrice ? ((displayPrice - startPrice) / startPrice * 100) : 0;
                                const isPositiveChange = priceChange > 0;
                                
                                return (
                                  <div key={index} className="bg-gray-700 p-2 rounded text-xs">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-semibold text-blue-300 capitalize">
                                        {coin.cryptocurrency} 
                                        <span className={`ml-1 px-1 rounded ${coin.prediction === 'up' ? 'bg-green-600' : 'bg-red-600'}`}>
                                          {coin.prediction === 'up' ? '↑' : '↓'}
                                        </span>
                                      </span>
                                      <span className={`text-xs font-mono ${isCountdownExpired(coin.targetTime) ? 'text-red-400' : 'text-green-400'}`}>
                                        {isCountdownExpired(coin.targetTime) ? 'EXPIRED' : formatCountdown(coin.targetTime)}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-400">Start:</span>
                                        <span className="ml-1 font-mono">${startPrice.toFixed(2)}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">
                                          {coin.endPrice ? 'Final:' : 'Current:'}
                                        </span>
                                        <span className="ml-1 font-mono">${displayPrice.toFixed(2)}</span>
                                        {coin.endPrice && (
                                          <span className="ml-1 text-xs text-orange-400">📸</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-1">
                                      <span className={`text-xs ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                                        {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)}%
                                      </span>
                                      <Badge 
                                        variant={status === 'win' ? 'default' : status === 'lose' ? 'destructive' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {status === 'win' ? '✓ WIN' : status === 'lose' ? '✗ LOSE' : status === 'active' ? '⏳ ACTIVE' : '⌛ PENDING'}
                                      </Badge>
                                    </div>
                                    
                                    <div className="text-xs mt-1 flex justify-between items-center">
                                      <span className="text-gray-500">Time:</span>
                                      <span className={`font-mono font-bold ${isCountdownExpired(coin.targetTime) ? 'text-red-400' : 'text-green-400'}`}>
                                        {isCountdownExpired(coin.targetTime) ? 'EXPIRED' : formatCountdown(coin.targetTime)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="text-xs border-t border-gray-600 pt-2 flex justify-between items-center">
                            <span className="text-gray-500">Total TrendRide:</span>
                            <span className={`font-mono font-bold ${isCountdownExpired(expiresAt) ? 'text-red-400' : 'text-green-400'}`}>
                              {expiresAt ? (isCountdownExpired(expiresAt) ? 'EXPIRED' : formatCountdown(expiresAt)) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      );

                            })}
                            {activeTrendRides.length > 5 && (
                              <p className="text-center text-gray-400 text-sm">
                                +{activeTrendRides.length - 5} more active TrendRides
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-400">No active TrendRides at the moment</p>
                            <p className="text-sm text-gray-500 mt-2">Create a new TrendRide prediction to get started</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      {/* Completed TrendRides Tab */}
                      <TabsContent value="completed" className="mt-4">
                        {completedTrendRides.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {completedTrendRides.slice(0, 5).map((parlay: any) => {
                            // Calculate potential win using server data structure
                            const multiplier = parlay?.totalMultiplier || parlay?.multiplier || 0;
                            const calculatedPotentialWin = parlay?.stakeAmount && multiplier ? 
                              Math.round(parlay.stakeAmount * parseFloat(multiplier)) : 0;
                            
                            // Calculate expires at from targetTime 
                            const expiresAt = parlay?.targetTime || parlay?.expiresAt;
                            
                            // Get coin prediction details
                            const coinPredictions = parlay?.coins || [];
                            
                            // DEBUG: Log TrendRide data in History tab for troubleshooting
                            if (coinPredictions.length > 0) {
                              console.log(`🔍 [HISTORY-DEBUG] TrendRide ${parlay.id} coins data:`, coinPredictions.map((coin: any) => ({
                                crypto: coin.cryptocurrency,
                                startPrice: coin.startPrice,
                                endPrice: coin.endPrice,
                                isCorrect: coin.isCorrect,
                                hasEndPrice: !!coin.endPrice
                              })));
                            }
                            
                            // Helper function to determine win/lose status for individual coin
                            const getPredictionStatus = (coin: any, currentPrice: number) => {
                              if (!coin.startPrice || !currentPrice) return 'pending';
                              
                              const startPrice = parseFloat(coin.startPrice);
                              const isUp = coin.prediction === 'up';
                              const priceChanged = currentPrice > startPrice;
                              
                              // Check if duration has passed
                              const now = new Date();
                              const targetTime = new Date(coin.targetTime);
                              const durationPassed = now >= targetTime;
                              
                              if (!durationPassed) return 'active';
                              
                              return (isUp === priceChanged) ? 'win' : 'lose';
                            };
                            
                            // Calculate overall TrendRide status: IF ANY SINGLE PREDICTION LOSES, ENTIRE TRENDRIDE LOSES
                            const getOverallTrendRideStatus = () => {
                              if (coinPredictions.length === 0) return 'pending';
                              
                              let hasActivePredictions = false;
                              let hasLosePredictions = false;
                              let allWin = true;
                              
                              for (const coin of coinPredictions) {
                                let status;
                                
                                // CRITICAL: For completed parlays, ALWAYS use database isCorrect field if available
                                if (coin.isCorrect !== null && coin.isCorrect !== undefined) {
                                  // Use permanent database result (most reliable)
                                  status = coin.isCorrect ? 'win' : 'lose';
                                } else {
                                  // Fallback: calculate from current/end price
                                  const finalPrice = coin.endPrice ? 
                                    parseFloat(coin.endPrice) : 
                                    (cryptos.find(c => c.id === coin.cryptocurrency)?.current_price || 0);
                                  status = getPredictionStatus(coin, finalPrice);
                                }
                                
                                if (status === 'lose') {
                                  hasLosePredictions = true;
                                  break; // If any loses, entire parlay loses
                                } else if (status === 'active' || status === 'pending') {
                                  hasActivePredictions = true;
                                  allWin = false;
                                } else if (status !== 'win') {
                                  allWin = false;
                                }
                              }
                              
                              // Return overall status
                              if (hasLosePredictions) return 'lose'; // Critical: ANY lose = entire TrendRide loses
                              if (hasActivePredictions) return 'active';
                              if (allWin) return 'win';
                              return 'pending';
                            };
                            
                            const overallStatus = getOverallTrendRideStatus();
                            
                            // Get border color based on overall status
                            const getBorderColor = (status: string) => {
                              switch (status) {
                                case 'win': return 'border-green-500';
                                case 'lose': return 'border-red-500';
                                case 'active': return 'border-blue-500';
                                default: return 'border-gray-500';
                              }
                            };
                            
                            return (
                              <div key={`completed-${parlay?.id || Math.random()}`} className={`bg-gray-800 p-4 rounded border-l-4 ${getBorderColor(overallStatus)} opacity-80`}>
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex gap-2">
                                    <Badge variant="secondary">
                                      {multiplier ? `${parseFloat(multiplier).toFixed(2)}x` : 'N/A'} Multiplier
                                    </Badge>
                                    <Badge 
                                      variant={overallStatus === 'win' ? 'default' : overallStatus === 'lose' ? 'destructive' : 'secondary'}
                                      className="font-semibold"
                                    >
                                      {overallStatus === 'win' ? '🏆 WON' : 
                                       overallStatus === 'lose' ? '💔 LOST' : 
                                       '✅ COMPLETED'}
                                    </Badge>
                                  </div>
                                  <span className="text-sm text-gray-400">
                                    {parlay?.createdAt ? new Date(parlay.createdAt).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>
                                
                                {/* Stakes and Final Result */}
                                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                  <div>
                                    <span className="text-gray-400">Stake:</span>
                                    <span className="ml-2 font-semibold">{parlay?.stakeAmount || 0} NTIQ</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">
                                      {overallStatus === 'win' ? 'Won:' : 'Lost:'}
                                    </span>
                                    <span className={`ml-2 font-semibold ${overallStatus === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                                      {overallStatus === 'win' ? calculatedPotentialWin : parlay?.stakeAmount || 0} NTIQ
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Coin Predictions Details */}
                                {coinPredictions.length > 0 && (
                                  <div className="space-y-2 mb-3">
                                    <h4 className="text-xs font-semibold text-gray-300">Final Results ({coinPredictions.length}):</h4>
                                    {coinPredictions.map((coin: any, index: number) => {
                                      const startPrice = parseFloat(coin.startPrice || '0');
                                      
                                      // CRITICAL: For completed parlays, ALWAYS use endPrice if available (permanent snapshot)
                                      // Never use live prices for historical data!
                                      let finalPrice;
                                      let isHistoricalSnapshot = false;
                                      
                                      if (coin.endPrice) {
                                        // Use permanent snapshot price from ParlayProcessorService
                                        finalPrice = parseFloat(coin.endPrice);
                                        isHistoricalSnapshot = true;
                                      } else {
                                        // Fallback to current live price if endPrice not yet set
                                        const currentCrypto = cryptos.find(c => c.id === coin.cryptocurrency);
                                        finalPrice = currentCrypto?.current_price || 0;
                                      }
                                      
                                      // Calculate status using FINAL PRICE (not live price) for accuracy
                                      const isUp = coin.prediction === 'up';
                                      const priceChanged = finalPrice > startPrice;
                                      let status;
                                      
                                      // Use database isCorrect if available (most reliable)
                                      if (coin.isCorrect !== null && coin.isCorrect !== undefined) {
                                        status = coin.isCorrect ? 'win' : 'lose';
                                      } else {
                                        // Fallback calculation
                                        status = (isUp === priceChanged) ? 'win' : 'lose';
                                      }
                                      
                                      // Price change calculation using FINAL PRICE (not live price)
                                      const priceChange = startPrice ? ((finalPrice - startPrice) / startPrice * 100) : 0;
                                      const isPositiveChange = priceChange > 0;
                                      
                                      return (
                                        <div key={index} className="bg-gray-700 p-2 rounded text-xs border border-gray-600">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-blue-300 capitalize">
                                              {coin.cryptocurrency} 
                                              <span className={`ml-1 px-1 rounded ${coin.prediction === 'up' ? 'bg-green-600' : 'bg-red-600'}`}>
                                                {coin.prediction === 'up' ? '↑' : '↓'}
                                              </span>
                                            </span>
                                            <span className={`text-xs font-mono ${isHistoricalSnapshot ? 'text-orange-400' : 'text-red-400'}`}>
                                              {isHistoricalSnapshot ? 'SNAPSHOT' : 'FINISHED'}
                                            </span>
                                          </div>
                                          
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                              <span className="text-gray-400">Start:</span>
                                              <span className="ml-1 font-mono">${startPrice.toFixed(2)}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-400">Final:</span>
                                              <span className="ml-1 font-mono">${finalPrice.toFixed(2)}</span>
                                              {isHistoricalSnapshot && (
                                                <span className="ml-1 text-xs text-orange-400" title="Price locked by system">🔒</span>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div className="flex justify-between items-center mt-1">
                                            <span className={`text-xs ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                                              {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)}%
                                            </span>
                                            <Badge 
                                              variant={status === 'win' ? 'default' : status === 'lose' ? 'destructive' : 'secondary'}
                                              className="text-xs"
                                            >
                                              {status === 'win' ? '✓ WIN' : status === 'lose' ? '✗ LOSE' : 'FINISHED'}
                                            </Badge>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                
                                <div className="text-xs border-t border-gray-600 pt-2 flex justify-between items-center">
                                  <span className="text-gray-500">Status:</span>
                                  <span className="font-mono font-bold text-red-400">
                                    COMPLETED
                                  </span>
                                </div>
                              </div>
                            );

                            })}
                            {completedTrendRides.length > 5 && (
                              <p className="text-center text-gray-400 text-sm">
                                +{completedTrendRides.length - 5} more completed TrendRides
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-400">No completed TrendRides yet</p>
                            <p className="text-sm text-gray-500 mt-2">Your completed TrendRide history will appear here</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              );
            })()}
        </div>


      </main>
      
      <Footer />
    </div>
  );
}