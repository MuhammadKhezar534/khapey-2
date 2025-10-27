import { branchMultipliers, branchColors } from "./dashboard-data";

// Types for sales data
export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  averageOrder: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  percentage: number;
  growth: number;
}

export interface BranchSales {
  branch: string;
  revenue: number;
  orders: number;
  averageOrder: number;
  growth: number;
  color: string;
}

export interface TopSellingItem {
  name: string;
  quantity: number;
  revenue: number;
  category: string;
  growth: number;
}

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growthRate: number;
}

// Helper function to get time range data points
const getTimeRangePoints = (timeRange: string): string[] => {
  switch (timeRange) {
    case "week":
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    case "month":
    case "last-month":
      return ["W1", "W2", "W3", "W4"];
    case "today":
      return ["6am", "9am", "12pm", "3pm", "6pm", "9pm", "12am"];
    default: // "all"
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  }
};

// Generate sales data based on time range
export const getSalesData = (
  timeRange: string,
  selectedBranch: string
): SalesDataPoint[] => {
  const multiplier = selectedBranch
    ? branchMultipliers[selectedBranch] || 1
    : 1;
  const timePoints = getTimeRangePoints(timeRange);

  // Base values for different time ranges
  let baseRevenue: number;
  let baseOrders: number;

  switch (timeRange) {
    case "week":
      baseRevenue = 5000;
      baseOrders = 200;
      break;
    case "month":
      baseRevenue = 20000;
      baseOrders = 800;
      break;
    case "last-month":
      baseRevenue = 18000;
      baseOrders = 750;
      break;
    case "today":
      baseRevenue = 1000;
      baseOrders = 40;
      break;
    default: // "all"
      baseRevenue = 80000;
      baseOrders = 3200;
      break;
  }

  return timePoints.map((date, index) => {
    // Add some variability
    const variability = 0.8 + Math.random() * 0.4;
    const growthFactor = 1 + index * 0.05;

    const revenue = Math.round(
      (baseRevenue * multiplier * variability * growthFactor) /
        timePoints.length
    );
    const orders = Math.round(
      (baseOrders * multiplier * variability * growthFactor) / timePoints.length
    );
    const averageOrder = Math.round(revenue / orders);

    return {
      date,
      revenue,
      orders,
      averageOrder,
    };
  });
};

// Generate category sales data
export const getCategorySales = (selectedBranch: string): CategorySales[] => {
  const multiplier = selectedBranch
    ? branchMultipliers[selectedBranch] || 1
    : 1;

  const categories = [
    { name: "Main Dishes", baseRevenue: 45000, baseGrowth: 12 },
    { name: "Appetizers", baseRevenue: 20000, baseGrowth: 8 },
    { name: "Desserts", baseRevenue: 15000, baseGrowth: 15 },
    { name: "Beverages", baseRevenue: 25000, baseGrowth: 5 },
    { name: "Specials", baseRevenue: 10000, baseGrowth: 20 },
  ];

  const categoryData = categories.map((cat) => {
    const variability = 0.9 + Math.random() * 0.2;
    return {
      category: cat.name,
      revenue: Math.round(cat.baseRevenue * multiplier * variability),
      growth: Math.round(cat.baseGrowth * (0.8 + Math.random() * 0.4)),
    };
  });

  // Calculate total revenue and percentages
  const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.revenue, 0);

  return categoryData.map((cat) => ({
    ...cat,
    percentage: Math.round((cat.revenue / totalRevenue) * 100),
  }));
};

// Generate branch sales data
export const getBranchSales = (): BranchSales[] => {
  const branches = Object.keys(branchMultipliers);

  return branches.map((branch) => {
    const multiplier = branchMultipliers[branch];
    const baseRevenue = 25000;
    const baseOrders = 1000;
    const variability = 0.9 + Math.random() * 0.2;

    const revenue = Math.round(baseRevenue * multiplier * variability);
    const orders = Math.round(baseOrders * multiplier * variability);

    return {
      branch,
      revenue,
      orders,
      averageOrder: Math.round(revenue / orders),
      growth: Math.round(10 * multiplier * (0.8 + Math.random() * 0.4)),
      color: branchColors[branch] || "hsl(var(--chart-1))",
    };
  });
};

// Generate top selling items
export const getTopSellingItems = (
  selectedBranch: string
): TopSellingItem[] => {
  const multiplier = selectedBranch
    ? branchMultipliers[selectedBranch] || 1
    : 1;

  const items = [
    {
      name: "Signature Burger",
      category: "Main Dishes",
      baseQuantity: 500,
      baseRevenue: 7500,
      baseGrowth: 15,
    },
    {
      name: "Chicken Wings",
      category: "Appetizers",
      baseQuantity: 450,
      baseRevenue: 5400,
      baseGrowth: 8,
    },
    {
      name: "Chocolate Cake",
      category: "Desserts",
      baseQuantity: 350,
      baseRevenue: 3500,
      baseGrowth: 12,
    },
    {
      name: "Craft Beer",
      category: "Beverages",
      baseQuantity: 600,
      baseRevenue: 4800,
      baseGrowth: 5,
    },
    {
      name: "Seafood Platter",
      category: "Specials",
      baseQuantity: 200,
      baseRevenue: 6000,
      baseGrowth: 20,
    },
    {
      name: "Caesar Salad",
      category: "Appetizers",
      baseQuantity: 380,
      baseRevenue: 3800,
      baseGrowth: 7,
    },
    {
      name: "Steak",
      category: "Main Dishes",
      baseQuantity: 320,
      baseRevenue: 9600,
      baseGrowth: 10,
    },
    {
      name: "Cheesecake",
      category: "Desserts",
      baseQuantity: 280,
      baseRevenue: 2800,
      baseGrowth: 15,
    },
  ];

  return items
    .map((item) => {
      const variability = 0.9 + Math.random() * 0.2;
      return {
        name: item.name,
        category: item.category,
        quantity: Math.round(item.baseQuantity * multiplier * variability),
        revenue: Math.round(item.baseRevenue * multiplier * variability),
        growth: Math.round(item.baseGrowth * (0.8 + Math.random() * 0.4)),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
};

// Calculate sales stats
export const getSalesStats = (
  timeRange: string,
  selectedBranch: string
): SalesStats => {
  const salesData = getSalesData(timeRange, selectedBranch);

  const totalRevenue = salesData.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = salesData.reduce((sum, point) => sum + point.orders, 0);
  const averageOrderValue = Math.round(totalRevenue / totalOrders);

  // Calculate growth rate based on time range
  let growthRate: number;
  switch (timeRange) {
    case "week":
      growthRate = 8.5;
      break;
    case "month":
      growthRate = 12.3;
      break;
    case "last-month":
      growthRate = 10.7;
      break;
    case "today":
      growthRate = 5.2;
      break;
    default: // "all"
      growthRate = 15.8;
      break;
  }

  // Apply branch multiplier to growth rate
  const multiplier = selectedBranch
    ? branchMultipliers[selectedBranch] || 1
    : 1;
  growthRate = growthRate * (0.8 + multiplier * 0.2);

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    growthRate,
  };
};
