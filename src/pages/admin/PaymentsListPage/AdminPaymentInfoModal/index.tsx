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
import { apiGetFullPayment, PaymentFull } from "@/api/modules/payments";
import Button from "@/shared/ui/Button";

import { AdminPaymentHeader } from "./AdminPaymentHeader";
import { AdminPaymentDetailsCard } from "./AdminPaymentDetailsCard";
import { AdminPaymentUserCard } from "./AdminPaymentUserCard";
import { AdminPaymentTimestampsCard } from "./AdminPaymentTimestampsCard";
import { AdminPaymentRefundBlock } from "./AdminPaymentRefundBlock";

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
    navigate("/admin/payments", { replace: true });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeModal();
      }}
    >
      <DialogContent
        className={cn(
          "sm:max-w-lg max-h-[80vh] flex flex-col", // 👈 скроллим содержимое
          theme === "dark" && "bg-base-100/70 backdrop-blur-md"
        )}
        showCloseButton={false}
      >
        <DialogHeader className="relative pb-3 shrink-0">
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

        {/* Лоадер */}
        {loading && (
          <div className="flex-1 py-10 text-center text-base-content/70">
            Загружаем детали платежа…
          </div>
        )}

        {/* Ошибка загрузки */}
        {!loading && loadError && (
          <div className="flex-1 py-8 flex flex-col items-center gap-4">
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

        {/* Основное содержимое */}
        {!loading && !loadError && payment && (
          <>
            {/* Скроллируемая область */}
            <div className="mt-2 flex-1 overflow-y-auto pr-1 space-y-6">
              <AdminPaymentHeader payment={payment} />

              <AdminPaymentDetailsCard payment={payment} />

              <AdminPaymentUserCard payment={payment} />

              <AdminPaymentTimestampsCard payment={payment} />

              <AdminPaymentRefundBlock
                payment={payment}
                onPaymentUpdated={setPayment}
              />
            </div>

            {/* Футер с кнопкой закрытия — зафиксирован снизу модалки */}
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
