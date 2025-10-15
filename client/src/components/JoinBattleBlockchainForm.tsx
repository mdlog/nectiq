import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Loader2, Swords, CheckCircle2, AlertCircle, Coins, HelpCircle, Users, Target } from 'lucide-react';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { apiRequest } from "@/lib/queryClient";

// Schema for join battle form
const joinBattleFormSchema = z.object({
    challengedPrediction: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Please enter a valid prediction price",
    }),
});

type JoinBattleFormData = z.infer<typeof joinBattleFormSchema>;

interface JoinBattleBlockchainFormProps {
    battle: {
        id: number;
        cryptocurrency: string;
        timeframe: string;
        stakeAmount: number;
        challengerPrediction: number;
        challengerUsername: string;
        currentPrice?: number;
        blockchainBattleHash?: string;
    };
    onClose?: () => void;
    onSuccess?: () => void;
}

export function JoinBattleBlockchainForm({
    battle,
    onClose,
    onSuccess
}: JoinBattleBlockchainFormProps) {
    const { address, chain } = useAccount();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<JoinBattleFormData>({
        resolver: zodResolver(joinBattleFormSchema),
        defaultValues: {
            challengedPrediction: "",
        },
    });

    // Wagmi hooks for blockchain interaction
    const { writeContract: writeJoinContract, data: joinTxHash, isPending: isJoinPending } = useWriteContract();
    const { writeContract: writeApproveContract, data: approveTxHash, isPending: isApprovePending } = useWriteContract();

    const { isLoading: isJoinConfirming, isSuccess: isJoinSuccess, isError: isJoinError } = useWaitForTransactionReceipt({
        hash: joinTxHash,
        query: { enabled: !!joinTxHash },
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

    // Read allowance for battle escrow contract
    const { data: allowanceWei, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20,
        functionName: 'allowance',
        args: [address!, CONTRACTS.BATTLE_ESCROW],
        chainId: chain?.id,
        query: { enabled: !!address && !!chain?.id && !!(CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20) },
    });
    const allowance = allowanceWei ? parseFloat(formatEther(allowanceWei)) : 0;

    const needsApproval = allowance < battle.stakeAmount;

    const handleApprove = async (stakeAmount: number) => {
        if (!address || !chain) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to join battles.",
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

    const handleJoinBattle = async (data: JoinBattleFormData) => {
        if (!address || !chain) {
            console.error('❌ [JOIN-BATTLE-BLOCKCHAIN] Wallet not connected:', { address, chain });
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to join battles.",
                variant: "destructive",
            });
            return;
        }

        if (!CONTRACTS.BATTLE_ESCROW) {
            console.error('❌ [JOIN-BATTLE-BLOCKCHAIN] Battle escrow contract address not found');
            toast({
                title: "Contract Error",
                description: "Battle escrow contract address not configured.",
                variant: "destructive",
            });
            return;
        }

        if (!CONTRACTS.ABIS?.BATTLE_ESCROW && !ABIS?.BATTLE_ESCROW) {
            console.error('❌ [JOIN-BATTLE-BLOCKCHAIN] Battle escrow ABI not found');
            toast({
                title: "Contract Error",
                description: "Battle escrow contract ABI not configured.",
                variant: "destructive",
            });
            return;
        }

        // Check balance before proceeding
        if (ntiqBalance < battle.stakeAmount) {
            console.error('❌ [JOIN-BATTLE-BLOCKCHAIN] Insufficient balance:', {
                required: battle.stakeAmount,
                available: ntiqBalance
            });
            toast({
                title: "Insufficient Balance",
                description: `You need ${battle.stakeAmount} NTIQ but only have ${ntiqBalance.toFixed(2)} NTIQ.`,
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const stakeAmountWei = parseEther(battle.stakeAmount.toString());

            // Validate that battle has blockchain hash (created on blockchain)
            if (!battle.blockchainBattleHash || battle.blockchainBattleHash === '0x' || battle.blockchainBattleHash.length < 10) {
                console.error('❌ [JOIN-BATTLE-BLOCKCHAIN] Battle not created on blockchain:', {
                    battleId: battle.id,
                    blockchainBattleHash: battle.blockchainBattleHash,
                    battleDetails: {
                        cryptocurrency: battle.cryptocurrency,
                        stakeAmount: battle.stakeAmount,
                        challengerUsername: battle.challengerUsername
                    }
                });
                toast({
                    title: "Battle Not Available",
                    description: `Battle #${battle.id} (${battle.cryptocurrency.toUpperCase()}) has an invalid blockchain hash. Please try a different battle.`,
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }

            const battleId = battle.blockchainBattleHash;

            // Validate battle ID format - must be a valid transaction hash (66 characters including 0x)
            if (!battleId || battleId === '0x' || battleId.length !== 66) {
                console.error('❌ [JOIN-BATTLE-BLOCKCHAIN] Invalid battle ID format:', {
                    battleId,
                    battleIdLength: battleId?.length
                });
                toast({
                    title: "Invalid Battle ID",
                    description: "Battle ID format is invalid. Please try again.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }

            console.log('⚔️ [JOIN-BATTLE-BLOCKCHAIN] Joining battle:', {
                battleId,
                stakeAmount: battle.stakeAmount,
                stakeAmountWei: stakeAmountWei.toString(),
                challenged: address,
                challengerPrediction: data.challengedPrediction,
                chainId: chain.id,
                contractAddress: CONTRACTS.BATTLE_ESCROW,
                abi: CONTRACTS.ABIS?.BATTLE_ESCROW ? 'Available' : 'Missing',
                needsApproval,
                allowance,
                ntiqBalance
            });

            console.log('🚀 [JOIN-BATTLE-BLOCKCHAIN] Calling writeJoinContract...');

            await writeJoinContract({
                address: CONTRACTS.BATTLE_ESCROW,
                abi: CONTRACTS.ABIS?.BATTLE_ESCROW || ABIS?.BATTLE_ESCROW,
                functionName: 'acceptBattle',
                args: [battleId], // Fixed: Only battleId parameter
                chainId: chain.id,
                gas: 300000n, // Optimize gas limit for join battle
            });

            console.log('✅ [JOIN-BATTLE-BLOCKCHAIN] writeJoinContract called successfully');
        } catch (error: any) {
            console.error('❌ [JOIN-BATTLE-BLOCKCHAIN] Join battle failed:', error);
            console.error('❌ [JOIN-BATTLE-BLOCKCHAIN] Error details:', {
                message: error.message,
                shortMessage: error.shortMessage,
                code: error.code,
                reason: error.reason,
                data: error.data,
                stack: error.stack
            });

            let errorMessage = "Unknown error occurred";
            if (error.shortMessage) {
                errorMessage = error.shortMessage;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.reason) {
                errorMessage = error.reason;
            }

            toast({
                title: "Join Battle Failed",
                description: errorMessage,
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    // Handle successful join transaction
    React.useEffect(() => {
        if (isJoinSuccess && joinTxHash) {
            // Join battle in database
            const joinBattleInDB = async () => {
                try {
                    const formData = form.getValues();

                    console.log('🔄 [JOIN-BATTLE-BLOCKCHAIN] Joining battle in database...');

                    const response = await apiRequest(`/api/battles/${battle.id}/join-blockchain`, {
                        method: "POST",
                        body: JSON.stringify({
                            challengedPrediction: parseFloat(formData.challengedPrediction),
                            blockchainTxHash: joinTxHash,
                            blockchainStatus: 'confirmed',
                        }),
                    });

                    if (response.ok) {
                        const responseData = await response.json();
                        console.log('✅ [JOIN-BATTLE-BLOCKCHAIN] Database response:', responseData);

                        toast({
                            title: "Battle Joined Successfully!",
                            description: `You've joined ${battle.challengerUsername}'s ${battle.cryptocurrency} battle!`,
                        });

                        console.log('🔄 [JOIN-BATTLE-BLOCKCHAIN] Starting query invalidation...');

                        // Refresh data - Force immediate refetch
                        await queryClient.invalidateQueries({ queryKey: ["/api/battles/live"] });
                        console.log('✅ [JOIN-BATTLE-BLOCKCHAIN] Invalidated /api/battles/live');

                        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                        console.log('✅ [JOIN-BATTLE-BLOCKCHAIN] Invalidated /api/user');

                        await queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
                        console.log('✅ [JOIN-BATTLE-BLOCKCHAIN] Invalidated /api/user/stats');

                        await queryClient.invalidateQueries({ queryKey: ["/api/battles/stats"] });
                        console.log('✅ [JOIN-BATTLE-BLOCKCHAIN] Invalidated /api/battles/stats');

                        console.log('🔄 [JOIN-BATTLE-BLOCKCHAIN] Starting force refetch...');

                        // Force refetch all related queries
                        const refetchBattles = await queryClient.refetchQueries({ queryKey: ["/api/battles/live"] });
                        console.log('✅ [JOIN-BATTLE-BLOCKCHAIN] Refetched /api/battles/live:', refetchBattles);

                        const refetchUser = await queryClient.refetchQueries({ queryKey: ["/api/user"] });
                        console.log('✅ [JOIN-BATTLE-BLOCKCHAIN] Refetched /api/user:', refetchUser);

                        refetchNtiqBalance();
                        refetchAllowance();

                        console.log('✅ [JOIN-BATTLE-BLOCKCHAIN] All queries refreshed successfully');

                        // Call success callback
                        if (onSuccess) {
                            onSuccess();
                        }
                    } else {
                        throw new Error('Failed to join battle in database');
                    }
                } catch (error: any) {
                    console.error('❌ [JOIN-BATTLE-BLOCKCHAIN] Failed to join battle in database:', error);
                    toast({
                        title: "Database Error",
                        description: "Battle join was staked on blockchain but failed to save in database. Please contact support.",
                        variant: "destructive",
                    });
                } finally {
                    setIsSubmitting(false);
                }
            };

            joinBattleInDB();
        }
    }, [isJoinSuccess, joinTxHash, battle.id]);

    // Handle approval success
    React.useEffect(() => {
        if (isApproveSuccess) {
            toast({
                title: "Approval Successful",
                description: "You can now join battles.",
            });
            refetchAllowance();
        }
    }, [isApproveSuccess, toast, refetchAllowance]);

    // Handle errors
    React.useEffect(() => {
        if (isJoinError) {
            toast({
                title: "Join Battle Transaction Failed",
                description: "The blockchain transaction failed. Please try again.",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    }, [isJoinError, toast]);

    React.useEffect(() => {
        if (isApproveError) {
            toast({
                title: "Approval Transaction Failed",
                description: "The approval transaction failed. Please try again.",
                variant: "destructive",
            });
        }
    }, [isApproveError, toast]);

    const onSubmit = (data: JoinBattleFormData) => {
        if (needsApproval) {
            handleApprove(battle.stakeAmount);
        } else {
            handleJoinBattle(data);
        }
    };

    return (
        <div className="space-y-6">
            {/* Battle Info */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-white">Battle Details</h3>
                    <div className="flex items-center space-x-2">
                        <Swords className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-slate-400">#{battle.id}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-400">Cryptocurrency:</span>
                        <div className="text-white font-medium">{battle.cryptocurrency.toUpperCase()}</div>
                    </div>
                    <div>
                        <span className="text-slate-400">Timeframe:</span>
                        <div className="text-white font-medium">{battle.timeframe}</div>
                    </div>
                    <div>
                        <span className="text-slate-400">Stake Amount:</span>
                        <div className="text-white font-medium">{battle.stakeAmount} NTIQ</div>
                    </div>
                    <div>
                        <span className="text-slate-400">Challenger:</span>
                        <div className="text-white font-medium">{battle.challengerUsername}</div>
                    </div>
                </div>
                {battle.currentPrice && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                        <span className="text-slate-400 text-sm">Current Price:</span>
                        <div className="text-green-400 font-medium">${battle.currentPrice.toFixed(2)}</div>
                    </div>
                )}
            </div>

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
                    {/* Challenger's Prediction Display */}
                    <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-300 font-medium">Challenger's Prediction</span>
                        </div>
                        <div className="text-white text-lg font-semibold">
                            ${battle.challengerPrediction.toFixed(2)}
                        </div>
                        <p className="text-blue-200 text-sm mt-1">
                            {battle.challengerUsername}'s price prediction for {battle.cryptocurrency.toUpperCase()}
                        </p>
                    </div>

                    {/* Your Prediction */}
                    <FormField
                        control={form.control}
                        name="challengedPrediction"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-300 flex items-center">
                                    Your Price Prediction (USD)
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="ml-1 h-4 w-4 text-slate-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-700 text-white border-slate-600">
                                                Enter the price you predict the cryptocurrency will reach.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder={`e.g., ${battle.currentPrice ? (battle.currentPrice * 1.05).toFixed(2) : '52000.00'}`}
                                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                                {battle.currentPrice && (
                                    <div className="text-sm text-slate-400">
                                        Current price: ${battle.currentPrice.toFixed(2)}
                                    </div>
                                )}
                            </FormItem>
                        )}
                    />

                    {/* Stake Amount Display */}
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <Target className="w-4 h-4 text-green-400" />
                            <span className="text-green-300 font-medium">Stake Amount</span>
                        </div>
                        <div className="text-white text-xl font-semibold">
                            {battle.stakeAmount} NTIQ
                        </div>
                        <p className="text-slate-400 text-sm mt-1">
                            This amount will be staked when you join the battle
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || isApprovePending || isJoinPending || isApproveConfirming || isJoinConfirming}
                        className="w-full gradient-bg hover:opacity-90 text-white font-semibold py-3 px-6 transition-all transform hover:scale-105"
                    >
                        {isSubmitting || isApprovePending || isJoinPending || isApproveConfirming || isJoinConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {needsApproval ? "Approving..." : "Joining Battle..."}
                            </>
                        ) : needsApproval ? (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve NTIQ Tokens
                            </>
                        ) : (
                            <>
                                <Swords className="mr-2 h-4 w-4" />
                                Join Battle
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
