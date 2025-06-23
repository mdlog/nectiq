import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const predictionFormSchema = z.object({
  cryptocurrency: z.enum(["bitcoin", "ethereum", "binancecoin", "cardano", "solana"]),
  timeframe: z.enum(["1h", "6h", "24h", "7d"]),
  predictedPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid price",
  }),
  stakeAmount: z.number().min(1, "Minimum stake is 1 point"),
});

type PredictionFormData = z.infer<typeof predictionFormSchema>;

const cryptoOptions = [
  { value: "bitcoin", label: "Bitcoin (BTC)" },
  { value: "ethereum", label: "Ethereum (ETH)" },
  { value: "binancecoin", label: "Binance Coin (BNB)" },
  { value: "cardano", label: "Cardano (ADA)" },
  { value: "solana", label: "Solana (SOL)" },
];

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
}

export function PredictionForm({ preSelectedCrypto, onClose }: PredictionFormProps) {
  const [selectedStake, setSelectedStake] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-light">
      <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Gem className="text-primary mr-3" size={20} />
          Make New Prediction
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white h-8 w-8 p-0"
          >
            ×
          </Button>
        )}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="cryptocurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Select Cryptocurrency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-light border-surface-light">
                        <SelectValue placeholder="Choose a coin..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cryptoOptions.map((option) => (
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
