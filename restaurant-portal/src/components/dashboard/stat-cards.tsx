"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Eye,
  ThumbsUp,
  Star,
  Phone,
  Bookmark,
  Share2,
  DollarSign,
} from "lucide-react";
import { memo } from "react";
import { BranchStatsData } from "./tabs/overview-tab.model";
import PercentageChange from "./percentageChange";
import { TimeRangeOption } from "@/config/time-ranges";

interface StatCardsProps {
  timeRange: TimeRangeOption;
  isLoading?: boolean;
  branchStatsData: BranchStatsData;
}

export const StatCards = memo(function StatCards({
  branchStatsData,
  timeRange,
  isLoading,
}: StatCardsProps) {
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full max-w-full overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <Card key={`skeleton-top-${i}`} className="overflow-hidden">
              <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
                <div className="h-5 bg-muted rounded animate-pulse w-24"></div>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
                <div className="h-7 bg-muted rounded animate-pulse w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full max-w-full overflow-hidden mt-2 md:mt-3">
          {[...Array(4)].map((_, i) => (
            <Card key={`skeleton-bottom-${i}`} className="overflow-hidden">
              <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
                <div className="h-5 bg-muted rounded animate-pulse w-24"></div>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
                <div className="h-7 bg-muted rounded animate-pulse w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  const {
    total_likes,
    total_phone_click,
    total_revenue,
    total_saves,
    total_shares,
    total_views,
    reviews_rating,
    like_ration,
  } = branchStatsData;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full max-w-full overflow-hidden">
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
            <CardTitle className="flex items-center text-sm md:text-sm font-medium">
              <Eye
                className="h-4 w-4 md:h-4 md:w-4 mr-1 md:mr-2 text-muted-foreground"
                aria-hidden="true"
              />
              <span id="views-title">Total Views</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
            <div
              className="text-base md:text-xl font-bold truncate"
              aria-labelledby="views-title"
            >
              {formatNumber(total_views?.current)}
            </div>
            <p className="text-xs text-green-500 truncate">
              <PercentageChange
                current={total_views?.current}
                lastMonth={total_views?.last_month}
                timePeriod="month"
              />
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
            <CardTitle className="flex items-center text-sm md:text-sm font-medium">
              <ThumbsUp
                className="h-4 w-4 md:h-4 md:w-4 mr-1 md:mr-2 text-muted-foreground"
                aria-hidden="true"
              />
              <span id="likes-title">Total Likes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
            <div
              className="text-base md:text-xl font-bold truncate"
              aria-labelledby="likes-title"
            >
              {formatNumber(total_likes?.current)}
            </div>
            <p className="text-xs text-green-500 truncate">
              <PercentageChange
                current={total_likes?.current}
                lastMonth={total_likes?.last_month}
                timePeriod="month"
              />
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
            <CardTitle className="flex items-center text-sm md:text-sm font-medium">
              <Star
                className="h-4 w-4 md:h-4 md:w-4 mr-1 md:mr-2 text-muted-foreground"
                aria-hidden="true"
              />
              <span id="reviews-title">Reviews & Rating</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
            <div
              className="text-base md:text-xl font-bold truncate flex items-center"
              aria-labelledby="reviews-title"
            >
              <Star className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              {formatNumber(reviews_rating?.current_reviews)}
              <span className="text-muted-foreground">
                ({reviews_rating?.current_rating})
              </span>
            </div>
            <p className="text-xs text-green-500 truncate">
              <PercentageChange
                current={reviews_rating?.current_reviews}
                lastMonth={reviews_rating?.last_month_reviews}
                timePeriod="month"
              />
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
            <CardTitle className="flex items-center text-sm md:text-sm font-medium">
              <DollarSign
                className="h-4 w-4 md:h-4 md:w-4 mr-1 md:mr-2 text-muted-foreground"
                aria-hidden="true"
              />
              <span id="revenue-title">Total Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
            <div
              className="text-base md:text-xl font-bold truncate"
              aria-labelledby="revenue-title"
            >
              Rs {formatNumber(total_revenue?.current)}
            </div>
            <p className="text-xs text-green-500 truncate">
              <PercentageChange
                current={total_revenue?.current}
                lastMonth={total_revenue?.last_month}
                timePeriod="month"
              />
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full max-w-full overflow-hidden">
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
            <CardTitle className="flex items-center text-sm md:text-sm font-medium">
              <ThumbsUp
                className="h-4 w-4 md:h-4 md:w-4 mr-1 md:mr-2 text-muted-foreground"
                aria-hidden="true"
              />
              <span id="like-ratio-title">Like Ratio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
            <div
              className="text-base md:text-xl font-bold truncate"
              aria-labelledby="like-ratio-title"
            >
              {like_ration?.current}%
            </div>
            <div className="mt-1 md:mt-2 h-2 md:h-2 w-full bg-muted overflow-hidden rounded-full">
              <div
                className="h-full bg-green-500"
                style={{ width: `${like_ration?.current}%` }}
                role="progressbar"
                aria-valuenow={Number.parseInt(`${like_ration?.current}`)}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
            <CardTitle className="flex items-center text-sm md:text-sm font-medium">
              <Phone
                className="h-4 w-4 md:h-4 md:w-4 mr-1 md:mr-2 text-muted-foreground"
                aria-hidden="true"
              />
              <span id="phone-clicks-title">Total Phone Clicks</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
            <div
              className="text-base md:text-xl font-bold truncate"
              aria-labelledby="phone-clicks-title"
            >
              {formatNumber(total_phone_click?.current)}
            </div>
            <p className="text-xs text-green-500 truncate">
              <PercentageChange
                current={total_phone_click?.current}
                lastMonth={total_phone_click?.last_month}
                timePeriod="month"
              />
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
            <CardTitle className="flex items-center text-sm md:text-sm font-medium">
              <Bookmark
                className="h-4 w-4 md:h-4 md:w-4 mr-1 md:mr-2 text-muted-foreground"
                aria-hidden="true"
              />
              <span id="saves-title">Total Saves</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
            <div
              className="text-base md:text-xl font-bold truncate"
              aria-labelledby="saves-title"
            >
              {formatNumber(total_saves?.current)}
            </div>
            <p className="text-xs text-green-500 truncate">
              <PercentageChange
                current={total_saves?.current}
                lastMonth={total_saves?.last_month}
                timePeriod="month"
              />
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1.5 md:p-4 md:pb-2">
            <CardTitle className="flex items-center text-sm md:text-sm font-medium">
              <Share2
                className="h-4 w-4 md:h-4 md:w-4 mr-1 md:mr-2 text-muted-foreground"
                aria-hidden="true"
              />
              <span id="shares-title">Total Shares</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-2 overflow-hidden">
            <div
              className="text-base md:text-xl font-bold truncate"
              aria-labelledby="shares-title"
            >
              {formatNumber(total_shares?.current)}
            </div>
            <p className="text-xs text-green-500 truncate">
              <PercentageChange
                current={total_shares?.current}
                lastMonth={total_shares?.last_month}
                timePeriod="month"
              />
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
});
