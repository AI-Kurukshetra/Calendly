import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SettingsContent from "@/components/dashboard/SettingsContent";

function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  );
}
