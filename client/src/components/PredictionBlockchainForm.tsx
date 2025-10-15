import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Loader2, Shield, CheckCircle2, AlertCircle, Coins, HelpCircle } from 'lucide-react';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { apiRequest } from "@/lib/queryClient";

// Schema for prediction form
const predictionFormSchema = z.object({
    cryptocurrency: z.string().min(1, "Please select a cryptocurrency"),
    timeframe: z.enum(["1h", "6h", "24h", "7d"]),
    predictedPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Please enter a valid price",
    }),
    stakeAmount: z.number().min(50, "Minimum stake is 50 NTIQ"),
});

type PredictionFormData = z.infer<typeof predictionFormSchema>;

interface PredictionBlockchainFormProps {
    preSelectedCrypto?: string;
    onClose?: () => void;
    onSuccess?: () => void;
    availableCryptos?: any[];
    currentPrices?: Record<string, number>;
    selectedStake?: number | null;
    setSelectedStake?: (amount: number | null) => void;
    useInsurance?: boolean;
    setUseInsurance?: (use: boolean) => void;
}

export function PredictionBlockchainForm({
    preSelectedCrypto,
    onClose,
    onSuccess,
    availableCryptos = [],
    currentPrices = {},
    selectedStake,
    setSelectedStake,
    useInsurance = false,
    setUseInsurance
}: PredictionBlockchainFormProps) {
    const { address, chain } = useAccount();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PredictionFormData>({
        resolver: zodResolver(predictionFormSchema),
        defaultValues: {
            cryptocurrency: preSelectedCrypto || "",
            timeframe: "1h",
            predictedPrice: "",
            stakeAmount: 100,
        },
    });

    // Wagmi hooks for blockchain interaction
    const { writeContract: writePredictionContract, data: predictionTxHash, isPending: isPredictionPending } = useWriteContract();
    const { writeContract: writeApproveContract, data: approveTxHash, isPending: isApprovePending } = useWriteContract();

    const { isLoading: isPredictionConfirming, isSuccess: isPredictionSuccess, isError: isPredictionError } = useWaitForTransactionReceipt({
        hash: predictionTxHash,
        query: { enabled: !!predictionTxHash },
    });

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess, isError: isApproveError } = useWaitForTransactionReceipt({
        hash: approveTxHash,
        query: { enabled: !!approveTxHash },
    });

    // Read NTIQ balance
    const { data: ntiqBalanceWei, refetch: refetchNtiqBalance } = useReadContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20,
        functionName: 'balanceOf',
        args: [address!],
        chainId: chain?.id,
        query: { enabled: !!address && !!chain?.id && !!(CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20) },
    });
    const ntiqBalance = ntiqBalanceWei ? parseFloat(formatEther(ntiqBalanceWei)) : 0;

    // Read allowance for prediction staking contract
    const { data: allowanceWei, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20,
        functionName: 'allowance',
        args: [address!, CONTRACTS.ENHANCED_PREDICTION_STAKING],
        chainId: chain?.id,
        query: { enabled: !!address && !!chain?.id && !!(CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20) },
    });
    const allowance = allowanceWei ? parseFloat(formatEther(allowanceWei)) : 0;

    const needsApproval = allowance < form.watch('stakeAmount');

    const handleApprove = async (stakeAmount: number) => {
        if (!address || !chain) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to make predictions.",
                variant: "destructive",
            });
            return;
        }

        try {
            const stakeAmountWei = parseEther(stakeAmount.toString());

            await writeApproveContract({
                address: CONTRACTS.NTIQ_TOKEN,
                abi: CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20,
                functionName: 'approve',
                args: [CONTRACTS.ENHANCED_PREDICTION_STAKING, stakeAmountWei],
                chainId: chain.id,
                gas: 100000n, // Optimize gas limit for approve
            });
        } catch (error: any) {
            toast({
                title: "Approval Failed",
                description: error.shortMessage || error.message,
                variant: "destructive",
            });
        }
    };

    const handlePredictionSubmit = async (data: PredictionFormData) => {
        if (!address || !chain) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to make predictions.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const stakeAmountWei = parseEther(data.stakeAmount.toString());
            const predictedPriceWei = parseEther(data.predictedPrice);

            // Generate prediction ID (simple hash for now)
            const predictionId = `0x${Date.now().toString(16).padStart(64, '0')}`;

            // Calculate duration in seconds
            const durationMap = { '1h': 3600, '6h': 21600, '24h': 86400, '7d': 604800 };
            const duration = durationMap[data.timeframe];

            await writePredictionContract({
                address: CONTRACTS.ENHANCED_PREDICTION_STAKING,
                abi: CONTRACTS.ABIS?.ENHANCED_PREDICTION_STAKING || ABIS?.ENHANCED_PREDICTION_STAKING,
                functionName: 'lockStake',
                args: [predictionId, stakeAmountWei, duration, predictedPriceWei],
                chainId: chain.id,
                gas: 250000n, // Optimize gas limit for prediction staking
            });
        } catch (error: any) {
            toast({
                title: "Prediction Failed",
                description: error.shortMessage || error.message,
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    // Handle successful prediction transaction
    React.useEffect(() => {
        if (isPredictionSuccess && predictionTxHash) {
            // Create prediction in database
            const createPredictionInDB = async () => {
                try {
                    const formData = form.getValues();

                    const response = await apiRequest("/api/predictions/blockchain", {
                        method: "POST",
                        body: JSON.stringify({
                            ...formData,
                            predictedPrice: parseFloat(formData.predictedPrice),
                            blockchainTxHash: predictionTxHash,
                            blockchainStatus: 'confirmed',
                        }),
                    });

                    if (response.ok) {
                        const responseData = await response.json();
                        console.log('✅ [PREDICTION-BLOCKCHAIN] Database response:', responseData);

                        toast({
                            title: "Prediction Submitted Successfully!",
                            description: "Your prediction has been recorded and staked on the blockchain.",
                        });

                        console.log('🔄 [PREDICTION-BLOCKCHAIN] Starting query invalidation...');

                        // Refresh data - Force immediate refetch
                        await queryClient.invalidateQueries({ queryKey: ["/api/predictions/active"] });
                        console.log('✅ [PREDICTION-BLOCKCHAIN] Invalidated /api/predictions/active');

                        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                        console.log('✅ [PREDICTION-BLOCKCHAIN] Invalidated /api/user');

                        await queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
                        console.log('✅ [PREDICTION-BLOCKCHAIN] Invalidated /api/user/stats');

                        await queryClient.invalidateQueries({ queryKey: ["/api/predictions/live-feed"] });
                        console.log('✅ [PREDICTION-BLOCKCHAIN] Invalidated /api/predictions/live-feed');

                        await queryClient.invalidateQueries({ queryKey: ["/api/activities/live"] });
                        console.log('✅ [PREDICTION-BLOCKCHAIN] Invalidated /api/activities/live');

                        console.log('🔄 [PREDICTION-BLOCKCHAIN] Starting force refetch...');

                        // Force refetch all related queries
                        const refetchActive = await queryClient.refetchQueries({ queryKey: ["/api/predictions/active"] });
                        console.log('✅ [PREDICTION-BLOCKCHAIN] Refetched /api/predictions/active:', refetchActive);

                        const refetchUser = await queryClient.refetchQueries({ queryKey: ["/api/user"] });
                        console.log('✅ [PREDICTION-BLOCKCHAIN] Refetched /api/user:', refetchUser);

                        refetchNtiqBalance();
                        refetchAllowance();

                        console.log('✅ [PREDICTION-BLOCKCHAIN] All queries refreshed successfully');

                        // Call success callback
                        if (onSuccess) {
                            onSuccess();
                        }
                    } else {
                        throw new Error('Failed to create prediction in database');
                    }
                } catch (error: any) {
                    console.error('Failed to create prediction in database:', error);
                    toast({
                        title: "Database Error",
                        description: "Prediction was staked on blockchain but failed to save in database. Please contact support.",
                        variant: "destructive",
                    });
                } finally {
                    setIsSubmitting(false);
                }
            };

            createPredictionInDB();
        }
    }, [isPredictionSuccess, predictionTxHash, onSuccess, refetchNtiqBalance, refetchAllowance]);

    // Handle approval success
    React.useEffect(() => {
        if (isApproveSuccess) {
            toast({
                title: "Approval Successful",
                description: "You can now make predictions.",
            });
            refetchAllowance();
        }
    }, [isApproveSuccess, toast, refetchAllowance]);

    // Handle errors
    React.useEffect(() => {
        if (isPredictionError) {
            toast({
                title: "Prediction Transaction Failed",
                description: "The blockchain transaction failed. Please try again.",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    }, [isPredictionError, toast]);

    React.useEffect(() => {
        if (isApproveError) {
            toast({
                title: "Approval Transaction Failed",
                description: "The approval transaction failed. Please try again.",
                variant: "destructive",
            });
        }
    }, [isApproveError, toast]);

    const onSubmit = (data: PredictionFormData) => {
        if (needsApproval) {
            handleApprove(data.stakeAmount);
        } else {
            handlePredictionSubmit(data);
        }
    };

    return (
        <div className="space-y-6">
            {/* Balance Display */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-white">Your NTIQ Balance</h3>
                        <div className="flex items-center space-x-2 mt-2">
                            <Coins className="w-6 h-6 text-yellow-400" />
                            <span className="text-3xl font-bold text-yellow-400">
                                {ntiqBalance.toFixed(2)}
                            </span>
                            <span className="text-sm text-slate-400">NTIQ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Status */}
            {needsApproval && (
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-300 font-medium">Approval Required</span>
                    </div>
                    <p className="text-orange-200 text-sm mt-1">
                        You need to approve the Prediction Staking contract to spend your NTIQ tokens first.
                    </p>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cryptocurrency Selection */}
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
                                            {availableCryptos.length === 0 ? (
                                                <SelectItem value="loading" disabled>Loading cryptocurrencies...</SelectItem>
                                            ) : availableCryptos.length > 0 ? (
                                                availableCryptos.map((crypto) => (
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

                        {/* Timeframe Selection */}
                        <FormField
                            control={form.control}
                            name="timeframe"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300 flex items-center">
                                        Prediction Timeframe
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="ml-2 h-4 w-4 text-slate-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Choose how long your prediction will last.<br />Longer timeframes offer higher potential rewards but greater risk.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-surface-light border-surface-light">
                                                <SelectValue placeholder="Select timeframe..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1h">1 Hour</SelectItem>
                                            <SelectItem value="6h">6 Hours</SelectItem>
                                            <SelectItem value="24h">24 Hours</SelectItem>
                                            <SelectItem value="7d">7 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Predicted Price */}
                    <FormField
                        control={form.control}
                        name="predictedPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-300 flex items-center">
                                    Predicted Price (USD)
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="ml-2 h-4 w-4 text-slate-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Enter the price you predict the cryptocurrency will reach.<br />Use current market price as a reference point.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder={`e.g., ${currentPrices[form.watch('cryptocurrency')] ? (currentPrices[form.watch('cryptocurrency')] * 1.05).toFixed(2) : '52000.00'}`}
                                        className="bg-surface-light border-surface-light text-white placeholder:text-slate-400"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                                {form.watch('cryptocurrency') && currentPrices[form.watch('cryptocurrency')] && (
                                    <div className="text-sm text-slate-400">
                                        Current price: ${currentPrices[form.watch('cryptocurrency')].toFixed(2)}
                                    </div>
                                )}
                            </FormItem>
                        )}
                    />

                    {/* Stake Amount */}
                    <FormField
                        control={form.control}
                        name="stakeAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-300 flex items-center">
                                    Stake Amount (NTIQ)
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="ml-2 h-4 w-4 text-slate-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Amount of NTIQ tokens you want to stake on this prediction.<br />Higher stakes offer higher potential rewards but greater risk.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="1"
                                        placeholder="e.g., 100"
                                        className="bg-surface-light border-surface-light text-white placeholder:text-slate-400"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                                <div className="flex space-x-2 mt-2">
                                    {[50, 100, 500, 1000].map((amount) => (
                                        <Button
                                            key={amount}
                                            type="button"
                                            variant={selectedStake === amount ? "default" : "outline"}
                                            onClick={() => {
                                                if (setSelectedStake) {
                                                    setSelectedStake(amount);
                                                }
                                                form.setValue("stakeAmount", amount);
                                            }}
                                            className="flex-1 bg-surface-light hover:bg-surface border-surface-light text-white"
                                        >
                                            {amount} NTIQ
                                        </Button>
                                    ))}
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* Insurance Checkbox */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="useInsurance"
                            checked={useInsurance}
                            onCheckedChange={(checked) => {
                                if (setUseInsurance) {
                                    setUseInsurance(!!checked);
                                }
                            }}
                            className="border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                        />
                        <Label htmlFor="useInsurance" className="text-slate-300 flex items-center">
                            <Shield className="h-4 w-4 mr-1 text-blue-400" />
                            Use Prediction Insurance (10% cost, 50% refund)
                        </Label>
                    </div>

                    {/* Insurance Cost Breakdown */}
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

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || isApprovePending || isPredictionPending || isApproveConfirming || isPredictionConfirming}
                        className="w-full gradient-bg hover:opacity-90 text-white font-semibold py-3 px-6 transition-all transform hover:scale-105"
                    >
                        {isSubmitting || isApprovePending || isPredictionPending || isApproveConfirming || isPredictionConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {needsApproval ? "Approving..." : "Submitting Prediction..."}
                            </>
                        ) : needsApproval ? (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve NTIQ Tokens
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Submit Prediction
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}