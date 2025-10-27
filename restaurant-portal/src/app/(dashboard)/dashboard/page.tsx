"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBranch } from "@/contexts/branch-context";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh";
import { DashboardTabsHeader } from "@/components/dashboard/dashboard-tabs-header";
import { MediaViewerModal } from "@/components/dashboard/media-viewer-modal-lazy";
// Wrap the dashboard content with ErrorBoundary
import ErrorBoundary from "@/components/error-boundary";
import { useDashboardDataWithQuery } from "@/hooks/use-dashboard-data-with-query";
import { featuredReviews, getReviewQuestions } from "@/utils/review-data";
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab";
import { BranchesTab } from "@/components/dashboard/tabs/branches-tab";
import { ReviewsTab } from "@/components/dashboard/tabs/reviews-tab";
import { CompetitionTab } from "@/components/dashboard/tabs/competition-tab";
import Loader from "@/components/loader";
import { defaultTimeRanges } from "@/config/time-ranges";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  const [windowWidth, setWindowWidth] = useState(0);
  const { selectedBranch, displayBranchName, hasSingleBranch } = useBranch();

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);

  const {
    branchStatsData,
    metricsData,
    reviewsData,
    engagementData,
    branchDetailedData,
    breakdownData,
    isLoading,
    isRefreshing,
    refreshData,
    timeRange,
    updateTimeRange,
  } = useDashboardDataWithQuery(defaultTimeRanges[2], selectedBranch);

  const { pullDistance, isRefreshing: isPulling } = usePullToRefresh({
    onRefresh: async () => {
      console.log("Dashboard: Pull-to-refresh triggered");
      await refreshData();
    },
    pullDownThreshold: 80,
  });

  // useEffect(() => {
  //   if (selectedBranch?.branchName && activeTab === "branches") {
  //     setActiveTab("overview");
  //   }
  // }, [selectedBranch?.branchName, activeTab]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpenMedia = useCallback(
    (
      media: Array<{ type: "image" | "video"; url: string }>,
      initialIndex = 0
    ) => {
      if (media && media.length > 0) {
        setSelectedMedia(media);
        setInitialMediaIndex(initialIndex);
        setIsMediaModalOpen(true);
      }
    },
    []
  );

  const filteredReviews = useMemo(() => {
    if (!selectedBranch) {
      const categories = [
        "Most Liked",
        "Most Disliked",
        "Highest Bill",
        "Most Saved",
        "Most Shared",
      ];

      return categories.map((category) => {
        const reviewsInCategory = featuredReviews.filter(
          (review) => review.type === category
        );

        // Sort by the relevant metric based on category
        if (category === "Most Liked") {
          reviewsInCategory.sort((a, b) => b.likes - a.likes);
        } else if (category === "Most Disliked") {
          reviewsInCategory.sort((a, b) => b.dislikes - a.dislikes);
        } else if (category === "Highest Bill") {
          reviewsInCategory.sort((a, b) => b.totalBill - a.totalBill);
        } else if (category === "Most Saved") {
          reviewsInCategory.sort((a, b) => b.saves - a.saves);
        } else if (category === "Most Shared") {
          reviewsInCategory.sort((a, b) => b.shares - a.shares);
        }

        // Return the top review from this category
        return reviewsInCategory[0];
      });
    }

    return featuredReviews.filter(
      (review) => review.branch === selectedBranch?.branchName
    );
  }, [selectedBranch]);

  useEffect(() => {
    const handleGlobalRefresh = async () => {
      console.log("Dashboard: Global refresh event received");
      if (refreshData) {
        await refreshData();
      }
    };

    window.addEventListener("app:refresh", handleGlobalRefresh);

    return () => {
      window.removeEventListener("app:refresh", handleGlobalRefresh);
    };
  }, [refreshData]);

  console.log({ branchDetailedData });

  return (
    <>
      {isMobile && (
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isPulling || isRefreshing}
          threshold={80}
        />
      )}

      <DashboardTabsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedBranch={selectedBranch}
        hasSingleBranch={hasSingleBranch}
        isMobile={isMobile}
      />

      <MediaViewerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        media={selectedMedia}
        initialIndex={initialMediaIndex}
      />

      <div className="pt-16 w-full max-w-full overflow-x-hidden bg-gray-50 px-0">
        <ErrorBoundary componentName="Dashboard Content">
          {activeTab === "overview" && (
            <OverviewTab
              timeRange={timeRange}
              setTimeRange={updateTimeRange}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              refreshData={refreshData}
              isMobile={isMobile}
              selectedBranch={selectedBranch}
              displayBranchName={displayBranchName}
              metricsData={metricsData}
              reviewsData={reviewsData}
              windowWidth={windowWidth}
              branchStatsData={branchStatsData}
            />
          )}

          {activeTab === "branches" && (
            <BranchesTab
              timeRange={timeRange}
              setTimeRange={updateTimeRange}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              refreshData={refreshData}
              isMobile={isMobile}
              selectedBranch={selectedBranch}
              displayBranchName={displayBranchName}
              breakdownData={breakdownData}
              branchDetailedData={branchDetailedData}
            />
          )}

          {activeTab === "reviews" && (
            <ReviewsTab
              timeRange={timeRange}
              setTimeRange={updateTimeRange}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              refreshData={refreshData}
              isMobile={isMobile}
              selectedBranch={selectedBranch}
              displayBranchName={displayBranchName}
              filteredReviews={filteredReviews}
              reviewQuestions={getReviewQuestions(selectedBranch?.branchName)}
              handleOpenMedia={handleOpenMedia}
            />
          )}

          {/* Competition Tab Content */}
          {activeTab === "competition" && (
            <CompetitionTab isLoading={isLoading} isRefreshing={isRefreshing} />
          )}

          <Loader loading={isLoading || isRefreshing} />
        </ErrorBoundary>
      </div>
    </>
  );
}
