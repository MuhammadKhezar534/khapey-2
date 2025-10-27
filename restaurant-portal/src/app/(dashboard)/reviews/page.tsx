"use client";

import { useEffect, useCallback } from "react";
import { ReviewsTable } from "@/components/reviews/reviews-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh";
import { useBranch } from "@/contexts/branch-context";
import { useReviewsDataWithQuery } from "@/hooks/use-reviews-data-with-query";

export default function ReviewsPage() {
  const isMobile = useIsMobile();
  const { selectedBranch } = useBranch();

  // Use our new hook with React Query for data fetching and caching
  const {
    reviewsData,
    isLoading,
    isRefreshing,
    refreshData,
    timeRange,
    updateTimeRange,
  } = useReviewsDataWithQuery("month", selectedBranch?.branchName);

  // Set up pull-to-refresh
  const { pullDistance, isRefreshing: isPulling } = usePullToRefresh({
    onRefresh: async () => {
      await refreshData();
    },
    pullDownThreshold: 80,
  });

  // Listen for global refresh events - use useCallback to prevent infinite loops
  const handleGlobalRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    window.addEventListener("app:refresh", handleGlobalRefresh);

    return () => {
      window.removeEventListener("app:refresh", handleGlobalRefresh);
    };
  }, [handleGlobalRefresh]);

  // Listen for branch changes - only refresh when branch actually changes
  useEffect(() => {
    // When branch changes, refresh data
    refreshData();
    // We only want to run this when selectedBranch changes, not when refreshData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch?.branchName]);

  return (
    <div className="space-y-4">
      {/* Pull-to-refresh indicator */}
      {isMobile && (
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isPulling || isRefreshing}
          threshold={80}
        />
      )}

      <ReviewsTable
        timeRange={timeRange}
        setTimeRange={updateTimeRange}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        refreshData={refreshData}
        isMobile={isMobile}
        reviewsData={reviewsData}
      />
    </div>
  );
}
