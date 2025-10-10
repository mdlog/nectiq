import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance } from 'wagmi';
import { parseEther, parseUnits, formatUnits } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, CheckCircle2, AlertCircle, ArrowUpCircle, Coins } from 'lucide-react';

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

// CoinGecko ID mapping for price fetching
const COINGECKO_IDS: { [key: string]: string } = {
    'POL': 'matic-network',
    'WETH': 'weth',
    'USDC': 'usd-coin',
    'LINK': 'chainlink'
};

// Vault ABI for withdrawals
const VAULT_POL_ABI = [
    {
        name: 'withdrawPOL',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'amount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'signature', type: 'bytes' }
        ],
        outputs: [],
    },
] as const;

const VAULT_TOKEN_ABI = [
    {
        name: 'withdrawToken',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'signature', type: 'bytes' }
        ],
        outputs: [],
    },
] as const;

// ABI for reading vault balances
const VAULT_BALANCE_ABI = [
    {
        name: 'getUserBalance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'user', type: 'address' },
            { name: 'token', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const;

interface MultiTokenVaultWithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    userNTIQBalance: number; // User's NTIQ balance from database
}

export function MultiTokenVaultWithdrawalModal({
    isOpen,
    onClose,
    onSuccess,
    userNTIQBalance
}: MultiTokenVaultWithdrawalModalProps) {
    const { address, chain } = useAccount();
    const { toast } = useToast();

    const [selectedToken, setSelectedToken] = useState<keyof typeof TOKENS>('POL');
    const [ntiqAmount, setNtiqAmount] = useState('');
    const [tokenPriceUSD, setTokenPriceUSD] = useState(0);
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [isRequestingSignature, setIsRequestingSignature] = useState(false);

    const token = TOKENS[selectedToken];

    // Fetch token price from backend
    useEffect(() => {
        const fetchTokenPrice = async () => {
            if (!selectedToken) return;

            setIsPriceLoading(true);
            try {
                const coinId = COINGECKO_IDS[selectedToken];
                const response = await fetch(`/api/crypto/price/${coinId}`);
                const data = await response.json();

                if (data.price) {
                    setTokenPriceUSD(data.price);
                } else {
                    // Fallback prices
                    const fallbackPrices: { [key: string]: number } = {
                        'POL': 0.50,
                        'WETH': 3000,
                        'USDC': 1.00,
                        'LINK': 15.00
                    };
                    setTokenPriceUSD(fallbackPrices[selectedToken] || 1);
                }
            } catch (error) {
                console.error('Failed to fetch token price:', error);
                // Use fallback prices
                const fallbackPrices: { [key: string]: number } = {
                    'POL': 0.50,
                    'WETH': 3000,
                    'USDC': 1.00,
                    'LINK': 15.00
                };
                setTokenPriceUSD(fallbackPrices[selectedToken] || 1);
            } finally {
                setIsPriceLoading(false);
            }
        };

        fetchTokenPrice();
    }, [selectedToken]);

    // Calculate token amount from NTIQ
    const calculateTokenAmount = (ntiqValue: number): number => {
        if (!ntiqValue || !tokenPriceUSD) return 0;
        const usdValue = ntiqValue * NTIQ_PRICE_USD; // Convert NTIQ to USD
        const tokenAmount = usdValue / tokenPriceUSD; // Convert USD to token
        return tokenAmount;
    };

    const tokenAmount = ntiqAmount ? calculateTokenAmount(parseFloat(ntiqAmount)) : 0;
    const usdValue = ntiqAmount ? parseFloat(ntiqAmount) * NTIQ_PRICE_USD : 0;

    // Read vault balance for selected token
    const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
        address: MULTI_TOKEN_VAULT_ADDRESS,
        abi: VAULT_BALANCE_ABI,
        functionName: 'getUserBalance',
        args: address && token.address ? [address, token.address] : undefined,
        query: {
            enabled: !!address && !!token.address && isOpen
        }
    });

    // Withdrawal transaction
    const {
        data: withdrawHash,
        writeContract: writeWithdraw,
        isPending: isWithdrawPending,
        error: withdrawError,
        reset: resetWithdraw
    } = useWriteContract({
        mutation: {
            onSuccess: (hash) => {
                console.log('✅ [MULTI-TOKEN-WITHDRAWAL] Withdrawal transaction sent:', hash);
                toast({
                    title: "Withdrawal Sent",
                    description: "Please wait for withdrawal confirmation.",
                });
            },
            onError: (error) => {
                console.error('❌ [MULTI-TOKEN-WITHDRAWAL] Withdrawal failed:', error);
                toast({
                    title: "Withdrawal Failed",
                    description: error.message || "Failed to withdraw. Please try again.",
                    variant: "destructive",
                });
            },
        },
    });

    // Wait for transaction confirmation
    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed
    } = useWaitForTransactionReceipt({
        hash: withdrawHash,
    });

    // Handle withdrawal confirmation
    useEffect(() => {
        if (isConfirmed && withdrawHash) {
            toast({
                title: "Withdrawal Confirmed! ✅",
                description: `${tokenAmount.toFixed(6)} ${token.symbol} has been withdrawn to your wallet.`,
            });

            setNtiqAmount('');
            refetchVaultBalance();

            if (onSuccess) {
                onSuccess();
            }
        }
    }, [isConfirmed, withdrawHash, tokenAmount, token.symbol, onSuccess, toast, refetchVaultBalance]);

    // Handle withdrawal
    const handleWithdraw = async () => {
        if (!MULTI_TOKEN_VAULT_ADDRESS || !address) {
            toast({
                title: "Configuration Error",
                description: "Vault contract or wallet not configured.",
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

        const ntiqValue = parseFloat(ntiqAmount);
        if (!ntiqValue || ntiqValue <= 0 || ntiqValue < 10) {
            toast({
                title: "Invalid Amount",
                description: "Minimum withdrawal is 10 NTIQ.",
                variant: "destructive",
            });
            return;
        }

        if (ntiqValue > userNTIQBalance) {
            toast({
                title: "Insufficient Balance",
                description: `You only have ${userNTIQBalance} NTIQ available.`,
                variant: "destructive",
            });
            return;
        }

        // Request signature from backend
        setIsRequestingSignature(true);
        try {
            console.log('🔐 [MULTI-TOKEN-WITHDRAWAL] Requesting signature from backend...');
            const response = await fetch('/api/vault/request-withdrawal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userAddress: address,
                    tokenSymbol: token.symbol,
                    tokenAddress: token.address,
                    ntiqAmount: ntiqValue,
                    tokenAmount: tokenAmount,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to get withdrawal signature');
            }

            const { signature, nonce, amount } = await response.json();
            console.log('✅ [MULTI-TOKEN-WITHDRAWAL] Signature received from backend');
            console.log('🔍 [MULTI-TOKEN-WITHDRAWAL] Nonce:', nonce);
            console.log('🔍 [MULTI-TOKEN-WITHDRAWAL] Amount:', amount);

            setIsRequestingSignature(false);

            // Execute withdrawal on contract
            if (token.symbol === 'POL') {
                console.log('🚀 [MULTI-TOKEN-WITHDRAWAL] Withdrawing POL...');
                writeWithdraw({
                    address: MULTI_TOKEN_VAULT_ADDRESS,
                    abi: VAULT_POL_ABI,
                    functionName: 'withdrawPOL',
                    args: [BigInt(amount), BigInt(nonce), signature as `0x${string}`],
                });
            } else {
                console.log('🚀 [MULTI-TOKEN-WITHDRAWAL] Withdrawing', token.symbol, '...');
                writeWithdraw({
                    address: MULTI_TOKEN_VAULT_ADDRESS,
                    abi: VAULT_TOKEN_ABI,
                    functionName: 'withdrawToken',
                    args: [token.address, BigInt(amount), BigInt(nonce), signature as `0x${string}`],
                });
            }
        } catch (error: any) {
            console.error('❌ [MULTI-TOKEN-WITHDRAWAL] Failed to get signature:', error);
            setIsRequestingSignature(false);
            toast({
                title: "Signature Error",
                description: error.message || "Failed to get withdrawal authorization.",
                variant: "destructive",
            });
        }
    };

    // Get vault balance display
    const getVaultBalanceDisplay = () => {
        if (!vaultBalance) return '0.00';
        const balance = formatUnits(vaultBalance as bigint, token.decimals);
        return parseFloat(balance).toFixed(token.decimals === 6 ? 2 : 4);
    };

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setNtiqAmount('');
            resetWithdraw();
        }
    }, [isOpen, resetWithdraw]);

    // Show success screen
    if (isConfirmed && withdrawHash) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                            Withdrawal Successful!
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                You withdrew:
                            </p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {tokenAmount.toFixed(6)} {token.symbol}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                ≈ ${usdValue.toFixed(2)} USD
                            </p>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Transaction Hash:
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs font-mono break-all">
                                    {withdrawHash}
                                </code>
                                <a
                                    href={`https://amoy.polygonscan.com/tx/${withdrawHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0"
                                >
                                    <ExternalLink className="w-4 h-4 text-blue-600 hover:text-blue-700" />
                                </a>
                            </div>
                        </div>

                        <Button onClick={onClose} className="w-full">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowUpCircle className="w-5 h-5 text-orange-600" />
                        Multi-Token Withdrawal
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Token Selector */}
                    <div>
                        <Label htmlFor="token">Select Token</Label>
                        <Select
                            value={selectedToken}
                            onValueChange={(value) => setSelectedToken(value as keyof typeof TOKENS)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(TOKENS).map(([key, tkn]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <span>{tkn.icon}</span>
                                            <span>{tkn.symbol}</span>
                                            <span className="text-xs text-gray-500">- {tkn.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Balances */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Your NTIQ Balance:</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {userNTIQBalance.toLocaleString()} NTIQ
                            </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Vault {token.symbol} Balance:</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {getVaultBalanceDisplay()} {token.symbol}
                            </p>
                        </div>
                    </div>

                    {/* Token Price */}
                    {isPriceLoading ? (
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading {token.symbol} price...
                            </p>
                        </div>
                    ) : (
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Current {token.symbol} Price:
                            </p>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                ${tokenPriceUSD.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 6
                                })}
                            </p>
                        </div>
                    )}

                    {/* NTIQ Amount Input */}
                    <div>
                        <Label htmlFor="ntiqAmount">NTIQ Amount to Withdraw</Label>
                        <Input
                            id="ntiqAmount"
                            type="number"
                            value={ntiqAmount}
                            onChange={(e) => setNtiqAmount(e.target.value)}
                            placeholder="Enter NTIQ amount (min: 10)"
                            min="10"
                            max={userNTIQBalance}
                            step="10"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Min: 10 NTIQ • Max: {userNTIQBalance} NTIQ
                        </p>
                    </div>

                    {/* Conversion Preview */}
                    {ntiqAmount && tokenPriceUSD > 0 && (
                        <div className="space-y-3">
                            {/* USD Value */}
                            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    USD Value:
                                </p>
                                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                                    ${usdValue.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {ntiqAmount} NTIQ × $0.01
                                </p>
                            </div>

                            {/* Token Amount */}
                            <div className={`bg-${token.color}-50 dark:bg-${token.color}-950 p-4 rounded-lg border border-${token.color}-200 dark:border-${token.color}-800`}>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You will receive:
                                </p>
                                <p className={`text-2xl font-bold text-${token.color}-600 dark:text-${token.color}-400`}>
                                    {tokenAmount.toFixed(6)} {token.symbol}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    ${usdValue.toFixed(2)} ÷ ${tokenPriceUSD.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {withdrawError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {withdrawError.message || 'Withdrawal failed'}
                            </p>
                        </div>
                    )}

                    {/* Withdraw Button */}
                    <Button
                        onClick={handleWithdraw}
                        disabled={
                            !ntiqAmount ||
                            parseFloat(ntiqAmount) < 10 ||
                            parseFloat(ntiqAmount) > userNTIQBalance ||
                            isRequestingSignature ||
                            isWithdrawPending ||
                            isConfirming ||
                            !address ||
                            chain?.id !== POLYGON_AMOY_CHAIN_ID
                        }
                        className="w-full"
                    >
                        {isRequestingSignature && (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Requesting Authorization...
                            </>
                        )}
                        {!isRequestingSignature && (isWithdrawPending || isConfirming) && (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Confirming Withdrawal...
                            </>
                        )}
                        {!isRequestingSignature && !isWithdrawPending && !isConfirming && (
                            <>
                                <ArrowUpCircle className="w-4 h-4 mr-2" />
                                Withdraw {token.symbol}
                            </>
                        )}
                    </Button>

                    {/* Info */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2 mb-1">
                            <Coins className="w-4 h-4" />
                            <strong>Note:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-6">
                            <li>Minimum withdrawal: 10 NTIQ</li>
                            <li>Withdrawals are instant (no admin approval)</li>
                            <li>You need to authorize the withdrawal first</li>
                            <li>Make sure you're on Polygon Amoy network</li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

