import api from "@/lib/axios";
import type {
  Job,
  JobFilters,
  JobWritePayload,
  Category,
  Tag,
  PaginatedResponse,
} from "@/types";

export const jobsApi = {
  list: (filters?: JobFilters) =>
    api
      .get<PaginatedResponse<Job>>("/jobs/", { params: filters })
      .then((r) => r.data),

  detail: (slug: string) =>
    api.get<Job>(`/jobs/${slug}/`).then((r) => r.data),

  create: (payload: JobWritePayload) =>
    api.post<Job>("/jobs/", payload).then((r) => r.data),

  update: (slug: string, payload: Partial<JobWritePayload>) =>
    api.patch<Job>(`/jobs/${slug}/`, payload).then((r) => r.data),

  remove: (slug: string) =>
    api.delete(`/jobs/${slug}/`).then((r) => r.data),

  myJobs: (page?: number) =>
    api
      .get<PaginatedResponse<Job>>("/jobs/my-jobs/", { params: { page } })
      .then((r) => r.data),

  categories: () =>
    api.get<Category[]>("/jobs/categories/").then((r) => r.data),

  tags: () =>
    api.get<Tag[]>("/jobs/tags/").then((r) => r.data),
};
