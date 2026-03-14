import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Decorative branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-violet-700 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Calslot</span>
          </Link>

          {/* Hero text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight tracking-tight">
                Schedule meetings
                <br />
                without the
                <br />
                <span className="text-white/80">back-and-forth.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-md leading-relaxed">
                Set your availability, share your link, and let others book time
                with you instantly.
              </p>
            </div>

            {/* Feature pills */}
            <div className="space-y-3">
              {[
                { icon: Clock, text: "Set your availability once" },
                { icon: Users, text: "Share one link for all meetings" },
                { icon: Zap, text: "Get booked automatically" },
                { icon: CheckCircle2, text: "No back-and-forth emails" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-white/80">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial-style badge */}
          <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-5 py-4 max-w-sm">
            <div className="flex -space-x-2">
              {["P", "R", "A"].map((letter, i) => (
                <div
                  key={letter}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 bg-white/20 text-xs font-semibold"
                  style={{ zIndex: 3 - i }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">
              Trusted by <span className="text-white font-medium">1,000+</span>{" "}
              professionals
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Auth form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 py-12">
        {/* Mobile logo (shown only on small screens) */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Calslot</span>
          </Link>
        </div>

        <div className="w-full max-w-[420px]">{children}</div>

        <p className="mt-8 text-xs text-muted-foreground text-center">
          By continuing, you agree to Calslot&apos;s Terms of Service
          <br />
          and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
