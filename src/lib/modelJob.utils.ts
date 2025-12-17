import { ModelJobFull } from "@/api/modules/model-job";

function normStatus(job: ModelJobFull): string {
  return String(job.status ?? "").toLowerCase();
}

function hasAny(arr?: unknown): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

export function isJobFinished(job: ModelJobFull): boolean {
  const status = normStatus(job);

  // новые статусы
  if (status === "succeeded" || status === "failed") return true;

  // старые статусы (на всякий)
  if (status === "success" || status === "error") return true;

  // fallback по факту результата/ошибки
  return (
    !!job.error ||
    hasAny(job.outputPreviewFileUrls) ||
    hasAny(job.outputPreviewFileIds) ||
    hasAny(job.outputFileUrls) ||
    hasAny(job.outputFileIds)
  );
}

export function isJobPending(job: ModelJobFull): boolean {
  const status = normStatus(job);

  // новые статусы
  if (status === "queued" || status === "processing") return true;

  // старые статусы (на всякий)
  if (status === "pending" || status === "in_progress") return true;

  // pending если нет ошибки и нет результатов
  const hasResult =
    hasAny(job.outputPreviewFileUrls) ||
    hasAny(job.outputPreviewFileIds) ||
    hasAny(job.outputFileUrls) ||
    hasAny(job.outputFileIds);

  return !job.error && !hasResult;
}
