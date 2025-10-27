/**
 * Sanitizes a string by replacing potentially harmful characters with their HTML entities
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
export function sanitizeString(str: string): string {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
