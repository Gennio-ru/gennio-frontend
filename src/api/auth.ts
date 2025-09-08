import api, { setAccessToken } from "./client";
import type { components } from "./types.gen";

export type UserDto = components["schemas"]["UserDto"];
export type LoginByEmailDto = components["schemas"]["LoginByEmailDto"];
export type RegisterByEmailDto = components["schemas"]["RegisterByEmailDto"];
export type AuthResponseDto = components["schemas"]["AuthResponseDto"];

export async function apiRegister(dto: RegisterByEmailDto) {
  const { data } = await api.post<AuthResponseDto>("/auth/register/email", dto);
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function apiLogin(dto: LoginByEmailDto) {
  const { data } = await api.post<AuthResponseDto>("/auth/login/email", dto);
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function apiMe() {
  const { data } = await api.get<UserDto>("/auth/me");
  return data;
}

export async function apiLogout() {
  try {
    await api.post("/auth/logout", {});
  } finally {
    setAccessToken(null);
  }
}
