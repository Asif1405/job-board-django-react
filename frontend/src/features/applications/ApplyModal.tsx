import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useApply } from "./useApplications";
import type { Job } from "@/types";

const schema = z.object({
  cover_letter: z.string().min(50, "Cover letter must be at least 50 characters").max(2000),
});

type FormValues = z.infer<typeof schema>;

interface ApplyModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

export function ApplyModal({ job, open, onClose }: ApplyModalProps) {
  const { mutate: apply, isPending } = useApply();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    apply(
      { job: job.id, cover_letter: data.cover_letter },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-semibold">
                Apply to {job.title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {job.company_name}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Textarea
              label="Cover Letter"
              placeholder="Tell the employer why you're a great fit for this role…"
              rows={8}
              error={errors.cover_letter?.message}
              hint="Minimum 50 characters. Be specific about your relevant experience."
              {...register("cover_letter")}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={isPending}>
                Submit Application
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
