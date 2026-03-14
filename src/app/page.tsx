import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Link2,
  Clock,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description:
      "Set your weekly availability once. Guests only see times that work for you — no more back-and-forth emails.",
  },
  {
    icon: Link2,
    title: "Shareable Booking Links",
    description:
      "Get a personal booking page. Share one link and let anyone schedule time with you instantly.",
  },
  {
    icon: Clock,
    title: "Smart Time Slots",
    description:
      "Automatic conflict detection. Already booked? That slot disappears. Multiple time ranges per day supported.",
  },
  {
    icon: BarChart3,
    title: "Dashboard & Analytics",
    description:
      "Track all your bookings in one place. See upcoming meetings, past sessions, and manage cancellations.",
  },
];

const steps = [
  {
    number: "1",
    title: "Set Your Availability",
    description: "Define when you're free — mornings, afternoons, or split schedules with breaks.",
  },
  {
    number: "2",
    title: "Share Your Link",
    description: "Send your personal booking page to clients, colleagues, or anyone who needs time with you.",
  },
  {
    number: "3",
    title: "Get Booked",
    description: "Guests pick a date and time that works. You get notified. Done — no signup required for them.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Calslot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="rounded-xl cursor-pointer">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-xl cursor-pointer">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Zap className="h-3.5 w-3.5" />
              Free forever — no credit card required
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Schedule meetings{" "}
              <span className="text-primary">without the back-and-forth</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Calslot makes scheduling effortless. Set your availability, share your
              link, and let people book time with you — no account needed for guests.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-xl text-base px-8 h-12 cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Start Scheduling Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/book/priya-sharma">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl text-base px-8 h-12 cursor-pointer"
                >
                  See a Demo
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-green-500" />
                1,000+ users
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to manage your schedule
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, powerful scheduling tools that save you time and eliminate the
              hassle of coordination.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to get started.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex items-start gap-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div className={index < steps.length - 1 ? "pb-8 border-l-2 border-muted ml-[-30px] pl-[54px]" : ""}>
                  <h3 className="font-semibold text-xl">{step.title}</h3>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to simplify your scheduling?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of professionals who save hours every week with Calslot.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="rounded-xl text-base px-10 h-12 cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold">Calslot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for the AI Kurukshetra Hackathon
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
