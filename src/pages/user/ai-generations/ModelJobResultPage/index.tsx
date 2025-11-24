import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Lottie from "lottie-react";
import { apiGetModelJob, ModelJobFull } from "@/api/modules/model-job";
import Button from "@/shared/ui/Button";
import GennioGenerationLoader from "@/shared/ui/GennioGenerationLoader";
import spinnerAnimation from "@/assets/loader-white.json";
import { socket } from "@/api/socket/socket";
import { MODEL_JOB_EVENTS } from "@/api/socket/model-job-events";
import { ModelJobImageResult } from "./ModelJobImageResult";
import ModerationBlockedNotice from "./ModerationBlockNotice";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/auth/authSlice";
import { checkApiResponseErrorCode } from "@/lib/helpers";

export default function ModelJobResultPage() {
  const { modelJobId } = useParams<{ modelJobId: string }>();
  const dispatch = useDispatch();

  const [job, setJob] = useState<ModelJobFull | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [serverError, setServerError] = useState<string>();
  const [downloadingOriginal, setDownloadingOriginal] = useState(false);

  //
  // === LOAD JOB ===
  //
  useEffect(() => {
    if (!modelJobId) return;

    setLoadingJob(true);

    apiGetModelJob(modelJobId)
      .then((data) => {
        setJob(data as ModelJobFull);
      })
      .catch((e) => {
        if (checkApiResponseErrorCode(e, "FORBIDDEN")) {
          setServerError("У вас нет доступа к результату этой генерации");
        } else {
          setServerError("Не удалось загрузить результат");
        }
      })
      .finally(() => setLoadingJob(false));
  }, [modelJobId]);

  //
  // === SOCKET UPDATES ===
  //
  useEffect(() => {
    if (!modelJobId) return;

    socket.emit(MODEL_JOB_EVENTS.SUBSCRIBE, modelJobId);

    const onUpdate = (updated: ModelJobFull) => {
      setJob(updated);
      if (updated.user) dispatch(setUser(updated.user));
    };

    socket.on(MODEL_JOB_EVENTS.UPDATE, onUpdate);

    return () => {
      socket.off(MODEL_JOB_EVENTS.UPDATE, onUpdate);
      socket.emit(MODEL_JOB_EVENTS.UNSUBSCRIBE, modelJobId);
    };
  }, [modelJobId, dispatch]);

  //
  // === DOWNLOAD ORIGINAL FILE ===
  //
  const handleDownloadOriginal = async () => {
    if (!job?.outputFileUrl) return;

    try {
      setDownloadingOriginal(true);

      const res = await fetch(job.outputFileUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "gennio_original.jpeg";
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setDownloadingOriginal(false);
    }
  };

  //
  // === ERROR CASES ===
  //
  if (!modelJobId) {
    return <ErrorBlock>Не передан идентификатор задачи</ErrorBlock>;
  }

  if (serverError) {
    return <ErrorBlock>{serverError}</ErrorBlock>;
  }

  if (loadingJob) {
    return (
      <div className="mx-auto w-full p-6 text-center">
        <GennioGenerationLoader />
      </div>
    );
  }

  if (!job) {
    return <ErrorBlock>Не удалось загрузить результат</ErrorBlock>;
  }

  //
  // === JOB TYPE LOGIC ===
  //
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
    job.error === "MODERATION_BLOCKED" || job.error === "moderation_blocked";

  if (isModerationBlocked) {
    return <ModerationBlockedNotice prompt={job.text ?? undefined} />;
  }

  //
  // === RESULT VIEW ===
  //
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
              disabled={downloadingOriginal}
            >
              <div className="flex gap-1 items-center justify-center">
                Скачать оригинал
                {downloadingOriginal && (
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

      {!isImageJob && !isTextJob && (
        <div className="mt-4 text-sm text-base-content/70">
          Тип задачи <code>{job.type}</code> пока не поддерживается в UI.
        </div>
      )}
    </div>
  );
}

//
// === SMALL REUSABLE ERROR BLOCK ===
//
function ErrorBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full p-6 text-center rounded-lg bg-error/10 text-error">
      {children}
    </div>
  );
}
