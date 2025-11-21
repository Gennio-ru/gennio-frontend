import { useEffect, useState } from "react";
import {
  AdminRefundTokensPreview,
  PaymentFull,
  apiGetFullPayment,
  apiGetRefundTokensPreview,
  apiRefundPaymentByTokens,
} from "@/api/modules/payments";

import Button from "../Button";
import Input from "../Input";

type Props = {
  payment: PaymentFull;
  onPaymentUpdated?: (p: PaymentFull) => void;
};

export function AdminPaymentRefundBlock({ payment, onPaymentUpdated }: Props) {
  const [preview, setPreview] = useState<AdminRefundTokensPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [tokensToRefund, setTokensToRefund] = useState("");
  const [description, setDescription] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);

  const paymentId = payment.id;

  // показываем блок только для успешных платежей
  const isEligibleStatus = payment.status === "SUCCEEDED";

  //
  // Загружаем preview
  //
  useEffect(() => {
    if (!isEligibleStatus) {
      setPreview(null);
      setPreviewError(null);
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);

    apiGetRefundTokensPreview(paymentId)
      .then((data) => {
        setPreview(data);
      })
      .catch((e) => {
        const msg =
          e instanceof Error
            ? e.message
            : "Не удалось получить данные по возврату токенов";
        setPreviewError(msg);
        setPreview(null);
      })
      .finally(() => setPreviewLoading(false));
  }, [paymentId, isEligibleStatus]);

  const maxTokensToRefund = preview?.maxTokensToRefund ?? 0;
  const canShowBlock =
    isEligibleStatus && !!preview && maxTokensToRefund > 0 && !previewLoading;

  const handleSubmit = async () => {
    if (!preview) return;

    setRefundError(null);
    setRefundSuccessMsg(null);

    const tokens = Number(tokensToRefund);

    if (!Number.isFinite(tokens) || tokens <= 0) {
      setRefundError("Введите положительное число токенов");
      return;
    }

    if (tokens > maxTokensToRefund) {
      setRefundError(`Нельзя вернуть больше, чем ${maxTokensToRefund} токенов`);
      return;
    }

    try {
      setRefundLoading(true);

      // 1) отправляем запрос на рефанд токенов
      const updatedPayment = await apiRefundPaymentByTokens(paymentId, {
        tokens,
        description: description || undefined,
      });

      // 2) обновляем превью
      const updatedPreview = await apiGetRefundTokensPreview(paymentId).catch(
        () => null
      );

      setPreview(updatedPreview);
      setTokensToRefund("");
      setRefundSuccessMsg("Запрос на возврат успешно создан");

      // 3) сообщаем родителю, что платёж обновился
      if (onPaymentUpdated) {
        const latest =
          updatedPayment.id === paymentId
            ? updatedPayment
            : await apiGetFullPayment(paymentId);
        onPaymentUpdated(latest);
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Ошибка при создании возврата";
      setRefundError(msg);
    } finally {
      setRefundLoading(false);
    }
  };

  if (!isEligibleStatus) return null;

  return (
    <div className="rounded-box bg-base-200/60 p-3 text-sm space-y-3">
      <div className="font-medium mb-1">Возврат токенов по этому платежу</div>

      {previewLoading && (
        <div className="text-xs text-base-content/60">
          Загружаем данные для возврата токенов…
        </div>
      )}

      {previewError && !preview && (
        <div className="text-xs text-base-content/60">
          Не удалось получить данные для возврата токенов: {previewError}
        </div>
      )}

      {canShowBlock && preview && (
        <>
          <div className="text-xs text-base-content/70 space-y-1">
            <div>Куплено токенов: {preview.tokensPurchased}</div>
            <div>Уже возвращено: {preview.tokensRefunded}</div>
            <div>
              Привязано к этому платёжному событию: {preview.remainingByPayment}
            </div>
            <div>Баланс пользователя: {preview.userBalance}</div>
            <div className="font-medium">
              Максимум можно вернуть:{" "}
              <span className="text-base-content">
                {preview.maxTokensToRefund} токенов
              </span>{" "}
              (~{preview.maxAmountRub} {preview.currency})
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              min={1}
              max={preview.maxTokensToRefund}
              value={tokensToRefund}
              onChange={(e) => {
                setTokensToRefund(e.target.value);
                setRefundError(null);
                setRefundSuccessMsg(null);
              }}
              placeholder={`До ${preview.maxTokensToRefund}`}
              className="sm:max-w-[140px]"
            />

            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Комментарий (опционально)"
            />

            <Button
              onClick={handleSubmit}
              disabled={refundLoading || preview.maxTokensToRefund <= 0}
            >
              {refundLoading ? "Отправляем…" : "Вернуть токены"}
            </Button>
          </div>

          {refundError && (
            <div className="text-xs text-error">{refundError}</div>
          )}
          {refundSuccessMsg && (
            <div className="text-xs text-success">{refundSuccessMsg}</div>
          )}
        </>
      )}
    </div>
  );
}
