"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ChartTooltipContent } from "@/components/ui/chart-tooltip-content"
import { getChartMargins, shouldAngleLabels, getTickCount } from "@/utils/dashboard-data"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import ErrorBoundary from "@/components/error-boundary"

interface MetricsChartProps {
  data: any[]
  title: string
  description: string
  windowWidth: number
  timeRange: string
  type: "line" | "bar"
  dataKeys: string[]
  isLoading?: boolean
}

export function MetricsChart({
  data,
  title,
  description,
  windowWidth,
  timeRange,
  type = "line",
  dataKeys,
  isLoading = false,
}: MetricsChartProps) {
  // Memoize chart configuration to prevent unnecessary recalculations
  const chartConfig = useMemo(
    () => ({
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
    }),
    [],
  )

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="p-3 md:p-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="p-2 md:p-3">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorBoundary componentName="Metrics Chart">
      <Card className="overflow-hidden">
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-sm md:text-sm">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-3">
          <div
            className={`h-[${type === "line" ? "400" : "300"}px] md:h-[${type === "line" ? "450" : "350"}px] w-full max-w-full overflow-hidden`}
          >
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="99%" height="100%">
                <ComposedChart data={data} margin={getChartMargins(windowWidth)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={shouldAngleLabels(windowWidth, timeRange) ? -45 : 0}
                    textAnchor={shouldAngleLabels(windowWidth, timeRange) ? "end" : "middle"}
                    height={shouldAngleLabels(windowWidth, timeRange) ? 60 : 30}
                    tickCount={getTickCount(windowWidth)}
                    tickFormatter={(value) => {
                      // Truncate long labels on small screens
                      if (windowWidth < 640 && value.length > 3) {
                        return value.substring(0, 3)
                      } else if (windowWidth < 400 && value.length > 2) {
                        return value.substring(0, 2)
                      }
                      return value
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: windowWidth < 768 ? 10 : 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={40}
                    tickCount={5}
                    domain={["auto", "auto"]}
                    padding={{ top: 10, bottom: 10 }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "rgba(0, 0, 0, 0.1)", strokeWidth: 1, strokeDasharray: "3 3" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    fontSize={12}
                    wrapperStyle={{ fontSize: "12px", marginTop: "10px" }}
                    formatter={(value) => {
                      if (value === "views") return "Views"
                      if (value === "likes") return "Likes"
                      if (value === "shares") return "Shares"
                      if (value === "saves") return "Saves"
                      if (value === "reviews") return "Reviews"
                      return value
                    }}
                  />

                  {type === "line" ? (
                    // Render lines for each data key
                    dataKeys.map((key) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={`var(--color-${key})`}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6, stroke: `var(--color-${key})`, strokeWidth: 2, fill: "white" }}
                      />
                    ))
                  ) : (
                    // Render bars for the first data key
                    <Bar
                      dataKey={dataKeys[0]}
                      fill={`var(--color-${dataKeys[0]})`}
                      radius={[4, 4, 0, 0]}
                      barSize={windowWidth < 768 ? 30 : 45}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
