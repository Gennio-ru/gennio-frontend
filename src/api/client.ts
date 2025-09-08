
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { components } from "./types.gen";

export type AuthResponseDto = components["schemas"]["AuthResponseDto"];

const API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

// access токен храним в localStorage (ключ совпадает с твоим слайсом)
let accessToken: string | null = (typeof localStorage !== "undefined" && localStorage.getItem("accessToken")) || null;
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof localStorage !== "undefined") {
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  }
}
export function getAccessToken() { return accessToken; }

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // refresh-cookie
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    (config.headers as any)["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

// serialize refresh flows
let refreshing = false;
let waiters: ((t: string | null) => void)[] = [];
function onWait(cb: (t: string | null) => void) { waiters.push(cb); }
function notifyAll(t: string | null) { waiters.forEach(cb => cb(t)); waiters = []; }

async function doRefresh(): Promise<string | null> {
  try {
    const { data } = await api.post<AuthResponseDto>("/auth/refresh", {});
    const token = data?.accessToken ?? null;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original: any = error.config || {};
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = true;
        const t = await doRefresh();
        notifyAll(t);
        refreshing = false;
        if (!t) return Promise.reject(error);
        return api(original);
      } else {
        return new Promise((resolve, reject) => {
          onWait((t) => t ? resolve(api(original)) : reject(error));
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
