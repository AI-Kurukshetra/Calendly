"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/app/(dashboard)/settings/actions";
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
import { Separator } from "@/components/ui/separator";
import type { Profile } from "@/types";
import {
  Loader2,
  Save,
  User,
  AtSign,
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function SettingsContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const [profileRes, tokenRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase
            .from("google_tokens")
            .select("id")
            .eq("user_id", user.id)
            .single(),
        ]);

        if (profileRes.data) {
          const p = profileRes.data as Profile;
          setProfile(p);
          setFullName(p.full_name);
          setBio(p.bio || "");
          setTimezone(p.timezone);
        }

        setGoogleConnected(!!tokenRes.data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const googleParam = searchParams.get("google");
    if (googleParam === "connected") {
      toast.success("Google Calendar connected!");
      setGoogleConnected(true);
    } else if (googleParam === "denied") {
      toast.error("Google Calendar access was denied.");
    } else if (googleParam === "error") {
      toast.error("Failed to connect Google Calendar.");
    }
  }, [searchParams]);

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfile({
        full_name: fullName,
        bio: bio || null,
        timezone,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated");
      }
    });
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/google/disconnect", { method: "POST" });
      if (res.ok) {
        setGoogleConnected(false);
        toast.success("Google Calendar disconnected");
      } else {
        toast.error("Failed to disconnect");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setDisconnecting(false);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-muted rounded-xl animate-pulse" />
        <div className="rounded-xl border bg-card p-6 space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and preferences.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-6">
        {/* Avatar + Name display */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
            {profile?.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-lg font-semibold">{profile?.full_name}</p>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 rounded-xl"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <AtSign className="h-4 w-4 text-muted-foreground" />
              Username
            </Label>
            <Input
              value={profile?.username || ""}
              disabled
              className="h-12 rounded-xl bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Username cannot be changed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a bit about yourself..."
              rows={3}
              className="rounded-xl resize-none"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Timezone
            </Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="h-12 rounded-xl cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz} className="cursor-pointer">
                    {tz.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl cursor-pointer min-w-[140px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Google Calendar Integration */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Google Calendar</h3>
            <p className="text-sm text-muted-foreground">
              Sync bookings to your Google Calendar automatically
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {googleConnected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">Connected</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Not connected</span>
              </>
            )}
          </div>

          {googleConnected ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl cursor-pointer"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-xl cursor-pointer"
              onClick={() => {
                window.location.href = "/api/google/connect";
              }}
            >
              Connect Google Calendar
            </Button>
          )}
        </div>

        {!googleConnected && (
          <p className="text-xs text-muted-foreground">
            When connected, new bookings will automatically appear in your
            Google Calendar. Cancelled bookings will be removed.
          </p>
        )}
      </div>
    </div>
  );
}
