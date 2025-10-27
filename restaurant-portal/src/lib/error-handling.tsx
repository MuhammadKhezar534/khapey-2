"use client";

import { toast } from "@/hooks/use-toast";

/**
 * Error types for consistent error handling
 */
export enum ErrorType {
  NETWORK = "network",
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  SERVER = "server",
  UNKNOWN = "unknown",
}

/**
 * Standard error structure
 */
export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  statusCode?: number;
}

/**
 * Handle errors consistently across the application
 */
export function handleError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred"
): AppError {
  console.error("Error:", error);

  // If it's already our AppError type, return it
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    "message" in error
  ) {
    const appError = error as AppError;

    // Show toast for the error
    toast({
      title: getErrorTitle(appError.type),
      description: appError.message,
      variant: "destructive",
    });

    return appError;
  }

  // Convert unknown error to AppError
  const appError: AppError = {
    type: ErrorType.UNKNOWN,
    message: fallbackMessage,
  };

  // Handle Error objects
  if (error instanceof Error) {
    appError.message = error.message;

    // Check for network errors
    if (
      error.name === "NetworkError" ||
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      appError.type = ErrorType.NETWORK;
    }
  }

  // Handle response errors
  if (typeof error === "object" && error !== null && "status" in error) {
    const statusCode = (error as any).status;
    const serverMessage = (error as any)?.response?.data?.message;
    appError.statusCode = statusCode;

    if (statusCode === 400) {
      appError.type = ErrorType.VALIDATION;
      appError.message = serverMessage ?? "Error";
    } else if (statusCode === 401) {
      appError.type = ErrorType.AUTHENTICATION;
      appError.message = serverMessage ?? "Authentication required";
    } else if (statusCode === 403) {
      appError.type = ErrorType.AUTHORIZATION;
      appError.message =
        serverMessage ?? "You do not have permission to perform this action";
    } else if (statusCode === 404) {
      appError.type = ErrorType.NOT_FOUND;
      appError.message =
        serverMessage ?? "The requested resource was not found";
    } else if (statusCode >= 500) {
      appError.type = ErrorType.SERVER;
      appError.message = "A server error occurred. Please try again later.";
    } else if (statusCode === 422) {
      appError.type = ErrorType.VALIDATION;
      appError.message = serverMessage ?? "Error";
    }
  }

  toast({
    title: getErrorTitle(appError.type),
    description: appError.message,
    variant: "destructive",
  });

  return appError;
}

/**
 * Get a user-friendly error title based on error type
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK:
      return "Network Error";
    case ErrorType.VALIDATION:
      return "Validation Error";
    case ErrorType.AUTHENTICATION:
      return "Authentication Error";
    case ErrorType.AUTHORIZATION:
      return "Permission Denied";
    case ErrorType.NOT_FOUND:
      return "Not Found";
    case ErrorType.SERVER:
      return "Server Error";
    case ErrorType.UNKNOWN:
    default:
      return "Error";
  }
}

/**
 * Create a custom error with our standard format
 */
export function createAppError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  details?: any,
  statusCode?: number
): AppError {
  return {
    type,
    message,
    details,
    statusCode,
  };
}

/**
 * Error boundary fallback component
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="mb-4">{error.message || "An unexpected error occurred"}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
