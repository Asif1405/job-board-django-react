import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs";
import type { JobFilters } from "@/types";

export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobsApi.list(filters),
    staleTime: 60 * 1000,
  });
}

export function useJob(slug: string) {
  return useQuery({
    queryKey: ["job", slug],
    queryFn: () => jobsApi.detail(slug),
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}

export function useMyJobs(page?: number) {
  return useQuery({
    queryKey: ["my-jobs", page],
    queryFn: () => jobsApi.myJobs(page),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: jobsApi.categories,
    staleTime: 10 * 60 * 1000,
  });
}
