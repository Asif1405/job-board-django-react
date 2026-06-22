import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/api/applications";
import { toast } from "@/components/ui/useToast";
import type { ApplicationCreatePayload, ApplicationStatusUpdate } from "@/types";

export function useMyApplications(page?: number) {
  return useQuery({
    queryKey: ["my-applications", page],
    queryFn: () => applicationsApi.myApplications(page),
  });
}

export function useJobApplications(jobId: string, page?: number) {
  return useQuery({
    queryKey: ["job-applications", jobId, page],
    queryFn: () => applicationsApi.jobApplications(jobId, page),
    enabled: !!jobId,
  });
}

export function useApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplicationCreatePayload) => applicationsApi.apply(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Application submitted!", description: "Good luck with your application.", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to apply", description: "You may have already applied to this job.", variant: "destructive" });
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApplicationStatusUpdate }) =>
      applicationsApi.updateStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-applications"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });
}

export function useWithdrawApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationsApi.withdraw(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      toast({ title: "Application withdrawn" });
    },
  });
}
