import type { Discount } from "@/types/discounts"

/**
 * Gets a friendly name for the discount type
 * @param {string} type - The discount type
 * @returns {string} - The friendly name for the discount type
 */
export const getDiscountTypeName = (type: string): string => {
  switch (type) {
    case "loyalty":
      return "Loyalty program"
    case "percentageDeal":
      return "Percentage deal"
    case "fixedPriceDeal":
      return "Fixed price deal"
    case "bankDiscount":
      return "Bank discount"
    default:
      return "Discount"
  }
}

/**
 * Gets the display details for a discount based on its type
 * @param {Discount} discount - The discount object
 * @returns {object} - The display details for the discount
 */
export const getDiscountDetails = (discount: Discount) => {
  switch (discount.type) {
    case "percentageDeal":
      return {
        title: discount.title,
        value: `${discount.percentage}% off`,
        maxAmount: discount.maxAmount ? `Up to Rs ${discount.maxAmount}` : "No maximum limit",
        type: "Percentage Deal",
      }
    case "bankDiscount":
      return {
        title: discount.title,
        value: `${discount.discountPercentage}% off with bank cards`,
        maxAmount: discount.maxAmount ? `Up to Rs ${discount.maxAmount}` : "",
        subtitle:
          discount.bankCards?.length > 0
            ? `Valid for ${discount.bankCards.length} bank${discount.bankCards.length > 1 ? "s" : ""}`
            : "",
        type: "Bank Discount",
      }
    case "fixedPriceDeal":
      return {
        title: discount.name || discount.title,
        value:
          discount.prices?.length > 0
            ? `Special prices from Rs ${Math.min(...discount.prices.map((p) => p.price))}`
            : "Special fixed prices",
        subtitle:
          discount.prices?.length > 0
            ? `${discount.prices.length} price option${discount.prices.length > 1 ? "s" : ""}`
            : "",
        type: "Fixed Price Deal",
      }
    case "loyalty":
      if (discount.loyaltyType === "percentage") {
        return {
          title: discount.name,
          value:
            discount.percentageRanges?.length > 0
              ? `Up to ${Math.max(...discount.percentageRanges.map((r) => r.percentage))}% off`
              : "Percentage discount for loyal customers",
          maxAmount: discount.maximumAmount ? `Up to Rs ${discount.maximumAmount}` : "",
          subtitle: "Based on customer loyalty",
          type: "Loyalty Program",
        }
      } else if (discount.loyaltyType === "fixed") {
        return {
          title: discount.name,
          value:
            discount.fixedRanges?.length > 0
              ? `Special rewards for loyal customers`
              : "Fixed rewards for loyal customers",
          subtitle: `${discount.fixedRanges?.length || 0} reward tier${discount.fixedRanges?.length !== 1 ? "s" : ""}`,
          type: "Loyalty Program",
        }
      } else if (discount.loyaltyType === "fixed-reviews") {
        return {
          title: discount.name,
          value:
            discount.visitRanges?.length > 0
              ? `Rewards based on ${discount.visitRanges.length} visit tiers`
              : "Rewards based on visits",
          subtitle: "Visit-based rewards",
          type: "Loyalty Program",
        }
      } else if (discount.loyaltyType === "referral") {
        return {
          title: discount.name,
          value: "Referral rewards program",
          maxAmount: discount.referralMaximumAmount ? `Up to Rs ${discount.referralMaximumAmount}` : "",
          subtitle: "For both referrer and new customers",
          type: "Loyalty Program",
        }
      }
      return {
        title: discount.name || "Discount",
        value: "Loyalty program",
        subtitle: "Rewards for loyal customers",
        type: "Loyalty Program",
      }
    default:
      return {
        title: discount.name || discount.title || "Discount",
        value: "Special offer",
        type: "Discount",
      }
  }
}

/**
 * Gets the image URL for a discount based on its type and properties
 * @param {Discount} discount - The discount object
 * @returns {string | null} - The image URL for the discount
 */
export const getDiscountImage = (discount: Discount): string | null => {
  // Check for imageUrl property (used in most discount types)
  if ("imageUrl" in discount && discount.imageUrl) {
    return discount.imageUrl
  }

  // Check for image property (might be used in some forms)
  if ("image" in discount && discount.image) {
    return discount.image
  }

  // For fixed price deals, check if any price option has an image
  if (discount.type === "fixedPriceDeal" && discount.prices?.length > 0) {
    const imageItem = discount.prices.find((p) => p.image)
    if (imageItem?.image) return imageItem.image
  }

  // For loyalty discounts with fixed ranges, check for images
  if (discount.type === "loyalty" && discount.loyaltyType === "fixed" && discount.fixedRanges?.length > 0) {
    const imageItem = discount.fixedRanges.find((r) => r.image)
    if (imageItem?.image) return imageItem.image
  }

  // For loyalty discounts with visit ranges, check for images
  if (discount.type === "loyalty" && discount.loyaltyType === "fixed-reviews" && discount.visitRanges?.length > 0) {
    const imageItem = discount.visitRanges.find((r) => r.image)
    if (imageItem?.image) return imageItem.image
  }

  return null
}

/**
 * Formats a discount amount for display
 * @param {number} amount - The discount amount
 * @returns {string} - The formatted discount amount
 */
export const formatDiscountAmount = (amount: number): string => {
  return `Rs ${amount.toLocaleString()}`
}
