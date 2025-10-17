import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
    const [hasSubmittedToDB, setHasSubmittedToDB] = useState(false);

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
        abi: CONTRACTS.ABIS?.NTIQ_TOKEN || ABIS?.NTIQ_TOKEN,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: !!address },
    });

    // Read allowance
    const { data: allowanceWei, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS?.NTIQ_TOKEN || ABIS?.NTIQ_TOKEN,
        functionName: 'allowance',
        args: [address, CONTRACTS.ENHANCED_PREDICTION_STAKING],
        query: { enabled: !!address },
    });

    const { address, chain } = useAccount();

    // Convert Wei to readable format
    const ntiqBalance = ntiqBalanceWei ? Number(formatEther(ntiqBalanceWei)) : 0;
    const allowance = allowanceWei ? Number(formatEther(allowanceWei)) : 0;

    // Watch form values
    const watchedStakeAmount = form.watch('stakeAmount');
    const currentStakeAmount = watchedStakeAmount || 0;

    // Check if approval is needed
    const needsApproval = !allowanceWei || allowance === 0 || allowance < currentStakeAmount;

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
        if (ntiqBalance === 0 && !ntiqBalanceWei) {
            return { isValid: false, error: "Loading balance, please wait..." };
        }
        return { isValid: true };
    };

    const handleApproval = async () => {
        if (!address || !chain) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        try {
            const stakeAmountWei = parseEther(currentStakeAmount.toString());

            await writeApproveContract({
                address: CONTRACTS.NTIQ_TOKEN,
                abi: CONTRACTS.ABIS?.NTIQ_TOKEN || ABIS?.NTIQ_TOKEN,
                functionName: 'approve',
                args: [CONTRACTS.ENHANCED_PREDICTION_STAKING, stakeAmountWei],
                chainId: chain.id,
                gas: 150000n, // Increased gas limit for approval
            });
        } catch (error: any) {
            console.error('❌ [PREDICTION-APPROVAL] Error details:', error);
            toast({
                title: "Approval Failed",
                description: error.shortMessage || error.message || "Failed to approve NTIQ spending",
                variant: "destructive",
            });
        }
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

            // Use backend API which handles blockchain call automatically
            const apiTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Prediction creation timed out after 60 seconds')), 60000)
            );

            const predictionResponse = await Promise.race([
                apiRequest('/api/predictions', {
                    method: 'POST',
                    body: JSON.stringify({
                        cryptocurrency: data.cryptocurrency,
                        predictedPrice: data.predictedPrice,
                        timeframe: data.timeframe,
                        stakeAmount: data.stakeAmount,
                        duration: duration
                    })
                }),
                apiTimeout
            ]);

            if (!predictionResponse || !predictionResponse.id) {
                throw new Error('Failed to create prediction');
            }

            console.log('✅ [PREDICTION-BLOCKCHAIN] Prediction created successfully:', predictionResponse);

            // Mark as submitted and trigger refresh
            setHasSubmittedToDB(true);

        } catch (error: any) {
            console.error('❌ [PREDICTION-BLOCKCHAIN] Error details:', error);

            // Enhanced error handling with specific error messages
            let errorTitle = "Prediction Failed";
            let errorDescription = error.shortMessage || error.message || "Unknown error occurred";

            if (error.message?.includes("Prediction creation timed out")) {
                errorTitle = "Request Timeout";
                errorDescription = "Prediction creation took too long. Please try again.";
            } else if (error.message?.includes("Insufficient balance")) {
                errorTitle = "Insufficient Balance";
                errorDescription = "You don't have enough NTIQ tokens for this prediction";
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
            setIsSubmitting(false);
        }
    };

    // Handle successful prediction creation
    React.useEffect(() => {
        if (hasSubmittedToDB) {
            // Refresh data after successful prediction creation
            const refreshData = async () => {
                try {
                    toast({
                        title: "Prediction Submitted Successfully!",
                        description: "Your prediction has been recorded and staked on the blockchain.",
                    });

                    console.log('🔄 [PREDICTION-BLOCKCHAIN] Starting query invalidation...');

                    // Refresh data - Force immediate refetch
                    await queryClient.invalidateQueries({ queryKey: ["/api/predictions/active"] });
                    await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                    await queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
                    await queryClient.invalidateQueries({ queryKey: ["/api/predictions/live-feed"] });
                    await queryClient.invalidateQueries({ queryKey: ["/api/activities/live"] });

                    // Refresh NTIQ balance
                    await refetchNtiqBalance();
                    await refetchAllowance();

                    console.log('✅ [PREDICTION-BLOCKCHAIN] All data refreshed successfully');

                    // Call success callback
                    if (onSuccess) {
                        onSuccess();
                    }
                    if (onClose) {
                        onClose();
                    }
                } catch (error: any) {
                    console.error('❌ [PREDICTION-BLOCKCHAIN] Data refresh error:', error);
                }
            };

            refreshData();
        }
    }, [hasSubmittedToDB, queryClient, refetchNtiqBalance, refetchAllowance, onSuccess, onClose]);

    // Handle approval success
    React.useEffect(() => {
        if (isApproveSuccess) {
            toast({
                title: "Approval Successful!",
                description: "NTIQ spending has been approved. You can now create predictions.",
            });
            refetchAllowance();
        }
    }, [isApproveSuccess, refetchAllowance]);

    // Handle approval error
    React.useEffect(() => {
        if (isApproveError) {
            toast({
                title: "Approval Failed",
                description: "Failed to approve NTIQ spending. Please try again.",
                variant: "destructive",
            });
        }
    }, [isApproveError]);

    // Calculate duration in seconds
    const durationMap = { '1h': 3600, '6h': 21600, '24h': 86400, '7d': 604800 };
    const duration = durationMap[form.watch('timeframe')];

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePredictionSubmit)} className="space-y-6">
                    {/* Cryptocurrency Selection */}
                    <FormField
                        control={form.control}
                        name="cryptocurrency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cryptocurrency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a cryptocurrency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableCryptos.map((crypto) => (
                                            <SelectItem key={crypto.id} value={crypto.id}>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{crypto.symbol}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        ${currentPrices[crypto.id]?.toFixed(2) || '0.00'}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
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
                                <FormLabel>Timeframe</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timeframe" />
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

                    {/* Predicted Price */}
                    <FormField
                        control={form.control}
                        name="predictedPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Predicted Price (USD)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter your predicted price"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Stake Amount */}
                    <FormField
                        control={form.control}
                        name="stakeAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stake Amount (NTIQ)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="50"
                                        max="10000"
                                        step="10"
                                        placeholder="Enter stake amount"
                                        {...field}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value) || 0;
                                            field.onChange(value);
                                            if (setSelectedStake) {
                                                setSelectedStake(value);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Balance and Allowance Info */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Your NTIQ Balance:</span>
                            <span className="text-sm">{ntiqBalance.toFixed(2)} NTIQ</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Approved Amount:</span>
                            <span className="text-sm">{allowance.toFixed(2)} NTIQ</span>
                        </div>
                        {needsApproval && (
                            <div className="flex items-center space-x-2 text-amber-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">Approval required for NTIQ spending</span>
                            </div>
                        )}
                    </div>

                    {/* Approval Button */}
                    {needsApproval && (
                        <Button
                            type="button"
                            onClick={handleApproval}
                            disabled={isApprovePending || isApproveConfirming}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {isApprovePending || isApproveConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving NTIQ...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve NTIQ Tokens
                                </>
                            )}
                        </Button>
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
                                {isApprovePending || isApproveConfirming ? "Approving NTIQ..." :
                                    isPredictionPending || isPredictionConfirming ? "Submitting to Blockchain..." :
                                        "Processing..."}
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