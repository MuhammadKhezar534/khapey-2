"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface NewDateRangeSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyDateRange: (startDate: Date, endDate: Date) => void;
  discount?: any;
}

export function NewDateRangeSheet({
  isOpen,
  onOpenChange,
  onApplyDateRange,
  discount,
}: NewDateRangeSheetProps) {
  const isMobile = useIsMobile();

  // Local state for the component
  const [startDateInput, setStartDateInput] = useState("DD/MM/YYYY");
  const [endDateInput, setEndDateInput] = useState("DD/MM/YYYY");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStartDateInput("DD/MM/YYYY");
      setEndDateInput("DD/MM/YYYY");
      setStartDate(undefined);
      setEndDate(undefined);
      setStartDateError(null);
      setEndDateError(null);
    }
  }, [isOpen]);

  // Format date input with separators
  const formatDateInput = (value: string): string => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");

    // If empty, return placeholder
    if (digits.length === 0) return "DD/MM/YYYY";

    // Format with separators based on length
    if (digits.length <= 2) {
      return digits.padEnd(2, "0").substring(0, 2);
    } else if (digits.length <= 4) {
      return `${digits.substring(0, 2)}/${digits
        .substring(2)
        .padEnd(2, "0")
        .substring(0, 2)}`;
    } else {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits
        .substring(4)
        .padEnd(4, "0")
        .substring(0, 4)}`;
    }
  };

  // Validate date input
  const validateDate = (dateInput: string, isStart: boolean): boolean => {
    if (dateInput === "DD/MM/YYYY") {
      isStart ? setStartDateError("Required") : setEndDateError("Required");
      return false;
    }

    const parsedDate = parse(dateInput, "dd/MM/yyyy", new Date());

    if (!isValid(parsedDate)) {
      isStart
        ? setStartDateError("Invalid date format")
        : setEndDateError("Invalid date format");
      return false;
    }

    // Check date range constraints
    const creationDate = discount ? new Date(discount.createdAt) : new Date(0);
    const currentDate = new Date();

    if (isStart) {
      if (parsedDate < creationDate) {
        setStartDateError(
          `Can't be before ${format(creationDate, "dd/MM/yyyy")}`
        );
        return false;
      }
      if (parsedDate > currentDate) {
        setStartDateError("Can't be in the future");
        return false;
      }
      if (endDate && parsedDate > endDate) {
        setStartDateError("Must be before end date");
        return false;
      }
      setStartDateError(null);
    } else {
      if (parsedDate < creationDate) {
        setEndDateError(
          `Can't be before ${format(creationDate, "dd/MM/yyyy")}`
        );
        return false;
      }
      if (parsedDate > currentDate) {
        setEndDateError("Can't be in the future");
        return false;
      }
      if (startDate && parsedDate < startDate) {
        setEndDateError("Must be after start date");
        return false;
      }
      setEndDateError(null);
    }

    return true;
  };

  // Handle date input change
  const handleDateChange = (value: string, isStart: boolean) => {
    const formatted = formatDateInput(value);
    if (isStart) {
      setStartDateInput(formatted);
      if (formatted !== "DD/MM/YYYY") {
        try {
          const parsed = parse(formatted, "dd/MM/yyyy", new Date());
          if (isValid(parsed)) {
            setStartDate(parsed);
            validateDate(formatted, true);
          }
        } catch (error) {
          // Invalid date - validation will handle this
        }
      }
    } else {
      setEndDateInput(formatted);
      if (formatted !== "DD/MM/YYYY") {
        try {
          const parsed = parse(formatted, "dd/MM/yyyy", new Date());
          if (isValid(parsed)) {
            setEndDate(parsed);
            validateDate(formatted, false);
          }
        } catch (error) {
          // Invalid date - validation will handle this
        }
      }
    }
  };

  // Handle calendar selection
  const handleCalendarSelect = (date: Date | undefined, isStart: boolean) => {
    if (!date) return;

    const formattedDate = format(date, "dd/MM/yyyy");
    if (isStart) {
      setStartDateInput(formattedDate);
      setStartDate(date);
      validateDate(formattedDate, true);
    } else {
      setEndDateInput(formattedDate);
      setEndDate(date);
      validateDate(formattedDate, false);
    }
  };

  // Set predefined date range
  const setPredefinedRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    setStartDate(start);
    setEndDate(end);
    setStartDateInput(format(start, "dd/MM/yyyy"));
    setEndDateInput(format(end, "dd/MM/yyyy"));
    setStartDateError(null);
    setEndDateError(null);
  };

  // Set all-time range
  const setAllTimeRange = () => {
    if (discount) {
      const start = new Date(discount.createdAt);
      const end = new Date();

      setStartDate(start);
      setEndDate(end);
      setStartDateInput(format(start, "dd/MM/yyyy"));
      setEndDateInput(format(end, "dd/MM/yyyy"));
      setStartDateError(null);
      setEndDateError(null);
    }
  };

  // Apply the date range
  const applyDateRange = () => {
    // Revalidate both dates
    const startValid = validateDate(startDateInput, true);
    const endValid = validateDate(endDateInput, false);

    if (!startValid || !endValid) {
      return; // Stop if validation fails
    }

    // Ensure we have dates to pass
    if (!startDate || !endDate) {
      console.error("Dates are undefined but validation passed");
      return;
    }

    // Close sheet first to avoid UI issues
    onOpenChange(false);

    // Then notify parent with the selected dates
    // Use a minor setTimeout to ensure UI updates first
    setTimeout(() => {
      onApplyDateRange(startDate, endDate);
    }, 50);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "p-0 flex flex-col",
          isMobile ? "w-full h-[90vh] max-h-[90vh]" : "w-[400px] sm:max-w-lg"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b p-4 pb-3 shadow-sm">
          <SheetTitle className="text-lg font-semibold">
            Select Date Range
          </SheetTitle>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-[76px]">
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <div className="flex space-x-2">
                  <Input
                    id="start-date"
                    value={startDateInput}
                    onChange={(e) => handleDateChange(e.target.value, true)}
                    placeholder="DD/MM/YYYY"
                    className={startDateError ? "border-red-500" : ""}
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
                        selected={startDate}
                        onSelect={(date) => handleCalendarSelect(date, true)}
                        disabled={(date) => {
                          const creationDate = discount
                            ? new Date(discount.createdAt)
                            : new Date(0);
                          return (
                            date < creationDate ||
                            date > new Date() ||
                            (endDate ? date > endDate : false)
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {startDateError && (
                  <p className="text-xs text-red-500">{startDateError}</p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <div className="flex space-x-2">
                  <Input
                    id="end-date"
                    value={endDateInput}
                    onChange={(e) => handleDateChange(e.target.value, false)}
                    placeholder="DD/MM/YYYY"
                    className={endDateError ? "border-red-500" : ""}
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
                        selected={endDate}
                        onSelect={(date) => handleCalendarSelect(date, false)}
                        disabled={(date) => {
                          const creationDate = discount
                            ? new Date(discount.createdAt)
                            : new Date(0);
                          return (
                            date < creationDate ||
                            date > new Date() ||
                            (startDate ? date < startDate : false)
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {endDateError && (
                  <p className="text-xs text-red-500">{endDateError}</p>
                )}
              </div>
            </div>

            {/* Quick Selections */}
            <div className="space-y-2">
              <Label>Quick Selections</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setPredefinedRange(7)}>
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPredefinedRange(30)}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPredefinedRange(90)}
                >
                  Last 3 Months
                </Button>
                <Button variant="outline" onClick={setAllTimeRange}>
                  All Time
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t p-4 shadow-md">
          <div className="flex flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={applyDateRange} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
