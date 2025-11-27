import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetModelJob, ModelJobFull } from "@/api/modules/model-job";
import GennioGenerationLoader from "@/shared/ui/GennioGenerationLoader";
import { socket } from "@/api/socket/socket";
import { MODEL_JOB_EVENTS } from "@/api/socket/model-job-events";
import { setUser } from "@/features/auth/authSlice";
import { checkApiResponseErrorCode } from "@/lib/helpers";
import { isJobFinished } from "@/lib/modelJob.utils";
import { route } from "@/shared/config/routes";

export default function ModelJobWaitingResultPage() {
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

        // → ПРАВИЛЬНО: редирект только если job есть
        if (isJobFinished(job)) {
          navigate(route.jobResult(job), { replace: true });
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
  // === SOCKET UPDATES ===
  //
  useEffect(() => {
    if (!modelJobId) return;

    socket.emit(MODEL_JOB_EVENTS.SUBSCRIBE, modelJobId);

    const onUpdate = (updated: ModelJobFull) => {
      setJob(updated);
      if (updated.user) dispatch(setUser(updated.user));

      // → ПРАВИЛЬНО: job уже есть, значит можем корректно редиректить
      if (isJobFinished(updated)) {
        navigate(route.jobResult(updated), { replace: true });
      }
    };

    socket.on(MODEL_JOB_EVENTS.UPDATE, onUpdate);

    return () => {
      socket.off(MODEL_JOB_EVENTS.UPDATE, onUpdate);
      socket.emit(MODEL_JOB_EVENTS.UNSUBSCRIBE, modelJobId);
    };
  }, [modelJobId, dispatch, navigate]);

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
        <GennioGenerationLoader />
      </div>
    );
  }

  if (!job) {
    return <ErrorBlock>Не удалось загрузить результат</ErrorBlock>;
  }

  // На случай, если задача завершилась до отрисовки
  if (isJobFinished(job)) {
    navigate(route.jobResult(job), { replace: true });
    return null;
  }

  // === MAIN WAITING VIEW ===
  return (
    <div className="mx-auto w-full p-6 text-center">
      <GennioGenerationLoader />
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
