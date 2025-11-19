import api from "../client";
import type { components, operations } from "../types.gen";

//
// ==== Entity Types ====
//

// Полный платеж (PaymentDto из backend)
export type Payment = components["schemas"]["PaymentDto"];

// Короткий ответ после создания (PaymentShortDto)
export type PaymentShort = components["schemas"]["PaymentShortDto"];

// Платёж, который возвращается в списке
// (для простоты считаем, что это Payment[])
export type PaymentsListResponse =
  operations["PaymentsController_listMyPayments"]["responses"]["200"]["content"]["application/json"];

// Пейлоады

// Платёж за пакет токенов (POST /payments/tokens)
export type CreateTokensPaymentPayload =
  operations["PaymentsController_createTokensPayment"]["requestBody"]["content"]["application/json"];

// Ответ от createTokensPayment
export type CreateTokensPaymentResponse =
  operations["PaymentsController_createTokensPayment"]["responses"]["200"]["content"]["application/json"];

//
// ==== API ====
//

// Список платежей текущего пользователя
export async function apiGetMyPayments(): Promise<PaymentsListResponse> {
  const { data } = await api.get<PaymentsListResponse>("/payments");
  return data;
}

// Один платёж по id (наш UUID, а не YooKassa id)
export async function apiGetPayment(id: string): Promise<Payment> {
  const { data } = await api.get<Payment>(`/payments/${id}`);
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
