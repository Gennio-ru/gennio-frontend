import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import type { components } from "./types.gen";

export type AuthResponseDto = components["schemas"]["AuthResponseDto"];

const API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:3000/api";

// ==== access token storage ====
let accessToken: string | null =
  (typeof localStorage !== "undefined" &&
    localStorage.getItem("accessToken")) ||
  null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof localStorage !== "undefined") {
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  }
}
export function getAccessToken() {
  return accessToken;
}

// ==== axios instance ====
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // refresh-cookie
});

// Добавим свой флаг в конфиг, без any:
type RetryConfig<D = unknown> = InternalAxiosRequestConfig<D> & {
  _retry?: boolean;
};

// request interceptor — без any в headers
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    // Нормализуем к AxiosHeaders и безопасно добавляем заголовок
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    config.headers = headers;
  }
  return config;
});

// ==== refresh serialization ====
let refreshing = false;
let waiters: Array<(t: string | null) => void> = [];

function onWait(cb: (t: string | null) => void) {
  waiters.push(cb);
}
function notifyAll(t: string | null) {
  waiters.forEach((cb) => cb(t));
  waiters = [];
}

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

// response interceptor — типизируем original и убираем any
api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      if (!refreshing) {
        refreshing = true;
        const t = await doRefresh();
        notifyAll(t);
        refreshing = false;

        if (!t) return Promise.reject(error);
        return api(original as AxiosRequestConfig);
      }

      // ждём завершения текущего refresh
      return new Promise((resolve, reject) => {
        onWait((t) => {
          if (!t) {
            reject(error);
            return;
          }
          resolve(api(original as AxiosRequestConfig));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
