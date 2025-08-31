import { useQuery } from "@tanstack/react-query";

export function useMaintenanceMode() {
  const { data: settings } = useQuery({
    queryKey: ["/api/admin/settings"],
    refetchInterval: 30000,
    staleTime: 0,
    cacheTime: 0,
  });

  const isMaintenanceMode = settings?.platform?.maintenanceMode || false;

  return {
    isMaintenanceMode,
    isLoading: !settings,
  };
}