import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, AlertTriangle, CheckCircle2, ExternalLink, Calculator } from 'lucide-react';
import { CONTRACTS, ABIS, INSURANCE_RATES, generatePredictionId } from '@/lib/contracts';

interface PredictionInsuranceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    predictionId?: number;
    stakeAmount?: string;
    userBalance?: number;
}

export function PredictionInsuranceModal({
    isOpen,
    onClose,
    onSuccess,
    predictionId,
    stakeAmount = "0",
    userBalance = 0
}: PredictionInsuranceModalProps) {
    const [insuranceAmount, setInsuranceAmount] = useState("");
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculatedCost, setCalculatedCost] = useState("0");
    const [calculatedRefund, setCalculatedRefund] = useState("0");

    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    // Contract write for buying insurance
    const { writeContract: buyInsurance, data: buyHash, isPending: isBuyPending } = useWriteContract();
    const { writeContract: claimInsurance, data: claimHash, isPending: isClaimPending } = useWriteContract();

    // Wait for transaction receipts
    const { isLoading: isBuyConfirming } = useWaitForTransactionReceipt({
        hash: buyHash,
    });

    const { isLoading: isClaimConfirming } = useWaitForTransactionReceipt({
        hash: claimHash,
    });

    // Check if user already has insurance for this prediction
    const { data: existingInsurance, refetch: refetchInsurance } = useReadContract({
        address: CONTRACTS.PREDICTION_INSURANCE,
        abi: ABIS.PREDICTION_INSURANCE,
        functionName: 'getInsuranceClaim',
        args: predictionId ? [generatePredictionId(predictionId)] : undefined,
        query: {
            enabled: !!predictionId && isConnected,
        },
    });

    // Calculate insurance cost and refund
    useEffect(() => {
        if (insuranceAmount && !isNaN(Number(insuranceAmount))) {
            setIsCalculating(true);

            // Insurance cost is 10% of stake amount
            const cost = (Number(insuranceAmount) * INSURANCE_RATES.COST_RATE) / 10000;
            setCalculatedCost(cost.toString());

            // Refund is 50% of insurance cost
            const refund = (cost * INSURANCE_RATES.REFUND_RATE) / 10000;
            setCalculatedRefund(refund.toString());

            setTimeout(() => setIsCalculating(false), 500);
        } else {
            setCalculatedCost("0");
            setCalculatedRefund("0");
        }
    }, [insuranceAmount]);

    // Set default insurance amount from stake amount
    useEffect(() => {
        if (stakeAmount && stakeAmount !== "0" && !insuranceAmount) {
            setInsuranceAmount(stakeAmount);
        }
    }, [stakeAmount, insuranceAmount]);

    const handleBuyInsurance = async () => {
        if (!address || !predictionId || !insuranceAmount) {
            toast({
                title: "Error",
                description: "Please connect wallet and enter insurance amount",
                variant: "destructive",
            });
            return;
        }

        if (Number(insuranceAmount) > userBalance) {
            toast({
                title: "Insufficient Balance",
                description: "You don't have enough NTIQ tokens for insurance",
                variant: "destructive",
            });
            return;
        }

        try {
            const predictionIdBytes32 = generatePredictionId(predictionId);
            const amountWei = parseEther(insuranceAmount);

            buyInsurance({
                address: CONTRACTS.PREDICTION_INSURANCE,
                abi: ABIS.PREDICTION_INSURANCE,
                functionName: 'buyInsurance',
                args: [predictionIdBytes32, amountWei],
            });

            toast({
                title: "Insurance Purchase Initiated",
                description: "Transaction submitted to blockchain",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to buy insurance",
                variant: "destructive",
            });
        }
    };

    const handleClaimInsurance = async () => {
        if (!address || !predictionId) {
            toast({
                title: "Error",
                description: "Please connect wallet",
                variant: "destructive",
            });
            return;
        }

        try {
            const predictionIdBytes32 = generatePredictionId(predictionId);

            claimInsurance({
                address: CONTRACTS.PREDICTION_INSURANCE,
                abi: ABIS.PREDICTION_INSURANCE,
                functionName: 'claimInsurance',
                args: [predictionIdBytes32],
            });

            toast({
                title: "Insurance Claim Initiated",
                description: "Transaction submitted to blockchain",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to claim insurance",
                variant: "destructive",
            });
        }
    };

    // Handle successful transactions
    useEffect(() => {
        if (buyHash && !isBuyConfirming) {
            toast({
                title: "Insurance Purchased Successfully!",
                description: (
                    <div className="flex items-center gap-2">
                        <span>Transaction confirmed</span>
                        <a
                            href={`https://amoy.polygonscan.com/tx/${buyHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                            View <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                ),
            });
            onSuccess?.();
            refetchInsurance();
        }
    }, [buyHash, isBuyConfirming, toast, onSuccess, refetchInsurance]);

    useEffect(() => {
        if (claimHash && !isClaimConfirming) {
            toast({
                title: "Insurance Claimed Successfully!",
                description: (
                    <div className="flex items-center gap-2">
                        <span>Refund processed</span>
                        <a
                            href={`https://amoy.polygonscan.com/tx/${claimHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                            View <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                ),
            });
            onSuccess?.();
            refetchInsurance();
        }
    }, [claimHash, isClaimConfirming, toast, onSuccess, refetchInsurance]);

    const isPending = isBuyPending || isBuyConfirming || isClaimPending || isClaimConfirming;
    const hasInsurance = existingInsurance && existingInsurance[0] !== "0x0000000000000000000000000000000000000000";
    const isClaimed = hasInsurance && existingInsurance[4]; // claimed field

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Prediction Insurance
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {!hasInsurance ? (
                        // Buy Insurance Section
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Calculator className="h-4 w-4" />
                                        Insurance Calculator
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label htmlFor="insurance-amount">Stake Amount (NTIQ)</Label>
                                        <Input
                                            id="insurance-amount"
                                            type="number"
                                            value={insuranceAmount}
                                            onChange={(e) => setInsuranceAmount(e.target.value)}
                                            placeholder="Enter stake amount"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    {isCalculating && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Calculating...
                                        </div>
                                    )}

                                    {calculatedCost !== "0" && (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Insurance Cost (10%):</span>
                                                <Badge variant="outline">{calculatedCost} NTIQ</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Potential Refund (50%):</span>
                                                <Badge variant="secondary">{calculatedRefund} NTIQ</Badge>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-yellow-50 p-3 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                            <div className="text-xs text-yellow-800">
                                                <p className="font-medium">Insurance Terms:</p>
                                                <ul className="mt-1 space-y-1">
                                                    <li>• Cost: 10% of stake amount</li>
                                                    <li>• Refund: 50% of insurance cost if prediction fails</li>
                                                    <li>• Can only be purchased before prediction expires</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                onClick={handleBuyInsurance}
                                disabled={!isConnected || isPending || !insuranceAmount || Number(insuranceAmount) <= 0}
                                className="w-full"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        {isBuyPending ? "Confirming..." : "Processing..."}
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4 mr-2" />
                                        Buy Insurance ({calculatedCost} NTIQ)
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        // Insurance Status Section
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        Insurance Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Stake Amount:</span>
                                            <Badge variant="outline">{formatEther(BigInt(existingInsurance[1] || "0"))} NTIQ</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Insurance Cost:</span>
                                            <Badge variant="outline">{formatEther(BigInt(existingInsurance[2] || "0"))} NTIQ</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Refund Amount:</span>
                                            <Badge variant="secondary">{formatEther(BigInt(existingInsurance[3] || "0"))} NTIQ</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <Badge variant={isClaimed ? "default" : "secondary"}>
                                                {isClaimed ? "Claimed" : "Active"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {!isClaimed && (
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                                <div className="text-xs text-green-800">
                                                    <p className="font-medium">Insurance Active</p>
                                                    <p>You can claim your refund if the prediction fails</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isClaimed && (
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                                                <div className="text-xs text-blue-800">
                                                    <p className="font-medium">Refund Claimed</p>
                                                    <p>Your insurance refund has been processed</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {!isClaimed && (
                                <Button
                                    onClick={handleClaimInsurance}
                                    disabled={!isConnected || isPending}
                                    className="w-full"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            {isClaimPending ? "Confirming..." : "Processing..."}
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-4 w-4 mr-2" />
                                            Claim Insurance Refund
                                        </>
                                    )}
                                </Button>
                            )}
                        </>
                    )}

                    <div className="text-xs text-gray-500 text-center">
                        Insurance protects against prediction losses with automatic refunds
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
