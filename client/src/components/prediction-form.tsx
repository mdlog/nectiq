import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Gem, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  stakeAmount: z.number().min(1, "Minimum stake is 1 point"),
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available cryptocurrencies from database
  const { data: availableCryptos, isLoading: cryptosLoading } = useQuery({
    queryKey: ["/api/crypto/prices"],
    select: (data: any[]) => data.map(crypto => ({
      value: crypto.id,
      label: `${crypto.name} (${crypto.symbol})`
    }))
  });

  // Create dynamic schema based on available cryptocurrencies
  const cryptoIds = availableCryptos?.map(crypto => crypto.value) || [];
  const predictionFormSchema = createPredictionFormSchema(cryptoIds);

  const form = useForm<PredictionFormData>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      cryptocurrency: preSelectedCrypto as any || undefined,
      timeframe: "24h",
      predictedPrice: "",
      stakeAmount: 0,
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
      return await apiRequest("POST", "/api/predictions", {
        ...data,
        predictedPrice: data.predictedPrice,
      });
    },
    onSuccess: () => {
      toast({
        title: "Prediction submitted!",
        description: "Your prediction has been recorded successfully.",
      });
      form.reset();
      setSelectedStake(null);
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit prediction",
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

  // Show loading state while cryptocurrencies are being fetched
  if (cryptosLoading) {
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

  // Don't render form if no cryptocurrencies are available
  if (!availableCryptos || availableCryptos.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-surface-light">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Gem className="text-primary mr-3" size={20} />
          Make New Prediction
        </h2>
        <div className="text-center py-8">
          <Gem className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Cryptocurrencies Available</h3>
          <p className="text-slate-400">Please add cryptocurrencies in the admin panel to start making predictions.</p>
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
                          <p>Choose from our list of supported cryptocurrencies.<br/>Click to see real-time prices and make predictions.</p>
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
                      {cryptosLoading ? (
                        <SelectItem value="loading" disabled>Loading cryptocurrencies...</SelectItem>
                      ) : availableCryptos && availableCryptos.length > 0 ? (
                        availableCryptos.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                  <FormLabel className="text-slate-300">Prediction Time</FormLabel>
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
                <FormLabel className="text-slate-300">Predicted Price (USD)</FormLabel>
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
                        className={`${
                          selectedStake === amount
                            ? "gradient-bg"
                            : "bg-surface-light hover:bg-primary transition-colors border-surface-light"
                        }`}
                        onClick={() => handleStakePreset(amount)}
                      >
                        {amount} PTS
                      </Button>
                    ))}
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Custom amount"
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
