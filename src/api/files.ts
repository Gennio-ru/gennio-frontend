
import api from "./client";
import type { components } from "./types.gen";

export type UploadFileResponseDto = components["schemas"]["UploadFileResponseDto"];
export type FileDto = components["schemas"]["FileDto"];
export type DeleteFileResponseDto = components["schemas"]["DeleteFileResponseDto"];

export async function apiUploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<UploadFileResponseDto>("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
export async function apiGetFile(id: string) {
  const { data } = await api.get<FileDto>(`/files/${id}`);
  return data;
}
export async function apiDeleteFile(id: string) {
  const { data } = await api.delete<DeleteFileResponseDto>(`/files/${id}`);
  return data;
}
