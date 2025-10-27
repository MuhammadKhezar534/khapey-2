"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface DirectDateFilterProps {
  onFilterApplied: (startDate: Date, endDate: Date) => void
  discountCreatedAt?: string
}

export function DirectDateFilter({ onFilterApplied, discountCreatedAt }: DirectDateFilterProps) {
  // Refs to track if this is the first render
  const isInitialRender = useRef(true)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const startDateInputRef = useRef<HTMLInputElement>(null)
  const endDateInputRef = useRef<HTMLInputElement>(null)

  // State to track if the dialog is open
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Close dialog when clicking outside
  useEffect(() => {
    if (!isDialogOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setIsDialogOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDialogOpen])

  // Set initial dates when dialog opens
  useEffect(() => {
    if (isDialogOpen && startDateInputRef.current && endDateInputRef.current) {
      // Default to last 7 days
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 7)

      startDateInputRef.current.value = format(start, "dd/MM/yyyy")
      endDateInputRef.current.value = format(end, "dd/MM/yyyy")
    }
  }, [isDialogOpen])

  // Skip initial render effect
  useEffect(() => {
    isInitialRender.current = false
  }, [])

  // Handle filter button click
  const handleFilterClick = () => {
    setIsDialogOpen(true)
  }

  // Apply the filter directly
  const applyFilter = () => {
    if (!startDateInputRef.current || !endDateInputRef.current) return

    const startDateValue = startDateInputRef.current.value
    const endDateValue = endDateInputRef.current.value

    // Parse dates
    const startDate = parse(startDateValue, "dd/MM/yyyy", new Date())
    const endDate = parse(endDateValue, "dd/MM/yyyy", new Date())

    // Validate dates
    if (!isValid(startDate) || !isValid(endDate)) {
      toast({
        title: "Invalid date format",
        description: "Please enter dates in DD/MM/YYYY format",
        variant: "destructive",
      })
      return
    }

    if (startDate > endDate) {
      toast({
        title: "Invalid date range",
        description: "Start date must be before end date",
        variant: "destructive",
      })
      return
    }

    // Close dialog first
    setIsDialogOpen(false)

    // Then apply filter with a small delay to ensure UI updates first
    setTimeout(() => {
      onFilterApplied(startDate, endDate)
    }, 50)
  }

  // Set predefined range
  const setPredefinedRange = (days: number) => {
    if (!startDateInputRef.current || !endDateInputRef.current) return

    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)

    startDateInputRef.current.value = format(start, "dd/MM/yyyy")
    endDateInputRef.current.value = format(end, "dd/MM/yyyy")
  }

  // Set all-time range
  const setAllTimeRange = () => {
    if (!startDateInputRef.current || !endDateInputRef.current || !discountCreatedAt) return

    const start = new Date(discountCreatedAt)
    const end = new Date()

    startDateInputRef.current.value = format(start, "dd/MM/yyyy")
    endDateInputRef.current.value = format(end, "dd/MM/yyyy")
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleFilterClick}
        ref={filterButtonRef}
      >
        <Calendar className="h-4 w-4" />
        <span>Date Range</span>
      </Button>

      {isDialogOpen && (
        <div
          ref={dialogRef}
          className="absolute top-full mt-2 right-0 z-50 bg-white rounded-md shadow-lg border p-4 w-[300px]"
        >
          <h3 className="font-medium mb-3">Select Date Range</h3>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                ref={startDateInputRef}
                type="text"
                placeholder="DD/MM/YYYY"
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">End Date</label>
              <input
                ref={endDateInputRef}
                type="text"
                placeholder="DD/MM/YYYY"
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setPredefinedRange(7)}>
                Last 7 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPredefinedRange(30)}>
                Last 30 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPredefinedRange(90)}>
                Last 3 Months
              </Button>
              <Button variant="outline" size="sm" onClick={setAllTimeRange}>
                All Time
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={applyFilter}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
