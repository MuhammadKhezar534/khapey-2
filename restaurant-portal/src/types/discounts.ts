export interface BaseDiscount {
  id: string
  description: string
  status: "active" | "inactive"
  branches: string[]
  applyToAllBranches: boolean
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
  image?: string
}

export interface LoyaltyDiscount extends BaseDiscount {
  type: "loyalty"
  name: string
  loyaltyType: "percentage" | "fixed" | "fixed-reviews" | "referral"
  percentageRanges?: {
    minDays: number
    maxDays: number
    percentage: number
  }[]
  maximumAmount?: number
  fixedRanges?: {
    minDays: number
    maxDays: number
    label: string
    price: number
    description?: string
    image?: string
  }[]
  visitRanges?: {
    visits: number
    label: string
    price: number
    description?: string
    image?: string
  }[]
  referringUser?: {
    discountType: "percentage" | "fixed"
    percentage?: number
    amount?: number
  }
  referredUser?: {
    discountType: "percentage" | "fixed"
    percentage?: number
    amount?: number
  }
  referralMaximumAmount?: number
}

export interface PercentageDealDiscount extends BaseDiscount {
  type: "percentageDeal"
  title: string
  imageUrl?: string
  percentage: number
  maxAmount?: number
  isAlwaysActive: boolean
  isAllDay: boolean
  startTime?: string
  endTime?: string
  isAllWeek: boolean
  daysOfWeek?: string[]
  forKhapeyUsersOnly: boolean
}

export interface FixedPriceDealDiscount extends BaseDiscount {
  type: "fixedPriceDeal"
  name: string
  imageUrl?: string
  prices: {
    id: string
    label: string
    price: number
  }[]
  isAlwaysActive: boolean
  isAllDay: boolean
  startTime?: string
  endTime?: string
  isAllWeek: boolean
  daysOfWeek?: string[]
  forKhapeyUsersOnly: boolean
}

export interface BankCardType {
  bankId: string
  bankName: string
  cardTypeIds: string[]
}

export interface BankDiscount extends BaseDiscount {
  type: "bankDiscount"
  title: string
  imageUrl?: string
  discountPercentage: number
  maxAmount?: number
  bankCards: BankCardType[]
  isAlwaysActive: boolean
  isAllDay: boolean
  startTime?: string
  endTime?: string
  isAllWeek: boolean
  daysOfWeek?: string[]
  forKhapeyUsersOnly: boolean
}

export type Discount = LoyaltyDiscount | PercentageDealDiscount | FixedPriceDealDiscount | BankDiscount

export interface SpecialDealDiscount extends BaseDiscount {
  type: "specialDeal"
  name: string
  imageUrl?: string
  usePercentage: boolean
  percentage?: number
  maxAmount?: number
  prices?: {
    id: string
    label: string
    price: number
  }[]
  isAlwaysActive: boolean
  isAllDay: boolean
  startTime?: string
  endTime?: string
  isAllWeek: boolean
  daysOfWeek?: string[]
  forKhapeyUsersOnly: boolean
}
