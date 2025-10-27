/**
 * Format a number as currency
 * @param value The number to format
 * @param currency The currency code (default: 'PKR')
 * @param locale The locale (default: 'en-PK')
 * @returns The formatted currency string
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency = "PKR",
  locale = "en-PK"
): string {
  if (value === null || value === undefined) return "";

  try {
    const numValue =
      typeof value === "string" ? Number.parseFloat(value) : value;

    if (isNaN(numValue)) return "";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "";
  }
}

/**
 * Format a number with commas
 * @param value The number to format
 * @param decimalPlaces The number of decimal places (default: 0)
 * @param locale The locale (default: 'en-PK')
 * @returns The formatted number string
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimalPlaces = 0,
  locale = "en-PK"
): string {
  if (value === null || value === undefined) return "";

  try {
    const numValue =
      typeof value === "string" ? Number.parseFloat(value) : value;

    if (isNaN(numValue)) return "";

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(numValue);
  } catch (error) {
    console.error("Error formatting number:", error);
    return "";
  }
}

/**
 * Format a number as a percentage
 * @param value The number to format (0-1)
 * @param decimalPlaces The number of decimal places (default: 0)
 * @param locale The locale (default: 'en-PK')
 * @returns The formatted percentage string
 */
export function formatPercentage(
  value: number | string | null | undefined,
  decimalPlaces = 0,
  locale = "en-PK"
): string {
  if (value === null || value === undefined) return "";

  try {
    let numValue = typeof value === "string" ? Number.parseFloat(value) : value;

    if (isNaN(numValue)) return "";

    // If the value is already in percentage form (e.g. 50 for 50%), convert it to decimal form (0.5)
    if (numValue > 1) {
      numValue = numValue / 100;
    }

    return new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(numValue);
  } catch (error) {
    console.error("Error formatting percentage:", error);
    return "";
  }
}

/**
 * Format a number as a compact number (e.g. 1.2k, 1.2M)
 * @param value The number to format
 * @param locale The locale (default: 'en-PK')
 * @returns The formatted compact number string
 */
export function formatCompactNumber(
  value: number | string | null | undefined,
  locale = "en-PK"
): string {
  if (value === null || value === undefined) return "";

  try {
    const numValue =
      typeof value === "string" ? Number.parseFloat(value) : value;

    if (isNaN(numValue)) return "";

    return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
    }).format(numValue);
  } catch (error) {
    console.error("Error formatting compact number:", error);
    return "";
  }
}

/**
 * Parse a number from a string
 * @param value The string to parse
 * @returns The parsed number
 */
export function parseNumber(value: string | null | undefined): number | null {
  if (value === null || value === undefined) return null;

  try {
    // Remove all non-numeric characters except decimal point and minus sign
    const cleanedValue = value.replace(/[^\d.-]/g, "");
    const numValue = Number.parseFloat(cleanedValue);

    return isNaN(numValue) ? null : numValue;
  } catch (error) {
    console.error("Error parsing number:", error);
    return null;
  }
}

/**
 * Format a number as a file size (e.g. 1.2 KB, 1.2 MB)
 * @param bytes The number of bytes
 * @param decimalPlaces The number of decimal places (default: 2)
 * @returns The formatted file size string
 */
export function formatFileSize(
  bytes: number | string | null | undefined,
  decimalPlaces = 2
): string {
  if (bytes === null || bytes === undefined) return "";

  try {
    const numBytes =
      typeof bytes === "string" ? Number.parseFloat(bytes) : bytes;

    if (isNaN(numBytes)) return "";

    if (numBytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));

    return `${Number.parseFloat(
      (numBytes / Math.pow(k, i)).toFixed(decimalPlaces)
    )} ${sizes[i]}`;
  } catch (error) {
    console.error("Error formatting file size:", error);
    return "";
  }
}
