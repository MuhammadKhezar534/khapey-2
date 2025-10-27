// Define proper types for dashboard data
export interface MetricsDataPoint {
  name: string
  views: number
  likes: number
  shares: number
  saves: number
}

export interface ReviewsDataPoint {
  name: string
  reviews: number
}

export interface EngagementDataPoint {
  name: string
  engagement: number
}

export interface BranchDataPoint {
  name: string
  revenue: number
  performance: number
}

// Update the BranchDetailedDataPoint interface to include totalDiscount and discountPercent
export interface BranchDetailedDataPoint {
  branch: string
  reviews: number
  views: number
  likes: number
  revenue: number
  saves: number
  shares: number
  rating: number
  totalDiscount: number
  reviewsPercent: number
  viewsPercent: number
  likesPercent: number
  revenuePercent: number
  savesPercent: number
  sharesPercent: number
  discountPercent: number
}

// Update the BreakdownData interface to include discounts
export interface BreakdownData {
  reviews: Array<{
    name: string
    value: number
    percent: number
  }>
  revenue: Array<{
    name: string
    value: number
    percent: number
  }>
  discounts: Array<{
    name: string
    value: number
    percent: number
  }>
}

export interface Stats {
  totalViews: number
  totalLikes: number
  totalReviews: number
  totalPhoneClicks: number
  totalSaves: number
  totalShares: number
}

export interface DashboardData {
  metricsData: MetricsDataPoint[]
  reviewsData: ReviewsDataPoint[]
  engagementData: EngagementDataPoint[]
  branchData: BranchDataPoint[]
  branchDetailedData: BranchDetailedDataPoint[]
  breakdownData: BreakdownData
  stats: Stats
  isLoading: boolean
  isRefreshing: boolean
  refreshData: () => Promise<void>
}

export type TimeRange = "today" | "week" | "month" | "last-month" | "all"
