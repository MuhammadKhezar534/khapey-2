"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { allMockReviews, type Review } from "@/utils/review-data";
import { useNetworkStatus } from "./use-network-status";
import { toast } from "@/components/ui/use-toast";
import { useRefresh } from "@/hooks/use-refresh";

// Define query key types for better type safety
type ReviewsQueryKey = ["reviews", string, string]; // [key, timeRange, selectedBranch]

// Create a reusable function to generate query keys
const createReviewsQueryKey = (
  timeRange: string,
  selectedBranch: string
): ReviewsQueryKey => ["reviews", timeRange, selectedBranch];

// Mock function to fetch reviews data
const fetchReviewsData = async (
  timeRange: string,
  selectedBranch: string
): Promise<Review[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Filter by branch if selected
  let filteredReviews = [...allMockReviews];
  if (selectedBranch) {
    filteredReviews = filteredReviews.filter(
      (review) => review.branch === selectedBranch
    );
  }

  // Filter by time range
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "week":
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last-month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      filteredReviews = filteredReviews.filter(
        (review) => review.date >= startDate && review.date <= endDate
      );
      break;
    default: // "all"
      return filteredReviews;
  }

  if (timeRange !== "last-month") {
    filteredReviews = filteredReviews.filter(
      (review) => review.date >= startDate
    );
  }

  return filteredReviews;
};

/**
 * Custom hook for fetching and caching reviews data
 * Includes offline handling
 */
export function useReviewsDataWithQuery(
  initialTimeRange: string,
  initialBranch: string
) {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  // Create query key
  const reviewsQueryKey = createReviewsQueryKey(timeRange, selectedBranch);

  // Fetch reviews data with caching
  const {
    data: reviewsData,
    isLoading,
    isRefetching,
    error,
    data,
    isError,
  } = useQuery({
    queryKey: reviewsQueryKey,
    queryFn: () => fetchReviewsData(timeRange, selectedBranch),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    // Retry only if online
    retry: (failureCount: number, error: any) => {
      if (!isOnline) return false;
      return failureCount < 3;
    },
    // Use cached data when offline
    refetchOnReconnect: true,
  });

  const { isRefreshing, refresh } = useRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reviewsData"] });
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

  // Initial data fetch (without toast)
  useEffect(() => {
    if (!data && !isLoading && !isError) {
      refresh(false); // false = not a manual refresh
    }
  }, [data, isLoading, isError, refresh]);

  // Function to refresh data
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

    try {
      await queryClient.invalidateQueries({ queryKey: reviewsQueryKey });

      // Show success toast
      toast({
        title: "Reviews refreshed",
        description: "Your reviews data has been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error refreshing reviews data:", error);
      toast({
        title: "Refresh failed",
        description:
          "There was a problem refreshing your data. Please try again.",
        variant: "destructive",
      });
    }
  }, [isOnline, queryClient, reviewsQueryKey]);

  // Function to update time range
  const updateTimeRange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  // Function to update selected branch
  const updateSelectedBranch = (newBranch: string) => {
    setSelectedBranch(newBranch);
  };

  // Check if we have a network error
  const hasNetworkError =
    error instanceof Error &&
    (error.message.includes("network") || error.message.includes("fetch"));

  return {
    reviewsData: reviewsData || [],
    isLoading,
    isRefreshing: isRefetching || isRefreshing,
    error,
    refreshData,
    timeRange,
    updateTimeRange,
    selectedBranch,
    updateSelectedBranch,
    isOnline,
    hasNetworkError,
  };
}
