import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Lottie from "lottie-react";
import { apiGetModelJob, ModelJob } from "@/api/model-job";
import Button from "@/shared/ui/Button";
import GennioGenerationLoader from "@/shared/ui/GennioGenerationLoader";
import ImageWithLoader from "@/shared/ui/ImageWithLoader";
import spinnerAnimation from "@/assets/loader-white.json";
import { socket } from "@/api/socket";
import { MODEL_JOB_EVENTS } from "@/api/model-job-events";

type JobWithUrls = ModelJob & {
  inputFileUrl?: string | null;
  outputFileUrl?: string | null;
};

export default function ModelJobResultPage() {
  const { modelJobId } = useParams<{ modelJobId: string }>();

  const [job, setJob] = useState<JobWithUrls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);

  useEffect(() => {
    if (!modelJobId) return;

    apiGetModelJob(modelJobId)
      .then((data) => setJob(data as JobWithUrls))
      .finally(() => setIsLoading(false));

    socket.emit(MODEL_JOB_EVENTS.SUBSCRIBE, modelJobId);

    const onUpdate = (updatedJob: JobWithUrls) => {
      setJob(updatedJob);
    };

    socket.on(MODEL_JOB_EVENTS.UPDATE, onUpdate);

    return () => {
      socket.off(MODEL_JOB_EVENTS.UPDATE, onUpdate);
      socket.emit(MODEL_JOB_EVENTS.UNSUBSCRIBE, modelJobId);
    };
  }, [modelJobId]);

  const {
    error,
    inputFileUrl,
    outputPreviewFileUrl,
    outputFileUrl,
    text,
    type,
  } = job || {};

  const handleDownloadOriginal = async () => {
    if (!job?.outputFileUrl) return;
    setIsLoadingOriginal(true);
    const res = await fetch(job.outputFileUrl).finally(() =>
      setIsLoadingOriginal(false)
    );
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gennio_original.jpeg";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <GennioGenerationLoader />
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

      {outputFileUrl && (
        <Button
          onClick={handleDownloadOriginal}
          className="mt-4"
          disabled={isLoadingOriginal}
        >
          <div className="flex gap-1">
            Скачать оригинал
            {isLoadingOriginal && (
              <Lottie
                animationData={spinnerAnimation}
                loop
                className="w-6 h-6 ml-2"
              />
            )}
          </div>
        </Button>
      )}
    </div>
  );
}
