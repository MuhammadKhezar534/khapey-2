"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, ChevronDown, ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFeatureFlags } from "@/hooks/use-feature-flags"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Define the feature flag structure
type FeatureFlagItem = {
  id: string
  title: string
  type: "navigation" | "tabs" | "features" | "permissions"
  parentId?: string
  children?: FeatureFlagItem[]
}

export function FeatureFlagAdmin() {
  const {
    isNavigationEnabled,
    isTabEnabled,
    isFeatureEnabled,
    hasPermission,
    setFeatureOverride,
    resetFeatureOverrides,
    refreshFlags,
    isLoading: flagsLoading,
  } = useFeatureFlags()

  // Local state to track UI toggle states
  const [flagsState, setFlagsState] = useState<Record<string, boolean>>({})
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const isMobile = useIsMobile()

  // Define the hierarchical feature flag structure
  const featureFlags: FeatureFlagItem[] = [
    {
      id: "navigation",
      title: "Navigation",
      type: "navigation",
      children: [
        { id: "dashboard", title: "Dashboard", type: "navigation" },
        { id: "reviews", title: "Reviews", type: "navigation" },
        { id: "discounts", title: "Discounts", type: "navigation" },
        { id: "notification", title: "Notifications", type: "navigation" },
        { id: "reporting", title: "Reporting", type: "navigation" },
        { id: "payments", title: "Payments", type: "navigation" },
        { id: "invite", title: "Invite", type: "navigation" },
        { id: "settings", title: "Settings", type: "navigation" },
      ],
    },
    {
      id: "dashboard",
      title: "Dashboard",
      type: "tabs",
      children: [
        { id: "overview", title: "Overview Tab", type: "tabs", parentId: "dashboard" },
        { id: "branches", title: "Branches Tab", type: "tabs", parentId: "dashboard" },
        { id: "reviews", title: "Reviews Tab", type: "tabs", parentId: "dashboard" },
        { id: "competition", title: "Competition Tab", type: "tabs", parentId: "dashboard" },
      ],
    },
    {
      id: "reporting",
      title: "Reporting",
      type: "tabs",
      children: [
        { id: "discounts", title: "Discounts Tab", type: "tabs", parentId: "reporting" },
        { id: "sales", title: "Sales Tab", type: "tabs", parentId: "reporting" },
      ],
    },
    {
      id: "discounts",
      title: "Discounts",
      type: "tabs",
      children: [
        { id: "verify", title: "Verify Tab", type: "tabs", parentId: "discounts" },
        { id: "manage", title: "Manage Tab", type: "tabs", parentId: "discounts" },
      ],
    },
    {
      id: "features",
      title: "Features",
      type: "features",
      children: [
        { id: "OFFLINE_MODE", title: "Offline Mode", type: "features" },
        { id: "BACKGROUND_SYNC", title: "Background Sync", type: "features" },
        { id: "ADVANCED_CACHING", title: "Advanced Caching", type: "features" },
        { id: "PERFORMANCE_MONITORING", title: "Performance Monitoring", type: "features" },
        { id: "CACHE_ANALYTICS", title: "Cache Analytics", type: "features" },
        { id: "VIRTUALIZED_LISTS", title: "Virtualized Lists", type: "features" },
        { id: "PREFETCHING", title: "Prefetching", type: "features" },
        { id: "ENHANCED_ERROR_HANDLING", title: "Enhanced Error Handling", type: "features" },
      ],
    },
    {
      id: "permissions",
      title: "Permissions",
      type: "permissions",
      children: [
        {
          id: "discounts",
          title: "Discount Permissions",
          type: "permissions",
          children: [
            { id: "create", title: "Create Discounts", type: "permissions", parentId: "discounts" },
            { id: "edit", title: "Edit Discounts", type: "permissions", parentId: "discounts" },
            { id: "toggleStatus", title: "Toggle Status", type: "permissions", parentId: "discounts" },
            { id: "delete", title: "Delete Discounts", type: "permissions", parentId: "discounts" },
          ],
        },
      ],
    },
  ]

  // Initialize local state from feature flags
  useEffect(() => {
    if (!flagsLoading) {
      const newFlagsState: Record<string, boolean> = {}

      // Initialize all flags
      const initializeFlags = (items: FeatureFlagItem[]) => {
        items.forEach((item) => {
          if (item.type === "navigation") {
            if (item.id !== "navigation") {
              // Skip the parent "navigation" item
              newFlagsState[`navigation_${item.id}`] = isNavigationEnabled(item.id)
            }
          } else if (item.type === "tabs" && item.parentId) {
            newFlagsState[`tabs_${item.parentId}_${item.id}`] = isTabEnabled(item.parentId, item.id)
          } else if (item.type === "features" && item.id !== "features") {
            newFlagsState[`features_${item.id}`] = isFeatureEnabled(item.id)
          } else if (item.type === "permissions" && item.parentId && item.id !== "permissions") {
            newFlagsState[`permissions_${item.parentId}_${item.id}`] = hasPermission(item.parentId, item.id)
          }

          // Initialize expanded state for items with children
          if (item.children && item.children.length > 0) {
            setExpandedItems((prev) => ({ ...prev, [item.id]: true }))
            initializeFlags(item.children)
          }
        })
      }

      initializeFlags(featureFlags)
      setFlagsState(newFlagsState)
      setIsLoading(false)
    }
  }, [flagsLoading, isNavigationEnabled, isTabEnabled, isFeatureEnabled, hasPermission])

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleToggleFlag = (item: FeatureFlagItem, checked: boolean) => {
    // Handle based on flag type
    if (item.type === "navigation" && item.id !== "navigation") {
      // Update navigation flag
      setFlagsState((prev) => ({
        ...prev,
        [`navigation_${item.id}`]: checked,
      }))
      setFeatureOverride("navigation", item.id, null, checked)
    } else if (item.type === "tabs" && item.parentId) {
      // Update tab flag
      setFlagsState((prev) => ({
        ...prev,
        [`tabs_${item.parentId}_${item.id}`]: checked,
      }))
      setFeatureOverride("tabs", item.parentId, item.id, checked)
    } else if (item.type === "features" && item.id !== "features") {
      // Update feature flag
      setFlagsState((prev) => ({
        ...prev,
        [`features_${item.id}`]: checked,
      }))
      setFeatureOverride("features", item.id, null, checked)
    } else if (item.type === "permissions" && item.parentId && item.id !== "permissions") {
      // Update permission flag
      setFlagsState((prev) => ({
        ...prev,
        [`permissions_${item.parentId}_${item.id}`]: checked,
      }))
      setFeatureOverride("permissions", item.parentId, item.id, checked)
    }

    // If this is a parent item with children, update all children
    if (item.children && item.children.length > 0) {
      updateChildrenFlags(item, checked)
    }
  }

  const updateChildrenFlags = (parent: FeatureFlagItem, checked: boolean) => {
    if (!parent.children) return

    parent.children.forEach((child) => {
      // Update child flag based on its type
      if (child.type === "navigation" && child.id !== "navigation") {
        setFlagsState((prev) => ({
          ...prev,
          [`navigation_${child.id}`]: checked,
        }))
        setFeatureOverride("navigation", child.id, null, checked)
      } else if (child.type === "tabs" && child.parentId) {
        setFlagsState((prev) => ({
          ...prev,
          [`tabs_${child.parentId}_${child.id}`]: checked,
        }))
        setFeatureOverride("tabs", child.parentId, child.id, checked)
      } else if (child.type === "features" && child.id !== "features") {
        setFlagsState((prev) => ({
          ...prev,
          [`features_${child.id}`]: checked,
        }))
        setFeatureOverride("features", child.id, null, checked)
      } else if (child.type === "permissions" && child.parentId && child.id !== "permissions") {
        setFlagsState((prev) => ({
          ...prev,
          [`permissions_${child.parentId}_${child.id}`]: checked,
        }))
        setFeatureOverride("permissions", child.parentId, child.id, checked)
      }

      // Recursively update grandchildren
      if (child.children && child.children.length > 0) {
        updateChildrenFlags(child, checked)
      }
    })
  }

  const getFlagValue = (item: FeatureFlagItem): boolean => {
    if (item.type === "navigation" && item.id !== "navigation") {
      return flagsState[`navigation_${item.id}`] ?? true
    } else if (item.type === "tabs" && item.parentId) {
      return flagsState[`tabs_${item.parentId}_${item.id}`] ?? true
    } else if (item.type === "features" && item.id !== "features") {
      return flagsState[`features_${item.id}`] ?? false
    } else if (item.type === "permissions" && item.parentId && item.id !== "permissions") {
      return flagsState[`permissions_${item.parentId}_${item.id}`] ?? true
    }

    // For parent items, check if any children are enabled
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => getFlagValue(child))
    }

    return true
  }

  const isIndeterminate = (item: FeatureFlagItem): boolean => {
    if (!item.children || item.children.length === 0) {
      return false
    }

    const enabledCount = item.children.filter((child) => getFlagValue(child)).length
    return enabledCount > 0 && enabledCount < item.children.length
  }

  const renderFeatureFlag = (item: FeatureFlagItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems[item.id]
    const checked = getFlagValue(item)
    const indeterminate = isIndeterminate(item)
    // useRef -> This hook is being called from a nested function, but all hooks must be called unconditionally from the top-level component.
    // const checkboxRef = useRef<HTMLButtonElement>(null)

    // Set indeterminate property on the checkbox DOM element
    // useEffect(() => {
    //   if (checkboxRef.current) {
    //     // @ts-ignore - indeterminate is a valid property but not in the types
    //     checkboxRef.current.indeterminate = indeterminate
    //   }
    // }, [indeterminate])

    return (
      <div key={`${item.type}_${item.id}`} className="space-y-2">
        <div className={cn("flex items-center justify-between py-2", depth > 0 && "ml-6", depth > 1 && "ml-12")}>
          <div className="flex items-center">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(item.id)}
                className="mr-2 p-1 hover:bg-muted rounded-sm"
                type="button"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                // ref={checkboxRef}
                id={`checkbox-${item.type}-${item.id}`}
                checked={checked}
                onCheckedChange={(checked) => handleToggleFlag(item, checked === true)}
                className={indeterminate ? "opacity-100" : ""}
                data-indeterminate={indeterminate}
              />
              <label
                htmlFor={`checkbox-${item.type}-${item.id}`}
                className={cn("text-sm", hasChildren && "font-medium")}
              >
                {item.title}
              </label>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2 border-l-2 border-muted ml-3 pl-3">
            {item.children.map((child) => renderFeatureFlag(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, you might want to sync with a backend here
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast({
        title: "Changes saved",
        description: "Your feature flag changes have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving changes",
        description: "There was a problem saving your changes.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    resetFeatureOverrides()
    refreshFlags()

    toast({
      title: "Feature flags reset",
      description: "All feature flags have been reset to their default values.",
    })
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await refreshFlags()
    setIsLoading(false)

    toast({
      title: "Feature flags refreshed",
      description: "Feature flags have been refreshed from the server.",
    })
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Enable or disable features across the application</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={saving}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">{featureFlags.map((flag) => renderFeatureFlag(flag))}</div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
