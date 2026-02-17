import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-6">
          <Calendar className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl font-medium mt-2">Page not found</p>
        <p className="text-muted-foreground mt-3">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button className="mt-6 rounded-xl cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
