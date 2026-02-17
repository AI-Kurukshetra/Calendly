import { Calendar, Clock, CalendarCheck, CheckCircle } from "lucide-react";
import type { DashboardStats } from "@/types";

const cards = [
  { key: "total_bookings", label: "Total Bookings", icon: Calendar, color: "text-blue-600 bg-blue-100" },
  { key: "upcoming_bookings", label: "Upcoming", icon: Clock, color: "text-primary bg-primary/10" },
  { key: "todays_bookings", label: "Today", icon: CalendarCheck, color: "text-orange-600 bg-orange-100" },
  { key: "completed_bookings", label: "Completed", icon: CheckCircle, color: "text-green-600 bg-green-100" },
] as const;

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className={`rounded-lg p-2 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold">{stats[key]}</p>
        </div>
      ))}
    </div>
  );
}
