"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

export function ReportTabsHeader({ isMobile }: { isMobile: boolean }) {
  const pathname = usePathname();
  const { isTabEnabled } = useFeatureFlags();

  // Determine active tab based on the current URL path
  const isDiscountsActive =
    pathname.includes("/reporting/discounts") || pathname === "/reporting";
  const isSalesActive = pathname.includes("/reporting-sales");

  // Check if we're on a nested discount detail page (not the main discounts page)
  const isDiscountDetailPage =
    pathname.includes("/reporting/discounts/") &&
    pathname !== "/reporting/discounts";

  // Add debugging
  console.log("ReportTabsHeader rendering with pathname:", pathname);
  console.log("isDiscountsActive:", isDiscountsActive);
  console.log("isSalesActive:", isSalesActive);
  console.log("isDiscountDetailPage:", isDiscountDetailPage);

  // If we're on a discount detail page, don't render the tabs
  if (isDiscountDetailPage) {
    return null;
  }

  return (
    <div
      className="fixed top-16 left-0 right-0 z-20 bg-white border-b w-full shadow-sm"
      style={{
        transition: "left 0.3s ease-in-out, width 0.3s ease-in-out",
        left: isMobile ? "0" : "var(--sidebar-width)",
        width: isMobile ? "100%" : "calc(100% - var(--sidebar-width))",
      }}
    >
      <div className="content-padding bg-white w-full h-12 flex items-center overflow-x-auto hide-scrollbar">
        {isTabEnabled("reporting", "discounts") && (
          <Link
            href="/reporting/discounts"
            className={cn(
              "h-full flex items-center px-2 md:px-4 text-sm font-medium whitespace-nowrap",
              isDiscountsActive
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            Discounts
          </Link>
        )}
        {isTabEnabled("reporting", "sales") && (
          <Link
            href="/reporting-sales"
            className={cn(
              "h-full flex items-center px-2 md:px-4 text-sm font-medium whitespace-nowrap",
              isSalesActive
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            Sales
          </Link>
        )}
      </div>
    </div>
  );
}
