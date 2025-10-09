import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { switchToPolygonAmoy, isOnPolygonAmoy, getPolygonAmoyInfo } from '@/lib/polygonAmoy';
import { useToast } from '@/hooks/use-toast';

export function PolygonAmoyInfo() {
    const { chain, isConnected } = useAccount();
    const { toast } = useToast();
    const [isSwitching, setIsSwitching] = useState(false);
    const [isCheckingChain, setIsCheckingChain] = useState(false);
    const [isOnAmoy, setIsOnAmoy] = useState(false);

    const amoyInfo = getPolygonAmoyInfo();
    const isPolygonAmoy = chain?.id === 80002;

    // Check if on Amoy
    const checkChain = async () => {
        setIsCheckingChain(true);
        const onAmoy = await isOnPolygonAmoy();
        setIsOnAmoy(onAmoy);
        setIsCheckingChain(false);
    };

    // Handle manual switch
    const handleSwitchToAmoy = async () => {
        setIsSwitching(true);

        const result = await switchToPolygonAmoy();

        if (result.success) {
            if (result.added) {
                toast({
                    title: "Polygon Amoy Added & Activated",
                    description: "Successfully added Polygon Amoy testnet to your wallet!",
                });
            } else {
                toast({
                    title: "Switched to Polygon Amoy",
                    description: "Successfully switched to Polygon Amoy testnet!",
                });
            }
            await checkChain();
        } else if (result.userRejected) {
            toast({
                title: "Switch Cancelled",
                description: "You cancelled the chain switch request.",
                variant: "default",
            });
        } else {
            toast({
                title: "Switch Failed",
                description: result.error || "Failed to switch to Polygon Amoy testnet.",
                variant: "destructive",
            });
        }

        setIsSwitching(false);
    };

    if (!isConnected) {
        return null;
    }

    return (
        <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <div>
                            <CardTitle className="text-white">Polygon Amoy Testnet</CardTitle>
                            <CardDescription className="text-slate-300">
                                Official Polygon testnet (Chain ID: 80002)
                            </CardDescription>
                        </div>
                    </div>

                    {isPolygonAmoy ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Not Active
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Current Chain Status */}
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Current Chain</p>
                            <p className="text-xs text-slate-300 mt-1">
                                {chain?.name || 'Unknown'} (ID: {chain?.id || 'N/A'})
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={checkChain}
                            disabled={isCheckingChain}
                        >
                            {isCheckingChain ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Switch Button */}
                {!isPolygonAmoy && (
                    <Button
                        onClick={handleSwitchToAmoy}
                        disabled={isSwitching}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {isSwitching ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Switching...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Switch to Polygon Amoy
                            </>
                        )}
                    </Button>
                )}

                {/* Network Info */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Chain ID:</span>
                        <span className="font-mono text-white">{amoyInfo.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Currency:</span>
                        <span className="font-medium text-white">{amoyInfo.nativeCurrency.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Type:</span>
                        <Badge variant="outline" className="text-xs border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
                            Testnet
                        </Badge>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs"
                    >
                        <a
                            href={amoyInfo.blockExplorers.default.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Explorer
                        </a>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs"
                    >
                        <a
                            href={amoyInfo.faucet}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Faucet
                        </a>
                    </Button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-slate-400 text-center">
                    Need testnet POL? Visit the faucet to get free tokens for testing.
                </p>
            </CardContent>
        </Card>
    );
}

