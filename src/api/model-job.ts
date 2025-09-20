import api from "./client";
import type { components, operations } from "./types.gen";

//
// ==== Entity Types ====
//

export type ModelJob =
  operations["ModelJobController_create"]["responses"]["201"]["content"]["application/json"];

// Пейлоады
export type CreateModelJobPayload =
  operations["ModelJobController_create"]["requestBody"]["content"]["application/json"];

//
// ==== API ====
//

// Получить данные об обработке
export async function apiGetModelJob(id: string): Promise<ModelJob> {
  const { data } = await api.get<ModelJob>(`/model-job/${id}`);
  return data;
}

// Начать обработку
export async function apiCreateModelJob(
  payload: CreateModelJobPayload
): Promise<ModelJob> {
  const { data } = await api.post<ModelJob>("/model-job/", payload);
  return data;
}
