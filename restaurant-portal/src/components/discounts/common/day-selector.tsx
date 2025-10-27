"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DaySelectorProps {
  selectedDays: string[]
  onChange: (days: string[]) => void
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function DaySelector({ selectedDays, onChange }: DaySelectorProps) {
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day))
    } else {
      onChange([...selectedDays, day])
    }
  }

  const selectAll = () => {
    onChange([...daysOfWeek])
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {daysOfWeek.map((day) => (
          <Button
            key={day}
            type="button"
            variant="outline"
            className={cn(
              "h-9",
              selectedDays.includes(day) && "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
            onClick={() => toggleDay(day)}
          >
            {day.substring(0, 3)}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={selectAll}>
          Select All
        </Button>
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={clearAll}>
          Clear All
        </Button>
      </div>
    </div>
  )
}
