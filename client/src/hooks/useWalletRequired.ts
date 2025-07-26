import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useWalletRequired() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [actionType, setActionType] = useState<'prediction' | 'battle' | 'survival'>('prediction');
  const { toast } = useToast();

  // Check current user and wallet status
  const { data: user, refetch: refetchUser } = useQuery<any>({
    queryKey: ['/api/user'],
    retry: false,
  });

  const checkWalletRequired = useCallback((
    action: () => void,
    type: 'prediction' | 'battle' | 'survival' = 'prediction'
  ) => {
    // If user is not authenticated at all
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this feature.",
        variant: "destructive",
      });
      return false;
    }

    // If user has wallet address, allow action
    if (user.walletAddress) {
      action();
      return true;
    }

    // If user logged in with email but no wallet, show modal
    if (user.authMethod === 'email' && !user.walletAddress) {
      setPendingAction(() => action);
      setActionType(type);
      setIsModalOpen(true);
      return false;
    }

    // Default case - require wallet
    setPendingAction(() => action);
    setActionType(type);
    setIsModalOpen(true);
    return false;
  }, [user, toast]);

  const onWalletConnected = useCallback(() => {
    // Refresh user data to get updated wallet address
    refetchUser().then(() => {
      // Execute pending action
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    });
  }, [pendingAction, refetchUser]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setPendingAction(null);
  }, []);

  return {
    isModalOpen,
    actionType,
    checkWalletRequired,
    onWalletConnected,
    closeModal,
    hasWallet: !!user?.walletAddress,
    isEmailUser: user?.authMethod === 'email' && !user?.walletAddress,
  };
}