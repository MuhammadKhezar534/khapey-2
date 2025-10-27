"use client"

import { Card, CardContent } from "@/components/ui/card"

interface DiscountStatsProps {
  stats: {
    total: number
    active: number
    upcoming: number
    expired: number
    inactive: number
    loyalty: number
    percentage: number
    bank: number
    fixed: number
  }
}

export function DiscountStats({ stats }: DiscountStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Discounts</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
