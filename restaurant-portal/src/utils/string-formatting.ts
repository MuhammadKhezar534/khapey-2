/**
 * Capitalize the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeFirstLetter(str: string | null | undefined): string {
  if (!str) return ""

  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate a string to a maximum length
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @param suffix The suffix to add (default: '...')
 * @returns The truncated string
 */
export function truncateString(str: string | null | undefined, maxLength: number, suffix = "..."): string {
  if (!str) return ""

  if (str.length <= maxLength) return str

  return str.slice(0, maxLength) + suffix
}

/**
 * Convert a string to kebab case
 * @param str The string to convert
 * @returns The kebab case string
 */
export function toKebabCase(str: string | null | undefined): string {
  if (!str) return ""

  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
}

/**
 * Convert a string to camel case
 * @param str The string to convert
 * @returns The camel case string
 */
export function toCamelCase(str: string | null | undefined): string {
  if (!str) return ""

  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, "")
}

/**
 * Convert a string to pascal case
 * @param str The string to convert
 * @returns The pascal case string
 */
export function toPascalCase(str: string | null | undefined): string {
  if (!str) return ""

  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, "")
}

/**
 * Convert a string to snake case
 * @param str The string to convert
 * @returns The snake case string
 */
export function toSnakeCase(str: string | null | undefined): string {
  if (!str) return ""

  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase()
}

/**
 * Sanitize a string for use in HTML
 * @param str The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeHtml(str: string | null | undefined): string {
  if (!str) return ""

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Generate a slug from a string
 * @param str The string to generate a slug from
 * @returns The slug
 */
export function generateSlug(str: string | null | undefined): string {
  if (!str) return ""

  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Format a phone number
 * @param phoneNumber The phone number to format
 * @param format The format to use (default: 'xxx-xxx-xxxx')
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string | null | undefined, format = "xxx-xxx-xxxx"): string {
  if (!phoneNumber) return ""

  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "")

  // If the cleaned phone number doesn't match the expected length, return it as is
  if (cleaned.length !== format.replace(/[^x]/g, "").length) {
    return phoneNumber
  }

  let result = format
  let index = 0

  // Replace each 'x' in the format with the corresponding digit
  for (let i = 0; i < result.length; i++) {
    if (result[i] === "x") {
      result = result.substring(0, i) + cleaned[index++] + result.substring(i + 1)
    }
  }

  return result
}

/**
 * Format a credit card number
 * @param cardNumber The credit card number to format
 * @param separator The separator to use (default: ' ')
 * @returns The formatted credit card number
 */
export function formatCreditCardNumber(cardNumber: string | null | undefined, separator = " "): string {
  if (!cardNumber) return ""

  // Remove all non-numeric characters
  const cleaned = cardNumber.replace(/\D/g, "")

  // Split the card number into groups of 4
  const groups = []

  for (let i = 0; i < cleaned.length; i += 4) {
    groups.push(cleaned.substring(i, i + 4))
  }

  return groups.join(separator)
}

/**
 * Mask a string (e.g. for credit card numbers)
 * @param str The string to mask
 * @param visibleChars The number of characters to leave visible at the end
 * @param maskChar The character to use for masking (default: '*')
 * @returns The masked string
 */
export function maskString(str: string | null | undefined, visibleChars = 4, maskChar = "*"): string {
  if (!str) return ""

  if (str.length <= visibleChars) return str

  const visiblePart = str.slice(-visibleChars)
  const maskedPart = maskChar.repeat(str.length - visibleChars)

  return maskedPart + visiblePart
}
