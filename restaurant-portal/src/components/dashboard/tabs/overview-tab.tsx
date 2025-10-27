"use client";

import { StatCards } from "@/components/dashboard/stat-cards";
import { MetricsChart } from "@/components/dashboard/metrics-chart-lazy";
import { TimeRangeSelector } from "@/components/dashboard/time-range-selector";
import { SkeletonCard, SkeletonStatCard } from "@/components/ui/skeleton-card";
import { BranchStatsData } from "./overview-tab.model";
import { Branch } from "@/contexts/branch-context";
import { TimeRangeOption } from "@/config/time-ranges";

interface OverviewTabProps {
  timeRange: TimeRangeOption;
  setTimeRange: (range: TimeRangeOption) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshData: () => void;
  isMobile: boolean;
  selectedBranch: Branch;
  displayBranchName: string;
  metricsData: any[];
  reviewsData: any[];
  windowWidth: number;
  branchStatsData: BranchStatsData;
}

export function OverviewTab({
  timeRange,
  setTimeRange,
  isLoading,
  isRefreshing,
  refreshData,
  isMobile,
  selectedBranch,
  displayBranchName,
  metricsData,
  reviewsData,
  windowWidth,
  branchStatsData,
}: OverviewTabProps) {
  const showSkeletons = isLoading || isRefreshing;

  return (
    <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 pb-8 px-0 w-full max-w-full overflow-x-hidden box-border">
      <TimeRangeSelector
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        refreshData={refreshData}
        isMobile={isMobile}
        title={
          selectedBranch?.branchName
            ? `${displayBranchName} Performance`
            : "Performance Overview"
        }
      />

      {showSkeletons ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full max-w-full overflow-x-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonStatCard key={index} />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full max-w-full overflow-x-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonStatCard key={index} />
            ))}
          </div>

          <div className="grid grid-cols-1 w-full max-w-full overflow-x-hidden">
            <SkeletonCard contentHeight={450} />
          </div>
        </>
      ) : (
        <>
          <StatCards
            branchStatsData={branchStatsData}
            timeRange={timeRange}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 w-full max-w-full overflow-x-hidden">
            <MetricsChart
              data={metricsData.map((item, index) => ({
                ...item,
                reviews: reviewsData[index]?.reviews || 0,
              }))}
              title="Engagement & Reviews Over Time"
              description={`${
                selectedBranch?.branchName
                  ? `${displayBranchName} metrics for `
                  : "Daily metrics for "
              }${
                timeRange?.value === "today"
                  ? "today"
                  : timeRange?.value === "this_week"
                  ? "this_week"
                  : timeRange?.value === "this_month"
                  ? "this_month"
                  : timeRange?.value === "last_month"
                  ? "last_month"
                  : "all time"
              }`}
              windowWidth={windowWidth}
              timeRange={timeRange?.value}
              type="line"
              dataKeys={["views", "likes", "shares", "saves", "reviews"]}
            />
          </div>
        </>
      )}
    </div>
  );
}
