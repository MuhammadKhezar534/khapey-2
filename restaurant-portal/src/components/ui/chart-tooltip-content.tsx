"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      [key: string]: any
    }
    dataKey: string
    fill?: string
    stroke?: string
  }>
  label?: string
  config?: any
  formatter?: (value: number, name: string) => [string, string]
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps & React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { active, payload, label, className, formatter, ...htmlDivProps } = props

  const getFormattedValue = (value: number, name: string) => {
    if (formatter) {
      return formatter(value, name)
    }

    // Format numbers with commas for thousands
    const formattedValue = value.toLocaleString()

    // Add % sign for engagement values
    if (name.toLowerCase() === "engagement") {
      return [name, `${formattedValue}%`]
    }

    return [name, formattedValue]
  }

  if (active && payload?.length) {
    return (
      <div ref={ref} className={cn("rounded-lg border bg-background p-3 shadow-md", className)} {...htmlDivProps}>
        <div className="grid gap-1.5">
          {label && <p className="text-xs font-medium mb-1">{label}</p>}
          {payload.map((item, index) => {
            const [name, value] = getFormattedValue(item.value, item.name || item.dataKey)
            return (
              <div key={index} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: item.fill || item.stroke,
                    }}
                  />
                  <p className="text-xs text-muted-foreground capitalize">{name}</p>
                </div>
                <p className="text-xs font-medium">{value}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartTooltipContent }
