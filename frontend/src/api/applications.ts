import api from "@/lib/axios";
import type {
  Application,
  ApplicationCreatePayload,
  ApplicationStatusUpdate,
  PaginatedResponse,
} from "@/types";

export const applicationsApi = {
  apply: (payload: ApplicationCreatePayload) =>
    api.post<Application>("/applications/", payload).then((r) => r.data),

  myApplications: (page?: number) =>
    api
      .get<PaginatedResponse<Application>>("/applications/my/", {
        params: { page },
      })
      .then((r) => r.data),

  jobApplications: (jobId: string, page?: number) =>
    api
      .get<PaginatedResponse<Application>>(`/applications/job/${jobId}/`, {
        params: { page },
      })
      .then((r) => r.data),

  detail: (id: string) =>
    api.get<Application>(`/applications/${id}/`).then((r) => r.data),

  updateStatus: (id: string, payload: ApplicationStatusUpdate) =>
    api
      .patch<Application>(`/applications/${id}/`, payload)
      .then((r) => r.data),

  withdraw: (id: string) =>
    api
      .patch<Application>(`/applications/${id}/`, { status: "withdrawn" })
      .then((r) => r.data),
};
