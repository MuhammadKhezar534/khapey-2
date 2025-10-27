import type { Discount } from "@/types/discounts"

interface DiscountCalculationResult {
  originalAmount: number
  discountAmount: number
  finalAmount: number
  discountPercentage?: number
  maxDiscount?: number
  description: string
}

/**
 * Utility function to calculate discount based on discount type and amount
 * Extracts calculation logic from components for better maintainability
 */
export function calculateDiscount(
  discount: Discount,
  amount: number,
  selectedDealOption?: string | null,
  customerVisitCount?: number,
): DiscountCalculationResult | null {
  if (isNaN(amount) || amount <= 0) {
    return null
  }

  let discountAmount = 0
  let finalAmount = amount
  let discountPercentage = 0
  let maxDiscount = 0
  let discountDescription = ""

  // Calculate based on discount type
  if (discount.type === "percentageDeal") {
    discountPercentage = discount.percentage
    discountAmount = amount * (discountPercentage / 100)
    discountDescription = `${discountPercentage}% off`

    // Apply maximum discount if applicable
    if (discount.maxAmount && discountAmount > discount.maxAmount) {
      discountAmount = discount.maxAmount
      maxDiscount = discount.maxAmount
      discountDescription += ` (max Rs ${maxDiscount})`
    }

    finalAmount = amount - discountAmount
  } else if (discount.type === "bankDiscount") {
    discountPercentage = discount.discountPercentage
    discountAmount = amount * (discountPercentage / 100)
    discountDescription = `${discountPercentage}% off with bank card`

    // Apply maximum discount if applicable
    if (discount.maxAmount && discountAmount > discount.maxAmount) {
      discountAmount = discount.maxAmount
      maxDiscount = discount.maxAmount
      discountDescription += ` (max Rs ${maxDiscount})`
    }

    finalAmount = amount - discountAmount
  } else if (discount.type === "loyalty") {
    if (discount.loyaltyType === "percentage" && discount.percentageRanges) {
      // For simplicity, use the highest percentage tier
      const highestTier = [...discount.percentageRanges].sort((a, b) => b.percentage - a.percentage)[0]
      discountPercentage = highestTier.percentage
      discountAmount = amount * (discountPercentage / 100)
      discountDescription = `${discountPercentage}% loyalty discount (${highestTier.minDays}-${highestTier.maxDays} days)`

      // Apply maximum discount if applicable
      if (discount.maximumAmount && discountAmount > discount.maximumAmount) {
        discountAmount = discount.maximumAmount
        maxDiscount = discount.maximumAmount
        discountDescription += ` (max Rs ${maxDiscount})`
      }

      finalAmount = amount - discountAmount
    } else if (discount.loyaltyType === "fixed" && discount.fixedRanges) {
      // For fixed loyalty, use the highest tier
      const highestTier = [...discount.fixedRanges].sort((a, b) => b.price - a.price)[0]
      discountAmount = highestTier.price
      discountDescription = `${highestTier.label} fixed discount (${highestTier.minDays}-${highestTier.maxDays})`

      // Ensure discount doesn't exceed bill amount
      if (discountAmount > amount) {
        discountAmount = amount
        discountDescription += " (limited to bill amount)"
      }

      finalAmount = amount - discountAmount
    } else if (discount.loyaltyType === "fixed-reviews" && discount.visitRanges) {
      // For visit-based loyalty, use the highest tier the customer qualifies for
      let applicableTier

      if (customerVisitCount !== undefined && discount.visitRanges.length > 0) {
        // Find all tiers the customer qualifies for
        const qualifyingTiers = discount.visitRanges.filter((tier) => customerVisitCount >= tier.visits)

        if (qualifyingTiers.length > 0) {
          // Sort by visit count descending to get the highest tier
          applicableTier = [...qualifyingTiers].sort((a, b) => b.visits - a.visits)[0]
        }
      }

      if (!applicableTier) {
        // Fallback to highest tier if no customer visit count provided
        applicableTier = [...discount.visitRanges].sort((a, b) => b.visits - a.visits)[0]
      }

      discountAmount = applicableTier.price
      discountDescription = `${applicableTier.label} (${applicableTier.visits} visits milestone)`

      // Ensure discount doesn't exceed bill amount
      if (discountAmount > amount) {
        discountAmount = amount
        discountDescription += " (limited to bill amount)"
      }

      finalAmount = amount - discountAmount
    } else if (discount.loyaltyType === "referral") {
      // For referral, use the referring user discount (assuming this is for the person who referred)
      if (discount.referringUser) {
        if (discount.referringUser.discountType === "percentage" && discount.referringUser.percentage) {
          discountPercentage = discount.referringUser.percentage
          discountAmount = amount * (discountPercentage / 100)
          discountDescription = `${discountPercentage}% referral bonus`

          // Apply maximum discount if applicable
          if (discount.referralMaximumAmount && discountAmount > discount.referralMaximumAmount) {
            discountAmount = discount.referralMaximumAmount
            maxDiscount = discount.referralMaximumAmount
            discountDescription += ` (max Rs ${maxDiscount})`
          }
        } else if (discount.referringUser.discountType === "fixed" && discount.referringUser.amount) {
          discountAmount = discount.referringUser.amount
          discountDescription = `Rs ${discountAmount} fixed referral bonus`

          // Ensure discount doesn't exceed bill amount
          if (discountAmount > amount) {
            discountAmount = amount
            discountDescription += " (limited to bill amount)"
          }
        }

        finalAmount = amount - discountAmount
      }
    }
  } else if (discount.type === "fixedPriceDeal" && selectedDealOption) {
    // For fixed price deals, we need to use the selected option
    const selectedOption = discount.prices.find((p) => p.id === selectedDealOption)
    if (selectedOption) {
      // Fixed price deals replace the original price with the deal price
      discountAmount = amount - selectedOption.price
      finalAmount = selectedOption.price
      discountDescription = `${selectedOption.label || "Selected deal"} (Rs ${selectedOption.price} fixed price)`

      // If the discount would be negative (deal price > original price), set to 0
      if (discountAmount < 0) {
        discountAmount = 0
        discountDescription += " (no discount applied - deal price higher than original)"
      }
    }
  }

  return {
    originalAmount: amount,
    discountAmount,
    finalAmount,
    discountPercentage,
    maxDiscount: maxDiscount || undefined,
    description: discountDescription,
  }
}
