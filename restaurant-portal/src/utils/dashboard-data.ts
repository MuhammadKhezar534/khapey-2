export const branchMultipliers: Record<string, number> = {
  Gulberg: 0.8,
  "DHA Phase 5": 1.2,
  "Johar Town": 0.9,
  "MM Alam Road": 1.1,
  "Bahria Town": 0.7,
};

export const colorPalette = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
  "hsl(var(--chart-9))",
  "hsl(var(--chart-10))",
];

export const branchColors: Record<string, string> = {
  Gulberg: "hsl(var(--chart-1))",
  "DHA Phase 5": "hsl(var(--chart-2))",
  "Johar Town": "hsl(var(--chart-3))",
  "MM Alam Road": "hsl(var(--chart-4))",
  "Bahria Town": "hsl(var(--chart-5))",
};

// Helper function to get time range data points
const getTimeRangePoints = (timeRange: string): string[] => {
  switch (timeRange) {
    case "this_week":
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    case "this_month":
    case "last_month":
      return ["W1", "W2", "W3", "W4"];
    case "today":
      return ["6am", "9am", "12pm", "3pm", "6pm", "9pm", "12am"];
    default: // "all"
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  }
};

// Helper function to get multiplier for selected branch
export const getMultiplier = (selectedBranch: string): number => {
  if (!selectedBranch) return 1;
  return branchMultipliers[selectedBranch] || 1;
};

// Define the MetricsDataPoint type
export interface MetricsDataPoint {
  name: string;
  views: number;
  likes: number;
  shares: number;
  saves: number;
}

export function getMetricsData(
  timeRange: string,
  branchStats: any
): MetricsDataPoint[] {
  console.log({ branchStats });
  const timePoints = getTimeRangePoints(timeRange);

  const baseValues = (() => {
    return {
      views: branchStats?.total_views.current || 0,
      likes: branchStats?.total_likes.current || 0,
      shares: branchStats?.total_shares.current || 0,
      saves: branchStats?.total_saves.current || 0,
      reviews: branchStats?.reviews_rating.current_reviews || 0,
    };
  })();

  return timePoints.map((name) => {
    return {
      name,
      views: Math.round(baseValues.views),
      likes: Math.round(baseValues.likes),
      shares: Math.round(baseValues.shares),
      saves: Math.round(baseValues.saves),
    };
  });
}

// Generate reviews data based on time range
export const getReviewsData = (timeRange: string, selectedBranch: string) => {
  const multiplier = getMultiplier(selectedBranch);
  const timePoints = getTimeRangePoints(timeRange);

  // Base values for different time ranges
  let baseValues: number[];

  switch (timeRange) {
    case "week":
      baseValues = [12, 18, 24, 20, 28, 32, 26];
      break;
    case "month":
      baseValues = [80, 120, 140, 160];
      break;
    case "last-month":
      baseValues = [75, 110, 130, 150];
      break;
    case "today":
      baseValues = [2, 5, 10, 15, 20, 18, 8];
      break;
    default: // "all"
      baseValues = [320, 380, 420, 460, 520, 580, 620, 680];
      break;
  }

  // Map time points to data points with multiplier
  return timePoints.map((name, index) => ({
    name,
    reviews: Math.round((baseValues[index] || baseValues[0]) * multiplier),
  }));
};

// Generate engagement data based on time range
export const getEngagementData = (
  timeRange: string,
  selectedBranch: string
) => {
  const multiplier = getMultiplier(selectedBranch);
  // For engagement, we'll use a smaller multiplier effect since it's a percentage
  const adjustedMultiplier = 1 + (multiplier - 1) * 0.3;
  const timePoints = getTimeRangePoints(timeRange);

  // Base values for different time ranges
  let baseValues: number[];

  switch (timeRange) {
    case "week":
      baseValues = [40, 45, 50, 55, 60, 65, 70];
      break;
    case "month":
      baseValues = [45, 55, 65, 75];
      break;
    case "last-month":
      baseValues = [42, 52, 62, 72];
      break;
    case "today":
      baseValues = [30, 40, 50, 60, 70, 65, 55];
      break;
    default: // "all"
      baseValues = [50, 55, 60, 65, 70, 75, 80, 85];
      break;
  }

  // Map time points to data points with adjusted multiplier
  return timePoints.map((name, index) => ({
    name,
    engagement: Math.round(
      (baseValues[index] || baseValues[0]) * adjustedMultiplier
    ),
  }));
};

// Branch data for the detailed table
export const getBranchDetailedData = () => {
  const branchNames = Object.keys(branchMultipliers);

  // Base values for each metric
  const baseReviews = 1248;
  const baseViews = 24892;
  const baseLikes = 8645;
  const baseRevenue = 12500;
  const baseSaves = 3782;
  const baseShares = 2156;
  const baseDiscount = 2500; // Base value for total discount

  // Calculate totals and branch data in a single pass
  const { totals, branchData } = branchNames.reduce(
    (acc, branch) => {
      const multiplier = branchMultipliers[branch];
      const reviews = Math.round(baseReviews * multiplier);
      const views = Math.round(baseViews * multiplier);
      const likes = Math.round(baseLikes * multiplier);
      const revenue = Math.round(baseRevenue * multiplier);
      const saves = Math.round(baseSaves * multiplier);
      const shares = Math.round(baseShares * multiplier);
      const discount = Math.round(baseDiscount * multiplier);

      // Generate varied ratings for different branches
      let rating;
      switch (branch) {
        case "DHA Phase 5":
          rating = 4.8;
          break;
        case "Gulberg":
          rating = 3.7;
          break;
        case "Johar Town":
          rating = 4.2;
          break;
        case "MM Alam Road":
          rating = 4.9;
          break;
        case "Bahria Town":
          rating = 2.8;
          break;
        default:
          rating = 4.0;
      }

      // Update totals
      acc.totals.reviews += reviews;
      acc.totals.views += views;
      acc.totals.likes += likes;
      acc.totals.revenue += revenue;
      acc.totals.saves += saves;
      acc.totals.shares += shares;
      acc.totals.discounts += discount;

      // Add branch data
      acc.branchData.push({
        branch,
        reviews,
        views,
        likes,
        revenue,
        saves,
        shares,
        rating,
        totalDiscount: discount,
      });

      return acc;
    },
    {
      totals: {
        reviews: 0,
        views: 0,
        likes: 0,
        revenue: 0,
        saves: 0,
        shares: 0,
        discounts: 0,
      },
      branchData: [] as any[],
    }
  );

  // Calculate percentages in a second pass
  return branchData.map((item) => ({
    ...item,
    reviewsPercent:
      totals.reviews > 0
        ? Math.round((item.reviews / totals.reviews) * 100)
        : 0,
    viewsPercent:
      totals.views > 0 ? Math.round((item.views / totals.views) * 100) : 0,
    likesPercent:
      totals.likes > 0 ? Math.round((item.likes / totals.likes) * 100) : 0,
    revenuePercent:
      totals.revenue > 0
        ? Math.round((item.revenue / totals.revenue) * 100)
        : 0,
    savesPercent:
      totals.saves > 0 ? Math.round((item.saves / totals.saves) * 100) : 0,
    sharesPercent:
      totals.shares > 0 ? Math.round((item.shares / totals.shares) * 100) : 0,
    discountPercent:
      totals.discounts > 0
        ? Math.round((item.totalDiscount / totals.discounts) * 100)
        : 0,
  }));
};

// Get branch data for the Branches tab
export const getBranchData = (selectedBranch: string) => {
  const branchNames = Object.keys(branchMultipliers);

  // If a branch is selected, only return that branch's data
  if (selectedBranch) {
    const index = branchNames.indexOf(selectedBranch);
    if (index !== -1) {
      const multiplier = branchMultipliers[selectedBranch];
      return [
        {
          name: selectedBranch,
          revenue: Math.floor(Math.random() * 1000) + 500,
          performance: 85 - index * 10, // Decreasing performance by branch index
        },
      ];
    }
  }

  // Otherwise return all branches with calculated performance
  return branchNames.map((branch, index) => ({
    name: branch,
    revenue: Math.floor(Math.random() * 1000) + 500,
    performance: 85 - index * 10, // Decreasing performance by branch index
  }));
};

// Get breakdown data for stacked bars
export const getBreakdownData = () => {
  const branchData = getBranchDetailedData();

  return {
    reviews: branchData.map((item) => ({
      name: item.branch,
      value: item.reviews,
      percent: item.reviewsPercent,
    })),
    revenue: branchData.map((item) => ({
      name: item.branch,
      value: item.revenue,
      percent: item.revenuePercent,
    })),
    discounts: branchData.map((item) => ({
      name: item.branch,
      value: item.totalDiscount,
      percent: item.discountPercent,
    })),
  };
};

// Add this helper function to reduce duplication
function applyBranchMultiplier(
  baseValue: number,
  selectedBranch: string
): number {
  const multiplier = getMultiplier(selectedBranch);
  return Math.round(baseValue * multiplier);
}

// Calculate stats based on selected branch
export const getStats = (selectedBranch: string) => {
  return {
    totalViews: applyBranchMultiplier(24892, selectedBranch),
    totalLikes: applyBranchMultiplier(8645, selectedBranch),
    totalReviews: applyBranchMultiplier(1248, selectedBranch),
    totalPhoneClicks: applyBranchMultiplier(1432, selectedBranch),
    totalSaves: applyBranchMultiplier(3782, selectedBranch),
    totalShares: applyBranchMultiplier(2156, selectedBranch),
  };
};

// Get chart margins based on screen size
export const getChartMargins = (windowWidth: number) => {
  if (windowWidth < 400) {
    return { top: 20, right: 20, left: 20, bottom: 60 };
  } else if (windowWidth < 640) {
    return { top: 20, right: 20, left: 20, bottom: 60 };
  } else if (windowWidth < 768) {
    return { top: 20, right: 20, left: 20, bottom: 50 };
  } else {
    return { top: 20, right: 20, left: 20, bottom: 40 };
  }
};

// Determine if we should angle the labels based on screen size and data length
export const shouldAngleLabels = (
  windowWidth: number,
  timeRange: string
): boolean => {
  if (windowWidth < 768) return true;
  if (timeRange === "all" && windowWidth < 1200) return true;
  return false;
};

// Get the number of ticks to display based on screen width
export const getTickCount = (windowWidth: number): number | undefined => {
  if (windowWidth < 400) return 2;
  if (windowWidth < 640) return 3;
  if (windowWidth < 768) return 4;
  return undefined; // Let Recharts decide for larger screens
};
