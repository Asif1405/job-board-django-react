import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Banknote,
  Building2,
  Wifi,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Job, JobType } from "@/types";
import { formatSalary, timeAgo } from "@/lib/utils";

const jobTypeLabel: Record<JobType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

const jobTypeBadge: Record<JobType, "default" | "secondary" | "info" | "success" | "warning"> = {
  full_time: "default",
  part_time: "secondary",
  contract: "warning",
  internship: "info",
  remote: "success",
};

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link to={`/jobs/${job.slug}`} className="block group">
      <Card className="transition-shadow hover:shadow-md group-hover:border-primary/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Company logo / avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company_name}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant={jobTypeBadge[job.job_type]}>
                  {jobTypeLabel[job.job_type]}
                </Badge>
                {job.is_remote && (
                  <Badge variant="outline" className="gap-1">
                    <Wifi className="h-3 w-3" /> Remote
                  </Badge>
                )}
                {job.has_applied && (
                  <Badge variant="success">Applied</Badge>
                )}
              </div>

              <h3 className="font-semibold text-base leading-snug text-foreground group-hover:text-primary transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground">{job.company_name}</p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
                {(job.salary_min || job.salary_max) && (
                  <span className="flex items-center gap-1">
                    <Banknote className="h-3 w-3" />
                    {formatSalary(job.salary_min, job.salary_max)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(job.created_at)}
                </span>
              </div>

              {/* Tags */}
              {job.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {job.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
