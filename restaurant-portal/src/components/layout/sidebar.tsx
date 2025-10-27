"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useNavigation } from "@/contexts/navigation-context"
import { useRouter, usePathname } from "next/navigation"
import { useFeatureFlags } from "@/hooks/use-feature-flags"

// Import the navigation config at the top of the file
import { navigationConfig, filterMobileTabItems } from "@/config/navigation"
import type { NavItem as NavItemType } from "@/config/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
  isMobile?: boolean
  isFullPage?: boolean
  expanded?: boolean
  onExpandToggle?: (expanded: boolean) => void
  largeMobileButtons?: boolean
}

export function Sidebar({
  className,
  onClose,
  isMobile = false,
  isFullPage = false,
  expanded: externalExpanded,
  onExpandToggle,
  largeMobileButtons = false,
  ...props
}: SidebarProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [internalExpanded, setInternalExpanded] = useState(true)
  const { handleNavigation, currentPath, isMenuPage } = useNavigation()
  const router = useRouter()
  const pathname = usePathname()
  const { isNavigationEnabled } = useFeatureFlags()

  // Use either external or internal expanded state
  const expanded = externalExpanded !== undefined ? externalExpanded : internalExpanded

  // Toggle sidebar expanded state
  const toggleSidebar = () => {
    const newExpandedState = !expanded
    if (onExpandToggle) {
      onExpandToggle(newExpandedState)
    } else {
      setInternalExpanded(newExpandedState)
    }
  }

  // Store the expanded state in localStorage for persistence
  useEffect(() => {
    if (!isMobile && !isFullPage) {
      localStorage.setItem("sidebar-expanded", expanded ? "true" : "false")
    }
  }, [expanded, isMobile, isFullPage])

  // Load the expanded state from localStorage on initial render
  useEffect(() => {
    if (!isMobile && !isFullPage && externalExpanded === undefined) {
      const savedExpanded = localStorage.getItem("sidebar-expanded")
      if (savedExpanded !== null) {
        setInternalExpanded(savedExpanded === "true")
      }
    }
  }, [isMobile, isFullPage, externalExpanded])

  // Set a data attribute on the root element for CSS to use
  useEffect(() => {
    if (!isMobile && !isFullPage) {
      document.documentElement.setAttribute("data-sidebar-collapsed", expanded ? "false" : "true")
    }
  }, [expanded, isMobile, isFullPage])

  // Custom navigation handler for sidebar items
  const handleSidebarNavigation = (path: string) => {
    // If we're in the menu page and navigating to a menu item
    if (pathname === "/menu") {
      // Navigate directly to the path
      router.push(path)
      return
    }

    // Use the regular navigation handler
    handleNavigation(path)

    // Close the sidebar if needed
    if (onClose) {
      onClose()
    }
  }

  return (
    <aside
      className={cn(
        "h-full bg-white transition-all duration-300 ease-in-out overflow-hidden",
        isFullPage ? "w-full" : "fixed left-0 top-0 z-30 border-r",
        !isMobile && !isFullPage && !expanded ? "w-[4.5rem]" : "w-64",
        className,
      )}
      onMouseEnter={() => !isMobile && !isFullPage && setIsHovering(true)}
      onMouseLeave={() => !isMobile && !isFullPage && setIsHovering(false)}
      {...props}
    >
      {/* Collapse/Expand Toggle Button */}
      {!isMobile && !isFullPage && (
        <button
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-md transition-opacity z-40",
            isHovering ? "opacity-100" : "opacity-0",
          )}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      )}

      {!isFullPage && (
        <div
          className={cn("flex h-16 items-center border-b", expanded ? "justify-between px-6" : "justify-center px-2")}
        >
          <button onClick={() => handleSidebarNavigation("/dashboard")} className="flex items-center">
            {expanded ? (
              <Image
                src="/images/khapey-logo-new.png"
                alt="Khapey Logo"
                width={97}
                height={32}
                className="h-auto max-w-[97px]"
              />
            ) : (
              <Image
                src="/images/khapey-icon.png"
                alt="Khapey Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            )}
          </button>
          {isMobile && onClose && expanded && (
            <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      )}
      <div
        className={cn("hide-scrollbar", isFullPage ? "h-full overflow-auto" : "h-[calc(100vh-4rem)] overflow-auto")}
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {navigationConfig.map((section) => {
          // Filter items based on feature flags and mobile tabs
          const filteredItems = filterMobileTabItems(section.items, isFullPage).filter((item) => {
            // Extract the route ID from the href (e.g., "/dashboard" -> "dashboard")
            const routeId = item.href.split("/")[1] || item.href
            return isNavigationEnabled(routeId)
          })

          if (filteredItems.length === 0) return null

          return (
            <div key={section.title} className={isFullPage ? "py-2" : "py-2"}>
              {expanded ? (
                <h2
                  className={cn(
                    "font-semibold tracking-tight",
                    isFullPage ? "px-4 py-2 text-base" : "px-4 py-2 text-sm text-gray-500 uppercase",
                  )}
                >
                  {section.title}
                </h2>
              ) : (
                <div className="mx-2 my-3 border-t border-gray-200"></div>
              )}
              <div>
                {filteredItems.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    isActive={currentPath === item.href}
                    onClick={() => handleSidebarNavigation(item.href)}
                    isFullPage={isFullPage}
                    expanded={expanded}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function NavItem({
  item,
  isActive,
  onClick,
  isFullPage = false,
  expanded = true,
}: {
  item: NavItemType
  isActive: boolean
  onClick: () => void
  isFullPage?: boolean
  expanded?: boolean
}) {
  const buttonClasses = cn(
    "w-full justify-start rounded-none",
    isActive ? (isFullPage ? "bg-gray-100" : "bg-gray-100") : "",
    isFullPage
      ? "px-4 py-5 text-base border-0 hover:bg-gray-50 font-normal"
      : expanded
        ? "px-4 py-3 text-sm hover:bg-gray-50 font-normal"
        : "px-0 py-3 flex items-center justify-center hover:bg-gray-50 font-normal h-12",
  )

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={buttonClasses}
      onClick={onClick}
      title={!expanded ? item.title : undefined}
    >
      <div className={cn("relative flex items-center", expanded ? "w-full" : "w-auto")}>
        <div className={cn("relative", !expanded && "flex items-center justify-center")}>
          {item.icon}
          {!expanded && item.badge && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {item.badge}
            </span>
          )}
        </div>
        {expanded && (
          <>
            <span className="ml-3 truncate">{item.title}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {item.badge}
              </span>
            )}
          </>
        )}
      </div>
    </Button>
  )
}
