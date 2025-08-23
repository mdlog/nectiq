import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Settings, Database, Layers, AlertTriangle, CheckCircle, XCircle, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Types for blockchain settings
interface BlockchainSetting {
  id: number;
  chainName: string;
  chainId: number;
  networkName: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: string;
  isMainnet: boolean;
  isEnabled: boolean;
  isDepositEnabled: boolean;
  isWithdrawalEnabled: boolean;
  maxGasPrice: string;
  gasLimit: string;
  minConfirmations: number;
  depositFeePercent: string;
  withdrawalFeePercent: string;
  tokenContracts: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  updatedBy?: number;
}

interface BlockchainSettingsProps {
  className?: string;
}

export function BlockchainSettings({ className }: BlockchainSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for editing blockchain settings
  const [editingChain, setEditingChain] = useState<BlockchainSetting | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Query to fetch blockchain settings
  const { data: blockchainSettings, isLoading, error } = useQuery<BlockchainSetting[]>({
    queryKey: ["/api/admin/blockchain-settings"],
    refetchInterval: 30000,
  });

  // Mutations for blockchain settings management
  const initDefaultsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/admin/blockchain-settings/init-defaults", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blockchain-settings"] });
      toast({
        title: "Blockchain Settings Initialized",
        description: "Default blockchain configurations have been set up successfully",
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error('❌ [BLOCKCHAIN-SETTINGS] Init defaults failed:', error);
      toast({
        title: "Initialization Failed",
        description: error.message || "Failed to initialize blockchain settings",
        variant: "destructive"
      });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BlockchainSetting> }) => {
      return apiRequest(`/api/admin/blockchain-settings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blockchain-settings"] });
      setIsEditDialogOpen(false);
      setEditingChain(null);
      toast({
        title: "Blockchain Setting Updated",
        description: "Blockchain configuration has been updated successfully",
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error('❌ [BLOCKCHAIN-SETTINGS] Update failed:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update blockchain setting",
        variant: "destructive"
      });
    },
  });

  // Toggle blockchain enable/disable
  const toggleBlockchainStatus = async (chain: BlockchainSetting, field: 'isEnabled' | 'isDepositEnabled' | 'isWithdrawalEnabled') => {
    try {
      await updateSettingMutation.mutateAsync({
        id: chain.id,
        data: { [field]: !chain[field] }
      });
    } catch (error) {
      console.error(`Failed to toggle ${field}:`, error);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChain) return;

    try {
      await updateSettingMutation.mutateAsync({
        id: editingChain.id,
        data: {
          rpcUrl: editingChain.rpcUrl,
          explorerUrl: editingChain.explorerUrl,
          maxGasPrice: editingChain.maxGasPrice,
          gasLimit: editingChain.gasLimit,
          minConfirmations: editingChain.minConfirmations,
          depositFeePercent: editingChain.depositFeePercent,
          withdrawalFeePercent: editingChain.withdrawalFeePercent,
          tokenContracts: editingChain.tokenContracts
        }
      });
    } catch (error) {
      console.error('Failed to update blockchain setting:', error);
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = (isEnabled: boolean) => {
    return isEnabled ? "default" : "secondary";
  };

  // Initialize defaults if no settings exist
  const handleInitDefaults = () => {
    initDefaultsMutation.mutate();
  };

  return (
    <div className={className}>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Layers className="mr-2" size={20} />
              Blockchain Management
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInitDefaults}
              disabled={initDefaultsMutation.isPending || (blockchainSettings && blockchainSettings.length > 0)}
              data-testid="button-init-blockchain-defaults"
            >
              <Plus className="mr-2" size={16} />
              {initDefaultsMutation.isPending ? "Initializing..." : "Initialize Defaults"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="animate-spin mr-2" size={20} />
              <span className="text-slate-400">Loading blockchain configurations...</span>
            </div>
          ) : error ? (
            <Alert className="border-red-600/50 bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                Failed to load blockchain settings. Please try again.
              </AlertDescription>
            </Alert>
          ) : !blockchainSettings || blockchainSettings.length === 0 ? (
            <Alert className="border-blue-600/50 bg-blue-950/20">
              <Database className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                No blockchain configurations found. Click "Initialize Defaults" to set up supported blockchains.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-slate-400 mb-4">
                Manage which blockchains are available for deposits and withdrawals. Toggle individual settings to control user access.
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Network</TableHead>
                    <TableHead className="text-slate-300">Chain ID</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Deposits</TableHead>
                    <TableHead className="text-slate-300">Withdrawals</TableHead>
                    <TableHead className="text-slate-300">Fees (%)</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockchainSettings.map((chain) => (
                    <TableRow key={chain.id} className="border-slate-700">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={chain.isMainnet ? "default" : "secondary"} className="text-xs">
                            {chain.isMainnet ? "MAINNET" : "TESTNET"}
                          </Badge>
                          <div>
                            <div className="font-medium text-white">{chain.networkName}</div>
                            <div className="text-sm text-slate-400">{chain.nativeCurrency}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{chain.chainId}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={chain.isEnabled}
                            onCheckedChange={() => toggleBlockchainStatus(chain, 'isEnabled')}
                            disabled={updateSettingMutation.isPending}
                            data-testid={`switch-enabled-${chain.chainName}`}
                          />
                          <Badge variant={getStatusBadgeVariant(chain.isEnabled)}>
                            {chain.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={chain.isDepositEnabled}
                          onCheckedChange={() => toggleBlockchainStatus(chain, 'isDepositEnabled')}
                          disabled={updateSettingMutation.isPending || !chain.isEnabled}
                          data-testid={`switch-deposits-${chain.chainName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={chain.isWithdrawalEnabled}
                          onCheckedChange={() => toggleBlockchainStatus(chain, 'isWithdrawalEnabled')}
                          disabled={updateSettingMutation.isPending || !chain.isEnabled}
                          data-testid={`switch-withdrawals-${chain.chainName}`}
                        />
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="text-sm">
                          <div>D: {chain.depositFeePercent}%</div>
                          <div>W: {chain.withdrawalFeePercent}%</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingChain(chain);
                            setIsEditDialogOpen(true);
                          }}
                          data-testid={`button-edit-${chain.chainName}`}
                        >
                          <Edit className="mr-1" size={14} />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit {editingChain?.networkName} Configuration
            </DialogTitle>
          </DialogHeader>
          {editingChain && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">RPC URL</Label>
                  <Input
                    value={editingChain.rpcUrl}
                    onChange={(e) => setEditingChain({ ...editingChain, rpcUrl: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="https://rpc-url.com"
                    data-testid="input-rpc-url"
                  />
                </div>
                <div>
                  <Label className="text-white">Explorer URL</Label>
                  <Input
                    value={editingChain.explorerUrl}
                    onChange={(e) => setEditingChain({ ...editingChain, explorerUrl: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="https://explorer.com"
                    data-testid="input-explorer-url"
                  />
                </div>
                <div>
                  <Label className="text-white">Max Gas Price (gwei)</Label>
                  <Input
                    value={editingChain.maxGasPrice}
                    onChange={(e) => setEditingChain({ ...editingChain, maxGasPrice: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="50"
                    data-testid="input-max-gas-price"
                  />
                </div>
                <div>
                  <Label className="text-white">Gas Limit</Label>
                  <Input
                    value={editingChain.gasLimit}
                    onChange={(e) => setEditingChain({ ...editingChain, gasLimit: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="21000"
                    data-testid="input-gas-limit"
                  />
                </div>
                <div>
                  <Label className="text-white">Min Confirmations</Label>
                  <Input
                    type="number"
                    value={editingChain.minConfirmations}
                    onChange={(e) => setEditingChain({ ...editingChain, minConfirmations: parseInt(e.target.value) || 0 })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="12"
                    data-testid="input-min-confirmations"
                  />
                </div>
                <div>
                  <Label className="text-white">Deposit Fee (%)</Label>
                  <Input
                    value={editingChain.depositFeePercent}
                    onChange={(e) => setEditingChain({ ...editingChain, depositFeePercent: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="0.00"
                    data-testid="input-deposit-fee"
                  />
                </div>
                <div>
                  <Label className="text-white">Withdrawal Fee (%)</Label>
                  <Input
                    value={editingChain.withdrawalFeePercent}
                    onChange={(e) => setEditingChain({ ...editingChain, withdrawalFeePercent: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="2.50"
                    data-testid="input-withdrawal-fee"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                  data-testid="button-save-blockchain"
                >
                  {updateSettingMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}