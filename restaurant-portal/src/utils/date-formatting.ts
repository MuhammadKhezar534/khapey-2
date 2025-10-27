/**
 * Format a date with a specified format string
 * @param date The date to format
 * @param formatString The format string to use
 * @param defaultValue The default value to return if the date is invalid
 * @returns The formatted date string
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatString = "MMM dd, yyyy",
  defaultValue = "Invalid date"
): string {
  if (!date) return defaultValue;

  try {
    const dateObj = typeof date === "object" ? date : new Date(date);

    if (isNaN(dateObj.getTime())) return defaultValue;

    return formatDateWithPattern(dateObj, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return defaultValue;
  }
}

/**
 * Format a date with a pattern
 * @param date The date to format
 * @param pattern The pattern to use
 * @returns The formatted date string
 */
function formatDateWithPattern(date: Date, pattern: string): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthNamesShort = monthNames.map((m) => m.substring(0, 3));

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayNamesShort = dayNames.map((d) => d.substring(0, 3));

  return (
    pattern
      // Year
      .replace(/yyyy/g, year.toString())
      .replace(/yy/g, year.toString().substring(2))
      // Month
      .replace(/MMMM/g, monthNames[month])
      .replace(/MMM/g, monthNamesShort[month])
      .replace(/MM/g, (month + 1).toString().padStart(2, "0"))
      .replace(/M/g, (month + 1).toString())
      // Day
      .replace(/dddd/g, dayNames[date.getDay()])
      .replace(/ddd/g, dayNamesShort[date.getDay()])
      .replace(/dd/g, day.toString().padStart(2, "0"))
      .replace(/d/g, day.toString())
      // Hours
      .replace(/HH/g, hours.toString().padStart(2, "0"))
      .replace(/H/g, hours.toString())
      .replace(/hh/g, (hours % 12 || 12).toString().padStart(2, "0"))
      .replace(/h/g, (hours % 12 || 12).toString())
      // Minutes
      .replace(/mm/g, minutes.toString().padStart(2, "0"))
      .replace(/m/g, minutes.toString())
      // Seconds
      .replace(/ss/g, seconds.toString().padStart(2, "0"))
      .replace(/s/g, seconds.toString())
      // AM/PM
      .replace(/a/g, hours < 12 ? "am" : "pm")
      .replace(/A/g, hours < 12 ? "AM" : "PM")
  );
}

/**
 * Format a date as a relative time (e.g. "2 days ago")
 * @param date The date to format
 * @param now The reference date (defaults to now)
 * @returns The relative time string
 */
export function formatRelativeTime(
  date: Date | string | number | null | undefined,
  now: Date = new Date()
): string {
  if (!date) return "Invalid date";

  try {
    const dateObj = typeof date === "object" ? date : new Date(date);

    if (isNaN(dateObj.getTime())) return "Invalid date";

    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 0) {
      return formatDate(dateObj);
    }

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);

    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);

    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Invalid date";
  }
}

/**
 * Format a date range
 * @param startDate The start date
 * @param endDate The end date
 * @param formatString The format string to use
 * @returns The formatted date range string
 */
export function formatDateRange(
  startDate: Date | string | number | null | undefined,
  endDate: Date | string | number | null | undefined,
  formatString = "MMM dd, yyyy"
): string {
  if (!startDate || !endDate) return "Invalid date range";

  try {
    const startDateObj =
      typeof startDate === "object" ? startDate : new Date(startDate);
    const endDateObj =
      typeof endDate === "object" ? endDate : new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return "Invalid date range";
    }

    // If the dates are in the same year, only show the year once
    if (startDateObj.getFullYear() === endDateObj.getFullYear()) {
      // If the dates are in the same month, only show the month once
      if (startDateObj.getMonth() === endDateObj.getMonth()) {
        return `${formatDate(startDateObj, "MMM dd")} - ${formatDate(
          endDateObj,
          "dd, yyyy"
        )}`;
      }

      return `${formatDate(startDateObj, "MMM dd")} - ${formatDate(
        endDateObj,
        "MMM dd, yyyy"
      )}`;
    }

    return `${formatDate(startDateObj, formatString)} - ${formatDate(
      endDateObj,
      formatString
    )}`;
  } catch (error) {
    console.error("Error formatting date range:", error);
    return "Invalid date range";
  }
}

/**
 * Get the start and end of a time period
 * @param period The time period ('day', 'week', 'month', 'year')
 * @param date The reference date (defaults to now)
 * @returns An object with start and end dates
 */
export function getTimePeriod(
  period: "day" | "week" | "month" | "year",
  date: Date = new Date()
): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);

  switch (period) {
    case "day":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "week":
      // Set to the beginning of the week (Sunday)
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      // Set to the end of the week (Saturday)
      end.setDate(end.getDate() + (6 - end.getDay()));
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

/**
 * Check if a date is between two other dates
 * @param date The date to check
 * @param startDate The start date
 * @param endDate The end date
 * @param inclusive Whether to include the start and end dates
 * @returns Whether the date is between the start and end dates
 */
export function isDateBetween(
  date: Date | string | number,
  startDate: Date | string | number,
  endDate: Date | string | number,
  inclusive = true
): boolean {
  try {
    const dateObj = typeof date === "object" ? date : new Date(date);
    const startDateObj =
      typeof startDate === "object" ? startDate : new Date(startDate);
    const endDateObj =
      typeof endDate === "object" ? endDate : new Date(endDate);

    if (
      isNaN(dateObj.getTime()) ||
      isNaN(startDateObj.getTime()) ||
      isNaN(endDateObj.getTime())
    ) {
      return false;
    }

    if (inclusive) {
      return dateObj >= startDateObj && dateObj <= endDateObj;
    }

    return dateObj > startDateObj && dateObj < endDateObj;
  } catch (error) {
    console.error("Error checking if date is between:", error);
    return false;
  }
}

/**
 * Add time to a date
 * @param date The date to add time to
 * @param amount The amount of time to add
 * @param unit The unit of time to add ('seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years')
 * @returns The new date
 */
export function addTime(
  date: Date | string | number,
  amount: number,
  unit: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years"
): Date {
  try {
    const dateObj =
      typeof date === "object" ? new Date(date.getTime()) : new Date(date);

    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date");
    }

    switch (unit) {
      case "seconds":
        dateObj.setSeconds(dateObj.getSeconds() + amount);
        break;
      case "minutes":
        dateObj.setMinutes(dateObj.getMinutes() + amount);
        break;
      case "hours":
        dateObj.setHours(dateObj.getHours() + amount);
        break;
      case "days":
        dateObj.setDate(dateObj.getDate() + amount);
        break;
      case "weeks":
        dateObj.setDate(dateObj.getDate() + amount * 7);
        break;
      case "months":
        dateObj.setMonth(dateObj.getMonth() + amount);
        break;
      case "years":
        dateObj.setFullYear(dateObj.getFullYear() + amount);
        break;
    }

    return dateObj;
  } catch (error) {
    console.error("Error adding time:", error);
    return new Date();
  }
}

/**
 * Format a date for API requests (ISO format)
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDateForApi(date: Date | string | number): string {
  try {
    const dateObj = typeof date === "object" ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date");
    }

    return dateObj.toISOString();
  } catch (error) {
    console.error("Error formatting date for API:", error);
    return "";
  }
}

/**
 * Parse a date from an API response
 * @param dateString The date string to parse
 * @returns The parsed date
 */
export function parseDateFromApi(dateString: string): Date {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }

    return date;
  } catch (error) {
    console.error("Error parsing date from API:", error);
    return new Date();
  }
}
