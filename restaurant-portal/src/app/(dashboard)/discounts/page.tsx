"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useDiscounts } from "@/contexts/discount-context";
import { VerifyTab } from "@/components/discounts/verify-discount/verify-tab-lazy";
import { ManageTab } from "@/components/discounts/manage-discount/manage-tab-lazy";
import { SkeletonStatCard } from "@/components/ui/skeleton-card";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { useRefresh } from "@/hooks/use-refresh"; // Updated import

// Create a wrapper component that handles the initial loading state
export default function DiscountsPageWrapper() {
  // Use state to track if the component has mounted
  const [hasMounted, setHasMounted] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Don't render anything until the component has mounted
  if (!hasMounted) {
    return null;
  }

  // Once mounted, render the actual component
  return <DiscountsPage />;
}

function DiscountsPage() {
  const searchParams = useSearchParams();
  const { isTabEnabled } = useFeatureFlags();

  // Determine which tabs are enabled
  const isVerifyEnabled = isTabEnabled("discounts", "verify");
  const isManageEnabled = isTabEnabled("discounts", "manage");

  // Set initial tab based on URL params and available tabs
  let initialTab = searchParams.get("tab") === "manage" ? "manage" : "verify";

  // If the initial tab is not enabled, switch to an enabled one
  if (initialTab === "verify" && !isVerifyEnabled && isManageEnabled) {
    initialTab = "manage";
  } else if (initialTab === "manage" && !isManageEnabled && isVerifyEnabled) {
    initialTab = "verify";
  }

  const [mainTab, setMainTab] = useState(initialTab);
  const isMobile = useIsMobile();
  const { discounts, refreshDiscounts } = useDiscounts();

  // Add a loading state for Manage tab only
  const [isManageTabLoading, setIsManageTabLoading] = useState(true);

  // Use our new refresh hook instead of the local state
  const { isRefreshing, refresh } = useRefresh({
    onRefresh: async () => {
      console.log("Discounts: Starting refresh");
      // Refresh discounts from the context
      await refreshDiscounts();

      // Dispatch events to child components
      window.dispatchEvent(new CustomEvent("discounts:refresh"));
      console.log("Discounts: Refresh event dispatched");

      return true;
    },
    refreshDuration: 800,
    // Don't show toasts from this component
    showToast: false,
  });

  // Load data for Manage tab only when it's selected
  useEffect(() => {
    if (mainTab === "manage" && isManageTabLoading) {
      const loadData = async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsManageTabLoading(false);
      };
      loadData();
    }
  }, [mainTab, isManageTabLoading]);

  // Listen for global refresh events
  useEffect(() => {
    const handleGlobalRefresh = async (event: Event) => {
      console.log("Discounts: Global refresh event received");
      // Get the manual flag from the event detail if available
      const customEvent = event as CustomEvent<{ manual?: boolean }>;
      const isManual = customEvent.detail?.manual ?? false;

      await refresh(isManual);
    };

    window.addEventListener("app:refresh", handleGlobalRefresh);

    return () => {
      window.removeEventListener("app:refresh", handleGlobalRefresh);
    };
  }, [refresh]);

  // If no tabs are enabled, show a message
  if (!isVerifyEnabled && !isManageEnabled) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Feature Unavailable</h2>
          <p className="text-muted-foreground">
            The discounts feature is currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  // Create a skeleton that exactly matches the layout of the manage tab
  const renderManageTabSkeleton = () => {
    return (
      <div className="space-y-4">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonStatCard key={`stat-${index}`} />
          ))}
        </div>

        {/* Filter Bar Skeleton */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Action Bar Skeleton */}
        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="h-9 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Discount Cards Skeleton */}
        <div className="pt-4">
          <div
            className={cn(
              isMobile
                ? "grid grid-cols-1 gap-4"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            )}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={`card-${index}`}
                className="overflow-hidden border border-gray-200"
              >
                {/* Image Section */}
                <div className="h-48 bg-gray-200 animate-pulse"></div>

                {/* Content Section */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3"></div>

                  <div className="h-px w-full bg-gray-200 my-3"></div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full min-w-0 overflow-x-hidden">
      {/* Main Tabs - Verify and Manage */}
      <Tabs
        defaultValue={mainTab}
        onValueChange={setMainTab}
        className="w-full"
      >
        <div
          className="fixed top-16 left-0 right-0 z-20 bg-white border-b w-full"
          style={{
            transition: "all 0.3s ease-in-out",
            left: isMobile ? "0" : "var(--sidebar-width)",
            width: isMobile ? "100%" : "calc(100% - var(--sidebar-width))",
          }}
        >
          <div className="w-full overflow-hidden">
            <div className="bg-white w-full h-12 p-0 pl-4 md:pl-6 flex items-center overflow-x-auto hide-scrollbar">
              <TabsList className="bg-transparent p-0 h-full">
                {isVerifyEnabled && (
                  <TabsTrigger
                    value="verify"
                    className={cn(
                      "h-full px-4 text-sm font-medium whitespace-nowrap rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none",
                      mainTab !== "verify" && "text-muted-foreground"
                    )}
                  >
                    Verify Discount
                  </TabsTrigger>
                )}
                {isManageEnabled && (
                  <TabsTrigger
                    value="manage"
                    className={cn(
                      "h-full px-4 text-sm font-medium whitespace-nowrap rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none",
                      mainTab !== "manage" && "text-muted-foreground"
                    )}
                  >
                    Manage Discounts
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          </div>
        </div>

        {/* Content area with padding to account for fixed tabs */}
        {/* Verify Discount Tab Content - No loading state */}
        {isVerifyEnabled && (
          <TabsContent
            value="verify"
            className="space-y-6 pt-16 pb-8 px-2 sm:px-4 w-full min-w-0 max-w-full"
          >
            <VerifyTab selectedBranch={null} />
          </TabsContent>
        )}

        {/* Manage Discounts Tab Content - With loading states */}
        {isManageEnabled && (
          <TabsContent
            value="manage"
            className="space-y-4 pt-16 pb-32 md:pb-8 px-2 sm:px-4 w-full min-w-0 max-w-full"
          >
            {mainTab === "manage" && (isManageTabLoading || isRefreshing) ? (
              renderManageTabSkeleton()
            ) : (
              <ManageTab discounts={discounts} />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
