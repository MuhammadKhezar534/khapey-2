"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { Discount } from "@/types/discounts"

interface DiscountVisualizationProps {
  discounts: Discount[]
}

export function DiscountVisualization({ discounts }: DiscountVisualizationProps) {
  const [view, setView] = useState<"distribution" | "status">("distribution")

  // Calculate data for type distribution chart
  const typeDistribution = [
    { name: "Loyalty", value: discounts.filter((d) => d.type === "loyalty").length },
    { name: "Percentage", value: discounts.filter((d) => d.type === "percentageDeal").length },
    { name: "Bank", value: discounts.filter((d) => d.type === "bankDiscount").length },
  ].filter((item) => item.value > 0)

  // Calculate data for status chart
  const statusDistribution = [
    { name: "Active", value: discounts.filter((d) => d.status === "active").length },
    { name: "Inactive", value: discounts.filter((d) => d.status === "inactive").length },
  ]

  const COLORS = ["#3498db", "#9b59b6", "#e67e22", "#2ecc71", "#f1c40f"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Discount Analytics</CardTitle>
        <Tabs defaultValue="distribution" className="w-full" onValueChange={(v) => setView(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distribution">Type Distribution</TabsTrigger>
            <TabsTrigger value="status">Status Overview</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {discounts.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            No discount data available
          </div>
        ) : view === "distribution" ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} discounts`, "Count"]} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} discounts`, "Count"]} />
              <Bar dataKey="value" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
