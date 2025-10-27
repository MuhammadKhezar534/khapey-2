"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parse, isValid } from "date-fns"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect, useRef, useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface ExportDateRangeSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  exportStartDateInput: string
  exportEndDateInput: string
  setExportStartDateInput: (value: string) => void
  exportEndDateInput: string
  setExportEndDateInput: (value: string) => void
  exportStartDate?: Date
  exportEndDate?: Date
  setExportStartDate: (date?: Date) => void
  setExportEndDate: (date?: Date) => void
  exportStartDateError: string | null
  exportEndDateError: string | null
  setExportStartDateError: (error: string | null) => void
  setExportEndDateError: (error: string | null) => void
  exportBranchFilter: string
  setExportBranchFilter: (value: string) => void
  handleApplyExportDateRange: () => void
  formatDateInput: (value: string) => string
  discount?: any
  branchNames: string[]
}

export function ExportDateRangeSheet({
  isOpen,
  onOpenChange,
  exportStartDateInput,
  exportEndDateInput,
  setExportStartDateInput,
  setExportEndDateInput,
  exportStartDate,
  exportEndDate,
  setExportStartDate,
  setExportEndDate,
  exportStartDateError,
  exportEndDateError,
  setExportStartDateError,
  setExportEndDateError,
  exportBranchFilter,
  setExportBranchFilter,
  handleApplyExportDateRange,
  formatDateInput,
  discount,
  branchNames,
}: ExportDateRangeSheetProps) {
  const isMobile = useIsMobile()
  const contentRef = useRef<HTMLDivElement>(null)

  const [localStartDateInput, setLocalStartDateInput] = useState(exportStartDateInput)
  const [localEndDateInput, setLocalEndDateInput] = useState(exportEndDateInput)
  const [localStartDate, setLocalStartDate] = useState(exportStartDate)
  const [localEndDate, setLocalEndDate] = useState(exportEndDate)
  const [localStartDateError, setLocalStartDateError] = useState(exportStartDateError)
  const [localEndDateError, setLocalEndDateError] = useState(exportEndDateError)
  const [localBranchFilter, setLocalBranchFilter] = useState(exportBranchFilter)

  // Force layout recalculation when sheet opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Trigger reflow
      contentRef.current.scrollTop = 0
    }
  }, [isOpen])

  const handleApply = () => {
    // Validate branch selection (should always be valid since we default to "all")
    if (!localBranchFilter) {
      toast({
        title: "Branch selection required",
        description: "Please select a branch or 'All Branches'",
        variant: "destructive",
      })
      return
    }

    // Validate date selection
    if (localStartDateInput === "DD/MM/YYYY" || localEndDateInput === "DD/MM/YYYY") {
      toast({
        title: "Date selection required",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
      return
    }

    // Check if both dates are valid
    if (localStartDateError || localEndDateError) {
      return
    }

    // First update all parent state synchronously
    setExportStartDateInput(localStartDateInput)
    setExportEndDateInput(localEndDateInput)
    setExportStartDate(localStartDate)
    setExportEndDate(localEndDate)
    setExportStartDateError(localStartDateError)
    setExportEndDateError(localEndDateError)
    setExportBranchFilter(localBranchFilter)

    // Close the sheet
    onOpenChange(false)

    // Use setTimeout to ensure state updates have been processed
    // before calling handleApplyExportDateRange
    setTimeout(() => {
      handleApplyExportDateRange()
    }, 0)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("p-0 flex flex-col", isMobile ? "w-full h-auto max-h-[85vh]" : "w-[400px]")}
      >
        {/* Fixed Header */}
        <div
          className="w-full bg-white border-b p-4 pb-3 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <SheetTitle className="text-lg font-semibold">Export Report</SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">Select date range and branch for your export</p>
        </div>

        {/* Scrollable Content Area */}
        <div ref={contentRef} className="flex-1 overflow-auto pb-[76px]">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Start Date</h3>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={localStartDateInput === "DD/MM/YYYY" ? "" : localStartDateInput}
                  className={cn("pl-8", localStartDateError && "border-red-500 focus-visible:ring-red-500")}
                  onChange={(e) => {
                    // Clear error state when input changes
                    setLocalStartDateError(null)

                    // If input is empty, set to placeholder
                    if (!e.target.value) {
                      setLocalStartDateInput("DD/MM/YYYY")
                      setLocalStartDate(undefined)
                      return
                    }

                    const formatted = formatDateInput(e.target.value)
                    setLocalStartDateInput(formatted)

                    // Try to parse and update the date in real-time
                    if (formatted.length === 10 && formatted !== "DD/MM/YYYY") {
                      try {
                        const parsedDate = parse(formatted, "dd/MM/yyyy", new Date())
                        if (isValid(parsedDate)) {
                          // Check if date is within valid range
                          if (discount && parsedDate < new Date(discount.createdAt)) {
                            setLocalStartDateError(
                              `Cannot be before discount creation (${format(new Date(discount.createdAt), "dd/MM/yy")})`,
                            )
                          } else {
                            setLocalStartDate(parsedDate)
                          }
                        } else {
                          setLocalStartDateError("Invalid date")
                        }
                      } catch (error) {
                        setLocalStartDateError("Invalid date format")
                      }
                    }
                  }}
                />
              </div>
              {localStartDateError && <p className="text-xs text-red-500">{localStartDateError}</p>}
              {localStartDateInput !== "DD/MM/YYYY" && !localStartDateError && (
                <p className="text-xs text-muted-foreground">
                  Selected: {localStartDate ? format(localStartDate, "PPP") : "Invalid date"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">End Date</h3>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={localEndDateInput === "DD/MM/YYYY" ? "" : localEndDateInput}
                  className={cn("pl-8", localEndDateError && "border-red-500 focus-visible:ring-red-500")}
                  onChange={(e) => {
                    // Clear error state when input changes
                    setLocalEndDateError(null)

                    // If input is empty, set to placeholder
                    if (!e.target.value) {
                      setLocalEndDateInput("DD/MM/YYYY")
                      setLocalEndDate(undefined)
                      return
                    }

                    const formatted = formatDateInput(e.target.value)
                    setLocalEndDateInput(formatted)

                    // Try to parse and update the date in real-time
                    if (formatted.length === 10 && formatted !== "DD/MM/YYYY") {
                      try {
                        const parsedDate = parse(formatted, "dd/MM/yyyy", new Date())
                        if (isValid(parsedDate)) {
                          // Check if date is in the future
                          if (parsedDate > new Date()) {
                            setLocalEndDateError("Cannot be in the future")
                          } else {
                            setLocalEndDate(parsedDate)
                          }
                        } else {
                          setLocalEndDateError("Invalid date")
                        }
                      } catch (error) {
                        setLocalEndDateError("Invalid date format")
                      }
                    }
                  }}
                />
              </div>
              {localEndDateError && <p className="text-xs text-red-500">{localEndDateError}</p>}
              {localEndDateInput !== "DD/MM/YYYY" && !localEndDateError && (
                <p className="text-xs text-muted-foreground">
                  Selected: {localEndDate ? format(localEndDate, "PPP") : "Invalid date"}
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Quick Ranges</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setDate(start.getDate() - 7)

                    setLocalStartDate(start)
                    setLocalEndDate(end)
                    setLocalStartDateInput(format(start, "dd/MM/yyyy"))
                    setLocalEndDateInput(format(end, "dd/MM/yyyy"))
                  }}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setDate(start.getDate() - 30)

                    setLocalStartDate(start)
                    setLocalEndDate(end)
                    setLocalStartDateInput(format(start, "dd/MM/yyyy"))
                    setLocalEndDateInput(format(end, "dd/MM/yyyy"))
                  }}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const now = new Date()
                    const start = new Date(now.getFullYear(), now.getMonth(), 1)
                    const end = new Date()

                    setLocalStartDate(start)
                    setLocalEndDate(end)
                    setLocalStartDateInput(format(start, "dd/MM/yyyy"))
                    setLocalEndDateInput(format(end, "dd/MM/yyyy"))
                  }}
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const now = new Date()
                    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                    const end = new Date(now.getFullYear(), now.getMonth(), 0)

                    setLocalStartDate(start)
                    setLocalEndDate(end)
                    setLocalStartDateInput(format(start, "dd/MM/yyyy"))
                    setLocalEndDateInput(format(end, "dd/MM/yyyy"))
                  }}
                >
                  Last Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (discount) {
                      const start = new Date(discount.createdAt)
                      const end = new Date()

                      // Clear any existing errors
                      setLocalStartDateError(null)
                      setLocalEndDateError(null)

                      setLocalStartDate(start)
                      setLocalEndDate(end)
                      setLocalStartDateInput(format(start, "dd/MM/yyyy"))
                      setLocalEndDateInput(format(end, "dd/MM/yyyy"))
                    }
                  }}
                  className="col-span-2"
                >
                  All Time (Since Creation)
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Branch Filter</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={localBranchFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocalBranchFilter("all")}
                >
                  All Branches
                </Button>
                {(discount?.applyToAllBranches ? branchNames : discount?.branches || []).map((branch) => (
                  <Button
                    key={branch}
                    variant={localBranchFilter === branch ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocalBranchFilter(branch)}
                  >
                    {branch}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            ...(isMobile
              ? { left: 0, right: 0 } // Full width on mobile
              : { width: "400px", right: 0 }), // Match drawer width and align right on desktop
            zIndex: 40,
            backgroundColor: "white",
            borderTop: "1px solid var(--border)",
            padding: "16px",
            boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!!localStartDateError || !!localEndDateError || !localStartDate || !localEndDate}
              className="flex-1"
            >
              Preview
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
