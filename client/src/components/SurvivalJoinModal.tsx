import React, { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CONTRACTS } from '@/lib/contracts';

interface SurvivalJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: {
    id: string;
    title: string;
    entryFee: number;
    prizePool: number;
    participants: number;
    maxParticipants: number;
  };
  onSuccess?: () => void;
}

export default function SurvivalJoinModal({ 
  isOpen, 
  onClose, 
  tournament, 
  onSuccess 
}: SurvivalJoinModalProps) {
  const { address, chain } = useAccount();
  const { toast } = useToast();
  
  // State management
  const [step, setStep] = useState<'approve' | 'join' | 'complete'>('approve');
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null);
  const [joinTxHash, setJoinTxHash] = useState<string | null>(null);

  // Contract write hooks
  const { writeContract: writeApprove, isPending: isApprovePending } = useWriteContract();
  const { writeContract: writeJoin, isPending: isJoinPending } = useWriteContract();

  // Transaction receipt hooks
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash as `0x${string}`,
  });

  const { isLoading: isJoinConfirming, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinTxHash as `0x${string}`,
  });

  // Handle approve NTIQ token
  const handleApprove = useCallback(async () => {
    console.log('🔘 [SURVIVAL-APPROVE] Button clicked, starting approve process');
    
    if (!address || !chain) {
      console.log('❌ [SURVIVAL-APPROVE] No wallet connected');
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const entryFeeWei = BigInt(tournament.entryFee * 10**18);
      console.log('💰 [SURVIVAL-APPROVE] Entry fee wei:', entryFeeWei.toString());
      console.log('🏦 [SURVIVAL-APPROVE] NTIQ Token address:', CONTRACTS.NTIQ_TOKEN);
      console.log('🏆 [SURVIVAL-APPROVE] Tournament Pool address:', CONTRACTS.TOURNAMENT_POOL);
      
      const hash = await writeApprove({
        address: CONTRACTS.NTIQ_TOKEN as `0x${string}`,
        abi: CONTRACTS.ABIS?.NTIQToken,
        functionName: 'approve',
        args: [CONTRACTS.TOURNAMENT_POOL as `0x${string}`, entryFeeWei],
      });

      if (hash) {
        console.log('✅ [SURVIVAL-APPROVE] Transaction hash received:', hash);
        setApproveTxHash(hash);
        toast({
          title: "Success",
          description: "Approval transaction submitted",
        });
      }
    } catch (error: any) {
      console.error('❌ [SURVIVAL-APPROVE] Approve error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to approve NTIQ token",
        variant: "destructive",
      });
    }
  }, [address, chain, tournament.entryFee, writeApprove, toast]);

  // Handle join tournament
  const handleJoin = useCallback(async () => {
    console.log('🔘 [SURVIVAL-JOIN] Button clicked, starting join process');
    
    if (!address || !chain) {
      console.log('❌ [SURVIVAL-JOIN] No wallet connected');
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      const entryFeeWei = BigInt(tournament.entryFee * 10**18);
      console.log('💰 [SURVIVAL-JOIN] Entry fee wei:', entryFeeWei.toString());
      console.log('🏆 [SURVIVAL-JOIN] Tournament Pool address:', CONTRACTS.TOURNAMENT_POOL);
      console.log('🆔 [SURVIVAL-JOIN] Tournament ID:', tournament.id);
      
      const hash = await writeJoin({
        address: CONTRACTS.TOURNAMENT_POOL as `0x${string}`,
        abi: CONTRACTS.ABIS?.TournamentPool,
        functionName: 'joinTournament',
        args: [BigInt(tournament.id), entryFeeWei],
      });

      if (hash) {
        console.log('✅ [SURVIVAL-JOIN] Transaction hash received:', hash);
        setJoinTxHash(hash);
        toast({
          title: "Success",
          description: "Join tournament transaction submitted",
        });
      }
    } catch (error: any) {
      console.error('❌ [SURVIVAL-JOIN] Join error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to join tournament",
        variant: "destructive",
      });
    }
  }, [address, chain, tournament.id, tournament.entryFee, writeJoin, toast]);

  // Handle database update after successful join
  const handleDatabaseUpdate = useCallback(async () => {
    try {
      const response = await fetch(`/api/survival-tournaments/${tournament.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryFee: tournament.entryFee,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update database');
      }

      toast({
        title: "Success",
        description: "Successfully joined tournament!",
      });
      setStep('complete');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Database update error:', error);
      toast({
        title: "Warning",
        description: "Tournament joined on blockchain but failed to update database",
        variant: "destructive",
      });
    }
  }, [tournament.id, tournament.entryFee, onSuccess, onClose, toast]);

  // Effects for transaction flow
  React.useEffect(() => {
    console.log('🔍 [SURVIVAL-FLOW] useEffect triggered:', {
      isApproveSuccess,
      step,
      approveTxHash
    });
    
    if (isApproveSuccess && step === 'approve') {
      console.log('✅ [SURVIVAL-FLOW] Approve success, moving to join step');
      setStep('join');
      // Don't auto-call handleJoin, let user click the button
    }
  }, [isApproveSuccess, step]);

  React.useEffect(() => {
    if (isJoinSuccess && step === 'join') {
      handleDatabaseUpdate();
    }
  }, [isJoinSuccess, step, handleDatabaseUpdate]);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep('approve');
      setApproveTxHash(null);
      setJoinTxHash(null);
    }
  }, [isOpen]);

  const getButtonText = () => {
    switch (step) {
      case 'approve':
        if (isApprovePending) return 'Approving NTIQ...';
        if (isApproveConfirming) return 'Confirming Approval...';
        return `Approve ${tournament.entryFee} NTIQ`;
      case 'join':
        if (isJoinPending) return 'Joining Tournament...';
        if (isJoinConfirming) return 'Confirming Join...';
        return 'Join Tournament';
      case 'complete':
        return 'Success!';
      default:
        return `Join for ${tournament.entryFee} NTIQ`;
    }
  };

  const isButtonDisabled = () => {
    return isApprovePending || isApproveConfirming || isJoinPending || isJoinConfirming || step === 'complete';
  };

  const getStepDescription = () => {
    switch (step) {
      case 'approve':
        return 'First, approve NTIQ token spending for tournament entry';
      case 'join':
        return 'Now join the tournament with your approved NTIQ tokens';
      case 'complete':
        return 'Successfully joined the tournament!';
      default:
        return 'Join the survival tournament';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            Join Survival Tournament
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tournament Info */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">{tournament.title}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Entry Fee:</span>
                <span className="text-white ml-2 font-medium">{tournament.entryFee} NTIQ</span>
              </div>
              <div>
                <span className="text-slate-400">Prize Pool:</span>
                <span className="text-white ml-2 font-medium">{tournament.prizePool} NTIQ</span>
              </div>
              <div>
                <span className="text-slate-400">Participants:</span>
                <span className="text-white ml-2 font-medium">{tournament.participants}/{tournament.maxParticipants}</span>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 'approve' ? 'bg-blue-600 text-white' : 
              step === 'join' ? 'bg-green-600 text-white' : 
              'bg-slate-600 text-slate-300'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 rounded ${
              step === 'join' || step === 'complete' ? 'bg-green-600' : 'bg-slate-600'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 'join' ? 'bg-blue-600 text-white' : 
              step === 'complete' ? 'bg-green-600 text-white' : 
              'bg-slate-600 text-slate-300'
            }`}>
              2
            </div>
          </div>

          {/* Step Description */}
          <div className="text-center">
            <p className="text-slate-300 text-sm">{getStepDescription()}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isApprovePending || isApproveConfirming || isJoinPending || isJoinConfirming}
            >
              Cancel
            </Button>
            <Button
              onClick={step === 'approve' ? handleApprove : handleJoin}
              disabled={isButtonDisabled()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600"
            >
              {getButtonText()}
            </Button>
          </div>

          {/* Transaction Hashes */}
          {approveTxHash && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-400 text-xs">
                Approval TX: {approveTxHash.slice(0, 10)}...{approveTxHash.slice(-8)}
              </p>
            </div>
          )}

          {joinTxHash && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-xs">
                Join TX: {joinTxHash.slice(0, 10)}...{joinTxHash.slice(-8)}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}