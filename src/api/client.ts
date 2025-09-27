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

// ==== access token in-memory ====
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

// ==== axios instance ====
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // <- обязательно, чтобы httpOnly куки уходили на бэк
});

// Расширим конфиг для пометки повторной попытки
type RetryConfig<D = unknown> = InternalAxiosRequestConfig<D> & {
  _retry?: boolean;
};

// === Request interceptor: подставляем Bearer, если есть in-memory токен
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    config.headers = headers;
  }
  return config;
});

// === Refresh serialization (единственный refresh на всё приложение)
let refreshing = false;
let waiters: Array<(t: string | null) => void> = [];
const onWait = (cb: (t: string | null) => void) => waiters.push(cb);
const notifyAll = (t: string | null) => {
  waiters.forEach((cb) => cb(t));
  waiters = [];
};

async function doRefresh(): Promise<string | null> {
  try {
    // httpOnly refresh cookie автоматически приедет сюда благодаря withCredentials
    const { data } = await api.post<AuthResponseDto>("/auth/refresh", {});
    const token = data?.accessToken ?? null;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    return null;
  }
}

// === Response interceptor: на 401 пробуем refresh, затем повторяем запрос
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

      // ждём текущий refresh
      return new Promise((resolve, reject) => {
        onWait((t) => {
          if (!t) return reject(error);
          resolve(api(original as AxiosRequestConfig));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
