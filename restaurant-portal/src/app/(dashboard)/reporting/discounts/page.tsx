"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Percent, Users, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/lib/utils";
import { formatDate } from "@/utils/format";
import { useSearchParams } from "next/navigation";
import { useBranch } from "@/contexts/branch-context";
import { SkeletonReportCard } from "@/components/ui/skeleton-report-card";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh";
import { cn } from "@/lib/utils";
import { useDiscounts } from "@/contexts/discount-context";

export default function DiscountsReportPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState<"name" | "usage" | "date">("date");
  const { selectedBranch } = useBranch();
  const [isLoading, setIsLoading] = useState(true);
  const { discounts, refreshDiscounts } = useDiscounts();

  // Function to fetch the discount reports data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Refresh discounts from the context
      refreshDiscounts();

      // Add a small delay to simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error fetching discount reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshDiscounts]);

  // Set up pull-to-refresh
  const { pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: fetchData,
  });

  // Listen for global refresh events
  useEffect(() => {
    const handleGlobalRefresh = () => {
      fetchData();
    };

    window.addEventListener("app:refresh", handleGlobalRefresh);

    return () => {
      window.removeEventListener("app:refresh", handleGlobalRefresh);
    };
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add this effect to reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter discounts based on search query, active tab, and selected branch
  const filteredDiscounts = discounts.filter((discount) => {
    // Branch filter
    if (selectedBranch) {
      if (
        !discount.applyToAllBranches &&
        !discount.branches.includes(selectedBranch?.branchName)
      ) {
        return false;
      }
    }

    const discountName = discount.name || discount.title || "";
    const matchesSearch =
      searchQuery === "" ||
      discountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discount.createdBy &&
        discount.createdBy.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "loyalty" && discount.type === "loyalty") ||
      (activeTab === "percentage" && discount.type === "percentageDeal") ||
      (activeTab === "fixed" && discount.type === "fixedPriceDeal") ||
      (activeTab === "bank" && discount.type === "bankDiscount");

    return matchesSearch && matchesTab;
  });

  return (
    <>
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        threshold={80}
      />
      <div className="pt-5">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-auto max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search discounts..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-5 w-full max-w-md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
              <TabsTrigger value="percentage">Percentage</TabsTrigger>
              <TabsTrigger value="fixed">Fixed</TabsTrigger>
              <TabsTrigger value="bank">Bank</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <SkeletonDiscountReportsList />
              ) : (
                <DiscountReportsList discounts={filteredDiscounts} />
              )}
            </TabsContent>
            <TabsContent value="loyalty" className="mt-4">
              {isLoading ? (
                <SkeletonDiscountReportsList />
              ) : (
                <DiscountReportsList discounts={filteredDiscounts} />
              )}
            </TabsContent>
            <TabsContent value="percentage" className="mt-4">
              {isLoading ? (
                <SkeletonDiscountReportsList />
              ) : (
                <DiscountReportsList discounts={filteredDiscounts} />
              )}
            </TabsContent>
            <TabsContent value="fixed" className="mt-4">
              {isLoading ? (
                <SkeletonDiscountReportsList />
              ) : (
                <DiscountReportsList discounts={filteredDiscounts} />
              )}
            </TabsContent>
            <TabsContent value="bank" className="mt-4">
              {isLoading ? (
                <SkeletonDiscountReportsList />
              ) : (
                <DiscountReportsList discounts={filteredDiscounts} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

// Define the DiscountReportsList component within the same file
interface DiscountReportsListProps {
  discounts: any[];
}

function DiscountReportsList({ discounts }: DiscountReportsListProps) {
  if (discounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">No discounts found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {discounts.map((discount) => (
        <Link
          href={`/reporting/discounts/${discount.id}`}
          key={discount.id}
          className="block"
        >
          <DiscountReportCard discount={discount} />
        </Link>
      ))}
    </div>
  );
}

// Include the original DiscountReportCard component
interface DiscountReportCardProps {
  discount: any;
}

function DiscountReportCard({ discount }: DiscountReportCardProps) {
  // Determine discount status
  const getDiscountStatus = () => {
    if (discount.status === "inactive") return "inactive";

    const now = new Date();

    // Check if the discount has date restrictions
    if (!discount.isAlwaysActive && discount.startDate && discount.endDate) {
      const startDate = new Date(discount.startDate);
      const endDate = new Date(discount.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day

      if (now < startDate) return "upcoming";
      if (now > endDate) return "expired";
    }

    return "active";
  };

  const status = getDiscountStatus();

  // Format discount details based on type
  const getDiscountDetails = () => {
    switch (discount.type) {
      case "percentageDeal":
        return {
          title: discount.title,
          value: `${discount.percentage}% off`,
          maxAmount: discount.maxAmount
            ? `Up to Rs ${discount.maxAmount}`
            : "No maximum limit",
          icon: <Percent className="h-4 w-4" />,
          type: "Percentage Deal",
        };
      case "bankDiscount":
        return {
          title: discount.title,
          value: `${discount.discountPercentage}% off with bank cards`,
          maxAmount: discount.maxAmount ? `Up to Rs ${discount.maxAmount}` : "",
          subtitle:
            discount.bankCards?.length > 0
              ? `Valid for ${discount.bankCards.length} bank${
                  discount.bankCards.length > 1 ? "s" : ""
                }`
              : "",
          icon: <Users className="h-4 w-4" />,
          type: "Bank Discount",
        };
      case "fixedPriceDeal":
        return {
          title: discount.name,
          value:
            discount.prices?.length > 0
              ? `Special prices from Rs ${Math.min(
                  ...discount.prices.map((p: any) => p.price)
                )}`
              : "Special fixed prices",
          maxAmount: "",
          subtitle:
            discount.prices?.length > 0
              ? `${discount.prices.length} price option${
                  discount.prices.length > 1 ? "s" : ""
                }`
              : "",
          icon: <Tag className="h-4 w-4" />,
          type: "Fixed Price Deal",
        };
      case "loyalty":
        if (discount.loyaltyType === "percentage") {
          return {
            title: discount.name,
            value:
              discount.percentageRanges?.length > 0
                ? `Up to ${Math.max(
                    ...discount.percentageRanges.map((r: any) => r.percentage)
                  )}% off`
                : "Percentage discount for loyal customers",
            maxAmount: discount.maximumAmount
              ? `Up to Rs ${discount.maximumAmount}`
              : "",
            subtitle: "Based on customer loyalty",
            icon: <Users className="h-4 w-4" />,
            type: "Loyalty Program",
          };
        } else if (discount.loyaltyType === "fixed") {
          return {
            title: discount.name,
            value:
              discount.fixedRanges?.length > 0
                ? `Special rewards for loyal customers`
                : "Fixed rewards for loyal customers",
            maxAmount: "",
            subtitle: `${discount.fixedRanges?.length || 0} reward tier${
              discount.fixedRanges?.length !== 1 ? "s" : ""
            }`,
            icon: <Users className="h-4 w-4" />,
            type: "Loyalty Program",
          };
        } else if (discount.loyaltyType === "fixed-reviews") {
          return {
            title: discount.name,
            value:
              discount.visitRanges?.length > 0
                ? `Rewards based on ${discount.visitRanges.length} visit tiers`
                : "Rewards based on visits",
            maxAmount: "",
            subtitle: "Visit-based rewards",
            icon: <Users className="h-4 w-4" />,
            type: "Loyalty Program",
          };
        } else if (discount.loyaltyType === "referral") {
          return {
            title: discount.name,
            value: "Referral rewards program",
            maxAmount: discount.referralMaximumAmount
              ? `Up to Rs ${discount.referralMaximumAmount}`
              : "",
            subtitle: "For both referrer and new customers",
            icon: <Users className="h-4 w-4" />,
            type: "Loyalty Program",
          };
        }
        return {
          title: discount.name || "Discount",
          value: "Loyalty program",
          maxAmount: "",
          subtitle: "Rewards for loyal customers",
          icon: <Users className="h-4 w-4" />,
          type: "Loyalty Program",
        };
      default:
        return {
          title: discount.name || discount.title || "Discount",
          value: "Special offer",
          maxAmount: "",
          icon: <Percent className="h-4 w-4" />,
          type: "Discount",
        };
    }
  };

  const discountDetails = getDiscountDetails();

  return (
    <Card
      className={cn(
        "h-full hover:shadow-md transition-shadow border",
        status === "active"
          ? "border-green-200"
          : status === "upcoming"
          ? "border-blue-200"
          : status === "expired"
          ? "border-red-200"
          : "border-gray-200"
      )}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "capitalize font-medium text-xs px-2.5 py-0.5",
                status === "active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : status === "upcoming"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : status === "expired"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              )}
            >
              {status}
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
              {discountDetails.type}
            </Badge>
          </div>
          {discountDetails.icon}
        </div>

        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
          {discountDetails.title}
        </h3>

        <div className="text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <span className="font-medium">{discountDetails.value}</span>
          </div>
        </div>

        <Separator className="mb-3" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Usage</div>
            <div className="text-lg font-semibold">
              {discount.totalUsage || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-lg font-semibold">
              Rs {(discount.totalAmount || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Avg. Discount</div>
            <div className="text-lg font-semibold">
              Rs {discount.averageDiscount || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Last Used</div>
            <div className="text-lg font-semibold">
              {discount.lastUsed ? formatDate(discount.lastUsed) : "Never"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add a skeleton list component at the end of the file
function SkeletonDiscountReportsList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonReportCard key={index} />
      ))}
    </div>
  );
}
