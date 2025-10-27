"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-700 mb-6">
              We're sorry, but an unexpected error has occurred. Our team has
              been notified.
            </p>
            <div className="flex justify-center">
              <Button onClick={reset}>Try again</Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
