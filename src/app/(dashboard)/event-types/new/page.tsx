"use client";

import { useState, useTransition } from "react";
import { createEventType } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSlug } from "@/lib/utils";
import { ArrowLeft, Loader2, Type, Clock, MapPin, Palette } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const LOCATION_OPTIONS = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "phone", label: "Phone Call" },
  { value: "in_person", label: "In Person" },
];

const COLOR_OPTIONS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6b7280", "#1e293b",
];

export default function NewEventTypePage() {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createEventType(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/event-types">
          <Button variant="ghost" size="icon" className="rounded-xl cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Event Type</h1>
          <p className="text-muted-foreground mt-1">
            Create a new type of event for people to book.
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            <div className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              Event Title
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., 30 Min Meeting"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
              disabled={isPending}
            />
            {title && (
              <p className="text-xs text-muted-foreground">
                Slug: <span className="font-mono">{generateSlug(title)}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of this event..."
              rows={3}
              className="rounded-xl resize-none"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Duration
              </Label>
              <Select name="duration_minutes" defaultValue="30" required>
                <SelectTrigger className="h-12 rounded-xl cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </Label>
              <Select name="location_type" defaultValue="google_meet" required>
                <SelectTrigger className="h-12 rounded-xl cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              Color
            </Label>
            <input type="hidden" name="color" value={color} />
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-9 w-9 rounded-lg transition-all cursor-pointer ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/event-types">
            <Button type="button" variant="outline" className="rounded-xl cursor-pointer">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="rounded-xl cursor-pointer min-w-[140px]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Event Type"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
