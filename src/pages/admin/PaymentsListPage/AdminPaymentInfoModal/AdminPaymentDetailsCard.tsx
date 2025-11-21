import { PaymentFull } from "@/api/modules/payments";

type Props = {
  payment: PaymentFull;
};

export function AdminPaymentDetailsCard({ payment }: Props) {
  const creditedTokens = payment.meta?.tokens ?? null;

  return (
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
        <span className="break-all">{payment.providerPaymentId ?? "—"}</span>
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
          <span className="text-base-content/60">Токенов начислено</span>
          <span className="font-medium">{creditedTokens}</span>
        </div>
      )}
    </div>
  );
}
