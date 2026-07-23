"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useState } from "react";
import { z } from "zod";
import { ApiError } from "@/lib/api";

const MAX_RETRIES = 2;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              // A malformed shape won't fix itself by retrying the same request.
              if (error instanceof z.ZodError) return false;
              if (
                error instanceof ApiError &&
                error.status >= 400 &&
                error.status < 500
              ) {
                return false;
              }
              return failureCount < MAX_RETRIES;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={400}>{children}</TooltipProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
