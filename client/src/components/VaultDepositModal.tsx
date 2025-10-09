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
const CONVERSION_RATE = 1000; // 1 POL = 1000 NTIQ

const VAULT_ABI = [
    {
        name: 'depositPOL',
        type: 'function',
        stateMutability: 'payable',
        inputs: [],
        outputs: [],
    },
] as const;

interface VaultDepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function VaultDepositModal({ isOpen, onClose, onSuccess }: VaultDepositModalProps) {
    const { address, chain } = useAccount();
    const { toast } = useToast();
    const [polAmount, setPolAmount] = useState('');

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

    const ntiqAmount = polAmount ? parseFloat(polAmount) * CONVERSION_RATE : 0;

    const handleDeposit = async () => {
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

        const amount = parseFloat(polAmount);
        if (!amount || amount <= 0 || amount < 0.01) {
            toast({
                title: "Invalid Amount",
                description: "Minimum deposit is 0.01 POL.",
                variant: "destructive",
            });
            return;
        }

        if (amount > 1000) {
            toast({
                title: "Amount Too Large",
                description: "Maximum deposit is 1000 POL.",
                variant: "destructive",
            });
            return;
        }

        try {
            writeContract({
                address: VAULT_CONTRACT_ADDRESS,
                abi: VAULT_ABI,
                functionName: 'depositPOL',
                value: parseEther(polAmount),
            });
        } catch (error: any) {
            console.error('Deposit error:', error);
            toast({
                title: "Transaction Failed",
                description: error.message || "Failed to initiate deposit.",
                variant: "destructive",
            });
        }
    };

    // Handle transaction confirmation
    React.useEffect(() => {
        if (isConfirmed && hash) {
            toast({
                title: "Deposit Successful! 🎉",
                description: `${polAmount} POL deposited. You will receive ${ntiqAmount} NTIQ.`,
            });

            // Reset form
            setPolAmount('');
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
    }, [isConfirmed, hash, polAmount, ntiqAmount, toast, onSuccess, onClose, resetWrite]);

    // Handle write errors
    React.useEffect(() => {
        if (writeError) {
            toast({
                title: "Transaction Failed",
                description: writeError.message || "Failed to deposit POL.",
                variant: "destructive",
            });
        }
    }, [writeError, toast]);

    const handleClose = () => {
        if (!isWritePending && !isConfirming) {
            setPolAmount('');
            resetWrite();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        💰 Deposit POL
                    </DialogTitle>
                </DialogHeader>

                {!isConfirmed ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="pol-amount">POL Amount</Label>
                            <Input
                                id="pol-amount"
                                type="number"
                                placeholder="0.01"
                                step="0.01"
                                min="0.01"
                                max="1000"
                                value={polAmount}
                                onChange={(e) => setPolAmount(e.target.value)}
                                disabled={isWritePending || isConfirming}
                            />
                            <p className="text-sm text-gray-500">
                                Min: 0.01 POL • Max: 1,000 POL
                            </p>
                        </div>

                        {ntiqAmount > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You will receive:
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {ntiqAmount.toLocaleString()} NTIQ
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Rate: 1 POL = {CONVERSION_RATE} NTIQ
                                </p>
                            </div>
                        )}

                        <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg text-xs">
                            <p className="text-yellow-800 dark:text-yellow-200">
                                <strong>Note:</strong> Make sure you're on <strong>Polygon Amoy testnet</strong>.
                                Your balance will be credited automatically after confirmation (≈5 seconds).
                            </p>
                        </div>

                        <Button
                            onClick={handleDeposit}
                            disabled={!polAmount || isWritePending || isConfirming}
                            className="w-full"
                            size="lg"
                        >
                            {isWritePending ? (
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
                                'Deposit POL'
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
                            Deposit Confirmed! 🎉
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {polAmount} POL → {ntiqAmount} NTIQ
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

