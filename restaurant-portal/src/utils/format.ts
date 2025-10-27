/**
 * Format a date string to a more readable format
 * @param dateString - The date string to format
 * @returns The formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format a time string to a more readable format
 * @param timeString - The time string to format
 * @returns The formatted time string
 */
export function formatTime(timeString: string): string {
  const date = new Date(`2000-01-01T${timeString}`)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currencyCode - The currency code (default: USD)
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number, currencyCode = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}
