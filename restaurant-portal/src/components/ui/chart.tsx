"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

interface ChartRootProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig
}

const ChartRoot = React.forwardRef<HTMLDivElement, ChartRootProps>(({ config, className, children, ...props }, ref) => {
  // Create CSS variables for each color in the config
  const style = React.useMemo(() => {
    if (!config) return {}

    return Object.entries(config).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [`--color-${key}`]: value.color,
      }
    }, {})
  }, [config])

  return (
    <div ref={ref} className={cn("w-full", className)} style={style} {...props}>
      {children}
    </div>
  )
})
ChartRoot.displayName = "ChartRoot"

const ChartContainer = ChartRoot

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = React.forwardRef<React.ElementRef<"div">, RechartsPrimitive.ChartTooltipProps<any, any>>(
  ({ content, ...props }, ref) => {
    return <div ref={ref} {...props} />
  },
)
ChartTooltip.displayName = "ChartTooltip"

// Create a Chart component as an alias for compatibility
const Chart = ({ children, ...props }: React.ComponentProps<typeof RechartsPrimitive.ComposedChart>) => {
  return <RechartsPrimitive.ComposedChart {...props}>{children}</RechartsPrimitive.ComposedChart>
}

export { ChartContainer, ChartTooltip, ChartStyle, Chart }
export const {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Sector,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} = RechartsPrimitive
