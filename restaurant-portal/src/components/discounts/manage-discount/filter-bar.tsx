"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  X,
  Search,
  PercentCircle,
  Award,
  CreditCard,
  ArrowUpDown,
  Tag,
  Filter,
  Calendar,
  Store,
  Smartphone,
  ActivitySquare,
} from "lucide-react"
import { useState } from "react"

// Update the SortDropdown component to use our new MobileSheet component
import { MobileSheet, MobileSheetItem } from "@/components/ui/mobile-sheet"

interface FilterBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  typeFilter: "all" | "loyalty" | "percentageDeal" | "bankDiscount" | "fixedPriceDeal"
  setTypeFilter: (filter: "all" | "loyalty" | "percentageDeal" | "bankDiscount" | "fixedPriceDeal") => void
  statusFilter: "all" | "active" | "inactive" | "upcoming" | "expired"
  setStatusFilter: (filter: "all" | "active" | "inactive" | "upcoming" | "expired") => void
  selectedFilters: {
    appOnly: boolean
    allBranches: boolean
    alwaysActive: boolean
  }
  setSelectedFilters: (filters: {
    appOnly: boolean
    allBranches: boolean
    alwaysActive: boolean
  }) => void
  sortOrder: "newest" | "oldest" | "alphabetical" | "status"
  setSortOrder: (order: "newest" | "oldest" | "alphabetical" | "status") => void
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
  hasFilters: boolean
  isMobile: boolean
  setIsFilterSheetOpen: (open: boolean) => void
}

// Update the SortDropdown function to use our hook
function SortDropdown({ sortOrder, setSortOrder, isMobile }) {
  const [isOpen, setIsOpen] = useState(false)
  // We'll keep the isMobile prop for now to avoid changing too much at once
  // but in a future refactor, we could use the hook directly here

  const handleSortChange = (value) => {
    setSortOrder(value)
    setIsOpen(false)
  }

  if (isMobile) {
    return (
      <>
        <Button variant="outline" size="sm" className="h-9" onClick={() => setIsOpen(true)}>
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort
        </Button>

        <MobileSheet open={isOpen} onOpenChange={setIsOpen} title="Sort Applications">
          <MobileSheetItem
            icon={
              sortOrder === "newest" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <span className="w-4 h-4" />
              )
            }
            label="Newest First"
            onClick={() => handleSortChange("newest")}
          />
          <MobileSheetItem
            icon={
              sortOrder === "oldest" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <span className="w-4 h-4" />
              )
            }
            label="Oldest First"
            onClick={() => handleSortChange("oldest")}
          />
          <MobileSheetItem
            icon={
              sortOrder === "alphabetical" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <span className="w-4 h-4" />
              )
            }
            label="Alphabetical"
            onClick={() => handleSortChange("alphabetical")}
          />
          <MobileSheetItem
            icon={
              sortOrder === "status" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <span className="w-4 h-4" />
              )
            }
            label="By Status"
            onClick={() => handleSortChange("status")}
          />
        </MobileSheet>
      </>
    )
  }

  // Desktop dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
          <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="alphabetical">Alphabetical</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="status">By Status</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  selectedFilters,
  setSelectedFilters,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
  hasFilters,
  isMobile,
  setIsFilterSheetOpen,
}: FilterBarProps) {
  // We'll keep the isMobile prop for now to avoid changing too much at once
  // but in a future refactor, we could use the hook directly here

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search discounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-9 px-2"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Filter Button */}
        {isMobile ? (
          <Button variant="outline" size="sm" className="h-9" onClick={() => setIsFilterSheetOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasFilters && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {Object.values(selectedFilters).filter(Boolean).length +
                  (typeFilter !== "all" ? 1 : 0) +
                  (statusFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            {/* Type Filter Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Tag className="h-4 w-4 mr-2" />
                  Type
                  {typeFilter !== "all" && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                  <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="loyalty">
                    <Award className="h-4 w-4 mr-2" />
                    Loyalty Only
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="percentageDeal">
                    <PercentCircle className="h-4 w-4 mr-2" />
                    Percentage Only
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="fixedPriceDeal">
                    <Tag className="h-4 w-4 mr-2" />
                    Fixed Price Only
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="bankDiscount">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Bank Only
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <ActivitySquare className="h-4 w-4 mr-2" />
                  Status
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                  <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="active">Active Only</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="upcoming">Upcoming Only</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="expired">Expired Only</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="inactive">Inactive Only</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Additional Filters Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  More
                  {(selectedFilters.appOnly || selectedFilters.allBranches || selectedFilters.alwaysActive) && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {Object.values(selectedFilters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuCheckboxItem
                  checked={selectedFilters.appOnly}
                  onCheckedChange={(checked) => setSelectedFilters({ ...selectedFilters, appOnly: checked })}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  App Only
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={selectedFilters.allBranches}
                  onCheckedChange={(checked) => setSelectedFilters({ ...selectedFilters, allBranches: checked })}
                >
                  <Store className="h-4 w-4 mr-2" />
                  All Branches
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={selectedFilters.alwaysActive}
                  onCheckedChange={(checked) => setSelectedFilters({ ...selectedFilters, alwaysActive: checked })}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Always Active
                </DropdownMenuCheckboxItem>

                {(selectedFilters.appOnly || selectedFilters.allBranches || selectedFilters.alwaysActive) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedFilters({
                          appOnly: false,
                          allBranches: false,
                          alwaysActive: false,
                        })
                      }}
                    >
                      Clear additional filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Sort Button */}
        <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} isMobile={isMobile} />

        {/* View Mode Buttons */}
        {!isMobile && null}
      </div>
    </div>
  )
}
