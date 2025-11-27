import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { XCircle, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { apiGetModelJob, ModelJobFull } from "@/api/modules/model-job";
import Button from "@/shared/ui/Button";
import ImageThumb from "@/shared/ui/ImageThumb";
import { AppRoute } from "@/shared/config/routes";

export default function AdminModelJobModal() {
  const { modelJobId } = useParams<{ modelJobId: string }>();
  const open = Boolean(modelJobId);

  const theme = useAppSelector(selectAppTheme);
  const navigate = useNavigate();

  const [modelJob, setModelJob] = useState<ModelJobFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelJobId) {
      setModelJob(null);
      setLoadError(null);
      return;
    }

    setLoading(true);
    setLoadError(null);

    apiGetModelJob(modelJobId)
      .then((data) => setModelJob(data))
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setLoadError(msg);
      })
      .finally(() => setLoading(false));
  }, [modelJobId]);

  const closeModal = () => {
    navigate(AppRoute.ADMIN_JOBS, { replace: true });
  };

  const renderStatusBadge = (status: ModelJobFull["status"]) => {
    let base =
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ";
    if (status === "succeeded")
      base += "bg-success/15 text-success border border-success/40";
    else if (status === "failed")
      base += "bg-error/15 text-error border border-error/40";
    else base += "bg-warning/15 text-warning border border-warning/40";
    return <span className={base}>{status}</span>;
  };

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleString() : "—";

  const title =
    modelJob?.text ||
    (modelJobId ? `Задача модели ${modelJobId.slice(0, 8)}…` : "Задача модели");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeModal();
      }}
    >
      <DialogContent
        className={cn(
          "sm:max-w-xl flex flex-col max-h-[80vh] overflow-y-auto",
          theme === "dark" && "bg-base-100/70 backdrop-blur-md"
        )}
        showCloseButton={false}
      >
        <DialogHeader className="relative pb-3 shrink-0">
          <DialogTitle className="text-center text-lg line-clamp-2">
            {title}
          </DialogTitle>

          <DialogClose
            className="absolute cursor-pointer top-0 right-0 focus:outline-none focus:ring-0"
            onClick={closeModal}
          >
            <XIcon size={22} />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        {/* Лоадер */}
        {loading && (
          <div className="flex-1 py-10 text-center text-base-content/70">
            Загружаем задачу…
          </div>
        )}

        {/* Ошибка */}
        {!loading && loadError && (
          <div className="flex-1 py-8 flex flex-col items-center gap-4">
            <XCircle className="text-error" size={48} />
            <div className="text-base font-medium text-error">
              Не удалось загрузить задачу
            </div>
            <div className="text-xs text-base-content/60 max-w-sm text-center">
              {loadError}
            </div>
            <Button onClick={closeModal} className="mt-2 px-6">
              Закрыть
            </Button>
          </div>
        )}

        {/* Контент */}
        {!loading && !loadError && modelJob && (
          <>
            <div className="mt-2 flex-1 pr-1 space-y-5 text-sm">
              {/* Основная информация */}
              <section className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-base-content/60 uppercase tracking-wide">
                      Модель / тип задачи
                    </div>
                    <div className="font-medium">
                      {modelJob.model} • {modelJob.type}
                    </div>
                  </div>

                  {renderStatusBadge(modelJob.status)}
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-base-content/70">
                  <div>
                    <span className="font-medium">Токенов списано: </span>
                    {modelJob.tokensCharged}
                  </div>
                  <div>
                    <span className="font-medium">Тариф: </span>
                    {modelJob.tariffCode}
                  </div>
                  <div>
                    <span className="font-medium">ID: </span>
                    {modelJob.id}
                  </div>
                </div>
              </section>

              {/* Пользователь */}
              <section className="space-y-1">
                <div className="text-xs text-base-content/60 uppercase tracking-wide">
                  Пользователь
                </div>
                <div className="rounded-box bg-base-200/60 px-3 py-2">
                  {modelJob.user ? (
                    <>
                      <div className="font-medium">
                        {modelJob.user.email ||
                          modelJob.user.phone ||
                          modelJob.user.id}
                      </div>
                      <div className="text-xs text-base-content/60 mt-1">
                        userId: {modelJob.userId}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-base-content/60">
                      Нет привязанного пользователя (userId: {modelJob.userId})
                    </div>
                  )}
                </div>
              </section>

              {/* Файлы — превью картинок */}
              <section className="space-y-2">
                <div className="text-xs text-base-content/60 uppercase tracking-wide">
                  Изображения
                </div>
                <div className="flex flex-wrap gap-4">
                  <ImageThumb label="Вход" url={modelJob.inputFileUrl} />
                  <ImageThumb label="Выход" url={modelJob.outputFileUrl} />
                  <ImageThumb
                    label="Превью"
                    url={modelJob.outputPreviewFileUrl}
                  />
                </div>
              </section>

              {/* Тексты (только входной + ошибка) */}
              <section className="space-y-2">
                <div className="text-xs text-base-content/60 uppercase tracking-wide">
                  Тексты
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-base-content/60 mb-0.5">
                      Входной текст (prompt)
                    </div>
                    <div className="rounded-box bg-base-200/60 px-3 py-2 text-sm max-h-32 overflow-y-auto">
                      {modelJob.text || (
                        <span className="text-base-content/50">—</span>
                      )}
                    </div>
                  </div>

                  {modelJob.error && (
                    <div>
                      <div className="text-xs text-base-content/60 mb-0.5">
                        Ошибка
                      </div>
                      <div className="rounded-box bg-error/10 px-3 py-2 text-xs text-error max-h-24 overflow-y-auto">
                        {modelJob.error}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Токены (детали) */}
              {modelJob.usedTokens && (
                <section className="space-y-1">
                  <div className="text-xs text-base-content/60 uppercase tracking-wide">
                    Детали использования токенов
                  </div>
                  <pre className="rounded-box bg-base-200/60 px-3 py-2 text-xs max-h-40 overflow-y-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(modelJob.usedTokens, null, 2)}
                  </pre>
                </section>
              )}

              {/* Время */}
              <section className="space-y-1">
                <div className="text-xs text-base-content/60 uppercase tracking-wide">
                  Время
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-base-content/80">
                  <div>
                    <span className="font-medium">Создано: </span>
                    {formatDate(modelJob.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Обновлено: </span>
                    {formatDate(modelJob.updatedAt)}
                  </div>
                  <div>
                    <span className="font-medium">Старт: </span>
                    {formatDate(modelJob.startedAt)}
                  </div>
                  <div>
                    <span className="font-medium">Финиш: </span>
                    {formatDate(modelJob.finishedAt)}
                  </div>
                </div>
              </section>
            </div>

            {/* Футер */}
            <div className="pt-3 flex justify-end shrink-0">
              <Button onClick={closeModal} className="px-6">
                Закрыть
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
