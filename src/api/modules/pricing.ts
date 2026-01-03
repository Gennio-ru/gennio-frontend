import api from "../client";
import { components, operations } from "../types.gen";
import { ModelType } from "./model-job";

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

const GEMINI_COST = {
  generate: {
    standard: 20,
    high: 35,
  },
  edit: {
    standard: 20,
    high: 35,
  },
};

const OPENAI_COST = {
  generate: {
    standard: 10,
    high: 10,
  },
  edit: {
    standard: 10,
    high: 10,
  },
};

export const PROVIDER_COST_OBJECT = {
  [ModelType.GEMINI]: GEMINI_COST,
  [ModelType.OPENAI]: OPENAI_COST,
};
