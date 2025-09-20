import api from "./client";
import type { components, operations } from "./types.gen";

//
// ==== Entity Types ====
//

// Один промпт
export type Prompt = components["schemas"]["PromptResponseDto"];

// Список промптов (ответ findMany)
export type PromptsListResponse =
  operations["PromptsController_findMany"]["responses"]["200"]["content"]["application/json"];
export type PromptsListParams =
  operations["PromptsController_findMany"]["parameters"]["query"];

// Пейлоады
export type CreatePromptPayload =
  operations["PromptsController_create"]["requestBody"]["content"]["application/json"];
export type UpdatePromptPayload =
  operations["PromptsController_update"]["requestBody"]["content"]["application/json"];

//
// ==== API ====
//

// список промптов
export async function apiGetPrompts(
  params?: PromptsListParams
): Promise<PromptsListResponse> {
  const { data } = await api.get<PromptsListResponse>("/prompts", { params });
  return data;
}

// один промпт
export async function apiGetPrompt(id: string): Promise<Prompt> {
  const { data } = await api.get<Prompt>(`/prompts/${id}`);
  return data;
}

// создать промпт
export async function apiCreatePrompt(
  payload: CreatePromptPayload
): Promise<Prompt> {
  const { data } = await api.post<Prompt>("/prompts", payload);
  return data;
}

// обновить промпт
export async function apiUpdatePrompt(
  id: string,
  payload: UpdatePromptPayload
): Promise<Prompt> {
  const { data } = await api.patch<Prompt>(`/prompts/${id}`, payload);
  return data;
}

// удалить промпт
export async function apiDeletePrompt(id: string): Promise<void> {
  await api.delete(`/prompts/${id}`);
}
