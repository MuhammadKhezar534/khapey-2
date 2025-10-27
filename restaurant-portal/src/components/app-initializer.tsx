"use client";

import { useEffect, useState } from "react";
import { useCacheAnalytics } from "@/hooks/use-cache-analytics";
import { Logger } from "@/lib/logger";
import { initFeatureFlags } from "@/lib/feature-flags";

const logger = new Logger("AppInitializer");

export function AppInitializer() {
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);

  // Initialize analytics
  useCacheAnalytics();

  // Log app initialization
  useEffect(() => {
    const initialize = async () => {
      try {
        setInitializing(true);

        // Initialize feature flags
        await initFeatureFlags();

        // Rest of your initialization code...
        // logger.info("Application initialized");

        // Report initial performance metrics
        if (typeof window !== "undefined" && "performance" in window) {
          const navigationTiming = performance.getEntriesByType(
            "navigation"
          )[0] as PerformanceNavigationTiming;
          if (navigationTiming) {
            // logger.info(
            //   "Page load time:",
            //   navigationTiming.loadEventEnd - navigationTiming.startTime
            // );
          }
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        setInitError(
          error instanceof Error
            ? error
            : new Error("Unknown initialization error")
        );
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  return null;
}
