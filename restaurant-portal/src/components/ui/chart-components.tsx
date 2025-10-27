"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type * as RechartsPrimitive from "recharts"

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
>(({ active, payload, label, className, formatter, ...props }, ref) => {
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
      <div ref={ref} className={cn("rounded-lg border bg-background p-3 shadow-md", className)} {...props}>
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

interface ChartLegendContentProps
  extends React.ComponentProps<"div">,
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> {
  hideIcon?: boolean
  nameKey?: string
}

const ChartContext = React.createContext<{
  config: ChartConfig
}>({ config: {} })

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

type ChartConfig = {
  [key: string]: {
    label: React.ReactNode
    icon?: React.ReactNode
  }
}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  },
)
ChartLegendContent.displayName = "ChartLegendContent"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

export { ChartTooltipContent, ChartLegendContent }
