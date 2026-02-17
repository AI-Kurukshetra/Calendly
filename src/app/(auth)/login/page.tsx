"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to manage your schedule
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
              placeholder="Enter your password"
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
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <Separator />

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
