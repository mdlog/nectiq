import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';

const VAULT_CONTRACT_ADDRESS = import.meta.env.VITE_VAULT_CONTRACT_ADDRESS as `0x${string}`;
const POLYGON_AMOY_CHAIN_ID = 80002;
const CONVERSION_RATE = 1000; // 1000 NTIQ = 1 POL

const VAULT_ABI = [
    {
        name: 'withdraw',
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

interface VaultWithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    userBalance: number; // User's NTIQ balance
}

export function VaultWithdrawalModal({
    isOpen,
    onClose,
    onSuccess,
    userBalance
}: VaultWithdrawalModalProps) {
    const { address, chain } = useAccount();
    const { toast } = useToast();
    const [ntiqAmount, setNtiqAmount] = useState('');
    const [isRequestingSignature, setIsRequestingSignature] = useState(false);

    const {
        data: hash,
        writeContract,
        isPending: isWritePending,
        error: writeError,
        reset: resetWrite
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed
    } = useWaitForTransactionReceipt({
        hash,
    });

    const polAmount = ntiqAmount ? parseFloat(ntiqAmount) / CONVERSION_RATE : 0;

    const handleWithdraw = async () => {
        if (!VAULT_CONTRACT_ADDRESS) {
            toast({
                title: "Configuration Error",
                description: "Vault contract not configured. Please contact support.",
                variant: "destructive",
            });
            return;
        }

        if (!address) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet first.",
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

        const amount = parseFloat(ntiqAmount);
        if (!amount || amount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid withdrawal amount.",
                variant: "destructive",
            });
            return;
        }

        if (amount > userBalance) {
            toast({
                title: "Insufficient Balance",
                description: `You only have ${userBalance} NTIQ available.`,
                variant: "destructive",
            });
            return;
        }

        try {
            setIsRequestingSignature(true);

            // Step 1: Request withdrawal signature from backend
            const response = await fetch('/api/vault/withdrawal-signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ntiqAmount: amount })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get withdrawal authorization');
            }

            const { signature, nonce, polAmount: polAmountFromBackend } = await response.json();

            console.log('✅ Withdrawal signature received:', { signature, nonce, polAmount: polAmountFromBackend });

            // Step 2: Execute withdrawal on smart contract
            writeContract({
                address: VAULT_CONTRACT_ADDRESS,
                abi: VAULT_ABI,
                functionName: 'withdraw',
                args: [
                    parseEther(polAmountFromBackend.toString()),
                    BigInt(nonce),
                    signature as `0x${string}`
                ],
            });

        } catch (error: any) {
            console.error('Withdrawal error:', error);
            toast({
                title: "Withdrawal Failed",
                description: error.message || "Failed to process withdrawal.",
                variant: "destructive",
            });
        } finally {
            setIsRequestingSignature(false);
        }
    };

    // Handle transaction confirmation
    React.useEffect(() => {
        if (isConfirmed && hash) {
            toast({
                title: "Withdrawal Successful! 💸",
                description: `${polAmount.toFixed(4)} POL sent to your wallet.`,
            });

            // Reset form
            setNtiqAmount('');
            resetWrite();

            // Call success callback
            if (onSuccess) {
                onSuccess();
            }

            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);
        }
    }, [isConfirmed, hash, polAmount, toast, onSuccess, onClose, resetWrite]);

    // Handle write errors
    React.useEffect(() => {
        if (writeError) {
            toast({
                title: "Transaction Failed",
                description: writeError.message || "Failed to withdraw POL.",
                variant: "destructive",
            });
        }
    }, [writeError, toast]);

    const handleClose = () => {
        if (!isWritePending && !isConfirming && !isRequestingSignature) {
            setNtiqAmount('');
            resetWrite();
            onClose();
        }
    };

    const isProcessing = isRequestingSignature || isWritePending || isConfirming;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        💸 Withdraw to Wallet
                    </DialogTitle>
                </DialogHeader>

                {!isConfirmed ? (
                    <div className="space-y-4 py-4">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Available Balance:
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {userBalance.toLocaleString()} NTIQ
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ≈ {(userBalance / CONVERSION_RATE).toFixed(4)} POL
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ntiq-amount">NTIQ Amount to Withdraw</Label>
                            <Input
                                id="ntiq-amount"
                                type="number"
                                placeholder="1000"
                                step="1"
                                min="1"
                                max={userBalance}
                                value={ntiqAmount}
                                onChange={(e) => setNtiqAmount(e.target.value)}
                                disabled={isProcessing}
                            />
                            <p className="text-sm text-gray-500">
                                Min: 1 NTIQ • Max: {userBalance.toLocaleString()} NTIQ
                            </p>
                        </div>

                        {polAmount > 0 && (
                            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You will receive:
                                </p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {polAmount.toFixed(6)} POL
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Rate: {CONVERSION_RATE} NTIQ = 1 POL
                                </p>
                            </div>
                        )}

                        <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg text-xs">
                            <p className="text-yellow-800 dark:text-yellow-200">
                                <strong>Note:</strong> Withdrawal takes ≈30 seconds. POL will be sent
                                directly to your connected wallet on Polygon Amoy.
                            </p>
                        </div>

                        <Button
                            onClick={handleWithdraw}
                            disabled={!ntiqAmount || isProcessing}
                            className="w-full"
                            size="lg"
                        >
                            {isRequestingSignature ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Requesting Authorization...
                                </>
                            ) : isWritePending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirm in Wallet...
                                </>
                            ) : isConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                'Withdraw POL'
                            )}
                        </Button>

                        {hash && (
                            <a
                                href={`https://amoy.polygonscan.com/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                                View on Polygonscan
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-green-600 mb-2">
                            Withdrawal Complete! 💸
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {ntiqAmount} NTIQ → {polAmount.toFixed(6)} POL
                        </p>
                        {hash && (
                            <a
                                href={`https://amoy.polygonscan.com/tx/${hash}`}
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

