"use client";

import { TimeRangeSelector } from "@/components/dashboard/time-range-selector";
import { FeaturedReviews } from "@/components/dashboard/featured-reviews";
import { ReviewQuestionsTable } from "@/components/dashboard/review-questions-table";
import { Branch } from "@/contexts/branch-context";
import { TimeRangeOption } from "@/config/time-ranges";

interface ReviewsTabProps {
  timeRange: TimeRangeOption;
  setTimeRange: (range: TimeRangeOption) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshData: () => void;
  isMobile: boolean;
  selectedBranch: Branch;
  displayBranchName: string;
  filteredReviews: any[];
  reviewQuestions: any[];
  handleOpenMedia: (
    media: Array<{ type: "image" | "video"; url: string }>,
    initialIndex?: number
  ) => void;
}

export function ReviewsTab({
  timeRange,
  setTimeRange,
  isLoading,
  isRefreshing,
  refreshData,
  isMobile,
  selectedBranch,
  displayBranchName,
  filteredReviews,
  reviewQuestions,
  handleOpenMedia,
}: ReviewsTabProps) {
  // Combined loading state to show skeletons
  const showSkeletons = isLoading || isRefreshing;

  return (
    <div className="space-y-6 pt-4 pb-8 px-0 w-full max-w-full overflow-x-hidden box-border">
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
            ? `${displayBranchName} Reviews`
            : "All Reviews"
        }
      />

      {/* Featured Reviews */}
      <FeaturedReviews
        reviews={filteredReviews}
        isLoading={showSkeletons}
        isRefreshing={isRefreshing}
        selectedBranch={selectedBranch?.branchName}
        displayBranchName={displayBranchName}
        handleOpenMedia={handleOpenMedia}
      />

      {/* Questions and Answers Table */}
      <ReviewQuestionsTable
        questions={reviewQuestions}
        isLoading={showSkeletons}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
