// api/client.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import type { components } from "./types.gen";

export type AuthResponseDto = components["schemas"]["AuthResponseDto"];

export const API_URL =
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

// ==== основной axios c интерсепторами ====
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// request: подставляем Bearer
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    config.headers = headers;
  }
  return config;
});

// вспомогательный «сырой» клиент БЕЗ интерсепторов — только для refresh
const raw = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ---- refresh serialization
type RetryConfig<D = unknown> = InternalAxiosRequestConfig<D> & {
  _retry?: boolean;
};
let refreshing = false;
let waiters: Array<(t: string | null) => void> = [];
const onWait = (cb: (t: string | null) => void) => waiters.push(cb);
const notifyAll = (t: string | null) => {
  waiters.forEach((cb) => cb(t));
  waiters = [];
};

async function doRefresh(): Promise<string | null> {
  try {
    // ВАЖНО: используем raw, чтобы не сработал этот же интерсептор
    const { data } = await raw.post<AuthResponseDto>("/auth/refresh", {});
    const token = data?.accessToken ?? null;
    setAccessToken(token);
    return token; // null => refresh не сработал (нет куки/просрочен)
  } catch {
    setAccessToken(null);
    return null;
  }
}

// response: на 401 пробуем refresh
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

        if (!t) {
          // refresh не сработал — считаем гость; не роняем приложение
          // Возвращаем отклонённый промис, НО его ловит ваш thunk и обрабатывает как "не залогинен"
          return Promise.reject(error);
        }

        // получили новый access — повторяем исходный запрос
        return api(original as AxiosRequestConfig);
      }

      // уже идёт refresh — ждём результата
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
