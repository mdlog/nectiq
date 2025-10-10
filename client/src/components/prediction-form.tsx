import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Gem, HelpCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Dynamic schema that will be created based on available cryptocurrencies
const createPredictionFormSchema = (availableCryptos: string[]) => z.object({
  cryptocurrency: z.string().refine((val) => availableCryptos.includes(val), {
    message: "Please select a valid cryptocurrency",
  }),
  timeframe: z.enum(["1h", "6h", "24h", "7d"]),
  predictedPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid price",
  }),
  stakeAmount: z.number().min(50, "Minimum stake is 50 NTIQ"),
});

type PredictionFormData = {
  cryptocurrency: string;
  timeframe: "1h" | "6h" | "24h" | "7d";
  predictedPrice: string;
  stakeAmount: number;
};

const timeframeOptions = [
  { value: "1h", label: "1 Hour" },
  { value: "6h", label: "6 Hours" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
];

const stakePresets = [50, 100, 250, 500];

interface PredictionFormProps {
  preSelectedCrypto?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function PredictionForm({ preSelectedCrypto, onClose, onSuccess }: PredictionFormProps) {
  const [selectedStake, setSelectedStake] = useState<number | null>(null);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [useInsurance, setUseInsurance] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 🔑 STATE: Store last valid data to prevent disappearing during refresh
  const [lastValidCryptos, setLastValidCryptos] = useState<any[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Fetch live Pyth Network prices for real-time updates
  const { data: livePrices, isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 1000, // Same as other pages - ultra-fast updates
    refetchIntervalInBackground: true, // Enable background updates
    staleTime: 500, // Same as other pages - very fresh data
    retry: 5, // Increased from 3 to 5 for better reliability
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    keepPreviousData: true, // 🔑 Keep data during refetch
    placeholderData: (previousData) => previousData, // 🔑 Show previous data while loading
    gcTime: 600000, // 10 minutes cache
    select: (data: any[]) => {
      const priceMap: Record<string, number> = {};
      data.forEach(crypto => {
        priceMap[crypto.id] = crypto.current_price;
      });
      return priceMap;
    },
    onError: (error) => {
      console.error("❌ [PREDICTION-FORM-ERROR] Price query failed:", error);
    },
  });

  // Fetch available cryptocurrencies from database
  const { data: availableCryptos = [], isLoading: cryptosLoading, isError } = useQuery({
    queryKey: ["/api/crypto/pyth-prices"],
    refetchInterval: 1000, // Same as other pages - ultra-fast updates
    refetchIntervalInBackground: true, // Enable background updates
    staleTime: 500, // Same as other pages - very fresh data
    retry: 5, // Increased from 3 to 5 for better reliability
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    keepPreviousData: true, // 🔑 Keep data during refetch to prevent disappearing
    placeholderData: (previousData) => previousData, // 🔑 Show previous data while loading
    gcTime: 600000, // 10 minutes cache
    select: (data: any[]) => data, // Return full crypto data with image, price, etc.
    onSuccess: (data) => {
      if (data && data.length > 0) {
        console.log("✅ [PREDICTION-FORM-SUCCESS] Received", data.length, "cryptocurrencies");
        setLastValidCryptos(data);
        setHasLoadedOnce(true);
      }
    },
    onError: (error) => {
      console.error("❌ [PREDICTION-FORM-ERROR] Crypto query failed:", error);
    },
  });

  // Update current prices when live prices change
  useEffect(() => {
    if (livePrices) {
      setCurrentPrices(livePrices);
    }
  }, [livePrices]);

  // 🔑 CRITICAL FIX: Update lastValidCryptos only if we receive non-empty data
  useEffect(() => {
    if (availableCryptos && Array.isArray(availableCryptos) && availableCryptos.length > 0) {
      console.log("✅ [PREDICTION-FORM-UPDATE] Updating last valid cryptos with", availableCryptos.length, "items");
      setLastValidCryptos(availableCryptos);
    } else {
      console.log("⚠️ [PREDICTION-FORM-SKIP] Skipping update - empty/invalid data, keeping previous data");
    }
  }, [availableCryptos]);

  // 🔑 USE LAST VALID DATA: Always use last valid data if current is empty
  const cryptosToUse = (availableCryptos && availableCryptos.length > 0) ? availableCryptos : lastValidCryptos;

  console.log("🔍 [PREDICTION-FORM-DEBUG] Crypto state:", {
    availableCryptosLength: availableCryptos?.length || 0,
    lastValidLength: lastValidCryptos.length,
    usingLength: cryptosToUse.length,
    hasLoadedOnce,
    isLoading: cryptosLoading,
    isError
  });

  // Create dynamic schema based on available cryptocurrencies
  const cryptoIds = cryptosToUse?.map(crypto => crypto.id) || [];
  const predictionFormSchema = createPredictionFormSchema(cryptoIds);

  const form = useForm<PredictionFormData>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      cryptocurrency: preSelectedCrypto as any || undefined,
      timeframe: "24h",
      predictedPrice: "",
      stakeAmount: 50,
    },
  });

  // Update form when preSelectedCrypto changes
  useEffect(() => {
    if (preSelectedCrypto) {
      form.setValue('cryptocurrency', preSelectedCrypto as any);
    }
  }, [preSelectedCrypto, form]);

  const createPredictionMutation = useMutation({
    mutationFn: async (data: PredictionFormData) => {
      const response = await apiRequest("/api/predictions", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          predictedPrice: parseFloat(data.predictedPrice),
          currentPrice: currentPrices[data.cryptocurrency] || 0, // Include live Pyth price
        }),
      });

      // Parse response if it's JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        // If insurance is enabled, purchase insurance after prediction is created
        if (useInsurance && result.prediction?.id) {
          try {
            await apiRequest("/api/insurance/purchase", {
              method: "POST",
              body: JSON.stringify({
                predictionId: result.prediction.id,
                stakeAmount: data.stakeAmount
              }),
            });
          } catch (insuranceError) {
            console.error('Failed to purchase insurance:', insuranceError);
            // Continue even if insurance fails - prediction is already created
          }
        }

        return result;
      }

      // For non-JSON responses, return success indicator
      return { success: true };
    },
    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.log('Prediction success response:', data);
      }

      toast({
        title: "Prediction submitted!",
        description: "Your prediction has been recorded successfully.",
      });
      form.reset();
      setSelectedStake(null);
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      console.error("Error creating prediction:", error);

      // Handle authentication error specifically
      if (error.message?.includes('401') || error.message?.includes('Authentication required')) {
        toast({
          title: "Authentication Required",
          description: "Please connect your wallet or login to make predictions.",
          variant: "destructive",
        });

        // Close the modal if authentication fails
        if (onSuccess) {
          onSuccess();
        }
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Failed to submit prediction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PredictionFormData) => {
    createPredictionMutation.mutate(data);
  };

  const handleStakePreset = (amount: number) => {
    setSelectedStake(amount);
    form.setValue("stakeAmount", amount);
  };

  // Show loading state ONLY on FIRST LOAD when no data exists and actively loading
  // Never show loading during subsequent fetches - this prevents form from disappearing
  if (cryptosLoading && cryptosToUse.length === 0 && !hasLoadedOnce) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Gem className="text-primary mr-3" size={20} />
          Make New Prediction
        </h2>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Don't render form if no cryptocurrencies are available AND we never had data before (first load failure)
  if (!cryptosLoading && cryptosToUse.length === 0 && !hasLoadedOnce) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Gem className="text-primary mr-3" size={20} />
          Make New Prediction
        </h2>
        <div className="text-center py-8">
          <Gem className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            {isError ? 'Error Loading Cryptocurrencies' : 'No Cryptocurrencies Available'}
          </h3>
          <p className="text-slate-400">
            {isError ? 'Retrying connection...' : 'Please add cryptocurrencies in the admin panel to start making predictions.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Remove the header since modal already has it */}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="cryptocurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 flex items-center">
                    Select Cryptocurrency
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="ml-2 h-4 w-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Choose from our list of supported cryptocurrencies.<br />Click to see real-time prices and make predictions.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-light border-surface-light">
                        <SelectValue placeholder="Choose a coin..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cryptosLoading && cryptosToUse.length === 0 ? (
                        <SelectItem value="loading" disabled>Loading cryptocurrencies...</SelectItem>
                      ) : cryptosToUse && cryptosToUse.length > 0 ? (
                        cryptosToUse.map((crypto) => (
                          <SelectItem key={crypto.id} value={crypto.id}>
                            <div className="flex items-center gap-2">
                              <img src={crypto.image} alt={crypto.name} className="w-4 h-4" />
                              <span>
                                {crypto.symbol?.toUpperCase()} (${crypto.current_price?.toFixed(2)})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No cryptocurrencies available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Timeframe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-light border-surface-light">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeframeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="predictedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 flex items-center justify-between">
                  Predicted Price (USD)
                  {form.watch('cryptocurrency') && currentPrices[form.watch('cryptocurrency')] && (
                    <div className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/30">
                      Live: ${currentPrices[form.watch('cryptocurrency')].toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter predicted price"
                      className="bg-surface-light border-surface-light pl-8"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stakeAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Stake Amount</FormLabel>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {stakePresets.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={selectedStake === amount ? "default" : "outline"}
                        className={`${selectedStake === amount
                          ? "gradient-bg"
                          : "bg-surface-light hover:bg-primary transition-colors border-surface-light"
                          }`}
                        onClick={() => handleStakePreset(amount)}
                      >
                        {amount} NTIQ
                      </Button>
                    ))}
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Custom amount (NTIQ)"
                      className="bg-surface-light border-surface-light"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        field.onChange(value);
                        setSelectedStake(null);
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Insurance Option */}
          <div className="bg-surface-light border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="insurance"
                checked={useInsurance}
                onCheckedChange={(checked) => setUseInsurance(checked as boolean)}
                className="mt-1 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
              />
              <div className="flex-1">
                <label
                  htmlFor="insurance"
                  className="text-sm font-medium text-slate-300 flex items-center cursor-pointer"
                >
                  <Shield className="h-4 w-4 text-primary mr-2" />
                  Protect this prediction with Insurance
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="ml-2 h-4 w-4 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          <strong>Prediction Insurance:</strong><br />
                          • Cost: 10% of your stake<br />
                          • Coverage: Get 50% back if you lose<br />
                          • Example: Stake 1,000 NTIQ → Pay 100 for insurance → Get 500 back if wrong
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                {form.watch('stakeAmount') > 0 && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Insurance Cost (10%):</span>
                      <span className="text-primary font-medium">
                        {Math.floor(form.watch('stakeAmount') * 0.10)} NTIQ
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Coverage (50%):</span>
                      <span className="text-green-400 font-medium">
                        {Math.floor(form.watch('stakeAmount') * 0.50)} NTIQ refund if loss
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 border-t border-surface-light pt-1">
                      <span>Total Cost:</span>
                      <span className="text-white font-medium">
                        {useInsurance
                          ? Math.floor(form.watch('stakeAmount') * 1.10)
                          : form.watch('stakeAmount')} NTIQ
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createPredictionMutation.isPending}
            className="w-full gradient-bg hover:opacity-90 text-white font-semibold py-3 px-6 transition-all transform hover:scale-105"
          >
            {createPredictionMutation.isPending ? "Submitting..." : "Submit Prediction"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
