import { parse, isValid, format } from "date-fns"

// Function to format date input with separators and maintain placeholder
export const formatDateInput = (value: string): string => {
  // Remove any non-digit characters from the input
  const digits = value.replace(/\D/g, "")

  // If no digits, return the placeholder
  if (digits.length === 0) return "DD/MM/YYYY"

  // Format with separators
  if (digits.length <= 2) {
    return digits
      .padEnd(10, " ")
      .replace(/\s/g, "D")
      .replace(/(\d{2})/, "$1")
      .replace(/D/g, " ")
      .trim()
  } else if (digits.length <= 4) {
    return (
      digits.slice(0, 2) +
      "/" +
      digits
        .slice(2)
        .padEnd(7, " ")
        .replace(/\s/g, "D")
        .replace(/(\d{2})/, "$1")
        .replace(/D/g, " ")
        .trim()
    )
  } else {
    return (
      digits.slice(0, 2) +
      "/" +
      digits.slice(2, 4) +
      "/" +
      digits
        .slice(4, 8)
        .padEnd(4, " ")
        .replace(/\s/g, "D")
        .replace(/(\d{4})/, "$1")
        .replace(/D/g, " ")
        .trim()
    )
  }
}

/**
 * Validate date range
 */
export const validateDateRange = (
  startDateInput: string | undefined,
  endDateInput: string | undefined,
  discount: any,
): { valid: boolean; error?: string; startDate?: Date; endDate?: Date } => {
  // Check if both start and end dates are not 'DD/MM/YYYY'
  if (startDateInput === "DD/MM/YYYY" || endDateInput === "DD/MM/YYYY") {
    return { valid: false, error: "Please enter both start and end dates" }
  }

  // Parse the start and end dates, expecting DD/MM/YYYY format
  const parsedStartDate = parse(startDateInput, "dd/MM/yyyy", new Date())
  const parsedEndDate = parse(endDateInput, "dd/MM/yyyy", new Date())

  // Check for valid parsed dates
  if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
    return { valid: false, error: "Please use DD/MM/YYYY format with valid date values" }
  }

  // Check if dates are within the all-time range
  if (!isDateWithinAllTimeRange(parsedStartDate, true, discount)) {
    return {
      valid: false,
      error: `Start date cannot be before discount creation (${format(new Date(discount.createdAt), "dd/MM/yy")})`,
    }
  }

  if (!isDateWithinAllTimeRange(parsedEndDate, false, discount)) {
    return { valid: false, error: "End date cannot be in the future" }
  }

  // Check that start date is before end date
  if (parsedStartDate > parsedEndDate) {
    return { valid: false, error: "Start date must be before end date" }
  }

  return { valid: true, startDate: parsedStartDate, endDate: parsedEndDate }
}

// Function to validate if date is within the all-time range
const isDateWithinAllTimeRange = (date: Date, isStartDate: boolean, discount: any): boolean => {
  if (!discount) return true

  const creationDate = new Date(discount.createdAt)
  const currentDate = new Date()

  if (isStartDate) {
    return date >= creationDate
  } else {
    return date <= currentDate
  }
}
