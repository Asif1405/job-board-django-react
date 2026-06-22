import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useMyApplications, useWithdrawApplication } from "./useApplications";
import { formatDate } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const statusVariant: Record<
  ApplicationStatus,
  "default" | "secondary" | "success" | "warning" | "info" | "destructive" | "outline"
> = {
  submitted: "secondary",
  reviewing: "info",
  shortlisted: "warning",
  interview: "warning",
  offered: "success",
  rejected: "destructive",
  withdrawn: "outline",
};

export default function MyApplicationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyApplications(page);
  const { mutate: withdraw } = useWithdrawApplication();

  const totalPages = data ? Math.ceil(data.count / 10) : 0;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">My Applications</h1>
      <p className="text-muted-foreground mb-6">
        Track the status of all your job applications.
      </p>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && data?.results.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No applications yet</h3>
          <p className="text-muted-foreground mt-1">
            Start applying to jobs to track your progress here.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      )}

      {!isLoading && data && data.results.length > 0 && (
        <div className="space-y-4">
          {data.results.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/jobs/${app.job.slug}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {app.job.title}
                      </Link>
                      <Badge variant={statusVariant[app.status]} className="capitalize">
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {app.job.company_name} · {app.job.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Applied {formatDate(app.created_at)}
                    </p>
                    {app.cover_letter && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {app.cover_letter}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/jobs/${app.job.slug}`} className="gap-1">
                        <ExternalLink className="h-3 w-3" /> View Job
                      </Link>
                    </Button>
                    {app.status !== "withdrawn" && app.status !== "offered" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Withdraw this application?")) {
                            withdraw(app.id);
                          }
                        }}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
