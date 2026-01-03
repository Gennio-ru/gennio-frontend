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
  // === LOAD JOB (initial) ===
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
      if (updated.id !== modelJobId) return;

      setJob(updated);
      if (updated.user) dispatch(setUser(updated.user));

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
  // === POLLING (start after 60s, then every 15s) ===
  //
  useEffect(() => {
    if (!modelJobId) return;
    if (serverError) return;

    let cancelled = false;
    // eslint-disable-next-line prefer-const
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tick = async () => {
      try {
        const data = await apiGetModelJob(modelJobId);
        if (cancelled) return;

        const updated = data as ModelJobFull;
        setJob(updated);

        if (updated.user) dispatch(setUser(updated.user));

        if (isJobFinished(updated)) {
          // стопаем до навигации, чтобы не было лишних вызовов
          if (timeoutId) clearTimeout(timeoutId);
          if (intervalId) clearInterval(intervalId);

          navigate(route.jobResult(updated), { replace: true });
        }
      } catch (e) {
        if (cancelled) return;

        if (checkApiResponseErrorCode(e, "FORBIDDEN")) {
          setServerError("У вас нет доступа к результату этой генерации");
        } else {
          // если хочешь НЕ падать в ошибку, а продолжать поллить — убери setServerError
          setServerError("Не удалось загрузить результат");
        }
      }
    };

    // старт через минуту
    timeoutId = setTimeout(() => {
      if (cancelled) return;

      tick(); // первый запрос после минуты
      intervalId = setInterval(() => {
        void tick();
      }, 15_000);
    }, 60_000);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [modelJobId, serverError, dispatch, navigate]);

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
