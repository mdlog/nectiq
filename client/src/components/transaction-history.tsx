import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    Copy,
    ExternalLink,
    Search,
    Filter,
    RefreshCw,
    Calendar,
    Wallet,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Eye,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DepositData {
    id: number;
    userId: number;
    fromWalletAddress: string;
    toWalletAddress: string;
    chainName: string;
    chainId: number;
    tokenType: string;
    tokenAddress: string;
    amountUSD: string;
    ntiqAmount: number;
    status: string;
    transactionHash?: string;
    ethPriceSnapshot?: string;
    createdAt: string;
    expiresAt?: string;
    processedAt?: string;
}

interface WithdrawalData {
    id: number;
    userId: number;
    toWalletAddress: string;
    chainName: string;
    chainId: number;
    tokenType: string;
    amount: string;
    netAmount?: string;
    ethPriceSnapshot?: string;
    status: string;
    transactionHash?: string;
    adminNote?: string;
    createdAt: string;
}

interface TransactionHistoryProps {
    className?: string;
}

export function TransactionHistory({ className }: TransactionHistoryProps) {
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [tokenFilter, setTokenFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Query to get deposit history
    const { data: deposits, isLoading: depositsLoading, refetch: refetchDeposits, error: depositsError } = useQuery({
        queryKey: ["/api/user/deposits"],
        refetchInterval: 60000, // Reduced to 60 seconds
        staleTime: 30000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Query to get withdrawal history
    const { data: withdrawals, isLoading: withdrawalsLoading, refetch: refetchWithdrawals, error: withdrawalsError } = useQuery({
        queryKey: ["/api/user/withdrawals"],
        refetchInterval: 60000, // Reduced to 60 seconds
        staleTime: 30000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Debug logging
    console.log('🔍 [TRANSACTION-HISTORY] Debug Info:', {
        deposits: deposits?.length || 0,
        withdrawals: withdrawals?.length || 0,
        depositsLoading,
        withdrawalsLoading,
        depositsError: depositsError?.message,
        withdrawalsError: withdrawalsError?.message
    });

    if (deposits && deposits.length > 0) {
        console.log('🔍 [TRANSACTION-HISTORY] Sample deposit:', deposits[0]);
    }
    if (withdrawals && withdrawals.length > 0) {
        console.log('🔍 [TRANSACTION-HISTORY] Sample withdrawal:', withdrawals[0]);
    }

    // Combine and sort all transactions with error handling
    const allTransactions = [
        ...(deposits || []).map((deposit: any) => {
            console.log('🔍 [TRANSACTION-HISTORY] Processing deposit:', deposit);
            return {
                ...deposit,
                type: 'deposit' as const,
                amount: deposit.amountUSD || '0',
                token: deposit.tokenType || 'Unknown',
                date: deposit.createdAt || new Date().toISOString(),
                hash: deposit.transactionHash || null,
            };
        }),
        ...(withdrawals || []).map((withdrawal: any) => {
            console.log('🔍 [TRANSACTION-HISTORY] Processing withdrawal:', withdrawal);
            return {
                ...withdrawal,
                type: 'withdrawal' as const,
                amount: withdrawal.amount || '0',
                token: withdrawal.tokenType || 'Unknown',
                date: withdrawal.createdAt || new Date().toISOString(),
                hash: withdrawal.transactionHash || null,
            };
        })
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('🔍 [TRANSACTION-HISTORY] All transactions:', allTransactions.length, allTransactions);

    // Filter transactions
    const filteredTransactions = allTransactions.filter(transaction => {
        const matchesSearch = searchTerm === "" ||
            transaction.transactionHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.status.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
        const matchesToken = tokenFilter === "all" || transaction.token === tokenFilter;
        const matchesTab = activeTab === "all" || transaction.type === activeTab;

        return matchesSearch && matchesStatus && matchesToken && matchesTab;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    // Get unique tokens and statuses for filters
    const uniqueTokens = Array.from(new Set(allTransactions.map(t => t.token)));
    const uniqueStatuses = Array.from(new Set(allTransactions.map(t => t.status)));

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: `${label} copied to clipboard`,
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
            case 'processing':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'failed':
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
            case 'completed':
                return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Confirmed</Badge>;
            case 'pending':
            case 'processing':
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Pending</Badge>;
            case 'failed':
            case 'rejected':
                return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Failed</Badge>;
            default:
                return <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount: string, token: string) => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return amount;

        if (token === 'USDC' || token === 'USDT') {
            return `${numAmount.toFixed(2)} ${token}`;
        } else if (token === 'ETH' || token === 'WETH') {
            return `${numAmount.toFixed(6)} ${token}`;
        } else {
            return `${numAmount.toFixed(4)} ${token}`;
        }
    };

    const handleRefresh = useCallback(() => {
        // Prevent multiple rapid refreshes
        if (depositsLoading || withdrawalsLoading) {
            return;
        }

        refetchDeposits();
        refetchWithdrawals();
        toast({
            title: "Refreshed",
            description: "Transaction history updated",
        });
    }, [refetchDeposits, refetchWithdrawals, depositsLoading, withdrawalsLoading]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Transaction History</h2>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="text-xs hover:bg-primary/20 border-primary/30"
                >
                    <RefreshCw className="mr-1" size={14} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-600 text-white"
                    />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {uniqueStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={tokenFilter} onValueChange={setTokenFilter}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Filter by token" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tokens</SelectItem>
                        {uniqueTokens.map(token => (
                            <SelectItem key={token} value={token}>{token}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="deposit">Deposits</SelectItem>
                        <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Transaction List */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                    {depositsLoading || withdrawalsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-6 w-6 animate-spin text-blue-400 mr-2" />
                            <span className="text-slate-400">Loading transactions...</span>
                        </div>
                    ) : depositsError || withdrawalsError ? (
                        <div className="flex flex-col items-center justify-center py-12 text-red-400">
                            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Error loading transactions</p>
                            <p className="text-sm text-center">
                                {(() => {
                                    const error = depositsError || withdrawalsError;
                                    if (error?.message?.includes('429') || error?.message?.includes('Too many requests')) {
                                        return 'Too many requests. Please wait a moment and try again.';
                                    }
                                    return error?.message || 'Unknown error occurred';
                                })()}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                className="mt-3"
                                disabled={depositsLoading || withdrawalsLoading}
                            >
                                <RefreshCw className={`mr-1 ${(depositsLoading || withdrawalsLoading) ? 'animate-spin' : ''}`} size={14} />
                                Retry
                            </Button>
                        </div>
                    ) : paginatedTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <History className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No transactions found</p>
                            <p className="text-sm text-center">
                                {allTransactions.length === 0
                                    ? "Your transaction history will appear here once you make deposits or withdrawals"
                                    : "No transactions match your current filters"
                                }
                            </p>
                            {allTransactions.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("all");
                                        setTokenFilter("all");
                                        setActiveTab("all");
                                    }}
                                    className="mt-3"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {paginatedTransactions.map((transaction, index) => (
                                <div key={`${transaction.type}-${transaction.id}`} className="p-4 hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700">
                                                {transaction.type === 'deposit' ? (
                                                    <ArrowDownCircle className="h-5 w-5 text-green-400" />
                                                ) : (
                                                    <ArrowUpCircle className="h-5 w-5 text-red-400" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium text-white capitalize">
                                                        {transaction.type}
                                                    </span>
                                                    {getStatusIcon(transaction.status)}
                                                    {getStatusBadge(transaction.status)}
                                                </div>

                                                <div className="flex items-center space-x-4 text-sm text-slate-400">
                                                    <span className="flex items-center space-x-1">
                                                        <Wallet className="h-3 w-3" />
                                                        <span>{formatAmount(transaction.amount, transaction.token)}</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(transaction.date)}</span>
                                                    </span>
                                                    {transaction.hash && (
                                                        <span className="flex items-center space-x-1">
                                                            <ExternalLink className="h-3 w-3" />
                                                            <span className="font-mono text-xs">
                                                                {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-6)}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {transaction.hash && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(transaction.hash!, "Transaction hash")}
                                                    className="h-8 w-8 p-0 hover:bg-slate-600"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            )}

                                            {transaction.hash && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(`https://amoy.polygonscan.com/tx/${transaction.hash}`, '_blank')}
                                                    className="h-8 w-8 p-0 hover:bg-slate-600"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Debug Info (only in development) */}
            {import.meta.env.DEV && (
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Debug Info:</h4>
                    <div className="text-xs text-slate-400 space-y-1">
                        <p>Raw deposits: {deposits?.length || 0}</p>
                        <p>Raw withdrawals: {withdrawals?.length || 0}</p>
                        <p>All transactions: {allTransactions.length}</p>
                        <p>Filtered transactions: {filteredTransactions.length}</p>
                        <p>Current page: {currentPage} of {totalPages}</p>
                        {depositsError && <p className="text-red-400">Deposits error: {depositsError.message}</p>}
                        {withdrawalsError && <p className="text-red-400">Withdrawals error: {withdrawalsError.message}</p>}
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <span className="text-sm text-slate-400 px-2">
                            Page {currentPage} of {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
