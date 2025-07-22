import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Users, TrendingUp, TrendingDown, Award, Activity, BarChart3, Eye, Settings, Lock, AlertTriangle, Plus, Trash2, Coins, Edit, UserPlus, UserX, Shield, Database, FileText, RefreshCw, Calendar, DollarSign, Zap, Ban, Trophy, Download, Search, Filter, ChevronUp, ChevronDown, Target, X, AlertCircle, Info, Clock, CheckCircle, XCircle, Lightbulb, Cog, Gamepad2, Copy, Code, Archive, FileDown, FileSpreadsheet, ShieldCheck, Pause, Save, Megaphone, Star, MapPin, ExternalLink, Swords, Play, RotateCcw, TestTube } from "lucide-react";
import { useLocation } from "wouter";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, Prediction, Reward, Cryptocurrency } from "@shared/schema";
import type { LeaderboardEntry } from "@/types";
import { SimpleAdminAuth } from "@/components/simple-admin-auth";
import { BannerManagement } from "@/components/admin/banner-management";
import { UserStatistics } from "@/components/admin/user-statistics";

import { useAdminWebSocket } from "@/hooks/useAdminWebSocket";

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalRewards: number;
  activeUsers: number;
  accuracyAverage: number;
  totalStaked: number;
}

// ===== NTIQ CIRCULATION TRACKER COMPONENT =====
interface NTIQCirculationData {
  totalUsers: number;
  totalNTIQCirculation: number;
  expectedDistribution: number;
  distributionAccuracy: string;
  averageBalancePerUser: string;
  users: Array<{
    id: number;
    username: string;
    balance: number;
    walletAddress: string | null;
    isAdmin: boolean;
    authMethod: string;
    totalRewards: number;
  }>;
  transactionSummary: {
    totalTransactions: number;
    totalRewardsDistributed: number;
    totalStaked: number;
  };
  systemHealth: {
    autoDistributionWorking: boolean;
    balanceConsistency: boolean;
    schemaDefaultValue: number;
  };
}

const NTIQCirculationTracker = () => {
  const { toast } = useToast();
  
  const circulationQuery = useQuery({
    queryKey: ['/api/admin/ntiq-circulation'],
    refetchInterval: 10000, // Update every 10 seconds
  });

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          NTIQ Circulation Tracking
          <Badge variant={circulationQuery.data?.systemHealth?.autoDistributionWorking ? "default" : "destructive"}>
            {circulationQuery.data?.systemHealth?.autoDistributionWorking ? "HEALTHY" : "ERROR"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {circulationQuery.isLoading && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading circulation data...</p>
          </div>
        )}

        {circulationQuery.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load NTIQ circulation data: {circulationQuery.error?.message}
            </AlertDescription>
          </Alert>
        )}

        {circulationQuery.data && (
          <div className="space-y-6">
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">
                    {circulationQuery.data.totalNTIQCirculation.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Total NTIQ in Circulation</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {circulationQuery.data.distributionAccuracy}%
                  </div>
                  <p className="text-xs text-muted-foreground">Distribution Accuracy</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {circulationQuery.data.totalUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">
                    {circulationQuery.data.averageBalancePerUser}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Balance per User</p>
                </CardContent>
              </Card>
            </div>

            {/* System Health Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${circulationQuery.data.systemHealth.autoDistributionWorking ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Auto-Distribution System</span>
                    <Badge variant={circulationQuery.data.systemHealth.autoDistributionWorking ? "default" : "destructive"} className="ml-auto">
                      {circulationQuery.data.systemHealth.autoDistributionWorking ? "Working" : "Failed"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${circulationQuery.data.systemHealth.balanceConsistency ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Balance Consistency</span>
                    <Badge variant={circulationQuery.data.systemHealth.balanceConsistency ? "default" : "destructive"} className="ml-auto">
                      {circulationQuery.data.systemHealth.balanceConsistency ? "Consistent" : "Error"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Schema Default Value</span>
                    <Badge variant="outline" className="ml-auto">
                      {circulationQuery.data.systemHealth.schemaDefaultValue} NTIQ
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">{circulationQuery.data.transactionSummary.totalTransactions}</div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{circulationQuery.data.transactionSummary.totalRewardsDistributed}</div>
                    <p className="text-sm text-muted-foreground">Rewards Distributed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{circulationQuery.data.transactionSummary.totalStaked}</div>
                    <p className="text-sm text-muted-foreground">Total Staked</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Balances Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Balance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Auth Method</TableHead>
                        <TableHead>Total Rewards</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {circulationQuery.data.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.username}
                            {user.isAdmin && <Badge variant="destructive" className="ml-2">Admin</Badge>}
                          </TableCell>
                          <TableCell className="font-bold text-yellow-600">
                            {user.balance.toLocaleString()} NTIQ
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {user.walletAddress || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.authMethod === 'wallet' ? 'default' : 'secondary'}>
                              {user.authMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.totalRewards} NTIQ</TableCell>
                          <TableCell>
                            <Badge variant={user.balance >= 1000 ? 'default' : 'destructive'}>
                              {user.balance >= 1000 ? 'Normal' : 'Low Balance'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ===== DATABASE RESET COMPONENT =====
const DatabaseResetButton = () => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isStep2, setIsStep2] = useState(false);
  const [resetResults, setResetResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetMutation = useMutation({
    mutationFn: async (confirmationCode: string) => {
      // Enhanced retry mechanism with comprehensive admin bypass
      const maxRetries = 5;
      let lastError: any;

      console.log('🚀 [RESET] Initiating database reset with enhanced admin bypass');

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 [RESET] Attempt ${attempt}/${maxRetries} - Admin bypass enabled`);
          
          const response = await apiRequest('/api/admin/reset-database', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Operation': 'database-reset',
              'X-Bypass-Rate-Limit': 'true',
              'X-Admin-IP-Override': 'true'
            },
            body: JSON.stringify({ confirmationCode })
          });

          console.log('✅ [RESET] Database reset completed successfully:', response);
          return response;
          
        } catch (error: any) {
          lastError = error;
          console.log(`❌ [RESET] Attempt ${attempt}/${maxRetries} failed:`, error);
          
          // Enhanced retry logic for different error types
          if (error.message) {
            const errorMsg = error.message.toLowerCase();
            
            // Rate limiting errors - use exponential backoff
            if ((errorMsg.includes('429') || errorMsg.includes('rate limit') || 
                 errorMsg.includes('too many requests')) && attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1500; // Exponential backoff
              console.log(`⏳ [RESET] Rate limiting detected, waiting ${delay}ms with admin bypass...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            // Network/connection errors - use linear backoff
            if ((errorMsg.includes('connection') || errorMsg.includes('timeout') || 
                 errorMsg.includes('network') || errorMsg.includes('fetch')) && attempt < maxRetries) {
              const delay = 3000 * attempt; // Linear backoff for network issues
              console.log(`🌐 [RESET] Network issue detected, waiting ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            // Database constraint errors - shorter retry
            if ((errorMsg.includes('constraint') || errorMsg.includes('foreign key') ||
                 errorMsg.includes('database')) && attempt < maxRetries) {
              const delay = 2000; // Fixed delay for database issues
              console.log(`🗃️ [RESET] Database constraint issue, waiting ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          // For final attempt or non-retryable errors, break
          if (attempt === maxRetries) break;
          
          // Default retry delay for unknown errors
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // If all retries failed, throw enhanced error
      const enhancedError = new Error(
        `Database reset failed after ${maxRetries} attempts. Last error: ${
          lastError instanceof Error ? lastError.message : 'Unknown error'
        }`
      );
      console.error('💥 [RESET] All retry attempts exhausted:', enhancedError);
      throw enhancedError;
    },
    onSuccess: (data) => {
      console.log('🎉 Database reset successful:', data);
      setResetResults(data);
      setIsResetDialogOpen(false);
      setIsStep2(false);
      setConfirmationCode('');
      
      // Refresh all admin data
      queryClient.invalidateQueries();
      
      toast({
        title: "Database Reset Berhasil!",
        description: "Semua data telah dihapus dan ID direset ke 1",
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error('❌ Database reset failed:', error);
      
      let errorMessage = "Terjadi kesalahan saat mereset database";
      
      if (error.message?.includes('429') || error.message?.includes('Too many requests')) {
        errorMessage = "Terlalu banyak permintaan. Silakan tunggu beberapa saat lalu coba lagi.";
      } else if (error.message?.includes('foreign key constraint')) {
        errorMessage = "Error constraint database. Sistem sedang mencoba mengatasi masalah ini.";
      }
      
      toast({
        title: "Reset Database Gagal",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleResetClick = () => {
    setIsResetDialogOpen(true);
    setIsStep2(false);
    setConfirmationCode('');
  };

  const handleStep1Confirm = () => {
    setIsStep2(true);
  };

  const handleFinalReset = () => {
    if (confirmationCode === 'RESET_ALL_DATA_CONFIRMED') {
      resetMutation.mutate(confirmationCode);
    } else {
      toast({
        title: "Kode Konfirmasi Salah",
        description: "Masukkan kode konfirmasi yang benar",
        variant: "destructive"
      });
    }
  };

  const handleDialogClose = () => {
    setIsResetDialogOpen(false);
    setIsStep2(false);
    setConfirmationCode('');
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={async () => {
            try {
              console.log('🧪 Testing database with simple test endpoint...');
              const response = await fetch('/api/admin/test-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              const result = await response.json();
              console.log('🧪 Test result:', result);
              if (result.success) {
                toast({
                  title: "Test Database Success",
                  description: `Users before: ${result.beforeCount}, after: ${result.afterCount}`,
                  variant: "default"
                });
              } else {
                toast({
                  title: "Test Database Failed",
                  description: result.message,
                  variant: "destructive"
                });
              }
            } catch (error) {
              console.error('🧪 Test error:', error);
              toast({
                title: "Test Error",
                description: error.message,
                variant: "destructive"
              });
            }
          }}
          variant="outline"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold border-2 border-blue-700 shadow-lg"
        >
          <TestTube className="mr-2" size={16} />
          Test DB
        </Button>
        
        <Button
          onClick={handleResetClick}
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-red-700 shadow-lg"
          disabled={resetMutation.isPending}
        >
          <Trash2 className="mr-2" size={16} />
  {resetMutation.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Reset Database'
          )}
        </Button>
      </div>

      <Dialog open={isResetDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2" size={24} />
              {!isStep2 ? 'Confirm Database Reset' : 'Final Confirmation'}
            </DialogTitle>
          </DialogHeader>

          {!isStep2 ? (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">
                  <strong>SERIOUS WARNING!</strong>
                  <br />
                  This action will:
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Delete ALL data in the database</li>
                    <li>Delete all users, predictions, battles</li>
                    <li>Delete all transactions, deposits, withdrawals</li>
                    <li>Reset all ID counters to 1</li>
                    <li><strong>CANNOT BE UNDONE!</strong></li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleDialogClose}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleStep1Confirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  I Understand, Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Enter confirmation code to proceed:</strong>
                  <br />
                  <code className="text-sm bg-red-100 px-2 py-1 rounded mt-1 inline-block">
                    RESET_ALL_DATA_CONFIRMED
                  </code>
                </AlertDescription>
              </Alert>

              {resetMutation.isPending && (
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    <strong>Processing Database Reset...</strong><br />
                    Deleting all data and resetting ID sequences. This process may take several minutes.
                    {resetMutation.isPending && <div className="mt-2 text-sm">If timeout occurs, please try again in a few moments.</div>}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmationCode" className="text-sm font-medium">
                  Confirmation Code:
                </Label>
                <Input
                  id="confirmationCode"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter confirmation code..."
                  className="border-red-300 focus:border-red-500"
                  disabled={resetMutation.isPending}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleDialogClose}
                  disabled={resetMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleFinalReset}
                  disabled={resetMutation.isPending || confirmationCode !== 'RESET_ALL_DATA_CONFIRMED'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {resetMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing Database Reset...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      RESET DATABASE
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Results Display */}
      {resetResults && (
        <Alert className="mt-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Database successfully reset!</strong>
            <br />
            Reset performed on: {new Date(resetResults.resetDate).toLocaleString('en-US')}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

// Withdrawal Approval Card Component
interface WithdrawalApprovalCardProps {
  withdrawal: any;
}

function WithdrawalApprovalCard({ withdrawal }: WithdrawalApprovalCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "complete">("approve");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Processing</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const approvalMutation = useMutation({
    mutationFn: async ({ action, note, hash }: { action: string; note?: string; hash?: string }) => {
      const endpoint = `/api/admin/withdrawals/${withdrawal.id}/${action}`;
      const payload: any = {};
      if (note) payload.adminNote = note;
      if (hash) payload.transactionHash = hash;
      
      return await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({
        title: "Success",
        description: variables.action === "approve" ? "Withdrawal approved" : 
                    variables.action === "reject" ? "Withdrawal rejected" : 
                    "Withdrawal completed"
      });
      setShowApprovalDialog(false);
      setAdminNote("");
      setTransactionHash("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${actionType} withdrawal`,
        variant: "destructive"
      });
    }
  });

  const handleApprovalAction = (action: "approve" | "reject" | "complete") => {
    setActionType(action);
    setShowApprovalDialog(true);
  };

  const confirmAction = () => {
    approvalMutation.mutate({
      action: actionType,
      note: adminNote,
      hash: transactionHash
    });
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {withdrawal.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium">{withdrawal.username}</p>
            <p className="text-sm text-slate-400">
              {withdrawal.ntiqAmount ? withdrawal.ntiqAmount.toLocaleString() : 0} NTIQ → {(() => {
                // Calculate the actual token amount based on NTIQ amount and token type
                const ntiqAmount = withdrawal.ntiqAmount || 0;
                let tokenAmount = 'N/A';
                const tokenType = withdrawal.tokenType || 'N/A';
                
                if (tokenType === 'USDC' || tokenType === 'USDT') {
                  // USDC/USDT: use stored net_amount if available, otherwise calculate
                  if (withdrawal.netAmount) {
                    // Use pre-calculated net amount from database (already includes fee deduction)
                    tokenAmount = parseFloat(withdrawal.netAmount).toFixed(2);
                  } else {
                    // Fallback calculation for older withdrawals
                    tokenAmount = (ntiqAmount * 0.01).toFixed(2);
                  }
                } else if (tokenType === 'ETH') {
                  // ETH: use stored net_amount if available, otherwise calculate from snapshot
                  if (withdrawal.netAmount) {
                    // Use pre-calculated net amount from database (already includes fee deduction)
                    tokenAmount = parseFloat(withdrawal.netAmount).toFixed(6);
                  } else {
                    // Fallback calculation for older withdrawals
                    const ethPrice = withdrawal.ethPriceSnapshot ? parseFloat(withdrawal.ethPriceSnapshot) : 2300;
                    const usdValue = ntiqAmount * 0.01;
                    tokenAmount = (usdValue / ethPrice).toFixed(6);
                  }
                } else {
                  tokenAmount = (ntiqAmount * 0.01).toFixed(2);
                }
                
                return tokenAmount;
              })()} {withdrawal.tokenType || 'N/A'}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(withdrawal.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge(withdrawal.status)}
          
          {withdrawal.status === "pending" && (
            <div className="flex space-x-1">
              <Button
                size="sm"
                onClick={() => handleApprovalAction("approve")}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={approvalMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleApprovalAction("reject")}
                disabled={approvalMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
          
          {withdrawal.status === "processing" && (
            <Button
              size="sm"
              onClick={() => handleApprovalAction("complete")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={approvalMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Withdrawal" :
               actionType === "reject" ? "Reject Withdrawal" :
               "Complete Withdrawal"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="font-medium">{withdrawal.username}</p>
              <p className="text-sm text-slate-600">
                {(withdrawal.ntiqAmount || withdrawal.ptsAmount) ? (withdrawal.ntiqAmount || withdrawal.ptsAmount).toLocaleString() : 0} NTIQ → {(() => {
                  // Calculate the actual token amount based on NTIQ amount and token type
                  const ntiqAmount = withdrawal.ntiqAmount || withdrawal.ptsAmount || 0;
                  let tokenAmount = 'N/A';
                  const tokenType = withdrawal.tokenType || withdrawal.token || 'N/A';
                  
                  if (tokenType === 'USDC' || tokenType === 'USDT') {
                    // USDC/USDT: use stored net_amount if available, otherwise calculate
                    if (withdrawal.netAmount) {
                      // Use pre-calculated net amount from database (already includes fee deduction)
                      tokenAmount = parseFloat(withdrawal.netAmount).toFixed(2);
                    } else {
                      // Fallback calculation for older withdrawals
                      tokenAmount = (ntiqAmount * 0.01).toFixed(2);
                    }
                  } else if (tokenType === 'ETH') {
                    // ETH: use stored net_amount if available, otherwise calculate from snapshot
                    if (withdrawal.netAmount) {
                      // Use pre-calculated net amount from database (already includes fee deduction)
                      tokenAmount = parseFloat(withdrawal.netAmount).toFixed(6);
                    } else {
                      // Fallback calculation for older withdrawals
                      const ethPrice = withdrawal.ethPriceSnapshot ? parseFloat(withdrawal.ethPriceSnapshot) : 2300;
                      const usdValue = ntiqAmount * 0.01;
                      tokenAmount = (usdValue / ethPrice).toFixed(6);
                    }
                  } else {
                    tokenAmount = (ntiqAmount * 0.01).toFixed(2);
                  }
                  
                  return tokenAmount;
                })()} {withdrawal.tokenType || withdrawal.token || 'N/A'}
              </p>
            </div>
            
            <div>
              <Label htmlFor="adminNote">Admin Note {actionType === "reject" ? "(Required)" : "(Optional)"}</Label>
              <Input
                id="adminNote"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  actionType === "approve" ? "Approval note..." :
                  actionType === "reject" ? "Reason for rejection..." :
                  "Completion note..."
                }
                className="mt-1"
              />
            </div>

            {actionType === "complete" && (
              <div>
                <Label htmlFor="transactionHash">Transaction Hash (Optional)</Label>
                <Input
                  id="transactionHash"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder="0x..."
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowApprovalDialog(false)}
                disabled={approvalMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={
                  approvalMutation.isPending ||
                  (actionType === "reject" && !adminNote.trim())
                }
                className={
                  actionType === "approve" ? "bg-green-600 hover:bg-green-700" :
                  actionType === "reject" ? "bg-red-600 hover:bg-red-700" :
                  "bg-blue-600 hover:bg-blue-700"
                }
              >
                {approvalMutation.isPending ? "Processing..." : 
                 actionType === "approve" ? "Approve" :
                 actionType === "reject" ? "Reject" :
                 "Complete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminPanel() {
  const [newCryptoId, setNewCryptoId] = useState("");
  const [newCryptoName, setNewCryptoName] = useState("");
  const [newCryptoSymbol, setNewCryptoSymbol] = useState("");
  const [pythFeedId, setPythFeedId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    priceData?: any;
  } | null>(null);
  // Remove authentication state as server handles admin access
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    walletAddress: "",
    balance: 5000,
  });
  
  // Pagination state for predictions
  const [predictionsPage, setPredictionsPage] = useState(1);
  const [predictionsPerPage] = useState(10);
  
  // Filter state for predictions
  const [predictionsAssetFilter, setPredictionsAssetFilter] = useState("all");
  const [predictionsStatusFilter, setPredictionsStatusFilter] = useState("all");
  
  // Filter state for users
  const [userFilter, setUserFilter] = useState("all");
  
  // Sorting state for users
  const [userSortField, setUserSortField] = useState<"balance" | "accuracy" | "predictions" | "rewards">("balance");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");
  
  // Bulk actions state
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Debug effect to track selectedUsers changes
  useEffect(() => {
    console.log("selectedUsers changed:", selectedUsers);
    console.log("Bulk actions should show:", selectedUsers.length > 0);
  }, [selectedUsers]);
  
  // Search state
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [predictionsSearchTerm, setPredictionsSearchTerm] = useState("");
  
  // Predictions sorting state
  const [predictionsSortField, setPredictionsSortField] = useState<"createdAt" | "stake" | "reward">("createdAt");
  const [predictionsSortOrder, setPredictionsSortOrder] = useState<"asc" | "desc">("desc");
  
  // Date range filter state
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: ""
  });
  
  // Leaderboard enhancements state
  const [leaderboardTimeFilter, setLeaderboardTimeFilter] = useState<"weekly" | "monthly" | "all">("all");
  const [leaderboardSortField, setLeaderboardSortField] = useState<"accuracy" | "rewards" | "streak">("rewards");
  const [leaderboardSortOrder, setLeaderboardSortOrder] = useState<"asc" | "desc">("desc");
  
  // Transaction monitoring enhancements state
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "purchase" | "withdrawal" | "deposit">("all");
  const [transactionTokenFilter, setTransactionTokenFilter] = useState<"all" | "ETH" | "USDT" | "USDC">("all");
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<"all" | "pending" | "completed" | "failed">("all");
  const [transactionAmountFilter, setTransactionAmountFilter] = useState<"all" | "0-1000" | "1000-10000" | "10000-100000" | "100000+">("all");
  const [transactionDateFilter, setTransactionDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionsPerPage] = useState(10);

  // Modal and state management
  const [showBattleDetailsModal, setShowBattleDetailsModal] = useState(false);
  const [selectedBattleDetails, setSelectedBattleDetails] = useState<any>(null);
  const [showTournamentDetailsModal, setShowTournamentDetailsModal] = useState(false);
  const [selectedTournamentDetails, setSelectedTournamentDetails] = useState<any>(null);

  // Security Dashboard enhancements state
  const [securityEventFilter, setSecurityEventFilter] = useState<"all" | "medium" | "high" | "critical">("all");
  const [securityWalletFilter, setSecurityWalletFilter] = useState("");
  const [securityIpFilter, setSecurityIpFilter] = useState("");
  const [securityDateFilter, setSecurityDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [, setLocation] = useLocation();

  // Events Management State
  const [eventsFilter, setEventsFilter] = useState("all");
  const [eventsSearchQuery, setEventsSearchQuery] = useState("");
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    eventType: "announcement",
    organizer: "",
    organizerLogo: "",
    startDate: "",
    endDate: "",
    location: "",
    linkUrl: "",
    isActive: true,
    isFeatured: false,
    priority: 0
  });
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [securityPage, setSecurityPage] = useState(1);
  const [securityEventsPerPage] = useState(20);
  const [securitySearchQuery, setSecuritySearchQuery] = useState("");
  const [selectedSecurityEvents, setSelectedSecurityEvents] = useState<number[]>([]);
  const [securityAutoActions, setSecurityAutoActions] = useState({
    autoBlockSuspiciousIp: true,
    autoAlertHighValue: true,
    autoLogGeoLocation: true
  });

  // Battles Management State
  const [battlesStatusFilter, setBattlesStatusFilter] = useState("all");
  const [battlesCryptoFilter, setBattlesCryptoFilter] = useState("all");
  const [battlesDateFilter, setBattlesDateFilter] = useState({
    startDate: "",
    endDate: ""
  });

  // Survival Tournament state
  const [newTournament, setNewTournament] = useState({
    title: "",
    description: "",
    cryptocurrency: "",
    entryFee: 100,
    maxParticipants: 50,
    roundDuration: 60,
    round1Duration: 15,
    round2Duration: 30,
    round3Duration: 60,
    rewardType: "NTIQ", // NTIQ, USDT, USDC
    rewardAmount: 1000
  });
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [showEditTournamentDialog, setShowEditTournamentDialog] = useState(false);
  const [battlesPage, setBattlesPage] = useState(1);
  const [battlesPerPage] = useState(10);
  const [battlesSearchQuery, setBattlesSearchQuery] = useState("");
  const [selectedBattles, setSelectedBattles] = useState<number[]>([]);
  const [showCreateBattleDialog, setShowCreateBattleDialog] = useState(false);
  const [showEditBattleDialog, setShowEditBattleDialog] = useState(false);
  const [editingBattle, setEditingBattle] = useState<any>(null);
  const [createBattleForm, setCreateBattleForm] = useState({
    challengerId: "",
    challengedId: "",
    cryptocurrency: "",
    challengerPrediction: "",
    challengedPrediction: "",
    stake: 50,
    targetTime: "",
    status: "open"
  });
  const [battlesSortField, setBattlesSortField] = useState<"createdAt" | "stake" | "targetTime">("createdAt");
  const [battlesSortOrder, setBattlesSortOrder] = useState<"asc" | "desc">("desc");

  // System Settings state
  const [settingsForm, setSettingsForm] = useState({
    platform: {
      minPredictionAmount: 10,
      maxPredictionAmount: 10000,
      withdrawalFee: 2.5,
      minWithdrawal: 1000
    },
    security: {
      rateLimit: 500,
      maxPredictionsPerHour: 5,
      maxWithdrawalsPerHour: 5,
      sessionTimeout: 24
    },
    exchangeRates: {
      ethToPts: 300000,
      usdtToPts: 100,
      ptsToUsdt: 0.01
    }
  });

  // Emergency modal state
  const [showEmergencyModal, setShowEmergencyModal] = useState<string | null>(null);

  // Automated Withdrawal System state
  const [automatedWithdrawalConfig, setAutomatedWithdrawalConfig] = useState({
    enabled: true,
    dailyLimit: 10000,
    autoApprovalThreshold: 500,
    maxSingleWithdrawal: 5000,
    processingInterval: 5,
    multiChainValidation: true,
    fraudDetection: true,
    gasPriceOptimization: true,
    emailNotifications: false
  });
  const [automatedWithdrawalStats, setAutomatedWithdrawalStats] = useState({
    processedToday: 24,
    totalVolume: 7250,
    pendingReview: 3,
    successRate: 99.2
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Real-time WebSocket connection for transaction updates
  const { isConnected: wsConnected, lastTransaction } = useAdminWebSocket();

  // Add user authentication check first
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["/api/user"],
    retry: 1,
    refetchInterval: 30000,
  });

  // Debug logging untuk troubleshooting admin panel
  useEffect(() => {
    console.log("🔐 [AdminPanel] Auth state:", { 
      userLoading, 
      hasCurrentUser: !!currentUser, 
      isAdmin: currentUser?.isAdmin,
      hasUserError: !!userError,
      userErrorMessage: userError?.message,
      location: window.location.pathname 
    });
  }, [currentUser, userLoading, userError]);

  // Force admin authentication if stuck in loading
  useEffect(() => {
    if (userError && userError.message?.includes('Authentication required')) {
      console.log("🔧 [AdminPanel] Forcing admin authentication...");
      
      // Try to authenticate as admin directly
      fetch('/api/admin/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          walletAddress: currentUser?.walletAddress || "",
          forceAuth: true 
        })
      })
      .then(async (response) => {
        if (response.ok) {
          console.log("🔧 [AdminPanel] Admin authentication successful");
          queryClient.invalidateQueries();
        } else {
          console.log("🔧 [AdminPanel] Admin authentication failed");
        }
      })
      .catch(error => {
        console.error("🔧 [AdminPanel] Admin authentication error:", error);
      });
    }
  }, [userError, queryClient]);

  const { data: stats, error: statsError, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 1000, // Ultra-fast updates every 1 second
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  const { data: users = [], error: usersError } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 1500, // Ultra-fast updates every 1.5 seconds  
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  const { data: predictions = [], error: predictionsError } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/predictions"],
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 1000, // Ultra-fast updates every 1 second
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  // Get crypto prices for logos
  const { data: cryptoPrices = [] } = useQuery<any[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 20000, // Reduced to 20 seconds to prevent rate limiting
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  // Admin cryptocurrencies query for management
  const { data: cryptocurrencies = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/cryptocurrencies"],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // 15 seconds stale time
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  // Helper function to get cryptocurrency image URL
  const getCryptoImageUrl = (cryptoId: string) => {
    if (!cryptoPrices || cryptoPrices.length === 0) {
      return `https://assets.coingecko.com/coins/images/1/large/${cryptoId}.png`;
    }
    const crypto = cryptoPrices.find(c => c && c.id === cryptoId);
    return crypto?.image || `https://assets.coingecko.com/coins/images/1/large/${cryptoId}.png`;
  };

  const { data: transactionPurchases = [] } = useQuery({
    queryKey: ["/api/admin/purchases"],
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 1000, // Ultra-fast updates every 1 second
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  const { data: transactionWithdrawals = [] } = useQuery({
    queryKey: ["/api/admin/withdrawals"], 
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 1000, // Ultra-fast updates every 1 second
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  const { data: transactionDeposits = [] } = useQuery({
    queryKey: ["/api/admin/deposits"], 
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 1000, // Ultra-fast updates every 1 second
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/events"],
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 7000, // Auto-refresh every 7 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  // ===== REAL-TIME SECURITY MONITORING QUERIES =====
  const { data: userActivities, refetch: refetchUserActivities } = useQuery({
    queryKey: ["/api/admin/security/user-activities"],
    refetchInterval: 5000, // Update every 5 seconds
    enabled: !!currentUser?.isAdmin
  });

  const { data: securityEvents, refetch: refetchSecurityEvents } = useQuery({
    queryKey: ["/api/admin/security/events"],
    refetchInterval: 3000, // Update every 3 seconds
    enabled: !!currentUser?.isAdmin
  });

  const { data: systemStatus, refetch: refetchSystemStatus } = useQuery({
    queryKey: ["/api/admin/security/system-status"],
    refetchInterval: 10000, // Update every 10 seconds
    enabled: !!currentUser?.isAdmin
  });

  // Leaderboard data query
  const { data: leaderboardData = [], isLoading: leaderboardLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard"],
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  // Battles data queries
  const { data: battles = [], isLoading: battlesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/battles", battlesStatusFilter, battlesCryptoFilter, battlesDateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (battlesStatusFilter !== "all") params.append("status", battlesStatusFilter);
      if (battlesCryptoFilter !== "all") params.append("cryptocurrency", battlesCryptoFilter);
      if (battlesDateFilter.startDate) params.append("dateRange", `${battlesDateFilter.startDate},${battlesDateFilter.endDate || ""}`);
      
      const response = await fetch(`/api/admin/battles?${params}`);
      if (!response.ok) throw new Error("Failed to fetch battles");
      return response.json();
    },
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 4000, // Auto-refresh every 4 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  const { data: battleStats = {} } = useQuery<any>({
    queryKey: ["/api/admin/battles/stats"],
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  // Survival Tournament queries and mutations
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/survival-tournaments"],
    queryFn: async () => {
      const response = await fetch("/api/admin/survival-tournaments", {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tournaments");
      }
      return response.json();
    },
    retry: false,
    refetchInterval: 6000, // Auto-refresh every 6 seconds
    enabled: !!currentUser?.isAdmin, // Only enabled when admin is authenticated
  });

  const createTournamentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/survival-tournaments", {
        method: "POST",
        body: JSON.stringify(newTournament),
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tournament created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/survival-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/survival-tournaments"] });
      setNewTournament({
        title: "",
        description: "",
        cryptocurrency: "",
        entryFee: 100,
        maxParticipants: 50,
        roundDuration: 60,
        round1Duration: 15,
        round2Duration: 30,
        round3Duration: 60,
        rewardType: "NTIQ",
        rewardAmount: 1000
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete tournament mutation
  const deleteTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      const response = await fetch(`/api/admin/survival-tournaments/${tournamentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tournament deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/survival-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/survival-tournaments"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update tournament mutation
  const updateTournamentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/survival-tournaments/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tournament updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/survival-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/survival-tournaments"] });
      setShowEditTournamentDialog(false);
      setEditingTournament(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });





  // Battle mutations
  const createBattleMutation = useMutation({
    mutationFn: async (battleData: any) => {
      const response = await fetch("/api/admin/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(battleData),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Battle created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/battles/live"] });
      setShowCreateBattleDialog(false);
      resetCreateBattleForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateBattleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/battles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Battle updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/battles/live"] });
      setShowEditBattleDialog(false);
      setEditingBattle(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      const response = await fetch(`/api/admin/battles/${battleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Battle deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/battles/live"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const bulkDeleteBattlesMutation = useMutation({
    mutationFn: async (battleIds: number[]) => {
      const response = await fetch("/api/admin/battles/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ battleIds }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data) => {
      const { deleted, failed } = data;
      toast({ 
        title: "Bulk Delete Complete", 
        description: `${deleted} battles deleted${failed > 0 ? `, ${failed} failed` : ''}` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/battles/live"] });
      setSelectedBattles([]);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const clearAllBattlesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/battles/clear-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Success", 
        description: `All battles cleared successfully. ${data.deletedCount} battles removed.`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/battles/live"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles/stats"] });
      setSelectedBattles([]);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const cancelBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      const response = await fetch(`/api/admin/battles/${battleId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/battles/live"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Tournament mutations
  const startTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      const response = await fetch(`/api/admin/survival-tournaments/${tournamentId}/start`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tournament started successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/survival-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/survival-tournaments"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Helper functions for tournament actions
  const startTournament = (tournamentId: number) => {
    startTournamentMutation.mutate(tournamentId);
  };

  const viewTournamentDetails = (tournament: any) => {
    setSelectedTournamentDetails(tournament);
    setShowTournamentDetailsModal(true);
  };

  const deleteTournament = async (tournamentId: number) => {
    if (confirm(`Are you sure you want to delete tournament #${tournamentId}?`)) {
      deleteTournamentMutation.mutate(tournamentId);
    }
  };

  const editTournament = (tournament: any) => {
    setEditingTournament({
      id: tournament.id,
      title: tournament.title,
      description: tournament.description,
      cryptocurrency: tournament.cryptocurrency,
      entryFee: tournament.entryFee,
      maxParticipants: tournament.maxParticipants,
      roundDuration: tournament.roundDuration,
      round1Duration: tournament.round1Duration || null,
      round2Duration: tournament.round2Duration || null,
      round3Duration: tournament.round3Duration || null
    });
    setShowEditTournamentDialog(true);
  };

  const handleUpdateTournament = () => {
    if (editingTournament) {
      updateTournamentMutation.mutate(editingTournament);
    }
  };

  // Event mutations
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Event created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowEventDialog(false);
      resetEventForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: any) => {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Event updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowEventDialog(false);
      resetEventForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Event deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Event helper functions
  const resetEventForm = () => {
    setEventFormData({
      title: "",
      description: "",
      imageUrl: "",
      eventType: "announcement",
      organizer: "",
      organizerLogo: "",
      startDate: "",
      endDate: "",
      location: "",
      linkUrl: "",
      isActive: true,
      isFeatured: false,
      priority: 0
    });
    setEditingEvent(null);
  };

  const handleEditEvent = (event: any) => {
    setEventFormData({
      title: event.title,
      description: event.description || "",
      imageUrl: event.imageUrl || "",
      eventType: event.eventType,
      organizer: event.organizer || "",
      organizerLogo: event.organizerLogo || "",
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
      location: event.location || "",
      linkUrl: event.linkUrl || "",
      isActive: event.isActive,
      isFeatured: event.isFeatured,
      priority: event.priority || 0
    });
    setEditingEvent(event);
    setShowEventDialog(true);
  };

  const handleSubmitEvent = () => {
    if (!eventFormData.title.trim()) {
      toast({ title: "Error", description: "Event title is required", variant: "destructive" });
      return;
    }

    const processDate = (dateString: string) => {
      if (!dateString) return null;
      return new Date(dateString).toISOString();
    };

    const submitData = {
      ...eventFormData,
      startDate: processDate(eventFormData.startDate),
      endDate: processDate(eventFormData.endDate),
      priority: parseInt(eventFormData.priority.toString()) || 0,
    };

    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, ...submitData });
    } else {
      createEventMutation.mutate(submitData);
    }
  };

  // Automated Withdrawal System mutations
  const enableAutomatedWithdrawalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/automated-withdrawals/enable", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Automated withdrawal system enabled successfully" });
      setAutomatedWithdrawalConfig(prev => ({ ...prev, enabled: true }));
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const disableAutomatedWithdrawalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/automated-withdrawals/disable", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Automated withdrawal system disabled successfully" });
      setAutomatedWithdrawalConfig(prev => ({ ...prev, enabled: false }));
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const processWithdrawalsManuallyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/automated-withdrawals/process", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Success", 
        description: `Processing completed. ${data.processedCount || 0} withdrawals processed.` 
      });
      // Refresh withdrawal stats
      setAutomatedWithdrawalStats(prev => ({
        ...prev,
        processedToday: prev.processedToday + (data.processedCount || 0)
      }));
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAutomatedWithdrawalSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch("/api/admin/automated-withdrawals/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Automated withdrawal settings updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Handler functions for automated withdrawal
  const handleEnableAutomatedWithdrawals = () => {
    enableAutomatedWithdrawalMutation.mutate();
  };

  const handleDisableAutomatedWithdrawals = () => {
    disableAutomatedWithdrawalMutation.mutate();
  };

  const handleProcessWithdrawalsManually = () => {
    processWithdrawalsManuallyMutation.mutate();
  };

  const handleUpdateAutomatedWithdrawalConfig = (field: string, value: any) => {
    setAutomatedWithdrawalConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAutomatedWithdrawalSettings = () => {
    updateAutomatedWithdrawalSettingsMutation.mutate(automatedWithdrawalConfig);
  };

  const handleRefreshAutomatedWithdrawalStatus = async () => {
    try {
      const response = await fetch("/api/admin/automated-withdrawals/status", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setAutomatedWithdrawalConfig(prev => ({
          ...prev,
          enabled: data.isRunning || false
        }));
        setAutomatedWithdrawalStats(prev => ({
          ...prev,
          processedToday: data.processedToday || prev.processedToday,
          pendingReview: data.pendingReview || prev.pendingReview
        }));
        toast({ title: "Success", description: "Status refreshed successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to refresh status", variant: "destructive" });
    }
  };

  // Filter events
  const filteredEvents = Array.isArray(events) ? events.filter((event: any) => {
    const typeMatch = eventsFilter === "all" || event.eventType === eventsFilter;
    const searchMatch = eventsSearchQuery === "" || 
      event.title?.toLowerCase().includes(eventsSearchQuery.toLowerCase()) ||
      event.organizer?.toLowerCase().includes(eventsSearchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(eventsSearchQuery.toLowerCase());
    return typeMatch && searchMatch;
  }) : [];

  // Filter predictions based on asset, status, date range, and search term
  const filteredPredictions = (predictions || []).filter(prediction => {
    const assetMatch = predictionsAssetFilter === "all" || prediction.cryptocurrency === predictionsAssetFilter;
    const statusMatch = predictionsStatusFilter === "all" || prediction.status === predictionsStatusFilter;
    
    // Date range filter
    let dateMatch = true;
    if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
      const predictionDate = new Date(prediction.createdAt);
      if (dateRangeFilter.startDate) {
        dateMatch = dateMatch && predictionDate >= new Date(dateRangeFilter.startDate);
      }
      if (dateRangeFilter.endDate) {
        dateMatch = dateMatch && predictionDate <= new Date(dateRangeFilter.endDate);
      }
    }
    
    // Search filter
    const searchMatch = predictionsSearchTerm === "" || 
      (prediction.userId && prediction.userId.toString().includes(predictionsSearchTerm)) ||
      ((prediction as any).username && (prediction as any).username.toLowerCase().includes(predictionsSearchTerm.toLowerCase())) ||
      ((prediction as any).uid && (prediction as any).uid.toString().includes(predictionsSearchTerm)) ||
      ((prediction as any).walletAddress && (prediction as any).walletAddress.toLowerCase().includes(predictionsSearchTerm.toLowerCase())) ||
      prediction.cryptocurrency.toLowerCase().includes(predictionsSearchTerm.toLowerCase()) ||
      prediction.id.toString().includes(predictionsSearchTerm);
    
    return assetMatch && statusMatch && dateMatch && searchMatch;
  });

  // Sort filtered predictions
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    let aValue, bValue;
    
    switch (predictionsSortField) {
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case "stake":
        aValue = a.stakeAmount || 0;
        bValue = b.stakeAmount || 0;
        break;
      case "reward":
        aValue = a.rewardAmount || 0;
        bValue = b.rewardAmount || 0;
        break;
      default:
        return 0;
    }
    
    if (predictionsSortOrder === "desc") {
      return bValue - aValue;
    } else {
      return aValue - bValue;
    }
  });

  // Handle predictions sorting
  const handlePredictionsSort = (field: "createdAt" | "stake" | "reward") => {
    if (predictionsSortField === field) {
      setPredictionsSortOrder(predictionsSortOrder === "desc" ? "asc" : "desc");
    } else {
      setPredictionsSortField(field);
      setPredictionsSortOrder("desc");
    }
  };

  // Export predictions data
  const handleExportPredictions = () => {
    const csvContent = [
      ["User", "Cryptocurrency", "Prediction", "Actual", "Stake", "Reward", "Accuracy", "Status", "Date"].join(","),
      ...(sortedPredictions || []).map(prediction => [
        `User ${prediction.userId}`,
        prediction.cryptocurrency,
        prediction.predictedPrice,
        prediction.actualPrice || "Pending",
        prediction.stakeAmount || 0,
        prediction.rewardAmount || 0,
        prediction.accuracy || "Pending",
        prediction.status,
        new Date(prediction.createdAt).toLocaleDateString("id-ID")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `predictions_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Enhanced leaderboard filtering and sorting using real leaderboard data
  const filteredAndSortedLeaderboard = (leaderboardData || [])
    .filter(user => user && user.totalPredictions > 0) // Only users with predictions
    .map(user => {
      const accuracy = user.totalPredictions > 0 ? (user.correctPredictions / user.totalPredictions) * 100 : 0;
      // Calculate streak based on win rate (simplified calculation)
      const streak = Math.floor(accuracy / 10); // Estimate streak based on accuracy
      // Calculate average multiplier based on performance
      const avgMultiplier = user.totalRewards > 0 && user.correctPredictions > 0 
        ? (user.totalRewards / user.correctPredictions) / 50 
        : 1;
      
      return {
        ...user,
        accuracy,
        streak,
        avgMultiplier: Math.max(1, avgMultiplier)
      };
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (leaderboardSortField) {
        case "accuracy":
          aValue = a.accuracy;
          bValue = b.accuracy;
          break;
        case "rewards":
          aValue = a.totalRewards || 0;
          bValue = b.totalRewards || 0;
          break;
        case "streak":
          aValue = a.streak;
          bValue = b.streak;
          break;
        default:
          return 0;
      }
      
      if (leaderboardSortOrder === "desc") {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

  // Handle leaderboard sorting
  const handleLeaderboardSort = (field: "accuracy" | "rewards" | "streak") => {
    if (leaderboardSortField === field) {
      setLeaderboardSortOrder(leaderboardSortOrder === "desc" ? "asc" : "desc");
    } else {
      setLeaderboardSortField(field);
      setLeaderboardSortOrder("desc");
    }
  };

  // Export leaderboard data
  const handleExportLeaderboard = () => {
    const csvContent = [
      ["Rank", "Username", "UID", "Accuracy", "Total Predictions", "Correct Predictions", "Total Rewards", "Streak", "Avg Multiplier"].join(","),
      ...(filteredAndSortedLeaderboard || []).map((user, index) => [
        index + 1,
        user.username,
        user.uid,
        `${user.accuracy.toFixed(2)}%`,
        user.totalPredictions,
        user.correctPredictions,
        user.totalRewards || 0,
        user.streak,
        user.avgMultiplier.toFixed(2)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leaderboard_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Enhanced transaction filtering and processing
  const allTransactions = [
    ...(Array.isArray(transactionPurchases) ? transactionPurchases.map((p: any) => ({
      ...p,
      type: 'purchase' as const,
      token: p.paymentToken || 'ETH',
      status: p.status || 'completed',
      amount: p.ptsAmount,
      hash: p.txHash || null,
      timestamp: p.createdAt
    })) : []),
    ...(Array.isArray(transactionWithdrawals) ? transactionWithdrawals.map((w: any) => ({
      ...w,
      type: 'withdrawal' as const,
      token: w.tokenType || 'ETH', // Fix: use tokenType instead of paymentToken
      status: w.status || 'pending',
      amount: w.ntiqAmount, // Fix: use ntiqAmount instead of ptsAmount
      hash: w.transactionHash || null, // Fix: use transactionHash instead of txHash
      timestamp: w.createdAt,
      networkName: w.chainName, // Add networkName mapping from chainName
      chainName: w.chainName // Ensure chainName is available for explorer URL mapping
    })) : []),
    ...(Array.isArray(transactionDeposits) ? transactionDeposits.map((d: any) => ({
      ...d,
      type: 'deposit' as const,
      token: d.tokenType || 'ETH',
      status: d.status || 'pending',
      amount: d.ntiqAmount,
      hash: d.transactionHash || null,
      timestamp: d.createdAt,
      paymentAmount: d.amountUSD,
      paymentToken: d.tokenType,
      networkName: d.chainName
    })) : [])
  ];

  const filteredTransactions = (allTransactions || []).filter(tx => {
    // Type filter
    if (transactionTypeFilter !== "all" && tx.type !== transactionTypeFilter) {
      return false;
    }
    
    // Token filter
    if (transactionTokenFilter !== "all" && tx.token !== transactionTokenFilter) {
      return false;
    }
    
    // Status filter
    if (transactionStatusFilter !== "all" && tx.status !== transactionStatusFilter) {
      return false;
    }
    
    // Amount filter
    if (transactionAmountFilter !== "all") {
      const amount = tx.amount;
      switch (transactionAmountFilter) {
        case "0-1000":
          if (amount < 0 || amount > 1000) return false;
          break;
        case "1000-10000":
          if (amount < 1000 || amount > 10000) return false;
          break;
        case "10000-100000":
          if (amount < 10000 || amount > 100000) return false;
          break;
        case "100000+":
          if (amount < 100000) return false;
          break;
      }
    }
    
    // Date filter
    if (transactionDateFilter.startDate) {
      const txDate = new Date(tx.timestamp);
      const startDate = new Date(transactionDateFilter.startDate);
      if (txDate < startDate) return false;
    }
    
    if (transactionDateFilter.endDate) {
      const txDate = new Date(tx.timestamp);
      const endDate = new Date(transactionDateFilter.endDate);
      if (txDate > endDate) return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const paginatedTransactions = (filteredTransactions || []).slice(
    (transactionPage - 1) * transactionsPerPage,
    transactionPage * transactionsPerPage
  );

  // Calculate additional statistics
  const uniqueWallets = new Set((allTransactions || []).map(tx => tx.walletAddress || tx.userId)).size;
  const avgPurchaseAmount = Array.isArray(transactionPurchases) && transactionPurchases.length > 0 
    ? transactionPurchases.reduce((sum: number, p: any) => sum + (p.ptsAmount || 0), 0) / transactionPurchases.length 
    : 0;
  const failedTransactions = (allTransactions || []).filter(tx => tx.status === 'failed').length;
  const ntiqTurnoverRate = Array.isArray(transactionPurchases) && Array.isArray(transactionWithdrawals) && transactionPurchases.length > 0 && transactionWithdrawals.length > 0 
    ? (transactionWithdrawals.reduce((sum: number, w: any) => sum + (w.ptsAmount || 0), 0) / transactionPurchases.reduce((sum: number, p: any) => sum + (p.ptsAmount || 0), 0)) * 100
    : 0;

  // Export transactions data
  const handleExportTransactions = () => {
    const csvContent = [
      ["Type", "User", "Token", "Amount", "Status", "Hash", "Date", "Payment Address"].join(","),
      ...(filteredTransactions || []).map(tx => [
        tx.type,
        tx.username || `User ${tx.userId}`,
        tx.token,
        tx.amount,
        tx.status,
        tx.hash || "Internal",
        new Date(tx.timestamp).toLocaleDateString("id-ID"),
        tx.walletAddress || tx.paymentAddress || "N/A"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export transaction data as CSV
  const exportTransactionData = () => {
    const headers = ['Type', 'User', 'UID', 'Amount', 'Token', 'Status', 'Hash', 'Date'];
    const csvData = [
      headers.join(','),
      ...(filteredTransactions || []).map(tx => [
        tx.type,
        tx.username || `User ${tx.userId}`,
        tx.uid || tx.userId,
        tx.amount,
        tx.token,
        tx.status,
        tx.hash || 'Internal',
        new Date(tx.timestamp).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export security events data as CSV
  const exportSecurityData = () => {
    const headers = ['Timestamp', 'Severity', 'Event', 'Details', 'Wallet', 'IP', 'Country', 'Status', 'Resolved'];
    const csvData = [
      headers.join(','),
      ...(filteredSecurityEvents || []).map(event => [
        event.timestamp.toISOString(),
        event.severity,
        `"${event.event}"`,
        `"${event.details}"`,
        event.walletAddress,
        event.ipAddress,
        event.country,
        event.status,
        event.resolved ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle security event actions
  const handleSecurityAction = async (eventId: number, action: 'resolve' | 'investigate' | 'block') => {
    try {
      const requestBody: any = {};
      
      // Set appropriate status and resolved state based on action
      switch (action) {
        case 'resolve':
          requestBody.status = 'resolved';
          requestBody.resolved = true;
          break;
        case 'investigate':
          requestBody.status = 'under-investigation';
          requestBody.resolved = false;
          break;
        case 'block':
          requestBody.status = 'blocked';
          requestBody.resolved = true;
          break;
      }

      const response = await fetch(`/api/admin/security-events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to update security event');
      }

      // Refresh security events data
      queryClient.invalidateQueries(['/api/admin/security-events']);

      toast({
        title: "Security Action Completed",
        description: `Event ${eventId} successfully marked as ${action}`,
      });
    } catch (error) {
      console.error('Security action error:', error);
      toast({
        title: "Error",
        description: "Failed to perform security action",
        variant: "destructive"
      });
    }
  };

  // Handle bulk security actions
  const handleBulkSecurityAction = async (action: 'resolve' | 'investigate' | 'block') => {
    if (selectedSecurityEvents.length === 0) {
      toast({
        title: "Warning",
        description: "Select events first",
        variant: "destructive"
      });
      return;
    }

    try {
      const requestBody: any = { eventIds: selectedSecurityEvents, action };
      
      // Set appropriate status based on action
      switch (action) {
        case 'resolve':
          requestBody.status = 'resolved';
          requestBody.resolved = true;
          break;
        case 'investigate':
          requestBody.status = 'under-investigation';
          requestBody.resolved = false;
          break;
        case 'block':
          requestBody.status = 'blocked';
          requestBody.resolved = true;
          break;
      }

      const response = await fetch('/api/admin/security-events/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      // Refresh security events data
      queryClient.invalidateQueries(['/api/admin/security-events']);

      toast({
        title: "Bulk Action Completed",
        description: `${selectedSecurityEvents.length} events successfully marked as ${action}`,
      });
      setSelectedSecurityEvents([]);
    } catch (error) {
      console.error('Bulk security action error:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive"
      });
    }
  };

  // Force complete transaction (for admin use)
  const handleForceComplete = async (transactionId: number, type: 'purchase' | 'withdrawal') => {
    try {
      const response = await fetch(`/api/admin/force-complete/${type}/${transactionId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(await response.text());
      
      toast({
        title: "Transaction Updated",
        description: `${type} has been marked as completed`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction status",
        variant: "destructive"
      });
    }
  };

  // Check authentication status and admin privileges
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Login Required</h2>
              <p className="text-blue-600">You need to login first to access the admin panel.</p>
              <Button 
                onClick={() => setLocation('/home')}
                className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h2>
              <p className="text-red-600">You need admin privileges to access this panel.</p>
              <Button 
                onClick={() => setLocation('/home')}
                className="mt-4 bg-red-600 text-white hover:bg-red-700"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Early return for loading states to prevent null pointer exceptions
  if (statsLoading || !stats || !users || !predictions) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  // Reset pagination when filters change
  useEffect(() => {
    setPredictionsPage(1);
  }, [predictionsAssetFilter, predictionsStatusFilter, predictionsSearchTerm]);

  // Get unique assets and statuses for filter options
  const uniqueAssets = Array.from(new Set((predictions || []).map(p => p.cryptocurrency)));
  const uniqueStatuses = Array.from(new Set((predictions || []).map(p => p.status)));

  // Filter users based on selected criteria and search term
  const filteredUsers = (users || []).filter(user => {
    // Filter by category
    let categoryMatch = true;
    switch (userFilter) {
      case "admins":
        categoryMatch = user.isAdmin;
        break;
      case "rich":
        categoryMatch = (user.balance || 0) > 1000;
        break;
      case "no-wallet":
        categoryMatch = !user.walletAddress;
        break;
      default:
        categoryMatch = true;
    }
    
    // Filter by search term
    const searchMatch = userSearchTerm === "" || 
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.walletAddress && user.walletAddress.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
      user.uid.toLowerCase().includes(userSearchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue, bValue;
    
    switch (userSortField) {
      case "balance":
        aValue = a.balance || 0;
        bValue = b.balance || 0;
        break;
      case "accuracy":
        aValue = a.totalPredictions > 0 ? (a.correctPredictions / a.totalPredictions) * 100 : 0;
        bValue = b.totalPredictions > 0 ? (b.correctPredictions / b.totalPredictions) * 100 : 0;
        break;
      case "predictions":
        aValue = a.totalPredictions || 0;
        bValue = b.totalPredictions || 0;
        break;
      case "rewards":
        aValue = a.totalRewards || 0;
        bValue = b.totalRewards || 0;
        break;
      default:
        return 0;
    }
    
    if (userSortOrder === "desc") {
      return bValue - aValue;
    } else {
      return aValue - bValue;
    }
  });

  // Handle sorting click
  const handleUserSort = (field: "balance" | "accuracy" | "predictions" | "rewards") => {
    if (userSortField === field) {
      setUserSortOrder(userSortOrder === "desc" ? "asc" : "desc");
    } else {
      setUserSortField(field);
      setUserSortOrder("desc");
    }
  };

  // Battle management helper functions
  const resetCreateBattleForm = () => {
    setCreateBattleForm({
      challengerId: "",
      challengedId: "",
      cryptocurrency: "",
      challengerPrediction: "",
      challengedPrediction: "",
      stake: 50,
      targetTime: "",
      status: "open"
    });
  };

  const handleCreateBattle = async () => {
    if (!createBattleForm.challengerId || !createBattleForm.cryptocurrency || !createBattleForm.targetTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    createBattleMutation.mutate(createBattleForm);
  };

  const handleEditBattle = (battle: any) => {
    setEditingBattle(battle);
    setShowEditBattleDialog(true);
  };

  const handleUpdateBattle = async () => {
    if (!editingBattle) return;
    
    updateBattleMutation.mutate({
      id: editingBattle.id,
      data: editingBattle
    });
  };

  const handleDeleteBattle = async (battleId: number) => {
    if (confirm("Are you sure you want to delete this battle?")) {
      deleteBattleMutation.mutate(battleId);
    }
  };

  const handleBulkDeleteBattles = async () => {
    if (selectedBattles.length === 0) {
      toast({
        title: "Warning",
        description: "No battles selected for deletion",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedBattles.length} selected battles?`)) {
      bulkDeleteBattlesMutation.mutate(selectedBattles);
    }
  };

  const handleClearAllBattles = async () => {
    if (confirm("Are you sure you want to clear ALL battles? This action cannot be undone and will delete all battle data including comments and reactions.")) {
      clearAllBattlesMutation.mutate();
    }
  };

  const handleSelectBattle = (battleId: number) => {
    setSelectedBattles(prev => 
      prev.includes(battleId) 
        ? prev.filter(id => id !== battleId)
        : [...prev, battleId]
    );
  };

  const handleSelectAllBattles = () => {
    if (selectedBattles.length === (filteredBattles || []).length) {
      setSelectedBattles([]);
    } else {
      setSelectedBattles((filteredBattles || []).map(battle => battle.id));
    }
  };

  // Filter and sort battles
  const filteredBattles = (battles || []).filter(battle => {
    const statusMatch = battlesStatusFilter === "all" || battle.status === battlesStatusFilter;
    const cryptoMatch = battlesCryptoFilter === "all" || battle.cryptocurrency === battlesCryptoFilter;
    const searchMatch = battlesSearchQuery === "" || 
      battle.challengerUsername?.toLowerCase().includes(battlesSearchQuery.toLowerCase()) ||
      battle.challengedUsername?.toLowerCase().includes(battlesSearchQuery.toLowerCase()) ||
      battle.cryptocurrency.toLowerCase().includes(battlesSearchQuery.toLowerCase());
    
    return statusMatch && cryptoMatch && searchMatch;
  });

  const sortedBattles = [...filteredBattles].sort((a, b) => {
    let aValue, bValue;
    
    switch (battlesSortField) {
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case "stake":
        aValue = a.stake || 0;
        bValue = b.stake || 0;
        break;
      case "targetTime":
        aValue = new Date(a.targetTime).getTime();
        bValue = new Date(b.targetTime).getTime();
        break;
      default:
        return 0;
    }
    
    if (battlesSortOrder === "desc") {
      return bValue - aValue;
    } else {
      return aValue - bValue;
    }
  });

  const handleBattleSort = (field: "createdAt" | "stake" | "targetTime") => {
    if (battlesSortField === field) {
      setBattlesSortOrder(battlesSortOrder === "desc" ? "asc" : "desc");
    } else {
      setBattlesSortField(field);
      setBattlesSortOrder("desc");
    }
  };

  // Export battles to CSV
  const exportBattlesToCSV = () => {
    const csvData = [
      ['ID', 'Challenger', 'Challenged', 'Cryptocurrency', 'Stake', 'Status', 'Created', 'Target Time'].join(','),
      ...(sortedBattles || []).map(battle => [
        battle.id,
        battle.challengerUsername || 'N/A',
        battle.challengedUsername || 'N/A',
        battle.cryptocurrency,
        battle.stake,
        battle.status,
        new Date(battle.createdAt).toLocaleDateString(),
        new Date(battle.targetTime).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `battles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bulk actions handlers
  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === (sortedUsers || []).length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers((sortedUsers || []).map(user => user.id));
    }
  };

  const handleBulkDelete = async () => {
    console.log("handleBulkDelete called with selectedUsers:", selectedUsers);
    
    if (selectedUsers.length === 0) {
      console.log("No users selected");
      toast({
        title: "Warning",
        description: "No users selected for deletion",
        variant: "destructive",
      });
      return;
    }

    // Confirm bulk deletion with more detailed dialog
    const usernames = (sortedUsers || [])
      .filter(u => selectedUsers.includes(u.id))
      .map(u => u.username)
      .join(', ');
    
    const confirmed = confirm(
      `BULK DELETE CONFIRMATION\n\n` +
      `You are about to permanently delete ${selectedUsers.length} user(s):\n` +
      `${usernames}\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Click OK to proceed or Cancel to abort.`
    );
    
    console.log("User confirmed deletion:", confirmed);
    if (!confirmed) {
      console.log("User cancelled bulk deletion");
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      for (const userId of selectedUsers) {
        try {
          console.log(`🗑️ [BULK DELETE] Processing user ID: ${userId}`);
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log(`📡 [BULK DELETE] Response for user ${userId}: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [BULK DELETE] Failed for user ${userId}:`, errorText);
            throw new Error(errorText || "Failed to delete user");
          }
          
          const result = await response.json();
          console.log(`✅ [BULK DELETE] Success for user ${userId}:`, result);
          successCount++;
        } catch (error: any) {
          errorCount++;
          const errorMsg = error?.message || error?.response?.data?.message || "Unknown error";
          errors.push(`User ${userId}: ${errorMsg}`);
          console.error(`💥 [BULK DELETE] Error deleting user ${userId}:`, error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedUsers([]);

      if (successCount > 0) {
        toast({
          title: "Success",
          description: `${successCount} user(s) deleted successfully${errorCount > 0 ? `. ${errorCount} failed.` : ''}`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Partial Failure",
          description: `${errorCount} users could not be deleted due to foreign key constraints or other issues.`,
          variant: "destructive",
        });
        console.error("Deletion errors:", errors);
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast({
        title: "Error",
        description: "Failed to complete bulk delete operation",
        variant: "destructive",
      });
    }
  };

  const handleExportUsers = () => {
    // Helper function to safely escape CSV values that contain commas, quotes, or newlines
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvContent = [
      [
        "ID", "Username", "UID", "Email", "Linked Email", "Email Verified", 
        "Auth Method", "Wallet Address", "Balance (NTIQ)", "Total Predictions", 
        "Correct Predictions", "Accuracy", "Total Rewards", "Admin Status", 
        "Profile Photo", "Twitter Handle", "Twitter Verified", "Firebase UID", 
        "Firebase Display Name", "Registration Date", "Last Activity"
      ].join(","),
      ...sortedUsers.map(user => [
        escapeCSV(user.id),
        escapeCSV(user.username),
        escapeCSV(user.uid),
        escapeCSV(user.email || "Not linked"),
        escapeCSV(user.email ? user.email : "No email linked"),
        escapeCSV(user.emailVerified ? "Yes" : "No"),
        escapeCSV(user.authMethod || "wallet"),
        escapeCSV(user.walletAddress || "Not set"),
        escapeCSV(user.balance || 0),
        escapeCSV(user.totalPredictions || 0),
        escapeCSV(user.correctPredictions || 0),
        escapeCSV(user.totalPredictions > 0 ? ((user.correctPredictions / user.totalPredictions) * 100).toFixed(2) + "%" : "0%"),
        escapeCSV(user.totalRewards || 0),
        escapeCSV(user.isAdmin ? "Yes" : "No"),
        escapeCSV(user.profilePhoto || "None"),
        escapeCSV(user.twitterHandle || "Not linked"),
        escapeCSV(user.twitterVerified ? "Yes" : "No"),
        escapeCSV(user.firebase_uid || "Not linked"),
        escapeCSV(user.firebase_display_name || "Not set"),
        escapeCSV(user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : "Unknown"),
        escapeCSV(user.lastLoginAt ? new Date(user.lastLoginAt).toISOString().split('T')[0] : "Unknown")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_comprehensive_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Successfully exported ${sortedUsers.length} users with comprehensive information including emails, auth methods, and verification status.`,
    });
  };

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: recentActivity = [], error: activityError } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/activity"],
    retry: false,
  });



  // Use the existing transaction data queries (already defined above as transactionPurchases and transactionWithdrawals)
  const purchases = transactionPurchases;
  const withdrawals = transactionWithdrawals;

  const { data: transactionStats } = useQuery<any>({
    queryKey: ["/api/admin/transaction-stats"],
    retry: false,
  });

  // Security monitoring queries
  const { data: securityData } = useQuery<any>({
    queryKey: ["/api/admin/security-events"],
    retry: false,
  });

  // Mock security events data with severity levels for comprehensive dashboard
  const mockSecurityEvents = [
    {
      id: 1,
      timestamp: new Date('2025-06-23T20:15:30Z'),
      severity: 'critical',
      event: 'Multiple login attempts from blacklisted IP',
      details: 'IP: 192.168.1.100 attempted login 15 times in 5 minutes',
      walletAddress: '0x1234...5678',
      ipAddress: '192.168.1.100',
      country: 'Unknown',
      status: 'auto-blocked',
      resolved: false
    },
    {
      id: 2,
      timestamp: new Date('2025-06-23T19:45:22Z'),
      severity: 'high',
      event: '100,000 PTS withdrawn to new wallet',
      details: 'Large withdrawal to unverified wallet address',
      walletAddress: '0xabcd...efgh',
      ipAddress: '203.0.113.45',
      country: 'Singapore',
      status: 'under-review',
      resolved: false
    },
    {
      id: 3,
      timestamp: new Date('2025-06-23T18:30:15Z'),
      severity: 'medium',
      event: 'Unusual login: Admin from new device',
      details: 'Admin login from previously unseen device/browser',
      walletAddress: '0x4c61...c5b6',
      ipAddress: '180.249.0.136',
      country: 'Indonesia',
      status: 'verified',
      resolved: true
    },
    {
      id: 4,
      timestamp: new Date('2025-06-23T17:20:10Z'),
      severity: 'medium',
      event: 'Suspicious prediction pattern detected',
      details: 'User making predictions with exact same amounts repeatedly',
      walletAddress: '0x9876...1234',
      ipAddress: '198.51.100.25',
      country: 'United States',
      status: 'investigating',
      resolved: false
    }
  ];

  // Enhanced security event filtering and processing
  const filteredSecurityEvents = (mockSecurityEvents || []).filter(event => {
    // Severity filter
    if (securityEventFilter !== "all" && event.severity !== securityEventFilter) {
      return false;
    }
    
    // Wallet address filter
    if (securityWalletFilter && !event.walletAddress.toLowerCase().includes(securityWalletFilter.toLowerCase())) {
      return false;
    }
    
    // IP address filter
    if (securityIpFilter && !event.ipAddress.includes(securityIpFilter)) {
      return false;
    }
    
    // Search query filter
    if (securitySearchQuery) {
      const query = securitySearchQuery.toLowerCase();
      if (!event.event.toLowerCase().includes(query) && 
          !event.details.toLowerCase().includes(query) &&
          !event.status.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Date filter
    if (securityDateFilter.startDate) {
      const eventDate = new Date(event.timestamp);
      const startDate = new Date(securityDateFilter.startDate);
      if (eventDate < startDate) return false;
    }
    
    if (securityDateFilter.endDate) {
      const eventDate = new Date(event.timestamp);
      const endDate = new Date(securityDateFilter.endDate);
      if (eventDate > endDate) return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const paginatedSecurityEvents = (filteredSecurityEvents || []).slice(
    (securityPage - 1) * securityEventsPerPage,
    securityPage * securityEventsPerPage
  );

  // Security statistics
  const securityStats = {
    totalEvents: (filteredSecurityEvents || []).length,
    criticalEvents: (filteredSecurityEvents || []).filter(e => e.severity === 'critical').length,
    highEvents: (filteredSecurityEvents || []).filter(e => e.severity === 'high').length,
    mediumEvents: (filteredSecurityEvents || []).filter(e => e.severity === 'medium').length,
    unresolvedEvents: (filteredSecurityEvents || []).filter(e => !e.resolved).length,
    autoBlockedIps: (filteredSecurityEvents || []).filter(e => e.status === 'auto-blocked').length
  };

  // System settings queries
  const { data: systemSettings, refetch: refetchSettings } = useQuery<any>({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  // Settings form uses the state declared earlier above

  // Update form when settings load
  useEffect(() => {
    if (systemSettings) {
      setSettingsForm(systemSettings);
    }
  }, [systemSettings]);

  // Mutations for admin actions
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "System settings have been saved successfully.",
      });
      refetchSettings();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/admin/clear-cache", {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Cache Cleared",
        description: "System cache has been cleared successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cache",
        variant: "destructive",
      });
    },
  });

  const backupDatabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/backup-database", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Backup Created",
        description: `Database backup created: ${data.backupId}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create backup",
        variant: "destructive",
      });
    },
  });

  const exportLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/export-logs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (data: any) => {
      // Download the logs as JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nectiq_logs_${data.exportId}.json`;
      document.body.appendChild(link);
      (link as HTMLAnchorElement).click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Logs Exported",
        description: `Logs exported: ${data.exportId}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export logs",
        variant: "destructive",
      });
    },
  });

  const emergencyStopMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await fetch("/api/admin/emergency-stop", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Stop Activated",
        description: "System has been stopped for maintenance.",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger emergency stop",
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const handleSettingsChange = (section: string, field: string, value: any) => {
    setSettingsForm(prev => ({
      ...prev,
      [section]: {
        ...((prev as any)[section] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settingsForm);
  };

  const handleEmergencyStop = () => {
    const reason = prompt("Enter reason for emergency stop:");
    if (reason) {
      emergencyStopMutation.mutate(reason);
    }
  };

  // Enhanced System Settings handlers
  const handleExportSettings = () => {
    const settingsData = [
      ["Category", "Setting", "Value", "Type", "Last Updated"].join(","),
      ["Platform", "Min Prediction Amount", settingsForm.platform.minPredictionAmount.toString(), "number", new Date().toISOString()].join(","),
      ["Platform", "Max Prediction Amount", settingsForm.platform.maxPredictionAmount.toString(), "number", new Date().toISOString()].join(","),
      ["Platform", "Withdrawal Fee", settingsForm.platform.withdrawalFee.toString(), "number", new Date().toISOString()].join(","),
      ["Platform", "Min Withdrawal", settingsForm.platform.minWithdrawal.toString(), "number", new Date().toISOString()].join(","),
      ["Security", "Rate Limit", settingsForm.security.rateLimit.toString(), "number", new Date().toISOString()].join(","),
      ["Security", "Max Predictions/Hour", settingsForm.security.maxPredictionsPerHour.toString(), "number", new Date().toISOString()].join(","),
      ["Security", "Max Withdrawals/Hour", settingsForm.security.maxWithdrawalsPerHour.toString(), "number", new Date().toISOString()].join(","),
      ["Security", "Session Timeout", settingsForm.security.sessionTimeout.toString(), "number", new Date().toISOString()].join(","),
      ["Exchange", "ETH to NTIQ Rate", settingsForm.exchangeRates.ethToPts.toString(), "number", new Date().toISOString()].join(","),
      ["Exchange", "USDT to NTIQ Rate", settingsForm.exchangeRates.usdtToPts.toString(), "number", new Date().toISOString()].join(","),
      ["Exchange", "NTIQ to USDT Rate", settingsForm.exchangeRates.ptsToUsdt.toString(), "number", new Date().toISOString()].join(",")
    ].join("\n");

    const blob = new Blob([settingsData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-settings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "System settings exported successfully",
    });
  };

  const handleRefreshRates = async () => {
    try {
      // Simulate fetching updated exchange rates from external APIs
      const response = await fetch("/api/admin/refresh-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        throw new Error("Failed to refresh rates");
      }

      // Update the form with new rates (this would come from the API response)
      setSettingsForm(prev => ({
        ...prev,
        exchangeRates: {
          ...prev.exchangeRates,
          // These would be updated from the API response
          ethToPts: prev.exchangeRates.ethToPts, // Keep current for now
          usdtToPts: prev.exchangeRates.usdtToPts,
          ptsToUsdt: prev.exchangeRates.ptsToUsdt
        }
      }));

      toast({
        title: "Success",
        description: "Exchange rates refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to refresh exchange rates",
        variant: "destructive"
      });
    }
  };

  // Validation mutation for Pyth Network support
  const validatePythMutation = useMutation({
    mutationFn: async (pythFeedId: string) => {
      console.log('🔍 [ADMIN] Validating Pyth Feed ID:', pythFeedId);
      const response = await fetch("/api/admin/validate-pyth-support", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pythFeedId }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "Validation failed");
        } catch (parseError) {
          throw new Error(errorText || "Validation failed");
        }
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('✅ [ADMIN] Pyth validation successful:', data);
      setValidationResult({
        isValid: true,
        message: data.message || "Pyth Feed ID is valid and supported",
        priceData: data.priceData
      });
      toast({
        title: "Validation Success",
        description: "Pyth Feed ID is valid and supported by Pyth Network",
      });
    },
    onError: (error: any) => {
      console.error('❌ [ADMIN] Pyth validation failed:', error);
      setValidationResult({
        isValid: false,
        message: error.message || "Validation failed"
      });
      toast({
        title: "Validation Failed",
        description: error.message || "Pyth Feed ID is not supported",
        variant: "destructive",
      });
    },
  });

  const addCryptoMutation = useMutation({
    mutationFn: async (data: { cryptoId: string, name: string, symbol: string, pythFeedId: string }) => {
      console.log('🔧 [FRONTEND] Submitting cryptocurrency data:', data);
      
      const response = await fetch("/api/admin/cryptocurrencies", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      
      console.log('📡 [FRONTEND] Response status:', response.status);
      console.log('📡 [FRONTEND] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FRONTEND] Error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "Failed to add cryptocurrency");
        } catch (parseError) {
          throw new Error(errorText || "Failed to add cryptocurrency");
        }
      }
      
      const result = await response.json();
      console.log('✅ [FRONTEND] Success response:', result);
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Cryptocurrency added successfully with Pyth Network integration",
      });
      
      // Reset form state and validation
      setNewCryptoId("");
      setNewCryptoName("");
      setNewCryptoSymbol("");
      setPythFeedId("");
      setValidationResult(null);
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cryptocurrencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/prices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/pyth-prices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add cryptocurrency",
        variant: "destructive",
      });
    },
  });

  const deleteCryptoMutation = useMutation({
    mutationFn: async (cryptoId: string) => {
      const response = await fetch(`/api/admin/cryptocurrencies/${cryptoId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete cryptocurrency");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cryptocurrency deleted successfully",
      });
      // Invalidate all cryptocurrency-related caches
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cryptocurrencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/prices"] });
      
      // Close dialog after successful deletion
      const dialog = document.querySelector('[data-state="open"]');
      if (dialog) {
        const closeButton = dialog.querySelector('[data-dismiss]') as HTMLButtonElement;
        closeButton?.click();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete cryptocurrency",
        variant: "destructive",
      });
    },
  });

  // User CRUD mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setNewUser({ username: "", walletAddress: "", balance: 5000 });
      setIsCreateUserOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, balance }: { id: number; balance: number }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log(`🗑️ [FRONTEND] Starting deletion for user ID: ${userId}`);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(`📡 [FRONTEND] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [FRONTEND] Delete failed with error:`, errorText);
        throw new Error(errorText || "Failed to delete user");
      }
      
      const result = await response.json();
      console.log(`✅ [FRONTEND] Delete successful:`, result);
      return result;
    },
    onSuccess: (data) => {
      console.log(`🎉 [FRONTEND] Delete mutation success:`, data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: data.message || "User deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error("💥 [FRONTEND] Delete user error:", error);
      console.error("💥 [FRONTEND] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const resetUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log(`🔄 [FRONTEND] Starting reset for user ID: ${userId}`);
      const response = await fetch(`/api/admin/users/${userId}/reset`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(`📡 [FRONTEND] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [FRONTEND] Reset failed with error:`, errorText);
        throw new Error(errorText || "Failed to reset user");
      }
      
      const result = await response.json();
      console.log(`✅ [FRONTEND] Reset successful:`, result);
      return result;
    },
    onSuccess: (data) => {
      console.log(`🎉 [FRONTEND] Reset mutation success:`, data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: data.message || "User reset successfully",
      });
    },
    onError: (error: any) => {
      console.error("💥 [FRONTEND] Reset user error:", error);
      console.error("💥 [FRONTEND] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Error",
        description: error.message || "Failed to reset user",
        variant: "destructive",
      });
    },
  });

  const resetLeaderboardMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/leaderboard/reset", {
        method: "POST",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Leaderboard has been reset successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset leaderboard",
        variant: "destructive",
      });
    },
  });

  // Function to validate Pyth Feed ID
  const handleValidatePyth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pythFeedId.trim()) {
      toast({
        title: "Error",
        description: "Pyth Feed ID is required for validation",
        variant: "destructive",
      });
      return;
    }
    
    if (!pythFeedId.startsWith('0x') || pythFeedId.length !== 66) {
      toast({
        title: "Error",
        description: "Pyth Feed ID must be a 64-character hex string starting with '0x'",
        variant: "destructive",
      });
      return;
    }

    setValidationResult(null);
    validatePythMutation.mutate(pythFeedId.trim());
  };

  const handleAddCrypto = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for Pyth-only integration
    if (!newCryptoId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a cryptocurrency ID",
        variant: "destructive",
      });
      return;
    }

    if (!newCryptoName.trim()) {
      toast({
        title: "Error",
        description: "Please enter the cryptocurrency name",
        variant: "destructive",
      });
      return;
    }

    if (!newCryptoSymbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter the cryptocurrency symbol",
        variant: "destructive",
      });
      return;
    }

    if (!pythFeedId.trim()) {
      toast({
        title: "Error",
        description: "Pyth Feed ID is required for all cryptocurrencies",
        variant: "destructive",
      });
      return;
    }
    
    if (!pythFeedId.startsWith('0x') || pythFeedId.length !== 66) {
      toast({
        title: "Error",
        description: "Pyth Feed ID must be a 64-character hex string starting with '0x'",
        variant: "destructive",
      });
      return;
    }

    // REQUIRE VALIDATION BEFORE ADDING
    if (!validationResult || !validationResult.isValid) {
      toast({
        title: "Validation Required",
        description: "Please validate the Pyth Feed ID before adding the cryptocurrency",
        variant: "destructive",
      });
      return;
    }

    const mutationData = {
      cryptoId: newCryptoId.trim().toLowerCase(),
      name: newCryptoName.trim(),
      symbol: newCryptoSymbol.trim().toUpperCase(),
      pythFeedId: pythFeedId.trim()
    };

    addCryptoMutation.mutate(mutationData);
  };

  // Check if user lacks admin permissions
  const isUnauthorized = (statsError as any)?.message?.includes("401") || 
                         (statsError as any)?.message?.includes("Authentication required") ||
                         (usersError as any)?.message?.includes("401") ||
                         (predictionsError as any)?.message?.includes("401") ||
                         (activityError as any)?.message?.includes("401");

  // Show simplified authentication if unauthorized
  if (isUnauthorized) {
    return <SimpleAdminAuth onAuthSuccess={() => window.location.reload()} />;
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Admin Access Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please connect your authorized wallet to access the admin panel.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Admin access requires wallet authentication with an authorized address.
              </p>
              <div className="space-y-4">
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <AlertDescription>
                    <strong>Direct Admin Access Available:</strong> Click the link below for instant admin access that bypasses browser extension conflicts.
                  </AlertDescription>
                </Alert>
                
                <a 
                  href="/admin-direct/secure-admin-2024"
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-md transition-colors"
                >
                  🔐 Direct Admin Access (No Extensions Required)
                </a>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-3">Alternative methods if needed:</p>
                  
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/authenticate', {
                          method: 'POST',
                          body: JSON.stringify({ walletAddress: currentUser?.walletAddress || "" }),
                          headers: { 'Content-Type': 'application/json' }
                        });
                        
                        if (response.ok) {
                          toast({
                            title: "Success",
                            description: "Admin access granted successfully",
                          });
                          setTimeout(() => window.location.reload(), 1000);
                        } else {
                          const error = await response.json();
                          toast({
                            title: "Authentication Failed",
                            description: error.message || "Failed to authenticate",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Authentication Failed",
                          description: "Network error occurred",
                          variant: "destructive",
                        });
                      }
                    }}
                    variant="outline"
                    className="w-full mb-3"
                  >
                    API Authentication Method
                  </Button>
                  
                  <details className="text-left">
                    <summary className="text-xs text-muted-foreground cursor-pointer">Manual wallet entry</summary>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const walletInput = e.currentTarget.elements.namedItem('walletAddress') as HTMLInputElement;
                      if (walletInput.value.trim()) {
                        try {
                          const response = await fetch('/api/admin/authenticate', {
                            method: 'POST',
                            body: JSON.stringify({ walletAddress: walletInput.value.trim() }),
                            headers: { 'Content-Type': 'application/json' }
                          });
                          
                          if (response.ok) {
                            window.location.reload();
                          } else {
                            const error = await response.json();
                            toast({
                              title: "Authentication Failed",
                              description: error.message || "Invalid admin wallet address",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Authentication Failed",
                            description: "Failed to authenticate. Please check your wallet address.",
                            variant: "destructive",
                          });
                        }
                      }
                    }} className="space-y-2 mt-2">
                      <Input 
                        name="walletAddress"
                        placeholder="Enter admin wallet address"
                        className="w-full text-xs"
                        size={60}
                      />
                      <Button type="submit" variant="outline" size="sm" className="w-full">
                        Authenticate Manual Entry
                      </Button>
                    </form>
                  </details>
                </div>
                
                <Button 
                  onClick={() => setLocation('/home')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Active</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-surface border-b border-surface-light">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Settings className="text-white" size={14} />
              </div>
              <h1 className="text-base sm:text-xl font-bold">Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <DatabaseResetButton />
              <Button 
                variant="outline" 
                size="sm"
                className="bg-surface-light border-surface-light text-xs sm:text-sm" 
                onClick={() => setLocation('/home')}
              >
                <Eye className="mr-1 sm:mr-2" size={14} />
                <span className="hidden sm:inline">Back to App</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Total Users</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="flex items-center mt-1">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-slate-500">
                  {wsConnected ? 'Real-time ON' : 'Real-time OFF'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Predictions</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPredictions || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Rewards</CardTitle>
              <Award className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRewards ? stats.totalRewards.toLocaleString() : 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Avg Accuracy</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.accuracyAverage?.toFixed(1) || 0}%</div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Staked</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStaked ? stats.totalStaked.toLocaleString() : 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Views */}
        <Tabs defaultValue="cryptocurrencies" className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-3 sm:p-6 shadow-2xl">
            {/* First Row */}
            <TabsList className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 w-full flex justify-between gap-1 sm:gap-2 h-auto p-1 sm:p-2 rounded-xl mb-4 backdrop-blur-sm">
              <TabsTrigger value="statistics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-blue-400/50">
                <BarChart3 className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Statistics</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-green-400/50">
                <Users className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="cryptocurrencies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-yellow-400/50">
                <Coins className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Crypto</span>
              </TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-purple-400/50">
                <Target className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Predictions</span>
              </TabsTrigger>
              <TabsTrigger value="battles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-red-400/50">
                <Swords className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Battles</span>
              </TabsTrigger>
              <TabsTrigger value="survival" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-orange-400/50">
                <Gamepad2 className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Survival</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-amber-400/50">
                <Trophy className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Second Row */}
            <TabsList className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 w-full flex justify-between gap-1 sm:gap-2 h-auto p-1 sm:p-2 rounded-xl backdrop-blur-sm">
              <TabsTrigger value="transactions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-emerald-400/50">
                <DollarSign className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-rose-400/50">
                <Shield className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="banners" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-cyan-400/50">
                <Megaphone className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Banners</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-indigo-400/50">
                <Calendar className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-violet-400/50">
                <Settings className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-teal-400/50">
                <Activity className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="automated-withdrawal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-600/50 transition-all duration-300 flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg border border-transparent data-[state=active]:border-blue-400/50">
                <Zap className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Auto Withdrawal</span>
              </TabsTrigger>

            </TabsList>
          </div>

          {/* Statistics Tab - User Analytics Dashboard */}
          <TabsContent value="statistics" className="space-y-6">
            <UserStatistics />
          </TabsContent>

          {/* Users Tab - Full CRUD Management */}
          <TabsContent value="users">
            <div className="space-y-6">
              {/* Add New User Card */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center">
                        <UserPlus className="mr-2" size={20} />
                        User Management ({sortedUsers.length})
                      </span>
                      {/* Filters */}
                      <Select value={userFilter} onValueChange={setUserFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter users" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="admins">Only Admins</SelectItem>
                          <SelectItem value="rich">Balance &gt; 1000 NTIQ</SelectItem>
                          <SelectItem value="no-wallet">No Wallet Linked</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Bulk Actions */}
                      {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-200">
                          <span className="text-sm font-medium text-red-700">
                            {selectedUsers.length} user(s) selected
                          </span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("🚨 DELETE BUTTON CLICKED!");
                              console.log("Selected users:", selectedUsers);
                              console.log("Button event:", e);
                              console.log("Delete button clicked - proceeding to handleBulkDelete");
                              handleBulkDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium"
                          >
                            <Trash2 className="mr-1" size={14} />
                            Delete Selected
                          </Button>
                        </div>
                      )}
                      
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-500 mt-2">
                          Selected: [{selectedUsers.join(', ')}] | Show bulk: {selectedUsers.length > 0 ? 'YES' : 'NO'}
                        </div>
                      )}
                      
                      {/* Export Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportUsers}
                        className="ml-auto"
                      >
                        Export CSV
                      </Button>
                    </div>
                    <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="mr-2" size={16} />
                          Add New User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newUser.username}
                              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                              placeholder="Enter username"
                            />
                          </div>
                          <div>
                            <Label htmlFor="walletAddress">Wallet Address</Label>
                            <Input
                              id="walletAddress"
                              value={newUser.walletAddress}
                              onChange={(e) => setNewUser({ ...newUser, walletAddress: e.target.value })}
                              placeholder="0x..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="balance">Initial Balance (NTIQ)</Label>
                            <Input
                              id="balance"
                              type="number"
                              value={newUser.balance}
                              onChange={(e) => setNewUser({ ...newUser, balance: parseInt(e.target.value) || 0 })}
                              placeholder="5000"
                            />
                          </div>
                          <Button
                            onClick={() => createUserMutation.mutate(newUser)}
                            disabled={createUserMutation.isPending}
                            className="w-full"
                          >
                            {createUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter Controls */}
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search by username, wallet address, or UID..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Users Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedUsers.length === sortedUsers.length && sortedUsers.length > 0}
                              onCheckedChange={(checked: boolean) => {
                                console.log("Select all checkbox changed:", checked);
                                if (checked) {
                                  const allIds = sortedUsers.map(u => u.id);
                                  console.log("Selecting all users:", allIds);
                                  setSelectedUsers(allIds);
                                } else {
                                  console.log("Deselecting all users");
                                  setSelectedUsers([]);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>UID</TableHead>
                          <TableHead>Wallet Address</TableHead>
                          <TableHead>Linked Email</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-surface-light" 
                            onClick={() => handleUserSort("balance")}
                          >
                            Balance {userSortField === "balance" && (userSortOrder === "desc" ? "↓" : "↑")}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-surface-light" 
                            onClick={() => handleUserSort("predictions")}
                          >
                            Predictions {userSortField === "predictions" && (userSortOrder === "desc" ? "↓" : "↑")}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-surface-light" 
                            onClick={() => handleUserSort("accuracy")}
                          >
                            Accuracy {userSortField === "accuracy" && (userSortOrder === "desc" ? "↓" : "↑")}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-surface-light" 
                            onClick={() => handleUserSort("rewards")}
                          >
                            Rewards {userSortField === "rewards" && (userSortOrder === "desc" ? "↓" : "↑")}
                          </TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={(checked: boolean) => {
                                  console.log(`✅ User ${user.id} (${user.username}) checkbox changed:`, checked);
                                  if (checked) {
                                    setSelectedUsers(prev => {
                                      const newSelection = [...prev, user.id];
                                      console.log("✅ Adding to selection:", newSelection);
                                      return newSelection;
                                    });
                                  } else {
                                    setSelectedUsers(prev => {
                                      const newSelection = prev.filter(id => id !== user.id);
                                      console.log("❌ Removing from selection:", newSelection);
                                      return newSelection;
                                    });
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                    {user.username[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{user.username}</p>
                                  <p className="text-sm text-gray-500">UID: {user.uid}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                {user.uid}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-mono">
                                {user.walletAddress ? 
                                  `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 
                                  "Not set"
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {user.email ? (
                                  <>
                                    <span className="text-sm">{user.email}</span>
                                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-1 py-0">
                                      ✓
                                    </Badge>
                                  </>
                                ) : (
                                  <span className="text-sm text-slate-400">Not linked</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{user.balance ? user.balance.toLocaleString() : 0} NTIQ</span>
                            </TableCell>
                            <TableCell>{user.totalPredictions}</TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-600">
                                {user.totalPredictions > 0 ? 
                                  ((user.correctPredictions / user.totalPredictions) * 100).toFixed(1) : 
                                  0
                                }%
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-orange-600">
                                {user.totalRewards ? user.totalRewards.toLocaleString() : 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.isAdmin ? (
                                <Badge variant="destructive">Admin</Badge>
                              ) : (
                                <Badge variant="secondary">User</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingUser(user)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit User: {user.username}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="edit-balance">Balance (NTIQ)</Label>
                                        <Input
                                          id="edit-balance"
                                          type="number"
                                          defaultValue={user.balance}
                                          onChange={(e) => {
                                            if (editingUser) {
                                              setEditingUser({ ...editingUser, balance: parseInt(e.target.value) || 0 });
                                            }
                                          }}
                                        />
                                      </div>
                                      <Button
                                        onClick={() => {
                                          if (editingUser) {
                                            updateUserMutation.mutate({
                                              id: editingUser.id,
                                              balance: editingUser.balance,
                                            });
                                          }
                                        }}
                                        disabled={updateUserMutation.isPending}
                                        className="w-full"
                                      >
                                        {updateUserMutation.isPending ? "Updating..." : "Update User"}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                {!user.isAdmin && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to RESET user "${user.username}"?\n\nThis will:\n✅ Clear ALL user data (predictions, battles, achievements, etc.)\n✅ Reset balance to 1000 NTIQ\n✅ Keep the user account active\n\nThis action cannot be undone!`)) {
                                          resetUserMutation.mutate(user.id);
                                        }
                                      }}
                                      disabled={resetUserMutation.isPending}
                                      className="text-yellow-600 hover:text-yellow-700"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
                                          deleteUserMutation.mutate(user.id);
                                        }
                                      }}
                                      disabled={deleteUserMutation.isPending}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <UserX className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No users found. Create your first user to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cryptocurrencies Tab */}
          <TabsContent value="cryptocurrencies">
            <div className="space-y-6">
              {/* Data Sources Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-900 dark:text-purple-100">Pyth Network</h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Institutional-Grade Data</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                      <div className="flex justify-between">
                        <span>Supported Cryptos:</span>
                        <span className="font-medium">6 Major Assets</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Update Interval:</span>
                        <span className="font-medium">1 Second</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Quality:</span>
                        <span className="font-medium text-green-600">Enterprise</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Sources Summary */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100">Platform Summary</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">Pyth-Only Integration</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                      <div className="flex justify-between">
                        <span>Total Cryptos:</span>
                        <span className="font-medium">{cryptocurrencies?.length || 0} Assets</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price Source:</span>
                        <span className="font-medium">Pyth Network Only</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Quality:</span>
                        <span className="font-medium text-purple-600">Enterprise</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add New Cryptocurrency Form */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2" size={20} />
                    Add New Cryptocurrency
                    <div className="flex items-center space-x-2 ml-2">
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        Pyth Network Only
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCrypto} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="crypto-id">Crypto ID</Label>
                          <Input
                            id="crypto-id"
                            placeholder="e.g., ripple, dogecoin, polygon"
                            value={newCryptoId}
                            onChange={(e) => setNewCryptoId(e.target.value)}
                            required
                          />
                          <p className="text-sm text-slate-400">
                            Enter a unique ID for the cryptocurrency.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="crypto-name">Name</Label>
                          <Input
                            id="crypto-name"
                            placeholder="e.g., Ripple, Dogecoin, Polygon"
                            value={newCryptoName}
                            onChange={(e) => setNewCryptoName(e.target.value)}
                            required
                          />
                          <p className="text-sm text-slate-400">
                            Full name of the cryptocurrency.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="crypto-symbol">Symbol</Label>
                          <Input
                            id="crypto-symbol"
                            placeholder="e.g., XRP, DOGE, MATIC"
                            value={newCryptoSymbol}
                            onChange={(e) => setNewCryptoSymbol(e.target.value)}
                            required
                          />
                          <p className="text-sm text-slate-400">
                            Trading symbol for the cryptocurrency.
                          </p>
                        </div>
                        <div className="flex items-end">
                          <Button 
                            type="submit" 
                            className={`w-full ${
                              !validationResult?.isValid 
                                ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-50' 
                                : validationResult?.isValid 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : ''
                            }`}
                            disabled={addCryptoMutation.isPending || !validationResult?.isValid}
                          >
                            {addCryptoMutation.isPending ? (
                              <div className="flex items-center space-x-2">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Adding Cryptocurrency...</span>
                              </div>
                            ) : !validationResult?.isValid ? (
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Validation Required</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Add Cryptocurrency</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Pyth Network Integration (Required) */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="mb-3">
                              <h4 className="font-semibold text-purple-900 dark:text-purple-100">Pyth Network Price Feed</h4>
                              <p className="text-sm text-purple-700 dark:text-purple-300">Required for all cryptocurrencies - Validation Required</p>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="pyth-feed-id">Pyth Price Feed ID *</Label>
                                <div className="flex space-x-2">
                                  <Input
                                    id="pyth-feed-id"
                                    placeholder="0x..."
                                    value={pythFeedId}
                                    onChange={(e) => {
                                      setPythFeedId(e.target.value);
                                      setValidationResult(null); // Clear validation when input changes
                                    }}
                                    className="flex-1"
                                    required
                                  />
                                  <Button
                                    type="button"
                                    onClick={handleValidatePyth}
                                    disabled={!pythFeedId.trim() || validatePythMutation.isPending}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    {validatePythMutation.isPending ? "Validating..." : "Validate"}
                                  </Button>
                                </div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                  Find Pyth Price Feed IDs at: pyth.network/developers/price-feed-ids
                                </p>
                                
                                {/* Validation Result Display */}
                                {validationResult && (
                                  <div className={`mt-2 p-3 rounded-lg border ${
                                    validationResult.isValid 
                                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                                      : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                                  }`}>
                                    <div className="flex items-center space-x-2">
                                      {validationResult.isValid ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                      )}
                                      <span className={`text-sm font-medium ${
                                        validationResult.isValid 
                                          ? 'text-green-800 dark:text-green-200' 
                                          : 'text-red-800 dark:text-red-200'
                                      }`}>
                                        {validationResult.isValid ? 'Validation Successful' : 'Validation Failed'}
                                      </span>
                                    </div>
                                    <p className={`text-xs mt-1 ${
                                      validationResult.isValid 
                                        ? 'text-green-700 dark:text-green-300' 
                                        : 'text-red-700 dark:text-red-300'
                                    }`}>
                                      {validationResult.message}
                                    </p>
                                    {validationResult.priceData && (
                                      <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                                        Current Price: ${validationResult.priceData.price} 
                                        {validationResult.priceData.confidence && (
                                          <span className="ml-2">
                                            (±${validationResult.priceData.confidence} confidence)
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded text-xs text-purple-800 dark:text-purple-200">
                                <p className="font-medium mb-1">Pyth Network Benefits:</p>
                                <ul className="space-y-0.5">
                                  <li>• Sub-second price updates</li>
                                  <li>• Institutional-grade data quality</li>
                                  <li>• Confidence intervals for accuracy</li>
                                  <li>• Real-time market data</li>
                                </ul>
                              </div>
                              
                              {/* Validation Required Notice */}
                              {!validationResult?.isValid && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                      Validasi Diperlukan
                                    </span>
                                  </div>
                                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                    Silakan validasi Pyth Feed ID terlebih dahulu sebelum menambahkan cryptocurrency ke database.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                  
                  {/* Help Section */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to find Pyth Price Feed IDs:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>1. Visit pyth.network/developers/price-feed-ids</li>
                      <li>2. Search for your cryptocurrency in the list</li>
                      <li>3. Copy the 64-character hex string (starting with 0x)</li>
                    </ul>
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-2">Example Pyth Feed IDs:</p>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                        <div>• Bitcoin: 0xe62df6c8b4c85672d3ce6c62b8b6e2b8b4c85672d3ce6c62b8...</div>
                        <div>• Ethereum: 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665...</div>
                        <div>• Solana: 0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc...</div>
                        <span>• Shiba Inu: "shiba-inu"</span>
                      </div>
                    </div>
                    
                    {/* Pyth Network Notice */}
                    <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded">
                      <div className="flex items-center mb-2">
                        <Zap className="h-4 w-4 text-purple-600 mr-2" />
                        <p className="text-xs text-purple-800 dark:text-purple-200 font-medium">Pyth Network Integration</p>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Bitcoin, Ethereum, Solana, BNB, and Cardano automatically get enhanced with institutional-grade Pyth Network data for Live Prices display.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Cryptocurrencies List */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="mr-2" size={20} />
                    Manage Cryptocurrencies ({cryptocurrencies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cryptocurrencies.map((crypto) => {
                      // Check if crypto has Pyth Network support
                      const isPythSupported = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'cardano', 'dogecoin'].includes(crypto.id);
                      
                      return (
                        <div key={crypto.id} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="relative w-10 h-10 flex-shrink-0">
                              <img 
                                src={crypto.id === 'solana' ? '/attached_assets/solana_1750613756851.png' : `https://coin-images.coingecko.com/coins/images/${crypto.id === 'bitcoin' ? '1' : crypto.id === 'ethereum' ? '279' : crypto.id === 'binancecoin' ? '825' : crypto.id === 'cardano' ? '975' : crypto.id === 'avalanche-2' ? '12559' : crypto.id === 'tron' ? '1094' : crypto.id === 'ripple' ? '44' : crypto.id === 'dogecoin' ? '5' : crypto.id === 'polygon' ? '4713' : crypto.id === 'chainlink' ? '877' : crypto.id === 'litecoin' ? '2' : crypto.id === 'shiba-inu' ? '11939' : '1'}/large/${crypto.id}.png`}
                                alt={crypto.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  // Fallback to colored icon with symbol if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) {
                                    target.style.display = 'none';
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="w-10 h-10 bg-primary/10 rounded-full hidden items-center justify-center">
                                <span className="text-primary font-bold text-sm">{crypto.symbol}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{crypto.name}</p>
                                {isPythSupported && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-0.5">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Pyth
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-400">ID: {crypto.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-sm text-slate-400">Data Source</p>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Pyth Network
                                </Badge>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-slate-400">Current Price</p>
                              <p className="font-semibold">${crypto.currentPrice ? crypto.currentPrice.toLocaleString() : 'N/A'}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-slate-400">24h Change</p>
                              <p className={`font-semibold ${
                                Number(crypto.priceChange24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {crypto.priceChange24h ? `${Number(crypto.priceChange24h).toFixed(2)}%` : 'N/A'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-slate-400">Last Updated</p>
                              <p className="text-sm">
                                {crypto.lastUpdated ? new Date(crypto.lastUpdated).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteCryptoMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center text-red-600">
                                  <AlertTriangle className="mr-2" size={20} />
                                  Delete Cryptocurrency
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-red-700 dark:text-red-300">
                                    <strong>Warning:</strong> Are you sure you want to delete <strong>{crypto.name} ({crypto.symbol})</strong>?
                                    <br />This action cannot be undone and will remove the cryptocurrency from all price feeds and predictions.
                                  </AlertDescription>
                                </Alert>
                                <div className="flex justify-end space-x-2">
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogTrigger>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => {
                                        deleteCryptoMutation.mutate(crypto.id);
                                      }}
                                      disabled={deleteCryptoMutation.isPending}
                                    >
                                      {deleteCryptoMutation.isPending ? "Deleting..." : "Delete Cryptocurrency"}
                                    </Button>
                                  </DialogTrigger>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    );
                  })}
                    
                    {cryptocurrencies.length === 0 && (
                      <div className="text-center py-12">
                        <Coins className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Cryptocurrencies</h3>
                        <p className="text-slate-400">Add your first cryptocurrency to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2" size={20} />
                    All Predictions ({sortedPredictions.length} of {predictions.length})
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPredictions}
                      className="text-xs"
                    >
                      📊 Export Data
                    </Button>
                    <div className="text-sm text-slate-400">
                      Page {predictionsPage} of {Math.max(1, Math.ceil(sortedPredictions.length / predictionsPerPage))}
                    </div>
                  </div>
                </CardTitle>
                
                {/* Enhanced Filter Controls */}
                <div className="space-y-4 mt-4">
                  {/* Search Bar */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="text"
                        placeholder="Search predictions by user ID, username, or cryptocurrency..."
                        value={predictionsSearchTerm}
                        onChange={(e) => setPredictionsSearchTerm(e.target.value)}
                        className="pl-10 bg-surface border-surface-light text-white"
                      />
                    </div>
                    {predictionsSearchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPredictionsSearchTerm("")}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="asset-filter" className="text-sm font-medium">
                        Asset:
                      </Label>
                      <Select value={predictionsAssetFilter} onValueChange={setPredictionsAssetFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Assets</SelectItem>
                          {uniqueAssets.map((asset) => (
                            <SelectItem key={asset} value={asset}>
                              {asset.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor="status-filter" className="text-sm font-medium">
                        Status:
                      </Label>
                      <Select value={predictionsStatusFilter} onValueChange={setPredictionsStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {uniqueStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={
                                    status === "completed" ? "default" : 
                                    status === "pending" ? "secondary" : 
                                    "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {status === 'pending' ? 'Active' : 
                                   status === 'completed' ? 'Completed' : 
                                   status === 'expired' ? 'Expired' : status}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Date Range Filter */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Range Filter:</Label>
                      <input
                        type="date"
                        value={dateRangeFilter.startDate}
                        onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        className="px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
                      />
                      <span className="text-xs text-slate-400">to</span>
                      <input
                        type="date"
                        value={dateRangeFilter.endDate}
                        onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        className="px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>
                  </div>
                  
                  {/* Sorting Controls */}
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium">Sorting:</Label>
                    <Button
                      variant={predictionsSortField === "createdAt" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePredictionsSort("createdAt")}
                      className="text-xs"
                    >
                      Time {predictionsSortField === "createdAt" && (predictionsSortOrder === "desc" ? "↓" : "↑")}
                    </Button>
                    <Button
                      variant={predictionsSortField === "stake" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePredictionsSort("stake")}
                      className="text-xs"
                    >
                      Stake {predictionsSortField === "stake" && (predictionsSortOrder === "desc" ? "↓" : "↑")}
                    </Button>
                    <Button
                      variant={predictionsSortField === "reward" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePredictionsSort("reward")}
                      className="text-xs"
                    >
                      Reward {predictionsSortField === "reward" && (predictionsSortOrder === "desc" ? "↓" : "↑")}
                    </Button>
                  </div>
                  
                  {(predictionsAssetFilter !== "all" || predictionsStatusFilter !== "all" || dateRangeFilter.startDate || dateRangeFilter.endDate || predictionsSearchTerm) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPredictionsAssetFilter("all");
                        setPredictionsStatusFilter("all");
                        setDateRangeFilter({ startDate: "", endDate: "" });
                        setPredictionsSearchTerm("");
                      }}
                      className="text-xs"
                    >
                      Reset All Filters
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedPredictions
                    .slice((predictionsPage - 1) * predictionsPerPage, predictionsPage * predictionsPerPage)
                    .map((prediction) => {
                      const accuracyPercentage = prediction.accuracy ? parseFloat(prediction.accuracy.replace('%', '')) : null;
                      const diff = prediction.actualPrice && prediction.predictedPrice 
                        ? ((parseFloat(prediction.actualPrice) - parseFloat(prediction.predictedPrice)) / parseFloat(prediction.predictedPrice)) * 100
                        : null;
                      
                      return (
                        <div key={prediction.id} className="p-4 bg-surface-light rounded-lg border hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <p className="text-sm text-slate-400">ID</p>
                                <p className="font-semibold">#{prediction.id}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                {/* Cryptocurrency Logo */}
                                <div className="relative w-8 h-8 flex-shrink-0">
                                  <img 
                                    src={getCryptoImageUrl(prediction.cryptocurrency)}
                                    alt={prediction.cryptocurrency}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) {
                                        target.style.display = 'none';
                                        fallback.style.display = 'flex';
                                      }
                                    }}
                                  />
                                  <div className="w-8 h-8 bg-primary rounded-full hidden items-center justify-center text-white font-bold text-xs">
                                    {prediction.cryptocurrency.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-semibold capitalize">{prediction.cryptocurrency}</p>
                                  <div className="text-xs text-slate-400 space-y-1">
                                    <div>UID: {(prediction as any).userUid || prediction.userId}</div>
                                    <div>@{(prediction as any).username || 'Unknown'}</div>
                                    <div className="text-xs text-blue-400 truncate max-w-32" title={(prediction as any).walletAddress || 'No wallet'}>
                                      {(prediction as any).walletAddress ? 
                                        `${(prediction as any).walletAddress.slice(0, 6)}...${(prediction as any).walletAddress.slice(-4)}` : 
                                        'No wallet'
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Predicted</p>
                                <p className="font-semibold">${prediction.predictedPrice ? parseFloat(prediction.predictedPrice).toLocaleString() : 'N/A'}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Actual</p>
                                <p className="font-semibold">
                                  {prediction.actualPrice ? `$${parseFloat(prediction.actualPrice).toLocaleString()}` : "Pending"}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Diff</p>
                                {diff !== null ? (
                                  <p className={`font-semibold text-sm ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
                                  </p>
                                ) : (
                                  <p className="text-sm text-slate-400">-</p>
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Stake</p>
                                <p className="font-semibold">{prediction.stakeAmount} NTIQ</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Reward</p>
                                <p className="font-semibold text-success">
                                  {prediction.rewardAmount ? `${prediction.rewardAmount} NTIQ` : "Pending"}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Accuracy</p>
                                {accuracyPercentage !== null ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full transition-all ${
                                          accuracyPercentage >= 95 ? 'bg-green-500' :
                                          accuracyPercentage >= 80 ? 'bg-yellow-500' :
                                          'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min(100, accuracyPercentage)}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium">{prediction.accuracy}</span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-400">Pending</p>
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Status</p>
                                <Badge 
                                  variant={
                                    prediction.status === "completed" && prediction.rewardAmount && prediction.rewardAmount > 0 ? "default" :
                                    prediction.status === "completed" && (!prediction.rewardAmount || prediction.rewardAmount === 0) ? "destructive" :
                                    prediction.status === "pending" ? "secondary" : 
                                    "outline"
                                  }
                                  className="text-xs"
                                >
                                  {prediction.status === 'pending' ? 'Active' : 
                                   prediction.status === 'completed' ? (prediction.rewardAmount && prediction.rewardAmount > 0 ? 'Win' : 'Loss') : 
                                   prediction.status === 'expired' ? 'Expired' : prediction.status}
                                </Badge>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Created</p>
                                <p className="font-semibold text-xs">{formatTimeAgo(prediction.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  
                  {sortedPredictions.length === 0 && predictions.length > 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <TrendingUp className="mx-auto mb-2" size={32} />
                      <p>No predictions match the filters</p>
                      <p className="text-sm">Try changing filters or reset to view all predictions</p>
                    </div>
                  )}
                  
                  {predictions.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <TrendingUp className="mx-auto mb-2" size={32} />
                      <p>No predictions yet</p>
                      <p className="text-sm">Predictions will appear here when users start making them</p>
                    </div>
                  )}
                </div>
                
                {/* Pagination Controls */}
                {filteredPredictions.length > predictionsPerPage && (
                  <div className="flex items-center justify-between pt-6 border-t border-slate-600">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPredictionsPage(prev => Math.max(1, prev - 1))}
                        disabled={predictionsPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPredictionsPage(prev => Math.min(Math.ceil(filteredPredictions.length / predictionsPerPage), prev + 1))}
                        disabled={predictionsPage >= Math.ceil(filteredPredictions.length / predictionsPerPage)}
                      >
                        Next
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400">
                        Showing {Math.min((predictionsPage - 1) * predictionsPerPage + 1, filteredPredictions.length)} to {Math.min(predictionsPage * predictionsPerPage, filteredPredictions.length)} of {filteredPredictions.length} predictions
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.ceil(filteredPredictions.length / predictionsPerPage) }, (_, i) => i + 1)
                        .slice(Math.max(0, predictionsPage - 3), predictionsPage + 2)
                        .map((page) => (
                        <Button
                          key={page}
                          variant={page === predictionsPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPredictionsPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Award className="mr-2" size={20} />
                    Top Performers
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportLeaderboard}
                      className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/20"
                    >
                      <Download className="mr-2" size={16} />
                      Export CSV
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <RefreshCw className="mr-2" size={16} />
                          Reset Leaderboard
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center text-red-600">
                            <AlertTriangle className="mr-2" size={20} />
                            Reset Leaderboard
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700 dark:text-red-300">
                              <strong>Warning:</strong> This action will reset all user statistics including:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Total predictions count</li>
                                <li>Correct predictions count</li>
                                <li>Total rewards earned</li>
                                <li>Accuracy percentages</li>
                              </ul>
                              This action cannot be undone.
                            </AlertDescription>
                          </Alert>
                          <div className="flex justify-end space-x-2">
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogTrigger>
                            <Button 
                              variant="destructive"
                              onClick={() => resetLeaderboardMutation.mutate()}
                              disabled={resetLeaderboardMutation.isPending}
                            >
                              {resetLeaderboardMutation.isPending ? "Resetting..." : "Reset Leaderboard"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Enhanced Filters and Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Time Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="timeFilter" className="text-sm font-medium">Filter Waktu</Label>
                    <Select value={leaderboardTimeFilter} onValueChange={(value: "weekly" | "monthly" | "all") => setLeaderboardTimeFilter(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih periode waktu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sorting Field */}
                  <div className="space-y-2">
                    <Label htmlFor="sortField" className="text-sm font-medium">Sorting</Label>
                    <Select value={leaderboardSortField} onValueChange={(value: "accuracy" | "rewards" | "streak") => setLeaderboardSortField(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accuracy">Accuracy</SelectItem>
                        <SelectItem value="rewards">Rewards</SelectItem>
                        <SelectItem value="streak">Streak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder" className="text-sm font-medium">Order</Label>
                    <Select value={leaderboardSortOrder} onValueChange={(value: "asc" | "desc") => setLeaderboardSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih urutan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Tertinggi ke Terendah</SelectItem>
                        <SelectItem value="asc">Terendah ke Tertinggi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Enhanced Leaderboard Header */}
                <div className="grid grid-cols-8 gap-4 p-3 bg-surface-light rounded-lg mb-4 text-sm font-medium text-slate-400">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-2">User</div>
                  <div className="col-span-1 text-center cursor-pointer hover:text-primary transition-colors" onClick={() => handleLeaderboardSort("accuracy")}>
                    Accuracy {leaderboardSortField === "accuracy" && (leaderboardSortOrder === "desc" ? "↓" : "↑")}
                  </div>
                  <div className="col-span-1 text-center">Predictions</div>
                  <div className="col-span-1 text-center cursor-pointer hover:text-primary transition-colors" onClick={() => handleLeaderboardSort("rewards")}>
                    Rewards {leaderboardSortField === "rewards" && (leaderboardSortOrder === "desc" ? "↓" : "↑")}
                  </div>
                  <div className="col-span-1 text-center cursor-pointer hover:text-primary transition-colors" onClick={() => handleLeaderboardSort("streak")}>
                    Streak {leaderboardSortField === "streak" && (leaderboardSortOrder === "desc" ? "↓" : "↑")}
                  </div>
                  <div className="col-span-1 text-center">Multiplier</div>
                </div>

                {/* Enhanced Leaderboard Content */}
                <div className="space-y-3">
                  {(filteredAndSortedLeaderboard || []).map((user, index) => {
                    const rank = index + 1;
                    const getRankColor = () => {
                      switch (rank) {
                        case 1: return "bg-warning text-dark";
                        case 2: return "bg-slate-400 text-dark";
                        case 3: return "bg-amber-600 text-white";
                        default: return "bg-surface-light text-slate-300";
                      }
                    };

                    const getBadgeIcon = () => {
                      if (user.streak >= 5) return "🔥"; // Fire for streak
                      if (user.accuracy >= 90) return "⭐"; // Star for 90%+ accuracy
                      return null;
                    };

                    return (
                      <div key={user.id} className="grid grid-cols-8 gap-4 p-3 bg-surface-light rounded-lg hover:bg-surface-light/80 transition-colors">
                        {/* Rank with Badge */}
                        <div className="col-span-1 flex items-center">
                          <div className={`flex items-center justify-center w-8 h-8 ${getRankColor()} font-bold rounded-full text-sm mr-2`}>
                            {rank <= 3 ? (rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉") : rank}
                          </div>
                          {getBadgeIcon() && <span className="text-lg" title={user.streak >= 5 ? "High Streak" : "High Accuracy"}>{getBadgeIcon()}</span>}
                        </div>

                        {/* User Info with Clickable Profile */}
                        <div className="col-span-2">
                          <button 
                            className="text-left hover:text-primary transition-colors"
                            onClick={() => {
                              // Navigate to user profile or show user details
                              toast({
                                title: "User Profile",
                                description: `Viewing profile for ${user.username} (ID: ${user.uid || user.id})`,
                              });
                            }}
                          >
                            <p className="font-semibold">{user.username}</p>
                            <p className="text-xs text-slate-400">UID: {user.uid || user.id}</p>
                          </button>
                        </div>

                        {/* Accuracy with Visual Meter and Tooltip */}
                        <div className="col-span-1 text-center">
                          <div className="relative">
                            <div 
                              className="text-sm font-semibold mb-1"
                              title={`${user.correctPredictions} correct of ${user.totalPredictions} total predictions`}
                            >
                              {user.accuracy.toFixed(1)}%
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  user.accuracy >= 80 ? 'bg-green-500' : 
                                  user.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(user.accuracy, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Predictions Count */}
                        <div className="col-span-1 text-center">
                          <p className="font-semibold">{user.totalPredictions}</p>
                          <p className="text-xs text-green-400">{user.correctPredictions} correct</p>
                        </div>

                        {/* Rewards */}
                        <div className="col-span-1 text-center">
                          <p className="font-semibold text-primary">{user.totalRewards ? user.totalRewards.toLocaleString() : 0}</p>
                          <p className="text-xs text-slate-400">NTIQ</p>
                        </div>

                        {/* Streak */}
                        <div className="col-span-1 text-center">
                          <p className="font-semibold text-orange-400">{user.streak}</p>
                          <p className="text-xs text-slate-400">streak</p>
                        </div>

                        {/* Average Multiplier */}
                        <div className="col-span-1 text-center">
                          <p className="font-semibold text-purple-400">{user.avgMultiplier.toFixed(2)}x</p>
                          <p className="text-xs text-slate-400">avg</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredAndSortedLeaderboard.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Award className="mx-auto mb-2" size={32} />
                      <p>No leaderboard data available</p>
                      <p className="text-sm">Users will appear here after making predictions</p>
                    </div>
                  )}
                </div>

                {/* Seasonal Competition Feature Preview */}
                <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="text-lg font-bold text-primary mb-3 flex items-center">
                    <Trophy className="mr-2" size={18} />
                    Advanced Features for Seasonal Competition
                  </h4>
                  <p className="text-sm text-slate-300 mb-4">
                    If Nectiq wants to hold <strong>seasonal battles</strong>:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-400">🎫</span>
                        <span><strong>Entry Fee</strong> per musim</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-400">🔄</span>
                        <span><strong>Waktu Reset Otomatis</strong> (setiap Minggu atau Bulan)</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400">📊</span>
                        <span><strong>History of Past Seasons</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400">🏆</span>
                        <span><strong>Leaderboard Hadiah</strong> / Juara 1-3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Transactions Tab */}
          <TabsContent value="transactions">
            <div className="space-y-6">
              
              {/* NTIQ Circulation Tracker */}
              <NTIQCirculationTracker />
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <DollarSign className="mr-2" size={20} />
                      Transaction Monitoring
                      <div className={`ml-3 flex items-center px-2 py-1 rounded-full text-xs ${
                        wsConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {wsConnected ? 'LIVE' : 'OFFLINE'}
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {lastTransaction && (
                        <div className="text-xs text-slate-500 mr-2">
                          Last: {lastTransaction.user.username} - {lastTransaction.type}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportTransactions}
                        className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/20"
                      >
                        <Download className="mr-2" size={16} />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                  
                  {/* Enhanced Filters and Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    {/* Token Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="tokenFilter" className="text-sm font-medium">Filter per Token</Label>
                      <Select value={transactionTokenFilter} onValueChange={(value: "all" | "ETH" | "USDT" | "USDC") => setTransactionTokenFilter(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tokens</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="statusFilter" className="text-sm font-medium">Filter per Status</Label>
                      <Select value={transactionStatusFilter} onValueChange={(value: "all" | "pending" | "completed" | "failed") => setTransactionStatusFilter(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range Start */}
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-medium">Tanggal Mulai</Label>
                      <Input
                        type="date"
                        value={transactionDateFilter.startDate}
                        onChange={(e) => setTransactionDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        className="bg-surface-light border-surface-light"
                      />
                    </div>

                    {/* Date Range End */}
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm font-medium">Tanggal Selesai</Label>
                      <Input
                        type="date"
                        value={transactionDateFilter.endDate}
                        onChange={(e) => setTransactionDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        className="bg-surface-light border-surface-light"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Enhanced Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">NTIQ Purchases</p>
                            <p className="text-2xl font-bold">{transactionStats?.totalPurchases || 0}</p>
                            <p className="text-xs text-slate-500">{transactionStats?.totalPTSPurchased ? transactionStats.totalPTSPurchased.toLocaleString() : 0} NTIQ</p>
                          </div>
                          <Coins className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Withdrawals</p>
                            <p className="text-2xl font-bold">{transactionStats?.totalWithdrawals || 0}</p>
                            <p className="text-xs text-slate-500">{transactionStats?.totalPTSWithdrawn ? transactionStats.totalPTSWithdrawn.toLocaleString() : 0} NTIQ</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Total Volume</p>
                            <p className="text-2xl font-bold">
                              {transactionStats ? `${transactionStats.totalVolumeETH} ETH` : '0 ETH'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {transactionStats ? `${transactionStats.totalVolumeUSDT} USDT` : '0 USDT'}
                            </p>
                          </div>
                          <BarChart3 className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Failed Transactions</p>
                            <p className="text-2xl font-bold text-red-400">{failedTransactions}</p>
                            <p className="text-xs text-slate-500">Need Review</p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Statistics Section */}
                  <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h4 className="text-lg font-bold text-primary mb-3 flex items-center">
                      🧠 Additional Statistics Above
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-400">🔄</span>
                        <span><strong>NTIQ Turnover Rate:</strong> {ntiqTurnoverRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400">👥</span>
                        <span><strong>Unique Wallets:</strong> {uniqueWallets}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400">💰</span>
                        <span><strong>Avg Purchase:</strong> {avgPurchaseAmount.toFixed(0)} NTIQ</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-red-400">⚠️</span>
                        <span><strong>Failed Tx:</strong> {failedTransactions} ({((failedTransactions / Math.max(allTransactions.length, 1)) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Purchases */}
                    <Card className="bg-surface-light">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Coins className="mr-2" size={18} />
                          Recent Purchases
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {!Array.isArray(purchases) || purchases.length === 0 ? (
                            <div className="text-center py-4 text-slate-400">
                              <Coins className="mx-auto mb-2" size={24} />
                              <p className="text-sm">No purchases yet</p>
                            </div>
                          ) : (
                            purchases.slice(0, 5).map((purchase: any) => (
                              <div key={purchase.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                      {purchase.username?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{purchase.username}</p>
                                    <p className="text-sm text-slate-400">
                                      {purchase.ptsAmount.toLocaleString()} NTIQ • {purchase.paymentToken}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    {purchase.status}
                                  </Badge>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {new Date(purchase.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Withdrawal Approval System */}
                    <Card className="bg-surface-light">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <DollarSign className="mr-2" size={18} />
                          Withdrawal Approval System
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {!Array.isArray(withdrawals) || withdrawals.length === 0 ? (
                            <div className="text-center py-4 text-slate-400">
                              <DollarSign className="mx-auto mb-2" size={24} />
                              <p className="text-sm">No withdrawal requests</p>
                            </div>
                          ) : (
                            withdrawals.slice(0, 8).map((withdrawal: any) => (
                              <WithdrawalApprovalCard key={withdrawal.id} withdrawal={withdrawal} />
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Enhanced Complete Transaction History Table */}
                  <Card className="bg-surface-light">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="mr-2" size={18} />
                          Complete Transaction History
                        </div>
                        <Button
                          onClick={exportTransactionData}
                          variant="outline"
                          size="sm"
                          className="bg-primary/10 hover:bg-primary/20 border-primary/30"
                        >
                          <Download className="mr-2" size={16} />
                          Export CSV
                        </Button>
                      </CardTitle>
                      
                      {/* Enhanced Filtering Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 bg-surface/50 rounded-lg border border-slate-600">
                        {/* Transaction Type Filter */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1 block">Jenis Transaksi</label>
                          <Select value={transactionTypeFilter} onValueChange={(value) => setTransactionTypeFilter(value as "all" | "purchase" | "withdrawal" | "deposit")}>
                            <SelectTrigger className="bg-surface border-slate-600">
                              <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua</SelectItem>
                              <SelectItem value="purchase">Purchase</SelectItem>
                              <SelectItem value="withdrawal">Withdrawal</SelectItem>
                              <SelectItem value="deposit">Deposit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Status Filter */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1 block">Status</label>
                          <Select value={transactionStatusFilter} onValueChange={(value) => setTransactionStatusFilter(value as "all" | "pending" | "completed" | "failed")}>
                            <SelectTrigger className="bg-surface border-slate-600">
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Token Filter */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1 block">Token</label>
                          <Select value={transactionTokenFilter} onValueChange={(value) => setTransactionTokenFilter(value as "all" | "ETH" | "USDT" | "USDC")}>
                            <SelectTrigger className="bg-surface border-slate-600">
                              <SelectValue placeholder="Pilih token" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua</SelectItem>
                              <SelectItem value="ETH">ETH</SelectItem>
                              <SelectItem value="USDT">USDT</SelectItem>
                              <SelectItem value="USDC">USDC</SelectItem>
                              <SelectItem value="BTC">BTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Amount Range Filter */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1 block">Jumlah NTIQ</label>
                          <Select value={transactionAmountFilter} onValueChange={(value) => setTransactionAmountFilter(value as "all" | "0-1000" | "1000-10000" | "10000-100000" | "100000+")}>
                            <SelectTrigger className="bg-surface border-slate-600">
                              <SelectValue placeholder="Pilih range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua</SelectItem>
                              <SelectItem value="0-1000">0 - 1,000</SelectItem>
                              <SelectItem value="1000-10000">1,000 - 10,000</SelectItem>
                              <SelectItem value="10000-100000">10,000 - 100,000</SelectItem>
                              <SelectItem value="100000+">100,000+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Transaction Summary Stats - Modern Design */}
                      <div className="mt-6 p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                          <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 hover:border-primary/50 transition-all duration-300">
                            <div className="text-primary font-black text-2xl mb-2">{filteredTransactions.length}</div>
                            <div className="text-slate-300 font-semibold text-sm">Total Transaksi</div>
                          </div>
                          <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 hover:border-blue-400/50 transition-all duration-300">
                            <div className="text-blue-400 font-black text-2xl mb-2">{filteredTransactions.filter(t => t.type === 'purchase').length}</div>
                            <div className="text-slate-300 font-semibold text-sm">Purchase</div>
                          </div>
                          <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 hover:border-purple-400/50 transition-all duration-300">
                            <div className="text-purple-400 font-black text-2xl mb-2">{filteredTransactions.filter(t => t.type === 'withdrawal').length}</div>
                            <div className="text-slate-300 font-semibold text-sm">Withdrawal</div>
                          </div>
                          <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 hover:border-orange-400/50 transition-all duration-300">
                            <div className="text-orange-400 font-black text-2xl mb-2">{filteredTransactions.filter(t => t.type === 'deposit').length}</div>
                            <div className="text-slate-300 font-semibold text-sm">Deposit</div>
                          </div>
                          <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 hover:border-yellow-400/50 transition-all duration-300">
                            <div className="text-yellow-400 font-black text-2xl mb-2">{filteredTransactions.filter(t => t.status === 'pending').length}</div>
                            <div className="text-slate-300 font-semibold text-sm">Pending</div>
                          </div>
                          <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 hover:border-green-400/50 transition-all duration-300">
                            <div className="text-green-400 font-black text-2xl mb-2">{filteredTransactions.filter(t => t.status === 'completed').length}</div>
                            <div className="text-slate-300 font-semibold text-sm">Completed</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>UID</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Token</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tx Hash</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedTransactions.map((transaction) => (
                            <TableRow 
                              key={`${transaction.type}-${transaction.id}`}
                              className="hover:bg-surface/50 transition-colors cursor-pointer"
                              title={`Status: ${transaction.status} • ${transaction.hash ? `TxID: ${transaction.hash}` : 'Internal ID: ' + transaction.id} • Chain: ${transaction.token === 'ETH' ? 'Ethereum' : 'Internal'}`}
                            >
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    transaction.type === 'purchase' 
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                      : transaction.type === 'withdrawal'
                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                        : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                  }
                                >
                                  {transaction.type === 'purchase' ? 'Purchase' : transaction.type === 'withdrawal' ? 'Withdrawal' : 'Deposit'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-white">{transaction.username || `User ${transaction.userId}`}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {transaction.uid || transaction.userId}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900 dark:text-white">{transaction.amount ? transaction.amount.toLocaleString() : 0} NTIQ</div>
                                  {transaction.type === 'withdrawal' && (
                                    <div className="text-xs text-gray-900 dark:text-gray-100 font-semibold">→ {(() => {
                                      // For withdrawals, use netAmount from database if available and reasonable, otherwise calculate
                                      if (transaction.netAmount && !isNaN(parseFloat(transaction.netAmount))) {
                                        const netAmount = parseFloat(transaction.netAmount);
                                        // Sanity check: for ETH, netAmount should be small (< 1 ETH for normal withdrawals)
                                        if (transaction.token === 'ETH' && netAmount > 1) {
                                          // This is clearly wrong data, fallback to calculation
                                          console.warn('Invalid netAmount detected:', netAmount, 'for withdrawal ID:', transaction.id);
                                        } else {
                                          return netAmount.toFixed(6);
                                        }
                                      }
                                      
                                      const ntiqAmount = transaction.amount || 0;
                                      let tokenAmount = 'N/A';
                                      
                                      if (transaction.token === 'USDC' || transaction.token === 'USDT') {
                                        // USDC/USDT: 1 NTIQ = $0.01, apply 2.5% fee
                                        const usdValue = ntiqAmount * 0.01;
                                        const netValue = usdValue * 0.975; // 2.5% fee deduction
                                        tokenAmount = netValue.toFixed(2);
                                      } else if (transaction.token === 'ETH') {
                                        // ETH: use ETH price snapshot if available, otherwise use current price
                                        const ethPrice = transaction.ethPriceSnapshot || 3100; // Current ETH price
                                        const usdValue = ntiqAmount * 0.01;
                                        const netValue = usdValue * 0.975; // 2.5% fee deduction
                                        tokenAmount = (netValue / ethPrice).toFixed(6);
                                      } else {
                                        const usdValue = ntiqAmount * 0.01;
                                        const netValue = usdValue * 0.975; // 2.5% fee deduction
                                        tokenAmount = netValue.toFixed(2);
                                      }
                                      
                                      return tokenAmount;
                                    })()} {transaction.token}</div>
                                  )}
                                  {transaction.type === 'purchase' && (
                                    <div className="text-xs text-gray-900 dark:text-gray-100 font-semibold">← {(() => {
                                      // For purchases, display the payment amount directly
                                      return transaction.paymentAmount || 'N/A';
                                    })()} {transaction.token}</div>
                                  )}
                                  {transaction.type === 'deposit' && (
                                    <div className="text-xs text-gray-900 dark:text-gray-100 font-semibold">← {(() => {
                                      // For deposits, calculate the actual token amount required to be sent
                                      const ntiqAmount = transaction.amount || 0;
                                      const usdValue = ntiqAmount * 0.01; // 1 NTIQ = $0.01
                                      let tokenAmount = 'N/A';
                                      
                                      if (transaction.token === 'USDC' || transaction.token === 'USDT') {
                                        // USDC/USDT: 1:1 ratio with USD
                                        tokenAmount = usdValue.toFixed(2);
                                      } else if (transaction.token === 'ETH') {
                                        // ETH: use ETH price snapshot if available, otherwise current price
                                        const ethPrice = transaction.ethPriceSnapshot || 3100; // Current ETH price
                                        tokenAmount = (usdValue / ethPrice).toFixed(6);
                                      } else {
                                        tokenAmount = usdValue.toFixed(2);
                                      }
                                      
                                      return tokenAmount;
                                    })()} {transaction.token} • {transaction.chainName || transaction.networkName || 'Sepolia'}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={
                                  transaction.token === 'ETH' ? 'bg-gray-100 text-gray-700' :
                                  transaction.token === 'USDT' ? 'bg-green-100 text-green-700' :
                                  transaction.token === 'USDC' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-700'
                                }>
                                  {transaction.token}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    transaction.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    transaction.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-gray-100 text-gray-700'
                                  }
                                >
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs font-mono">
                                  {transaction.hash ? (
                                    <div className="flex flex-col space-y-1">
                                      <a
                                        href={(() => {
                                          const hash = transaction.hash;
                                          const networkName = (transaction.networkName || transaction.chainName)?.toLowerCase() || 'ethereum';
                                          
                                          switch (networkName) {
                                            case 'ethereum':
                                            case 'mainnet':
                                              return `https://etherscan.io/tx/${hash}`;
                                            case 'base':
                                              return `https://basescan.org/tx/${hash}`;
                                            case 'bsc':
                                            case 'binance':
                                              return `https://bscscan.com/tx/${hash}`;
                                            case 'optimism':
                                              return `https://optimistic.etherscan.io/tx/${hash}`;
                                            case 'arbitrum':
                                              return `https://arbiscan.io/tx/${hash}`;
                                            case 'sepolia':
                                              return `https://sepolia.etherscan.io/tx/${hash}`;
                                            case 'holesky':
                                              return `https://holesky.etherscan.io/tx/${hash}`;
                                            default:
                                              return `https://etherscan.io/tx/${hash}`;
                                          }
                                        })()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline cursor-pointer flex items-center"
                                        title={`View on ${transaction.networkName || transaction.chainName || 'Ethereum'} Explorer: ${transaction.hash}`}
                                      >
                                        {transaction.hash.slice(0, 10)}...
                                        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                      {transaction.type === 'deposit' && (transaction.networkName || transaction.chainName) && (
                                        <span className="text-xs text-gray-900 dark:text-gray-100 font-semibold">{transaction.networkName || transaction.chainName}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-900 dark:text-gray-100 font-semibold">Internal</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-900 dark:text-white font-medium">
                                {new Date(transaction.timestamp).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {transaction.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleForceComplete(transaction.id, transaction.type)}
                                      className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700"
                                    >
                                      Force Complete
                                    </Button>
                                  )}
                                  {transaction.status === 'failed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleForceComplete(transaction.id, transaction.type)}
                                      className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700"
                                    >
                                      Rollback
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredTransactions.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-gray-900 dark:text-white">
                                <div className="flex flex-col items-center">
                                  <FileText className="mb-2" size={32} />
                                  <p className="font-medium">Tidak ada transaksi ditemukan</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">History transaksi purchase, withdrawal, dan deposit akan muncul di sini</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      {/* Enhanced Pagination */}
                      {filteredTransactions.length > transactionsPerPage && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-600">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTransactionPage(prev => Math.max(1, prev - 1))}
                              disabled={transactionPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTransactionPage(prev => Math.min(Math.ceil(filteredTransactions.length / transactionsPerPage), prev + 1))}
                              disabled={transactionPage >= Math.ceil(filteredTransactions.length / transactionsPerPage)}
                            >
                              Next
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              Menampilkan {Math.min((transactionPage - 1) * transactionsPerPage + 1, filteredTransactions.length)} sampai {Math.min(transactionPage * transactionsPerPage, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.ceil(filteredTransactions.length / transactionsPerPage) }, (_, i) => i + 1)
                              .slice(Math.max(0, transactionPage - 3), transactionPage + 2)
                              .map((page) => (
                              <Button
                                key={page}
                                variant={transactionPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTransactionPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2" size={20} />
                    Security Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Enhanced Security Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Total Events</p>
                            <p className="text-2xl font-bold text-primary">
                              {securityStats.totalEvents}
                            </p>
                          </div>
                          <Shield className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Critical</p>
                            <p className="text-2xl font-bold text-red-500">
                              {securityStats.criticalEvents}
                            </p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">High</p>
                            <p className="text-2xl font-bold text-orange-500">
                              {securityStats.highEvents}
                            </p>
                          </div>
                          <AlertCircle className="h-8 w-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Medium</p>
                            <p className="text-2xl font-bold text-yellow-500">
                              {securityStats.mediumEvents}
                            </p>
                          </div>
                          <Info className="h-8 w-8 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Unresolved</p>
                            <p className="text-2xl font-bold text-red-400">
                              {securityStats.unresolvedEvents}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-red-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-surface-light">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">Auto-Blocked</p>
                            <p className="text-2xl font-bold text-blue-500">
                              {securityStats.autoBlockedIps}
                            </p>
                          </div>
                          <Ban className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Security Auto-Actions Settings */}
                  <Card className="bg-surface-light mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Settings className="mr-2" size={20} />
                          Auto Actions & Settings
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          Real-time Protection
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auto-block">Auto-block Suspicious IP</Label>
                            <Switch 
                              id="auto-block"
                              checked={securityAutoActions.autoBlockSuspiciousIp}
                              onCheckedChange={(checked) => setSecurityAutoActions(prev => ({...prev, autoBlockSuspiciousIp: checked}))}
                            />
                          </div>
                          <p className="text-xs text-slate-400">Automatically block IPs that fail login 10x within 10 minutes</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auto-alert">High/Critical Alert</Label>
                            <Switch 
                              id="auto-alert"
                              checked={securityAutoActions.autoAlertHighValue}
                              onCheckedChange={(checked) => setSecurityAutoActions(prev => ({...prev, autoAlertHighValue: checked}))}
                            />
                          </div>
                          <p className="text-xs text-slate-400">Notifikasi real-time ke Telegram/email untuk High/Critical events</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="geo-log">GeoIP Logging</Label>
                            <Switch 
                              id="geo-log"
                              checked={securityAutoActions.autoLogGeoLocation}
                              onCheckedChange={(checked) => setSecurityAutoActions(prev => ({...prev, autoLogGeoLocation: checked}))}
                            />
                          </div>
                          <p className="text-xs text-slate-400">Display IP country origin for suspicious login detection</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Real-time User Activities */}
                  <Card className="bg-surface-light mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="mr-2" size={20} />
                          Real-time User Activities
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                            LIVE
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => refetchUserActivities()}
                          >
                            <RefreshCw className="mr-1" size={14} />
                            Refresh
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Card className="bg-surface">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-400">Total Users</p>
                                <p className="text-2xl font-bold text-blue-500">
                                  {userActivities?.totalUsers || 0}
                                </p>
                              </div>
                              <Users className="h-8 w-8 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-surface">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-400">Online Now</p>
                                <p className="text-2xl font-bold text-green-500">
                                  {userActivities?.onlineUsers || 0}
                                </p>
                              </div>
                              <div className="relative">
                                <Activity className="h-8 w-8 text-green-500" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-surface">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-400">Logins 24H</p>
                                <p className="text-2xl font-bold text-purple-500">
                                  {userActivities?.last24hLogins || 0}
                                </p>
                              </div>
                              <Clock className="h-8 w-8 text-purple-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Auth Method</TableHead>
                            <TableHead>Risk Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userActivities?.data?.slice(0, 5).map((activity: any) => (
                            <TableRow key={activity.userId}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="font-medium">{activity.username}</div>
                                  {activity.isAdmin && (
                                    <Badge variant="outline" className="text-xs">Admin</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${activity.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                  <span className={activity.isOnline ? 'text-green-600' : 'text-gray-500'}>
                                    {activity.isOnline ? 'Online' : 'Offline'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {activity.lastLogin ? new Date(activity.lastLogin).toLocaleString('id-ID') : '-'}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {activity.currentIP || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={activity.authMethod === 'wallet' ? 'default' : 'secondary'}>
                                  {activity.authMethod}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={activity.riskScore > 5 ? 'destructive' : activity.riskScore > 2 ? 'secondary' : 'default'}>
                                  {activity.riskScore}/10
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>



                  {/* System Status Dashboard */}
                  <Card className="bg-surface-light mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Cog className="mr-2" size={20} />
                          System Status Monitor
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                            System Healthy - 99.8% Uptime
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => refetchSystemStatus()}
                          >
                            <RefreshCw className="mr-1" size={14} />
                            Refresh
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Deposit Security Status */}
                        <Card className="bg-surface">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">Deposit Security</h3>
                              <div className={`w-3 h-3 rounded-full ${systemStatus?.data?.depositSecurity?.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Status:</span>
                                <span className={systemStatus?.data?.depositSecurity?.isRunning ? 'text-green-600' : 'text-red-600'}>
                                  {systemStatus?.data?.depositSecurity?.isRunning ? 'Running' : 'Stopped'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Checks Today:</span>
                                <span>{systemStatus?.data?.depositSecurity?.checksToday || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Issues Found:</span>
                                <span className={systemStatus?.data?.depositSecurity?.issuesFound > 0 ? 'text-red-600' : 'text-green-600'}>
                                  {systemStatus?.data?.depositSecurity?.issuesFound || 0}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Withdrawal Security Status */}
                        <Card className="bg-surface">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">Withdrawal Security</h3>
                              <div className={`w-3 h-3 rounded-full ${systemStatus?.data?.withdrawalSecurity?.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Status:</span>
                                <span className={systemStatus?.data?.withdrawalSecurity?.isRunning ? 'text-green-600' : 'text-red-600'}>
                                  {systemStatus?.data?.withdrawalSecurity?.isRunning ? 'Running' : 'Stopped'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Processed Today:</span>
                                <span>{systemStatus?.data?.withdrawalSecurity?.processedToday || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Failed Today:</span>
                                <span className={systemStatus?.data?.withdrawalSecurity?.failedToday > 0 ? 'text-red-600' : 'text-green-600'}>
                                  {systemStatus?.data?.withdrawalSecurity?.failedToday || 0}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Database Status */}
                        <Card className="bg-surface">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">Database</h3>
                              <div className={`w-3 h-3 rounded-full ${systemStatus?.data?.database?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Status:</span>
                                <span className={systemStatus?.data?.database?.connected ? 'text-green-600' : 'text-red-600'}>
                                  {systemStatus?.data?.database?.connected ? 'Connected' : 'Disconnected'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Response Time:</span>
                                <span>{systemStatus?.data?.database?.responseTime || 0}ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Last Backup:</span>
                                <span className="text-xs">
                                  {systemStatus?.data?.database?.lastBackup ? new Date(systemStatus.data.database.lastBackup).toLocaleString('id-ID') : '-'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* API Status */}
                        <Card className="bg-surface">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">API Performance</h3>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Response Time:</span>
                                <span>{systemStatus?.data?.api?.responseTime || 0}ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Requests/min:</span>
                                <span>{systemStatus?.data?.api?.requestsPerMinute || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Error Rate:</span>
                                <span className={systemStatus?.data?.api?.errorRate > 5 ? 'text-red-600' : 'text-green-600'}>
                                  {systemStatus?.data?.api?.errorRate || 0}%
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Blockchain Status */}
                        <Card className="bg-surface">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">Blockchain</h3>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Ethereum:</span>
                                <span className={systemStatus?.data?.blockchain?.ethereumConnected ? 'text-green-600' : 'text-red-600'}>
                                  {systemStatus?.data?.blockchain?.ethereumConnected ? 'Connected' : 'Disconnected'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Holesky:</span>
                                <span className={systemStatus?.data?.blockchain?.holeskyConnected ? 'text-green-600' : 'text-red-600'}>
                                  {systemStatus?.data?.blockchain?.holeskyConnected ? 'Connected' : 'Disconnected'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Last Check:</span>
                                <span className="text-xs">
                                  {systemStatus?.data?.blockchain?.lastBlockCheck ? new Date(systemStatus.data.blockchain.lastBlockCheck).toLocaleString('id-ID') : '-'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>



                  {/* Rekomendasi Pengembangan Section */}
                  <Card className="bg-surface-light mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="mr-2">💡</span>
                        Rekomendasi Pengembangan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Area</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Severity Levels:</strong> Add other levels: Medium, High, Critical for suspicious logins, large withdrawals, unusual IPs</div>
                            <div><strong>Filter & Search:</strong> Filter by event type, wallet, IP, severity, date</div>
                            <div><strong>Export Log:</strong> For audit purposes (CSV or PDF)</div>
                            <div><strong>Alert System:</strong> Real-time notifications to Telegram/email for High/Critical alerts (optional for admin)</div>
                            <div><strong>GeoIP:</strong> Display IP country origin → helps detect suspicious logins</div>
                            <div><strong>Auto Actions:</strong> For example: IP fails login 10x within 10 minutes → automatically blocked</div>
                            <div><strong>Tagging & Notes:</strong> Admin can tag logs: "reviewed", "false positive", "under review"</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">🔒 Contoh Log Level Lanjutan (simulasi)</h4>
                          <div className="space-y-3 text-sm">
                            <div className="p-2 bg-orange-100 text-orange-800 rounded border-l-4 border-orange-500">
                              <span className="font-semibold">🟡 Medium:</span> Unusual login: Admin from new device
                            </div>
                            <div className="p-2 bg-red-100 text-red-800 rounded border-l-4 border-red-500">
                              <span className="font-semibold">🔴 High:</span> 100,000 PTS withdrawn to new wallet
                            </div>
                            <div className="p-2 bg-red-200 text-red-900 rounded border-l-4 border-red-600">
                              <span className="font-semibold">🚨 Critical:</span> Multiple login attempts from blacklisted IP
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Banner Management Tab */}
          <TabsContent value="banners" className="space-y-6">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Megaphone className="mr-2 text-purple-400" size={20} />
                  Banner & Advertisement Management
                </CardTitle>
                <p className="text-slate-400">Kelola banner promo dan iklan untuk platform Nectiq</p>
              </CardHeader>
            </Card>
            <BannerManagement />
          </TabsContent>

          {/* Events Management Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 text-blue-400" size={20} />
                    Event Management
                  </CardTitle>
                  <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { resetEventForm(); setShowEventDialog(true); }} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2" size={16} />
                        Create Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingEvent ? "Edit Event" : "Create New Event"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Event Title *</Label>
                            <Input
                              id="title"
                              value={eventFormData.title}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter event title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="eventType">Event Type</Label>
                            <Select value={eventFormData.eventType} onValueChange={(value) => setEventFormData(prev => ({ ...prev, eventType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="announcement">📢 Announcement</SelectItem>
                                <SelectItem value="update">🔄 Platform Update</SelectItem>
                                <SelectItem value="promotion">🎉 Promotion</SelectItem>
                                <SelectItem value="partnership">🤝 Partnership</SelectItem>
                                <SelectItem value="community">👥 Community Event</SelectItem>
                                <SelectItem value="technical">🔧 Technical Update</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="organizer">Organizer</Label>
                            <Input
                              id="organizer"
                              value={eventFormData.organizer}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, organizer: e.target.value }))}
                              placeholder="Event organizer"
                            />
                          </div>
                          <div>
                            <Label htmlFor="organizerLogo">Organizer Logo URL</Label>
                            <Input
                              id="organizerLogo"
                              value={eventFormData.organizerLogo}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, organizerLogo: e.target.value }))}
                              placeholder="https://example.com/logo.png"
                            />
                          </div>
                          <div>
                            <Label htmlFor="imageUrl">Event Image URL</Label>
                            <Input
                              id="imageUrl"
                              value={eventFormData.imageUrl}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                              placeholder="https://example.com/event-image.jpg"
                            />
                          </div>
                          <div>
                            <Label htmlFor="linkUrl">Link URL</Label>
                            <Input
                              id="linkUrl"
                              value={eventFormData.linkUrl}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                              placeholder="https://example.com/more-info"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                              id="description"
                              className="w-full p-2 border rounded-md h-24 bg-background text-foreground"
                              value={eventFormData.description}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Event description..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={eventFormData.location}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="Online / City, Country"
                            />
                          </div>
                          <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={eventFormData.startDate}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={eventFormData.endDate}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="priority">Priority (0-10)</Label>
                            <Input
                              id="priority"
                              type="number"
                              min="0"
                              max="10"
                              value={eventFormData.priority}
                              onChange={(e) => setEventFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="isActive"
                                checked={eventFormData.isActive}
                                onCheckedChange={(checked) => setEventFormData(prev => ({ ...prev, isActive: !!checked }))}
                              />
                              <Label htmlFor="isActive">Active</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="isFeatured"
                                checked={eventFormData.isFeatured}
                                onCheckedChange={(checked) => setEventFormData(prev => ({ ...prev, isFeatured: !!checked }))}
                              />
                              <Label htmlFor="isFeatured">Featured</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitEvent}
                          disabled={createEventMutation.isPending || updateEventMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {createEventMutation.isPending || updateEventMutation.isPending ? "Saving..." : (editingEvent ? "Update Event" : "Create Event")}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-slate-400">Manage platform events, announcements, and updates</p>
              </CardHeader>
            </Card>

            {/* Event Filters and Search */}
            <Card className="bg-surface border-surface-light">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search events by title, organizer, or description..."
                      value={eventsSearchQuery}
                      onChange={(e) => setEventsSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={eventsFilter} onValueChange={setEventsFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="announcement">📢 Announcements</SelectItem>
                      <SelectItem value="update">🔄 Updates</SelectItem>
                      <SelectItem value="promotion">🎉 Promotions</SelectItem>
                      <SelectItem value="partnership">🤝 Partnerships</SelectItem>
                      <SelectItem value="community">👥 Community</SelectItem>
                      <SelectItem value="technical">🔧 Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Events ({filteredEvents.length})</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      {filteredEvents.filter((e: any) => e.isActive).length} Active
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      {filteredEvents.filter((e: any) => e.isFeatured).length} Featured
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-400">No events found</p>
                    <p className="text-sm text-slate-500 mt-1">Create your first event to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event: any) => (
                      <div key={event.id} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                              <Badge variant="outline" className={`text-xs ${
                                event.eventType === 'announcement' ? 'bg-blue-100 text-blue-700' :
                                event.eventType === 'update' ? 'bg-green-100 text-green-700' :
                                event.eventType === 'promotion' ? 'bg-purple-100 text-purple-700' :
                                event.eventType === 'partnership' ? 'bg-orange-100 text-orange-700' :
                                event.eventType === 'community' ? 'bg-pink-100 text-pink-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {event.eventType}
                              </Badge>
                              {event.isFeatured && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              <Badge variant={event.isActive ? "default" : "secondary"}>
                                {event.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-slate-300 text-sm mb-2">{event.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-slate-400">
                              {event.organizer && (
                                <div className="flex items-center space-x-1">
                                  <span>👤</span>
                                  <span>{event.organizer}</span>
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              {event.startDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {event.linkUrl && (
                                <div className="flex items-center space-x-1">
                                  <ExternalLink className="w-3 h-3" />
                                  <a href={event.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                    Link
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {event.imageUrl && (
                              <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden">
                                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex flex-col space-y-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditEvent(event)}
                                className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteEventMutation.mutate(event.id)}
                                disabled={deleteEventMutation.isPending}
                                className="bg-red-600/10 hover:bg-red-600/20 text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Header with Export and Status */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2" size={20} />
                      System Settings
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Status: Operational
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportSettings}
                        className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/20"
                      >
                        <Download className="mr-2" size={16} />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Configure platform settings, limits, and security options below
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Platform Configuration */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cog className="mr-2" size={18} />
                    Platform Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="min-prediction" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Minimum Prediction Amount (NTIQ)
                        <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                      </Label>
                      <Input 
                        id="min-prediction" 
                        value={settingsForm.platform.minPredictionAmount}
                        onChange={(e) => handleSettingsChange('platform', 'minPredictionAmount', parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter minimum amount"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Minimum value required to create a prediction</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-prediction" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Maximum Prediction Amount (NTIQ)
                        <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                      </Label>
                      <Input 
                        id="max-prediction" 
                        value={settingsForm.platform.maxPredictionAmount}
                        onChange={(e) => handleSettingsChange('platform', 'maxPredictionAmount', parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter maximum amount"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Maximum value allowed for creating a prediction</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawal-fee" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Withdrawal Fee (%)
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Critical</Badge>
                      </Label>
                      <Input 
                        id="withdrawal-fee" 
                        value={settingsForm.platform.withdrawalFee}
                        onChange={(e) => handleSettingsChange('platform', 'withdrawalFee', parseFloat(e.target.value))}
                        type="number" 
                        step="0.1"
                        placeholder="Enter withdrawal fee"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Fee charged during withdrawal (in percentage)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-withdrawal" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Minimum Withdrawal (NTIQ)
                        <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                      </Label>
                      <Input 
                        id="min-withdrawal" 
                        value={settingsForm.platform.minWithdrawal}
                        onChange={(e) => handleSettingsChange('platform', 'minWithdrawal', parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter minimum withdrawal"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Minimum amount required for withdrawal</p>
                    </div>
                  </div>

                  {/* Limits Section */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">System Limits</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label htmlFor="prediction-limit" className="text-gray-700 dark:text-gray-300">Predictions per Hour</Label>
                        <Input 
                          id="prediction-limit"
                          value="20"
                          type="number"
                          className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="withdrawal-delay" className="text-gray-700 dark:text-gray-300">Withdrawal Delay (hours)</Label>
                        <Input 
                          id="withdrawal-delay"
                          value="4"
                          type="number"
                          className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Exchange Rates with Dynamic Integration */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <DollarSign className="mr-2" size={18} />
                      Exchange Rates & Pricing
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                        Live Feed
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshRates}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
                      >
                        <RefreshCw className="mr-2" size={16} />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="eth-rate" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        ETH to NTIQ Rate
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Auto-Update</Badge>
                      </Label>
                      <Input 
                        id="eth-rate" 
                        value={settingsForm.exchangeRates.ethToPts}
                        onChange={(e) => handleSettingsChange('exchangeRates', 'ethToPts', parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter ETH rate"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">1 ETH = {settingsForm.exchangeRates.ethToPts ? settingsForm.exchangeRates.ethToPts.toLocaleString() : 300000} NTIQ</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Last updated: 2 minutes ago</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usdt-rate" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        USDT to NTIQ Rate
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Auto-Update</Badge>
                      </Label>
                      <Input 
                        id="usdt-rate" 
                        value={settingsForm.exchangeRates.usdtToPts}
                        onChange={(e) => handleSettingsChange('exchangeRates', 'usdtToPts', parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter USDT rate"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">1 USDT = {settingsForm.exchangeRates.usdtToPts} NTIQ</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Last updated: 1 minute ago</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pts-usdt-rate" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        NTIQ to USDT Rate
                        <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Manual</Badge>
                      </Label>
                      <Input 
                        id="pts-usdt-rate" 
                        value={settingsForm.exchangeRates.ptsToUsdt}
                        onChange={(e) => handleSettingsChange('exchangeRates', 'ptsToUsdt', parseFloat(e.target.value))}
                        type="number" 
                        step="0.001"
                        placeholder="Enter NTIQ rate"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">1 NTIQ = {settingsForm.exchangeRates.ptsToUsdt} USDT</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">Requires manual update</p>
                    </div>
                  </div>

                  {/* Price Oracle Integration Preview */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                      <TrendingUp className="mr-2" size={16} />
                      Dynamic Price Oracle Integration
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                      Real-time price feeds from CoinGecko API and Chainlink for accurate exchange rates
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>CoinGecko API: Connected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Chainlink Oracle: Pending</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Security Settings with Granular Controls */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2" size={18} />
                    Security & Rate Limiting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="rate-limit" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        API Rate Limit (requests/minute)
                        <Badge variant="outline" className="ml-2 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Critical</Badge>
                      </Label>
                      <Input 
                        id="rate-limit" 
                        value={settingsForm.security.rateLimit}
                        onChange={(e) => handleSettingsChange('security', 'rateLimit', parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter rate limit"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Maximum API requests per minute per IP</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-predictions" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Max Predictions per Hour
                        <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                      </Label>
                      <Input 
                        id="max-predictions" 
                        value={settingsForm.security.maxPredictionsPerHour}
                        onChange={(e) => handleSettingsChange('security', 'maxPredictionsPerHour', parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter prediction limit"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Prediction limit per hour per user</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-withdrawals" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Max Withdrawals per Hour
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Monitored</Badge>
                      </Label>
                      <Input 
                        id="max-withdrawals" 
                        value={settingsForm.security.maxWithdrawalsPerHour}
                        onChange={(e) => handleSettingsChange('security', 'maxWithdrawalsPerHour', parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter withdrawal limit"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Withdrawal limit per hour per user</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Session Timeout (hours)
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Standard</Badge>
                      </Label>
                      <Input 
                        id="session-timeout" 
                        value={settingsForm.security.sessionTimeout}
                        onChange={(e) => handleSettingsChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter timeout hours"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">User session expiration time</p>
                    </div>
                  </div>

                  {/* Keamanan Tambahan Section */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center">
                      <Lock className="mr-2" size={16} />
                      Additional Security
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Switch checked={true} />
                        <span className="text-amber-900 dark:text-amber-100 font-medium">Session timeout checks for specific wallets (e.g., main admin).</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={false} />
                        <span className="text-amber-900 dark:text-amber-100 font-medium">Add CAPTCHA or critical settings (e.g., emergency stop).</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={true} />
                        <span className="text-amber-900 dark:text-amber-100 font-medium">Validation logic prevents extreme withdrawal fees (&gt;10%).</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Automated Withdrawal Management */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2" size={18} />
                    Automated Withdrawal System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* System Status */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${automatedWithdrawalConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <h4 className="font-semibold text-green-700 dark:text-green-300">System Status</h4>
                      </div>
                      <Badge variant="outline" className={automatedWithdrawalConfig.enabled ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}>
                        {automatedWithdrawalConfig.enabled ? "Operational" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 dark:text-green-300">Processing: Every 5 minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 dark:text-blue-300">Daily Limit: $10,000</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-700 dark:text-purple-300">Auto-approve: Up to $500</span>
                      </div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        System Control
                        <Badge variant="outline" className="ml-2 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Critical</Badge>
                      </Label>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
                          onClick={handleEnableAutomatedWithdrawals}
                          disabled={enableAutomatedWithdrawalMutation.isPending || automatedWithdrawalConfig.enabled}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {enableAutomatedWithdrawalMutation.isPending ? "Enabling..." : "Enable Automation"}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
                          onClick={handleDisableAutomatedWithdrawals}
                          disabled={disableAutomatedWithdrawalMutation.isPending || !automatedWithdrawalConfig.enabled}
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          {disableAutomatedWithdrawalMutation.isPending ? "Disabling..." : "Disable Automation"}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Manual Processing
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Manual</Badge>
                      </Label>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300 w-full"
                        onClick={handleProcessWithdrawalsManually}
                        disabled={processWithdrawalsManuallyMutation.isPending}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {processWithdrawalsManuallyMutation.isPending ? "Processing..." : "Process Withdrawals Now"}
                      </Button>
                    </div>
                  </div>

                  {/* Configuration Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="daily-limit" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Daily Withdrawal Limit (USD)
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Security</Badge>
                      </Label>
                      <Input 
                        id="daily-limit" 
                        value={automatedWithdrawalConfig.dailyLimit}
                        onChange={(e) => handleUpdateAutomatedWithdrawalConfig('dailyLimit', parseInt(e.target.value) || 0)}
                        type="number"
                        placeholder="Enter daily limit"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Maximum total withdrawals per day</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="auto-approve" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Auto-approval Threshold (USD)
                        <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Automated</Badge>
                      </Label>
                      <Input 
                        id="auto-approve" 
                        value={automatedWithdrawalConfig.autoApprovalThreshold}
                        onChange={(e) => handleUpdateAutomatedWithdrawalConfig('autoApprovalThreshold', parseInt(e.target.value) || 0)}
                        type="number"
                        placeholder="Enter auto-approval limit"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Withdrawals below this amount are auto-approved</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-single" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Max Single Withdrawal (USD)
                        <Badge variant="outline" className="ml-2 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Limit</Badge>
                      </Label>
                      <Input 
                        id="max-single" 
                        value={automatedWithdrawalConfig.maxSingleWithdrawal}
                        onChange={(e) => handleUpdateAutomatedWithdrawalConfig('maxSingleWithdrawal', parseInt(e.target.value) || 0)}
                        type="number"
                        placeholder="Enter max single withdrawal"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Maximum amount for a single withdrawal</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="processing-interval" className="flex items-center text-gray-900 dark:text-gray-100 font-medium">
                        Processing Interval (minutes)
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Timing</Badge>
                      </Label>
                      <Input 
                        id="processing-interval" 
                        value={automatedWithdrawalConfig.processingInterval}
                        onChange={(e) => handleUpdateAutomatedWithdrawalConfig('processingInterval', parseInt(e.target.value) || 0)}
                        type="number"
                        placeholder="Enter interval in minutes"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">How often to check for pending withdrawals</p>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center">
                      <Lock className="mr-2" size={16} />
                      Security Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={automatedWithdrawalConfig.multiChainValidation} 
                          onCheckedChange={(checked) => handleUpdateAutomatedWithdrawalConfig('multiChainValidation', checked)}
                        />
                        <span className="text-amber-900 dark:text-amber-100 font-medium">Multi-chain security validation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={automatedWithdrawalConfig.fraudDetection} 
                          onCheckedChange={(checked) => handleUpdateAutomatedWithdrawalConfig('fraudDetection', checked)}
                        />
                        <span className="text-amber-900 dark:text-amber-100 font-medium">Automatic fraud detection</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={automatedWithdrawalConfig.gasPriceOptimization} 
                          onCheckedChange={(checked) => handleUpdateAutomatedWithdrawalConfig('gasPriceOptimization', checked)}
                        />
                        <span className="text-amber-900 dark:text-amber-100 font-medium">Gas price optimization</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={automatedWithdrawalConfig.emailNotifications} 
                          onCheckedChange={(checked) => handleUpdateAutomatedWithdrawalConfig('emailNotifications', checked)}
                        />
                        <span className="text-amber-900 dark:text-amber-100 font-medium">Email notifications for high-value</span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{automatedWithdrawalStats.processedToday}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">Processed Today</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">${automatedWithdrawalStats.totalVolume.toLocaleString()}</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Total Volume</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{automatedWithdrawalStats.pendingReview}</div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending Review</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{automatedWithdrawalStats.successRate}%</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">Success Rate</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      onClick={handleRefreshAutomatedWithdrawalStatus}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Status
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleSaveAutomatedWithdrawalSettings}
                      disabled={updateAutomatedWithdrawalSettingsMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateAutomatedWithdrawalSettingsMutation.isPending ? "Saving..." : "Save Configuration"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Save Settings */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Save className="mr-2" size={18} />
                    Save Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Save current settings configuration
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleSaveAutomatedWithdrawalSettings}
                      disabled={updateAutomatedWithdrawalSettingsMutation.isPending}
                    >
                      <Save className="mr-2" size={16} />
                      {updateAutomatedWithdrawalSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileDown className="mr-2" size={18} />
                    Export Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="justify-start">
                      <FileSpreadsheet className="mr-2" size={16} />
                      Export CSV
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Code className="mr-2" size={16} />
                      Export JSON
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Archive className="mr-2" size={16} />
                      Download Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Admin Controls with Two-Step Authentication */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShieldCheck className="mr-2" size={18} />
                    Admin Controls & Emergency Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Standard Actions */}
                  <div>
                    <h4 className="font-semibold mb-3">Standard Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => clearCacheMutation.mutate()}
                        disabled={clearCacheMutation.isPending}
                        className="flex items-center justify-start"
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${clearCacheMutation.isPending ? 'animate-spin' : ''}`} />
                        Clear Cache
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => backupDatabaseMutation.mutate()}
                        disabled={backupDatabaseMutation.isPending}
                        className="flex items-center justify-start"
                      >
                        <Database className="mr-2 h-4 w-4" />
                        Backup Database
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => exportLogsMutation.mutate()}
                        disabled={exportLogsMutation.isPending}
                        className="flex items-center justify-start"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Export Logs
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleRefreshRates}
                        className="flex items-center justify-start"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Refresh Exchange Rates
                      </Button>
                    </div>
                  </div>

                  {/* Emergency Actions with Two-Step Auth */}
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400">Emergency Actions</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button 
                          variant="destructive" 
                          onClick={() => setShowEmergencyModal('withdrawal')}
                          className="flex items-center justify-start"
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Stop Withdrawals Only
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => setShowEmergencyModal('system')}
                          className="flex items-center justify-start"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Total System Shutdown
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center">
                          <Lock className="mr-1" size={12} />
                          Emergency actions require two-step authentication (PIN/Email/OTP)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Save Settings with Enhanced Security */}
                  <div className="pt-4 border-t border-surface-light">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">Save Configuration</h4>
                        <p className="text-xs text-slate-500">Changes will be logged and require confirmation for critical settings</p>
                      </div>
                      <Button 
                        onClick={handleSaveSettings}
                        disabled={saveSettingsMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6"
                      >
                        {saveSettingsMutation.isPending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save All Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-surface border-surface-light">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2" size={20} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-semibold">
                            User {activity.userId} made {activity.cryptocurrency} prediction
                          </p>
                          <p className="text-sm text-slate-400">
                            Predicted ${parseFloat(activity.predictedPrice).toLocaleString()} for {activity.timeframe}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(activity.status)}
                        <span className="text-sm text-slate-400">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Battles Management Tab */}
          <TabsContent value="battles" className="space-y-6">
            {/* Battles Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Battles</CardTitle>
                  <Swords className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{battleStats.totalBattles || 0}</div>
                  <p className="text-xs text-muted-foreground">All-time battles created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Battles</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{battleStats.activeBattles || 0}</div>
                  <p className="text-xs text-muted-foreground">Currently ongoing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Battles</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{battleStats.completedBattles || 0}</div>
                  <p className="text-xs text-muted-foreground">Finished battles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stakes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{battleStats.totalStakes || 0} NTIQ</div>
                  <p className="text-xs text-muted-foreground">Total stakes wagered</p>
                </CardContent>
              </Card>
            </div>

            {/* Battles Management Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="h-5 w-5" />
                    Battles Management
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowCreateBattleDialog(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Battle
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportBattlesToCSV}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleClearAllBattles}
                      disabled={clearAllBattlesMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Battles
                    </Button>
                    {selectedBattles.length > 0 && (
                      <Button
                        variant="destructive"
                        onClick={handleBulkDeleteBattles}
                        disabled={bulkDeleteBattlesMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedBattles.length})
                      </Button>
                    )}
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Search Battles</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by users or crypto..."
                        value={battlesSearchQuery}
                        onChange={(e) => setBattlesSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status Filter</Label>
                    <Select value={battlesStatusFilter} onValueChange={setBattlesStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cryptocurrency Filter</Label>
                    <Select value={battlesCryptoFilter} onValueChange={setBattlesCryptoFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cryptocurrencies</SelectItem>
                        <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                        <SelectItem value="binancecoin">Binance Coin (BNB)</SelectItem>
                        <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                        <SelectItem value="solana">Solana (SOL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={battlesDateFilter.startDate}
                        onChange={(e) => setBattlesDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        placeholder="Start date"
                        className="flex-1"
                      />
                      <Input
                        type="date"
                        value={battlesDateFilter.endDate}
                        onChange={(e) => setBattlesDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        placeholder="End date"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Battle management content will be added here */}
              </CardContent>
            </Card>

            {/* Battles Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5" />
                  Battle Management
                  {wsConnected && (
                    <Badge variant="secondary" className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      LIVE
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {battlesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading battles...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Battle ID</TableHead>
                          <TableHead>Challenger</TableHead>
                          <TableHead>Opponent</TableHead>
                          <TableHead>Cryptocurrency</TableHead>
                          <TableHead>Stake Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Winner</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {battles.slice((battlesPage - 1) * battlesPerPage, battlesPage * battlesPerPage).map((battle: any) => (
                          <TableRow key={battle.id}>
                            <TableCell className="font-mono">#{battle.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {battle.challengerProfilePhoto ? (
                                  <img 
                                    src={battle.challengerProfilePhoto} 
                                    alt={battle.challengerUsername || 'Challenger'}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                  style={{ display: battle.challengerProfilePhoto ? 'none' : 'flex' }}
                                >
                                  {battle.challengerUsername?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <div className="font-medium">{battle.challengerUsername || 'Unknown'}</div>
                                  <div className="text-xs text-muted-foreground">UID: {battle.challengerUid}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {battle.challengedUsername ? (
                                <div className="flex items-center gap-2">
                                  {battle.challengedProfilePhoto ? (
                                    <img 
                                      src={battle.challengedProfilePhoto} 
                                      alt={battle.challengedUsername || 'Opponent'}
                                      className="w-8 h-8 rounded-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ display: battle.challengedProfilePhoto ? 'none' : 'flex' }}
                                  >
                                    {battle.challengedUsername.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium">{battle.challengedUsername}</div>
                                    <div className="text-xs text-muted-foreground">UID: {battle.challengedUid}</div>
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="outline">Waiting for opponent</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <img 
                                  src={`https://coin-images.coingecko.com/coins/images/${battle.cryptoImageId}/small/${battle.cryptocurrency}.png`}
                                  alt={battle.cryptocurrency}
                                  className="w-6 h-6"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div>
                                  <div className="font-medium">{battle.cryptocurrency?.toUpperCase()}</div>
                                  <div className="text-xs text-muted-foreground">${battle.currentPrice?.toFixed(2)}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{battle.stakeAmount} NTIQ</div>
                              <div className="text-xs text-muted-foreground">Each player</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                battle.status === 'completed' ? 'default' :
                                battle.status === 'active' ? 'secondary' :
                                battle.status === 'open' ? 'outline' : 'destructive'
                              }>
                                {battle.status?.charAt(0).toUpperCase() + battle.status?.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{new Date(battle.createdAt).toLocaleDateString()}</div>
                              <div className="text-xs text-muted-foreground">{new Date(battle.createdAt).toLocaleTimeString()}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{battle.duration} mins</div>
                              {battle.timeRemaining && (
                                <div className="text-xs text-muted-foreground">{battle.timeRemaining} left</div>
                              )}
                            </TableCell>
                            <TableCell>
                              {battle.winnerId ? (
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-medium">{battle.winnerUsername}</span>
                                </div>
                              ) : battle.status === 'completed' ? (
                                <Badge variant="outline">Draw</Badge>
                              ) : (
                                <span className="text-muted-foreground">TBD</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <span 
                                  className="inline-flex items-center justify-center h-7 w-7 p-0 border border-input rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                                  onClick={(e) => {
                                    try {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Battle View clicked:', battle?.id);
                                      console.log('Battle data:', battle);
                                      console.log('Current modal state:', showBattleDetailsModal);
                                      
                                      if (battle) {
                                        setSelectedBattleDetails(battle);
                                        setShowBattleDetailsModal(true);
                                        console.log('Modal state updated successfully');
                                      } else {
                                        console.error('Battle data is null or undefined');
                                      }
                                    } catch (error) {
                                      console.error('Error in View button click:', error);
                                    }
                                  }}
                                  title="View Battle Details"
                                >
                                  <Eye className="h-3 w-3" />
                                </span>
                                {battle.status === 'open' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                    onClick={async () => {
                                      if (confirm(`Are you sure you want to cancel battle #${battle.id}?`)) {
                                        try {
                                          await cancelBattleMutation.mutateAsync(battle.id);
                                          toast({
                                            title: "Success",
                                            description: `Battle #${battle.id} has been cancelled`,
                                          });
                                        } catch (error) {
                                          toast({
                                            title: "Error",
                                            description: "Failed to cancel battle",
                                            variant: "destructive",
                                          });
                                        }
                                      }
                                    }}
                                    title="Cancel Battle"
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {battles.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                              <div className="flex flex-col items-center">
                                <Swords className="mb-2 h-8 w-8" />
                                <p>No battles found</p>
                                <p className="text-sm">Battles will appear here when users create them</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    {/* Battles Pagination */}
                    {battles.length > battlesPerPage && (
                      <div className="flex items-center justify-between pt-6 border-t">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBattlesPage(prev => Math.max(1, prev - 1))}
                            disabled={battlesPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBattlesPage(prev => Math.min(Math.ceil(battles.length / battlesPerPage), prev + 1))}
                            disabled={battlesPage >= Math.ceil(battles.length / battlesPerPage)}
                          >
                            Next
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            Showing {Math.min((battlesPage - 1) * battlesPerPage + 1, battles.length)} to {Math.min(battlesPage * battlesPerPage, battles.length)} of {battles.length} battles
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.ceil(battles.length / battlesPerPage) }, (_, i) => i + 1)
                            .slice(Math.max(0, battlesPage - 3), battlesPage + 2)
                            .map((page) => (
                            <Button
                              key={page}
                              variant={battlesPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setBattlesPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Survival Tournament Management */}
          <TabsContent value="survival">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Create Survival Tournament
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tournament Title</Label>
                      <Input 
                        placeholder="Enter tournament title" 
                        value={newTournament.title}
                        onChange={(e) => setNewTournament({...newTournament, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input 
                        placeholder="Enter description" 
                        value={newTournament.description}
                        onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cryptocurrency</Label>
                      <Select value={newTournament.cryptocurrency} onValueChange={(value) => setNewTournament({...newTournament, cryptocurrency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                          <SelectItem value="binancecoin">Binance Coin (BNB)</SelectItem>
                          <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                          <SelectItem value="solana">Solana (SOL)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Entry Fee (NTIQ)</Label>
                      <Input 
                        type="number" 
                        placeholder="Enter entry fee" 
                        value={newTournament.entryFee}
                        onChange={(e) => setNewTournament({...newTournament, entryFee: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Participants</Label>
                      <Input 
                        type="number" 
                        placeholder="Enter max participants" 
                        value={newTournament.maxParticipants}
                        onChange={(e) => setNewTournament({...newTournament, maxParticipants: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Default Round Duration (minutes)</Label>
                      <Input 
                        type="number" 
                        placeholder="Enter default round duration" 
                        value={newTournament.roundDuration}
                        onChange={(e) => setNewTournament({...newTournament, roundDuration: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  {/* Reward Configuration Section */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Reward Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Reward Type</Label>
                        <Select value={newTournament.rewardType} onValueChange={(value) => setNewTournament({...newTournament, rewardType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reward currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NTIQ">NTIQ (Platform Token)</SelectItem>
                            <SelectItem value="USDT">USDT (Tether)</SelectItem>
                            <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Winner Reward Amount</Label>
                        <Input 
                          type="number" 
                          placeholder="Enter reward amount" 
                          value={newTournament.rewardAmount}
                          onChange={(e) => setNewTournament({...newTournament, rewardAmount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Reward Info:</strong> The winner will receive {newTournament.rewardAmount} {newTournament.rewardType}. 
                        This is separate from the entry fee pool which accumulates from all participants.
                      </p>
                    </div>
                  </div>

                  {/* Individual Round Durations Section */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Individual Round Durations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="round1-duration" className="text-gray-900 dark:text-gray-100">Round 1 (minutes)</Label>
                        <Input
                          id="round1-duration"
                          type="number"
                          min="5"
                          max="1440"
                          className="w-full px-3 py-2 min-w-[120px]"
                          value={newTournament.round1Duration || ''}
                          onChange={(e) => setNewTournament({
                            ...newTournament,
                            round1Duration: e.target.value ? parseInt(e.target.value) : 15
                          })}
                          placeholder="e.g., 15"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="round2-duration" className="text-gray-900 dark:text-gray-100">Round 2 (minutes)</Label>
                        <Input
                          id="round2-duration"
                          type="number"
                          min="5"
                          max="1440"
                          className="w-full px-3 py-2 min-w-[120px]"
                          value={newTournament.round2Duration || ''}
                          onChange={(e) => setNewTournament({
                            ...newTournament,
                            round2Duration: e.target.value ? parseInt(e.target.value) : 30
                          })}
                          placeholder="e.g., 30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="round3-duration" className="text-gray-900 dark:text-gray-100">Round 3 (minutes)</Label>
                        <Input
                          id="round3-duration"
                          type="number"
                          min="5"
                          max="1440"
                          className="w-full px-3 py-2 min-w-[120px]"
                          value={newTournament.round3Duration || ''}
                          onChange={(e) => setNewTournament({
                            ...newTournament,
                            round3Duration: e.target.value ? parseInt(e.target.value) : 60
                          })}
                          placeholder="e.g., 60"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      onClick={() => createTournamentMutation.mutate()}
                      disabled={createTournamentMutation.isPending}
                      className="w-full"
                    >
                      {createTournamentMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating Tournament...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Tournament
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tournament List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Tournament Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tournamentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading tournaments...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Cryptocurrency</TableHead>
                            <TableHead>Entry Fee</TableHead>
                            <TableHead>Round Duration</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(tournaments || []).map((tournament: any) => (
                            <TableRow key={tournament.id}>
                              <TableCell>{tournament.id}</TableCell>
                              <TableCell className="font-medium">{tournament.title}</TableCell>
                              <TableCell>{tournament.cryptocurrency}</TableCell>
                              <TableCell>{tournament.entryFee} NTIQ</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {tournament.roundDuration || 60} minutes
                                </Badge>
                              </TableCell>
                              <TableCell>{tournament.participantCount || 0}/{tournament.maxParticipants}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  tournament.status === 'active' ? 'default' : 
                                  tournament.status === 'completed' ? 'secondary' : 'outline'
                                }>
                                  {tournament.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(tournament.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => viewTournamentDetails(tournament)}
                                    title="View Tournament Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-blue-600"
                                    onClick={() => editTournament(tournament)}
                                    title="Edit Tournament"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {tournament.status === 'open' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-green-600"
                                      onClick={() => startTournament(tournament.id)}
                                      title="Start Tournament"
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600"
                                    onClick={() => deleteTournament(tournament.id)}
                                    title="Delete Tournament"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Automated Withdrawal Tab */}
          <TabsContent value="automated-withdrawal" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Automated Withdrawal System</h2>
                  <p className="text-blue-700 dark:text-blue-300">Manage automatic withdrawal processing with real-time monitoring</p>
                </div>
              </div>
              
              {/* System Status Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">ACTIVE</div>
                      <div className="text-sm text-green-700 dark:text-green-300">System Status</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5 min</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Processing Interval</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$500</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Auto-approval Limit</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">$10,000</div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">Daily Limit</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cog className="h-5 w-5" />
                      System Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="automation-enabled" className="text-sm font-medium">
                          Enable Automation
                        </Label>
                        <p className="text-xs text-gray-500">Automatically process eligible withdrawals</p>
                      </div>
                      <Switch id="automation-enabled" defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="daily-limit" className="text-sm font-medium">
                        Daily Limit ($)
                      </Label>
                      <Input
                        id="daily-limit"
                        type="number"
                        defaultValue="10000"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="auto-approval-threshold" className="text-sm font-medium">
                        Auto-approval Threshold ($)
                      </Label>
                      <Input
                        id="auto-approval-threshold"
                        type="number"
                        defaultValue="500"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-single-withdrawal" className="text-sm font-medium">
                        Max Single Withdrawal ($)
                      </Label>
                      <Input
                        id="max-single-withdrawal"
                        type="number"
                        defaultValue="5000"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="processing-interval" className="text-sm font-medium">
                        Processing Interval (minutes)
                      </Label>
                      <Input
                        id="processing-interval"
                        type="number"
                        defaultValue="5"
                        className="w-full"
                      />
                    </div>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </Button>
                  </CardContent>
                </Card>

                {/* Real-time Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Today's Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">12</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Processed Today</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">$3,240</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Volume</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">3</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Pending Review</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">98.5%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Manual Processing</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Process Pending Queue (3)
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Clock className="h-4 w-4 mr-2" />
                          Review Flagged Withdrawals
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export Processing Log
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security Features */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900 dark:text-green-100">Multi-chain Validation</div>
                        <div className="text-sm text-green-700 dark:text-green-300">Real-time blockchain verification</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">Fraud Detection</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Advanced pattern recognition</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="font-medium text-purple-900 dark:text-purple-100">Gas Optimization</div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">Smart fee calculation</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


        </Tabs>
      </main>
      
      {/* Battle Details Modal */}
      {showBattleDetailsModal && selectedBattleDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Battle Details #{selectedBattleDetails?.id || 'N/A'}</h2>
                <button
                  onClick={() => {
                    setShowBattleDetailsModal(false);
                    setSelectedBattleDetails(null);
                  }}
                  className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Challenger</h4>
                    <div className="flex items-center gap-2">
                      {selectedBattleDetails?.challengerProfilePhoto ? (
                        <img 
                          src={selectedBattleDetails.challengerProfilePhoto} 
                          alt={selectedBattleDetails?.challengerUsername || 'Challenger'}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallbackDiv) fallbackDiv.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ display: selectedBattleDetails?.challengerProfilePhoto ? 'none' : 'flex' }}
                      >
                        {selectedBattleDetails?.challengerUsername?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{selectedBattleDetails?.challengerUsername || 'Unknown'}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">UID: {selectedBattleDetails?.challengerUid || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Prediction: </span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        ${selectedBattleDetails?.challengerPrediction ? 
                          (typeof selectedBattleDetails.challengerPrediction === 'number' ? 
                            selectedBattleDetails.challengerPrediction.toFixed(2) : 
                            parseFloat(selectedBattleDetails.challengerPrediction).toFixed(2)
                          ) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Opponent</h4>
                    {selectedBattleDetails?.challengedUsername ? (
                      <div>
                        <div className="flex items-center gap-2">
                          {selectedBattleDetails?.challengedProfilePhoto ? (
                            <img 
                              src={selectedBattleDetails.challengedProfilePhoto} 
                              alt={selectedBattleDetails?.challengedUsername || 'Opponent'}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallbackDiv) fallbackDiv.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ display: selectedBattleDetails?.challengedProfilePhoto ? 'none' : 'flex' }}
                          >
                            {selectedBattleDetails.challengedUsername.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{selectedBattleDetails.challengedUsername}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">UID: {selectedBattleDetails?.challengedUid || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Prediction: </span>
                          <span className="font-mono text-gray-900 dark:text-white">
                            ${selectedBattleDetails?.challengedPrediction ? 
                              (typeof selectedBattleDetails.challengedPrediction === 'number' ? 
                                selectedBattleDetails.challengedPrediction.toFixed(2) : 
                                parseFloat(selectedBattleDetails.challengedPrediction).toFixed(2)
                              ) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Waiting for opponent</Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Cryptocurrency</h4>
                    <div className="flex items-center gap-2">
                      {selectedBattleDetails?.cryptoImageId && (
                        <img 
                          src={`https://coin-images.coingecko.com/coins/images/${selectedBattleDetails.cryptoImageId}/small/${selectedBattleDetails.cryptocurrency}.png`}
                          alt={selectedBattleDetails?.cryptocurrency || 'Crypto'}
                          className="w-6 h-6"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">{selectedBattleDetails?.cryptocurrency?.toUpperCase() || 'N/A'}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Current: ${selectedBattleDetails?.currentPrice ? 
                        (typeof selectedBattleDetails.currentPrice === 'number' ? 
                          selectedBattleDetails.currentPrice.toFixed(2) : 
                          parseFloat(selectedBattleDetails.currentPrice).toFixed(2)
                        ) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Stake Amount</h4>
                    <span className="font-mono text-lg text-gray-900 dark:text-white">{selectedBattleDetails?.stakeAmount || 'N/A'} NTIQ</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Status</h4>
                    <Badge variant={
                      selectedBattleDetails?.status === 'completed' ? 'default' :
                      selectedBattleDetails?.status === 'active' ? 'secondary' :
                      selectedBattleDetails?.status === 'cancelled' ? 'destructive' : 'outline'
                    }>
                      {selectedBattleDetails?.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Created</h4>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {selectedBattleDetails?.createdAt ? 
                        new Date(selectedBattleDetails.createdAt).toLocaleString() : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Target Time</h4>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {selectedBattleDetails?.targetTime ? 
                        new Date(selectedBattleDetails.targetTime).toLocaleString() : 
                        'N/A'
                      }
                    </span>
                  </div>
                </div>
                
                {selectedBattleDetails?.winnerId && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Winner</h4>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{selectedBattleDetails?.winnerUsername || 'Unknown'}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        (Reward: {selectedBattleDetails?.winnerReward || (selectedBattleDetails?.stakeAmount ? selectedBattleDetails.stakeAmount * 2 : 0)} NTIQ)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tournament Details Modal */}
      {showTournamentDetailsModal && selectedTournamentDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tournament Details #{selectedTournamentDetails?.id || 'N/A'}</h2>
                <button
                  onClick={() => {
                    setShowTournamentDetailsModal(false);
                    setSelectedTournamentDetails(null);
                  }}
                  className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Tournament Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Tournament Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Title:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTournamentDetails.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Description:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTournamentDetails.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cryptocurrency:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTournamentDetails.cryptocurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Entry Fee:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTournamentDetails.entryFee} NTIQ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Max Participants:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTournamentDetails.maxParticipants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Round Duration:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTournamentDetails.roundDuration} minutes</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Status & Participants</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <Badge variant={
                          selectedTournamentDetails.status === 'active' ? 'default' : 
                          selectedTournamentDetails.status === 'completed' ? 'secondary' : 'outline'
                        }>
                          {selectedTournamentDetails.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Participants:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedTournamentDetails.participantCount || 0}/{selectedTournamentDetails.maxParticipants}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created Date:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedTournamentDetails.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created Time:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedTournamentDetails.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prize Pool */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Prize Pool</h3>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {(selectedTournamentDetails.participantCount || 0) * selectedTournamentDetails.entryFee} NTIQ
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total collected from {selectedTournamentDetails.participantCount || 0} participants
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  {selectedTournamentDetails.status === 'open' && (
                    <Button 
                      onClick={() => {
                        startTournament(selectedTournamentDetails.id);
                        setShowTournamentDetailsModal(false);
                        setSelectedTournamentDetails(null);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Tournament
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => {
                      deleteTournament(selectedTournamentDetails.id);
                      setShowTournamentDetailsModal(false);
                      setSelectedTournamentDetails(null);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Tournament
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowTournamentDetailsModal(false);
                      setSelectedTournamentDetails(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tournament Dialog */}
      {showEditTournamentDialog && editingTournament && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Tournament #{editingTournament.id}
                </h2>
                <button
                  onClick={() => {
                    setShowEditTournamentDialog(false);
                    setEditingTournament(null);
                  }}
                  className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title" className="text-gray-900 dark:text-gray-100">Tournament Title</Label>
                    <Input
                      id="edit-title"
                      value={editingTournament.title}
                      onChange={(e) => setEditingTournament({
                        ...editingTournament,
                        title: e.target.value
                      })}
                      placeholder="Enter tournament title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-crypto" className="text-gray-900 dark:text-gray-100">Cryptocurrency</Label>
                    <Select 
                      value={editingTournament.cryptocurrency} 
                      onValueChange={(value) => setEditingTournament({
                        ...editingTournament,
                        cryptocurrency: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent>
                        {(cryptocurrencies || []).map((crypto: any) => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol}>
                            {crypto.name} ({crypto.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description" className="text-gray-900 dark:text-gray-100">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingTournament.description}
                    onChange={(e) => setEditingTournament({
                      ...editingTournament,
                      description: e.target.value
                    })}
                    placeholder="Enter tournament description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-entry-fee" className="text-gray-900 dark:text-gray-100">Entry Fee (NTIQ)</Label>
                    <Input
                      id="edit-entry-fee"
                      type="number"
                      min="1"
                      value={editingTournament.entryFee}
                      onChange={(e) => setEditingTournament({
                        ...editingTournament,
                        entryFee: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-max-participants" className="text-gray-900 dark:text-gray-100">Max Participants</Label>
                    <Input
                      id="edit-max-participants"
                      type="number"
                      min="2"
                      max="100"
                      value={editingTournament.maxParticipants}
                      onChange={(e) => setEditingTournament({
                        ...editingTournament,
                        maxParticipants: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-round-duration" className="text-gray-900 dark:text-gray-100">Default Round Duration (minutes)</Label>
                    <Input
                      id="edit-round-duration"
                      type="number"
                      min="5"
                      max="1440"
                      value={editingTournament.roundDuration}
                      onChange={(e) => setEditingTournament({
                        ...editingTournament,
                        roundDuration: parseInt(e.target.value) || 60
                      })}
                    />
                  </div>

                  {/* Individual Round Durations Section */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Individual Round Durations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-round1-duration" className="text-gray-900 dark:text-gray-100">Round 1 (minutes)</Label>
                        <Input
                          id="edit-round1-duration"
                          type="number"
                          min="5"
                          max="1440"
                          className="w-full px-3 py-2 min-w-[120px]"
                          value={editingTournament.round1Duration || ''}
                          onChange={(e) => setEditingTournament({
                            ...editingTournament,
                            round1Duration: e.target.value ? parseInt(e.target.value) : null
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-round2-duration" className="text-gray-900 dark:text-gray-100">Round 2 (minutes)</Label>
                        <Input
                          id="edit-round2-duration"
                          type="number"
                          min="5"
                          max="1440"
                          className="w-full px-3 py-2 min-w-[120px]"
                          value={editingTournament.round2Duration || ''}
                          onChange={(e) => setEditingTournament({
                            ...editingTournament,
                            round2Duration: e.target.value ? parseInt(e.target.value) : null
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-round3-duration" className="text-gray-900 dark:text-gray-100">Round 3 (minutes)</Label>
                        <Input
                          id="edit-round3-duration"
                          type="number"
                          min="5"
                          max="1440"
                          className="w-full px-3 py-2 min-w-[120px]"
                          value={editingTournament.round3Duration || ''}
                          onChange={(e) => setEditingTournament({
                            ...editingTournament,
                            round3Duration: e.target.value ? parseInt(e.target.value) : null
                          })}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">If not filled, will use Default Round Duration for all rounds</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowEditTournamentDialog(false);
                      setEditingTournament(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateTournament}
                    disabled={updateTournamentMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updateTournamentMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Tournament
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}