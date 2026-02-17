"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function BookError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground mt-2">
          We couldn&apos;t load this booking page. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Link href="/">
            <Button variant="outline" className="rounded-xl cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Button onClick={reset} className="rounded-xl cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
