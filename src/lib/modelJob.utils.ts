import { ModelJobFull } from "@/api/modules/model-job";

export function isJobFinished(job: ModelJobFull): boolean {
  const raw = job.status as string | undefined;
  const status = raw?.toLowerCase();

  if (status === "success" || status === "error") return true;

  return !!job.error || !!job.outputPreviewFileUrl;
}

export function isJobPending(job: ModelJobFull): boolean {
  const raw = job.status as string | undefined;
  const status = raw?.toLowerCase();

  if (status === "pending" || status === "in_progress") return true;

  return !job.error && !job.outputPreviewFileUrl;
}
