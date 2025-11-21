import api from "../client";
import type { components, operations } from "../types.gen";

export type FileDto = components["schemas"]["FileDto"];

export type UploadFileResponse =
  operations["FilesController_upload"]["responses"][201]["content"]["application/json"];
export type UploadFilePayload =
  operations["FilesController_upload"]["requestBody"]["content"]["application/json"];

export type GetFileResponse =
  operations["FilesController_getOne"]["responses"][200]["content"]["application/json"];

export type DeleteFileResponse =
  operations["FilesController_remove"]["responses"][200]["content"]["application/json"];

export async function apiUploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadFileResponse>(
    "/files/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return data;
}

export async function apiAIUploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadFileResponse>(
    "/files/ai-upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return data;
}

export async function apiGetFile(id: string): Promise<GetFileResponse> {
  const { data } = await api.get<GetFileResponse>(`/files/${id}`);

  return data;
}

export async function apiDeleteFile(id: string): Promise<DeleteFileResponse> {
  const { data } = await api.delete<DeleteFileResponse>(`/files/${id}`);

  return data;
}
