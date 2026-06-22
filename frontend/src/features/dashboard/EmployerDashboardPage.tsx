import { Link } from "react-router-dom";
import { Plus, Briefcase, Users, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useMyJobs } from "@/features/jobs/useJobs";
import { useAuthStore } from "@/store/authStore";
import { timeAgo } from "@/lib/utils";

export default function EmployerDashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useMyJobs();

  const jobs = data?.results ?? [];
  const totalApplications = jobs.reduce((s, j) => s + j.applications_count, 0);
  const activeJobs = jobs.filter((j) => j.status === "active").length;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.first_name}!
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/post-job" className="gap-2">
            <Plus className="h-4 w-4" /> Post a Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold">{activeJobs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold">{totalApplications}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Listings</p>
              <p className="text-2xl font-bold">{data?.count ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job listings table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Job Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}

          {!isLoading && jobs.length === 0 && (
            <div className="py-10 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No jobs posted yet.{" "}
                <Link to="/dashboard/post-job" className="text-primary hover:underline">
                  Post your first job
                </Link>
                .
              </p>
            </div>
          )}

          {!isLoading && jobs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Job</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground">Applications</th>
                    <th className="pb-3 font-medium text-muted-foreground">Posted</th>
                    <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{job.title}</div>
                        <div className="text-xs text-muted-foreground">{job.location}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            job.status === "active"
                              ? "success"
                              : job.status === "draft"
                              ? "secondary"
                              : "outline"
                          }
                          className="capitalize"
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-medium">{job.applications_count}</span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {timeAgo(job.created_at)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/dashboard/jobs/${job.id}/applications`} className="gap-1">
                              <Users className="h-3 w-3" /> Applicants
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/jobs/${job.slug}`} className="gap-1">
                              <Eye className="h-3 w-3" /> View
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
