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
import Loader from "../Loader";
import { RadioDot } from "../ RadioDot";
import { declOfNum } from "@/lib/helpers";
import { ymGoal } from "@/lib/metrics/yandexMetrika";

export default function PaymentModal() {
  const theme = useAppSelector(selectAppTheme);
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectPaymentModalOpen);

  const [packs, setPacks] = useState<TokenPack[] | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<TokenPackId | null>(
    null
  );
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState<string | null>(null);

  const selectedPack = packs?.find((item) => item.id === selectedPackId);

  const { startPayment } = useStartPayment();

  const closeModal = () => dispatch(setPaymentModalOpen(false));

  useEffect(() => {
    if (!open) return;

    setLoadingPacks(true);
    apiGetTokenPacks()
      .then((data) => {
        setPacks(data);
        setSelectedPackId(data[0].id);
      })
      .finally(() => setLoadingPacks(false));
  }, [open]);

  const handleBuy = async () => {
    startPayment(selectedPackId, () => {
      ymGoal("buy_tokens_on_modal", { packId: selectedPackId });
      setCreatingPayment(selectedPackId);
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
      <DialogContent className="sm:w-[500px]" showCloseButton={false}>
        <DialogHeader className="relative">
          <DialogTitle className="mx-auto text-xl mb-3 text-center">
            Пополнение токенов
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
        {loadingPacks && <Loader />}
        <div>
          <p className="text-lg font-bold">Выберите пакет токенов</p>
        </div>
        {/* PACKS */}
        {!loadingPacks && packs && (
          <div className="grid gap-3 mt-2">
            {packs.map((pack) => {
              return (
                <div
                  key={pack.id}
                  className={cn(
                    "rounded-selector p-4 flex justify-between items-center cursor-pointer gap-4 transition-shadow duration-200",
                    theme === "dark" ? "bg-white/15" : "bg-base-200",
                    selectedPackId === pack.id
                      ? "shadow-[0_0_0_1.5px_var(--color-primary)]"
                      : "shadow-none"
                  )}
                  onClick={() => setSelectedPackId(pack.id)}
                >
                  <div className="flex flex-col">
                    <div className="font-bold">
                      <span>{pack.name} </span>
                    </div>

                    <p className="text-sm mt-2">
                      {pack.tokens - (pack.bonusTokens || 0)}{" "}
                      {declOfNum(pack.tokens, ["токен", "токена", "токенов"])}{" "}
                      {pack.bonusTokens && (
                        <span className="text-nowrap">
                          + {pack.bonusTokens} в подарок
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-4 items-center">
                    <p className="font-medium text-xl text-nowrap">
                      {pack.priceRub} ₽
                    </p>

                    <RadioDot active={selectedPackId === pack.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Button
          disabled={!selectedPackId || !!creatingPayment}
          className="w-min mx-auto px-10 mt-2 text-nowrap"
          onClick={handleBuy}
          loading={!!creatingPayment}
        >
          Оплатить
          {selectedPack ? ` ${selectedPack.priceRub} ₽` : ""}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
