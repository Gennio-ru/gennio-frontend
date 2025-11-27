import api from "../client";
import type { components, operations } from "../types.gen";

//
// ==== Entity Types ====
//

// Одна категория
export type Category = components["schemas"]["CategoryDto"];

// Список категорий (ответ findMany)
export type CategoriesListResponse =
  operations["CategoriesController_findMany"]["responses"]["200"]["content"]["application/json"];
export type CategoriesListParams =
  operations["CategoriesController_findMany"]["parameters"]["query"];

// Пейлоады
export type CreateCategoryPayload =
  operations["CategoriesController_create"]["requestBody"]["content"]["application/json"];
export type UpdateCategoryPayload =
  operations["CategoriesController_update"]["requestBody"]["content"]["application/json"];

//
// ==== API ====
//

// список категорий
export async function apiGetCategories(): Promise<CategoriesListResponse> {
  const { data } = await api.get<CategoriesListResponse>("/categories");
  return data;
}

// одна категория
export async function apiGetCategory(id: string): Promise<Category> {
  const { data } = await api.get<Category>(`/categories/${id}`);
  return data;
}

// создать категорию
export async function apiCreateCategory(
  payload: CreateCategoryPayload
): Promise<Category> {
  const { data } = await api.post<Category>("/categories", payload);
  return data;
}

// обновить промпт
export async function apiUpdateCategory(
  id: string,
  payload: UpdateCategoryPayload
): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, payload);
  return data;
}

// удалить промпт
export async function apiDeleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
