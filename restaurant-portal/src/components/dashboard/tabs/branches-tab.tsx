"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TimeRangeSelector } from "@/components/dashboard/time-range-selector";
import {
  SkeletonBranchBreakdown,
  SkeletonTable,
} from "@/components/ui/skeleton-card";
import { BranchBreakdown } from "@/components/dashboard/branch-breakdown-lazy";
import { BranchTable } from "@/components/dashboard/branch-table-lazy";
import { Branch } from "@/contexts/branch-context";
import { TimeRangeOption } from "@/config/time-ranges";

interface BranchesTabProps {
  timeRange: TimeRangeOption;
  setTimeRange: (range: TimeRangeOption) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshData: () => void;
  isMobile: boolean;
  selectedBranch: Branch;
  displayBranchName: string;
  breakdownData: any;
  branchDetailedData: any[];
}

export function BranchesTab({
  timeRange,
  setTimeRange,
  isLoading,
  isRefreshing,
  refreshData,
  isMobile,
  selectedBranch,
  displayBranchName,
  breakdownData,
  branchDetailedData,
}: BranchesTabProps) {
  // Combined loading state to show skeletons
  const showSkeletons = isLoading || isRefreshing;

  return (
    <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 pb-8 px-0 min-h-[calc(100vh-12rem)] w-full max-w-full overflow-x-hidden box-border">
      {/* Time Range Selector */}
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
            : "Branch Performance"
        }
      />

      {showSkeletons ? (
        <>
          {/* Branch breakdown skeleton */}
          <SkeletonBranchBreakdown
            branchCount={selectedBranch?.branchName ? 1 : 5}
          />

          {/* Branch table skeleton */}
          <SkeletonTable
            rows={5}
            columns={8}
            branchCount={selectedBranch?.branchName ? 1 : 5}
          />
        </>
      ) : selectedBranch?.branchName === "All branches" ? (
        <>
          <BranchBreakdown breakdownData={breakdownData} />
          <BranchTable branchData={branchDetailedData} />
        </>
      ) : (
        <Card className="w-full max-w-full overflow-hidden">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm md:text-base truncate">
              {selectedBranch?.branchName} Performance
            </CardTitle>
            <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4 overflow-x-hidden">
                <div className="space-y-1 md:space-y-2">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">
                    Reviews
                  </div>
                  <div className="text-base md:text-2xl font-bold truncate">
                    {branchDetailedData
                      .find((b) => b.branch === selectedBranch?.branchName)
                      ?.reviews.toLocaleString() || 0}
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">
                    Views
                  </div>
                  <div className="text-base md:text-2xl font-bold truncate">
                    {branchDetailedData
                      .find((b) => b.branch === selectedBranch?.branchName)
                      ?.views.toLocaleString() || 0}
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">
                    Likes
                  </div>
                  <div className="text-base md:text-2xl font-bold truncate">
                    {branchDetailedData
                      .find((b) => b.branch === selectedBranch?.branchName)
                      ?.likes.toLocaleString() || 0}
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">
                    Revenue
                  </div>
                  <div className="text-base md:text-2xl font-bold truncate">
                    Rs{" "}
                    {branchDetailedData
                      .find((b) => b.branch === selectedBranch?.branchName)
                      ?.revenue.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
