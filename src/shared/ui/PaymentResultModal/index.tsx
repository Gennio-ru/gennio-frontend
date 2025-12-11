import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectResultPaymentModalOpen,
  setPaymentModalOpen,
  setPaymentResultModalOpen,
} from "@/features/app/appSlice";
import { DialogClose } from "@radix-ui/react-dialog";
import { XIcon, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGetPayment, Payment } from "@/api/modules/payments";
import Button from "../Button";
import { useLocation } from "react-router-dom";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 15; // ~45 секунд ожидания

const isPendingStatus = (status?: Payment["status"]) =>
  status === "PENDING" || status === "WAITING_FOR_CAPTURE";
const isFailedStatus = (status?: Payment["status"]) =>
  status === "CANCELED" || status === "REFUNDED" || status === "ERROR";

export default function PaymentResultModal() {
  const location = useLocation();
  const open = useAppSelector(selectResultPaymentModalOpen);
  const dispatch = useAppDispatch();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentId = params.get("paymentId");

    if (paymentId) {
      setPaymentId(paymentId);
      setPollCount(0);
      dispatch(setPaymentResultModalOpen(true));
      dispatch(setPaymentModalOpen(false));
      setLoading(true);

      apiGetPayment(paymentId)
        .then((data) => setPayment(data))
        .finally(() => setLoading(false));
    }
  }, [location.search, dispatch]);

  // Повторные проверки, если платёж ещё в процессе
  useEffect(() => {
    if (!paymentId) return;
    if (!isPendingStatus(payment?.status)) return;
    if (pollCount >= MAX_POLLS) return;

    const timer = window.setTimeout(() => {
      apiGetPayment(paymentId)
        .then((data) => setPayment(data))
        .finally(() => setPollCount((c) => c + 1));
    }, POLL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [paymentId, payment?.status, pollCount]);

  //
  // закрытие: удаляем ?paymentId из URL
  //
  const closeModal = () => {
    dispatch(setPaymentResultModalOpen(false));

    const url = new URL(window.location.href);
    url.searchParams.delete("paymentId");
    window.history.replaceState(null, "", url.toString());
  };

  const isSuccess = payment?.status === "SUCCEEDED";
  const isPending = isPendingStatus(payment?.status);
  const isFailed = payment ? isFailedStatus(payment.status) : false;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeModal();
        else dispatch(setPaymentResultModalOpen(true));
      }}
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader className="relative">
          <DialogTitle className="mx-auto mt-1 mb-5">
            Результат оплаты
          </DialogTitle>

          <DialogClose
            className="absolute cursor-pointer top-0 right-0 focus:outline-none focus:ring-0"
            onClick={closeModal}
          >
            <XIcon size={24} />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        {/* Loading */}
        {(loading || isPending) && (
          <div className="py-10 text-center text-base-content/70">
            {isPending
              ? "Платёж обрабатывается, проверяем статус…"
              : "Проверяем оплату…"}
          </div>
        )}

        {/* УСПЕХ */}
        {!loading && !isPending && isSuccess && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="text-green-500" size={56} />

            <div className="text-lg font-medium">Оплата прошла успешно!</div>

            {payment?.meta?.tokens && (
              <div className="text-base-content/70 text-base">
                На ваш баланс зачислено{" "}
                <span className="font-semibold text-base-content">
                  {payment.meta.tokens}
                </span>{" "}
                токенов.
              </div>
            )}

            <Button onClick={closeModal} className="mt-4 px-8">
              Отлично
            </Button>
          </div>
        )}

        {/* ОШИБКА */}
        {!loading && !isPending && isFailed && (
          <div className="flex flex-col items-center gap-4 py-6">
            <XCircle className="text-red-500" size={56} />

            <div className="text-lg font-medium text-red-500">
              Оплата не прошла
            </div>

            <div className="text-base-content/70 text-sm text-center px-4">
              {payment?.errorMessage ||
                "К сожалению, транзакция не была завершена."}
            </div>

            <Button onClick={closeModal} className="mt-4 px-8">
              Закрыть
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
