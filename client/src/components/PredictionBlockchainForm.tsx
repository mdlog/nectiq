import React, { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Loader2, Target, CheckCircle2, AlertCircle, Coins, HelpCircle } from 'lucide-react';
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
    
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Wagmi hooks for blockchain interaction
    const { writeContract: writeApproveContract, data: approveTxHash, isPending: isApprovePending } = useWriteContract();

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess, isError: isApproveError } = useWaitForTransactionReceipt({
        hash: approveTxHash,
        query: { enabled: !!approveTxHash },
    });

    const form = useForm<PredictionFormData>({
        resolver: zodResolver(predictionFormSchema),
        defaultValues: {
            cryptocurrency: preSelectedCrypto || "",
            timeframe: "1h",
            predictedPrice: "",
            stakeAmount: 100,
        },
    });

    const { address, chain } = useAccount();

    // Read NTIQ balance with error handling
    const { data: ntiqBalanceWei, refetch: refetchNtiqBalance } = useReadContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS?.NTIQToken || ABIS?.NTIQToken,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    // Read allowance with error handling
    const { data: allowanceWei, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS?.NTIQToken || ABIS?.NTIQToken,
        functionName: 'allowance',
        args: address && CONTRACTS.ENHANCED_PREDICTION_STAKING ? [address, CONTRACTS.ENHANCED_PREDICTION_STAKING] : undefined,
        query: { enabled: !!address && !!CONTRACTS.ENHANCED_PREDICTION_STAKING },
    });

    // Convert Wei to readable format with fallback
    const ntiqBalance = ntiqBalanceWei ? Number(formatEther(ntiqBalanceWei)) : 0;
    const allowance = allowanceWei ? Number(formatEther(allowanceWei)) : 0;

    // Watch form values
    const watchedStakeAmount = form.watch('stakeAmount');
    const currentStakeAmount = watchedStakeAmount || 0;

    // Check if approval is needed
    const needsApproval = !allowanceWei || allowance === 0 || allowance < currentStakeAmount;

    // Handle approval success
    React.useEffect(() => {
        if (isApproveSuccess) {
            toast({
                title: "✅ NTIQ Approval Successful",
                description: "You can now create predictions. Click 'Step 2: Create Prediction' to proceed.",
            });
            refetchAllowance();
        }
    }, [isApproveSuccess, toast, refetchAllowance]);

    // Handle approval errors
    React.useEffect(() => {
        if (isApproveError) {
            toast({
                title: "Approval Transaction Failed",
                description: "The approval transaction failed. Please try again.",
                variant: "destructive",
            });
        }
    }, [isApproveError, toast]);

    const handleApprove = async (stakeAmount: number) => {
        console.log('🔵 [PREDICTION-APPROVAL] handleApprove called with stakeAmount:', stakeAmount);
        console.log('🔵 [PREDICTION-APPROVAL] address:', address);
        console.log('🔵 [PREDICTION-APPROVAL] chain:', chain);
        console.log('🔵 [PREDICTION-APPROVAL] CONTRACTS.NTIQ_TOKEN:', CONTRACTS.NTIQ_TOKEN);
        console.log('🔵 [PREDICTION-APPROVAL] CONTRACTS.ENHANCED_PREDICTION_STAKING:', CONTRACTS.ENHANCED_PREDICTION_STAKING);
        console.log('🔵 [PREDICTION-APPROVAL] ABI available:', !!(CONTRACTS.ABIS?.NTIQToken || ABIS?.NTIQToken));

        if (!address || !chain) {
            console.log('❌ [PREDICTION-APPROVAL] Wallet not connected');
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to create predictions.",
                variant: "destructive",
            });
            return;
        }

        if (!CONTRACTS.NTIQ_TOKEN) {
            console.log('❌ [PREDICTION-APPROVAL] NTIQ_TOKEN contract not configured');
            toast({
                title: "Contract Error",
                description: "NTIQ Token contract address not configured.",
                variant: "destructive",
            });
            return;
        }

        if (!CONTRACTS.ENHANCED_PREDICTION_STAKING) {
            console.log('❌ [PREDICTION-APPROVAL] ENHANCED_PREDICTION_STAKING contract not configured');
            toast({
                title: "Contract Error",
                description: "Prediction Staking contract address not configured.",
                variant: "destructive",
            });
            return;
        }

        try {
            const stakeAmountWei = parseEther(stakeAmount.toString());
            console.log('🔵 [PREDICTION-APPROVAL] stakeAmountWei:', stakeAmountWei.toString());

            console.log('🔵 [PREDICTION-APPROVAL] Calling writeApproveContract...');
            await writeApproveContract({
                address: CONTRACTS.NTIQ_TOKEN,
                abi: CONTRACTS.ABIS?.NTIQToken || ABIS?.NTIQToken,
                functionName: 'approve',
                args: [CONTRACTS.ENHANCED_PREDICTION_STAKING, stakeAmountWei],
                chainId: chain.id,
                gas: 150000n, // Optimize gas limit for approve
            });
            console.log('✅ [PREDICTION-APPROVAL] writeApproveContract called successfully');
        } catch (error: any) {
            console.error('❌ [PREDICTION-APPROVAL] Error details:', error);
            toast({
                title: "Approval Failed",
                description: error.shortMessage || error.message,
                variant: "destructive",
            });
        }
    };

    // Validation function
    const validatePrediction = (data: PredictionFormData): { isValid: boolean; error?: string } => {
        if (!address || !chain) {
            return { isValid: false, error: "Wallet Not Connected" };
        }
        if (ntiqBalance < data.stakeAmount) {
            return { 
                isValid: false, 
                error: `Insufficient Balance: You need ${data.stakeAmount} NTIQ, but your balance is ${ntiqBalance.toFixed(2)} NTIQ` 
            };
        }
        if (allowance < data.stakeAmount) {
            return { 
                isValid: false, 
                error: "Approval Required: Please approve NTIQ spending first" 
            };
        }
        if (data.stakeAmount < 1) {
            return { isValid: false, error: "Minimum stake amount is 1 NTIQ" };
        }
        if (data.predictedPrice <= 0) {
            return { isValid: false, error: "Predicted price must be greater than 0" };
        }
        return { isValid: true };
    };

    const handlePredictionSubmit = async (data: PredictionFormData) => {
        // Validate before submission
        const validation = validatePrediction(data);
        if (!validation.isValid) {
            toast({
                title: "Validation Error",
                description: validation.error,
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('🔄 [PREDICTION-BLOCKCHAIN] Starting prediction submission...');

            // Show loading toast for prediction creation
            toast({
                title: "Creating Prediction...",
                description: "Setting up your prediction and preparing blockchain transaction...",
            });

            // Calculate duration in seconds
            const durationMap = { '1h': 3600, '6h': 21600, '24h': 86400, '7d': 604800 };
            const duration = durationMap[data.timeframe];

            // Use backend API which handles blockchain call automatically
            const apiTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Prediction creation timed out after 60 seconds')), 60000)
            );

            console.log('🔵 [PREDICTION-SUBMIT] Sending request to backend with address:', address);

            const predictionResponse = await Promise.race([
                apiRequest('/api/predictions', {
                    method: 'POST',
                    body: JSON.stringify({
                        cryptocurrency: data.cryptocurrency,
                        predictedPrice: data.predictedPrice,
                        timeframe: data.timeframe,
                        stakeAmount: data.stakeAmount,
                        duration: duration,
                        walletAddress: address // Send current wallet address to ensure consistency
                    })
                }),
                apiTimeout
            ]);

            if (!predictionResponse || !predictionResponse.id) {
                throw new Error('Failed to create prediction');
            }

            console.log('✅ [PREDICTION-BLOCKCHAIN] Prediction created successfully:', predictionResponse);

            // Show success message
            toast({
                title: "Prediction Submitted Successfully!",
                description: "Your prediction has been recorded and staked on the blockchain.",
            });

            // Refresh data
            await queryClient.invalidateQueries({ queryKey: ["/api/predictions/active"] });
            await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            await queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
            await queryClient.invalidateQueries({ queryKey: ["/api/predictions/live-feed"] });
            await queryClient.invalidateQueries({ queryKey: ["/api/activities/live"] });

            // Refresh NTIQ balance
            await refetchNtiqBalance();
            await refetchAllowance();

            // Call success callback
            if (onSuccess) {
                onSuccess();
            }
            if (onClose) {
                onClose();
            }

        } catch (error: any) {
            console.error('❌ [PREDICTION-BLOCKCHAIN] Error details:', error);

            // Enhanced error handling with specific error messages
            let errorTitle = "Prediction Failed";
            let errorDescription = error.shortMessage || error.message || "Unknown error occurred";
            let showAirdropButton = false;

            if (error.message?.includes("Prediction creation timed out")) {
                errorTitle = "Request Timeout";
                errorDescription = "Prediction creation took too long. Please try again.";
            } else if (error.message?.includes("Insufficient balance") || error.message?.includes("Insufficient NTIQ balance")) {
                errorTitle = "Insufficient Balance";
                errorDescription = "You don't have enough NTIQ tokens for this prediction";
                showAirdropButton = true;
            } else if (error.message?.includes("Approval Required")) {
                errorTitle = "Approval Required";
                errorDescription = "Please approve NTIQ spending first by clicking 'Approve NTIQ' button";
            } else if (error.message?.includes("User rejected")) {
                errorTitle = "Transaction Cancelled";
                errorDescription = "You cancelled the transaction in MetaMask";
            } else if (error.message?.includes("gas required exceeds allowance")) {
                errorTitle = "Gas Limit Error";
                errorDescription = "Transaction failed due to low gas limit. Please try again";
            } else if (error.message?.includes("insufficient funds")) {
                errorTitle = "Insufficient Funds";
                errorDescription = "You don't have enough POL tokens for gas fees";
            }

            toast({
                title: errorTitle,
                description: errorDescription,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = (data: PredictionFormData) => {
        console.log('🔵 [PREDICTION-SUBMIT] onSubmit called with data:', data);
        console.log('🔵 [PREDICTION-SUBMIT] needsApproval:', needsApproval);
        console.log('🔵 [PREDICTION-SUBMIT] currentStakeAmount:', currentStakeAmount);
        console.log('🔵 [PREDICTION-SUBMIT] allowance:', allowance);
        
        if (needsApproval) {
            console.log('🔵 [PREDICTION-SUBMIT] Calling handleApprove with stakeAmount:', data.stakeAmount);
            handleApprove(data.stakeAmount);
        } else {
            console.log('🔵 [PREDICTION-SUBMIT] Calling handlePredictionSubmit');
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

            {/* Step Indicator */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${needsApproval
                            ? 'bg-orange-500 text-white'
                            : 'bg-green-500 text-white'
                            }`}>
                            {needsApproval ? '1' : '✓'}
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Step 1: Approve NTIQ Spending</h3>
                            <p className="text-slate-400 text-sm">
                                {needsApproval
                                    ? 'Approve the Prediction Staking contract to spend your NTIQ tokens'
                                    : 'NTIQ spending approved ✓'
                                }
                            </p>
                        </div>
                    </div>
                    {!needsApproval && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-500 text-white">
                                2
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Step 2: Create Prediction</h3>
                                <p className="text-slate-400 text-sm">Ready to create your prediction</p>
                            </div>
                        </div>
                    )}
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
                        Click the "Approve NTIQ Tokens" button below to proceed.
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
                                                    <p>Choose the cryptocurrency for your prediction.</p>
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
                                                    <p>Choose how long your prediction will last.</p>
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
                                    Your Prediction Price (USD)
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="ml-2 h-4 w-4 text-slate-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Enter the price you predict the cryptocurrency will reach.</p>
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
                                                <p>Amount of NTIQ tokens you want to stake on this prediction.</p>
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

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || isApprovePending || isApproveConfirming}
                        className={`w-full font-semibold py-3 px-6 transition-all transform hover:scale-105 ${needsApproval
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                            }`}
                    >
                        {isSubmitting || isApprovePending || isApproveConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {needsApproval ? "Approving NTIQ..." : "Creating Prediction..."}
                            </>
                        ) : needsApproval ? (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Step 1: Approve NTIQ Tokens
                            </>
                        ) : (
                            <>
                                <Target className="mr-2 h-4 w-4" />
                                Step 2: Create Prediction
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}