"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, Mail, FileText, CalendarCheck } from "lucide-react";

export default function BookingForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (data: {
    guest_name: string;
    guest_email: string;
    notes: string;
  }) => void;
  submitting: boolean;
}) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ guest_name: guestName, guest_email: guestEmail, notes });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Your Details</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your information to confirm the booking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="guest_name" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Your Name
          </Label>
          <Input
            id="guest_name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="John Doe"
            required
            className="h-12 rounded-xl"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest_email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address
          </Label>
          <Input
            id="guest_email"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="h-12 rounded-xl"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Notes (optional)
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you'd like the host to know..."
            rows={3}
            className="rounded-xl resize-none"
            disabled={submitting}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-semibold cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CalendarCheck className="mr-2 h-4 w-4" />
              Confirm Booking
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
