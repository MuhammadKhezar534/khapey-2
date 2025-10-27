"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimePickerProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse the initial value
  useEffect(() => {
    if (value) {
      const [hoursStr, minutesStr] = value.split(":")
      setHours(Number.parseInt(hoursStr, 10))
      setMinutes(Number.parseInt(minutesStr, 10))
    } else {
      // Default to current time
      const now = new Date()
      setHours(now.getHours())
      setMinutes(now.getMinutes())
    }
  }, [value])

  // Format time as HH:MM
  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update time when hours or minutes change
  useEffect(() => {
    onChange(formatTime(hours, minutes))
  }, [hours, minutes, onChange])

  // Increment/decrement hours
  const adjustHours = (increment: boolean) => {
    setHours((prev) => {
      let newHours = increment ? prev + 1 : prev - 1
      if (newHours > 23) newHours = 0
      if (newHours < 0) newHours = 23
      return newHours
    })
  }

  // Increment/decrement minutes
  const adjustMinutes = (increment: boolean) => {
    setMinutes((prev) => {
      let newMinutes = increment ? prev + 1 : prev - 1
      if (newMinutes > 59) newMinutes = 0
      if (newMinutes < 0) newMinutes = 59
      return newMinutes
    })
  }

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={cn(
          "flex items-center border rounded-md px-3 py-2 h-10 cursor-pointer",
          disabled ? "bg-muted cursor-not-allowed" : "hover:border-input",
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{formatTime(hours, minutes)}</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-popover border rounded-md shadow-md p-4 w-64">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center">
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => adjustHours(true)}>
                ▲
              </Button>
              <Input
                type="text"
                value={hours.toString().padStart(2, "0")}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value, 10)
                  if (!isNaN(val) && val >= 0 && val <= 23) {
                    setHours(val)
                  }
                }}
                className="w-16 text-center"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => adjustHours(false)}
              >
                ▼
              </Button>
            </div>

            <span className="text-xl font-bold">:</span>

            <div className="flex flex-col items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => adjustMinutes(true)}
              >
                ▲
              </Button>
              <Input
                type="text"
                value={minutes.toString().padStart(2, "0")}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value, 10)
                  if (!isNaN(val) && val >= 0 && val <= 59) {
                    setMinutes(val)
                  }
                }}
                className="w-16 text-center"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => adjustMinutes(false)}
              >
                ▼
              </Button>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={() => setIsOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
