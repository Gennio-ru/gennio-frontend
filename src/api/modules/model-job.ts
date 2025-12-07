import api from "../client";
import type { components, operations } from "../types.gen";

//
// ==== Entity Types ====
//

export type ModelJob = components["schemas"]["ModelJobDto"];
export type ModelJobFull = components["schemas"]["ModelJobFullDto"];
export type ModelJobWithPreviewFile =
  components["schemas"]["ModelJobWithPreviewFileDto"];
export type ModelJobStatus = components["schemas"]["ModelJobStatusType"];
export type ModelJobType = components["schemas"]["ModelJobType"];
export enum ModelType {
  OPENAI = "OPENAI",
  GEMINI = "GEMINI",
}

// Генерация, который возвращается в списке
export type ModelJobsListResponse =
  operations["ModelJobController_findMany"]["responses"]["200"]["content"]["application/json"];
export type ModelJobsListParams =
  operations["ModelJobController_findMany"]["parameters"]["query"];

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

// Список генераций с пагинацией
export async function apiGetModelJobsList(
  params?: ModelJobsListParams
): Promise<ModelJobsListResponse> {
  const { data } = await api.get<ModelJobsListResponse>("/model-job", {
    params,
  });
  return data;
}

// Получить данные об обработке
export async function apiGetModelJob(id: string): Promise<ModelJobFull> {
  const { data } = await api.get<ModelJobFull>(`/model-job/${id}`);
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

// Последние генерации пользователя
export async function apiGetLastGenerations(): Promise<
  ModelJobWithPreviewFile[]
> {
  const { data } = await api.get<ModelJobWithPreviewFile[]>(
    "/model-job/last-generations"
  );
  return data;
}
