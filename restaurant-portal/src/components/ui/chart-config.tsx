import type { ReactNode } from "react"

export interface ChartConfigProps {
  title: string
  description?: string
  height?: number | string
  width?: number | string
  dataKeys: string[]
  colors?: Record<string, string>
  labels?: Record<string, string>
  children: ReactNode
}

export const defaultChartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-2))",
  },
  shares: {
    label: "Shares",
    color: "hsl(var(--chart-3))",
  },
  saves: {
    label: "Saves",
    color: "hsl(var(--chart-4))",
  },
  reviews: {
    label: "Reviews",
    color: "hsl(var(--chart-5))",
  },
}

export function ChartConfig({
  title,
  description,
  height = "400px",
  width = "100%",
  dataKeys,
  colors,
  labels,
  children,
}: ChartConfigProps) {
  // Create a config object for the ChartContainer
  const chartConfig = dataKeys.reduce(
    (acc, key) => {
      acc[key] = {
        label: labels?.[key] || defaultChartConfig[key as keyof typeof defaultChartConfig]?.label || key,
        color:
          colors?.[key] || defaultChartConfig[key as keyof typeof defaultChartConfig]?.color || `hsl(var(--chart-1))`,
      }
      return acc
    },
    {} as Record<string, { label: string; color: string }>,
  )

  return <div style={{ height, width }}>{children({ title, description, chartConfig })}</div>
}
