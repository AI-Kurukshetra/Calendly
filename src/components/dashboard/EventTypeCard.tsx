"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleEventTypeActive, deleteEventType } from "@/app/(dashboard)/event-types/actions";
import { getLocationLabel } from "@/lib/utils";
import type { EventType } from "@/types";
import { Clock, Video, Phone, MapPin, Pencil, Trash2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

function LocationIcon({ type }: { type: string }) {
  const loc = getLocationLabel(type);
  if (loc.icon === "Video") return <Video className="h-3.5 w-3.5" />;
  if (loc.icon === "Phone") return <Phone className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
}

export default function EventTypeCard({ eventType }: { eventType: EventType }) {
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const result = await toggleEventTypeActive(eventType.id, checked);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(checked ? "Event type activated" : "Event type deactivated");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEventType(eventType.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Event type deleted");
        setShowDelete(false);
      }
    });
  }

  function copyLink() {
    const url = `${window.location.origin}/book/${eventType.user_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div className="h-2" style={{ backgroundColor: eventType.color }} />
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-tight">{eventType.title}</h3>
              {eventType.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {eventType.description}
                </p>
              )}
            </div>
            <Switch
              checked={eventType.is_active}
              onCheckedChange={handleToggle}
              disabled={isPending}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {eventType.duration_minutes} min
            </span>
            <span className="flex items-center gap-1.5">
              <LocationIcon type={eventType.location_type} />
              {getLocationLabel(eventType.location_type).label}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Link href={`/event-types/${eventType.id}/edit`} className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-lg cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg cursor-pointer"
              onClick={copyLink}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-destructive hover:text-destructive cursor-pointer"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event type?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{eventType.title}&quot;. Any existing
              bookings will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDelete(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
