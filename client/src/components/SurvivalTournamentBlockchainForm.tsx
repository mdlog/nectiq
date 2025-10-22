import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CONTRACTS } from '@/lib/contracts';
import { apiRequest } from '@/lib/queryClient';

interface SurvivalTournamentBlockchainFormProps {
  tournament: {
    id: number;
    title: string;
    entryFee: number;
    cryptocurrency: string;
    maxParticipants: number;
    currentParticipants: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function SurvivalTournamentBlockchainForm({
  tournament,
  onClose,
  onSuccess
}: SurvivalTournamentBlockchainFormProps) {
  const { toast } = useToast();
  const { address, chain } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTxType, setCurrentTxType] = useState<'approve' | 'join' | null>(null);
  const [hasSubmittedToDB, setHasSubmittedToDB] = useState(false);
  const [isApprovalStarted, setIsApprovalStarted] = useState(false);

  // Web3 hooks
  const { writeContract: writeApproveContract, isPending: isApprovePending, error: approveError } = useWriteContract();
  const { writeContract: writeJoinContract, isPending: isJoinPending, error: joinError } = useWriteContract();

  // Transaction hash states
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null);
  const [joinTxHash, setJoinTxHash] = useState<string | null>(null);

  // Wait for approve transaction
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash as `0x${string}`,
  });

  // Wait for join transaction
  const { isLoading: isJoinConfirming, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinTxHash as `0x${string}`,
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (onClose) {
      setHasSubmittedToDB(false);
      setCurrentTxType(null);
      setApproveTxHash(null);
      setJoinTxHash(null);
      setIsApprovalStarted(false);
    }
  }, [onClose]);

  // Component mounted

  // Function definitions
  const handleJoinTournament = useCallback(async () => {
    if (!address || !chain) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join the tournament",
        variant: "destructive",
      });
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any = null;

    // Starting join tournament process

    while (retryCount < maxRetries) {
      try {
        setIsSubmitting(true);
        setCurrentTxType('join');

        const entryFeeWei = parseEther(tournament.entryFee.toString());
        
        // Attempt ${retryCount + 1}/${maxRetries}

        // Join tournament
        const joinTxHash = await writeJoinContract({
          address: CONTRACTS.TOURNAMENT_POOL,
          abi: CONTRACTS.ABIS?.TOURNAMENT_POOL || [],
          functionName: 'joinTournament',
          args: [tournament.id, entryFeeWei],
          chainId: chain.id,
          gas: 200000n,
        });

        if (joinTxHash) {
          setJoinTxHash(joinTxHash);
          
          toast({
            title: "Join Transaction Sent",
            description: "Please confirm the join in MetaMask",
          });
          return; // Success, exit retry loop
        }

      } catch (error: any) {
        console.error(`❌ [SURVIVAL-JOIN] Attempt ${retryCount + 1} failed:`, error);
        lastError = error;
        retryCount++;

        // Check if error is retryable
        const isRetryableError = 
          error.message?.includes("Internal JSON-RPC error") ||
          error.message?.includes("network") ||
          error.message?.includes("timeout");

        if (retryCount < maxRetries && isRetryableError) {
          toast({
            title: "Retrying Transaction",
            description: `Attempt ${retryCount + 1}/${maxRetries}. Please wait...`,
            variant: "default",
          });

          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
        } else {
          break; // Exit retry loop
        }
      }
    }

    // All retries failed
    console.error('❌ [SURVIVAL-JOIN] All join attempts failed:', lastError);

    let errorMessage = "Join tournament transaction failed after multiple attempts.";
    if (lastError?.message?.includes("insufficient funds")) {
      errorMessage = "Insufficient funds for gas fees. Please add more ETH to your wallet.";
    } else if (lastError?.message?.includes("user rejected")) {
      errorMessage = "Transaction was rejected by user.";
    } else if (lastError?.message?.includes("Internal JSON-RPC error")) {
      errorMessage = "Network error occurred. Please try again in a few moments.";
    }

    toast({
      title: "Join Failed",
      description: errorMessage,
      variant: "destructive",
    });

    setIsSubmitting(false);
    setCurrentTxType(null);
  }, [address, chain, tournament.id, writeJoinContract, toast]);

  const handleDatabaseUpdate = useCallback(async () => {
    if (hasSubmittedToDB) {
      return;
    }

    try {
      setHasSubmittedToDB(true);

      // Update database with tournament join
      const response = await apiRequest(`/api/survival-tournaments/${tournament.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Database update failed: ${response.status}`);
      }

      // Database updated successfully
      
      toast({
        title: "Successfully Joined!",
        description: "You've joined the survival tournament. Good luck!",
      });

      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('❌ [SURVIVAL-DB] Database update failed:', error);
      toast({
        title: "Database Update Failed",
        description: "Tournament joined on blockchain but database update failed. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setCurrentTxType(null);
    }
  }, [hasSubmittedToDB, tournament.id, toast, onSuccess, onClose]);

  const handleApprove = useCallback(async () => {
    if (!address || !chain) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join the tournament",
        variant: "destructive",
      });
      return;
    }

    if (isApprovalStarted) {
      console.log('⚠️ [SURVIVAL-APPROVE] Approval already started, skipping...');
      return;
    }

    setIsApprovalStarted(true);

    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any = null;

    // Starting approval process

    while (retryCount < maxRetries) {
      try {
        setIsSubmitting(true);
        setCurrentTxType('approve');

        const entryFeeWei = parseEther(tournament.entryFee.toString());
        
        // Attempt ${retryCount + 1}/${maxRetries}

        // Approve NTIQ token spending
        const approveTxHash = await writeApproveContract({
          address: CONTRACTS.NTIQ_TOKEN,
          abi: CONTRACTS.ABIS?.NTIQToken || [],
          functionName: 'approve',
          args: [CONTRACTS.TOURNAMENT_POOL, entryFeeWei],
          chainId: chain.id,
          gas: 100000n,
        });

        if (approveTxHash) {
          setApproveTxHash(approveTxHash);
          
          toast({
            title: "Approval Transaction Sent",
            description: "Please confirm the approval in MetaMask",
          });
          return; // Success, exit retry loop
        }

      } catch (error: any) {
        console.error(`❌ [SURVIVAL-APPROVE] Attempt ${retryCount + 1} failed:`, error);
        lastError = error;
        retryCount++;

        // Check if error is retryable
        const isRetryableError = 
          error.message?.includes("Internal JSON-RPC error") ||
          error.message?.includes("network") ||
          error.message?.includes("timeout");

        if (retryCount < maxRetries && isRetryableError) {
          toast({
            title: "Retrying Transaction",
            description: `Attempt ${retryCount + 1}/${maxRetries}. Please wait...`,
            variant: "default",
          });

          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
        } else {
          break; // Exit retry loop
        }
      }
    }

    // All retries failed
    console.error('❌ [SURVIVAL-APPROVE] All approval attempts failed:', lastError);

    let errorMessage = "Approval transaction failed after multiple attempts.";
    if (lastError?.message?.includes("insufficient funds")) {
      errorMessage = "Insufficient funds for gas fees. Please add more ETH to your wallet.";
    } else if (lastError?.message?.includes("user rejected")) {
      errorMessage = "Transaction was rejected by user.";
    } else if (lastError?.message?.includes("Internal JSON-RPC error")) {
      errorMessage = "Network error occurred. Please try again in a few moments.";
    }

    toast({
      title: "Approval Failed",
      description: errorMessage,
      variant: "destructive",
    });

    setIsSubmitting(false);
    setCurrentTxType(null);
  }, [address, chain, tournament.entryFee, tournament.title, writeApproveContract, toast, isApprovalStarted]);

  // Handle approve transaction success
  useEffect(() => {
    if (isApproveSuccess && !hasSubmittedToDB) {
      setCurrentTxType('join');
      handleJoinTournament();
    }
  }, [isApproveSuccess, hasSubmittedToDB, handleJoinTournament]);

  // Handle join transaction success
  useEffect(() => {
    if (isJoinSuccess && !hasSubmittedToDB) {
      handleDatabaseUpdate();
    }
  }, [isJoinSuccess, hasSubmittedToDB, handleDatabaseUpdate]);

  const handleSubmit = () => {
    console.log('🔘 [SURVIVAL-BUTTON] Button clicked!');
    console.log('🔘 [SURVIVAL-BUTTON] Wallet state:', { address, chain });
    console.log('🔘 [SURVIVAL-BUTTON] Button disabled:', isButtonDisabled());
    console.log('🔘 [SURVIVAL-BUTTON] Current tx type:', currentTxType);
    console.log('🔘 [SURVIVAL-BUTTON] Is submitting:', isSubmitting);
    
    if (!address || !chain) {
      console.log('❌ [SURVIVAL-BUTTON] No wallet connected');
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join the tournament",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ [SURVIVAL-BUTTON] Starting approval process...');
    handleApprove();
  };

  const getButtonText = () => {
    if (currentTxType === 'approve') {
      if (isApprovePending) return 'Approving NTIQ...';
      if (isApproveConfirming) return 'Confirming Approval...';
      return 'Approve NTIQ Token';
    }
    
    if (currentTxType === 'join') {
      if (isJoinPending) return 'Joining Tournament...';
      if (isJoinConfirming) return 'Confirming Join...';
      return 'Join Tournament';
    }

    return `Join for ${tournament.entryFee} NTIQ`;
  };

  const isButtonDisabled = () => {
    const disabled = isSubmitting || isApprovePending || isApproveConfirming || isJoinPending || isJoinConfirming;
    console.log('🔘 [SURVIVAL-BUTTON] Button disabled state:', {
      isSubmitting,
      isApprovePending,
      isApproveConfirming,
      isJoinPending,
      isJoinConfirming,
      disabled
    });
    return disabled;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Join Survival Tournament</DialogTitle>
          <DialogDescription className="text-slate-300">
            Join "{tournament.title}" for {tournament.entryFee} NTIQ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tournament Info */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">{tournament.title}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div>
                <span className="text-slate-400">Entry Fee:</span>
                <div className="font-medium">{tournament.entryFee} NTIQ</div>
              </div>
              <div>
                <span className="text-slate-400">Participants:</span>
                <div className="font-medium">{tournament.currentParticipants}/{tournament.maxParticipants}</div>
              </div>
            </div>
          </div>

          {/* Transaction Steps */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentTxType === 'approve' ? 'bg-blue-600 text-white' : 
                isApproveSuccess ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-300'
              }`}>
                1
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">Approve NTIQ Token</div>
                <div className="text-slate-400 text-sm">Allow tournament contract to spend your NTIQ</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentTxType === 'join' ? 'bg-blue-600 text-white' : 
                isJoinSuccess ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-300'
              }`}>
                2
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">Join Tournament</div>
                <div className="text-slate-400 text-sm">Stake your NTIQ and join the tournament</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isButtonDisabled()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {getButtonText()}
            </Button>
          </div>

          {/* Error Display */}
          {(approveError || joinError) && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
              <div className="text-red-400 text-sm">
                {approveError?.message || joinError?.message || 'Transaction failed'}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}