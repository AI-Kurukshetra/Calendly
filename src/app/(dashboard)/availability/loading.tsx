import { Skeleton } from "@/components/ui/skeleton";

export default function AvailabilityLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 rounded-xl" />
        <Skeleton className="h-5 w-96 rounded-lg" />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className={`px-5 py-4 ${i < 7 ? "border-b" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-[130px] rounded-lg" />
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-10 w-[130px] rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
