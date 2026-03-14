import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
        <p className="text-muted-foreground">
          We&apos;ve sent you a confirmation link. Click the link in your email
          to verify your account and then sign in.
        </p>
      </div>

      <div className="rounded-xl bg-muted/50 border border-muted-foreground/20 px-4 py-3 text-sm text-muted-foreground">
        Didn&apos;t receive an email? Check your spam folder or{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          try again
        </Link>
        .
      </div>

      <Button asChild variant="outline" className="w-full h-12 rounded-xl">
        <Link href="/login">Go to sign in</Link>
      </Button>
    </div>
  );
}
