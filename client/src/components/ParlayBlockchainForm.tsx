import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CONTRACTS } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Coins, Clock, DollarSign, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface ParlayCard {
    id: string;
    cryptocurrency: string;
    prediction: number;
    duration: string;
    startPrice: number;
}

interface ParlayBlockchainFormProps {
    parlayCards: ParlayCard[];
    stakeAmount: string;
    setStakeAmount: (amount: string) => void;
    onClose: () => void;
    onSuccess: () => void;
    availableCryptos?: any[];
    currentPrices?: Record<string, number>;
}

const parlayFormSchema = z.object({
    stakeAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 50, {
        message: "Minimum stake is 50 NTIQ",
    }),
});

type ParlayFormData = z.infer<typeof parlayFormSchema>;

export function ParlayBlockchainForm({
    parlayCards,
    stakeAmount,
    setStakeAmount,
    onClose,
    onSuccess,
    availableCryptos = [],
    currentPrices = {}
}: ParlayBlockchainFormProps) {
    const { address, chain } = useAccount();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmittedToDB, setHasSubmittedToDB] = useState(false);

    const form = useForm<ParlayFormData>({
        resolver: zodResolver(parlayFormSchema),
        defaultValues: {
            stakeAmount: stakeAmount || '50',
        },
    });

    // Watch form values
    const watchedStakeAmount = form.watch('stakeAmount');

    // Update parent component when form changes
    useEffect(() => {
        setStakeAmount(watchedStakeAmount);
    }, [watchedStakeAmount, setStakeAmount]);

    // Get NTIQ token balance
    const { data: ntiqBalance, refetch: refetchNtiqBalance } = useReadContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS?.NTIQToken || [],
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Get NTIQ allowance for ParlayStaking contract
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.NTIQ_TOKEN,
        abi: CONTRACTS.ABIS?.NTIQToken || [],
        functionName: 'allowance',
        args: address ? [address, CONTRACTS.ENHANCED_PARLAY_STAKING] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Write contract hooks
    const { writeContract: writeApproveContract, data: approveTxHash } = useWriteContract();
    const { writeContract: writeParlayContract, data: parlayTxHash } = useWriteContract();

    // Wait for transaction receipts
    const { isLoading: isApprovePending, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveTxHash,
    });

    const { isLoading: isParlayPending, isSuccess: isParlaySuccess } = useWaitForTransactionReceipt({
        hash: parlayTxHash,
    });

    // Calculate total multiplier
    const totalMultiplier = React.useMemo(() => {
        let multiplier = 1;
        const durationMap = { '1h': 1.2, '6h': 1.5, '24h': 2.0, '7d': 3.0 };

        for (const card of parlayCards) {
            const coinMultiplier = 1.5 * (durationMap[card.duration as keyof typeof durationMap] || 1.2);
            multiplier *= coinMultiplier;
        }

        return multiplier;
    }, [parlayCards]);

    // Calculate potential win
    const potentialWin = parseFloat(watchedStakeAmount || '0') * totalMultiplier;

    // Check if approval is needed - only true if allowance is 0 or undefined
    // Once approved, user doesn't need to approve again for the same contract
    const stakeAmountWei = watchedStakeAmount ? parseEther(watchedStakeAmount) : 0n;
    const needsApproval = !allowance || allowance === 0n;

    // Format allowance for display
    const allowanceFormatted = allowance ? formatEther(allowance) : '0';

    // Debug logging
    console.log('🔍 [PARLAY-BLOCKCHAIN] Approval Check:', {
        stakeAmount: watchedStakeAmount,
        stakeAmountWei: stakeAmountWei.toString(),
        allowance: allowance?.toString(),
        allowanceFormatted: allowanceFormatted,
        needsApproval,
        contractAddress: CONTRACTS.ENHANCED_PARLAY_STAKING,
        buttonState: {
            isSubmitting,
            isApprovePending,
            isParlayPending,
            hasAddress: !!address,
            disabled: isSubmitting || isApprovePending || isParlayPending || !address
        }
    });

    const handleApprove = async () => {
        console.log('🔵 [PARLAY-BLOCKCHAIN] Approve button clicked');
        console.log('🔵 [PARLAY-BLOCKCHAIN] Approval params:', {
            address,
            chain: chain?.id,
            stakeAmountWei: stakeAmountWei.toString(),
            contractAddress: CONTRACTS.NTIQ_TOKEN,
            spenderAddress: CONTRACTS.ENHANCED_PARLAY_STAKING,
            abi: CONTRACTS.ABIS?.NTIQToken
        });

        if (!address || !chain) {
            console.log('❌ [PARLAY-BLOCKCHAIN] Wallet not connected');
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to approve NTIQ tokens.",
                variant: "destructive",
            });
            return;
        }

        try {
            console.log('🟢 [PARLAY-BLOCKCHAIN] Calling writeApproveContract...');
            await writeApproveContract({
                address: CONTRACTS.NTIQ_TOKEN,
                abi: CONTRACTS.ABIS?.NTIQToken || [],
                functionName: 'approve',
                args: [CONTRACTS.ENHANCED_PARLAY_STAKING, stakeAmountWei],
                chainId: chain.id,
                gas: 100000n, // Optimize gas limit for approve
            });
            console.log('✅ [PARLAY-BLOCKCHAIN] Approval transaction submitted');
        } catch (error: any) {
            console.error('❌ [PARLAY-BLOCKCHAIN] Approval failed:', error);
            toast({
                title: "Approval Failed",
                description: error.shortMessage || error.message,
                variant: "destructive",
            });
        }
    };

    const handleParlaySubmit = async () => {
        if (!address || !chain) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to create parlay.",
                variant: "destructive",
            });
            return;
        }

        // Validate inputs
        if (!watchedStakeAmount || parseFloat(watchedStakeAmount) < 50) {
            toast({
                title: "Invalid Stake",
                description: "Minimum stake is 50 NTIQ",
                variant: "destructive",
            });
            return;
        }

        if (parlayCards.length < 2) {
            toast({
                title: "Not Enough Coins",
                description: "Add at least 2 coins to create a parlay",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const stakeAmountWei = parseEther(watchedStakeAmount);

            // First create parlay in database to get ID
            const coins = parlayCards.map(card => ({
                cryptocurrency: card.cryptocurrency,
                prediction: card.prediction,
                duration: card.duration,
                startPrice: card.startPrice
            }));

            const parlayResponse = await apiRequest('/api/parlay/create', {
                method: 'POST',
                body: JSON.stringify({
                    stakeAmount: watchedStakeAmount,
                    coins
                })
            });

            if (!parlayResponse || !parlayResponse.id) {
                throw new Error('Failed to create parlay in database');
            }

            // Generate parlay ID using database ID (consistent with backend)
            const parlayId = ethers.id(`parlay_${parlayResponse.id}`);

            // Calculate duration (use max duration from cards)
            const durationMap = { '1h': 3600, '6h': 21600, '24h': 86400, '7d': 604800 };
            const maxDuration = Math.max(...parlayCards.map(card => durationMap[card.duration as keyof typeof durationMap] || 3600));

            console.log('🎯 [PARLAY-BLOCKCHAIN] Creating parlay:', {
                dbId: parlayResponse.id,
                blockchainId: parlayId,
                stakeAmount: watchedStakeAmount,
                stakeAmountWei: stakeAmountWei.toString(),
                coinCount: parlayCards.length,
                duration: maxDuration,
                user: address,
                chainId: chain.id
            });

            await writeParlayContract({
                address: CONTRACTS.ENHANCED_PARLAY_STAKING,
                abi: CONTRACTS.ABIS?.ENHANCED_PARLAY_STAKING || [],
                functionName: 'lockParlayStake',
                args: [parlayId, stakeAmountWei, parlayCards.length as any, maxDuration],
                chainId: chain.id,
                gas: 400000n, // Optimize gas limit for parlay creation
            });
        } catch (error: any) {
            console.error('❌ [PARLAY-BLOCKCHAIN] Parlay creation failed:', error);
            toast({
                title: "Parlay Creation Failed",
                description: error.shortMessage || error.message,
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    // Handle successful parlay transaction
    React.useEffect(() => {
        if (isParlaySuccess && parlayTxHash && !hasSubmittedToDB) {
            console.log('✅ [PARLAY-BLOCKCHAIN] Parlay transaction confirmed:', parlayTxHash);

            // Update parlay in database with blockchain transaction hash
            const updateParlayInDB = async () => {
                try {
                    const coins = parlayCards.map(card => ({
                        cryptocurrency: card.cryptocurrency,
                        prediction: card.prediction,
                        duration: card.duration,
                        startPrice: card.startPrice
                    }));

                    const response = await apiRequest('/api/parlay/blockchain', {
                        method: 'POST',
                        body: JSON.stringify({
                            stakeAmount: parseFloat(watchedStakeAmount || '0'),
                            coins,
                            blockchainTxHash: parlayTxHash,
                        }),
                    });

                    console.log('✅ [PARLAY-BLOCKCHAIN] Database submission successful:', response);

                    setHasSubmittedToDB(true);

                    toast({
                        title: "Parlay Created Successfully!",
                        description: "Your parlay prediction has been created and staked on blockchain.",
                    });

                    // Refresh queries
                    await queryClient.invalidateQueries({ queryKey: ['/api/parlay/user'] });
                    await refetchNtiqBalance();
                    await refetchAllowance();

                    onSuccess();
                    onClose();
                } catch (error: any) {
                    console.error('❌ [PARLAY-BLOCKCHAIN] Database submission failed:', error);
                    toast({
                        title: "Database Error",
                        description: "Parlay was staked on blockchain but failed to save in database.",
                        variant: "destructive",
                    });
                }
            };

            updateParlayInDB();
        }
    }, [isParlaySuccess, parlayTxHash, hasSubmittedToDB]);

    // Handle approval success
    React.useEffect(() => {
        if (isApproveSuccess) {
            toast({
                title: "Approval Successful!",
                description: "NTIQ tokens approved for parlay staking.",
            });
            refetchAllowance();
        }
    }, [isApproveSuccess, refetchAllowance]);

    const ntiqBalanceFormatted = ntiqBalance ? formatEther(ntiqBalance) : '0';

    return (
        <div className="space-y-6">
            {/* Wallet Connection Status */}
            {!address ? (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <CardContent className="pt-6">
                        <p className="text-red-600 dark:text-red-400 text-center">
                            Please connect your wallet to create parlay predictions
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    Wallet Connected
                                </p>
                                <p className="text-green-500 dark:text-green-300 text-sm">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    {parseFloat(ntiqBalanceFormatted).toFixed(2)} NTIQ
                                </p>
                                <p className="text-green-500 dark:text-green-300 text-sm">Available Balance</p>
                                <p className="text-blue-500 dark:text-blue-300 text-xs">
                                    Allowance: {parseFloat(allowanceFormatted).toFixed(2)} NTIQ
                                </p>
                                <p className="text-orange-500 dark:text-orange-300 text-xs">
                                    Needs Approval: {needsApproval ? 'Yes' : 'No'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                    ? 'Approve the Parlay Staking contract to spend your NTIQ tokens'
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
                                <h3 className="text-white font-medium">Step 2: Create Parlay</h3>
                                <p className="text-slate-400 text-sm">Create your parlay prediction</p>
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
                    <p className="text-orange-200 text-sm mt-2">
                        You need to approve NTIQ spending before creating a parlay. Click "Approve NTIQ" to proceed.
                    </p>
                </div>
            )}


            {/* Stake Amount */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Stake Amount
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="stakeAmount" className="text-sm font-medium">
                            NTIQ Amount
                        </label>
                        <Input
                            id="stakeAmount"
                            type="number"
                            placeholder="50"
                            min="50"
                            step="1"
                            {...form.register('stakeAmount')}
                            className="text-lg"
                        />
                        <p className="text-sm text-muted-foreground">
                            Minimum stake: 50 NTIQ
                        </p>
                    </div>

                    {/* Stake Presets */}
                    <div className="grid grid-cols-4 gap-2">
                        {[50, 100, 250, 500].map((amount) => (
                            <Button
                                key={amount}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => form.setValue('stakeAmount', amount.toString())}
                                className={watchedStakeAmount === amount.toString() ? 'bg-primary text-primary-foreground' : ''}
                            >
                                {amount}
                            </Button>
                        ))}
                    </div>

                    {/* Potential Win */}
                    {watchedStakeAmount && parseFloat(watchedStakeAmount) >= 50 && (
                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                                <span className="text-green-700 dark:text-green-300 font-medium">
                                    Potential Win
                                </span>
                                <span className="text-green-700 dark:text-green-300 font-bold text-lg">
                                    {potentialWin.toFixed(2)} NTIQ
                                </span>
                            </div>
                            <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                                {watchedStakeAmount} NTIQ × {totalMultiplier.toFixed(2)}x multiplier
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isSubmitting || isApprovePending || isParlayPending}
                >
                    Cancel
                </Button>

                {needsApproval ? (
                    <Button
                        type="button"
                        onClick={() => {
                            console.log('🔵 [PARLAY-BLOCKCHAIN] Button clicked, calling handleApprove');
                            handleApprove();
                        }}
                        disabled={isSubmitting || isApprovePending || isParlayPending || !address}
                        className="flex-1"
                    >
                        {isApprovePending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Approving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Step 1: Approve NTIQ Tokens
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={handleParlaySubmit}
                        disabled={isSubmitting || isApprovePending || isParlayPending || !address}
                        className="flex-1"
                    >
                        {isSubmitting || isParlayPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating Parlay...
                            </>
                        ) : (
                            <>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Step 2: Create Parlay
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Status Messages */}
            {isApprovePending && (
                <div className="text-center text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    Approving NTIQ tokens...
                </div>
            )}

            {isParlayPending && (
                <div className="text-center text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    Creating parlay on blockchain...
                </div>
            )}
        </div>
    );
}
