import { Skeleton } from "@/components/ui/skeleton";

export default function EventTypesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-5 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            <Skeleton className="h-2 w-full" />
            <div className="p-5 space-y-4">
              <Skeleton className="h-6 w-40 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
