import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-5 w-64 rounded-lg" />
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
