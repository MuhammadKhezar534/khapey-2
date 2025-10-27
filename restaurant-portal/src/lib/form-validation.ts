import { z } from "zod";
import { format } from "date-fns";

/**
 * Common validation schemas for reuse
 */
export const commonSchemas = {
  nonEmptyString: z.string().min(1, "This field is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(
      /^03\d{9}$/,
      "Please enter a valid Pakistani phone number (e.g., 03XXXXXXXXX)"
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "Invalid date format",
  }),
  positiveNumber: z.number().positive("Value must be positive"),
  percentage: z
    .number()
    .min(0)
    .max(100, "Percentage must be between 0 and 100"),
  url: z.string().url("Please enter a valid URL"),
};

/**
 * Validate form data against a schema
 */
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: boolean; errors: string[]; data?: T } {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      errors: [],
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join(".");
        return `${path ? `${path}: ` : ""}${err.message}`;
      });
      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: ["An unexpected validation error occurred"],
    };
  }
}

/**
 * Format a date for display
 */
export function formatDateForDisplay(
  date: Date | string | null | undefined
): string {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

/**
 * Format a date for form input
 */
export function formatDateForInput(
  date: Date | string | null | undefined
): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "yyyy-MM-dd");
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
}

/**
 * Parse a date from a form input
 */
export function parseDateFromInput(dateString: string): Date | null {
  if (!dateString) return null;

  try {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
}
