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
import { ethers } from 'ethers';
import { Loader2, Swords, CheckCircle2, AlertCircle, Coins, HelpCircle } from 'lucide-react';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { apiRequest } from "@/lib/queryClient";

// Schema for battle form
const battleFormSchema = z.object({
    cryptocurrency: z.string().min(1, "Please select a cryptocurrency"),
    timeframe: z.enum(["1h", "6h", "24h", "7d"]),
    challengerPrediction: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Please enter a valid prediction price",
    }),
    stakeAmount: z.number().min(50, "Minimum stake is 50 NTIQ"),
    isPublic: z.boolean().default(true),
});

type BattleFormData = z.infer<typeof battleFormSchema>;

interface BattleBlockchainFormProps {
    onClose?: () => void;
    onSuccess?: () => void;
    availableCryptos?: any[];
    currentPrices?: Record<string, number>;
    selectedStake?: number | null;
    setSelectedStake?: (amount: number | null) => void;
}

export function BattleBlockchainForm({
    onClose,
    onSuccess,
    availableCryptos = [],
    currentPrices = {},
    selectedStake,
    setSelectedStake
}: BattleBlockchainFormProps) {
    const { address, chain } = useAccount();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmittedToDB, setHasSubmittedToDB] = useState(false);

    const form = useForm<BattleFormData>({
        resolver: zodResolver(battleFormSchema),
        defaultValues: {
            cryptocurrency: "",
            timeframe: "1h",
            challengerPrediction: "",
            stakeAmount: 100,
            isPublic: true,
        },
    });

    // Wagmi hooks for blockchain interaction
    const { writeContract: writeBattleContract, data: battleTxHash, isPending: isBattlePending } = useWriteContract();
    const { writeContract: writeApproveContract, data: approveTxHash, isPending: isApprovePending } = useWriteContract();

    const { isLoading: isBattleConfirming, isSuccess: isBattleSuccess, isError: isBattleError } = useWaitForTransactionReceipt({
        hash: battleTxHash,
        query: { enabled: !!battleTxHash },
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

    // Read NTIQ allowance for Battle Escrow
    const { data: allowanceWei, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20,
        functionName: 'allowance',
        args: [address!, CONTRACTS.BATTLE_ESCROW],
        chainId: chain?.id,
        query: { enabled: !!address && !!chain?.id && !!(CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20) },
    });
    const allowance = allowanceWei ? parseFloat(formatEther(allowanceWei)) : 0;

    const needsApproval = allowance < form.watch('stakeAmount');

    const handleApprove = async (stakeAmount: number) => {
        if (!address || !chain) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to create battles.",
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
                args: [CONTRACTS.BATTLE_ESCROW, stakeAmountWei],
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

    const handleBattleSubmit = async (data: BattleFormData) => {
        if (!address || !chain) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to create battles.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Validate contract configuration
            if (!CONTRACTS.BATTLE_ESCROW) {
                throw new Error('Battle escrow contract address not configured');
            }
            
            if (!CONTRACTS.ABIS?.BATTLE_ESCROW && !ABIS?.BATTLE_ESCROW) {
                throw new Error('Battle escrow contract ABI not configured');
            }

            const stakeAmountWei = parseEther(data.stakeAmount.toString());

            // First create battle in database to get ID
            const battleResponse = await apiRequest('/api/battles/create', {
                method: 'POST',
                body: JSON.stringify({
                    cryptocurrency: data.cryptocurrency,
                    timeframe: data.timeframe,
                    stakeAmount: data.stakeAmount,
                    challengerPrediction: data.challengerPrediction,
                    isPublic: data.isPublic
                })
            });

            if (!battleResponse || !battleResponse.id) {
                throw new Error('Failed to create battle in database');
            }

            // Generate battle ID using database ID (consistent with backend)
            const battleId = ethers.id(`battle_${battleResponse.id}`);

            // Check NTIQ balance
            const ntiqBalanceWei = await refetchNtiqBalance();
            const currentBalance = ntiqBalanceWei.data ? Number(formatEther(ntiqBalanceWei.data)) : 0;
            
            if (currentBalance < data.stakeAmount) {
                throw new Error(`Insufficient NTIQ balance. You have ${currentBalance.toFixed(2)} NTIQ but need ${data.stakeAmount} NTIQ`);
            }

            // Check allowance
            const allowanceWei = await refetchAllowance();
            const currentAllowance = allowanceWei.data ? Number(formatEther(allowanceWei.data)) : 0;
            
            if (currentAllowance < data.stakeAmount) {
                throw new Error(`Insufficient allowance. You need to approve ${data.stakeAmount} NTIQ spending first`);
            }

            console.log('⚔️ [BATTLE-BLOCKCHAIN] Creating battle:', {
                dbId: battleResponse.id,
                blockchainId: battleId,
                stakeAmount: data.stakeAmount,
                stakeAmountWei: stakeAmountWei.toString(),
                challenger: address,
                chainId: chain.id,
                contractAddress: CONTRACTS.BATTLE_ESCROW,
                abi: CONTRACTS.ABIS?.BATTLE_ESCROW ? 'Available' : 'Missing',
                ntiqBalance: currentBalance,
                allowance: currentAllowance
            });

            await writeBattleContract({
                address: CONTRACTS.BATTLE_ESCROW,
                abi: CONTRACTS.ABIS?.BATTLE_ESCROW || ABIS?.BATTLE_ESCROW,
                functionName: 'createBattle',
                args: [battleId, stakeAmountWei],
                chainId: chain.id,
                gas: 300000n, // Optimize gas limit for create battle
            });
        } catch (error: any) {
            console.error('❌ [BATTLE-BLOCKCHAIN] Battle creation failed:', error);
            
            let errorTitle = "Battle Creation Failed";
            let errorDescription = error.shortMessage || error.message || "Unknown error occurred";
            
            // Handle specific error cases
            if (error.message?.includes("Battle escrow contract address not configured")) {
                errorTitle = "Contract Configuration Error";
                errorDescription = "Battle escrow contract address is not configured. Please contact support.";
            } else if (error.message?.includes("Battle escrow contract ABI not configured")) {
                errorTitle = "Contract Configuration Error";
                errorDescription = "Battle escrow contract ABI is not configured. Please contact support.";
            } else if (error.message?.includes("UNSUPPORTED_OPERATION")) {
                errorTitle = "Contract Error";
                errorDescription = "The battle contract operation is not supported. Please check your wallet connection and try again.";
            } else if (error.message?.includes("Insufficient balance")) {
                errorTitle = "Insufficient Balance";
                errorDescription = "You don't have enough NTIQ tokens for this battle";
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
            } else if (error.message?.includes("Failed to create battle in database")) {
                errorTitle = "Database Error";
                errorDescription = "Failed to create battle in database. Please try again.";
            }
            
            toast({
                title: errorTitle,
                description: errorDescription,
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    // Handle successful battle transaction
    React.useEffect(() => {
        if (isBattleSuccess && battleTxHash && !hasSubmittedToDB) {
            setHasSubmittedToDB(true); // Prevent multiple submissions

            // Create battle in database
            const createBattleInDB = async () => {
                try {
                    const formData = form.getValues();

                    console.log('🔄 [BATTLE-BLOCKCHAIN] Creating battle in database...');

                    const response = await apiRequest("/api/battles/blockchain", {
                        method: "POST",
                        body: JSON.stringify({
                            ...formData,
                            challengerPrediction: parseFloat(formData.challengerPrediction),
                            blockchainTxHash: battleTxHash,
                            blockchainStatus: 'confirmed',
                        }),
                    });

                    if (response.ok) {
                        const responseData = await response.json();
                        console.log('✅ [BATTLE-BLOCKCHAIN] Database response:', responseData);

                        toast({
                            title: "Battle Created Successfully!",
                            description: "Your battle has been recorded and staked on the blockchain.",
                        });

                        console.log('🔄 [BATTLE-BLOCKCHAIN] Starting query invalidation...');

                        // Refresh data - Force immediate refetch
                        await queryClient.invalidateQueries({ queryKey: ["/api/battles/live"] });
                        console.log('✅ [BATTLE-BLOCKCHAIN] Invalidated /api/battles/live');

                        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                        console.log('✅ [BATTLE-BLOCKCHAIN] Invalidated /api/user');

                        await queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
                        console.log('✅ [BATTLE-BLOCKCHAIN] Invalidated /api/user/stats');

                        await queryClient.invalidateQueries({ queryKey: ["/api/battles/stats"] });
                        console.log('✅ [BATTLE-BLOCKCHAIN] Invalidated /api/battles/stats');

                        console.log('🔄 [BATTLE-BLOCKCHAIN] Starting force refetch...');

                        // Force refetch all related queries
                        const refetchBattles = await queryClient.refetchQueries({ queryKey: ["/api/battles/live"] });
                        console.log('✅ [BATTLE-BLOCKCHAIN] Refetched /api/battles/live:', refetchBattles);

                        const refetchUser = await queryClient.refetchQueries({ queryKey: ["/api/user"] });
                        console.log('✅ [BATTLE-BLOCKCHAIN] Refetched /api/user:', refetchUser);

                        refetchNtiqBalance();
                        refetchAllowance();

                        console.log('✅ [BATTLE-BLOCKCHAIN] All queries refreshed successfully');

                        // Call success callback
                        if (onSuccess) {
                            onSuccess();
                        }
                    } else {
                        throw new Error('Failed to create battle in database');
                    }
                } catch (error: any) {
                    console.error('❌ [BATTLE-BLOCKCHAIN] Failed to create battle in database:', error);
                    toast({
                        title: "Database Error",
                        description: "Battle was staked on blockchain but failed to save in database. Please contact support.",
                        variant: "destructive",
                    });
                } finally {
                    setIsSubmitting(false);
                }
            };

            createBattleInDB();
        }
    }, [isBattleSuccess, battleTxHash, hasSubmittedToDB]);

    // Handle approval success
    React.useEffect(() => {
        if (isApproveSuccess) {
            toast({
                title: "Approval Successful",
                description: "You can now create battles.",
            });
            refetchAllowance();
        }
    }, [isApproveSuccess, toast, refetchAllowance]);

    // Handle errors
    React.useEffect(() => {
        if (isBattleError) {
            toast({
                title: "Battle Transaction Failed",
                description: "The blockchain transaction failed. Please try again.",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    }, [isBattleError, toast]);

    React.useEffect(() => {
        if (isApproveError) {
            toast({
                title: "Approval Transaction Failed",
                description: "The approval transaction failed. Please try again.",
                variant: "destructive",
            });
        }
    }, [isApproveError, toast]);

    const onSubmit = (data: BattleFormData) => {
        if (needsApproval) {
            handleApprove(data.stakeAmount);
        } else {
            handleBattleSubmit(data);
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
                        You need to approve the Battle Escrow contract to spend your NTIQ tokens first.
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
                                                    <p>Choose the cryptocurrency for your battle prediction.</p>
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
                                        Battle Timeframe
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="ml-2 h-4 w-4 text-slate-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Choose how long your battle will last.</p>
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

                    {/* Challenger Prediction */}
                    <FormField
                        control={form.control}
                        name="challengerPrediction"
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
                                                <p>Amount of NTIQ tokens you want to stake on this battle.</p>
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

                    {/* Public Battle Checkbox */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isPublic"
                            checked={form.watch('isPublic')}
                            onCheckedChange={(checked) => form.setValue('isPublic', !!checked)}
                            className="border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                        />
                        <Label htmlFor="isPublic" className="text-slate-300 flex items-center">
                            <Swords className="h-4 w-4 mr-1 text-red-400" />
                            Make this a public battle (others can join)
                        </Label>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || isApprovePending || isBattlePending || isApproveConfirming || isBattleConfirming}
                        className="w-full gradient-bg hover:opacity-90 text-white font-semibold py-3 px-6 transition-all transform hover:scale-105"
                    >
                        {isSubmitting || isApprovePending || isBattlePending || isApproveConfirming || isBattleConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {needsApproval ? "Approving..." : "Creating Battle..."}
                            </>
                        ) : needsApproval ? (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve NTIQ Tokens
                            </>
                        ) : (
                            <>
                                <Swords className="mr-2 h-4 w-4" />
                                Create Battle
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
