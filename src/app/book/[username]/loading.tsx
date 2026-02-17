import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 rounded-lg mx-auto" />
          <Skeleton className="h-5 w-72 rounded-lg mx-auto mt-2" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
