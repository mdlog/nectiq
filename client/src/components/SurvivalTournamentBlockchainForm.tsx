import React, { useState, useEffect } from 'react';
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

  // Debug wallet state
  console.log('🔘 [SURVIVAL-FORM] Wallet state:', { address, chain });
  const [currentTxType, setCurrentTxType] = useState<'approve' | 'join' | null>(null);
  const [hasSubmittedToDB, setHasSubmittedToDB] = useState(false);

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
    }
  }, [onClose]);

  // Handle approve transaction success
  useEffect(() => {
    if (isApproveSuccess && !hasSubmittedToDB) {
      console.log('✅ [SURVIVAL-APPROVE] Approval successful, proceeding to join tournament...');
      setCurrentTxType('join');
      handleJoinTournament();
    }
  }, [isApproveSuccess, hasSubmittedToDB]);

  // Handle join transaction success
  useEffect(() => {
    if (isJoinSuccess && !hasSubmittedToDB) {
      console.log('✅ [SURVIVAL-JOIN] Join transaction successful, updating database...');
      handleDatabaseUpdate();
    }
  }, [isJoinSuccess, hasSubmittedToDB]);

  const handleApprove = async () => {
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

    console.log('🔐 [SURVIVAL-APPROVE] Starting approval process...');
    console.log('   Tournament:', tournament.title);
    console.log('   Entry Fee:', tournament.entryFee, 'NTIQ');
    console.log('   User:', address);

    while (retryCount < maxRetries) {
      try {
        setIsSubmitting(true);
        setCurrentTxType('approve');

        const entryFeeWei = parseEther(tournament.entryFee.toString());
        
        console.log(`🔐 [SURVIVAL-APPROVE] Attempt ${retryCount + 1}/${maxRetries}`);
        console.log('   Entry Fee Wei:', entryFeeWei.toString());

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
          console.log('🔐 [SURVIVAL-APPROVE] Approval transaction sent:', approveTxHash);
          
          toast({
            title: "Approval Transaction Sent",
            description: "Please confirm the approval in MetaMask",
          });
          return; // Success, exit retry loop
        }

      } catch (error: any) {
        lastError = error;
        retryCount++;

        console.error(`❌ [SURVIVAL-APPROVE] Attempt ${retryCount} failed:`, error);
        console.error('❌ [SURVIVAL-APPROVE] Error details:', {
          message: error.message,
          shortMessage: error.shortMessage,
          code: error.code,
          data: error.data,
          attempt: retryCount
        });

        // Check if it's a retryable error
        const isRetryableError = error.message?.includes("Internal JSON-RPC error") ||
          error.message?.includes("-32603") ||
          error.message?.includes("network") ||
          error.message?.includes("timeout");

        if (retryCount < maxRetries && isRetryableError) {
          console.log(`🔄 [SURVIVAL-APPROVE] Retrying in ${retryCount * 2} seconds...`);
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
  };

  const handleJoinTournament = async () => {
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

    console.log('🏆 [SURVIVAL-JOIN] Starting tournament join process...');
    console.log('   Tournament:', tournament.title);
    console.log('   Entry Fee:', tournament.entryFee, 'NTIQ');
    console.log('   User:', address);

    while (retryCount < maxRetries) {
      try {
        const entryFeeWei = parseEther(tournament.entryFee.toString());
        const tournamentId = `0x${tournament.id.toString(16).padStart(64, '0')}`; // Convert to bytes32

        console.log(`🏆 [SURVIVAL-JOIN] Attempt ${retryCount + 1}/${maxRetries}`);
        console.log('   Tournament ID:', tournamentId);
        console.log('   Entry Fee Wei:', entryFeeWei.toString());

        // Join tournament on blockchain
        const joinTxHash = await writeJoinContract({
          address: CONTRACTS.TOURNAMENT_POOL,
          abi: CONTRACTS.ABIS?.TOURNAMENT_POOL || [],
          functionName: 'joinTournament',
          args: [tournamentId, entryFeeWei],
          chainId: chain.id,
          gas: 200000n,
        });

        if (joinTxHash) {
          setJoinTxHash(joinTxHash);
          console.log('🏆 [SURVIVAL-JOIN] Join transaction sent:', joinTxHash);
          
          toast({
            title: "Join Transaction Sent",
            description: "Please confirm the join transaction in MetaMask",
          });
          return; // Success, exit retry loop
        }

      } catch (error: any) {
        lastError = error;
        retryCount++;

        console.error(`❌ [SURVIVAL-JOIN] Attempt ${retryCount} failed:`, error);
        console.error('❌ [SURVIVAL-JOIN] Error details:', {
          message: error.message,
          shortMessage: error.shortMessage,
          code: error.code,
          data: error.data,
          attempt: retryCount
        });

        // Check if it's a retryable error
        const isRetryableError = error.message?.includes("Internal JSON-RPC error") ||
          error.message?.includes("-32603") ||
          error.message?.includes("network") ||
          error.message?.includes("timeout");

        if (retryCount < maxRetries && isRetryableError) {
          console.log(`🔄 [SURVIVAL-JOIN] Retrying in ${retryCount * 2} seconds...`);
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

    let errorMessage = "Join tournament failed after multiple attempts.";
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
  };

  const handleDatabaseUpdate = async () => {
    if (hasSubmittedToDB) {
      console.log('⚠️ [SURVIVAL-DB] Database already updated, skipping...');
      return;
    }

    try {
      setHasSubmittedToDB(true);
      console.log('💾 [SURVIVAL-DB] Updating database with tournament join...');

      // Update database with tournament join
      const response = await apiRequest(`/api/survival-tournaments/${tournament.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockchainTxHash: joinTxHash,
          entryFee: tournament.entryFee
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update database');
      }

      console.log('✅ [SURVIVAL-DB] Database updated successfully');
      
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
  };

  const handleSubmit = () => {
    console.log('🔘 [SURVIVAL-BUTTON] Button clicked!');
    console.log('🔘 [SURVIVAL-BUTTON] Wallet state:', { address, chain });
    console.log('🔘 [SURVIVAL-BUTTON] Button disabled:', isButtonDisabled());
    
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
      disabled,
      currentTxType
    });
    return disabled;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            🏆 Join Survival Tournament
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Join the tournament using your NTIQ tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tournament Info */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">{tournament.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Cryptocurrency:</span>
                <span className="text-white capitalize">{tournament.cryptocurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entry Fee:</span>
                <span className="text-green-400 font-semibold">{tournament.entryFee} NTIQ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Participants:</span>
                <span className="text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
              </div>
            </div>
          </div>

          {/* Transaction Steps */}
          <div className="space-y-3">
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              currentTxType === 'approve' ? 'bg-blue-900/50 border border-blue-500' : 
              isApproveSuccess ? 'bg-green-900/50 border border-green-500' : 
              'bg-slate-700'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isApproveSuccess ? 'bg-green-500' : 
                currentTxType === 'approve' ? 'bg-blue-500' : 
                'bg-slate-500'
              }`}>
                {isApproveSuccess ? '✓' : '1'}
              </div>
              <div>
                <div className="text-white font-medium">Approve NTIQ Token</div>
                <div className="text-slate-400 text-sm">Allow tournament contract to spend your NTIQ</div>
              </div>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              currentTxType === 'join' ? 'bg-blue-900/50 border border-blue-500' : 
              isJoinSuccess ? 'bg-green-900/50 border border-green-500' : 
              'bg-slate-700'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isJoinSuccess ? 'bg-green-500' : 
                currentTxType === 'join' ? 'bg-blue-500' : 
                'bg-slate-500'
              }`}>
                {isJoinSuccess ? '✓' : '2'}
              </div>
              <div>
                <div className="text-white font-medium">Join Tournament</div>
                <div className="text-slate-400 text-sm">Stake your NTIQ and join the tournament</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isSubmitting}
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
