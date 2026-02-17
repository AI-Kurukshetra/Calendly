import { Skeleton } from "@/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-24 rounded-lg mb-6" />
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
