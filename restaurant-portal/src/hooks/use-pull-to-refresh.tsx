"use client";

import { useState, useEffect, useRef } from "react";
import { useNetworkStatus } from "./use-network-status";
import { toast } from "@/components/ui/use-toast";

interface UsePullToRefreshOptions {
  /**
   * The function to call when the user triggers a refresh.
   */
  onRefresh: () => Promise<void>;
  /**
   * The distance the user needs to pull down to trigger a refresh.
   * @default 80
   */
  pullDownThreshold?: number;
  /**
   * The maximum distance the user can pull down.
   * @default 120
   */
  maxPullDownDistance?: number;
  /**
   * Whether to show a toast when attempting to refresh while offline
   * @default true
   */
  showOfflineToast?: boolean;
}

/**
 * A hook that implements the pull-to-refresh functionality with offline support.
 * @param {UsePullToRefreshOptions} options - The options for the hook.
 * @returns {object} - An object containing the pull distance and refresh state.
 */
export function usePullToRefresh({
  onRefresh,
  pullDownThreshold = 80,
  maxPullDownDistance = 120,
  showOfflineToast = true,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isMounted = useRef(true);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull to refresh at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        currentY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);

      // Apply resistance to the pull
      const pullWithResistance = Math.min(distance * 0.5, maxPullDownDistance);

      if (distance > 0) {
        // Prevent default scrolling behavior when pulling down
        e.preventDefault();
        setPullDistance(pullWithResistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      if (pullDistance > pullDownThreshold) {
        // Check if online before attempting refresh
        if (!isOnline) {
          if (showOfflineToast) {
            toast({
              title: "You're offline",
              description: "Pull-to-refresh is disabled while offline",
              variant: "destructive",
            });
          }
          setPullDistance(0);
          setIsPulling(false);
          return;
        }

        setIsRefreshing(true);
        setPullDistance(0);

        try {
          await onRefresh();
        } catch (error) {
          console.error("Refresh failed:", error);
        }

        if (isMounted.current) {
          setIsRefreshing(false);
        }
      } else {
        setPullDistance(0);
      }

      setIsPulling(false);
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isPulling,
    pullDistance,
    onRefresh,
    pullDownThreshold,
    maxPullDownDistance,
    isOnline,
    showOfflineToast,
  ]);

  return {
    pullDistance,
    isRefreshing,
    isOnline,
  };
}
