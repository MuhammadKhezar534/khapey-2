"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMetricsData,
  getReviewsData,
  getEngagementData,
  getBranchDetailedData,
  getBranchData,
  getBreakdownData,
} from "@/utils/dashboard-data";
import { useState, useCallback, useEffect } from "react";
import { useNetworkStatus } from "./use-network-status";
import { toast } from "sonner";
// Add the useRefresh hook import
import { useRefresh } from "@/hooks/use-refresh";
import {
  getBranchesBreakDown,
  getBranchesPerformance,
  getDashboardOverview,
  getReviews,
  getQNAByBranch,
} from "@/services/dashboard.service";
import { Branch } from "@/contexts/branch-context";
import { TimeRangeOption } from "@/config/time-ranges";
import {
  getBreakDownDataByResponse,
  transformBranchData,
} from "@/utils/functions";

// Define query key types for better type safety
type QueryKeyType =
  | "metrics"
  | "reviews"
  | "engagement"
  | "branch"
  | "branchDetailed"
  | "breakdown"
  | "stats";
type QueryKey = [QueryKeyType, string, string]; // [key, timeRange, selectedBranch]

// Create a reusable function to generate query keys
const createQueryKey = (
  type: QueryKeyType,
  timeRange: string,
  selectedBranch: string
): QueryKey => [type, timeRange, selectedBranch];

/**
 * Enhanced hook for fetching and managing dashboard data with React Query
 * Includes state management for timeRange and selectedBranch
 * Handles offline scenarios
 */
export function useDashboardDataWithQuery(
  initialTimeRange: TimeRangeOption,
  initialBranch: Branch
) {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stale time and refetch settings for all queries
  const queryConfig = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    // Retry only if online
    retry: (failureCount: number, error: any) => {
      if (!isOnline) return false;
      return failureCount < 3;
    },
    // Use cached data when offline
    refetchOnReconnect: true,
  };

  // Create query keys using the helper function
  const metricsKey = createQueryKey(
    "metrics",
    timeRange?.value,
    selectedBranch?.branchName
  );
  const reviewsKey = createQueryKey(
    "reviews",
    timeRange?.value,
    selectedBranch?.branchName
  );
  const engagementKey = createQueryKey(
    "engagement",
    timeRange?.value,
    selectedBranch?.branchName
  );
  const branchKey = createQueryKey(
    "branch",
    timeRange?.value,
    selectedBranch?.branchName
  );
  const branchDetailedKey = createQueryKey(
    "branchDetailed",
    timeRange?.value,
    selectedBranch?.branchName
  );
  const breakdownKey = createQueryKey(
    "breakdown",
    timeRange?.value,
    selectedBranch?.branchName
  );
  const statsKey = createQueryKey(
    "stats",
    timeRange?.value,
    selectedBranch?.branchName
  );

  useEffect(() => {
    setSelectedBranch(initialBranch);
  }, [initialBranch?.branchName]);

  // Fetch reviews data
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error: reviewsError,
    isFetching: isFetchingReviews,
  } = useQuery({
    queryKey: reviewsKey,
    queryFn: () => getReviews(timeRange?.value, selectedBranch?._id),
    // queryFn: () => getDashboardOverview(),
    ...queryConfig,
  });

  const {
    data: branchStatsData,
    isLoading: isLoadingBranchStats,
    error: branchStatsError,
    isFetching: isFetchingBranchStats,
  } = useQuery({
    queryKey: ["branchStats", initialBranch, timeRange],
    queryFn: () => getDashboardOverview(timeRange?.value, initialBranch?._id),
    ...queryConfig,
  });

  // Fetch engagement data
  const {
    data: engagementData,
    isLoading: isLoadingEngagement,
    error: engagementError,
    isFetching: isFetchingEngagement,
  } = useQuery({
    queryKey: engagementKey,
    queryFn: () =>
      getEngagementData(timeRange?.value, selectedBranch?.branchName),
    ...queryConfig,
  });

  const {
    data: QNAData,
    // isLoading: isLoadingBranchesPerformance,
    // error: branchesPerformanceError,
    // isFetching: isFetchingBranchesPerformance,
  } = useQuery({
    queryKey: branchKey,
    queryFn: () => getQNAByBranch(initialBranch?._id),
    enabled: !!initialBranch?._id,
    ...queryConfig,
  });

  const {
    data: branchDetailedData,
    isLoading: isLoadingBranchDetailed,
    error: branchDetailedError,
    isFetching: isFetchingBranchDetailed,
  } = useQuery({
    queryKey: branchDetailedKey,
    queryFn: () => getBranchesPerformance(timeRange?.value, initialBranch?._id),
    ...queryConfig,
  });

  const {
    data: breakdownData,
    isLoading: isLoadingBreakdown,
    error: breakdownError,
    isFetching: isFetchingBreakdown,
  } = useQuery({
    queryKey: breakdownKey,
    queryFn: () => getBranchesBreakDown(timeRange?.value, initialBranch?._id),
    ...queryConfig,
  });

  console.log({ QNAData, initialBranch });
  // console.log({
  //   breakdownData,
  //   reviewsData,
  //   branchDetailedData,
  //   resp: getBreakDownDataByResponse(breakdownData),
  // });

  const isLoading = [
    isLoadingReviews,
    isLoadingEngagement,
    // isLoadingBranchesPerformance,
    isLoadingBranchDetailed,
    isLoadingBreakdown,
    isLoadingBranchStats,
  ].some(Boolean);

  // Determine if any data is currently fetching (including refetches)
  const isFetching = [
    isFetchingReviews,
    isFetchingEngagement,
    // isFetchingBranchesPerformance,
    isFetchingBranchDetailed,
    isFetchingBreakdown,
    isFetchingBranchStats,
  ].some(Boolean);

  // Collect all errors
  const errors = [
    reviewsError,
    engagementError,
    // branchesPerformanceError,
    branchDetailedError,
    breakdownError,
    branchStatsError,
  ].filter(Boolean);

  // Check if we have any network errors
  const hasNetworkError = errors.some(
    (error) =>
      error instanceof Error &&
      (error.message.includes("network") || error.message.includes("fetch"))
  );

  // Replace the existing refresh function and isRefreshing state with:
  const { isRefreshing: refreshState, refresh } = useRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
    showToast: false, // Don't show toasts from here, let the Header handle it
  });

  // Update the useEffect to use the new refresh function
  useEffect(() => {
    const handleAppRefresh = (event: Event) => {
      const customEvent = event as CustomEvent;
      const isManual = customEvent.detail?.manual ?? false;
      refresh(isManual);
    };

    window.addEventListener("app:refresh", handleAppRefresh);
    return () => {
      window.removeEventListener("app:refresh", handleAppRefresh);
    };
  }, [refresh]);

  // // Initial data fetch (without toast)
  // useEffect(() => {
  //   if (!metricsData && !isLoading && !metricsError) {
  //     refresh(false); // false = not a manual refresh
  //   }
  // }, [metricsData, isLoading, metricsError, refresh]);

  // Function to refresh all data with optimized invalidation
  const refreshData = useCallback(async () => {
    // Don't attempt to refresh if offline
    if (!isOnline) {
      toast({
        title: "Offline mode",
        description: "You're currently offline. Using cached data.",
        variant: "warning",
      });
      return;
    }

    const queryKeys = [
      metricsKey,
      reviewsKey,
      engagementKey,
      branchKey,
      branchDetailedKey,
      breakdownKey,
      statsKey,
    ];

    try {
      setIsRefreshing(true);

      // Batch invalidations for better performance
      await queryClient.invalidateQueries({
        predicate: (query) =>
          queryKeys.some(
            (key) => JSON.stringify(query.queryKey) === JSON.stringify(key)
          ),
      });

      // Show success toast
      toast({
        title: "Data refreshed",
        description: "Your dashboard data has been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      toast({
        title: "Refresh failed",
        description:
          "There was a problem refreshing your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Keep refresh indicator a bit longer than needed to provide feedback
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [
    isOnline,
    queryClient,
    metricsKey,
    reviewsKey,
    engagementKey,
    branchKey,
    branchDetailedKey,
    breakdownKey,
    statsKey,
  ]);

  // Function to update time range
  const updateTimeRange = useCallback((newTimeRange: TimeRangeOption) => {
    setTimeRange(newTimeRange);
  }, []);

  // Function to update selected branch
  const updateSelectedBranch = useCallback((newBranch: Branch) => {
    setSelectedBranch(newBranch);
  }, []);

  return {
    branchStatsData: branchStatsData?.data || [],
    metricsData: getMetricsData(timeRange?.value, branchStatsData?.data),
    reviewsData: reviewsData || [],
    engagementData: engagementData || [],
    branchDetailedData:
      transformBranchData(branchDetailedData?.breakdown)?.branchesData || [],
    breakdownData: getBreakDownDataByResponse(breakdownData) || {},
    isLoading,
    isRefreshing: refreshState || isFetching, // Track both explicit refreshing and background fetching
    refreshData,
    timeRange,
    updateTimeRange,
    selectedBranch: selectedBranch?.branchName,
    updateSelectedBranch,
    isOnline,
    hasNetworkError,
    errors,
  };
}
