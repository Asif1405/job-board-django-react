import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useJobApplications, useUpdateApplicationStatus } from "@/features/applications/useApplications";
import { formatDate } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const STATUSES: ApplicationStatus[] = [
  "submitted",
  "reviewing",
  "shortlisted",
  "interview",
  "offered",
  "rejected",
];

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

export default function ManageApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useJobApplications(jobId ?? "", page);
  const { mutate: updateStatus } = useUpdateApplicationStatus();

  const totalPages = data ? Math.ceil(data.count / 10) : 0;

  return (
    <div className="container py-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </button>

      <h1 className="text-3xl font-bold mb-2">Manage Applications</h1>
      {data && (
        <p className="text-muted-foreground mb-6">
          {data.count} {data.count === 1 ? "application" : "applications"} received
        </p>
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && data?.results.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No applications yet for this job.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && data && data.results.length > 0 && (
        <div className="space-y-4">
          {data.results.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">
                        {app.applicant.full_name}
                      </h3>
                      <Badge variant={statusVariant[app.status]} className="capitalize">
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {app.applicant.email}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" /> Applied {formatDate(app.created_at)}
                    </p>
                    {app.cover_letter && (
                      <details className="mt-3 text-sm">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View cover letter
                        </summary>
                        <p className="mt-2 rounded-md bg-muted p-3 text-sm leading-relaxed">
                          {app.cover_letter}
                        </p>
                      </details>
                    )}
                  </div>

                  <div className="shrink-0">
                    <label className="text-xs text-muted-foreground block mb-1">Update Status</label>
                    <select
                      value={app.status}
                      onChange={(e) =>
                        updateStatus({ id: app.id, payload: { status: e.target.value as ApplicationStatus } })
                      }
                      className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
