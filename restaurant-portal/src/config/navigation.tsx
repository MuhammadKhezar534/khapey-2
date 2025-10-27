import { LayoutDashboard, Star, Bell, Percent, BarChart3, Users, Settings, CreditCard, Flag } from "lucide-react"
import type { ReactNode } from "react"

export interface NavItem {
  title: string
  href: string
  icon: ReactNode
  badge?: number
  children?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigationConfig: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        title: "Reviews",
        href: "/reviews",
        icon: <Star className="h-4 w-4" />,
      },
      {
        title: "Notification",
        href: "/notification",
        icon: <Bell className="h-4 w-4" />,
        badge: 7,
      },
      {
        title: "Discounts",
        href: "/discounts",
        icon: <Percent className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        title: "Reporting",
        href: "/reporting/discounts", // Update to point directly to discounts
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        title: "Payments",
        href: "/payments",
        icon: <CreditCard className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Invite teams",
        href: "/invite",
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: <Settings className="h-4 w-4" />,
      },
      {
        title: "Feature Flags",
        href: "/admin/feature-flags",
        icon: <Flag className="h-4 w-4" />,
      },
    ],
  },
]

// Items that are already in the mobile navigation tabs
export const mobileTabPaths = ["/dashboard", "/reviews", "/discounts", "/notification"]

// Filter out items that are already in mobile tabs
export function filterMobileTabItems(items: NavItem[], isFullPage: boolean): NavItem[] {
  if (isFullPage) {
    return items.filter((item) => !mobileTabPaths.includes(item.href))
  }
  return items
}
