"use client"

import React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

// Update the main tab paths to include discounts instead of branches in the mobile tabs

// Define main tab paths
export const MAIN_TAB_PATHS = ["/dashboard", "/reviews", "/discounts", "/notification"]

// Define menu pages (pages accessible from the sidebar menu)
export const MENU_PAGES = [
  "/branches", // Added branches to menu pages
  "/inbox",
  "/integration",
  "/reporting",
  "/metrics/active",
  "/metrics/past",
  "/help",
  "/settings",
  "/invite",
  "/admin/feature-flags", // Add feature flags page to menu pages
]

// Update PAGE_HIERARCHY to include Discounts and update Branches
export const PAGE_HIERARCHY = {
  "/dashboard": {
    parent: null,
    title: "Dashboard",
  },
  "/reviews": {
    parent: null,
    title: "Reviews",
  },
  "/discounts": {
    parent: null,
    title: "Discounts",
  },
  "/branches": {
    parent: "/dashboard", // Changed from null to make it a sub-page
    title: "Branches",
  },
  "/notification": {
    parent: null,
    title: "Notifications",
  },
  "/inbox": {
    parent: "/dashboard",
    title: "Inbox",
  },
  "/integration": {
    parent: "/dashboard",
    title: "Integration",
  },
  "/reporting": {
    parent: "/dashboard",
    title: "Reporting",
  },
  "/metrics/active": {
    parent: "/dashboard",
    title: "Active Metrics",
  },
  "/metrics/past": {
    parent: "/dashboard",
    title: "Past Metrics",
  },
  "/help": {
    parent: "/dashboard",
    title: "Help Center",
  },
  "/settings": {
    parent: "/dashboard",
    title: "Settings",
  },
  "/invite": {
    parent: "/dashboard",
    title: "Invite Teams",
  },
  "/admin/feature-flags": {
    parent: "/dashboard",
    title: "Feature Flags",
  },
}

type NavigationContextType = {
  activeTab: string
  setActiveTab: (tab: string) => void
  getPageTitle: (path: string) => string
  getParentPath: (path: string) => string | null
  handleNavigation: (path: string) => void
  handleBackNavigation: () => void
  isMainTab: (path: string) => boolean
  isMenuPage: (path: string) => boolean
  currentPath: string
  openMenu: () => void
  isMobile: boolean
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

// Update the NavigationProvider component
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<string>("/dashboard")
  const [currentPath, setCurrentPath] = useState<string>(pathname)
  const [isMobile, setIsMobile] = useState(false)

  // Update state when pathname changes
  useEffect(() => {
    setCurrentPath(pathname)

    if (MAIN_TAB_PATHS.includes(pathname)) {
      setActiveTab(pathname)
    }
  }, [pathname])

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Check if a path is a menu page
  const isMenuPage = (path: string) => MENU_PAGES.includes(path)

  // Check if a path is a main tab
  const isMainTab = (path: string) => MAIN_TAB_PATHS.includes(path)

  // Get the title for a page
  const getPageTitle = (path: string) => {
    return PAGE_HIERARCHY[path as keyof typeof PAGE_HIERARCHY]?.title || "Dashboard"
  }

  // Get the parent path for a page
  const getParentPath = (path: string) => {
    return PAGE_HIERARCHY[path as keyof typeof PAGE_HIERARCHY]?.parent || null
  }

  // Open the menu page
  const openMenu = () => {
    // Store current path as referrer for back button
    sessionStorage.setItem("menuReferrer", currentPath)
    router.push("/menu")
  }

  // Handle navigation
  const handleNavigation = (path: string) => {
    // If navigating to a menu page from a main tab, store the main tab as referrer
    if (isMenuPage(path) && isMainTab(currentPath)) {
      sessionStorage.setItem("menuReferrer", currentPath)
    }

    // If navigating to a main tab, update active tab
    if (isMainTab(path)) {
      setActiveTab(path)
    }

    // Navigate to the path
    router.push(path)
  }

  // Handle back navigation
  const handleBackNavigation = () => {
    // If we're on a menu page (not a main tab), go back to the menu
    if (isMenuPage(currentPath)) {
      router.push("/menu")
    } else {
      const parentPath = getParentPath(currentPath)
      if (parentPath) {
        router.push(parentPath)
      } else {
        router.push("/dashboard")
      }
    }
  }

  const handleNavigationMemoized = React.useCallback(handleNavigation, [
    currentPath,
    isMainTab,
    isMenuPage,
    router,
    setActiveTab,
  ])
  const handleBackNavigationMemoized = React.useCallback(handleBackNavigation, [
    currentPath,
    getParentPath,
    isMenuPage,
    router,
  ])

  const contextValue = React.useMemo<NavigationContextType>(
    () => ({
      activeTab,
      setActiveTab,
      getPageTitle,
      getParentPath,
      handleNavigation: handleNavigationMemoized,
      handleBackNavigation: handleBackNavigationMemoized,
      isMainTab,
      isMenuPage,
      currentPath,
      openMenu,
      isMobile,
    }),
    [activeTab, currentPath, isMobile, handleNavigationMemoized, handleBackNavigationMemoized],
  )

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}

// Consider splitting this large context into smaller ones:
// - RouteContext (for navigation-related functionality)
// - LayoutContext (for mobile/desktop detection)
// This would improve maintainability and reduce re-renders
