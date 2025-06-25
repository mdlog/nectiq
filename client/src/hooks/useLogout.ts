import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Reset specific queries
      queryClient.removeQueries({ queryKey: ['/api/user'] });
      queryClient.removeQueries({ queryKey: ['/api/predictions/active'] });
      queryClient.removeQueries({ queryKey: ['/api/rewards/recent'] });
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      
      // Force page refresh to clear any remaining state
      setTimeout(() => window.location.reload(), 100);
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  });
};