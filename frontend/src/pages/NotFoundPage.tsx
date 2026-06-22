import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-6xl font-extrabold text-muted-foreground">404</h1>
      <h2 className="mt-2 text-2xl font-bold">Page not found</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    </div>
  );
}
