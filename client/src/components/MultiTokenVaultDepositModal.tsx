import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useReadContract } from 'wagmi';
import { parseEther, parseUnits, formatUnits } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, CheckCircle2, Coins, AlertTriangle } from 'lucide-react';

const MULTI_TOKEN_VAULT_ADDRESS = (import.meta.env.VITE_MULTI_TOKEN_VAULT_ADDRESS || '0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2') as `0x${string}`;
const POLYGON_AMOY_CHAIN_ID = 80002;
const NTIQ_PRICE_USD = 0.01; // 1 NTIQ = $0.01 USD

// Token configurations with fallback addresses
const TOKENS = {
    POL: {
        name: 'POL',
        symbol: 'POL',
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        decimals: 18,
        min: 0.01,
        max: 1000,
        icon: '💎',
        color: 'purple'
    },
    WETH: {
        name: 'Wrapped ETH',
        symbol: 'WETH',
        address: (import.meta.env.VITE_AMOY_WETH_ADDRESS || '0x52eF3d68BaB452a294342DC3e5f464d7f610f72E') as `0x${string}`,
        decimals: 18,
        min: 0.001,
        max: 10,
        icon: '💠',
        color: 'blue'
    },
    USDC: {
        name: 'USD Coin',
        symbol: 'USDC',
        address: (import.meta.env.VITE_AMOY_USDC_ADDRESS || '0x8B0180f2101c8260d49339abfEe87927412494B4') as `0x${string}`,
        decimals: 6,
        min: 1,
        max: 10000,
        icon: '💵',
        color: 'green'
    },
    LINK: {
        name: 'Chainlink',
        symbol: 'LINK',
        address: (import.meta.env.VITE_AMOY_LINK_ADDRESS || '0x0fd9E8d3Af1aAeE056eb9e902c3A762a667b1904') as `0x${string}`,
        decimals: 18,
        min: 0.1,
        max: 1000,
        icon: '🔗',
        color: 'indigo'
    }
} as const;

// ABIs
const VAULT_POL_ABI = [
    {
        name: 'depositPOL',
        type: 'function',
        stateMutability: 'payable',
        inputs: [],
        outputs: [],
    },
] as const;

const VAULT_TOKEN_ABI = [
    {
        name: 'depositToken',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [],
    },
] as const;

const ERC20_ABI = [
    {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const;

interface MultiTokenVaultDepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function MultiTokenVaultDepositModal({ isOpen, onClose, onSuccess }: MultiTokenVaultDepositModalProps) {
    const { address, chain } = useAccount();
    const { toast } = useToast();

    const [selectedToken, setSelectedToken] = useState<keyof typeof TOKENS>('POL');
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'input' | 'approve' | 'deposit' | 'success'>('input');
    const [tokenPriceUSD, setTokenPriceUSD] = useState<number>(0);
    const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);

    const token = TOKENS[selectedToken];

    // Debug logging
    useEffect(() => {
        if (isOpen) {
            console.log('🔍 [MULTI-TOKEN-MODAL] Token Selected:', token.symbol);
            console.log('🔍 [MULTI-TOKEN-MODAL] Token Address:', token.address);
            console.log('🔍 [MULTI-TOKEN-MODAL] User Address:', address);
            console.log('🔍 [MULTI-TOKEN-MODAL] Is Native?:', token.symbol === 'POL');
        }
    }, [selectedToken, token, address, isOpen]);

    // Read wallet balance (POL)
    const { data: polBalance, isLoading: isPolBalanceLoading } = useBalance({
        address: address,
        chainId: POLYGON_AMOY_CHAIN_ID,
        query: {
            enabled: !!address && isOpen && token.symbol === 'POL',
            refetchInterval: 3000, // Refetch every 3 seconds
        }
    });

    // Read token balance (ERC-20)
    const { data: tokenBalance, isLoading: isTokenBalanceLoading, refetch: refetchTokenBalance } = useReadContract({
        address: (token.symbol !== 'POL' && token.address) ? token.address : undefined,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        chainId: POLYGON_AMOY_CHAIN_ID,
        query: {
            enabled: !!address && !!token.address && isOpen && token.symbol !== 'POL',
            refetchInterval: 3000, // Refetch every 3 seconds
        }
    });

    // Debug balance results
    useEffect(() => {
        if (isOpen && token.symbol !== 'POL') {
            console.log('🔍 [BALANCE] Token:', token.symbol);
            console.log('🔍 [BALANCE] Loading:', isTokenBalanceLoading);
            console.log('🔍 [BALANCE] Balance:', tokenBalance);
        }
    }, [tokenBalance, isTokenBalanceLoading, token.symbol, isOpen]);

    // Read allowance for ERC-20 tokens
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address && MULTI_TOKEN_VAULT_ADDRESS ? [address, MULTI_TOKEN_VAULT_ADDRESS] : undefined,
        chainId: POLYGON_AMOY_CHAIN_ID,
        query: {
            enabled: !!address && !!MULTI_TOKEN_VAULT_ADDRESS && token.symbol !== 'POL'
        }
    });

    // Approve transaction (ERC-20)
    const {
        data: approveHash,
        writeContract: writeApprove,
        isPending: isApprovePending,
        error: approveError,
        reset: resetApprove
    } = useWriteContract({
        mutation: {
            retry: 3,
            retryDelay: 2000,
            onSuccess: (hash) => {
                console.log('✅ [MULTI-TOKEN-MODAL] Approval transaction sent:', hash);
                toast({
                    title: "Approval Sent",
                    description: "Please wait for approval confirmation.",
                });
            },
            onError: (error) => {
                console.error('❌ [MULTI-TOKEN-MODAL] Approval failed:', error);
                toast({
                    title: "Approval Failed",
                    description: error.message || "Failed to approve token.",
                    variant: "destructive",
                });
            },
        },
    });

    const {
        isLoading: isApproveConfirming,
        isSuccess: isApproveConfirmed
    } = useWaitForTransactionReceipt({
        hash: approveHash,
    });

    // Deposit transaction
    const {
        data: depositHash,
        writeContract: writeDeposit,
        isPending: isDepositPending,
        error: depositError,
        reset: resetDeposit
    } = useWriteContract({
        mutation: {
            onSuccess: (hash) => {
                console.log('✅ [MULTI-TOKEN-MODAL] Deposit transaction sent:', hash);
                toast({
                    title: "Deposit Sent",
                    description: "Please wait for deposit confirmation.",
                });
            },
            onError: (error) => {
                console.error('❌ [MULTI-TOKEN-MODAL] Deposit failed:', error);
                console.error('❌ [MULTI-TOKEN-MODAL] Error details:', {
                    name: error.name,
                    message: error.message,
                    cause: error.cause
                });
                toast({
                    title: "Deposit Failed",
                    description: error.message || "Failed to deposit. Please check your balance and approval.",
                    variant: "destructive",
                });
            },
        },
    });

    const {
        isLoading: isDepositConfirming,
        isSuccess: isDepositConfirmed
    } = useWaitForTransactionReceipt({
        hash: depositHash,
    });

    // Fetch token price from backend
    useEffect(() => {
        const fetchTokenPrice = async () => {
            if (!isOpen || !token) return;

            setIsPriceLoading(true);
            try {
                // Map token symbols to CoinGecko IDs
                const coinGeckoIds: Record<string, string> = {
                    'POL': 'matic-network',
                    'WETH': 'weth',
                    'USDC': 'usd-coin',
                    'LINK': 'chainlink'
                };

                const coinId = coinGeckoIds[token.symbol];

                // For stablecoins, use fixed price
                if (token.symbol === 'USDC') {
                    setTokenPriceUSD(1.0);
                    setIsPriceLoading(false);
                    return;
                }

                // Fetch from backend API
                const response = await fetch(`/api/crypto/price/${coinId}`);
                if (response.ok) {
                    const data = await response.json();
                    setTokenPriceUSD(data.price || 0);
                } else {
                    // Fallback prices if API fails
                    const fallbackPrices: Record<string, number> = {
                        'POL': 0.50,
                        'WETH': 2000,
                        'USDC': 1.0,
                        'LINK': 15
                    };
                    setTokenPriceUSD(fallbackPrices[token.symbol] || 0);
                    console.warn('⚠️ Using fallback price for', token.symbol);
                }
            } catch (error) {
                console.error('Failed to fetch token price:', error);
                // Use fallback prices
                const fallbackPrices: Record<string, number> = {
                    'POL': 0.50,
                    'WETH': 2000,
                    'USDC': 1.0,
                    'LINK': 15
                };
                setTokenPriceUSD(fallbackPrices[token.symbol] || 0);
            } finally {
                setIsPriceLoading(false);
            }
        };

        fetchTokenPrice();
    }, [selectedToken, token, isOpen]);

    // Calculate NTIQ amount based on USD value
    // Formula: (token_amount * token_price_usd) / NTIQ_PRICE_USD
    const calculateNTIQAmount = (): number => {
        if (!amount || !tokenPriceUSD) return 0;

        const tokenAmount = parseFloat(amount);
        const usdValue = tokenAmount * tokenPriceUSD;
        const ntiqAmount = usdValue / NTIQ_PRICE_USD;

        return Math.floor(ntiqAmount); // Round down to nearest integer
    };

    const ntiqAmount = calculateNTIQAmount();
    const usdValue = amount && tokenPriceUSD ? parseFloat(amount) * tokenPriceUSD : 0;

    // Get balance display
    const getBalanceDisplay = () => {
        if (token.symbol === 'POL') {
            if (isPolBalanceLoading) return 'Loading...';
            if (!polBalance) return '0.00';
            const balance = formatUnits(polBalance.value, 18);
            return parseFloat(balance).toFixed(4);
        }

        if (isTokenBalanceLoading) return 'Loading...';
        if (!tokenBalance) return '0.00';
        const balance = formatUnits(tokenBalance as bigint, token.decimals);
        return parseFloat(balance).toFixed(token.decimals === 6 ? 2 : 4);
    };

    // Refetch balances when token changes
    useEffect(() => {
        if (token.symbol !== 'POL' && isOpen) {
            refetchTokenBalance();
        }
    }, [selectedToken, token.symbol, isOpen, refetchTokenBalance]);

    // Handle approve for ERC-20 tokens
    const handleApprove = async () => {
        if (!MULTI_TOKEN_VAULT_ADDRESS || !address) {
            toast({
                title: "Configuration Error",
                description: "Vault contract not configured.",
                variant: "destructive",
            });
            return;
        }

        const amountValue = parseFloat(amount);
        if (!amountValue || amountValue <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid amount.",
                variant: "destructive",
            });
            return;
        }

        try {
            console.log('🔐 [MULTI-TOKEN-MODAL] Starting approval...');
            console.log('🔐 [MULTI-TOKEN-MODAL] Token:', token.symbol);
            console.log('🔐 [MULTI-TOKEN-MODAL] Token address:', token.address);
            console.log('🔐 [MULTI-TOKEN-MODAL] Amount:', amount);
            console.log('🔐 [MULTI-TOKEN-MODAL] Vault address:', MULTI_TOKEN_VAULT_ADDRESS);

            const amountInWei = parseUnits(amount, token.decimals);
            console.log('🔐 [MULTI-TOKEN-MODAL] Amount in wei:', amountInWei.toString());

            writeApprove({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [MULTI_TOKEN_VAULT_ADDRESS, amountInWei],
                gas: 100000n, // Set explicit gas limit
            });
        } catch (error: any) {
            console.error('❌ [MULTI-TOKEN-MODAL] Approve error:', error);
            toast({
                title: "Approval Failed",
                description: error.message || "Failed to approve token.",
                variant: "destructive",
            });
        }
    };

    // Handle deposit
    const handleDeposit = async () => {
        if (!MULTI_TOKEN_VAULT_ADDRESS || !address) {
            toast({
                title: "Configuration Error",
                description: "Vault contract not configured.",
                variant: "destructive",
            });
            return;
        }

        if (chain?.id !== POLYGON_AMOY_CHAIN_ID) {
            toast({
                title: "Wrong Network",
                description: "Please switch to Polygon Amoy testnet.",
                variant: "destructive",
            });
            return;
        }

        const amountValue = parseFloat(amount);
        if (!amountValue || amountValue < token.min || amountValue > token.max) {
            toast({
                title: "Invalid Amount",
                description: `Amount must be between ${token.min} and ${token.max} ${token.symbol}.`,
                variant: "destructive",
            });
            return;
        }

        // For ERC-20 tokens, check if approval is needed first
        if (token.symbol !== 'POL') {
            const needsApprovalCheck = needsApproval();
            if (needsApprovalCheck) {
                toast({
                    title: "Approval Required",
                    description: `You need to approve ${token.symbol} spending first. Click "Approve ${token.symbol}" button.`,
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            console.log('🚀 [MULTI-TOKEN-MODAL] Starting deposit...');
            console.log('🚀 [MULTI-TOKEN-MODAL] Token:', token.symbol);
            console.log('🚀 [MULTI-TOKEN-MODAL] Amount:', amount);
            console.log('🚀 [MULTI-TOKEN-MODAL] Contract:', MULTI_TOKEN_VAULT_ADDRESS);

            if (token.symbol === 'POL') {
                // Direct POL deposit
                console.log('🚀 [MULTI-TOKEN-MODAL] Depositing POL...');
                writeDeposit({
                    address: MULTI_TOKEN_VAULT_ADDRESS,
                    abi: VAULT_POL_ABI,
                    functionName: 'depositPOL',
                    value: parseEther(amount),
                });
            } else {
                // ERC-20 token deposit
                const amountInWei = parseUnits(amount, token.decimals);
                console.log('🚀 [MULTI-TOKEN-MODAL] Depositing token...');
                console.log('🚀 [MULTI-TOKEN-MODAL] Token address:', token.address);
                console.log('🚀 [MULTI-TOKEN-MODAL] Amount in wei:', amountInWei.toString());

                writeDeposit({
                    address: MULTI_TOKEN_VAULT_ADDRESS,
                    abi: VAULT_TOKEN_ABI,
                    functionName: 'depositToken',
                    args: [token.address, amountInWei],
                });
            }
        } catch (error: any) {
            console.error('❌ [MULTI-TOKEN-MODAL] Deposit error:', error);
            toast({
                title: "Deposit Failed",
                description: error.message || "Failed to deposit. Please check your balance and try again.",
                variant: "destructive",
            });
        }
    };

    // Check if approval is needed
    const needsApproval = () => {
        if (token.symbol === 'POL') return false;
        if (!allowance || !amount) return true;

        const amountInWei = parseUnits(amount, token.decimals);
        return (allowance as bigint) < amountInWei;
    };

    // Handle approve confirmation
    useEffect(() => {
        if (isApproveConfirmed && approveHash) {
            toast({
                title: "Approval Successful! ✅",
                description: `${token.symbol} approved. Now proceed to deposit.`,
            });
            setStep('deposit');
            refetchAllowance();
            resetApprove();
        }
    }, [isApproveConfirmed, approveHash, token.symbol, toast, resetApprove, refetchAllowance]);

    // Handle deposit confirmation
    useEffect(() => {
        if (isDepositConfirmed && depositHash) {
            const finalNtiqAmount = calculateNTIQAmount();
            const finalUsdValue = parseFloat(amount) * tokenPriceUSD;

            toast({
                title: "Deposit Successful! 🎉",
                description: `${amount} ${token.symbol} ($${finalUsdValue.toFixed(2)}) deposited. You will receive ${finalNtiqAmount.toLocaleString()} NTIQ.`,
            });
            setStep('success');
            resetDeposit();

            if (onSuccess) {
                onSuccess();
            }

            setTimeout(() => {
                handleClose();
            }, 3000);
        }
    }, [isDepositConfirmed, depositHash, amount, token.symbol, tokenPriceUSD, toast, onSuccess, resetDeposit]);

    // Handle errors
    useEffect(() => {
        if (approveError) {
            toast({
                title: "Approval Failed",
                description: approveError.message || "Failed to approve token.",
                variant: "destructive",
            });
        }
    }, [approveError, toast]);

    useEffect(() => {
        if (depositError) {
            toast({
                title: "Deposit Failed",
                description: depositError.message || "Failed to deposit.",
                variant: "destructive",
            });
        }
    }, [depositError, toast]);

    const handleClose = () => {
        if (!isApprovePending && !isApproveConfirming && !isDepositPending && !isDepositConfirming) {
            setAmount('');
            setStep('input');
            resetApprove();
            resetDeposit();
            onClose();
        }
    };

    const handleTokenChange = (value: string) => {
        setSelectedToken(value as keyof typeof TOKENS);
        setAmount('');
        setStep('input');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Coins className="w-6 h-6" />
                        Multi-Token Deposit
                    </DialogTitle>
                </DialogHeader>

                {step !== 'success' ? (
                    <div className="space-y-4 py-4">
                        {/* Token Selector */}
                        <div className="space-y-2">
                            <Label>Select Token</Label>
                            <Select value={selectedToken} onValueChange={handleTokenChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TOKENS).map(([key, t]) => (
                                        <SelectItem key={key} value={key}>
                                            <div className="flex items-center gap-2">
                                                <span>{t.icon}</span>
                                                <span className="font-medium">{t.symbol}</span>
                                                <span className="text-xs text-gray-500">({t.name})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Balance Display */}
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Your Balance:</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                {(isPolBalanceLoading || isTokenBalanceLoading) && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                {getBalanceDisplay()} {token.symbol}
                            </p>
                            {!address && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                    Connect wallet to view balance
                                </p>
                            )}
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder={token.min.toString()}
                                step={token.min.toString()}
                                min={token.min}
                                max={token.max}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isApprovePending || isApproveConfirming || isDepositPending || isDepositConfirming}
                            />
                            <p className="text-sm text-gray-500">
                                Min: {token.min} {token.symbol} • Max: {token.max.toLocaleString()} {token.symbol}
                            </p>
                        </div>

                        {/* Token Price Display */}
                        {tokenPriceUSD > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Current {token.symbol} Price:
                                    </span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {isPriceLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin inline" />
                                        ) : (
                                            `$${tokenPriceUSD.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 6
                                            })}`
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* USD Value & NTIQ Conversion */}
                        {amount && tokenPriceUSD > 0 && (
                            <div className="space-y-3">
                                {/* USD Value */}
                                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        USD Value:
                                    </p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                        ${usdValue.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {amount} {token.symbol} × ${tokenPriceUSD.toFixed(2)}
                                    </p>
                                </div>

                                {/* NTIQ Conversion */}
                                <div className={`bg-${token.color}-50 dark:bg-${token.color}-950 p-4 rounded-lg border border-${token.color}-200 dark:border-${token.color}-800`}>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        You will receive:
                                    </p>
                                    <p className={`text-2xl font-bold text-${token.color}-600 dark:text-${token.color}-400`}>
                                        {ntiqAmount.toLocaleString()} NTIQ
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ${usdValue.toFixed(2)} ÷ $0.01 per NTIQ
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Warning for ERC-20 */}
                        {token.symbol !== 'POL' && step === 'input' && needsApproval() && (
                            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg text-xs flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-yellow-800 dark:text-yellow-200">
                                    <strong>Two-step process:</strong> First approve {token.symbol}, then deposit.
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {token.symbol === 'POL' || !needsApproval() ? (
                            <Button
                                onClick={handleDeposit}
                                disabled={!amount || isDepositPending || isDepositConfirming}
                                className="w-full"
                                size="lg"
                            >
                                {isDepositPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Confirm in Wallet...
                                    </>
                                ) : isDepositConfirming ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Confirming...
                                    </>
                                ) : (
                                    `Deposit ${token.symbol}`
                                )}
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                {step === 'input' && (
                                    <Button
                                        onClick={handleApprove}
                                        disabled={!amount || isApprovePending || isApproveConfirming}
                                        className="w-full"
                                        size="lg"
                                        variant="outline"
                                    >
                                        {isApprovePending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Confirm in Wallet...
                                            </>
                                        ) : isApproveConfirming ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Approving...
                                            </>
                                        ) : (
                                            `1. Approve ${token.symbol}`
                                        )}
                                    </Button>
                                )}

                                {step === 'deposit' && (
                                    <Button
                                        onClick={handleDeposit}
                                        disabled={!amount || isDepositPending || isDepositConfirming}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isDepositPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Confirm in Wallet...
                                            </>
                                        ) : isDepositConfirming ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Confirming...
                                            </>
                                        ) : (
                                            `2. Deposit ${token.symbol}`
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Transaction Links */}
                        {approveHash && (
                            <a
                                href={`https://amoy.polygonscan.com/tx/${approveHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                                View Approval on Polygonscan
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                        {depositHash && (
                            <a
                                href={`https://amoy.polygonscan.com/tx/${depositHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                                View Deposit on Polygonscan
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-green-600 mb-2">
                            Deposit Confirmed! 🎉
                        </h3>
                        <div className="space-y-2 mb-4">
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {amount} {token.symbol}
                                <span className="text-sm text-gray-500 ml-2">
                                    (${usdValue.toFixed(2)})
                                </span>
                            </p>
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <div className="h-px w-12 bg-gray-300"></div>
                                <span>→</span>
                                <div className="h-px w-12 bg-gray-300"></div>
                            </div>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {ntiqAmount.toLocaleString()} NTIQ
                            </p>
                        </div>
                        {depositHash && (
                            <a
                                href={`https://amoy.polygonscan.com/tx/${depositHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                                View Transaction
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

