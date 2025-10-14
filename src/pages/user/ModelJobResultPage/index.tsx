import { apiGetModelJob, ModelJob } from "@/api/model-job";
import ImageWithLoader from "@/shared/ui/ImageWithLoader";
import Loader from "@/shared/ui/Loader";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

type JobWithUrls = ModelJob & {
  inputFileUrl?: string | null;
  outputFileUrl?: string | null;
};

const POLL_MS = 3000;

export default function ModelJobResultPage() {
  const { modelJobId } = useParams<{ modelJobId: string }>();

  const [job, setJob] = useState<JobWithUrls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!modelJobId) {
      setIsLoading(false);
      return;
    }

    cancelledRef.current = false;

    const fetchOnce = async () => {
      try {
        const result = (await apiGetModelJob(modelJobId)) as JobWithUrls;
        if (cancelledRef.current) return;
        setJob(result);

        const isDone = result.status === "succeeded" || Boolean(result.error);
        if (!isDone) {
          timerRef.current = window.setTimeout(fetchOnce, POLL_MS);
        }
      } catch {
        if (!cancelledRef.current) {
          timerRef.current = window.setTimeout(fetchOnce, POLL_MS);
        }
      } finally {
        if (!cancelledRef.current) setIsLoading(false);
      }
    };

    fetchOnce();

    return () => {
      cancelledRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [modelJobId]);

  const waitingForResult =
    isLoading || (!!job && !job.error && !job.outputFileUrl);

  if (!modelJobId) {
    return (
      <div className="mx-auto w-full p-6 text-center rounded-lg bg-error/10 text-error">
        Не передан идентификатор задачи
      </div>
    );
  }

  if (waitingForResult) {
    return (
      <div className="mx-auto w-full p-6 text-center">
        <Loader />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto w-full p-6 text-center rounded-lg bg-error/10 text-error">
        Не удалось загрузить результат
      </div>
    );
  }

  const { error, inputFileUrl, outputPreviewFileUrl, text, type } = job;

  return (
    <div className="mx-auto max-w-2xl p-6 text-center">
      {error && (
        <div className="mb-4 rounded-lg bg-error/10 p-2 text-sm text-error">
          Что-то пошло не так при обработке результата.
        </div>
      )}

      {text &&
        (type === "image-edit-by-prompt-id" ||
          type === "image-edit-by-prompt-text" ||
          type === "image-generate-by-prompt-text") && (
          <div className="bg-base-100 mb-4 mx-auto inline-block max-w-xl p-3 rounded-lg text-left">
            <div className="flex gap-2 items-start">
              <b className="shrink-0 w-20">Промпт:</b>
              <p className="break-words whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 text-base-content/80">
                {text}
              </p>
            </div>
          </div>
        )}

      {type === "image-edit-by-prompt-id" && (
        <div className="flex flex-col md:flex-row items-start justify-center gap-4">
          <ImageWithLoader src={inputFileUrl} alt="Оригинал" size="xs" />
          <ImageWithLoader
            src={outputPreviewFileUrl}
            alt="Результат"
            size="xl"
          />
        </div>
      )}

      {type === "image-edit-by-prompt-text" && (
        <div className="flex flex-col md:flex-row items-start justify-center gap-4">
          <ImageWithLoader src={inputFileUrl} alt="Оригинал" size="xs" />
          <ImageWithLoader
            src={outputPreviewFileUrl}
            alt="Результат"
            size="xl"
          />
        </div>
      )}

      {type === "image-generate-by-prompt-text" && (
        <div className="flex items-center justify-center">
          <ImageWithLoader
            src={outputPreviewFileUrl}
            alt="Результат"
            size="xl"
          />
        </div>
      )}
    </div>
  );
}
