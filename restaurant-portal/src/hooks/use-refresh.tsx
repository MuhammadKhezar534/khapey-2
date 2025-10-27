"use client";

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "./use-network-status";

interface UseRefreshOptions {
  onRefresh: () => Promise<any> | void;
  refreshDuration?: number;
  showToast?: boolean;
  toastMessages?: {
    success?: string;
    error?: string;
    offline?: string;
  };
}

/**
 * A hook to manage data refresh operations with consistent UX
 */
export function useRefresh({
  onRefresh,
  refreshDuration = 800,
  showToast = true,
  toastMessages = {
    success: "Your data has been refreshed.",
    error: "There was a problem refreshing your data. Please try again.",
    offline: "You're currently offline. Using cached data.",
  },
}: UseRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isOnline } = useNetworkStatus();
  // Track if this is a manual refresh (vs initial load)
  const isManualRefresh = useRef(false);
  // Get the toast methods from our hook
  const {
    default: defaultToast,
    error: errorToast,
    warning: warningToast,
  } = useToast();

  const refresh = useCallback(
    async (manual = true) => {
      if (isRefreshing) return;

      // Set the manual refresh flag
      isManualRefresh.current = manual;

      // Don't allow refresh when offline
      if (!isOnline) {
        if (showToast && manual) {
          warningToast("Offline mode", toastMessages.offline);
        }
        return;
      }

      setIsRefreshing(true);

      try {
        // Dispatch global refresh event
        window.dispatchEvent(
          new CustomEvent("app:refresh", { detail: { manual } })
        );

        // Call the component-specific refresh function
        const result = onRefresh();
        if (result instanceof Promise) {
          await result;
        }

        // Show success toast ONLY for manual refreshes
        if (showToast && manual) {
          defaultToast("Refreshed", toastMessages.success);
        }
      } catch (error) {
        console.error("Error refreshing data:", error);

        // Show error toast ONLY for manual refreshes
        if (showToast && manual) {
          errorToast("Refresh failed", toastMessages.error);
        }
      } finally {
        // Keep refresh indicator visible for consistent duration
        setTimeout(() => {
          setIsRefreshing(false);
        }, refreshDuration);
      }
    },
    [
      isRefreshing,
      isOnline,
      onRefresh,
      refreshDuration,
      showToast,
      toastMessages,
      defaultToast,
      errorToast,
      warningToast,
    ]
  );

  return {
    isRefreshing,
    refresh,
  };
}
