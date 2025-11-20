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
import Button from "@/shared/ui/Button";
import {
  apiGetTokenPacks,
  TokenPack,
  TokenPackId,
} from "@/api/modules/pricing";
import { useStartPayment } from "@/features/payments/useStartPayment";

export default function PaymentModal() {
  const theme = useAppSelector(selectAppTheme);
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectPaymentModalOpen);

  const [packs, setPacks] = useState<TokenPack[] | null>(null);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState<string | null>(null);

  const { startPayment } = useStartPayment();

  const closeModal = () => dispatch(setPaymentModalOpen(false));

  useEffect(() => {
    if (!open) return;

    setLoadingPacks(true);
    apiGetTokenPacks()
      .then((data) => setPacks(data))
      .finally(() => setLoadingPacks(false));
  }, [open]);

  const handleBuy = async (packId: TokenPackId) => {
    startPayment(packId, () => {
      setCreatingPayment(packId);
    }).finally(() => setCreatingPayment(null));
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
