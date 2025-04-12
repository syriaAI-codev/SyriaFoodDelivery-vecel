import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
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
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      // Don't throw on authentication errors, just handle them appropriately
      if (res.status === 401) {
        console.log("Authentication required for:", queryKey[0]);
        return null;
      }

      // For other error statuses, throw an error
      if (!res.ok) {
        await throwIfResNotOk(res);
      }

      // Try to parse the JSON response, handling empty responses
      let responseData;
      try {
        const text = await res.text();
        responseData = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Error parsing response:', e);
        return null;
      }
      
      // Check if the response has the expected structure
      if (responseData && typeof responseData === 'object') {
        // If API returns standard format with 'data' property, return that
        if ('data' in responseData) {
          return responseData.data;
        }
        // Otherwise return the whole response
        return responseData;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching ${queryKey[0]}:`, error);
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // Changed from "throw" to "returnNull" to handle auth errors more gracefully
      refetchInterval: false,
      refetchOnWindowFocus: true, // Changed to true to refresh data when window regains focus
      staleTime: 300000, // 5 minutes instead of Infinity for better data freshness
      retry: 1, // Allow one retry on failure
      refetchOnReconnect: true, // Refetch on network reconnection
    },
    mutations: {
      retry: 1, // Allow one retry for mutations too
    },
  },
});
