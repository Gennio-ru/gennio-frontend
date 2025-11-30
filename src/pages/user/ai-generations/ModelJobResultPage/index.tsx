import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetModelJob, ModelJobFull } from "@/api/modules/model-job";
import { socket } from "@/api/socket/socket";
import { MODEL_JOB_EVENTS } from "@/api/socket/model-job-events";
import { ModelJobImageResult } from "./ModelJobImageResult";
import ModerationBlockedNotice from "./ModerationBlockNotice";
import { setUser } from "@/features/auth/authSlice";
import { checkApiResponseErrorCode } from "@/lib/helpers";
import { isJobPending } from "@/lib/modelJob.utils";
import Loader from "@/shared/ui/Loader";
import { route } from "@/shared/config/routes";

export default function ModelJobResultPage() {
  const { modelJobId } = useParams<{ modelJobId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [job, setJob] = useState<ModelJobFull | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [serverError, setServerError] = useState<string>();

  //
  // === LOAD JOB ===
  //
  useEffect(() => {
    if (!modelJobId) return;

    let cancelled = false;
    setLoadingJob(true);

    apiGetModelJob(modelJobId)
      .then((data) => {
        if (cancelled) return;
        const job = data as ModelJobFull;
        setJob(job);

        if (isJobPending(job)) {
          navigate(route.jobWait(job), { replace: true });
        }
      })
      .catch((e) => {
        if (cancelled) return;
        if (checkApiResponseErrorCode(e, "FORBIDDEN")) {
          setServerError("У вас нет доступа к результату этой генерации");
        } else {
          setServerError("Не удалось загрузить результат");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingJob(false);
      });

    return () => {
      cancelled = true;
    };
  }, [modelJobId, navigate]);

  //
  // === SOCKET UPDATES (на всякий случай, если открыли результат, пока он ещё считался) ===
  //
  useEffect(() => {
    if (!modelJobId) return;

    socket.emit(MODEL_JOB_EVENTS.SUBSCRIBE, modelJobId);

    const onUpdate = (updated: ModelJobFull) => {
      if (updated.id !== modelJobId) return;

      setJob(updated);
      if (updated.user) dispatch(setUser(updated.user));

      if (isJobPending(updated)) {
        navigate(route.jobWait(updated), { replace: true });
      }
    };

    socket.on(MODEL_JOB_EVENTS.UPDATE, onUpdate);

    return () => {
      socket.off(MODEL_JOB_EVENTS.UPDATE, onUpdate);
      socket.emit(MODEL_JOB_EVENTS.UNSUBSCRIBE, modelJobId);
    };
  }, [modelJobId, dispatch, navigate]);

  useEffect(() => {
    if (!job) return;
    if (isJobPending(job)) {
      navigate(route.jobWait(job), { replace: true });
    }
  }, [job, navigate]);

  //
  // === ERROR CASES ===
  //
  if (!modelJobId) {
    return <ErrorBlock>Не передан идентификатор задачи</ErrorBlock>;
  }

  if (serverError) {
    return <ErrorBlock>{serverError}</ErrorBlock>;
  }

  if (loadingJob && !job) {
    return (
      <div className="mx-auto w-full p-6 text-center">
        <Loader />
      </div>
    );
  }

  if (!job) {
    return <ErrorBlock>Не удалось загрузить результат</ErrorBlock>;
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
    <div className="w-full text-center">
      {job.error && (
        <div className="mb-4 rounded-lg bg-error/10 p-2 text-sm text-error">
          {job.error === "JOB_STALLED" ? (
            <>
              Извините, сейчас высокая нагрузка. Попробуйте повторить попытку
              чуть позже.
            </>
          ) : (
            <>Что-то пошло не так при обработке результата.</>
          )}
        </div>
      )}

      <ModelJobImageResult job={job} />
    </div>
  );
}

function ErrorBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full p-6 text-center rounded-lg bg-error/10 text-error">
      {children}
    </div>
  );
}
