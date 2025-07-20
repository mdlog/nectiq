import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
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
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
