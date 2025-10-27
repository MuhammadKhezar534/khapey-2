"use client"

import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Plus } from "lucide-react"

interface EmptyDiscountStateProps {
  type: string
  onAddDiscount?: () => void
  searchQuery?: string
  hasFilters?: boolean
  onClearFilters?: () => void
}

export function EmptyDiscountState({
  type,
  onAddDiscount,
  searchQuery,
  hasFilters,
  onClearFilters,
}: EmptyDiscountStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-6 text-center px-4">
        <div className="rounded-full bg-muted p-3 mb-3">
          <Award className="h-8 w-8 text-muted-foreground" />
        </div>

        {searchQuery ? (
          <>
            <CardTitle className="text-lg mb-2">No matching discounts</CardTitle>
            <CardDescription className="mb-4">No discounts match your search for "{searchQuery}"</CardDescription>
            <Button variant="outline" onClick={onClearFilters || (() => window.location.reload())}>
              Clear search
            </Button>
          </>
        ) : hasFilters ? (
          <>
            <CardTitle className="text-lg mb-2">No matching discounts</CardTitle>
            <CardDescription className="mb-4">Try changing your filters to see more results</CardDescription>
            <Button variant="outline" onClick={onClearFilters || (() => window.location.reload())}>
              Clear filters
            </Button>
          </>
        ) : (
          <>
            <CardTitle className="text-lg mb-2">No discounts found</CardTitle>
            <CardDescription className="mb-4">
              Create a discount to offer special deals to your customers
            </CardDescription>
            {onAddDiscount && (
              <Button onClick={onAddDiscount} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create Discount</span>
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
