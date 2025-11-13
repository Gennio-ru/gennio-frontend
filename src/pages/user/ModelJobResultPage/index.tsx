import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Lottie from "lottie-react";
import { apiGetModelJob, ModelJob } from "@/api/model-job";
import Button from "@/shared/ui/Button";
import GennioGenerationLoader from "@/shared/ui/GennioGenerationLoader";
import spinnerAnimation from "@/assets/loader-white.json";
import { socket } from "@/api/socket";
import { MODEL_JOB_EVENTS } from "@/api/model-job-events";
import { ModelJobImageResult } from "./ModelJobImageResult";
import { ModelJobTextResult } from "./ModelJobTextResult";
import ModerationBlockedNotice from "./ModerationBlockNotice";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/auth/authSlice";

export type JobWithUrls = ModelJob & {
  inputFileUrl?: string | null;
  outputFileUrl?: string | null;
  outputPreviewFileUrl?: string | null;
  outputText?: string | null;
};

export default function ModelJobResultPage() {
  const dispatch = useDispatch();
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

      if (updatedJob.user) {
        dispatch(setUser(updatedJob.user));
      }
    };

    socket.on(MODEL_JOB_EVENTS.UPDATE, onUpdate);

    return () => {
      socket.off(MODEL_JOB_EVENTS.UPDATE, onUpdate);
      socket.emit(MODEL_JOB_EVENTS.UNSUBSCRIBE, modelJobId);
    };
  }, [modelJobId, dispatch]);

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

  if (!modelJobId) {
    return (
      <div className="mx-auto w-full p-6 text-center rounded-lg bg-error/10 text-error">
        Не передан идентификатор задачи
      </div>
    );
  }

  if (isLoading) {
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

  const isImageJob =
    job.type === "image-edit-by-prompt-id" ||
    job.type === "image-edit-by-prompt-text" ||
    job.type === "image-generate-by-prompt-text";

  const isTextJob = job.type === "text-generate";

  const waitingForResult =
    !job.error &&
    ((isImageJob && !job.outputFileUrl) || (isTextJob && !job.outputText));

  if (waitingForResult) {
    return (
      <div className="mx-auto w-full p-6 text-center">
        <GennioGenerationLoader />
      </div>
    );
  }

  const isModerationBlocked =
    job?.error === "MODERATION_BLOCKED" || job?.error === "moderation_blocked";

  if (isModerationBlocked) {
    return <ModerationBlockedNotice prompt={job.text ?? undefined} />;
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      {job.error && (
        <div className="mb-4 rounded-lg bg-error/10 p-2 text-sm text-error">
          Что-то пошло не так при обработке результата.
        </div>
      )}

      {isImageJob && (
        <>
          <ModelJobImageResult job={job} />
          {job.outputFileUrl && (
            <Button
              onClick={handleDownloadOriginal}
              className="mt-4"
              disabled={isLoadingOriginal}
            >
              <div className="flex gap-1 items-center justify-center">
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
        </>
      )}

      {isTextJob && <ModelJobTextResult job={job} />}

      {!isImageJob && !isTextJob && (
        <div className="mt-4 text-sm text-base-content/70">
          Тип задачи <code>{job.type}</code> пока не поддерживается в UI.
        </div>
      )}
    </div>
  );
}
