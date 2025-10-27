"use client";

import { Chart } from "@/components/ui/chart";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  BarChart2,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { TimeRangeSelector } from "@/components/dashboard/time-range-selector";
import { useBranch } from "@/contexts/branch-context";
import type { TimeRange } from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

// Dummy data for sales
const getSalesData = (timeRange: TimeRange, branch: string | null) => {
  const data = [];
  const days = timeRange === "today" ? 1 : timeRange === "week" ? 7 : 30;
  const baseRevenue = 15000;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const revenue = baseRevenue + Math.random() * 10000 - 5000;
    data.unshift({
      date: date.toISOString().split("T")[0],
      revenue: revenue,
    });
  }

  return data;
};

const getCategorySales = (branch: string | null) => [
  { category: "Main Dishes", revenue: 45000, percentage: 40, growth: 12 },
  { category: "Appetizers", revenue: 25000, percentage: 22, growth: 8 },
  { category: "Desserts", revenue: 18000, percentage: 16, growth: 15 },
  { category: "Beverages", revenue: 15000, percentage: 13, growth: 5 },
  { category: "Sides", revenue: 10000, percentage: 9, growth: 3 },
];

const getBranchSales = () => [
  { branch: "Downtown", orders: 1250, revenue: 68000, growth: 15 },
  { branch: "Uptown", orders: 980, revenue: 52000, growth: 8 },
  { branch: "Westside", orders: 820, revenue: 43000, growth: -3 },
  { branch: "Eastside", orders: 750, revenue: 38000, growth: 5 },
];

const getTopSellingItems = (branch: string | null) => [
  {
    name: "Butter Chicken",
    category: "Main Dishes",
    quantity: 450,
    revenue: 13500,
    growth: 18,
  },
  {
    name: "Garlic Naan",
    category: "Sides",
    quantity: 780,
    revenue: 7800,
    growth: 12,
  },
  {
    name: "Chicken Biryani",
    category: "Main Dishes",
    quantity: 380,
    revenue: 11400,
    growth: 15,
  },
  {
    name: "Mango Lassi",
    category: "Beverages",
    quantity: 520,
    revenue: 5200,
    growth: 20,
  },
  {
    name: "Gulab Jamun",
    category: "Desserts",
    quantity: 320,
    revenue: 3200,
    growth: 10,
  },
];

const getSalesStats = (timeRange: TimeRange, branch: string | null) => ({
  totalRevenue: 113000,
  totalOrders: 2800,
  averageOrderValue: 40.36,
  growthRate: 12.5,
});

export default function SalesReportPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const { selectedBranch } = useBranch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get sales data
  const salesData = getSalesData(timeRange, selectedBranch?.branchName);
  const categorySales = getCategorySales(selectedBranch?.branchName);
  const branchSales = getBranchSales();
  const topSellingItems = getTopSellingItems(selectedBranch?.branchName);
  const salesStats = getSalesStats(timeRange, selectedBranch?.branchName);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
      <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Sales Reports</h1>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {formatCurrency(salesStats.totalRevenue)}
                  </h3>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500 font-medium">
                  +{salesStats.growthRate.toFixed(1)}%
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
                    {salesStats.totalOrders.toLocaleString()}
                  </h3>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500 font-medium">
                  +{(salesStats.growthRate * 0.8).toFixed(1)}%
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
                    {formatCurrency(salesStats.averageOrderValue)}
                  </h3>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500 font-medium">
                  +{(salesStats.growthRate * 0.5).toFixed(1)}%
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
                    {salesStats.growthRate.toFixed(1)}%
                  </h3>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500 font-medium">
                  +2.3%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs previous
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <Chart
                type="bar"
                data={salesData}
                categories={["revenue"]}
                index="date"
                colors={["hsl(var(--chart-1))"]}
                valueFormatter={(value) => formatCurrency(value)}
                showLegend={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category and Branch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorySales.map((category) => (
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
                        <span className="ml-2 text-sm">
                          {category.percentage}%
                        </span>
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

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Sales by Branch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branchSales.map((branch) => (
                  <div key={branch.branch} className="flex items-center">
                    <div className="w-1/3">
                      <p className="text-sm font-medium">{branch.branch}</p>
                    </div>
                    <div className="w-1/3">
                      <p className="text-sm">{branch.orders} orders</p>
                    </div>
                    <div className="w-1/3 text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(branch.revenue)}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        {branch.growth > 0 ? (
                          <>
                            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-500">
                              +{branch.growth}%
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                            <span className="text-xs text-red-500">
                              {branch.growth}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Items */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Item</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Category
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Quantity
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Revenue
                    </th>
                    <th className="text-right py-3 px-4 font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellingItems.slice(0, 5).map((item) => (
                    <tr key={item.name} className="border-b last:border-0">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.category}</td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-green-500">
                            +{item.growth}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PullToRefresh>
  );
}
