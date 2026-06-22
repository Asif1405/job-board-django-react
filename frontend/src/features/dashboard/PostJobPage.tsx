import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "@/components/ui/useToast";
import { jobsApi } from "@/api/jobs";
import { useCategories } from "@/features/jobs/useJobs";
import type { JobWritePayload } from "@/types";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  location: z.string().min(2, "Location is required"),
  is_remote: z.boolean(),
  job_type: z.enum(["full_time", "part_time", "contract", "internship", "remote"] as const),
  experience_level: z.enum(["entry", "mid", "senior", "lead", "executive"] as const),
  salary_min: z.coerce.number().optional(),
  salary_max: z.coerce.number().optional(),
  description: z.string().min(100, "Description must be at least 100 characters"),
  requirements: z.string().min(50, "Requirements must be at least 50 characters"),
  benefits: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["draft", "active"] as const),
});

type FormValues = z.infer<typeof schema>;

export default function PostJobPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories } = useCategories();

  const { mutate: createJob, isPending } = useMutation({
    mutationFn: (payload: JobWritePayload) => jobsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
      toast({ title: "Job posted!", description: "Your listing is now live." });
      navigate("/dashboard");
    },
    onError: () => {
      toast({ title: "Failed to post job", variant: "destructive" });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_remote: false, job_type: "full_time", experience_level: "mid", status: "active" },
  });

  return (
    <div className="container max-w-3xl py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </button>

      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

      <form onSubmit={handleSubmit((data) => createJob(data))} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Job Title" placeholder="e.g. Senior React Developer" error={errors.title?.message} {...register("title")} />
            <Input label="Location" placeholder="e.g. New York, NY or Remote" error={errors.location?.message} {...register("location")} />

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("is_remote")} className="rounded" />
              <span className="text-sm font-medium">This is a remote position</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Job Type</label>
                <select
                  {...register("job_type")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
                {errors.job_type && <p className="text-xs text-destructive">{errors.job_type.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Experience Level</label>
                <select
                  {...register("experience_level")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
                {errors.experience_level && <p className="text-xs text-destructive">{errors.experience_level.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Category</label>
              <select
                {...register("category")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Salary */}
        <Card>
          <CardHeader><CardTitle>Salary (Optional)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Input label="Minimum ($)" type="number" placeholder="e.g. 80000" error={errors.salary_min?.message} {...register("salary_min")} />
            <Input label="Maximum ($)" type="number" placeholder="e.g. 120000" error={errors.salary_max?.message} {...register("salary_max")} />
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea label="Job Description" rows={8} placeholder="Describe the role, responsibilities, and what a typical day looks like…" error={errors.description?.message} hint="Minimum 100 characters" {...register("description")} />
            <Textarea label="Requirements" rows={6} placeholder="List the skills, qualifications, and experience required…" error={errors.requirements?.message} hint="Minimum 50 characters" {...register("requirements")} />
            <Textarea label="Benefits (Optional)" rows={4} placeholder="Describe perks, benefits, and what makes this a great place to work…" {...register("benefits")} />
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card>
          <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-1 w-fit">
              {(["active", "draft"] as const).map((s) => (
                <label
                  key={s}
                  className={`flex cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    watch("status") === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <input type="radio" value={s} {...register("status")} className="sr-only" />
                  {s === "active" ? "Publish Now" : "Save as Draft"}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Post Job
          </Button>
        </div>
      </form>
    </div>
  );
}
