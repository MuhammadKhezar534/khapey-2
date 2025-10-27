/**
 * Check if a value is empty
 * @param value The value to check
 * @returns Whether the value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true

  if (typeof value === "string") return value.trim() === ""

  if (Array.isArray(value)) return value.length === 0

  if (typeof value === "object") return Object.keys(value).length === 0

  return false
}

/**
 * Check if a value is a valid email
 * @param value The value to check
 * @returns Whether the value is a valid email
 */
export function isValidEmail(value: string): boolean {
  if (isEmpty(value)) return false

  // RFC 5322 compliant email regex
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  return emailRegex.test(value)
}

/**
 * Check if a value is a valid phone number
 * @param value The value to check
 * @returns Whether the value is a valid phone number
 */
export function isValidPhoneNumber(value: string): boolean {
  if (isEmpty(value)) return false

  // Simple phone number regex (allows for various formats)
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/

  return phoneRegex.test(value)
}

/**
 * Check if a value is a valid URL
 * @param value The value to check
 * @returns Whether the value is a valid URL
 */
export function isValidUrl(value: string): boolean {
  if (isEmpty(value)) return false

  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a value is a valid date
 * @param value The value to check
 * @returns Whether the value is a valid date
 */
export function isValidDate(value: any): boolean {
  if (isEmpty(value)) return false

  if (value instanceof Date) return !isNaN(value.getTime())

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  return false
}

/**
 * Check if a value is a valid credit card number
 * @param value The value to check
 * @returns Whether the value is a valid credit card number
 */
export function isValidCreditCard(value: string): boolean {
  if (isEmpty(value)) return false

  // Remove all non-digit characters
  const cardNumber = value.replace(/\D/g, "")

  // Check if the card number is of valid length
  if (cardNumber.length < 13 || cardNumber.length > 19) return false

  // Luhn algorithm
  let sum = 0
  let shouldDouble = false

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(cardNumber.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

/**
 * Check if a value is a valid password
 * @param value The value to check
 * @param options The options for validation
 * @returns Whether the value is a valid password
 */
export function isValidPassword(
  value: string,
  options: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  } = {},
): boolean {
  if (isEmpty(value)) return false

  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options

  if (value.length < minLength) return false

  if (requireUppercase && !/[A-Z]/.test(value)) return false

  if (requireLowercase && !/[a-z]/.test(value)) return false

  if (requireNumbers && !/[0-9]/.test(value)) return false

  if (requireSpecialChars && !/[^A-Za-z0-9]/.test(value)) return false

  return true
}

/**
 * Check if a value is within a range
 * @param value The value to check
 * @param min The minimum value
 * @param max The maximum value
 * @returns Whether the value is within the range
 */
export function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Check if a value is a valid Pakistani CNIC
 * @param value The value to check
 * @returns Whether the value is a valid Pakistani CNIC
 */
export function isValidPakistaniCNIC(value: string): boolean {
  if (isEmpty(value)) return false

  // Remove all non-digit characters
  const cnic = value.replace(/\D/g, "")

  // Check if the CNIC is of valid length (13 digits)
  return cnic.length === 13
}

/**
 * Check if a value is a valid Pakistani mobile number
 * @param value The value to check
 * @returns Whether the value is a valid Pakistani mobile number
 */
export function isValidPakistaniMobileNumber(value: string): boolean {
  if (isEmpty(value)) return false

  // Remove all non-digit characters
  const mobile = value.replace(/\D/g, "")

  // Check if the mobile number is of valid length and starts with valid prefix
  if (mobile.length !== 11) return false

  // Check if the mobile number starts with valid prefix (03)
  return mobile.startsWith("03")
}
