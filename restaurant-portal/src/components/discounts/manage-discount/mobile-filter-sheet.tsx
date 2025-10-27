"use client"

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type { FilterState, FilterAction } from "./filter-state"
import type { Dispatch } from "react"
import { Award, PercentCircle, Tag, CreditCard, Calendar, Store, Smartphone } from "lucide-react"

interface MobileFilterSheetProps {
  isFilterSheetOpen: boolean
  setIsFilterSheetOpen: (open: boolean) => void
  filterState: FilterState
  dispatch: Dispatch<FilterAction>
  hasFilters: boolean
}

export function MobileFilterSheet({
  isFilterSheetOpen,
  setIsFilterSheetOpen,
  filterState,
  dispatch,
  hasFilters,
}: MobileFilterSheetProps) {
  return (
    <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="border-b p-4 bg-white">
          <SheetTitle className="text-xl font-semibold">Filter Discounts</SheetTitle>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Filter by Type</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={filterState.typeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_TYPE_FILTER", payload: "all" })}
                  className="justify-start"
                >
                  All Types
                </Button>
                <Button
                  variant={filterState.typeFilter === "loyalty" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_TYPE_FILTER", payload: "loyalty" })}
                  className="justify-start"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Loyalty
                </Button>
                <Button
                  variant={filterState.typeFilter === "percentageDeal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_TYPE_FILTER", payload: "percentageDeal" })}
                  className="justify-start"
                >
                  <PercentCircle className="h-4 w-4 mr-2" />
                  Percentage
                </Button>
                <Button
                  variant={filterState.typeFilter === "fixedPriceDeal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_TYPE_FILTER", payload: "fixedPriceDeal" })}
                  className="justify-start"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Fixed Price
                </Button>
                <Button
                  variant={filterState.typeFilter === "bankDiscount" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_TYPE_FILTER", payload: "bankDiscount" })}
                  className="justify-start"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Bank
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Filter by Status</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={filterState.statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_STATUS_FILTER", payload: "all" })}
                  className="justify-start"
                >
                  All Statuses
                </Button>
                <Button
                  variant={filterState.statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_STATUS_FILTER", payload: "active" })}
                  className="justify-start text-green-700"
                >
                  Active
                </Button>
                <Button
                  variant={filterState.statusFilter === "upcoming" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_STATUS_FILTER", payload: "upcoming" })}
                  className="justify-start text-blue-700"
                >
                  Upcoming
                </Button>
                <Button
                  variant={filterState.statusFilter === "expired" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_STATUS_FILTER", payload: "expired" })}
                  className="justify-start text-red-700"
                >
                  Expired
                </Button>
                <Button
                  variant={filterState.statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_STATUS_FILTER", payload: "inactive" })}
                  className="justify-start text-gray-700"
                >
                  Inactive
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Additional Filters</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={filterState.selectedFilters.appOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    dispatch({
                      type: "SET_SELECTED_FILTERS",
                      payload: { appOnly: !filterState.selectedFilters.appOnly },
                    })
                  }
                  className="justify-start"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  App Only
                </Button>
                <Button
                  variant={filterState.selectedFilters.allBranches ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    dispatch({
                      type: "SET_SELECTED_FILTERS",
                      payload: { allBranches: !filterState.selectedFilters.allBranches },
                    })
                  }
                  className="justify-start"
                >
                  <Store className="h-4 w-4 mr-2" />
                  All Branches
                </Button>
                <Button
                  variant={filterState.selectedFilters.alwaysActive ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    dispatch({
                      type: "SET_SELECTED_FILTERS",
                      payload: { alwaysActive: !filterState.selectedFilters.alwaysActive },
                    })
                  }
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Always Active
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t p-4 bg-white">
          <div className="flex gap-3">
            {hasFilters && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  dispatch({ type: "RESET_FILTERS" })
                  setIsFilterSheetOpen(false)
                }}
              >
                Clear All
              </Button>
            )}
            <Button className={hasFilters ? "flex-1" : "w-full"} onClick={() => setIsFilterSheetOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
