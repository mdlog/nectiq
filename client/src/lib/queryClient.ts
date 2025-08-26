import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Global wallet address state for headers
let globalWalletAddress: string | null = null;

export function setGlobalWalletAddress(address: string | null) {
  globalWalletAddress = address;
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔐 [QUERY-CLIENT] Global wallet address set:', address ? address.substring(0, 8) + '...' : 'null');
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  
  // Add wallet address header if available
  if (globalWalletAddress) {
    headers['x-wallet-address'] = globalWalletAddress;
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 [API-REQUEST] Including wallet address in headers for:', url);
    }
  }

  const res = await fetch(url, {
    credentials: "include",
    headers,
    ...options,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    console.log('📡 [QUERY-CLIENT] Making request to:', url);
    
    const headers: Record<string, string> = {};
    
    // Add wallet address header if available
    if (globalWalletAddress) {
      headers['x-wallet-address'] = globalWalletAddress;
      console.log('🔐 [QUERY-CLIENT] Including wallet address in headers for:', url);
    }

    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    console.log('📡 [QUERY-CLIENT] Response status for', url, ':', res.status);
    console.log('📡 [QUERY-CLIENT] Response headers:', Object.fromEntries(res.headers.entries()));

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log('📡 [QUERY-CLIENT] Returning null for 401 response:', url);
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log('📡 [QUERY-CLIENT] Success response for', url, ':', data);
    return data;
  };

// Add global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('🔥 [GLOBAL] Unhandled promise rejection prevented:', event.reason);
    
    // Prevent default behavior (console error)
    event.preventDefault();
    
    // Handle authentication errors gracefully
    if (event.reason?.message?.includes('401') || 
        event.reason?.message?.includes('Authentication required')) {
      console.log('🔐 [GLOBAL] Authentication error handled globally');
      return;
    }
    
    // Handle other common errors
    if (event.reason?.message?.includes('Failed to fetch')) {
      console.log('🌐 [GLOBAL] Network error handled globally');
      return;
    }
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // Return null instead of throwing on 401
      refetchInterval: false, // Disable aggressive auto-refresh
      refetchIntervalInBackground: false, // Disable background refresh
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnReconnect: true, // Refresh when internet reconnects
      retry: 1, // Only retry once
      throwOnError: false, // Don't throw errors globally
    },
    mutations: {
      retry: false,
    },
  },
});
