import api from "../client";
import type { components, operations } from "../types.gen";

//
// ==== Entity Types ====
//

export type User = components["schemas"]["UserDto"];
export type UserRole = components["schemas"]["UserRole"];

// Список пользователей (ответ findMany)
export type UsersListResponse =
  operations["UsersController_findMany"]["responses"]["200"]["content"]["application/json"];
export type UsersListParams =
  operations["UsersController_findMany"]["parameters"]["query"];

// Пейлоады
export type BlockUserPayload =
  operations["UsersController_blockUser"]["requestBody"]["content"]["application/json"];

//
// ==== API ====
//

// Заблокировать пользователя
export async function apiBlockUser(
  userId: string,
  payload: BlockUserPayload
): Promise<User> {
  const { data } = await api.patch<User>(`/users/${userId}/block`, payload);
  return data;
}

// Разблокировать пользователя
export async function apiUnblockUser(userId: string): Promise<User> {
  const { data } = await api.patch<User>(`/users/${userId}/unblock`);
  return data;
}

// список пользователей
export async function apiGetUsersList(
  params?: UsersListParams
): Promise<UsersListResponse> {
  const { data } = await api.get<UsersListResponse>("/users", { params });
  return data;
}

// один пользователь
export async function apiGetUser(id: string): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
}
