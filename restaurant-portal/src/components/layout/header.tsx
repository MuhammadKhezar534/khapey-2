"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  X,
  Check,
  ArrowLeft,
  RefreshCw,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigation } from "@/contexts/navigation-context";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Branch, useBranch } from "@/contexts/branch-context";
import { ThemeToggle } from "@/components/theme-toggle";

// Add this import at the top of the file
import { useRefresh } from "@/hooks/use-refresh";
import Loader from "../loader";

// Helper function to get discount title by ID
function getDiscountTitleById(id: string | string[]) {
  const discountTitles: Record<string, string> = {
    "loyalty-1": "Regular Customer Rewards",
    "loyalty-2": "VIP Member Benefits",
    "percent-1": "Weekend Special",
    "percent-2": "Happy Hour Discount",
    "fixed-1": "Lunch Combo Deals",
    "fixed-2": "Holiday Special Menu",
    "bank-1": "HBL Card Offer",
    "bank-2": "MCB Weekend Offer",
  };

  const discountId = Array.isArray(id) ? id[0] : id[0];
  return discountTitles[discountId] || "Discount Report";
}

// Update the refreshData prop type to be more flexible
interface HeaderProps {
  onMenuClick?: () => void;
  refreshData?: () => Promise<void> | void;
}

export function Header({ refreshData }: HeaderProps) {
  // Replace the existing isRefreshing state and handleRefresh function with:
  const { isRefreshing, refresh } = useRefresh({
    onRefresh: async () => {
      console.log("Header: Starting refresh");
      // Call the component-specific refresh function if provided
      if (refreshData) {
        const result = refreshData();
        if (result instanceof Promise) {
          await result;
        }
      }
      console.log("Header: Refresh completed");
    },
    refreshDuration: 800,
    showToast: true,
  });

  const handleRefresh = () => {
    if (!refreshData || isRefreshing) return;
    refresh(true); // Pass true to indicate this is a manual refresh
  };

  const { user, logout } = useAuth();

  const {
    selectedBranch,
    setSelectedBranch,
    displayBranchName,
    hasSingleBranch,
    actualBranches,
    isLoading,
  } = useBranch();

  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  const headerTitle = pathname.startsWith("/reporting")
    ? "Reporting"
    : pathname.startsWith("/payments")
    ? "Payments"
    : pathname.startsWith("/settings")
    ? "Settings"
    : pathname.startsWith("/invite")
    ? "Invite Teams"
    : pathname.startsWith("/admin/feature-flags")
    ? "Feature Flags"
    : "Dashboard";

  const {
    getPageTitle,
    isMainTab,
    handleBackNavigation: originalHandleBackNavigation,
    currentPath,
    isMenuPage,
    getParentPath,
  } = useNavigation();

  const isDiscountsPage = pathname.includes("/discounts");
  const isDiscountDetailsPage =
    pathname.startsWith("/reporting/") && params.discountId;
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (isDiscountsPage && selectedBranch) {
      // setSelectedBranch("");
    }

    let resizeObserver: ResizeObserver | null = null;

    const observeContent = () => {
      if (contentRef.current) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            setContentHeight(entry.contentRect.height);
          }
        });

        resizeObserver.observe(contentRef.current);
      }
    };

    if (sheetOpen) {
      observeContent();
    } else {
      setContentHeight(null); // Reset height when sheet is closed
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [
    isDiscountsPage,
    selectedBranch,
    setSelectedBranch,
    contentRef,
    sheetOpen,
  ]);

  if (pathname === "/menu") {
    return null;
  }

  const shouldShowBackButton = isMobile && !isMainTab(currentPath);

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setSheetOpen(false);
  };

  const handleBackNavigation = () => {
    if (isMenuPage(currentPath)) {
      router.push("/menu");
    } else if (
      pathname.startsWith("/reporting") ||
      pathname.startsWith("/payments") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/invite") ||
      pathname.startsWith("/admin")
    ) {
      router.push("/menu");
    } else {
      const parentPath = getParentPath(currentPath);
      if (parentPath) {
        router.push(parentPath);
      } else {
        router.push("/dashboard");
      }
    }
  };

  // Hide branch selector on feature flags page
  const shouldShowBranchSelector =
    !pathname.startsWith("/admin/feature-flags") && !isDiscountsPage;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 flex h-16 items-center justify-between border-b bg-white px-2 md:px-6 left-0 md:left-[var(--sidebar-width)]",
        // Only add shadow when not on pages that have their own tab headers with shadows
        !(
          pathname.startsWith("/dashboard") ||
          pathname.includes("/reporting") ||
          pathname.includes("/reporting-sales")
        ) && "shadow-sm"
      )}
    >
      <div className="flex items-center gap-2 md:gap-4">
        {isDiscountDetailsPage ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Reports</span>
            </Button>
            <h1 className="text-lg font-semibold">
              {getDiscountTitleById(params.discountId)}
            </h1>
          </div>
        ) : shouldShowBackButton ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-lg font-semibold">{headerTitle}</h1>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {hasSingleBranch || isDiscountsPage || !shouldShowBranchSelector ? (
              <div
                className={cn(
                  "text-sm font-medium",
                  isDiscountsPage && "text-muted-foreground"
                )}
              >
                {isDiscountsPage
                  ? "All branches"
                  : !shouldShowBranchSelector
                  ? ""
                  : displayBranchName}
              </div>
            ) : isMobile ? (
              <>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setSheetOpen(true)}
                >
                  <span>{displayBranchName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetContent
                    side="bottom"
                    className="p-0 max-h-[80vh] rounded-t-[12px] overflow-hidden flex flex-col"
                    style={{ height: "auto" }}
                  >
                    <div className="flex flex-col h-full bg-background rounded-t-[12px]">
                      <div className="px-4 py-3 border-b sticky top-0 bg-background z-10">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSheetOpen(false)}
                            className="rounded-full h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                          </Button>
                          <div className="text-center font-semibold flex-grow">
                            Select Branch
                          </div>
                          <div className="w-8"></div>
                        </div>
                      </div>
                      <div
                        className="overflow-auto hide-scrollbar"
                        ref={contentRef}
                        style={{
                          msOverflowStyle: "none",
                          scrollbarWidth: "none",
                          WebkitOverflowScrolling: "touch",
                        }}
                      >
                        <div className="py-2">
                          {actualBranches?.map((branch) => (
                            <Button
                              key={branch?.branchName}
                              variant="ghost"
                              className={cn(
                                "flex w-full justify-between px-5 py-6 text-left font-normal",
                                (branch?.branchName === "All branches" &&
                                  !selectedBranch?.branchName) ||
                                  branch?.branchName ===
                                    selectedBranch?.branchName
                                  ? "bg-muted font-medium"
                                  : ""
                              )}
                              onClick={() => handleBranchSelect(branch)}
                            >
                              {branch?.branchName}
                              {((branch?.branchName === "All branches" &&
                                !selectedBranch?.branchName) ||
                                branch?.branchName ===
                                  selectedBranch?.branchName) && (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : actualBranches.length <= 5 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <span>{displayBranchName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>Select Branch</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {actualBranches.map((branch) => (
                    <DropdownMenuItem
                      key={branch?.branchName}
                      onClick={() => handleBranchSelect(branch)}
                      className={cn(
                        "flex justify-between",
                        (branch?.branchName === "All branches" &&
                          !selectedBranch?.branchName) ||
                          branch?.branchName === selectedBranch?.branchName
                          ? "bg-muted font-medium"
                          : ""
                      )}
                    >
                      {branch?.branchName}
                      {((branch?.branchName === "All branches" &&
                        !selectedBranch?.branchName) ||
                        branch?.branchName === selectedBranch?.branchName) && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setSheetOpen(true)}
                >
                  <span>{displayBranchName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetContent side="right" className="w-[300px] p-0">
                    <div className="flex flex-col h-full">
                      <div className="px-4 py-3 border-b">
                        <div className="font-semibold">Select Branch</div>
                      </div>
                      <div
                        className="flex-grow overflow-auto hide-scrollbar"
                        style={{
                          msOverflowStyle: "none",
                          scrollbarWidth: "none",
                          WebkitOverflowScrolling: "touch",
                        }}
                      >
                        <div className="py-2">
                          {actualBranches.map((branch) => (
                            <Button
                              key={branch?.branchName}
                              variant="ghost"
                              className={cn(
                                "flex w-full justify-between px-4 py-2 text-left font-normal",
                                (branch?.branchName === "All branches" &&
                                  !selectedBranch?.branchName) ||
                                  branch?.branchName ===
                                    selectedBranch?.branchName
                                  ? "bg-muted font-medium"
                                  : ""
                              )}
                              onClick={() => handleBranchSelect(branch)}
                            >
                              {branch?.branchName}
                              {((branch?.branchName === "All branches" &&
                                !selectedBranch?.branchName) ||
                                branch?.branchName ===
                                  selectedBranch?.branchName) && (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {refreshData && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8"
            aria-label="Refresh data"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        )}
        <ThemeToggle />
        <ProfileDropdown user={user} logout={logout} />
      </div>

      <Loader loading={isLoading} />
    </header>
  );
}

interface ProfileDropdownProps {
  user: {
    phoneNumber: string;
    name?: string;
  } | null;
  logout: () => void;
}

function ProfileDropdown({ user, logout }: ProfileDropdownProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const profileSheetRef = useRef<HTMLDivElement>(null);

  // For mobile, show a sheet instead of dropdown
  if (isMobile) {
    return (
      <>
        <Avatar
          className="h-8 w-8 cursor-pointer"
          onClick={() => setSheetOpen(true)}
        >
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="bottom"
            className="p-0 max-h-[80vh] rounded-t-[12px] overflow-hidden flex flex-col"
            style={{ height: "auto" }}
          >
            <div className="flex flex-col h-full bg-background rounded-t-[12px]">
              <div className="px-4 py-3 border-b sticky top-0 bg-background z-10">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSheetOpen(false)}
                    className="rounded-full h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                  <div className="text-center font-semibold flex-grow">
                    Profile
                  </div>
                  <div className="w-8"></div>
                </div>
              </div>
              <div
                className="overflow-auto hide-scrollbar"
                ref={profileSheetRef}
                style={{
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div className="p-4 flex flex-col items-center">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage
                      src="/placeholder.svg?height=64&width=64"
                      alt="User"
                    />
                    <AvatarFallback className="text-xl">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-lg">
                    {user?.name || "User"}
                  </h3>
                  {user?.phoneNumber && (
                    <p className="text-sm text-muted-foreground">
                      {user.phoneNumber}
                    </p>
                  )}
                </div>
                <div className="py-2">
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start px-5 py-6 text-left font-normal"
                    onClick={() => {
                      router.push("/settings");
                      setSheetOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex w-full justify-start px-5 py-6 text-left font-normal text-red-600"
                    onClick={() => {
                      logout();
                      setSheetOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // For desktop, keep the dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={5}>
        <DropdownMenuLabel>
          {user?.name || "User"}
          {user?.phoneNumber && (
            <p className="text-xs text-muted-foreground mt-1">
              {user.phoneNumber}
            </p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push("/settings")}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-red-600"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
