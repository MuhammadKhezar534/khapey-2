"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Play,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { MediaViewerModal } from "@/components/dashboard/media-viewer-modal-lazy";
import { TimeRangeSelector } from "@/components/dashboard/time-range-selector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useBranch } from "@/contexts/branch-context";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewDetailsDrawer } from "@/components/reviews/review-details-drawer-lazy";

// Generate mock reviews - moved outside component to prevent regeneration on every render
const allMockReviews = (() => {
  console.log("Generating mock reviews - this should only happen once");
  const branches = [
    "Gulberg",
    "DHA Phase 5",
    "Johar Town",
    "MM Alam Road",
    "Bahria Town",
  ];
  const names = [
    "Ahmed Khan",
    "Ayesha Malik",
    "Saad Ahmed",
    "Nadia Malik",
    "Imran Sheikh",
    "Kamran Ali",
    "Sara Ahmed",
    "Faisal Khan",
    "Zubair Hassan",
    "Zubair Hassan",
    "Asma Riaz",
    "Tariq Mahmood",
    "Bilal Ahmed",
    "Zain Malik",
    "Adnan Qureshi",
    "Yasir Ali",
  ];
  const captions = [
    "Absolutely amazing experience! The food was delicious and the service was impeccable.",
    "The staff was incredibly attentive and the food was outstanding. Will definitely return!",
    "Perfect spot for family dinners. Kids loved the special menu items.",
    "The atmosphere is unmatched. Perfect for business meetings and special occasions.",
    "The staff went above and beyond. Made our anniversary dinner truly special.",
    "Service was slow and the food was not up to the standard I expected.",
    "The food was cold and service was slow.",
    "The wait time was unacceptable and the food was mediocre at best.",
    "Overpriced for the quality. The ambiance doesn't make up for the average food.",
    "Not worth the drive. Food was bland and portions were small for the price.",
    "Celebrated my daughter's graduation. The special menu was worth every rupee!",
    "Corporate event for 20 people. Everyone was impressed with the service and food quality.",
    "Hosted a corporate dinner. Everyone loved the food and service. Worth every rupee!",
    "Family reunion dinner. The private dining room and custom menu were perfect.",
    "Anniversary celebration with extended family. The chef's special menu was exceptional.",
  ];
  const phoneNumbers = [
    "+92 300 1234567",
    "+92 321 9876543",
    "+92 333 4567890",
    "+92 345 6789012",
    "+92 301 2345678",
    "+92 312 8765432",
    "+92 334 5678901",
    "+92 346 7890123",
    "+92 302 3456789",
    "+92 313 9876543",
    "+92 335 6789012",
    "+92 347 8901234",
    "+92 303 4567890",
    "+92 314 0987654",
    "+92 336 7890123",
  ];

  // Generate dates within the last month
  const generateRandomDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30); // Random day within the last month
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  return Array.from({ length: 50 }).map((_, index) => {
    const randomNameIndex = Math.floor(Math.random() * names.length);
    const randomBranchIndex = Math.floor(Math.random() * branches.length);
    const randomCaptionIndex = Math.floor(Math.random() * captions.length);

    // Generate rating with one decimal place (1.0 to 5.0)
    const rating = Math.round((Math.random() * 4 + 1) * 10) / 10;

    const billAmount = Math.floor(Math.random() * 10000) + 1000; // 1000-11000 bill amount
    const likes = Math.floor(Math.random() * 200) + 1;
    const dislikes = Math.floor(Math.random() * 50);
    const saves = Math.floor(Math.random() * 100);
    const shares = Math.floor(Math.random() * 80);
    const date = generateRandomDate();

    // Random number of media items (0-5)
    const mediaCount = Math.floor(Math.random() * 6);
    const media = Array.from({ length: mediaCount }).map((_, mediaIndex) => {
      // 20% chance of being a video
      const isVideo = Math.random() < 0.2;
      return {
        type: isVideo ? ("video" as const) : ("image" as const),
        url: isVideo
          ? "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          : `/placeholder.svg?height=400&width=600&text=Review+${index}+Media+${mediaIndex}`,
      };
    });

    return {
      id: `review-${index}`,
      userName: names[randomNameIndex],
      phoneNumber: phoneNumbers[randomNameIndex],
      branch: branches[randomBranchIndex],
      caption: captions[randomCaptionIndex],
      rating,
      billAmount,
      likes,
      dislikes,
      saves,
      shares,
      date,
      media,
    };
  });
})(); // Immediately invoke to generate once

interface ReviewsTableProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshData: () => void;
  isMobile: boolean;
}

// Rating filter options
const ratingOptions = [
  { value: "all", label: "All Ratings" },
  { value: "4.5-5", label: "4.5 - 5 Stars" },
  { value: "4-4.5", label: "4 - 4.5 Stars" },
  { value: "3-4", label: "3 - 4 Stars" },
  { value: "2-3", label: "2 - 3 Stars" },
  { value: "1-2", label: "1 - 2 Stars" },
  { value: "0-1", label: "Below 1 Star" },
];

export function ReviewsTable({
  timeRange,
  setTimeRange,
  isLoading: initialLoading,
  isRefreshing,
  refreshData,
  isMobile,
}: ReviewsTableProps) {
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const { selectedBranch } = useBranch();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Use the pre-generated mock data instead of regenerating it
  const allReviews = useMemo(() => allMockReviews, []);

  // Filter reviews based on time range, rating, and selected branch - optimized
  const filteredReviews = useMemo(() => {
    // Skip filtering if loading from parent component
    if (initialLoading) return [];

    // Start with a reference to the original array instead of creating a copy
    let filtered = allReviews;

    // Only create a filtered copy if we need to filter
    if (
      selectedBranch?.branchName ||
      timeRange !== "all" ||
      ratingFilter !== "all"
    ) {
      filtered = allReviews.filter((review) => {
        // Branch filter
        if (
          selectedBranch?.branchName &&
          review.branch !== selectedBranch?.branchName
        )
          return false;

        // Time range filter
        if (timeRange === "today") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (review.date < today) return false;
        } else if (timeRange === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (review.date < weekAgo) return false;
        } else if (timeRange === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (review.date < monthAgo) return false;
        } else if (timeRange === "last-month") {
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          if (review.date < twoMonthsAgo || review.date > oneMonthAgo)
            return false;
        }

        // Rating filter
        if (ratingFilter !== "all") {
          if (ratingFilter.includes("-")) {
            const [minRating, maxRating] = ratingFilter.split("-").map(Number);
            if (review.rating < minRating || review.rating >= maxRating)
              return false;
          } else {
            const ratingValue = Number.parseFloat(ratingFilter);
            if (Math.floor(review.rating) !== Math.floor(ratingValue))
              return false;
          }
        }

        return true;
      });
    }

    // Only sort if we have a sort column
    if (sortColumn) {
      // Create a new array for sorting to avoid mutating the filtered array
      filtered = [...filtered].sort((a, b) => {
        let valueA, valueB;

        // Handle different column types
        switch (sortColumn) {
          case "date":
            valueA = a.date.getTime();
            valueB = b.date.getTime();
            break;
          case "rating":
            valueA = a.rating;
            valueB = b.rating;
            break;
          case "billAmount":
            valueA = a.billAmount;
            valueB = b.billAmount;
            break;
          case "likes":
            valueA = a.likes;
            valueB = b.likes;
            break;
          case "userName":
            valueA = a.userName.toLowerCase();
            valueB = b.userName.toLowerCase();
            break;
          case "branch":
            valueA = a.branch.toLowerCase();
            valueB = b.branch.toLowerCase();
            break;
          default:
            valueA = a[sortColumn as keyof typeof a];
            valueB = b[sortColumn as keyof typeof b];
        }

        // Handle string comparison
        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        // Handle numeric comparison
        return sortDirection === "asc"
          ? (valueA as number) - (valueB as number)
          : (valueB as number) - (valueA as number);
      });
    }

    return filtered;
  }, [
    allReviews,
    timeRange,
    ratingFilter,
    selectedBranch?.branchName,
    sortColumn,
    sortDirection,
    initialLoading,
  ]);

  // Calculate pagination - memoize to prevent recalculation
  const { totalPages, paginatedReviews } = useMemo(() => {
    const total = Math.ceil(filteredReviews.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filteredReviews.slice(startIndex, startIndex + pageSize);

    return { totalPages: total, paginatedReviews: paginated };
  }, [filteredReviews, currentPage, pageSize]);

  // Show loading state when filters change - optimized to prevent unnecessary state changes
  useEffect(() => {
    if (isRefreshing || initialLoading) return; // Skip if already in a loading state

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced timeout for better UX

    return () => clearTimeout(timer);
  }, [
    timeRange,
    ratingFilter,
    selectedBranch?.branchName,
    sortColumn,
    sortDirection,
    isRefreshing,
    initialLoading,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    timeRange,
    ratingFilter,
    selectedBranch?.branchName,
    pageSize,
    sortColumn,
    sortDirection,
  ]);

  // Open media modal
  const handleOpenMedia = (
    media: Array<{ type: "image" | "video"; url: string }>,
    initialIndex = 0
  ) => {
    if (media && media.length > 0) {
      setSelectedMedia(media);
      setInitialMediaIndex(initialIndex);
      setIsMediaModalOpen(true);
    }
  };

  // Handle rating filter change
  const handleRatingFilterChange = (value: string) => {
    setRatingFilter(value);
    setIsLoading(true);
    setIsFilterSheetOpen(false);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to descending
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handleViewReview = (review: any) => {
    setSelectedReview(review);
    setIsDrawerOpen(true);
  };

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 inline text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline text-primary" />
    );
  };

  // Get rating filter label
  const getRatingFilterLabel = () => {
    const option = ratingOptions.find(
      (option) => option.value === ratingFilter
    );
    return option ? option.label : "All Ratings";
  };

  return (
    <>
      {/* Media viewer modal */}
      <MediaViewerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        media={selectedMedia}
        initialIndex={initialMediaIndex}
      />

      {/* Review details drawer */}
      <ReviewDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        review={selectedReview}
      />

      {/* Filter Sheet for Mobile */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent
          side="bottom"
          className="p-0 flex flex-col max-h-[90vh] h-auto rounded-t-xl"
          hideCloseButton
        >
          {/* Sheet Header */}
          <div className="flex items-center justify-center border-b py-3.5 px-4">
            <h3 className="text-base font-medium">Filter Reviews</h3>
          </div>

          {/* Sheet Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-0">
              <div>
                <div className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50">
                  Rating
                </div>
                <div>
                  {ratingOptions.map((option) => (
                    <button
                      key={option.value}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 text-left border-b border-gray-100 text-sm",
                        ratingFilter === option.value ? "bg-blue-50" : ""
                      )}
                      onClick={() => handleRatingFilterChange(option.value)}
                    >
                      <span
                        className={
                          ratingFilter === option.value
                            ? "font-medium text-primary"
                            : "text-gray-700"
                        }
                      >
                        {option.label}
                      </span>
                      {ratingFilter === option.value && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-primary"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          {/* Time Range Selector */}
          <TimeRangeSelector
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            refreshData={refreshData}
            isMobile={isMobile}
            title="Customer Reviews"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {/* Rating Filter - Desktop Dropdown / Mobile Button */}
            {isMobile ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex justify-between items-center h-9 whitespace-nowrap"
                onClick={() => setIsFilterSheetOpen(true)}
              >
                <div className="flex items-center gap-2">
                  <span>Filter</span>
                </div>
                {ratingFilter !== "all" && (
                  <Badge variant="secondary" className="ml-2">
                    {getRatingFilterLabel()}
                  </Badge>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select
                  value={ratingFilter}
                  onValueChange={handleRatingFilterChange}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-9 whitespace-nowrap">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-[120px] h-9">
                  <SelectValue placeholder="Results per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">
              Reviews{" "}
              {filteredReviews.length > 0 &&
                !isLoading &&
                `(${filteredReviews.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <ReviewsTableSkeleton isMobile={isMobile} />
            ) : filteredReviews.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        <button
                          className="flex items-center font-medium text-xs"
                          onClick={() => handleSort("userName")}
                        >
                          Customer {renderSortIcon("userName")}
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[300px]">
                        <button
                          className="flex items-center font-medium text-xs"
                          onClick={() => handleSort("date")}
                        >
                          Review {renderSortIcon("date")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[120px]">Media</TableHead>
                      <TableHead className="w-[100px]">
                        <button
                          className="flex items-center font-medium text-xs"
                          onClick={() => handleSort("branch")}
                        >
                          Branch {renderSortIcon("branch")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[100px]">
                        <button
                          className="flex items-center font-medium text-xs"
                          onClick={() => handleSort("rating")}
                        >
                          Rating {renderSortIcon("rating")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <button
                          className="flex items-center font-medium text-xs"
                          onClick={() => handleSort("billAmount")}
                        >
                          Bill Amount {renderSortIcon("billAmount")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[150px]">
                        <button
                          className="flex items-center font-medium text-xs"
                          onClick={() => handleSort("likes")}
                        >
                          Stats {renderSortIcon("likes")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[80px] text-center">
                        <span className="font-medium text-xs">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReviews.map((review) => (
                      <TableRow key={review.id}>
                        {/* Customer Column - Removed Avatar */}
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{review.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              {review.phoneNumber}
                            </div>
                          </div>
                        </TableCell>

                        {/* Review Column */}
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <div className="max-w-[300px] cursor-default">
                                  <div className="line-clamp-2 text-sm hover:text-primary transition-colors">
                                    {review.caption}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                    <span>
                                      {formatDistanceToNow(review.date, {
                                        addSuffix: true,
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="max-w-[400px] p-4"
                              >
                                <p>{review.caption}</p>
                                <p className="text-xs mt-2">
                                  Posted on: {review.date.toLocaleDateString()}{" "}
                                  at {review.date.toLocaleTimeString()}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>

                        {/* Media Column */}
                        <TableCell>
                          {review.media.length > 0 ? (
                            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                              {review.media.map((item, mediaIndex) => (
                                <button
                                  key={mediaIndex}
                                  className="flex-shrink-0 relative h-12 w-16 rounded overflow-hidden border border-gray-200 group"
                                  onClick={() =>
                                    handleOpenMedia(review.media, mediaIndex)
                                  }
                                >
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-[1] flex items-center justify-center">
                                    {item.type === "video" && (
                                      <div className="bg-black/50 rounded-full p-1">
                                        <Play className="h-3 w-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <Image
                                    src={item.url || "/placeholder.svg"}
                                    alt={`Review media ${mediaIndex + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No media
                            </span>
                          )}
                        </TableCell>

                        {/* Branch Column */}
                        <TableCell>
                          <span className="text-sm">{review.branch}</span>
                        </TableCell>

                        {/* Rating Column - Simplified Pill */}
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium",
                              review.rating >= 4
                                ? "bg-green-100 text-green-800"
                                : review.rating >= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            )}
                            aria-label={`Rating: ${review.rating.toFixed(
                              1
                            )} out of 5 stars`}
                          >
                            {review.rating.toFixed(1)}
                          </span>
                        </TableCell>

                        {/* Bill Amount Column - Removed Icon */}
                        <TableCell>
                          <span className="text-sm">
                            Rs {review.billAmount.toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Stats Column */}
                        <TableCell>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{review.likes}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <ThumbsDown className="h-3 w-3" />
                              <span>{review.dislikes}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Bookmark className="h-3 w-3" />
                              <span>{review.saves}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Share2 className="h-3 w-3" />
                              <span>{review.shares}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewReview(review)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Showing{" "}
              {Math.min(
                (currentPage - 1) * pageSize + 1,
                filteredReviews.length
              )}{" "}
              to {Math.min(currentPage * pageSize, filteredReviews.length)} of{" "}
              {filteredReviews.length} results
            </div>
            <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto overflow-x-auto hide-scrollbar">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-7 sm:h-8 px-1 sm:px-2 text-xs"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-1">First</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="h-7 sm:h-8 px-1 sm:px-2 text-xs"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({
                    length: Math.min(isMobile ? 3 : 5, totalPages),
                  }).map((_, i) => {
                    // Calculate page numbers to show (centered around current page)
                    let pageNum;
                    if (totalPages <= (isMobile ? 3 : 5)) {
                      pageNum = i + 1;
                    } else if (currentPage <= (isMobile ? 2 : 3)) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - (isMobile ? 1 : 2)) {
                      pageNum = totalPages - (isMobile ? 2 : 4) + i;
                    } else {
                      pageNum = currentPage - (isMobile ? 1 : 2) + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        className="w-6 h-7 sm:w-8 sm:h-8 p-0 text-xs"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="h-7 sm:h-8 px-1 sm:px-2 text-xs"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-7 sm:h-8 px-1 sm:px-2 text-xs"
                >
                  <span className="hidden sm:inline mr-1">Last</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

// Add a skeleton component for the reviews table
function ReviewsTableSkeleton({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <div className="p-4">
        {/* Mobile skeleton - matches the table layout on mobile */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border-b pb-4">
              {/* Customer info */}
              <div className="flex justify-between items-center mb-2">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-6 w-10 rounded-md" />
              </div>

              {/* Review text */}
              <div className="mb-2">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>

              {/* Media row */}
              <div className="flex gap-1 mb-2 overflow-x-auto">
                <Skeleton className="h-12 w-16 rounded" />
                <Skeleton className="h-12 w-16 rounded" />
              </div>

              {/* Branch and bill amount */}
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[90px]" />
              </div>

              {/* Stats and action button */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop skeleton
  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex space-x-4 border-b pb-2">
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-5 w-[60px]" />
          <Skeleton className="h-5 w-[60px]" />
          <Skeleton className="h-5 w-[60px]" />
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-5 w-[60px]" />
          <Skeleton className="h-5 w-[60px]" />
        </div>

        {/* Desktop skeleton rows with more realistic proportions */}
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex space-x-4 py-3 border-b">
              <div className="w-[200px]">
                <Skeleton className="h-4 w-[150px] mb-1" />
                <Skeleton className="h-3 w-[120px]" />
              </div>
              <div className="min-w-[300px]">
                <Skeleton className="h-4 w-[250px] mb-1" />
                <Skeleton className="h-4 w-[200px] mb-1" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
              <div className="w-[120px] flex gap-1">
                <Skeleton className="h-12 w-16 rounded" />
                <Skeleton className="h-12 w-16 rounded" />
              </div>
              <div className="w-[100px]">
                <Skeleton className="h-4 w-[80px]" />
              </div>
              <div className="w-[100px]">
                <Skeleton className="h-6 w-10 rounded-md" />
              </div>
              <div className="w-[120px]">
                <Skeleton className="h-4 w-[90px]" />
              </div>
              <div className="w-[150px]">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
              <div className="w-[80px] flex justify-center">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-muted p-3">
        <Star className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No reviews found</h3>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
        No reviews match your current filters. Try changing your filter criteria
        or check back later.
      </p>
    </div>
  );
}
