import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import {
  selectAppTheme,
  selectPaymentModalOpen,
  setPaymentModalOpen,
} from "@/features/app/appSlice";

import { useEffect, useState } from "react";
import { apiCreateTokensPayment, Payment } from "@/api/modules/payments";
import Button from "@/shared/ui/Button";
import {
  apiGetTokenPacks,
  TokenPack,
  TokenPackId,
} from "@/api/modules/pricing";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "@/api/socket/socket";
import { PAYMENT_EVENTS } from "@/api/socket/payment-events";
import { meThunk } from "@/features/auth/authSlice";

export default function PaymentModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useAppSelector(selectAppTheme);
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectPaymentModalOpen);

  const [packs, setPacks] = useState<TokenPack[] | null>(null);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState<string | null>(null);

  const closeModal = () => dispatch(setPaymentModalOpen(false));

  //
  // Загрузка пакетов
  //
  useEffect(() => {
    if (!open) return;

    setLoadingPacks(true);
    apiGetTokenPacks()
      .then((data) => setPacks(data))
      .finally(() => setLoadingPacks(false));
  }, [open]);

  //
  // Старт оплаты
  //
  const handleBuy = async (packId: TokenPackId) => {
    const returnPath = location.pathname + location.search;

    try {
      setCreatingPayment(packId);

      const res = await apiCreateTokensPayment({ packId, returnPath });

      socket.emit(PAYMENT_EVENTS.SUBSCRIBE, res.id);

      const handleUpdate = async (payment: Payment) => {
        if (payment.id !== res.id) return;

        const final =
          payment.status === "SUCCEEDED" ||
          payment.status === "CANCELED" ||
          payment.status === "ERROR" ||
          payment.status === "REFUNDED";

        if (!final) return;

        // Если оплата прошла успешно — обновляем баланс токенов
        if (payment.status === "SUCCEEDED") {
          await dispatch(meThunk()).unwrap();
        }

        // Открываем модалку результата через URL
        const params = new URLSearchParams(location.search);
        params.set("paymentId", payment.id);

        navigate(`${location.pathname}?${params.toString()}`, {
          replace: true,
        });

        socket.emit(PAYMENT_EVENTS.UNSUBSCRIBE, res.id);
        socket.off(PAYMENT_EVENTS.UPDATE, handleUpdate);
      };

      socket.on(PAYMENT_EVENTS.UPDATE, handleUpdate);

      if (res.confirmationUrl) {
        // Обычно токен хранить тоже нужно:
        sessionStorage.setItem("lastPaymentId", res.id);

        window.open(res.confirmationUrl, "_blank");
      }

      closeModal();
    } catch (e) {
      console.error("Ошибка создания платежа", e);
      alert("Ошибка создания платежа");
    } finally {
      setCreatingPayment(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeModal();
        else dispatch(setPaymentModalOpen(true));
      }}
    >
      <DialogContent
        className={cn(
          "sm:max-w-md",
          theme === "dark" && "bg-base-100/70 backdrop-blur-md"
        )}
        showCloseButton={false}
      >
        <DialogHeader className="relative">
          <DialogTitle className="mx-auto mb-5">Оплата</DialogTitle>

          <DialogClose
            className="absolute cursor-pointer top-0 right-0 focus:outline-none focus:ring-0"
            onClick={closeModal}
          >
            <XIcon size={24} />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        {/* Loading */}
        {loadingPacks && (
          <div className="py-8 text-center text-base-content/70">
            Загрузка пакетов…
          </div>
        )}

        {/* PACKS */}
        {!loadingPacks && packs && (
          <div className="grid gap-3">
            {packs.map((pack) => {
              const disabled = creatingPayment === pack.id;

              return (
                <div
                  key={pack.id}
                  className={cn(
                    "rounded-xl border border-base-300/70 bg-base-100/60 p-4 flex flex-col",
                    pack.highlight && "ring-2 ring-primary/60 shadow-lg"
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{pack.name}</div>

                    {pack.discountPercent > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        –{pack.discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-base-content/70 mb-3">
                    {pack.tokens} токенов → {pack.generations} генераций
                  </div>

                  <Button
                    onClick={() => handleBuy(pack.id)}
                    disabled={disabled}
                    size="md"
                  >
                    {disabled
                      ? "Создание платежа…"
                      : `Купить за ${pack.priceRub} ₽`}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
