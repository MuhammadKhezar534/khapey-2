import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { branchColors, colorPalette } from "@/utils/dashboard-data";
import ErrorBoundary from "@/components/error-boundary";

interface BranchBreakdownProps {
  breakdownData: {
    reviews: Array<{ name: string; value: number; percent: number }>;
    revenue: Array<{ name: string; value: number; percent: number }>;
    discounts: Array<{ name: string; value: number; percent: number }>;
  };
}

export function BranchBreakdown({ breakdownData }: BranchBreakdownProps) {
  const totalReviews = breakdownData.reviews.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const totalRevenue = breakdownData.revenue.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // Update the component to conditionally render the discounts section

  // First, check if there are any discounts in the breakdown data
  const hasDiscounts =
    breakdownData.discounts && breakdownData.discounts.length > 0;
  const totalDiscounts = hasDiscounts
    ? breakdownData.discounts.reduce((sum, item) => sum + item.value, 0)
    : 0;

  return (
    <ErrorBoundary componentName="Branch Breakdown">
      <Card className="overflow-hidden w-full max-w-full">
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-sm md:text-base">
            Branch Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Performance distribution across all branches
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0 md:pt-0 space-y-4 md:space-y-6">
          {/* Reviews Breakdown Bar */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 md:mb-2 gap-1">
              <h3 className="text-xs md:text-sm font-medium">
                Reviews Distribution
              </h3>
              <span className="text-xs md:text-sm text-muted-foreground">
                Total: {totalReviews.toLocaleString()}
              </span>
            </div>
            <div className="h-2 md:h-3 w-full flex rounded-full overflow-hidden">
              {breakdownData.reviews.map((item, index) => (
                <div
                  key={index}
                  className="h-full"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: colorPalette[index % colorPalette.length],
                  }}
                  title={`${item.name}: ${item.value.toLocaleString()} (${
                    item.percent
                  }%)`}
                />
              ))}
            </div>
            <div className="flex flex-wrap mt-2 gap-2 md:gap-3">
              {breakdownData.reviews.map((item, index) => (
                <div key={index} className="flex items-center text-xs">
                  <div
                    className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-1.5 flex-shrink-0"
                    style={{
                      backgroundColor:
                        colorPalette[index % colorPalette.length],
                    }}
                  />
                  <span className="truncate">
                    {item.name}: {item.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown Bar */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 md:mb-2 gap-1">
              <h3 className="text-xs md:text-sm font-medium">
                Revenue Distribution
              </h3>
              <span className="text-xs md:text-sm text-muted-foreground">
                Total: Rs {totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="h-2 md:h-3 w-full flex rounded-full overflow-hidden">
              {breakdownData.revenue.map((item, index) => (
                <div
                  key={index}
                  className="h-full"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: colorPalette[index % colorPalette.length],
                  }}
                  title={`${item.name}: ${item.value.toLocaleString()} (${
                    item.percent
                  }%)`}
                />
              ))}
            </div>
            <div className="flex flex-wrap mt-2 gap-2 md:gap-3">
              {breakdownData.revenue.map((item, index) => (
                <div key={index} className="flex items-center text-xs">
                  <div
                    className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-1.5 flex-shrink-0"
                    style={{
                      backgroundColor:
                        colorPalette[index % colorPalette.length],
                    }}
                  />
                  <span className="truncate">
                    {item.name}: {item.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Discounts Breakdown Bar */}
          {hasDiscounts && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 md:mb-2 gap-1">
                <h3 className="text-xs md:text-sm font-medium">
                  Discounts Distribution
                </h3>
                <span className="text-xs md:text-sm text-muted-foreground">
                  Total: Rs {totalDiscounts.toLocaleString()}
                </span>
              </div>
              <div className="h-2 md:h-3 w-full flex rounded-full overflow-hidden">
                {breakdownData.discounts.map((item, index) => (
                  <div
                    key={index}
                    className="h-full"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor:
                        colorPalette[index % colorPalette.length],
                    }}
                    title={`${item.name}: ${item.value.toLocaleString()} (${
                      item.percent
                    }%)`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap mt-2 gap-2 md:gap-3">
                {breakdownData.discounts.map((item, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div
                      className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-1.5 flex-shrink-0"
                      style={{
                        backgroundColor:
                          colorPalette[index % colorPalette.length],
                      }}
                    />
                    <span className="truncate">
                      {item.name}: {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
