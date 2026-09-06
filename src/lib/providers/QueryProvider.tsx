"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ApiError } from "../api/client";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Never retry on client errors (401, 403, 404, 422)
              if (error instanceof ApiError) {
                if ([401, 403, 404, 409, 422].includes(error.status)) {
                  return false;
                }
              }
              return failureCount < 2;
            },
          },
          mutations: {
            // Never automatically retry mutations (to prevent sending messages or creating duplicate sessions twice)
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
