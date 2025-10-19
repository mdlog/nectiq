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

        try {
            const stakeAmountWei = parseEther(stakeAmount.toString());
            
            console.log('🟢 [BATTLE-BLOCKCHAIN] Calling writeApproveContract...');
            console.log('🟢 [BATTLE-BLOCKCHAIN] Contract details:', {
                ntiqToken: CONTRACTS.NTIQ_TOKEN,
                battleEscrow: CONTRACTS.BATTLE_ESCROW,
                stakeAmountWei: stakeAmountWei.toString(),
                chainId: chain.id,
                abiExists: !!CONTRACTS.ABIS?.NTIQToken
            });

            await writeApproveContract({
                address: CONTRACTS.NTIQ_TOKEN,
                abi: CONTRACTS.ABIS?.NTIQToken || CONTRACTS.ABIS?.ERC20 || ABIS?.NTIQToken || ABIS?.ERC20,
                functionName: 'approve',
                args: [CONTRACTS.BATTLE_ESCROW, stakeAmountWei],
                chainId: chain.id,
                gas: 150000n, // Increase gas limit for approve
            });
            console.log('✅ [BATTLE-BLOCKCHAIN] Approval transaction submitted');
        } catch (error: any) {
            console.error('❌ [BATTLE-BLOCKCHAIN] Approval failed:', error);
            console.error('❌ [BATTLE-BLOCKCHAIN] Error details:', {
                message: error.message,
                shortMessage: error.shortMessage,
                code: error.code,
                data: error.data
            });
            
            let errorMessage = "Approval transaction failed. Please try again.";
            if (error.message?.includes("insufficient funds")) {
                errorMessage = "Insufficient POL tokens for gas fees. Please add more POL to your wallet.";
            } else if (error.message?.includes("user rejected")) {
                errorMessage = "Transaction was cancelled in MetaMask.";
            } else if (error.message?.includes("gas required exceeds allowance")) {
                errorMessage = "Gas limit too low. Please try again.";
            }

            toast({
                title: "Approval Failed",
                description: errorMessage,
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

            // Generate battle ID using timestamp (blockchain-first approach)
            const battleId = ethers.id(`battle_${Date.now()}_${address}`);

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

            await writeBattleContract({
                address: CONTRACTS.BATTLE_ESCROW,
                abi: CONTRACTS.ABIS?.BATTLE_ESCROW || ABIS?.BATTLE_ESCROW,
                functionName: 'createBattle',
                args: [battleId, stakeAmountWei],
                chainId: chain.id,
                gas: 300000n, // Optimize gas limit for create battle
            });

            console.log('✅ [BATTLE-BLOCKCHAIN] Battle contract call initiated successfully');

            // Wait for transaction to be confirmed
            if (battleTxHash) {
                console.log('⏳ [BATTLE-BLOCKCHAIN] Waiting for transaction confirmation...');
                // The useWaitForTransactionReceipt hook will handle the confirmation
                // We'll update the database in the useEffect when isBattleSuccess becomes true
            }
        } catch (error: any) {
            console.error('❌ [BATTLE-BLOCKCHAIN] Battle creation failed:', error);
            console.error('❌ [BATTLE-BLOCKCHAIN] Error data:', error.data);
            console.error('❌ [BATTLE-BLOCKCHAIN] Error code:', error.code);
            console.error('❌ [BATTLE-BLOCKCHAIN] Error message:', error.message);
            console.error('❌ [BATTLE-BLOCKCHAIN] Error shortMessage:', error.shortMessage);
            console.error('❌ [BATTLE-BLOCKCHAIN] Full error object:', JSON.stringify(error, null, 2));

            // If blockchain transaction failed, clean up the database battle
            if (createdBattleId) {
                console.log('🧹 [BATTLE-BLOCKCHAIN] Cleaning up database battle due to blockchain failure...');
                try {
                    await apiRequest(`/api/battles/${createdBattleId}`, {
                        method: 'DELETE'
                    });
                    console.log('✅ [BATTLE-BLOCKCHAIN] Database battle cleaned up successfully');
                } catch (cleanupError) {
                    console.error('❌ [BATTLE-BLOCKCHAIN] Failed to clean up database battle:', cleanupError);
                }
            }

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
            } else if (error.message?.includes("execution reverted") && error.message?.includes("unknown custom error")) {
                // Check if it's an InsufficientAllowance error (0xfb8f41b2)
                if (error.data && error.data.startsWith('0xfb8f41b2')) {
                    errorTitle = "Approval Required";
                    errorDescription = "You need to approve NTIQ spending first. Please click 'Approve NTIQ' button before creating battle.";
                } else {
                    errorTitle = "Contract Error";
                    errorDescription = "The battle contract operation failed. Please check your wallet connection and try again.";
                }
            } else if (error.message?.includes("Wrong network")) {
                errorTitle = "Wrong Network";
                errorDescription = error.message;
            } else if (error.message?.includes("Battle escrow contract address not configured")) {
                errorTitle = "Contract Configuration Error";
                errorDescription = "Battle escrow contract address is not configured. Please contact support.";
            } else if (error.message?.includes("Battle escrow contract ABI not configured")) {
                errorTitle = "Contract Configuration Error";
                errorDescription = "Battle escrow contract ABI is not configured. Please contact support.";
            } else if (error.message?.includes("Invalid battle ID generated")) {
                errorTitle = "Battle ID Error";
                errorDescription = "Failed to generate valid battle ID. Please try again.";
            } else if (error.message?.includes("Invalid stake amount")) {
                errorTitle = "Invalid Stake Amount";
                errorDescription = "Stake amount is invalid. Please check your input.";
            } else if (error.message?.includes("Wallet address not available")) {
                errorTitle = "Wallet Error";
                errorDescription = "Wallet address is not available. Please reconnect your wallet.";
            } else if (error.message?.includes("Insufficient balance")) {
                errorTitle = "Insufficient Balance";
                errorDescription = "You don't have enough NTIQ tokens for this battle";
            } else if (error.message?.includes("Approval Required") || error.message?.includes("Insufficient allowance")) {
                errorTitle = "Approval Required";
                errorDescription = error.message || "Please approve NTIQ spending first by clicking 'Approve NTIQ' button";
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
        if (isBattleSuccess && battleTxHash && !hasSubmittedToDB && createdBattleId) {
            setHasSubmittedToDB(true); // Prevent multiple submissions

            // Update battle in database with blockchain transaction hash
            const updateBattleInDB = async () => {
                try {
                    console.log('🔄 [BATTLE-BLOCKCHAIN] Updating battle in database with blockchain hash...');
                    console.log('🔄 [BATTLE-BLOCKCHAIN] Battle ID:', createdBattleId);
                    console.log('🔄 [BATTLE-BLOCKCHAIN] Transaction Hash:', battleTxHash);

                    const updateResponse = await apiRequest(`/api/battles/${createdBattleId}/blockchain`, {
                        method: "PUT",
                        body: JSON.stringify({
                            blockchainBattleHash: battleTxHash,
                            blockchainStatus: 'confirmed'
                        }),
                    });

                    if (updateResponse.ok) {
                        const updateData = await updateResponse.json();
                        console.log('✅ [BATTLE-BLOCKCHAIN] Database updated:', updateData);

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
                title: "✅ NTIQ Approval Successful",
                description: "You can now create battles. Click 'Step 2: Create Battle' to proceed.",
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
                        disabled={isSubmitting || isApprovePending || isBattlePending || isApproveConfirming || isBattleConfirming}
                        className={`w-full font-semibold py-3 px-6 transition-all transform hover:scale-105 ${needsApproval
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'gradient-bg hover:opacity-90 text-white'
                            }`}
                    >
                        {isSubmitting || isApprovePending || isBattlePending || isApproveConfirming || isBattleConfirming ? (
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
