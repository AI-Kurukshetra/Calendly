"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signupAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  AtSign,
  Mail,
  Lock,
  ArrowRight,
  Link2,
} from "lucide-react";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleUsernameChange(value: string) {
    const formatted = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setUsername(formatted);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signupAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground">
          Start scheduling in minutes — free forever
        </p>
      </div>

      {/* Form */}
      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            <div className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-medium">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="John Doe"
              required
              className="pl-11 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="john-doe"
              required
              minLength={3}
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
              disabled={isPending}
            />
          </div>
          {username && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <Link2 className="h-3 w-3" />
              <span>
                Your booking link:{" "}
                <span className="font-mono font-semibold">
                  calsync.app/book/{username}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="pl-11 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              required
              minLength={6}
              className="pl-11 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
              disabled={isPending}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-semibold cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <Separator />

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
