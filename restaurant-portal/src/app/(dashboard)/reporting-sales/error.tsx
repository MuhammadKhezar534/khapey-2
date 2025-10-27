"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function SalesReportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Sales report error:", error);
  }, [error]);

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Something went wrong!</h3>
        <p className="mb-6 text-muted-foreground max-w-md">
          We encountered an error while loading the sales report. Please try
          again or contact support if the problem persists.
        </p>
        <Button onClick={reset}>Try again</Button>
      </CardContent>
    </Card>
  );
}
