"use client"

import type React from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, isValid, parse } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface DateRangeSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  startDateInput: string
  endDateInput: string
  setStartDateInput: (value: string) => void
  setEndDateInput: (value: string) => void
  startDate?: Date
  endDate?: Date
  setStartDate: (date?: Date) => void
  setEndDate: (date?: Date) => void
  startDateError: string | null
  endDateError: string | null
  setStartDateError: (error: string | null) => void
  setEndDateError: (error: string | null) => void
  applyDateRange: () => void
  formatDateInput: (value: string) => string
  discount?: any
  trigger?: React.ReactNode
}

export function DateRangeSheet({
  isOpen,
  onOpenChange,
  startDateInput,
  endDateInput,
  setStartDateInput,
  setEndDateInput,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  startDateError,
  endDateError,
  setStartDateError,
  setEndDateError,
  applyDateRange,
  formatDateInput,
  discount,
  trigger,
}: DateRangeSheetProps) {
  const isMobile = useIsMobile()

  // Local state to track temporary changes
  const [localStartDateInput, setLocalStartDateInput] = useState(startDateInput)
  const [localEndDateInput, setLocalEndDateInput] = useState(endDateInput)
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>(startDate)
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>(endDate)
  const [localStartDateError, setLocalStartDateError] = useState<string | null>(startDateError)
  const [localEndDateError, setLocalEndDateError] = useState<string | null>(endDateError)

  // Reset local state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setLocalStartDateInput(startDateInput)
      setLocalEndDateInput(endDateInput)
      setLocalStartDate(startDate)
      setLocalEndDate(endDate)
      setLocalStartDateError(startDateError)
      setLocalEndDateError(endDateError)
    }
  }, [isOpen, startDateInput, endDateInput, startDate, endDate, startDateError, endDateError])

  // Function to validate date input
  const validateDateInput = (value: string, isStartDate: boolean): boolean => {
    if (value === "DD/MM/YYYY") return false

    const parsedDate = parse(value, "dd/MM/yyyy", new Date())

    if (!isValid(parsedDate)) {
      if (isStartDate) {
        setLocalStartDateError("Please enter a valid date in DD/MM/YYYY format")
      } else {
        setLocalEndDateError("Please enter a valid date in DD/MM/YYYY format")
      }
      return false
    }

    // Check if date is within valid range
    const creationDate = discount ? new Date(discount.createdAt) : new Date(0)
    const currentDate = new Date()

    if (isStartDate) {
      if (parsedDate < creationDate) {
        setLocalStartDateError(`Start date cannot be before ${format(creationDate, "dd/MM/yyyy")}`)
        return false
      }
      if (parsedDate > currentDate) {
        setLocalStartDateError("Start date cannot be in the future")
        return false
      }
      setLocalStartDateError(null)
    } else {
      if (parsedDate < creationDate) {
        setLocalEndDateError(`End date cannot be before ${format(creationDate, "dd/MM/yyyy")}`)
        return false
      }
      if (parsedDate > currentDate) {
        setLocalEndDateError("End date cannot be in the future")
        return false
      }
      setLocalEndDateError(null)
    }

    // If we have both dates, check that start is before end
    if (isStartDate && localEndDate && parsedDate > localEndDate) {
      setLocalStartDateError("Start date must be before end date")
      return false
    } else if (!isStartDate && localStartDate && parsedDate < localStartDate) {
      setLocalEndDateError("End date must be after start date")
      return false
    }

    return true
  }

  // Handle date input change
  const handleDateInputChange = (value: string, isStartDate: boolean) => {
    const formattedValue = formatDateInput(value)
    if (isStartDate) {
      setLocalStartDateInput(formattedValue)
      if (formattedValue !== "DD/MM/YYYY") {
        const isValid = validateDateInput(formattedValue, true)
        if (isValid) {
          const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date())
          setLocalStartDate(parsedDate)
        }
      }
    } else {
      setLocalEndDateInput(formattedValue)
      if (formattedValue !== "DD/MM/YYYY") {
        const isValid = validateDateInput(formattedValue, false)
        if (isValid) {
          const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date())
          setLocalEndDate(parsedDate)
        }
      }
    }
  }

  // Handle calendar date selection
  const handleCalendarSelect = (date: Date | undefined, isStartDate: boolean) => {
    if (!date) return

    const formattedDate = format(date, "dd/MM/yyyy")
    if (isStartDate) {
      setLocalStartDateInput(formattedDate)
      setLocalStartDate(date)
      validateDateInput(formattedDate, true)
    } else {
      setLocalEndDateInput(formattedDate)
      setLocalEndDate(date)
      validateDateInput(formattedDate, false)
    }
  }

  const handleApply = () => {
    // Check if both dates are valid
    if (localStartDateError || localEndDateError) {
      return
    }

    // Update parent state directly
    setStartDateInput(localStartDateInput)
    setEndDateInput(localEndDateInput)
    setStartDate(localStartDate)
    setEndDate(localEndDate)
    setStartDateError(localStartDateError)
    setEndDateError(localEndDateError)

    // Close the sheet first
    onOpenChange(false)

    // Then apply the date range
    // This is crucial - we need to call applyDateRange AFTER the sheet is closed
    // to ensure the UI updates properly
    applyDateRange()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("p-0 flex flex-col", isMobile ? "w-full h-[90vh] max-h-[90vh]" : "w-[400px] sm:max-w-lg")}
      >
        {/* Header - Fixed at top */}
        <div className="sticky top-0 z-20 bg-white border-b p-4 pb-3 shadow-sm">
          <SheetTitle className="text-lg font-semibold">Select Date Range</SheetTitle>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto pb-[76px]">
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <div className="flex space-x-2">
                  <Input
                    id="start-date"
                    value={localStartDateInput}
                    onChange={(e) => handleDateInputChange(e.target.value, true)}
                    placeholder="DD/MM/YYYY"
                    className={localStartDateError ? "border-red-500" : ""}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={localStartDate}
                        onSelect={(date) => handleCalendarSelect(date, true)}
                        disabled={(date) => {
                          const creationDate = discount ? new Date(discount.createdAt) : new Date(0)
                          return (
                            date < creationDate || date > new Date() || (localEndDate ? date > localEndDate : false)
                          )
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {localStartDateError && <p className="text-xs text-red-500">{localStartDateError}</p>}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <div className="flex space-x-2">
                  <Input
                    id="end-date"
                    value={localEndDateInput}
                    onChange={(e) => handleDateInputChange(e.target.value, false)}
                    placeholder="DD/MM/YYYY"
                    className={localEndDateError ? "border-red-500" : ""}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={localEndDate}
                        onSelect={(date) => handleCalendarSelect(date, false)}
                        disabled={(date) => {
                          const creationDate = discount ? new Date(discount.createdAt) : new Date(0)
                          return (
                            date < creationDate || date > new Date() || (localStartDate ? date < localStartDate : false)
                          )
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {localEndDateError && <p className="text-xs text-red-500">{localEndDateError}</p>}
              </div>
            </div>

            {/* Quick Selections */}
            <div className="space-y-2">
              <Label>Quick Selections</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = new Date()
                    const lastWeek = new Date()
                    lastWeek.setDate(today.getDate() - 7)

                    setLocalStartDate(lastWeek)
                    setLocalEndDate(today)
                    setLocalStartDateInput(format(lastWeek, "dd/MM/yyyy"))
                    setLocalEndDateInput(format(today, "dd/MM/yyyy"))
                    setLocalStartDateError(null)
                    setLocalEndDateError(null)
                  }}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = new Date()
                    const lastMonth = new Date()
                    lastMonth.setMonth(today.getMonth() - 1)

                    setLocalStartDate(lastMonth)
                    setLocalEndDate(today)
                    setLocalStartDateInput(format(lastMonth, "dd/MM/yyyy"))
                    setLocalEndDateInput(format(today, "dd/MM/yyyy"))
                    setLocalStartDateError(null)
                    setLocalEndDateError(null)
                  }}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = new Date()
                    const lastQuarter = new Date()
                    lastQuarter.setMonth(today.getMonth() - 3)

                    setLocalStartDate(lastQuarter)
                    setLocalEndDate(today)
                    setLocalStartDateInput(format(lastQuarter, "dd/MM/yyyy"))
                    setLocalEndDateInput(format(today, "dd/MM/yyyy"))
                    setLocalStartDateError(null)
                    setLocalEndDateError(null)
                  }}
                >
                  Last 3 Months
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (discount) {
                      const creationDate = new Date(discount.createdAt)
                      const today = new Date()

                      setLocalStartDate(creationDate)
                      setLocalEndDate(today)
                      setLocalStartDateInput(format(creationDate, "dd/MM/yyyy"))
                      setLocalEndDateInput(format(today, "dd/MM/yyyy"))
                      setLocalStartDateError(null)
                      setLocalEndDateError(null)
                    }
                  }}
                >
                  All Time
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t p-4 shadow-md">
          <div className="flex flex-row gap-3 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
