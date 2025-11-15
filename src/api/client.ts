import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosHeaders,
  AxiosRequestConfig,
} from "axios";
import { customToast } from "@/lib/customToast";
import { components } from "./types.gen";
export type AuthResponseDto = components["schemas"]["AuthResponseDto"];

// Ваши основные настройки для axios
export const API_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;

// Токен авторизации
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => (accessToken = token);
export const getAccessToken = () => accessToken;

// Основной axios клиент с интерсепторами
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Интерсептор для запроса, добавление Authorization токена
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    // Берём текущие заголовки, приводим к AxiosHeaders
    const headers = AxiosHeaders.from(config.headers);
    // Добавляем Authorization
    headers.set("Authorization", `Bearer ${accessToken}`);
    // Возвращаем обратно в конфиг
    config.headers = headers;
  }

  return config;
});

// Клиент для выполнения запросов без интерсепторов — только для refresh
const raw = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Переменные для асинхронной обработки refresh
let refreshing = false;
let waiters: Array<(token: string | null) => void> = [];

const onWait = (cb: (token: string | null) => void) => waiters.push(cb);
const notifyAll = (token: string | null) => {
  waiters.forEach((cb) => cb(token));
  waiters = [];
};

// Функция для выполнения refresh токена
async function doRefresh(): Promise<string | null> {
  try {
    const { data } = await raw.post<AuthResponseDto>("/auth/refresh", {});
    const token = data?.accessToken ?? null;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null); // Если refresh не удался — очищаем токен
    return null;
  }
}

// Интерсептор для обработки ответов
api.interceptors.response.use(
  // Успешный ответ — просто возвращаем
  (response) => response,

  // Обработка ошибок
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Проверяем, если ошибка 401 (неавторизован)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Устанавливаем флаг, чтобы не было бесконечных циклов

      if (!refreshing) {
        refreshing = true; // Блокируем последующие запросы до завершения refresh

        const token = await doRefresh();
        notifyAll(token); // Уведомляем всех, кто ждал refresh
        refreshing = false;

        if (!token) {
          // Если refresh не удался — возвращаем ошибку
          return Promise.reject(error);
        }

        // Повторяем исходный запрос с новым токеном
        return api(originalRequest);
      }

      // Если refresh уже происходит — ждём его завершения
      return new Promise((resolve, reject) => {
        onWait((token) => {
          if (!token) return reject(error);
          resolve(api(originalRequest));
        });
      });
    }

    // Если не 401, то обрабатываем ошибки глобально
    handleApiError(error);

    // Возвращаем ошибку дальше
    return Promise.reject(error);
  }
);

// Функция для обработки ошибок API и отображения тостов
function handleApiError(error: AxiosError) {
  try {
    customToast.error(error); // Пытаемся передать ошибку в кастомный тост
  } catch (e) {
    // Если что-то пошло не так — не ломаем приложение
    console.error("Error handling API error: ", e);
  }
}

export default api;
