import api from "../client";
import type { components, operations } from "../types.gen";

export type FileDto = components["schemas"]["FileDto"];

export type UploadFilePayload =
  operations["FilesController_upload"]["requestBody"]["content"]["application/json"];

export type GetFileResponse =
  operations["FilesController_getOne"]["responses"][200]["content"]["application/json"];

export type DeleteFileResponse =
  operations["FilesController_remove"]["responses"][200]["content"]["application/json"];

export async function apiUploadFile(file: File): Promise<FileDto> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<FileDto>("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function apiAIUploadFile(file: File): Promise<FileDto> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<FileDto>("/files/ai-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

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
