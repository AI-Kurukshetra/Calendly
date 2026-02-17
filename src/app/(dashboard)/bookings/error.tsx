"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function BookingsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground mt-2">
          We couldn&apos;t load bookings. Please try again.
        </p>
        <Button onClick={reset} className="mt-4 rounded-xl cursor-pointer">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
