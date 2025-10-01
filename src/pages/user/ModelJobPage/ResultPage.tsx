import { apiGetModelJob, ModelJob } from "@/api/model-job";
import ImageWithLoader from "@/shared/ui/ImageWithLoader";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ModelJobResultPage() {
  const { modelJobId } = useParams<{ modelJobId: string }>();

  const [currentModelJob, setCurrentModelJob] = useState<ModelJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!modelJobId) return;

    const fetchJob = async () => {
      try {
        const job = await apiGetModelJob(modelJobId);
        setCurrentModelJob(job);

        if (job.status === "succeeded" || job.error) {
          clearInterval(interval);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
    const interval = setInterval(fetchJob, 3000);

    return () => clearInterval(interval);
  }, [modelJobId]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full p-6 text-center">
        <p className="animate-pulse text-base-content/70">Загрузка...</p>
      </div>
    );
  }

  if (!currentModelJob) {
    return (
      <div className="mx-auto w-full p-6 text-center rounded-lg bg-error/10 text-error">
        Не удалось загрузить задачу
      </div>
    );
  }

  const { error, inputFileUrl, outputFileUrl } = currentModelJob as ModelJob & {
    inputFileUrl?: string | null;
    outputFileUrl?: string | null;
  };

  return (
    <div className="mx-auto max-w-2xl p-6 text-center">
      {error && (
        <div className="mb-4 rounded-lg bg-error/10 p-2 text-sm text-error">
          Что-то пошло не так при обработке задачи.
        </div>
      )}

      {!error && !outputFileUrl && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <span className="loading loading-spinner text-base-content/50 w-10 h-10"></span>
        </div>
      )}

      {outputFileUrl && (
        <>
          <div className="bg-base-100 mb-4 mx-auto inline-block max-w-xl p-3 rounded-lg text-left">
            <div className="flex gap-2 items-start">
              <b className="shrink-0 w-20">Промпт:</b>
              <p className="break-words whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 text-base-content/80">
                {currentModelJob.prompt}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-center gap-4">
            <ImageWithLoader src={inputFileUrl} alt="Оригинал" size="xs" />

            <ImageWithLoader src={outputFileUrl} alt="Результат" size="xl" />
          </div>
        </>
      )}
    </div>
  );
}
