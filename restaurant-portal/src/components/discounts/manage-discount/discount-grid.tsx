"use client"

import type React from "react"

import { EmptyDiscountState } from "./empty-discount-state"
import { DiscountCard } from "@/components/discounts/discount-card"
import type { Discount } from "@/types/discounts"
import type { FilterState } from "./filter-state"

interface DiscountGridProps {
  filteredDiscounts: Discount[]
  handleEditDiscount: (discount: Discount) => void
  handleDeleteDiscount: (id: string) => void
  toggleDiscountStatus: (id: string) => void
  manageMode: boolean
  isMobile: boolean
  filterState: FilterState
  hasFilters: boolean
  onAddDiscount: () => void
  dispatch: React.Dispatch<any>
  permissions?: {
    edit: boolean
    toggleStatus: boolean
    delete: boolean
  }
}

export function DiscountGrid({
  filteredDiscounts,
  handleEditDiscount,
  handleDeleteDiscount,
  toggleDiscountStatus,
  manageMode,
  isMobile,
  filterState,
  hasFilters,
  onAddDiscount,
  dispatch,
  permissions = { edit: true, toggleStatus: true, delete: true },
}: DiscountGridProps) {
  // If no discounts match the filters, show empty state
  if (filteredDiscounts.length === 0) {
    return (
      <EmptyDiscountState
        hasFilters={hasFilters}
        onAddDiscount={onAddDiscount}
        onClearFilters={() => dispatch({ type: "RESET_FILTERS" })}
      />
    )
  }

  // Grid view for discounts
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredDiscounts.map((discount) => (
        <DiscountCard
          key={discount.id}
          discount={discount}
          onEdit={() => handleEditDiscount(discount)}
          onDelete={() => handleDeleteDiscount(discount.id)}
          onToggleStatus={() => toggleDiscountStatus(discount.id)}
          permissions={permissions}
        />
      ))}
    </div>
  )
}
