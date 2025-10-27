"use client";

import { cn } from "@/lib/utils";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { Branch } from "@/contexts/branch-context";

interface DashboardTabsHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedBranch: Branch;
  hasSingleBranch: boolean;
  isMobile: boolean;
}

export function DashboardTabsHeader({
  activeTab,
  setActiveTab,
  selectedBranch,
  hasSingleBranch,
  isMobile,
}: DashboardTabsHeaderProps) {
  const { isTabEnabled } = useFeatureFlags();

  return (
    <div
      className="fixed top-16 left-0 right-0 z-20 bg-white border-b w-full shadow-sm"
      style={{
        transition: "all 0.3s ease-in-out",
        left: isMobile ? "0" : "var(--sidebar-width)",
        width: isMobile ? "100%" : "calc(100% - var(--sidebar-width))",
      }}
    >
      <div className="w-full overflow-hidden">
        <div className="content-padding bg-white w-full h-12 p-0 flex items-center overflow-x-auto hide-scrollbar">
          {isTabEnabled("dashboard", "overview") && (
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "h-full px-2 md:px-4 text-sm font-medium whitespace-nowrap",
                activeTab === "overview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Overview
            </button>
          )}

          {/* Only show the Branches tab when there are multiple branches and no branch is selected */}

          {/* selectedBranch?.branchName === "All branches" &&
            !hasSingleBranch && */}
          {isTabEnabled("dashboard", "branches") && (
            <button
              onClick={() => setActiveTab("branches")}
              className={cn(
                "h-full px-2 md:px-4 text-sm font-medium whitespace-nowrap",
                activeTab === "branches"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Branches
            </button>
          )}

          {isTabEnabled("dashboard", "reviews") && (
            <button
              onClick={() => setActiveTab("reviews")}
              className={cn(
                "h-full px-2 md:px-4 text-sm font-medium whitespace-nowrap",
                activeTab === "reviews"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Reviews
            </button>
          )}

          {isTabEnabled("dashboard", "competition") && (
            <button
              onClick={() => setActiveTab("competition")}
              className={cn(
                "h-full px-2 md:px-4 text-sm font-medium whitespace-nowrap",
                activeTab === "competition"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Competition
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
