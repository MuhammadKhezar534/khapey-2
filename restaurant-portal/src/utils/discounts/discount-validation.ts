import type { Discount } from "@/types/discounts"

/**
 * Validates a phone number for the referral program
 * @param {string} phoneNumber - The phone number to validate
 * @returns {{ isValid: boolean; message?: string }} - An object indicating whether the phone number is valid and an optional error message
 */
export const validatePhoneNumber = (phoneNumber: string): { isValid: boolean; message?: string } => {
  if (!phoneNumber) {
    return { isValid: false, message: "Phone number is required" }
  }

  if (phoneNumber.length !== 11) {
    return { isValid: false, message: "Phone number must be 11 digits" }
  }

  if (!phoneNumber.startsWith("03")) {
    return { isValid: false, message: "Phone number must start with 03" }
  }

  return { isValid: true }
}

/**
 * Validates if a referring user exists
 * For testing purposes, only "03211234566" is accepted as valid
 * @param {string} phoneNumber - The phone number to validate
 * @returns {{ exists: boolean; message?: string }} - An object indicating whether the referring user exists and an optional error message
 */
export const validateReferringUser = (phoneNumber: string): { exists: boolean; message?: string } => {
  // For testing purposes, only accept this specific number
  if (phoneNumber === "03211234566") {
    return { exists: true }
  }

  return { exists: false, message: "No user found with this phone number" }
}

/**
 * Validates a discount object for required fields
 * @param {Partial<Discount>} discount - The discount object to validate
 * @returns {{ isValid: boolean; errors: Record<string, string> }} - An object indicating whether the discount is valid and a map of errors
 */
export const validateDiscount = (discount: Partial<Discount>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  // Common validations for all discount types
  if (!discount.type) {
    errors.type = "Discount type is required"
  }

  if (!discount.status) {
    errors.status = "Status is required"
  }

  // Type-specific validations
  switch (discount.type) {
    case "percentageDeal":
      if (!discount.title) errors.title = "Title is required"
      if (!discount.percentage) errors.percentage = "Percentage is required"
      if (discount.percentage && (discount.percentage <= 0 || discount.percentage > 100)) {
        errors.percentage = "Percentage must be between 1 and 100"
      }
      break

    case "bankDiscount":
      if (!discount.title) errors.title = "Title is required"
      if (!discount.discountPercentage) errors.discountPercentage = "Discount percentage is required"
      if (!discount.bankCards || discount.bankCards.length === 0) {
        errors.bankCards = "At least one bank card must be selected"
      }
      break

    case "fixedPriceDeal":
      if (!discount.name && !discount.title) errors.name = "Name is required"
      if (!discount.prices || discount.prices.length === 0) {
        errors.prices = "At least one price option is required"
      }
      break

    case "loyalty":
      if (!discount.name) errors.name = "Name is required"
      if (!discount.loyaltyType) errors.loyaltyType = "Loyalty type is required"

      // Loyalty type specific validations
      if (
        discount.loyaltyType === "percentage" &&
        (!discount.percentageRanges || discount.percentageRanges.length === 0)
      ) {
        errors.percentageRanges = "At least one percentage range is required"
      }

      if (discount.loyaltyType === "fixed" && (!discount.fixedRanges || discount.fixedRanges.length === 0)) {
        errors.fixedRanges = "At least one fixed range is required"
      }

      if (discount.loyaltyType === "fixed-reviews" && (!discount.visitRanges || discount.visitRanges.length === 0)) {
        errors.visitRanges = "At least one visit range is required"
      }

      if (discount.loyaltyType === "referral") {
        if (!discount.referralPercentage) errors.referralPercentage = "Referral percentage is required"
        if (!discount.referrerPercentage) errors.referrerPercentage = "Referrer percentage is required"
      }
      break
  }

  // Date and time validations
  if (!discount.isAlwaysActive) {
    if (!discount.startDate) errors.startDate = "Start date is required"
    if (!discount.endDate) errors.endDate = "End date is required"

    if (discount.startDate && discount.endDate) {
      const start = new Date(discount.startDate)
      const end = new Date(discount.endDate)
      if (start > end) errors.dateRange = "End date must be after start date"
    }

    if (!discount.isAllDay) {
      if (!discount.startTime) errors.startTime = "Start time is required"
      if (!discount.endTime) errors.endTime = "End time is required"
    }

    if (!discount.isAllWeek && (!discount.daysOfWeek || discount.daysOfWeek.length === 0)) {
      errors.daysOfWeek = "At least one day of the week must be selected"
    }
  }

  // Branch validations
  if (!discount.applyToAllBranches && (!discount.branches || discount.branches.length === 0)) {
    errors.branches = "At least one branch must be selected"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
