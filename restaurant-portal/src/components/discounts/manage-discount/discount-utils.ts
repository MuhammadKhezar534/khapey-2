import type { Discount } from "@/types/discounts"
import type { FilterState } from "./filter-state"

// Helper function to get discount status
export function getDiscountStatus(discount: Discount) {
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
}

// Filter discounts based on selected branch, status filter
export function getFilteredDiscounts(
  discounts: Discount[],
  filterState: FilterState,
  selectedBranch: string | null,
  sortDiscounts: (discounts: Discount[], order: string) => Discount[],
) {
  let filtered = [...discounts]

  // Filter by branch if a branch is selected
  if (selectedBranch) {
    filtered = filtered.filter(
      (discount) =>
        ("applyToAllBranches" in discount && discount.applyToAllBranches) ||
        ("branches" in discount && discount in discount && discount.applyToAllBranches) ||
        ("branches" in discount && discount.branches.includes(selectedBranch)),
    )
  }

  // Filter by status if a status filter is selected
  if (filterState.statusFilter !== "all") {
    filtered = filtered.filter((discount) => getDiscountStatus(discount) === filterState.statusFilter)
  }

  // Apply type filter if not "all"
  if (filterState.typeFilter !== "all") {
    filtered = filtered.filter((d) => d.type === filterState.typeFilter)
  }

  // Apply additional filters
  if (filterState.selectedFilters.appOnly) {
    filtered = filtered.filter((d) => "forKhapeyUsersOnly" in d && d.forKhapeyUsersOnly)
  }

  if (filterState.selectedFilters.allBranches) {
    filtered = filtered.filter((d) => d.applyToAllBranches)
  }

  if (filterState.selectedFilters.alwaysActive) {
    filtered = filtered.filter((d) => "isAlwaysActive" in d && d.isAlwaysActive)
  }

  // Apply search if present
  if (filterState.searchQuery.trim()) {
    const query = filterState.searchQuery.toLowerCase()
    filtered = filtered.filter(
      (d) =>
        d.name?.toLowerCase().includes(query) ||
        false ||
        d.title?.toLowerCase().includes(query) ||
        false ||
        d.description.toLowerCase().includes(query),
    )
  }

  // Apply sorting
  filtered = sortDiscounts(filtered, filterState.sortOrder)

  return filtered
}

// Sort discounts based on the selected sort order
export function sortDiscounts(discounts: Discount[], order: string) {
  return [...discounts].sort((a, b) => {
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
        return statusOrder[statusA as keyof typeof statusOrder] - statusOrder[statusB as keyof typeof statusOrder]
      default:
        return 0
    }
  })
}
