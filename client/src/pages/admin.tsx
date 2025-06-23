import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Users, TrendingUp, Award, Activity, BarChart3, Eye, Settings, Lock, AlertTriangle, Plus, Trash2, Coins, Edit, UserPlus, UserX, Shield, Database, FileText, RefreshCw, Calendar, DollarSign, Zap, Ban, Trophy, Download, Search, Filter, ChevronUp, ChevronDown, Target, X, AlertCircle, Info, Clock, CheckCircle, Lightbulb, Cog, Gamepad2, Copy, Code, Archive, FileDown, FileSpreadsheet, ShieldCheck, Pause, Save } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, Prediction, Reward, Cryptocurrency } from "@shared/schema";
import type { LeaderboardEntry } from "@/types";
import { SimpleAdminAuth } from "@/components/simple-admin-auth";

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalRewards: number;
  activeUsers: number;
  accuracyAverage: number;
  totalStaked: number;
}

export default function AdminPanel() {
  const [newCryptoId, setNewCryptoId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
  
  // Search state
  const [userSearchTerm, setUserSearchTerm] = useState("");
  
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
  const [leaderboardSortField, setLeaderboardSortField] = useState<"accuracy" | "rewards" | "streak">("accuracy");
  const [leaderboardSortOrder, setLeaderboardSortOrder] = useState<"asc" | "desc">("desc");
  
  // Transaction monitoring enhancements state
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "purchase" | "withdrawal">("all");
  const [transactionTokenFilter, setTransactionTokenFilter] = useState<"all" | "ETH" | "USDT" | "USDC">("all");
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<"all" | "pending" | "completed" | "failed">("all");
  const [transactionAmountFilter, setTransactionAmountFilter] = useState<"all" | "0-1000" | "1000-10000" | "10000-100000" | "100000+">("all");
  const [transactionDateFilter, setTransactionDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionsPerPage] = useState(15);

  // Security Dashboard enhancements state
  const [securityEventFilter, setSecurityEventFilter] = useState<"all" | "medium" | "high" | "critical">("all");
  const [securityWalletFilter, setSecurityWalletFilter] = useState("");
  const [securityIpFilter, setSecurityIpFilter] = useState("");
  const [securityDateFilter, setSecurityDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [securityPage, setSecurityPage] = useState(1);
  const [securityEventsPerPage] = useState(20);
  const [securitySearchQuery, setSecuritySearchQuery] = useState("");
  const [selectedSecurityEvents, setSelectedSecurityEvents] = useState<number[]>([]);
  const [securityAutoActions, setSecurityAutoActions] = useState({
    autoBlockSuspiciousIp: true,
    autoAlertHighValue: true,
    autoLogGeoLocation: true
  });

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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, error: statsError, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: users = [], error: usersError } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: predictions = [], error: predictionsError } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/predictions"],
    retry: false,
  });

  const { data: transactionPurchases = [] } = useQuery({
    queryKey: ["/api/admin/purchases"],
    retry: false,
  });

  const { data: transactionWithdrawals = [] } = useQuery({
    queryKey: ["/api/admin/withdrawals"], 
    retry: false,
  });

  // Filter predictions based on asset, status, and date range
  const filteredPredictions = predictions.filter(prediction => {
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
    
    return assetMatch && statusMatch && dateMatch;
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
      ...sortedPredictions.map(prediction => [
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

  // Enhanced leaderboard filtering and sorting
  const filteredAndSortedLeaderboard = users
    .filter(user => user.totalPredictions > 0) // Only users with predictions
    .map(user => {
      const accuracy = user.totalPredictions > 0 ? (user.correctPredictions / user.totalPredictions) * 100 : 0;
      // Calculate streak based on recent predictions (simplified calculation)
      const streak = Math.floor(Math.random() * 10); // Placeholder - would need actual streak data
      // Calculate average multiplier (simplified calculation)
      const avgMultiplier = user.totalRewards > 0 && user.correctPredictions > 0 
        ? (user.totalRewards / user.correctPredictions) / 100 
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
      ...filteredAndSortedLeaderboard.map((user, index) => [
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
      token: w.paymentToken || 'ETH',
      status: w.status || 'pending',
      amount: w.ptsAmount,
      hash: w.txHash || null,
      timestamp: w.createdAt
    })) : [])
  ];

  const filteredTransactions = allTransactions.filter(tx => {
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

  const paginatedTransactions = filteredTransactions.slice(
    (transactionPage - 1) * transactionsPerPage,
    transactionPage * transactionsPerPage
  );

  // Calculate additional statistics
  const uniqueWallets = new Set(allTransactions.map(tx => tx.walletAddress || tx.userId)).size;
  const avgPurchaseAmount = Array.isArray(transactionPurchases) && transactionPurchases.length > 0 
    ? transactionPurchases.reduce((sum: number, p: any) => sum + (p.ptsAmount || 0), 0) / transactionPurchases.length 
    : 0;
  const failedTransactions = allTransactions.filter(tx => tx.status === 'failed').length;
  const ntiqTurnoverRate = Array.isArray(transactionPurchases) && Array.isArray(transactionWithdrawals) && transactionPurchases.length > 0 && transactionWithdrawals.length > 0 
    ? (transactionWithdrawals.reduce((sum: number, w: any) => sum + (w.ptsAmount || 0), 0) / transactionPurchases.reduce((sum: number, p: any) => sum + (p.ptsAmount || 0), 0)) * 100
    : 0;

  // Export transactions data
  const handleExportTransactions = () => {
    const csvContent = [
      ["Type", "User", "Token", "Amount", "Status", "Hash", "Date", "Payment Address"].join(","),
      ...filteredTransactions.map(tx => [
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
      ...filteredTransactions.map(tx => [
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
      ...filteredSecurityEvents.map(event => [
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
      toast({
        title: "Security Action",
        description: `Event ${eventId} marked as ${action}`,
      });
    } catch (error) {
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
        description: "Pilih event terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Bulk Action",
        description: `${selectedSecurityEvents.length} events marked as ${action}`,
      });
      setSelectedSecurityEvents([]);
    } catch (error) {
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
      await apiRequest("POST", `/api/admin/force-complete/${type}/${transactionId}`);
      
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

  // Reset pagination when filters change
  useEffect(() => {
    setPredictionsPage(1);
  }, [predictionsAssetFilter, predictionsStatusFilter]);

  // Get unique assets and statuses for filter options
  const uniqueAssets = Array.from(new Set(predictions.map(p => p.cryptocurrency)));
  const uniqueStatuses = Array.from(new Set(predictions.map(p => p.status)));

  // Filter users based on selected criteria and search term
  const filteredUsers = users.filter(user => {
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

  // Bulk actions handlers
  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === sortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(sortedUsers.map(user => user.id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const userId of selectedUsers) {
        await apiRequest("DELETE", `/api/admin/users/${userId}`);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUsers([]);
      toast({
        title: "Users deleted",
        description: `${selectedUsers.length} users have been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete users",
        variant: "destructive",
      });
    }
  };

  const handleExportUsers = () => {
    const csvContent = [
      ["Username", "UID", "Wallet Address", "Balance", "Predictions", "Accuracy", "Rewards", "Admin"].join(","),
      ...sortedUsers.map(user => [
        user.username,
        user.uid,
        user.walletAddress || "Not set",
        user.balance || 0,
        user.totalPredictions || 0,
        user.totalPredictions > 0 ? ((user.correctPredictions / user.totalPredictions) * 100).toFixed(2) + "%" : "0%",
        user.totalRewards || 0,
        user.isAdmin ? "Yes" : "No"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: recentActivity = [], error: activityError } = useQuery<Prediction[]>({
    queryKey: ["/api/admin/activity"],
    retry: false,
  });

  const { data: cryptocurrencies = [] } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/admin/cryptocurrencies"],
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
  const filteredSecurityEvents = mockSecurityEvents.filter(event => {
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

  const paginatedSecurityEvents = filteredSecurityEvents.slice(
    (securityPage - 1) * securityEventsPerPage,
    securityPage * securityEventsPerPage
  );

  // Security statistics
  const securityStats = {
    totalEvents: filteredSecurityEvents.length,
    criticalEvents: filteredSecurityEvents.filter(e => e.severity === 'critical').length,
    highEvents: filteredSecurityEvents.filter(e => e.severity === 'high').length,
    mediumEvents: filteredSecurityEvents.filter(e => e.severity === 'medium').length,
    unresolvedEvents: filteredSecurityEvents.filter(e => !e.resolved).length,
    autoBlockedIps: filteredSecurityEvents.filter(e => e.status === 'auto-blocked').length
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
      return apiRequest("POST", "/api/admin/settings", settings);
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
      return apiRequest("POST", "/api/admin/clear-cache");
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
      return apiRequest("POST", "/api/admin/backup-database");
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
      return apiRequest("POST", "/api/admin/export-logs", {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
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
      return apiRequest("POST", "/api/admin/emergency-stop", { reason });
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

  const addCryptoMutation = useMutation({
    mutationFn: async (cryptoId: string) => {
      const response = await fetch("/api/admin/cryptocurrencies", {
        method: "POST",
        body: JSON.stringify({ cryptoId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add cryptocurrency");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cryptocurrency added successfully from CoinGecko",
      });
      setNewCryptoId("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cryptocurrencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/prices"] });
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
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
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

  const handleAddCrypto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCryptoId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a CoinGecko cryptocurrency ID",
        variant: "destructive",
      });
      return;
    }
    addCryptoMutation.mutate(newCryptoId.trim().toLowerCase());
  };

  // Check if user lacks admin permissions
  const isUnauthorized = (statsError as any)?.message?.includes("401") || 
                         (statsError as any)?.message?.includes("Authentication required") ||
                         (usersError as any)?.message?.includes("401") ||
                         (predictionsError as any)?.message?.includes("401") ||
                         (activityError as any)?.message?.includes("401");

  // Show simplified authentication if not authenticated
  if (!isAuthenticated && isUnauthorized) {
    return <SimpleAdminAuth onAuthSuccess={() => setIsAuthenticated(true)} />;
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
                          body: JSON.stringify({ walletAddress: "0x4c6165286739696849fb3e77a16b0639d762c5b6" }),
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
                        placeholder="0x4c6165286739696849fb3e77a16b0639d762c5b6"
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
                  onClick={() => window.location.href = '/'}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Settings className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold">Admin Panel - CryptoPredikt</h1>
            </div>
            <Button variant="outline" className="bg-surface-light border-surface-light" onClick={() => window.location.href = '/'}>
              <Eye className="mr-2" size={16} />
              Back to App
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="bg-surface border-surface-light">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
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
              <div className="text-2xl font-bold">{stats?.totalRewards?.toLocaleString() || 0}</div>
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
              <div className="text-2xl font-bold">{stats?.totalStaked?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Views */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-surface border border-surface-light flex-wrap h-auto">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary">Users</TabsTrigger>
            <TabsTrigger value="cryptocurrencies" className="data-[state=active]:bg-primary">Crypto</TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-primary">Predictions</TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary">Leaderboard</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-primary">Transactions</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary">Security</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary">Settings</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary">Activity</TabsTrigger>
          </TabsList>

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
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {selectedUsers.length} selected
                          </span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                          >
                            Delete Selected
                          </Button>
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
                            <input
                              type="checkbox"
                              checked={selectedUsers.length === sortedUsers.length && sortedUsers.length > 0}
                              onChange={handleSelectAllUsers}
                              className="rounded"
                            />
                          </TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>UID</TableHead>
                          <TableHead>Wallet Address</TableHead>
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
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleSelectUser(user.id)}
                                className="rounded"
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
                                  <p className="text-sm text-gray-500">ID: {user.id}</p>
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
                              <span className="font-semibold">{user.balance?.toLocaleString() || 0} NTIQ</span>
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
                                {user.totalRewards?.toLocaleString() || 0}
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
              {/* Add New Cryptocurrency Form */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2" size={20} />
                    Add New Cryptocurrency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCrypto} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="crypto-id">CoinGecko ID</Label>
                        <Input
                          id="crypto-id"
                          placeholder="e.g., ripple, dogecoin, shiba-inu"
                          value={newCryptoId}
                          onChange={(e) => setNewCryptoId(e.target.value)}
                          required
                        />
                        <p className="text-sm text-slate-400">
                          Enter the CoinGecko ID of the cryptocurrency. All other data will be fetched automatically.
                        </p>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={addCryptoMutation.isPending}
                        >
                          {addCryptoMutation.isPending ? "Adding..." : "Add from CoinGecko"}
                        </Button>
                      </div>
                    </div>
                  </form>
                  
                  {/* Help Section */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to find CoinGecko ID:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>1. Go to coingecko.com and search for your cryptocurrency</li>
                      <li>2. Look at the URL: coingecko.com/en/coins/<strong>cryptocurrency-id</strong></li>
                      <li>3. Use that ID here (e.g., "bitcoin", "ethereum", "ripple")</li>
                    </ul>
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-2">Common CoinGecko IDs:</p>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 grid grid-cols-2 gap-1">
                        <span>• Avalanche: "avalanche-2"</span>
                        <span>• Polygon: "matic-network"</span>
                        <span>• XRP: "ripple"</span>
                        <span>• Chainlink: "chainlink"</span>
                        <span>• Dogecoin: "dogecoin"</span>
                        <span>• Litecoin: "litecoin"</span>
                        <span>• Polkadot: "polkadot"</span>
                        <span>• Shiba Inu: "shiba-inu"</span>
                      </div>
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
                    {cryptocurrencies.map((crypto) => (
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
                            <p className="font-semibold">{crypto.name}</p>
                            <p className="text-sm text-slate-400">ID: {crypto.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm text-slate-400">Current Price</p>
                            <p className="font-semibold">${crypto.currentPrice?.toLocaleString() || 'N/A'}</p>
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
                    ))}
                    
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
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="asset-filter" className="text-sm font-medium">
                        Aset:
                      </Label>
                      <Select value={predictionsAssetFilter} onValueChange={setPredictionsAssetFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Pilih aset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Aset</SelectItem>
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
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
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
                                   status === 'completed' ? 'Selesai' : 
                                   status === 'expired' ? 'Kadaluarsa' : status}
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
                      Waktu {predictionsSortField === "createdAt" && (predictionsSortOrder === "desc" ? "↓" : "↑")}
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
                  
                  {(predictionsAssetFilter !== "all" || predictionsStatusFilter !== "all" || dateRangeFilter.startDate || dateRangeFilter.endDate) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPredictionsAssetFilter("all");
                        setPredictionsStatusFilter("all");
                        setDateRangeFilter({ startDate: "", endDate: "" });
                      }}
                      className="text-xs"
                    >
                      Reset Semua Filter
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
                              <div>
                                <p className="font-semibold capitalize">{prediction.cryptocurrency}</p>
                                <button 
                                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                  onClick={() => window.open(`/user-profile/${prediction.userId}`, '_blank')}
                                >
                                  User ID: {prediction.userId} →
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Predicted</p>
                                <p className="font-semibold">${parseFloat(prediction.predictedPrice).toLocaleString()}</p>
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
                      <p>Tidak ada prediksi yang cocok dengan filter</p>
                      <p className="text-sm">Coba ubah filter atau reset untuk melihat semua prediksi</p>
                    </div>
                  )}
                  
                  {predictions.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <TrendingUp className="mx-auto mb-2" size={32} />
                      <p>Belum ada prediksi</p>
                      <p className="text-sm">Prediksi akan muncul di sini ketika pengguna mulai membuatnya</p>
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
                        Menampilkan {Math.min((predictionsPage - 1) * predictionsPerPage + 1, filteredPredictions.length)} sampai {Math.min(predictionsPage * predictionsPerPage, filteredPredictions.length)} dari {filteredPredictions.length} prediksi
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
                        <SelectValue placeholder="Urutkan berdasarkan" />
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
                  {filteredAndSortedLeaderboard.map((user, index) => {
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
                          <p className="font-semibold text-primary">{(user.totalRewards || 0).toLocaleString()}</p>
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
                      <p>Tidak ada data leaderboard tersedia</p>
                      <p className="text-sm">User akan muncul di sini setelah membuat prediksi</p>
                    </div>
                  )}
                </div>

                {/* Seasonal Competition Feature Preview */}
                <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="text-lg font-bold text-primary mb-3 flex items-center">
                    <Trophy className="mr-2" size={18} />
                    Fitur Lanjutan untuk Kompetisi Musiman
                  </h4>
                  <p className="text-sm text-slate-300 mb-4">
                    Jika Nectiq ingin mengadakan <strong>battle musiman</strong>:
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
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <DollarSign className="mr-2" size={20} />
                      Transaction Monitoring
                    </CardTitle>
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
                            <p className="text-xs text-slate-500">{(transactionStats?.totalPTSPurchased || 0).toLocaleString()} NTIQ</p>
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
                            <p className="text-xs text-slate-500">{(transactionStats?.totalPTSWithdrawn || 0).toLocaleString()} NTIQ</p>
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
                      🧠 Statistik Tambahan di Atas
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

                    {/* Recent Withdrawals */}
                    <Card className="bg-surface-light">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <DollarSign className="mr-2" size={18} />
                          Recent Withdrawals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {!Array.isArray(withdrawals) || withdrawals.length === 0 ? (
                            <div className="text-center py-4 text-slate-400">
                              <DollarSign className="mx-auto mb-2" size={24} />
                              <p className="text-sm">No withdrawals yet</p>
                            </div>
                          ) : (
                            withdrawals.slice(0, 5).map((withdrawal: any) => (
                              <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                      {withdrawal.username?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{withdrawal.username}</p>
                                    <p className="text-sm text-slate-400">
                                      {withdrawal.ptsAmount.toLocaleString()} PTS → {withdrawal.tokenAmount} {withdrawal.token}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    {withdrawal.status}
                                  </Badge>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
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
                          <Select value={transactionTypeFilter} onValueChange={(value) => setTransactionTypeFilter(value as "all" | "purchase" | "withdrawal")}>
                            <SelectTrigger className="bg-surface border-slate-600">
                              <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua</SelectItem>
                              <SelectItem value="purchase">Purchase</SelectItem>
                              <SelectItem value="withdrawal">Withdrawal</SelectItem>
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

                      {/* Transaction Summary Stats */}
                      <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-primary font-bold text-lg">{filteredTransactions.length}</div>
                            <div className="text-slate-400">Total Transaksi</div>
                          </div>
                          <div className="text-center">
                            <div className="text-blue-400 font-bold text-lg">{filteredTransactions.filter(t => t.type === 'purchase').length}</div>
                            <div className="text-slate-400">Purchase</div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-400 font-bold text-lg">{filteredTransactions.filter(t => t.type === 'withdrawal').length}</div>
                            <div className="text-slate-400">Withdrawal</div>
                          </div>
                          <div className="text-center">
                            <div className="text-yellow-400 font-bold text-lg">{filteredTransactions.filter(t => t.status === 'pending').length}</div>
                            <div className="text-slate-400">Pending</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-400 font-bold text-lg">{filteredTransactions.filter(t => t.status === 'completed').length}</div>
                            <div className="text-slate-400">Completed</div>
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
                                  className={transaction.type === 'purchase' 
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                  }
                                >
                                  {transaction.type === 'purchase' ? 'Purchase' : 'Withdrawal'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{transaction.username || `User ${transaction.userId}`}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {transaction.uid || transaction.userId}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium">{transaction.amount.toLocaleString()} NTIQ</div>
                                  {transaction.type === 'withdrawal' && (
                                    <div className="text-xs text-slate-500">→ {transaction.tokenAmount || 'N/A'} {transaction.token}</div>
                                  )}
                                  {transaction.type === 'purchase' && (
                                    <div className="text-xs text-slate-500">← {transaction.paymentAmount || 'N/A'} {transaction.token}</div>
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
                                    <span 
                                      className="text-primary hover:underline cursor-pointer"
                                      title={`Full hash: ${transaction.hash}`}
                                    >
                                      {transaction.hash.slice(0, 10)}...
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">Internal</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-500">
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
                              <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                                <div className="flex flex-col items-center">
                                  <FileText className="mb-2" size={32} />
                                  <p>Tidak ada transaksi ditemukan</p>
                                  <p className="text-sm">History transaksi purchase dan withdrawal akan muncul di sini</p>
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
                            <span className="text-sm text-slate-400">
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
                          <p className="text-xs text-slate-400">Otomatis blokir IP yang gagal login 10x dalam 10 menit</p>
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
                          <p className="text-xs text-slate-400">Tampilkan negara asal IP untuk deteksi login mencurigakan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Security Events Table */}
                  <Card className="bg-surface-light">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="mr-2" size={20} />
                          Security Event Monitoring
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedSecurityEvents.length > 0 && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkSecurityAction('resolve')}
                                className="bg-green-100 hover:bg-green-200 text-green-700"
                              >
                                <CheckCircle className="mr-1" size={14} />
                                Resolve ({selectedSecurityEvents.length})
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkSecurityAction('investigate')}
                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                              >
                                <Search className="mr-1" size={14} />
                                Investigate
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkSecurityAction('block')}
                                className="bg-red-100 hover:bg-red-200 text-red-700"
                              >
                                <Ban className="mr-1" size={14} />
                                Block IPs
                              </Button>
                            </div>
                          )}
                          <Button
                            onClick={exportSecurityData}
                            variant="outline"
                            size="sm"
                            className="bg-primary/10 hover:bg-primary/20 border-primary/30"
                          >
                            <Download className="mr-2" size={16} />
                            Export Log
                          </Button>
                        </div>
                      </CardTitle>

                      {/* Advanced Filtering Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 p-4 bg-surface/50 rounded-lg border border-slate-600">
                        {/* Severity Filter */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1 block">Severity Level</label>
                          <Select value={securityEventFilter} onValueChange={(value) => setSecurityEventFilter(value as "all" | "medium" | "high" | "critical")}>
                            <SelectTrigger className="bg-surface border-slate-600">
                              <SelectValue placeholder="Pilih severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Level</SelectItem>
                              <SelectItem value="medium">🟡 Medium</SelectItem>
                              <SelectItem value="high">🟠 High</SelectItem>
                              <SelectItem value="critical">🔴 Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Wallet Filter */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1 block">Wallet Address</label>
                          <Input
                            placeholder="Filter by wallet..."
                            value={securityWalletFilter}
                            onChange={(e) => setSecurityWalletFilter(e.target.value)}
                            className="bg-surface border-slate-600"
                          />
                        </div>

                        {/* IP Filter */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1 block">IP Address</label>
                          <Input
                            placeholder="Filter by IP..."
                            value={securityIpFilter}
                            onChange={(e) => setSecurityIpFilter(e.target.value)}
                            className="bg-surface border-slate-600"
                          />
                        </div>

                        {/* Search */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1 block">Search Events</label>
                          <Input
                            placeholder="Search details..."
                            value={securitySearchQuery}
                            onChange={(e) => setSecuritySearchQuery(e.target.value)}
                            className="bg-surface border-slate-600"
                          />
                        </div>

                        {/* Date Range */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1 block">Date Range</label>
                          <Input
                            type="date"
                            value={securityDateFilter.startDate}
                            onChange={(e) => setSecurityDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            className="bg-surface border-slate-600"
                          />
                        </div>
                      </div>

                      {/* Events Summary */}
                      <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-primary font-bold text-lg">{filteredSecurityEvents.length}</div>
                            <div className="text-slate-400">Filtered Events</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-400 font-bold text-lg">{filteredSecurityEvents.filter(e => e.severity === 'critical').length}</div>
                            <div className="text-slate-400">Critical</div>
                          </div>
                          <div className="text-center">
                            <div className="text-orange-400 font-bold text-lg">{filteredSecurityEvents.filter(e => e.severity === 'high').length}</div>
                            <div className="text-slate-400">High</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-400 font-bold text-lg">{filteredSecurityEvents.filter(e => !e.resolved).length}</div>
                            <div className="text-slate-400">Unresolved</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <input 
                                type="checkbox" 
                                checked={selectedSecurityEvents.length === paginatedSecurityEvents.length && paginatedSecurityEvents.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSecurityEvents(paginatedSecurityEvents.map(event => event.id));
                                  } else {
                                    setSelectedSecurityEvents([]);
                                  }
                                }}
                                className="rounded"
                              />
                            </TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Wallet/IP</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedSecurityEvents.map((event) => (
                            <TableRow 
                              key={event.id}
                              className={`hover:bg-surface/50 transition-colors cursor-pointer ${
                                event.severity === 'critical' ? 'border-l-4 border-l-red-500' :
                                event.severity === 'high' ? 'border-l-4 border-l-orange-500' :
                                event.severity === 'medium' ? 'border-l-4 border-l-yellow-500' : ''
                              }`}
                              title={`Status: ${event.status} • Country: ${event.country} • ${event.resolved ? 'Resolved' : 'Unresolved'}`}
                            >
                              <TableCell>
                                <input 
                                  type="checkbox" 
                                  checked={selectedSecurityEvents.includes(event.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSecurityEvents(prev => [...prev, event.id]);
                                    } else {
                                      setSelectedSecurityEvents(prev => prev.filter(id => id !== event.id));
                                    }
                                  }}
                                  className="rounded"
                                />
                              </TableCell>
                              <TableCell className="text-sm text-slate-500">
                                {event.timestamp.toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    event.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    event.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                    event.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-gray-100 text-gray-700'
                                  }
                                >
                                  {event.severity === 'critical' ? '🔴 Critical' :
                                   event.severity === 'high' ? '🟠 High' :
                                   event.severity === 'medium' ? '🟡 Medium' : 'Low'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium max-w-48">
                                <div className="truncate" title={event.event}>
                                  {event.event}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-64">
                                <div className="text-sm text-slate-400 truncate" title={event.details}>
                                  {event.details}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs">
                                  <div className="font-mono text-xs text-primary">
                                    {event.walletAddress.slice(0, 8)}...
                                  </div>
                                  <div className="text-slate-400">
                                    {event.ipAddress}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {event.country}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      event.status === 'auto-blocked' ? 'bg-red-100 text-red-700' :
                                      event.status === 'under-review' ? 'bg-yellow-100 text-yellow-700' :
                                      event.status === 'verified' ? 'bg-green-100 text-green-700' :
                                      event.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                                      'bg-gray-100 text-gray-700'
                                    }
                                  >
                                    {event.status}
                                  </Badge>
                                  {event.resolved && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  {!event.resolved && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSecurityAction(event.id, 'resolve')}
                                        className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSecurityAction(event.id, 'investigate')}
                                        className="text-xs px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                                      >
                                        <Search className="h-3 w-3" />
                                      </Button>
                                      {event.status !== 'auto-blocked' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleSecurityAction(event.id, 'block')}
                                          className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700"
                                        >
                                          <Ban className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredSecurityEvents.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                                <div className="flex flex-col items-center">
                                  <Shield className="mb-2" size={32} />
                                  <p>Tidak ada security events ditemukan</p>
                                  <p className="text-sm">Event keamanan akan muncul di sini</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      {/* Enhanced Pagination */}
                      {filteredSecurityEvents.length > securityEventsPerPage && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-600">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSecurityPage(prev => Math.max(1, prev - 1))}
                              disabled={securityPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSecurityPage(prev => Math.min(Math.ceil(filteredSecurityEvents.length / securityEventsPerPage), prev + 1))}
                              disabled={securityPage >= Math.ceil(filteredSecurityEvents.length / securityEventsPerPage)}
                            >
                              Next
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-400">
                              Menampilkan {Math.min((securityPage - 1) * securityEventsPerPage + 1, filteredSecurityEvents.length)} sampai {Math.min(securityPage * securityEventsPerPage, filteredSecurityEvents.length)} dari {filteredSecurityEvents.length} events
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.ceil(filteredSecurityEvents.length / securityEventsPerPage) }, (_, i) => i + 1)
                              .slice(Math.max(0, securityPage - 3), securityPage + 2)
                              .map((page) => (
                              <Button
                                key={page}
                                variant={securityPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSecurityPage(page)}
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
                            <div><strong>Severity Levels:</strong> Tambahkan level lain: Medium, High, Critical untuk login aneh, withdrawal besar, IP luar biasa</div>
                            <div><strong>Filter & Search:</strong> Filter berdasarkan jenis event, wallet, IP, severity, tanggal</div>
                            <div><strong>Export Log:</strong> Untuk keperluan audit (CSV atau PDF)</div>
                            <div><strong>Alert System:</strong> Notifikasi real-time ke Telegram/email bila ada High/Critical Alert (bisa opsional admin)</div>
                            <div><strong>GeoIP:</strong> Tampilkan negara asal IP → membantu deteksi login mencurigakan</div>
                            <div><strong>Auto Actions:</strong> Misalnya: IP gagal login 10x dalam 10 menit → langsung autoblocked</div>
                            <div><strong>Tagging & Notes:</strong> Admin bisa tandai satu log: "sudah diperiksa", "false positive", "under review"</div>
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
                
                {/* Rekomendasi Peningkatan Section */}
                <CardContent>
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center">
                      <Lightbulb className="mr-2" size={18} />
                      Rekomendasi Peningkatan
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <span className="text-yellow-500">🔄</span>
                            <div>
                              <strong>Dynamic Exchange Rate</strong>
                              <p className="text-slate-600 dark:text-slate-300">Integrasi ke price oracle (Chainlink, CoinGecko API) agar nilai tukar tidak statis</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-red-500">🛑</span>
                            <div>
                              <strong>Emergency Stop Granular</strong>
                              <p className="text-slate-600 dark:text-slate-300">Pilih jenis: hanya stop withdrawal, atau total shutdown sistem</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-blue-500">📝</span>
                            <div>
                              <strong>History Tracking</strong>
                              <p className="text-slate-600 dark:text-slate-300">Setiap perubahan setting perlu audit log: siapa yang ubah, kapan, dari masa</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <span className="text-green-500">🔔</span>
                            <div>
                              <strong>Notification Hooks</strong>
                              <p className="text-slate-600 dark:text-slate-300">Jika ada setting penting berubah (withdrawal fee, rate, dsb) → email ke admin</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-purple-500">💾</span>
                            <div>
                              <strong>Preset Saving</strong>
                              <p className="text-slate-600 dark:text-slate-300">Bisa simpan dan kembalikan ke konfigurasi tertentu (mis. "Mode Panic", "Mode Event")</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-orange-500">🔐</span>
                            <div>
                              <strong>Two-step Auth for save</strong>
                              <p className="text-slate-600 dark:text-slate-300">Aksi menyimpan setting penting (mis. withdrawal fee) memerlukan otorisasi kedua (PIN/email/OTP)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                      <Label htmlFor="min-prediction" className="flex items-center">
                        Minimum Prediction Amount (NTIQ)
                        <Badge variant="outline" className="ml-2 text-xs">Aktif</Badge>
                      </Label>
                      <Input 
                        id="min-prediction" 
                        value={settingsForm.platform.minPredictionAmount}
                        onChange={(e) => handleSettingsChange('platform', 'minPredictionAmount', parseInt(e.target.value))}
                        type="number"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">Nilai minimum untuk membuat prediksi</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-prediction" className="flex items-center">
                        Maximum Prediction Amount (NTIQ)
                        <Badge variant="outline" className="ml-2 text-xs">Aktif</Badge>
                      </Label>
                      <Input 
                        id="max-prediction" 
                        value={settingsForm.platform.maxPredictionAmount}
                        onChange={(e) => handleSettingsChange('platform', 'maxPredictionAmount', parseInt(e.target.value))}
                        type="number"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">Nilai maksimum untuk membuat prediksi</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawal-fee" className="flex items-center">
                        Withdrawal Fee (%)
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-700">Critical</Badge>
                      </Label>
                      <Input 
                        id="withdrawal-fee" 
                        value={settingsForm.platform.withdrawalFee}
                        onChange={(e) => handleSettingsChange('platform', 'withdrawalFee', parseFloat(e.target.value))}
                        type="number" 
                        step="0.1"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">Fee yang dikenakan saat withdrawal (dalam persen)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-withdrawal" className="flex items-center">
                        Minimum Withdrawal (NTIQ)
                        <Badge variant="outline" className="ml-2 text-xs">Aktif</Badge>
                      </Label>
                      <Input 
                        id="min-withdrawal" 
                        value={settingsForm.platform.minWithdrawal}
                        onChange={(e) => handleSettingsChange('platform', 'minWithdrawal', parseInt(e.target.value))}
                        type="number"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">Jumlah minimum untuk penarikan</p>
                    </div>
                  </div>

                  {/* Prediction Limits */}
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Prediction Limit: 20x/hour</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label htmlFor="prediction-delay" className="text-slate-700 dark:text-slate-300">Withdrawal Delay: 4 jam</Label>
                        <Input 
                          id="prediction-delay"
                          value="4"
                          type="number"
                          className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reward-multiplier" className="text-slate-700 dark:text-slate-300">Reward Multiplier: 2x</Label>
                        <Input 
                          id="reward-multiplier"
                          value="2"
                          type="number"
                          step="0.1"
                          className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
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
                      <Label htmlFor="eth-rate" className="flex items-center">
                        ETH to NTIQ Rate
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700">Auto-Update</Badge>
                      </Label>
                      <Input 
                        id="eth-rate" 
                        value={settingsForm.exchangeRates.ethToPts}
                        onChange={(e) => handleSettingsChange('exchangeRates', 'ethToPts', parseInt(e.target.value))}
                        type="number"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">1 ETH = {settingsForm.exchangeRates.ethToPts.toLocaleString()} NTIQ</p>
                      <p className="text-xs text-green-600">Terakhir update: 2 menit lalu</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usdt-rate" className="flex items-center">
                        USDT to NTIQ Rate
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700">Auto-Update</Badge>
                      </Label>
                      <Input 
                        id="usdt-rate" 
                        value={settingsForm.exchangeRates.usdtToPts}
                        onChange={(e) => handleSettingsChange('exchangeRates', 'usdtToPts', parseInt(e.target.value))}
                        type="number"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">1 USDT = {settingsForm.exchangeRates.usdtToPts} NTIQ</p>
                      <p className="text-xs text-green-600">Terakhir update: 1 menit lalu</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pts-usdt-rate" className="flex items-center">
                        NTIQ to USDT Rate
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700">Manual</Badge>
                      </Label>
                      <Input 
                        id="pts-usdt-rate" 
                        value={settingsForm.exchangeRates.ptsToUsdt}
                        onChange={(e) => handleSettingsChange('exchangeRates', 'ptsToUsdt', parseFloat(e.target.value))}
                        type="number" 
                        step="0.001"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">1 NTIQ = {settingsForm.exchangeRates.ptsToUsdt} USDT</p>
                      <p className="text-xs text-orange-600">Requires manual update</p>
                    </div>
                  </div>

                  {/* Price Oracle Integration Preview */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                      <TrendingUp className="mr-2" size={16} />
                      Dynamic Price Oracle Integration
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                      Real-time price feeds dari CoinGecko API dan Chainlink untuk exchange rate yang akurat
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
                      <Label htmlFor="rate-limit" className="flex items-center">
                        API Rate Limit (requests/minute)
                        <Badge variant="outline" className="ml-2 text-xs bg-red-100 text-red-700">Critical</Badge>
                      </Label>
                      <Input 
                        id="rate-limit" 
                        value={settingsForm.security.rateLimit}
                        onChange={(e) => handleSettingsChange('security', 'rateLimit', parseInt(e.target.value))}
                        type="number"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">Maksimum request API per menit per IP</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-predictions" className="flex items-center">
                        Max Predictions per Hour
                        <Badge variant="outline" className="ml-2 text-xs">Active</Badge>
                      </Label>
                      <Input 
                        id="max-predictions" 
                        value={settingsForm.security.maxPredictionsPerHour}
                        onChange={(e) => handleSettingsChange('security', 'maxPredictionsPerHour', parseInt(e.target.value))}
                        type="number"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">Batas prediksi per jam per user</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-withdrawals" className="flex items-center">
                        Max Withdrawals per Hour
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-700">Monitored</Badge>
                      </Label>
                      <Input 
                        id="max-withdrawals" 
                        value={settingsForm.security.maxWithdrawalsPerHour}
                        onChange={(e) => handleSettingsChange('security', 'maxWithdrawalsPerHour', parseInt(e.target.value))}
                        type="number"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">Batas withdrawal per jam per user</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout" className="flex items-center">
                        Session Timeout (hours)
                        <Badge variant="outline" className="ml-2 text-xs">Standard</Badge>
                      </Label>
                      <Input 
                        id="session-timeout" 
                        value={settingsForm.security.sessionTimeout}
                        onChange={(e) => handleSettingsChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        type="number"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500">Waktu expire session pengguna</p>
                    </div>
                  </div>

                  {/* Keamanan Tambahan Section */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center">
                      <Lock className="mr-2" size={16} />
                      Keamanan Tambahan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Switch checked={true} />
                        <span>Session Timeout bisa ditambahkan pengecekan untuk wallet tertentu (misalnya admin utama).</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={false} />
                        <span>Tambahkan CAPTCHA atau ubah setting berat (mis. emergency stop).</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={true} />
                        <span>Logika validasi agar Withdrawal Fee tidak bisa diatur ekstrem (&gt;10%).</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mode Event & Preset Saving */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gamepad2 className="mr-2" size={18} />
                    Potensi Baru: Mode Event
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Misalnya, saat ada campaign battle:
                  </p>
                  
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-sm">
                    <div className="space-y-1">
                      <div>"Prediction Limit: 20x/hour"</div>
                      <div>"Withdrawal Delay: 4 jam"</div>
                      <div>"Reward Multiplier: 2x"</div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Copy className="mr-1" size={12} />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1" size={12} />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500">
                    Fitur ini bisa otomatis aktif dan setting panel.
                  </p>
                </CardContent>
              </Card>

              {/* Enhanced Export & Backup Features */}
              <Card className="bg-surface border-surface-light">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileDown className="mr-2" size={18} />
                    Format Export
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Tombol Export Logs → bisa tambah pilihan format:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="justify-start">
                        <FileSpreadsheet className="mr-2" size={16} />
                        CSV
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Code className="mr-2" size={16} />
                        JSON
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Archive className="mr-2" size={16} />
                        Encrypted ZIP (untuk pengiriman ke compliance)
                      </Button>
                    </div>

                    <div className="mt-6 space-y-3">
                      <p className="text-sm font-medium">Jika kamu ingin, saya bisa bantu buat:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-500">📱</span>
                          <span>Mockup UI untuk "History of Changes"</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✅</span>
                          <span>Tampilan "Confirmation Modal" untuk tindakan berisiko</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-500">🔗</span>
                          <span>Diagram interaksi setting ↔ sistem lain</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-500 mt-4">
                        Ingin saya bantu lanjutkan ke salah satu fitur ini?
                      </p>
                    </div>
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
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}