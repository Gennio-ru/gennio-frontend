import api from "../client";
import { components, operations } from "../types.gen";

//
// ==== API ====
//

export type TokenPack = components["schemas"]["TokenPackDto"];
export type TokenPackId = components["schemas"]["TokensPackId"];

// Список пакетов (ответ findMany)
export type TokenPackListResponse =
  operations["PricingController_getTokenPacks"]["responses"]["200"]["content"]["application/json"];

export async function apiGetTokenPacks(): Promise<TokenPackListResponse> {
  const { data } = await api.get<TokenPackListResponse>("/pricing/token-packs");
  return data;
}
