import { Percent, CreditCard, Tag, BadgePercent, Users, Star, UserPlus } from "lucide-react"

export function getDiscountTypeIcon(type: string, loyaltyType?: string) {
  switch (type) {
    case "percentageDeal":
      return <Percent className="h-5 w-5 text-blue-500" />
    case "fixedPriceDeal":
      return <Tag className="h-5 w-5 text-green-500" />
    case "bankDiscount":
      return <CreditCard className="h-5 w-5 text-purple-500" />
    case "loyalty":
      if (loyaltyType === "percentage") {
        return <BadgePercent className="h-5 w-5 text-orange-500" />
      } else if (loyaltyType === "fixed-reviews") {
        return <Star className="h-5 w-5 text-yellow-500" />
      } else if (loyaltyType === "referral") {
        return <UserPlus className="h-5 w-5 text-pink-500" />
      } else {
        return <Users className="h-5 w-5 text-red-500" />
      }
    default:
      return <Percent className="h-5 w-5 text-gray-500" />
  }
}

export function getDiscountTypeName(type: string, loyaltyType?: string) {
  switch (type) {
    case "percentageDeal":
      return "Percentage Discount"
    case "fixedPriceDeal":
      return "Fixed Price Deal"
    case "bankDiscount":
      return "Bank Card Discount"
    case "loyalty":
      if (loyaltyType === "percentage") {
        return "Percentage Loyalty Discount"
      } else if (loyaltyType === "fixed-reviews") {
        return "Visit Milestone Rewards"
      } else if (loyaltyType === "referral") {
        return "Referral Program"
      } else {
        return "Fixed Loyalty Discount"
      }
    default:
      return "Discount"
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "text-green-500 border-green-200 bg-green-50"
    case "pending":
      return "text-yellow-500 border-yellow-200 bg-yellow-50"
    case "rejected":
      return "text-red-500 border-red-200 bg-red-50"
    default:
      return ""
  }
}
