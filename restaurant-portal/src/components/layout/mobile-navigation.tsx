"use client";

import type React from "react";
import { LayoutDashboard, Star, Percent, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation, MAIN_TAB_PATHS } from "@/contexts/navigation-context";
import { usePathname } from "next/navigation";
// Import the branch context and feature flags
import { useBranch } from "@/contexts/branch-context";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

export function MobileNavigation() {
  const { activeTab, handleNavigation, openMenu, isMenuPage, currentPath } =
    useNavigation();
  const pathname = usePathname();
  // Add hasSingleBranch to the branch context destructuring
  const { selectedBranch, displayBranchName, hasSingleBranch } = useBranch();
  const { isNavigationEnabled } = useFeatureFlags();

  // Hide the navigation when on a menu page or the menu itself
  if (
    isMenuPage(pathname) ||
    pathname === "/menu" ||
    pathname.startsWith("/reporting") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/invite")
  ) {
    return null;
  }

  // Define mobile nav items
  const allMobileNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      id: "dashboard",
    },
    {
      title: "Reviews",
      href: "/reviews",
      icon: Star,
      id: "reviews",
    },
    {
      title: "Discounts",
      href: "/discounts",
      icon: Percent,
      id: "discounts",
    },
    {
      title: "Notification",
      href: "/notification",
      icon: Bell,
      id: "notification",
      badge: 7,
    },
    {
      title: "Menu",
      href: "#menu",
      icon: Menu,
      id: "menu",
    },
  ];

  // Filter mobile nav items based on feature flags
  const mobileNavItems = allMobileNavItems.filter((item) => {
    // Always show the menu button
    if (item.id === "menu") return true;
    // Check if the navigation item is enabled
    return isNavigationEnabled(item.id);
  });

  const handleItemClick = (href: string, index: number) => {
    if (href === "#menu") {
      // Menu tab
      openMenu();
    } else if (MAIN_TAB_PATHS.includes(href)) {
      handleNavigation(href);
    }
  };

  return (
    <div
      id="mobile-navigation"
      className="fixed bottom-0 left-0 z-40 w-full border-t bg-white md:hidden"
    >
      <div className="flex h-16 items-center justify-around">
        {mobileNavItems.map((item, index) => (
          <MobileNavItem
            key={item.href + index}
            item={item}
            index={index}
            isActive={
              item.href === "#menu"
                ? pathname === "/menu"
                : item.href === activeTab
            }
            onClick={() => handleItemClick(item.href, index)}
          />
        ))}
      </div>
    </div>
  );
}

function MobileNavItem({
  item,
  index,
  isActive,
  onClick,
}: {
  item: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  };
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  // Common styles for both button and link
  const commonStyles = "flex flex-col items-center justify-center w-16 h-16";
  const textStyles = "mt-1 text-xs";
  const iconContainerStyles =
    "relative flex items-center justify-center h-6 w-6";
  const badgeStyles =
    "absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white";

  return (
    <button
      onClick={onClick}
      className={cn(
        commonStyles,
        isActive ? "text-[#0099e5]" : "text-gray-500"
      )}
    >
      <div className={iconContainerStyles}>
        <Icon className="h-6 w-6" />
        {item.badge && <span className={badgeStyles}>{item.badge}</span>}
      </div>
      <span className={textStyles}>{item.title}</span>
    </button>
  );
}
