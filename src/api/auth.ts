import api, { setAccessToken } from "./client";
import type { components, operations } from "./types.gen";

export type User = components["schemas"]["UserDto"];
export type AuthResponse = components["schemas"]["AuthResponseDto"];

export type RegisterByEmailPayload =
  operations["AuthController_registerByEmail"]["requestBody"]["content"]["application/json"];
export type LoginByEmailPayload =
  operations["AuthController_loginByEmail"]["requestBody"]["content"]["application/json"];

export async function apiRegister(
  payload: RegisterByEmailPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    "/auth/register/email",
    payload
  );
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function apiLogin(
  payload: LoginByEmailPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login/email", payload);
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function apiMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function apiLogout(): Promise<void> {
  try {
    await api.post("/auth/logout", {});
  } finally {
    setAccessToken(null);
  }
}
