import { Suspense } from "react";
import ConfirmationContent from "@/components/booking/ConfirmationContent";
import { Loader2 } from "lucide-react";

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
