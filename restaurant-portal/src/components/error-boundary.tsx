"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, info);

    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          <p className="mb-4 text-sm">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
  const displayName = Component.displayName || Component.name || "Component";

  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps} componentName={displayName}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  return WrappedComponent;
}
