"use client";

import type React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { NavigationProvider } from "@/contexts/navigation-context";
import { BranchProvider } from "@/contexts/branch-context";
import { DiscountProvider } from "@/contexts/discount-context";
import { AppInitializer } from "@/components/app-initializer";
import { EnhancedErrorBoundary } from "@/components/enhanced-error-boundary";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <EnhancedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationProvider>
            <BranchProvider>
              <DiscountProvider>
                <AppInitializer />
                {children}
                <Toaster />
              </DiscountProvider>
            </BranchProvider>
          </NavigationProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
}
