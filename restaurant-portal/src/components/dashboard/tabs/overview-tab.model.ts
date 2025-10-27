export interface BranchStatsData {
  total_views: Metric;
  total_likes: Metric;
  reviews_rating: ReviewRating;
  total_revenue: Metric;
  like_ration: Metric;
  total_phone_click: Metric;
  total_saves: Metric;
  total_shares: Metric;
}

export interface Metric {
  current: number;
  last_month: number;
}

export interface ReviewRating {
  current_reviews: number;
  last_month_reviews: number;
  current_rating: number;
  last_month_rating: number;
}
