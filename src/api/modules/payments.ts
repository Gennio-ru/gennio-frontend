import api from "../client";
import type { components, operations } from "../types.gen";

//
// ==== Entity Types ====
//

// Полный платеж (PaymentDto из backend)
export type Payment = components["schemas"]["PaymentDto"];
export type PaymentFull = components["schemas"]["PaymentFullDto"];
export type PaymentStatus = components["schemas"]["PaymentStatus"];

// Короткий ответ после создания (PaymentShortDto)
export type PaymentShort = components["schemas"]["PaymentShortDto"];

// Платёж, который возвращается в списке
// (для простоты считаем, что это Payment[])
export type PaymentsListResponse =
  operations["PaymentsController_findMany"]["responses"]["200"]["content"]["application/json"];
export type PaymentsListParams =
  operations["PaymentsController_findMany"]["parameters"]["query"];

export type AdminRefundTokensPreview =
  operations["PaymentsController_getRefundTokensPreview"]["responses"]["200"]["content"]["application/json"];

// Пейлоады

// Платёж за пакет токенов (POST /payments/tokens)
export type CreateTokensPaymentPayload =
  operations["PaymentsController_createTokensPayment"]["requestBody"]["content"]["application/json"];

export type RefundByTokensPayload =
  operations["PaymentsController_refundTokens"]["requestBody"]["content"]["application/json"];

// Ответ от createTokensPayment
export type CreateTokensPaymentResponse =
  operations["PaymentsController_createTokensPayment"]["responses"]["200"]["content"]["application/json"];

//
// ==== API ====
//

// Список платежей с пагинацией
export async function apiGetPayments(
  params?: PaymentsListParams
): Promise<PaymentsListResponse> {
  const { data } = await api.get<PaymentsListResponse>("/payments", { params });
  return data;
}

// Один платёж по id (наш UUID, а не YooKassa id)
export async function apiGetPayment(id: string): Promise<Payment> {
  const { data } = await api.get<Payment>(`/payments/${id}`);
  return data;
}

// Один расширенный платёж по id (наш UUID, а не YooKassa id)
export async function apiGetFullPayment(id: string): Promise<PaymentFull> {
  const { data } = await api.get<PaymentFull>(`/payments/full/${id}`);
  return data;
}

// Получаем количество токенов которые доступны к возврату с этого платежа
export async function apiGetRefundTokensPreview(
  paymentId: string
): Promise<AdminRefundTokensPreview> {
  const { data } = await api.get<AdminRefundTokensPreview>(
    `/payments/${paymentId}/refund-tokens/preview`
  );
  return data;
}

// Создать платёж за пакет токенов
export async function apiCreateTokensPayment(
  payload: CreateTokensPaymentPayload
): Promise<CreateTokensPaymentResponse> {
  const { data } = await api.post<CreateTokensPaymentResponse>(
    "/payments/tokens",
    payload
  );
  return data;
}

// Отмена платежа
export async function apiCancelPayment(id: string): Promise<Payment> {
  const { data } = await api.post<Payment>(`/payments/${id}/cancel`);
  return data;
}

// Частичная отмена платежа
export async function apiRefundPaymentByTokens(
  id: string,
  payload: RefundByTokensPayload
): Promise<PaymentFull> {
  const { data } = await api.post<PaymentFull>(
    `/payments/${id}/refund-tokens`,
    payload
  );
  return data;
}
