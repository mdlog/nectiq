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

        // Pre-transaction validation
        if (!CONTRACTS.NTIQ_TOKEN || !CONTRACTS.ENHANCED_PARLAY_STAKING) {
            console.error('❌ [PARLAY-BLOCKCHAIN] Contract addresses not configured');
            toast({
                title: "Configuration Error",
                description: "Contract addresses not properly configured. Please refresh the page.",
                variant: "destructive",
            });
            return;
        }

        if (!CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS.NTIQToken.length === 0) {
            console.error('❌ [PARLAY-BLOCKCHAIN] ABI not available');
            toast({
                title: "Contract Error",
                description: "Contract ABI not available. Please refresh the page.",
                variant: "destructive",
            });
            return;
        }

        // Retry mechanism for RPC errors
        let retryCount = 0;
        const maxRetries = 3;
        let lastError: any = null;

        while (retryCount < maxRetries) {
            try {
                console.log(`🟢 [PARLAY-BLOCKCHAIN] Attempt ${retryCount + 1}/${maxRetries} - Calling writeApproveContract...`);
                console.log('🟢 [PARLAY-BLOCKCHAIN] Contract details:', {
                    ntiqToken: CONTRACTS.NTIQ_TOKEN,
                    parlayStaking: CONTRACTS.ENHANCED_PARLAY_STAKING,
                    stakeAmountWei: stakeAmountWei.toString(),
                    chainId: chain.id,
                    abiExists: !!CONTRACTS.ABIS?.NTIQToken,
                    attempt: retryCount + 1
                });

                await writeApproveContract({
                    address: CONTRACTS.NTIQ_TOKEN,
                    abi: CONTRACTS.ABIS?.NTIQToken || [],
                    functionName: 'approve',
                    args: [CONTRACTS.ENHANCED_PARLAY_STAKING, stakeAmountWei],
                    chainId: chain.id,
                    gas: 200000n, // Further increase gas limit
                    gasPrice: undefined, // Let MetaMask estimate
                });
                
                console.log('✅ [PARLAY-BLOCKCHAIN] Approval transaction submitted successfully');
                return; // Success, exit retry loop
                
            } catch (error: any) {
                lastError = error;
                retryCount++;
                
                console.error(`❌ [PARLAY-BLOCKCHAIN] Attempt ${retryCount} failed:`, error);
                console.error('❌ [PARLAY-BLOCKCHAIN] Error details:', {
                    message: error.message,
                    shortMessage: error.shortMessage,
                    code: error.code,
                    data: error.data,
                    attempt: retryCount
                });

                // Check if it's a retryable error
                const isRetryableError = error.message?.includes("Internal JSON-RPC error") ||
                                       error.message?.includes("-32603") ||
                                       error.message?.includes("network") ||
                                       error.message?.includes("timeout");

                if (retryCount < maxRetries && isRetryableError) {
                    console.log(`🔄 [PARLAY-BLOCKCHAIN] Retrying in ${retryCount * 2} seconds...`);
                    toast({
                        title: "Retrying Transaction",
                        description: `Attempt ${retryCount + 1}/${maxRetries}. Please wait...`,
                        variant: "default",
                    });
                    
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
                } else {
                    break; // Exit retry loop
                }
            }
        }

        // All retries failed
        console.error('❌ [PARLAY-BLOCKCHAIN] All approval attempts failed:', lastError);
        
        let errorMessage = "Approval transaction failed after multiple attempts.";
        if (lastError?.message?.includes("insufficient funds")) {
            errorMessage = "Insufficient POL tokens for gas fees. Please add more POL to your wallet.";
        } else if (lastError?.message?.includes("user rejected")) {
            errorMessage = "Transaction was cancelled in MetaMask.";
        } else if (lastError?.message?.includes("Internal JSON-RPC error") || lastError?.message?.includes("-32603")) {
            errorMessage = "MetaMask RPC error. Please try: 1) Refresh the page, 2) Clear MetaMask cache, 3) Try again.";
        } else if (lastError?.message?.includes("gas required exceeds allowance")) {
            errorMessage = "Gas limit too low. Please try again with higher gas limit.";
        } else if (lastError?.message?.includes("network")) {
            errorMessage = "Network error. Please check your internet connection and try again.";
        }

        toast({
            title: "Approval Failed",
            description: errorMessage,
            variant: "destructive",
        });
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

            // Generate parlay ID using timestamp (blockchain-first approach)
            const parlayId = ethers.id(`parlay_${Date.now()}_${Math.random()}`);

            // Calculate duration (use max duration from cards)
            const durationMap = { '1h': 3600, '6h': 21600, '24h': 86400, '7d': 604800 };
            const maxDuration = Math.max(...parlayCards.map(card => durationMap[card.duration as keyof typeof durationMap] || 3600));

            console.log('🎯 [PARLAY-BLOCKCHAIN] Creating parlay:', {
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

            console.log('✅ [PARLAY-BLOCKCHAIN] Parlay contract call initiated successfully');
        } catch (error: any) {
            console.error('❌ [PARLAY-BLOCKCHAIN] Failed to create parlay:', error);
            
            // Try to get more specific error message
            let errorMessage = "Blockchain transaction succeeded but parlay creation failed. Please contact support.";
            if (parlayResponse && !parlayResponse.ok) {
                try {
                    const errorData = await parlayResponse.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                }
            }
            
            toast({
                title: "Parlay Creation Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle parlay success - Create parlay in database after blockchain confirmation
    React.useEffect(() => {
        if (isParlaySuccess && parlayTxHash && !hasSubmittedToDB) {
            console.log('✅ [PARLAY-BLOCKCHAIN] Transaction confirmed:', parlayTxHash);

            // Create parlay in database with confirmed blockchain transaction
            const createParlay = async () => {
                try {
                    console.log('🔄 [PARLAY-BLOCKCHAIN] Creating parlay with confirmed blockchain transaction...');
                    setHasSubmittedToDB(true); // Prevent duplicate submissions

                    const coins = parlayCards.map(card => ({
                        cryptocurrency: card.cryptocurrency,
                        prediction: card.prediction,
                        duration: card.duration,
                        startPrice: card.startPrice
                    }));

                    const createResponse = await apiRequest('/api/parlay/blockchain', {
                        method: 'POST',
                        body: JSON.stringify({
                            stakeAmount: parseFloat(watchedStakeAmount || '0'),
                            coins,
                            blockchainTxHash: parlayTxHash,
                            blockchainStatus: 'confirmed'
                        }),
                    });

                    if (createResponse.ok) {
                        const parlayData = await createResponse.json();
                        console.log('✅ [PARLAY-BLOCKCHAIN] Parlay created in database:', parlayData);

                        toast({
                            title: "Parlay Submitted Successfully!",
                            description: "Your parlay has been recorded and staked on the blockchain.",
                        });

                        // Refresh data
                        await queryClient.invalidateQueries({ queryKey: ["/api/parlay/user"] });
                        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                        await queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });

                        // Call success callback
                        if (onSuccess) {
                            onSuccess();
                        }
                        if (onClose) {
                            onClose();
                        }
                    } else {
                        const errorData = await createResponse.json();
                        
                        // Handle duplicate parlay case
                        if (createResponse.status === 409) {
                            console.log('⚠️ [PARLAY-BLOCKCHAIN] Parlay already exists:', errorData.parlayId);
                            toast({
                                title: "Parlay Already Created",
                                description: "This parlay has already been created successfully.",
                            });
                            
                            // Still call success callbacks since parlay exists
                            if (onSuccess) {
                                onSuccess();
                            }
                            if (onClose) {
                                onClose();
                            }
                            return;
                        }
                        
                        throw new Error(errorData.message || 'Failed to create parlay');
                    }
                } catch (error: any) {
                    console.error('❌ [PARLAY-BLOCKCHAIN] Failed to create parlay:', error);
                    
                    // Reset the flag so user can try again
                    setHasSubmittedToDB(false);
                    
                    // Show more specific error message
                    const errorMessage = error.message || 'Unknown error occurred';
                    
                    toast({
                        title: "Database Creation Failed",
                        description: `Blockchain transaction succeeded but parlay creation failed: ${errorMessage}`,
                        variant: "destructive",
                    });
                }
            };

            createParlay();
        }
    }, [isParlaySuccess, parlayTxHash, parlayCards, watchedStakeAmount, toast, queryClient, onSuccess, onClose, hasSubmittedToDB]);

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
            {/* Simplified Wallet & Status */}
            {!address ? (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-center">
                        Please connect your wallet to create parlay predictions
                    </p>
                </div>
            ) : (
                <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-medium">Wallet</span>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </span>
                            {needsApproval && (
                                <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                                    Needs Approval
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-white font-medium">
                                {parseFloat(ntiqBalanceFormatted).toFixed(2)} NTIQ
                            </div>
                            <div className="text-xs text-gray-400">Available</div>
                        </div>
                    </div>
                </div>
            )}


            {/* Simplified Stake Amount */}
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                <div className="space-y-2">
                    <label htmlFor="stakeAmount" className="text-sm font-medium text-gray-300">
                        Stake Amount (NTIQ)
                    </label>
                    <Input
                        id="stakeAmount"
                        type="number"
                        placeholder="50"
                        min="50"
                        step="1"
                        {...form.register('stakeAmount')}
                        className="text-lg bg-gray-700 border-gray-600"
                    />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 250, 500].map((amount) => (
                        <Button
                            key={amount}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => form.setValue('stakeAmount', amount.toString())}
                            className={`${watchedStakeAmount === amount.toString() ? 'bg-primary text-primary-foreground' : 'bg-gray-700 border-gray-600'} text-xs`}
                        >
                            {amount}
                        </Button>
                    ))}
                </div>

                {/* Potential Win Display */}
                {watchedStakeAmount && parseFloat(watchedStakeAmount) >= 50 && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-green-300 font-medium">Potential Win</span>
                            <span className="text-green-400 font-bold text-lg">
                                {potentialWin.toFixed(0)} NTIQ
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Simplified Action Button */}
            <Button
                type="button"
                onClick={needsApproval ? () => {
                    console.log('🔵 [PARLAY-BLOCKCHAIN] Button clicked, calling handleApprove');
                    handleApprove();
                } : handleParlaySubmit}
                disabled={isSubmitting || isApprovePending || isParlayPending || !address}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
            >
                {isApprovePending || isParlayPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isApprovePending ? 'Approving...' : 'Creating...'}
                    </>
                ) : needsApproval ? (
                    <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve NTIQ Spending
                    </>
                ) : (
                    <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Create TrendRide
                    </>
                )}
            </Button>
        </div>
    );
}
