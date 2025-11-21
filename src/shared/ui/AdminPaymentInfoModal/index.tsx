import { useEffect, useState, useMemo } from "react";
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
import { CheckCircle, XCircle, XIcon, InfoIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { apiGetFullPayment, PaymentFull } from "@/api/modules/payments";
import Button from "../Button";

export default function AdminPaymentInfoModal() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const open = Boolean(paymentId);

  const theme = useAppSelector(selectAppTheme);
  const navigate = useNavigate();

  const [payment, setPayment] = useState<PaymentFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  //
  // Загружаем платёж, если в урле есть :paymentId
  //
  useEffect(() => {
    if (!paymentId) {
      setPayment(null);
      setLoadError(null);
      return;
    }

    setLoading(true);
    setLoadError(null);

    apiGetFullPayment(paymentId)
      .then((data) => {
        setPayment(data);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setLoadError(msg);
      })
      .finally(() => setLoading(false));
  }, [paymentId]);

  //
  // Закрытие модалки: уходим на список платежей
  //
  const closeModal = () => {
    // можно сохранить query/filters, если список использует их
    // тут просто возвращаемся на /admin/payments
    navigate("/admin/payments", { replace: true });
  };

  const isSucceeded = payment?.status === "SUCCEEDED";
  const isFailed = payment && payment.status !== "SUCCEEDED";

  const statusPill = useMemo(() => {
    if (!payment) return null;

    const hasError = Boolean(payment.errorCode || payment.errorMessage);

    let baseClass =
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

    if (payment.status === "SUCCEEDED") {
      baseClass += " bg-success/10 text-success";
    } else if (payment.status === "CANCELED") {
      baseClass += " bg-error/10 text-error";
    } else if (payment.status === "REFUNDED") {
      baseClass += " bg-warning/10 text-warning";
    } else if (hasError) {
      baseClass += " bg-error/10 text-error";
    } else {
      baseClass += " bg-base-200 text-base-content/80";
    }

    return <span className={baseClass}>{payment.status}</span>;
  }, [payment]);

  const createdAt = payment ? new Date(payment.createdAt).toLocaleString() : "";
  const updatedAt = payment ? new Date(payment.updatedAt).toLocaleString() : "";
  const capturedAt = payment?.capturedAt
    ? new Date(payment.capturedAt).toLocaleString()
    : null;
  const canceledAt = payment?.canceledAt
    ? new Date(payment.canceledAt).toLocaleString()
    : null;
  const refundedAt = payment?.refundedAt
    ? new Date(payment.refundedAt).toLocaleString()
    : null;

  const creditedTokens = payment?.meta?.tokens ?? null; // тип meta обычно any / расширяемый

  const userEmail = payment?.user?.email ?? null;
  const userId = payment?.userId ?? null;
  const userTokens = payment?.user?.tokens ?? payment?.user?.tokens ?? null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeModal();
      }}
    >
      <DialogContent
        className={cn(
          "sm:max-w-lg",
          theme === "dark" && "bg-base-100/70 backdrop-blur-md"
        )}
        showCloseButton={false}
      >
        <DialogHeader className="relative pb-3">
          <DialogTitle className="text-center text-lg">
            Информация о платеже
          </DialogTitle>

          <DialogClose
            className="absolute cursor-pointer top-0 right-0 focus:outline-none focus:ring-0"
            onClick={closeModal}
          >
            <XIcon size={22} />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        {/* Состояние загрузки */}
        {loading && (
          <div className="py-10 text-center text-base-content/70">
            Загружаем детали платежа…
          </div>
        )}

        {/* Ошибка загрузки */}
        {!loading && loadError && (
          <div className="py-8 flex flex-col items-center gap-4">
            <XCircle className="text-error" size={48} />
            <div className="text-base font-medium text-error">
              Не удалось загрузить платёж
            </div>
            <div className="text-xs text-base-content/60 max-w-sm text-center">
              {loadError}
            </div>
            <Button onClick={closeModal} className="mt-2 px-6">
              Закрыть
            </Button>
          </div>
        )}

        {/* Основное содержимое, когда всё ок */}
        {!loading && !loadError && payment && (
          <div className="space-y-6 pt-1">
            {/* Иконка статуса + краткий вывод */}
            <div className="flex items-center gap-3">
              {isSucceeded ? (
                <CheckCircle className="text-green-500" size={32} />
              ) : isFailed ? (
                <XCircle className="text-red-500" size={32} />
              ) : (
                <InfoIcon className="text-base-content/70" size={32} />
              )}

              <div className="flex flex-col gap-1">
                <div className="text-base font-medium">
                  Платёж #{payment.id}
                </div>
                <div>{statusPill}</div>
              </div>
            </div>

            {/* Блок: Платеж */}
            <div className="rounded-box bg-base-200/60 p-3 text-sm space-y-2">
              <div className="font-medium mb-1">Платёж</div>

              <div className="flex justify-between gap-3">
                <span className="text-base-content/60">Сумма</span>
                <span className="font-medium">
                  {payment.amount} {payment.currency}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-base-content/60">Провайдер</span>
                <span>{payment.provider ?? "—"}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-base-content/60">ID у провайдера</span>
                <span className="break-all">
                  {payment.providerPaymentId ?? "—"}
                </span>
              </div>

              {payment.description && (
                <div className="mt-1">
                  <div className="text-base-content/60 mb-0.5">Описание</div>
                  <div className="text-base-content break-words">
                    {payment.description}
                  </div>
                </div>
              )}

              {creditedTokens != null && (
                <div className="flex justify-between gap-3 mt-1">
                  <span className="text-base-content/60">
                    Токенов начислено
                  </span>
                  <span className="font-medium">{creditedTokens}</span>
                </div>
              )}
            </div>

            {/* Блок: Пользователь */}
            <div className="rounded-box bg-base-200/60 p-3 text-sm space-y-2">
              <div className="font-medium mb-1">Пользователь</div>

              <div className="flex justify-between gap-3">
                <span className="text-base-content/60">Email</span>
                <span>{userEmail ?? "—"}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-base-content/60">User ID</span>
                <span className="break-all">{userId ?? "—"}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-base-content/60">Баланс токенов</span>
                <span>{userTokens != null ? userTokens : "—"}</span>
              </div>
            </div>

            {/* Блок: Время / статусы */}
            <div className="rounded-box bg-base-200/60 p-3 text-xs space-y-1">
              <div className="font-medium mb-1 text-sm">Временные метки</div>

              <div className="flex justify-between gap-3">
                <span className="text-base-content/60">Создан</span>
                <span className="text-base-content/80">{createdAt}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-base-content/60">Обновлён</span>
                <span className="text-base-content/80">{updatedAt}</span>
              </div>

              {capturedAt && (
                <div className="flex justify-between gap-3">
                  <span className="text-base-content/60">Списан</span>
                  <span className="text-base-content/80">{capturedAt}</span>
                </div>
              )}

              {canceledAt && (
                <div className="flex justify-between gap-3">
                  <span className="text-base-content/60">Отменён</span>
                  <span className="text-base-content/80">{canceledAt}</span>
                </div>
              )}

              {refundedAt && (
                <div className="flex justify-between gap-3">
                  <span className="text-base-content/60">Возврат</span>
                  <span className="text-base-content/80">{refundedAt}</span>
                </div>
              )}

              {payment.errorMessage && (
                <div className="mt-2 pt-2 border-t border-base-300">
                  <div className="text-base-content/60 mb-0.5">
                    Сообщение об ошибке
                  </div>
                  <div className="text-error text-xs">
                    {payment.errorMessage}
                  </div>
                  {payment.errorCode && (
                    <div className="text-error/80 text-[11px] mt-0.5">
                      Код ошибки: {payment.errorCode}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={closeModal} className="px-6">
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
