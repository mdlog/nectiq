import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Gift, ExternalLink, Copy, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { CONTRACTS, ABIS, REFERRAL_RATES } from '@/lib/contracts';

interface ReferralSystemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function ReferralSystemModal({
    isOpen,
    onClose,
    onSuccess
}: ReferralSystemModalProps) {
    const [referrerCode, setReferrerCode] = useState("");
    const [copiedCode, setCopiedCode] = useState(false);

    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    // Contract write for registering referral
    const { writeContract: registerReferral, data: registerHash, isPending: isRegisterPending } = useWriteContract();

    // Wait for transaction receipt
    const { isLoading: isRegisterConfirming } = useWaitForTransactionReceipt({
        hash: registerHash,
    });

    // Get referral data for current user
    const { data: referralData, refetch: refetchReferralData } = useReadContract({
        address: CONTRACTS.REFERRAL_SYSTEM,
        abi: ABIS.REFERRAL_SYSTEM,
        functionName: 'getReferralData',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && isConnected,
        },
    });

    // Get total referral earnings
    const { data: totalEarnings, refetch: refetchEarnings } = useReadContract({
        address: CONTRACTS.REFERRAL_SYSTEM,
        abi: ABIS.REFERRAL_SYSTEM,
        functionName: 'getUserTotalReferralEarnings',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && isConnected,
        },
    });

    // Generate referral code from address
    useEffect(() => {
        if (address) {
            const code = address.slice(0, 8).toUpperCase();
            setReferrerCode(code);
        }
    }, [address]);

    const handleRegisterReferral = async () => {
        if (!address || !referrerCode) {
            toast({
                title: "Error",
                description: "Please connect wallet and enter referrer code",
                variant: "destructive",
            });
            return;
        }

        // Convert referrer code back to address (simplified for demo)
        // In real implementation, you'd have a mapping system
        const referrerAddress = "0x" + referrerCode.toLowerCase().padEnd(42, "0");

        if (referrerAddress === address) {
            toast({
                title: "Error",
                description: "You cannot refer yourself",
                variant: "destructive",
            });
            return;
        }

        try {
            registerReferral({
                address: CONTRACTS.REFERRAL_SYSTEM,
                abi: ABIS.REFERRAL_SYSTEM,
                functionName: 'registerReferral',
                args: [referrerAddress, address],
            });

            toast({
                title: "Referral Registration Initiated",
                description: "Transaction submitted to blockchain",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to register referral",
                variant: "destructive",
            });
        }
    };

    const handleCopyReferralCode = async () => {
        if (referrerCode) {
            try {
                await navigator.clipboard.writeText(referrerCode);
                setCopiedCode(true);
                toast({
                    title: "Copied!",
                    description: "Referral code copied to clipboard",
                });
                setTimeout(() => setCopiedCode(false), 2000);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to copy referral code",
                    variant: "destructive",
                });
            }
        }
    };

    const handleCopyReferralLink = async () => {
        if (address) {
            const referralLink = `${window.location.origin}?ref=${referrerCode}`;
            try {
                await navigator.clipboard.writeText(referralLink);
                toast({
                    title: "Copied!",
                    description: "Referral link copied to clipboard",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to copy referral link",
                    variant: "destructive",
                });
            }
        }
    };

    // Handle successful registration
    useEffect(() => {
        if (registerHash && !isRegisterConfirming) {
            toast({
                title: "Referral Registered Successfully!",
                description: (
                    <div className="flex items-center gap-2">
                        <span>You're now earning referral rewards</span>
                        <a
                            href={`https://amoy.polygonscan.com/tx/${registerHash}`}
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
            refetchReferralData();
            refetchEarnings();
        }
    }, [registerHash, isRegisterConfirming, toast, onSuccess, refetchReferralData, refetchEarnings]);

    const isPending = isRegisterPending || isRegisterConfirming;
    const hasReferrer = referralData && referralData[0] !== "0x0000000000000000000000000000000000000000";
    const isActive = referralData && referralData[3]; // active field

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Referral System
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="earn" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="earn">Earn Rewards</TabsTrigger>
                        <TabsTrigger value="refer">Refer Friends</TabsTrigger>
                    </TabsList>

                    <TabsContent value="earn" className="space-y-4">
                        {!hasReferrer ? (
                            // Register Referral Section
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Gift className="h-4 w-4" />
                                        Join Referral Program
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="referrer-code">Referrer Code</Label>
                                        <Input
                                            id="referrer-code"
                                            value={referrerCode}
                                            onChange={(e) => setReferrerCode(e.target.value.toUpperCase())}
                                            placeholder="Enter referrer code"
                                            maxLength={8}
                                        />
                                    </div>

                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                                            <div className="text-xs text-green-800">
                                                <p className="font-medium">Earn 10% on all activities!</p>
                                                <ul className="mt-1 space-y-1">
                                                    <li>• Predictions: 10% bonus to referrer</li>
                                                    <li>• Battles: 10% bonus to referrer</li>
                                                    <li>• Parlays: 10% bonus to referrer</li>
                                                    <li>• Tournaments: 10% bonus to referrer</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleRegisterReferral}
                                        disabled={!isConnected || isPending || !referrerCode}
                                        className="w-full"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                {isRegisterPending ? "Confirming..." : "Processing..."}
                                            </>
                                        ) : (
                                            <>
                                                <Users className="h-4 w-4 mr-2" />
                                                Join Referral Program
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            // Referral Status Section
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        Referral Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Referrer:</span>
                                            <Badge variant="outline">
                                                {referralData[0]?.slice(0, 8)}...{referralData[0]?.slice(-6)}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Activities:</span>
                                            <Badge variant="outline">{Number(referralData[2] || "0")}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Earnings:</span>
                                            <Badge variant="secondary">{formatEther(BigInt(referralData[1] || "0"))} NTIQ</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <Badge variant={isActive ? "default" : "destructive"}>
                                                {isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                            <div className="text-xs text-green-800">
                                                <p className="font-medium">Referral Active</p>
                                                <p>You're earning 10% bonus on all activities</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="refer" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Gift className="h-4 w-4" />
                                    Your Referral Code
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Your Referral Code</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={referrerCode}
                                            readOnly
                                            className="font-mono"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleCopyReferralCode}
                                        >
                                            {copiedCode ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label>Referral Link</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={`${window.location.origin}?ref=${referrerCode}`}
                                            readOnly
                                            className="text-xs"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleCopyReferralLink}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                                        <div className="text-xs text-blue-800">
                                            <p className="font-medium">How Referrals Work:</p>
                                            <ul className="mt-1 space-y-1">
                                                <li>• Share your referral code with friends</li>
                                                <li>• Earn 10% of their activity amounts</li>
                                                <li>• Rewards paid automatically</li>
                                                <li>• Track earnings in your dashboard</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Your Total Earnings:</span>
                                        <Badge variant="secondary">
                                            {totalEarnings ? formatEther(BigInt(totalEarnings)) : "0"} NTIQ
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="text-xs text-gray-500 text-center">
                    Earn 10% bonus on all referred user activities
                </div>
            </DialogContent>
        </Dialog>
    );
}
