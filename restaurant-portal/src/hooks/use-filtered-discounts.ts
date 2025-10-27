"use client"

import { useState, useMemo, useCallback } from "react"
import type { Discount } from "@/types/discounts"

type SortOrder = "newest" | "oldest" | "alphabetical" | "status"
type StatusFilter = "all" | "active" | "inactive" | "upcoming" | "expired"
type TypeFilter = "all" | "loyalty" | "percentageDeal" | "bankDiscount" | "fixedPriceDeal"
type SelectedFilters = {
  appOnly: boolean
  allBranches: boolean
  alwaysActive: boolean
}

interface UseFilteredDiscountsProps {
  discounts: Discount[]
  selectedBranch?: string | null
  initialSortOrder?: SortOrder
  initialStatusFilter?: StatusFilter
  initialTypeFilter?: TypeFilter
  initialSearchQuery?: string
  initialSelectedFilters?: SelectedFilters
}

interface FilteredDiscountsResult {
  filteredDiscounts: Discount[]
  stats: {
    total: number
    active: number
    upcoming: number
    expired: number
    inactive: number
    loyalty: number
    percentage: number
    bank: number
    fixed: number
  }
  hasFilters: boolean
  hasLoyaltyDiscount: boolean
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
  statusFilter: StatusFilter
  setStatusFilter: (status: StatusFilter) => void
  typeFilter: TypeFilter
  setTypeFilter: (type: TypeFilter) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedFilters: SelectedFilters
  setSelectedFilters: (filters: SelectedFilters) => void
  getDiscountStatus: (discount: Discount) => StatusFilter
}

/**
 * Custom hook for filtering and sorting discounts
 * @param {UseFilteredDiscountsProps} props - The properties for the hook
 * @returns {FilteredDiscountsResult} - The filtered discounts and related data
 */
export function useFilteredDiscounts({
  discounts,
  selectedBranch,
  initialSortOrder = "newest",
  initialStatusFilter = "all",
  initialTypeFilter = "all",
  initialSearchQuery = "",
  initialSelectedFilters = { appOnly: false, allBranches: false, alwaysActive: false },
}: UseFilteredDiscountsProps): FilteredDiscountsResult {
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatusFilter)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialTypeFilter)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(initialSelectedFilters)

  // Helper function to get discount status - memoized to avoid recalculations
  const getDiscountStatus = useCallback((discount: Discount): StatusFilter => {
    if (discount.status === "inactive") return "inactive"

    const now = new Date()

    // Check if the discount has date restrictions
    if (!discount.isAlwaysActive && discount.startDate && discount.endDate) {
      const startDate = new Date(discount.startDate)
      const endDate = new Date(discount.endDate)
      endDate.setHours(23, 59, 59, 999) // Set to end of day

      if (now < startDate) return "upcoming"
      if (now > endDate) return "expired"
    }

    return "active"
  }, [])

  // Sort discounts based on the selected sort order - memoized for performance
  const sortDiscounts = useCallback(
    (discountsToSort: Discount[], order: SortOrder) => {
      return [...discountsToSort].sort((a, b) => {
        switch (order) {
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          case "alphabetical":
            const nameA = a.name || a.title || ""
            const nameB = b.name || b.title || ""
            return nameA.localeCompare(nameB)
          case "status":
            // Sort by status: active first, then upcoming, then inactive, then expired
            const statusA = getDiscountStatus(a)
            const statusB = getDiscountStatus(b)
            const statusOrder = { active: 0, upcoming: 1, inactive: 2, expired: 3 }
            return statusOrder[statusA] - statusOrder[statusB]
          default:
            return 0
        }
      })
    },
    [getDiscountStatus],
  )

  // Filter and sort discounts - memoized to avoid unnecessary recalculations
  const filteredDiscounts = useMemo(() => {
    let filtered = [...discounts]

    // Filter by branch if a branch is selected
    if (selectedBranch) {
      filtered = filtered.filter(
        (discount) =>
          ("applyToAllBranches" in discount && discount.applyToAllBranches) ||
          ("branches" in discount && discount.branches.includes(selectedBranch)),
      )
    }

    // Filter by status if a status filter is selected
    if (statusFilter !== "all") {
      filtered = filtered.filter((discount) => getDiscountStatus(discount) === statusFilter)
    }

    // Apply type filter if not "all"
    if (typeFilter !== "all") {
      filtered = filtered.filter((d) => d.type === typeFilter)
    }

    // Apply additional filters
    if (selectedFilters.appOnly) {
      filtered = filtered.filter((d) => "forKhapeyUsersOnly" in d && d.forKhapeyUsersOnly)
    }

    if (selectedFilters.allBranches) {
      filtered = filtered.filter((d) => d.applyToAllBranches)
    }

    if (selectedFilters.alwaysActive) {
      filtered = filtered.filter((d) => "isAlwaysActive" in d && d.isAlwaysActive)
    }

    // Apply search if present - case insensitive search on multiple fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          (d.name && d.name.toLowerCase().includes(query)) ||
          (d.title && d.title.toLowerCase().includes(query)) ||
          (d.description && d.description.toLowerCase().includes(query)),
      )
    }

    // Apply sorting
    return sortDiscounts(filtered, sortOrder)
  }, [
    discounts,
    selectedBranch,
    statusFilter,
    typeFilter,
    selectedFilters,
    searchQuery,
    sortOrder,
    getDiscountStatus,
    sortDiscounts,
  ])

  // Calculate stats for the dashboard - memoized to avoid recalculation
  const stats = useMemo(() => {
    // Use reduce for a single pass through the data instead of multiple filters
    return filteredDiscounts.reduce(
      (acc, d) => {
        // Count by status
        const status = getDiscountStatus(d)
        if (status === "active") acc.active++
        else if (status === "upcoming") acc.upcoming++
        else if (status === "expired") acc.expired++
        else if (status === "inactive") acc.inactive++

        // Count by type
        if (d.type === "loyalty") acc.loyalty++
        else if (d.type === "percentageDeal") acc.percentage++
        else if (d.type === "bankDiscount") acc.bank++
        else if (d.type === "fixedPriceDeal") acc.fixed++

        return acc
      },
      {
        total: filteredDiscounts.length,
        active: 0,
        upcoming: 0,
        expired: 0,
        inactive: 0,
        loyalty: 0,
        percentage: 0,
        bank: 0,
        fixed: 0,
      },
    )
  }, [filteredDiscounts, getDiscountStatus])

  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    return (
      typeFilter !== "all" ||
      statusFilter !== "all" ||
      searchQuery.trim() !== "" ||
      selectedFilters.appOnly ||
      selectedFilters.allBranches ||
      selectedFilters.alwaysActive
    )
  }, [typeFilter, statusFilter, searchQuery, selectedFilters])

  // Check if there's an active loyalty discount
  const hasLoyaltyDiscount = useMemo(() => {
    return filteredDiscounts.some((d) => d.type === "loyalty" && d.status === "active")
  }, [filteredDiscounts])

  return {
    filteredDiscounts,
    stats,
    hasFilters,
    hasLoyaltyDiscount,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    getDiscountStatus,
  }
}
