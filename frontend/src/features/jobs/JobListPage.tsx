import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { JobCard } from "./JobCard";
import { JobFiltersPanel } from "./JobFilters";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useJobs } from "./useJobs";
import type { JobFilters } from "@/types";

export default function JobListPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<JobFilters>({
    search: searchParams.get("q") ?? undefined,
    page: 1,
  });

  const { data, isLoading, isError } = useJobs(filters);

  const totalPages = data ? Math.ceil(data.count / 10) : 0;
  const currentPage = filters.page ?? 1;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Browse Jobs</h1>
        {data && (
          <p className="mt-1 text-muted-foreground">
            {data.count} {data.count === 1 ? "job" : "jobs"} found
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters sidebar */}
        <div className="hidden lg:block">
          <JobFiltersPanel filters={filters} onChange={setFilters} />
        </div>

        {/* Results */}
        <div>
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
              <p className="text-destructive">Failed to load jobs. Please try again.</p>
            </div>
          )}

          {!isLoading && !isError && data?.results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No jobs found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your filters or search query.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setFilters({ page: 1 })}
              >
                Clear filters
              </Button>
            </div>
          )}

          {!isLoading && data && data.results.length > 0 && (
            <>
              <div className="space-y-4">
                {data.results.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setFilters((f) => ({ ...f, page: currentPage - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: currentPage + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
