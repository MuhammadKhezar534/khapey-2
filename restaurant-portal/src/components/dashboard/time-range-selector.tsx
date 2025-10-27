"use client";

import { Button } from "@/components/ui/button";
import { defaultTimeRanges, type TimeRangeOption } from "@/config/time-ranges";

interface TimeRangeSelectorProps {
  timeRange: TimeRangeOption;
  setTimeRange: (range: TimeRangeOption) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshData: () => void;
  isMobile: boolean;
  title: string;
  options?: TimeRangeOption[];
}

export function TimeRangeSelector({
  timeRange,
  setTimeRange,
  isLoading,
  isRefreshing,
  refreshData,
  isMobile,
  title,
  options = defaultTimeRanges,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 w-full max-w-full">
      <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto hide-scrollbar max-w-full">
        {options.map((option) => (
          <Button
            key={option.id}
            variant={timeRange?.value === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(option)}
            className="text-xs h-8 md:h-9 px-3 md:px-4 whitespace-nowrap"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
