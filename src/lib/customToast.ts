import { toast, ToastOptions } from "react-hot-toast";
import i18n from "@/shared/config/i18n";

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  statusCode?: number;
  success?: boolean;
};

type AxiosLikeError = {
  response?: {
    data?: ApiErrorPayload;
  };
  message?: string;
};

export function extractErrorInfo(err: unknown): {
  code?: string;
  message?: string;
  handled: boolean;
} {
  const axiosErr = err as AxiosLikeError;
  const data = axiosErr?.response?.data as ApiErrorPayload & {
    code?: string;
    message?: string;
    handled?: boolean;
  };

  // поддерживаем оба варианта:
  // 1) { error: { code, message } }
  // 2) { code, message, handled }
  const errorObj = data?.error ?? data;

  const code = errorObj?.code;
  const msgFromPayload = errorObj?.message;
  const isHandled = Boolean(code ?? data?.handled);

  const fallbackMessage =
    msgFromPayload ||
    axiosErr?.message ||
    (err instanceof Error ? err.message : undefined) ||
    "INTERNAL_SERVER_ERROR";

  return {
    code,
    message: fallbackMessage,
    handled: isHandled,
  };
}

function tError(code: string): string {
  const key = `errors:${code}`;
  const translated = i18n.t(key);
  return translated === key ? code : translated;
}

export const customToast = {
  success(keyOrMessage: string, options?: ToastOptions) {
    // можно передавать или готовую строку, или ключ common:
    const text = keyOrMessage.startsWith("common:")
      ? i18n.t(keyOrMessage)
      : keyOrMessage;

    toast.success(text, options);
  },

  info(message: string, options?: ToastOptions) {
    toast(message, options);
  },

  error(err: unknown, options?: ToastOptions) {
    if (typeof err === "string") {
      // если это код ошибки
      if (err === err.toUpperCase()) {
        return toast.error(tError(err), options);
      }
      return toast.error(err, options);
    }

    const { code, message, handled } = extractErrorInfo(err);

    if (handled && code) {
      const text = tError(code);
      return toast.error(text, { id: code, ...options });
    }

    const fallback = tError("INTERNAL_SERVER_ERROR");
    return toast.error(message ?? fallback, options);
  },
};
