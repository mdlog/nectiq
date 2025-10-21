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
    const [isCreatingBattle, setIsCreatingBattle] = useState(false);
    const [currentTxType, setCurrentTxType] = useState<'approve' | 'battle' | null>(null);

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

    // Wagmi hooks for blockchain interaction - Single hook for all contract calls
    const { writeContract, data: txHash, isPending: isTxPending, error: txError } = useWriteContract();

    const { isLoading: isTxConfirming, isSuccess: isTxSuccess, isError: isTxError } = useWaitForTransactionReceipt({
        hash: txHash,
        query: { enabled: !!txHash },
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

    const currentStakeAmount = form.watch('stakeAmount') || 0;

    // Check if approval is needed - only true if allowance is 0 or undefined
    // Once approved, user doesn't need to approve again for the same contract
    const needsApproval = !allowanceWei || allowance === 0;

    // Debug logging for allowance detection
    React.useEffect(() => {
        console.log('🔍 [BATTLE-APPROVAL] Allowance Debug:', {
            allowance,
            currentStakeAmount,
            needsApproval,
            allowanceWei: allowanceWei?.toString(),
            address,
            chainId: chain?.id,
            ntiqTokenAddress: CONTRACTS.NTIQ_TOKEN,
            battleEscrowAddress: CONTRACTS.BATTLE_ESCROW,
            ntiqAbi: CONTRACTS.ABIS?.NTIQToken ? 'Available' : 'Missing',
            erc20Abi: CONTRACTS.ABIS?.ERC20 ? 'Available' : 'Missing',
            hasAllowanceWei: !!allowanceWei,
            allowanceIsZero: allowance === 0,
            stakeAmountGreaterThanAllowance: currentStakeAmount > allowance
        });

        // Force show Step 1 if allowance is 0 or undefined
        if (!allowanceWei || allowance === 0) {
            console.log('⚠️ [BATTLE-APPROVAL] Forcing Step 1 - No allowance detected');
        }
    }, [allowance, currentStakeAmount, needsApproval, allowanceWei, address, chain?.id]);

    const handleApprove = async (stakeAmount: number) => {
        if (!address || !chain) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to create battles.",
                variant: "destructive",
            });
            return;
        }

        // Pre-transaction validation
        if (!CONTRACTS.NTIQ_TOKEN || !CONTRACTS.BATTLE_ESCROW) {
            console.error('❌ [BATTLE-BLOCKCHAIN] Contract addresses not configured');
            toast({
                title: "Configuration Error",
                description: "Contract addresses not properly configured. Please refresh the page.",
                variant: "destructive",
            });
            return;
        }

        if (!CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS.NTIQToken.length === 0) {
            console.error('❌ [BATTLE-BLOCKCHAIN] ABI not available');
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
                const stakeAmountWei = parseEther(stakeAmount.toString());

                console.log(`🟢 [BATTLE-BLOCKCHAIN] Attempt ${retryCount + 1}/${maxRetries} - Calling writeApproveContract...`);
                console.log('🟢 [BATTLE-BLOCKCHAIN] Contract details:', {
                    ntiqToken: CONTRACTS.NTIQ_TOKEN,
                    battleEscrow: CONTRACTS.BATTLE_ESCROW,
                    stakeAmountWei: stakeAmountWei.toString(),
                    chainId: chain.id,
                    abiExists: !!CONTRACTS.ABIS?.NTIQToken,
                    attempt: retryCount + 1
                });

                setCurrentTxType('approve');
                await writeContract({
                    address: CONTRACTS.NTIQ_TOKEN,
                    abi: CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20,
                    functionName: 'approve',
                    args: [CONTRACTS.BATTLE_ESCROW, stakeAmountWei],
                    chainId: chain.id,
                    gas: 200000n, // Further increase gas limit
                    gasPrice: undefined, // Let MetaMask estimate
                });
                console.log('✅ [BATTLE-BLOCKCHAIN] Approval transaction submitted successfully');
                return; // Success, exit retry loop

            } catch (error: any) {
                lastError = error;
                retryCount++;

                console.error(`❌ [BATTLE-BLOCKCHAIN] Attempt ${retryCount} failed:`, error);
                console.error('❌ [BATTLE-BLOCKCHAIN] Error details:', {
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
                    console.log(`🔄 [BATTLE-BLOCKCHAIN] Retrying in ${retryCount * 2} seconds...`);
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
        console.error('❌ [BATTLE-BLOCKCHAIN] All approval attempts failed:', lastError);

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
                console.error('❌ [BATTLE-BLOCKCHAIN] Insufficient allowance detected:', {
                    currentAllowance,
                    requiredAmount: data.stakeAmount,
                    difference: data.stakeAmount - currentAllowance
                });
                throw new Error(`Insufficient allowance. You have ${currentAllowance.toFixed(2)} NTIQ allowance but need ${data.stakeAmount} NTIQ. Please approve NTIQ spending first.`);
            }

            console.log('✅ [BATTLE-BLOCKCHAIN] Allowance check passed:', {
                currentAllowance,
                requiredAmount: data.stakeAmount,
                allowanceSufficient: currentAllowance >= data.stakeAmount
            });

            // Generate battle ID using timestamp (blockchain-first approach)
            const battleId = ethers.id(`battle_${Date.now()}_${Math.random()}`);

            console.log('⚔️ [BATTLE-BLOCKCHAIN] Creating battle:', {
                blockchainId: battleId,
                stakeAmount: data.stakeAmount,
                stakeAmountWei: stakeAmountWei.toString(),
                challenger: address,
                chainId: chain.id,
                contractAddress: CONTRACTS.BATTLE_ESCROW,
                abi: CONTRACTS.ABIS?.BATTLE_ESCROW ? 'Available' : 'Missing',
                ntiqBalance: currentBalance,
                allowance: currentAllowance,
                needsApproval: currentAllowance < data.stakeAmount,
                battleIdHex: battleId,
                stakeAmountWeiHex: stakeAmountWei.toString()
            });

            // Additional validation before contract call
            if (!CONTRACTS.BATTLE_ESCROW) {
                throw new Error('Battle escrow contract address not configured');
            }
            if (!CONTRACTS.ABIS?.BATTLE_ESCROW && !ABIS?.BATTLE_ESCROW) {
                throw new Error('Battle escrow contract ABI not configured');
            }
            if (!battleId || battleId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
                throw new Error('Invalid battle ID generated');
            }
            if (!stakeAmountWei || stakeAmountWei === 0n) {
                throw new Error('Invalid stake amount');
            }
            if (!chain || chain.id !== 80002) {
                console.error('❌ [BATTLE-BLOCKCHAIN] Wrong network detected:', {
                    currentChainId: chain?.id,
                    expectedChainId: 80002,
                    chainName: chain?.name
                });
                throw new Error(`Wrong network. Please switch to Polygon Amoy (Chain ID: 80002). Current chain: ${chain?.id || 'Unknown'}`);
            }
            if (!address) {
                throw new Error('Wallet address not available');
            }

            console.log('🚀 [BATTLE-BLOCKCHAIN] About to call writeBattleContract with:', {
                address: CONTRACTS.BATTLE_ESCROW,
                abiAvailable: !!(CONTRACTS.ABIS?.BATTLE_ESCROW || ABIS?.BATTLE_ESCROW),
                functionName: 'createBattle',
                args: [battleId, stakeAmountWei],
                chainId: chain.id,
                gas: 300000n,
                battleIdType: typeof battleId,
                stakeAmountWeiType: typeof stakeAmountWei
            });

            console.log('🔗 [BATTLE-BLOCKCHAIN] MetaMask popup should appear now for battle creation...');
            console.log('🔗 [BATTLE-BLOCKCHAIN] Contract call parameters:', {
                address: CONTRACTS.BATTLE_ESCROW,
                abiAvailable: !!(CONTRACTS.ABIS?.BATTLE_ESCROW || ABIS?.BATTLE_ESCROW),
                functionName: 'createBattle',
                args: [battleId, stakeAmountWei],
                chainId: chain.id,
                gas: 300000n,
                battleIdType: typeof battleId,
                stakeAmountWeiType: typeof stakeAmountWei
            });

            try {
                setCurrentTxType('battle');
                await writeContract({
                    address: CONTRACTS.BATTLE_ESCROW,
                    abi: CONTRACTS.ABIS?.BATTLE_ESCROW || ABIS?.BATTLE_ESCROW,
                    functionName: 'createBattle',
                    args: [battleId, stakeAmountWei],
                    chainId: chain.id,
                    gas: 300000n, // Optimize gas limit for create battle
                });

                console.log('✅ [BATTLE-BLOCKCHAIN] Battle contract call initiated successfully');
            } catch (contractError) {
                console.error('❌ [BATTLE-BLOCKCHAIN] writeContract failed:', contractError);
                throw contractError;
            }

            // Wait for transaction to be confirmed
            if (txHash) {
                console.log('⏳ [BATTLE-BLOCKCHAIN] Waiting for transaction confirmation...');
                // The useWaitForTransactionReceipt hook will handle the confirmation
                // We'll update the database in the useEffect when isTxSuccess becomes true
            }
        } catch (error: any) {
            console.error('❌ [BATTLE-BLOCKCHAIN] Battle creation failed:', error);
            console.error('❌ [BATTLE-BLOCKCHAIN] Error data:', error.data);
            console.error('❌ [BATTLE-BLOCKCHAIN] Error code:', error.code);
            console.error('❌ [BATTLE-BLOCKCHAIN] Error message:', error.message);
            console.error('❌ [BATTLE-BLOCKCHAIN] Error shortMessage:', error.shortMessage);
            console.error('❌ [BATTLE-BLOCKCHAIN] Full error object:', JSON.stringify(error, null, 2));


            let errorMessage = "Battle creation failed. Please try again.";
            if (error.message?.includes("insufficient funds")) {
                errorMessage = "Insufficient NTIQ tokens for gas fees. Please add more NTIQ to your wallet.";
            } else if (error.message?.includes("user rejected")) {
                errorMessage = "Transaction was cancelled in MetaMask.";
            } else if (error.message?.includes("Internal JSON-RPC error")) {
                errorMessage = "MetaMask RPC error. Please try: 1) Refresh the page, 2) Clear MetaMask cache, 3) Try again.";
            }

            toast({
                title: "Battle Creation Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle successful transaction
    React.useEffect(() => {
        if (isTxSuccess && txHash && currentTxType === 'approve') {
            toast({
                title: "✅ NTIQ Approval Successful",
                description: "You can now create battles. Click 'Step 2: Create Battle' to proceed.",
            });
            refetchAllowance();
            setCurrentTxType(null);
        }
    }, [isTxSuccess, txHash, currentTxType, toast, refetchAllowance]);

    // Handle successful battle transaction
    React.useEffect(() => {
        if (isTxSuccess && txHash && currentTxType === 'battle' && !isCreatingBattle && !hasSubmittedToDB) {
            console.log('✅ [BATTLE-BLOCKCHAIN] Transaction confirmed:', txHash);

            // Create battle in database with confirmed blockchain transaction
            const createBattle = async () => {
                // Prevent duplicate submissions
                if (isCreatingBattle || hasSubmittedToDB) {
                    console.log('⚠️ [BATTLE-BLOCKCHAIN] Already creating battle or already submitted, skipping...');
                    return;
                }

                setIsCreatingBattle(true);
                setHasSubmittedToDB(true);

                try {
                    console.log('🔄 [BATTLE-BLOCKCHAIN] Creating battle with confirmed blockchain transaction...');

                    const formData = form.getValues();
                    const createResponse = await apiRequest('/api/battles/blockchain', {
                        method: 'POST',
                        body: JSON.stringify({
                            cryptocurrency: formData.cryptocurrency,
                            timeframe: formData.timeframe,
                            challengerPrediction: parseFloat(formData.challengerPrediction),
                            stakeAmount: parseFloat(formData.stakeAmount.toString()),
                            isPublic: formData.isPublic,
                            blockchainBattleHash: txHash,
                            blockchainStatus: 'confirmed'
                        }),
                    });

                    if (createResponse.ok) {
                        const battleData = await createResponse.json();
                        console.log('✅ [BATTLE-BLOCKCHAIN] Battle created in database:', battleData);

                        toast({
                            title: "Battle Created Successfully!",
                            description: "Your battle has been recorded and staked on the blockchain.",
                        });

                        // Refresh data
                        await queryClient.invalidateQueries({ queryKey: ["/api/battles/live"] });
                        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                        await queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
                        await queryClient.invalidateQueries({ queryKey: ["/api/battles/stats"] });

                        refetchNtiqBalance();
                        refetchAllowance();

                        // Call success callback
                        if (onSuccess) {
                            onSuccess();
                        }
                    } else {
                        const errorData = await createResponse.json();
                        throw new Error(errorData.message || 'Failed to create battle');
                    }
                } catch (error: any) {
                    console.error('❌ [BATTLE-BLOCKCHAIN] Failed to create battle:', error);

                    toast({
                        title: "Database Creation Failed",
                        description: "Blockchain transaction succeeded but battle creation failed. Please contact support.",
                        variant: "destructive",
                    });
                } finally {
                    setIsCreatingBattle(false);
                }
            };

            createBattle();
        }
    }, [isTxSuccess, txHash, currentTxType, isCreatingBattle, hasSubmittedToDB, form, toast, queryClient, onSuccess, refetchNtiqBalance, refetchAllowance]);

    // Handle errors
    React.useEffect(() => {
        if (isTxError && currentTxType) {
            const errorTitle = currentTxType === 'approve' ? "Approval Transaction Failed" : "Battle Transaction Failed";
            const errorDescription = currentTxType === 'approve'
                ? "The approval transaction failed. Please try again."
                : "The battle transaction failed. Please try again.";

            toast({
                title: errorTitle,
                description: errorDescription,
                variant: "destructive",
            });
            setCurrentTxType(null);
        }
    }, [isTxError, currentTxType, toast]);

    const onSubmit = (data: BattleFormData) => {
        console.log('🔍 [BATTLE-FORM] onSubmit called:', {
            needsApproval,
            data,
            allowance,
            currentStakeAmount: data.stakeAmount
        });

        if (needsApproval) {
            console.log('🔍 [BATTLE-FORM] Calling handleApprove...');
            handleApprove(data.stakeAmount);
        } else {
            console.log('🔍 [BATTLE-FORM] Calling handleBattleSubmit...');
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
                                    ? 'Approve the Battle Escrow contract to spend your NTIQ tokens'
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
                                <h3 className="text-white font-medium">Step 2: Create Battle</h3>
                                <p className="text-slate-400 text-sm">Ready to create your battle</p>
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
                        You need to approve the Battle Escrow contract to spend your NTIQ tokens first.
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
                        disabled={isSubmitting || isTxPending || isTxConfirming}
                        className={`w-full font-semibold py-3 px-6 transition-all transform hover:scale-105 ${needsApproval
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'gradient-bg hover:opacity-90 text-white'
                            }`}
                    >
                        {isSubmitting || isTxPending || isTxConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {needsApproval ? "Approving NTIQ..." : "Creating Battle..."}
                            </>
                        ) : needsApproval ? (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Step 1: Approve NTIQ Tokens
                            </>
                        ) : (
                            <>
                                <Swords className="mr-2 h-4 w-4" />
                                Step 2: Create Battle
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
