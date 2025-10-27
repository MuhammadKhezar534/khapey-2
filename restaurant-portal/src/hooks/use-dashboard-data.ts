"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getMetricsData,
  getReviewsData,
  getEngagementData,
  getBranchDetailedData,
  getBranchData,
  getBreakdownData,
  getStats,
} from "@/utils/dashboard-data";
import type {
  MetricsDataPoint,
  ReviewsDataPoint,
  EngagementDataPoint,
  BranchDataPoint,
  BranchDetailedDataPoint,
  BreakdownData,
  Stats,
  TimeRange,
} from "@/types/dashboard";
import { handleError, ErrorType, createAppError } from "@/lib/error-handling";
import { toast } from "@/hooks/use-toast";

// Define interface for the return type for better type safety
interface DashboardData {
  metricsData: MetricsDataPoint[];
  reviewsData: ReviewsDataPoint[];
  engagementData: EngagementDataPoint[];
  branchData: BranchDataPoint[];
  branchDetailedData: BranchDetailedDataPoint[];
  breakdownData: BreakdownData;
  stats: Stats;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing dashboard data
 * @param {TimeRange} timeRange - The time range to filter the data by
 * @param {string} selectedBranch - The selected branch to filter the data by
 * @returns {DashboardData} - An object containing the dashboard data and loading state
 */
export function useDashboardData(
  timeRange: TimeRange,
  selectedBranch: string
): DashboardData {
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshInProgressRef = useRef(false);

  const [data, setData] = useState<{
    metricsData: MetricsDataPoint[];
    reviewsData: ReviewsDataPoint[];
    engagementData: EngagementDataPoint[];
    branchData: BranchDataPoint[];
    branchDetailedData: BranchDetailedDataPoint[];
    breakdownData: BreakdownData;
    stats: Stats;
  }>(() => ({
    metricsData: [],
    reviewsData: [],
    engagementData: [],
    branchData: [],
    branchDetailedData: [],
    breakdownData: { reviews: [], revenue: [], discounts: [] },
    stats: {
      totalViews: 0,
      totalLikes: 0,
      totalReviews: 0,
      totalPhoneClicks: 0,
      totalSaves: 0,
      totalShares: 0,
    },
  }));

  /**
   * Fetch all dashboard data with proper error handling
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      console.log("useDashboardData: Fetching data", {
        timeRange,
        selectedBranch,
      });
      // Validate inputs
      if (!timeRange) {
        throw createAppError("Time range is required", ErrorType.VALIDATION);
      }

      // Fetch all data in parallel for better performance
      const [
        metricsData,
        reviewsData,
        engagementData,
        branchData,
        branchDetailedData,
        breakdownData,
        stats,
      ] = await Promise.all([
        getMetricsData(timeRange, selectedBranch),
        getReviewsData(timeRange, selectedBranch),
        getEngagementData(timeRange, selectedBranch),
        getBranchData(selectedBranch),
        getBranchDetailedData(),
        getBreakdownData(),
        getStats(selectedBranch),
      ]);

      setData({
        metricsData,
        reviewsData,
        engagementData,
        branchData,
        branchDetailedData,
        breakdownData,
        stats,
      });

      setError(null);
      console.log("useDashboardData: Data fetched successfully");
    } catch (error) {
      // Use our standardized error handling
      const appError = handleError(error, "Failed to fetch dashboard data");
      setError(appError.message);
      console.error("useDashboardData: Error fetching data", appError);

      // Show toast notification for errors
      toast({
        title: "Error loading dashboard",
        description: appError.message,
        variant: "destructive",
      });

      // Return empty data on error
      return {
        metricsData: [],
        reviewsData: [],
        engagementData: [],
        branchData: [],
        branchDetailedData: [],
        breakdownData: { reviews: [], revenue: [], discounts: [] },
        stats: {
          totalViews: 0,
          totalLikes: 0,
          totalReviews: 0,
          totalPhoneClicks: 0,
          totalSaves: 0,
          totalShares: 0,
        },
      };
    }
  }, [timeRange, selectedBranch]);

  // Initial data load
  const initialLoad = useCallback(async () => {
    setIsLoading(true);
    await fetchDashboardData();
    setIsLoading(false);
  }, [fetchDashboardData]);

  // Refresh with loading indicator
  const refresh = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (refreshInProgressRef.current) {
      console.log("useDashboardData: Refresh already in progress, skipping");
      return;
    }

    console.log("useDashboardData: Starting refresh");
    refreshInProgressRef.current = true;
    setIsRefreshing(true);

    try {
      await fetchDashboardData();
      console.log("useDashboardData: Refresh completed successfully");
    } catch (error) {
      console.error("useDashboardData: Error during refresh", error);
    } finally {
      // Add a small delay to ensure UI updates properly
      setTimeout(() => {
        setIsRefreshing(false);
        refreshInProgressRef.current = false;
        console.log("useDashboardData: Refresh state reset");
      }, 500);
    }
  }, [fetchDashboardData]);

  // Update data when time range or selected branch changes
  useEffect(() => {
    initialLoad();
  }, [timeRange, selectedBranch, initialLoad]);

  // Listen for global refresh events with cleanup
  useEffect(() => {
    const handleRefresh = () => {
      console.log("useDashboardData: Global refresh event received");
      refresh();
    };

    window.addEventListener("app:refresh", handleRefresh);

    return () => {
      window.removeEventListener("app:refresh", handleRefresh);
    };
  }, [refresh]);

  return {
    ...data,
    isLoading,
    isRefreshing,
    error,
    refreshData: refresh,
  };
}
