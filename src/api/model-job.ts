import api from "./client";
import type { operations } from "./types.gen";

//
// ==== Entity Types ====
//

export type ModelJob =
  operations["ModelJobController_startImageEditByPromptId"]["responses"]["201"]["content"]["application/json"];
export type ModelJobFull =
  operations["ModelJobController_findOne"]["responses"]["200"]["content"]["application/json"];

// Пейлоады
export type StartImageEditByPromptIdPayload =
  operations["ModelJobController_startImageEditByPromptId"]["requestBody"]["content"]["application/json"];
export type StartImageEditByPromptTextPayload =
  operations["ModelJobController_startImageEditByPromptText"]["requestBody"]["content"]["application/json"];
export type StartImageGenerateByPromptTextPayload =
  operations["ModelJobController_startImageGenerateByPromptText"]["requestBody"]["content"]["application/json"];

//
// ==== API ====
//

// Получить данные об обработке
export async function apiGetModelJob(id: string): Promise<ModelJob> {
  const { data } = await api.get<ModelJob>(`/model-job/${id}`);
  return data;
}

export async function apiStartImageEditByPromptId(
  payload: StartImageEditByPromptIdPayload
): Promise<ModelJob> {
  const { data } = await api.post<ModelJob>(
    "/model-job/start-image-edit-by-prompt-id",
    payload
  );
  return data;
}

export async function apiStartImageEditByPromptText(
  payload: StartImageEditByPromptTextPayload
): Promise<ModelJob> {
  const { data } = await api.post<ModelJob>(
    "/model-job/start-image-edit-by-prompt-text",
    payload
  );
  return data;
}

export async function apiStartImageGenerateByPromptText(
  payload: StartImageGenerateByPromptTextPayload
): Promise<ModelJob> {
  const { data } = await api.post<ModelJob>(
    "/model-job/start-image-generate",
    payload
  );
  return data;
}
