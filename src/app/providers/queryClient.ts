import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      /** Prefer cached data for a minute before background refetch. */
      staleTime: 60_000,
      /** Keep unused query results for 10 minutes (React Query v5 default is 5m). */
      gcTime: 10 * 60_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

