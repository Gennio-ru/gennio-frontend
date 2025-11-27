import api from "../client";
import type { components, operations } from "../types.gen";

//
// ==== Entity Types ====
//

// Транзакция
export type Transaction = components["schemas"]["UserTokenTransactionDto"];
export type TransactionReason = components["schemas"]["TokenTransactionReason"];

// Транзакция, которая возвращается в списке
export type TransactionsListResponse =
  operations["UserTokenTransactionsController_findMany"]["responses"]["200"]["content"]["application/json"];
export type TransactionsListParams =
  operations["UserTokenTransactionsController_findMany"]["parameters"]["query"];

//
// ==== API ====
//

// Список транзакций с пагинацией
export async function apiGetTransactionsList(
  params?: TransactionsListParams
): Promise<TransactionsListResponse> {
  const { data } = await api.get<TransactionsListResponse>("/transactions", {
    params,
  });
  return data;
}
