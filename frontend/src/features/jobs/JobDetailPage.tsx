import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Banknote,
  Clock,
  Briefcase,
  Building2,
  Wifi,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useJob } from "./useJobs";
import { useAuthStore } from "@/store/authStore";
import { ApplyModal } from "@/features/applications/ApplyModal";
import { formatSalary, formatDate } from "@/lib/utils";

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading, isError } = useJob(slug ?? "");
  const { isAuthenticated, user } = useAuthStore();
  const [applyOpen, setApplyOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">Job not found</h2>
        <p className="text-muted-foreground mt-2">
          This listing may have been removed or expired.
        </p>
        <Button className="mt-4" onClick={() => navigate("/jobs")}>
          Back to jobs
        </Button>
      </div>
    );
  }

  const canApply =
    isAuthenticated && user?.role === "candidate" && !job.has_applied && job.status === "active";

  return (
    <div className="container py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-muted">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={job.company_name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <Building2 className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <p className="text-muted-foreground">{job.company_name}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>{job.job_type.replace("_", " ")}</Badge>
                    <Badge variant="secondary">{job.experience_level}</Badge>
                    {job.is_remote && (
                      <Badge variant="outline" className="gap-1">
                        <Wifi className="h-3 w-3" /> Remote
                      </Badge>
                    )}
                    <Badge variant={job.status === "active" ? "success" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {job.location}
                </span>
                {(job.salary_min || job.salary_max) && (
                  <span className="flex items-center gap-1.5">
                    <Banknote className="h-4 w-4" />
                    {formatSalary(job.salary_min, job.salary_max)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {job.applications_count} applicants
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Posted {formatDate(job.created_at)}
                </span>
              </div>

              <div className="mt-5 flex gap-3">
                {canApply && (
                  <Button onClick={() => setApplyOpen(true)}>
                    Apply Now
                  </Button>
                )}
                {job.has_applied && (
                  <Badge variant="success" className="py-2 px-4 text-sm">
                    ✓ Application Submitted
                  </Badge>
                )}
                {!isAuthenticated && (
                  <Button onClick={() => navigate("/login")}>
                    Sign in to Apply
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" /> Job Description
              </h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, "<br/>") }}
              />
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Requirements</h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, "<br/>") }}
              />
            </CardContent>
          </Card>

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Benefits</h2>
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: job.benefits.replace(/\n/g, "<br/>") }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold">Job Overview</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium">{job.category.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Job Type</dt>
                  <dd className="font-medium">{job.job_type.replace("_", " ")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Experience</dt>
                  <dd className="font-medium capitalize">{job.experience_level}</dd>
                </div>
                {job.expires_at && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Deadline</dt>
                    <dd className="font-medium">{formatDate(job.expires_at)}</dd>
                  </div>
                )}
              </dl>

              {canApply && (
                <Button className="w-full mt-2" onClick={() => setApplyOpen(true)}>
                  Apply Now
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {job.tags.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Skills & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Apply modal */}
      {applyOpen && job && (
        <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />
      )}
    </div>
  );
}
