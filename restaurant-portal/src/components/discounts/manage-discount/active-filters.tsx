"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { FilterState, FilterAction } from "./filter-state"
import type { Dispatch } from "react"

interface ActiveFiltersProps {
  filterState: FilterState
  dispatch: Dispatch<FilterAction>
  hasFilters: boolean
}

export function ActiveFilters({ filterState, dispatch, hasFilters }: ActiveFiltersProps) {
  if (!hasFilters) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filterState.typeFilter !== "all" && (
        <Badge variant="outline" className="px-2 py-1">
          {filterState.typeFilter === "loyalty"
            ? "Loyalty"
            : filterState.typeFilter === "percentageDeal"
              ? "Percentage"
              : filterState.typeFilter === "fixedPriceDeal"
                ? "Fixed Price"
                : "Bank"}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => dispatch({ type: "SET_TYPE_FILTER", payload: "all" })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filterState.statusFilter !== "all" && (
        <Badge variant="outline" className="px-2 py-1">
          {filterState.statusFilter.charAt(0).toUpperCase() + filterState.statusFilter.slice(1)}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => dispatch({ type: "SET_STATUS_FILTER", payload: "all" })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filterState.selectedFilters.appOnly && (
        <Badge variant="outline" className="px-2 py-1">
          App Only
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => dispatch({ type: "SET_SELECTED_FILTERS", payload: { appOnly: false } })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filterState.selectedFilters.allBranches && (
        <Badge variant="outline" className="px-2 py-1">
          All Branches
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => dispatch({ type: "SET_SELECTED_FILTERS", payload: { allBranches: false } })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filterState.selectedFilters.alwaysActive && (
        <Badge variant="outline" className="px-2 py-1">
          Always Active
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => dispatch({ type: "SET_SELECTED_FILTERS", payload: { alwaysActive: false } })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filterState.searchQuery && (
        <Badge variant="outline" className="px-2 py-1">
          Search: {filterState.searchQuery}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => dispatch({ type: "SET_SEARCH_QUERY", payload: "" })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={() => {
          dispatch({ type: "RESET_FILTERS" })
        }}
      >
        Clear all
      </Button>
    </div>
  )
}
