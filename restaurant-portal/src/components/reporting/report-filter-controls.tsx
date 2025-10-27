"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Calendar, Download } from "lucide-react"
import { format } from "date-fns"
import { useIsMobile } from "@/hooks/use-mobile"

interface ReportFilterControlsProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  branchFilter: string
  onBranchFilterChange: (value: string) => void
  startDate?: Date
  endDate?: Date
  onDateRangeClick: () => void
  onExportClick: () => void
  onFilterClick: () => void
  isLoading: boolean
  branchNames: string[]
  discount?: any
}

export function ReportFilterControls({
  searchQuery,
  onSearchChange,
  branchFilter,
  onBranchFilterChange,
  startDate,
  endDate,
  onDateRangeClick,
  onExportClick,
  onFilterClick,
  isLoading,
  branchNames,
  discount,
}: ReportFilterControlsProps) {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative w-full sm:w-auto max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search applications..."
          className="pl-8 w-full sm:w-[300px]"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter Button */}
        <Button variant="outline" size="sm" onClick={onFilterClick}>
          <Filter className="mr-2 h-4 w-4" />
          Branch
          {branchFilter !== "all" && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              1
            </Badge>
          )}
        </Button>

        {/* Date Range Button */}
        <Button variant="outline" size="sm" onClick={onDateRangeClick} disabled={isLoading}>
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              {startDate && endDate
                ? discount && startDate.getTime() === new Date(discount.createdAt).getTime()
                  ? "All Time"
                  : `${format(startDate, "dd/MM/yy")} - ${format(endDate, "dd/MM/yy")}`
                : "Date Range"}
            </>
          )}
        </Button>

        {/* Export Button */}
        <Button variant="outline" size="sm" onClick={onExportClick}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
