export interface Discount {
  id: string;
  type: "loyalty";
  name: string;
  description: string;
  branches: string[];
  applyToAllBranches?: boolean;
  status: "active" | "inactive";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface LoyaltyDiscount extends Discount {
  type: "loyalty";
  loyaltyType: "percentage" | "fixed" | "fixed-reviews" | "referral";

  // Percentage-based loyalty discount
  percentageRanges?: Array<{
    minDays: number;
    maxDays: number;
    percentage: number;
  }>;
  maximumAmount?: number;

  // Fixed amount day-based loyalty discount
  fixedRanges?: Array<{
    minDays: number;
    maxDays: number;
    label: string;
    price: number;
    description?: string;
    image?: string;
  }>;

  // Visit-based loyalty discount
  visitRanges?: Array<{
    visits: number;
    label: string;
    price: number;
    description?: string;
    image?: string;
  }>;

  // Referral-based loyalty discount
  referringUser?: {
    discountType: "percentage" | "fixed";
    percentage?: number;
    amount?: number;
  };
  referredUser?: {
    discountType: "percentage" | "fixed";
    percentage?: number;
    amount?: number;
  };
  referralMaximumAmount?: number;
}
