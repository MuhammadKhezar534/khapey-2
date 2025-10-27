"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  BarChart2,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import { TimeRangeSelector } from "@/components/dashboard/time-range-selector";
import { useBranch } from "@/contexts/branch-context";
import type { TimeRange } from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";

// Simple dummy data directly in the component
const dummyStats = {
  totalRevenue: 113000,
  totalOrders: 2800,
  averageOrderValue: 40.36,
  growthRate: 12.5,
};

const dummyCategories = [
  { category: "Main Dishes", revenue: 45000, percentage: 40, growth: 12 },
  { category: "Appetizers", revenue: 25000, percentage: 22, growth: 8 },
  { category: "Desserts", revenue: 18000, percentage: 16, growth: 15 },
  { category: "Beverages", revenue: 15000, percentage: 13, growth: 5 },
  { category: "Sides", revenue: 10000, percentage: 9, growth: 3 },
];

export default function SalesReportPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const { selectedBranch } = useBranch();

  console.log("NEW SALES PAGE RENDERING at /reporting-sales");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Sales Reports</h1>
        <TimeRangeSelector
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          isLoading={false}
          isRefreshing={false}
          refreshData={() => {}}
          isMobile={false}
          title="Sales Reports"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(dummyStats.totalRevenue)}
                </h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500 font-medium">
                +{dummyStats.growthRate.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                vs previous
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">
                  {dummyStats.totalOrders.toLocaleString()}
                </h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500 font-medium">
                +{(dummyStats.growthRate * 0.8).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                vs previous
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Average Order</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(dummyStats.averageOrderValue)}
                </h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500 font-medium">
                +{(dummyStats.growthRate * 0.5).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                vs previous
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <h3 className="text-2xl font-bold mt-1">
                  {dummyStats.growthRate.toFixed(1)}%
                </h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500 font-medium">+2.3%</span>
              <span className="text-xs text-muted-foreground ml-1">
                vs previous
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dummyCategories.map((category) => (
              <div key={category.category} className="flex items-center">
                <div className="w-1/3">
                  <p className="text-sm font-medium">{category.category}</p>
                </div>
                <div className="w-1/3">
                  <div className="flex items-center">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm">{category.percentage}%</span>
                  </div>
                </div>
                <div className="w-1/3 text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(category.revenue)}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">
                      +{category.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
