import { PaymentFull } from "@/api/modules/payments";

type Props = {
  payment: PaymentFull;
};

export function AdminPaymentTimestampsCard({ payment }: Props) {
  const createdAt = new Date(payment.createdAt).toLocaleString();
  const updatedAt = new Date(payment.updatedAt).toLocaleString();
  const capturedAt = payment.capturedAt
    ? new Date(payment.capturedAt).toLocaleString()
    : null;
  const canceledAt = payment.canceledAt
    ? new Date(payment.canceledAt).toLocaleString()
    : null;
  const refundedAt = payment.refundedAt
    ? new Date(payment.refundedAt).toLocaleString()
    : null;

  return (
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
          <div className="text-base-content/60 mb-0.5">Сообщение об ошибке</div>
          <div className="text-error text-xs">{payment.errorMessage}</div>
          {payment.errorCode && (
            <div className="text-error/80 text-[11px] mt-0.5">
              Код ошибки: {payment.errorCode}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
