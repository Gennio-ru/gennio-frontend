import api from "./client";
import type { components } from "./types.gen";

export type PromptResponseDto = components["schemas"]["PromptResponseDto"];
export type CreatePromptDto = components["schemas"]["CreatePromptDto"];
export type UpdatePromptDto = components["schemas"]["UpdatePromptDto"];
export type Prompt = PromptResponseDto;
export type PaginationMetaDto = components["schemas"]["PaginationMetaDto"];

export async function apiGetPrompts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { data } = await api.get<{
    items: PromptResponseDto[];
    meta: PaginationMetaDto;
  }>("/prompts", { params });
  return data;
}
export async function apiGetPrompt(id: string) {
  const { data } = await api.get<PromptResponseDto>(`/prompts/${id}`);
  return data;
}
export async function apiCreatePrompt(payload: CreatePromptDto) {
  const { data } = await api.post<PromptResponseDto>("/prompts", payload);
  return data;
}
export async function apiUpdatePrompt(id: string, payload: UpdatePromptDto) {
  const { data } = await api.patch<PromptResponseDto>(
    `/prompts/${id}`,
    payload as any
  );
  return data;
}
export async function apiDeletePrompt(id: string) {
  await api.delete(`/prompts/${id}`);
}
