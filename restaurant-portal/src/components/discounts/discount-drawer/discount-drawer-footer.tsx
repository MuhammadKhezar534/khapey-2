"use client"

import { Button } from "@/components/ui/button"
import type { Discount } from "@/types/discounts"

interface DiscountDrawerFooterProps {
  drawerPage: "list" | "details"
  onBackToList: () => void
  onApplyDiscount: () => void
  selectedDiscount: Discount | null
  isApplyDisabled: boolean
  isLoading?: boolean
}

export function DiscountDrawerFooter({
  drawerPage,
  onBackToList,
  onApplyDiscount,
  selectedDiscount,
  isApplyDisabled,
  isLoading = false,
}: DiscountDrawerFooterProps) {
  if (drawerPage === "list" || !selectedDiscount) {
    return null
  }

  return (
    <div className="border-t p-4 bg-background sticky bottom-0 flex gap-3 shadow-md">
      <Button variant="outline" className="flex-1" onClick={onBackToList} disabled={isLoading}>
        Back to List
      </Button>
      <Button className="flex-1" onClick={onApplyDiscount} disabled={isApplyDisabled || isLoading}>
        {isLoading ? "Applying..." : "Apply Discount"}
      </Button>
    </div>
  )
}
